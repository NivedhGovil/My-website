# Nivedh Govil — personal website

A small, static website. No build step, no dependencies — plain HTML and one
stylesheet. Open `index.html` in a browser to view it locally.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home: photo, introduction, and the list of sections |
| `literary.html` | The Literary section: an intro and doors into the three forms |
| `engineering.html` | The Engineering section: intro and the list of builds |
| `articles.html` | All articles |
| `poems.html` | All poems |
| `short-stories.html` | All short stories |
| `pieces/` | One page per piece of writing (full text) |
| `style.css` | Shared styling for every page |
| `assets/` | Images |

## How the site is organised

The site is built to hold more than writing, so navigation works in two levels:

- The **main navigation** (top bar, on every page) lists the sections of the
  site: Home, Literary and Engineering.
- Inside Literary, a **sub-navigation** bar lists the three forms — Articles,
  Poems and Short Stories — and stays visible on every page beneath it, so you
  can move between them from anywhere without going back up.

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
