# Nivedh Govil — personal website

A small, static website. No build step, no dependencies — plain HTML and one
stylesheet. Open `index.html` in a browser to view it locally.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home: photo, introduction, and links to the writing sections |
| `articles.html` | All articles |
| `poems.html` | All poems |
| `short-stories.html` | All short stories |
| `pieces/` | One page per piece of writing (full text) |
| `style.css` | Shared styling for every page |
| `assets/` | Images |

Every page carries the same navigation bar, so you can move between Home,
Articles, Poems and Short Stories from anywhere on the site.

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
