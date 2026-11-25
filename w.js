if (location.hostname === "ecobr.ru") {
  const style = document.createElement("style");
  style.id = "br-winter-appearance";
  style.textContent = ".br-page-snow-frame { position: relative !important; }\n\n.br-page-snow {\n  position: absolute;\n  z-index: 0;\n  inset: 0;\n  overflow: hidden;\n  pointer-events: none;\n}\n\n.br-page-snow::before,\n.br-page-snow::after {\n  content: \"\";\n  position: absolute;\n  top: calc(-1 * var(--flake-step));\n  right: -20px;\n  bottom: 0;\n  left: -20px;\n  background-size: var(--flake-width) var(--flake-step);\n  animation: br-page-snow-fall var(--flake-time) linear var(--flake-offset) infinite paused;\n}\n\n.br-page-snow::before {\n  --flake-step: 216px;\n  --flake-width: clamp(194px, 25vw, 366px);\n  --flake-time: 19s;\n  --flake-offset: -8s;\n  --flake-drift: 8px;\n  background-image:\n    radial-gradient(circle at 17% 19%, rgb(255 255 255 / .65) 1px, transparent 1.8px),\n    radial-gradient(circle at 61% 53%, rgb(255 255 255 / .54) .8px, transparent 1.6px),\n    radial-gradient(circle at 86% 91%, rgb(255 255 255 / .57) 1.15px, transparent 2px);\n}\n\n.br-page-snow::after {\n  --flake-step: 283px;\n  --flake-width: clamp(242px, 31vw, 439px);\n  --flake-time: 15s;\n  --flake-offset: -3s;\n  --flake-drift: -12px;\n  background-image:\n    radial-gradient(circle at 34% 28%, rgb(255 255 255 / .75) 1.45px, transparent 2.35px),\n    radial-gradient(circle at 73% 78%, rgb(255 255 255 / .58) 1.25px, transparent 2.15px);\n}\n\n.br-page-snow.is-active::before,\n.br-page-snow.is-active::after {\n  animation-play-state: running;\n  will-change: transform;\n}\n\n@keyframes br-page-snow-fall {\n  0% { transform: translate3d(0, 0, 0); }\n  50% { transform: translate3d(var(--flake-drift), calc(var(--flake-step) / 2), 0); }\n  100% { transform: translate3d(0, var(--flake-step), 0); }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .br-page-snow { display: none; }\n  .br-page-snow::before, .br-page-snow::after { animation: none; }\n}\n\n#rec2851363001 .h-tab.h-on .tn-atom__button-text { color: #191d1b; }\n";
  style.textContent += "\n.br-page-snow--light { filter: brightness(.52) opacity(.6); }";
  document.head.append(style);
}

