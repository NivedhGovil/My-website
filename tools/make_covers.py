"""Generate the section cover art.

One system, so every section looks like part of the same site:
  - a deep, muted ground in the section's own hue, lit slightly from the left
  - a fine ruled texture, the way drafting paper or an engraving is ruled
  - one motif per section, drawn in line at a consistent weight, never a blob

The banner crops to a 190px band and the card shows the whole 800x340, so
every motif is kept inside the centre band and off the extreme edges.
"""
import os

# deep ground, lighter ground, light accent — all from the site's palette
HUES = {
    'literary':    ('#7d3f2a', '#a9583c', '#f4e4dc'),
    'articles':    ('#2d5450', '#3f756e', '#dfebe9'),
    'essays':      ('#3b4570', '#55619a', '#e4e6f1'),
    'research':    ('#64491f', '#8d6a33', '#f1e8d7'),
    'poems':       ('#733d48', '#9c5361', '#f3e1e4'),
    'stories':     ('#51405f', '#6f5885', '#e9e3f0'),
    'books':       ('#3f5a3d', '#5a7d57', '#e7ecdf'),
    'engineering': ('#3a4663', '#515f87', '#e3e8f0'),
    'designs':     ('#3a4663', '#515f87', '#e3e8f0'),
    'electrical':  ('#3a4663', '#515f87', '#e3e8f0'),
    'software':    ('#245349', '#357264', '#dfecea'),
    'art':         ('#6b4257', '#8e5873', '#f1e3eb'),
    'music':       ('#2f4f6b', '#426b8e', '#e1eaf2'),
}

