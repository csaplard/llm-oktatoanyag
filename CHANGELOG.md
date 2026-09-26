# Változásnapló / Changelog

## Kiadatlan / Unreleased — 2026-09-26

### Magyar

- Az oldal átvette az AI-tananyagok közös arculatát (`src/arculat.css`): Geologica és Literata betűk, alapból sötét mód, a témaválasztás az egész oldalon közös (`ait-theme`). A szerkezet, a 13 ábra, a kvízek és a haladásmentés nem változott; a tárolási kulcsok ugyanazok, így a mentett haladás megmarad.
- „Vissza az AI-tananyagokhoz” link a fejlécben és a tartalomjegyzékben.
- A „Katedra” név a kódból is kikerült (csak a két régi tárolási kulcs neve maradt meg, hogy a haladás ne vesszen el).
- Javítva: a tartalomjegyzék görgetéskövetője csak az oldalon belüli linkeket figyeli.

### English

- The page adopts the shared AI-tananyagok design (`src/arculat.css`): Geologica and Literata type, dark mode by default, a site-wide theme choice (`ait-theme`). Structure, the 13 figures, quizzes and saved progress are unchanged; storage keys are the same, so progress is kept.
- “Back to the learning hub” link in the header and the table of contents.
- The “Katedra” name is gone from the code as well (only two legacy storage key names remain, so progress is not lost).
- Fixed: the table-of-contents scroll spy only tracks in-page links.
## v1.1.3 — 2026-09-19

### Magyar

- A kevert kvízek magyarázatai tartalmuk alapján azonosítják a válaszokat, nem a helyük alapján. A kérdéssorrendtől függő hivatkozást is megszüntettük; regressziós teszt védi a javítást. A sorszámos hivatkozások már v1.0-ban is előfordultak.
- Javított angol fordított rokonsági kérdés; pontosított SAE-rekonstrukció és Adam-frissítési irány. A SAE-kvíz túl erős állítása korábbi kiadásokban is szerepelt, a v1.1.1-es ellenőrzés sem javította ki.
- Egyértelműsített memóriakvíz és mérőszámra szűkített emergenciakérdés; kezdőbarátabb backprop-magyarázat mindkét nyelven.
- A build kezeli a hívásnév utáni szóközt, a beágyazott nyelvi hívások egymást tartalmazó szerkesztéseit és a kulcsszavak után álló reguláris kifejezéseket. Célzott tesztek ellenőrzik a létrejövő JavaScript futását mindkét nyelven.
- Pontosított v1.1.2-es változásnapló. A kérdésazonosítók, számkulcsok és a mentett haladás formátuma változatlan.

### English

- Shuffled quiz explanations identify choices by their content, not their position. Removed a question-order reference too; regression coverage protects both. Positional references already occurred in v1.0.
- Corrected the English inverse-family-relation question and the explanations of SAE reconstruction and Adam's update direction. The SAE overstatement persisted through earlier editions and was missed in the v1.1.1 review.
- Removed an ambiguous memory distractor and narrowed the emergence question to the metric; made the backprop explanation more welcoming to beginners in both languages.
- The build handles whitespace before call parentheses, overlapping edits in nested bilingual calls, and regex literals after keywords. Targeted tests execute the generated JavaScript in both languages.
- Corrected the v1.1.2 release notes. Question IDs, numeric keys and the saved-progress format are unchanged.

## v1.1.2 — 2026-09-19

### Magyar

- Jelentősen csökkent a válaszhosszból adódó segítség a kvízekben. Korábban a 48 feleletválasztós kérdésből 38-ban a helyes volt a leghosszabb; ebben a kiadásban 7-ben (az angolban 10-ben); ez önmagában nem bizonyítja minden hosszúsági támpont megszűnését. A számkulcsok és a kérdésazonosítók nem változtak, a haladás megmarad.
- A v1.1.1-ben tömörre vágott magyarázatok ismét tanítanak: elmondják, miért helyes a helyes válasz, és miért csábító a rossz. A további ellenőrzés során talált hibák javítását a v1.1.3 bejegyzése részletezi.
- Egy pontatlanság, amely a v1.1.1 saját felülvizsgálatával ellentétes volt: a pre-norm kvízválasza még azt állította, hogy a mély modellek „warmup-trükkök nélkül is stabilan tanulnak”. Most: jellemzően stabilabban, garancia nélkül.
- A build nyelvenként külön csomagolja a tanulási elemeket: a magyar kiadásba csak magyar, az angolba csak angol szöveg kerül. A kétnyelvű forrás változatlan.
- A `scripts/build.py` Windowson is fut (explicit UTF-8), és van `--check` módja, amelyet a teszt is használ.
- Új megosztókártya az aktuális szóhasználattal; a „Katedra” felirat kikerült a látható szövegből és a megosztási metaadatokból.

### English

