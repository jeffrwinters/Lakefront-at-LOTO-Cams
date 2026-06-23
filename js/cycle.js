// ─── Auto Cycle ───────────────────────────────────────────────────────────────
function toggleCycle() {
  if (isCycling) stopCycle();
  else startCycle();
}

function startCycle() {
  cycleQueue = [...selectedCams].sort((a, b) => a - b);
  if (cycleQueue.length === 0) { showToast('Select at least one cam to cycle'); return; }
  // Find position of current cam in queue, or start from 0
  const pos = cycleQueue.indexOf(currentIdx);
  cycleQueuePos = pos >= 0 ? pos : 0;
  isCycling = true;
  document.getElementById('cycleBtn').classList.add('active');
  document.getElementById('cycleBtn').textContent = '⏸ Cycling';
  document.getElementById('cycleBtnPanel').classList.add('active');
  document.getElementById('cycleBtnPanel').textContent = '⏸ Stop Cycle';
  document.getElementById('cycleStatus').textContent = `Cycling ${cycleQueue.length} cams`;
  scheduleTick();
}

function stopCycle() {
  isCycling = false;
  clearTimeout(timerTimeout);
  timerTimeout = null;
  document.getElementById('cycleBtn').classList.remove('active');
  document.getElementById('cycleBtn').textContent = '▶ Cycle Cams';
  document.getElementById('cycleBtnPanel').classList.remove('active');
  document.getElementById('cycleBtnPanel').textContent = '▶ Cycle Cams';
  document.getElementById('cycleStatus').textContent = 'Off';
  document.getElementById('timerBar').style.width = '0%';
}

function scheduleTick() {
  clearTimeout(timerTimeout);
  timerStart = Date.now();
  animateTimer();
  timerTimeout = setTimeout(() => {
    if (!isCycling) return;
    cycleQueuePos = (cycleQueuePos + 1) % cycleQueue.length;
    loadCam(cycleQueue[cycleQueuePos]);
    scheduleTick();
  }, timerMs());
}

function resetTimerBar() {
  savePreferences();
  if (isCycling) { clearTimeout(timerTimeout); scheduleTick(); }
  else document.getElementById('timerBar').style.width = '0%';
}

function animateTimer() {
  if (!isCycling || !timerStart) return;
  const pct = Math.min(((Date.now() - timerStart) / timerMs()) * 100, 100);
  document.getElementById('timerBar').style.width = pct + '%';
  if (pct < 100) requestAnimationFrame(animateTimer);
}

// ─── Time slider ──────────────────────────────────────────────────────────────
function updateTimeDisplay() {
  savePreferences();
  const val = parseInt(document.getElementById('timeSlider').value);
  const disp = val < 60 ? val + 's' : (val / 60) % 1 === 0 ? (val / 60) + 'm' : (val / 60).toFixed(1) + 'm';
  document.getElementById('timeDisplay').textContent = disp;
  savePreferences();
  if (isCycling) { clearTimeout(timerTimeout); scheduleTick(); }
}
