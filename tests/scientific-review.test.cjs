const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function quizzes(path){
 const text=fs.readFileSync(path,'utf8');
 const start=text.indexOf('var QUIZZES = ')+14;
 const end=text.indexOf('\n  };',start)+4;
 return vm.runInNewContext('('+text.slice(start,end).replace(/;\s*$/,'')+')');
}
test('Revised bilingual quizzes retain IDs, one correct option and consistent numeric keys',()=>{
 const hu=quizzes('index.html'),en=quizzes('en/index.html');
 const expected=[20,31744,400,16,7,3,140,50,1,2,65536,12000];
 assert.equal(Object.values(hu).flat().length,60);
 assert.equal(Object.values(en).flat().length,60);
 for(let level=1;level<=12;level++){
  assert.equal(hu[level].length,5);assert.equal(en[level].length,5);
  for(let j=0;j<5;j++){
   const a=hu[level][j],b=en[level][j];
   // Preserve the pre-existing HU mi-abláció / EN mi-ablacio IDs.
   assert.equal(a.id.normalize("NFD").replace(/\p{Diacritic}/gu,""),b.id);assert.equal(a.type,b.type);
   for(const q of [a,b]){
    assert.ok(q.q&&q.why);
    if(q.type==='choice'){
     assert.equal(q.options.length,4);
     assert.equal(q.options.filter(x=>x.ok).length,1);
     assert.equal(new Set(q.options.map(x=>x.t)).size,4);
    }else assert.equal(q.answer,expected[level-1]);
   }
  }
 }
});

test('Quiz explanations identify shuffled choices by content, not position',()=>{
 const positional=/(?:első|második|harmadik|negyedik|utolsó)\s+(?:rossz\s+)?válasz|\b(?:first|second|third|fourth|last)\s+(?:wrong\s+)?answer\b/iu;
 for(const file of ['index.html','en/index.html']) {
  for(const q of Object.values(quizzes(file)).flat()) {
   const explanation=q.why.replace(/<[^>]*>/g,' ');
   assert.doesNotMatch(explanation,positional,file+': '+q.id);
   assert.doesNotMatch(explanation,/következő kérdés|\bnext question\b/iu,file+': '+q.id);
  }
 }
});
