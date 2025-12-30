# Project Overview: Kogakuin University Magicians Society (KMS) Official Site

## Purpose
The official portfolio site for the Kogakuin University Magicians Society. 
It provides information for new members, showcases past activities, and serves as a contact point for performance requests.

## Tech Stack
- **Languages**: HTML5, CSS3, JavaScript (Vanilla, SPA-like features), Google Apps Script (GAS)
- **Styling**: Vanilla CSS with variables (`--color-*`), Mobile-first responsive design.
- **Images**: AVIF format for performance.
- **Hosting**: Static hosting on university servers.

## Key Files & Structure
- `index.html`: Japanese top page.
- `en/index.html`: English top page.
- `about.html`, `contact.html`: Static pages.
- `assets/css/`: Stylesheets (`style.css` global, `scroll.css` animations).
- `assets/js/`: Logic (`script.js` shared, `lightbulb.js` theme toggle).
- `assets/images/`: Images and icons.

## Deployment
Manual FTP deployment. No CI/CD pipeline.
secrets must be handled carefully (GAS endpoints etc).
