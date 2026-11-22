# Testing Checklist — Style Spy (Web Edition)

> **Environment Note:** Automated checks for JavaScript syntax (`node --check`), pure-web compliance (zero Chrome extension APIs or Manifest V3), HTML asset paths, 5-website pixel quantisation/clustering, HTML/CSS typography extraction, `localStorage` kit persistence, and CSS variable/theme export were executed in Node.js and Python (PIL). Live browser drag-and-drop, pixel eyedropper clicks, Clipboard API, and browser restart persistence require manual verification in Chrome or Brave because headless Chromium in the build sandbox blocks `127.0.0.1` and `file://` URLs.

## Mandatory Acceptance Tests

| Test | Description | Status | Verification Details |
|------|-------------|--------|----------------------|
| **TEST 1** | **Five Website Colour Verification** | **Passed (Synthetic 5-Site Pixel Test)** / Pending Real Screenshots | Tested `StyleSpyColorAnalyzer.quantizeAndClusterPixels()` on 5 distinct website pixel buffers (`DarkSaaS`, `Fintech`, `Editorial`, `Minimal`, `Coral`): all 5 extracted exact dominant background & accent HEX colors and percentages (`78.4%` / `21.6%`). Test with 5 real website screenshots in Chrome/Brave. |
| **TEST 2** | **Saved Kits Persistence** | **Passed (Storage Logic)** / Pending Browser Restart | Verified `StyleSpyStorage.saveKits()` & `getKits()` in Node.js `localStorage` mock; live Chrome/Brave close-and-reopen persistence pending. |
| **TEST 3** | **CSS Export & Application** | **Passed (CSS Generation)** / Pending Live HTML Apply | Verified `StyleSpyCssExporter.generateCss()` outputs dynamic `:root` variables (`--color-primary: #0F8B5D`, `--color-background: #0F172A`, `--font-size-heading: 32px`) and practical rules for `body`, `h1..h4`, `button, .btn`, `.card`, `input`, `a`. |

## Additional Functional & Privacy Tests

| # | Test Scenario | Status | Verification Details |
|---|---------------|--------|----------------------|
| 4 | Pure static website & privacy audit | **Passed (Automated)** | Verified zero `manifest.json`, zero `chrome.*` APIs, and zero `fetch()`/`XMLHttpRequest`/`sendBeacon` network calls across all 7 JS files. |
| 5 | Typography extraction (`samples/sample.html` + `sample.css`) | **Passed (Automated)** | Extracted `Body` (`16px`), `Heading` (`32px`, `700`), and `Button` (`14px`, `600`) roles accurately. |
| 6 | Copy HEX / RGB / Font / CSS, Rename/Delete Kit, Live Preview | **Pending Live Browser Verification** | Implemented in `app.js`, `kit-manager.js`, and `preview.js`; test interactively in Chrome/Brave. |
