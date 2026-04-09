#!/usr/bin/env node
/**
 * Seeds many catalog shows via POST /api/shows (catalog-service).
 * Keep `EVENT_CATEGORIES` in sync with `src/data/eventCategories.ts` for filter testing.
 *
 * Usage:
 *   npm run seed:shows
 *   SEED_SHOW_COUNT=500 npm run seed:shows
 *   CATALOG_API_URL=http://localhost:8081/api/shows npm run seed:shows
 *
 * Requires catalog-service (MongoDB). Via API gateway:
 *   CATALOG_API_URL=http://localhost:8080/api/shows
 */

/** Mirror of `frontend/src/data/eventCategories.ts` values — update both if categories change. */
const EVENT_CATEGORIES = [
  'music',
  'sports',
  'live',
  'standup',
  'theater',
  'comedy',
  'festival',
  'conference',
  'expo',
  'family',
  'kids',
  'dance',
  'opera',
  'classical',
  'electronic',
  'hiphop',
  'jazz',
  'rock',
  'pop',
  'cinema',
  'gaming',
  'esports',
  'other',
];

/** Real venues + coords so location / map filters have spread (not one dot). */
const VENUES = [
  { venueName: 'Madison Square Garden', city: 'New York', country: 'United States', address: '4 Pennsylvania Plaza', lat: 40.7505, lng: -73.9934 },
  { venueName: 'The O2 Arena', city: 'London', country: 'United Kingdom', address: 'Peninsula Square', lat: 51.5033, lng: 0.0032 },
  { venueName: 'Accor Arena', city: 'Paris', country: 'France', address: '8 Bd de Bercy', lat: 48.8387, lng: 2.3789 },
  { venueName: 'Mercedes-Benz Arena', city: 'Berlin', country: 'Germany', address: 'Mercedes-Platz 1', lat: 52.5068, lng: 13.443 },
  { venueName: 'Zénith Paris', city: 'Paris', country: 'France', address: '211 Av. Jean Jaurès', lat: 48.8944, lng: 2.3933 },
  { venueName: 'Barclays Center', city: 'New York', country: 'United States', address: '620 Atlantic Ave', lat: 40.6826, lng: -73.9754 },
  { venueName: 'Crypto.com Arena', city: 'Los Angeles', country: 'United States', address: '1111 S Figueroa St', lat: 34.043, lng: -118.2673 },
  { venueName: 'United Center', city: 'Chicago', country: 'United States', address: '1901 W Madison St', lat: 41.8807, lng: -87.6742 },
  { venueName: 'Scotiabank Arena', city: 'Toronto', country: 'Canada', address: '40 Bay St', lat: 43.6435, lng: -79.3791 },
  { venueName: 'Rod Laver Arena', city: 'Melbourne', country: 'Australia', address: 'Batman Ave', lat: -37.8225, lng: 144.9784 },
  { venueName: 'Sydney Opera House', city: 'Sydney', country: 'Australia', address: 'Bennelong Point', lat: -33.8568, lng: 151.2153 },
  { venueName: 'Tokyo Dome', city: 'Tokyo', country: 'Japan', address: '1-3-61 Koraku', lat: 35.7056, lng: 139.7519 },
  { venueName: 'Olympic Stadium', city: 'Seoul', country: 'South Korea', address: '25 Jamsil-dong', lat: 37.5158, lng: 127.0726 },
  { venueName: 'Coca-Cola Arena', city: 'Dubai', country: 'United Arab Emirates', address: 'City Walk', lat: 25.2084, lng: 55.2719 },
  { venueName: 'Tel Aviv Arena', city: 'Tel Aviv', country: 'Israel', address: 'Shaul HaMelech Blvd', lat: 32.0853, lng: 34.7818 },
  { venueName: 'Palau Sant Jordi', city: 'Barcelona', country: 'Spain', address: 'Passeig Olímpic', lat: 41.3635, lng: 2.2214 },
  { venueName: 'WiZink Center', city: 'Madrid', country: 'Spain', address: 'Av. Felipe II', lat: 40.4237, lng: -3.6842 },
  { venueName: 'Lanxess Arena', city: 'Cologne', country: 'Germany', address: 'Willy-Brandt-Platz', lat: 50.9385, lng: 6.9829 },
  { venueName: 'Ziggo Dome', city: 'Amsterdam', country: 'Netherlands', address: 'De Passage 100', lat: 52.3125, lng: 4.9441 },
  { venueName: 'Royal Albert Hall', city: 'London', country: 'United Kingdom', address: 'Kensington Gore', lat: 51.501, lng: -0.1776 },
  { venueName: 'Red Rocks Amphitheatre', city: 'Morrison', country: 'United States', address: '18300 W Alameda Pkwy', lat: 39.6654, lng: -105.2057 },
  { venueName: 'Chase Center', city: 'San Francisco', country: 'United States', address: '1 Warriors Way', lat: 37.768, lng: -122.3877 },
  { venueName: 'Nashville Municipal Auditorium', city: 'Nashville', country: 'United States', address: '417 4th Ave N', lat: 36.1627, lng: -86.7816 },
  { venueName: 'Arena Corinthians', city: 'São Paulo', country: 'Brazil', address: 'Av. Miguel Ignácio Curi', lat: -23.5455, lng: -46.4742 },
  { venueName: 'Estadio Monumental', city: 'Buenos Aires', country: 'Argentina', address: 'Av. Pres. Figueroa Alcorta', lat: -34.5454, lng: -58.4497 },
];

