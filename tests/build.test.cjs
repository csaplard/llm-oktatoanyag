const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const vm=require('node:vm');

function specialize(source,lang) {
  const script=`import importlib.util,json,sys
spec=importlib.util.spec_from_file_location('builder','scripts/build.py')
b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
p=json.load(sys.stdin)
print(json.dumps(b.single_language(p['source'],p['lang'])))`;
  let run;
  for(const python of ['python3','python']) {
    run=spawnSync(python,['-c',script],{input:JSON.stringify({source,lang}),encoding:'utf8'});
    if(!run.error) break;
  }
  assert.ok(!run.error,'Python is available');
  assert.equal(run.status,0,run.stdout+run.stderr);
  return JSON.parse(run.stdout);
}
function evaluate(source,lang) {
  const output=specialize(source,lang);
  const result=vm.runInNewContext(output,{t:(hu,en)=>lang==='hu'?hu:en});
  return {output,result};
}
for(const lang of ['hu','en']) {
  test(`Build ${lang}: whitespace before helper parentheses`,()=>{
    const {output,result}=evaluate("t \n\t ('magyar', 'English');",lang);
    assert.equal(result,lang==='hu'?'magyar':'English');
    assert.ok(!output.includes(lang==='hu'?'English':'magyar'));
  });
  test(`Build ${lang}: nested edits preserve offsets and runtime meaning`,()=>{
    const source="t('kulso ' + t('belso', 'inner'), 'outer ' + t('belso', 'inner'));";
    const {output,result}=evaluate(source,lang);
    assert.equal(result,lang==='hu'?'kulso belso':'outer inner');
    assert.ok(!output.includes(lang==='hu'?'inner':'belso'));
    assert.ok(!output.includes(lang==='hu'?'outer':'kulso'));
  });
  test(`Build ${lang}: regex after keywords remains executable`,()=>{
    const source="function f(s){return /}/.test(s);} [f('}'), typeof /}/, void /}/, (function(){switch('}'){case /}/.source:return t('igen','yes');}})()];";
    const {result}=evaluate(source,lang);
    assert.deepEqual(Array.from(result),[true,'object',undefined,lang==='hu'?'igen':'yes']);
  });
  test(`Build ${lang}: division, properties and declarations are preserved`,()=>{
    const source="function t (hu,en){return " + (lang==='hu'?'hu':'en') + ";} const obj={return:8,t:(a,b)=>a+b}; [obj.return / 2, 8 / 2 / 2, obj. t ('left','right'), t ('magyar','English')];";
    const {result}=evaluate(source,lang);
    assert.deepEqual(Array.from(result),[4,2,'leftright',lang==='hu'?'magyar':'English']);
  });
}
