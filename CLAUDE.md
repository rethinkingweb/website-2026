# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, multi-page marketing website for **RethinkingWeb** (codevelopus.com) — an app/web development, IT consulting, and digital marketing agency. Pure HTML/CSS/vanilla JS. **No build system, no package manager, no framework, no server.** Pages are opened directly or served as static files.

## Running locally

There is no build or test step. Serve the folder over HTTP so relative asset paths and `fetch`/EmailJS work:

```bash
python3 -m http.server 8000    # then open http://localhost:8000/index.html
```

Opening `index.html` via `file://` mostly works but can break fonts/CDN behavior — prefer the HTTP server.

## Architecture: the per-page triplet convention

The single most important pattern. Every page `X` is a self-contained triplet, wired together inside the HTML:

- `X.html` — markup
- `css/X.css` — that page's styles
- `js/X.js` — that page's behavior

So `case1.html` loads `css/case1.css` + `js/case1.js`, `about.html` loads `css/about.css` + `js/about.js`, and so on. **There is no shared component system** — nav, footer, and sections are copy-pasted HTML across pages. Changing a shared element (e.g. the nav dropdown) means editing every `*.html` file, not one include.

Exceptions to the naming rule:
- `index.html` uses `css/style.css` + `js/script.js` (not `index.*`).

### Global files, linked on every page

- **`css/base.css`** — single source of truth for brand tokens (CSS custom properties), resets, keyframes, and dark-mode overrides (`body.dark { ... }`). Linked *first*, before the page CSS and Tailwind CDN. Do not redeclare `:root` tokens in per-page CSS; consume variables from `base.css` instead.
- **`js/theme.js`** — the dark/light toggle. Reads/writes `localStorage['rtw-theme']`, applies `body.dark` before paint to avoid flash, and binds `#themeToggle` plus any `[data-theme-toggle]` buttons.

When adding a new page, include `css/base.css` (first), the page CSS, Tailwind CDN, then `js/theme.js` and the EmailJS block, or the page loses dark mode and its form.

### Design tokens

Brand colors and neutrals are CSS custom properties in `css/base.css` (e.g. `--orange: #F04E23`, `--charcoal`, `--bg`, `--border`). Dark-mode overrides live there too under `body.dark`. Keep token names consistent; dark mode only works for elements that consume the variables.

## Forms: EmailJS, no backend

Contact/consultation forms submit client-side via EmailJS — there is no server endpoint despite some HTML still carrying `action="contact-submit.php"` (it's stripped at runtime).

- `js/form-handler.js` is the universal handler. It targets `<form id="contactForm">`, removes the form's `action`/`method`, validates `[required]` fields, calls `emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form, PUBLIC_KEY)`, and shows a fixed banner on success/failure.
- Field `name` attributes (`first_name`, `last_name`, `company`, `email`, `phone`, `service`, `message`) map directly to the EmailJS template — renaming a field breaks the email.
- The required script block at the bottom of each page:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js"></script>
  <script>emailjs.init("5A5LhPvEmbexDOWIK");</script>
  <script src="js/form-handler.js"></script>
  ```
- Note: `js/script.js` also contains a separate, simpler form handler (fake "Sent!" button) and an unused `#contact-form` EmailJS block. On any page that loads `form-handler.js`, that handler is the real one — don't duplicate submit logic.

## Shared JS behaviors (in `js/script.js`, the homepage script)

`script.js` is the largest behavior file and is the reference implementation for site-wide interactions, much of which is duplicated into per-page scripts: `IntersectionObserver`-driven counter animations (`.stat-num`, `.count-up`, `data-target`), fade-in reveals, sticky nav (`#nav` + `.scrolled`), mobile nav drawer (`#navBurger`/`#mobileNav`/`#navOverlay`), nav dropdowns (`.nav__dropdown`), testimonial marquee cloning (`#testiTrack`), and `[data-tilt]` 3D hover. Reuse these class/ID hooks when adding sections so the existing observers pick them up.

## Conventions when editing

- Match the surrounding page's existing CSS-variable names and BEM-ish class style (`nav__link`, `solution-card`, `svc-card`, `mob-accordion__btn`).
- Many HTML files begin with a UTF-8 BOM — preserve it; don't reformat whole files.
- New page → copy an existing similar page's `<head>`/nav/footer, then create matching `css/X.css` and `js/X.js`. Link order in `<head>`: `css/base.css` → `css/X.css` → Tailwind CDN. Scripts at end of body: `js/X.js` → `js/theme.js` → EmailJS block.
