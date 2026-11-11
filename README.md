# Lucia Liao Portfolio

This repository publishes Lucia Liao's portfolio as a static GitHub Pages site at [luciala-glitch.github.io](https://luciala-glitch.github.io).

## Structure

- `index.html` is the interactive home page (particle hero, one chapter per project): `motion.css`, `motion.js`.
- `work.html?id=<project>` is the case study for each project, with its own scroll-driven module: `work.css`, `work.js`.
- `field.js` is the shared GPU particle form used by both (three.js from jsDelivr).
- `classic.html` is the previous long-form portfolio page; `case.html` redirects old links to `work.html`.
- `demos/` contains the interactive prototypes embedded in each case study.
- `assets/`, CSS, and JavaScript files contain the public media and front-end implementation.
- GitHub Pages publishes the root of the `main` branch after each push.

## Privacy

Only public portfolio files belong in this repository. Private source material, research files, credentials, and client-confidential data must never be added.

## Local preview

```bash
python3 -m http.server 8765
```

Then open `http://127.0.0.1:8765`.
