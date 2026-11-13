/* The Firefox driver performs every construction through real menus/pointers. */
addEventListener('load',()=>{
 $('#continue-menu').click();Object.assign(settings,DEFAULT_SETTINGS,{soundEffects:false,learningMode:true});saved={};load(EuclidBooks.position('2.14'));setMobileWorkspaceView('construction');
 window.SEMICIRCLE_QA={results:[],check(ok,text){this.results.push((ok?'PASS ':'FAIL ')+text)},finish(){const node=document.createElement('pre');node.id='qa-result';node.textContent=this.results.join('\n')+'\n'+(this.results.some(s=>s.startsWith('FAIL'))?'CHECKS FAILED':'ALL CHECKS PASSED');document.body.append(node)}};
});
