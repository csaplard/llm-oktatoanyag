/* Katedra: explicit, deterministic teaching models. No model activations are sampled. */
(function () {
  'use strict';
  const K = window.KatedraLabs;
  const L = (hu, en) => ({ hu, en });
  const range = (key, hu, en, min, max, step, value) => ({ key, label: L(hu, en), type: 'range', min, max, step, value });
  const check = (key, hu, en, value) => ({ key, label: L(hu, en), type: 'checkbox', value });
  const sigmoid = x => 1 / (1 + Math.exp(-x));
  const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const add = (a, b) => a.map((v, i) => v + b[i]);
  const mul = (a, s) => a.map(v => v * s);
  const vec = (v, api, digits = 2) => '[' + v.map(x => api.fmt(x, digits)).join('; ') + ']';
  const text = (x, y, value, api, color = '--ink-1', anchor = 'start', size = 16) =>
    `<text x="${x}" y="${y}" fill="var(${color})" font-size="${size}" text-anchor="${anchor}">${api.esc(value)}</text>`;
  function arrow(x1, y1, x2, y2, color, dashed = false, width = 3) {
    const angle = Math.atan2(y2 - y1, x2 - x1), size = 9;
    const line = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(${color})" stroke-width="${width}"${dashed ? ' stroke-dasharray="6 5"' : ''}/>`;
    if (Math.hypot(x2 - x1, y2 - y1) < 0.01) return line;
    return line + `<polygon points="${x2},${y2} ${x2 - size * Math.cos(angle - .45)},${y2 - size * Math.sin(angle - .45)} ${x2 - size * Math.cos(angle + .45)},${y2 - size * Math.sin(angle + .45)}" fill="var(${color})"/>`;
  }
  function axes(cx, cy, radius, api) {
    return `<line x1="${cx - radius}" y1="${cy}" x2="${cx + radius}" y2="${cy}" stroke="var(--border-strong)"/>
      <line x1="${cx}" y1="${cy - radius}" x2="${cx}" y2="${cy + radius}" stroke="var(--border-strong)"/>` +
      text(cx + radius - 4, cy - 9, 'x', api, '--ink-3', 'end', 14) + text(cx + 8, cy - radius + 12, 'y', api, '--ink-3', 'start', 14);
  }

  function residual({ attention = true, mlp = true, gain = 1 } = {}) {
    const input = [1, .5];
    const a = mul([.8, 1.2], attention ? gain : 0);
    const m = mul([.7, -.9], mlp ? gain : 0);
    const afterAttention = add(input, a);
    return { input, a, m, afterAttention, output: add(afterAttention, m) };
  }
  function normalization({ scale = 1, offset = 0 } = {}) {
    const epsilon = 1e-5, x = [-2, -1, 1, 2].map(v => scale * v + offset);
    const mean = x.reduce((a, b) => a + b, 0) / x.length;
    const variance = x.reduce((a, v) => a + (v - mean) ** 2, 0) / x.length;
    const meanSquare = x.reduce((a, v) => a + v * v, 0) / x.length;
    return { x, mean, variance, rms: Math.sqrt(meanSquare), epsilon,
      ln: x.map(v => (v - mean) / Math.sqrt(variance + epsilon)),
      rmsnorm: x.map(v => v / Math.sqrt(meanSquare + epsilon)) };
  }
  function rope({ query = 3, key = 1, shift = 0 } = {}) {
    const frequency = Math.PI / 6, baseAngle = Math.PI / 6;
    const qa = (query + shift) * frequency, ka = baseAngle + (key + shift) * frequency;
    const q = [Math.cos(qa), Math.sin(qa)], k = [Math.cos(ka), Math.sin(ka)];
    return { q, k, dot: dot(q, k), scaled: dot(q, k) / Math.sqrt(2), relative: key - query,
      expected: Math.cos(baseAngle + (key - query) * frequency), frequency };
  }
  function kvCache({ context = 8192, batch = 1, heads = 8 } = {}) {
    const layers = 32, headDim = 128, bytesPerElement = 2;
    const bytes = 2 * batch * layers * heads * context * headDim * bytesPerElement;
    const gib = bytes / 2 ** 30, weightsGiB = 7e9 * 2 / 2 ** 30;
    return { bytes, gib, weightsGiB, totalGiB: gib + weightsGiB, mhaGiB: gib * 32 / heads,
      layers, headDim, bytesPerElement };
  }
  function superposition({ angle = 120, a = true, b = false, c = false } = {}) {
    const theta = angle * Math.PI / 180;
    const vectors = [[1, 0], [Math.cos(theta), Math.sin(theta)], [Math.cos(theta), -Math.sin(theta)]];
    const x = [Number(a), Number(b), Number(c)];
    const h = vectors.reduce((sum, v, i) => add(sum, mul(v, x[i])), [0, 0]);
    const readout = vectors.map(v => dot(v, h)), reconstructed = readout.map(v => Math.max(0, v));
    return { vectors, x, h, readout, reconstructed,
      mse: reconstructed.reduce((s, v, i) => s + (v - x[i]) ** 2, 0) / 3 };
  }
  function patching({ source = 'clean', patch = 'none' } = {}) {
    const run = x => ({ x, a: 2 * x, b: Math.max(0, x), z: 2 * x + Math.max(0, x) });
    const clean = run(1), corrupt = run(-1), donor = source === 'clean' ? clean : corrupt;
    const patched = { ...corrupt };
    if (patch === 'a' || patch === 'both') patched.a = donor.a;
    if (patch === 'b' || patch === 'both') patched.b = donor.b;
    patched.z = patched.a + patched.b;
    return { clean, corrupt, patched, recovery: (patched.z - corrupt.z) / (clean.z - corrupt.z),
      probability: sigmoid(patched.z) };
  }
  function preference({ logOdds = 0, beta = .5, strength = 1 } = {}) {
    const pairWinProb = sigmoid(beta * logOdds), gradient = beta * (pairWinProb - strength);
    const nextLogOdds = logOdds - gradient;
    const softplus = x => Math.max(0, x) + Math.log1p(Math.exp(-Math.abs(x)));
    const lossAt = z => softplus(beta * z) - strength * beta * z;
    return { p: sigmoid(logOdds), pairWinProb, loss: lossAt(logOdds), gradient,
      nextLogOdds, nextP: sigmoid(nextLogOdds), nextLoss: lossAt(nextLogOdds) };
  }
  Object.assign(K.math || (K.math = {}), { residual, normalization, rope, kvCache, superposition, patching, preference });

  K.register({
    id: 'residual', anchor: 'residual-stream',
    title: L('A residual stream: összeadás a síkon', 'Residual stream: addition on a plane'),
    intro: L('A két szám most a teljes rejtett állapot. Kapcsold ki az alegységeket, és nézd meg, mi jut tovább az eredeti vektorból. A nyilakat egymás végéhez illesztve összeadást végzünk.',
      'Two numbers stand in for the entire hidden state. Disable the sublayers and see how the original vector survives. Placing arrows tip to tail performs addition.'),
    challenge: L('Előbb tippelj: ha mindkét alegységet kikapcsolod, nulla lesz a kimenet? Ellenőrizd. Ezután kapcsold vissza mindkettőt, és állíts negatív szorzót: melyik koordináta csökken?',
      'Predict first: does switching both sublayers off give a zero output? Check. Then switch both back on and make the multiplier negative: which coordinate decreases?'),
    limitation: L('Kézzel megadott, rögzített attention- és MLP-frissítések. Valódi blokkban ezek a bemenettől függő függvények; egy korábbi alegység kikapcsolása a későbbi frissítést is megváltoztathatja. Az ábra kizárólag a residual összeadást izolálja.',
      'The attention and MLP updates are fixed by hand. In a real block they are input-dependent functions, so disabling an earlier sublayer can also change later updates. This isolates residual addition only.'),
    controls: [check('attention', 'Attention-frissítés', 'Attention update', true), check('mlp', 'MLP-frissítés', 'MLP update', true),
      range('gain', 'A frissítések szorzója', 'Update multiplier', -1, 1, .1, 1)],
    render(s, api) {
      const r = residual(s), origin = [120, 230], scale = 61, xy = v => [origin[0] + v[0] * scale, origin[1] - v[1] * scale];
      const p = xy(r.input), q = xy(r.afterAttention), end = xy(r.output);
      const graphic = axes(...origin, 102, api) + arrow(...origin, ...p, '--s1') +
        arrow(...p, ...q, '--s5') + arrow(...q, ...end, '--s6') + arrow(...origin, ...end, '--s3', true, 2) +
        text(355, 65, 'r = ' + vec(r.input, api), api, '--s1') +
        text(355, 101, 'a = ' + vec(r.a, api), api, '--s5') + text(355, 137, 'm = ' + vec(r.m, api), api, '--s6') +
        text(355, 195, 'r′ = ' + vec(r.output, api), api, '--s3') + text(355, 231, 'r′ = r + a + m', api);
      return api.svg(graphic, api.t(L('Vektorösszeg: bemenet, attention, MLP és kimenet', 'Vector sum: input, attention, MLP and output')), '0 0 600 350') +
        `<p><strong>r′ = ${vec(r.input, api)} + ${vec(r.a, api)} + ${vec(r.m, api)} = ${vec(r.output, api)}.</strong> ` +
        api.t(L('A szaggatott nyíl az összeadás eredménye. Nulla frissítésnél az eredeti állapot változatlanul továbbhalad.', 'The dashed arrow is the sum. With zero updates, the original state passes through unchanged.')) + '</p>';
    }
  });

  K.register({
    id: 'normalization', anchor: 'norm',
    title: L('LayerNorm vagy RMSNorm: mit veszünk el a jelből?', 'LayerNorm or RMSNorm: what changes in the signal?'),
    intro: L('Ugyanazt a négyelemű vektort nagyítjuk és toljuk el. A LayerNorm az átlagot is kivonja, az RMSNorm csak a nagyságot szabályozza. A három sor azonos függőleges skálát használ.',
      'We scale and shift the same four-element vector. LayerNorm also subtracts the mean; RMSNorm only adjusts magnitude. All three rows use the same vertical scale.'),
    challenge: L('Állítsd a szorzót 1-re, az eltolást 3-ra. Miért marad a LayerNorm-kimenet átlaga nulla, miközben az RMSNorm mind a négy értéke pozitív lesz? Ezután változtasd csak a pozitív szorzót nulla eltolás mellett.',
      'Set the multiplier to 1 and the offset to 3. Why does LayerNorm still have zero mean while all four RMSNorm values become positive? Then change only the positive multiplier at zero offset.'),
    limitation: L('Egyetlen token négy koordinátája. A tanult erősítés mindenhol 1, az eltolás 0; ε = 0,00001. A pozitív skálázással szembeni invariancia ε miatt közelítő. A stabil tanítást ez a példa önmagában nem bizonyítja.',
      'Four coordinates of one token. Learned gains are all 1, learned biases 0; ε = 0.00001. Scale invariance is approximate because of ε. This example does not establish training stability.'),
    controls: [range('scale', 'Bemenet szorzója', 'Input multiplier', .25, 3, .25, 1), range('offset', 'Bemenet eltolása', 'Input offset', -4, 4, .25, 0)],
    render(s, api) {
      const n = normalization(s), groups = [['x', n.x, '--s5'], ['LayerNorm', n.ln, '--s1'], ['RMSNorm', n.rmsnorm, '--s3']];
      const maximum = Math.max(2, ...groups.flatMap(row => row[1].map(Math.abs))), unit = 28 / maximum;
      let graphic = '';
      groups.forEach(([label, values, color], row) => {
        const baseline = 55 + row * 85;
        graphic += text(12, baseline + 5, label, api) + `<line x1="143" y1="${baseline}" x2="575" y2="${baseline}" stroke="var(--border-strong)"/>`;
        values.forEach((value, i) => {
          const x = 170 + i * 120, height = Math.abs(value) * unit;
          graphic += `<rect x="${x - 18}" y="${baseline - Math.max(value, 0) * unit}" width="36" height="${Math.max(.5, height)}" fill="var(${color})"/>` +
            text(x, baseline + 47, api.fmt(value, 3), api, color, 'middle', 15);
        });
      });
      return api.svg(graphic, api.t(L('Bemenet és két normalizált vektor, közös skálán', 'Input and two normalized vectors on a shared scale')), '0 0 600 285') +
        `<p>x = ${api.fmt(s.scale)} × [−2; −1; 1; 2] + ${api.fmt(s.offset)}. ` +
        api.t(L('Átlag', 'Mean')) + ` μ = ${api.fmt(n.mean, 3)}; RMS = ${api.fmt(n.rms, 3)}.</p>` +
        `<p>LayerNorm(x) = (x − μ) / √(${api.fmt(n.variance, 3)} + ε).<br>RMSNorm(x) = x / √(${api.fmt(n.rms ** 2, 3)} + ε).</p>`;
    }
  });

  K.register({
    id: 'rope', anchor: 'pozicio',
    title: L('RoPE: a közös forgatás kiesik', 'RoPE: a common rotation cancels out'),
    intro: L('A query és a key egy-egy kétdimenziós párját forgatjuk. Minden pozíciólépés itt 30°. Az attention pontszámát a két nyíl skalárszorzata befolyásolja.',
      'We rotate one two-dimensional pair of query and key coordinates. Each position step is 30° here. The arrows’ dot product contributes to the attention score.'),
    challenge: L('Mozgasd csak a közös eltolást. A nyilak elfordulnak, de a pontszám ugyanaz marad. Most csak a key pozícióját változtasd: marad-e a pontszám? Keress azonos relatív távolságú pozíciópárt.',
      'Change only the common shift. The arrows rotate but their score stays fixed. Now change only the key position: does the score stay fixed? Find another pair with the same relative distance.'),
    limitation: L('Egyetlen koordinátapár, rögzített alapvektorok és frekvencia; nincs maszk vagy softmax. A valódi RoPE sok párt forgat különböző frekvenciákon. Egy pár pontszáma periodikus, nem monoton távolságmérő.',
      'One coordinate pair, fixed base vectors and frequency; no mask or softmax. Real RoPE uses many pairs at different frequencies. A single pair gives a periodic score, not a monotonic distance measure.'),
    controls: [range('query', 'Query pozíciója (m)', 'Query position (m)', 0, 12, 1, 3), range('key', 'Key pozíciója (n)', 'Key position (n)', 0, 12, 1, 1), range('shift', 'Mindkét pozíció közös eltolása', 'Common shift of both positions', 0, 12, 1, 0)],
    render(s, api) {
      const r = rope(s), cx = 145, cy = 140, radius = 102;
      const point = v => [cx + radius * v[0], cy - radius * v[1]];
      const graphic = axes(cx, cy, radius + 18, api) + `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="var(--border-strong)"/>` +
        arrow(cx, cy, ...point(r.q), '--s1') + arrow(cx, cy, ...point(r.k), '--s6') +
        text(295, 57, 'q: m = ' + (s.query + s.shift), api, '--s1') + text(295, 88, vec(r.q, api), api, '--s1') +
        text(295, 133, 'k: n = ' + (s.key + s.shift), api, '--s6') + text(295, 164, vec(r.k, api), api, '--s6') +
        text(295, 213, 'n − m = ' + r.relative, api) + text(295, 246, 'q · k = ' + api.fmt(r.dot, 4), api, '--s3');
      return api.svg(graphic, api.t(L('Elforgatott query és key az egységkörön', 'Rotated query and key on a unit circle')), '0 0 600 280') +
        `<p>q₀ = [1; 0], k₀ = [cos 30°; sin 30°].<br>` +
        `q · k = cos(30° + (n − m) × 30°) = <strong>${api.fmt(r.dot, 4)}</strong>. ` +
        api.t(L('A kétdimenziós attention skálázott pontszáma', 'The scaled two-dimensional attention score')) + `: q · k / √2 = ${api.fmt(r.scaled, 4)}.</p>`;
    }
  });

  K.register({
    id: 'kv-cache', anchor: 'inferencia',
    title: L('KV-cache: hová tűnik a memória?', 'KV cache: where does the memory go?'),
    intro: L('Minden réteg minden eltárolt tokenjéhez key és value tartozik. Változtasd a kontextust, a párhuzamos kérések és a KV-fejek számát: a tárolási igény mindhárommal arányosan nő.',
      'Every cached token in every layer has a key and a value. Change context length, concurrent sequences and KV heads: storage grows linearly with each.'),
    challenge: L('Hasonlítsd össze 8 és 32 KV-fej memóriaigényét azonos beállításokkal. Utána duplázd a kontextushosszt: mi duplázódik meg, a cache vagy a modell súlya is?',
      'Compare 8 and 32 KV heads with everything else fixed. Then double the context length: does the cache double, or do model weights double too?'),
    limitation: L('Feltételezett architektúra: 32 réteg, 32 query-fej, fejméret 128, teljes attention, BF16/FP16 cache (2 bájt/elem), minden kérés azonos hosszú. A szemléltető súlykeret 7 milliárd × 2 bájt. Nem számol aktivációval, munkaterülettel, foglalási többlettel vagy cache-megosztással; nem GPU-kompatibilitási ígéret.',
      'Assumed architecture: 32 layers, 32 query heads, head dimension 128, full attention, BF16/FP16 cache (2 bytes/element), equal sequence lengths. Illustrative weights: 7 billion × 2 bytes. Activations, workspace, allocation overhead and cache sharing are excluded; this is not a GPU-fit guarantee.'),
    controls: [range('context', 'Eltárolt token / kérés', 'Cached tokens per sequence', 1024, 131072, 1024, 8192), range('batch', 'Párhuzamos kérések (B)', 'Concurrent sequences (B)', 1, 16, 1, 1),
      { key: 'heads', label: L('KV-fejek rétegenként', 'KV heads per layer'), type: 'select', value: '8', options: [
        { value: '1', label: L('1 — MQA', '1 — MQA') }, { value: '4', label: L('4 — GQA', '4 — GQA') },
        { value: '8', label: L('8 — GQA', '8 — GQA') }, { value: '32', label: L('32 — MHA', '32 — MHA') }] }],
    render(s, api) {
      const k = kvCache(s), budget = 24, max = Math.max(30, k.totalGiB * 1.1), left = 25, width = 545;
      const px = value => left + width * value / max, weightsWidth = width * k.weightsGiB / max, cacheWidth = width * k.gib / max;
      const graphic = text(25, 24, api.t(L('Súlyok + KV-cache (GiB)', 'Weights + KV cache (GiB)')), api) +
        `<rect x="25" y="64" width="${weightsWidth}" height="42" fill="var(--s1)"/><rect x="${px(k.weightsGiB)}" y="64" width="${cacheWidth}" height="42" fill="var(--s6)"/>` +
        `<line x1="${px(budget)}" y1="43" x2="${px(budget)}" y2="119" stroke="var(--ink-1)" stroke-dasharray="4 4"/>` +
        text(px(budget), 140, '24 GiB', api, '--ink-1', 'middle') + text(25, 179, api.t(L('Súlyok', 'Weights')) + ': ' + api.fmt(k.weightsGiB) + ' GiB', api, '--s1') +
        text(310, 179, 'KV: ' + api.fmt(k.gib) + ' GiB', api, '--s6');
      const budgetCopy = k.totalGiB > budget ?
        api.t(L('A súlyok és a cache már önmagukban meghaladják a jelölt 24 GiB-ot.', 'Weights and cache alone exceed the marked 24 GiB.')) :
        api.t(L('A 24 GiB-ból még fennmaradó keret, minden egyéb memóriaigény előtt', 'Capacity left from 24 GiB, before all other memory needs')) + ': ' + api.fmt(budget - k.totalGiB) + ' GiB.';
      return api.svg(graphic, api.t(L('Modellsúlyok és KV-cache memóriaigénye, 24 GiB jelöléssel', 'Weights and KV cache memory, with a 24 GiB reference')), '0 0 600 200') +
        `<p><strong>${api.t(L('KV = 2 × B × réteg × KV-fej × token × fejméret × bájt/elem', 'KV = 2 × B × layers × KV heads × tokens × head dimension × bytes/element'))}</strong></p>` +
        `<p>2 × ${s.batch} × 32 × ${s.heads} × ${s.context} × 128 × 2 = <strong>${api.fmt(k.gib, 3)} GiB</strong>. ` +
        `1 GiB = 2³⁰ ${api.t(L('bájt', 'bytes'))}. ` + api.t(L('Ugyanez 32 KV-fejjel', 'With 32 KV heads instead')) + `: ${api.fmt(k.mhaGiB, 3)} GiB.</p><p>${budgetCopy}</p>`;
    }
  });

  K.register({
    id: 'superposition', anchor: 'superpozicio',
    title: L('Három jellemző, két dimenzió', 'Three features, two dimensions'),
    intro: L('Az A, B és C jellemzőt három egységnyi irány tárolja egy síkban. Az aktív irányokat összeadjuk, majd mindhárom irányra visszavetítünk. Figyeld meg a téves aktivációkat és az elvesző jelet.',
      'Three unit directions encode features A, B and C in a plane. We add the active directions, then project the result onto all three. Watch for false activations and lost signal.'),
    challenge: L('120°-nál kapcsold be előbb csak A-t, majd mindhárom jellemzőt. Hogyan lehet ugyanaz a rejtett vektor az „egyik sem” és a „mindhárom” állapotban? Most 60°-nál csak A legyen aktív: melyik másik jellemző kap téves pozitív jelet?',
      'At 120°, enable only A, then all three features. How can “none” and “all three” have the same hidden vector? Now use 60° with only A active: which other features get false positive signals?'),
    limitation: L('Kézzel beállított kódoló és transzponált dekódoló, nulla bias és ReLU; nem tanított modell vagy mért aktiváció. Az ábra az interferenciát mutatja. A tanult szuperpozícióban a ritkaság, a fontosság, a bias és az optimalizálás együtt számít.',
      'Hand-set encoder and transposed decoder, zero bias and ReLU; no trained model or measured activation. This demonstrates interference. Learned superposition also depends on sparsity, feature importance, bias and optimization.'),
    controls: [range('angle', 'B és C szöge A-hoz képest (±°)', 'Angle of B and C relative to A (±°)', 30, 150, 5, 120),
      check('a', 'A jellemző aktív', 'Feature A active', true), check('b', 'B jellemző aktív', 'Feature B active', false), check('c', 'C jellemző aktív', 'Feature C active', false)],
    render(s, api) {
      const r = superposition(s), cx = 157, cy = 150, scale = 100 / Math.max(1, Math.hypot(...r.h)), colors = ['--s1', '--s5', '--s6'];
      const xy = v => [cx + v[0] * scale, cy - v[1] * scale];
      let graphic = axes(cx, cy, 116, api);
      r.vectors.forEach((v, i) => {
        const p = xy(v), label = xy(mul(v, 1.24));
        graphic += arrow(cx, cy, ...p, colors[i], !r.x[i], r.x[i] ? 3 : 1.5) + text(...label, 'ABC'[i], api, colors[i], 'middle');
      });
      graphic += arrow(cx, cy, ...xy(r.h), '--s3', false, 5) +
        text(325, 72, 'h = ' + vec(r.h, api), api, '--s3') + text(325, 112, 'h = A·vA + B·vB + C·vC', api) +
        text(325, 163, 'x̂ = ReLU(Vᵀh)', api) + text(325, 210, 'MSE = ' + api.fmt(r.mse, 4), api) +
        text(325, 250, '|vA| = |vB| = |vC| = 1', api, '--ink-3', 'start', 14);
      return api.svg(graphic, api.t(L('Három jellemző iránya és az összegzett rejtett vektor', 'Three feature directions and their summed hidden vector')), '0 0 600 290') +
        api.table([api.t(L('Jellemző', 'Feature')), api.t(L('Eredeti x', 'Original x')), 'vᵢ · h', 'ReLU(vᵢ · h)'],
          r.x.map((v, i) => ['ABC'[i], api.fmt(v, 0), api.fmt(r.readout[i], 3), api.fmt(r.reconstructed[i], 3)])) +
        `<p>${api.t(L('Az átlagos négyzetes rekonstrukciós hiba', 'Mean squared reconstruction error'))}: ` +
        `(Σᵢ (x̂ᵢ − xᵢ)²) / 3 = <strong>${api.fmt(r.mse, 4)}</strong>. ` +
        api.t(L('A szaggatott irány inaktív jellemzőt, a vastag lila nyíl az eltárolt h vektort jelöli. A nézet automatikusan igazodik, az ábrán belül minden nyíl azonos skálát használ.', 'Dashed directions mark inactive features; the thick purple arrow is the stored vector h. The view automatically adjusts, using the same scale for all arrows within each view.')) + '</p>';
    }
  });

  K.register({
    id: 'patching', anchor: 'modszerek',
    title: L('Activation patching: cseréld ki a köztes értéket', 'Activation patching: replace an intermediate value'),
    intro: L('Ebben az apró áramkörben a tiszta bemenet x = 1, a rontott x = −1. A rontott futás egy belső értékét a tiszta futásból másoljuk át, majd újraszámoljuk a kimenetet. Így egy konkrét beavatkozás hatását mérjük.',
      'In this tiny circuit the clean input is x = 1 and the corrupted input x = −1. We copy an internal value from the clean run into the corrupted run, then recompute the output to measure the intervention’s effect.'),
    challenge: L('Próbáld ki külön a két csomópontot és együtt is. Miért 80% az egyik és 20% a másik logit-helyreállítása? Kontrollként válaszd a rontott donort: ekkor történik változás?',
      'Patch each node separately, then both. Why does one restore 80% of the logit and the other 20%? As a control, choose a corrupted donor: does anything change?'),
    limitation: L('Kézzel definiált, kételemű számítás; nem LLM-en végzett kísérlet. A helyreállítás erre a bemenetpárra és erre a logitmetrikára vonatkozik. Egy sikeres csere önmagában nem bizonyít kizárólagos szerepet, általános szükségességet vagy szemantikai jelentést.',
      'A hand-defined two-node computation, not an LLM experiment. Recovery applies to this input pair and this logit metric. A successful patch alone does not prove exclusive responsibility, general necessity or semantic meaning.'),
    controls: [
      { key: 'source', type: 'select', label: L('A másolt érték forrása', 'Donor run'), value: 'clean', options: [
        { value: 'clean', label: L('Tiszta futás (x = 1)', 'Clean run (x = 1)') }, { value: 'corrupt', label: L('Rontott futás (kontroll)', 'Corrupted run (control)') }] },
      { key: 'patch', type: 'select', label: L('Melyik aktivációt cseréljük?', 'Which activation gets replaced?'), value: 'none', options: [
        { value: 'none', label: L('Egyiket sem', 'Neither') }, { value: 'a', label: L('h₁ = 2x', 'h₁ = 2x') },
        { value: 'b', label: L('h₂ = ReLU(x)', 'h₂ = ReLU(x)') }, { value: 'both', label: L('Mindkettőt', 'Both') }] }
    ],
    render(s, api) {
      const p = patching(s), patchA = s.patch === 'a' || s.patch === 'both', patchB = s.patch === 'b' || s.patch === 'both';
      function node(x, y, w, h, label, value, patched) {
        return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="var(--surface-1)" stroke="var(${patched ? '--s6' : '--border-strong'})" stroke-width="${patched ? 3 : 1}"/>` +
          text(x + w / 2, y + 29, label, api, '--ink-1', 'middle') + text(x + w / 2, y + 55, value, api, patched ? '--s6' : '--s1', 'middle');
      }
      const graphic = arrow(128, 142, 218, 78, '--border-strong') + arrow(128, 142, 218, 207, '--border-strong') +
        arrow(382, 78, 450, 142, '--border-strong') + arrow(382, 207, 450, 142, '--border-strong') +
        node(12, 105, 116, 75, 'x', '−1', false) + node(218, 38, 164, 78, 'h₁ = 2x', api.fmt(p.patched.a), patchA) +
        node(218, 167, 164, 78, 'h₂ = ReLU(x)', api.fmt(p.patched.b), patchB) + node(450, 105, 138, 75, 'z = h₁ + h₂', api.fmt(p.patched.z), false);
      return api.svg(graphic, api.t(L('Rontott számítás a kijelölt, átültetett aktivációkkal', 'Corrupted computation with selected transplanted activations')), '0 0 600 280') +
        api.table([api.t(L('Futás', 'Run')), 'h₁', 'h₂', 'z'], [
          [api.t(L('Tiszta', 'Clean')), '2', '1', '3'], [api.t(L('Rontott', 'Corrupted')), '−2', '0', '−2'],
          [api.t(L('Csere után', 'After patch')), api.fmt(p.patched.a), api.fmt(p.patched.b), api.fmt(p.patched.z)]]) +
        `<p>${api.t(L('Logit-helyreállítás', 'Logit recovery'))} = (z<sub>patch</sub> − z<sub>corrupt</sub>) / (z<sub>clean</sub> − z<sub>corrupt</sub>) ` +
        `= (${api.fmt(p.patched.z)} + 2) / 5 = <strong>${api.fmt(100 * p.recovery, 0)}%</strong>. ` +
        `σ(z<sub>patch</sub>) = ${api.fmt(p.probability, 3)}. ` +
        api.t(L('A logit és a valószínűség külön metrika; helyreállításuk százaléka nem azonos.', 'Logit and probability are different metrics; their recovery percentages need not match.')) + '</p>';
    }
  });

  K.register({
    id: 'preference', anchor: 'alignment',
    title: L('Preferenciából gradiens: egy DPO-lépés', 'From preferences to a gradient: one DPO step'),
    intro: L('Csak két válasz van: A és B. A referenciamodell mindkettőnek 50%-ot ad. Megnézzük, hogyan módosít egy gradienslépés egyetlen log-esély paramétert, ha az értékelők inkább A-t vagy inkább B-t választják.',
      'There are only two responses, A and B. The reference assigns each 50%. We inspect how one gradient step changes a single log-odds parameter when raters prefer A or B.'),
    challenge: L('Nulla kezdő log-esélynél állíts 50% A-preferenciát: miért nulla a gradiens? Ezután válassz 100%-ot. Ha már eleve 90% feletti A esélye, ugyanakkora lesz-e a változás?',
      'At zero initial log-odds, set A preference to 50%: why is the gradient zero? Then choose 100%. If A already has probability above 90%, is the change equally large?'),
    limitation: L('A bináris, rögzített referenciájú eset DPO-veszteségét számoljuk pontosan, egy gradienslépéssel, η = 1 mellett. Ez a teljes nyelvimodell-tanítás erősen egyszerűsített szemléltetése: nincs neurális háló, tokenenkénti loss, adatciklus, jutalommodell vagy RL-futtatás. β itt a DPO-logit szorzója, nem általános „minőség” vagy „biztonság” szabályzó.',
      'The fixed-reference binary DPO loss is computed exactly, with one gradient step at η = 1. This is a highly simplified view of language-model training: no neural network, token losses, data pipeline, reward model or RL execution. β scales the DPO logit here; it is not a general “quality” or “safety” control.'),
    controls: [range('logOdds', 'Kezdő log-esély: ln(P(A)/P(B))', 'Initial log-odds: ln(P(A)/P(B))', -4, 4, .25, 0),
      range('beta', 'β: a DPO-logit szorzója', 'β: DPO logit multiplier', .1, 2, .1, .5), range('strength', 'A-t választó értékelések aránya', 'Fraction of ratings preferring A', 0, 1, .05, 1)],
    render(s, api) {
      const p = preference(s);
      const bars = api.bars([
        { label: api.t(L('Referencia P(A)', 'Reference P(A)')), value: .5 },
        { label: api.t(L('Jelenlegi P(A)', 'Current P(A)')), value: p.p },
        { label: api.t(L('Egy lépés után P(A)', 'P(A) after one step')), value: p.nextP }
      ], 1);
      return bars + `<p>z = ln(P(A)/P(B)) = ${api.fmt(s.logOdds)}; P(A) = σ(z) = <strong>${api.fmt(p.p, 3)}</strong>.<br>` +
        api.t(L('A preferenciapár modell szerinti A-nyerési esélye', 'Model-implied chance of A winning the preference pair')) +
        `: σ(βz) = ${api.fmt(p.pairWinProb, 3)}. ` + api.t(L('Ez nem azonos a válasz generálási valószínűségével.', 'This is not the same as the response generation probability.')) + '</p>' +
        `<p>s = ${api.fmt(s.strength, 2)}; L = −s·ln σ(βz) − (1−s)·ln(1−σ(βz)) = <strong>${api.fmt(p.loss, 4)}</strong>.<br>` +
        `∂L/∂z = β(σ(βz) − s) = ${api.fmt(p.gradient, 4)}.<br>` +
        `z′ = z − 1·∂L/∂z = ${api.fmt(p.nextLogOdds, 4)}; P′(A) = ${api.fmt(p.nextP, 4)}; L′ = ${api.fmt(p.nextLoss, 4)}.</p>`;
    }
  });
})();
