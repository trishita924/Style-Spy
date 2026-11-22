/**
 * Style Spy Web — Design Kit Manager
 * Manages creating, editing, renaming, saving, and deleting Design Kits in localStorage.
 */
(function (global) {
  'use strict';

  const Storage = global.StyleSpyStorage;

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function createKitManager(onKitsUpdated) {
    let kits = Storage.getKits();
    let activeKitId = kits[0] ? kits[0].id : null;

    const navCountEl = document.getElementById('nav-kits-count');
    const savedListEl = document.getElementById('saved-kits-list');
    const emptyBox = document.getElementById('active-kit-empty');
    const editorBox = document.getElementById('active-kit-editor');
    const nameInput = document.getElementById('kit-name-input');
    const urlInput = document.getElementById('kit-url-input');
    const colorsListEl = document.getElementById('kit-colors-list');
    const fontsListEl = document.getElementById('kit-fonts-list');
    const colorsCountEl = document.getElementById('kit-colors-count');
    const fontsCountEl = document.getElementById('kit-fonts-count');

    function getActiveKit() {
      return kits.find((k) => k.id === activeKitId) || null;
    }

    function getAllKits() {
      return kits.slice();
    }

    function persist() {
      Storage.saveKits(kits);
      if (onKitsUpdated) onKitsUpdated(kits, getActiveKit());
    }

    function render() {
      navCountEl.textContent = String(kits.length);
      savedListEl.innerHTML = '';

      if (kits.length === 0) {
        savedListEl.innerHTML = '<div class="muted" style="font-size:12.5px;">No saved kits yet.</div>';
      } else {
        kits.forEach((kit) => {
          const item = document.createElement('div');
          item.className = 'kit-list-item' + (kit.id === activeKitId ? ' active' : '');
          const dateStr = new Date(kit.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          item.innerHTML = `
            <div class="kit-item-name">${escapeHTML(kit.name)}</div>
            <div class="kit-item-meta">${(kit.colors || []).length} colours • ${(kit.typography || []).length} fonts • ${dateStr}</div>
          `;
          item.addEventListener('click', () => {
            activeKitId = kit.id;
            render();
            if (onKitsUpdated) onKitsUpdated(kits, getActiveKit());
          });
          savedListEl.appendChild(item);
        });
      }

      const active = getActiveKit();
      emptyBox.classList.toggle('hidden', Boolean(active));
      editorBox.classList.toggle('hidden', !active);
      if (!active) return;

      nameInput.value = active.name || '';
      urlInput.value = active.referenceUrl || '';

      const colors = active.colors || [];
      const fonts = active.typography || [];
      colorsCountEl.textContent = String(colors.length);
      fontsCountEl.textContent = String(fonts.length);

      colorsListEl.innerHTML = '';
      if (colors.length === 0) {
        colorsListEl.innerHTML = '<span class="muted" style="font-size:12px;">No colours added yet.</span>';
      } else {
        colors.forEach((c, idx) => {
          const chip = document.createElement('div');
          chip.className = 'kit-chip';
          chip.innerHTML = `
            <span class="swatch-mini" style="background:${escapeHTML(c.hex)};width:14px;height:14px;"></span>
            <span class="mono">${escapeHTML(c.hex)}</span>
            <button type="button" class="chip-del" data-cidx="${idx}" aria-label="Remove colour">&times;</button>
          `;
          colorsListEl.appendChild(chip);
        });
      }

      fontsListEl.innerHTML = '';
      if (fonts.length === 0) {
        fontsListEl.innerHTML = '<span class="muted" style="font-size:12px;">No typography styles added yet.</span>';
      } else {
        fonts.forEach((f, idx) => {
          const chip = document.createElement('div');
          chip.className = 'kit-chip';
          chip.innerHTML = `
            <span><strong>${escapeHTML(f.role)}</strong>: ${escapeHTML(f.fontFamily || f.fontSize || f.selector)}</span>
            <button type="button" class="chip-del" data-fidx="${idx}" aria-label="Remove font">&times;</button>
          `;
          fontsListEl.appendChild(chip);
        });
      }
    }

    function createNewKit(name, refUrl) {
      const cleanName = (name || '').trim() || `Design Kit ${kits.length + 1}`;
      const kit = {
        id: 'kit-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
        name: cleanName,
        referenceUrl: (refUrl || '').trim(),
        colors: [],
        typography: [],
        createdAt: new Date().toISOString()
      };
      kits.unshift(kit);
      activeKitId = kit.id;
      persist();
      render();
      return kit;
    }

    function addColorsToActiveKit(colorsToAdd) {
      let active = getActiveKit();
      if (!active) {
        active = createNewKit('New Design Kit', document.getElementById('ref-url-input').value);
      }
      const existingHexes = new Set((active.colors || []).map((c) => c.hex.toUpperCase()));
      colorsToAdd.forEach((c) => {
        if (!existingHexes.has(c.hex.toUpperCase())) {
          active.colors.push(Object.assign({}, c));
          existingHexes.add(c.hex.toUpperCase());
        }
      });
      persist();
      render();
    }

    function addTypographyToActiveKit(itemsToAdd) {
      let active = getActiveKit();
      if (!active) {
        active = createNewKit('New Design Kit', document.getElementById('ref-url-input').value);
      }
      itemsToAdd.forEach((item) => {
        if (!active.typography.some((t) => t.selector === item.selector && t.fontFamily === item.fontFamily)) {
          active.typography.push(Object.assign({}, item));
        }
      });
      persist();
      render();
    }

    colorsListEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip-del');
      if (!btn) return;
      const active = getActiveKit();
      if (!active) return;
      active.colors.splice(Number(btn.dataset.cidx), 1);
      persist();
      render();
    });

    fontsListEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip-del');
      if (!btn) return;
      const active = getActiveKit();
      if (!active) return;
      active.typography.splice(Number(btn.dataset.fidx), 1);
      persist();
      render();
    });

    function saveActiveKitEdits(newName, newUrl) {
      const active = getActiveKit();
      if (!active) return false;
      const cleanName = (newName || '').trim();
      if (!cleanName) return false;
      active.name = cleanName;
      active.referenceUrl = (newUrl || '').trim();
      persist();
      render();
      return true;
    }

    function deleteActiveKit() {
      const active = getActiveKit();
      if (!active) return;
      kits = kits.filter((k) => k.id !== active.id);
      activeKitId = kits[0] ? kits[0].id : null;
      persist();
      render();
    }

    function reloadFromStorage() {
      kits = Storage.getKits();
      activeKitId = kits[0] ? kits[0].id : null;
      render();
      if (onKitsUpdated) onKitsUpdated(kits, getActiveKit());
    }

    render();

    return {
      getActiveKit,
      getAllKits,
      createNewKit,
      addColorsToActiveKit,
      addTypographyToActiveKit,
      saveActiveKitEdits,
      deleteActiveKit,
      reloadFromStorage,
      render
    };
  }

  global.StyleSpyKitManager = { createKitManager };
})(window);
