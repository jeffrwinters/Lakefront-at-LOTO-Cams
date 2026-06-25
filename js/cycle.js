// ─── Auto Cycle ───────────────────────────────────────────────────────────────

let cycleMode = null; // 'selected' | 'favorites'

function buildSelectedQueue() {
  return [...selectedCams].sort((a, b) => a - b);
}

function buildFavoritesQueue() {
  return [...favorites].sort((a, b) => a - b);
}

function toggleSelectedCycle() {

  if (isCycling) {

    if (cycleMode === 'selected') {
      stopCycle();
      return;
    }

    stopCycle();
  }

  startCycle('selected');
}

function toggleFavoritesCycle() {

  if (isCycling) {

    if (cycleMode === 'favorites') {
      stopCycle();
      return;
    }

    stopCycle();
  }

  startCycle('favorites');
}

function startCycle(mode) {

  cycleMode = mode;

  cycleQueue =
    mode === 'favorites'
      ? buildFavoritesQueue()
      : buildSelectedQueue();

  if (cycleQueue.length === 0) {
    showToast(
      mode === 'favorites'
        ? 'Select at least one favorite camera.'
        : 'Select at least one camera to cycle.'
    );
    cycleMode = null;
    return;
  }

  const pos = cycleQueue.indexOf(currentIdx);
  cycleQueuePos = pos >= 0 ? pos : 0;

  clearTimeout(timerTimeout);

  isCycling = true;

  updateCycleButtons();

  document.getElementById('cycleStatus').textContent =
    `${mode === 'favorites' ? 'Favorites' : 'Selected'} • ${cycleQueue.length} cams`;

  scheduleTick();
}

function stopCycle() {

  isCycling = false;
  cycleMode = null;

  clearTimeout(timerTimeout);
  timerTimeout = null;

  updateCycleButtons();

  document.getElementById('cycleStatus').textContent = 'Off';
  document.getElementById('timerBar').style.width = '0%';
}

function updateCycleButtons() {

  const selectedBtn =
    document.getElementById('cycleSelectedBtn');

  const favoritesBtn =
    document.getElementById('cycleFavoritesBtn');

  if (!selectedBtn || !favoritesBtn) return;

  selectedBtn.disabled = false;
  favoritesBtn.disabled = false;

  selectedBtn.classList.remove('active');
  favoritesBtn.classList.remove('active');

  if (!isCycling) {

    selectedBtn.innerHTML = '▶ Cycle Selected';
    favoritesBtn.innerHTML = '★ Cycle Favorites';

    return;
  }

  if (cycleMode === 'selected') {

    selectedBtn.innerHTML = '⏸ Pause Selected';
    selectedBtn.classList.add('active');

    favoritesBtn.innerHTML = '★ Cycle Favorites';
    favoritesBtn.disabled = true;

  } else {

    favoritesBtn.innerHTML = '⏸ Pause Favorites';
    favoritesBtn.classList.add('active');

    selectedBtn.innerHTML = '▶ Cycle Selected';
    selectedBtn.disabled = true;
  }
}

function scheduleTick() {

  clearTimeout(timerTimeout);

  timerStart = Date.now();

  animateTimer();

  timerTimeout = setTimeout(() => {

    if (!isCycling) return;

    cycleQueuePos =
      (cycleQueuePos + 1) % cycleQueue.length;

    loadCam(cycleQueue[cycleQueuePos]);

    scheduleTick();

  }, timerMs());
}

function resetTimerBar() {

  savePreferences();

  if (isCycling) {

    clearTimeout(timerTimeout);
    scheduleTick();

  } else {

    document.getElementById('timerBar').style.width = '0%';
  }
}

function animateTimer() {

  if (!isCycling || !timerStart) return;

  const pct = Math.min(
    ((Date.now() - timerStart) / timerMs()) * 100,
    100
  );

  document.getElementById('timerBar').style.width =
    pct + '%';

  if (pct < 100) {
    requestAnimationFrame(animateTimer);
  }
}

// ─── Time slider ──────────────────────────────────────────────────────────────

function updateTimeDisplay() {

  savePreferences();

  const val =
    parseInt(document.getElementById('timeSlider').value);

  const disp =
    val < 60
      ? val + 's'
      : (val / 60) % 1 === 0
        ? (val / 60) + 'm'
        : (val / 60).toFixed(1) + 'm';

  document.getElementById('timeDisplay').textContent =
    disp;

  if (isCycling) {

    clearTimeout(timerTimeout);
    scheduleTick();
  }
}