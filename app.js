import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, onSnapshot, setDoc, updateDoc, deleteDoc, deleteField, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js';
import { tunnista, OSASTOT, MUUT } from './osastot.js';
import { kaynnistaAsetukset, kaytaAsetukset } from './asetukset.js';

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

// Sovellus ei muista listoja: listaan pääsee vain sen linkillä.
// Ainoa poikkeus: tässä välilehdessä juuri aloitettu, vielä tyhjä lista säilyy uudelleenlatauksessa
// (sessionStorage, tyhjenee kun välilehti suljetaan).
const LUONNOS = 'kauppalista-luonnos';

const $ = id => document.getElementById(id);
const lista = $('lista'), tyhja = $('tyhja'), poistaOtetut = $('poista-otetut');
const lomake = $('lomake'), kentta = $('uusi'), jaa = $('jaa'), asetuksetNappi = $('asetukset-nappi');
const paattynyt = $('paattynyt'), uusiLista = $('uusi-lista');
const aloitus = $('aloitus');
const ladataan = $('ladataan'), offline = $('offline'), ilmoitus = $('ilmoitus');

let listaId = null;      // null = aloitussivu
let luonnos = false;     // true = lista on vasta luotu eikä sitä ole vielä tallennettu
let tuotteet = {};       // { tuoteId: { nimi, otettu, luotu, osasto? } }
let listaAsetukset = {}; // listakohtaiset asetukset, esim. { piilotaEmojit: true }
let lopeta = null;       // nykyisen kuuntelijan lopetus
let tallentamatta = null; // tässä välilehdessä luotu lista, jonka tallennus odottaa palvelimen vahvistusta

const lueLuonnos = () => { try { return sessionStorage.getItem(LUONNOS); } catch { return null; } };
const asetaLuonnos = id => {
  try { id ? sessionStorage.setItem(LUONNOS, id) : sessionStorage.removeItem(LUONNOS); } catch {}
};

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
  aloitus.hidden = tila !== 'aloitus';
  paattynyt.hidden = tila !== 'paattynyt';
  ladataan.hidden = tila !== 'ladataan';
  const auki = tila === 'lista';
  lista.hidden = !auki;
  lomake.hidden = !(auki || tila === 'ladataan');
  jaa.hidden = !(auki && !luonnos);   // tyhjää luonnosta ei voi jakaa (linkki näyttäisi päättyneen listan)
  asetuksetNappi.hidden = !auki;
  if (!auki) { tyhja.hidden = true; poistaOtetut.hidden = true; }
}

// Kun näkymä vaihtuu toiseen listaan tai aloitussivulle, edellisen listan ikkunat suljetaan.
function lopetaKuuntelu() {
  if (lopeta) { lopeta(); lopeta = null; }
  for (const ikkuna of document.querySelectorAll('dialog[open]')) ikkuna.close();
}

// Lista korvaa nykyisen sivun historiassa, joten takaisin-nappi ei palaa aloitussivulle.
function asetaOsoite(id) {
  const uusi = id ? '#' + id : location.pathname;
  if ((id || '') !== location.hash.slice(1)) history.replaceState(null, '', uusi);
}

function naytaAloitus() {
  lopetaKuuntelu();
  listaId = null;
  luonnos = false;
  tuotteet = {};
  listaAsetukset = {};
  kaytaAsetukset(listaAsetukset);
  asetaOsoite(null);
  nayta('aloitus');
}

// Uusi lista saa heti oman osoitteen. Se tallennetaan, kun siihen lisätään ensimmäinen tuote.
function aloitaLuonnos(id = uusiListaId()) {
  lopetaKuuntelu();
  listaId = id;
  luonnos = true;
  tuotteet = {};
  listaAsetukset = {};   // uusi lista alkaa aina oletusasetuksilla
  kaytaAsetukset(listaAsetukset);
  asetaLuonnos(id);
  asetaOsoite(id);
  nayta('lista');
  piirra();
}

