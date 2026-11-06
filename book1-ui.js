function renderChapterNavigation(){
 const nav=document.querySelector('#chapters');nav.replaceChildren();
 const book=EuclidBooks.identity(LESSONS[index]).book,available=EuclidBooks.books.filter(b=>LESSONS.some(l=>EuclidBooks.identity(l).book===b.number));
 if(available.length>1){let chooser=document.createElement('select');chooser.id='book-select';chooser.setAttribute('aria-label','Choose a book');for(let b of available){let option=document.createElement('option');option.value=b.number;option.textContent=b.name;option.selected=b.number===book;chooser.append(option)}chooser.onchange=()=>load(LESSONS.findIndex(l=>EuclidBooks.identity(l).book===Number(chooser.value)));nav.append(chooser)}
 let previous=document.createElement('button');previous.type='button';previous.textContent='\u2039';previous.setAttribute('aria-label','Previous proposition');previous.disabled=index===0;previous.onclick=()=>load(index-1);
 let select=document.createElement('select');select.id='proposition-select';select.setAttribute('aria-label','Choose a proposition');for(let [i,lesson] of LESSONS.entries()){if(EuclidBooks.identity(lesson).book!==book)continue;let progress=i===index?state:saved[i],option=document.createElement('option');option.value=i;option.textContent=EuclidBooks.reference(lesson)+' - '+lesson.title+(progress?.completed?(progress.completionMode&&progress.completionMode!=='Full challenge'?' (cleared)':' (proved)'):'');option.selected=i===index;select.append(option)}select.onchange=()=>load(Number(select.value));
 let next=document.createElement('button');next.type='button';next.textContent='\u203a';next.setAttribute('aria-label','Next proposition');next.disabled=index===LESSONS.length-1;next.onclick=()=>load(index+1);nav.append(previous,select,next);
 const selectedBook=EuclidBooks.books.find(b=>b.number===book);for(let node of document.querySelectorAll('.brief>div>.eyebrow,.menu-top>.eyebrow'))node.textContent='THE ELEMENTS / '+selectedBook.name.toUpperCase();let source=document.querySelector('.reference-source');source.href=selectedBook.source;source.textContent=selectedBook.name+' - definitions and references';let footer=document.querySelector('footer a');footer.href=selectedBook.source;footer.textContent='Read '+selectedBook.name+' \u2197';document.querySelector('.menu-intro').textContent=LESSONS.length+' stages of construction and proof.';
}
function nextPointName(){return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(n=>!state.points[n])}
function bookCertificate(rule,operation,inputs,outputs,claims){state.facts.push('book:'+JSON.stringify({rule:/^I[1-9]\d*$/.test(rule)?Number(rule.slice(1)):rule,operation,inputs,outputs,claims}))}
function validBookCertificate(raw,points){
 if(!raw.startsWith('book:'))return false;
 try{let c=JSON.parse(raw.slice(5));return EuclidConstruction.certificate(c,points)&&(Number.isInteger(c.rule)&&c.rule>0&&c.rule<=48||/^E2\.(?:11|14)$/.test(c.rule))&&typeof c.operation==='string'&&['equilateral','copy','cut','bisectAngle','midpoint','perpendicular','sss','copyAngle','parallel','equalArea','applyArea','figureArea','square','goldenDivide','equalAreaSquare'].includes(c.operation)&&Array.isArray(c.inputs)&&Array.isArray(c.outputs)&&[...c.inputs,...c.outputs].every(n=>/^[A-Z]$/.test(n)&&points[n])&&Array.isArray(c.claims)&&c.claims.length<=20&&c.claims.every(s=>typeof s==='string'&&s.length<=200&&BookOneLogic.parse(s)&&BookOneLogic.statementNames(BookOneLogic.parse(s)).every(n=>points[n]))}catch{return false}
}
function bookToolInstruction(){
 if(tool?.[3]==='equalAreaSquare')return picks.length>=4&&picks.at(-1)===picks[0]?'Boundary closed. Click the point where the square should start.':'Click the figure vertices in order. Click the first again to close its boundary, then choose a starting point for the square.';
 if(!tool)return null;let mode=tool[3];const messages={goldenDivide:'Click the start, then the end of the segment to divide.',semicircle:'Click the circle center, both diameter endpoints, then a point on the desired side.',equilateral:'Click the endpoints of a segment.',copy:'Click the destination, then the source length endpoints.',cut:'Click the greater segment endpoints, then the source length endpoints.',bisectAngle:'Click the first ray point, vertex, and second ray point.',midpoint:'Click the segment endpoints.',perpendicular:'Click two points on the line, then the point for the perpendicular.',sss:'Click three pairs of length endpoints, then the destination and a ray point.',copyAngle:'Click the source ray point, vertex, and ray point, then the destination and a ray point.',parallel:'Click the destination, then two points on the reference line.',equalArea:'Click triangle vertices, angle ray/vertex/ray, then destination and a base-line point. Follow any extension through the destination.',applyArea:'Click the base endpoints, triangle vertices, then angle ray/vertex/ray.',figureArea:'Click the four figure vertices, angle ray/vertex/ray, then destination and a ray point.',square:'Click the segment endpoints.'};
 return messages[mode]?tool[1]+': '+messages[mode]+' ('+picks.length+' selected)':null;
}
function bookOneChoosePoint(name){
 if(!tool||!tool[3])return false;let mode=tool[3];if(mode==='point')return true;
 if(mode==='equalAreaSquare'&&!(picks.length>=4&&picks.at(-1)===picks[0])){if(name===picks[0]&&picks.length<3){$('#instruction').textContent='Choose at least three boundary vertices before closing the figure.';return true}if(picks.includes(name)&&name!==picks[0]){$('#instruction').textContent='Use each boundary vertex once. Click the first again to close the figure.';return true}picks.push(name);render();return true}
 const counts={line:2,extend:2,circle:2,semicircle:4,equilateral:2,copy:3,cut:4,bisectAngle:3,midpoint:2,perpendicular:3,sss:8,copyAngle:5,parallel:3,equalArea:8,applyArea:8,figureArea:9,square:2,goldenDivide:2,equalAreaSquare:picks.length+1};if(!counts[mode])return false;
 picks.push(name);if(picks.length<counts[mode]){render();return true}let inputs=[...picks];picks=[];snapshot();const original=JSON.stringify(state);
 if(mode==='equalAreaSquare')inputs.splice(-2,1);
 if(mode==='square'){let task=(LESSONS[index].construction||[]).find(t=>t.ref===tool[1]&&t.inputs.length===2&&[...t.inputs].sort().join('')===[...inputs].sort().join('')&&t.outputs.every(n=>!state.points[n]));if(task)inputs=[...task.inputs]}
 try{
  const p=n=>state.points[n],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],sum=(a,b)=>[a[0]+b[0],a[1]+b[1]],scale=(v,k)=>v.map(x=>x*k),unit=v=>{let l=Math.hypot(...v);if(l<1e-8)throw Error('Choose two distinct points.');return scale(v,1/l)},upNormal=v=>{let n=[-v[1],v[0]];return n[1]>0||Math.abs(n[1])<1e-8&&n[0]>0?scale(n,-1):n};
  let created=[],claims=[],[a,b,c,e]=inputs;
  const point=coordinate=>{let n=nextPointName();if(!n)throw Error('All 26 point names are used. Undo an unnecessary construction.');state.points[n]=coordinate;created.push(n);return n};
  if(mode==='goldenDivide'){if(a===b||distance(p(a),p(b))<1e-7||!EuclidLogic.diagram(state).drawn(a,b))throw Error('Choose the start and end of a drawn nonzero segment.');let n=point(sum(p(a),scale(sub(p(b),p(a)),(Math.sqrt(5)-1)/2)));addEdge(a,n);addEdge(n,b);EuclidConstruction.support(state,a+b,n);claims=[a+b+'*'+b+n+' = '+a+n+'^2']}
  else if(mode==='equalAreaSquare'){
   let shape=inputs.slice(0,-1),origin=inputs.at(-1),d=EuclidLogic.diagram(state);if(shape.length<3||new Set(shape).size!==shape.length||!shape.every((n,i)=>d.drawn(n,shape[(i+1)%shape.length])&&distance(p(n),p(shape[(i+1)%shape.length]))>1e-7&&d.turn(shape[(i+shape.length-1)%shape.length],n,shape[(i+1)%shape.length])))throw Error('Choose the boundary of a drawn, nondegenerate figure in order.');
   for(let i=0;i<shape.length;i++)for(let j=i+1;j<shape.length;j++){if(j===i+1||i===0&&j===shape.length-1)continue;let [a,b,c,e]=[shape[i],shape[(i+1)%shape.length],shape[j],shape[(j+1)%shape.length]];if(d.turn(a,b,c)*d.turn(a,b,e)<0&&d.turn(c,e,a)*d.turn(c,e,b)<0||[[a,b,c],[a,b,e],[c,e,a],[c,e,b]].some(([a,b,n])=>d.collinear(a,b,n)&&d.between(a,n,b)))throw Error('The boundary must not cross or touch itself.')}
   let twiceArea=0;for(let i=0;i<shape.length;i++){let a=p(shape[i]),b=p(shape[(i+1)%shape.length]);twiceArea+=a[0]*b[1]-a[1]*b[0]}let side=Math.sqrt(Math.abs(twiceArea)/2);if(side<1e-7)throw Error('Choose a figure with positive area.');let n=point(sum(p(origin),[side,0])),m=point(sum(p(origin),[side,-side])),q=point(sum(p(origin),[0,-side])),polygon=origin+n+m+q;for(let i=0;i<4;i++)addEdge(polygon[i],polygon[(i+1)%4]);claims=[polygon+' is a square',polygon+' is a parallelogram','area '+polygon+' = area '+shape.join('')];
  }
  else if(mode==='line')addEdge(a,b);
  else if(mode==='extend'){if(a===b)throw Error('Choose distinct points.');if(!state.rays.includes(a+b))state.rays.push(a+b);
   const task=(LESSONS[index].construction||[]).find(t=>t.ref==='P2'&&t.inputs.join('')===a+b&&t.outputs.length&&!state.points[t.outputs[0]]);
   if(task){let next=LESSONS[index].construction[LESSONS[index].construction.indexOf(task)+1],length=next?.ref==='I3'&&next.inputs[1]===task.outputs[0]?distance(p(next.inputs[2]),p(next.inputs[3]))*1.4:Math.max(80,distance(p(a),p(b))*.45);let n=point(sum(p(b),scale(unit(sub(p(b),p(a))),length)));EuclidConstruction.support(state,a+b,n);state.facts.push('extend:'+a+':'+b+':'+n)}
  }
  else if(mode==='circle'){if(a===b)throw Error('A circle needs a nonzero radius.');if(!state.circles.some(c=>c.a===a&&c.b===b))state.circles.push({a,b})}
  else if(mode==='semicircle'){EuclidCurves.createSemicircle(state,LESSONS[index],inputs)}
  else if(mode==='equilateral'){if(a===b||distance(p(a),p(b))<1e-7)throw Error('Choose distinct endpoints.');let u=p(a),v=p(b),w=point([(u[0]+v[0])/2+(v[1]-u[1])*Math.sqrt(3)/2,(u[1]+v[1])/2-(v[0]-u[0])*Math.sqrt(3)/2]);addEdge(a,b);addEdge(a,w);addEdge(b,w);claims=[a+w+' = '+a+b,b+w+' = '+a+b,a+w+' = '+b+w,a+b+w+' is equilateral']}
  else if(mode==='copy'){
   if(b===c||distance(p(b),p(c))<1e-7)throw Error('Choose a nonzero source length.');let direction=[1,0];if(LESSONS[index].id===46&&state.points.C&&a==='A')direction=unit(sub(p('C'),p(a)));
   let n=point(sum(p(a),scale(direction,distance(p(b),p(c)))));addEdge(a,n);claims=[a+n+' = '+b+c];
  }
  else if(mode==='cut'){let length=distance(p(c),p(e)),available=distance(p(a),p(b));if(length<1e-7)throw Error('Choose a nonzero source length.');if(length>=available-1e-7)throw Error('Choose a source strictly shorter than the segment to cut.');let n=point(sum(p(a),scale(unit(sub(p(b),p(a))),length)));addEdge(a,n);EuclidConstruction.support(state,a+b,n);claims=[a+n+' = '+c+e]}
  else if(mode==='midpoint'){if(a===b||distance(p(a),p(b))<1e-7)throw Error('Choose distinct endpoints.');let n=point(scale(sum(p(a),p(b)),.5));addEdge(a,n);addEdge(n,b);EuclidConstruction.support(state,a+b,n);claims=[a+n+' = '+n+b,a+n+b+' are collinear']}
  else if(mode==='bisectAngle'){
   if(new Set([a,b,c]).size!==3||!EuclidConstruction.turn(state,a,b,c))throw Error('Choose three distinct angle points.');let left=distance(p(a),p(b)),right=distance(p(c),p(b)),n=point(scale(sum(scale(p(a),right),scale(p(c),left)),1/(left+right)));addEdge(b,n);EuclidConstruction.support(state,a+c,n);claims=['angle '+a+b+n+' = angle '+n+b+c];
  }
  else if(mode==='perpendicular'){
   let onLine=EuclidLogic.diagram(state).collinear(a,b,c);if(tool[1]==='I11'&&!onLine||tool[1]==='I12'&&(onLine||!EuclidConstruction.turn(state,a,b,c)))throw Error(tool[1]==='I11'?'E.11 needs a point on the line. Use E.12 for an outside point.':'E.12 needs a point outside the line.');let direction=unit(sub(p(b),p(a))),v=sub(p(c),p(a)),projection=sum(p(a),scale(direction,v[0]*direction[0]+v[1]*direction[1])),n;
   if(distance(projection,p(c))<1e-6)n=point(sum(p(c),scale(upNormal(direction),160)));else {n=point(projection);EuclidConstruction.support(state,a+b,n)}addEdge(c,n);claims=[c+n+' is perpendicular to '+a+b];
  }
  else if(mode==='parallel'){if(EuclidLogic.diagram(state).collinear(a,b,c)||!EuclidConstruction.turn(state,a,b,c))throw Error('Choose a point outside the reference line.');let n=point(sum(p(a),scale(unit(sub(p(c),p(b))),160)));addEdge(a,n);claims=[a+n+' is parallel to '+b+c]}
  else if(mode==='copyAngle'){
   let [u,v,w,origin,ray]=inputs;if(!EuclidConstruction.turn(state,u,v,w))throw Error('Choose a nonzero, nonstraight source angle.');let x=unit(sub(p(u),p(v))),y=unit(sub(p(w),p(v))),angle=Math.acos(Math.max(-1,Math.min(1,x[0]*y[0]+x[1]*y[1]))),basis=unit(sub(p(ray),p(origin))),rotate=t=>[basis[0]*Math.cos(t)-basis[1]*Math.sin(t),basis[0]*Math.sin(t)+basis[1]*Math.cos(t)],choices=[rotate(angle),rotate(-angle)].sort((x,y)=>x[1]-y[1]),n=point(sum(p(origin),scale(choices[0],LESSONS[index].id===24?400:160)));addEdge(origin,n);claims=['angle '+ray+origin+n+' = angle '+u+v+w];
  }
  else if(mode==='sss'){
   let [u,v,w,x,y,z,origin,ray]=inputs,base=distance(p(u),p(v)),r=distance(p(w),p(x)),s=distance(p(y),p(z));if(r+s<=base||base+s<=r||base+r<=s)throw Error('These lengths do not satisfy the triangle inequalities.');let basis=unit(sub(p(ray),p(origin))),normal=upNormal(basis),along=(base*base+r*r-s*s)/(2*base),height=Math.sqrt(Math.max(0,r*r-along*along)),n=point(sum(p(origin),scale(basis,base))),m=point(sum(p(origin),sum(scale(basis,along),scale(normal,height))));addEdge(origin,n);addEdge(origin,m);addEdge(n,m);EuclidConstruction.support(state,origin+ray,n);claims=[origin+n+' = '+u+v,origin+m+' = '+w+x,n+m+' = '+y+z];
  }
  else if(['equalArea','applyArea','figureArea'].includes(mode)){
   let shape,angle,origin,ray,baseLength,basis;
   if(mode==='applyArea'){[origin,ray]=inputs;shape=inputs.slice(2,5);angle=inputs.slice(5,8);baseLength=distance(p(origin),p(ray));basis=unit(sub(p(ray),p(origin)))}
   else{shape=inputs.slice(0,mode==='figureArea'?4:3);angle=inputs.slice(shape.length,shape.length+3);[origin,ray]=inputs.slice(-2);basis=unit(sub(p(ray),p(origin)))}
   if(mode==='equalArea'&&state.rays.includes(ray+origin))basis=unit(sub(p(origin),p(ray)));
   let area=0;for(let i=0;i<shape.length;i++){let u=p(shape[i]),v=p(shape[(i+1)%shape.length]);area+=u[0]*v[1]-v[0]*u[1]}area=Math.abs(area)/2;if(area<1e-7)throw Error('Choose a nondegenerate figure.');baseLength=baseLength||Math.sqrt(2*area);let u=unit(sub(p(angle[0]),p(angle[1]))),v=unit(sub(p(angle[2]),p(angle[1]))),cos=u[0]*v[0]+u[1]*v[1],sin=Math.abs(u[0]*v[1]-u[1]*v[0]);if(sin<1e-7)throw Error('Choose an angle strictly between zero and two right angles.');let normal=upNormal(basis),height=area/baseLength,offset=sum(scale(basis,height*cos/sin),scale(normal,height)),end=mode==='applyArea'?ray:point(sum(p(origin),scale(basis,baseLength))),topEnd=point(sum(p(end),offset)),topOrigin=point(sum(p(origin),offset)),polygon=origin+end+topEnd+topOrigin;addEdge(origin,end);addEdge(end,topEnd);addEdge(topEnd,topOrigin);addEdge(topOrigin,origin);claims=[polygon+' is a parallelogram','area '+polygon+' = area '+shape.join(''),'angle '+topOrigin+origin+end+' = angle '+angle.join(''),'angle '+end+origin+topOrigin+' = angle '+angle.join('')];
  }
  else if(mode==='square'){
   if(a===b||distance(p(a),p(b))<1e-7)throw Error('Choose distinct square endpoints.');let v=sub(p(b),p(a)),normal=[-v[1],v[0]],third='ABC'.split('').find(n=>n!==a&&n!==b&&state.points[n]);
   if(third&&'ABC'.includes(a)&&'ABC'.includes(b)){let side=v[0]*(p(third)[1]-p(a)[1])-v[1]*(p(third)[0]-p(a)[0]);if(side>0)normal=scale(normal,-1)}else if(normal[1]>0)normal=scale(normal,-1);
   const task=(LESSONS[index].construction||[]).find(t=>t.ref===tool[1]&&t.inputs.join('')===inputs.join('')&&t.toward&&t.outputs.every(n=>!state.points[n]));if(task&&p(task.toward)){let target=sub(p(task.toward),p(a)),side=v[0]*target[1]-v[1]*target[0],drawnSide=v[0]*normal[1]-v[1]*normal[0];if(!side)throw Error('The square side marker must be outside its base line.');if(side*drawnSide<0)normal=scale(normal,-1)}
   let n=point(sum(p(b),normal)),m=point(sum(p(a),normal)),polygon=a+b+n+m;addEdge(a,b);addEdge(b,n);addEdge(n,m);addEdge(m,a);claims=[polygon+' is a square',polygon+' is a parallelogram',a+b+' = '+b+n,a+b+' = '+a+m,a+m+' is perpendicular to '+a+b];
  }

  if(mode==='copy'&&LESSONS[index].id===46&&a==='A'&&state.points.C)EuclidConstruction.support(state,'AC',created[0]);
  if(['equalArea','figureArea'].includes(mode))EuclidConstruction.support(state,inputs.slice(-2).join(''),created[0]);
  for(let n of created)EuclidConstruction.point(state,n);
  if(mode==='equilateral'){state.facts.push('equilateral:'+created[0]+':'+a+':'+b);if(index===1&&created[0]==='D'&&[a,b].sort().join('')==='AB')state.facts.push('equilateral:D')}
  if(mode==='copy'&&LESSONS[index].id<=5)state.facts.push('copy:'+a+':'+created[0]+':'+b+':'+c);
  if(claims.length)bookCertificate(tool[1],mode,inputs,created,claims);render();
 }catch(error){state=JSON.parse(original);history.pop();$('#instruction').textContent=error.message}
 return true;
}
function bookOneIntersections(){
 let output=[],objects=[...state.edges.map(e=>({kind:'line',names:e})),...state.rays.map(e=>({kind:'line',names:e})),...state.circles.filter(c=>!EuclidCurves.masked(state,c)).map(c=>({kind:'circle',...c})),...(state.arcs||[]).map(arc=>({kind:'circle',...EuclidCurves.circle(state,arc.circleId),arc}))],p=n=>state.points[n],cross=(a,b)=>a[0]*b[1]-a[1]*b[0],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
 for(let i=0;i<objects.length;i++)for(let j=i+1;j<objects.length;j++){
  let a=objects[i],b=objects[j];if(a.kind==='line'&&b.kind==='circle')[a,b]=[b,a];
  const selected=[a,b].map(o=>o.kind==='line'?o.names:o.arc?'arc:'+o.arc.id:'circle:'+o.a+o.b),put=q=>{if([a,b].some(o=>o.arc&&!EuclidCurves.containsPosition(state,o.arc,q)))return;q.supports=selected;output.push(q)};
  if(a.kind==='line'&&b.kind==='line'){let u=p(a.names[0]),v=p(a.names[1]),x=p(b.names[0]),y=p(b.names[1]),r=sub(v,u),s=sub(y,x),denominator=cross(r,s);if(Math.abs(denominator)<1e-8)continue;let t=cross(sub(x,u),s)/denominator;put([u[0]+t*r[0],u[1]+t*r[1]])}
  else if(a.kind==='circle'&&b.kind==='circle'){let u=p(a.a),v=p(b.a),r=distance(u,p(a.b)),s=distance(v,p(b.b)),length=distance(u,v);if(length<1e-8||length>r+s||length<Math.abs(r-s))continue;let along=(r*r-s*s+length*length)/(2*length),height=Math.sqrt(Math.max(0,r*r-along*along)),dx=(v[0]-u[0])/length,dy=(v[1]-u[1])/length;for(let sign of [-1,1])put([u[0]+along*dx-sign*height*dy,u[1]+along*dy+sign*height*dx])}
  else{let center=p(a.a),r=distance(center,p(a.b)),u=p(b.names[0]),v=p(b.names[1]),direction=sub(v,u),offset=sub(u,center),aa=direction[0]**2+direction[1]**2,bb=2*(direction[0]*offset[0]+direction[1]*offset[1]),cc=offset[0]**2+offset[1]**2-r*r,discriminant=bb*bb-4*aa*cc;if(discriminant<0||aa<1e-8)continue;for(let sign of [-1,1]){let t=(-bb+sign*Math.sqrt(discriminant))/(2*aa);put([u[0]+t*direction[0],u[1]+t*direction[1]])}}
 }
 return output.filter(v=>v.every(Number.isFinite)&&!Object.values(state.points).some(q=>distance(v,q)<.01));
}
function bookOneMark(coordinate,selectedSupports){
 const candidates=bookOneIntersections().sort((a,b)=>distance(a,coordinate)-distance(b,coordinate)),scale=Math.hypot($('#canvas').getScreenCTM().a,$('#canvas').getScreenCTM().b),snapped=!!candidates[0]&&distance(candidates[0],coordinate)*scale<=20,point=snapped?candidates[0]:coordinate;
 let name=nextPointName();const onCircle=(a,b)=>state.points[a]&&state.points[b]&&state.circles.some(c=>c.a===a&&c.b===b)&&Math.abs(distance(point,state.points[a])-distance(state.points[a],state.points[b]))<1e-6;
 const onExtension=(a,b)=>{let u=state.points[a],v=state.points[b];return u&&v&&state.rays.includes(a+b)&&Math.abs((v[0]-u[0])*(point[1]-u[1])-(v[1]-u[1])*(point[0]-u[0]))<.001&&(point[0]-u[0])*(v[0]-u[0])+(point[1]-u[1])*(v[1]-u[1])>distance(u,v)**2};
 if(index===1&&snapped){if(!state.points.G&&onCircle('B','C')&&onExtension('D','B'))name='G';else if(!state.points.L&&onCircle('D','G')&&onExtension('D','A'))name='L'}
 if(index===2&&snapped&&!state.points.F&&onCircle('A','E')){let [a,b]=[state.points.A,state.points.B];if(Math.abs((b[0]-a[0])*(point[1]-a[1])-(b[1]-a[1])*(point[0]-a[0]))<.001&&distance(point,a)<distance(a,b)&&distance(point,b)<distance(a,b))name='F'}
 if(!name){$('#instruction').textContent='All 26 point names are in use. Undo an unnecessary point.';return}
 const task=(LESSONS[index].construction||[]).find(t=>t.ref==='D1'&&t.outputs[0]===name),planned=task?.supports||(typeof INTERSECTION_SUPPORTS!=='undefined'?INTERSECTION_SUPPORTS[LESSONS[index].id]?.[name]:null);
 const liesOn=s=>{if(s.startsWith('arc:'))return point.supports?.includes(s);if(s.startsWith('circle:'))return onCircle(s[7],s[8]);let u=state.points[s[0]],v=state.points[s[1]];return u&&v&&Math.abs((v[0]-u[0])*(point[1]-u[1])-(v[1]-u[1])*(point[0]-u[0]))<.001};
 const supports=selectedSupports||((planned&&planned.every(liesOn))?planned:point.supports);
 snapshot();state.points[name]=point.slice(0,2);EuclidConstruction.point(state,name);if(snapped)EuclidConstruction.intersection(state,name,supports);render();
}
function bookOneHint(){
 const lesson=LESSONS[index],progress=constructionProgress(state,lesson);for(let [i,task] of (lesson.construction||[]).entries()){if(progress.checks[i])continue;if(task.beyond&&task.outputs.length&&task.outputs.every(n=>state.points[n]))return 'The existing '+task.outputs.join(', ')+' do not satisfy the required construction on the extension of '+task.beyond+'. Undo that construction, or use Start over, then '+task.text;if(task.ref==='D1'&&task.inputs.length)return task.text+' Click '+task.inputs.join(', ')+'.';if(!task.outputs.length&&['P1','P2','P3'].includes(task.ref))return task.text;if(task.outputs.length)return task.text+' '+(task.inputs.length?'Click '+task.inputs.join(', ')+', in that order.':'Mark the stated intersection.');}
 const result=settings.skipJustifications?inferredProof(state,lesson):EuclidLogic.grade(state,lesson);if(result.complete)return 'This proposition is complete. Continue when you are ready.';
 const context=result.context||BookOneLogic.context(state,lesson);
 for(let step of lesson.proofGuide||[]){let query=BookOneLogic.parse(step.s),same=l=>context.key(BookOneLogic.parse(l.s))===context.key(query);if(state.lines.some(l=>l.valid&&same(l)))continue;let pending=state.lines.findIndex(same),bad=state.lines.findIndex(l=>!l.valid),target=pending>=0?pending:bad;
 let action=target>=0?(pending>=0?'Justify line '+(target+1)+': '+step.s+'.':'Edit line '+(target+1)+' to say: '+step.s+'.'):'Add: '+step.s+'.';
 return action+'\n\nWhy: '+proofStepReason(lesson,step)+(settings.skipJustifications?'\n\nJustification is automatic.':'\n\nChoose a justification. Click '+(target>=0?'line '+(target+1):'the new proof line')+' to apply it.');}
 let bad=state.lines.findIndex(l=>!l.valid);return bad>=0?'The conclusion is established, but line '+(bad+1)+' needs correction: '+hintFeedback(state.lines[bad].error)+' Use Edit to correct it, or Delete to remove an unnecessary line.':'This proposition is complete. Continue when you are ready.';
}
function fitConstructionView(){if(index<5){$('#canvas').setAttribute('viewBox','0 0 800 540');return}let values=Object.values(state.points),xs=values.map(p=>p[0]),ys=values.map(p=>p[1]);for(let p of EuclidCurves.diagramPoints(state)){xs.push(p[0]);ys.push(p[1])}let x0=Math.min(0,...xs),y0=Math.min(0,...ys),x1=Math.max(800,...xs),y1=Math.max(540,...ys),px=Math.max(30,(x1-x0)*.1+8),py=Math.max(40,(y1-y0)*.1+8),left=x0-px,top=y0-py,right=x1+px,bottom=y1+py;$('#canvas').setAttribute('viewBox',[left,top,right-left,bottom-top].join(' '))}
