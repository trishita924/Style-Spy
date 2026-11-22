/**
 * Style Spy Web — Screenshot Colour Analyser
 * Performs local HTML5 Canvas pixel quantisation, Euclidean colour clustering,
 * frequency ranking, nearest colour naming, and click-to-sample eyedropper.
 */
(function (global) {
  'use strict';

  const NAMED_COLORS = [
    ['Midnight Navy', 15, 23, 42],
    ['Charcoal', 24, 24, 27],
    ['Slate Dark', 30, 41, 59],
    ['Slate Gray', 100, 116, 139],
    ['Cool Silver', 203, 213, 225],
    ['Snow White', 248, 250, 252],
    ['Pure White', 255, 255, 255],
    ['Pure Black', 0, 0, 0],
    ['Indigo', 99, 102, 241],
    ['Violet', 124, 58, 237],
    ['Electric Blue', 59, 130, 246],
    ['Sky Blue', 14, 165, 233],
    ['Teal', 20, 184, 166],
    ['Emerald', 16, 185, 129],
    ['Forest Green', 22, 163, 74],
    ['Amber Gold', 245, 158, 11],
    ['Warm Orange', 249, 115, 22],
    ['Coral Red', 239, 68, 68],
    ['Rose Pink', 244, 63, 94]
  ];

  function rgbToHex(r, g, b) {
    const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0').toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function hexToRgb(hex) {
    const clean = String(hex || '').replace('#', '').trim();
    if (!/^[0-9A-Fa-f]{6}$/.test(clean)) return null;
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16)
    };
  }

  function getClosestColorName(r, g, b) {
    let bestName = 'Custom Shade';
    let bestDist = Infinity;
    for (const [name, nr, ng, nb] of NAMED_COLORS) {
      const dist = (r - nr) ** 2 + (g - ng) ** 2 + (b - nb) ** 2;
      if (dist < bestDist) {
        bestDist = dist;
        bestName = name;
      }
    }
    return bestName;
  }

  /**
   * Quantize pixel buffer into 5-bit buckets and merge similar shades
   * within Euclidean RGB distance threshold to prevent duplicate swatches.
   */
  function quantizeAndClusterPixels(data, maxColors) {
    const buckets = new Map();
    let totalCounted = 0;

    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 128) continue; // skip transparent pixels
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const qr = r >> 3;
      const qg = g >> 3;
      const qb = b >> 3;
      const key = (qr << 10) | (qg << 5) | qb;

      let entry = buckets.get(key);
      if (!entry) {
        entry = { rSum: 0, gSum: 0, bSum: 0, count: 0 };
        buckets.set(key, entry);
      }
      entry.rSum += r;
      entry.gSum += g;
      entry.bSum += b;
      entry.count += 1;
      totalCounted += 1;
    }

    if (totalCounted === 0) return [];

    const sorted = Array.from(buckets.values())
      .map((e) => ({
        r: Math.round(e.rSum / e.count),
        g: Math.round(e.gSum / e.count),
        b: Math.round(e.bSum / e.count),
        count: e.count
      }))
      .sort((a, b) => b.count - a.count);

    // Cluster similar shades (Euclidean distance < 38)
    const clusters = [];
    const DIST_SQ_THRESHOLD = 38 * 38;

    for (const item of sorted) {
      let merged = false;
      for (const cl of clusters) {
        const dSq = (item.r - cl.r) ** 2 + (item.g - cl.g) ** 2 + (item.b - cl.b) ** 2;
        if (dSq < DIST_SQ_THRESHOLD) {
          const newCount = cl.count + item.count;
          cl.r = Math.round((cl.r * cl.count + item.r * item.count) / newCount);
          cl.g = Math.round((cl.g * cl.count + item.g * item.count) / newCount);
          cl.b = Math.round((cl.b * cl.count + item.b * item.count) / newCount);
          cl.count = newCount;
          merged = true;
          break;
        }
      }
      if (!merged) {
        clusters.push(Object.assign({}, item));
      }
      if (clusters.length >= (maxColors || 8) * 3) break;
    }

    clusters.sort((a, b) => b.count - a.count);
    return clusters.slice(0, maxColors || 8).map((c) => ({
      hex: rgbToHex(c.r, c.g, c.b),
      rgb: `rgb(${c.r}, ${c.g}, ${c.b})`,
      r: c.r,
      g: c.g,
      b: c.b,
      name: getClosestColorName(c.r, c.g, c.b),
      percent: Number(((c.count / totalCounted) * 100).toFixed(1))
    }));
  }

  function analyzeImageElement(img, previewCanvas) {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    if (previewCanvas) {
      previewCanvas.width = w;
      previewCanvas.height = h;
      previewCanvas.getContext('2d').drawImage(img, 0, 0, w, h);
    }

    // Downscale to max 240px wide for fast local pixel analysis
    const maxW = 240;
    const scale = Math.min(1, maxW / w);
    const sw = Math.max(1, Math.round(w * scale));
    const sh = Math.max(1, Math.round(h * scale));

    const off = document.createElement('canvas');
    off.width = sw;
    off.height = sh;
    const ctx = off.getContext('2d');
    ctx.drawImage(img, 0, 0, sw, sh);
    const imgData = ctx.getImageData(0, 0, sw, sh);

    return quantizeAndClusterPixels(imgData.data, 8);
  }

  global.StyleSpyColorAnalyzer = {
    rgbToHex,
    hexToRgb,
    getClosestColorName,
    quantizeAndClusterPixels,
    analyzeImageElement
  };
})(typeof window !== 'undefined' ? window : globalThis);
