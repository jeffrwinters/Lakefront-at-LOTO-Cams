// ─── Lake Conditions ─────────────────────────────────────────────────────────
function ensureLakeConditionStyles() {
  if (document.getElementById('lakeConditionDynamicStyles')) return;

  const style = document.createElement('style');
  style.id = 'lakeConditionDynamicStyles';
  style.textContent = `
    #lakeLevel { display: inline-flex; align-items: baseline; justify-content: center; gap: 6px; white-space: nowrap; }
    .lake-level-trend { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 999px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 800; line-height: 1; transform: translateY(-1px); }
    .trend-up { color: #6dff9b; background: rgba(109,255,155,0.12); }
    .trend-down { color: #ff7474; background: rgba(255,116,116,0.12); }
    .trend-flat { color: #dce6ff; background: rgba(220,230,255,0.12); }
    .lake-level-value { display: inline-block; }
    .sun-stat, .moon-stat { min-width: 220px; }
    .sun-times { display: grid; gap: 8px; justify-content: center; margin-top: 4px; }
    .sun-time-row { display: grid; grid-template-columns: 18px auto; align-items: center; gap: 10px; color: #fff; font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 1px; line-height: 1; white-space: nowrap; }
    .sun-arrow { font-family: 'DM Sans', sans-serif; font-size: 22px; font-weight: 800; line-height: 1; }
    .sunrise-arrow { color: #6dff9b; }
    .sunset-arrow { color: #ffb86b; }
    .moon-stat { grid-column: 1 / -1; padding: 18px 22px; }
    .moon-widget { display: grid; grid-template-columns: auto minmax(180px, 1fr) auto; align-items: center; justify-content: center; gap: 24px; margin-top: 4px; width: 100%; }
    .moon-disk { width: 92px; height: 92px; flex: 0 0 92px; border: 1px solid rgba(220,230,255,0.65); border-radius: 50%; background: radial-gradient(circle at 38% 32%, rgba(255,255,255,0.92) 0 2px, transparent 3px), radial-gradient(circle at 62% 44%, rgba(180,190,205,0.7) 0 5px, transparent 7px), radial-gradient(circle at 43% 62%, rgba(160,170,185,0.65) 0 4px, transparent 6px), radial-gradient(circle at 58% 70%, rgba(255,255,255,0.72) 0 3px, transparent 5px), radial-gradient(circle at 50% 50%, #f3f6fb 0%, #c8d0dc 48%, #8f9bab 100%); box-shadow: 0 0 0 10px rgba(220,230,255,0.05), inset 0 0 18px rgba(0,0,0,0.22); overflow: hidden; position: relative; }
    .moon-disk::after { content: ''; position: absolute; inset: -2px; border-radius: 50%; background: rgba(2,8,18,0.82); transform: translateX(var(--moon-shadow-x, 0%)) scaleX(var(--moon-shadow-scale, 1)); transform-origin: center; opacity: var(--moon-shadow-opacity, 0); }
    .moon-details { text-align: left; line-height: 1.15; }
    .moon-phase-name { color: #fff; font-size: 24px; font-weight: 700; margin-bottom: 8px; }
    .moon-light { color: var(--muted); font-size: 16px; margin-bottom: 12px; white-space: nowrap; }
    .moon-next-label, .moon-time-label { color: var(--muted); font-size: 13px; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap; }
    .moon-next-date, .moon-time-value { color: #dce6ff; font-size: 20px; font-weight: 700; white-space: nowrap; }
    .moon-times { border-left: 1px solid rgba(220,230,255,0.16); display: grid; gap: 14px; min-width: 92px; padding-left: 22px; text-align: left; }
    .moon-time-value { font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px; color: #fff; }
    @media (min-width: 701px) { .lake-stats { grid-template-columns: repeat(3, minmax(120px, 1fr)); } }
    @media (max-width: 640px) { .moon-stat { padding: 18px 14px; } .moon-widget { grid-template-columns: auto 1fr; gap: 14px; } .moon-disk { width: 76px; height: 76px; flex-basis: 76px; } .moon-phase-name { font-size: 21px; } .moon-light { font-size: 15px; } .moon-times { border-left: 0; border-top: 1px solid rgba(220,230,255,0.16); grid-column: 1 / -1; grid-template-columns: repeat(2, 1fr); padding-left: 0; padding-top: 14px; text-align: center; } }
  `;
  document.head.appendChild(style);
}

