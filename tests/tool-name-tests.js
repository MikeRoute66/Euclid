function runToolNameChecks(check){
 const previous={...settings},chapter=index;
 try{
  Object.assign(settings,DEFAULT_SETTINGS);load(47);
  const samples=[['definitions','showDefinitionNames','D20'],['postulates','showPostulateNames','P3'],['notions','showCommonNotionNames','CN1'],['propositions','showPropositionNames','I1']];
  for(let [group,key,id] of samples){
   check(settings[key]===true,group+' names remain on by default');
   const reference=REFERENCES[group].find(r=>r[1]===id),code=displayReference(id);
   openMainMenu();showSettings();let control=document.querySelector('[data-setting="'+key+'"]');control.checked=false;control.dispatchEvent(new Event('change',{bubbles:true}));$('#resume-menu').click();
   tab=group;renderTools();let button=[...document.querySelectorAll('#tools button')].find(b=>b.firstChild.textContent===code);
   button.dispatchEvent(new MouseEvent('mouseenter'));button.dispatchEvent(new Event('focus'));
   check(!$('#tool-name')||$('#tool-name').hidden,group+' hover and keyboard focus cannot reveal the hidden name');
   check(button.getAttribute('aria-label')===code,group+' accessible label contains only the code');
   button.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}));button.dispatchEvent(new KeyboardEvent('keydown',{key:'F10',shiftKey:true,bubbles:true,cancelable:true}));
   check(!$('#modal').open,group+' right-click and keyboard inspection cannot reveal the name');
   button.click();
   check($('#selected').textContent==='Selected: '+code&&$('#instruction').textContent==='Selected: '+code+'.',group+' selection and construction guidance contain only the code');
   check(referenceName(id)===code&&proofReferenceName({},id)===code,group+' proof justification label contains only the code');
   check(JSON.parse(localStorage.getItem(SETTINGS_KEY))[key]===false,group+' visibility preference is saved');
   check(samples.filter(s=>s[0]!==group).every(s=>toolNamesVisible(REFERENCES[s[0]][0])),group+' toggle leaves other categories visible');
   openMainMenu();showSettings();control.checked=true;control.dispatchEvent(new Event('change',{bubbles:true}));$('#resume-menu').click();tab=group;renderTools();button=[...document.querySelectorAll('#tools button')].find(b=>b.firstChild.textContent===code);button.dispatchEvent(new MouseEvent('mouseenter'));
   check(!$('#tool-name').hidden&&$('#tool-name').textContent===reference[0],group+' name previews return when enabled');
   button.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}));check($('#modal').open&&$('#modaltitle').textContent===reference[0],group+' full reference returns when enabled');$('#closemodal').click();closeTools();
  }
 }finally{Object.assign(settings,previous);localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));load(chapter)}
}
