function filterCams() {
  const input = document.getElementById('camSearch');

  const val = input.value
    .toLowerCase()
    .trim();

  const clearBtn = document.getElementById('clearSearchBtn');

  clearBtn.style.display = val ? 'flex' : 'none';

  document.querySelectorAll('.cam-item').forEach((el, i) => {
    const cam = CAMS[i];

    const text =
      `${cam.venue} ${cam.camera_name} ${cam.source}`.toLowerCase();

    el.style.display = text.includes(val) ? 'flex' : 'none';
  });
}

function clearCamSearch() {
  const input = document.getElementById('camSearch');

  input.value = '';

  filterCams();

  input.focus();
}