- Length-based clues to the correct quiz answer were substantially reduced. Previously it was the longest option in 38 of 48 multiple-choice questions; in this release, in 7 (Hungarian) and 10 (English); these counts alone do not establish that all length-based clues are gone. Numeric keys and question IDs are unchanged; progress is kept.
- Explanations shortened in v1.1.1 teach again: they say why the right answer is right and why the wrong one is tempting. Corrections identified in the follow-up review are detailed under v1.1.3.
- Fixed a leftover that contradicted v1.1.1’s own review: the pre-norm answer still claimed deep models “train stably without warmup tricks”. Now: typically more stably, with no guarantee.
- The build bundles the learning components per language, so each edition carries only its own language. The bilingual sources are unchanged.
- `scripts/build.py` runs on Windows (explicit UTF-8) and has a `--check` mode, used by the test suite.
- New share cards with current wording; the “Katedra” label is gone from visible text and share metadata.

## 2026-09-19 — Elnevezések / Labels

- Az interaktív példák neve a menüben, a hivatkozásokban és a feliratokon: **Interaktív kísérletek**.
- English navigation, links and example labels now use **Interactive experiments**.

## v1.1.1 — 2026-09-19

### Magyar

- Szakmai ellenőrzés mind a 12 állomásra, 60 kvízkérdésre, az alapozó és heti számpéldákra, valamint a 14 labor számításaira.
- Javított attention/MLP-mátrixalakok, kauzális példák, pre-norm, gradiens- és entrópiamagyarázatok, bfloat16-bitleírás, optimalizáló-memóriaigény, Chinchilla-kitevők, KV-cache és spekulatív mintavétel.
- Elkülönített tokenvalószínűség és állításhelyesség; óvatosabb kutatási következtetések. 28 kvízkérdés pontosítása, a haladás megőrzésével.
- Képletből számolt skálázási görbék és helyes folytonos optimum a korábbi sematikus rajz helyett.
- [Szakmai ellenőrzési jegyzőkönyv](SCIENTIFIC_REVIEW.md) eredeti forrásokkal és az ellenőrzés korlátaival.

### English

- Reviewed all 12 stages, 60 quiz questions, worked examples and calculations in 14 labs.
- Corrected matrix dimensions, causal examples, pre-norm/gradient/entropy explanations, bfloat16, optimizer memory, Chinchilla exponents, KV caching and speculative sampling.
- Distinguished token likelihood from claim correctness, qualified research claims and revised 28 quiz items while preserving progress.
- Replaced the scaling sketch with computed curves and a valid continuous optimum; added [source-backed review notes](SCIENTIFIC_REVIEW.md).

## v1.1 — 2026-09-19

### Magyar

- 14 interaktív műhely állítható paraméterekkel, számszerű eredményekkel, alaphelyzetbe állítással és önálló feladatokkal: BPE-tokenizálás, vektorok és koszinuszhasonlóság, mátrixtranszformáció, softmax és hőmérséklet, oksági attention, gradienscsökkenés, backpropagation, reziduális kapcsolat, LayerNorm és RMSNorm, RoPE, KV-cache, superposition, activation patching és DPO.
- Öt matematikai alapozó blokk végigszámolt példákkal.
- 12 hetes intenzív tanulási útvonal, 36 kipipálható feladattal, megoldásokkal és heti elkészítendő eredményekkel; választható kutatási irány.
- Alapértelmezett szabad olvasás és külön választható, kvízekhez kötött vezetett haladás. A meglévő eredmények megmaradnak a böngészőben.
- Elkülönülnek a magyarázat mélységét jelző címkék és a haladási állomások.
- A zárókvíz teljesítése önmagában többé nem jelenti a teljes kurzus elvégzését.
- Pontosított magyarázatok a tokenizálásról, linearitásról, logitokról és valószínűségekről, embeddingekről, reziduális kapcsolatokról és interpretálhatóságról. Kiegyensúlyozottabb bevezető kvízválaszok.
- Magyar és angol kiadás, önálló HTML-fájlokba épített gyakorlatokkal. Az egyszerűsített szemléltető modellek korlátai külön olvashatók.
- Az oldal palettájához illeszkedő világos és sötét megjelenés, mobilon görgethető széles ábrák és billentyűzettel kezelhető vezérlők.
- 22 sikeres automatizált teszt a numerikus számításokra, interakciókra, haladáskezelésre és hibás vagy nem elérhető helyi tárolóra.

### English

- Fourteen interactive workshops covering BPE, vectors, matrix transforms, softmax, causal attention, gradient descent, backpropagation, residual connections, normalization, RoPE, KV-cache, superposition, activation patching and DPO.
- Five worked mathematical foundations and a 12-week practice path with 36 checklist tasks, solutions, weekly deliverables and an optional research route.
- Free reading by default, optional quiz-gated progression, preserved existing progress and separate depth/progression labels.
- Fixed premature course completion from passing the final quiz alone; clarified scientific explanations and introductory quiz choices.
- Self-contained Hungarian and English editions, explicit limitations of toy models, theme-aware controls and horizontally scrollable wide diagrams on mobile.
- Twenty-two passing automated tests cover numerical calculations, interactions, progression and unavailable or malformed browser storage.

## v1.0 — 2026-08-30

Első nyilvános kiadás: 12 fejezet, fejezetenként 5 kérdéses kvíz, 4/5-ös átmenőküszöb, helyben mentett haladás, világos és sötét mód.

Initial public edition: twelve chapters, five-question chapter quizzes, a four-of-five pass threshold, local progress storage, and light and dark modes.
