/**
 * Site-wide API smoke test — run with backend on PORT (default 3001).
 * Usage: node scripts/test-all-apis.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const PORT = process.env.PORT || 3001;
const BASE = `http://127.0.0.1:${PORT}/api`;

const results = [];
const created = { vehicle: null, adventure: null, psv: [], messages: false };

function log(name, ok, detail = '') {
  const status = ok ? 'PASS' : 'FAIL';
  results.push({ name, ok, detail });
  console.log(`${status}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function request(method, path, body, headers = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 200) };
  }
  return { res, data };
}

async function main() {
  console.log('=== SpaceBorne site API smoke test ===\n');
  console.log(`Target: ${BASE}\n`);

  // Health
  const health = await request('GET', '/health');
  log('GET /health', health.res.status === 200 && health.data.db === 'connected', `db=${health.data.db}`);
  if (health.data.db !== 'connected') {
    console.error('\nAbort: MongoDB not connected.');
    process.exit(1);
  }

  // Vehicles
  const vehicles = await request('GET', '/vehicles');
  const vehicleList = Array.isArray(vehicles.data) ? vehicles.data : vehicles.data?.data || [];
  log('GET /vehicles', vehicles.res.status === 200, `${vehicleList.length} vehicles`);
  const vehicleId = vehicleList[0]?._id;

  // Adventures
  const adventures = await request('GET', '/adventures');
  const adventureList = Array.isArray(adventures.data)
    ? adventures.data
    : adventures.data?.adventures || [];
  log('GET /adventures', adventures.res.status === 200, `${adventureList.length} adventures`);
  const adventureId = adventureList[0]?._id;

  // Vehicle booking
  const vBooking = await request('POST', '/bookings', {
    firstName: 'Smoke',
    lastName: 'Vehicle',
    phoneNumber: '0710000001',
    email: 'smoke-vehicle@test.local',
    vehicleId: vehicleId || undefined,
    vehicleName: vehicleList[0]?.name || 'Test Vehicle',
    vehiclePrice: vehicleList[0]?.price || 5000
  });
  log('POST /bookings (vehicle)', vBooking.res.status === 201 || vBooking.res.status === 200, `status ${vBooking.res.status}`);
  if (vBooking.data?.booking?._id || vBooking.data?._id) {
    created.vehicle = vBooking.data.booking?._id || vBooking.data._id;
  }

  const vList = await request('GET', '/bookings');
  log('GET /bookings', vList.res.status === 200, `status ${vList.res.status}`);

  // Adventure booking
  if (adventureId) {
    const aBooking = await request('POST', '/adventure-bookings', {
      firstName: 'Smoke',
      lastName: 'Adventure',
      phoneNumber: '0710000002',
      email: 'smoke-adventure@test.local',
      adventureId,
      adventureTitle: adventureList[0]?.title || 'Test Trip',
      numberOfParticipants: 1,
      preferredDate: '2026-07-01'
    });
    log('POST /adventure-bookings', aBooking.res.status === 201 || aBooking.res.status === 200, `status ${aBooking.res.status}`);
    created.adventure = aBooking.data?.booking?._id || aBooking.data?._id;
  } else {
    log('POST /adventure-bookings', false, 'no adventures in DB');
  }

  const aList = await request('GET', '/adventure-bookings');
  log('GET /adventure-bookings', aList.res.status === 200, `status ${aList.res.status}`);

  // PSV group
  const psvGroup = await request('POST', '/psv-bookings', {
    serviceType: 'group',
    fullName: 'Smoke Group',
    secondContact: 'Backup',
    phoneNumber: '0710000003',
    email: 'smoke-psv-group@test.local',
    pickupLocation: 'Machakos',
    dropoffLocation: 'Nairobi',
    travelDate: '2026-08-01',
    groupSize: '8-12',
    tripDirection: 'one-way'
  });
  log('POST /psv-bookings (group)', psvGroup.res.status === 201, `status ${psvGroup.res.status}`);
  if (psvGroup.data?.booking?._id) created.psv.push(psvGroup.data.booking._id);

  // PSV corporate
  const psvCorp = await request('POST', '/psv-bookings', {
    serviceType: 'corporate',
    fullName: 'Smoke Corporate',
    secondContact: 'Backup',
    phoneNumber: '0710000004',
    email: 'smoke-psv-corp@test.local',
    dailyPickup: 'Machakos',
    dailyDropoff: 'Nairobi',
    startDate: '2026-08-01',
    scheduleDuration: '1-month',
    preferredDays: 'weekdays',
    departureTime: 'morning'
  });
  log('POST /psv-bookings (corporate)', psvCorp.res.status === 201, `status ${psvCorp.res.status}`);
  if (psvCorp.data?.booking?._id) created.psv.push(psvCorp.data.booking._id);

  const psvList = await request('GET', '/psv-bookings');
  log('GET /psv-bookings', psvList.res.status === 200 && Array.isArray(psvList.data), `count ${Array.isArray(psvList.data) ? psvList.data.length : '?'}`);

  // PSV approve one
  if (created.psv[0]) {
    const approve = await request('PATCH', `/psv-bookings/${created.psv[0]}/approve`, { approvedBy: 'SmokeTest' });
    log('PATCH /psv-bookings/:id/approve', approve.res.status === 200, `status ${approve.res.status}`);
  }

  // Messages (admin-only — 401 without token is expected)
  const msgs = await request('GET', '/messages');
  log(
    'GET /messages (admin auth required)',
    msgs.res.status === 401 || msgs.res.status === 200,
    `status ${msgs.res.status}`
  );

  // System health (if exists)
  const sys = await request('GET', '/system/health');
  log('GET /system/health', sys.res.status === 200 || sys.res.status === 404, `status ${sys.res.status}`);

  // Cleanup
  console.log('\n--- Cleanup ---');
  if (created.vehicle) {
    const d = await request('DELETE', `/bookings/${created.vehicle}`);
    log(
      'DELETE vehicle booking (admin auth required)',
      d.res.status === 200 || d.res.status === 401,
      `status ${d.res.status}`
    );
  }
  if (created.adventure) {
    const d = await request('DELETE', `/adventure-bookings/${created.adventure}`);
    log('DELETE adventure booking', d.res.status === 200, created.adventure);
  }
  for (const id of created.psv) {
    const d = await request('DELETE', `/psv-bookings/${id}`);
    log(`DELETE psv ${id}`, d.res.status === 200);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== Summary: ${results.length - failed.length}/${results.length} passed ===`);
  if (failed.length) {
    failed.forEach((f) => console.log(`  FAIL: ${f.name} ${f.detail}`));
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
