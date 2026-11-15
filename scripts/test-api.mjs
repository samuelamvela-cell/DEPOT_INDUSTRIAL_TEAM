/**
 * End-to-end API test: boots the real server on a throwaway database, then
 * exercises health, catalogue, registration, session, plots and profile.
 * No mock data: everything goes through the same Express + sql.js stack the app uses.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const PORT = 4213;
const BASE = `http://127.0.0.1:${PORT}/api`;
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agropredict-test-'));

const results = [];
const check = (name, condition, extra = '') => {
  results.push({ name, ok: Boolean(condition), extra });
  console.log(`${condition ? '✓' : '✗'} ${name}${extra ? ` — ${extra}` : ''}`);
  return Boolean(condition);
};

async function call(pathname, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${BASE}${pathname}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: res.status, json, text };
}

async function waitForServer(timeoutMs = 30_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/health`);
      if (res.ok) return true;
    } catch {
      /* not listening yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

const server = spawn(process.execPath, ['server/index.js'], {
  cwd: projectRoot,
  env: { ...process.env, PORT: String(PORT), AGROPREDICT_DATA_DIR: dataDir },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let serverLog = '';
server.stdout.on('data', (d) => (serverLog += d.toString()));
server.stderr.on('data', (d) => (serverLog += d.toString()));

let exitCode = 0;

try {
  if (!(await waitForServer())) throw new Error(`API never became ready.\n${serverLog}`);

  // 1. Health
  const health = await call('/health');
  check('health endpoint answers', health.status === 200 && health.json?.status === 'ok', `status ${health.status}`);

  // 2. Catalogue is served by the API (8 IRAD/FAO reference crops, EN + FR)
  const crops = await call('/crops');
  check('catalogue returns reference crops', crops.status === 200 && crops.json?.crops?.length >= 5, `${crops.json?.crops?.length ?? 0} crops`);
  check('catalogue carries French names', Boolean(crops.json?.crops?.[0]?.nameFr), crops.json?.crops?.[0]?.nameFr ?? 'missing');

  // 3. Unauthenticated access is refused
  const noAuth = await call('/plots');
  check('plots require a session', noAuth.status === 401, `status ${noAuth.status}`);

  // 4. Registration
  const email = `test-${Date.now()}@example.com`;
  const reg = await call('/auth/register', {
    method: 'POST',
    body: { name: 'Test Advisor', email, password: 'motdepasse123', organization: 'IRAD', region: 'Lékié' },
  });
  check('registration issues a token', reg.status === 201 && Boolean(reg.json?.token), `status ${reg.status}`);
  const token = reg.json?.token;

  // 5. Session round-trip
  const me = await call('/auth/me', { token });
  check('session returns the account', me.status === 200 && me.json?.user?.email === email);

  // 6. Profile update persists
  const patched = await call('/auth/me', { method: 'PATCH', token, body: { language: 'fr', phone: '+237 690 000 000' } });
  check('profile update persists', patched.status === 200 && patched.json?.user?.language === 'fr' && patched.json?.user?.phone === '+237 690 000 000');

  // 7. Plot creation with real coordinates
  const created = await call('/plots', {
    method: 'POST',
    token,
    body: {
      name: 'Obala North',
      surfaceHa: 3.2,
      soilType: 'Ferrallitic clay-loam',
      soilPh: 5.8,
      slopePercent: 3,
      availableWaterCapacityMm: 130,
      coordinates: { lat: 4.1708, lng: 11.5278, locality: 'Obala', region: 'Lékié' },
      previousCrop: { cropName: 'Maize', variety: 'CMS 8704', harvestDate: '2026-06-20', yieldTonnesHa: 4.2, residualNitrogenKgHa: 12 },
    },
  });
  const plot = created.json?.plot;
  check('plot creation returns a code', created.status === 201 && Boolean(plot?.code), plot?.code ?? `status ${created.status}`);

  // 8. Plot update
  const updated = await call(`/plots/${plot?.id}`, { method: 'PATCH', token, body: { surfaceHa: 4.1 } });
  check('plot update persists', updated.status === 200 && updated.json?.plot?.surfaceHa === 4.1);

  // 9. Plot is listed for this account only
  const list = await call('/plots', { token });
  check('plot appears in the account list', list.status === 200 && list.json?.plots?.length === 1);

  // 10. Duplicate registration is rejected
  const dupe = await call('/auth/register', { method: 'POST', body: { name: 'Someone', email, password: 'motdepasse123' } });
  check('duplicate email is rejected', dupe.status === 409, `status ${dupe.status}`);

  // 11. Login with the stored password
  const login = await call('/auth/login', { method: 'POST', body: { email, password: 'motdepasse123' } });
  check('login succeeds with the stored password', login.status === 200 && Boolean(login.json?.token));
  const wrong = await call('/auth/login', { method: 'POST', body: { email, password: 'wrong-password' } });
  check('wrong password is rejected', wrong.status === 401, `status ${wrong.status}`);

  // 12. Deletion
  const removed = await call(`/plots/${plot?.id}`, { method: 'DELETE', token });
  const afterDelete = await call('/plots', { token });
  check('plot deletion persists', removed.status === 204 && afterDelete.json?.plots?.length === 0);
} catch (error) {
  console.error(`\n✗ ${error.message}`);
  exitCode = 1;
} finally {
  server.kill('SIGTERM');
  fs.rmSync(dataDir, { recursive: true, force: true });
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.error(`Failed: ${failed.map((f) => f.name).join(', ')}`);
  exitCode = 1;
}
process.exit(exitCode);
