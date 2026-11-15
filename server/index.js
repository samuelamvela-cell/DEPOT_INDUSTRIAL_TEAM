import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { initDb, all, get, run, randomId } from './db.js';
import { CROP_CATALOG } from './catalog.js';
import { getTelemetry, PowerError } from './power.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_DIR = process.env.AGROPREDICT_DATA_DIR || path.join(__dirname, 'data');
const PORT = Number(process.env.PORT || 4000);

const ZONE_BY_REGION = {
  'Lékié': 'Bimodal forest zone (Zone V)',
  'Mfoundi': 'Bimodal forest zone (Zone V)',
  'Haute-Sanaga': 'Bimodal forest zone (Zone V)',
  'Nyong-et-Kéllé': 'Bimodal forest zone (Zone V)',
  'Mbam-et-Kim': 'Transition zone (Zone IV)',
  'Méfou-et-Afamba': 'Bimodal forest zone (Zone V)',
  'Océan': 'Humid forest zone (Zone V)',
};

function jwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const secretFile = path.join(DATA_DIR, 'jwt-secret');
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(secretFile)) {
    fs.writeFileSync(secretFile, crypto.randomBytes(48).toString('hex'), { mode: 0o600 });
  }
  return fs.readFileSync(secretFile, 'utf8').trim();
}

const SECRET = { value: null };
const secret = () => (SECRET.value ||= jwtSecret());

