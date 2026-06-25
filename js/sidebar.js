function ensureSidebarStyles() {
  if (document.getElementById('sidebarDynamicStyles')) return;

  const style = document.createElement('style');
  style.id = 'sidebarDynamicStyles';
  style.textContent = `
    .sidebar-cycle-controls {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 8px;
      padding: 8px 0 10px !important;
      width: 100%;
    }

    .sidebar-cycle-controls .btn,
    #cycleSelectedBtn,
    #cycleFavoritesBtn,
    #cycleFavoritesBtn.btn.accent {
      width: 100% !important;
      min-width: 0;
      justify-content: center;
      padding: 9px 8px !important;
      border-radius: 8px;
      background: rgba(49,87,255,0.18) !important;
      border: 1px solid var(--border) !important;
      color: white !important;
      font-size: 12px !important;
      font-weight: 700 !important;
      line-height: 1.1;
      white-space: nowrap;
    }

    .sidebar-cycle-controls .btn:hover,
    #cycleSelectedBtn:hover,
    #cycleFavoritesBtn:hover,
    #cycleFavoritesBtn.btn.accent:hover {
      background: rgba(49,87,255,0.32) !important;
      border-color: white !important;
      color: white !important;
    }

    /* Mobile fix: the sidebar was capped at 260px with overflow hidden,
       which clipped the camera list after the first visible camera. */
    @media (max-width: 900px) {
      .sidebar {
        max-height: none !important;
        overflow: visible !important;
      }

      .sidebar .cam-list {
        max-height: 55vh !important;
        min-height: 220px;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch;
      }
    }

    @media (max-width: 360px) {
      .sidebar-cycle-controls .btn,
      #cycleSelectedBtn,
      #cycleFavoritesBtn,
      #cycleFavoritesBtn.btn.accent {
        font-size: 11px !important;
        padding-inline: 6px !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function toggleCamSelection(idx) {
  if (selectedCams.has(idx)) selectedCams.delete(idx);
  else selectedCams.add(idx);

  updateSelectionUI(idx);
  updateSelectedCount();
  savePreferences();
}

function updateSelectionUI(idx) {
  const inCycle = selectedCams.has(idx);

  const sideItem =
    document.querySelector(`.cam-item[data-idx="${idx}"]`);

  if (sideItem) {
    sideItem.classList.toggle('in-cycle', inCycle);
  }
}

function updateSelectedCount() {
  document.getElementById('selectedCount').textContent =
    selectedCams.size;
}

function selectAll() {
  CAMS.forEach((_, i) => selectedCams.add(i));

  CAMS.forEach((_, i) => updateSelectionUI(i));

  updateSelectedCount();

  savePreferences();
}

function selectNone() {
  selectedCams.clear();

  CAMS.forEach((_, i) => updateSelectionUI(i));

  updateSelectedCount();

  savePreferences();
}

function toggleFavorite(idx) {
  if (favorites.has(idx))
    favorites.delete(idx);
  else
    favorites.add(idx);

  saveFavorites();

  buildSidebar();
}

function toggleFavoritesFilter() {
  showFavoritesOnly = !showFavoritesOnly;

  buildSidebar();
}

function buildSidebar() {
  ensureSidebarStyles();

  const list = document.getElementById('camList');

  list.innerHTML = '';

  // Favorites filter button
  const filterRow = document.createElement('div');

  filterRow.style.position = 'sticky';
  filterRow.style.top = '0';
  filterRow.style.zIndex = '5';
  filterRow.style.background = 'var(--surface)';
  filterRow.style.paddingBottom = '8px';

  filterRow.innerHTML = `
    <button
      id="favoritesFilterBtn"
      class="btn ${showFavoritesOnly ? 'active' : ''}"
      style="width:100%;"
    >
      ★ Favorites Only
    </button>
  `;

  list.appendChild(filterRow);

  filterRow
    .querySelector('button')
    .addEventListener(
      'click',
      toggleFavoritesFilter
    );

  CAMS.forEach((cam, i) => {

    if (
      showFavoritesOnly &&
      !favorites.has(i)
    ) {
      return;
    }

    const el = document.createElement('div');

    el.className = selectedCams.has(i)
      ? 'cam-item in-cycle'
      : 'cam-item';

    el.dataset.idx = i;

    el.innerHTML = `
      <div class="cam-item-switch"></div>

      <div class="cam-favorite">
        ${favorites.has(i) ? '★' : '☆'}
      </div>

      <span class="cam-item-name">
        ${cam.venue}
        <br>
        <span class="cam-item-sub">
          ${cam.camera_name}
        </span>
      </span>
    `;

    el.addEventListener('click', () => {
      loadCam(i);
    });

    el.querySelector('.cam-item-switch')
      .addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCamSelection(i);
      });

    el.querySelector('.cam-favorite')
      .addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(i);
      });

    list.appendChild(el);
  });
}
