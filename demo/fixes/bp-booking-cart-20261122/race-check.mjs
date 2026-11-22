/** Real Bnovo regression: delayed manifest, native fallback, no transactional writes. */
import {webkit,devices} from 'playwright-core';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import path from 'node:path';import {pathToFileURL} from 'node:url';
assert(process.argv[2], 'Pass the private release directory created by release.py');
const root=pathToFileURL(path.resolve(process.argv[2])+'/'),results=[];
const guard=await fs.readFile(new URL('cart-guard.js',import.meta.url),'utf8');
const fixedHTML=await fs.readFile(new URL('preview/booking.html',root),'utf8');
assert(fixedHTML.includes(guard+'\n'),'Guard is absent in preview');
for(const fixed of(process.argv.includes('--fixed-only')?[true]:[false,true])){
 const b=await webkit.launch(),c=await b.newContext({...devices['iPhone 13'],locale:'ru-RU'}),p=await c.newPage(),errors=[],network=[];let manifests=0;p.setDefaultTimeout(18000);
 await c.addInitScript(()=>{if(top!==window)for(const[k,v]of Object.entries({width:390,availWidth:390,height:844,availHeight:844}))try{Object.defineProperty(screen,k,{get:()=>v,configurable:true})}catch{}});
 const html=fixed?fixedHTML:fixedHTML.replace(guard+'\n','');
 await c.route('**/*',async r=>{const q=r.request(),u=new URL(q.url());if(!['GET','HEAD'].includes(q.method())||/mc\.yandex|stat\.tildaapi|monium/.test(u.href))return r.abort();if(q.isNavigationRequest()&&u.origin==='https://barskie-polya.ru'&&u.pathname==='/booking')return r.fulfill({contentType:'text/html;charset=utf-8',body:html});if(u.hostname==='reservationsteps.ru'&&u.pathname==='/dist/rev-manifest.json'){manifests++;network.push({request:manifests,at:Date.now()});if(manifests===1)await new Promise(res=>setTimeout(res,10000));}return r.continue();});p.on('pageerror',e=>errors.push(e.stack||e.message));
 const row={fixed,scenario:'first Bnovo CSS manifest delayed 10 seconds',checks:[]};
 async function tap(locator){for(const n of await locator.all()){try{if(!await n.isVisible())continue;await n.scrollIntoViewIfNeeded();const r=await n.boundingBox(),vh=await p.evaluate(()=>innerHeight);if(r&&(r.y<90||r.y+r.height>vh-100))await p.evaluate(d=>scrollBy(0,d),r.y+r.height/2-(vh/2));await n.click({timeout:2500});return true;}catch{}}return false;}
 async function dismiss(f){const loc=f.locator('.btn-aceptar:visible');if(await loc.count())assert(await tap(loc),'cookie accept is accessible');}
 try{
  await p.goto('https://barskie-polya.ru/booking?onlyrooms=470445&dfrom=15-02-2027&dto=17-02-2027&adults=2&children=%5B%5D',{waitUntil:'domcontentloaded',timeout:45000});
  await p.waitForFunction(()=>[...document.querySelectorAll('iframe')].some(e=>e.src.includes('/rooms/index/17f7bf8e')),{timeout:25000});let f;for(let k=0;k<250&&!f;k++){f=p.frames().find(f=>f.url().includes('/rooms/index/17f7bf8e'));if(!f)await p.waitForTimeout(100);}assert(f,'Bnovo frame navigated');await f.locator('.selectAvailable__button:visible').first().waitFor({timeout:25000});await p.waitForTimeout(12000);
  row.manifestErrors=errors.filter(e=>/manifest.*css\/main\.css/.test(e));row.cart=await p.locator('bnovo-cart').evaluateAll(es=>es.map(e=>({hasManifest:!!e.manifest?.['css/main.css'],rendered:!!e.shadowRoot?.querySelector('.service-cart-modern')})));
  if(!fixed){assert(row.manifestErrors.length>0,'baseline must reproduce actual race');row.pass=true;row.checks.push('original manifest race reproduced');}
  else{
   assert.equal(row.manifestErrors.length,0);await dismiss(f);assert(await tap(f.locator('.selectAvailable__button:visible')),'rate select accessible');await p.waitForTimeout(1200);await dismiss(f);
   row.nativeButtons=await f.locator('#bookingButton:visible').count();assert(row.nativeButtons>0,'native fallback cart stays visible');row.checks.push('native cart preserved while outer manifest is late');
   for(let n=0;n<3&&!/\/bookings\/index\//.test(f.url());n++){
    await p.waitForTimeout(3000);const previous=f.url();const actions=[f.getByText('Оформить бронирование',{exact:true}).filter({visible:true}),p.locator('bnovo-cart .service-cart-modern__face .service-cart-modern__submit:visible'),f.locator('.booking_button_next_step:visible'),f.locator('#bookingButton:visible')];let clicked=false;
    for(const a of actions)if(await tap(a)){clicked=true;break;}assert(clicked,'native next step accessible');await f.waitForURL(u=>u.href!==previous&&/\/(services|bookings)\/index\//.test(u.pathname),{timeout:25000});await p.waitForTimeout(700);await dismiss(f);
   }
   await f.locator('input[name="customer[email]"]:visible').waitFor({timeout:20000});row.guestURL=f.url();const text=await f.locator('body').innerText();assert(text.includes('Барский дом'));assert(text.includes('15')&&text.includes('17'));row.checks.push('guest form reached with selected house; no submission');assert.equal(errors.filter(e=>!e.includes('.pdf due to access control checks.')).length,0,JSON.stringify(errors));row.pass=true;
  }
 }catch(e){row.pass=false;row.error=String(e);row.frames=p.frames().map(f=>f.url());for(const child of p.frames().filter(f=>f.url().includes('reservationsteps.ru'))){await fs.writeFile(new URL((fixed?'fixed':'base')+'-iframe-failure.html',root),await child.content()).catch(()=>{});row.actions=await child.locator('button:visible,a:visible').evaluateAll(es=>es.filter(e=>/бронир|продолж|примен|даты|найти/i.test(e.innerText)).map(e=>({text:e.innerText.trim().slice(0,70),cls:e.className}))).catch(()=>[]);}await fs.writeFile(new URL((fixed?'fixed':'base')+'-failure.html',root),await p.content()).catch(()=>{});}
 row.errors=errors;row.network=network;await p.screenshot({path:new URL((fixed?'fixed':'base')+'-390.png',root).pathname}).catch(()=>{});results.push(row);await fs.writeFile(new URL('race-proof.json',root),JSON.stringify(results,null,2));console.log(JSON.stringify(row));await b.close();
}
if(results.some(r=>!r.pass))process.exitCode=1;
