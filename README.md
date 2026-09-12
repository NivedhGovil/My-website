# Nivedh Govil — personal website

A small, static website. No build step, no dependencies — plain HTML and one
stylesheet. Open `index.html` in a browser to view it locally.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home: photo, introduction, and the list of sections |
| `literary.html` | The Literary section: an intro and doors into the three forms |
| `engineering.html` | The Engineering section: intro and the build tabs |
| `designs.html` | Engineering &rarr; Designs: CAD models and design highlights |
| `electrical.html` | Engineering &rarr; Electrical: schematics, PCB layouts, circuit diagrams |
| `articles.html` | All articles |
| `poems.html` | All poems |
| `short-stories.html` | All short stories |
| `books.html` | Books to recommend, with a reason for each |
| `pieces/` | One page per piece of writing (full text) |
| `art.html` | The Art section: intro, gallery and art highlights |
| `music.html` | The Music section: what he plays, recordings and music highlights |
| `about.html` | About page — mostly fill-in slots waiting for your text |
| `404.html` | Shown for a bad URL; its links are absolute so it works at any depth |
| `style.css` | Shared styling for every page |
| `favicon.svg` | Browser tab icon |
| `sitemap.xml`, `robots.txt` | For search engines |
| `assets/` | Images and section artwork |
| `assets/videos/` | Build videos (portrait MP4, played inline) |
| `assets/site.js` | Theme toggle, search, analytics — the only JavaScript |
| `assets/search-index.js` | Generated; do not edit by hand |
| `tools/build.py` | Rebuilds the search index and stamps the date |
| `tools/render_stl.py` | Renders an STL to a PNG preview |
| `assets/models/` | Downloadable CAD models (.stl) |

## After you change anything, run this

```bash
python3 tools/build.py
```

It rebuilds `assets/search-index.js` from the listing pages and stamps today's
date into every footer. It reads the listings rather than keeping its own list,
so search results can never drift from what the site shows.

## Dark mode

The site follows the reader's system setting, and the moon/sun button in the
header overrides it. The choice is remembered in `localStorage`.

Dark mode redefines the section hue tokens at their brighter values, so every
`body.s-*` rule keeps working untouched. All eight hues clear 4.5:1 on the dark
page and card — the lowest is rose at 6.4:1.

## Search

The magnifying glass in the header, or press `/` or `Cmd/Ctrl-K`. It works both
on the live site and when you open the files straight from disk — the index ships
as a `<script>` rather than being fetched, because browsers block `fetch()` on
`file://` URLs. It searches
titles, summaries, sections and kinds across writing, builds and books. Arrow
keys move, Enter opens, Escape closes.

## The contact form

A static site has no server, so nothing can receive a form post. On submit the
form validates the fields and then opens the visitor's email app with the
message already written, addressed to `nivedh.govil@outlook.com` (set by
`data-mailto` on the form).

