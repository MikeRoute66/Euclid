/* Earlier Book II theorem schemas. These operate on arbitrary constructed
 * labels and incidence, independently of the lesson's expected proof. */
const BookTwoLogic=(()=>{
 const factors=t=>t.kind==='product'?t.term.split('*'):t.kind==='square'?[t.term.slice(0,2),t.term.slice(0,2)]:null;
 function check(t,reference,c,lesson){
  const fail=error=>({ok:false,error:error||'The recorded division and established premises do not meet this proposition.'});
  if(!EuclidBooks.earlier(reference,lesson))return fail('Use an earlier proposition; the current result cannot justify itself.');
  if(t?.kind!=='eq'||[...t.left,...t.right].some(v=>!factors(v)))return fail();
  const number=Number(reference.split('.')[1]),all=[...t.left,...t.right].flatMap(v=>factors(v)),sort=s=>[...s].sort().join('');
  if(all.some(s=>[...s].some(n=>!c.d.points[n])||!c.d.drawn(s[0],s[1])))return fail('Every named segment must belong to the recorded construction.');
  const length=s=>sort(all.find(v=>c.equal(s,v))||s),product=(a,b)=>[length(a),length(b)].sort().join('*');
  function polynomial(rows){let out=new Map();for(let [n,a,b] of rows){let key=product(a,b);out.set(key,(out.get(key)||0)+n)}for(let [k,n] of out)if(!n)out.delete(k);return out}
  const target=polynomial([...t.left.map(v=>[v.coefficient,...factors(v)]),...t.right.map(v=>[-v.coefficient,...factors(v)])]);
  const matches=rows=>{let expected=polynomial(rows);return expected.size===target.size&&[1,-1].some(sign=>[...expected].every(([k,n])=>target.get(k)===sign*n))};
  let ok=false;
  if(number===1){
   for(let [whole,parts] of [[t.left,t.right],[t.right,t.left]]){
    if(whole.length!==1||parts.length<2||[...whole,...parts].some(v=>v.coefficient!==1))continue;
    for(let [common,base] of [factors(whole[0]),factors(whole[0]).slice().reverse()]){
     let segments=parts.map(v=>{let [a,b]=factors(v);return c.equal(a,common)?b:c.equal(b,common)?a:null});if(segments.some(s=>!s))continue;
     let current=base[0],visited=new Set([current]),remaining=[...segments],valid=true;
     while(remaining.length){let adjacent=remaining.map((s,i)=>s.includes(current)?i:-1).filter(i=>i>=0);if(adjacent.length!==1){valid=false;break}let segment=remaining.splice(adjacent[0],1)[0],next=segment[0]===current?segment[1]:segment[0];if(visited.has(next)||next!==base[1]&&!c.d.between(base[0],next,base[1])||current!==base[0]&&!c.d.between(base[0],current,next)){valid=false;break}visited.add(next);current=next}
     if(valid&&current===base[1])ok=true;
    }
   }
  }else if([12,13].includes(number)){
   for(let b of c.d.names)for(let d of c.d.names)for(let a of c.d.names){
    if(a===b||d===a||!c.d.drawn(number===12?b:a,d))continue;
    for(let vertex of c.d.names){
     if(!c.d.proper(a+b+vertex))continue;
     if(number===12&&c.d.between(vertex,a,d)&&c.perpendicular(b+d,vertex+a)&&matches([[1,b+vertex,b+vertex],[-1,b+a,b+a],[-1,a+vertex,a+vertex],[-2,vertex+a,a+d]]))ok=true;
     if(number===13&&d!==b&&c.d.between(b,d,vertex)&&c.perpendicular(a+d,b+vertex)&&[a+b+vertex,b+vertex+a,vertex+a+b].every(angle=>c.acute(angle))&&matches([[1,vertex+b,vertex+b],[1,b+a,b+a],[-1,a+vertex,a+vertex],[-2,vertex+b,b+d]]))ok=true;
    }
   }
  }else if([5,6,9,10].includes(number)){
   for(let a of c.d.names)for(let m of c.d.names)for(let b of c.d.names){
    if(!c.d.between(a,m,b)||!c.equal(a+m,m+b))continue;
    for(let cut of c.d.names){
     if(number===5&&c.d.between(m,cut,b)&&matches([[1,a+cut,cut+b],[1,m+cut,m+cut],[-1,m+b,m+b]]))ok=true;
     if(number===6&&c.d.between(a,b,cut)&&matches([[1,a+cut,b+cut],[1,m+b,m+b],[-1,m+cut,m+cut]]))ok=true;
     if(number===9&&c.d.between(m,cut,b)&&matches([[1,a+cut,a+cut],[1,cut+b,cut+b],[-2,a+m,a+m],[-2,m+cut,m+cut]]))ok=true;
     if(number===10&&c.d.between(a,b,cut)&&matches([[1,a+cut,a+cut],[1,cut+b,cut+b],[-2,a+m,a+m],[-2,m+cut,m+cut]]))ok=true;
    }
   }
  }else if([2,3,4,7,8].includes(number)){
   for(let a of c.d.names)for(let m of c.d.names)for(let b of c.d.names){
    if(!c.d.between(a,m,b)||!c.d.drawn(a,b))continue;let w=a+b,x=a+m,y=m+b;
    if(number===8){for(let cut of c.d.names)if(c.d.between(a,b,cut)&&c.equal(b+cut,y)&&matches([[4,w,y],[1,x,x],[-1,a+cut,a+cut]]))ok=true;continue}
    let rows=number===2?[[1,w,x],[1,w,y],[-1,w,w]]:number===3?[[1,w,y],[-1,x,y],[-1,y,y]]:number===4?[[1,w,w],[-1,x,x],[-1,y,y],[-2,x,y]]:[[1,w,w],[1,x,x],[-2,w,x],[-1,y,y]];
    if(matches(rows))ok=true;
   }
  }
  return ok?{ok:true,explanation:'Apply '+reference+' to the recorded division of the straight line. No displayed measurements are used.',sourcePropositions:[reference]}:fail();
 }
 return {check};
})();
