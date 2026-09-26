"""Létrehozza a szintetikus karbantartási korpuszt a dokumentumok/ mappában.
Egyszer kell lefuttatni: python3 keszits_korpuszt.py
"""
from pathlib import Path

DOKUMENTUMOK = {
"P-402_szivattyu_gepkonyv.md": """# P-402 centrifugálszivattyú — gépkönyv
dokumentumtipus: gepkonyv
gep: P-402
rendszer: hutovizkor
verzio: 3.1
ervenyes_tol: 2025-04-01

## 1. Általános adatok
A P-402 egyfokozatú, radiális centrifugálszivattyú a hűtővízkörben.
Névleges térfogatáram: 120 m3/h. Névleges emelőmagasság: 42 m.
Hajtás: 30 kW-os aszinkron motor, 2950 1/min.
Cikkszám (járókerék): JK-402-118. Cikkszám (tengely): TG-402-055.

## 2. Tömítés
A szivattyú kettős csúszógyűrűs tömítéssel készül, zárófolyadékos rendszerrel.
A zárófolyadék nyomása mindig 1,5-2,0 barral haladja meg a szívóoldali nyomást.
Tömítés cikkszáma: TOM-402-2K. Csere esetén kizárólag azonos típus építhető be.

## 3. Csere és szerelés
A tömítéscseréhez szükséges szerszámok: 24-es és 30-as villáskulcs,
tengelykihúzó (TK-2 készlet), nyomatékkulcs 10-60 Nm tartományban,
valamint a JK-402 járókerék rögzítéséhez való ellentartó villa.
A járókerék anyáját 45 Nm nyomatékkal kell meghúzni.
Szereléskor a tengelyütés nem haladhatja meg a 0,05 mm-t.

## 4. Kenés
Csapágyzsír: lítiumszappan bázisú, NLGI 2 osztály.
Utánkenés 2000 üzemóránként, csapágyházanként 15 g.

## 5. Üzemi határértékek
Maximális szívóoldali nyomás: 6 bar.
Maximális közeghőmérséklet: 80 C.
Megengedett rezgésszint (RMS, csapágyházon): 4,5 mm/s.
E fölött a gép leállítandó és diagnosztikai vizsgálat rendelendő.
""",

"P-405_szivattyu_gepkonyv.md": """# P-405 centrifugálszivattyú — gépkönyv
dokumentumtipus: gepkonyv
gep: P-405
rendszer: hutovizkor
verzio: 2.4
ervenyes_tol: 2024-11-15

## 1. Általános adatok
A P-405 kétfokozatú centrifugálszivattyú, a hűtővízkör tartalék ága.
Névleges térfogatáram: 90 m3/h. Névleges emelőmagasság: 68 m.
Hajtás: 37 kW-os aszinkron motor.
Cikkszám (járókerék): JK-405-090.

## 2. Tömítés
A P-405 egyszeres csúszógyűrűs tömítéssel készül, zárófolyadék nélkül.
Tömítés cikkszáma: TOM-405-1E.
FIGYELEM: a P-402 tömítése (TOM-402-2K) NEM cserélhető be ebbe a gépbe,
mert a tengelyátmérő és a beépítési hossz eltér.

## 3. Karbantartási ciklus
Nagyjavítás: 24 havonta.
Tömítésellenőrzés: 6 havonta.
Rezgésmérés: negyedévente.
A P-402 ciklusa ettől eltér, mert az folyamatos üzemű gép.

## 4. Üzemi határértékek
Maximális közeghőmérséklet: 70 C.
Megengedett rezgésszint (RMS): 3,5 mm/s.
""",

"karbantartasi_utasitas_forgogep.md": """# Karbantartási utasítás — forgógépek általános előírásai
dokumentumtipus: utasitas
gep: altalanos
rendszer: forgogep
verzio: 5.0
ervenyes_tol: 2026-01-01

## 1. Hatály
Ez az utasítás a gyáregység összes szivattyújára, ventilátorára és
kompresszorára vonatkozik, ha a gépkönyv szigorúbbat nem ír elő.
Ellentmondás esetén mindig a gépkönyv az erősebb.

## 2. Rezgésalapú állapotfigyelés
A rezgésmérést negyedévente kell elvégezni, kritikus gépeken havonta.
Az értékelés az ISO 10816 szerinti zónabesorolás alapján történik.
A trend fontosabb, mint az abszolút érték: 30 százalékos növekedés két
egymást követő mérés között akkor is beavatkozást indokol, ha az érték
még a határérték alatt van.

## 3. Jellemző hibajelenségek és hangjuk
Csapágyhiba: magas frekvenciás, egyenletes zúgás vagy csikorgás,
amely a fordulatszámmal együtt változik. Rendellenes zajkibocsátás
esetén elsőként mindig csapágyra kell gyanakodni.
Kavitáció: kavicsos, kopogó hang, ingadozó nyomással és árammal.
Kiegyensúlyozatlanság: fordulatszám-frekvenciás, egyenletes vibráció.
Tengelybeállítási hiba: kétszeres fordulatszám-frekvencia, tengelyirányú
rezgéskomponenssel.

## 4. Beavatkozási sürgősség
Azonnali leállás: füst, égésszag, csapágyház-hőmérséklet 90 C fölött,
vagy a gépkönyvi rezgéshatár kétszeresének elérése.
24 órán belül: határérték túllépése, tartós nyomásingadozás.
Tervezhető: trendromlás határérték alatt.
""",

"munkavedelmi_eloiras_leallitas.md": """# Munkavédelmi előírás — gépek biztonságos leállítása és kizárása
dokumentumtipus: munkavedelem
gep: altalanos
rendszer: altalanos
verzio: 4.2
ervenyes_tol: 2025-09-01

## 1. Kizárás-megjelölés (LOTO)
Bármely forgógépen végzett beavatkozás előtt a gépet le kell állítani,
a villamos betáplálást ki kell kapcsolni, és a kapcsolót lakattal
kizárni. A lakat kulcsa a munkát végző személynél marad.

## 2. Nyomásmentesítés
Zárófolyadékos tömítésű gépeknél a beavatkozás előtt a zárófolyadék
rendszert is nyomásmentesíteni kell. Ez a P-402 esetében kötelező lépés.

## 3. Engedélyek
Meleg munkához (hegesztés, csiszolás) külön tűzveszélyes munkavégzési
engedély szükséges, amelyet a területgazda ad ki.
Zárt téri munkához belépési engedély és folyamatos gázérzékelés kell.

## 4. Egyéni védőeszközök
Alapfelszerelés: védőszemüveg, védőcipő, védősisak, munkaruha.
Vegyi közeggel érintkező szerelésnél ezen felül vegyszerálló kesztyű
és arcvédő pajzs.
""",

"hibajegy_kivonat_2025.md": """# Hibajegy-kivonat — hűtővízkör, 2025
dokumentumtipus: hibajegy_kivonat
gep: tobb
rendszer: hutovizkor
verzio: 1.0
ervenyes_tol: 2026-01-10

## HJ-2025-0142 (P-402)
Bejelentés: a szivattyú zörög, a csapágyház melegszik.
Megállapítás: szivattyúoldali csapágy kifutott, a rezgésszint 7,2 mm/s.
Beavatkozás: csapágypár csere, tengelyütés beállítás. Állásidő: 6 óra.

## HJ-2025-0211 (P-402)
Bejelentés: zárófolyadék nyomása leesett.
Megállapítás: a zárófolyadék tartály szintje lecsökkent, szivárgás a
tömítésnél. Beavatkozás: TOM-402-2K tömítés csere. Állásidő: 9 óra.

## HJ-2025-0388 (P-405)
Bejelentés: indításkor kopogó hang.
Megállapítás: kavitáció, a szívóoldali szűrő eltömődött.
Beavatkozás: szűrőtisztítás. Állásidő: 2 óra.

## HJ-2025-0455 (P-402)
Bejelentés: rezgésszint emelkedik, még határérték alatt.
Megállapítás: tengelybeállítási hiba a tengelykapcsolónál.
Beavatkozás: lézeres tengelybeállítás. Állásidő: 4 óra.

## HJ-2025-0501 (P-405)
Bejelentés: tömítés csepeg.
Megállapítás: TOM-405-1E tömítés elhasználódott.
Beavatkozás: tömítéscsere. Állásidő: 5 óra.
""",

"beszerzesi_szabalyzat_potalkatresz.md": """# Beszerzési szabályzat — pótalkatrészek
dokumentumtipus: szabalyzat
gep: altalanos
rendszer: altalanos
verzio: 2.0
ervenyes_tol: 2026-03-01

## 1. Raktári és nem raktári tételek
A raktári készleten tartott tételeket a művezető közvetlenül igényelheti.
Nem raktári tétel esetén beszerzési igényt kell indítani.

## 2. Értékhatárok
100 000 Ft alatt: művezetői jóváhagyás elegendő.
100 000 - 1 000 000 Ft között: üzemvezetői jóváhagyás szükséges.
1 000 000 Ft fölött: beszerzési bizottsági eljárás.

## 3. Sürgősségi beszerzés
Termelést akadályozó meghibásodás esetén sürgősségi eljárás indítható,
amelyhez az üzemvezető szóbeli engedélye is elegendő, de 24 órán belül
írásban pótolni kell.

## 4. Alkatrész-azonosítás
Minden igénylésen fel kell tüntetni a gyári cikkszámot.
Cikkszám nélküli igénylést a beszerzés visszautasít.
""",
}

if __name__ == "__main__":
    mappa = Path(__file__).parent / "dokumentumok"
    mappa.mkdir(exist_ok=True)
    for nev, tartalom in DOKUMENTUMOK.items():
        (mappa / nev).write_text(tartalom, encoding="utf-8")
        print("kiírva:", nev, f"({len(tartalom)} karakter)")
    print(f"\nKész: {len(DOKUMENTUMOK)} dokumentum a {mappa} mappában.")
