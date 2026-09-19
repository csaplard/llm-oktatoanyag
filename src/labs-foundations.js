/* Deterministic teaching models. No requests, external dependencies or model data. */
(function () {
  'use strict';
  const L = window.KatedraLabs;
  const bi = (hu, en) => ({ hu, en });
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  const fmtVector = (a, api) => '(' + a.map(x => api.fmt(x)).join('; ') + ')';
  const note = text => '<p class="lab-readout">' + text + '</p>';
  const text = (x, y, value, color = 'var(--ink-2)', size = 16) => '<text x="' + x + '" y="' + y + '" fill="' + color + '" font-size="' + size + '">' + value + '</text>';
  function arrow(x1, y1, x2, y2, color, width = 3) {
    const angle = Math.atan2(y2 - y1, x2 - x1), head = 9;
    if (Math.hypot(x2 - x1, y2 - y1) < 0.1) return '<circle cx="' + x1 + '" cy="' + y1 + '" r="4" fill="' + color + '"/>';
    const p1 = [x2 - head * Math.cos(angle - .4), y2 - head * Math.sin(angle - .4)];
    const p2 = [x2 - head * Math.cos(angle + .4), y2 - head * Math.sin(angle + .4)];
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + color + '" stroke-width="' + width + '"/>' + '<polygon points="' + [x2, y2].join(',') + ' ' + p1.join(',') + ' ' + p2.join(',') + '" fill="' + color + '"/>';
  }
  function axes(cx, cy, scale, limit) {
    let out = '';
    for (let i = -limit; i <= limit; i++) {
      out += '<line x1="' + (cx + i * scale) + '" y1="' + (cy - limit * scale) + '" x2="' + (cx + i * scale) + '" y2="' + (cy + limit * scale) + '" stroke="var(--grid)"/>';
      out += '<line x1="' + (cx - limit * scale) + '" y1="' + (cy + i * scale) + '" x2="' + (cx + limit * scale) + '" y2="' + (cy + i * scale) + '" stroke="var(--grid)"/>';
    }
    out += '<path d="M' + (cx - limit * scale) + ' ' + cy + 'H' + (cx + limit * scale) + 'M' + cx + ' ' + (cy - limit * scale) + 'V' + (cy + limit * scale) + '" stroke="var(--ink-3)" fill="none"/>';
    return out + text(cx + limit * scale + 7, cy + 5, 'x') + text(cx + 7, cy - limit * scale - 8, 'y');
  }
  const corpora = {
    garden: [['alma', 4], ['almás', 2], ['almapüré', 1], ['körte', 3], ['körtés', 1]],
    classic: [['low', 5], ['lower', 2], ['newest', 6], ['widest', 3]]
  };
  function countPairs(words) {
    const counts = new Map();
    words.forEach(w => {
      for (let i = 0; i < w.tokens.length - 1; i++) {
        const key = w.tokens[i] + '\u0000' + w.tokens[i + 1];
        counts.set(key, (counts.get(key) || 0) + w.count);
      }
    });
    return Array.from(counts, ([key, frequency]) => ({ key, pair: key.split('\u0000'), frequency }))
      .sort((a, b) => b.frequency - a.frequency || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  }
  function bpeTrace(corpus, steps) {
    let words = corpus.map(([word, count]) => ({ word, count, tokens: Array.from(word).concat('▁') }));
    const history = [];
    for (let step = 0; step < steps; step++) {
      const candidates = countPairs(words);
      if (!candidates.length) break;
      const best = candidates[0];
      words = words.map(w => {
        const tokens = [];
        for (let i = 0; i < w.tokens.length; i++) {
          if (w.tokens[i] === best.pair[0] && w.tokens[i + 1] === best.pair[1]) {
            tokens.push(w.tokens[i] + w.tokens[i + 1]); i++;
          } else tokens.push(w.tokens[i]);
        }
        return { ...w, tokens };
      });
      history.push({ pair: best.pair, frequency: best.frequency });
    }
    return { words, history, candidates: countPairs(words) };
  }
  function vectorStats(angle, length) {
    const r = angle * Math.PI / 180, u = [2, 0], v = [length * Math.cos(r), length * Math.sin(r)];
    return { u, v, dot: dot(u, v), cosine: length === 0 ? null : Math.cos(r), length };
  }
  function matrixVector(matrix, vector) { return matrix.map(row => dot(row, vector)); }
  function softmaxStable(values, temperature = 1) {
    if (!(temperature > 0)) throw new RangeError('Temperature must be positive.');
    if (!values.length || values.some(v => Number.isNaN(v) || v === Infinity) || !values.some(Number.isFinite)) throw new RangeError('At least one finite logit is required.');
    const max = Math.max(...values), exp = values.map(x => Math.exp((x - max) / temperature));
    const sum = exp.reduce((a, b) => a + b, 0);
    return exp.map(x => x / sum);
  }
  function attentionToy(queryIndex, strength, causal) {
    const Q = [[1, 0], [1, 1], [1, 2]], K = [[1, 0], [0, 1], [strength, 1]], V = [[1, 0], [0, 1], [1, 1]];
    const scores = K.map((k, i) => causal && i > queryIndex ? -Infinity : dot(Q[queryIndex], k) / Math.sqrt(2));
    const probabilities = softmaxStable(scores);
    const output = [0, 1].map(d => probabilities.reduce((sum, p, i) => sum + p * V[i][d], 0));
    return { Q, K, V, scores, probabilities, output };
  }
  function descentTrace(initial, rate, steps, target = 3) {
    const trace = [];
    let weight = initial;
    for (let step = 0; step <= steps; step++) {
      trace.push({ step, weight, loss: .5 * (weight - target) ** 2, gradient: weight - target });
      weight -= rate * (weight - target);
    }
    return trace;
  }
  function scalarBackprop(weight, x, target) {
    const prediction = weight * x, error = prediction - target, loss = .5 * error ** 2;
    return { prediction, error, loss, dLossDerror: error, dErrorDprediction: 1, dPredictionDweight: x, gradient: error * x };
  }
  Object.assign(L.math || (L.math = {}), { bpeTrace, vectorStats, matrixVector, softmaxStable, attentionToy, descentTrace, scalarBackprop });

  L.register({
    id: 'bpe', anchor: 'tokenizacio',
    title: bi('Építs szótárat: BPE lépésről lépésre', 'Build a vocabulary: BPE step by step'),
    intro: bi('A gyakori szomszédos egységekből új egység lesz. A csúszka a tanítási lépéseket játssza vissza; a gyakoriságba a szó előfordulásszáma is beleszámít.', 'Frequent adjacent units become a new unit. The slider replays vocabulary training; pair frequencies include each word’s occurrence count.'),
    challenge: bi('Nézd meg az angol példát a 0. lépésnél. Miért 9 az „s + t” gyakorisága? Léptess, és kövesd, hogyan változik a párlista.', 'At step 0 of the English example, why is the frequency of “s + t” 9? Advance and follow how the pair list changes.'),
    limitation: bi('Karakteralapú, szóhatáron belüli tanpélda. A ▁ itt szóvégi jel. Nem egy valódi byte-level tokenizer, és a tokeneknek nincs itt modellbeli azonosítójuk. Holtversenyben a párok rögzített kódsorrendje dönt.', 'A character-level example with merges inside word boundaries. Here ▁ marks the end of a word. This is not a production byte-level tokenizer; tokens have no model IDs here. Ties use a fixed character-code order.'),
    controls: [
      { key: 'corpus', label: bi('Korpusz', 'Corpus'), type: 'select', value: 'classic', options: [{ value: 'classic', label: bi('Angol példaszavak', 'English example words') }, { value: 'garden', label: bi('Magyar példaszavak', 'Hungarian example words') }] },
      { key: 'steps', label: bi('Elvégzett összevonások', 'Completed merges'), type: 'range', min: 0, max: 10, step: 1, value: 0 }
    ],
    render(s, api) {
      const r = bpeTrace(corpora[s.corpus] || corpora.classic, s.steps), last = r.history[r.history.length - 1];
      const rows = r.words.map(w => [w.word, w.count + '×', w.tokens.join(' | ')]);
      const next = r.candidates[0];
      return api.table([api.t(bi('Szó', 'Word')), api.t(bi('Előfordulás', 'Occurrences')), api.t(bi('Jelenlegi felbontás', 'Current segmentation'))], rows)
        + (last ? note(api.t(bi('Utolsó összevonás: ', 'Last merge: ')) + '<strong>' + api.esc(last.pair.join(' + ')) + ' → ' + api.esc(last.pair.join('')) + '</strong>; ' + api.t(bi('gyakoriság: ', 'frequency: ')) + last.frequency + '.') : note(api.t(bi('Kezdetben minden karakter külön egység.', 'Initially, every character is a separate unit.'))))
        + api.bars(r.candidates.slice(0, 5).map(p => ({ label: p.pair.join(' + '), value: p.frequency })), Math.max(1, ...r.candidates.map(p => p.frequency)))
        + note(next ? api.t(bi('Következő kiválasztott pár: ', 'Next selected pair: ')) + '<strong>' + api.esc(next.pair.join(' + ')) + '</strong> (' + next.frequency + '). ' + api.t(bi('A fenti oszlopok a következő lépés előtti gyakoriságokat mutatják.', 'The bars show frequencies before the next merge.')) : api.t(bi('Nincs több összevonható pár.', 'No adjacent pairs remain.')));
    }
  });

  L.register({
    id: 'vectors', anchor: 'embedding',
    title: bi('A vektor hossza és iránya két külön dolog', 'A vector’s length and direction are different things'),
    intro: bi('A rögzített u = (2; 0) mellett forgasd és nyújtsd a v vektort. A skalárszorzat a hossztól is függ; a koszinuszhasonlóság csak az iránytól.', 'Rotate and stretch v beside the fixed vector u = (2; 0). The dot product depends on length as well; cosine similarity only depends on direction.'),
    challenge: bi('Állítsd a szöget 60°-ra, v hosszát 1-re. Növeld a hosszát 2-re: melyik szám változik? Ezután próbáld ki a 90°-ot és a nulla hosszt.', 'Set the angle to 60° and the length of v to 1. Increase its length to 2: which value changes? Then try 90° and zero length.'),
    limitation: bi('Kétdimenziós geometriai példa. Valós embeddingek sok száz vagy ezer dimenziósak; a koszinusz nem általános bizonyítéka a jelentésazonosságnak.', 'A two-dimensional geometry example. Real embeddings have hundreds or thousands of dimensions; cosine similarity is not a universal test of identical meaning.'),
    controls: [
      { key: 'angle', label: bi('v szöge u-hoz képest (fok)', 'Angle of v relative to u (degrees)'), type: 'range', min: -180, max: 180, step: 5, value: 60 },
      { key: 'length', label: bi('v hossza', 'Length of v'), type: 'range', min: 0, max: 3, step: .1, value: 2 }
    ],
    render(s, api) {
      const r = vectorStats(s.angle, s.length), cx = 160, cy = 135, scale = 35;
      const vx = cx + r.v[0] * scale, vy = cy - r.v[1] * scale;
      const diagram = axes(cx, cy, scale, 3) + arrow(cx, cy, cx + 2 * scale, cy, 'var(--s3)') + arrow(cx, cy, vx, vy, 'var(--s1)') + text(cx + 2 * scale + 6, cy + 22, 'u', 'var(--s3)') + text(clamp(vx + 8, 25, 290), clamp(vy - 10, 18, 250), 'v', 'var(--s1)') + '<line x1="' + vx + '" y1="' + vy + '" x2="' + vx + '" y2="' + cy + '" stroke="var(--s1)" stroke-dasharray="4 4"/>' + text(315, 90, 'u = (2; 0)') + text(315, 126, 'v = ' + fmtVector(r.v, api)) + text(315, 172, 'u · v = ' + api.fmt(r.dot), 'var(--s1)', 20) + text(315, 208, 'cos = ' + (r.cosine === null ? '—' : api.fmt(r.cosine)), 'var(--s3)', 20);
      return api.svg(diagram, api.t(bi('Két vektor és v vetülete az x tengelyen', 'Two vectors and the projection of v on the x axis')), '0 0 580 275')
        + note('u · v = 2 × ' + api.fmt(r.v[0]) + ' + 0 × ' + api.fmt(r.v[1]) + ' = <strong>' + api.fmt(r.dot) + '</strong>. ' + (r.cosine === null ? api.t(bi('A nullvektor iránya nincs meghatározva, ezért a koszinuszhasonlóság sem értelmezett.', 'The zero vector has no defined direction, so cosine similarity is undefined.')) : 'cos(u, v) = ' + api.fmt(r.dot) + ' / (2 × ' + api.fmt(r.length) + ') = <strong>' + api.fmt(r.cosine) + '</strong>.'));
    }
  });

  L.register({
    id: 'matrix', anchor: 'embedding',
    title: bi('Mit csinál a mátrix egy vektorral?', 'What does a matrix do to a vector?'),
    intro: bi('Az oszlopok megmondják, hová kerül a két egységvektor. Ezek súlyozott összege adja az új vektort. A világos négyzet az eredeti, a zöld alakzat az átalakított egységnégyzet.', 'The columns show where the two unit vectors go. Their weighted sum gives the new vector. The pale square is the original unit square; the green shape is its transformation.'),
    challenge: bi('Állítsd be a [[0; −1]; [1; 0]] mátrixot: 90°-os forgatás történik. Ezután nullázd a második sort: mi történik a négyzettel?', 'Set the matrix to [[0, −1], [1, 0]]: this produces a 90° rotation. Then set the second row to zero: what happens to the square?'),
    limitation: bi('Kétdimenziós lineáris leképezés, eltolás nélkül. Itt oszlopvektorral, A×x alakban számolunk; az alapozó sorvektoros x×W alakja transzponálással feleltethető meg ennek. Egy teljes neurális hálózat több ilyen műveletből és nemlinearitásokból áll.', 'A two-dimensional linear map without a bias. This uses column vectors, A×x; transpose to convert to the row-vector x×W convention used in the foundations. A whole neural network combines many such operations with nonlinearities.'),
    controls: [
      { key: 'a', label: bi('A₁₁ · első sor, első oszlop', 'A₁₁ · row 1, column 1'), type: 'range', min: -2, max: 2, step: .25, value: 1 },
      { key: 'b', label: bi('A₁₂ · első sor, második oszlop', 'A₁₂ · row 1, column 2'), type: 'range', min: -2, max: 2, step: .25, value: .5 },
      { key: 'c', label: bi('A₂₁ · második sor, első oszlop', 'A₂₁ · row 2, column 1'), type: 'range', min: -2, max: 2, step: .25, value: 0 },
      { key: 'd', label: bi('A₂₂ · második sor, második oszlop', 'A₂₂ · row 2, column 2'), type: 'range', min: -2, max: 2, step: .25, value: 1 },
      { key: 'vector', label: bi('Bemeneti x vektor', 'Input vector x'), type: 'select', value: '1,1', options: [{ value: '1,1', label: bi('(1; 1)', '(1; 1)') }, { value: '1,0', label: bi('(1; 0)', '(1; 0)') }, { value: '0,1', label: bi('(0; 1)', '(0; 1)') }] }
    ],
    render(s, api) {
      const m = [[s.a, s.b], [s.c, s.d]], x = s.vector.split(',').map(Number), y = matrixVector(m, x), cx = 155, cy = 145, scale = 27;
      const point = v => [cx + v[0] * scale, cy - v[1] * scale];
      const square = [[0, 0], [1, 0], [1, 1], [0, 1]];
      const polygon = (vertices, fill, stroke) => '<polygon points="' + vertices.map(v => point(v).join(',')).join(' ') + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"/>';
      const diagram = axes(cx, cy, scale, 4) + polygon(square, 'var(--surface-2)', 'var(--ink-3)') + polygon(square.map(v => matrixVector(m, v)), 'var(--accent-soft)', 'var(--s1)') + arrow(cx, cy, ...point(x), 'var(--s3)', 2) + arrow(cx, cy, ...point(y), 'var(--s1)') + text(305, 100, 'x = ' + fmtVector(x, api), 'var(--s3)') + text(305, 145, 'Ax = ' + fmtVector(y, api), 'var(--s1)', 20) + text(305, 198, 'det(A) = ' + api.fmt(s.a * s.d - s.b * s.c));
      return api.svg(diagram, api.t(bi('Az egységnégyzet és a kiválasztott vektor mátrixtranszformációja', 'Matrix transformation of the unit square and selected vector')), '0 0 560 285')
        + api.table([api.t(bi('Kimenet', 'Output')), api.t(bi('Sor × bemeneti vektor', 'Row × input vector'))], [['y₁ = ' + api.fmt(y[0]), api.fmt(s.a) + ' × ' + x[0] + ' + ' + api.fmt(s.b) + ' × ' + x[1]], ['y₂ = ' + api.fmt(y[1]), api.fmt(s.c) + ' × ' + x[0] + ' + ' + api.fmt(s.d) + ' × ' + x[1]]])
        + note(api.t(bi('A determináns ', 'The determinant ')) + '<strong>' + api.fmt(s.a * s.d - s.b * s.c) + '</strong>. ' + api.t(bi('Abszolút értéke a terület szorzója; nulla esetén a síkbeli alakzat vonallá vagy ponttá lapul.', 'Its absolute value is the area scale factor; at zero, the shape collapses to a line or point.')));
    }
  });

  L.register({
    id: 'softmax', anchor: 'kimenet',
    title: bi('Logitból valószínűség: próbáld ki a softmaxot', 'From logits to probabilities: try softmax'),
    intro: bi('A három logit még nem valószínűség. A softmax pozitív számokká alakítja és az összegükkel osztja őket. A hőmérséklet az eloszlás élességét változtatja.', 'The three logits are not probabilities yet. Softmax converts them to positive values and divides by their sum. Temperature changes how concentrated the distribution is.'),
    challenge: bi('Állítsd mindhárom logitot nullára, majd csak A-t növeld 1-re. A valószínűség nem e-szeresére nő: a többi jelölthöz viszonyított aránya változik így, T = 1 mellett.', 'Set all logits to zero, then increase only A to 1. Its probability does not grow by a factor of e: its ratio to each other candidate does, at T = 1.'),
    limitation: bi('Három mesterséges jelölt; valódi szókészletben sok ezer elem lehet. Nincs mintavételezés, top-k vagy top-p szűrés. A T = 0 határesetet ez a csúszka nem tartalmazza.', 'Three artificial candidates; a real vocabulary can contain many thousands. No sampling, top-k or top-p filtering is applied. The slider excludes the limiting case T = 0.'),
    controls: ['a', 'b', 'c'].map((key, i) => ({ key, label: bi('Logit ' + 'ABC'[i], 'Logit ' + 'ABC'[i]), type: 'range', min: -4, max: 4, step: .25, value: [1, 0, -1][i] })).concat({ key: 'temperature', label: bi('T · hőmérséklet', 'T · temperature'), type: 'range', min: .2, max: 2, step: .1, value: 1 }),
    render(s, api) {
      const logits = [s.a, s.b, s.c], probabilities = softmaxStable(logits, s.temperature), maximum = Math.max(...logits), exp = logits.map(v => Math.exp((v - maximum) / s.temperature)), total = exp.reduce((a, b) => a + b, 0);
      const entropy = -probabilities.reduce((sum, p) => sum + (p > 0 ? p * Math.log2(p) : 0), 0);
      return api.bars(probabilities.map((p, i) => ({ label: 'ABC'[i] + ' · ' + api.fmt(p * 100, 1) + '%', value: p })), 1)
        + api.table([api.t(bi('Jelölt', 'Candidate')), 'z', 'exp((z − max z) / T)', 'p'], logits.map((v, i) => ['ABC'[i], api.fmt(v), api.fmt(exp[i], 4), api.fmt(probabilities[i], 4)]))
        + note(api.t(bi('A stabil számításhoz minden logitból ugyanazt a maximumot vonjuk ki; ez nem változtatja meg az eredményt.', 'For stable computation, we subtract the same maximum from every logit; this does not change the result.')) + ' p(A) = ' + api.fmt(exp[0], 4) + ' / ' + api.fmt(total, 4) + ' = <strong>' + api.fmt(probabilities[0], 4) + '</strong>.')
        + note('Σp = <strong>' + api.fmt(probabilities.reduce((a, b) => a + b, 0), 4) + '</strong>; ' + api.t(bi('entrópia', 'entropy')) + ' = ' + api.fmt(entropy, 3) + ' bit. ' + api.t(bi('Kisebb entrópia: koncentráltabb eloszlás. Egyenlő logitoknál minden pozitív T egyenletes eloszlást ad.', 'Lower entropy means a more concentrated distribution. Equal logits give a uniform distribution at every positive T.')));
    }
  });

  L.register({
    id: 'attention', anchor: 'attention',
    title: bi('Három token, egy valódi attention-számítás', 'Three tokens, one actual attention computation'),
    intro: bi('Válaszd ki, melyik pozíció olvas. A query a kulcsokkal ad pontszámot; a softmax súlyai a value vektorokat keverik össze. Figyeld meg, mit zár ki a kauzális maszk.', 'Choose which position reads. Its query scores the keys; softmax weights mix the value vectors. Observe which positions the causal mask excludes.'),
    challenge: bi('Olvass a második pozícióból, bekapcsolt maszkkal, és változtasd K₃ első koordinátáját: a kimenet változatlan. Ezután kapcsold ki a maszkot: most már a jövőbeli kulcs is befolyásolja az eredményt.', 'Read from position 2 with the mask on and change the first coordinate of K₃: the output stays unchanged. Then turn the mask off: the future key can now affect the result.'),
    limitation: bi('Egy attention-fej, három pozíció, dₖ = 2. A Q, K és V kézzel megadott számok, nem egy modell mért aktivációi. A pozíciókódolást, a kimeneti vetítést és a residual kapcsolatot itt elhagyjuk.', 'One attention head, three positions, dₖ = 2. Q, K and V are hand-chosen values, not measured model activations. Position encoding, the output projection and the residual connection are omitted.'),
    controls: [
      { key: 'query', label: bi('Olvasó pozíció', 'Reading position'), type: 'select', value: '1', options: [{ value: '0', label: bi('1 · A', '1 · The') }, { value: '1', label: bi('2 · macska', '2 · cat') }, { value: '2', label: bi('3 · alszik', '3 · sleeps') }] },
      { key: 'strength', label: bi('K₃ első koordinátája', 'First coordinate of K₃'), type: 'range', min: -3, max: 3, step: .25, value: 1 },
      { key: 'causal', label: bi('Kauzális maszk: csak saját és korábbi pozíció', 'Causal mask: only current and earlier positions'), type: 'checkbox', value: true }
    ],
    render(s, api) {
      const query = Number(s.query), r = attentionToy(query, s.strength, s.causal), words = api.lang === 'hu' ? ['A', 'macska', 'alszik'] : ['The', 'cat', 'sleeps'];
      let diagram = text(20, 30, 'q' + (query + 1) + ' = ' + fmtVector(r.Q[query], api), 'var(--s1)', 18);
      for (let i = 0; i < 3; i++) {
        const x = 55 + i * 190, p = r.probabilities[i], masked = !Number.isFinite(r.scores[i]);
        diagram += '<line x1="285" y1="58" x2="' + (x + 40) + '" y2="132" stroke="' + (masked ? 'var(--border-strong)' : 'var(--s1)') + '" stroke-width="' + (masked ? 2 : 2 + p * 12) + '"' + (masked ? ' stroke-dasharray="4 5"' : '') + '/>';
        diagram += '<rect x="' + x + '" y="132" width="95" height="42" rx="2" fill="' + (masked ? 'var(--surface-2)' : 'var(--accent-soft)') + '" stroke="var(--border-strong)"/>' + text(x + 9, 159, api.esc(words[i])) + text(x, 199, masked ? api.t(bi('kizárva · 0%', 'masked · 0%')) : api.fmt(p * 100, 1) + '%', masked ? 'var(--ink-3)' : 'var(--s1)');
      }
      return api.svg(diagram, api.t(bi('A kiválasztott query olvasási súlyai három pozícióra', 'Reading weights of the selected query over three positions')), '0 0 590 220')
        + api.table([api.t(bi('Pozíció', 'Position')), 'K', 'V', 'q · k / √2', api.t(bi('Súly', 'Weight'))], words.map((word, i) => [(i + 1) + ' · ' + word, fmtVector(r.K[i], api), fmtVector(r.V[i], api), Number.isFinite(r.scores[i]) ? api.fmt(r.scores[i], 3) : '−∞', api.fmt(r.probabilities[i], 3)]))
        + note('o = ' + r.probabilities.map((p, i) => api.fmt(p, 3) + ' × ' + fmtVector(r.V[i], api)).join(' + ') + ' = <strong>' + fmtVector(r.output, api) + '</strong>. ' + api.t(bi('A súlyok összege 1. A kizárt pozíció súlya pontosan 0.', 'Weights sum to 1. A masked position has exactly zero weight.')));
    }
  });

  L.register({
    id: 'gradient', anchor: 'optim',
    title: bi('Tanulási ráta: közelítés, billegés vagy elszállás', 'Learning rate: convergence, oscillation or divergence'),
    intro: bi('Egyetlen w paramétert tanítunk: L(w) = ½(w − 3)². A gradiens w − 3, ezért a lépés w ← w − η(w − 3). Módosítsd a lépésszámot és a tanulási rátát.', 'Train one parameter w: L(w) = ½(w − 3)². The gradient is w − 3, so the update is w ← w − η(w − 3). Change the step count and learning rate.'),
    challenge: bi('Próbáld ki az η = 0,5; 1; 1,5; 2; 2,2 értékeket. Mikor éri el egy lépésben a minimumot? Mikor marad változatlan a loss, miközben w ide-oda ugrál?', 'Try η = 0.5, 1, 1.5, 2 and 2.2. When does one step reach the minimum? When does loss stay constant while w jumps back and forth?'),
    limitation: bi('Determinista egydimenziós kvadratikus feladat. A 0 < η < 2 stabilitási tartomány erre a görbületre igaz; egy valódi hálózatnak nincs ilyen általános küszöbe.', 'A deterministic one-dimensional quadratic problem. The stability interval 0 < η < 2 applies to this curvature; real networks do not have this universal threshold.'),
    controls: [
      { key: 'rate', label: bi('η · tanulási ráta', 'η · learning rate'), type: 'range', min: 0, max: 2.5, step: .1, value: .5 },
      { key: 'steps', label: bi('Elvégzett lépések', 'Completed steps'), type: 'range', min: 0, max: 15, step: 1, value: 5 },
      { key: 'initial', label: bi('Kezdő w', 'Initial w'), type: 'range', min: -2, max: 6, step: 1, value: -1 }
    ],
    render(s, api) {
      const trace = descentTrace(s.initial, s.rate, s.steps), last = trace[trace.length - 1], previous = trace[Math.max(0, trace.length - 2)];
      const extent = Math.max(5, ...trace.map(p => Math.abs(p.weight - 3))) * 1.1, maxLoss = .5 * extent ** 2;
      const px = w => 48 + ((w - 3 + extent) / (2 * extent)) * 480, py = loss => 220 - loss / maxLoss * 175;
      let curve = '';
      for (let i = 0; i <= 100; i++) { const w = 3 - extent + 2 * extent * i / 100; curve += (i ? 'L' : 'M') + px(w) + ' ' + py(.5 * (w - 3) ** 2); }
      let diagram = '<path d="M48 35V220H550" fill="none" stroke="var(--ink-3)"/><path d="' + curve + '" fill="none" stroke="var(--s3)" stroke-width="2"/>' + text(12, 30, 'L(w)') + text(549, 243, 'w') + text(px(3) - 6, 244, '3') + text(48, 263, api.fmt(3 - extent, 1)) + text(460, 263, api.fmt(3 + extent, 1));
      diagram += '<polyline points="' + trace.map(p => px(p.weight) + ',' + py(p.loss)).join(' ') + '" fill="none" stroke="var(--s1)" stroke-width="1.5" stroke-dasharray="4 3"/>';
      trace.forEach((p, i) => { diagram += '<circle cx="' + px(p.weight) + '" cy="' + py(p.loss) + '" r="' + (i === trace.length - 1 ? 6 : 3) + '" fill="var(--s1)"/>'; });
      const status = s.initial === 3 ? bi('A minimumról indultál: minden lépés nulla.', 'You started at the minimum: every update is zero.') : s.rate === 0 ? bi('η = 0: nincs tanulás.', 'η = 0: no learning.') : s.rate < 2 ? bi('Ebben a feladatban a lépések a minimumhoz tartanak.', 'For this problem, updates converge to the minimum.') : s.rate === 2 ? bi('η = 2: azonos távolságban billeg, a loss nem csökken.', 'η = 2: oscillation at constant distance; loss does not decrease.') : bi('η > 2: a minimumtól való eltérés minden lépéssel nő.', 'η > 2: distance from the minimum grows at each step.');
      return api.svg(diagram, api.t(bi('Kvadratikus loss és a paraméter egymást követő helyei; a tengely automatikusan skálázódik', 'Quadratic loss and successive parameter positions; the axes rescale automatically')), '0 0 590 280')
        + note(api.t(bi('Aktuális állapot: ', 'Current state: ')) + 'w = <strong>' + api.fmt(last.weight, 4) + '</strong>; L = <strong>' + api.fmt(last.loss, 4) + '</strong>; ∂L/∂w = ' + api.fmt(last.gradient, 4) + '. ' + api.t(status))
        + (s.steps > 0 ? note(api.t(bi('Utolsó lépés: ', 'Last update: ')) + api.fmt(previous.weight, 4) + ' − ' + api.fmt(s.rate, 1) + ' × (' + api.fmt(previous.gradient, 4) + ') = ' + api.fmt(last.weight, 4) + '.') : '')
        + api.table([api.t(bi('Lépés', 'Step')), 'w', 'L(w)'], trace.slice(-5).map(p => [p.step, api.fmt(p.weight, 4), api.fmt(p.loss, 4)]))
        + note(api.t(bi('Az ábra tengelyei automatikusan skálázódnak. A táblázat legfeljebb az utolsó öt állapotot mutatja; a pontok közti vonal csak a lépések sorrendjét jelöli.', 'Axes rescale automatically. The table shows up to the last five states; the line between points only indicates the order of updates.')));
    }
  });

  L.register({
    id: 'backprop', anchor: 'backprop',
    title: bi('Backprop: kövesd vissza egyetlen súly hatását', 'Backprop: trace the effect of one weight'),
    intro: bi('Előre kiszámoljuk az eredményt: ŷ = w × x, e = ŷ − y, L = ½e². Visszafelé a helyi deriváltakat szorozzuk össze. A bemenet és a célérték itt rögzített adat, csak w-t tanítjuk.', 'Compute forward: ŷ = w × x, e = ŷ − y, L = ½e². Backward, multiply local derivatives. The input and target are fixed data for the derivative; only w is trained.'),
    challenge: bi('Állítsd x-et nullára. A loss lehet pozitív, miközben ∂L/∂w = 0: miért nem segít ezen a példán w változtatása? Ezután válaszd x = 2, y = 3, w = 1 értékeket és számold ki a gradienst.', 'Set x to zero. Loss can be positive while ∂L/∂w = 0: why can changing w not help this example? Then choose x = 2, y = 3, w = 1 and calculate the gradient.'),
    limitation: bi('Egyetlen adatpont és skalárparaméter, négyzetes loss. A valós LLM-ek tenzorokkal és tipikusan keresztentrópiával dolgoznak; ugyanaz a láncszabály érvényes, sokkal nagyobb gráfon.', 'One data point and one scalar parameter with squared loss. Real LLMs use tensors and typically cross-entropy; the same chain rule applies to a much larger graph.'),
    controls: [
      { key: 'weight', label: bi('w · tanulható súly', 'w · trainable weight'), type: 'range', min: -3, max: 3, step: .25, value: 1 },
      { key: 'input', label: bi('x · bemenet', 'x · input'), type: 'range', min: -3, max: 3, step: .5, value: 2 },
      { key: 'target', label: bi('y · célérték', 'y · target'), type: 'range', min: -4, max: 4, step: .5, value: 3 }
    ],
    render(s, api) {
      const r = scalarBackprop(s.weight, s.input, s.target), nodes = [{ label: 'w', value: s.weight }, { label: 'ŷ = w × x', value: r.prediction }, { label: 'e = ŷ − y', value: r.error }, { label: 'L = ½e²', value: r.loss }];
      let diagram = text(18, 27, api.t(bi('Előre: értékek', 'Forward: values')), 'var(--s1)', 18);
      nodes.forEach((node, i) => {
        const x = 18 + i * 146;
        diagram += '<rect x="' + x + '" y="48" width="118" height="74" rx="2" fill="var(--accent-soft)" stroke="var(--border-strong)"/>' + text(x + 10, 75, node.label) + text(x + 10, 106, api.fmt(node.value), 'var(--s1)', 20);
        if (i < 3) diagram += arrow(x + 122, 85, x + 140, 85, 'var(--s1)', 2);
      });
      diagram += text(18, 158, api.t(bi('Vissza: helyi deriváltak szorzata', 'Backward: product of local derivatives')), 'var(--s3)', 18);
      const locals = ['× x = ' + api.fmt(s.input), '× 1', '× e = ' + api.fmt(r.error)];
      for (let i = 0; i < 3; i++) { const x = 18 + i * 146; diagram += arrow(x + 145, 187, x + 7, 187, 'var(--s3)', 2) + text(x + 12, 214, locals[i], 'var(--s3)', 15); }
      return api.svg(diagram, api.t(bi('Számítási gráf előrefelé értékekkel és visszafelé helyi deriváltakkal', 'Computation graph with forward values and backward local derivatives')), '0 0 590 232')
        + note('∂L/∂w = (∂L/∂e) × (∂e/∂ŷ) × (∂ŷ/∂w) = ' + api.fmt(r.error) + ' × 1 × ' + api.fmt(s.input) + ' = <strong>' + api.fmt(r.gradient) + '</strong>.')
        + note(api.t(r.gradient > 0 ? bi('Pozitív gradiens: egy elég kicsi, negatív irányú w-lépés csökkenti a losst.', 'Positive gradient: a sufficiently small negative change in w decreases loss.') : r.gradient < 0 ? bi('Negatív gradiens: egy elég kicsi, pozitív irányú w-lépés csökkenti a losst.', 'Negative gradient: a sufficiently small positive change in w decreases loss.') : s.input === 0 ? bi('x = 0 miatt w nem befolyásolja a becslést. A nulla gradiens itt nem bizonyít nulla hibát.', 'With x = 0, w cannot affect the prediction. Zero gradient here does not imply zero error.') : bi('A becslés megegyezik a célértékkel; ezen az adatponton a loss és a gradiens is nulla.', 'The prediction equals the target; loss and gradient are both zero for this data point.')));
    }
  });
})();