function ensureSunStat() {
  if (document.getElementById('sunTimes')) return;
  const lakeStats = document.querySelector('.lake-stats');
  if (!lakeStats) return;
  const sunStat = document.createElement('div');
  sunStat.className = 'lake-stat sun-stat';
  sunStat.innerHTML = '<div class="lake-stat-label">Sunrise / Sunset</div><div class="sun-times" id="sunTimes"><div class="sun-time-row"><span class="sun-arrow sunrise-arrow" aria-hidden="true">↑</span><span id="sunriseTime">--</span></div><div class="sun-time-row"><span class="sun-arrow sunset-arrow" aria-hidden="true">↓</span><span id="sunsetTime">--</span></div></div>';
  lakeStats.appendChild(sunStat);
}

function ensureMoonPhaseStat() {
  if (document.getElementById('moonPhase')) return;
  const lakeStats = document.querySelector('.lake-stats');
  if (!lakeStats) return;
  const moonStat = document.createElement('div');
  moonStat.className = 'lake-stat moon-stat';
  moonStat.innerHTML = '<div class="lake-stat-label">Moon</div><div class="moon-widget" id="moonPhase"><div class="moon-disk" id="moonDisk"></div><div class="moon-details"><div class="moon-phase-name" id="moonPhaseName">--</div><div class="moon-light" id="moonLight">Moonlight --</div><div class="moon-next-label">Next Full Moon</div><div class="moon-next-date" id="nextFullMoon">--</div></div><div class="moon-times"><div><div class="moon-time-label">Moonrise</div><div class="moon-time-value" id="moonriseTime">--</div></div><div><div class="moon-time-label">Moonset</div><div class="moon-time-value" id="moonsetTime">--</div></div></div></div>';
  lakeStats.appendChild(moonStat);
}

function getMoonPhase(date = new Date()) {
  const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const lunarCycleDays = 29.530588853;
  const daysSinceNewMoon = (date - knownNewMoon) / 86400000;
  const moonAge = ((daysSinceNewMoon % lunarCycleDays) + lunarCycleDays) % lunarCycleDays;
  const phaseIndex = Math.floor((moonAge / lunarCycleDays) * phases.length + 0.5) % phases.length;
  const illumination = (1 - Math.cos((2 * Math.PI * moonAge) / lunarCycleDays)) / 2;
  const waxing = moonAge < lunarCycleDays / 2;
  return { name: phases[phaseIndex], age: moonAge, illumination, waxing, cycleDays: lunarCycleDays };
}

function getNextFullMoon(date = new Date()) {
  const phase = getMoonPhase(date);
  const fullMoonAge = phase.cycleDays / 2;
  const daysUntilFull = phase.age <= fullMoonAge ? fullMoonAge - phase.age : phase.cycleDays - phase.age + fullMoonAge;
  return new Date(date.getTime() + daysUntilFull * 86400000);
}

function formatMoonDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatLakeTime(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' });
}

function parseOpenMeteoTime(value) {
  if (!value) return null;
  return new Date(value.length === 16 ? `${value}:00` : value);
}

function renderSunTimes(daily) {
  ensureSunStat();
  const sunriseEl = document.getElementById('sunriseTime');
  const sunsetEl = document.getElementById('sunsetTime');
  if (!sunriseEl || !sunsetEl || !daily?.sunrise?.[0] || !daily?.sunset?.[0]) return;
  const sunrise = parseOpenMeteoTime(daily.sunrise[0]);
  const sunset = parseOpenMeteoTime(daily.sunset[0]);
  if (!sunrise || !sunset) return;
  sunriseEl.textContent = formatLakeTime(sunrise);
  sunsetEl.textContent = formatLakeTime(sunset);
  document.getElementById('sunTimes')?.setAttribute('aria-label', `Sunrise ${sunriseEl.textContent}. Sunset ${sunsetEl.textContent}.`);
}

