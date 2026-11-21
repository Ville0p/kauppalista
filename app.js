const AVAIN = 'kauppalista';

const lista = document.getElementById('lista');
const tyhja = document.getElementById('tyhja');
const poistaOtetut = document.getElementById('poista-otetut');
const lomake = document.getElementById('lomake');
const kentta = document.getElementById('uusi');

let tuotteet = lataa();

function lataa() {
  try {
    const data = JSON.parse(localStorage.getItem(AVAIN));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function tallenna() {
  try {
    localStorage.setItem(AVAIN, JSON.stringify(tuotteet));
  } catch {
    // Tallennus ei onnistu (esim. yksityinen selaus) – lista toimii silti tämän käyttökerran ajan.
  }
}

function piirra() {
  lista.textContent = '';
  // Ottamattomat ensin, otetut listan loppuun.
  const jarjestys = [...tuotteet.filter(t => !t.otettu), ...tuotteet.filter(t => t.otettu)];

  for (const t of jarjestys) {
    const rivi = document.createElement('li');
    if (t.otettu) rivi.className = 'otettu';

    const nimi = document.createElement('button');
    nimi.type = 'button';
    nimi.className = 'nimi';
    nimi.textContent = t.nimi;
    nimi.setAttribute('aria-pressed', t.otettu ? 'true' : 'false');
    nimi.addEventListener('click', () => {
      t.otettu = !t.otettu;
      paivita();
    });

    const poista = document.createElement('button');
    poista.type = 'button';
    poista.className = 'poista';
    poista.textContent = '✕';
    poista.setAttribute('aria-label', 'Poista ' + t.nimi);
    poista.addEventListener('click', () => {
      tuotteet = tuotteet.filter(x => x !== t);
      paivita();
    });

    rivi.append(nimi, poista);
    lista.append(rivi);
  }

  tyhja.hidden = tuotteet.length > 0;
  poistaOtetut.hidden = !tuotteet.some(t => t.otettu);
}

function paivita() {
  tallenna();
  piirra();
}

lomake.addEventListener('submit', e => {
  e.preventDefault();
  const nimi = kentta.value.trim();
  if (!nimi) return;
  tuotteet.push({ nimi, otettu: false });
  kentta.value = '';
  paivita();
  // Näytä juuri lisätty tuote (viimeinen ottamaton rivi).
  const ottamattomia = tuotteet.filter(t => !t.otettu).length;
  lista.children[ottamattomia - 1]?.scrollIntoView({ block: 'nearest' });
});

poistaOtetut.addEventListener('click', () => {
  tuotteet = tuotteet.filter(t => !t.otettu);
  paivita();
});

piirra();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
}
