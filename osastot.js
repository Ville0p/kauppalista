// Tuotteen osasto ja emoji tuotteen nimestä. Ei verkkoa eikä tekoälyä: pelkkä sanasto.
//
// Tunnistus: nimen jokaisesta sanasta etsitään sanaston sanoja. Suomen yhdyssanoissa
// pääsana on lopussa (kevyt|MAITO, maito|SUKLAA), joten osuma sanan lopussa voittaa
// osuman sanan alussa tai keskellä. Tasapelissä viimeinen sana ja pidempi osuma voittavat.

export const OSASTOT = [
  'Hedelmät ja vihannekset',
  'Leivät',
  'Liha ja kala',
  'Maitotuotteet ja munat',
  'Pakasteet',
  'Kuivatuotteet',
  'Juomat',
  'Kodintarvikkeet',
  'Muut',
];
export const MUUT = OSASTOT.length - 1;

// Sanaston rivit: 'sana' tai 'sana emoji'. Sanat ovat perusmuotoja tai vartaloita
// (esim. 'tomaat' tunnistaa sekä tomaatin että tomaatit).
const SANASTO = [
  // 0 Hedelmät ja vihannekset
  `banaan 🍌|omena 🍎|omeno 🍎|päärynä 🍐|päärynö 🍐|appelsiin 🍊|mandariin 🍊|klementiin 🍊|sitruun 🍋|lime|limet|
   viinirypäle 🍇|viinirypäl 🍇|rypäle 🍇|rypäl 🍇|mango 🥭|ananas 🍍|kiwi 🥝|meloni 🍈|vesimeloni 🍉|hunajameloni 🍈|
   mansikka 🍓|mansikat 🍓|mansiko 🍓|mustikka 🫐|mustikat 🫐|mustiko 🫐|vadelma|vadelmi|puolukka|puolukat|karpalo|
   lakka|herukka|herukat|kirsikka 🍒|kirsikat 🍒|kirsiko 🍒|persikka 🍑|persikat 🍑|persiko 🍑|nektariini|luumu|granaattiomena|greippi|greipi|taateli|viikuna|kookos 🥥|avokado 🥑|
   peruna 🥔|perunoi 🥔|porkkana 🥕|porkkano 🥕|sipuli 🧅|sipulei 🧅|valkosipuli 🧄|punasipuli 🧅|kevätsipuli|ruohosipuli|
   kurkku 🥒|kurkut 🥒|kurkku|tomaatti 🍅|tomaat 🍅|paprika 🫑|paprikoi 🫑|salaatti 🥬|salaat 🥬|jäävuorisalaatti 🥬|rucola|
   kaali|kerä|kukkakaali|parsakaali 🥦|brokkoli 🥦|ruusukaali|lehtikaali|kesäkurpitsa|kurpitsa|munakoiso 🍆|
   sieni 🍄|sienet 🍄|herkkusieni 🍄|kantarelli|pinaatti|retiisi|lanttu|nauris|punajuuri|punajuur|selleri|purjo|
   inkivääri|chili 🌶️|basilika|persilja|tilli|korianteri|minttu|maissintähkä 🌽|parsa|raparperi|idut|versot|
   hedelmä|hedelm|vihannes|vihannek|marja|marjat|yrtti|yrtit`,
  // 1 Leivät
  `leipä 🍞|leivä 🍞|leipi 🍞|ruisleipä 🍞|paahtoleipä 🍞|näkkileipä|limppu|sämpylä|sämpylö|patonki 🥖|patong 🥖|
   croissant 🥐|sarvi 🥐|pulla|pullat|korvapuusti|munkki|munki|donitsi 🍩|piirakka|piiraka|karjalanpiirakka|
   rinkeli|ciabatta|focaccia|tortilla|pita|hampurilaissämpylä|hodarisämpylä|kakku 🍰|kakut 🍰|leivonnai|pannukakku 🥞`,
  // 2 Liha ja kala
  `liha 🥩|jauheliha 🥩|naudanliha 🥩|sianliha 🥩|pihvi 🥩|kana 🍗|kanat 🍗|broileri 🍗|broiler 🍗|kalkkuna 🍗|
   koipi 🍗|koivet 🍗|siipi 🍗|siivet 🍗|rintafilee|filee|fileet|suikale|suikalee|kassler|kyljys|paisti|
   pekoni 🥓|makkara|makkaro|nakki|nakit|nakkeja|grillimakkara|kinkku|kinkut|leikkele|leikkelee|leike|leikkeet|salami|meetvursti|
   kebab|lihapulla|lihapullat|pyörykkä|pyöryk|maksa|maksamakkara|maksalaatikko|lihapiirakka|
   kala 🐟|kalat 🐟|lohi 🐟|lohta 🐟|lohifilee 🐟|kirjolohi 🐟|silakka 🐟|siika 🐟|ahven 🐟|kuha 🐟|turska 🐟|
   seiti 🐟|muikku 🐟|silli 🐟|katkarapu 🦐|katkarav 🦐|rapu 🦀|ravut 🦀|simpukka|surimi|mäti`,
  // 3 Maitotuotteet ja munat
  `maito 🥛|maidot 🥛|piimä|kerma|kermat|ruokakerma|kuohukerma|vispikerma|kermaviili|smetana|creme|jogurtti|jogurt|
   rahka|rahkat|viili|viilit|vanukas|vanukkaa|välipalarahka|kaurajuoma|soijajuoma|mantelijuoma|
   juusto 🧀|juustot 🧀|juuston 🧀|mozzarella 🧀|fetajuusto 🧀|feta 🧀|halloumi 🧀|parmesaani 🧀|raejuusto|
   tuorejuusto 🧀|sulatejuusto 🧀|voi 🧈|levite|margariini|oivariini|muna 🥚|munat 🥚|kananmuna 🥚|kananmunat 🥚|
   tofu|hummus|tzatziki|kaurafraiche|ranskankerma`,
  // 4 Pakasteet
  `pakaste|pakastettu|jäätelö 🍦|jäätelöt 🍦|jäätelöö 🍦|mehujää|pizza 🍕|pizzat 🍕|ranskalai 🍟|ranskikset 🍟|
   kalapuikko|kalapuikot|herne|herneet|hernekeitto|maissi 🌽|vihannessekoitus|wokkivihannekset|jääpala`,
  // 5 Kuivatuotteet
  `pasta 🍝|pastat 🍝|makaroni 🍝|spagetti 🍝|nuudeli|nuudelit|riisi 🍚|jauho|jauhot|vehnäjauho|ruisjauho|
   hiutale|kaurahiutale|puuro|mysli|muro|murot|granola|sokeri|tomusokeri|suola 🧂|pippuri|mauste|maustee|kaneli|
   öljy|rypsiöljy|oliiviöljy|etikka|ketsuppi|sinappi|majoneesi|kastike|kastikkee|soija|pesto|liemikuutio|liemi|fondi|
   säilyke|säilykkee|tölkki|murska|tomaattimurska|tomaattipyree|pyree|papu 🫘|pavut 🫘|linssi|linssit|kikherne|
   kahvi ☕|kahvit ☕|tee 🍵|teet 🍵|teepussi 🍵|teepussit 🍵|kaakao|keksi 🍪|keksit 🍪|keksejä 🍪|suklaa 🍫|suklaat 🍫|karkki 🍬|karkit 🍬|
   makeinen 🍬|makeiset 🍬|lakritsi|purukumi|sipsi|sipsit|popcorn 🍿|pähkinä|pähkinät|maapähkinä 🥜|manteli|
   rusina|rusinat|siemen|siemenet|hillo|hunaja 🍯|siirappi|leivinjauhe|ruokasooda|vaniljasokeri|hiiva|
   tonnikala|sardiini|oliivi|oliivit|kurkkusalaatti|tortillalastu|näkkäri|riisikakku|patukka|patukat`,
  // 6 Juomat
  `juoma|juomat|mehu 🧃|mehut 🧃|tuoremehu 🧃|limu|limut|limsa|limsat|virvoitusjuoma|cola|kokis|vesi|vedet|
   kivennäisvesi|vichy|olut 🍺|oluet 🍺|kalja 🍺|siideri|lonkero|viini 🍷|viinit 🍷|kuohuviini 🍾|energiajuoma|
   smoothie|jääkahvi|urheilujuoma`,
  // 7 Kodintarvikkeet
  `paperi 🧻|wc-paperi 🧻|vessapaperi 🧻|talouspaperi 🧻|nenäliina|lautasliina|pesuaine|astianpesuaine|
   pyykinpesuaine|konetiskiaine|tiskiaine|huuhteluaine|puhdistusaine|wc-puhdistus|saippua 🧼|käsisaippua 🧼|
   shampoo|hoitoaine|suihkusaippua|hammastahna|hammasharja 🪥|deodorantti|deo|partahöylä|terä|terät|vaippa|vaipat|
   side|siteet|tamponi|vanupuikko|laastari|roskapussi|pussi|pussit|pakastepussi|folio|kelmu|leivinpaperi|
   kynttilä 🕯️|kynttilät 🕯️|paristo 🔋|paristot 🔋|lamppu|polttimo|tiskiharja|tiskirätti|rätti|
   kertakäyttö|aurinkovoide|käsidesi|lemmikki|kissanruoka|koiranruoka|hiekka`,
];

