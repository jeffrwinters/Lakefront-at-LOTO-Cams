// ─── Lake Conditions ─────────────────────────────────────────────────────────
function ensureLakeConditionStyles() {
  if (document.getElementById('lakeConditionDynamicStyles')) return;

  const style = document.createElement('style');
  style.id = 'lakeConditionDynamicStyles';
  style.textContent = `
    #lakeLevel {
      display: inline-flex;
      align-items: baseline;
      justify-content: center;
      gap: 6px;
      white-space: nowrap;
    }

    .lake-level-trend {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 999px;
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      font-weight: 800;
      line-height: 1;
      transform: translateY(-1px);
    }

    .trend-up {
      color: #6dff9b;
      background: rgba(109,255,155,0.12);
    }

    .trend-down {
      color: #ff7474;
      background: rgba(255,116,116,0.12);
    }

    .trend-flat {
      color: #dce6ff;
      background: rgba(220,230,255,0.12);
    }

    .lake-level-value {
      display: inline-block;
    }
  `;
  document.head.appendChild(style);
}

async function loadLakeConditions() {
  ensureLakeConditionStyles();

  try {
    const lakeRes = await fetch(`lake_conditions.json?v=${Date.now()}`);
    const lakeData = await lakeRes.json();

    document.getElementById('waterTemp').textContent =
      `${lakeData.waterTemp}°`;

    const trendKey = ['up', 'down', 'flat'].includes(lakeData.trend)
      ? lakeData.trend
      : 'flat';

    const trend =
      trendKey === 'up' ? '↑' :
      trendKey === 'down' ? '↓' : '→';

    document.getElementById('lakeLevel').innerHTML =
      `<span class="lake-level-trend trend-${trendKey}" aria-label="Lake level trend ${trendKey}">${trend}</span>` +
      `<span class="lake-level-value">${Number(lakeData.lakeLevel).toFixed(2)} ft</span>`;

    document.getElementById('discharge').textContent =
      `${lakeData.discharge}k`;
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
