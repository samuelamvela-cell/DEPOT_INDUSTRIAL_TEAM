/**
 * NASA POWER client + telemetry aggregation.
 *
 * Everything returned here is computed from the POWER API response documented at
 * https://power.larc.nasa.gov/docs/services/api/ . No field is interpolated or
 * invented: if a parameter comes back as the POWER fill value (-999) the day or
 * month is dropped and the resulting aggregate is reported as partial.
 */
import { get, run } from './db.js';

const BASE = 'https://power.larc.nasa.gov/api/temporal';
const FILL = -999;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const MJ_PER_MM = 2.45; // latent heat of vaporisation, 1 mm water <=> 2.45 MJ/m²

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const DAILY_PARAMS = ['PRECTOTCORR', 'T2M', 'T2M_MAX', 'T2M_MIN', 'GWETTOP', 'GWETROOT', 'RH2M'];
const CLIM_PARAMS = ['PRECTOTCORR', 'T2M', 'EVPTRNS', 'RH2M'];

export class PowerError extends Error {
  constructor(message, status = 502, detail = null) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function request(kind, params, lat, lng, extra = '') {
  const url =
    `${BASE}/${kind}/point?parameters=${params.join(',')}&community=AG` +
    `&latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&format=JSON${extra}`;
  let res;
  try {
    res = await fetch(url, {
      headers: { 'User-Agent': 'AgroPredict/1.0 (crop rotation decision support)' },
      signal: AbortSignal.timeout(25_000),
    });
  } catch (err) {
    throw new PowerError(`NASA POWER request failed: ${err.message}`, 504);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new PowerError(`NASA POWER returned HTTP ${res.status}`, 502, body.slice(0, 300));
  }
  const json = await res.json();
  // POWER returns informational entries in `messages` (e.g. the climatology
  // baseline period); only a missing payload is a real failure.
  if (!json?.properties?.parameter) {
    const detail = Array.isArray(json?.messages) ? json.messages.join('; ') : null;
    throw new PowerError('NASA POWER returned no data for this location', 502, detail);
  }
  return json;
}

const ymd = (d) =>
  `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;

function mean(values) {
  const clean = values.filter((v) => typeof v === 'number' && isFinite(v) && v !== FILL);
  if (!clean.length) return null;
  return clean.reduce((a, b) => a + b, 0) / clean.length;
}

function sumDaily(series, dates) {
  const clean = dates.map((d) => series?.[d]).filter((v) => typeof v === 'number' && v !== FILL);
  return { total: clean.reduce((a, b) => a + b, 0), days: clean.length };
}

const round1 = (v) => (v === null || v === undefined ? null : Math.round(v * 10) / 10);

/**
 * Derive the upcoming planting window from the 25-year climatology: the first
 * month after today whose normal rainfall exceeds 100 mm and that follows a
 * month below it (i.e. the onset of a rainy season in the bimodal Centre).
 */
function seedingWindow(monthlyClimatologyMm, today) {
  const currentMonth = today.getUTCMonth(); // 0-based
  for (let offset = 1; offset <= 12; offset += 1) {
    const idx = (currentMonth + offset) % 12;
    const prevIdx = (idx + 11) % 12;
    const rain = monthlyClimatologyMm[idx];
    const prevRain = monthlyClimatologyMm[prevIdx];
    if (rain !== null && prevRain !== null && rain >= 100 && prevRain < 100) {
      const year = today.getUTCFullYear() + (currentMonth + offset >= 12 ? 1 : 0);
      const start = new Date(Date.UTC(year, idx, 1));
      const end = new Date(Date.UTC(year, idx, 14));
      return {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
        confidence: 'climatology',
        normalRainMm: Math.round(rain),
      };
    }
  }
  return null;
}

/** Months with a climatological rainfall deficit inside the wet season. */
function drySpell(monthlyClimatologyMm) {
  const wet = monthlyClimatologyMm.filter((v) => v !== null && v >= 100);
  if (!wet.length) return { warning: false, months: [] };
  const threshold = 80;
  const months = [];
  monthlyClimatologyMm.forEach((v, idx) => {
    if (v === null) return;
    const before = monthlyClimatologyMm[(idx + 11) % 12];
    const after = monthlyClimatologyMm[(idx + 1) % 12];
    if (v < threshold && before !== null && after !== null && before >= 100 && after >= 100) {
      months.push(idx + 1);
    }
  });
  return { warning: months.length > 0, months, thresholdMm: threshold };
}

export async function fetchTelemetryRaw(lat, lng) {
  const today = new Date();
  const start = new Date(today.getTime() - 365 * 24 * 3600 * 1000);

  const [daily, climatology, monthly] = await Promise.all([
    request('daily', DAILY_PARAMS, lat, lng, `&start=${ymd(start)}&end=${ymd(today)}`),
    request('climatology', CLIM_PARAMS, lat, lng),
    request('monthly', ['PRECTOTCORR', 'T2M', 'EVPTRNS'], lat, lng, `&start=${today.getUTCFullYear()}&end=${today.getUTCFullYear()}`),
  ]);

  const p = daily.properties.parameter;
  const dates = Object.keys(p.PRECTOTCORR).sort();
  const last7 = dates.slice(-7);
  const last30 = dates.slice(-30);

  const rain7 = sumDaily(p.PRECTOTCORR, last7);
  const rain30 = sumDaily(p.PRECTOTCORR, last30);

  const clim = climatology.properties.parameter;
  const climRainMm = MONTH_NAMES.map((m, i) => {
    const v = clim.PRECTOTCORR?.[m];
    return v === undefined || v === FILL ? null : v * DAYS_IN_MONTH[i];
  });
  const climEt0Mm = MONTH_NAMES.map((m, i) => {
    const v = clim.EVPTRNS?.[m];
    return v === undefined || v === FILL ? null : (v / MJ_PER_MM) * DAYS_IN_MONTH[i];
  });

  const mp = monthly.properties.parameter;
  const currentYearRain = MONTH_NAMES.map((_, i) => {
    const key = `${today.getUTCFullYear()}${String(i + 1).padStart(2, '0')}`;
    const v = mp.PRECTOTCORR?.[key];
    return v === undefined || v === FILL ? null : v * DAYS_IN_MONTH[i];
  });

  const monthlyOut = MONTH_NAMES.map((_, i) => ({
    month: i + 1,
    rainClimatologyMm: round1(climRainMm[i]),
    rainCurrentYearMm: round1(currentYearRain[i]),
    et0Mm: round1(climEt0Mm[i]),
  }));

  // 30-day anomaly versus the climatological normal for the same calendar window.
  const windowDays = last30.length;
  const monthsTouched = [...new Set(last30.map((d) => Number(d.slice(4, 6))))];
  const normalDaily =
    monthsTouched.reduce((acc, m) => acc + (clim.PRECTOTCORR?.[MONTH_NAMES[m - 1]] ?? 0), 0) /
    (monthsTouched.length || 1);
  const anomalyPercent =
    normalDaily > 0 && rain30.days > 0
      ? Math.round(((rain30.total / rain30.days - normalDaily) / normalDaily) * 100)
      : null;

  const annualClim = clim.PRECTOTCORR?.ANN ? clim.PRECTOTCORR.ANN * 365 : null;

  const elevation = daily.geometry?.coordinates?.[2] ?? null;

  return {
    location: {
      lat: Math.round(lat * 10000) / 10000,
      lng: Math.round(lng * 10000) / 10000,
      elevationM: elevation === null ? null : Math.round(elevation * 10) / 10,
    },
    observed: { start: dates[0], end: dates[dates.length - 1], days: dates.length },
    rainfall7dMm: round1(rain7.total),
    rainfall7dDays: rain7.days,
    rainfall30dMm: round1(rain30.total),
    rainfall30dDays: rain30.days,
    rainfallAnomalyPercent: anomalyPercent,
    temperatureAvgC: round1(mean(last30.map((d) => p.T2M?.[d]))),
    temperatureMaxC: round1(mean(last30.map((d) => p.T2M_MAX?.[d]))),
    temperatureMinC: round1(mean(last30.map((d) => p.T2M_MIN?.[d]))),
    humidityPercent: round1(mean(last30.map((d) => p.RH2M?.[d]))),
    soilMoistureSurfacePercent: (() => {
      const v = mean(last7.map((d) => p.GWETTOP?.[d]));
      return v === null ? null : Math.round(v * 100);
    })(),
    soilMoistureRootPercent: (() => {
      const v = mean(last7.map((d) => p.GWETROOT?.[d]));
      return v === null ? null : Math.round(v * 100);
    })(),
    monthly: monthlyOut,
    climatologyAnnualMm: round1(annualClim),
    currentYearMm: round1(currentYearRain.reduce((a, b) => a + (b ?? 0), 0)),
    nextSeedingWindow: seedingWindow(climRainMm, today),
    drySpell: drySpell(climRainMm),
    provenance: {
      provider: 'NASA POWER',
      apiVersion: daily.header?.api?.version ?? 'unknown',
      sources: daily.header?.sources ?? [],
      parameters: DAILY_PARAMS,
      resolution: '0.5° × 0.625° (MERRA-2), monthly climatology over 25 years',
      timeStandard: daily.header?.time_standard ?? 'LST',
      fetchedAt: new Date().toISOString(),
      url: 'https://power.larc.nasa.gov/',
    },
  };
}

export async function getTelemetry(lat, lng, { force = false } = {}) {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const cached = get('SELECT payload, fetched_at FROM telemetry_cache WHERE cache_key = ?', [key]);
  if (cached && !force) {
    const age = Date.now() - new Date(cached.fetched_at).getTime();
    if (age < CACHE_TTL_MS) {
      const payload = JSON.parse(cached.payload);
      return { ...payload, cache: { hit: true, ageMinutes: Math.round(age / 60000) } };
    }
  }

  const payload = await fetchTelemetryRaw(lat, lng);
  run('INSERT OR REPLACE INTO telemetry_cache (cache_key, payload, fetched_at) VALUES (?, ?, ?)', [
    key,
    JSON.stringify(payload),
    new Date().toISOString(),
  ]);
  return { ...payload, cache: { hit: false, ageMinutes: 0 } };
}