That works everywhere with no account and no third party, but it does mean the
visitor has to press send in their own mail app. To take real submissions
instead, sign up somewhere like [Formspree](https://formspree.io) or
[Web3Forms](https://web3forms.com) and give the form their endpoint:

```html
<form class="contact-form" action="https://formspree.io/f/YOURID" method="POST">
```

The built-in handler stands aside automatically as soon as the form has an
`action`, so nothing else needs changing.

## Analytics

Off by default. To switch it on, sign up free at
[goatcounter.com](https://www.goatcounter.com), then set your counter URL at the
top of `assets/site.js`:

```js
var ANALYTICS = 'https://YOURCODE.goatcounter.com/count';
```

GoatCounter sets no cookies and collects no personal data, so no cookie banner
is needed. While the string is empty nothing loads and no request is made.

## Design

The look is a warm cream-to-peach wash carrying one hue per section, with serif
display headings over a sans interface, soft rounded white cards, and pill-shaped
badges and buttons.

| Section | Hue |
| --- | --- |
| Literary | orange |
| Articles | teal |
| Poems | rose |
| Short Stories | violet |
| Books | olive green |
| Engineering | indigo |
| Art | fuchsia |
| Music | blue |

Each page names its section on the `<body>` tag — `<body class="s-poems">` — and
every component inherits its colour from there. Adding a page means giving its
body the right class; nothing else needs touching.

There are three colour roles per section and they are **not** interchangeable:

- `--accent` carries text. Every value clears 4.5:1 contrast on the background.
- `--accent-bright` fills shapes (buttons, badges). Never use it for small text.
- `--accent-tint` is the pale wash behind pills.

Type is split by job: headings are serif, interface text is sans, and the writing
itself returns to serif on the reading pages, where it belongs.

## Achievements live in their section

There is no single achievements page. Each kind of highlight sits with the work
it belongs to, so a reader finds it where they are already looking:

| Highlight | Lives in |
| --- | --- |
| Writing prizes, publications | `literary.html` |
| Exhibitions, robotics competitions | `engineering.html` |
| Design competitions, prints that worked | `designs.html` |
| Art competitions, work shown | `art.html` |
| Performances, grades, bands | `music.html` |
| Olympiads, school, sport | `about.html` |

They all use the same `<div class="achievement">` markup and pick up the colour
of whichever page they are on, so a card can be moved between sections by
cutting and pasting it — nothing else needs changing.

## Filling in the placeholders

`about.html` and the builds list in `engineering.html` are built from slots
rather than finished text, in a layout borrowed from a portfolio Nivedh liked:
prose beside a grid of highlight cards, tabbed projects, and achievement cards
with a photo on top.

`about.html` is built out of slots rather than finished text. There are three
kinds, and each is designed to be replaced rather than edited around:

**Dashed boxes** (`<div class="fill">`) — a prompt saying what to write and
roughly how long. Delete the whole `<div>` and put your own `<p>` paragraphs
where it was. The dashed styling disappears with it, because it belongs to the
box, not to the section.

**Fact cards** (`<span class="fact-value empty">`) — one short answer each.
Type over the text and remove the word `empty` from the class, which drops the
grey italic styling.

**Q&A entries** (`<details class="qa">`) — a question that opens to reveal its
answer. Replace the dashed box inside with your own paragraphs. Copy a whole
`<details>` to add a question, delete one to remove it. It needs no JavaScript.

**Highlight cards** (`<div class="highlight">`) — an icon, a bold line and a
small line under it. Four of them sit beside the About prose.

**Build videos** — put the file in `assets/videos/` and add a `<figure class="clip">`
inside that build's `<div class="clips">`. They are portrait phone clips, shown at a
fixed height side by side, so the panel stays a sensible shape whatever you add.

**Recording cards** (`<div class="recording">`) — a video and a caption, on
`music.html`. Paste a YouTube ID where the comment says `VIDEO_ID`, uncomment
the `<iframe>`, and delete the placeholder `<div>` above it.

**Design cards** (`<figure class="design">`) — a render, a name, the software and
year, and a note. One per CAD model on `designs.html`. Export a render from your
CAD program into `assets/` and point the `src` at it, or let the script do it:

```bash
python3 tools/render_stl.py model.stl assets/design-name.png 1200 900 -35 -60
```

The last two numbers are the yaw and pitch in degrees — change them until the
model reads well. Put the `.stl` itself in `assets/models/` and link it from a
`<p class="design-files">` so people can download it.

**Electrical cards** — the same `<figure class="design">` markup as the CAD
gallery, reused on `electrical.html` across three groups: schematics, PCB
layouts and circuit diagrams. Export a PNG from your EDA tool into `assets/`
and point the `src` at it. The PCB cards carry a download line for zipped
Gerbers; delete it where there is nothing to download.

**Gallery pieces** (`<figure class="art-piece">`) — an image, a title and a
medium/year line. One per artwork on `art.html`.

**Achievement cards** (`<div class="achievement">`) — a photo, a title and two
lines. Put a photo in `assets/` and point the `src` at it; without one the card
still works and shows the placeholder graphic.

**Build tabs** (`engineering.html`) — one tab per Arduino project, each with a
description, a parts list and a list of what it does. To add a build, copy one
`<input>` + `<label>` pair *and* one `<div class="panel">`, keeping them in the
same order, and give the new input a fresh `id` that the label's `for` points
at. Six tabs are styled; ask for more if you need them. It works with no
JavaScript at all — the tabs are radio buttons and CSS.

**Emphasis inside prose** — wrap a phrase in `<span class="hl">` to colour it in
the section's hue, or `<strong>` to bold it. That is what gives the About
paragraphs their shape.

Nothing on the page is required. Delete any whole `<section>` you do not want,
and the page closes up around it.

## Sharing and search

Every page carries a canonical URL, Open Graph and Twitter card tags, and points
at `assets/og-image.png` (1200x630) as its preview image. All of these use the
base URL `https://nivedhgovil.github.io/My-website/` — **if the site ever moves
to a custom domain, that string has to change in every page, plus
`sitemap.xml`, `robots.txt` and the absolute links in `404.html`.**

## Accessibility

- Every page opens with a skip link to jump the navigation.
- The current nav item is marked `aria-current="page"`.
- Focus rings show for keyboard users (`:focus-visible`) but not on mouse clicks.
- Every colour that carries text clears 4.5:1 contrast — on the page background,
  on white cards, and on its own pill tint. Check any new hue against all three.
- Images have alt text; motion respects `prefers-reduced-motion`.

## Artwork

`assets/cover-*.svg` is one abstract cover per section, used both as the image on
its card and as the banner across the top of its page. Each is drawn on the
section's own gradient. The motifs sit inside a centre band so they survive both
crops — if you redraw one, keep the artwork between roughly y=100 and y=240 of
the 800x340 canvas.

## How the site is organised

The site is built to hold more than writing, so navigation works in two levels:

- The **main navigation** (top bar, on every page) lists the sections of the
  site: Home, Literary and Engineering.
- Inside Engineering, a **sub-navigation** bar lists Builds, Designs and Electrical.
- Inside Literary, a **sub-navigation** bar lists Articles, Poems, Short Stories
  and Books, and stays visible on every page beneath it, so you can move between
  them from anywhere without going back up.

## Adding a book

Open `books.html` and copy one of the `<li class="book">` blocks:

```html
<li class="book">
  <h2>The Title</h2>
  <p class="author">Author Name &middot; Series and book number, if any</p>
  <p class="reason">Why you would hand it to someone.</p>
</li>
```

Keep the reason personal — what the book did for you, not what the back cover
says. Books not yet read go in the "Next on the list" block at the bottom
instead.

## Adding a build to the Engineering section

Open `engineering.html`. It contains a commented-out template with instructions.
Copy it, and fill in the video ID, title, meta line and summary:

```html
<li class="build">
  <div class="video">
    <iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID"
            title="The build's name" loading="lazy" allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"></iframe>
  </div>
  <div class="build-text">
    <h2>The build's name</h2>
    <p class="meta">Arduino Uno &middot; HC-SR04</p>
    <p class="summary">What it does, and what was hard about it.</p>
  </div>
</li>
```

`VIDEO_ID` is the part of a YouTube URL after `v=` — in
`https://www.youtube.com/watch?v=dQw4w9WgXcQ` the ID is `dQw4w9WgXcQ`. The embed
sits in a 16:9 frame that resizes with the page, and stacks above the text on
phones. Delete the placeholder `<li>` holding the "being added" note once the
first build is in.

## Elsewhere

Links out to Nivedh's profiles live next to the work they relate to, not in the
main navigation:

- **Medium** (`https://medium.com/@nivedh.govil`) — in an "Also on Medium" block
  at the foot of `literary.html`.
- **YouTube** (`https://www.youtube.com/@nivedhgovil`) — in the intro and footer
  of `engineering.html`.

## Adding a new section

1. Copy `literary.html` to a new file and rewrite its intro and cards.
2. Add a card for it in the "Sections" list in `index.html`.
3. Add it to the main navigation on every page:

   ```html
   <li><a href="the-new-section.html">The New Section</a></li>
   ```

Only pages inside a section need a sub-navigation bar; a section with no
sub-pages can leave it out, as `literary.html` itself does.

## Adding the photo

1. Put the image in `assets/` (for example `assets/nivedh.jpg`).
2. In `index.html`, change the portrait line to point at it:

   ```html
   <img class="portrait" src="assets/nivedh.jpg" alt="Portrait of Nivedh Govil">
   ```

A roughly square image works best — it is displayed as a circle.

## Adding a piece of writing

1. Copy an existing file in `pieces/` as a starting point, replace the title,
   byline and paragraphs, and give it a new filename.
2. Open the relevant section page (`articles.html`, `poems.html` or
   `short-stories.html`) and add a listing entry. Each page carries a
   commented-out template; copy it and fill it in:

```html
<li class="piece">
  <h2><a href="pieces/the-title.html">The Title</a></h2>
  <p class="meta">Short story</p>
  <p class="summary">One or two lines saying what this piece is about.</p>
</li>
```

On `poems.html`, delete the placeholder `<li>` holding the "being collected"
note once the first real poem is in place.

The `meta` line is free text — it currently names the form ("Article", "Short
story"). Swap in a date such as "March 2026" if you would rather show when each
piece was written.

## Publishing with GitHub Pages

In the repository, go to **Settings → Pages**, set the source to the `main`
branch and the root folder, and save. The site is served from
`https://nivedhgovil.github.io/My-website/`.
