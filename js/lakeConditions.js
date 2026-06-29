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

    #moonPhase {
      display: inline-flex;
      align-items: baseline;
      justify-content: center;
      gap: 6px;
      white-space: nowrap;
    }
  `;
  document.head.appendChild(style);
}

function ensureMoonPhaseStat() {
  if (document.getElementById('moonPhase')) return;

  const lakeStats = document.querySelector('.lake-stats');
  if (!lakeStats) return;

  const moonStat = document.createElement('div');
  moonStat.className = 'lake-stat';
  moonStat.innerHTML = '<div class="lake-stat-label">Moon</div><div class="lake-stat-value" id="moonPhase">--</div>';
  lakeStats.appendChild(moonStat);
}

function getMoonPhase(date = new Date()) {
  const phases = [
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent'
  ];

  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const lunarCycleDays = 29.530588853;
  const daysSinceNewMoon = (date - knownNewMoon) / 86400000;
  const moonAge = ((daysSinceNewMoon % lunarCycleDays) + lunarCycleDays) % lunarCycleDays;
  const phaseIndex = Math.floor((moonAge / lunarCycleDays) * phases.length + 0.5) % phases.length;

  return phases[phaseIndex];
}

function renderMoonPhase() {
  ensureMoonPhaseStat();

  const moonPhaseEl = document.getElementById('moonPhase');
  if (!moonPhaseEl) return;

  moonPhaseEl.textContent = getMoonPhase();
}

async function loadLakeConditions() {
  ensureLakeConditionStyles();
  renderMoonPhase();

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