/**
 * Style Spy Web — Local Storage Module
 * Persists saved design kits locally in browser localStorage.
 */
(function (global) {
  'use strict';

  const KEY = 'stylespy_web_kits_v1';

  function getKits() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveKits(kits) {
    localStorage.setItem(KEY, JSON.stringify(kits || []));
  }

  function clearAllData() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {}
  }

  global.StyleSpyStorage = {
    getKits,
    saveKits,
    clearAllData
  };
})(typeof window !== 'undefined' ? window : globalThis);