def motif(kind, A):
    """Line-drawn marks. `A` is the light accent for the secondary stroke."""
    W, L = 'rgba(255,255,255,.95)', 'rgba(255,255,255,.45)'
    if kind == 'literary' or kind == 'books':
        # an open book, drawn as two leaves and a spine
        return f'''
    <path d="M400 118 C 342 94, 258 92, 206 108 L 206 240 C 258 224, 342 226, 400 250"
          stroke="{W}" stroke-width="5"/>
    <path d="M400 118 C 458 94, 542 92, 594 108 L 594 240 C 542 224, 458 226, 400 250"
          stroke="{A}" stroke-width="5"/>
    <path d="M400 118 V 250" stroke="{W}" stroke-width="5"/>
    <path d="M250 142 H 352 M250 172 H 340 M250 202 H 356" stroke="{L}" stroke-width="3.5"/>
    <path d="M448 142 H 550 M460 172 H 550 M444 202 H 550" stroke="{L}" stroke-width="3.5"/>'''
    if kind == 'articles':
        # a column of text with one line picked out
        rows = []
        y = 112
        for i in range(7):
            w = (300, 250, 282, 196, 268, 232, 160)[i]
            c = A if i == 3 else L
            sw = 7 if i == 3 else 5
            rows.append(f'<path d="M250 {y} H {250 + w}" stroke="{c}" stroke-width="{sw}"/>')
            y += 23
        return '\n    ' + '\n    '.join(rows)
    if kind == 'essays':
        # a titled piece: a heading rule, body, and a quoted line set in
        return f'''
    <path d="M250 116 H 430" stroke="{W}" stroke-width="8"/>
    <path d="M250 152 H 544 M250 178 H 520 M250 204 H 548" stroke="{L}" stroke-width="5"/>
    <path d="M286 232 H 548" stroke="{A}" stroke-width="5"/>
    <path d="M268 222 V 250" stroke="{A}" stroke-width="6"/>'''
    if kind == 'research':
        # evidence: bars rising off a baseline, with a reading taken
        return f'''
    <path d="M258 252 H 548" stroke="{W}" stroke-width="5"/>
    <path d="M258 252 V 112" stroke="{W}" stroke-width="5"/>
    <path d="M292 252 V 206 M346 252 V 172 M400 252 V 220 M454 252 V 148 M508 252 V 186"
          stroke="{L}" stroke-width="14"/>
    <path d="M292 206 L 346 172 L 400 220 L 454 148 L 508 186" stroke="{A}" stroke-width="5"/>
    <circle cx="454" cy="148" r="9" fill="{A}" stroke="none"/>'''
    if kind == 'stories':
        # somebody is talking: a bubble with a tail
        return f'''
    <path d="M286 110 H 514 a22 22 0 0 1 22 22 V 212 a22 22 0 0 1 -22 22 H 376 L 330 272 V 234 H 286
             a22 22 0 0 1 -22 -22 V 132 a22 22 0 0 1 22 -22 Z" stroke="{W}" stroke-width="5"/>
    <path d="M304 148 H 486 M304 176 H 440" stroke="{L}" stroke-width="5"/>
    <path d="M304 204 H 404" stroke="{A}" stroke-width="5"/>'''
    if kind == 'poems':
        # short, uneven lines — verse has a shape of its own
        rows = []
        y = 118
        for i, w in enumerate((150, 210, 120, 186, 96, 168)):
            c = A if i in (1, 3) else L
            rows.append(f'<path d="M300 {y} H {300 + w}" stroke="{c}" stroke-width="5.5"/>')
            y += 25
        return '\n    ' + '\n    '.join(rows)
    if kind == 'stories':
        # a speech mark, because a story has somebody talking in it
        return f'''
    <path d="M300 140 q-34 0 -34 34 0 34 34 34 20 0 20 -20 0 -20 -20 -20 -10 0 -14 6 2 -28 30 -34"
          stroke="{W}" stroke-width="5"/>
    <path d="M470 140 q-34 0 -34 34 0 34 34 34 20 0 20 -20 0 -20 -20 -20 -10 0 -14 6 2 -28 30 -34"
          stroke="{A}" stroke-width="5"/>
    <path d="M300 246 H 500" stroke="{L}" stroke-width="4"/>'''
    if kind == 'engineering':
        # a trace with components on it
        return f'''
    <path d="M196 180 H 268" stroke="{W}" stroke-width="5"/>
    <rect x="268" y="162" width="76" height="36" rx="6" stroke="{A}" stroke-width="5"/>
    <path d="M344 180 H 400 V 126 H 470" stroke="{W}" stroke-width="5"/>
    <path d="M470 112 V 140 M494 112 V 140" stroke="{A}" stroke-width="5"/>
    <path d="M494 126 H 560" stroke="{W}" stroke-width="5"/>
    <path d="M400 180 V 238 H 470" stroke="{L}" stroke-width="5"/>
    <circle cx="500" cy="238" r="26" stroke="{A}" stroke-width="5"/>
    <path d="M488 238 h24 M500 226 v24" stroke="{A}" stroke-width="4"/>
    <circle cx="196" cy="180" r="7" fill="{W}" stroke="none"/>
    <circle cx="560" cy="126" r="7" fill="{W}" stroke="none"/>'''
    if kind == 'electrical':
        # a loop with a cell, a resistor and an earth
        return f'''
    <path d="M268 132 H 532 V 248 H 268 Z" stroke="{W}" stroke-width="5"/>
    <rect x="352" y="114" width="96" height="36" rx="5" fill="#00000022" stroke="{A}" stroke-width="5"/>
    <path d="M268 178 h-0.01" stroke="{W}" stroke-width="5"/>
    <path d="M254 166 V 214 M282 152 V 228" stroke="{A}" stroke-width="5"/>
    <path d="M360 248 V 276 M338 276 H 382 M348 288 H 372 M356 298 H 364" stroke="{L}" stroke-width="5"/>
    <circle cx="532" cy="190" r="22" stroke="{A}" stroke-width="5"/>
    <path d="M518 176 L 546 204 M546 176 L 518 204" stroke="{A}" stroke-width="4"/>'''

    if kind == 'designs':
        # an isometric box with its construction lines
        return f'''
    <path d="M400 104 L 520 150 L 520 238 L 400 284 L 280 238 L 280 150 Z" stroke="{W}" stroke-width="5"/>
    <path d="M400 104 V 194 M400 194 L 520 150 M400 194 L 280 150" stroke="{A}" stroke-width="5"/>
    <path d="M400 194 V 284" stroke="{A}" stroke-width="4.5" stroke-dasharray="9 8"/>
    <path d="M232 194 H 272 M528 194 H 568" stroke="{A}" stroke-width="4" stroke-dasharray="9 8"/>'''
    if kind == 'software':
        # a prompt and a cursor
        return f'''
    <rect x="248" y="104" width="304" height="180" rx="12" stroke="{W}" stroke-width="5"/>
    <path d="M248 144 H 552" stroke="{A}" stroke-width="4"/>
    <circle cx="274" cy="124" r="6" fill="{L}" stroke="none"/>
    <circle cx="296" cy="124" r="6" fill="{L}" stroke="none"/>
    <circle cx="318" cy="124" r="6" fill="{L}" stroke="none"/>
    <path d="M286 186 L 318 212 L 286 238" stroke="{W}" stroke-width="6"/>
    <path d="M338 240 H 430" stroke="{A}" stroke-width="6"/>'''
    if kind == 'art':
        # a brush stroke over two plain shapes
        return f'''
    <circle cx="316" cy="166" r="42" stroke="{A}" stroke-width="5"/>
    <rect x="384" y="124" width="84" height="84" rx="8" stroke="{L}" stroke-width="5"/>
    <path d="M492 208 L 540 124 L 588 208 Z" stroke="{W}" stroke-width="5"/>
    <path d="M250 250 C 350 226, 450 274, 560 246" stroke="{W}" stroke-width="8"/>'''
    if kind == 'music':
        return f'''
    <path d="M330 248 V 128 L 486 104 V 224" stroke="{W}" stroke-width="5"/>
    <circle cx="306" cy="248" r="26" stroke="{A}" stroke-width="5"/>
    <circle cx="462" cy="224" r="26" stroke="{A}" stroke-width="5"/>
    <path d="M330 160 L 486 136" stroke="{L}" stroke-width="4"/>'''
    return ''

