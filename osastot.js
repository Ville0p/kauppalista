// Tuotteen osasto ja emoji tuotteen nimestä. Ei verkkoa eikä tekoälyä: pelkkä sanasto.
//
// Tunnistus: suomen yhdyssanassa tuotteen kertoo viimeinen osa (kevyt|MAITO, sipuli|JAUHE),
// joten sanaa verrataan vain sanaston sanoihin sen lopussa. Jos loppuosaa ei tunneta, tuote on
// tuntematon (esim. yksisarvinen, kalakukko ilman omaa sanaston sanaa). Taivutusmuodot ja monikot
// (kiivit, kiivejä, mansikoita, leivät) muodostetaan perusmuodosta automaattisesti.
// Monisanaisesta nimestä (esim. "maito rasvaton") käytetään viimeistä tunnettua sanaa.

import { CLDR } from './emojit.js';
import { HUPISANAT } from './hupisanat.js';

// Hupisanat: tuntematon tuote, jonka nimi on täsmälleen emojin CLDR-nimi (hai, joulupukki), saa
// emojin mutta jää Muut-osastoon. Omat lisäykset ja poikkeukset voittavat CLDR:n nimet.
const HUPI = new Map(HUPISANAT.trim().split('\n').map(rivi => rivi.split('|')));
for (const [nimi, emoji] of [['dinosaurus', '🦕'], ['kissa', '🐱'], ['koira', '🐶']]) HUPI.set(nimi, emoji);

// Osaston tunnus on sen paikka tässä taulukossa. Tunnus tallentuu listaan, kun käyttäjä valitsee
// tuotteelle osaston itse, joten tunnuksia ei saa muuttaa: uusi osasto saa aina uuden tunnuksen
// taulukon loppuun, ja näyttöjärjestys määritellään erikseen (JARJESTYS).
export const OSASTOT = [
  'Hedelmät ja vihannekset',   // 0
  'Leivät',                    // 1
  'Liha ja kala',              // 2
  'Maitotuotteet ja munat',    // 3
  'Pakasteet',                 // 4
  'Kuivatuotteet',             // 5
  'Juomat',                    // 6
  'Kodintarvikkeet',           // 7
  'Muut',                      // 8
  'Hygienia ja kosmetiikka',   // 9
  'Vaatteet ja kengät',        // 10
];
export const MUUT = 8;
// Osastot kaupan järjestyksessä (listan järjestys ja osaston valinta).
export const JARJESTYS = [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 8];
const PAIKKA = new Map(JARJESTYS.map((osasto, paikka) => [osasto, paikka]));
export const osastonPaikka = osasto => PAIKKA.get(osasto) ?? PAIKKA.get(MUUT);
export const kelpaaOsasto = osasto => Number.isInteger(osasto) && PAIKKA.has(osasto);

