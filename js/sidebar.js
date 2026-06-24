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
  const list = document.getElementById('camList');

  list.innerHTML = '';

  // Favorites filter button
  const filterRow = document.createElement('div');

filterRow.style.position = 'sticky';
filterRow.style.top = '0';
filterRow.style.zIndex = '5';
filterRow.style.background = 'var(--surface)';
filterRow.style.paddingBottom = '8px';

  #favoritesFilterBtn {
  width: 100%;
}

#favoritesFilterBtn.active {
  background: #ffd54a;
  border-color: #ffd54a;
  color: #000;
}

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