ALT = {
    'literary': 'An open book with lines of text on both pages',
    'articles': 'A column of text with one line picked out',
    'essays': 'A heading, body text and a quoted line',
    'research': 'A bar chart with a line of readings across it',
    'poems': 'Six short lines of verse, uneven in length',
    'stories': 'A speech bubble with lines of dialogue in it',
    'books': 'An open book with lines of text on both pages',
    'engineering': 'A circuit trace running between components',
    'electrical': 'A circuit loop with a cell, a resistor and an earth symbol',
    'designs': 'An isometric box drawn with its construction lines',
    'software': 'A terminal window with a prompt and a cursor',
    'art': 'A circle, a square and a triangle above a brush stroke',
    'music': 'Two notes joined by a beam',
}

TPL = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 340" width="800" height="340"
     role="img" aria-label="{alt}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.85" y2="1">
      <stop offset="0%" stop-color="{light}"/>
      <stop offset="100%" stop-color="{deep}"/>
    </linearGradient>
    <pattern id="rule" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
      <path d="M0 0 H9" stroke="#ffffff" stroke-width="1" opacity="0.07"/>
    </pattern>
    <radialGradient id="vig" cx="0.32" cy="0.3" r="0.95">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.13"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.22"/>
    </radialGradient>
  </defs>

  <rect width="800" height="340" fill="url(#g)"/>
  <rect width="800" height="340" fill="url(#rule)"/>
  <rect width="800" height="340" fill="url(#vig)"/>

  <g fill="none" stroke-linecap="round" stroke-linejoin="round">{motif}
  </g>
</svg>
'''

OUT = os.environ.get('OUT', '.')
for name, (deep, light, accent) in HUES.items():
    svg = TPL.format(alt=ALT[name], deep=deep, light=light, motif=motif(name, accent))
    open(os.path.join(OUT, f'cover-{name}.svg'), 'w').write(svg)
print('generated', len(HUES), 'covers')