// Sanaston rivit: 'perusmuoto' tai 'perusmuoto emoji'. Epäsäännölliset muodot vinoviivalla:
// 'olut/oluet/oluita/olutta'. Monisanainen nimi välilyönnillä: 'red_bull' (alaviiva = välilyönti).
// Emoji '-' = ei emojia (estää CLDR:n emojin). Ilman emojia sana saa CLDR:n emojin, jos sellainen on.
const SANASTO = [
  // 0 Hedelmät ja vihannekset
  `banaani 🍌|omena 🍎|päärynä 🍐|appelsiini 🍊|mandariini 🍊|klementiini 🍊|satsuma 🍊|sitruuna 🍋|lime|
   greippi|pomelo|kiivi 🥝|mango 🥭|ananas/ananakset/ananaksia 🍍|meloni 🍈|vesimeloni 🍉|hunajameloni 🍈|
   viinirypäle/viinirypäleet/viinirypäleitä 🍇|rypäle/rypäleet/rypäleitä 🍇|mansikka 🍓|mustikka 🫐|vadelma|
   puolukka|karpalo|lakka|hilla|herukka|karviainen|tyrni|kirsikka 🍒|persikka 🍑|nektariini 🍑|aprikoosi|
   luumu|granaattiomena|taateli|viikuna|kookos/kookokset/kookoksia 🥥|avokado 🥑|papaija|passionhedelmä|
   physalis|litsi|kaki|marja|hedelmä|hedelmäsalaatti -|
   peruna 🥔|bataatti 🍠|porkkana 🥕|porkkanaraaste 🥕|sipuli 🧅|kevätsipuli|ruohosipuli|valkosipuli 🧄|purjo|kurkku 🥒|
   tomaatti 🍅|paprika 🫑|chili 🌶️|jalapeno 🌶️|salaatti 🥬|salaattisekoitus 🥬|rucola|pinaatti|lehtikaali|
   kaali|kukkakaali|parsakaali 🥦|brokkoli 🥦|ruusukaali|kiinankaali|kesäkurpitsa|kurpitsa|munakoiso 🍆|
   sieni/sienet/sieniä 🍄|kantarelli 🍄|suppilovahvero 🍄|retiisi|lanttu|nauris|punajuuri/punajuuret/punajuuria|
   juures/juurekset/juureksia|selleri|palsternakka|artisokka|fenkoli|inkivääri|korianteri|basilika|persilja|
   tilli|minttu|rosmariini|timjami|yrtti|maissintähkä 🌽|parsa|raparperi|itu/idut|verso|sokeriherne|
   herneenpalko|vihannes/vihannekset/vihanneksia`,
  // 1 Leivät
  `leipä 🍞|limppu 🍞|limppa 🍞|puikula 🍞|reissumies 🍞|ruispala 🍞|sämpylä|patonki 🥖|croissant/croissantit/croissanteja 🥐|
   voisarvi 🥐|sarvi 🥐|pulla|korvapuusti|munkki 🍩|donitsi 🍩|piirakka 🥧|rinkeli 🥨|rinkilä 🥨|vesirinkeli 🥯|
   bagel/bagelit/bageleita 🥯|ciabatta|focaccia|tortilla|pita|rieska 🫓|korppu|näkkäri|kakku 🍰|leivos/leivokset/leivoksia 🧁|
   muffinsi 🧁|muffini 🧁|kuppikakku 🧁|kääretorttu|torttu|viineri|pasteija|leivonnainen|pannukakku 🥞|
   lettu 🥞|ohukainen 🥞|vohveli 🧇|kalakukko -`,
  // 2 Liha ja kala
  `liha 🥩|pihvi 🥩|entrecote 🥩|paisti|kyljys/kyljykset/kyljyksiä|kassler|kana 🍗|broileri 🍗|kalkkuna 🍗|
   koipi 🍗|siipi 🍗|filee|file|suikale|kebab|gyros|pekoni 🥓|makkara|lenkki|nakki 🌭|chorizo|salami|
   meetvursti|kinkku|leike/leikkeet/leikkeitä|leikkele|lihapulla|pyörykkä|maksa|laatikko|kiusaus|keitto|lasagne|pyttipannu|
   perunasalaatti|pastasalaatti|kanasalaatti|rosolli|sillisalaatti|
   kala 🐟|lohi/lohta/lohet/lohia 🐟|siika 🐟|silakka 🐟|ahven 🐟|kuha 🐟|hauki 🐟|muikku 🐟|turska 🐟|
   seiti 🐟|silli 🐟|makrilli 🐟|katkarapu 🦐|rapu 🦀|simpukka|kalmari 🦑|osteri 🦪|surimi|mäti`,
  // 3 Maitotuotteet ja munat
  `maito 🥛|piimä|kerma|smetana|creme|jogurtti|jukurtti|jugu|rahka|viili|vanukas/vanukkaat/vanukkaita 🍮|
   juusto 🧀|mozzarella 🧀|feta 🧀|halloumi 🧀|parmesaani 🧀|cheddar 🧀|emmental 🧀|edam 🧀|gouda 🧀|
   brie 🧀|camembert 🧀|oltermanni 🧀|aura 🧀|raejuusto 🧀|juustoraaste 🧀|koskenlaskija 🧀|atleet 🧀|
   turunmaa 🧀|polar 🧀|viola 🧀|philadelphia 🧀|castello 🧀|mascarpone 🧀|ricotta 🧀|pecorino 🧀|
   gorgonzola 🧀|havarti 🧀|maasdam 🧀|gruyere 🧀|grana_padano 🧀|apetina 🧀|
   voi/voita 🧈|levite/levitteet/levitteitä 🧈|margariini 🧈|oivariini 🧈|voimariini 🧈|keiju 🧈|flora 🧈|
   becel 🧈|benecol 🧈|bregott 🧈|rama 🧈|
   muna 🥚|kaurajuoma|soijajuoma|mantelijuoma|jogurttijuoma|maitojuoma|kefiiri|mämmi|pasha|tofu|hummus|tzatziki|
   kaurafraiche|ranskankerma|oatly|alpro`,
  // 4 Pakasteet
  `pakaste|jäätelö 🍦|jätski 🍦|pehmis 🍦|jäätelöpuikko 🍦|taikina|piparkakkutaikina|jäätelökakku 🍨|mehujää/mehujäät/mehujäitä|pizza 🍕|
   ranskalainen 🍟|ranskis/ranskikset/ranskiksia 🍟|kalapuikko|herne|hernekeitto|maissi 🌽|
   vihannessekoitus|wokkivihannes/wokkivihannekset/wokkivihanneksia|jääpala 🧊|jääkuutio 🧊|
   hampurilainen 🍔`,
  // 5 Kuivatuotteet
  `pasta 🍝|makaroni 🍝|makarooni 🍝|spagetti 🍝|penne 🍝|fusilli 🍝|tagliatelle 🍝|lasagnelevy|nuudeli|
   riisi 🍚|couscous|bulgur|kvinoa|jauho|hiutale|puuro|mysli|muro/murot|granola|sokeri|siirappi|suola 🧂|
   pippuri|mauste|jauhe|kaneli|kardemumma|curry|oregano|öljy|etikka|ketsuppi|sinappi|majoneesi|kastike/kastikkeet/kastikkeita|
   soija|pesto|liemikuutio|liemi/liemet/liemiä|fondi|säilyke/säilykkeet/säilykkeitä|murska|pyree|papu 🫘|linssi|kikherne|
   kahvi ☕|kaffe ☕|espresso ☕|mokka ☕|juhla_mokka ☕|kulta_katriina ☕|presidentti ☕|nescafe ☕|
   tee/teetä 🍵|teepussi 🍵|lipton 🍵|kaakao|keksi 🍪|oreo 🍪|domino 🍪|suklaa 🍫|suklaalevy 🍫|patukka|
   pätkis 🍫|geisha 🍫|tupla 🍫|daim 🍫|kitkat 🍫|mars 🍫|snickers 🍫|twix 🍫|karkki 🍬|makeinen 🍬|
   marianne 🍬|haribo 🍬|lakritsi|salmiakki|purukumi|tikkari 🍭|sipsi|lastu|pringles|taffel|popcorn 🍿|
   pähkinä|maapähkinä 🥜|manteli|rusina|siemen/siemenet/siemeniä|hillo|marmeladi|hunaja 🍯|nutella|
   maapähkinävoi|leivinjauhe|ruokasooda|hiiva|tonnikala -|sardiini|oliivi 🫒|kurkkusalaatti|riisikakku 🍘|
   piparkakku/piparkakut/piparkakkuja 🍪|pipari 🍪|konvehti/konvehdit/konvehteja 🍫|suklaarasia 🍫|kinuski|kiisseli|laakerinlehti|karkkipussi 🍬|sipsipussi|pääsiäismuna 🥚|suklaamuna 🥚|mignon 🥚|mignonmuna 🥚|elovena|felix|heinz`,
  // 6 Juomat
  `juoma|mehu 🧃|limonadi 🥤|limu 🥤|limsa 🥤|limppari 🥤|limpska 🥤|limska 🥤|cola 🥤|kola 🥤|kokis 🥤|
   pepsi 🥤|fanta 🥤|sprite 🥤|jaffa 🥤|pommac 🥤|vesi/vedet/vettä|vichy|novelle|
   olut/oluet/oluita/olutta 🍺|kalja 🍺|bisse 🍺|koff 🍺|olvi 🍺|lapin_kulta 🍺|sandels 🍺|
   glögi|sima|viina 🥃|kossu 🥃|koskenkorva 🥃|gambina 🥃|vodka 🥃|viski 🥃|rommi 🥃|gini 🥃|likööri 🥃|konjakki 🥃|heineken 🍺|siideri|lonkero|viini 🍷|kuohuviini 🍾|energiajuoma|red_bull|battery|smoothie|jääkahvi|jäätee`,
  // 7 Kodintarvikkeet
  `paperi 🧻|leivinpaperi -|paperirulla 🧻|serla 🧻|lambi 🧻|nenäliina|lautasliina|servetti|pesuaine|
   pesujauhe|tiskiaine|huuhteluaine|roskapussi|pussi|pakastepussi|minigrip|folio|kelmu|
   kynttilä 🕯️|tuikku 🕯️|paristo 🔋|akku 🔋|lamppu 💡|polttimo 💡|tiskiharja|tiskirätti|rätti|
   pesusieni 🧽|lautanen 🍽️|muki|kassi 🛍️|ilmapallo 🎈|kissanruoka 🐱|kissanherkku 🐱|kissanhiekka 🐱|koiranruoka 🐶|koiranherkku 🐶|koiranluu 🐶|lahjapaperi 🎁|kinkkupaperi -|
   hiekka|tulitikku|grillihiili|sytytysneste|luuta 🧹|ämpäri 🪣|pahvilaatikko|fairy|omo|ariel|finish`,
  // 8 Muut: tunnetut sanat, jotka eivät ole kaupan tuotteita (pysyvät listan lopussa)
  `joulukalenteri 🎄|kalenteri 📅|kukka 💐|ruusu 🌹|tulppaani 🌷|joulutähti 💐|hyasintti 💐|rairuoho 🌱|lehti 📰|ristikko 📰|kirja 📖|sukkapuikko 🧶|lanka 🧶|televisio 📺|tietokone 💻|playstation 🎮|nintendo 🎮|xbox 🎮|pelikonsoli 🎮|joulukuusi 🎄|koriste 🎄|lahja 🎁|kortti|sädetikku 🎇|tähtisädetikku 🎇|ilotulite 🎆|raketti 🎆|tina|serpentiini 🎉|yksisarvinen 🦄|piaru/pieru 😶‍🌫️`,
  // 9 Hygienia ja kosmetiikka
  `saippua 🧼|shampoo 🧴|hoitoaine 🧴|suihkugeeli 🧴|voide/voiteet/voiteita 🧴|aurinkovoide/aurinkovoiteet 🧴|
   seerumi|kasvovesi|meikinpoistoaine|meikinpoistoliina|kasvonaamio|hammastahna|hammasharja 🪥|hammaslanka|
   suuvesi|deodorantti|deo|antiperspirantti|partahöylä 🪒|partaterä 🪒|parranajokone 🪒|partavaahto|partavesi|
   terä|hajuvesi|vaippa|side/siteet/siteitä|pikkuhousunsuoja|tamponi|tampooni|kuukuppi|intiimipesu|kondomi|
   vanupuikko|vanulappu|vanu|laastari 🩹|käsidesi|
   meikki 💄|kajaali 💄|ripsiväri 💄|luomiväri 💄|huulipuna 💄|huulikiilto 💄|huulirasva|poskipuna 💄|
   meikkivoide 💄|peitevoide 💄|puuteri 💄|aurinkopuuteri 💄|bronzer 💄|pohjustusvoide 💄|kulmakynä 💄|
   rajauskynä 💄|kulmaväri 💄|kynsilakka 💅|kynsilakanpoistoaine 💅|kynsiviila 💅|kynsisakset|pinsetti|
   hiuslakka|hiusvaha|hiusgeeli|hiusväri|muotovaahto|hiuslenkki|hiuspinni|kampa|hiusharja|harja|naamarasva 🧴|kasvorasva 🧴|käsirasva 🧴|
   pampers|libero|gillette 🪒|colgate|pepsodent|sensodyne|nivea|rexona|dove|lumene|maybelline|loreal|oreal`,
  // 10 Vaatteet ja kengät
  `lenkkari/lenkkarit/lenkkareita 👟|lenkkitossu 👟|tennari/tennarit/tennareita 👟|tossu 👟|kenkä 👞|saapas/saappaat/saappaita 👢|sandaali 👡|
   varvassandaali 🩴|sukka 🧦|sukkahousut/sukkahousuja|housut/housuja 👖|farkut/farkkuja 👖|shortsit/shortseja 🩳|
   kalsari/kalsarit/kalsareita 🩲|bokserit/boksereita 🩲|alushousut/alushousuja|rintaliivit/rintaliivejä|toppi|
   paita 👕|kauluspaita 👔|pusero 👚|villapaita|huppari|collegepaita|takki 🧥|liivi|pipo|lippis 🧢|lippalakki 🧢|
   hattu 👒|kaulaliina 🧣|huivi 🧣|hanska 🧤|käsine 🧤|lapanen 🧤|rukkanen 🧤|mekko 👗|hame|uimapuku 🩱|
   bikinit/bikinejä 👙|pyjama|yöpaita|legginsit/legginsejä|trikoot/trikoita|body|solmio 👔|vyö`,
];

