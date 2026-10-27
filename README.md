# Lucia Liao Portfolio

This repository publishes Lucia Liao's portfolio as a static GitHub Pages site.

## Structure

- `site/` contains the public HTML, CSS, JavaScript, images, and interactive demos.
- `.github/workflows/pages.yml` deploys `site/` to GitHub Pages after each push to `main`.

## Privacy

Only public portfolio files belong in this repository. Private source material, research files, credentials, and client-confidential data must never be added.

## Local preview

```bash
python3 -m http.server 8765 -d site
```

Then open `http://127.0.0.1:8765`.
