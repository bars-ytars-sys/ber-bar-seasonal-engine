import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=fs.readFileSync(new URL('./native-navigation.js',import.meta.url),'utf8');
let passed=0;
for(const mode of ['home','catalog','production']){
 const href=mode==='production'?'https://barskie-polya.ru/':'https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/bp-production-'+(mode==='home'?'preview':'houses')+'.html';
 const location=new URL(href),preview=mode==='production'?undefined:{home:'bp-production-preview.html',catalog:'bp-production-houses.html',winter:'bp-new-year.html'};
 const c={module:{exports:{}},URL,location,window:{BPPreviewRoutes:preview}};
 vm.runInNewContext(source,c);
 const route=c.module.exports.route;
 const home=mode==='production'?'https://barskie-polya.ru/':'https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/bp-production-preview.html';
 const catalog=mode==='production'?'https://barskie-polya.ru/houses':'https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/bp-production-houses.html';
 const anchor=x=>mode==='catalog'?home+x:x;
 for(const [raw,want]of [
  ['#openmenu','#openmenu'],['#popup:quiz','#popup:quiz'],['#zayavka','#zayavka'],
  ['tel:+74951503908','tel:+74951503908'],
  ['https://barskie-polya.ru/#uslugi',anchor('#bp-programs')],
  ['#faq',anchor('#faq')],['https://barskie-polya.ru/#houses',catalog],
  ['/booking',anchor('#bb-stay')],
  ['https://barskie-polya.ru/booking?promoCode=TEST','https://barskie-polya.ru/booking?promoCode=TEST'],
  ['https://barskie-polya.ru/rivers','https://barskie-polya.ru/rivers'],
  ['https://t.me/bazabarskie_polya','https://t.me/bazabarskie_polya']
 ]){assert.equal(route(raw),want,mode+': '+raw);passed++;}
}
const local={module:{exports:{}},URL,location:new URL('http://127.0.0.1:4198/bp-production-preview.html'),window:{BPPreviewRoutes:{home:'bp-production-preview.html',catalog:'bp-production-houses.html',winter:'bp-new-year.html'}}};
vm.runInNewContext(source,local);
assert.equal(local.module.exports.route('/privacy'),'https://barskie-polya.ru/privacy');passed++;
console.log(`${passed} navigation cases passed.`);
