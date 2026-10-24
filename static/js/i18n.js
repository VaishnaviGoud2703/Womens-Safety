// i18n.js - Simple client‑side translation loader
// Loads translations from window.TRANSLATIONS (defined in translations.js)
// Detects saved language in localStorage, falls back to 'en'
// Updates elements with data-i18n-key attributes and handles RTL for Urdu (ur)

(function() {
  const storageKey = 'nirbhayaLang';
  const defaultLang = 'en';

  // Retrieve saved language or default
  const currentLang = localStorage.getItem(storageKey) || defaultLang;

  // Apply language
  function applyLanguage(lang) {
    const map = window.TRANSLATIONS[lang] || window.TRANSLATIONS[defaultLang];
    // Update text content
    document.querySelectorAll('[data-i18n-key]').forEach(el => {
      const key = el.getAttribute('data-i18n-key');
      if (map[key]) {
        // Handle different element types
        if (el.placeholder !== undefined) {
          el.placeholder = map[key];
        } else if (el.title !== undefined && el.hasAttribute('title')) {
          el.title = map[key];
        } else {
          el.textContent = map[key];
        }
      }
    });
    // RTL handling for Urdu (ur)
    if (lang === 'ur') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.body.classList.add('rtl');
    } else {
      document.documentElement.removeAttribute('dir');
      document.body.classList.remove('rtl');
    }
    // Update selector UI
    const selector = document.getElementById('languageSelect');
    if (selector) selector.value = lang;
    // Persist
    localStorage.setItem(storageKey, lang);
  }

  // Initial apply
  applyLanguage(currentLang);

  // Hook up selector change event (ensure selector exists)
  document.addEventListener('DOMContentLoaded', function() {
    const selector = document.getElementById('languageSelect');
    if (selector) {
      selector.addEventListener('change', function(e) {
        const newLang = e.target.value;
        applyLanguage(newLang);
      });
    }
  });
})();