// Etuliitteet, jotka ratkaisevat osaston pääsanasta riippumatta (esim. pakastemustikka).
const ETULIITTEET = [['pakaste', 4]];

// Lyhyet sanat (esim. tee, voi, deo) tunnistetaan vain kokonaisina, ei yhdyssanan lopusta.
const LYHYT = 4;
const VOKAALIT = 'aeiouyäö';

// Astevaihtelu viimeisessä tavussa (kurkku -> kurkut, leipä -> leivät, patonki -> patongit).
const HEIKKO = [
  [/kk([aeiouyäö])$/, 'k$1'], [/pp([aeiouyäö])$/, 'p$1'], [/tt([aeiouyäö])$/, 't$1'],
  [/nt([aeiouyäö])$/, 'nn$1'], [/mp([aeiouyäö])$/, 'mm$1'], [/nk([aeiouyäö])$/, 'ng$1'],
  [/lt([aeiouyäö])$/, 'll$1'], [/rt([aeiouyäö])$/, 'rr$1'],
  [/([aeiouyäö])p([aeiouyäö])$/, '$1v$2'], [/([aeiouyäö])t([aeiouyäö])$/, '$1d$2'],
];
function heikko(sana) {
  for (const [kuvio, korvaus] of HEIKKO) if (kuvio.test(sana)) return sana.replace(kuvio, korvaus);
  return sana;
}