// Etuliitteet, jotka ratkaisevat osaston pääsanasta riippumatta (esim. pakastemustikka).
const ETULIITTEET = [['pakaste', 4]];

// Sanat, joiden osuma kelpaa vain kokonaisena sanana (muuten liian monta vääriä osumia).
const VAIN_KOKONAISENA = 4;

const SANAT = [];
SANASTO.forEach((rivi, osasto) => {
  for (const kohta of rivi.split('|')) {
    const [sana, emoji] = kohta.trim().split(/\s+/);
    if (sana) SANAT.push({ sana, emoji: emoji || '', osasto });
  }
});
// Erikoistapaukset, joissa yleisempi sana veisi väärään paikkaan.
SANAT.push(
  { sana: 'pesusieni', emoji: '', osasto: 7 },
  { sana: 'leivinpaperi', emoji: '', osasto: 7 },
  { sana: 'pakastepussi', emoji: '', osasto: 7 },
  { sana: 'sipsit', emoji: '', osasto: 5 },
);

const valimuisti = new Map();

export function tunnista(nimi) {
  const avain = String(nimi).toLowerCase();
  if (valimuisti.has(avain)) return valimuisti.get(avain);

  const sanat = avain.replace(/[^a-zåäö-]+/g, ' ').split(/[\s-]+/).filter(s => s.length > 1);
  let paras = null, parasPisteet = -1;

  sanat.forEach((sana, i) => {
    const viimeinen = i === sanat.length - 1;
    for (const s of SANAT) {
      const kohta = sana.lastIndexOf(s.sana);
      if (kohta < 0) continue;
      const jalkeen = sana.length - (kohta + s.sana.length);
      const kokonainen = kohta === 0 && jalkeen <= 1;
      if (s.sana.length < VAIN_KOKONAISENA && !kokonainen) continue;
      const loppu = jalkeen <= 3;  // osuma sanan lopussa = yhdyssanan pääsana (+ taivutuspääte)
      const pisteet = (loppu ? 1000 : 0) + (viimeinen ? 100 : 0) + s.sana.length * 2 - jalkeen;
      if (pisteet > parasPisteet) { paras = s; parasPisteet = pisteet; }
    }
  });

  let tulos = paras ? { osasto: paras.osasto, emoji: paras.emoji } : { osasto: MUUT, emoji: '' };
  for (const [alku, osasto] of ETULIITTEET) {
    // Kodintarvikkeet (esim. pakastepussi) pysyvät kodintarvikkeina.
    if (tulos.osasto !== 7 && sanat.some(s => s.startsWith(alku))) tulos = { osasto, emoji: tulos.emoji };
  }
  valimuisti.set(avain, tulos);
  return tulos;
}
