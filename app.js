import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, onSnapshot, setDoc, updateDoc, deleteDoc, deleteField, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js';

// Firebase-verkkosovelluksen asetukset. Nämä eivät ole salaisuuksia:
// tietoja suojaavat Firestoren säännöt (firestore.rules).
const FIREBASE = {
  apiKey: 'AIzaSyDHgC_SQImzcgEHFOSLMbVBHQsKCvw6gys',
  authDomain: 'kauppalista-6669.firebaseapp.com',
  projectId: 'kauppalista-6669',
  appId: '1:535568366982:web:fc6390831765392d35c007',
};

const db = initializeFirestore(initializeApp(FIREBASE), {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

const VANHA_AVAIN = 'kauppalista';      // ennen jakamista käytetty paikallinen lista
const VIIMEISIN = 'kauppalista-viimeisin';

const $ = id => document.getElementById(id);
const lista = $('lista'), tyhja = $('tyhja'), poistaOtetut = $('poista-otetut');
const lomake = $('lomake'), kentta = $('uusi'), jaa = $('jaa');
const paattynyt = $('paattynyt'), uusiLista = $('uusi-lista');
const ladataan = $('ladataan'), offline = $('offline'), ilmoitus = $('ilmoitus');

let listaId = null;      // null = uusi lista, jota ei ole vielä tallennettu
let tuotteet = {};       // { tuoteId: { nimi, otettu, luotu } }
let lopeta = null;       // nykyisen kuuntelijan lopetus

// --- Tunnukset: kryptografisesti satunnaiset ---

function satunnainen(tavuja) {
  const t = crypto.getRandomValues(new Uint8Array(tavuja));
  return btoa(String.fromCharCode(...t)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
const uusiListaId = () => satunnainen(16);   // 128 bittiä, 22 merkkiä
const uusiTuoteId = () => 't' + [...crypto.getRandomValues(new Uint8Array(8))]
  .map(b => b.toString(16).padStart(2, '0')).join('');
const kelpaaId = id => /^[A-Za-z0-9_-]{22}$/.test(id);

const listaRef = () => doc(db, 'listat', listaId);

// --- Tilat ---

function nayta(tila) {
  paattynyt.hidden = tila !== 'paattynyt';
  ladataan.hidden = tila !== 'ladataan';
  const auki = tila === 'lista';
  lista.hidden = !auki;
  lomake.hidden = tila === 'paattynyt';
  jaa.hidden = !(auki && listaId);
  if (!auki) { tyhja.hidden = true; poistaOtetut.hidden = true; }
}

function avaa(id) {
  if (lopeta) { lopeta(); lopeta = null; }
  tuotteet = {};
  listaId = id;
  if (!id) {
    history.replaceState(null, '', location.pathname);
    try { localStorage.removeItem(VIIMEISIN); } catch {}
    nayta('lista');
    piirra();
    return;
  }
  if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
  try { localStorage.setItem(VIIMEISIN, id); } catch {}
  nayta('ladataan');

  // includeMetadataChanges: saadaan tieto myös silloin, kun palvelin vahvistaa,
  // ettei listaa ole (välimuistin tieto ei muutu, vain fromCache).
  lopeta = onSnapshot(listaRef(), { includeMetadataChanges: true }, snap => {
    if (!snap.exists()) {
      // Välimuistissa ei ole listaa eikä palvelimelta saatu vastausta: odotetaan yhteyttä.
      if (snap.metadata.fromCache && !snap.metadata.hasPendingWrites) return nayta('ladataan');
      return paattyi();
    }
    tuotteet = snap.data().tuotteet || {};
    if (!Object.keys(tuotteet).length) return paattyi();
    nayta('lista');
    piirra();
  }, virhe);
}

function paattyi() {
  if (lopeta) { lopeta(); lopeta = null; }
  try { localStorage.removeItem(VIIMEISIN); } catch {}
  nayta('paattynyt');
}

function virhe(e) {
  // Säännöt estävät tyhjän, vanhentuneen tai olemattoman listan lukemisen ja muokkaamisen.
  if (e && e.code === 'permission-denied') paattyi();
  else console.error(e);
}

// --- Piirtäminen ---

function piirra() {
  lista.textContent = '';
  const kaikki = Object.entries(tuotteet)
    .filter(([, t]) => t && typeof t.nimi === 'string')
    .sort(([, a], [, b]) => (a.luotu || 0) - (b.luotu || 0));
  const jarjestys = [...kaikki.filter(([, t]) => !t.otettu), ...kaikki.filter(([, t]) => t.otettu)];

  for (const [tid, t] of jarjestys) {
    const rivi = document.createElement('li');
    if (t.otettu) rivi.className = 'otettu';

    const nimi = document.createElement('button');
    nimi.type = 'button';
    nimi.className = 'nimi';
    nimi.textContent = t.nimi;
    nimi.setAttribute('aria-pressed', t.otettu ? 'true' : 'false');
    nimi.addEventListener('click', () => muokkaa({ ['tuotteet.' + tid]: { ...t, otettu: !t.otettu } }));

    const poista = document.createElement('button');
    poista.type = 'button';
    poista.className = 'poista';
    poista.textContent = '✕';
    poista.setAttribute('aria-label', 'Poista ' + t.nimi);
    poista.addEventListener('click', () => poistaTuotteet([tid]));

    rivi.append(nimi, poista);
    lista.append(rivi);
  }

  tyhja.hidden = kaikki.length > 0;
  poistaOtetut.hidden = !kaikki.some(([, t]) => t.otettu);
}

// --- Muutokset ---
// Kirjoituksia ei odoteta: Firestore näyttää muutoksen heti ja lähettää sen,
// kun yhteys toimii (myös sovelluksen uudelleenkäynnistyksen jälkeen).

function muokkaa(kentat) {
  updateDoc(listaRef(), { ...kentat, muokattu: serverTimestamp() }).catch(virhe);
}

function poistaTuotteet(idt) {
  const jaljelle = Object.keys(tuotteet).filter(tid => !idt.includes(tid));
  if (!jaljelle.length) {
    // Viimeinen tuote poistettiin: lista päättyy.
    deleteDoc(listaRef()).catch(virhe);
    return paattyi();
  }
  muokkaa(Object.fromEntries(idt.map(tid => ['tuotteet.' + tid, deleteField()])));
}

function luoLista(tuotteetAlussa) {
  const id = uusiListaId();
  listaId = id;
  setDoc(listaRef(), { tuotteet: tuotteetAlussa, muokattu: serverTimestamp() }).catch(virhe);
  avaa(id);
}

lomake.addEventListener('submit', e => {
  e.preventDefault();
  const nimi = kentta.value.trim().slice(0, 100);
  if (!nimi) return;
  kentta.value = '';
  const tid = uusiTuoteId();
  const tuote = { nimi, otettu: false, luotu: Date.now() };
  if (listaId) muokkaa({ ['tuotteet.' + tid]: tuote });
  else luoLista({ [tid]: tuote });
});

poistaOtetut.addEventListener('click', () => {
  poistaTuotteet(Object.keys(tuotteet).filter(tid => tuotteet[tid].otettu));
});

uusiLista.addEventListener('click', () => avaa(null));

// --- Jakaminen ---

jaa.addEventListener('click', async () => {
  const url = location.origin + location.pathname + '#' + listaId;
  const puhelin = matchMedia('(pointer: coarse)').matches;
  if (puhelin && navigator.share) {
    try { await navigator.share({ title: 'Kauppalista', url }); } catch {}
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    nayta_ilmoitus('Linkki kopioitu');
  } catch {
    prompt('Kopioi linkki:', url);
  }
});

let ilmoitusAjastin;
function nayta_ilmoitus(teksti) {
  ilmoitus.textContent = teksti;
  ilmoitus.hidden = false;
  clearTimeout(ilmoitusAjastin);
  ilmoitusAjastin = setTimeout(() => { ilmoitus.hidden = true; }, 2500);
}

// --- Yhteyden tila ---

const paivitaYhteys = () => { offline.hidden = navigator.onLine; };
addEventListener('online', paivitaYhteys);
addEventListener('offline', paivitaYhteys);
paivitaYhteys();

// --- Käynnistys ---

addEventListener('hashchange', () => {
  const id = location.hash.slice(1);
  if (id !== (listaId || '')) avaa(kelpaaId(id) ? id : null);
});

function kaynnista() {
  const linkista = location.hash.slice(1);
  if (linkista) return kelpaaId(linkista) ? avaa(linkista) : paattyi();

  let viimeisin = null;
  try { viimeisin = localStorage.getItem(VIIMEISIN); } catch {}
  if (viimeisin && kelpaaId(viimeisin)) return avaa(viimeisin);

  // Siirretään aiempi paikallinen lista jaettavaksi listaksi.
  let vanhat = [];
  try { vanhat = JSON.parse(localStorage.getItem(VANHA_AVAIN)) || []; } catch {}
  try { localStorage.removeItem(VANHA_AVAIN); } catch {}
  const siirrettavat = Array.isArray(vanhat) ? vanhat.filter(t => t && typeof t.nimi === 'string') : [];
  if (siirrettavat.length) {
    const alku = Date.now();
    luoLista(Object.fromEntries(siirrettavat.map((t, i) =>
      [uusiTuoteId(), { nimi: t.nimi.slice(0, 100), otettu: !!t.otettu, luotu: alku + i }])));
    return;
  }
  avaa(null);
}

kaynnista();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
}
