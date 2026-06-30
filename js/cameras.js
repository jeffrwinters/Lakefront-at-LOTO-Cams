let CAMS = []; 
// ─── Camera Data ────────────────────────────────────────────────────────────
let camsDataHash = '';

async function loadCamsData() {
  const response = await fetch(`cams.json?v=${Date.now()}`);
  const allCams = await response.json();

  CAMS = allCams.filter(cam => cam.status === 'active');

  camsDataHash = JSON.stringify(CAMS);
}
async function refreshCamsIfChanged() {
  try {
    const response = await fetch(`cams.json?v=${Date.now()}`);
    const allCams = await response.json();

    const activeCams =
      allCams.filter(cam => cam.status === 'active');

    const newHash = JSON.stringify(activeCams);

    if (newHash === camsDataHash) {
      return;
    }

    console.log('cams.json changed');

    const oldCamera = CAMS[currentIdx];

    camsDataHash = newHash;
    CAMS = activeCams;

    // Remove invalid saved selections
    selectedCams = new Set(
      [...selectedCams].filter(
        idx => idx >= 0 && idx < CAMS.length
      )
    );

// Preserve sidebar state
const camList = document.getElementById('camList');
const scrollTop = camList.scrollTop;
const searchValue = document.getElementById('camSearch').value;

// Rebuild sidebar
camList.innerHTML = '';
buildSidebar();

// Restore sidebar state
camList.scrollTop = scrollTop;

document.getElementById('camSearch').value = searchValue;
filterCams();

// Restore scroll position 
camList.scrollTop = scrollTop;

    document.getElementById('camCount').textContent =
      CAMS.length + ' cams';

    updateSelectedCount();

    // Keep user on same camera if possible
    let newIndex = 0;

    if (oldCamera) {
      const match = CAMS.findIndex(
        cam =>
          cam.provider === oldCamera.provider &&
          cam.source === oldCamera.source
      );

      if (match >= 0) {
        newIndex = match;
      }
    }

    loadCam(newIndex);

    // Rebuild cycle queue if currently cycling
    if (isCycling) {
      cycleQueue = [...selectedCams]
        .sort((a, b) => a - b);

      if (cycleQueue.length === 0) {
        stopCycle();
        showToast('No selected cameras remain');
      } else {
        cycleQueuePos = Math.min(
          cycleQueuePos,
          cycleQueue.length - 1
        );
      }
    }

    savePreferences();

    showToast('Camera list updated');
  }
  catch (err) {
    console.error('Camera refresh failed', err);
  }
}

// ─── Spyder Network Link ─────────────────────────────────────────────────────
function addSpyderNetworkLink() {
  const playerWrap = document.querySelector('.player-wrap');

  if (!playerWrap || document.getElementById('spyderNetworkLink')) {
    return;
  }

  const linkBox = document.createElement('div');
  linkBox.id = 'spyderNetworkLink';
  linkBox.style.cssText = `
    margin: 8px 10px 10px;
    padding: 8px 10px;
    text-align: center;
    font-size: 0.88rem;
    line-height: 1.35;
    color: #ddd;
    background: rgba(255,255,255,0.05);
    border-radius: 8px;
  `;

  linkBox.innerHTML = `
    Looking for more live Lake of the Ozarks cameras?
    <a href="https://spydernetwork.com"
       target="_blank"
       rel="noopener noreferrer"
       style="color:#ff9800;font-weight:600;text-decoration:none;">
      Visit SpyderNetwork.com
    </a>
  `;

  playerWrap.insertAdjacentElement('beforeend', linkBox);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  await loadCamsData();

  loadPreferences();

  document.getElementById('camCount').textContent =
    CAMS.length + ' cams';

  buildSidebar();

  updateTimeDisplay();
  updateSelectedCount();

  CAMS.forEach((_, i) => updateSelectionUI(i));

  addSpyderNetworkLink();

  const startCam =
    parseInt(localStorage.getItem('loto_last_camera') || '0', 10);

  loadCam(
    Math.min(
      Math.max(startCam, 0),
      Math.max(CAMS.length - 1, 0)
    )
  );

  setupCastListeners();

  await loadLakeConditions();
  setInterval(
  refreshCamsIfChanged,
  60 * 1000
);
} 

// ─── Load Cam ─────────────────────────────────────────────────────────────────
// Multiple Twitch parent domains are included so embeds work before DNS propagation.
function loadCam(idx) {
  currentIdx = ((idx % CAMS.length) + CAMS.length) % CAMS.length;
  localStorage.setItem('loto_last_camera', currentIdx);
  
const cam = CAMS[currentIdx];

if (!cam) {
  console.error('Invalid camera', currentIdx);
  return;
}

  document.getElementById('camName').textContent = `${cam.venue} — ${cam.camera_name}`;
  document.getElementById('camIndex').textContent = `${currentIdx + 1} / ${CAMS.length}`;

  const allowedParents = [
    'jeffrwinters.github.io',
    'www.lakefrontatloto.com',
    'lakefrontatloto.com',
    'cams.lakefrontatloto.com',
    'localhost',
    '127.0.0.1'
  ];

  const parentParams = allowedParents
    .map(p => `parent=${p}`)
    .join('&');

  let src = '';

  switch ((cam.provider || '').toLowerCase()) {

case 'ipcamlive':
case 'ipcamlive.com':
  src =
    `https://g1.ipcamlive.com/player/player.php?alias=${cam.source}` +
    `&autoplay=1&mute=1`;
  break;

    case 'twitch':
    default:
      src = `https://player.twitch.tv/?channel=${cam.source}&${parentParams}&autoplay=true&muted=false`;
      break;
  }
  const frame = document.getElementById('twitchFrame');

if ((cam.provider || '').toLowerCase().includes('ipcamlive')) {
  frame.src = 'about:blank';

  setTimeout(() => {
    frame.src = src;
  }, 100);
} else {
  frame.src = src;
}

  document.getElementById('twitchFrame').src = src;

  // Update sidebar. Use each row's real camera index because the visible
  // row order changes when Favorites Only or search filtering is active.
  document.querySelectorAll('.cam-item').forEach((el) => {
    const rowIdx = parseInt(el.dataset.idx, 10);
    el.classList.toggle('active', rowIdx === currentIdx);
    // removed automatic sidebar scroll behavior
  });

  if (castSession) castCam(cam);
  resetTimerBar();
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function nextCam() {
  if (isCycling && cycleQueue.length > 0) {
    cycleQueuePos = (cycleQueuePos + 1) % cycleQueue.length;
    loadCam(cycleQueue[cycleQueuePos]);
  } else {
    loadCam(currentIdx + 1);
  }
}

function prevCam() {
  if (isCycling && cycleQueue.length > 0) {
    cycleQueuePos = (cycleQueuePos - 1 + cycleQueue.length) % cycleQueue.length;
    loadCam(cycleQueue[cycleQueuePos]);
  } else {
    loadCam(currentIdx - 1);
  }
}