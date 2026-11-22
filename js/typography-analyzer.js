/**
 * Style Spy Web — HTML/CSS Typography Analyser
 * Extracts font-family, font-size, font-weight, line-height, and letter-spacing
 * from pasted CSS and HTML (<style> + inline style="..."), and checks system font availability.
 */
(function (global) {
  'use strict';

  function classifyRole(selector) {
    const s = (selector || '').toLowerCase();
    if (/(^|[\s,>])h[1-6]\b|heading|title|hero/.test(s)) return 'Heading';
    if (/button|\.btn|cta/.test(s)) return 'Button';
    if (/(^|[\s,>])(body|p)\b|text|copy|article/.test(s)) return 'Body';
    if (/(^|[\s,>])a\b|link|nav/.test(s)) return 'Link';
    return selector.trim().slice(0, 32) || 'Custom';
  }

  function isFontAvailableOnSystem(fontFamilyStr) {
    if (!fontFamilyStr || typeof document === 'undefined' || !document.fonts || !document.fonts.check) {
      return null;
    }
    const primary = fontFamilyStr.split(',')[0].replace(/['"]/g, '').trim();
    if (!primary || /^(sans-serif|serif|monospace|system-ui|cursive|fantasy)$/i.test(primary)) {
      return true;
    }
    try {
      return document.fonts.check(`16px "${primary}"`);
    } catch (e) {
      return null;
    }
  }

  function parseDeclarations(declBlock) {
    const props = {};
    String(declBlock || '').split(';').forEach((pair) => {
      const idx = pair.indexOf(':');
      if (idx === -1) return;
      const prop = pair.slice(0, idx).trim().toLowerCase();
      const val = pair.slice(idx + 1).trim();
      if (prop && val) props[prop] = val;
    });
    return props;
  }

  function analyzeHtmlAndCss(rawHtml, rawCss) {
    let combinedCss = String(rawCss || '').trim();
    const htmlStr = String(rawHtml || '').trim();

    if (!combinedCss && !htmlStr) {
      return { ok: false, error: 'Please paste HTML and/or CSS to analyse typography.' };
    }

    const extracted = [];
    const seenKeys = new Set();

    function pushRule(selector, declText) {
      const props = parseDeclarations(declText);
      const hasTypo =
        props['font-family'] ||
        props['font-size'] ||
        props['font-weight'] ||
        props['line-height'] ||
        props['letter-spacing'];
      if (!hasTypo) return;

      const role = classifyRole(selector);
      const fontFamily = props['font-family'] || '';
      const fontSize = props['font-size'] || '';
      const fontWeight = props['font-weight'] || '';
      const lineHeight = props['line-height'] || '';
      const letterSpacing = props['letter-spacing'] || '';

      const key = `${selector}|${fontFamily}|${fontSize}|${fontWeight}`;
      if (seenKeys.has(key)) return;
      seenKeys.add(key);

      const cssLines = [];
      if (fontFamily) cssLines.push(`font-family: ${fontFamily};`);
      if (fontSize) cssLines.push(`font-size: ${fontSize};`);
      if (fontWeight) cssLines.push(`font-weight: ${fontWeight};`);
      if (lineHeight) cssLines.push(`line-height: ${lineHeight};`);
      if (letterSpacing) cssLines.push(`letter-spacing: ${letterSpacing};`);

      extracted.push({
        role,
        selector: selector.trim(),
        fontFamily,
        fontSize,
        fontWeight,
        lineHeight,
        letterSpacing,
        systemAvailable: isFontAvailableOnSystem(fontFamily),
        cssDeclaration: `${selector.trim()} {\n  ${cssLines.join('\n  ')}\n}`
      });
    }

    // Extract <style> blocks and inline style="..." from HTML if provided
    if (htmlStr) {
      const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
      let sm;
      while ((sm = styleRegex.exec(htmlStr)) !== null) {
        combinedCss += '\n' + sm[1];
      }

      const inlineRegex = /<([a-zA-Z0-9-]+)[^>]*\sstyle=["']([^"']+)["'][^>]*>/gi;
      let im;
      while ((im = inlineRegex.exec(htmlStr)) !== null) {
        pushRule(im[1].toLowerCase(), im[2]);
      }
    }

    // Strip CSS comments and parse selector { ... } rules
    const cleanCss = combinedCss.replace(/\/\*[\s\S]*?\*\//g, '');
    const ruleRegex = /([^{}]+)\{([^{}]+)\}/g;
    let rm;
    while ((rm = ruleRegex.exec(cleanCss)) !== null) {
      const selector = rm[1].trim();
      const body = rm[2].trim();
      if (!selector || selector.startsWith('@')) continue;
      pushRule(selector, body);
    }

    if (extracted.length === 0) {
      return {
        ok: false,
        error: 'No font-family, font-size, font-weight, line-height, or letter-spacing declarations were found in the pasted code.'
      };
    }

    return { ok: true, items: extracted };
  }

  global.StyleSpyTypographyAnalyzer = {
    classifyRole,
    analyzeHtmlAndCss
  };
})(typeof window !== 'undefined' ? window : globalThis);
