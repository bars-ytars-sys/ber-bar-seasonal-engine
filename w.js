if (location.hostname === "ecobr.ru") {
  const style = document.createElement("style");
  style.id = "br-winter-appearance";
  style.textContent = ".br-page-snow-frame { position: relative !important; }\n\n.br-page-snow {\n  position: absolute;\n  z-index: 0;\n  inset: 0;\n  overflow: hidden;\n  pointer-events: none;\n}\n\n.br-page-snow::before,\n.br-page-snow::after {\n  content: \"\";\n  position: absolute;\n  top: calc(-1 * var(--flake-step));\n  right: -20px;\n  bottom: 0;\n  left: -20px;\n  background-size: var(--flake-width) var(--flake-step);\n  animation: br-page-snow-fall var(--flake-time) linear var(--flake-offset) infinite paused;\n}\n\n.br-page-snow::before {\n  --flake-step: 216px;\n  --flake-width: clamp(194px, 25vw, 366px);\n  --flake-time: 19s;\n  --flake-offset: -8s;\n  --flake-drift: 8px;\n  background-image:\n    radial-gradient(circle at 17% 19%, rgb(255 255 255 / .65) 1px, transparent 1.8px),\n    radial-gradient(circle at 61% 53%, rgb(255 255 255 / .54) .8px, transparent 1.6px),\n    radial-gradient(circle at 86% 91%, rgb(255 255 255 / .57) 1.15px, transparent 2px);\n}\n\n.br-page-snow::after {\n  --flake-step: 283px;\n  --flake-width: clamp(242px, 31vw, 439px);\n  --flake-time: 15s;\n  --flake-offset: -3s;\n  --flake-drift: -12px;\n  background-image:\n    radial-gradient(circle at 34% 28%, rgb(255 255 255 / .75) 1.45px, transparent 2.35px),\n    radial-gradient(circle at 73% 78%, rgb(255 255 255 / .58) 1.25px, transparent 2.15px);\n}\n\n.br-page-snow.is-active::before,\n.br-page-snow.is-active::after {\n  animation-play-state: running;\n  will-change: transform;\n}\n\n@keyframes br-page-snow-fall {\n  0% { transform: translate3d(0, 0, 0); }\n  50% { transform: translate3d(var(--flake-drift), calc(var(--flake-step) / 2), 0); }\n  100% { transform: translate3d(0, var(--flake-step), 0); }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .br-page-snow { display: none; }\n  .br-page-snow::before, .br-page-snow::after { animation: none; }\n}\n\n#rec2851363001 .h-tab .tn-atom .tn-atom__button-text {\n  color: #b3b3b3 !important;\n  transition: none !important;\n}\n#rec2851363001 .h-tab.h-on .tn-atom .tn-atom__button-text {\n  color: #313a39 !important;\n}\n#rec2851363001 .h-tab .tn-atom .tn-atom__button-icon {\n  --icon: url(\"https://static.tildacdn.com/lib/icons/tilda/-/paint/b3b3b3--1-0-100/bullet_smooth_square_filled.svg\") !important;\n  --icon-hover: var(--icon) !important;\n}\n#rec2851363001 .h-tab.h-on .tn-atom .tn-atom__button-icon {\n  --icon: url(\"https://static.tildacdn.com/lib/icons/tilda/-/paint/9aed9b--1-0-100/bullet_smooth_square_filled.svg\") !important;\n}\n";
  style.textContent += "\n.br-page-snow--light { filter: brightness(.52) opacity(.6); }";
  if (/^\/*$/.test(location.pathname)) {
    style.textContent += `
      body.br-home-release #br-home-start.br-winter-hero--brand .brx__script {
        margin-block: 12px 8px;
        font: 650 clamp(26px, 3.45vw, 48px)/1.13 TildaSans, Arial, sans-serif;
        letter-spacing: -.015em;
        text-wrap: balance;
      }
      body.br-home-release #br-home-start.br-winter-hero--brand .brx__row a {
        box-sizing: border-box;
        display: grid;
        place-items: center;
        align-content: center;
        min-height: 48px;
        min-width: 0;
        padding: 9px 12px;
        font: 700 14px/1.18 DespairDisplay, TildaSans, Arial, sans-serif;
        letter-spacing: .01em;
        text-align: center;
        text-wrap: balance;
        white-space: normal;
      }
      #br-home-start.br-winter-hero--brand .brx__row .brx__cta {
        border: 1px solid transparent;
      }
      body.br-home-release #t-header[data-demo-ny-site="br"] a.demo-ny-link {
        background: #204d3f;
        border-color: #75a897;
        box-shadow: none;
        padding-inline: 8px;
        gap: 5px;
      }
      body.br-home-release #t-header[data-demo-ny-site="br"] a.demo-ny-link:hover {
        background: #286051;
        filter: none;
      }
      body.br-home-release #t-header[data-demo-ny-site="br"] .demo-ny-sparkles { display: none; }
      body.br-home-release #br-home-layout #br-home-booking {
        padding-block: clamp(22px, 2.6vw, 38px) clamp(18px, 2.2vw, 30px);
      }
      #br-home-layout #br-home-booking .brh-booking__panel {
        padding: clamp(16px, 2.25vw, 30px) clamp(14px, 3vw, 36px);
      }
      #br-home-layout #br-home-booking h2 { margin-bottom: clamp(12px, 1.25vw, 18px); }
      #br-home-layout #br-home-booking .brh-booking__fallback { margin-top: 8px !important; }
      @media (min-width: 961px) {
        body.br-home-release #br-home-start.br-winter-hero--brand .br-winter-hero__footer {
          width: min(100%, 620px);
        }
      }
      @media (max-width: 960px) {
        body.br-home-release #br-home-start.br-winter-hero--brand .brx__script {
          font-size: clamp(20px, 6.2vw, 34px);
        }
        body.br-home-release #br-home-start.br-winter-hero--brand .brx__row a {
          font-size: clamp(11px, 3.1vw, 14px);
          padding-inline: 8px;
        }
      }
      #br-house-cards .brh-house .brh-card__body {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 14px;
      }
      #br-house-cards .brh-house .brh-card__name { flex: 0 0 100%; margin: 0 0 3px; }
      #br-house-cards .brh-house .brh-house__button,
      #br-house-cards .brh-house .brh-house-details { min-height: 44px; margin: 0; }
      @media (max-width: 640px) {
        #br-house-cards .brh-house .brh-card__body {
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
        }
        #br-house-cards .brh-house .brh-card__name { flex: none; }
      }
    `;
  }
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
        || firstVisible('#br-gallery-photos[aria-labelledby="br-gallery-winter"] img')
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

  function watchMixedGallery() {
    const photos = document.getElementById('br-gallery-photos');
    if (!photos) return false;
    // The tabs replace the photo buttons. The snow goes on the current first winter photo.
    new MutationObserver(schedule).observe(photos, { childList: true });
    schedule();
    return true;
  }

  function start() {
    if (path.startsWith('/doma/') && !watchMixedGallery()) {
      document.addEventListener('br:mixed-gallery-ready', watchMixedGallery, { once: true });
    }
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
  load.addEventListener('load', () => {
    document.dispatchEvent(new Event('br:mixed-gallery-ready'));
  }, { once: true });
  document.head.append(load);
})();

(() => {
  if (location.hostname !== 'ecobr.ru') return;
  const certificate = 'https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/certificate/?site=ecobr';
  const groups = [
    ['Баусы', ['baus-1', 'baus-2', 'baus-3']],
    ['Хаусы', ['house-1', 'house-2', 'house-3', 'house-4']],
    ['А-фреймы', ['aframe-luxe-white', 'aframe-luxe-black', 'aframe-white', 'aframe-black', 'aframe-neo']],
    ['Барнхаусы', ['barn-1', 'barn-2', 'barn-3', 'barn-4']],
    ['Другие дома', ['panorama', 'bariloche', 'chalet', 'scandi', 'holidayhouse', 'sfera']]
  ];
  const sections = [
    ['/new-year', 'Новый год и каникулы'], ['/vip-programmy', 'Программы отдыха'],
    ['/vip-programmy#prazdniki', 'Праздники и мероприятия'], ['/spa', 'SPA и релакс'], ['/banchan', 'Бани и банные чаны'],
    ['/aktivnosti-v-beryozovoj-roshhe', 'Чем заняться'], ['/deti', 'Отдых с детьми'],
    ['/special', 'Специальные предложения'], [certificate, 'Подарочный сертификат'],
    ['/about', 'О базе'], ['/kartabr', 'Карта территории'], ['/contacts', 'Контакты']
  ];

  function link(text, href) {
    const element = document.createElement('a');
    element.href = href;
    element.textContent = text;
    return element;
  }

  function mountMenu(record) {
    const art = record.querySelector('.t396__artboard');
    const close = record.querySelector('a[href="#menuopen"]');
    const callback = record.querySelector('a[href$="#zayavka"], a[href="#zayavka-deti"]');
    const logo = record.querySelector('[data-elem-id="1766501078669000001"] img');
    const address = record.querySelector('[data-elem-id="1718876193886"] .tn-atom');
    const houseLinks = document.querySelectorAll('#rec1728108931 a[href*="/doma/"]');
    const houses = new Map([...houseLinks].map(a => [new URL(a.href).pathname.replace(/^\/doma\/|\/$/g, ''), a]));
    if (!art || !close || !callback || !logo || !address || groups.some(([, ids]) => ids.some(id => !houses.has(id)))) return null;

    const shell = document.createElement('div');
    shell.className = 'br-mobile-menu';
    shell.innerHTML = `
      <div class="br-mobile-menu__header">
        <a href="/" aria-label="Берёзовая роща, главная"></a>
        <button type="button" aria-label="Закрыть меню">×</button>
      </div>
      <div class="br-mobile-menu__body">
        <a class="br-mobile-menu__catalog" href="/doma">
          <span><strong>Каталог домов</strong><small>Фотографии и описание всех 22 домов</small></span>
          <span aria-hidden="true">→</span>
        </a>
        <details><summary>Дома по категориям</summary><div class="br-mobile-menu__groups"></div></details>
        <nav aria-label="Разделы сайта"></nav>
        <div class="br-mobile-menu__contact">
          <p></p><div class="br-mobile-menu__maps"></div>
          <p>Отдел бронирования<br>Ежедневно с 9:00 до 24:00<br><a href="tel:+74951202008">+7 (495) 120-20-08</a></p>
          <a class="br-mobile-menu__callback" href="#zayavka">Обратный звонок</a>
          <div class="br-mobile-menu__contact-links"></div>
        </div>
      </div>`;
    const photo = document.createElement('img');
    photo.src = logo.getAttribute('src') || logo.dataset.original;
    photo.alt = '';
    photo.width = 160;
    shell.querySelector('.br-mobile-menu__header a').append(photo);
    shell.querySelector('button').addEventListener('click', () => close.click());
    shell.querySelector('nav').append(...sections.map(([href, label]) => link(label, href)));
    shell.querySelector('.br-mobile-menu__contact p').textContent = address.textContent.trim();
    shell.querySelector('.br-mobile-menu__maps').append(...[...record.querySelectorAll('a[href]')]
      .filter(a => /go\.2gis\.com|yandex\.ru\/maps/.test(a.href))
      .map(a => a.cloneNode(true)));
    const contactLinks = shell.querySelector('.br-mobile-menu__contact-links');
    for (const [selector, text] of [
      ['a[href*="instagram.com"]', 'Instagram'], ['a[href*="vk.com"]', 'ВКонтакте'],
      ['a[href*="t.me/"]', 'Telegram'], ['a[href^="mailto:"]', 'Сотрудничество']
    ]) {
      const original = record.querySelector(selector);
      if (original) contactLinks.append(link(text, original.href));
    }
    const callbackAction = shell.querySelector('.br-mobile-menu__callback');
    callbackAction.href = callback.href;
    callbackAction.addEventListener('click', event => {
      event.preventDefault();
      callback.click();
    });

    const groupList = shell.querySelector('.br-mobile-menu__groups');
    for (const [name, ids] of groups) {
      const group = document.createElement('div');
      const title = document.createElement('p');
      const list = document.createElement('ul');
      title.textContent = name;
      for (const id of ids) {
        const item = document.createElement('li');
        item.append(link(houses.get(id).textContent.trim(), `/doma/${id}`));
        list.append(item);
      }
      group.append(title, list);
      groupList.append(group);
    }

    const styles = document.createElement('style');
    styles.textContent = `
      #rec1729227991.br-mobile-menu-ready :is(.t396,.t396__artboard) {
        height:100dvh!important; max-height:100dvh!important; overflow:hidden!important;
        background:#f4f6fb!important;
      }
      #rec1729227991.br-mobile-menu-ready .t396__artboard>:is(.tn-elem,.t396__group) {display:none!important}
      .br-mobile-menu,.br-mobile-menu * {box-sizing:border-box}
      .br-mobile-menu {position:relative;z-index:5;pointer-events:auto;display:flex;flex-direction:column;height:100dvh;overflow:hidden;background:#f4f6fb;color:#1a1b19;font:400 16px/1.5 TildaSans,Arial,sans-serif}
      .br-mobile-menu a {color:#1a1b19!important;text-decoration:none}
      .br-mobile-menu :is(a,button,summary):focus-visible {outline:2px solid #20d2a4;outline-offset:3px}
      .br-mobile-menu__header {display:flex;flex:none;align-items:center;justify-content:space-between;gap:16px;padding:16px 20px;border-bottom:1px solid #dce5e0}
      .br-mobile-menu__header img {display:block;width:160px;height:auto}
      .br-mobile-menu__header button {width:44px;height:44px;flex:none;border:1px solid #9aed9b;border-radius:50%;background:#fff;color:#1a1b19;font:24px/1 TildaSans,Arial,sans-serif;cursor:pointer}
      .br-mobile-menu__body {flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:16px 20px calc(30px + env(safe-area-inset-bottom,0px))}
      .br-mobile-menu__catalog {display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:84px;padding:14px 18px;border:1px solid #20d2a4;border-radius:10px;background:#fff}
      .br-mobile-menu__catalog strong {display:block;font-size:20px;line-height:1.25}
      .br-mobile-menu__catalog small {display:block;margin-top:5px;color:#53615c;font-size:14px}
      .br-mobile-menu__catalog>span:last-child {color:#168769;font-size:24px}
      .br-mobile-menu details {padding:10px 0 14px;border-bottom:1px solid #dce5e0}
      .br-mobile-menu summary {display:flex;align-items:center;justify-content:space-between;min-height:48px;list-style:none;cursor:pointer;font-weight:500}
      .br-mobile-menu summary::-webkit-details-marker {display:none}
      .br-mobile-menu summary::after {content:"";width:7px;height:7px;margin-right:4px;border:solid currentColor;border-width:0 1.5px 1.5px 0;transform:rotate(45deg)}
      .br-mobile-menu details[open]>summary::after {transform:rotate(225deg)}
      .br-mobile-menu__groups {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 16px;padding:6px 0}
      .br-mobile-menu__groups p {margin:0;color:#53615c;font-weight:600}
      .br-mobile-menu__groups ul {list-style:none;margin:0;padding:0}
      .br-mobile-menu :is(nav,.br-mobile-menu__groups) a {display:flex;align-items:center;min-height:44px;line-height:1.3;overflow-wrap:anywhere}
      .br-mobile-menu nav {padding:14px 0}
      .br-mobile-menu nav>a:first-child {color:#145c4c!important;font-weight:650}
      .br-mobile-menu__contact {padding-top:18px;border-top:1px solid #dce5e0}
      .br-mobile-menu__contact p {margin:0 0 10px}
      .br-mobile-menu__maps,.br-mobile-menu__contact-links {display:flex;flex-wrap:wrap;gap:4px 16px;margin-bottom:12px}
      .br-mobile-menu__contact-links {margin:12px 0 0}
      .br-mobile-menu :is(.br-mobile-menu__maps,.br-mobile-menu__contact-links) a {display:inline-flex;min-height:38px;align-items:center;text-decoration:underline}
      .br-mobile-menu__callback {display:flex;align-items:center;justify-content:center;min-height:46px;padding:8px;border:1px solid #20d2a4;border-radius:8px;background:#fff;color:#166b59!important;font:700 13px/1.3 DespairDisplay,TildaSans,sans-serif;text-transform:uppercase}
      @media(max-width:359px) {.br-mobile-menu__groups {grid-template-columns:1fr}}
    `;
    document.head.append(styles);
    art.append(shell);
    record.classList.add('br-mobile-menu-ready');
    return shell;
  }

  document.addEventListener('click', event => {
    if (!event.target.closest?.('a[href="#menum"]')) return;
    const record = document.querySelector('#allrecords[data-tilda-project-id="4027012"] #rec1729227991');
    if (!record) return;
    const shell = record.querySelector('.br-mobile-menu') || mountMenu(record);
    if (!shell) return;
    const scroller = shell.querySelector('.br-mobile-menu__body');
    let attempts = 0;
    const resetAfterOpening = () => {
      if (record.closest('.t-popup_show')) scroller.scrollTop = 0;
      else if (++attempts < 30) requestAnimationFrame(resetAfterOpening);
    };
    requestAnimationFrame(resetAfterOpening);
  }, true);
})();

(() => {
  if (location.hostname !== 'ecobr.ru' || location.pathname !== '/') return;
  const home = document.querySelector('#allrecords[data-tilda-project-id="4027012"][data-tilda-page-id="103448346"]');
  const layout = home?.querySelector('#br-home-layout');
  const photos = [
    ['baus-1', 'house-winter-baus-1-warm.webp', 'card-previews/baus-1-facade-winter.webp', 900, 1350, 'center 43%'],
    ['scandi', 'house-winter-scandi.webp', 'winter-new-year-scandi.webp', 1024, 1024, 'center 40%']
  ];
  const assets = 'https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/';
  for (const [house, previous, asset, width, height, position] of photos) {
    const photo = layout?.querySelector(`#br-house-cards .brh-house__visual a[href$="/doma/${house}"] img`);
    if (!photo?.getAttribute('src')?.endsWith('/' + previous)) continue;
    photo.width = width;
    photo.height = height;
    photo.style.objectPosition = position;
    photo.src = assets + asset;
  }
  const categories = layout?.querySelector('#br-home-house-options');
  const offers = layout?.querySelector('#br-home-offers');
  const offerCards = layout?.querySelector('[data-br-slot="rec3546311701"], #rec3546311701');
  if (!categories || !offers || !offerCards || layout.querySelector('#programmy-otdyha')) return;

  const programs = document.createElement('section');
  programs.id = 'programmy-otdyha';
  programs.setAttribute('aria-labelledby', 'br-offer-teaser-title');
  programs.innerHTML = `
    <div class="br-offer-teaser__card">
      <img data-src="https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/winter-birthday-panoramic.webp"
           alt="" width="1500" height="1125" loading="lazy" decoding="async">
      <div class="br-offer-teaser__copy">
        <h2 id="br-offer-teaser-title">Программы отдыха</h2>
        <p>Дни рождения, SPA и банные программы</p>
        <a href="/vip-programmy">Смотреть программы <span aria-hidden="true">→</span></a>
      </div>
    </div>`;
  const styles = document.createElement('style');
  styles.textContent = `
    #br-home-layout #programmy-otdyha {padding:16px;scroll-margin-top:calc(var(--brx-top,60px) + 20px)}
    .br-offer-teaser__card {position:relative;isolation:isolate;display:flex;align-items:flex-end;min-height:clamp(204px,58vw,336px);max-width:980px;margin:auto;overflow:hidden;border-radius:13px;background:#183027}
    .br-offer-teaser__card>img,.br-offer-teaser__card::before {position:absolute;inset:0;width:100%;height:100%}
    .br-offer-teaser__card>img {z-index:-2;object-fit:cover;object-position:center 25%}
    .br-offer-teaser__card::before {z-index:-1;content:"";background:linear-gradient(0deg,#10241df5 0%,#10241db8 34%,transparent 78%)}
    .br-offer-teaser__copy {padding:clamp(13px,3vw,30px)}
    #br-home-layout #br-offer-teaser-title {margin:0;color:#fff;font:700 clamp(18px,4.9vw,37px)/1.1 DespairDisplay,TildaSans,sans-serif;text-transform:uppercase}
    .br-offer-teaser__copy p {margin:4px 0 9px;color:#f2fbf6;font:500 clamp(13px,3.7vw,18px)/1.22 TildaSans,Arial,sans-serif}
    .br-offer-teaser__copy a {display:inline-flex;align-items:center;gap:13px;min-height:44px;padding:0 12px;border-radius:7px;background:#f4fbf8;color:#173c30!important;font:700 15px/1.2 TildaSans,Arial,sans-serif}
    .br-offer-teaser__copy a:focus-visible {outline:2px solid #19af82;outline-offset:2px}
    @media(min-width:700px) {#br-home-layout #programmy-otdyha {padding:28px clamp(20px,4.2vw,60px)} .br-offer-teaser__card>img {object-position:center 18%}}
  `;
  document.head.append(styles);
  categories.after(programs, offers, offerCards);

  const photo = programs.querySelector('img');
  const loadPhoto = () => { photo.src = photo.dataset.src; };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      loadPhoto();
      observer.disconnect();
    }, { rootMargin: '240px' });
    observer.observe(programs);
  } else loadPhoto();
})();

(() => {
  if (location.hostname !== 'ecobr.ru') return;
  const site = document.querySelector('#allrecords[data-tilda-project-id="4027012"]');
  if (!site) return;

  const photo = site.querySelector('#uyutnye-budni .to-pic > img');
  if (photo?.getAttribute('src')?.endsWith('/winter-weekday-chan.webp')) {
    const assets = 'https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120/br-assets/';
    photo.width = 1440;
    photo.height = 810;
    photo.alt = 'Гостья в банном чане «Баус‑2» зимой';
    photo.sizes = '(max-width: 767px) calc(100vw - 36px), 570px';
    photo.srcset = assets + 'baus-2-chan-winter-800.webp 800w, ' + assets + 'baus-2-chan-winter-1440.webp 1440w';
    photo.src = assets + 'baus-2-chan-winter-800.webp';
  }

  const tabs = site.querySelector('#rec1758798101');
  const season = tabs?.querySelector('.t1281__tab[data-tab-rec-ids="4153950101"]');
  if (!season) return;
  const styles = document.createElement('style');
  styles.textContent = `
    #rec1758798101 .t1281__tab[data-tab-rec-ids="4153950101"] { order: -1; }
    @media (max-width: 639px) {
      #rec1758798101 .t1281__wrapper_mobile-flex { width: 100%; }
      #rec1758798101 .t1281__wrapper_mobile-flex .t1281__tab { flex: 1 1 0; min-width: 0; }
      #rec1758798101 .t1281__wrapper_mobile-flex .t1281__title { width: 100%; min-height: 48px; padding: 7px 5px; gap: 6px; }
      #rec1758798101 .t1281__title-text { min-width: 0; line-height: 1.2; white-space: normal; }
      #rec1758798101 .t1281__tab-icon { flex-shrink: 0; }
    }
  `;
  document.head.append(styles);

  // Keep the original tab numbers so shared Tilda tab links still resolve.
  if (location.hash.startsWith('#!/tab/')) return;
  const recId = '1758798101';
  if (window.t1281_tabsMap?.[recId] && typeof window.t1281_switchBetweenTabs === 'function') {
    window.t1281_switchBetweenTabs(recId, Number(season.dataset.tabNumber), season,
      site.dataset.tildaMode, site.dataset.tildaLazy, false, false);
    return;
  }
  for (const tab of tabs.querySelectorAll('.t1281__tab')) {
    const active = tab === season;
    tab.classList.toggle('t1281__tab_active', active);
    tab.classList.toggle('t1281__tab-style2_active', active);
  }
  const select = tabs.querySelector('.t1281__select');
  if (select) select.value = season.dataset.tabRecIds;
})();

(() => {
  if (location.hostname !== 'ecobr.ru') return;
  const site = document.querySelector('#allrecords[data-tilda-project-id="4027012"]');
  if (!site) return;
  const path = location.pathname.replace(/\/$/, '');
  const program = site.querySelector('#rec1750245051');
  if (path === '/vip-programmy' && program && !document.getElementById('prazdniki')) {
    const section = document.createElement('section');
    section.id = 'prazdniki';
    section.setAttribute('aria-labelledby', 'br-events-title');
    section.innerHTML = `
      <div class="t-container br-events">
        <h2 id="br-events-title">Праздники и мероприятия</h2>
        <nav aria-label="Поводы для праздника">
          <a href="#popup:dr">День рождения</a>
          <a href="/deti">Семейный праздник</a>
          <a href="#popup:romantic">Романтик</a>
          <a href="#popup:girlparty">Девичник</a>
          <a href="#popup:fotoden">Фотодень</a>
          <a href="https://t.me/ecobazabr">Обсудить мероприятие</a>
        </nav>
      </div>`;
    const styles = document.createElement('style');
    styles.textContent = `
      #prazdniki {padding:clamp(24px,5vw,64px) 18px;scroll-margin-top:100px}
      #prazdniki .br-events {box-sizing:border-box;max-width:1160px;margin:auto;padding:clamp(18px,4vw,42px);border-radius:16px;background:#f4f6fb;color:#1a1b19}
      #prazdniki h2 {margin:0 0 20px;font:700 clamp(20px,3.8vw,36px)/1.12 DespairDisplay,TildaSans,sans-serif;text-transform:uppercase}
      #prazdniki nav {display:flex;flex-wrap:wrap;gap:8px}
      #prazdniki nav a {display:inline-flex;min-height:44px;align-items:center;padding:0 13px;border:1px solid #a0d9c7;border-radius:9px;background:#fff;color:#185e4e!important;font:650 16px/1.25 TildaSans,Arial,sans-serif}
      #prazdniki nav a:focus-visible {outline:2px solid #168769;outline-offset:2px}
    `;
    document.head.append(styles);
    program.after(section);
    if (location.hash === '#prazdniki') section.scrollIntoView();
  }

  if (!/^\/doma\/[^/]+$/.test(path)) return;
  const breadcrumb = site.querySelector('.t758 a[href="/doma"]');
  if (!breadcrumb) return;
  breadcrumb.classList.add('br-house-catalog-return');
  breadcrumb.closest('.t758__list')?.classList.add('br-house-breadcrumbs');
  breadcrumb.textContent = '← Все дома';
  const styles = document.createElement('style');
  styles.textContent = `
    .t758 .br-house-breadcrumbs {display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-start;gap:0 4px}
    .t758 .br-house-breadcrumbs .t758__list_item {display:inline-flex;align-items:center}
    .t758 .br-house-breadcrumbs .t758__breadcrumb-divider {align-self:center}
    .t758 a.br-house-catalog-return {display:inline-flex;align-items:center;min-height:44px;padding-inline:4px;color:#166b59!important;text-decoration:underline;text-underline-offset:3px;white-space:nowrap}
  `;
  document.head.append(styles);
})();
