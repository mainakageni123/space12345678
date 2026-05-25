/**
 * Smoke test for PSV bookings API.
 * Usage: node scripts/test-psv-bookings.js
 * Requires: backend running on PORT (default 3001) with MongoDB connected.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const PORT = process.env.PORT || 3001;
const BASE = `http://127.0.0.1:${PORT}/api`;

const groupPayload = {
  serviceType: 'group',
  fullName: 'Test Group User',
  secondContact: 'Backup Contact',
  phoneNumber: '0712345678',
  email: 'psv-group-test@example.com',
  pickupLocation: 'Machakos',
  dropoffLocation: 'Nairobi',
  travelDate: '2026-06-01',
  groupSize: '21-35',
  tripDirection: 'one-way',
  additionalNotes: 'Automated smoke test — group'
};

const corporatePayload = {
  serviceType: 'corporate',
  fullName: 'Test Corporate User',
  secondContact: 'Emergency Contact',
  phoneNumber: '0798765432',
  email: 'psv-corp-test@example.com',
  dailyPickup: 'Kilimani',
  dailyDropoff: 'Upper Hill',
  startDate: '2026-06-01',
  scheduleDuration: '1-month',
  preferredDays: 'weekdays',
  departureTime: 'morning',
  companyName: 'Smoke Test Co',
  additionalNotes: 'Automated smoke test — corporate'
};

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { res, data };
}

async function main() {
  console.log('PSV bookings smoke test\n');

  const health = await request('GET', '/health');
  console.log(`GET /health → ${health.res.status}`, health.data);
  if (health.data.db !== 'connected') {
    console.error('\nFAIL: Database not connected. Whitelist your IP in Atlas and restart the backend.');
    process.exit(1);
  }

  const group = await request('POST', '/psv-bookings', groupPayload);
  console.log(`POST group → ${group.res.status}`);
  if (!group.res.ok) {
    console.error('FAIL group create:', group.data);
    process.exit(1);
  }
  const groupId = group.data.booking?._id;
  console.log('  Created group booking:', groupId);

  const corp = await request('POST', '/psv-bookings', corporatePayload);
  console.log(`POST corporate → ${corp.res.status}`);
  if (!corp.res.ok) {
    console.error('FAIL corporate create:', corp.data);
    process.exit(1);
  }
  const corpId = corp.data.booking?._id;
  console.log('  Created corporate booking:', corpId);

  const list = await request('GET', '/psv-bookings');
  console.log(`GET list → ${list.res.status}`);
  if (!list.res.ok || !Array.isArray(list.data)) {
    console.error('FAIL list:', list.data);
    process.exit(1);
  }
  const found = list.data.filter((b) => [groupId, corpId].includes(b._id));
  if (found.length < 2) {
    console.error('FAIL: Expected both test bookings in list, found', found.length);
    process.exit(1);
  }
  console.log(`  Listed ${list.data.length} total; found ${found.length} test record(s)`);

  for (const id of [groupId, corpId]) {
    const del = await request('DELETE', `/psv-bookings/${id}`);
    console.log(`DELETE ${id} → ${del.res.status}`);
    if (!del.res.ok) {
      console.error('FAIL delete:', del.data);
      process.exit(1);
    }
  }

  console.log('\nPASS: PSV bookings API smoke test completed.');
  process.exit(0);
}

main().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