// Ostoslistalla tavalliset muodot: yksikkö, monikko ja partitiivi (kiivi, kiivit, kiiviä, kiivejä).
function muodot(sana) {
  const tulos = new Set([sana]);
  const lisaa = (alku, paatteet) => { for (const p of paatteet) tulos.add(alku + p); };
  const loppu = sana.at(-1), h = heikko(sana);
  if (sana.endsWith('nen')) {
    lisaa(sana.slice(0, -3), ['set', 'sia', 'siä', 'sta', 'stä']);   // makeinen -> makeiset, makeisia
    return tulos;
  }
  if (!VOKAALIT.includes(loppu)) {
    lisaa(sana, ['ia', 'iä', 'ta', 'tä', 'it', 'eja', 'ejä']);           // couscousia, hummusta, nuggetit
    return tulos;   // epäsäännölliset muodot (ananakset) sanastossa
  }
  lisaa(sana, ['t', 'a', 'ä']);
  tulos.add(h + 't');
  if (VOKAALIT.includes(sana.at(-2))) lisaa(sana, ['ta', 'tä']);        // kaakaota, suklaata, shampoota
  if (loppu === 'a' || loppu === 'ä') {
    lisaa(sana.slice(0, -1), ['oita', 'öitä', 'oja', 'öjä', 'ia', 'iä']);   // omenoita, kanoja, leipiä
    lisaa(h.slice(0, -1), ['oita', 'öitä', 'oja', 'öjä', 'ia', 'iä']);      // mansikoita
  } else if (loppu === 'i') {
    lisaa(sana.slice(0, -1), ['eja', 'ejä', 'eita', 'eitä', 'et']);       // kiivejä, banaaneja, lohet
    lisaa(h.slice(0, -1), ['eja', 'ejä', 'et']);                          // koivet, siivet
  } else if (loppu === 'e') {
    lisaa(sana, ['et', 'ita', 'itä', 'tta', 'ttä', 'ja', 'jä']);         // herneet, herneitä, limejä
  } else {
    lisaa(sana, ['ja', 'jä', 'ita', 'itä']);                             // kurkkuja, maitoja, kuutioita
  }
  return tulos;
}

