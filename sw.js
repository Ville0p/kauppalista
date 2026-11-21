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
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
];
const AIKARAJA_MS = 4000;

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(VALIMUISTI).then(c => c.addAll(TIEDOSTOT)));
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(verkostaEnsin(req));
});

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