function getApproxMoonRiseSet(date = new Date(), daily) {
  const phase = getMoonPhase(date);
  const sunrise = parseOpenMeteoTime(daily?.sunrise?.[0]);
  const sunset = parseOpenMeteoTime(daily?.sunset?.[0]);
  const baseDate = new Date(date);
  baseDate.setHours(0, 0, 0, 0);
  let moonriseMinutes = (phase.age * 50.47) % 1440;
  if (sunrise && sunset) {
    const sunriseMinutes = sunrise.getHours() * 60 + sunrise.getMinutes();
    const sunsetMinutes = sunset.getHours() * 60 + sunset.getMinutes();
    if (phase.name === 'New Moon') moonriseMinutes = sunriseMinutes;
    if (phase.name === 'First Quarter') moonriseMinutes = Math.round((sunriseMinutes + sunsetMinutes) / 2);
    if (phase.name === 'Full Moon') moonriseMinutes = sunsetMinutes;
    if (phase.name === 'Last Quarter') moonriseMinutes = 0;
  }
  const moonsetMinutes = (moonriseMinutes + 745) % 1440;
  return {
    moonrise: new Date(baseDate.getTime() + Math.round(moonriseMinutes) * 60000),
    moonset: new Date(baseDate.getTime() + Math.round(moonsetMinutes) * 60000)
  };
}

function renderMoonPhase(daily) {
  ensureMoonPhaseStat();
  const moonWidgetEl = document.getElementById('moonPhase');
  const moonDiskEl = document.getElementById('moonDisk');
  const phaseNameEl = document.getElementById('moonPhaseName');
  const moonLightEl = document.getElementById('moonLight');
  const nextFullMoonEl = document.getElementById('nextFullMoon');
  const moonriseEl = document.getElementById('moonriseTime');
  const moonsetEl = document.getElementById('moonsetTime');
  if (!moonWidgetEl || !moonDiskEl || !phaseNameEl || !moonLightEl || !nextFullMoonEl) return;
  const phase = getMoonPhase();
  const lightPercent = Math.round(phase.illumination * 100);
  const shadowOpacity = 1 - phase.illumination;
  const shadowScale = 0.25 + Math.abs(0.5 - phase.illumination) * 1.7;
  const shadowX = phase.waxing ? '-36%' : '36%';
  moonDiskEl.style.setProperty('--moon-shadow-opacity', shadowOpacity.toFixed(2));
  moonDiskEl.style.setProperty('--moon-shadow-scale', shadowScale.toFixed(2));
  moonDiskEl.style.setProperty('--moon-shadow-x', shadowX);
  phaseNameEl.textContent = phase.name;
  moonLightEl.textContent = `Moonlight ${lightPercent}%`;
  nextFullMoonEl.textContent = formatMoonDate(getNextFullMoon());
  if (moonriseEl && moonsetEl) {
    const moonTimes = getApproxMoonRiseSet(new Date(), daily);
    moonriseEl.textContent = formatLakeTime(moonTimes.moonrise);
    moonsetEl.textContent = formatLakeTime(moonTimes.moonset);
  }
  moonWidgetEl.setAttribute('aria-label', `Moon phase: ${phase.name}. Moonlight ${lightPercent} percent. Next full moon ${nextFullMoonEl.textContent}.`);
}

async function loadLakeConditions() {
  ensureLakeConditionStyles();
  ensureSunStat();
  renderMoonPhase();

  try {
    const lakeRes = await fetch(`lake_conditions.json?v=${Date.now()}`);
    const lakeData = await lakeRes.json();
    document.getElementById('waterTemp').textContent = `${lakeData.waterTemp}°`;
    const trendKey = ['up', 'down', 'flat'].includes(lakeData.trend) ? lakeData.trend : 'flat';
    const trend = trendKey === 'up' ? '↑' : trendKey === 'down' ? '↓' : '→';
    document.getElementById('lakeLevel').innerHTML = `<span class="lake-level-trend trend-${trendKey}" aria-label="Lake level trend ${trendKey}">${trend}</span>` + `<span class="lake-level-value">${Number(lakeData.lakeLevel).toFixed(2)} ft</span>`;
    document.getElementById('discharge').textContent = `${lakeData.discharge}k`;
  } catch (err) {
    console.error('Lake JSON failed', err);
  }

  try {
    const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=38.1986&longitude=-92.6385&current=temperature_2m,wind_speed_10m&daily=sunrise,sunset&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=America%2FChicago&forecast_days=1';
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();
    document.getElementById('airTemp').textContent = Math.round(weatherData.current.temperature_2m) + '°';
    document.getElementById('windSpeed').textContent = Math.round(weatherData.current.wind_speed_10m) + ' mph';
    renderSunTimes(weatherData.daily);
    renderMoonPhase(weatherData.daily);
  } catch (err) {
    console.error('Weather failed', err);
  }
}