// Sanakirja: muoto -> { perus, osasto, emoji }. Oma sanasto voittaa CLDR:n.
const MUODOT = new Map();
const FRAASIT = [];   // monisanaiset nimet, esim. "red bull"

const cldrEmoji = new Map(CLDR.map(([sana, emoji]) => [sana, emoji]));

function lisaaSana(kirjoitusasut, osasto, emoji, oma) {
  const [perus] = kirjoitusasut;
  if (!oma && MUODOT.has(perus)) return;
  if (oma && !emoji) emoji = kirjoitusasut.map(a => cldrEmoji.get(a)).find(Boolean) || '';
  if (emoji === '-') emoji = '';
  const tieto = { perus, osasto, emoji };
  if (perus.includes(' ')) { FRAASIT.push(tieto); return; }
  for (const asu of kirjoitusasut) {
    for (const m of muodot(asu)) {
      if (!oma && MUODOT.has(m)) continue;
      // Sama muoto kahdella sanalla: ensin sanastossa ollut säilyy (perusmuoto ensin).
      if (oma && MUODOT.has(m) && MUODOT.get(m).oma && MUODOT.get(m).perus === m) continue;
      MUODOT.set(m, { ...tieto, oma });
    }
  }
}

SANASTO.forEach((rivi, osasto) => {
  for (const kohta of rivi.split('|')) {
    const [sanat, emoji] = kohta.trim().split(/\s+/);
    if (sanat) lisaaSana(sanat.replace(/_/g, ' ').split('/'), osasto, emoji || '', true);
  }
});
for (const [sana, emoji, osasto] of CLDR) lisaaSana([sana], osasto, emoji, false);

