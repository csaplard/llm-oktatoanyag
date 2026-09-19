/* Katedra learning companion: no dependencies, shared HU/EN local progress. */
(function () {
  'use strict';
  var KEY = 'katedra-learning-path-v1';
  var lang = document.documentElement.lang.toLowerCase().indexOf('en') === 0 ? 'en' : 'hu';
  function t(hu, en) { return lang === 'hu' ? hu : en; }
  function esc(value) { return String(value).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function link(id, hu, en) { return '<a href="#' + id + '">' + t(hu, en) + '</a>'; }
  function solution(hu, en) { return '<details class="learn-solution"><summary>' + t('Megoldás és magyarázat', 'Solution and explanation') + '</summary><p>' + t(hu, en) + '</p></details>'; }

  var foundations = [
    {
      id: 'vektor', title: ['Vektor: számok egy meghatározott sorrendben', 'Vector: numbers in a defined order'],
      text: ['Egy vektor számlista. Ha egy termék adatai [ár, tömeg], akkor [3, 4] két külön tulajdonságot jelöl; a sorrend felcserélése megváltoztatja a jelentést. Geometriai ábrán ugyanez a lista az origóból a (3, 4) ponthoz mutató nyíl. Az embeddingeknél a koordináták tanultak: általában nem lehet minden tengelyhez egy hétköznapi fogalmat rendelni.', 'A vector is an ordered list of numbers. If a product uses [price, mass], [3, 4] represents two different properties; changing their order changes the meaning. In a geometric picture, the same list is an arrow from the origin to (3, 4). Embedding coordinates are learned: individual axes usually do not correspond to everyday concepts.'],
      example: ['Összeadás: [3, 4] + [1, −2] = [4, 2]. Kétszerezés: 2 × [3, 4] = [6, 8]. Hossz: √(3² + 4²) = 5. Az egységnyi hosszú, azonos irányú vektor: [0,6; 0,8].', 'Addition: [3, 4] + [1, −2] = [4, 2]. Scaling: 2 × [3, 4] = [6, 8]. Length: √(3² + 4²) = 5. The unit vector with the same direction is [0.6, 0.8].'],
      question: ['Számold ki: [2, −1] + 3 × [1, 2]. Mekkora az eredmény első koordinátája?', 'Calculate [2, −1] + 3 × [1, 2]. What is the first coordinate of the result?'],
      answer: ['Először szorozz: 3 × [1, 2] = [3, 6]. Utána koordinátánként adj össze: [5, 5]. Az első koordináta 5. Az összeadáshoz azonos számú koordináta szükséges.', 'First scale: 3 × [1, 2] = [3, 6]. Then add corresponding coordinates: [5, 5]. The first coordinate is 5. Addition requires the same number of coordinates.'],
      target: 'embedding', targetName: ['Kapcsolódás: embeddingek', 'Continue to embeddings']
    },
    {
      id: 'matrix', title: ['Skalárszorzat és mátrix: hogyan keverednek a számok?', 'Dot products and matrices: how numbers are mixed'],
      text: ['A skalárszorzat páronként összeszorozza, majd összeadja a koordinátákat. A végeredmény egy szám. A mátrix téglalap alakú számtábla; a mátrixszorzás több ilyen skalárszorzatot végez. Itt sorvektorokkal számolunk: egy kételemű bemenet egy 2 × 3-as mátrixon keresztül háromelemű kimenetet ad.', 'A dot product multiplies matching coordinates and adds the products, giving one number. A matrix is a rectangular table; matrix multiplication computes several dot products. We use row vectors here: a two-element input multiplied by a 2 × 3 matrix produces a three-element output.'],
      example: ['[2, 1] · [3, 4] = 2 × 3 + 1 × 4 = 10. Ha W sorai [1, 3] és [0, 2], akkor [2, 1]W = [2 × 1 + 1 × 0, 2 × 3 + 1 × 2] = [2, 8]. A kimenet egy-egy eleme a bemenet és W egyik oszlopának skalárszorzata.', '[2, 1] · [3, 4] = 2 × 3 + 1 × 4 = 10. If the rows of W are [1, 3] and [0, 2], then [2, 1]W = [2 × 1 + 1 × 0, 2 × 3 + 1 × 2] = [2, 8]. Each output element is the dot product of the input and one column of W.'],
      question: ['Ugyanezzel a W mátrixszal mennyi [1, 2]W? Összeszorozható-e egy 3 × 2-es és egy 4 × 3-as mátrix ebben a sorrendben?', 'Using the same W, what is [1, 2]W? Can a 3 × 2 matrix be multiplied by a 4 × 3 matrix in that order?'],
      answer: ['Az eredmény [1, 7]. A második szorzás nem értelmezett: a belső méreteknek egyezniük kellene, de 2 ≠ 4. Általánosan: (m × n) × (n × p) → (m × p).', 'The result is [1, 7]. The second multiplication is undefined: the inner dimensions must match, but 2 ≠ 4. In general: (m × n) × (n × p) → (m × p).'],
      target: 'attention', targetName: ['Kapcsolódás: Q, K és V az attentionben', 'Continue to Q, K and V in attention']
    },
    {
      id: 'valoszinuseg', title: ['Valószínűség és logaritmus: a bizonytalanság számai', 'Probability and logarithms: quantifying uncertainty'],
      text: ['A valószínűség 0 és 1 közé esik. Egymást kizáró, az összes lehetőséget lefedő kimenetek valószínűségeinek összege 1. A modell 0,8-as becslése nem bizonyítja egy állítás igazságát. A természetes logaritmus, ln, az e alapú hatványozás visszafelé: ln(eˣ) = x. A negatív logaritmus a kicsi valószínűséget nagy veszteséggé alakítja.', 'A probability lies between 0 and 1. Probabilities of mutually exclusive outcomes covering all possibilities sum to 1. A model assigning 0.8 does not establish that a statement is true. The natural logarithm, ln, reverses exponentiation with base e: ln(eˣ) = x. A negative logarithm converts small probabilities into large losses.'],
      example: ['Ha a helyes token valószínűsége 0,8, a veszteség −ln(0,8) ≈ 0,223. Ha csak 0,2, akkor −ln(0,2) ≈ 1,609. Két token együttes valószínűsége feltételes becslésekből: 0,5 × 0,2 = 0,1; a negatív logaritmusok összege −ln(0,1) ≈ 2,303.', 'If the correct token has probability 0.8, the loss is −ln(0.8) ≈ 0.223. At probability 0.2, the loss is −ln(0.2) ≈ 1.609. A two-token sequence with conditional probabilities 0.5 and 0.2 has probability 0.1; its negative log probabilities sum to −ln(0.1) ≈ 2.303.'],
      question: ['Két kimenet logitja kezdetben [0, 0]. Az elsőt 1-re emeled. Az új valószínűsége e¹/(e¹ + e⁰). Mennyi ez, és hányszorosára nőtt az eredeti 0,5-höz képest?', 'Two outcomes initially have logits [0, 0]. Raise the first to 1. Its new probability is e¹/(e¹ + e⁰). What is it, and by what factor did it increase from 0.5?'],
      answer: ['Az új valószínűség körülbelül 0,731, tehát 1,462-szeresére nőtt. A normalizálás miatt maga a valószínűség nem e-szeresére nő. A két kimenet valószínűségének aránya változott 1-ről e-re.', 'The new probability is approximately 0.731, an increase by a factor of 1.462. Normalization means the probability itself did not multiply by e. The ratio between the two probabilities changed from 1 to e.'],
      target: 'loss', targetName: ['Kapcsolódás: cross-entropy', 'Continue to cross-entropy']
    },
    {
      id: 'derivalt', title: ['Derivált és láncszabály: melyik irányba javítsunk?', 'Derivatives and the chain rule: which direction improves the result?'],
      text: ['A derivált helyi változási sebesség: ha egy paramétert egy nagyon kicsit növelünk, merre és milyen gyorsan változik a kimenet? Több változónál a parciális deriváltak együtt adják a gradienst. A gradiens negatív iránya kis lépésnél csökkentheti a veszteséget; túl nagy lépésnél ez nem garantált. A láncszabály egymásba kapcsolt műveletek deriváltjait szorozza össze.', 'A derivative is a local rate of change: if we increase a parameter slightly, in which direction and how quickly does the output change? For multiple variables, partial derivatives form the gradient. A small step opposite the gradient can reduce the loss; a large step is not guaranteed to do so. The chain rule multiplies derivatives along connected operations.'],
      example: ['Legyen u = 2w − 1 és L = u². Ha w = 2, akkor u = 3, L = 9. dL/du = 2u = 6 és du/dw = 2, ezért dL/dw = 12. A 0,1-es tanulási rátával w új értéke 2 − 0,1 × 12 = 0,8, az új veszteség 0,36.', 'Let u = 2w − 1 and L = u². At w = 2, u = 3 and L = 9. Since dL/du = 2u = 6 and du/dw = 2, dL/dw = 12. With learning rate 0.1, the new w is 2 − 0.1 × 12 = 0.8, and the new loss is 0.36.'],
      question: ['Ugyanitt w = 1 esetén mennyi a veszteség és a derivált? Hova lépsz 0,1-es tanulási rátával?', 'At w = 1, what are the loss and derivative? Where does a step with learning rate 0.1 take you?'],
      answer: ['u = 1, L = 1, dL/dw = 2 × 1 × 2 = 4. Az új w = 1 − 0,1 × 4 = 0,6. Az új veszteség (2 × 0,6 − 1)² = 0,04. A tanulási ráta nem a derivált része, hanem a lépés méretét választja meg.', 'u = 1, L = 1, and dL/dw = 2 × 1 × 2 = 4. The new w is 1 − 0.1 × 4 = 0.6. The new loss is (2 × 0.6 − 1)² = 0.04. The learning rate is not part of the derivative; it chooses the step size.'],
      target: 'backprop', targetName: ['Kapcsolódás: backpropagation', 'Continue to backpropagation']
    },
    {
      id: 'tenzor', title: ['Python és tenzoralakok: mit jelentenek a szögletes zárójelek?', 'Python and tensor shapes: what do the brackets mean?'],
      text: ['Egy tenzor többdimenziós számtömb; a shape megmondja az egyes tengelyek hosszát. A [batch, token, jellemző] alakban [2, 4, 3] két példát, példánként négy tokent és tokenenként három koordinátát jelent. Ez 24 szám. A Pythonban az indexelés nulláról indul. Egy lista és egy numerikus könyvtár tenzora nem ugyanaz: a lista + művelete összefűz, nem koordinátánként ad össze.', 'A tensor is a multidimensional array; its shape gives the length of each axis. A [batch, token, feature] shape of [2, 4, 3] means two examples, four tokens per example and three coordinates per token: 24 numbers. Python indexing starts at zero. A list is not a numeric-library tensor: + on lists concatenates them rather than adding coordinates.'],
      example: ['Ez a külső csomag nélküli Python-kód a mátrixszorzás működő, kis méretű változata. Mentsd gyakorlat.py néven, és helyi Python 3 esetén futtasd a python3 gyakorlat.py paranccsal (egyes rendszereken python vagy py a parancs). A kiírt eredmény [2, 8]. Nagy modelleknél erre optimalizált tenzorkönyvtárat használunk.', 'This dependency-free Python code is a working small matrix multiplication. Save it as gyakorlat.py and, with local Python 3 installed, run python3 gyakorlat.py (some systems use python or py). It prints [2, 8]. Large models use optimized tensor libraries.'],
      code: 'x = [2, 1]\nw = [[1, 3], [0, 2]]\ny = [\n    sum(x[i] * w[i][j] for i in range(2))\n    for j in range(2)\n]\nprint(y)',
      question: ['Egy attention-fejben Q és K alakja egyaránt [4, 3]. Mekkora QKᵀ alakja? Mit jelöl a két tengely?', 'In one attention head, Q and K both have shape [4, 3]. What is the shape of QKᵀ, and what do its axes represent?'],
      answer: ['K transzponáltjának alakja [3, 4], ezért [4, 3] × [3, 4] → [4, 4]. A sor a kérdező token, az oszlop az a token, amelyből olvasni lehet. A fej belső, háromelemű koordinátatengelyét a skalárszorzás összegezte.', 'K transposed has shape [3, 4], so [4, 3] × [3, 4] → [4, 4]. Rows represent query tokens; columns represent tokens available to read from. The dot product summed over the three-dimensional internal feature axis.'],
      target: 'autograd', targetName: ['Kapcsolódás: számítási gráf', 'Continue to computation graphs']
    }
  ];


  var weeks = [
    {
      title: ['Számolási alapok és első futtatható példa', 'Numerical foundations and a first runnable example'], anchor: 'alapok',
      tasks: [
        ['Olvasd el az öt alapozó blokkot. Oldd meg a kérdéseiket, mielőtt kinyitod a megoldást; írd le külön, ahol segítség kellett.', 'Read the five foundation blocks. Answer their questions before opening the solutions; record where you needed help.'],
        ['Papíron számold ki [2, 1]W és [1, 2]W értékét, ahol W sorai [1, 3] és [0, 2]. Futtasd az alapozó Python-példát helyi Python 3-ban; módosítsd az x értékét.', 'Calculate [2, 1]W and [1, 2]W on paper, with W rows [1, 3] and [0, 2]. Run the foundation example in local Python 3, then change x.'],
        ['Magyarázd el saját szavakkal a vektor, alak, derivált és valószínűség közötti különbséget. Adj mindegyikhez egy számpéldát.', 'Explain vector, shape, derivative and probability in your own words. Give a numerical example of each.']
      ],
      problem: ['Ellenőrző feladat: W első elemét növeld 1-ről 2-re. Mennyit változik [2, 1]W első és második kimenete? Előbb jósolj, majd futtasd.', 'Checkpoint: increase the first entry of W from 1 to 2. How do the first and second outputs of [2, 1]W change? Predict, then run.'],
      answer: ['Az eredmény [4, 8]: csak az első kimenet nő, 2-vel. A módosított súly az x első elemével szorzódik. Ha a második kimenet is változik, ellenőrizd a sorok és oszlopok kezelését.', 'The result is [4, 8]: only the first output changes, by 2. The changed weight multiplies the first element of x. If the second output also changes, check your row and column indexing.'],
      deliverable: ['Egy futtatható Python-fájl és egy oldalnyi saját magyarázat, legalább öt helyesen végigszámolt példával.', 'One runnable Python file and one page of explanations containing at least five correctly worked examples.'],
      research: ['Vezesd le általánosan az xW kimenet egy elemének deriváltját W egyik súlya szerint; írd mellé az alakokat.', 'Derive the derivative of one xW output with respect to one W entry, and annotate the shapes.']
    },
    {
      title: ['Tokenizáció: szövegből azonosítók', 'Tokenization: from text to identifiers'], anchor: 'tokenizacio',
      tasks: [
        ['Kövesd a BPE-leírást. Használd a háromszavas játékadatot: „low low lower”. Szóhatárokon ne egyesíts; kezdetben minden betű külön token.', 'Follow the BPE explanation using the three-word toy corpus “low low lower”. Do not merge across word boundaries; start with separate character tokens.'],
        ['Számold össze a szomszédos párokat. Döntetlennél az előbb előforduló párt válaszd; végezz két egyesítést, és írd ki az új tokenlistákat.', 'Count neighboring pairs. Break ties by earliest occurrence; perform two merges and write the new token sequences.'],
        ['Találj ki egy új szót, és alkalmazd rá ugyanebben a sorrendben az egyesítéseket. Magyarázd el, miért nem jelent egy token feltétlenül egy szót.', 'Choose a new word and apply the merges in the same order. Explain why a token need not be a whole word.']
      ],
      problem: ['Mi lesz a két egyesítés és a „lower” felbontása? Miért kell rögzíteni a döntetlen feloldását?', 'What are the two merges and the final split of “lower”? Why must tie-breaking be specified?'],
      answer: ['Először l + o → lo, majd lo + w → low. A „lower” felbontása [low, e, r]. Az első körben az l–o és az o–w pár is háromszor fordul elő; más döntetlenkezelés más egyesítési sorrendet adhat. Ez karakteres játékpélda, nem teljes byte-level tokenizer.', 'First l + o → lo, then lo + w → low. “lower” becomes [low, e, r]. Initially l–o and o–w both occur three times; another tie-break rule can change the merge order. This is a character-level toy example, not a full byte-level tokenizer.'],
      deliverable: ['Egy táblázat a kezdeti tokenekről, párszámokról és két egyesítésről; egy új szón tesztelt eredmény.', 'A table of initial tokens, pair counts and two merges, plus a test on a new word.'],
      research: ['Írd meg a párszámlálót Pythonban. Jelöld külön az előfeldolgozást, a tanult merge-listát és az új szöveg kódolását.', 'Implement pair counting in Python. Separate preprocessing, the learned merge list and encoding of new text.']
    },
    {
      title: ['Embeddingek és hasonlóság', 'Embeddings and similarity'], anchor: 'embedding',
      tasks: [
        ['Rajzold fel A = [1, 0], B = [1, 1], C = [0, 1] vektorokat. Számold ki mindegyik hosszát és az A-val vett skalárszorzatát.', 'Plot A = [1, 0], B = [1, 1] and C = [0, 1]. Compute their lengths and dot products with A.'],
        ['Oszd el a skalárszorzatot a két vektor hosszának szorzatával: ez a koszinuszhasonlóság. Rendezd B-t és C-t A-hoz való hasonlóság szerint.', 'Divide each dot product by the product of vector lengths to obtain cosine similarity. Rank B and C by similarity to A.'],
        ['Növeld B hosszát háromszorosára az irány megőrzésével. Vesd össze a skalárszorzat és a koszinuszhasonlóság változását.', 'Triple B’s length without changing its direction. Compare how the dot product and cosine similarity change.']
      ],
      problem: ['Mennyi cos(A, B), cos(A, C), és cos(A, 3B)? Mit nem bizonyít a nagy koszinuszhasonlóság?', 'What are cos(A, B), cos(A, C), and cos(A, 3B)? What does high cosine similarity fail to prove?'],
      answer: ['Sorrendben 1/√2 ≈ 0,707; 0; és ismét 0,707. A koszinusz az irányt, nem a hosszt méri. Ezek mesterséges koordináták: az ábra nem bizonyítja, hogyan reprezentál egy valódi modell konkrét szavakat, és a hasonlóság nem oksági magyarázat.', 'The values are 1/√2 ≈ 0.707, 0, and again 0.707. Cosine measures direction rather than length. These are invented coordinates: the picture does not establish how a real model represents particular words, and similarity is not a causal explanation.'],
      deliverable: ['Háromvektoros ábra, hat számolt hasonlóság és két mondat a módszer korlátairól.', 'A three-vector plot, six calculated similarities, and two sentences describing limitations.'],
      research: ['Készíts egy negyedik, eltérő hosszúságú vektort, amelynél a dot-product és a cosine rangsor különbözik. Mutasd meg számokkal.', 'Construct a fourth vector with a different magnitude so dot-product and cosine rankings disagree. Demonstrate numerically.']
    },
    {
      title: ['Attention kézzel, három tokennel', 'Attention by hand with three tokens'], anchor: 'attention',
      tasks: [
        ['Legyen q = [1, 0], K sorai [1, 0], [0, 1], [1, 1], V sorai [2, 0], [0, 2], [2, 2]. Számold ki qKᵀ/√2 értékét.', 'Let q = [1, 0], K rows [1, 0], [0, 1], [1, 1], and V rows [2, 0], [0, 2], [2, 2]. Calculate qKᵀ/√2.'],
        ['Végezz softmaxot: hatványozd e-vel a három score-t, majd oszd el mindet az összegükkel. A kapott súlyokkal összegezd V sorait.', 'Apply softmax: exponentiate the three scores with base e and divide each by their sum. Use these weights to sum the rows of V.'],
        ['Maszkold a harmadik tokent: a súlya legyen nulla, és az első kettőt normalizáld újra. Ellenőrizd, hogy a súlyösszeg mindkét esetben 1.', 'Mask the third token: set its weight to zero and renormalize the first two. Verify that weights sum to 1 in both cases.']
      ],
      problem: ['Miért hibás egyszerűen nullára állítani a harmadik score-t maszkoláskor?', 'Why is setting the third score to zero an incorrect way to mask it?'],
      answer: ['e⁰ = 1, tehát a nulla score továbbra is pozitív súlyt kapna. Kizáráskor a maszkolt logit −∞ (vagy megfelelően nagy negatív szám). Maszk nélkül a súlyok ≈ [0,401; 0,198; 0,401], a kimenet ≈ [1,604; 1,198]. A harmadik token kizárásával a súlyok ≈ [0,670; 0,330; 0], a kimenet ≈ [1,340; 0,660].', 'Because e⁰ = 1, a zero score still receives positive weight. A masked logit is −∞ (or a suitable large negative number). Without masking, weights are approximately [0.401, 0.198, 0.401] and output [1.604, 1.198]. Excluding the third token gives weights [0.670, 0.330, 0] and output [1.340, 0.660].'],
      deliverable: ['Két teljesen végigszámolt attention-lépés és egy rövid magyarázat a Q, K, V külön szerepéről.', 'Two fully worked attention calculations and a short explanation of the distinct roles of Q, K and V.'],
      research: ['Bővítsd a példát három queryre. Írd fel a 3 × 3-as oksági maszkot, és ellenőrizd az összes kimeneti sor alakját.', 'Extend to three queries. Write a 3 × 3 causal mask and verify every output row’s shape.']
    },
    {
      title: ['A blokk: residual, MLP, normalizálás és pozíció', 'The block: residuals, MLPs, normalization and position'], anchor: 'blokk',
      tasks: [
        ['Legyen x = [3, 4] és egy ág kimenete f(x) = [1, −1]. Számold ki a residual összeget x + f(x), és jelöld, mely számok származnak melyik ágból.', 'Let x = [3, 4] and branch output f(x) = [1, −1]. Compute x + f(x), labeling the contribution from each branch.'],
        ['Normalizáld x-et RMS-sel: oszd √((3² + 4²)/2)-vel. Ebben a játékpéldában az epsilont elhanyagoljuk, a tanulható skála 1.', 'RMS-normalize x by dividing by √((3² + 4²)/2). In this toy example epsilon is ignored and learned scale is 1.'],
        ['Forgasd el a [1, 0] vektort 90°-kal. Számold ki a [1, 0]-val vett skalárszorzatot előtte és utána; keresd meg a kapcsolatot a pozíciókódolással.', 'Rotate [1, 0] by 90°. Calculate its dot product with [1, 0] before and after rotation, then relate this to positional encoding.']
      ],
      problem: ['Mi lesz a residual összeg és az RMS-normalizált x? Lineárissá válik-e a teljes transzformer, ha csak az MLP aktivációját hagyjuk el?', 'What are the residual sum and RMS-normalized x? Does removing only the MLP activation make the entire transformer linear?'],
      answer: ['A residual összeg [4, 3]. Az RMS √12,5 ≈ 3,536, a normalizált x ≈ [0,849; 1,131]. A forgatott vektor [0, 1], a skalárszorzat 1-ről 0-ra változik. Az MLP aktivációjának elhagyása nem teszi lineárissá a teljes modellt: az attention és a normalizálás továbbra is nemlineáris. A 90°-os forgatás csak szemléltetés, nem egy teljes RoPE-beállítás.', 'The residual sum is [4, 3]. RMS is √12.5 ≈ 3.536; normalized x is approximately [0.849, 1.131]. Rotation gives [0, 1], changing the dot product from 1 to 0. Removing the MLP activation does not make the entire model linear: attention and normalization remain nonlinear. The 90° rotation is illustrative, not a full RoPE configuration.'],
      deliverable: ['Egy saját blokkrajz, három számolt példa és felirat minden összeadás vagy transzformáció mellett.', 'Your own block diagram, three worked examples and a label for every addition or transformation.'],
      research: ['Számold ki egy közös forgatás előtt és után két vektor skalárszorzatát. Magyarázd el, miért a relatív forgatás számít.', 'Compute a pair’s dot product before and after a common rotation. Explain why relative rotation matters.']
    },
    {
      title: ['Veszteség és visszafelé haladó gradiens', 'Loss and backward gradients'], anchor: 'tanitas',
      tasks: [
        ['Számold ki a helyes token veszteségét p = 0,8 és p = 0,2 mellett. Írd fel, miért a helyes token valószínűsége szerepel a −ln(p) képletben.', 'Compute the correct-token loss at p = 0.8 and p = 0.2. Explain why −ln(p) uses the probability of the correct token.'],
        ['Rajzold fel a w → u = 2w − 1 → L = u² gráfot. w = 2-nél számold ki az előrefelé haladó értékeket és a visszafelé haladó deriváltakat.', 'Draw w → u = 2w − 1 → L = u². At w = 2, calculate the forward values and backward derivatives.'],
        ['Végezz egy frissítést 0,1-es, majd az eredeti pontból 0,6-es tanulási rátával. Mindkettőnél számold újra a veszteséget.', 'Take one update with learning rate 0.1, then restart from the original point and use 0.6. Recalculate loss in both cases.']
      ],
      problem: ['A nagyobb tanulási ráta biztosan gyorsabb javulást ad? Ellenőrizd számszerűen.', 'Does a larger learning rate guarantee faster improvement? Check numerically.'],
      answer: ['A gradiens 12. A 0,1-es lépés w = 0,8-hoz és L = 0,36-hoz vezet. A 0,6-es lépés w = −5,2-t ad, ahol L = (−11,4)² = 129,96: sokkal rosszabb az eredeti 9-nél. A helyi lejtés nem mondja meg, mekkora távoli lépés biztonságos.', 'The gradient is 12. A 0.1 step gives w = 0.8 and L = 0.36. A 0.6 step gives w = −5.2 and L = (−11.4)² = 129.96, much worse than the original 9. Local slope does not determine whether a distant step is safe.'],
      deliverable: ['Feliratozott számítási gráf és két tanulási ráta előtte–utána táblázata.', 'An annotated computation graph and a before/after table comparing two learning rates.'],
      research: ['Ellenőrizd a 12-es deriváltat központi differenciával: [L(w+h) − L(w−h)]/(2h), h = 0,001. Írd le a módszer költségét sok paraméternél.', 'Check the derivative 12 using central differences: [L(w+h) − L(w−h)]/(2h), h = 0.001. Explain its cost with many parameters.']
    },
    {
      title: ['Mini tanítás és becsületes validálás', 'Miniature training and honest validation'], anchor: 'optim',
      tasks: [
        ['Tanítóadat: (x, y) = (1, 2), (2, 4). Validáló adat: (3, 6). A modell ŷ = wx, a tanítási veszteség a két négyzetes hiba átlaga. Indulj w = 0-ról.', 'Training data: (x, y) = (1, 2), (2, 4). Validation example: (3, 6). Model: ŷ = wx; training loss is mean squared error across the two training examples. Start at w = 0.'],
        ['Számold ki a gradienst: a 2x(wx − y) értékek átlaga. Frissíts 0,1-es rátával, majd számold ki külön a tanító- és validálóhibát.', 'Compute the gradient as the mean of 2x(wx − y). Update with learning rate 0.1, then calculate training and validation loss separately.'],
        ['Ismételd öt lépésig Pythonban vagy táblázatban. A validáló példából ne számolj gradienst. Rögzítsd a súlyt és mindkét veszteséget minden lépésnél.', 'Repeat for five steps in Python or a spreadsheet. Do not use the validation example to compute gradients. Record the weight and both losses at each step.']
      ],
      problem: ['Mennyi az első gradiens, az új súly és a két új veszteség? Elég egyetlen validáló példa a megbízható általánosítás igazolásához?', 'What are the first gradient, new weight and new losses? Does one validation example establish reliable generalization?'],
      answer: ['Kezdetben a gradiens (−4 − 16)/2 = −10, így w = 1. A tanítóhiba (1 + 4)/2 = 2,5, a validálóhiba 9. Egyetlen validáló pont nem ad megbízható általános képet; ez a különválasztás mechanikáját bemutató játékadat.', 'Initially the gradient is (−4 − 16)/2 = −10, so w becomes 1. Training loss is (1 + 4)/2 = 2.5; validation loss is 9. A single validation point cannot establish reliable generalization; this toy dataset illustrates the mechanics of separation.'],
      deliverable: ['Ötlépéses tanítási napló, külön tanító- és validálóoszloppal, és egy megjegyzés az adatok korlátairól.', 'A five-step training log with separate training and validation columns, plus a note about the data’s limitations.'],
      research: ['Adj zajt csak egy tanító célértékhez, például (2, 5). Hasonlítsd össze az optimális súlyt és a validálóhibát az eredeti esettel.', 'Add noise to one training target, for example (2, 5). Compare the optimal weight and validation error to the original case.']
    },
    {
      title: ['Utótanítás: példák, preferenciák és célok', 'Post-training: examples, preferences and objectives'], anchor: 'alignment',
      tasks: [
        ['Írj három kérdést: egy pontos számolást, egy hiányos információjú kérdést és egy stíluskérést. Mindegyikhez készíts két választ és egy ellenőrizhető értékelési szempontot.', 'Write three prompts: an exact calculation, a question with missing information, and a style request. Give two responses and a verifiable judging criterion for each.'],
        ['Jelöld, mely válasz lenne demonstráció SFT-hez, és melyik pár preferenciaadat. Különítsd el a tényszerű helyességet a választott stílustól.', 'Identify a demonstration suitable for SFT and a pair suitable for preference data. Separate factual correctness from preferred style.'],
        ['Egy egyszerű preferencia-modellben P(választott) = sigmoid(δ). Számold ki a −ln(P) veszteséget δ = 0 és δ = 1 mellett; sigmoid(δ) = 1/(1+e^(−δ)).', 'In a simple preference model, P(preferred) = sigmoid(δ). Calculate −ln(P) at δ = 0 and δ = 1, using sigmoid(δ) = 1/(1+e^(−δ)).']
      ],
      problem: ['A preferenciaveszteség csökkenése bizonyítja-e, hogy a választott válasz igaz? Melyik része modell és melyik része emberi döntés a példádnak?', 'Does a lower preference loss prove that the preferred answer is true? Which parts of your example are model behavior and which are human choices?'],
      answer: ['δ = 0-nál P = 0,5 és L ≈ 0,693; δ = 1-nél P ≈ 0,731 és L ≈ 0,313. Ez a megadott preferenciához való illeszkedést méri. A címke minősége külön kérdés; a hibásan preferált válasz is jobban illeszthető. Ez a logisztikus preferenciaveszteség szemléltetése, nem egy teljes RLHF- vagy DPO-futtatás.', 'At δ = 0, P = 0.5 and L ≈ 0.693; at δ = 1, P ≈ 0.731 and L ≈ 0.313. This measures agreement with the supplied preference. Label quality is separate; an incorrectly preferred answer can also be fitted better. This illustrates logistic preference loss, not a complete RLHF or DPO run.'],
      deliverable: ['Három címkézett válaszpár indoklással és egy rövid értékelési szabályzat, amely megkülönbözteti a stílust a helyességtől.', 'Three labeled response pairs with reasons, plus a short rubric separating style from correctness.'],
      research: ['A DPO-képletből külön írd ki a választott/elutasított válasz log-valószínűségarányát és a referenciamodell korrekcióját. Magyarázd el a β szerepét.', 'Separate the preferred/rejected log-probability ratio and reference-model correction in the DPO equation. Explain the role of β.']
    },
    {
      title: ['Inferencia, mintavétel és memória', 'Inference, sampling and memory'], anchor: 'inferencia',
      tasks: [
        ['Használj [2, 1, 0] logitokat. Számold ki a softmaxot T = 1 és T = 0,5 mellett; a hőmérséklet a logitokat osztja, nem a kész valószínűségeket.', 'Use logits [2, 1, 0]. Compute softmax at T = 1 and T = 0.5; temperature divides logits, not final probabilities.'],
        ['Becsüld meg egy példány KV-cache-ét a 2 × L × T × Hkv × d × b képlettel. L = 4 réteg, T = 128 token, Hkv = 2 fej, d = 16, b = 2 bájt.', 'Estimate one instance’s KV cache with 2 × L × T × Hkv × d × b. Use L = 4 layers, T = 128 tokens, Hkv = 2 heads, d = 16 and b = 2 bytes.'],
        ['Duplázd meg a kontextushosszt, majd külön a KV-fejek számát. Írd le, melyik memóriaigényt számoltad, és mi maradt ki: például modellparaméterek, ideiglenes tömbök.', 'Double context length, then separately double KV head count. State which memory you counted and what you omitted, such as model parameters and temporary arrays.']
      ],
      problem: ['Mennyi az eredeti KV-cache KiB-ban? Megduplázódik-e attól a teljes futtatás memóriaigénye, ha T-t duplázod?', 'What is the initial KV cache in KiB? Does doubling T double the total memory required to run the model?'],
      answer: ['2 × 4 × 128 × 2 × 16 × 2 = 65 536 bájt = 64 KiB. T duplázása ezt a cache-becslést 128 KiB-ra növeli. A teljes memória nem feltétlenül duplázódik, mert több összetevőből áll. T = 1-nél a softmax ≈ [0,665; 0,245; 0,090], T = 0,5-nél ≈ [0,867; 0,117; 0,016].', '2 × 4 × 128 × 2 × 16 × 2 = 65,536 bytes = 64 KiB. Doubling T gives 128 KiB for this cache estimate. Total memory does not necessarily double because it has several components. Softmax at T = 1 is approximately [0.665, 0.245, 0.090]; at T = 0.5 it is [0.867, 0.117, 0.016].'],
      deliverable: ['Két eloszlás összehasonlítása és három cache-becslés képlettel, mértékegységgel, feltételezésekkel.', 'Two probability distributions and three cache estimates, each with formula, units and assumptions.'],
      research: ['Bővítsd a képletet batchmérettel. Hasonlíts össze azonos query-fejszám mellett MHA-t és GQA-t eltérő Hkv értékekkel.', 'Extend the formula with batch size. Compare MHA and GQA at equal query-head counts but different Hkv values.']
    },
    {
      title: ['Mechanizmusok vizsgálata és oksági beavatkozás', 'Studying mechanisms and causal interventions'], anchor: 'interpretability',
      tasks: [
        ['Válassz egy egyszerű állítást: „ez a komponens hozzájárul a megfelelő folytatáshoz”. Írd le, mit mérnél, és milyen változtatás cáfolná az állítást.', 'Choose a simple claim: “this component contributes to the correct continuation”. State what you would measure and what observation would challenge the claim.'],
        ['Számold ki a helyreállítási arányt mesterséges logitkülönbségekkel: tiszta = 3, rontott = 1, patch után = 2,5. Képlet: (patch − rontott)/(tiszta − rontott).', 'Compute recovery using synthetic logit differences: clean = 3, corrupted = 1, patched = 2.5. Formula: (patched − corrupted)/(clean − corrupted).'],
        ['Tervezz két kontrollt: véletlenszerű másik komponens patch-elése és több, hasonló példán való ismétlés. Írd le, miért nem bizonyít okságot önmagában egy látványos attention-ábra.', 'Design two controls: patch a random different component and repeat across several comparable examples. Explain why an attractive attention map alone does not establish causality.']
      ],
      problem: ['Mennyi a helyreállítási arány, és mi a gond, ha a tiszta és rontott érték megegyezik?', 'What is the recovery score, and what goes wrong if clean and corrupted values are equal?'],
      answer: ['(2,5 − 1)/(3 − 1) = 0,75, azaz 75%. Azonos tiszta és rontott értéknél a nevező nulla: az arány nem értelmezett. Az arány 0 alá vagy 1 fölé is kerülhet. A fenti számok mesterségesek, és nem valódi modellben talált áramkör bizonyítékai.', '(2.5 − 1)/(3 − 1) = 0.75, or 75%. Equal clean and corrupted values give a zero denominator, so the score is undefined. Recovery can fall below 0 or exceed 1. These numbers are synthetic, not evidence of a circuit discovered in a real model.'],
      deliverable: ['Egyoldalas kísérletterv: állítás, beavatkozás, mérőszám, két kontroll és a sikertelen eredmény értelmezése.', 'A one-page experiment plan: claim, intervention, metric, two controls and an interpretation of a negative result.'],
      research: ['Vesd össze az ablationt, activation patchinget és attribution patchinget. Mindegyiknél adj egy lehetséges torzító tényezőt.', 'Compare ablation, activation patching and attribution patching. Give one possible confound for each.']
    },
    {
      title: ['Szuperpozíció, ritkaság és a magyarázat korlátai', 'Superposition, sparsity and the limits of explanation'], anchor: 'superpozicio',
      tasks: [
        ['Rajzolj három egységvektort két dimenzióban: a = [1, 0], b = [0, 1], c = [1/√2, 1/√2]. Számold ki a páronkénti skalárszorzatokat.', 'Draw three unit vectors in two dimensions: a = [1, 0], b = [0, 1], c = [1/√2, 1/√2]. Calculate pairwise dot products.'],
        ['Állítsd elő x = a + c értékét. Ezután állítsd elő ugyanezt x₁a + x₂b formában. Hasonlítsd össze a két reprezentáció együtthatóit és abszolútérték-összegét.', 'Construct x = a + c. Then reconstruct it as x₁a + x₂b. Compare the coefficients and their sums of absolute values.'],
        ['Írd le külön a rekonstrukciós hibát, a ritkasági büntetést és az értelmezhetőségi állítást. Magyarázd meg, miért nem azonos ez a három.', 'Distinguish reconstruction error, sparsity penalty and interpretability claims. Explain why they are not the same thing.']
      ],
      problem: ['Egyértelmű-e a tökéletes rekonstrukció? Melyik fenti reprezentáció L1-összege kisebb?', 'Is a perfect reconstruction necessarily unique? Which representation above has the smaller L1 sum?'],
      answer: ['x ≈ [1,707; 0,707]. Az a + c együtthatóinak L1-összege 2. Az 1,707a + 0,707b esetén ≈ 2,414. Mindkettő pontosan rekonstruál, ezért a kis rekonstrukciós hiba önmagában nem választ egyedi magyarázatot. Ez kézzel választott szótár, nem tanított SAE vagy bizonyított modelljellemző.', 'x ≈ [1.707, 0.707]. The coefficients of a + c have L1 sum 2, whereas 1.707a + 0.707b gives approximately 2.414. Both reconstruct exactly, so low reconstruction error alone does not select a unique explanation. This is a hand-chosen dictionary, not a trained SAE or verified model feature.'],
      deliverable: ['Ábra két eltérő, pontos rekonstrukcióval és három konkrét korlát egy SAE-jellemző értelmezéséhez.', 'A diagram of two different exact reconstructions and three concrete limitations of interpreting an SAE feature.'],
      research: ['Változtasd meg c irányát, és keresd meg, mikor ad kevesebb L1-büntetést a c-t használó felbontás. Beszéld meg a skálázás szerepét.', 'Change c’s direction and find when a representation using c incurs a smaller L1 penalty. Discuss the role of scaling.']
    },
    {
      title: ['Záróprojekt: reprodukálható állítás', 'Capstone: a reproducible claim'], anchor: 'modszerek',
      tasks: [
        ['Válassz egy korábbi laborból egyetlen kérdést, például: hogyan változik a figyelem eloszlása a query módosításával? Előre rögzítsd a bemeneteket, a mérőszámot és a jóslatodat.', 'Choose one question from an earlier lab, such as how changing a query affects attention weights. Specify inputs, metric and prediction before running comparisons.'],
        ['Futtass legalább tíz előre rögzített esetet és egy kontrollt. Mentsd a bemenetet, kimenetet és paramétereket CSV-be vagy táblázatba; a sikertelen eseteket is tartsd meg.', 'Run at least ten prespecified cases and one control. Save inputs, outputs and parameters in CSV or a table, retaining failed cases.'],
        ['Írj kétoldalas beszámolót: kérdés, módszer, eredmény, korlátok. Add oda a fájlokat valakinek, vagy futtasd újra üres környezetben a saját leírásod alapján.', 'Write a two-page report: question, method, results and limitations. Give someone the files, or rerun from a clean environment using only your instructions.']
      ],
      problem: ['Értékelési játékadat: ugyanazon húsz esetből az alapváltozat 14-et, az új 16-ot old meg. Mekkora a különbség? Bizonyítja-e ez önmagában, hogy az új módszer általában jobb?', 'Evaluation toy data: a baseline solves 14 of 20 cases and a new version solves 16 of the same 20. What is the difference? Does this alone prove the new method is generally better?'],
      answer: ['70% és 80%: a különbség 10 százalékpont, relatív értelemben körülbelül 14,3%. Húsz példa önmagában gyenge alap általános következtetéshez. Azonos eseteknél vizsgáld meg a páros hibákat, a mintaválasztást és a bizonytalanságot; független mintán ismételj. A játékadat nem egy valódi modell mérése.', 'The rates are 70% and 80%: a difference of 10 percentage points, or about 14.3% relative improvement. Twenty examples alone provide weak support for a general claim. For paired cases, inspect disagreements, sample selection and uncertainty; repeat on an independent sample. These toy counts are not measurements of a real model.'],
      deliverable: ['Újrafuttatható mini projekt, bemeneti adatok, eredménytábla és olyan következtetés, amely nem állít többet, mint amit a mérés alátámaszt.', 'A rerunnable mini project with input data, results table and a conclusion no stronger than the evidence supports.'],
      research: ['Válassz egy hivatkozott kutatási cikkből kis részállítást. Különítsd el a reprodukált és a csak elolvasott eredményt; a korlátokat tételesen rögzítsd.', 'Choose a small subclaim from a cited research paper. Distinguish results you reproduced from results you only read, and list limitations explicitly.']
    }
  ];

  function initialState() { return { route: 'foundations', checks: {} }; }
  var state = initialState();
  var storageAvailable = true;
  try {
    var stored = JSON.parse(window.localStorage.getItem(KEY) || 'null');
    if (stored && typeof stored === 'object') {
      if (stored.route === 'research') state.route = 'research';
      if (stored.checks && typeof stored.checks === 'object') {
        Object.keys(stored.checks).forEach(function (key) {
          if (/^w(?:[1-9]|1[0-2])-t[1-3]$/.test(key) && stored.checks[key] === true) state.checks[key] = true;
        });
      }
    }
  } catch (error) { storageAvailable = false; }

  function renderFoundation(item) {
    return '<details class="learn-foundation" id="alapok-' + item.id + '"><summary>' + t.apply(null, item.title) + '</summary>' +
      '<p>' + t.apply(null, item.text) + '</p><div class="learn-example"><strong>' + t('Végigszámolt példa', 'Worked example') + '</strong><p>' + t.apply(null, item.example) + '</p>' + (item.code ? '<pre><code>' + esc(item.code) + '</code></pre>' : '') + '</div>' +
      '<p><strong>' + t('Próbáld meg önállóan. ', 'Try it yourself. ') + '</strong>' + t.apply(null, item.question) + '</p>' + solution.apply(null, item.answer) +
      '<p class="learn-next">' + link(item.target, item.targetName[0], item.targetName[1]) + ' · ' + link('lab-' + ({vektor:'vectors', matrix:'matrix', valoszinuseg:'softmax', derivalt:'backprop', tenzor:'attention'})[item.id], 'Kipróbálom az interaktív ábrán →', 'Try the interactive diagram →') + '</p></details>';
  }
  function renderWeek(week, index) {
    var n = index + 1;
    return '<details class="learn-week" id="het-' + n + '"><summary><span class="learn-week-number">' + t(n + '. hét', 'Week ' + n) + '</span> ' + t.apply(null, week.title) +
      ' <span class="learn-week-count" data-week-count="' + n + '"></span></summary><p>' + link(week.anchor, 'Olvasmány megnyitása →', 'Open reading →') + '</p>' +
      '<ol class="learn-checklist">' + week.tasks.map(function (task, i) {
        var key = 'w' + n + '-t' + (i + 1);
        return '<li><label><input type="checkbox" data-learn-check="' + key + '"' + (state.checks[key] ? ' checked' : '') + '> <span>' + t.apply(null, task) + '</span></label></li>';
      }).join('') + '</ol><div class="learn-example"><strong>' + t('Heti önellenőrzés', 'Weekly checkpoint') + '</strong><p>' + t.apply(null, week.problem) + '</p>' + solution.apply(null, week.answer) + '</div>' +
      '<p class="learn-deliverable"><strong>' + t('A hét végére legyen meg: ', 'By the end of the week: ') + '</strong>' + t.apply(null, week.deliverable) + '</p>' +
      '<p class="learn-research" data-research' + (state.route === 'research' ? '' : ' hidden') + '><strong>' + t('Kutatói kiegészítés: ', 'Research extension: ') + '</strong>' + t.apply(null, week.research) + '</p></details>';
  }
  function updateStatus() {
    var total = 0;
    weeks.forEach(function (_week, i) {
      var done = 0;
      for (var j = 1; j <= 3; j++) if (state.checks['w' + (i + 1) + '-t' + j]) done++;
      total += done;
      var count = document.querySelector('[data-week-count="' + (i + 1) + '"]');
      if (count) count.textContent = done + '/3';
    });
    var status = document.getElementById('learn-progress');
    if (status) status.textContent = t(total + ' / 36 feladatot jelöltél késznek.', total + ' / 36 tasks marked complete.');
    var persistence = document.getElementById('learn-storage');
    if (persistence) persistence.textContent = storageAvailable ?
      t('A jelölések ebben a böngészőben mentődnek, és a magyar–angol nyelvváltásnál megmaradnak. Másik eszközre nem szinkronizálódnak.', 'Checks are saved in this browser and shared across the Hungarian and English editions. They do not sync to another device.') :
      t('A böngészőben tárolt haladás jelenleg nem érhető el. A feladatokat használhatod, de újratöltéskor a jelölések elveszhetnek.', 'Browser storage is currently unavailable. You can use the tasks, but checks may be lost after reloading.');
  }
  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); storageAvailable = true; }
    catch (error) { storageAvailable = false; }
    updateStatus();
  }
  function updateRoute() {
    document.querySelectorAll('[data-research]').forEach(function (el) { el.hidden = state.route !== 'research'; });
    var advice = document.getElementById('learn-route-advice');
    if (advice) advice.textContent = state.route === 'research' ?
      t('Kutatói út: a közös feladatok után a heti kutatói kiegészítésre fordítsd a napi opcionális 30 percet. A matematikai blokkokat csak akkor ugord át, ha a feladataikat önállóan megoldod. A cél egy kis állítás ellenőrzése és korlátainak megértése.', 'Research path: after the common tasks, spend the optional 30 minutes per day on each week’s research extension. Skip mathematical foundations only if you can solve their questions independently. Aim to test a small claim and understand its limits.') :
      t('Alapozó út: minden héten előbb a számpéldákat oldd meg, utána olvasd a formális levezetést. A kutatói kitérők opcionálisak. Ha egy feladat nem megy, az érintett alapozó blokkra fordítsd a napi opcionális 30 percet.', 'Foundation path: work through numerical examples before formal derivations each week. Research extensions are optional. If you get stuck, use the optional 30 minutes per day to revisit the relevant foundation block.');
  }
  function init() {
    if (document.getElementById('tanulasi-ut')) return;
    var first = document.getElementById('bevezetes');
    if (!first) return;
    var container = document.createElement('div');
    container.className = 'learn-companion';
    container.innerHTML = '<section id="alapok" class="learn-section"><h2>' + t('Alapozó: öt kapaszkodó a képletekhez', 'Foundations: five stepping stones to the equations') + '</h2>' +
      '<p class="learn-intro">' + t('Ha egy jelölésnél elakadsz, itt kezdd. Minden blokk egy fogalmat, egy végigszámolt példát és egy megoldással ellenőrizhető kérdést tartalmaz. Ezeket később is szabadon visszakeresheted.', 'Start here when notation gets in the way. Each block includes one concept, a worked example and a question with a solution. Return to them whenever needed.') + '</p>' +
      foundations.map(renderFoundation).join('') + '</section>' +
      '<section id="tanulasi-ut" class="learn-section"><h2>' + t('Tizenkét hét, kézzelfogható eredményekkel', 'Twelve weeks with tangible outcomes') + '</h2>' +
      '<p class="learn-intro">' + t('Intenzív, legfeljebb három hónapos útvonal: heti hat tanulónap, napi 90–120 perc, összesen körülbelül 108–144 óra. A hetedik nap pihenő vagy pótlás. A cél a működés megértése és néhány kis kísérlet önálló elvégzése; a lista kitöltése nem hivatalos vizsga és nem bizonyít teljes szakmai jártasságot.', 'An intensive route of at most three months: six study days a week, 90–120 minutes a day, approximately 108–144 hours in total. Use the seventh day for rest or catching up. The goal is understanding and a few independent small experiments; completing the checklist is not an official exam or proof of broad expertise.') + '</p>' +
      '<p>' + t('Kezdéshez elegendő az alapműveletek ismerete. A laborok és a kézi számolások ebben az oldalban használhatók. A programozási feladatokhoz helyi Python 3 vagy egy saját, megbízható notebook-környezet kell; fizetős API és GPU nem szükséges a közös útvonalhoz.', 'Basic arithmetic is enough to start. Labs and hand calculations are available on this page. Programming tasks need local Python 3 or a trusted notebook environment of your choice; the common path requires no paid API or GPU.') + '</p>' +
      '<div class="learn-route"><label for="learn-route">' + t('Milyen mélységben dolgoznál?', 'Choose your working depth') + '</label> <select id="learn-route"><option value="foundations"' + (state.route === 'foundations' ? ' selected' : '') + '>' + t('Alapozó út', 'Foundation path') + '</option><option value="research"' + (state.route === 'research' ? ' selected' : '') + '>' + t('Kutatói út', 'Research path') + '</option></select><p id="learn-route-advice"></p></div>' +
      '<details class="learn-routine"><summary>' + t('Így oszd be a hat tanulónapot', 'How to use the six study days') + '</summary><p>' +
      t('Napi 90 perc: 15 perc felidézés jegyzet nélkül, 25 perc olvasás, 40 perc számolás vagy kísérlet, 10 perc saját összefoglaló. Ha van 120 perced, a maradék 30 percet a nehéz pontra vagy a kutatói kiegészítésre fordítsd.', 'Each 90-minute session: 15 minutes recalling without notes, 25 minutes reading, 40 minutes calculating or experimenting, and 10 minutes summarizing in your own words. With 120 minutes, spend the remaining 30 on a difficult point or research extension.') + '</p><ol>' +
      [t('1. nap: olvasd el a kijelölt részt, kezdj az első feladattal.', 'Day 1: read the assigned section and start the first task.'),
        t('2. nap: fejezd be az első feladatot; számold újra segítség nélkül.', 'Day 2: finish the first task and repeat the calculation without help.'),
        t('3. nap: dolgozd ki a második feladat számpéldáját vagy kódját.', 'Day 3: work through the second task’s numerical example or code.'),
        t('4. nap: változtass egy bemeneten, jósolj, majd ellenőrizd a második feladat eredményét.', 'Day 4: change one input, predict, then check the second task’s result.'),
        t('5. nap: oldd meg a harmadik feladatot és a heti önellenőrzést.', 'Day 5: complete the third task and weekly checkpoint.'),
        t('6. nap: állítsd össze a heti eredményt, és magyarázd el jegyzet nélkül. A hiányzó részhez térj vissza.', 'Day 6: assemble the week’s deliverable and explain it without notes. Revisit anything missing.')].map(function (day) { return '<li>' + day + '</li>'; }).join('') + '</ol></details>' +
      '<p id="learn-progress" class="learn-status" role="status" aria-live="polite"></p><p id="learn-storage" class="learn-storage"></p>' +
      '<div class="learn-weeks">' + weeks.map(renderWeek).join('') + '</div></section>' +
      '<section id="lab-directory" class="learn-section"><h2>' + t('Interaktív kísérletek', 'Interactive experiments') + '</h2><p>' + t('Előbb jósolj, aztán módosíts egy változót. Figyeld a számokat is az ábra mellett: egy szemléletes kép önmagában nem bizonyítja, hogyan működik egy valódi modell.', 'Make a prediction, then change one variable. Inspect the numbers alongside the diagram: a compelling picture alone does not establish how a real model works.') + '</p><div class="learn-lab-links" data-lab-links></div></section>';
    first.parentNode.insertBefore(container, first);
    container.addEventListener('change', function (event) {
      var el = event.target;
      if (el.id === 'learn-route') { state.route = el.value === 'research' ? 'research' : 'foundations'; updateRoute(); save(); }
      if (el.hasAttribute('data-learn-check')) {
        var key = el.getAttribute('data-learn-check');
        if (el.checked) state.checks[key] = true; else delete state.checks[key];
        save();
      }
    });
    updateRoute();
    updateStatus();
  }
  window.KatedraLearning = { init: init };
}());
