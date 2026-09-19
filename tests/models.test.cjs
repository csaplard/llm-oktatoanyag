const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const context={window:{KatedraLabs:{math:{},register(){}}}};
vm.createContext(context);
for(const f of ['labs-foundations.js','labs-advanced.js'])vm.runInContext(fs.readFileSync('src/'+f,'utf8'),context);
const m=context.window.KatedraLabs.math;
const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
test('BPE pair counts include corpus frequency and merges preserve text',()=>{
 const corpus=[['low',5],['lower',2],['newest',6],['widest',3]];
 const r=m.bpeTrace(corpus,1);
 assert.equal(r.history[0].frequency,9);
 assert.equal(r.history[0].pair.join(''),'es');
 for(const w of m.bpeTrace(corpus,10).words)assert.equal(w.tokens.join(''),w.word+'▁');
});
test('Vector dot changes with length, cosine does not; null vector handled',()=>{
 near(m.vectorStats(60,2).dot,2);near(m.vectorStats(60,3).dot,3);
 near(m.vectorStats(60,2).cosine,m.vectorStats(60,3).cosine);
 assert.equal(m.vectorStats(0,0).cosine,null);
 const result=m.matrixVector([[0,-1],[1,0]],[1,0]);near(result[0],0);near(result[1],1);
});
test('Softmax is stable, translation invariant, and normalized',()=>{
 const p=m.softmaxStable([1001,1000,999],.1),q=m.softmaxStable([1,0,-1],.1);
 near(p.reduce((s,x)=>s+x,0),1);
 p.forEach((x,i)=>near(x,q[i]));
 near(m.softmaxStable([1,0])[0],Math.E/(1+Math.E));
});
test('Causal attention blocks future information and is a weighted V sum',()=>{
 const a=m.attentionToy(1,0,true),b=m.attentionToy(1,5,true),c=m.attentionToy(1,5,false);
 near(a.probabilities[2],0);near(a.output[0],b.output[0]);
 assert.ok(Math.abs(c.output[0]-b.output[0])>.01);
 for(let j=0;j<2;j++)near(c.output[j],c.probabilities.reduce((s,p,i)=>s+p*c.V[i][j],0));
});
test('Gradient and backprop agree with finite differences',()=>{
 const w=1.2,x=2.5,y=3,eps=1e-5;
 near(m.scalarBackprop(w,x,y).gradient,(m.scalarBackprop(w+eps,x,y).loss-m.scalarBackprop(w-eps,x,y).loss)/(2*eps),1e-8);
 near(m.descentTrace(-1,1,1)[1].loss,0);
 const stable=m.descentTrace(-1,.4,8);assert.ok(stable.at(-1).loss<stable[0].loss);
 const divergent=m.descentTrace(-1,2.2,8);assert.ok(divergent.at(-1).loss>divergent[0].loss);
});
test('Normalization distinguishes translation from rescaling',()=>{
 const a=m.normalization({offset:0,scale:1}),b=m.normalization({offset:3,scale:1});
 a.ln.forEach((x,i)=>near(x,b.ln[i]));
 near(b.ln.reduce((s,x)=>s+x,0),0);
 assert.ok(b.rmsnorm.every(x=>x>0));
});
test('RoPE dot product depends on relative position for fixed base vectors',()=>{
 for(let shift=0;shift<13;shift++)near(m.rope({query:3,key:1,shift}).dot,m.rope({query:3,key:1,shift:0}).dot);
 const r=m.rope({query:7,key:3,shift:2});near(r.dot,r.expected);
});
test('KV-cache units, head sharing and batch scaling',()=>{
 near(m.kvCache({context:8192,batch:1,heads:8}).gib,1);
 near(m.kvCache({context:8192,batch:2,heads:8}).gib,2);
 near(m.kvCache({context:8192,batch:1,heads:32}).gib,4);
});
test('Residual and superposition handle cancellation',()=>{
 const r=m.residual({attention:false,mlp:false});r.output.forEach((x,i)=>near(x,r.input[i]));
 const s=m.superposition({angle:120,a:true,b:true,c:true});s.h.forEach(x=>near(x,0));
 assert.ok(s.mse>.9);
});
test('Toy patching measures recovery relative to clean and corrupt',()=>{
 near(m.patching({source:'clean',patch:'a'}).recovery,.8);
 near(m.patching({source:'clean',patch:'b'}).recovery,.2);
 near(m.patching({source:'clean',patch:'both'}).recovery,1);
 near(m.patching({source:'corrupt',patch:'both'}).recovery,0);
});
test('Preference loss gradient is correct and one step improves loss',()=>{
 for(const beta of [.1,.5,1,2]){
  const s={logOdds:.2,beta,strength:1},r=m.preference(s),eps=1e-5;
  near(r.gradient,(m.preference({...s,logOdds:s.logOdds+eps}).loss-m.preference({...s,logOdds:s.logOdds-eps}).loss)/(2*eps),1e-8);
  assert.ok(r.nextLoss<=r.loss);assert.ok(r.nextP>=r.p);
 }
});
