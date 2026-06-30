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
  const ADMIN_URL = 'https://jeffrwinters.github.io/Lakefront-at-LOTO-Cams-v2/';
  let clickCount = 0;
  let resetTimer = null;

  function markLogoClickable() {
    const logo = document.querySelector('.header-logo');
    if (logo) {
      logo.style.pointerEvents = 'auto';
      logo.style.cursor = 'default';
    }
  }

  function handlePossibleLogoClick(event) {
    const target = event.target;
    if (!target || !target.closest || !target.closest('.header-logo')) return;

    clickCount++;
    clearTimeout(resetTimer);

    if (clickCount >= 3) {
      clickCount = 0;
      window.open(ADMIN_URL, '_blank');
      return;
    }

    resetTimer = setTimeout(() => {
      clickCount = 0;
    }, 2500);
  }

  markLogoClickable();
  document.addEventListener('DOMContentLoaded', markLogoClickable);
  document.addEventListener('click', handlePossibleLogoClick, true);
})();