/**
 * Default 1000. CLI `--count=N` wins over env (so stray SEED_SHOW_COUNT=1 cannot shrink a normal run).
 * Supports `--count=500` and `--count 500`.
 */
function parseArgs(argv) {
  let count = 1000;
  const envN = Number.parseInt(process.env.SEED_SHOW_COUNT ?? '', 10);
  if (Number.isFinite(envN) && envN >= 1) count = envN;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const eq = /^--count=(\d+)$/.exec(a);
    if (eq) {
      count = Number.parseInt(eq[1], 10);
      continue;
    }
    if (a === '--count' && argv[i + 1]) {
      count = Number.parseInt(argv[i + 1], 10);
      i++;
    }
  }

  if (!Number.isFinite(count) || count < 1) count = 1000;
  return { count };
}

function toIsoUtc(d) {
  return d.toISOString();
}

/**
 * @param {number} index 0-based
 * @param {string} category
 */
function buildShowPayload(index, category) {
  const v = VENUES[index % VENUES.length];
  const dayOffset = index % 420;
  const hourBase = 10 + (index % 10);
  const minute = (index * 13) % 60;

  const start = new Date();
  start.setUTCDate(start.getUTCDate() + dayOffset);
  start.setUTCHours(hourBase, minute, 0, 0);

  const doors = new Date(start.getTime() - 2 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const basePrice = 25 + (index % 18) * 10;
  const premium = basePrice + 35;

  const title = `Filter Test ${index + 1} — ${category}`;
  const description = [
    `Synthetic load-test listing #${index + 1} for browsing filters.`,
    `Category: ${category}. Venue: ${v.venueName} in ${v.city}, ${v.country}.`,
    'Doors open two hours before start; runtime about two hours. All seats are general availability for this seed run.',
  ].join(' ');

  const coverImageUrl = `https://picsum.photos/seed/ticketing-${index}/800/1200`;

  return {
    title,
    category,
    description,
    doorsOpenTime: toIsoUtc(doors),
    startTime: toIsoUtc(start),
    endTime: toIsoUtc(end),
    coverImageUrl,
    venue: {
      venueName: v.venueName,
      city: v.city,
      country: v.country,
      address: v.address,
      geo: { lat: v.lat, lng: v.lng },
    },
    sections: [
      { section: 'A', rowCount: 4, seatsPerRow: 8, price: basePrice, currency: 'USD' },
      { section: 'B', rowCount: 3, seatsPerRow: 8, price: premium, currency: 'USD' },
    ],
  };
}

async function postShow(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 500)}`);
  }
  return res.json();
}

async function runPool(tasks, concurrency) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < tasks.length) {
      const idx = i++;
      results[idx] = await tasks[idx]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()));
  return results;
}

async function main() {
  const { count } = parseArgs(process.argv.slice(2));
  const catalogUrl =
    process.env.CATALOG_API_URL?.replace(/\/$/, '') ?? 'http://localhost:8081/api/shows';

  const envHint = process.env.SEED_SHOW_COUNT ? ` (SEED_SHOW_COUNT=${process.env.SEED_SHOW_COUNT})` : '';
  console.log(`POST ${count} shows → ${catalogUrl}${envHint}`);
  console.log('Ensure catalog-service is up and MongoDB is reachable.\n');

  const tasks = [];
  for (let i = 0; i < count; i++) {
    const category = EVENT_CATEGORIES[i % EVENT_CATEGORIES.length];
    const payload = buildShowPayload(i, category);
    tasks.push(() =>
      postShow(catalogUrl, payload).then(
        () => ({ ok: true, index: i }),
        (err) => ({ ok: false, index: i, error: err })
      )
    );
  }

  const concurrency = Number.parseInt(process.env.SEED_CONCURRENCY ?? '8', 10) || 8;
  const start = Date.now();
  const results = await runPool(tasks, concurrency);

  const failed = results.filter((r) => !r.ok);
  const ok = results.length - failed.length;
  console.log(`Done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  console.log(`Created: ${ok} / ${count}`);

  if (failed.length) {
    console.error(`Failed: ${failed.length}`);
    for (const f of failed.slice(0, 5)) {
      console.error(`  #${f.index + 1}:`, f.error?.message ?? f.error);
    }
    if (failed.length > 5) console.error(`  … and ${failed.length - 5} more`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