function avaa(id) {
  lopetaKuuntelu();
  tuotteet = {};
  listaId = id;
  luonnos = false;
  asetaOsoite(id);
  nayta('ladataan');

  // includeMetadataChanges: saadaan tieto myös silloin, kun palvelin vahvistaa,
  // ettei listaa ole (välimuistin tieto ei muutu, vain fromCache).
  lopeta = onSnapshot(listaRef(), { includeMetadataChanges: true }, snap => {
    if (!snap.exists()) {
      // Tässä välilehdessä juuri luotu lista, jonka tallennusta palvelin ei ole vielä vahvistanut.
      // Palvelimen vastaus "ei ole" voi ehtiä ennen tallennusta (varsinkin kun sovellus on auki
      // useammassa välilehdessä), joten se ei vielä tarkoita, että lista on päättynyt.
      if (tallentamatta === id) return;
      // Välimuistissa ei ole listaa eikä palvelimelta saatu vastausta: odotetaan yhteyttä.
      if (snap.metadata.fromCache && !snap.metadata.hasPendingWrites) return nayta('ladataan');
      // Tällä laitteella aloitettu, vielä tyhjä lista (esim. sivu ladattiin uudelleen).
      if (lueLuonnos() === id) return aloitaLuonnos(id);
      return paattyi();
    }
    const data = snap.data();
    tuotteet = data.tuotteet || {};
    if (!Object.keys(tuotteet).length) return paattyi();
    listaAsetukset = data.asetukset || {};
    kaytaAsetukset(listaAsetukset);
    nayta('lista');
    piirra();
  }, virhe);
}

function paattyi() {
  lopetaKuuntelu();
  kaytaAsetukset({});
  nayta('paattynyt');
}

function virhe(e) {
  // Säännöt estävät tyhjän, vanhentuneen tai olemattoman listan lukemisen ja muokkaamisen.
  if (e && e.code === 'permission-denied') paattyi();
  else console.error(e);
}

// --- Piirtäminen ---

// Itse valittu osasto (tallennettu listaan) voittaa automaattisen tunnistuksen.
function osastoOf(t) {
  return Number.isInteger(t.osasto) && t.osasto >= 0 && t.osasto <= MUUT ? t.osasto : tunnista(t.nimi).osasto;
}

