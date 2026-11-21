// Laitekohtaiset asetukset. Tallentuvat vain tähän laitteeseen (localStorage),
// eivät jaettuun listaan.
//
// Uuden asetuksen lisääminen: lisää ASETUKSET-taulukkoon rivi.
//   avain   – tallennusnimi
//   nimi    – teksti asetusikkunassa
//   oletus  – arvo, jos asetusta ei ole vielä muutettu
//   kayta   – mitä tehdään, kun arvo on asetettu (kutsutaan myös käynnistyksessä)

const ASETUKSET = [
  {
    avain: 'piilotaEmojit',
    nimi: 'Piilota emojit',
    oletus: false,
    kayta: arvo => document.body.classList.toggle('ei-emojeja', arvo),
  },
];

const TALLENNUS = 'kauppalista-asetukset';

function lue() {
  try { return JSON.parse(localStorage.getItem(TALLENNUS)) || {}; } catch { return {}; }
}

function tallenna(arvot) {
  try { localStorage.setItem(TALLENNUS, JSON.stringify(arvot)); } catch {}
}

const arvo = (arvot, a) => (a.avain in arvot ? arvot[a.avain] : a.oletus);

export function kaynnistaAsetukset() {
  const arvot = lue();
  for (const a of ASETUKSET) a.kayta(arvo(arvot, a));

  const ikkuna = document.getElementById('asetukset');
  const lista = document.getElementById('asetukset-lista');

  document.getElementById('asetukset-nappi').addEventListener('click', () => {
    const nyt = lue();
    lista.textContent = '';
    for (const a of ASETUKSET) {
      const rivi = document.createElement('label');
      rivi.className = 'asetus';
      const teksti = document.createElement('span');
      teksti.textContent = a.nimi;
      const valinta = document.createElement('input');
      valinta.type = 'checkbox';
      valinta.checked = !!arvo(nyt, a);
      valinta.addEventListener('change', () => {
        const uudet = { ...lue(), [a.avain]: valinta.checked };
        tallenna(uudet);
        a.kayta(valinta.checked);
      });
      rivi.append(teksti, valinta);
      lista.append(rivi);
    }
    ikkuna.showModal();
  });

  document.getElementById('asetukset-valmis').addEventListener('click', () => ikkuna.close());
  ikkuna.addEventListener('click', e => { if (e.target === ikkuna) ikkuna.close(); });
}
