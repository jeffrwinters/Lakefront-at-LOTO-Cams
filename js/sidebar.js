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

function buildSidebar() {
  const list = document.getElementById('camList');

  CAMS.forEach((cam, i) => {
    const el = document.createElement('div');

    el.className = 'cam-item in-cycle';
    el.dataset.idx = i;

    el.innerHTML = `
      <div class="cam-item-switch"></div>
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

    list.appendChild(el);
  });
}
