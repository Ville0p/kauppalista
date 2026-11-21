// Kuukausisiivous: kerran kuukaudessa ensimmäinen sovelluksen avaus poistaa tietokannasta listat,
// joita ei ole muokattu 8 päivään. Säännöt sallivat vanhenemisluettelosta vain vanhentuneiden
// listojen haun ja tarkistavat rajan palvelimen kellosta (firestore.rules), joten laitteen väärä
// kello ei voi poistaa voimassa olevia listoja. Haetaan 8 päivän rajalla, jotta muutaman sekunnin
// edellä oleva kello ei kaada hakua (lista päättyy jo 7 päivän jälkeen).
// Siivous ei tallenna laitteelle mitään: se käyttää muistissa olevaa yhteyttä.

import { initializeApp, deleteApp } from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js';
import {
  initializeFirestore, terminate, doc, collection, query, where, limit, writeBatch, setDoc,
  getDocFromServer, getDocsFromServer, Timestamp,
} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js';
import { FIREBASE } from './kopiot.js';

const IKA_MS = 8 * 24 * 60 * 60 * 1000;
const ERAN_KOKO = 100;   // säännöt sallivat enintään 100 merkintää hakua kohden

// Kuukausi UTC-aikaa, samoin kuin säännöissä: "11.2026".
export const kuluvaKuukausi = (aika = new Date()) => (aika.getUTCMonth() + 1) + '.' + aika.getUTCFullYear();

// Palauttaa poistettujen listojen määrän tai null, jos tämän kuukauden siivous oli jo tehty.
// Virhe (haku hylätty, ei yhteyttä) keskeyttää siivouksen, eikä kuukautta merkitä tehdyksi.
export async function kuukausisiivous({ ika = IKA_MS, pakota = false } = {}) {
  if (!navigator.onLine) throw new Error('Ei yhteyttä');
  const app = initializeApp(FIREBASE, 'siivous-' + crypto.getRandomValues(new Uint32Array(1))[0]);
  const db = initializeFirestore(app, {});   // muistissa, ei offline-välimuistia
  try {
    const tila = doc(db, 'siivous', 'tila');
    const kuukausi = kuluvaKuukausi();
    if (!pakota) {
      const merkinta = await getDocFromServer(tila);
      if (merkinta.exists() && merkinta.get('kuukausi') === kuukausi) return null;
    }

    let poistettu = 0;
    for (;;) {
      const raja = Timestamp.fromMillis(Date.now() - ika);
      const vanhat = await getDocsFromServer(
        query(collection(db, 'vanhenemiset'), where('muokattu', '<=', raja), limit(ERAN_KOKO)));
      if (vanhat.empty) break;
      const era = writeBatch(db);
      for (const m of vanhat.docs) {
        era.delete(doc(db, 'listat', m.id));
        era.delete(m.ref);
      }
      await era.commit();
      poistettu += vanhat.size;
      if (vanhat.size < ERAN_KOKO) break;
    }

    await setDoc(tila, { kuukausi });
    return poistettu;
  } finally {
    await terminate(db).catch(() => {});
    await deleteApp(app).catch(() => {});
  }
}
