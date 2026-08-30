# Hogyan működnek a nagy nyelvi modellek?

Átfogó magyar nyelvű oktatóanyag az LLM-ekről — a tokenizációtól a
backpropagationön át a mechanistic interpretability kutatási frontvonaláig.

**➜ [Olvasd itt](https://csaplard.github.io/llm-oktatoanyag/)** · **[Read it in English](https://csaplard.github.io/llm-oktatoanyag/en/)**

## Mi ez

Egyetlen, önálló HTML-fájl. Nincs build, nincs függőség, nincs keretrendszer —
letöltöd, duplán kattintasz, működik. Offline is.

Az anyag **szintalapú tanulórendszer**: tizenkét szint, mindegyik végén ötkérdéses
záró kvízzel. A következő fejezet akkor nyílik meg, ha a kvíz négy kérdését
eltaláltad. Bukásnál korlátlanul újrapróbálható, és a magyarázat **helyes és
helytelen válasz esetén is** megjelenik — a kvíz tanítani akar, nem vizsgáztatni.

A kérdések szándékosan nem definíciókra kérdeznek rá, hanem következményekre:
miért számolja el a modell a betűket egy szóban, miért lesz ugyanaz a magyar
mondat több token, mint az angol, mi történik, ha egy token embeddingje tanulatlan
marad.

### Rétegzett mélység

Minden téma háromszor van elmondva, egyre mélyebben:

| Szint | Hol | Mit |
|---|---|---|
| 1 · intuíció | a fő szöveg | mi történik és miért |
| 2 · matematika | lenyitható blokk | a képletek, pontosan |
| 3 · kutatói mélység | lenyitható blokk | nyitott kérdések, hivatkozásokkal |

Aki csak a fő szöveget olvassa, teljes és kerek anyagot kap.

### A tizenkét szint

1. Mi az a nagy nyelvi modell?
2. Tokenizáció
3. Embeddingek
4. Transzformer: residual stream, attention
5. Transzformer: MLP, normalizálás, pozíciókódolás, kimeneti fej
6. Tanítás: loss, számítási gráf, backpropagation
7. Tanítás: optimalizálók, infrastruktúra, skálázási törvények
8. Finomhangolás és alignment
9. Inferencia
10. Interpretability: residual stream nézet, induction headek
11. Interpretability: szuperpozíció, sparse autoencoderek, módszertan
12. Képességek és korlátok

Ezenkívül: glosszárium, irodalomjegyzék és változásnapló — ezek végig szabadon
elérhetők, nem esnek zár alá.

## Adatkezelés

A **tanulási haladás kizárólag a saját böngésződben marad** (`localStorage`),
szerverre semmi nem kerül. Ha letiltod a tárolást vagy privát ablakban olvasod,
minden működik, csak nem emlékszik.

Az oldalon süti nélküli, IP-tárolás nélküli látogatásszámláló
([GoatCounter](https://www.goatcounter.com/)) fut, amely csak oldalletöltést
számol. A kvízeredményedet nem látja senki.

## Akadálymentesség

- Minden szöveg/háttér páros megfelel a WCAG 2.1 AA kontrasztkövetelménynek,
  világos és sötét módban egyaránt (28 mért páros).
- Az állapotokat sosem csak a szín hordozza: ikon és szöveges címke is jelzi őket.
- Billentyűzettel végigjárható; a zárolt fejezetek tartalma `inert`, tehát Tabbal
  nem lehet beléjük tévedni.
- `prefers-reduced-motion` mellett minden animáció leáll, de az állapotok
  továbbra is megkülönböztethetők.

## Technikai jegyzet

- Egyetlen fájl, ~330 KB. Vanilla JS, IIFE, `var`/`function` — szándékosan
  konzervatív, hogy bármilyen böngészőben elinduljon.
- 13 saját SVG-ábra, külső képfájl nélkül.
- Világos és sötét mód külön tervezett palettával (a sötét nem a világos
  invertálása). Alapértelmezés: világos.

## Nyelvek

Az anyag magyarul és angolul is elérhető, ugyanazzal a szintrendszerrel és
ugyanazokkal a kvízekkel. A két változat között a jobb alsó sarokban lévő
`HU` / `EN` gombbal lehet váltani. A haladás közös: ha félúton nyelvet váltasz,
nem kell elölről kezdened.

Az angol kiadás nem szó szerinti fordítás ott, ahol az értelmetlen lett volna:
a nyelvi példákat kicseréltük olyanokra, amelyek angolul is működnek — a BPE
szótárépítés `play / playful / playtime`, a poliszémia `bank` (folyópart vagy
pénzintézet), az attention-példa `crane` (madár vagy emelőgép). Az ábrák
geometriája mindkét változatban azonos.

## Licenc

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.hu) —
nevezd meg a szerzőt · ne használd kereskedelmi célra · így add tovább.
Részletek: [LICENSE](LICENSE).

© 2026 Csaplár Dániel
