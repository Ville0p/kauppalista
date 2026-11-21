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

  naytaVersio();
}

// Versio = käytössä olevan version julkaisuhetki. GitHub Pages antaa julkaisun jokaiselle tiedostolle
// julkaisuhetken Last-Modified-otsakkeeksi, joten versiota ei tarvitse päivittää käsin.
// Otsake luetaan ensin service workerin välimuistista (sama versio kuin nyt käytössä, toimii
// ilman verkkoa), muuten palvelimelta.
async function naytaVersio() {
  const kohta = document.getElementById('versio');
  const osoite = new URL('app.js', location.href).href;
  let vastaus = null;
  try { vastaus = self.caches && await caches.match(osoite); } catch {}
  if (!vastaus) {
    try { vastaus = await fetch(osoite, { method: 'HEAD' }); } catch {}
  }
  const aika = new Date(vastaus && vastaus.headers.get('Last-Modified'));
  if (isNaN(aika)) return;   // esim. paikallinen testipalvelin ilman otsaketta
  const kaksi = n => String(n).padStart(2, '0');
  kohta.textContent = `Versio ${aika.getDate()}.${aika.getMonth() + 1}.${aika.getFullYear()} `
    + `${kaksi(aika.getHours())}.${kaksi(aika.getMinutes())}`;
}
