// ─── Lake Conditions ─────────────────────────────────────────────────────────
async function loadLakeConditions() {
  try {
    const lakeRes = await fetch(`lake_conditions.json?v=${Date.now()}`);
    const lakeData = await lakeRes.json();

    document.getElementById('waterTemp').textContent =
      `${lakeData.waterTemp}°`;

    document.getElementById('lakeLevel').textContent =
      `${Number(lakeData.lakeLevel).toFixed(2)} ft`;

    const trend =
      lakeData.trend === 'up' ? '↑' :
      lakeData.trend === 'down' ? '↓' : '→';

    document.getElementById('discharge').innerHTML =
      `<span class="trend-${lakeData.trend}">${trend}</span> ${lakeData.discharge}k`;
  } catch (err) {
    console.error('Lake JSON failed', err);
  }

  try {
    const weatherUrl =
      'https://api.open-meteo.com/v1/forecast?latitude=38.1986&longitude=-92.6385&current=temperature_2m,wind_speed_10m&temperature_unit=fahrenheit&windspeed_unit=mph';

    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    document.getElementById('airTemp').textContent =
      Math.round(weatherData.current.temperature_2m) + '°';

    document.getElementById('windSpeed').textContent =
      Math.round(weatherData.current.wind_speed_10m) + ' mph';
  } catch (err) {
    console.error('Weather failed', err);
  }
}
