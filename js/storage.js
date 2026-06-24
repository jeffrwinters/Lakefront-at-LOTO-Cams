const STORAGE_KEYS = {
  selectedCams: 'loto_selected_cams',
  cycleInterval: 'loto_cycle_interval',
  favorites: 'loto_favorites'
};

let favorites = new Set();
let showFavoritesOnly = false;

function loadFavorites() {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEYS.favorites);

    favorites = new Set(
      JSON.parse(saved || '[]')
    );
  } catch {
    favorites = new Set();
  }
}

function saveFavorites() {
  localStorage.setItem(
    STORAGE_KEYS.favorites,
    JSON.stringify([...favorites])
  );
}

function savePreferences() {
  try {
    localStorage.setItem(
      STORAGE_KEYS.selectedCams,
      JSON.stringify([...selectedCams])
    );

    localStorage.setItem(
      STORAGE_KEYS.cycleInterval,
      document.getElementById('timeSlider').value
    );
  } catch (e) {}
}

function loadPreferences() {
  try {
    loadFavorites();
    const savedInterval =
      localStorage.getItem(STORAGE_KEYS.cycleInterval);

    if (savedInterval) {
      document.getElementById('timeSlider').value =
        savedInterval;
    }

    const savedCams =
      localStorage.getItem(STORAGE_KEYS.selectedCams);

    if (savedCams) {
      const parsed = JSON.parse(savedCams);

      selectedCams = new Set(
        parsed.filter(i => i >= 0 && i < CAMS.length)
      );
    } else {
      selectedCams = new Set(
        CAMS.map((_, i) => i)
      );
    }
  } catch (e) {
    selectedCams = new Set(
      CAMS.map((_, i) => i)
    );
  }
}