(() => {
  "use strict";
  const plans = {"107747416":{"replace":[["#rec1763276841 .t1196__item","tild6530-3230-4462-a430-383433303839","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-weekday-chan.webp",""]],"hide":[]},"106113576":{"replace":[["#rec2863877801 [data-elem-id=\"1782555783479000010\"] > .tn-atom","tild6330-3133-4062-a262-616263626665","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-spa-window-lounge.webp",""],["#rec2863877901 [data-elem-id=\"1782552398332000011\"] > .tn-atom","tild6661-3336-4866-b537-633661613032","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-activity-fish-hq.webp",""],["#rec2863877901 [data-elem-id=\"1782554450637000010\"] > .tn-atom","tild6464-3062-4236-a339-353834353033","https://static.tildacdn.com/tild3231-3331-4130-a165-623837613238/__2025-12-30_070835.png",""],["#rec2863877901 [data-elem-id=\"1782554591070000018\"] > .tn-atom","tild3734-6265-4438-b538-373338396636","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-farm-goat.webp",""],["#rec2863878001 [data-elem-id=\"1782552398332000011\"] > .tn-atom","tild6330-3564-4464-b436-343134346661","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-svidanie.webp",""],["#rec1764872151","tild3833-3336-4464-a465-346439636563","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-activity-fish-hq.webp",""],["#rec1765007821","tild3730-6465-4933-a530-306163333162","https://static.tildacdn.com/tild6337-3932-4565-b133-386335663362/clipboard-image-1767.png",""],["#rec1764691611","tild3964-6536-4535-b531-386565313338","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-farm-deer.webp","Животные контактной фермы Берёзовой рощи зимой"],["#rec1764691611","tild3533-6231-4131-a530-303235626535","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-activity-farm-hq.webp","Животные контактной фермы Берёзовой рощи зимой"],["#rec1764691611","tild3734-6537-4239-a263-333733616230","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-farm-goat.webp","Животные контактной фермы Берёзовой рощи зимой"],["#rec1764691611","tild6266-6536-4766-a338-303837633662","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-br-ferma-v.webp","Животные контактной фермы Берёзовой рощи зимой"]],"hide":[["#rec2863877901 [data-group-id=\"1782555820221000003\"]","#popup:sup"],["#rec2863877901 [data-group-id=\"1782552398332000012\"]","#baggi"]]},"103448346":{"replace":[["#rec1764872151","tild3833-3336-4464-a465-346439636563","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-activity-fish-hq.webp",""],["#rec1765007821","tild3730-6465-4933-a530-306163333162","https://static.tildacdn.com/tild6337-3932-4565-b133-386335663362/clipboard-image-1767.png",""],["#rec1764691611","tild3964-6536-4535-b531-386565313338","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-farm-deer.webp","Животные контактной фермы Берёзовой рощи зимой"],["#rec1764691611","tild3533-6231-4131-a530-303235626535","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-activity-farm-hq.webp","Животные контактной фермы Берёзовой рощи зимой"],["#rec1764691611","tild3734-6537-4239-a263-333733616230","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-farm-goat.webp","Животные контактной фермы Берёзовой рощи зимой"],["#rec1764691611","tild6266-6536-4766-a338-303837633662","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-br-ferma-v.webp","Животные контактной фермы Берёзовой рощи зимой"],["#rec2851363001 [data-elem-id=\"1765742137271\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-cover-aframe-white.webp","A-ФРЕЙМ зимой"],["#rec2851363001 [data-elem-id=\"1786217380467000002\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-bariloche.webp","БАРИЛОЧЕ зимой"],["#rec2851363001 [data-elem-id=\"1786217503303000002\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-scandi.webp","СКАНДИ зимой"],["#rec2851363001 [data-elem-id=\"1786217624187000002\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/hero-panorama-garland.webp","ПАНОРАМА зимой"],["#rec2851363001 [data-elem-id=\"1786218333103000002\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-baus-1-warm.webp","БАУС зимой"],["#rec2851363001 [data-elem-id=\"1786218011290000002\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-chalet.webp","ШАЛЕ зимой"],["#rec2851363001 [data-elem-id=\"1786218055137000002\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-house-2.webp","ХАУС зимой"],["#rec2851363001 [data-elem-id=\"1786218084668000002\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-barn-1.webp","БАРНХАУС зимой"],["#rec2851363001 [data-elem-id=\"1786218113308000002\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-sfera-exterior-clean.webp","СФЕРА зимой"],["#rec2851363001 [data-elem-id=\"1786218139833000002\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-holidayhouse-warm.webp","ХОЛИДЕЙ ХАУС зимой"]],"hide":[]},"107506256":{"replace":[["#rec1750149901 [data-elem-id=\"1679491944328\"] > .tn-atom","tild6639-3861-4535-a534-336133643938","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-playground.webp","Зимняя детская площадка Берёзовой рощи"],["#rec5226469101","tild6639-3861-4535-a534-336133643938","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-playground.webp","Зимняя детская площадка Берёзовой рощи"],["#rec1750149901 [data-elem-id=\"1767055014748000007\"] > .tn-atom","tild3731-3761-4065-a265-316663363832","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-farm-goat.webp","Контактная ферма Берёзовой рощи зимой"],["#rec5226469101","tild3731-3761-4065-a265-316663363832","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-farm-goat.webp","Контактная ферма Берёзовой рощи зимой"]],"hide":[]},"107688996":{"replace":[["#rec1786282301","tild6139-3532-4136-a431-333736333265","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-spa-pool-outdoor.webp","Подогреваемый бассейн Берёзовой рощи зимой"],["#rec1786282301","tild3031-6666-4338-b861-666432343536","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-spa-pool-access.webp","Выход к подогреваемому бассейну из зоны отдыха SPA"],["#rec1786282301","tild3163-3639-4336-b865-653432633265","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-spa-pool-wide.webp","Открытый зимний бассейн Берёзовой рощи"]],"hide":[]},"118817876":{"replace":[["#rec2019972941 [data-elem-id=\"1766828662499000001\"]","tild3766-6464-4637-b865-346163633362","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-spa-pool-outdoor.webp","Открытый зимний бассейн Берёзовой рощи"],["#rec2019972941 [data-elem-id=\"1766828662499000001\"]","tild6338-3836-4531-a665-666238636533","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-svidanie.webp","Зимний отдых вдвоём в Берёзовой роще"],["#rec2019972941 [data-elem-id=\"1765805891977\"]","tild3131-3736-4261-a637-326261306138","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-baus-1-warm.webp","Зимний двор Баус‑1"],["#rec2019972941 [data-elem-id=\"1765805891977\"]","tild6666-3164-4966-a164-353561646566","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-spa-pool-wide.webp","Открытый зимний бассейн Берёзовой рощи"],["#rec2019972941 [data-elem-id=\"1765805891977\"]","tild6564-3761-4362-b836-343032333061","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-baus-lounge.webp","Панорамный интерьер Баус зимой"],["#rec1915235601","tild3938-3061-4336-b230-396361343533","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/hero-panorama-garland.webp","Дом «Панорама» зимой"],["#rec1915235601","tild6362-3266-4330-b836-353861383930","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-spa-pool-outdoor.webp","Открытый зимний бассейн Берёзовой рощи"],["#rec1915235601","tild3736-6361-4438-b632-343562663664","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-reception.webp","Вход в Берёзовую рощу зимой"],["#rec1915235601","tild6238-6164-4034-b934-313134363965","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-svidanie.webp","Зимний отдых вдвоём"],["#rec1915276161","tild3664-3965-4431-a537-396337656361","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-spa-pool-wide.webp","Зимний бассейн Берёзовой рощи"],["#rec1915276161","tild6666-3534-4936-b735-333763383361","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-svidanie.webp","Зимний отдых вдвоём"],["#rec1915276161","tild3233-6137-4033-b962-323933393263","https://static.tildacdn.com/tild3231-3331-4130-a165-623837613238/__2025-12-30_070835.png","Конные прогулки зимой"],["#rec1915276161","tild3632-6635-4631-b938-343964323138","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-activity-fish-hq.webp","Рыбалка в Берёзовой роще зимой"]],"hide":[]},"107690806":{"replace":[["#rec1750245051 [data-elem-id=\"1766480055876\"]","tild3831-6231-4262-b431-376566303264","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-svidanie.webp","Зимний отдых вдвоём"],["#rec1750245051 [data-elem-id=\"1766480055876\"]","tild6130-6631-4137-b063-366531356132","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-aframe-neo.webp","Зимний А-фрейм Берёзовой рощи"]],"hide":[]},"106582216":{"replace":[["#rec1734590731 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-aframe-black.webp",""]],"hide":[]},"106695046":{"replace":[["#rec1734518181 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-cover-aframe-luxe-black.webp",""]],"hide":[]},"106586526":{"replace":[["#rec1734574091 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-aframe-luxe-white-front.webp",""]],"hide":[]},"106703246":{"replace":[["#rec1734651921 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-aframe-neo.webp",""]],"hide":[]},"106432816":{"replace":[["#rec1734609831 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-cover-aframe-white.webp",""]],"hide":[]},"150592906":{"replace":[["#rec2411770061 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-bariloche.webp",""]],"hide":[]},"106788916":{"replace":[["#rec1736028251 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-barn-1.webp",""]],"hide":[]},"106797136":{"replace":[["#rec1736173061 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-barn-2.webp",""]],"hide":[]},"106806186":{"replace":[["#rec1736344841 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-barn-3-front.webp",""]],"hide":[]},"106793796":{"replace":[["#rec1736114361 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-barn-4-warm.webp",""]],"hide":[]},"106830026":{"replace":[["#rec1736773861 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-baus-1-warm.webp",""]],"hide":[]},"106838516":{"replace":[["#rec1736907491 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-baus-2-warm.webp",""]],"hide":[]},"106842516":{"replace":[["#rec1736965481 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-baus-3.webp",""]],"hide":[]},"106850936":{"replace":[["#rec1737097171 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-chalet.webp",""]],"hide":[]},"107685336":{"replace":[["#rec1750166871 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-holidayhouse-warm.webp",""]],"hide":[]},"106706156":{"replace":[["#rec1734686561 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-house-1.webp",""]],"hide":[]},"106709786":{"replace":[["#rec1734734721 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-house-2.webp",""]],"hide":[]},"106711156":{"replace":[["#rec1734753791 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-house-3-front.webp",""]],"hide":[]},"106712446":{"replace":[["#rec1734770061 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-house-4.webp",""]],"hide":[]},"106846466":{"replace":[["#rec1737025471 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/hero-panorama-garland.webp",""]],"hide":[]},"106849776":{"replace":[["#rec1737080341 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-scandi.webp",""]],"hide":[]},"106821266":{"replace":[["#rec1736626311 [data-elem-id=\"1766575756760000001\"] > .tn-atom","tildacd","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/house-winter-sfera-exterior-clean.webp",""]],"hide":[]},"107402736":{"replace":[["#rec1745561571 [data-elem-id=\"1767039402407000029\"]","tild3733-3937-4063-b335-353136303664","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-spa-window-lounge.webp","Зона отдыха и бассейн SPA"]],"hide":[]},"107680846":{"replace":[["#rec1750091971 [data-elem-id=\"1767039402407000029\"]","tild6339-6561-4130-b464-646463313361","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-spa-window-lounge.webp","Зона отдыха и бассейн SPA"],["#rec1750091971 [data-elem-id=\"1767039314974000022\"]","tild6461-3866-4937-a562-333030663635","https://static.tildacdn.com/tild6337-3932-4565-b133-386335663362/clipboard-image-1767.png","Зимняя конная прогулка"]],"hide":[]},"150254566":{"replace":[["#rec2406253401 [data-elem-id=\"1765742137271\"]","tild3761-3162-4066-b435-326639616461","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-weekday-chan.webp","Тёплый чан на свежем воздухе зимой"],["#rec2406253401 [data-elem-id=\"1782054979270000011\"]","tild3132-3061-4366-b965-623461633166","https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-spa-window-lounge.webp","Зона отдыха и бассейн SPA"]],"hide":[]}};
  const pictures = ["src", "data-original", "data-img-zoom-url", "data-src", "poster"];
  const pictureSelector = pictures.map(name => "[" + name + "]").join(",") +
    ",[srcset],[style*='background-image'],[data-field-imgs-value]";

  function changePhoto(node, oldId, url, alt) {
    let changed = false;
    for (const attr of pictures) {
      const original = node.getAttribute(attr);
      if (!original || !original.includes(oldId)) continue;
      node.setAttribute(attr, url);
      changed = true;
    }
    const sourceSet = node.getAttribute("srcset");
    if (sourceSet?.includes(oldId)) {
      node.setAttribute("srcset", sourceSet.split(",").map(item =>
        item.includes(oldId) ? item.replace(/^\s*\S+/, url) : item
      ).join(","));
      changed = true;
    }
    if (node.style.backgroundImage.includes(oldId)) {
      node.style.backgroundImage = 'url("' + url + '")';
      changed = true;
    }
    const gallery = node.getAttribute("data-field-imgs-value");
    if (gallery?.includes(oldId)) {
      let slides;
      try {
        slides = JSON.parse(gallery);
      } catch {
        return;
      }
      if (Array.isArray(slides)) {
        let any = false;
        for (const slide of slides) {
          if (!slide.li_img?.includes(oldId)) continue;
          slide.li_img = url;
          if (alt) slide.li_imgalt = alt;
          any = true;
        }
        if (any) node.setAttribute("data-field-imgs-value", JSON.stringify(slides));
      }
    }
    if (changed && alt) {
      if (node.tagName === "IMG") node.alt = alt;
      else if (node.getAttribute("role") === "img") node.setAttribute("aria-label", alt);
    }
  }

  function start() {
    const records = document.getElementById("allrecords");
    if (records?.dataset.tildaProjectId !== "4027012") return false;
    const selected = plans[records.dataset.tildaPageId];
    if (!selected) return true;

    const media = selected.replace.map(([selector, old, url, alt]) =>
      [Array.from(document.querySelectorAll(selector)), old, url, alt]
    );
    for (const [selector, href] of selected.hide) {
      for (const group of document.querySelectorAll(selector)) {
        if (!group.querySelector('a[href="' + href + '"]')) continue;
        group.style.setProperty("display", "none", "important");
        group.setAttribute("aria-hidden", "true");
      }
    }
    const patch = () => {
      for (const [roots, old, url, alt] of media) {
        for (const root of roots) {
          changePhoto(root, old, url, alt);
          for (const node of root.querySelectorAll(pictureSelector)) changePhoto(node, old, url, alt);
        }
      }
    };
    patch();
    let frame = 0;
    const observer = new MutationObserver(() => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        patch();
      });
    });
    const unique = new Set(media.flatMap(([scopes]) => scopes));
    for (const root of unique) observer.observe(root, {
      subtree: true, childList: true, attributes: true,
      attributeFilter: [...pictures, "srcset", "style", "data-field-imgs-value"]
    });
    setTimeout(() => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      patch();
    }, 2400);
    return true;
  }
  if (!start()) document.addEventListener("DOMContentLoaded", start, {once:true});
})();

