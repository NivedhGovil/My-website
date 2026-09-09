"""Render a binary STL to a PNG. Pure standard library: no numpy, no Pillow.

Orthographic camera, z-buffered, flat Lambert shading with a soft ambient term.
"""
import struct, zlib, math, sys

def load(path):
    d = open(path, 'rb').read()
    n = struct.unpack('<I', d[80:84])[0]
    tris = []
    off = 84
    for i in range(n):
        vals = struct.unpack_from('<12f', d, off)
        tris.append((vals[3:6], vals[6:9], vals[9:12]))
        off += 50
    return tris

def render(tris, W, H, yaw, pitch, bg=(255, 250, 246), base=(226, 232, 255), out='out.png'):
    cy, sy = math.cos(yaw), math.sin(yaw)
    cp, sp = math.cos(pitch), math.sin(pitch)

    def cam(p):
        x, y, z = p
        x, y = x * cy - y * sy, x * sy + y * cy      # yaw about Z
        y, z = y * cp - z * sp, y * sp + z * cp      # pitch
        return x, y, z

    pts = [cam(v) for t in tris for v in t]
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]; zs = [p[2] for p in pts]
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    pad = 0.06
    scale = min(W * (1 - pad * 2) / (maxx - minx), H * (1 - pad * 2) / (maxy - miny))
    ox = W / 2 - (minx + maxx) / 2 * scale
    oy = H / 2 + (miny + maxy) / 2 * scale

    zbuf = [-1e30] * (W * H)   # keep the nearest fragment: larger z is nearer
    fb = bytearray()
    for _ in range(W * H):
        fb += bytes(bg)

    L = (-0.45, -0.5, 0.74)                          # light direction, normalised
    zrange = max(zs) - min(zs) or 1.0

    for t in tris:
        a, b, c = [cam(v) for v in t]
        ux, uy, uz = b[0]-a[0], b[1]-a[1], b[2]-a[2]
        vx, vy, vz = c[0]-a[0], c[1]-a[1], c[2]-a[2]
        nx, ny, nz = uy*vz-uz*vy, uz*vx-ux*vz, ux*vy-uy*vx
        ln = math.sqrt(nx*nx + ny*ny + nz*nz)
        if ln == 0:
            continue
        nx, ny, nz = nx/ln, ny/ln, nz/ln
        lam = max(0.0, nx*L[0] + ny*L[1] + nz*L[2])
        shade = 0.30 + 0.70 * lam                    # ambient + diffuse
        col = bytes(min(255, int(ch * shade)) for ch in base)

        P = [(a[0]*scale+ox, oy-a[1]*scale, a[2]),
             (b[0]*scale+ox, oy-b[1]*scale, b[2]),
             (c[0]*scale+ox, oy-c[1]*scale, c[2])]
        x0 = max(0, int(min(p[0] for p in P))); x1 = min(W-1, int(max(p[0] for p in P)) + 1)
        y0 = max(0, int(min(p[1] for p in P))); y1 = min(H-1, int(max(p[1] for p in P)) + 1)
        if x1 < x0 or y1 < y0:
            continue
        (ax, ay, az), (bx, by, bz), (cx2, cy2, cz) = P
        d = (by-cy2)*(ax-cx2) + (cx2-bx)*(ay-cy2)
        if abs(d) < 1e-9:
            continue
        for py in range(y0, y1+1):
            yy = py + 0.5
            row = py * W
            for px in range(x0, x1+1):
                xx = px + 0.5
                w0 = ((by-cy2)*(xx-cx2) + (cx2-bx)*(yy-cy2)) / d
                if w0 < 0 or w0 > 1: continue
                w1 = ((cy2-ay)*(xx-cx2) + (ax-cx2)*(yy-cy2)) / d
                if w1 < 0 or w1 > 1: continue
                w2 = 1 - w0 - w1
                if w2 < 0: continue
                z = w0*az + w1*bz + w2*cz
                i = row + px
                if z <= zbuf[i]:
                    continue
                zbuf[i] = z
                fb[i*3:i*3+3] = col

    raw = bytearray()
    for y in range(H):
        raw.append(0)
        raw += fb[y*W*3:(y+1)*W*3]
    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        return c + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    png = (b'\x89PNG\r\n\x1a\n'
           + chunk(b'IHDR', struct.pack('>IIBBBBB', W, H, 8, 2, 0, 0, 0))
           + chunk(b'IDAT', zlib.compress(bytes(raw), 6))
           + chunk(b'IEND', b''))
    open(out, 'wb').write(png)
    return out

if __name__ == '__main__':
    src, out, W, H, yaw, pitch = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), float(sys.argv[5]), float(sys.argv[6])
    tris = load(src)
    zs = [v[2] for t in tris for v in t]
    xs = [v[0] for t in tris for v in t]; ys = [v[1] for t in tris for v in t]
    print('triangles %d  bbox X %.1f  Y %.1f  Z %.1f' % (len(tris), max(xs)-min(xs), max(ys)-min(ys), max(zs)-min(zs)))
    render(tris, W, H, math.radians(yaw), math.radians(pitch), out=out)
    print('wrote', out)
