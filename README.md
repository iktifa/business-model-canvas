# Business Model Canvas Builder

**Live:** https://iktifa.github.io/business-model-canvas/

A free, multilingual web tool for designing a Business Model Canvas, with guidance for every block, templates, worked examples, and PNG / PDF export.

**Languages:** العربية (default, RTL) · English · Français · Español · Türkçe · اردو (RTL)

## Features
- **Introduction overlay:** opens on the first visit (and from "How to start"). Four steps: the idea behind the canvas, the three lenses (desirability, feasibility, viability), an interactive diagram of how the blocks connect, and how to use the tool. Text lives in `tour` in each locale; the connections are defined in `src/content/links.ts`.
- **Canvas editor:** 9 colour-coded blocks with sticky notes. Add, edit, recolour, reorder (drag, `Alt + ↑/↓`, or the note menu), move between blocks, delete. Undo and redo with `Ctrl/⌘ + Z` and `Ctrl/⌘ + Shift + Z`.
- **Guidance:** a side panel per block with an explanation, guiding questions, common mistakes and one-click examples, plus a suggested fill order and a progress tracker.
- **Templates (6):** tech startup, online store, restaurant/café, service business, non-profit/waqf, marketplace. They fill each block with dashed prompt notes that you type over. Prompts are never exported.
- **Examples (10):** coffee shop, e-learning, grocery delivery, endowment-funded training, design agency, modest-fashion store, home kitchen, clinic SaaS, fitness studio, heritage tours.
- **Accessibility:** keyboard-only use, skip link, native modal dialogs with focus trapping and restore, screen-reader announcements, labelled controls, light/dark/system theme, 4 text sizes, high-contrast mode, reduce-motion, 24px+ touch targets.
- **Save & share:** autosaves in the browser. Share links carry the whole canvas in the URL (`#c=…`), so no server is needed. Save the canvas as a `.json` file and open it again from the Export menu, the ⋯ menu, the welcome card, the gallery, or by dragging the file onto the page.
- **Export:** PNG (2×), PDF A4/A3, and Print (vector, selectable-text PDF). Arabic and Urdu shaping is kept.
- **Direction:** in Arabic and Urdu every field and exported note is right-to-left, even when it holds Latin text. Other languages detect direction from the text.
- **Font:** Readex Pro, which covers Arabic, Urdu and Latin. Its Latin letters come from Lexend, a typeface designed for readability.

## Develop
```bash
npm install
npm run dev      # http://localhost:5173
npm run check    # validates every language file against the catalog
npm run build    # check + type-check + static site in dist/
```
Deploy `dist/` to any static host (GitHub Pages, Netlify, Cloudflare Pages, Vercel, your own server).

## Editing content
- `src/content/catalog.ts`: example and template IDs, icons, categories, and note colours (one letter per note).
- `src/content/locales/<lang>.ts`: all teaching content per language: block names, guidance, intro, tips, examples, templates.
- `src/i18n/<lang>.json`: interface strings.
- To add a language, add its code to `LANGS` in `src/types.ts`, create both files, register them in `src/content/locales/index.ts` and `src/i18n/index.ts`, then run `npm run check`.

## Deployment
Every push to `main` builds and publishes the site to GitHub Pages (`.github/workflows/deploy.yml`). To use a custom domain, add `public/CNAME` with the domain, point its DNS at GitHub Pages, and set the domain in the repo's Settings → Pages.

## License & attribution
Code: MIT (see `LICENSE`).
The Business Model Canvas is by Strategyzer AG and is licensed under CC BY-SA 3.0. The app shows "Strategyzer AG · CC BY-SA 3.0" in its footer.
