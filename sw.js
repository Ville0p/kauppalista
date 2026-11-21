// Verkko ensin, välimuisti varalla:
// - Kun yhteys toimii, sovellus hakee aina uusimmat tiedostot palvelimelta,
//   joten päivitykset tulevat puhelimeen itsestään eikä versionumeroita tarvita.
// - Kun yhteyttä ei ole (tai se on hyvin hidas), käytetään viimeksi tallennettua versiota.

const VALIMUISTI = 'kauppalista';
const TIEDOSTOT = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'osastot.js',
  'asetukset.js',
  'kopiot.js',
  'fonts/carlito-400.woff2',
  'fonts/carlito-700.woff2',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
];
// Firebasen kirjasto on versioitu, joten sen tiedostot eivät muutu: välimuisti ensin.
const FIREBASE = 'https://www.gstatic.com/firebasejs/';
const FIREBASE_TIEDOSTOT = [
  FIREBASE + '13.2.0/firebase-app.js',
  FIREBASE + '13.2.0/firebase-firestore.js',
];
const AIKARAJA_MS = 4000;

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(VALIMUISTI).then(c => c.addAll([...TIEDOSTOT, ...FIREBASE_TIEDOSTOT])));
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.url.startsWith(FIREBASE)) return e.respondWith(valimuististaEnsin(req));
  if (new URL(req.url).origin !== location.origin) return;
  e.respondWith(verkostaEnsin(req));
});

async function valimuististaEnsin(req) {
  const cache = await caches.open(VALIMUISTI);
  const tallennettu = await cache.match(req);
  if (tallennettu) return tallennettu;
  const vastaus = await fetch(req);
  if (vastaus.ok) cache.put(req, vastaus.clone());
  return vastaus;
}

async function verkostaEnsin(req) {
  const cache = await caches.open(VALIMUISTI);

  // Haku jatkuu taustalla aikarajan jälkeenkin ja päivittää välimuistin, kun se valmistuu.
  const verkko = fetch(req.url, { cache: 'no-cache' }).then(vastaus => {
    if (vastaus.ok) cache.put(req, vastaus.clone());
    return vastaus;
  });
  verkko.catch(() => {});

  try {
    return await Promise.race([
      verkko,
      new Promise((_, hylkaa) => setTimeout(hylkaa, AIKARAJA_MS)),
    ]);
  } catch {
    const tallennettu =
      (await cache.match(req, { ignoreSearch: true })) ||
      (req.mode === 'navigate' && (await cache.match('./')));
    return tallennettu || verkko;
  }
}
