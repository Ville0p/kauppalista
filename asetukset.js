// Listakohtaiset asetukset. Ne tallentuvat jaettuun listaan (kenttä "asetukset"),
// joten muutos näkyy kaikilla saman listan käyttäjillä. Uusi lista alkaa oletusarvoilla.
//
// Uuden asetuksen lisääminen: lisää ASETUKSET-taulukkoon rivi.
//   avain   – tallennusnimi listassa
//   nimi    – teksti asetusikkunassa
//   oletus  – arvo, jos asetusta ei ole listassa muutettu
//   kayta   – mitä tehdään, kun arvo on voimassa (kutsutaan aina, kun lista päivittyy)

const ASETUKSET = [
  {
    avain: 'piilotaEmojit',
    nimi: 'Piilota emojit',
    oletus: false,
    kayta: arvo => document.body.classList.toggle('ei-emojeja', arvo),
  },
];

const arvo = (arvot, a) => (arvot && a.avain in arvot ? !!arvot[a.avain] : a.oletus);

// Ottaa listan asetukset käyttöön tällä laitteella.
export function kaytaAsetukset(arvot) {
  for (const a of ASETUKSET) a.kayta(arvo(arvot, a));
}

// lueArvot(): nykyisen listan asetukset. tallennaArvo(avain, arvo): tallentaa muutoksen listaan.
export function kaynnistaAsetukset(lueArvot, tallennaArvo) {
  const ikkuna = document.getElementById('asetukset');
  const lista = document.getElementById('asetukset-lista');

  document.getElementById('asetukset-nappi').addEventListener('click', () => {
    const nyt = lueArvot();
    lista.textContent = '';
    for (const a of ASETUKSET) {
      const rivi = document.createElement('label');
      rivi.className = 'asetus';
      const teksti = document.createElement('span');
      teksti.textContent = a.nimi;
      const valinta = document.createElement('input');
      valinta.type = 'checkbox';
      valinta.checked = arvo(nyt, a);
      valinta.addEventListener('change', () => tallennaArvo(a.avain, valinta.checked));
      rivi.append(teksti, valinta);
      lista.append(rivi);
    }
    ikkuna.showModal();
  });

  document.getElementById('asetukset-valmis').addEventListener('click', () => ikkuna.close());
  ikkuna.addEventListener('click', e => { if (e.target === ikkuna) ikkuna.close(); });
}
