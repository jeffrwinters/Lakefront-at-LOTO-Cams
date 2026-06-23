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
