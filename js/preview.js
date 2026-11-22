/**
 * Style Spy Web — Live Design Preview Module
 * Applies any saved Design Kit's colours and typography live onto the sample webpage.
 */
(function (global) {
  'use strict';

  const Exporter = global.StyleSpyCssExporter;

  function applyKitToPreview(kit) {
    const stage = document.getElementById('live-preview-stage');
    if (!stage) return;

    const t = Exporter.resolveKitTokens(kit || {});
    stage.style.backgroundColor = t.bgHex;
    stage.style.color = t.textHex;
    stage.style.fontFamily = t.fontBody;
    stage.style.fontSize = t.fontSizeBody;
    stage.style.fontWeight = t.fontWeightBody;
    stage.style.lineHeight = t.lineHeightBody;

    stage.querySelectorAll('.lp-heading, .lp-subheading, .lp-brand').forEach((el) => {
      el.style.fontFamily = t.fontHeading;
      el.style.fontWeight = t.fontWeightHeading;
      el.style.color = t.textHex;
    });

    const mainH = stage.querySelector('.lp-heading');
    if (mainH) mainH.style.fontSize = t.fontSizeHeading;

    stage.querySelectorAll('.lp-link').forEach((a) => {
      a.style.color = t.primaryHex;
    });

    const btnPrimary = stage.querySelector('.lp-btn-primary');
    if (btnPrimary) {
      btnPrimary.style.backgroundColor = t.primaryHex;
      btnPrimary.style.color = '#ffffff';
      btnPrimary.style.fontFamily = t.fontHeading;
      btnPrimary.style.fontWeight = t.fontWeightButton;
    }

    const btnSecondary = stage.querySelector('.lp-btn-secondary');
    if (btnSecondary) {
      btnSecondary.style.backgroundColor = 'transparent';
      btnSecondary.style.border = `1.5px solid ${t.secondaryHex}`;
      btnSecondary.style.color = t.textHex;
      btnSecondary.style.fontFamily = t.fontHeading;
      btnSecondary.style.fontWeight = t.fontWeightButton;
    }

    stage.querySelectorAll('.lp-card').forEach((card) => {
      card.style.backgroundColor = t.surfaceHex;
      card.style.borderColor = t.secondaryHex;
      card.style.color = t.textHex;
    });

    const input = stage.querySelector('.lp-input');
    if (input) {
      input.style.backgroundColor = t.surfaceHex;
      input.style.borderColor = t.secondaryHex;
      input.style.color = t.textHex;
      input.style.fontFamily = t.fontBody;
    }
  }

  global.StyleSpyPreview = { applyKitToPreview };
})(window);
