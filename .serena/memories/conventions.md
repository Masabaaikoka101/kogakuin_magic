# Project Conventions & Guidelines

## Coding Style
- **HTML**: 2-space indentation. Maintain consistent header/footer.
- **CSS**: 
  - Use global variables (`--color-*`) defined in `assets/style.css`.
  - Scope page-specific rules with `body[data-page="..."]`.
- **JavaScript**:
  - Vanilla JS.
  - Use IIFE (Immediately Invoked Function Expression) in `assets/script.js` to avoid polluting global scope.
  - Do NOT use jQuery or heavy libraries.

## Commit Guidelines
- Short and descriptive messages (Japanese preferred).
- Format: `scope: message` (e.g., `contact: フォーム送信を修正`).
- Include rationale and screenshots for UI changes in PRs.

## Security
- Never commit secrets (API Keys, GAS endpoints).
- Rotate keys if leaked.

## Special Rules
- Do NOT modify `about.html` design/layout without explicit request.