(() => {
  "use strict";
  const covers = {"#popup:ferma":"https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-farm-goat.webp","https://ecobr.ru/aktivnosti-v-beryozovoj-roshhe#koni":"https://static.tildacdn.com/tild3231-3331-4130-a165-623837613238/__2025-12-30_070835.png","#popup:zimnajarybalka":"https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-activity-fish-hq.webp"};
  function apply() {
    const records = document.getElementById("allrecords");
    if (records?.dataset.tildaProjectId !== "4027012" || records.dataset.tildaPageId !== "103448346") return false;
    const section = records.querySelector("#rec5893605301 #br-home-activities");
    if (!section) return false;
    for (const card of section.querySelectorAll("a.brh-activity")) {
      const href = card.getAttribute("href");
      if (href?.endsWith("#baggi") || href === "#popup:sup") {
        card.remove();
        continue;
      }
      const arrow = card.querySelector(".brh-activity__label [aria-hidden='true']");
      if (arrow?.textContent.match(/^↗︎?$/u)) arrow.textContent = "↗︎";
      const photo = card.querySelector("img");
      if (!photo || !covers[href] || !photo.getAttribute("src")?.includes("/br-home-preview/home-assets/")) continue;
      photo.removeAttribute("srcset");
      photo.removeAttribute("sizes");
      photo.src = covers[href];
    }
    return true;
  }
  if (!apply() && document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply, {once:true});
  }
})();