function piirra() {
  lista.textContent = '';
  // Kaupan osastojärjestys, saman osaston sisällä lisäysjärjestys.
  const kaikki = Object.entries(tuotteet)
    .filter(([, t]) => t && typeof t.nimi === 'string')
    .map(([tid, t]) => [tid, t, osastoOf(t)])
    .sort(([, a, oa], [, b, ob]) => oa - ob || (a.luotu || 0) - (b.luotu || 0));
  const jarjestys = [...kaikki.filter(([, t]) => !t.otettu), ...kaikki.filter(([, t]) => t.otettu)];

  for (const [tid, t] of jarjestys) {
    const rivi = document.createElement('li');
    if (t.otettu) rivi.className = 'otettu';

    const nimi = document.createElement('button');
    nimi.type = 'button';
    nimi.className = 'nimi';
    // Emojin paikka on aina mukana (tyhjänäkin), jotta nimet alkavat samasta kohdasta.
    const emoji = document.createElement('span');
    emoji.className = 'emoji';
    emoji.setAttribute('aria-hidden', 'true');
    emoji.textContent = tunnista(t.nimi).emoji;
    const teksti = document.createElement('span');
    teksti.className = 'teksti';
    teksti.textContent = t.nimi;
    nimi.append(emoji, teksti);
    nimi.setAttribute('aria-pressed', t.otettu ? 'true' : 'false');
    pitkaPainallus(nimi, () => valitseOsasto(tid, t));
    nimi.addEventListener('click', () => {
      if (nimi.dataset.pitka) { delete nimi.dataset.pitka; return; }
      muokkaa({ ['tuotteet.' + tid]: { ...t, otettu: !t.otettu } });
    });

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

// --- Osaston valinta pitkällä painalluksella ---

function pitkaPainallus(el, toiminto) {
  let ajastin = null, x = 0, y = 0;
  const peru = () => { clearTimeout(ajastin); ajastin = null; };
  el.addEventListener('pointerdown', e => {
    x = e.clientX; y = e.clientY;
    delete el.dataset.pitka;
    peru();
    ajastin = setTimeout(() => {
      ajastin = null;
      el.dataset.pitka = '1';   // estää samaa painallusta merkitsemästä tuotetta otetuksi
      toiminto();
    }, 500);
  });
  el.addEventListener('pointermove', e => {
    if (Math.abs(e.clientX - x) > 10 || Math.abs(e.clientY - y) > 10) peru();
  });
  el.addEventListener('pointerup', peru);
  el.addEventListener('pointercancel', peru);
  el.addEventListener('pointerleave', peru);
  el.addEventListener('contextmenu', e => e.preventDefault());
}

const valinta = $('osastovalinta');
const valintaOtsikko = $('osastovalinta-nimi');
const valintaNapit = $('osastovalinta-napit');

function valitseOsasto(tid, t) {
  valintaOtsikko.textContent = t.nimi;
  valintaNapit.textContent = '';
  const nykyinen = osastoOf(t);
  OSASTOT.forEach((nimi, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = nimi;
    if (i === nykyinen) b.className = 'valittu';
    b.addEventListener('click', () => {
      valinta.close();
      if (i !== nykyinen) muokkaa({ ['tuotteet.' + tid]: { ...t, osasto: i } });
    });
    valintaNapit.append(b);
  });
  valinta.showModal();
}

$('osastovalinta-peru').addEventListener('click', () => valinta.close());
valinta.addEventListener('click', e => { if (e.target === valinta) valinta.close(); });

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

// Luonnos tallennetaan, kun siihen lisätään ensimmäinen tuote.
function tallennaLuonnos(ensimmainen) {
  const uusi = { tuotteet: ensimmainen, muokattu: serverTimestamp() };
  if (Object.keys(listaAsetukset).length) uusi.asetukset = listaAsetukset;
  const id = listaId;
  tallentamatta = id;
  setDoc(listaRef(), uusi)
    .then(() => { if (tallentamatta === id) tallentamatta = null; })
    .catch(e => { if (tallentamatta === id) tallentamatta = null; virhe(e); });
  asetaLuonnos(null);
  avaa(listaId);
}

lomake.addEventListener('submit', e => {
  e.preventDefault();
  if (!listaId) return;
  const nimi = kentta.value.trim().slice(0, 100);
  if (!nimi) return;
  kentta.value = '';
  const tid = uusiTuoteId();
  const tuote = { nimi, otettu: false, luotu: Date.now() };
  if (luonnos) tallennaLuonnos({ [tid]: tuote });
  else muokkaa({ ['tuotteet.' + tid]: tuote });
});

poistaOtetut.addEventListener('click', () => {
  poistaTuotteet(Object.keys(tuotteet).filter(tid => tuotteet[tid].otettu));
});

$('aloita-uusi').addEventListener('click', () => aloitaLuonnos());
uusiLista.addEventListener('click', () => aloitaLuonnos());

// --- Listakohtaiset asetukset ---

kaynnistaAsetukset(
  () => listaAsetukset,
  (avain, arvo) => {
    if (luonnos) {
      listaAsetukset = { ...listaAsetukset, [avain]: arvo };
      kaytaAsetukset(listaAsetukset);
    } else {
      muokkaa({ ['asetukset.' + avain]: arvo });
    }
  },
);

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

// Perusosoite näyttää aina aloitussivun, linkki (#tunnus) avaa listan suoraan.
function kaynnista() {
  const id = location.hash.slice(1);
  if (!id) return naytaAloitus();
  if (!kelpaaId(id)) return paattyi();
  if (id !== listaId) avaa(id);
}

addEventListener('hashchange', kaynnista);

// Aiempien versioiden laitteelle tallentamat tiedot (viimeisin lista, asetukset) poistetaan.
for (const vanha of ['kauppalista-viimeisin', 'kauppalista-asetukset', 'kauppalista-luonnos']) {
  try { localStorage.removeItem(vanha); } catch {}
}

kaynnista();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
}
