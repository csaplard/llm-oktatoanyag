"""l6_eszkoz.py — amit a RAG nem tud: számolás. Eszközhívás.

Futtatás:  python3 l6_eszkoz.py

Kérdés: "Mennyi volt a P-402 összes állásideje 2025-ben?"
Ezt keresésből NEM lehet megválaszolni. A válasz nincs leírva sehol —
öt hibajegyből kell összeadni. Ez nem keresési, hanem SZÁMÍTÁSI feladat.

A megoldás: adunk a modellnek egy eszközt. A modell nem futtat semmit,
csak KÉR: "hívd meg a hibajegy_statisztika függvényt gep='P-402'
paraméterrel". A hívást a te kódod végzi el, az eredményt visszaadod,
és a modell abból fogalmaz.
"""

import json
import re
import sqlite3
from pathlib import Path

import kozos

MAPPA = Path(__file__).parent
HIBAJEGYEK = MAPPA / "dokumentumok" / "hibajegy_kivonat_2025.md"
ADATBAZIS = MAPPA / "hibajegyek.sqlite"


# ---------------------------------------------------------------------------
# 1. Strukturált adat kinyerése a szabad szövegből
# ---------------------------------------------------------------------------

def hibajegyek_beolvas():
    """A markdown hibajegy-kivonatból rendes táblát csinál.

    Ez maga is tipikus AI-alkalmazás lenne nagy tételszámnál (7. fejezet a
    kézikönyvben), de 5 jegynél a reguláris kifejezés olcsóbb és pontosabb.
    Fontos szokás: ne hívj modellt oda, ahol egy regex elég.
    """
    szoveg = HIBAJEGYEK.read_text(encoding="utf-8")
    jegyek = []
    # minden '## HJ-2025-0142 (P-402)' fejléc egy jegy kezdete
    blokkok = re.split(r"^## ", szoveg, flags=re.MULTILINE)[1:]
    for blokk in blokkok:
        fejlec, _, torzs = blokk.partition("\n")
        m = re.match(r"(HJ-\d{4}-\d+)\s*\((\S+)\)", fejlec.strip())
        if not m:
            continue
        azonosito, gep = m.group(1), m.group(2)
        ora = re.search(r"Állásidő:\s*(\d+)\s*óra", torzs)
        jegyek.append({
            "azonosito": azonosito,
            "gep": gep,
            "allasido_ora": int(ora.group(1)) if ora else 0,
            "leiras": torzs.strip().replace("\n", " "),
        })
    return jegyek


def adatbazis_epit():
    kapcsolat = sqlite3.connect(ADATBAZIS)
    kapcsolat.execute("DROP TABLE IF EXISTS hibajegyek")
    kapcsolat.execute("""CREATE TABLE hibajegyek (
        azonosito TEXT, gep TEXT, allasido_ora INTEGER, leiras TEXT)""")
    for j in hibajegyek_beolvas():
        kapcsolat.execute("INSERT INTO hibajegyek VALUES (?, ?, ?, ?)",
                          (j["azonosito"], j["gep"], j["allasido_ora"],
                           j["leiras"]))
    kapcsolat.commit()
    return kapcsolat


# ---------------------------------------------------------------------------
# 2. Az eszköz: egy közönséges Python-függvény
# ---------------------------------------------------------------------------

def hibajegy_statisztika(gep=None):
    """Visszaadja egy gép hibajegy-statisztikáját 2025-re.

    Figyeld meg, mit ad vissza: TÖMÖR, aggregált adatot. Nem az öt teljes
    hibajegy szövegét — az bemenne a kontextusba, tokent és figyelmet enne.
    Az eszköz feladata a szűrés, nem a nyers adat átpasszolása.
    """
    kapcsolat = sqlite3.connect(ADATBAZIS)
    if gep:
        sorok = kapcsolat.execute(
            "SELECT azonosito, allasido_ora FROM hibajegyek WHERE gep = ?",
            (gep,)).fetchall()
    else:
        sorok = kapcsolat.execute(
            "SELECT azonosito, allasido_ora FROM hibajegyek").fetchall()
    kapcsolat.close()

    if not sorok:
        # TANÍTÓ hibaüzenet: megmondja, mi a helyes érték. A modell ebből
        # ki tudja javítani magát. A "Hiba: nincs adat" nem tanít semmit.
        return {"hiba": f"Nincs '{gep}' nevű gép. Ismert gépek: P-402, P-405."}

    orak = [s[1] for s in sorok]
    return {
        "gep": gep or "összes",
        "hibajegyek_szama": len(sorok),
        "osszes_allasido_ora": sum(orak),
        "leghosszabb_allasido_ora": max(orak),
        "jegyazonositok": [s[0] for s in sorok],
    }


