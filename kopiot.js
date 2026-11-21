// Listojen offline-kopiot laitteella.
// Jokaisella listalla on oma Firestore-välimuisti (oma IndexedDB-tietokanta), jotta päättyneen
// listan kopio voidaan poistaa koskematta muihin listoihin.

import { initializeApp, deleteApp } from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  terminate, clearIndexedDbPersistence, waitForPendingWrites, getDocFromCache, doc,
} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js';

// Firebase-verkkosovelluksen asetukset. Nämä eivät ole salaisuuksia:
// tietoja suojaavat Firestoren säännöt (firestore.rules).
export const FIREBASE = {
  apiKey: 'AIzaSyDHgC_SQImzcgEHFOSLMbVBHQsKCvw6gys',
  authDomain: 'kauppalista-6669.firebaseapp.com',
  projectId: 'kauppalista-6669',
  appId: '1:535568366982:web:fc6390831765392d35c007',
};

const VIIKKO_MS = 7 * 24 * 60 * 60 * 1000;
const ALKU = 'firestore/', LOPPU = '/' + FIREBASE.projectId + '/main';   // Firestoren tietokannan nimi
export const kelpaaId = id => /^[A-Za-z0-9_-]{22}$/.test(id);

const auki = new Map();   // listan tunnus -> { app, db }
const kanava = 'BroadcastChannel' in self ? new BroadcastChannel('kauppalista') : null;

// Listan tietokanta. Firebase-sovelluksen nimi on listan tunnus, joten välimuisti on listakohtainen.
export function tietokanta(id) {
  let k = auki.get(id);
  if (!k) {
    const app = initializeApp(FIREBASE, id);
    const db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
    k = { app, db };
    auki.set(id, k);
  }
  return k.db;
}

// Päättyneen listan offline-kopio poistetaan. Muut välilehdet saavat tiedon, että lista päättyi.
export function poistaKopio(id, ilmoita = true) {
  if (ilmoita && kanava) kanava.postMessage({ paattyi: id });
  const k = auki.get(id);
  if (!k) return;
  auki.delete(id);
  return tyhjenna(id, k);
}

async function tyhjenna(id, { app, db }) {
  // Odottavat muutokset (esim. listan poisto) lähetetään ensin palvelimelle.
  // Ilman yhteyttä tämä odottaa yhteyden palaamista.
  await waitForPendingWrites(db).catch(() => {});
  await terminate(db).catch(() => {});
  await clearIndexedDbPersistence(db).catch(() => {});
  await deleteApp(app).catch(() => {});
  siivoaSelaimenMuisti(id);
  // Jos lista oli auki myös toisessa välilehdessä, sen sulkeutuva Firestore voi luoda tyhjän
  // tietokannan uudelleen. Poistetaan se vielä, kun kaikki yhteydet on suljettu.
  await new Promise(r => setTimeout(r, 2000));
  if (!auki.has(id)) {
    try { indexedDB.deleteDatabase(ALKU + id + LOPPU); } catch {}
    siivoaSelaimenMuisti(id);
  }
}

// Firestore pitää välilehtien yhteistä tilaa myös localStoragessa
// (avaimen muoto esim. firestore_targets_firestore/<tunnus>/<projekti>/_2).
function siivoaSelaimenMuisti(id) {
  try {
    for (const avain of Object.keys(localStorage)) {
      if (avain.startsWith('firestore_') && avain.includes('/' + id + '/')) localStorage.removeItem(avain);
    }
  } catch {}
}

export function kunListaPaattyy(toiminto) {
  if (kanava) kanava.onmessage = e => { if (e.data && e.data.paattyi) toiminto(e.data.paattyi); };
}

// Käynnistyksessä poistetaan päättyneiden listojen kopiot, joita ei ole avattu päättymisen jälkeen
// (esim. välilehti suljettiin). Lista on päättynyt, jos se on poistettu tai sitä ei ole muokattu 7 päivään.
export async function siivoaVanhat(nykyinen) {
  // Aiemmat versiot pitivät kaikkia listoja samassa välimuistissa.
  siivoaSelaimenMuisti('[DEFAULT]');
  if (!self.indexedDB || !indexedDB.databases) return;
  let kannat = [];
  try { kannat = await indexedDB.databases(); } catch { return; }
  for (const { name } of kannat) {
    if (!name || !name.startsWith(ALKU) || !name.endsWith(LOPPU)) continue;
    const id = name.slice(ALKU.length, -LOPPU.length);
    if (id === '[DEFAULT]') { indexedDB.deleteDatabase(name); continue; }
    if (!kelpaaId(id) || id === nykyinen() || auki.has(id)) continue;
    await tarkista(id, nykyinen);
  }
}

async function tarkista(id, nykyinen) {
  const db = tietokanta(id);
  const { app } = auki.get(id);
  let paattynyt = false;
  try {
    const snap = await getDocFromCache(doc(db, 'listat', id));
    const muokattu = snap.exists() ? snap.get('muokattu') : null;
    paattynyt = !snap.exists() || !!(muokattu && muokattu.toMillis() < Date.now() - VIIKKO_MS);
  } catch {
    // Listaa ei ole välimuistissa (esim. toinen välilehti lataa sitä parhaillaan): ei kosketa.
  }
  if (id === nykyinen()) return;   // käyttäjä avasi listan tarkistuksen aikana: tietokanta jää käyttöön
  if (paattynyt) { poistaKopio(id, false); return; }
  auki.delete(id);
  await terminate(db).catch(() => {});
  await deleteApp(app).catch(() => {});
}
