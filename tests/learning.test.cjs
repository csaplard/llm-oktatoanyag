const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM, VirtualConsole} = require('jsdom');
const KEY = 'llm-oktato-progress-v1';
function page(file='index.html', stored={}, blocked=false) {
  const errors=[];
  const console = new VirtualConsole();
  console.on('jsdomError', e=>errors.push(e.message));
  const dom=new JSDOM(fs.readFileSync(file,'utf8'), {
    url:'https://example.test/'+file, runScripts:'dangerously', virtualConsole:console,
    beforeParse(w) {
      w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=()=>{};
      if(blocked) Object.defineProperty(w,'localStorage',{get(){throw new Error('Storage disabled')}});
      else for(const [k,v] of Object.entries(stored)) w.localStorage.setItem(k,v);
    }
  });
  return {dom,w:dom.window,d:dom.window.document,errors};
}
for (const file of ['index.html','en/index.html']) {
  test(file+': all 14 labs render and every control survives its bounds',()=>{
    const {w,d,errors}=page(file);
    assert.deepEqual(errors,[]);
    assert.equal(d.querySelectorAll('.learning-lab').length,14);
    assert.equal(d.querySelectorAll('[data-lab-links] a').length,14);
    for(const card of d.querySelectorAll('.learning-lab')) {
      const initial=card.querySelector('.lab-result').innerHTML;
      assert.ok(initial.length>100,card.id);
      for(const input of card.querySelectorAll('.lab-controls input,.lab-controls select')) {
        const values=input.type==='range'?[input.min,input.max]:input.type==='checkbox'?[true,false]:Array.from(input.options,o=>o.value);
        for(const value of values) {
          if(input.type==='checkbox') input.checked=value; else input.value=value;
          input.dispatchEvent(new w.Event(input.type==='range'?'input':'change',{bubbles:true}));
          const text=card.querySelector('.lab-result').textContent;
          assert.doesNotMatch(text,/\bNaN\b|\bInfinity\b/,card.id+' '+input.id);
          assert.ok(input.labels.length, input.id+' has a visible label');
        }
      }
      card.querySelector('.lab-reset').click();
      assert.equal(card.querySelector('.lab-result').innerHTML,initial,card.id+' resets exactly');
    }
    assert.deepEqual(errors,[]); w.close();
  });
  test(file+': reading modes preserve earned progress',()=>{
    const progress=JSON.stringify({v:1,unlocked:[1,2,3],passed:{1:true,2:true},best:{1:5,2:4},wrong:{}});
    const {w,d,errors}=page(file,{[KEY]:progress});
    assert.equal(d.querySelectorAll('section.locked').length,0);
    const select=d.querySelector('#reading-mode');
    select.value='guided';select.dispatchEvent(new w.Event('change'));
    assert.equal(d.querySelectorAll('section.locked').length,9);
    assert.equal(d.querySelector('#embedding').classList.contains('locked'),false);
    select.value='free';select.dispatchEvent(new w.Event('change'));
    assert.equal(d.querySelectorAll('section.locked').length,0);
    assert.equal(w.localStorage.getItem(KEY),progress);
    assert.equal(d.querySelectorAll('.learning-lab [tabindex="-1"]').length,0);
    assert.deepEqual(errors,[]); w.close();
  });
  test(file+': foundations, links and independent weekly checklists',()=>{
    const {w,d,errors}=page(file);
    assert.equal(d.querySelectorAll('.learn-week').length,12);
    assert.ok(d.querySelectorAll('.learn-foundation').length>=5);
    const ids=Array.from(d.querySelectorAll('[id]'),e=>e.id);
    assert.equal(new Set(ids).size,ids.length,'Unique HTML IDs');
    for(const link of d.querySelectorAll('.learn-section a[href^="#"],.reading-tools a[href^="#"],.foundation-link a')) {
      assert.ok(d.getElementById(link.hash.slice(1)),link.getAttribute('href'));
    }
    const check=d.querySelector('.learn-checklist input');
    assert.ok(check);check.click();
    assert.equal(w.localStorage.getItem(KEY),null,'Weekly checklist must not award quiz credit');
    assert.deepEqual(errors,[]);w.close();
  });
  test(file+': passing the final quiz out of order does not certify the whole course',()=>{
    const {w,d,errors}=page(file);
    const quiz=d.querySelector('#quiz-12');
    for(const question of quiz.querySelectorAll('.q')) {
      const input=question.querySelector('input');
      if(input){input.value='12000';input.dispatchEvent(new w.Event('input'));}
      else Array.from(question.querySelectorAll('.quiz-opt')).find(button=>button._opt.ok).click();
    }
    quiz.querySelector('.quiz-foot > .quiz-btn').click();
    const saved=JSON.parse(w.localStorage.getItem(KEY));
    assert.equal(saved.passed[12],true);
    assert.equal(Object.keys(saved.passed).length,1);
    assert.match(quiz.querySelector('.cert-note').textContent,/1 \/ 12/);
    assert.deepEqual(errors,[]);w.close();
  });
  test(file+': works offline with unavailable or corrupt storage',()=>{
    for(const blocked of [true,false]) {
      const {w,d,errors}=page(file,{[KEY]:'{broken','katedra-reading-mode':'invalid'},blocked);
      assert.equal(d.querySelectorAll('.learning-lab').length,14);
      assert.deepEqual(errors,[]);w.close();
    }
  });
}
test('Both published HTML files are built from the current component sources',()=>{
  // Each edition carries only its own language, so the sources are no longer
  // embedded verbatim; the build script itself decides whether the output is stale.
  const {spawnSync}=require('node:child_process');
  let run;
  for(const python of ['python3','python']) {
    run=spawnSync(python,['scripts/build.py','--check'],{encoding:'utf8'});
    if(!run.error) break;
  }
  assert.ok(!run.error,'Python is available to verify the build');
  // The check covers the stylesheet too, independent of the checkout's line endings.
  assert.equal(run.status,0,run.stdout+run.stderr);
});

test('Each edition ships only its own language in the component bundle',()=>{
  const bundle=file=>{const h=fs.readFileSync(file,'utf8');return h.slice(h.indexOf('<!-- LEARNING-JS:START -->'),h.indexOf('<!-- LEARNING-JS:END -->'));};
  // The optional Hungarian example corpus of the BPE lab is deliberate data, not interface text.
  const en=bundle('en/index.html').replace(/garden: \[\[.*?\]\],/,'');
  assert.doesNotMatch(en,/[őűáéíóöúüŐŰÁÉÍÓÖÚÜ]/,'no Hungarian text in the English bundle');
  const hu=bundle('index.html');
  for(const phrase of ['Try it yourself','Worked example','By the end of the week','Reading mode'])
    assert.ok(!hu.includes(phrase),'no English interface text in the Hungarian bundle: '+phrase);
});
