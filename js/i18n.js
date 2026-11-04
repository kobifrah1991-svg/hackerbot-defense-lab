/* i18n: JSON dictionaries in /i18n (fetched), with inline Hebrew fallback for file:// */
(function () {
  const lang = localStorage.getItem('hb_lang') || 'he';
  document.documentElement.lang = lang; document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  window.LANG = lang; window.DICT = {};
  window.t = k => window.DICT[k] || k;
  window.setLang = l => { localStorage.setItem('hb_lang', l); location.reload(); };
  window.I18N_READY = fetch(`i18n/${lang}.json`).then(r => r.json()).then(d => { window.DICT = d; })
    .catch(() => fetch('i18n/he.json').then(r => r.json()).then(d => { window.DICT = d; }).catch(() => {}));
})();