// Sanan tunnistus sen lopusta: pisin tunnettu loppuosa voittaa (tonnikala ennen kalaa).
// Alkuosa saa olla mitä tahansa (yhdyssanan määriteosa), kunhan se on vähintään 3 kirjainta
// (muuten esim. la|kana tunnistuisi kanaksi).
function tunnistaSana(sana) {
  for (let alku = 0; alku < sana.length - 1; alku++) {
    if (alku === 1 || alku === 2) continue;
    const osuma = MUODOT.get(sana.slice(alku));
    if (!osuma) continue;
    if (alku > 0 && osuma.perus.length < LYHYT) continue;
    return osuma;
  }
  return null;
}

const valimuisti = new Map();

export function tunnista(nimi) {
  const avain = String(nimi).toLowerCase();
  if (valimuisti.has(avain)) return valimuisti.get(avain);

  const sanat = avain.replace(/[^a-zåäöéè-]+/g, ' ').replace(/[éè]/g, 'e')
    .split(/[\s-]+/).filter(s => s.length > 1);
  const lause = ' ' + sanat.join(' ') + ' ';

  let osuma = FRAASIT.find(f => lause.includes(' ' + f.perus + ' ')) || null;
  for (let i = sanat.length - 1; i >= 0 && !osuma; i--) osuma = tunnistaSana(sanat[i]);

  let tulos = osuma ? { osasto: osuma.osasto, emoji: osuma.emoji }
    : { osasto: MUUT, emoji: HUPI.get(avain.trim().replace(/\s+/g, ' ')) || '' };
  for (const [alku, osasto] of ETULIITTEET) {
    // Muut kuin ruoka (esim. pakastepussi) pysyvät omalla osastollaan.
    const eiRuokaa = [7, 9, 10].includes(tulos.osasto);
    if (!eiRuokaa && sanat.some(s => s.startsWith(alku))) tulos = { osasto, emoji: tulos.emoji };
  }
  valimuisti.set(avain, tulos);
  return tulos;
}
