# Repository Guidelines

## Project Structure

- `index.html`, `about.html`, `contact.html`: Static pages.
- `assets/style.css`: Global styles + theme variables (`data-theme="dark|white"`).
- `assets/scroll.css`: Scroll/animation styles.
- `assets/script.js`: Shared JS (theme toggle, nav highlight, contact form validation + submit).
- `assets/main.js`: Home-only first-view overlay/video logic.
- `assets/icons/`, `assets/images/`, `assets/videos/`, `images/`: Media assets (logo, hero, backgrounds).

## Run Locally

No build step. Use a local static server so `fetch` works:

- Python: `python -m http.server 8000` (open `http://localhost:8000/`)
- Node: `npx serve . -l 8000`

Quick manual checks after changes:
- Theme toggle (dark/white) and image swapping.
- Active nav highlight via `body[data-page]` + `data-nav`.
- `contact.html` form: validation, checkbox 'その他' behavior, submit POST to GAS.

## Coding Style & Naming

- HTML: 2-space indentation; keep header/footer markup consistent across pages.
- CSS: Prefer existing variables (`--color-*`, `--field-*`). Scope page-specific rules using `body[data-page="..."]`.
- JS: Vanilla JS; keep changes inside the existing IIFE in `assets/script.js`.
- Encoding: keep files UTF-8; avoid introducing mixed encodings/line endings.

**About page rule:** Do not change `about.html` design/layout unless explicitly requested.

## Testing Guidelines

No test framework. Validate by loading pages locally and checking responsive layout (mobile widths) and external links (`Instagram`, `X`).

## Commit & Pull Request Guidelines

- Commits are short and descriptive (often Japanese; sometimes `feat:`). Keep scope small (e.g., `contact: フォーム送信を修正`).
- PRs: include summary, rationale, and screenshots (dark/white) for UI changes. Note any endpoint/ID changes (e.g., GAS URL).

## Security & Configuration Notes

- Do not commit secrets. Treat external endpoints as public and rotate if needed.
- If you change contact payload keys, update both `assets/script.js` and the GAS handler.
