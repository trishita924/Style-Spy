/**
 * Style Spy Web — Main Application Controller
 * Connects Screenshot Colour Analyser, Typography Analyser, Design Kit Manager,
 * CSS Exporter, Live Preview, Clipboard Copy, and Sample Loader.
 */
(function (global) {
  'use strict';

  const Storage = global.StyleSpyStorage;
  const ColorAn = global.StyleSpyColorAnalyzer;
  const TypoAn = global.StyleSpyTypographyAnalyzer;
  const KitMgrMod = global.StyleSpyKitManager;
  const CssExp = global.StyleSpyCssExporter;
  const Preview = global.StyleSpyPreview;

  let extractedColors = [];
  let extractedTypo = [];
  let loadedImageEl = null;
  let kitMgr = null;

  function showToast(msg) {
    const container = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  function showAlert(msg, type) {
    const el = document.getElementById('global-alert');
    el.textContent = msg;
    el.className = 'alert-banner ' + (type || 'error');
  }

  function hideAlert() {
    document.getElementById('global-alert').classList.add('hidden');
  }

  async function copyToClipboard(text, label) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast(`Copied ${label || text}!`);
        return true;
      }
    } catch (e) {}

    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showToast(`Copied ${label || text}!`);
      return true;
    } catch (e) {
      showAlert('Clipboard permission denied. Please copy manually.', 'error');
      return false;
    }
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==================== RENDER EXTRACTED COLOURS ====================
  function renderExtractedColors() {
    document.getElementById('palette-count').textContent = String(extractedColors.length);
    const listEl = document.getElementById('extracted-palette-list');
    listEl.innerHTML = '';

    if (extractedColors.length === 0) {
      listEl.innerHTML = '<div class="muted" style="grid-column:1/-1;font-size:12.5px;">Upload a screenshot or add a colour manually to build a palette.</div>';
      return;
    }

    extractedColors.forEach((c, idx) => {
      const card = document.createElement('div');
      card.className = 'color-card';
      card.innerHTML = `
        <div class="color-swatch" style="background:${escapeHTML(c.hex)};" title="Click to copy ${escapeHTML(c.hex)}"></div>
        <div class="color-info">
          <div class="color-top">
            <span class="mono">${escapeHTML(c.hex)}</span>
            <span>${c.percent !== undefined ? c.percent + '%' : 'Manual'}</span>
          </div>
          <div class="color-meta">
            <span>${escapeHTML(c.name || '')}</span>
          </div>
          <div class="color-btns">
            <button type="button" class="btn-link copy-rgb-btn">Copy RGB</button>
            <button type="button" class="btn-link del-color-btn" style="color:#FCA5A5;">Remove</button>
          </div>
        </div>
      `;

      card.querySelector('.color-swatch').addEventListener('click', () => copyToClipboard(c.hex, c.hex));
      card.querySelector('.copy-rgb-btn').addEventListener('click', () => copyToClipboard(c.rgb, c.rgb));
      card.querySelector('.del-color-btn').addEventListener('click', () => {
        extractedColors.splice(idx, 1);
        renderExtractedColors();
      });

      listEl.appendChild(card);
    });
  }

  // ==================== RENDER EXTRACTED TYPOGRAPHY ====================
  function renderExtractedTypo() {
    document.getElementById('typo-count').textContent = String(extractedTypo.length);
    const listEl = document.getElementById('extracted-typo-list');
    listEl.innerHTML = '';

    if (extractedTypo.length === 0) {
      listEl.innerHTML = '<div class="muted" style="font-size:12.5px;">Paste HTML or CSS above and click <strong>Analyse Typography</strong>.</div>';
      return;
    }

    extractedTypo.forEach((t) => {
      const card = document.createElement('div');
      card.className = 'typo-card';
      const sysBadge = t.fontFamily
        ? (t.systemAvailable
            ? '<span class="sys-pill avail">Available on System</span>'
            : '<span class="sys-pill fallback">Declared / Webfont</span>')
        : '';

      card.innerHTML = `
        <div class="typo-head">
          <div>
            <span class="role-pill">${escapeHTML(t.role)}</span>
            <span class="mono muted" style="margin-left:6px;">${escapeHTML(t.selector)}</span>
          </div>
          ${sysBadge}
        </div>
        <div class="typo-preview-sample" style="font-family:${escapeHTML(t.fontFamily || 'inherit')};font-size:${escapeHTML(t.fontSize || '16px')};font-weight:${escapeHTML(t.fontWeight || '400')};">
          The quick brown fox — ${escapeHTML(t.role)}
        </div>
        <div class="typo-specs">
          ${t.fontFamily ? `<span><strong>Font:</strong> ${escapeHTML(t.fontFamily)}</span>` : ''}
          ${t.fontWeight ? `<span><strong>Weight:</strong> ${escapeHTML(t.fontWeight)}</span>` : ''}
          ${t.fontSize ? `<span><strong>Size:</strong> ${escapeHTML(t.fontSize)}</span>` : ''}
          ${t.lineHeight ? `<span><strong>Line-H:</strong> ${escapeHTML(t.lineHeight)}</span>` : ''}
          ${t.letterSpacing ? `<span><strong>Spacing:</strong> ${escapeHTML(t.letterSpacing)}</span>` : ''}
        </div>
        <div class="palette-actions" style="margin-top:6px;">
          ${t.fontFamily ? '<button type="button" class="btn-link copy-ff-btn">Copy Font</button>' : ''}
          ${t.fontSize ? '<button type="button" class="btn-link copy-fs-btn">Copy Size</button>' : ''}
          ${t.fontWeight ? '<button type="button" class="btn-link copy-fw-btn">Copy Weight</button>' : ''}
          <button type="button" class="btn-link copy-css-btn">Copy CSS</button>
        </div>
      `;

      const ffBtn = card.querySelector('.copy-ff-btn');
      if (ffBtn) ffBtn.addEventListener('click', () => copyToClipboard(t.fontFamily, 'font-family'));
      const fsBtn = card.querySelector('.copy-fs-btn');
      if (fsBtn) fsBtn.addEventListener('click', () => copyToClipboard(t.fontSize, 'font-size'));
      const fwBtn = card.querySelector('.copy-fw-btn');
      if (fwBtn) fwBtn.addEventListener('click', () => copyToClipboard(t.fontWeight, 'font-weight'));
      card.querySelector('.copy-css-btn').addEventListener('click', () => copyToClipboard(t.cssDeclaration, 'typography CSS'));

      listEl.appendChild(card);
    });
  }

  // ==================== SCREENSHOT UPLOAD & PIXEL PICKER ====================
  function processScreenshotFile(file) {
    hideAlert();
    if (!file) return;
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showAlert('Unsupported image format. Please upload a PNG, JPG, or JPEG screenshot.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => showAlert('Failed to read the screenshot file.', 'error');
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => showAlert('Invalid or corrupted screenshot image.', 'error');
      img.onload = () => {
        loadedImageEl = img;
        const canvas = document.getElementById('screenshot-canvas');
        document.getElementById('dropzone-placeholder').classList.add('hidden');
        canvas.classList.remove('hidden');
        document.getElementById('btn-reanalyse-img').classList.remove('hidden');

        extractedColors = ColorAn.analyzeImageElement(img, canvas);
        renderExtractedColors();
        showToast(`Extracted ${extractedColors.length} dominant colours!`);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function syncPreviewDropdown(kits, activeKit) {
    const sel = document.getElementById('preview-kit-select');
    sel.innerHTML = '';
    if (kits.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Default Preview (No Saved Kits)';
      sel.appendChild(opt);
      Preview.applyKitToPreview({ colors: extractedColors, typography: extractedTypo });
      return;
    }

    kits.forEach((k) => {
      const opt = document.createElement('option');
      opt.value = k.id;
      opt.textContent = k.name;
      sel.appendChild(opt);
    });
    if (activeKit) sel.value = activeKit.id;
    const chosen = kits.find((k) => k.id === sel.value) || kits[0];
    Preview.applyKitToPreview(chosen);
  }

  // ==================== BOOTSTRAP ====================
  document.addEventListener('DOMContentLoaded', () => {
    kitMgr = KitMgrMod.createKitManager((kits, activeKit) => {
      syncPreviewDropdown(kits, activeKit);
    });

    renderExtractedColors();
    renderExtractedTypo();
    syncPreviewDropdown(kitMgr.getAllKits(), kitMgr.getActiveKit());

    // Screenshot upload & drag-drop
    const scInput = document.getElementById('screenshot-input');
    const scDrop = document.getElementById('screenshot-dropzone');
    const scCanvas = document.getElementById('screenshot-canvas');

    scInput.addEventListener('change', (e) => {
      if (e.target.files[0]) processScreenshotFile(e.target.files[0]);
      e.target.value = '';
    });

    scDrop.addEventListener('dragover', (e) => {
      e.preventDefault();
      scDrop.classList.add('drag-over');
    });
    scDrop.addEventListener('dragleave', () => scDrop.classList.remove('drag-over'));
    scDrop.addEventListener('drop', (e) => {
      e.preventDefault();
      scDrop.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processScreenshotFile(e.dataTransfer.files[0]);
      }
    });

    document.getElementById('btn-reanalyse-img').addEventListener('click', () => {
      if (!loadedImageEl) return;
      extractedColors = ColorAn.analyzeImageElement(loadedImageEl, scCanvas);
      renderExtractedColors();
      showToast('Screenshot reanalysed!');
    });

    // Click pixel on screenshot canvas
    scCanvas.addEventListener('click', (e) => {
      if (!loadedImageEl) return;
      const rect = scCanvas.getBoundingClientRect();
      const x = Math.floor(((e.clientX - rect.left) / rect.width) * scCanvas.width);
      const y = Math.floor(((e.clientY - rect.top) / rect.height) * scCanvas.height);
      const px = scCanvas.getContext('2d').getImageData(x, y, 1, 1).data;
      const hex = ColorAn.rgbToHex(px[0], px[1], px[2]);

      document.getElementById('picked-swatch').style.background = hex;
      document.getElementById('picked-label').textContent = `${hex} • rgb(${px[0]}, ${px[1]}, ${px[2]})`;
      document.getElementById('manual-color-picker').value = hex;
      document.getElementById('manual-hex-input').value = hex;
    });

    // Manual Color Picker sync
    const colorPicker = document.getElementById('manual-color-picker');
    const hexInput = document.getElementById('manual-hex-input');
    colorPicker.addEventListener('input', () => {
      hexInput.value = colorPicker.value.toUpperCase();
      document.getElementById('picked-swatch').style.background = hexInput.value;
    });

    document.getElementById('btn-add-manual-color').addEventListener('click', () => {
      hideAlert();
      const raw = hexInput.value.trim().toUpperCase();
      const rgb = ColorAn.hexToRgb(raw);
      if (!rgb) {
        showAlert('Invalid HEX colour. Use format #RRGGBB (e.g., #6366F1).', 'error');
        return;
      }
      const hex = ColorAn.rgbToHex(rgb.r, rgb.g, rgb.b);
      if (!extractedColors.some((c) => c.hex === hex)) {
        extractedColors.push({
          hex,
          rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
          r: rgb.r,
          g: rgb.g,
          b: rgb.b,
          name: ColorAn.getClosestColorName(rgb.r, rgb.g, rgb.b)
        });
        renderExtractedColors();
        showToast(`Added ${hex} to palette!`);
      }
    });

    document.getElementById('btn-copy-palette').addEventListener('click', () => {
      if (extractedColors.length === 0) {
        showAlert('No colours in the palette to copy.', 'warning');
        return;
      }
      copyToClipboard(extractedColors.map((c) => c.hex).join(', '), 'full colour palette');
    });

    // Typography Analysis
    document.getElementById('btn-analyse-typo').addEventListener('click', () => {
      hideAlert();
      const res = TypoAn.analyzeHtmlAndCss(
        document.getElementById('html-input').value,
        document.getElementById('css-input').value
      );
      if (!res.ok) {
        showAlert(res.error, 'error');
        return;
      }
      extractedTypo = res.items;
      renderExtractedTypo();
      showToast(`Extracted ${extractedTypo.length} typography style(s)!`);
    });

    // Add to Active Kit
    document.getElementById('btn-add-colors-to-kit').addEventListener('click', () => {
      if (extractedColors.length === 0) {
        showAlert('Extract or add colours first before adding to a kit.', 'warning');
        return;
      }
      kitMgr.addColorsToActiveKit(extractedColors);
      showToast('Added colours to active Design Kit!');
    });

    document.getElementById('btn-add-typo-to-kit').addEventListener('click', () => {
      if (extractedTypo.length === 0) {
        showAlert('Analyse typography first before adding to a kit.', 'warning');
        return;
      }
      kitMgr.addTypographyToActiveKit(extractedTypo);
      showToast('Added typography to active Design Kit!');
    });

    // Kit Controls
    document.getElementById('btn-new-kit').addEventListener('click', () => {
      const name = prompt('Enter a name for the new Design Kit:', 'My Design Kit');
      if (name === null) return;
      kitMgr.createNewKit(name, document.getElementById('ref-url-input').value);
      showToast('Created new Design Kit!');
    });

    document.getElementById('btn-save-kit').addEventListener('click', () => {
      hideAlert();
      const name = document.getElementById('kit-name-input').value;
      const url = document.getElementById('kit-url-input').value;
      if (!name.trim()) {
        showAlert('Kit Name is required.', 'error');
        return;
      }
      kitMgr.saveActiveKitEdits(name, url);
      showToast('Design Kit saved!');
    });

    document.getElementById('btn-delete-kit').addEventListener('click', () => {
      const active = kitMgr.getActiveKit();
      if (active && confirm(`Delete kit "${active.name}"?`)) {
        kitMgr.deleteActiveKit();
        showToast('Design Kit deleted.');
      }
    });

    // CSS Export & Preview Modal
    const cssModal = document.getElementById('modal-css');
    const getActiveCssOrError = () => {
      const active = kitMgr.getActiveKit();
      if (!active) {
        showAlert('Please create or select a Design Kit first.', 'error');
        return null;
      }
      if ((active.colors || []).length === 0 && (active.typography || []).length === 0) {
        showAlert('This Design Kit is empty. Add colours or typography first.', 'warning');
        return null;
      }
      return { kit: active, css: CssExp.generateCss(active) };
    };

    const downloadCss = (kit, cssText) => {
      const slug = (kit.name || 'design-kit').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'design-kit';
      const blob = new Blob([cssText], { type: 'text/css;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}-stylespy.css`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      showToast(`Downloaded ${slug}-stylespy.css!`);
    };

    document.getElementById('btn-preview-css').addEventListener('click', () => {
      const res = getActiveCssOrError();
      if (!res) return;
      document.getElementById('css-preview-textarea').value = res.css;
      cssModal.classList.remove('hidden');
    });
    document.getElementById('modal-css-close').addEventListener('click', () => cssModal.classList.add('hidden'));
    document.getElementById('btn-copy-css').addEventListener('click', () => {
      const res = getActiveCssOrError();
      if (res) copyToClipboard(res.css, 'CSS stylesheet');
    });
    document.getElementById('modal-copy-css').addEventListener('click', () => {
      copyToClipboard(document.getElementById('css-preview-textarea').value, 'CSS stylesheet');
    });
    document.getElementById('btn-download-css').addEventListener('click', () => {
      const res = getActiveCssOrError();
      if (res) downloadCss(res.kit, res.css);
    });
    document.getElementById('modal-download-css').addEventListener('click', () => {
      const res = getActiveCssOrError();
      if (res) downloadCss(res.kit, res.css);
    });

    // Live Preview Kit Switcher
    document.getElementById('preview-kit-select').addEventListener('change', (e) => {
      const chosen = kitMgr.getAllKits().find((k) => k.id === e.target.value);
      Preview.applyKitToPreview(chosen || { colors: extractedColors, typography: extractedTypo });
    });

    // Load Sample HTML/CSS + Generated Sample Screenshot
    document.getElementById('btn-load-sample').addEventListener('click', async () => {
      document.getElementById('html-input').value =
        '<header><h1>Build Faster with Style Spy</h1></header>\n<p>Extract real colours and typography from any UI.</p>\n<button class="btn">Get Started</button>';
      document.getElementById('css-input').value =
        'h1 { font-family: "Inter", sans-serif; font-size: 32px; font-weight: 700; line-height: 1.2; }\n' +
        'body { font-family: "Lora", serif; font-size: 16px; font-weight: 400; line-height: 1.6; }\n' +
        'button, .btn { font-family: "Inter", sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 0.02em; }';

      const typoRes = TypoAn.analyzeHtmlAndCss(
        document.getElementById('html-input').value,
        document.getElementById('css-input').value
      );
      if (typoRes.ok) {
        extractedTypo = typoRes.items;
        renderExtractedTypo();
      }

      // Render a crisp sample UI screenshot onto Canvas & analyse it
      const off = document.createElement('canvas');
      off.width = 640;
      off.height = 380;
      const c = off.getContext('2d');
      c.fillStyle = '#0F172A';
      c.fillRect(0, 0, 640, 380);
      c.fillStyle = '#1E293B';
      c.fillRect(40, 40, 560, 300);
      c.fillStyle = '#6366F1';
      c.fillRect(70, 240, 180, 48);
      c.fillStyle = '#10B981';
      c.fillRect(270, 240, 150, 48);
      c.fillStyle = '#F8FAFC';
      c.font = '700 28px sans-serif';
      c.fillText('Sample SaaS Dashboard', 70, 120);

      const sampleImg = new Image();
      sampleImg.onload = () => {
        loadedImageEl = sampleImg;
        document.getElementById('dropzone-placeholder').classList.add('hidden');
        scCanvas.classList.remove('hidden');
        document.getElementById('btn-reanalyse-img').classList.remove('hidden');
        extractedColors = ColorAn.analyzeImageElement(sampleImg, scCanvas);
        renderExtractedColors();
        showToast('Sample screenshot & typography analysed!');
      };
      sampleImg.src = off.toDataURL('image/png');
    });

    // Clear Local Data
    document.getElementById('btn-clear-local').addEventListener('click', () => {
      if (confirm('Clear all saved Design Kits from browser storage?')) {
        Storage.clearAllData();
        kitMgr.reloadFromStorage();
        showToast('Local data cleared.');
      }
    });
  });
})(window);
