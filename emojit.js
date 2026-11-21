// Emojit Unicode CLDR:n suomenkielisistä emojinimistä (common/annotations/fi.xml, tts-nimet).
// Poimittu 21.11.2026 CLDR:n main-haarasta; mukana vain valitut ruokaan ja kauppaostoksiin
// liittyvät emojit ja niiden osasto. Monisanaisesta nimestä on käytetty viimeistä sanaa
// (esim. "paahdettu bataatti" -> bataatti). Oma sanasto (osastot.js)
// voittaa, jos se antaa samalle sanalle toisen emojin tai osaston.
// CLDR: Copyright © Unicode, Inc., Unicode License v3 (https://www.unicode.org/license.txt).
// [sana, emoji, osasto]
export const CLDR = [
  ['sieni', '🍄', 0],   // sieni
  ['viinirypäleet', '🍇', 0],   // viinirypäleet
  ['meloni', '🍈', 0],   // meloni
  ['vesimeloni', '🍉', 0],   // vesimeloni
  ['mandariini', '🍊', 0],   // mandariini
  ['sitruuna', '🍋', 0],   // sitruuna
  ['banaani', '🍌', 0],   // banaani
  ['ananas', '🍍', 0],   // ananas
  ['mango', '🥭', 0],   // mango
  ['omena', '🍎', 0],   // punainen omena
  ['päärynä', '🍐', 0],   // päärynä
  ['persikka', '🍑', 0],   // persikka
  ['kirsikat', '🍒', 0],   // kirsikat
  ['mansikka', '🍓', 0],   // mansikka
  ['mustikat', '🫐', 0],   // mustikat
  ['kiivi', '🥝', 0],   // kiivi
  ['tomaatti', '🍅', 0],   // tomaatti
  ['kookospähkinä', '🥥', 0],   // kookospähkinä
  ['avokado', '🥑', 0],   // avokado
  ['munakoiso', '🍆', 0],   // munakoiso
  ['peruna', '🥔', 0],   // peruna
  ['porkkana', '🥕', 0],   // porkkana
  ['maissintähkä', '🌽', 0],   // maissintähkä
  ['jalapeno', '🌶️', 0],   // jalapeno
  ['paprika', '🫑', 0],   // paprika
  ['kurkku', '🥒', 0],   // kurkku
  ['lehtivihannes', '🥬', 0],   // lehtivihannes
  ['parsakaali', '🥦', 0],   // parsakaali
  ['valkosipuli', '🧄', 0],   // valkosipuli
  ['sipuli', '🧅', 0],   // sipuli
  ['inkivääri', '🫚', 0],   // inkivääri
  ['herneenpalko', '🫛', 0],   // herneenpalko
  ['juures', '🫜', 0],   // juures
  ['bataatti', '🍠', 0],   // paahdettu bataatti
  ['leipä', '🍞', 1],   // leipä
  ['voisarvi', '🥐', 1],   // voisarvi
  ['patonki', '🥖', 1],   // patonki
  ['rieska', '🫓', 1],   // rieska
  ['rinkilä', '🥨', 1],   // rinkilä
  ['vesirinkeli', '🥯', 1],   // vesirinkeli
  ['letut', '🥞', 1],   // letut
  ['vohveli', '🧇', 1],   // vohveli
  ['donitsi', '🍩', 1],   // donitsi
  ['kakkupala', '🍰', 1],   // kakkupala
  ['vuokaleivos', '🧁', 1],   // vuokaleivos
  ['piirakka', '🥧', 1],   // piirakka
  ['voileipä', '🥪', 1],   // voileipä
  ['pita', '🥙', 1],   // täytetty pita
  ['kala', '🐟', 2],   // kala
  ['rapu', '🦀', 2],   // rapu
  ['katkarapu', '🦐', 2],   // katkarapu
  ['kalmari', '🦑', 2],   // kalmari
  ['osteri', '🦪', 2],   // osteri
  ['lihanpala', '🥩', 2],   // lihanpala
  ['kanankoipi', '🍗', 2],   // kanankoipi
  ['pekoni', '🥓', 2],   // pekoni
  ['hodari', '🌭', 2],   // hodari
  ['sushi', '🍣', 2],   // sushi
  ['juustopala', '🧀', 3],   // juustopala
  ['kananmuna', '🥚', 3],   // kananmuna
  ['voi', '🧈', 3],   // voi
  ['maitolasi', '🥛', 3],   // maitolasi
  ['vanukas', '🍮', 3],   // vanukas
  ['hampurilainen', '🍔', 4],   // hampurilainen
  ['ranskalaiset', '🍟', 4],   // ranskalaiset
  ['pizza', '🍕', 4],   // pizza
  ['pehmis', '🍦', 4],   // pehmis
  ['jäätelö', '🍨', 4],   // jäätelö
  ['jääkuutio', '🧊', 4],   // jääkuutio
  ['taikinanyytti', '🥟', 4],   // taikinanyytti
  ['falafel', '🧆', 4],   // falafel
  ['maapähkinä', '🥜', 5],   // maapähkinä
  ['pavut', '🫘', 5],   // pavut
  ['kastanja', '🌰', 5],   // kastanja
  ['suola', '🧂', 5],   // suola
  ['säilyketölkki', '🥫', 5],   // säilyketölkki
  ['spagetti', '🍝', 5],   // spagetti
  ['riisi', '🍚', 5],   // keitetty riisi
  ['riisikakku', '🍘', 5],   // riisikakku
  ['keksi', '🍪', 5],   // keksi
  ['suklaapatukka', '🍫', 5],   // suklaapatukka
  ['karkki', '🍬', 5],   // karkki
  ['tikkari', '🍭', 5],   // tikkari
  ['hunaja', '🍯', 5],   // hunaja
  ['popcorn', '🍿', 5],   // popcorn
  ['oliivi', '🫒', 5],   // oliivi
  ['mate', '🧉', 5],   // mate
  ['taco', '🌮', 5],   // taco
  ['kuplatee', '🧋', 6],   // kuplatee
  ['ilmapallo', '🎈', 7],   // ilmapallo
  ['ostoskassit', '🛍️', 7],   // ostoskassit
  ['akku', '🔋', 7],   // akku
  ['kynttilä', '🕯️', 7],   // kynttilä
  ['hehkulamppu', '💡', 7],   // hehkulamppu
  ['laastari', '🩹', 7],   // laastari
  ['hiirenloukku', '🪤', 7],   // hiirenloukku
  ['partaveitsi', '🪒', 7],   // partaveitsi
  ['hoitoainepullo', '🧴', 7],   // hoitoainepullo
  ['hakaneula', '🧷', 7],   // hakaneula
  ['luuta', '🧹', 7],   // luuta
  ['paperirulla', '🧻', 7],   // paperirulla
  ['ämpäri', '🪣', 7],   // ämpäri
  ['saippua', '🧼', 7],   // saippua
  ['hammasharja', '🪥', 7],   // hammasharja
  ['pesusieni', '🧽', 7],   // pesusieni
];
