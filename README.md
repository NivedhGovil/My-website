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

Open the relevant page (`articles.html`, `poems.html` or `short-stories.html`).
Each one contains a commented-out template. Uncomment it, or copy it, and fill
it in:

```html
<li class="piece">
  <h2><a href="pieces/the-title.html">The Title</a></h2>
  <p class="meta">March 2026</p>
  <p class="summary">One or two lines saying what this piece is about.</p>
</li>
```

Then delete the placeholder `<li>` holding the "being collected" note once the
first real entry is in place.

## Publishing with GitHub Pages

In the repository, go to **Settings → Pages**, set the source to the `main`
branch and the root folder, and save. The site is served from
`https://nivedhgovil.github.io/My-website/`.
