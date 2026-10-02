# Sadeed Uddin — Portfolio

A static website: plain HTML, CSS and JavaScript. There is no framework, no build step and no `npm install`. It is hosted on Vercel.

## Run it locally

Open `index.html` in a browser, or serve the folder so links behave like production:

```
npx serve .
```

## Folder structure

```
index.html          Main page (all sections: hero, about, projects, marketing, accomplishments, clients, testimonials, contact, footer)
privacy.html        Privacy Policy & Legal Notice
terms.html          Terms & Conditions
cookies.html        Cookie Policy
css/style.css       Styles for index.html, in the same order as the page sections
css/legal.css       Shared styles for the three legal pages
js/main.js          All behaviour for index.html (see "How the page works")
images/             cover.jpg (hero photo), logo.webp, loader.webp (loading animation)
images/logos/       Client logos for the "Trusted by" strip
images/screenshots/ Project and marketing thumbnails (screenshots of the live client sites)
fonts/              Self-hosted Inter and JetBrains Mono (fonts.css + .woff2 + licenses)
vendor/             Lenis smooth-scroll library (self-hosted, MIT)
vercel.json         Security headers (CSP, HSTS, etc.)
```

## How the page works

- **Pinned scroll sections** (`data-pin`): `main.js` sets a CSS variable `--p` from 0 to 1 while a section is scrolled through. The CSS uses `--p` for the hero zoom, the word-by-word About text, the sideways Projects track and the Testimonials switcher.
- **Project and marketing popups**: each card holds its popup content in a `<template class="details">`. Clicking a card (or pressing Enter or Space on it) runs `openDetails()`, which copies that content into the shared `#drawer` and shows it as a centred floating "island". The website link with the globe icon is inside the popup (`.d-visit`).
- **Phone section dial** (`.zoom-dial`): a touch-only navigator at the bottom of the screen on phones. It is hidden from keyboards and screen readers because the header menu does the same job.
- **Contact form**: sends JSON to [FormSubmit](https://formsubmit.co), which emails `sadeeduddin11@outlook.com`. If FormSubmit fails, it falls back to opening the visitor's email app. The consent checkbox is required, and the time of consent is included in the email.
- **Testimonials**: the content between `<!-- TESTIMONIALS:START -->` and `<!-- TESTIMONIALS:END -->` in `index.html` is replaced automatically. Keep those markers.

## Common edits

| To change… | Edit |
|---|---|
| A project | its `<article class="card">` in the Projects section of `index.html` (card + `<template class="details">`) |
| A marketing case study | its `<article class="card mk">` in the Marketing section |
| Add a client logo | add the image to `images/logos/` and **two** `.logo-cell` entries in `index.html` (the strip repeats once for a seamless loop) |
| Colours | CSS variables at the top of `css/style.css` (light and dark mode) |
| Contact email | `INBOX` in `js/main.js`, plus the `mailto:` links in `index.html` and the legal pages |

## Rules to keep

- **No third-party scripts, fonts, embeds or trackers.** The legal pages promise no cookies and no tracking. Adding Google Analytics, a Meta Pixel, a YouTube embed or similar needs a cookie-consent banner **and** updates to `privacy.html` and `cookies.html` first.
- **Security policy**: the Content-Security-Policy lives in `vercel.json`, with a copy in the `<meta>` tag of each page. A new external service must be added to both or it will be blocked.
- **Accessibility**: keep the visible focus outline (`:focus-visible`), the skip link, labels on form fields and `alt` text on images. Motion respects `prefers-reduced-motion`.
- **Claims**: only publish results and client details that can be backed up. Client names and logos are covered by the notice in the footer and `privacy.html`.
