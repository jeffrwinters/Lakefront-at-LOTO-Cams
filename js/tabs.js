// ─── Main Tabs ───────────────────────────────────────────────────────────────
function showMainTab(tab) {
  const camsPanel = document.getElementById('camsPanel');
  const mapPanel = document.getElementById('mapPanel');

  const camsBtn = document.getElementById('camsTabBtn');
  const mapBtn = document.getElementById('mapTabBtn');

  if (tab === 'map') {
    camsPanel.classList.remove('active');
    mapPanel.classList.add('active');

    camsBtn.classList.remove('active');
    mapBtn.classList.add('active');

    setTimeout(() => {
      if (window.lotoMap) {
        window.lotoMap.invalidateSize();
      }
    }, 120);

  } else {
    mapPanel.classList.remove('active');
    camsPanel.classList.add('active');

    mapBtn.classList.remove('active');
    camsBtn.classList.add('active');
  }
}

// ─── Hidden Admin Shortcut ───────────────────────────────────────────────────
(function setupHiddenAdminShortcut() {
  const logo = document.querySelector('.header-logo');
  if (!logo) return;

  let clickCount = 0;
  let resetTimer = null;

  logo.style.cursor = 'default';

  logo.addEventListener('click', () => {
    clickCount++;
    clearTimeout(resetTimer);

    if (clickCount >= 3) {
      window.open('https://jeffrwinters.github.io/Lakefront-at-LOTO-Cams-v2/', '_blank', 'noopener,noreferrer');
      clickCount = 0;
      return;
    }

    resetTimer = setTimeout(() => {
      clickCount = 0;
    }, 3000);
  });
})();
