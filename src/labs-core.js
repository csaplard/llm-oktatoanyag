(function () {
  'use strict';
  var specs = [], instances = [];
  var lang = document.documentElement.lang === 'en' ? 'en' : 'hu';
  function t(value) { return typeof value === 'string' ? value : (value && (value[lang] || value.hu)) || ''; }
  function esc(value) { return String(value).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function fmt(value, digits) { if (Math.abs(value) < 1e-10) value = 0; return Number(value).toLocaleString(lang === 'hu' ? 'hu-HU' : 'en-GB', {maximumFractionDigits: digits === undefined ? 2 : digits}); }
  function softmax(values, temperature) {
    var scaled = values.map(function (v) { return v / (temperature === undefined ? 1 : temperature); });
    var max = Math.max.apply(null, scaled);
    var exps = scaled.map(function (v) { return Math.exp(v - max); });
    var sum = exps.reduce(function (a, b) { return a + b; }, 0);
    return exps.map(function (v) { return v / sum; });
  }
  function svg(inner, label, viewBox) {
    return '<div class="lab-diagram" tabindex="0" aria-label="' + t({hu:'Ábra, szükség esetén oldalra görgethető',en:'Diagram, scroll horizontally if needed'}) + '"><svg class="lab-svg" viewBox="' + esc(viewBox || '0 0 600 260') + '" role="img" aria-label="' + esc(t(label)) + '"><title>' + esc(t(label)) + '</title>' + inner + '</svg></div>';
  }
  function bars(rows, max) {
    max = max || 1;
    return '<div class="lab-bars">' + rows.map(function (r) {
      return '<div class="lab-bar-row"><span>' + esc(t(r.label)) + '</span><span class="lab-bar-track"><span style="width:' + Math.max(0, Math.min(100, r.value / max * 100)) + '%"></span></span><strong>' + fmt(r.value, 3) + '</strong></div>';
    }).join('') + '</div>';
  }
  function table(headers, rows) {
    return '<div class="lab-table-wrap"><table><thead><tr>' + headers.map(function (h) { return '<th scope="col">' + esc(t(h)) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function (row) {
      return '<tr>' + row.map(function (v) { return '<td>' + esc(t(v) || (typeof v === 'number' ? v : '')) + '</td>'; }).join('') + '</tr>';
    }).join('') + '</tbody></table></div>';
  }
  var api = {lang:lang, t:t, esc:esc, fmt:fmt, softmax:softmax, svg:svg, bars:bars, table:table};
  function mount(spec) {
    var anchor = document.getElementById(spec.anchor);
    if (!anchor) throw new Error('Missing lab anchor: ' + spec.anchor);
    var card = document.createElement('figure');
    card.className = 'learning-lab'; card.id = 'lab-' + spec.id;
    card.setAttribute('aria-labelledby', card.id + '-title');
    card.innerHTML = '<figcaption><span class="lab-kicker">' + t({hu:'Interaktív kísérlet',en:'Interactive experiment'}) + '</span><h4 id="' + card.id + '-title">' + esc(t(spec.title)) + '</h4><p>' + esc(t(spec.intro)) + '</p></figcaption><div class="lab-controls"></div><div class="lab-result" aria-live="off"></div><p class="lab-challenge"><strong>' + t({hu:'Próbáld ki: ',en:'Try it: '}) + '</strong>' + esc(t(spec.challenge)) + '</p><details class="lab-boundary"><summary>' + t({hu:'Mit mutat ez a példa?',en:'What does this example show?'}) + '</summary><p>' + esc(t(spec.limitation)) + '</p></details><div class="lab-actions"><button type="button" class="lab-reset">' + t({hu:'Alaphelyzet',en:'Reset example'}) + '</button><a href="#lab-directory">' + t({hu:'Összes kísérlet ↑',en:'All experiments ↑'}) + '</a></div>';
    var state = {}, inputs = {}, outputs = {};
    var controls = card.querySelector('.lab-controls');
    spec.controls.forEach(function (c) {
      state[c.key] = c.value;
      var wrap = document.createElement('div'); wrap.className = 'lab-control';
      var id = card.id + '-' + c.key;
      var label = document.createElement('label'); label.htmlFor = id; label.textContent = t(c.label);
      wrap.appendChild(label);
      var input = document.createElement(c.type === 'select' ? 'select' : 'input');
      input.id = id;
      if (c.type === 'select') {
        c.options.forEach(function (o) { var option = document.createElement('option'); option.value = o.value; option.textContent = t(o.label); input.appendChild(option); });
      } else {
        input.type = c.type || 'range';
        if (input.type === 'range') { input.min = c.min; input.max = c.max; input.step = c.step === undefined ? 1 : c.step; }
      }
      if (c.type === 'checkbox') input.checked = c.value; else input.value = c.value;
      wrap.appendChild(input); inputs[c.key] = input;
      if (input.type === 'range') {
        var output = document.createElement('output'); output.htmlFor = id; output.textContent = fmt(c.value, 3); wrap.appendChild(output); outputs[c.key] = output;
      }
      controls.appendChild(wrap);
      input.addEventListener(c.type === 'checkbox' || c.type === 'select' ? 'change' : 'input', function () {
        state[c.key] = c.type === 'checkbox' ? input.checked : c.type === 'select' ? input.value : Number(input.value);
        if (outputs[c.key]) outputs[c.key].textContent = fmt(state[c.key], 3);
        render();
      });
    });
    function render() { card.querySelector('.lab-result').innerHTML = spec.render(state, api); }
    card.querySelector('.lab-reset').addEventListener('click', function () {
      spec.controls.forEach(function (c) { state[c.key] = c.value; if (c.type === 'checkbox') inputs[c.key].checked = c.value; else inputs[c.key].value = c.value; if (outputs[c.key]) outputs[c.key].textContent = fmt(c.value, 3); });
      render();
    });
    // Insert at the end of the topic, keeping its introductory explanation intact.
    if (anchor.tagName === 'SECTION') {
      var quiz = anchor.querySelector('.quiz'); anchor.insertBefore(card, quiz);
    } else {
      var cursor = anchor.nextElementSibling;
      while (cursor && !/^H[23]$/.test(cursor.tagName) && !cursor.classList.contains('quiz')) cursor = cursor.nextElementSibling;
      anchor.parentNode.insertBefore(card, cursor);
    }
    render(); instances.push({spec:spec, card:card, state:state});
  }
  function boot() {
    if (instances.length) return;
    if (window.KatedraLearning) window.KatedraLearning.init();
    specs.forEach(mount);
    var list = document.querySelector('[data-lab-links]');
    if (list) list.innerHTML = specs.map(function (s, i) { return '<a href="#lab-' + esc(s.id) + '"><span>' + String(i + 1).padStart(2, '0') + '</span>' + esc(t(s.title)) + '</a>'; }).join('');
    addReadingControls();
    addFoundationLinks();
    if (window.KatedraProgress) window.KatedraProgress.refresh();
    // Hash targets can be generated labs, weeks or foundation blocks.
    if (location.hash) {
      var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) { var parent = target.closest('details'); if (parent) parent.open = true; target.scrollIntoView(); }
    }
  }
  function addReadingControls() {
    var hero = document.querySelector('.hero');
    var box = document.createElement('div'); box.className = 'reading-tools';
    box.innerHTML = '<label for="reading-mode">' + t({hu:'Olvasási mód',en:'Reading mode'}) + '</label><select id="reading-mode"><option value="free">' + t({hu:'Szabad olvasás · minden fejezet elérhető',en:'Free reading · all chapters available'}) + '</option><option value="guided">' + t({hu:'Vezetett tanulás · kvízekkel lépésenként',en:'Guided learning · unlock with quizzes'}) + '</option></select><p id="reading-mode-note">' + t({hu:'A kvízeredményeket mindkét módban megőrizzük. A szabad olvasás nem jelöl teljesítettnek semmit.',en:'Quiz results are kept in both modes. Free reading does not mark anything as completed.'}) + '</p><div class="reading-shortcuts"><a href="#alapok">' + t({hu:'Alapozó segítség',en:'Foundation help'}) + '</a><a href="#lab-directory">' + t({hu:'14 interaktív kísérlet',en:'14 interactive experiments'}) + '</a><a href="#tanulasi-ut">' + t({hu:'12 hetes útvonal',en:'12-week path'}) + '</a></div>';
    hero.appendChild(box);
    var select = box.querySelector('select'); select.setAttribute('aria-describedby','reading-mode-note');
    select.value = window.KatedraProgress ? window.KatedraProgress.mode() : 'free';
    select.addEventListener('change', function () { if (window.KatedraProgress) window.KatedraProgress.setMode(select.value); });
    var toc = document.getElementById('toc'), first = toc.querySelector('a');
    [{id:'alapok',hu:'Alapozó segítség',en:'Foundation help'},{id:'lab-directory',hu:'Interaktív kísérletek',en:'Interactive experiments'},{id:'tanulasi-ut',hu:'12 hetes útvonal',en:'12-week path'}].forEach(function (entry) {
      var a = document.createElement('a'); a.href = '#' + entry.id; a.className = 'toc-learning'; a.textContent = t(entry); toc.insertBefore(a, first);
    });
  }
  function addFoundationLinks() {
    var links = [
      ['embedding','alapok-vektor',{hu:'Mi az a vektor? Kezdd egy két számból álló példával.',en:'What is a vector? Start with a pair of numbers.'}],
      ['attention','alapok-matrix',{hu:'Elakadtál a skalárszorzatnál vagy a mátrixoknál? Itt egy végigszámolt példa.',en:'Stuck on dot products or matrices? Open a worked example.'}],
      ['loss','alapok-valoszinuseg',{hu:'Miért szerepel logaritmus a veszteségben? Alapozó magyarázat.',en:'Why is there a logarithm in the loss? Read the foundations.'}],
      ['backprop','alapok-derivalt',{hu:'Derivált és láncszabály: előbb nézd meg ezt az egyszerű példát.',en:'Derivatives and the chain rule: start with this simple example.'}]
    ];
    links.forEach(function (entry) { var target = document.getElementById(entry[0]); if (!target || !document.getElementById(entry[1])) return; var p = document.createElement('p'); p.className='foundation-link'; p.innerHTML='<a href="#'+entry[1]+'">'+esc(t(entry[2]))+'</a>'; if(target.tagName==='SECTION') target.insertBefore(p,target.querySelector('h2').nextSibling); else target.insertAdjacentElement('afterend',p); });
    document.addEventListener('click', function (event) { var a=event.target.closest('a[href^="#alapok-"]'); if(!a)return;var target=document.getElementById(a.getAttribute('href').slice(1));if(target){var d=target.tagName==='DETAILS'?target:target.closest('details');if(d)d.open=true;} });
  }
  window.KatedraLabs = {register:function (spec) { if(specs.some(function(s){return s.id===spec.id;}))throw new Error('Duplicate lab id'); specs.push(spec); }, boot:boot, specs:specs, instances:instances, api:api, math:{}};
})();
