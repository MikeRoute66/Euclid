function renderChapterNavigation(){
 const nav=document.querySelector('#chapters');nav.replaceChildren();
 let previous=document.createElement('button');previous.type='button';previous.textContent='\u2039';previous.setAttribute('aria-label','Previous proposition');previous.disabled=index===0;previous.onclick=()=>load(index-1);
 let select=document.createElement('select');select.setAttribute('aria-label','Choose a proposition');for(let [i,lesson] of LESSONS.entries()){let option=document.createElement('option');option.value=i;option.textContent='E.'+(i+1)+' - '+lesson.title+(saved[i]?.completed?' (proved)':'');option.selected=i===index;select.append(option)}select.onchange=()=>load(Number(select.value));
 let next=document.createElement('button');next.type='button';next.textContent='\u203a';next.setAttribute('aria-label','Next proposition');next.disabled=index===LESSONS.length-1;next.onclick=()=>load(index+1);nav.append(previous,select,next);
}
function nextPointName(){return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(n=>!state.points[n])}
function bookCertificate(rule,operation,inputs,outputs,claims){state.facts.push('book:'+JSON.stringify({rule:Number(rule.replace('I','')),operation,inputs,outputs,claims}))}
function validBookCertificate(raw,points){
 if(!raw.startsWith('book:'))return false;
 try{let c=JSON.parse(raw.slice(5));return Number.isInteger(c.rule)&&c.rule>0&&c.rule<=48&&typeof c.operation==='string'&&['equilateral','copy','cut','bisectAngle','midpoint','perpendicular','sss','copyAngle','parallel','equalArea','applyArea','figureArea','square'].includes(c.operation)&&Array.isArray(c.inputs)&&Array.isArray(c.outputs)&&[...c.inputs,...c.outputs].every(n=>/^[A-Z]$/.test(n)&&points[n])&&Array.isArray(c.claims)&&c.claims.length<=20&&c.claims.every(s=>typeof s==='string'&&s.length<=200&&BookOneLogic.parse(s)&&BookOneLogic.statementNames(BookOneLogic.parse(s)).every(n=>points[n]))}catch{return false}
}
function bookToolInstruction(){
 if(!tool)return null;let mode=tool[3];const messages={equilateral:'Click the endpoints of a segment.',copy:'Click the destination, then the source length endpoints.',cut:'Click the greater segment endpoints, then the source length endpoints.',bisectAngle:'Click the first ray point, vertex, and second ray point.',midpoint:'Click the segment endpoints.',perpendicular:'Click two points on the line, then the point for the perpendicular.',sss:'Click three pairs of length endpoints, then the destination and a ray point.',copyAngle:'Click the source ray point, vertex, and ray point, then the destination and a ray point.',parallel:'Click the destination, then two points on the reference line.',equalArea:'Click the triangle vertices, angle ray/vertex/ray, then destination and a ray point.',applyArea:'Click the base endpoints, triangle vertices, then angle ray/vertex/ray.',figureArea:'Click the four figure vertices, angle ray/vertex/ray, then destination and a ray point.',square:'Click the segment endpoints.'};
 return messages[mode]?tool[1]+': '+messages[mode]+' ('+picks.length+' selected)':null;
}
function bookOneChoosePoint(name){
 if(!tool||!tool[3])return false;let mode=tool[3];if(mode==='point')return true;
 const counts={line:2,extend:2,circle:2,equilateral:2,copy:3,cut:4,bisectAngle:3,midpoint:2,perpendicular:3,sss:8,copyAngle:5,parallel:3,equalArea:8,applyArea:8,figureArea:9,square:2};if(!counts[mode])return false;
 picks.push(name);if(picks.length<counts[mode]){render();return true}let inputs=[...picks];picks=[];snapshot();const original=JSON.stringify(state);
 try{
  const p=n=>state.points[n],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],sum=(a,b)=>[a[0]+b[0],a[1]+b[1]],scale=(v,k)=>v.map(x=>x*k),unit=v=>{let l=Math.hypot(...v);if(l<1e-8)throw Error('Choose two distinct points.');return scale(v,1/l)},upNormal=v=>{let n=[-v[1],v[0]];return n[1]>0||Math.abs(n[1])<1e-8&&n[0]>0?scale(n,-1):n};
  let created=[],claims=[],[a,b,c,e]=inputs;
  const point=coordinate=>{let n=nextPointName();if(!n)throw Error('All 26 point names are used. Undo an unnecessary construction.');state.points[n]=coordinate;created.push(n);return n};
  if(mode==='line')addEdge(a,b);
  else if(mode==='extend'){if(a===b)throw Error('Choose distinct points.');if(!state.rays.includes(a+b))state.rays.push(a+b)}
  else if(mode==='circle'){if(a===b)throw Error('A circle needs a nonzero radius.');if(!state.circles.some(c=>c.a===a&&c.b===b))state.circles.push({a,b})}
  else if(mode==='equilateral'){let u=p(a),v=p(b),w=point([(u[0]+v[0])/2+(v[1]-u[1])*Math.sqrt(3)/2,(u[1]+v[1])/2-(v[0]-u[0])*Math.sqrt(3)/2]);addEdge(a,b);addEdge(a,w);addEdge(b,w);claims=[a+w+' = '+a+b,b+w+' = '+a+b,a+w+' = '+b+w,a+b+w+' is equilateral']}
  else if(mode==='copy'){
   let direction=[1,0];if(LESSONS[index].id===46&&state.points.C&&a==='A')direction=unit(sub(p('C'),p(a)));
   let n=point(sum(p(a),scale(direction,distance(p(b),p(c)))));addEdge(a,n);claims=[a+n+' = '+b+c];
  }
  else if(mode==='cut'){let length=distance(p(c),p(e)),available=distance(p(a),p(b));if(length>available+1e-7)throw Error('The source length is greater than the segment to cut.');let n=point(sum(p(a),scale(unit(sub(p(b),p(a))),length)));addEdge(a,n);claims=[a+n+' = '+c+e]}
  else if(mode==='midpoint'){let n=point(scale(sum(p(a),p(b)),.5));addEdge(a,n);addEdge(n,b);claims=[a+n+' = '+n+b,a+n+b+' are collinear']}
  else if(mode==='bisectAngle'){
   let left=distance(p(a),p(b)),right=distance(p(c),p(b)),n=point(scale(sum(scale(p(a),right),scale(p(c),left)),1/(left+right)));addEdge(b,n);claims=['angle '+a+b+n+' = angle '+n+b+c];
  }
  else if(mode==='perpendicular'){
   let direction=unit(sub(p(b),p(a))),v=sub(p(c),p(a)),projection=sum(p(a),scale(direction,v[0]*direction[0]+v[1]*direction[1])),n;
   if(distance(projection,p(c))<1e-6)n=point(sum(p(c),scale(upNormal(direction),160)));else n=point(projection);addEdge(c,n);claims=[c+n+' is perpendicular to '+a+b];
  }
  else if(mode==='parallel'){let n=point(sum(p(a),scale(unit(sub(p(c),p(b))),160)));addEdge(a,n);claims=[a+n+' is parallel to '+b+c]}
  else if(mode==='copyAngle'){
   let [u,v,w,origin,ray]=inputs,x=unit(sub(p(u),p(v))),y=unit(sub(p(w),p(v))),angle=Math.acos(Math.max(-1,Math.min(1,x[0]*y[0]+x[1]*y[1]))),basis=unit(sub(p(ray),p(origin))),rotate=t=>[basis[0]*Math.cos(t)-basis[1]*Math.sin(t),basis[0]*Math.sin(t)+basis[1]*Math.cos(t)],choices=[rotate(angle),rotate(-angle)].sort((x,y)=>x[1]-y[1]),n=point(sum(p(origin),scale(choices[0],160)));addEdge(origin,n);claims=['angle '+ray+origin+n+' = angle '+u+v+w];
  }
  else if(mode==='sss'){
   let [u,v,w,x,y,z,origin,ray]=inputs,base=distance(p(u),p(v)),r=distance(p(w),p(x)),s=distance(p(y),p(z));if(r+s<=base||base+s<=r||base+r<=s)throw Error('These lengths do not satisfy the triangle inequalities.');let basis=unit(sub(p(ray),p(origin))),normal=upNormal(basis),along=(base*base+r*r-s*s)/(2*base),height=Math.sqrt(Math.max(0,r*r-along*along)),n=point(sum(p(origin),scale(basis,base))),m=point(sum(p(origin),sum(scale(basis,along),scale(normal,height))));addEdge(origin,n);addEdge(origin,m);addEdge(n,m);claims=[origin+n+' = '+u+v,origin+m+' = '+w+x,n+m+' = '+y+z];
  }
  else if(['equalArea','applyArea','figureArea'].includes(mode)){
   let shape,angle,origin,ray,baseLength,basis;
   if(mode==='applyArea'){[origin,ray]=inputs;shape=inputs.slice(2,5);angle=inputs.slice(5,8);baseLength=distance(p(origin),p(ray));basis=unit(sub(p(ray),p(origin)))}
   else{shape=inputs.slice(0,mode==='figureArea'?4:3);angle=inputs.slice(shape.length,shape.length+3);[origin,ray]=inputs.slice(-2);basis=unit(sub(p(ray),p(origin)))}
   let area=0;for(let i=0;i<shape.length;i++){let u=p(shape[i]),v=p(shape[(i+1)%shape.length]);area+=u[0]*v[1]-v[0]*u[1]}area=Math.abs(area)/2;if(area<1e-7)throw Error('Choose a nondegenerate figure.');baseLength=baseLength||Math.sqrt(2*area);let u=unit(sub(p(angle[0]),p(angle[1]))),v=unit(sub(p(angle[2]),p(angle[1]))),cos=u[0]*v[0]+u[1]*v[1],sin=Math.abs(u[0]*v[1]-u[1]*v[0]);if(sin<1e-7)throw Error('Choose an angle strictly between zero and two right angles.');let normal=upNormal(basis),height=area/baseLength,offset=sum(scale(basis,height*cos/sin),scale(normal,height)),end=mode==='applyArea'?ray:point(sum(p(origin),scale(basis,baseLength))),topEnd=point(sum(p(end),offset)),topOrigin=point(sum(p(origin),offset)),polygon=origin+end+topEnd+topOrigin;addEdge(origin,end);addEdge(end,topEnd);addEdge(topEnd,topOrigin);addEdge(topOrigin,origin);claims=[polygon+' is a parallelogram','area '+polygon+' = area '+shape.join(''),'angle '+topOrigin+origin+end+' = angle '+angle.join(''),'angle '+end+origin+topOrigin+' = angle '+angle.join('')];
  }
  else if(mode==='square'){
   let v=sub(p(b),p(a)),normal=[-v[1],v[0]],third='ABC'.split('').find(n=>n!==a&&n!==b&&state.points[n]);
   if(third&&'ABC'.includes(a)&&'ABC'.includes(b)){let side=v[0]*(p(third)[1]-p(a)[1])-v[1]*(p(third)[0]-p(a)[0]);if(side>0)normal=scale(normal,-1)}else if(normal[1]>0)normal=scale(normal,-1);
   let n=point(sum(p(b),normal)),m=point(sum(p(a),normal)),polygon=a+b+n+m;addEdge(a,b);addEdge(b,n);addEdge(n,m);addEdge(m,a);claims=[polygon+' is a square',polygon+' is a parallelogram',a+b+' = '+b+n,a+b+' = '+a+m,a+m+' is perpendicular to '+a+b];
  }
  if(claims.length)bookCertificate(tool[1],mode,inputs,created,claims);render();
 }catch(error){state=JSON.parse(original);history.pop();$('#instruction').textContent=error.message}
 return true;
}
function bookOneIntersections(){
 let output=[],objects=[...state.edges.map(e=>({kind:'line',names:e})),...state.rays.map(e=>({kind:'line',names:e})),...state.circles.map(c=>({kind:'circle',...c}))],p=n=>state.points[n],cross=(a,b)=>a[0]*b[1]-a[1]*b[0],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
 for(let i=0;i<objects.length;i++)for(let j=i+1;j<objects.length;j++){
  let a=objects[i],b=objects[j];if(a.kind==='line'&&b.kind==='circle')[a,b]=[b,a];
  if(a.kind==='line'&&b.kind==='line'){let u=p(a.names[0]),v=p(a.names[1]),x=p(b.names[0]),y=p(b.names[1]),r=sub(v,u),s=sub(y,x),denominator=cross(r,s);if(Math.abs(denominator)<1e-8)continue;let t=cross(sub(x,u),s)/denominator;output.push([u[0]+t*r[0],u[1]+t*r[1]])}
  else if(a.kind==='circle'&&b.kind==='circle'){let u=p(a.a),v=p(b.a),r=distance(u,p(a.b)),s=distance(v,p(b.b)),length=distance(u,v);if(length<1e-8||length>r+s||length<Math.abs(r-s))continue;let along=(r*r-s*s+length*length)/(2*length),height=Math.sqrt(Math.max(0,r*r-along*along)),dx=(v[0]-u[0])/length,dy=(v[1]-u[1])/length;for(let sign of [-1,1])output.push([u[0]+along*dx-sign*height*dy,u[1]+along*dy+sign*height*dx])}
  else{let center=p(a.a),r=distance(center,p(a.b)),u=p(b.names[0]),v=p(b.names[1]),direction=sub(v,u),offset=sub(u,center),aa=direction[0]**2+direction[1]**2,bb=2*(direction[0]*offset[0]+direction[1]*offset[1]),cc=offset[0]**2+offset[1]**2-r*r,discriminant=bb*bb-4*aa*cc;if(discriminant<0||aa<1e-8)continue;for(let sign of [-1,1]){let t=(-bb+sign*Math.sqrt(discriminant))/(2*aa);output.push([u[0]+t*direction[0],u[1]+t*direction[1]])}}
 }
 return output.filter(v=>v.every(Number.isFinite)&&!Object.values(state.points).some(q=>distance(v,q)<.01));
}
function bookOneMark(coordinate){let candidates=bookOneIntersections().sort((a,b)=>distance(a,coordinate)-distance(b,coordinate)),point=candidates[0]&&distance(candidates[0],coordinate)<30?candidates[0]:coordinate;let name=nextPointName();if(!name)return;snapshot();state.points[name]=point;render()}
function bookOneHint(){
 const lesson=LESSONS[index];for(let task of lesson.construction||[]){if(task.outputs.length&&task.outputs.every(n=>state.points[n]))continue;let done=task.ref==='P1'&&has('edge:'+task.inputs.join(''))||task.ref==='P2'&&state.rays.includes(task.inputs.join(''))||task.ref==='P3'&&has('circle:'+task.inputs.join(':'));if(done)continue;if(!task.outputs.length&&['P1','P2','P3'].includes(task.ref))return 'Select '+task.ref+'. '+task.text;if(task.outputs.length)return 'Select '+task.ref+'. '+task.text+' '+(task.inputs.length?'Click '+task.inputs.join(', ')+', in that order.':'Use the point tool on the stated intersection.');}
 const result=EuclidLogic.grade(state,lesson);if(result.complete)return 'This proposition is complete. Continue when you are ready.';
 for(let step of lesson.proofGuide||[]){let context=BookOneLogic.context(state,lesson),query=BookOneLogic.parse(step.s),same=l=>context.key(BookOneLogic.parse(l.s))===context.key(query);if(state.lines.some(l=>l.valid&&same(l)))continue;let pending=state.lines.findIndex(same),bad=state.lines.findIndex(l=>!l.valid),target=pending>=0?pending:bad;
 let action=target>=0?(pending>=0?'Use the existing statement on line '+(target+1)+'.':'Use Edit on line '+(target+1)+' and replace it with: '+step.s+'.'):'Add this proof statement: '+step.s+'.';
 let selection=step.j==='Logic'?'select Deduction above the proof':step.j==='Given'?'select Given above the proof':'open the '+(/^I/.test(step.j)?'Propositions':/^D/.test(step.j)?'Definitions':/^CN/.test(step.j)?'Common notions':'Postulates')+' menu and select '+referenceName(step.j);
 return action+'\n\nReasoning: '+proofStepReason(lesson,step)+'\n\nThen '+selection+' and click '+(target>=0?'line '+(target+1):'the new proof line')+' to attach the justification. If a premise is below this line, put the premise first using Edit and re-enter the dependent statement afterward.';}
 let bad=state.lines.findIndex(l=>!l.valid);return bad>=0?'The conclusion is established, but line '+(bad+1)+' needs correction: '+state.lines[bad].error+' Use Edit to correct it, or Delete to remove an unnecessary line.':'This proposition is complete. Continue when you are ready.';
}
function fitConstructionView(){if(index<5){$('#canvas').setAttribute('viewBox','0 0 800 540');return}let values=Object.values(state.points),xs=values.map(p=>p[0]),ys=values.map(p=>p[1]);for(let circle of state.circles){let center=state.points[circle.a],r=distance(center,state.points[circle.b]);xs.push(center[0]-r,center[0]+r);ys.push(center[1]-r,center[1]+r)}let left=Math.min(0,...xs)-30,top=Math.min(0,...ys)-40,right=Math.max(800,...xs)+30,bottom=Math.max(540,...ys)+30;$('#canvas').setAttribute('viewBox',[left,top,right-left,bottom-top].join(' '))}