function seedCrops() {
  const count = get('SELECT COUNT(*) AS n FROM crops');
  if (count && count.n === CROP_CATALOG.length) return;
  run('DELETE FROM crops');
  for (const c of CROP_CATALOG) {
    run(
      `INSERT INTO crops (id, name, name_fr, variety, family, cycle_days, water_need_mm, water_need_level,
        nitrogen_fixation, yield_potential, market_price_fcfa, description, description_fr,
        stress_tolerance, stress_tolerance_fr, favorable_seasons, image_url)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        c.id, c.name, c.nameFr, c.variety, c.family, c.cycleDays, c.waterNeedMm, c.waterNeedLevel,
        c.nitrogenFixationKgHa, c.yieldPotentialKgHa, c.marketPriceFcfaKg, c.description,
        c.descriptionFr, c.stressTolerance, c.stressToleranceFr, c.favorableSeasons, c.imageUrl,
      ],
    );
  }
}

// --- serialisers -----------------------------------------------------------
const publicUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  organization: row.organization || '',
  phone: row.phone || '',
  language: row.language,
  currency: row.currency,
  surfaceUnit: row.surface_unit,
  region: row.region,
  createdAt: row.created_at,
});

const cropRow = (r) => ({
  id: r.id,
  name: r.name,
  nameFr: r.name_fr,
  variety: r.variety,
  family: r.family,
  cycleDays: r.cycle_days,
  waterNeedMm: r.water_need_mm,
  waterNeedLevel: r.water_need_level,
  nitrogenFixationKgHa: r.nitrogen_fixation,
  yieldPotentialKgHa: r.yield_potential,
  marketPriceFcfaKg: r.market_price_fcfa,
  imageUrl: r.image_url,
  description: r.description,
  descriptionFr: r.description_fr,
  favorableSeasons: [r.favorable_seasons],
  stressTolerance: r.stress_tolerance,
  stressToleranceFr: r.stress_tolerance_fr,
  _source: 'irad',
});

const plotRow = (r, user) => ({
  id: r.id,
  name: r.name,
  code: r.code,
  surfaceHa: r.surface_ha,
  soilType: r.soil_type,
  soilPh: r.soil_ph,
  slopePercent: r.slope_percent,
  availableWaterCapacityMm: r.awc_mm,
  cooperativeName: user?.organization || '',
  advisorName: user?.name || '',
  previousCrop: {
    cropName: r.prev_crop || '',
    variety: r.prev_variety || '',
    harvestDate: r.prev_harvest || '',
    yieldTonnesHa: r.prev_yield ?? 0,
    residualNitrogenKgHa: r.prev_residual_n ?? 0,
  },
  coordinates: {
    lat: r.lat,
    lng: r.lng,
    locality: r.locality,
    region: r.region,
    zoneAgroEcologique: ZONE_BY_REGION[r.region] || 'Bimodal forest zone (Zone V)',
  },
  createdAt: r.created_at,
  _source: 'etl',
});

// --- validation ------------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function fail(res, status, message, field = null) {
  return res.status(status).json({ error: { message, field } });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return fail(res, 401, 'Authentication required');
  try {
    const payload = jwt.verify(token, secret());
    const user = get('SELECT * FROM users WHERE id = ?', [payload.sub]);
    if (!user) return fail(res, 401, 'Session no longer valid');
    req.user = user;
    next();
  } catch {
    return fail(res, 401, 'Invalid or expired session');
  }
}

function sign(user) {
  return jwt.sign({ sub: user.id }, secret(), { expiresIn: '7d' });
}

// --- app -------------------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'agropredict-api', time: new Date().toISOString() });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, organization, phone, region, language } = req.body || {};
  if (!name || String(name).trim().length < 2) return fail(res, 400, 'Please enter your full name', 'name');
  if (!email || !EMAIL_RE.test(String(email).trim())) return fail(res, 400, 'Please enter a valid email address', 'email');
  if (!password || String(password).length < 8) return fail(res, 400, 'Password must be at least 8 characters', 'password');

  const normalised = String(email).trim().toLowerCase();
  if (get('SELECT id FROM users WHERE email = ?', [normalised])) {
    return fail(res, 409, 'An account already exists with this email', 'email');
  }

  const id = randomId('usr_');
  run(
    `INSERT INTO users (id, name, email, password_hash, role, organization, phone, language, currency, surface_unit, region, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      String(name).trim(),
      normalised,
      bcrypt.hashSync(String(password), 10),
      'farm_advisor',
      organization || '',
      phone || '',
      language === 'fr' ? 'fr' : 'en',
      'FCFA',
      'ha',
      region || 'Lékié',
      new Date().toISOString(),
    ],
  );
  const user = get('SELECT * FROM users WHERE id = ?', [id]);
  res.status(201).json({ token: sign(user), user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return fail(res, 400, 'Email and password are required');
  const user = get('SELECT * FROM users WHERE email = ?', [String(email).trim().toLowerCase()]);
  if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
    return fail(res, 401, 'Incorrect email or password');
  }
  res.json({ token: sign(user), user: publicUser(user) });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const plots = get('SELECT COUNT(*) AS n FROM plots WHERE user_id = ?', [req.user.id]);
  res.json({ user: { ...publicUser(req.user), plotCount: plots?.n ?? 0 } });
});

app.patch('/api/auth/me', requireAuth, (req, res) => {
  const allowed = {
    name: 'name',
    organization: 'organization',
    phone: 'phone',
    region: 'region',
    currency: 'currency',
    surfaceUnit: 'surface_unit',
    language: 'language',
  };
  const updates = [];
  const values = [];
  for (const [key, column] of Object.entries(allowed)) {
    if (req.body?.[key] !== undefined) {
      updates.push(`${column} = ?`);
      values.push(req.body[key]);
    }
  }
  if (!updates.length) return fail(res, 400, 'Nothing to update');
  values.push(req.user.id);
  run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
  res.json({ user: publicUser(get('SELECT * FROM users WHERE id = ?', [req.user.id])) });
});

app.get('/api/crops', (_req, res) => {
  res.json({ crops: all('SELECT * FROM crops ORDER BY id').map(cropRow) });
});

app.get('/api/plots', requireAuth, (req, res) => {
  const rows = all('SELECT * FROM plots WHERE user_id = ? ORDER BY created_at ASC', [req.user.id]);
  res.json({ plots: rows.map((r) => plotRow(r, req.user)) });
});

app.post('/api/plots', requireAuth, (req, res) => {
  const b = req.body || {};
  const surface = Number(b.surfaceHa);
  const lat = Number(b.coordinates?.lat);
  const lng = Number(b.coordinates?.lng);
  if (!b.name || String(b.name).trim().length < 3) return fail(res, 400, 'Plot name is too short', 'name');
  if (!isFinite(surface) || surface <= 0 || surface > 5000) return fail(res, 400, 'Surface must be between 0 and 5000 ha', 'surfaceHa');
  if (!isFinite(lat) || lat < -90 || lat > 90) return fail(res, 400, 'Latitude must be between -90 and 90', 'lat');
  if (!isFinite(lng) || lng < -180 || lng > 180) return fail(res, 400, 'Longitude must be between -180 and 180', 'lng');
  if (!b.coordinates?.locality || !String(b.coordinates.locality).trim()) return fail(res, 400, 'Locality is required', 'locality');

  const id = randomId('plot_');
  const code =
    b.code ||
    `CM-${String(b.coordinates.locality).slice(0, 3).toUpperCase()}-${String(Math.floor(Math.random() * 900) + 100)}`;

  run(
    `INSERT INTO plots (id, user_id, name, code, surface_ha, soil_type, soil_ph, slope_percent, awc_mm,
      lat, lng, locality, region, prev_crop, prev_variety, prev_harvest, prev_yield, prev_residual_n, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      req.user.id,
      String(b.name).trim(),
      code,
      surface,
      b.soilType || 'Ferrallitic clay-loam',
      Number(b.soilPh) || 6.0,
      Number(b.slopePercent) || 3,
      Number(b.availableWaterCapacityMm) || 120,
      lat,
      lng,
      String(b.coordinates.locality).trim(),
      b.coordinates.region || req.user.region,
      b.previousCrop?.cropName || null,
      b.previousCrop?.variety || null,
      b.previousCrop?.harvestDate || null,
      b.previousCrop?.yieldTonnesHa ?? null,
      b.previousCrop?.residualNitrogenKgHa ?? null,
      new Date().toISOString(),
    ],
  );
  const row = get('SELECT * FROM plots WHERE id = ?', [id]);
  res.status(201).json({ plot: plotRow(row, req.user) });
});

app.patch('/api/plots/:id', requireAuth, (req, res) => {
  const existing = get('SELECT * FROM plots WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!existing) return fail(res, 404, 'Plot not found');
  const b = req.body || {};
  const fields = [];
  const values = [];
  const set = (col, val) => {
    fields.push(`${col} = ?`);
    values.push(val);
  };
  if (b.name !== undefined) set('name', String(b.name).trim());
  if (b.surfaceHa !== undefined) set('surface_ha', Number(b.surfaceHa));
  if (b.soilType !== undefined) set('soil_type', b.soilType);
  if (b.soilPh !== undefined) set('soil_ph', Number(b.soilPh));
  if (b.slopePercent !== undefined) set('slope_percent', Number(b.slopePercent));
  if (b.availableWaterCapacityMm !== undefined) set('awc_mm', Number(b.availableWaterCapacityMm));
  if (b.coordinates?.lat !== undefined) set('lat', Number(b.coordinates.lat));
  if (b.coordinates?.lng !== undefined) set('lng', Number(b.coordinates.lng));
  if (b.coordinates?.locality !== undefined) set('locality', b.coordinates.locality);
  if (b.coordinates?.region !== undefined) set('region', b.coordinates.region);
  if (b.previousCrop) {
    set('prev_crop', b.previousCrop.cropName ?? null);
    set('prev_variety', b.previousCrop.variety ?? null);
    set('prev_harvest', b.previousCrop.harvestDate ?? null);
    set('prev_yield', b.previousCrop.yieldTonnesHa ?? null);
    set('prev_residual_n', b.previousCrop.residualNitrogenKgHa ?? null);
  }
  if (!fields.length) return fail(res, 400, 'Nothing to update');
  values.push(req.params.id, req.user.id);
  run(`UPDATE plots SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, values);
  res.json({ plot: plotRow(get('SELECT * FROM plots WHERE id = ?', [req.params.id]), req.user) });
});

app.delete('/api/plots/:id', requireAuth, (req, res) => {
  const existing = get('SELECT id FROM plots WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!existing) return fail(res, 404, 'Plot not found');
  run('DELETE FROM plots WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.status(204).end();
});

app.get('/api/telemetry', requireAuth, async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!isFinite(lat) || !isFinite(lng)) return fail(res, 400, 'lat and lng query parameters are required');
  try {
    const telemetry = await getTelemetry(lat, lng, { force: req.query.force === '1' });
    res.json({ telemetry });
  } catch (err) {
    if (err instanceof PowerError) {
      return res.status(err.status).json({
        error: { message: err.message, detail: err.detail, upstream: 'NASA POWER' },
      });
    }
    console.error('[telemetry]', err);
    return fail(res, 500, 'Unable to compute telemetry');
  }
});

// --- static SPA in production ---------------------------------------------
const dist = path.join(ROOT, 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(dist, 'index.html'));
  });
}

app.use('/api', (_req, res) => fail(res, 404, 'Unknown API route'));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[api]', err);
  fail(res, 500, 'Unexpected server error');
});

const started = await initDb();
seedCrops();
app.listen(PORT, () => {
  console.log(`AgroPredict API listening on http://127.0.0.1:${PORT}`);
  console.log(`Database: server/data/agropredict.sqlite`);
  void started;
});