(() => {
  const path = location.pathname.replace(/\/+$/, '') || '/';
  if (location.hostname !== 'ecobr.ru' || path === '/' || window.brPageSnow) return;
  window.brPageSnow = true;

  const firstPhoto = {
    '/doma': '#bb-stay .brp-photo img',
    '/deti': '#rec1750133371 [data-elem-id="1679491347265"] > .tn-atom',
    '/special': '#rec1751257721 [data-elem-id="1677097523476"] > .tn-atom',
    '/aktivnosti-v-beryozovoj-roshhe': '#rec2863877801 .tn-atom.t-bgimg',
    '/new-year': '#holiday-periods .holiday-card__photo',
    '/spa': '#rec1786282301 .t979__grid-item img',
    '/banchan': '#rec1796853291 .tn-elem > .tn-atom.t-bgimg',
    '/vip-programmy': '#rec1750245051 [data-elem-id="1766480055876"] > .tn-atom',
    '/glamping': '#rec2019972941 .tn-elem > .tn-atom.t-bgimg'
  };
  const excluded = '#t-header, #t-footer, header, footer, form, .t-popup, [role="dialog"], .brp-dialog';
  const photoTypes = /\.(?:webp|avif|jpe?g|png)(?:[?&#"'\s)]|$)/i;
  let photo;
  let frame;
  let layer;
  let inView = false;
  let queued = false;
  let responsive;
  const intersection = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        const entry = entries.find(item => item.target === photo);
        if (!entry) return;
        inView = entry.isIntersecting;
        syncMotion();
      })
    : null;

  function syncMotion() {
    if (layer) layer.classList.toggle('is-active', inView && !document.hidden);
  }

  function visiblePhoto(element) {
    if (!element || element.closest(excluded)) return false;
    const bounds = element.getBoundingClientRect();
    if (bounds.width < 205 || bounds.height < 125 || bounds.right < 1 || bounds.left > innerWidth) return false;
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility !== 'visible') return false;
    const source = element.currentSrc || element.getAttribute('data-original') ||
      element.getAttribute('src') || style.backgroundImage;
    return photoTypes.test(source);
  }

  function findPhoto() {
    const records = document.querySelector('#allrecords[data-tilda-project-id="4027012"]');
    if (!records || document.getElementById('br-home-start')) return null;
    const firstVisible = scope => [...records.querySelectorAll(scope)].find(visiblePhoto);
    if (path.startsWith('/doma/')) {
      return firstVisible('.tn-elem[data-elem-id="1766575756760000001"] > .tn-atom')
        || firstVisible('.t1148__img-wrapper img');
    }
    const selected = firstPhoto[path] && firstVisible(firstPhoto[path]);
    const anyPhoto = selected || firstVisible('.t-bgimg, img');
    if (anyPhoto) return anyPhoto;
    // Pages without a cover can use the same snowfall in the heading area.
    const contactBoard = path === '/contacts'
      ? records.querySelector('#rec1751314071 .t396__artboard')
      : null;
    if (contactBoard) return contactBoard;
    const headings = records.querySelectorAll('h1, h2, [role="heading"]');
    return [...headings].find(heading => {
      if (heading.closest(excluded)) return false;
      const rectangle = heading.getBoundingClientRect();
      return rectangle.width > 190 && rectangle.height > 25;
    }) || null;

  }

  function placeLayer() {
    if (!layer || photo === frame) return;
    const outer = frame.getBoundingClientRect();
    const inner = photo.getBoundingClientRect();
    const scaleX = outer.width / frame.offsetWidth || 1;
    const scaleY = outer.height / frame.offsetHeight || 1;
    layer.style.left = `${(inner.left - outer.left) / scaleX - frame.clientLeft}px`;
    layer.style.top = `${(inner.top - outer.top) / scaleY - frame.clientTop}px`;
    layer.style.width = `${inner.width / scaleX}px`;
    layer.style.height = `${inner.height / scaleY}px`;
    layer.style.right = 'auto';
    layer.style.bottom = 'auto';
  }

  function refresh() {
    queued = false;
    const next = findPhoto();
    if (next && next === photo) {
      placeLayer();
      return;
    }
    if (photo) intersection?.unobserve(photo);
    responsive?.disconnect();
    frame?.classList.remove('br-page-snow-frame');
    layer?.remove();
    photo = next;
    frame = null;
    layer = null;
    inView = false;
    if (!photo) return;

    frame = photo instanceof HTMLImageElement
      ? (photo.closest('picture') || photo).parentElement
      : photo;
    if (getComputedStyle(frame).position === 'static') frame.classList.add('br-page-snow-frame');
    layer = document.createElement('span');
    layer.className = 'br-page-snow';
    if (photo.matches('h1, h2, [role=heading], #rec1751314071 .t396__artboard')) layer.classList.add('br-page-snow--light');
    layer.setAttribute('aria-hidden', 'true');
    layer.style.borderRadius = getComputedStyle(photo).borderRadius;
    frame.append(layer);
    placeLayer();

    if (frame !== photo && 'ResizeObserver' in window) {
      responsive = new ResizeObserver(() => requestAnimationFrame(placeLayer));
      responsive.observe(photo);
      responsive.observe(frame);
    }
    intersection?.observe(photo);
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(refresh);
  }

  function start() {
    schedule();
    window.setTimeout(schedule, 500);
    window.setTimeout(schedule, 1500);
    window.addEventListener('load', schedule, { once: true });
    window.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('visibilitychange', syncMotion);
    if (path === '/doma' || path === '/aktivnosti-v-beryozovoj-roshhe') {
      document.addEventListener('click', ({ target }) => {
        if (target instanceof Element && target.closest('#bb-stay, #rec2863877701')) {
          window.setTimeout(schedule, 150);
        }
      }, { passive: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();


(() => {
  const home = document.querySelector('#allrecords[data-tilda-project-id="4027012"][data-tilda-page-id="103448346"]');
  const record = home?.querySelector('#rec4153838101');
  const oldStories = record?.querySelector('#st:has([data-s="baggi"])');
  if (location.hostname !== 'ecobr.ru' || !oldStories) return;
  const loader = document.createElement('script');
  loader.src = 'https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-stories-20261125.js?v=2';
  oldStories.after(loader);
})();


(() => {
  const page = document.querySelector('#allrecords[data-tilda-project-id="4027012"]');
  const houses = ["150592906", "106850936", "106846466", "106849776"];
  if (location.hostname !== 'ecobr.ru' || !houses.includes(page?.dataset.tildaPageId)) return;
  const load = document.createElement('script');
  load.src = 'https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-mixed-galleries-20261125.js';
  document.head.append(load);
})();
