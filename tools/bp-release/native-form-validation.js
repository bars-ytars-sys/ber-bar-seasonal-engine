/* The native quiz omitted the required flag on its privacy consent. */
(()=>{
 const requireConsent=()=>document.querySelectorAll('#form2806976901 input[name="Checkbox"]').forEach(input=>input.setAttribute('data-tilda-req','1'));
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',requireConsent,{once:true});
 else requireConsent();
})();