# az eszköz LEÍRÁSA a modell számára — ez megy be a kontextusba
ESZKOZ_SEMA = {
    "name": "hibajegy_statisztika",
    "description": (
        "Egy gép 2025-ös hibajegyeinek összesített statisztikáját adja vissza: "
        "jegyek száma, összes és leghosszabb állásidő órában. "
        "Akkor használd, ha a kérdés SZÁMOLÁST igényel (összeg, darabszám, "
        "maximum). Ne használd, ha a kérdés egy konkrét hibajegy leírására "
        "vonatkozik — arra a dokumentumkeresés való."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "gep": {
                "type": "string",
                "description": "A gép azonosítója, például 'P-402'. "
                               "Ha elhagyod, az összes gépre számol.",
            }
        },
        "required": [],
    },
}


# ---------------------------------------------------------------------------
# 3. Az agenthurok
# ---------------------------------------------------------------------------

MAX_LEPES = 5

def agenthurok(kerdes):
    """A hurok, ami az egész agentikus világot mozgatja.

    Amíg a modell eszközt kér, futtatjuk és visszaadjuk az eredményt.
    Amikor szöveggel válaszol, készen vagyunk. A MAX_LEPES a biztonsági
    fék: e nélkül egy félresiklott modell a végtelenségig próbálkozhatna.
    """
    if kozos.BACKEND != "api":
        print("[BACKEND != 'api' — a hurok helyett kézi bemutató következik]\n")
        print("1. A modell megkapná a kérdést és az eszközleírást.")
        print("2. Ezt kérné vissza (eszközhívás):")
        print('   {"name": "hibajegy_statisztika", "input": {"gep": "P-402"}}')
        print("3. A TE kódod lefuttatja:")
        eredmeny = hibajegy_statisztika("P-402")
        print("  ", json.dumps(eredmeny, ensure_ascii=False))
        print("4. Ezt visszaadod a modellnek, ő pedig megfogalmazza a választ.")
        print("\nPróbáld ki a hibás ágat is:")
        print("  ", json.dumps(hibajegy_statisztika("P-999"), ensure_ascii=False))
        return

    import anthropic
    import os
    kliens = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    uzenetek = [{"role": "user", "content": kerdes}]

    for lepes in range(MAX_LEPES):
        valasz = kliens.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1000,
            tools=[ESZKOZ_SEMA],
            messages=uzenetek,
        )
        uzenetek.append({"role": "assistant", "content": valasz.content})

        hivasok = [b for b in valasz.content if b.type == "tool_use"]
        if not hivasok:
            szoveg = "".join(b.text for b in valasz.content if b.type == "text")
            print(f"\nVÁLASZ ({lepes + 1} lépés után):\n{szoveg}")
            return

        eredmenyek = []
        for hivas in hivasok:
            print(f"  [lépés {lepes + 1}] eszközhívás: "
                  f"{hivas.name}({hivas.input})")
            kimenet = hibajegy_statisztika(**hivas.input)
            eredmenyek.append({
                "type": "tool_result",
                "tool_use_id": hivas.id,
                "content": json.dumps(kimenet, ensure_ascii=False),
            })
        uzenetek.append({"role": "user", "content": eredmenyek})

    print("Elértük a lépéskorlátot.")


def main():
    kapcsolat = adatbazis_epit()
    darab = kapcsolat.execute("SELECT COUNT(*) FROM hibajegyek").fetchone()[0]
    kapcsolat.close()
    print(f"{darab} hibajegy betöltve az adatbázisba.\n")

    print("=" * 74)
    print("KÉRDÉS: Mennyi volt a P-402 összes állásideje 2025-ben?")
    print("=" * 74)
    agenthurok("Mennyi volt a P-402 összes állásideje 2025-ben?")


if __name__ == "__main__":
    main()
