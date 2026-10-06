# shape-bayes.github.io

Project page for **Shape-Bayes: Bayesian Inference of Structured Shapes under Visual Ambiguity**
(Tellamekala, Brown, Valstar).

A static site: plain HTML, CSS and a small amount of JavaScript. No build step. Math is rendered with a
self-hosted copy of KaTeX (`assets/vendor/katex`, MIT licence), so the page has no CDN dependency apart from Google Fonts.

## Preview locally

```sh
python -m http.server 8000
# open http://localhost:8000
```

Open it through a server rather than as `file://`, so the fonts and math load the same way they do on GitHub Pages.

## Deploy to https://shape-bayes.github.io

1. On GitHub, create an organization named `shape-bayes` (free plan).
2. In that organization, create a public repository named exactly `shape-bayes.github.io`.
3. Push this folder to the repository's `main` branch.
4. In the repository, go to Settings → Pages and set the source to "Deploy from a branch", `main`, `/ (root)`.

The site is live at `https://shape-bayes.github.io/` within a minute or two. `.nojekyll` makes GitHub serve the files as they are.

## Before publishing

- [ ] Replace `XXXX.XXXXX` with the arXiv identifier, in `index.html` in two places: the arXiv button and the BibTeX entry.
- [ ] When the code is public, set the Code button's `href` and remove its `aria-disabled="true"` attribute.
- [ ] Check the BibTeX key and year.

## Layout

```
index.html                 the page
assets/css/site.css        design tokens (light and dark) and all styles
assets/js/site.js          result tables and charts (data copied from the paper), tabs, sliders, lightbox, theme toggle
assets/fig/                figures rendered from the paper's PDFs as WebP
assets/fig/pairs/          before/after crops used by the comparison sliders
assets/shape-bayes.pdf     the paper
assets/og.jpg              link-preview image
assets/vendor/katex/       KaTeX 0.16.22 (CSS, JS, auto-render, WOFF2 fonts)
```

### Colour semantics

The page reuses the colour code of the paper's method diagram, and the colours mean the same thing everywhere:

| Concept | Token | Light | Dark |
|---|---|---|---|
| Likelihood / evidence (W) | `--lik` | `#9C2C7A` | `#C4498F` |
| Shape prior (Λ) | `--pri` | `#748300` | `#8E9A1A` |
| Posterior | `--post` | `#1E9CBA` | `#26A0BB` |
| Deterministic baseline | `--base` | neutral grey | neutral grey |

The three hues were checked for colour-vision-deficiency separation in both themes.

### Updating numbers

All numbers in the charts and result tables live in the `XARCH`, `PARTS`, `CALIB` and `ABLATION` constants at the top of
`assets/js/site.js`. The headline numbers in the stat strip and the clean-test-set table are written directly in
`index.html`.

## Adding interactive demos later

Each demo can be a self-contained ES module under `assets/js/demos/`, mounted into a new `<section class="sec">`. The closed-form
solver is a K×K linear solve, so it runs in the browser in microseconds. Shipping the PCA basis as JSON, plus the prior
Transformer exported to ONNX (run with onnxruntime-web), is enough to make the Bayesian update itself interactive without a server.
