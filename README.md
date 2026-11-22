# Style Spy — Web Edition

**Style Spy – Web Edition** is a 100% local, static web application that helps you extract dominant colours from website screenshots, analyse typography from HTML/CSS, organize reusable **Design Kits**, preview them live on a sample webpage, and export ready-to-use CSS variables and theme styles.

> **Important Browser Limitation:** Because this is a normal static website (not a browser extension), browser security rules prevent it from automatically inspecting another website's open tab or reading its live DOM/computed CSS. Instead, upload a website screenshot and/or paste HTML & CSS—everything runs locally in your browser.

---

## Main Features

- **Screenshot Colour Analyser**: Upload or drag-and-drop PNG/JPG/JPEG screenshots, extract ranked dominant colours using local HTML5 Canvas pixel quantisation & clustering, view HEX, RGB, nearest colour name, and usage percentages, or click anywhere on the screenshot to sample an exact pixel.
- **HTML/CSS Typography Analyser**: Paste HTML and CSS to extract `font-family`, `font-size`, `font-weight`, `line-height`, and `letter-spacing`, see visual previews, check system font availability, and copy individual values or complete CSS declarations.
- **Design Kit Creator**: Combine extracted colours and typography into named kits (with optional reference URL), edit/rename/delete kits, and persist them in `localStorage`.
- **CSS Export**: Generates `:root` CSS variables plus practical theme styles for `body`, headings, paragraphs, buttons, cards, links, and inputs.
- **Live Design Preview**: Switch between saved kits to see colours and typography applied live to a sample webpage.

---

## How to Open & Deploy

### Run Locally
Extract `Style-Spy-Web.zip` and open `Style-Spy-Web/index.html` directly in Chrome or Brave—or serve with:
```bash
cd Style-Spy-Web
python3 -m http.server 8080
```

### Deploy to GitHub Pages
1. Push the contents of `Style-Spy-Web/` (with `index.html` at the repository root) to GitHub.
2. Go to **Settings → Pages** → **Deploy from a branch** → select `main` and `/ (root)` → **Save**.

---

## How to Use

1. **Upload a Screenshot**: Drag and drop a PNG/JPG/JPEG image into **1. Colour Analyser** (or click **Load Sample** to test immediately). Click any swatch to copy its HEX code, or click **Copy RGB**.
2. **Analyse HTML/CSS**: Paste HTML and/or CSS into **2. Typography Analyser** and click **Analyse Typography**.
3. **Create & Save a Design Kit**: Click **+ Create Kit**, add your extracted colours and typography with **+ Add to Active Kit**, and click **💾 Save Kit**.
4. **Export & Apply CSS**: Click **⬇ Download CSS** (or **📋 Copy CSS**). Link the downloaded `.css` file in any plain HTML page (`<link rel="stylesheet" href="my-kit-stylespy.css" />`) to apply the variables and component styles.

---

## Privacy & Known Limitations

- **Privacy**: 100% local processing in your browser. Zero backend servers, zero external APIs, zero analytics. Use **Clear Local Data** anytime to wipe saved kits from `localStorage`.
- **Known Limitation**: Pasted CSS rules are parsed statically; external Google Fonts or `@import` URLs are not fetched automatically by Style Spy.
