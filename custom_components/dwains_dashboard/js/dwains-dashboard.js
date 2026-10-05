/*! For license information please see dwains-dashboard.js.LICENSE.txt */
(()=>{var e={1495(e){"use strict";const t=Object.freeze([6,12,24,48,168]);e.exports={AREA_GRAPH_HOURS:t,normalizeGraphHours:function(e){const i=Number(e);return t.includes(i)?i:24},historyToPoints:function(e){const t=[];for(const i of e||[]){const e=i.s??i.state,a=Number(e);if(""===e||null==e||!Number.isFinite(a))continue;let s=i.lu??i.lc;s=void 0!==s?1e3*Number(s):Date.parse(i.last_updated??i.last_changed),Number.isFinite(s)&&t.push({time:s,value:a})}return t.sort((e,t)=>e.time-t.time),t},bucketPoints:function(e,{start:t,end:i,buckets:a=48}){if(!e.length||i<=t)return[];const s=(i-t)/a,r=new Array(a).fill(0),o=new Array(a).fill(0);let n;for(const i of e){if(i.time<t){n=i.value;continue}const e=Math.min(a-1,Math.floor((i.time-t)/s));r[e]+=i.value,o[e]+=1}const d=[];let c=n;for(let e=0;e<a;e++)o[e]&&(c=r[e]/o[e]),d.push(c);const l=d.findIndex(e=>void 0!==e);return-1===l?[]:d.map(e=>void 0===e?d[l]:e)},graphPaths:function(e,t,i,{padTop:a=4,padBottom:s=2}={}){if(e.length<2)return null;const r=Math.min(...e),o=Math.max(...e),n=o-r||1,d=i=>i/(e.length-1)*t,c=e=>a+(1-(e-r)/n)*(i-a-s),l=e=>Math.round(10*e)/10;let h=`M${l(d(0))},${l(c(e[0]))}`;for(let t=1;t<e.length;t++){const i=l((d(t-1)+d(t))/2);h+=` C${i},${l(c(e[t-1]))} ${i},${l(c(e[t]))} ${l(d(t))},${l(c(e[t]))}`}return{line:h,area:`${h} L${t},${i} L0,${i} Z`,min:r,max:o}},statisticsToPoints:function(e){const t=[];for(const i of e||[]){const e=i.mean??i.state,a=Number(e);if(null==e||!Number.isFinite(a))continue;const s="number"==typeof i.start?i.start:Date.parse(i.start);Number.isFinite(s)&&t.push({time:s,value:a})}return t.sort((e,t)=>e.time-t.time),t},usesStatistics:function(e){return e>=48}}},393(e){"use strict";class t{constructor({windowObject:e=("undefined"!=typeof window?window:void 0),delay:t=e=>new Promise(t=>setTimeout(t,e))}={}){this._window=e,this._delay=t,this._helpers=void 0,this._pending=void 0,this._configElementLoads=new Map}preloadConfigElement(e="button"){if("string"!=typeof e||0===e.length)return Promise.reject(new TypeError("Card type must be a non-empty string"));const t=this._configElementLoads.get(e);if(t)return t;const i=this.load().then(async t=>{const i=await t.createCardElement({type:e}),a=i?.constructor?.getConfigElement;if("function"!=typeof a)throw new TypeError(`Card type ${e} does not provide getConfigElement()`);await a.call(i.constructor)});return this._configElementLoads.set(e,i),i.then(void 0,t=>(this._configElementLoads.get(e)===i&&this._configElementLoads.delete(e),t)),i}load(e=20){return this._helpers?.createCardElement?Promise.resolve(this._helpers):(this._pending||(this._pending=this._load(e).then(e=>(this._helpers=e,this._pending=void 0,e),e=>{throw this._pending=void 0,e})),this._pending)}async _load(e){let t;for(let a=0;a<e;a+=1){try{const e=this._window?.loadCardHelpers;if("function"==typeof e){const i=await e.call(this._window);if(i?.createCardElement)return i;t=new TypeError("loadCardHelpers returned an invalid helper object")}else t=new TypeError("window.loadCardHelpers is not available")}catch(i){t=i}await this._delay(a<5?100:300)}const i=new Error(`Card helpers not loaded after ${e} attempts`);throw i.cause=t,i}}const i=new t;e.exports={loadCardHelpers:e=>i.load(e)}},2330(e,t,i){"use strict";const{findHcMain:a,findHomeAssistantHost:s}=i(7921);function r(e,t,i){const r=new Event(e,{bubbles:!0,cancelable:!1,composed:!0});r.detail=t||{};const o=i||a()||s();return o?.dispatchEvent(r),r}async function o(e,t,i){const a="string"==typeof t?t.split(/(\$| )/):[...t];""===a.at(-1)&&a.pop();let s=e;for(const[e,t]of a.entries())if(t.trim()){if(!s)return null;s.localName?.includes("-")&&await customElements.whenDefined(s.localName),s.updateComplete&&await s.updateComplete,s="$"===t?i&&e===a.length-1?[s.shadowRoot]:s.shadowRoot:i&&e===a.length-1?s.querySelectorAll(t):s.querySelector(t)}return s}async function n(e,t,i=!1,a=1e4){let s;const r=Symbol("select-tree-timeout");try{const n=await Promise.race([o(e,t,i),new Promise(e=>{s=setTimeout(()=>e(r),a)})]);return n===r?null:n}finally{void 0!==s&&clearTimeout(s)}}e.exports={fireEvent:r,Q:async function(e,t=!1){const i=a()||s();if(!i)return null;r("hass-more-info",{entityId:e},i);const o=await n(i,"$ ha-more-info-dialog");return o&&(o.large=t),o},V:n}},3196(e,t,i){"use strict";function a(e){for(var t=1;t<arguments.length;t++){var i=arguments[t];for(var a in i)"__proto__"!==a&&(e[a]=i[a])}return e}i.d(t,{O:()=>o});var s=function e(t,i){function s(e,s,r){if("undefined"!=typeof document){"number"==typeof(r=a({},i,r)).expires&&(r.expires=new Date(Date.now()+864e5*r.expires)),r.expires&&(r.expires=r.expires.toUTCString()),e=encodeURIComponent(e).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape);var o="";for(var n in r)r[n]&&(o+="; "+n,!0!==r[n]&&(o+="="+r[n].split(";")[0]));return document.cookie=e+"="+t.write(s,e)+o}}return Object.create({set:s,get:function(e){if("undefined"!=typeof document&&(!arguments.length||e)){for(var i=document.cookie?document.cookie.split("; "):[],a={},s=0;s<i.length;s++){var r=i[s].split("="),o=r.slice(1).join("=");try{var n=decodeURIComponent(r[0]);if(n in a||(a[n]=t.read(o,n)),e===n)break}catch(e){}}return e?a[e]:a}},remove:function(e,t){s(e,"",a({},t,{expires:-1}))},withAttributes:function(t){return e(this.converter,a({},this.attributes,t))},withConverter:function(t){return e(a({},this.converter,t),this.attributes)}},{attributes:{value:Object.freeze(i)},converter:{value:Object.freeze(t)}})}({read:function(e){return'"'===e[0]&&(e=e.slice(1,-1)),e.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent)},write:function(e){return encodeURIComponent(e).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,decodeURIComponent)}},{path:"/"});function r(){try{return window.localStorage}catch(e){return}}const o={get(e){const t=r();let i;try{i=t?.getItem(e)??void 0}catch(e){i=void 0}if(void 0!==i)return i;const a=s.get(e);return void 0!==a&&(this.set(e,a),t&&s.remove(e)),a},set(e,t){try{const i=r();if(i)return void i.setItem(e,String(t))}catch(e){}s.set(e,t,{expires:365})}}},1415(e,t,i){"use strict";const{getDwainsRuntimeState:a}=i(5875);function s(e){if("string"!=typeof e)return!1;const t=e.endsWith("-ddfix")?e.slice(0,-6):e;return t.startsWith("dwains-")||"homepage-card"===t||"devices-card"===t||"more-page-card"===t||"more-pages-card"===t||"dwainsboard-navigation-card"===t}function r(e,t,{registry:i=("undefined"==typeof customElements?void 0:customElements),reportError:a=(...e)=>console.error(...e)}={}){if("string"!=typeof e||!e.includes("-"))throw new TypeError(`Invalid custom-element name: ${e}`);if(!i||"function"!=typeof i.define)throw new TypeError("A CustomElementRegistry is required");if(!i.get(e))try{return i.define(e,t)}catch(t){return void a("[dwains] define failed:",e,t)}}e.exports={defineDwainsElement:function(e,t,i={}){if(!s(e))throw new TypeError(`Not a Dwains custom-element name: ${e}`);const{windowObject:o=("undefined"==typeof window?void 0:window),reportError:n=(...e)=>console.error(...e)}=i;return function(e,t,i,s){try{const s=a(i);(s.constructors||={})[e]=t;const r=s.originalConstructors||={};r[e]||(r[e]=t)}catch(t){s("[dwains] failed to capture constructor:",e,t)}}(e,t,o,n),r(e,t,{...i,reportError:n})},defineOwnedElement:r,isDwainsElementName:s}},5768(e,t,i){"use strict";const{websocketReadStore:a}=i(7069),{buildRegistryIndexes:s}=i(6037),{READ_MESSAGES:r}=i(5450);async function o(e,{optionalRegistries:t=!1,readStore:i=a}={}){const o=t?t=>i.readOptional(e,t,[]):t=>i.read(e,t),[n,d,c]=await Promise.all([o(r.devices),o(r.entities),i.read(e,r.configuration)]);return{devices:n,entities:d,configuration:c,...s(n,d)}}e.exports={loadDashboardCoreSnapshot:o,loadDashboardRegistrySnapshot:async function(e,{includeFloors:t=!1,readStore:i=a}={}){const s=[i.read(e,r.areas),o(e,{readStore:i})];t&&s.push(i.readOptional(e,r.floors,[]));const[n,d,c]=await Promise.all(s);return{areas:n,...d,...t?{floors:c,floorsById:new Map((c||[]).map(e=>[e.floor_id,e]))}:{}}}}},3991(e){"use strict";function t(e){return"/dwains-dashboard"===e||e?.startsWith("/dwains-dashboard/")}class i{constructor({windowObject:e=("undefined"!=typeof window?window:void 0),reportError:t=(e,t)=>console.error(e,t),createLocationChangedEvent:i=(e=!0)=>new CustomEvent("location-changed",{detail:{replace:e}})}={}){this._window=e,this._reportError=t,this._createLocationChangedEvent=i}navigate(e,{replace:t=!1}={}){const i=this._validDwainsUrl(e);if(!i)return!1;try{const e=`${i.pathname}${i.search}${i.hash}`,a=this._window.location;return`${a.pathname}${a.search}${a.hash}`!==e&&(t?this._window.history.replaceState(this._window.history.state||null,"",e):this._window.history.pushState(null,"",e),this._window.dispatchEvent(this._createLocationChangedEvent(t))),!0}catch(e){return this._reportError("Failed to navigate within Dwains Dashboard",e),!1}}navigateToDevices(e){const t=this._window?.location?.pathname;if(!t)return!1;const i=t.substring(0,t.lastIndexOf("/"));return this.navigate(`${i}/devices#${e}`)}_validDwainsUrl(e){if(e)try{const i=new URL(e,this._window.location.origin);return i.origin===this._window.location.origin&&t(i.pathname)?i:void 0}catch(e){return void this._reportError("Failed to validate a Dwains Dashboard route",e)}}}const a=new i;e.exports={dashboardRouteState:a,isDwainsRoute:t}},2815(e){"use strict";e.exports={attachDeferredCard:function(e,t){if(!e||"function"!=typeof t)throw new TypeError("Deferred cards require an item and a card factory");let i;return e.cardFactory=()=>e.card?Promise.resolve(e.card):(i||(i=Promise.resolve().then(t).then(t=>(e.card=t,i=void 0,t)).catch(e=>{throw i=void 0,e})),i),e}}},9823(e){"use strict";e.exports={closeParentDropdown:function(e,{reportError:t=(e,t)=>console.error(e,t)}={}){try{const t="function"==typeof e?.composedPath?e.composedPath():[];let i=Array.isArray(t)?t.find(e=>"ha-dropdown"===e?.localName):void 0;return i||"function"!=typeof e?.currentTarget?.closest||(i=e.currentTarget.closest("ha-dropdown")),i||"function"!=typeof e?.target?.closest||(i=e.target.closest("ha-dropdown")),i?("function"==typeof i.close?i.close():"open"in i?i.open=!1:i.removeAttribute("open"),!0):!1}catch(e){return t("Failed to close the parent Home Assistant dropdown",e),!1}}}},9992(e,t,i){"use strict";var a=i(6009),s=i(6684),r=i(5213),o=i(4169);const{loadCardHelpers:n}=i(393),{websocketReadStore:d}=i(7069),{defineDwainsElement:c}=i(1415),l=n();class h extends s.WF{static get properties(){return{card:{},_hass:{}}}static getConfigElement(){return document.createElement("dwains-blueprint-card-editor")}set hass(e){this._hass=e,null!=this.card&&0!==this.card.length&&(this.card.hass=e)}async setConfig(e){const t=(this._configGeneration||0)+1;this._configGeneration=t,this._hass||(this._hass=(0,a.mo)());const i=e.data,s=e.input_entity?e.input_entity:"Error";let r;if(e.input_entity&&(r=e.input_name||(0,o.Hg)(this._hass,void 0,e.input_entity)),!e||"object"!=typeof e.card||null===e.card)throw new Error("dwains-blueprint-card requires a `card` configuration");this.cardConfig=e.card;const n=JSON.stringify(e.card).replace(/\$([0-9]|[aA-zZ])*\$/g,function(t,a){const o=t.slice(1,-1);return"replace_with_input_entity"==o?s:"replace_with_input_name"==o?r:e.data?i[o]:void 0}).replaceAll('"false"',"false").replaceAll('"true"',"true"),d=await this.createCardElement2(JSON.parse(n));t===this._configGeneration&&(this.card=d)}disconnectedCallback(){super.disconnectedCallback(),this._configGeneration=(this._configGeneration||0)+1}async createCardElement2(e){const t=await l;return(0,o.Kq)(t,e,this._hass)}render(){return s.qy`
              ${this.card}
            `}static get styles(){return[(0,r.F)(s.AH),s.AH`
          `]}}c("dwains-blueprint-card",h);class p extends s.WF{static get styles(){return[(0,r.F)(s.AH),s.AH`
            .dd-check, ha-input,.formfield {
              width: 100%;
            }
            .formfield {
              margin-bottom: 10px;
            }
            `]}static get properties(){return{inputs:{},blueprint:{}}}connectedCallback(){super.connectedCallback(),this._loadBlueprintsIfReady()}_loadBlueprintsIfReady(){this.isConnected&&this.hass&&this._config&&this._loadBlueprints().catch(e=>{console.error("Failed to load blueprint editor data",e)})}async _loadBlueprints(){this.blueprints=await d.read(this.hass,{type:"dwains_dashboard/get_blueprints"});const e=this.blueprints?.blueprints?.[this._config.blueprint];if(e){if(this.blueprint=e,e.blueprint?.input&&(this.inputs=e.blueprint.input,!this._config.data||0===this._config.data.length)){const e={};Object.entries(this.inputs).map(([t,i])=>e[t]=t),this._config.data=e}this._config.card=e.card;const t=new Event("config-changed",{bubbles:!0,composed:!0});t.detail={config:this._config},this.dispatchEvent(t)}}setConfig(e){this._config=e,this.hass||(this.hass=(0,a.mo)()),this._loadBlueprintsIfReady()}_inputChanged(e){const t=e.target.key,i=e.target.value,a=this._config;a.data[t]=i;const s=new Event("config-changed",{bubbles:!0,composed:!0});s.detail={config:a},this.dispatchEvent(s)}_checkboxChanged(e){const t=e.target.key,i=e.target.checked,a=this._config;a.data[t]=i;const s=new Event("config-changed",{bubbles:!0,composed:!0});s.detail={config:a},this.dispatchEvent(s)}_renderInput(e,t){let i,a="";return this._config.data&&this._config.data[e]&&this._config.data[e]!=e&&(a=this._config.data[e]),t.type&&"entity-picker"==t.type?i=s.qy`
            <ha-entity-picker
                label=${t.name}
                .value=${a}
                .key=${e}
                .hass=${this.hass}
                @value-changed=${this._inputChanged}
            ></ha-entity-picker>`:t.type&&"icon-picker"==t.type?i=s.qy`
            <ha-icon-picker
              label=${t.name}
              .value=${a}
              .key=${e}
              .name=${t.name}
              @value-changed=${this._inputChanged}
            ></ha-icon-picker>
            `:t.type&&"checkbox"==t.type?(a=!(a||!t.default_value)&&t.default_value,i=s.qy`
            <label class="dd-check" @click=${r.H}>
              <ha-checkbox
                    @change=${this._checkboxChanged}
                    .checked=${a}
                    .key=${e}
                    .name=${t.name}
                  ></ha-checkbox>
              <span>${t.name}</span>
            </label>
            `):i=s.qy`
            <ha-input
                label=${t.name}
                .value=${a}
                .key=${e}
                @input=${this._inputChanged}
            ></ha-input>
            `,s.qy`
          <div class="formfield">
            <strong>${t.description}</strong>
            ${i}
          </div>
          `}render(){return null==this.blueprints||0===this.blueprints.length?s.qy``:this.blueprint?this.inputs&&0!==this.inputs.length?s.qy`
            ${Object.entries(this.inputs).map(([e,t])=>s.qy`${this._renderInput(e,t)}`)}
          `:s.qy``:s.qy`Blueprint not found!`}}c("dwains-blueprint-card-editor",p)},3977(e,t,i){"use strict";var a=i.cw(function(e,t){const{TimerOwner:i}=s();e.exports={LovelaceHeaderOwner:class{constructor({timers:e=new i,maxAttempts:t=40,retryDelay:a=100,MutationObserverClass:s=("undefined"!=typeof MutationObserver?MutationObserver:void 0),reportError:r=(e,t)=>console.error(e,t)}={}){this._timers=e,this._maxAttempts=t,this._retryDelay=a,this._MutationObserver=s,this._reportError=r}connect(e){this._owner=e,this._attempts=0,this._timers.connect(),this._sync()}disconnect(){this._timers.disconnect(),this._observer?.disconnect(),this._observer=void 0,this._observedRoot=void 0,"none"===this._header?.style?.display&&(this._header.style.display=this._previousDisplay??""),this._header=void 0,this._owner=void 0}_findLovelaceRoot(){let e=this._owner;for(let t=0;e&&t<40;t+=1){if("hui-root"===e.localName)return e;const t=e.getRootNode?.();e=e.parentNode||t?.host||null}}_sync(){try{const e=this._findLovelaceRoot();e?.shadowRoot&&e!==this._observedRoot&&this._MutationObserver&&(this._observer?.disconnect(),this._observer=new this._MutationObserver(()=>this._sync()),this._observer.observe(e.shadowRoot,{childList:!0,subtree:!0}),this._observedRoot=e);const t=e?.shadowRoot?.querySelector(".header");if(t){t!==this._header&&(this._header=t,this._previousDisplay=t.style.display);const e=t.getBoundingClientRect?.(),i=e?.height||t.offsetHeight||0;return i>0&&this._owner?.style?.setProperty?.("--dd-lovelace-header-offset",`${i}px`),t.style.display="none",void(this._attempts=0)}}catch(e){this._reportError("Failed to synchronize the Lovelace header",e)}this._attempts+=1,this._owner?.isConnected&&this._attempts<=this._maxAttempts&&this._timers.schedule("lovelace-header",()=>this._sync(),this._retryDelay)}}}}),s=()=>i(9792),r=i(6684);const{defineDwainsElement:o}=i(1415),{LovelaceHeaderOwner:n}=a();class d extends r.WF{constructor(){super(),this._headerOwner=new n}connectedCallback(){super.connectedCallback(),this._headerOwner.connect(this)}disconnectedCallback(){super.disconnectedCallback(),this._headerOwner.disconnect()}setConfig(e){}static get properties(){return{hass:{attribute:!1},cards:{type:Array}}}static get styles(){return(0,r.iz)('/* Styles of the dwains-dashboard-layout view. Used by the bundle\n   (dwains-dashboard-layout.js) and, written in by scripts/postbuild.mjs, by\n   the preloaded layout (standalone/dwains-dashboard-layout-preload.js). */\n\n/* The Lovelace header is hidden, and with it the space it keeps for the\n   notch / status bar (viewport-fit=cover). Keep that space here; the values\n   are 0 on devices without a notch. */\n:host {\n  display: block;\n  --dd-mobile-navigation-height: 2.75rem;\n  --dd-mobile-navigation-content-gap: 0.5rem;\n  margin-top: calc(-1 * var(--dd-lovelace-header-offset, 0px));\n  padding-top: env(safe-area-inset-top, 0px);\n}\n:host::before {\n  content: "";\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: env(safe-area-inset-top, 0px);\n  background: var(--primary-background-color);\n  z-index: 31;\n  pointer-events: none;\n}\n#dwains_dashboard {\n  margin: 0 auto;\n  font-family: "Open Sans", sans-serif;\n  padding-top: 10px;\n  padding-bottom: 50px;\n  padding-left: env(safe-area-inset-left, 0px);\n  padding-right: env(safe-area-inset-right, 0px);\n}\n#dwains_navigation {\n  position: sticky;\n  top: env(safe-area-inset-top, 0px);\n  z-index: 8;\n}\n\n:host([mobile-navigation]) #dwains_dashboard {\n  padding-top: 1px;\n  padding-bottom: calc(\n    var(--dd-mobile-navigation-height) +\n    var(--dd-mobile-navigation-content-gap) +\n    env(safe-area-inset-bottom)\n  );\n}\n:host([mobile-navigation]) #dwains_navigation {\n  position: fixed;\n  left: 0;\n  right: 0;\n  top: auto;\n  bottom: 0;\n  z-index: 30;\n}\n')}render(){return r.qy`
      <div id="dwains_navigation">
        <dwainsboard-navigation-card .hass=${this.hass}></dwainsboard-navigation-card>
      </div>
      <div id="dwains_dashboard">
        ${this.cards?this.cards.map(e=>r.qy`${e}`):""}
      </div>
    `}}customElements.get("dwains-dashboard-layout")||(o("dwains-dashboard-layout",d),console.info("%c DWAINS-DASHBOARD-JS \n%c Version 3.11.0","color: #2fbae5; font-weight: bold; background: black","color: white; font-weight: bold; background: dimgray"))},4576(e,t,i){"use strict";var a=i.cw(function(e,t){const{TimerOwner:i}=s();e.exports={DashboardBootstrapOwner:class{constructor({target:e,findMain:t,createDashboard:a,retryDelay:s=150,timers:r=new i,reportError:o=(e,t)=>console.error(e,t)}){this._target=e,this._findMain=t,this._createDashboard=a,this._retryDelay=s,this._timers=r,this._reportError=o,this._start=this._start.bind(this)}connect(){return this._timers.connect(),this._start()}disconnect(){this._timers.disconnect()}_start(){if(this._target.dwains_dashboard)return this.disconnect(),this._target.dwains_dashboard;let e;try{e=this._findMain()}catch(e){return this.disconnect(),void this._reportError("Failed to initialize Dwains Dashboard",e)}if(e&&e.shadowRoot){this.disconnect();try{const e=this._createDashboard();return this._target.dwains_dashboard=e,e}catch(e){return void this._reportError("Failed to initialize Dwains Dashboard",e)}}else this._timers.schedule("dashboard-bootstrap",this._start,this._retryDelay,{replace:!1})}}}}),s=()=>i(9792),r=i(4849),o=i(2330),n=i(3475),d=i(4169);const{EventSubscriptionOwner:c}=i(5179),{EventListenerOwner:l}=i(2866),{TimerOwner:h}=s(),{DashboardBootstrapOwner:p}=a(),{PopupOpenScheduler:u}=i(6138),{ReloadableLoadOwner:m}=i(5833),{websocketReadStore:g}=i(7069),{READ_MESSAGES:_}=i(5450),{resolveHass:f}=i(7610),{hassConnectionIdentity:y}=i(9187),{loadDashboardCoreSnapshot:b}=i(5768),{isDwainsRoute:v}=i(3991),{findHomeAssistantHost:w,findHomeAssistantMain:x,findLovelaceConfig:$,findLovelaceRoot:k,findLovelaceShell:C}=i(7921);function E(){return f()}class A{constructor(){this._subscriptions=new c,this._subscriptions.connect(),this._listeners=new l,this._timers=new h,this._timers.connect(),this._popupOpens=new u(this._timers,{delay:10}),this._loads=new m(e=>this._loadData(e)),this._destroyed=!1,this._locationUpdater=this.locationChanged.bind(this),this._visibilityChangeHandler=()=>{"visible"===document.visibilityState&&(this.locationChanged(),this._subscribeReload())},this._popupCardHandler=this.popupCard.bind(this),this.startDwainsDashboard().catch(e=>{console.error("Failed to start Dwains Dashboard",e)}),this._listeners.listen("location-changed",window,"location-changed",this._locationUpdater),this._listeners.listen("popstate",window,"popstate",this._locationUpdater),this._listeners.listen("visibilitychange",document,"visibilitychange",this._visibilityChangeHandler),this._listeners.connect(),this._subscribeReload()}_subscribeReload(){if(this._destroyed)return;const e=E();if(e&&e.connection){const t=y(e);Boolean(this._subscriptionConnection&&this._subscriptionConnection!==t)&&(g.markEventInvalidation(this._subscriptionHass,!1),this._subscriptions.disconnect(),this._subscriptions.connect(),this.reloadData().catch(e=>{console.error("Failed to refresh Dwains Dashboard after reconnect",e)})),this._subscriptionConnection=t,this._subscriptionHass=e,this._clearSubscriptionRetry();const i=()=>{for(const t of[_.configuration,_.navigation,_.morePages])g.invalidate(e,t)};Promise.all([...["dwains_dashboard_homepage_card_reload","dwains_dashboard_devicespage_card_reload","dwains_dashboard_navigation_card_reload","dwains_dashboard_more_pages_reload"].map(t=>this._subscriptions.subscribeEvent(`dashboard-data-${t}`,e,t,i)),this._subscriptions.subscribeEvent("dashboard-reload",e,"dwains_dashboard_reload",()=>{g.invalidate(e),this.reload().catch(e=>{console.error("Failed to process Dwains Dashboard reload",e)})}),this._subscriptions.subscribeEvent("dashboard-config-reload",e,"dwains_dashboard_config_reload",()=>{g.invalidate(e),this.reloadData().catch(e=>{console.error("Failed to reload Dwains Dashboard configuration",e)})})]).then(()=>{g.markEventInvalidation(e,!0),this.__ddSubscribeRetries=0,this.__ddSubscribeRetryExhausted=!1}).catch(t=>{g.markEventInvalidation(e,!1),console.error("Failed to subscribe to Dwains Dashboard reload events",t),this._scheduleSubscriptionRetry()})}else this._scheduleSubscriptionRetry()}_scheduleSubscriptionRetry(){if(this._destroyed||this._timers.has("subscription-retry"))return;const e=(this.__ddSubscribeRetries||0)+1;e>30?this.__ddSubscribeRetryExhausted||(console.error("Unable to subscribe to Dwains Dashboard reload events after 30 retries"),this.__ddSubscribeRetryExhausted=!0):(this.__ddSubscribeRetries=e,this._timers.schedule("subscription-retry",()=>{this._subscribeReload()},200,{replace:!1}))}_clearSubscriptionRetry(){this._timers.clear("subscription-retry")}_ensurePopupListener(){if(this._destroyed)return;const e=w();e&&e!==this._popupHost&&(this._listeners.listen("hass-more-info",e,"hass-more-info",this._popupCardHandler),this._popupHost=e)}destroy(){this._destroyed||(this._destroyed=!0,this._loads.invalidate(),this._clearSubscriptionRetry(),this._timers.disconnect(),this._subscriptions.disconnect(),this._listeners.disconnect(),g.markEventInvalidation(this._subscriptionHass,!1),this._subscriptionConnection=void 0,this._subscriptionHass=void 0,this._popupHost=void 0)}loadData(){return this._loads.load()}reloadData(){return this._loads.reload()}async _loadData({isCurrent:e=()=>!0}={}){const t=E(),i=y(t),a=await b(t,{optionalRegistries:!0});e()&&!this._destroyed&&y(E())===i&&Object.assign(this,a)}_entityDisplayName(e){const t=this.entitiesById?.get(e),i=t?.device_id?this.devicesById?.get(t.device_id):void 0;return(0,d.Hg)(E(),this.configuration,e,t,i)}locationChanged(){if(this._destroyed)return;let e=window.location.pathname;v(e)&&(this.applyDwainsTheme(),this._ensurePopupListener())}popupCard(e){if(!e.detail||!e.detail.entityId||!this.configuration)return;const t=(0,n.mD)(e.detail.entityId),i=e.currentTarget||this._popupHost;if(this.configuration.entities_popup&&this.configuration.entities_popup[e.detail.entityId])if(this.configuration.entities[e.detail.entityId]&&!this.configuration.entities[e.detail.entityId].custom_popup);else{const t=this._entityDisplayName(e.detail.entityId);this._popupOpens.schedule(()=>{this._closeMoreInfo(i),(0,r.d)(t,{input_entity:e.detail.entityId,...this.configuration.entities_popup[e.detail.entityId]},!1,"")})}else if(this.configuration.devices_popup&&this.configuration.devices_popup[t]){const a=this._entityDisplayName(e.detail.entityId);this._popupOpens.schedule(()=>{this._closeMoreInfo(i),(0,r.d)(a,{input_entity:e.detail.entityId,...this.configuration.devices_popup[t]},!1,"")})}}_closeMoreInfo(e){return e?((0,o.fireEvent)("hass-more-info",{entityId:""},e),!0):(console.error("Unable to close Home Assistant more-info: host is unavailable"),!1)}async startDwainsDashboard(){const e=await this.getLovelace();if(!this._destroyed&&e&&e.config.dwains_dashboard){if(await this.loadData(),this._destroyed)return;this._ensurePopupListener(),this.applyDwainsTheme()}}applyDwainsTheme(e){e||(this.__ddThemeRetries=0);const t=this.getRoot(),i=C(t);i?(this.__ddThemeRetries=0,(0,n.QD)(i.view,{themes:{"dwains-theme":{"ha-card-border-radius":"0.75rem"}}},"dwains-theme",!0)):(this.__ddThemeRetries=(this.__ddThemeRetries||0)+1)<=20&&this._timers.schedule("apply-theme",()=>this.applyDwainsTheme(!0),150)}async reload(){if(this.__ddReloading)this.__ddReloadAgain=!0;else{this.__ddReloading=!0;try{do{this.__ddReloadAgain=!1,await this._softReload()}while(this.__ddReloadAgain)}finally{this.__ddReloading=!1}}}async _softReload(){try{await this.reloadData()}catch(e){console.error("Failed to reload Dwains Dashboard data",e)}this.applyDwainsTheme()}async getLovelace(){let e;for(;!e&&!this._destroyed;)if(e=$(),!e){if(!await this._timers.delay("lovelace-poll",500))return}return e}getRoot(){return k()}}new p({target:window,findMain:x,createDashboard:()=>new A}).connect()},5041(e,t,i){"use strict";var a=()=>i(9823),s=()=>i(1055),r=i(3196),o=i(3475),n=i(9165),d=i(6684),c=i(1621),l=i(4169),h=i(216);const p=[d.AH`
    :host {
      display: block;
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
      max-width: 100%;
    }
    .dd-overview-grid {
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
      max-width: 100%;
    }
    @media (max-width: 599px) {
      .w-full {
        box-sizing: border-box;
        max-width: 100%;
      }
      .grid.dd-overview-grid > * {
        min-width: 0;
        max-width: 100%;
      }
    }
    .card-actions {
      text-align: right;
    }
    .card-actions-multiple {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0.5rem;
    }
    .sortable-move {
      cursor: -webkit-grabbing;
      cursor: grab;
      margin: auto 0;
    }
    .device-button .info ha-icon, .ha-icon ha-icon {
      display: inline-block;
      margin: auto;
      --mdc-icon-size: 100% !important;
      --iron-icon-width: 100% !important;
      --iron-icon-height: 100% !important;
    }
    #badges {
      cursor: pointer;
      background: var( --ha-card-background, var(--card-background-color, white) );
      box-shadow: var( --ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12) );
      color: var(--primary-text-color);
    }
    .break-words {
      overflow-wrap: break-word;
    }
    .device-button {
      cursor: pointer;
      background: var( --ha-card-background, var(--card-background-color, white) );
      border-radius: var(--ha-card-border-radius, 4px);
      box-shadow: var( --ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12) );
      color: var(--primary-text-color);
    }
    @media (min-width: 1024px) {
      .device-button.current {
        background: transparent;
        z-index: 1;
        position: relative;
      }
      .device-button.current::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: .12;
        z-index: -1;
        background: var(--sidebar-selected-icon-color);
        border-radius: var(--ha-card-border-radius, 4px);
      }
    }
    /*styling tailwind dwains version*/
    *, ::after, ::before {
      box-sizing: border-box;
    }
    h1,h2,h3 {
      margin: 0;
    }
    h3 {
      font-size: 1em;
    }
    .absolute {
      position: absolute
    }
    .relative {
        position: relative
    }
    .sticky {
        position: -webkit-sticky;
        position: sticky
    }
    .top-0 {
        top: 0px
    }
    .bottom-0 {
        bottom: 0px
    }
    .z-30 {
        z-index: 7;
    }
    .col-span-1 {
        grid-column: span 1 / span 1
    }
    .col-span-2 {
        grid-column: span 2 / span 2
    }
    .row-span-1 {
        grid-row: span 1 / span 1
    }
    .row-span-2 {
        grid-row: span 2 / span 2
    }
    .my-4 {
        margin-top: 1rem;
        margin-bottom: 1rem
    }
    .mx-auto {
      margin-left: auto;
      margin-right: auto
    }
    .mb-2 {
        margin-bottom: 0.5rem
    }
    .mb-4 {
        margin-bottom: 1rem
    }
    .mt-4 {
        margin-top: 1rem
    }
    .mr-0\.5 {
        margin-right: 0.125rem
    }
    .mr-0 {
        margin-right: 0px
    }
    .mb-12 {
        margin-bottom: 3rem
    }
    .mb-5 {
        margin-bottom: 1.25rem
    }
    .mb-16 {
        margin-bottom: 4rem
    }
    .ml-4 {
        margin-left: 1rem
    }
    .block {
        display: block
    }
    .inline-block {
        display: inline-block
    }
    .flex {
        display: flex
    }
    .inline-flex {
        display: inline-flex
    }
    .grid {
        display: grid
    }
    .hidden {
        display: none
    }
    .h-6 {
        height: 1.5rem
    }
    .h-44 {
        height: 11rem
    }
    .h-full {
        height: 100%
    }
    .h-14 {
        height: 3.5rem
    }
    .h-8 {
        height: 2rem
    }
    .w-full {
        width: 100%
    }
    .w-6 {
        width: 1.5rem
    }
    .w-14 {
        width: 3.5rem
    }
    .w-8 {
        width: 2rem
    }
    .w-12 {
      width: 3rem
    }
    .cursor-pointer {
        cursor: pointer
    }
    .grid-flow-row-dense {
        grid-auto-flow: row dense
    }
    .grid-cols-1 {
        grid-template-columns: repeat(1, minmax(0, 1fr))
    }
    .grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr))
    }
    .flex-wrap {
        flex-wrap: wrap
    }
    .content-between {
        align-content: space-between
    }
    .items-center {
        align-items: center
    }
    .justify-between {
        justify-content: space-between
    }
    .gap-4 {
        gap: 1rem
    }
    .space-y-0.5 > :not([hidden]) ~ :not([hidden]) {
        --tw-space-y-reverse: 0;
        margin-top: calc(0.125rem * calc(1 - var(--tw-space-y-reverse)));
        margin-bottom: calc(0.125rem * var(--tw-space-y-reverse))
    }
    .space-y-0 > :not([hidden]) ~ :not([hidden]) {
        --tw-space-y-reverse: 0;
        margin-top: calc(0px * calc(1 - var(--tw-space-y-reverse)));
        margin-bottom: calc(0px * var(--tw-space-y-reverse))
    }
    .rounded {
        border-radius: 0.25rem
    }
    .rounded-md {
        border-radius: 0.375rem
    }
    .bg-gray-800 {
        --tw-bg-opacity: 1;
        background-color: rgb(31 41 55 / var(--tw-bg-opacity))
    }
    .rounded-lg {
      border-radius: 0.5rem
    }
    .border-2 {
        border-width: 2px
    }
    .border-dashed {
        border-style: dashed
    }
    .border-gray-300 {
        --tw-border-opacity: 1;
        border-color: rgb(209 213 219 / var(--tw-border-opacity))
    }
    .bg-gray-800 {
        --tw-bg-opacity: 1;
        background-color: rgb(31 41 55 / var(--tw-bg-opacity))
    }
    .bg-opacity-50 {
        --tw-bg-opacity: 0.5
    }
    .p-2 {
      padding: 0.5rem;
    }
    .p-4 {
        padding: 1rem
    }
    .p-1 {
        padding: 0.25rem
    }
    .p-3 {
        padding: 0.75rem
    }
    .px-1 {
        padding-left: 0.25rem;
        padding-right: 0.25rem
    }
    .p-12 {
      padding: 3rem
    }
    .py-0\.5 {
        padding-top: 0.125rem;
        padding-bottom: 0.125rem
    }
    .py-0 {
        padding-top: 0px;
        padding-bottom: 0px
    }
    .text-center {
      text-align: center
    }
    .text-right {
        text-align: right
    }
    .text-xl {
        font-size: 1.5rem;
        line-height: 2rem
    }
    .text-lg {
        font-size: 1.125rem;
        line-height: 1.75rem
    }
    .text-sm {
        font-size: 0.875rem;
        line-height: 1.25rem
    }
    .text-xs {
        font-size: 0.75rem;
        line-height: 1rem
    }
    .font-semibold {
        font-weight: 600
    }
    .font-medium {
        font-weight: 500
    }
    .capitalize {
        text-transform: capitalize
    }
    .text-gray {
      color: var(--paper-item-body-secondary-color, var(--secondary-text-color));
    }
    .text-white {
        --tw-text-opacity: 1;
        color: rgb(255 255 255 / var(--tw-text-opacity))
    }
    @media (min-width: 768px) {
        .md-grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr))
        }
    }
    @media (min-width: 1024px) {
        .lg-col-span-1 {
            grid-column: span 1 / span 1
        }
        .lg-col-span-3 {
            grid-column: span 3 / span 3
        }
        .lg-col-span-2 {
            grid-column: span 2 / span 2
        }
        .lg-row-span-1 {
            grid-row: span 1 / span 1
        }
        .lg-row-span-3 {
            grid-row: span 3 / span 3
        }
        .lg-row-span-2 {
            grid-row: span 2 / span 2
        }
        .lg-block {
            display: block
        }
        .lg-hidden {
            display: none
        }
        .lg-w-1-2 {
            width: 50%
        }
        .lg-grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr))
        }
        .lg-grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr))
        }
        .lg-grid-cols-4 {
          grid-template-columns: repeat(4, minmax(0, 1fr))
        }
    }
    @media (min-width: 1536px) {
      .xl-col-span-1 {
          grid-column: span 1 / span 1
      }
      .xl-col-span-4 {
          grid-column: span 4 / span 4
      }
      .xl-col-span-2 {
          grid-column: span 2 / span 2
      }
      .xl-row-span-1 {
          grid-row: span 1 / span 1
      }
      .xl-row-span-4 {
          grid-row: span 4 / span 4
      }
      .xl-row-span-2 {
          grid-row: span 2 / span 2
      }
      .xl-w-1-3 {
          width: 33.333333%
      }
      .xl-w-2-3 {
          width: 66.666667%
      }
      .xl-grid-cols-4 {
          grid-template-columns: repeat(4, minmax(0, 1fr))
      }
      .xl-grid-cols-5 {
        grid-template-columns: repeat(5, minmax(0, 1fr))
      }
  }
  `,(0,h.Ve)(d.AH),(0,h.md)(d.AH),(0,h.ww)(d.AH)];var u=i(4849),m=i(2330);const{loadSortable:g}=i(4725),{closeParentDropdown:_}=a(),{entitySettingsFromConfiguration:f}=s(),y=e=>class extends e{_addLovelaceCard(e){_(e),e.stopPropagation();const t=e.currentTarget.domain,i=e.currentTarget.position;this._popupOpens.schedule(()=>{(0,m.fireEvent)("hass-more-info",{entityId:""},this),(0,u.d)((0,c.A)(this._hass,"device.add_card_to")+t,{type:"custom:dwains-create-custom-card-card",domain:t,position:i,page:"devices"},!0,"")})}_handleEntityEditClick(e){_(e),e.stopPropagation();const t=e.currentTarget.entity,i=f(this.configuration,t),a={};for(const t of Object.keys(i))a[t]=e.currentTarget[t]??i[t];this._openEntitySettings(a)}_handleUnavailableEntityEditClick(e){_(e),e.stopPropagation(),this._openEntitySettings(f(this.configuration,e.currentTarget.entity))}_openEntitySettings(e){this._popupOpens.schedule(()=>{(0,m.fireEvent)("hass-more-info",{entityId:""},this),(0,u.d)((0,c.A)(this._hass,"entity.edit_entity"),{type:"custom:dwains-edit-entity-card",...e},!1,"")})}_handleEntityEditCardClick(e){_(e),e.stopPropagation();const t=e.currentTarget.entity;let i,a;if(this.configuration.entity_cards&&this.configuration.entity_cards[t]){const e=this._entityDisplayName(t);i={input_name:e,input_entity:t,...this.configuration.entity_cards[t]},a="editor-element"}this._popupOpens.schedule(()=>{(0,m.fireEvent)("hass-more-info",{entityId:""},this),(0,u.d)((0,c.A)(this._hass,"entity.edit_entity_card"),{type:"custom:dwains-edit-entity-card-card",entity_id:t,cardConfig:i,mode:a,existingCardEdit:!!i},!0,"")})}_handleEntityEditPopupClick(e){_(e),e.stopPropagation();const t=e.currentTarget.entity;let i,a;if(this.configuration.entities_popup&&this.configuration.entities_popup[t]){const e=this._entityDisplayName(t);i={input_name:e,input_entity:t,...this.configuration.entities_popup[t]},a="editor-element"}this._popupOpens.schedule(()=>{(0,m.fireEvent)("hass-more-info",{entityId:""},this),(0,u.d)((0,c.A)(this._hass,"entity.edit_entity_popup_card"),{type:"custom:dwains-edit-entity-popup-card",entity_id:t,cardConfig:i,mode:a,existingCardEdit:!!i},!0,"")})}_handleDeviceEditClick(e){_(e),e.stopPropagation();const t=e.currentTarget.device,i=e.currentTarget.device_icon,a=e.currentTarget.showInNavbar;this._popupOpens.schedule(()=>{(0,m.fireEvent)("hass-more-info",{entityId:""},this),(0,u.d)((0,c.A)(this._hass,"device.edit_device_button"),{type:"custom:dwains-edit-device-button-card",device:t,icon:i,showInNavbar:a},!1,"")})}_handleCustomCardEditClick(e){_(e),e.stopPropagation();const t=e.currentTarget.domain,i=e.currentTarget.filename,a=e.currentTarget.colSpan,s=e.currentTarget.rowSpan,r=e.currentTarget.colSpanLg,o=e.currentTarget.rowSpanLg,n=e.currentTarget.colSpanXl,d=e.currentTarget.rowSpanXl,c=structuredClone(this.configuration.device_cards[t][i]);let l="top";c.position&&(l=c.position,delete c.position),delete c.col_span,delete c.row_span,delete c.col_span_lg,delete c.row_span_lg,delete c.col_span_xl,delete c.row_span_xl,this._popupOpens.schedule(()=>{(0,m.fireEvent)("hass-more-info",{entityId:""},this),(0,u.d)(this._hass.localize("ui.components.entity.entity-picker.edit"),{type:"custom:dwains-create-custom-card-card",domain:t,page:"devices",mode:"editor-element",cardConfig:c,position:l,filename:i,colSpan:a,rowSpan:s,colSpanLg:r,rowSpanLg:o,colSpanXl:n,rowSpanXl:d},!0,"")})}_saveEntityBoolValue(e,t,i){return this._hass.callWS({type:"dwains_dashboard/edit_entity_bool_value",entityId:e,key:t,value:i}).catch(e=>{console.error("Failed to update entity setting:",e)})}_handleEntityEditBoolValueClick(e){_(e),e.stopPropagation(),this._saveEntityBoolValue(e.currentTarget.entity,e.currentTarget.key,e.currentTarget.ddValue)}_handleEntityAreaVisibilityClick(e,t,i){_(e),e.stopPropagation(),this._saveEntityBoolValue(t,"hidden_in_area",i)}_handleDeviceEditBoolValueClick(e){_(e),e.stopPropagation();const t=e.currentTarget.device,i=e.currentTarget.key,a=e.currentTarget.ddValue;this._hass.callWS({type:"dwains_dashboard/edit_device_bool_value",device:t,key:i,value:a}).catch(e=>console.error("Message failed!",e))}_handleDeviceEditCardClick(e){_(e),e.stopPropagation();const t=e.currentTarget.domain;let i,a;this.configuration.devices_card&&this.configuration.devices_card[t]&&(i=this.configuration.devices_card[t],a="current-selected-blueprint"),this._popupOpens.schedule(()=>{(0,m.fireEvent)("hass-more-info",{entityId:""},this),(0,u.d)((0,c.A)(this._hass,"device.edit_device_card")+(0,c.A)(this._hass,"device."+t),{type:"custom:dwains-edit-device-card-card",domain:t,cardConfig:i,existingCardEdit:!!i,mode:a},!0,"")})}_handleDeviceEditPopupClick(e){_(e),e.stopPropagation();const t=e.currentTarget.domain;let i,a;this.configuration.devices_popup&&this.configuration.devices_popup[t]&&(i=this.configuration.devices_popup[t],a="current-selected-blueprint"),this._popupOpens.schedule(()=>{(0,m.fireEvent)("hass-more-info",{entityId:""},this),(0,u.d)((0,c.A)(this._hass,"device.edit_device_popup")+(0,c.A)(this._hass,"device."+t),{type:"custom:dwains-edit-device-popup-card",domain:t,cardConfig:i,existingCardEdit:!!i,mode:a},!0,"")})}_deviceButtonMoved(e){this._hass.callWS({type:"dwains_dashboard/sort_device_button",sortData:JSON.stringify(this._sortable.toArray())}).catch(e=>console.error("Message failed!",e))}_handleDeviceEditModeClicked(e){_(e),e.stopPropagation();const t=e.currentTarget.ddValue;t?this._attachSortables("#sortable","data-device",()=>this.deviceEditMode,e=>this._deviceButtonMoved(e)):this._destroySortables(),this.deviceEditMode=t}_handleDeviceViewEditModeClicked(e){_(e),e.stopPropagation();const t=e.currentTarget.ddValue;if(t){const e=this._hass,t=this.deviceViewDisplayGrouped?"devices_grouped_sort_order":"devices_sort_order";this._attachSortables(".sortable","data-entity",()=>this.deviceViewEditMode,function(){e.callWS({type:"dwains_dashboard/sort_entity",sortData:JSON.stringify(this.toArray()),sortType:t}).catch(e=>console.error("Message failed!",e))})}else this._destroySortables();this.deviceViewEditMode=t}async _attachSortables(e,t,i,a){let s;try{s=await g()}catch(e){return void console.error("Dwains Dashboard: failed to load drag and drop (reload the page after an update)",e)}i()&&(this._destroySortables(),this._sortable=[...this.shadowRoot.querySelectorAll(e)].map(e=>new s(e,{forceFallback:!0,animation:150,dataIdAttr:t,handle:".sortable-move",onEnd:a})))}_destroySortables(){this._sortable&&(this._sortable.forEach(e=>e.destroy()),this._sortable=void 0)}};var b=i(5890);const v=e=>class extends e{_renderDeviceButtonCard(e,t){return d.qy`
        <div>
          <ha-card class="p-2">
            <span class="break-words">
            ${(0,c.A)(this._hass,"device."+e)}
            </span>
          </ha-card>
          <ha-card>
            <div class="card-actions">
              <ha-button
                .device="${e}"
                .key=${"hidden"}
                .ddValue=${!1}
                @click=${this._handleDeviceEditBoolValueClick}
              >
                ${(0,c.A)(this._hass,"device.unhide")}
              </ha-button>
            </div>
          </ha-card>
        </div>
      `}_renderDeviceButton(e){const t=e.domain||"unknown",i=this.configuration.devices[t]&&this.configuration.devices[t].icon?this.configuration.devices[t].icon:b.Su[t]?b.Su[t]:b.Su.unknown;return d.qy`
    <div class="relative" data-device='${t}'>
      <div
        class="flex justify-between h-44 p-3 device-button ${this.selectedDevice!=t||this.configuration.homepage_header.v2_mode?"":"current"}"
        data-device=${t}
        @click=${this._handleDeviceClick}
      >
        <div class="h-full flex flex-wrap content-between">
          <div class="w-full ha-icon">
            ${i?d.qy`
              <ha-icon
                class="h-14 w-14"
                style="color: var(--primary-color);"
                .icon=${i}
              ></ha-icon>`:""}
          </div>
          <div class="w-full">
            <h3 class="font-semibold text-lg capitalize">${(0,c.A)(this._hass,"device."+t)}</h3>
          </div>
        </div>
            <div class="row-span-2 text-right space-y-0.5 info">

            </div>
          </div>
          ${this.deviceEditMode?d.qy`
            <ha-card>
              <div class="card-actions-multiple">
                <div class="sortable-move">
                  <ha-icon
                    .icon=${"mdi:cursor-move"}
                  >
                  </ha-icon>
                </div>
                <ha-dropdown
                  class="ha-icon-overflow-menu-overflow"
                  placement="bottom-end"
                >
                  <ha-icon-button
                    label=${this._hass.localize("ui.common.overflow_menu")}
                    .path=${n.TdJ}
                    slot="trigger"
                  ></ha-icon-button>
                    <ha-dropdown-item
                  .device=${t}
                  .device_icon=${i}
                  .showInNavbar=${this.configuration.devices[t]&&this.configuration.devices[t].show_in_navbar?this.configuration.devices[t].show_in_navbar:""}
                  @click=${this._handleDeviceEditClick}
                    >
                      <ha-icon slot="icon" .icon=${"mdi:cog"}></ha-icon>
                      ${this._hass.localize("ui.components.entity.entity-picker.edit")}
                    </ha-dropdown-item>

                    <ha-dropdown-item
                  .domain=${t}
                  @click="${this._handleDeviceEditCardClick}"
                    >
                      <ha-icon slot="icon" .icon=${"mdi:pencil"}></ha-icon>
                      ${(0,c.A)(this._hass,"entity.entity_card")}
                    </ha-dropdown-item>
                    <ha-dropdown-item
                  .domain=${t}
                  @click="${this._handleDeviceEditPopupClick}"
                    >
                      <ha-icon slot="icon" .icon=${"mdi:pencil-box-multiple"}></ha-icon>
                      ${(0,c.A)(this._hass,"entity.popup_card")}
                    </ha-dropdown-item>
                    <ha-dropdown-item
                  .device=${t}
                  .key=${"hidden"}
                      .ddValue=${!0}
                      @click=${this._handleDeviceEditBoolValueClick}
                    >
                      <ha-icon slot="icon" .icon=${"mdi:eye-off"}></ha-icon>
                      ${(0,c.A)(this._hass,"device.hide")}
                    </ha-dropdown-item>
                </ha-dropdown>
              </div>
            </ha-card>
            `:""}
        </div>
      `}_hideUnavailableEntitiesEnabled(){return!!(this.configuration&&this.configuration.homepage_header&&this.configuration.homepage_header.hide_unavailable_entities)}_filterUnavailableCards(e){return this.deviceViewEditMode||!this._hideUnavailableEntitiesEnabled()?e:e.filter(e=>{const t=this._hass.states[e.entity];return!(t&&"unavailable"===t.state)})}_renderDeviceViewCards(e){const t=this._filterUnavailableCards(e.cards);if(this.deviceViewDisplayGrouped&&"person"!=e.domain&&"weather"!=e.domain&&"alarm_control_panel"!=e.domain){t.sort(function(e,t){let i=e.grouped_sort_order,a=t.grouped_sort_order;return i==a?0:i>a?1:-1});let e=t.reduce((e,t)=>(e[t.area.area_id]=[...e[t.area.area_id]||[],t],e),{}),i=Object.keys(e).sort((e,t)=>{let i=this.configuration.areas[e]&&this.configuration.areas[e].sort_order?this.configuration.areas[e]:1,a=this.configuration.areas[t]&&this.configuration.areas[t].sort_order?this.configuration.areas[t]:1;return i==a?0:i>a?1:-1});return d.qy`
        <div>
        ${i.map(t=>d.qy`
            <div class="mb-5">
              <h3 class="font-semibold capitalize text-gray">${e[t][0].area.name}</h3>
              <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 xl-grid-cols-4 gap-4 sortable">
              ${Object.entries(e[t]).map(([e,t])=>d.qy`${this._renderDeviceViewCard(t)}`)}
              </div>
            </div>
          `)}
        </div>
        `}return t.sort(function(e,t){let i=e.sort_order,a=t.sort_order;return i==a?0:i>a?1:-1}),d.qy`
	            <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 xl-grid-cols-4 gap-4 sortable">
	              ${t.map(e=>d.qy`${this._renderDeviceViewCard(e)}`)}
	            </div>
	            `}},{closeParentDropdown:w}=a(),{entityRecoveryActions:x}=s(),$=e=>class extends e{_renderEntityAreaVisibilityAction(e){const t=!0===this.configuration?.entities?.[e]?.hidden_in_area;return d.qy`
        <ha-dropdown-item
          @click=${i=>this._handleEntityAreaVisibilityClick(i,e,!t)}
        >
          <ha-icon slot="icon" .icon=${t?"mdi:eye":"mdi:eye-off"}></ha-icon>
          ${(0,c.A)(this._hass,t?"entity.unhide_in_area":"entity.hide_in_area")}
        </ha-dropdown-item>
      `}_renderDeviceViewCard(e){return d.qy`
      <div
        data-entity='${e.entity}'
        class="col-span-${e.colSpan} row-span-${e.rowSpan} lg-col-span-${e.colSpanLg} lg-row-span-${e.rowSpanLg} xl-col-span-${e.colSpanXl} xl-row-span-${e.rowSpanXl} relative"
      >
	            <div>
	              <span class="hidden">${(0,c.A)(this._hass,"device."+e.domain)}<br></span>
	              <dd-lazy-card .card=${e.card} .cardFactory=${e.cardFactory} .hass=${this._hass}></dd-lazy-card>
	            </div>
        ${this.deviceViewEditMode?d.qy`
        <ha-card>
          <div class="card-actions-multiple">
            <div class="sortable-move">
              <ha-icon
                .icon=${"mdi:cursor-move"}
              >
              </ha-icon>
            </div>
            <ha-dropdown
              class="ha-icon-overflow-menu-overflow"
              placement="bottom-end"
            >
              <ha-icon-button
                label=${this._hass.localize("ui.common.overflow_menu")}
                .path=${n.TdJ}
                slot="trigger"
              ></ha-icon-button>
                <ha-dropdown-item
                  .entity="${e.entity}"
                  .friendlyName="${e.friendlyName}"
                  .disableEntity=${e.disableEntity}
                  .hideEntity=${e.hideEntity}
                  .excludeEntity=${e.excludeEntity}
                  .rowSpan=${e.rowSpan}
                  .colSpan=${e.colSpan}
                  .rowSpanLg=${e.rowSpanLg}
                  .colSpanLg=${e.colSpanLg}
                  .rowSpanXl=${e.rowSpanXl}
                  .colSpanXl=${e.colSpanXl}
                  .customCard=${e.customCard}
                  .customPopup=${e.customPopup}
                  @click=${this._handleEntityEditClick}
                >
                  <ha-icon slot="icon" .icon=${"mdi:cog"}></ha-icon>
                  ${(0,c.A)(this._hass,"entity.settings")}
                </ha-dropdown-item>
                ${"t"!=e.entity?d.qy`
                  <ha-dropdown-item
                    .entity="${e.entity}"
                    @click="${this._handleEntityEditCardClick}"
                  >
                    <ha-icon slot="icon" .icon=${"mdi:pencil"}></ha-icon>
                    ${(0,c.A)(this._hass,"entity.entity_card")}
                  </ha-dropdown-item>`:""}
                ${"t"!=e.entity?d.qy`
                  <ha-dropdown-item
                    .entity="${e.entity}"
                    @click="${this._handleEntityEditPopupClick}"
                  >
                    <ha-icon slot="icon" .icon=${"mdi:pencil-box-multiple"}></ha-icon>
                    ${(0,c.A)(this._hass,"entity.popup_card")}
                  </ha-dropdown-item>`:""}
                <ha-dropdown-item
                  .entity="${e.entity}"
                  .key=${"excluded"}
                  .ddValue=${!0}
                  @click=${this._handleEntityEditBoolValueClick}
                >
                  <ha-icon slot="icon" .icon=${"mdi:table-eye-off"}></ha-icon>
                  ${(0,c.A)(this._hass,"entity.exclude")}
                </ha-dropdown-item>
                <ha-dropdown-item
                  .entity="${e.entity}"
                  .key=${"hidden"}
                  .ddValue=${!0}
                  @click=${this._handleEntityEditBoolValueClick}
                >
                  <ha-icon slot="icon" .icon=${"mdi:eye-off"}></ha-icon>
                  ${(0,c.A)(this._hass,"entity.hide")}
                </ha-dropdown-item>
                ${this._renderEntityAreaVisibilityAction(e.entity)}
                <ha-dropdown-item
                  .entity="${e.entity}"
                  .key=${"disabled"}
                  .ddValue=${!0}
                  @click=${this._handleEntityEditBoolValueClick}
                >
                  <ha-icon slot="icon" .icon=${"mdi:tray-remove"}></ha-icon>
                  ${(0,c.A)(this._hass,"entity.disable")}
                </ha-dropdown-item>
            </ha-dropdown>
          </div>
        </ha-card>`:""}
      </div>
      `}_renderDeviceViewCustomCards(e,t){return d.qy`
      <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 xl-grid-cols-4 gap-4 my-4">
        ${"bottom"==t?e.customCardsBottom.map(e=>d.qy`${this._renderDeviceViewCustomCard(e)}`):e.customCardsTop.map(e=>d.qy`${this._renderDeviceViewCustomCard(e)}`)}
      </div>
      `}_renderDeviceViewCustomCard(e){return d.qy`
	          <div class="col-span-${e.colSpan} row-span-${e.rowSpan} lg-col-span-${e.colSpanLg} lg-row-span-${e.rowSpanLg} xl-col-span-${e.colSpanXl} xl-row-span-${e.rowSpanXl} relative">
	            <div>
	              <dd-lazy-card .card=${e.card} .cardFactory=${e.cardFactory} .hass=${this._hass}></dd-lazy-card>
	            </div>
        ${this.deviceViewEditMode?d.qy`
        <ha-card>
          <div class="card-actions">
            <ha-button
              @click=${this._handleCustomCardEditClick}
              .domain=${e.domain}
              .filename=${e.filename}
              .rowSpan=${e.rowSpan}
              .colSpan=${e.colSpan}
              .rowSpanLg=${e.rowSpanLg}
              .colSpanLg=${e.colSpanLg}
              .rowSpanXl=${e.rowSpanXl}
              .colSpanXl=${e.colSpanXl}
            >
              ${this._hass.localize("ui.components.entity.entity-picker.edit")}
            </ha-button>
          </div>
        </ha-card>`:""}
      </div>
      `}_handleDeviceViewDisplayGroupedClicked(e){w(e),e.stopPropagation();const t=e.currentTarget.ddValue;this.deviceViewDisplayGrouped=t,r.O.set("dwains_dashboard_deviceViewDisplayGrouped",t)}_renderAreaViewEntityCard(e,t){const i=x(this.configuration,e,t);return d.qy`
        <div>
          <ha-card class="p-2">
            ${(0,c.A)(this._hass,"entity.title")}:<br>
            <span class="break-words">
            ${e}
            </span>
          </ha-card>
          <ha-card>
            <div class="card-actions">
              ${i.map(t=>d.qy`
                <ha-button
                  .entity="${e}"
                  .key=${t.key}
                  .ddValue=${!1}
                  @click=${this._handleEntityEditBoolValueClick}
                >
                  ${(0,c.A)(this._hass,t.translationKey)}
                </ha-button>
              `)}
              <ha-button
                .entity="${e}"
                @click=${this._handleUnavailableEntityEditClick}
              >
                <ha-svg-icon .path=${n.CZ3}></ha-svg-icon>
                ${(0,c.A)(this._hass,"entity.settings")}
              </ha-button>
            </div>
          </ha-card>
        </div>
      `}_renderDeviceView(e){if(this.selectedDevice!=e.domain)return d.qy``;const t=this.selectedDevice==e.domain?"block":"hidden";return d.qy`
          <div class="w-full mb-12 ${t}" id="${e.domain}">
            <div class="dd-detail-view-header flex justify-between">
              <div class="dd-detail-view-title">
                <h2 class="font-semibold text-lg capitalize">
                  ${(0,c.A)(this._hass,"device."+e.domain)}
                </h2>
                <span class="text-gray">
                  ${e.cards.length} ${(0,c.A)(this._hass,"entity.title_plural")}
                </span>
              </div>
              <div>
                <ha-dropdown
                  class="ha-icon-overflow-menu-overflow"
                  placement="bottom-end"
                >
                  <ha-icon-button
                    label=${this._hass.localize("ui.common.overflow_menu")}
                    .path=${n.TdJ}
                    slot="trigger"
                  ></ha-icon-button>
                    ${this.deviceViewDisplayGrouped?d.qy`
                      <ha-dropdown-item
                        .ddValue=${!1}
                        .key=${"deviceViewDisplayGrouped"}
                        @click="${this._handleDeviceViewDisplayGroupedClicked}"
                      >
                        <ha-icon slot="icon" .icon=${"mdi:grid"}></ha-icon>
                        ${(0,c.A)(this._hass,"device.ungroup")}
                      </ha-dropdown-item>
                      `:d.qy`
                      <ha-dropdown-item
                        .ddValue=${!0}
                        .key=${"deviceViewDisplayGrouped"}
                        @click="${this._handleDeviceViewDisplayGroupedClicked}"
                      >
                        <ha-icon slot="icon" .icon=${"mdi:format-list-group"}></ha-icon>
                        ${(0,c.A)(this._hass,"device.group")}
                      </ha-dropdown-item>`}
                    ${this._hass.user.is_admin?d.qy`
                      ${this.deviceViewEditMode?d.qy`
                        <ha-dropdown-item
                          .ddValue=${!1}
                          @click=${this._handleDeviceViewEditModeClicked}
                        >
                          <ha-svg-icon slot="icon" .path=${n.CZ3}></ha-svg-icon>
                          ${(0,c.A)(this._hass,"global.disable_edit_mode")}
                        </ha-dropdown-item>`:d.qy`
                        <ha-dropdown-item
                          .ddValue=${!0}
                          @click=${this._handleDeviceViewEditModeClicked}
                        >
                          <ha-svg-icon slot="icon" .path=${n.CZ3}></ha-svg-icon>
                          ${(0,c.A)(this._hass,"global.enable_edit_mode")}
                        </ha-dropdown-item>
                        `}
                    `:""}
                </ha-dropdown>
              </div>
            </div>
            ${this.deviceViewEditMode?d.qy`
            <button type="button"
              @click=${this._addLovelaceCard}
              .domain=${e.domain}
              .position=${"top"}
              class="cursor-pointer my-4 relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg class="mx-auto h-12 w-12 text-gray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
              <span class="mt-2 block text-sm font-medium text-gray">
                ${this._hass.localize("ui.panel.lovelace.editor.edit_card.add")}
              </span>
            </button>`:""}

            ${this._renderDeviceViewCustomCards(e,"top")}

            ${this._renderDeviceViewCards(e)}

            ${this._renderDeviceViewCustomCards(e,"bottom")}

            ${this.deviceViewEditMode?d.qy`
              ${e.entitiesNoState.length?d.qy`
                <div class="mb-5">
                  <h3 class="font-semibold capitalize text-gray">${(0,c.A)(this._hass,"entity.unavailable")}</h3>
                  <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 gap-4">
                  ${e.entitiesNoState.map(e=>d.qy`${this._renderAreaViewEntityCard(e,"noState")}`)}
                  </div>
                </div>`:""}
              ${e.entitiesHidden.length?d.qy`
                <div class="mb-5">
                  <h3 class="font-semibold capitalize text-gray">${(0,c.A)(this._hass,"entity.hidden")}</h3>
                  <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 gap-4">
                  ${e.entitiesHidden.map(e=>d.qy`${this._renderAreaViewEntityCard(e,"hidden")}`)}
                  </div>
                </div>`:""}
              ${e.entitiesDisabled.length?d.qy`
                <div class="mb-5">
                  <h3 class="font-semibold capitalize text-gray">${(0,c.A)(this._hass,"entity.disabled")}</h3>
                  <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 gap-4">
                  ${e.entitiesDisabled.map(e=>d.qy`${this._renderAreaViewEntityCard(e,"disabled")}`)}
                  </div>
                </div>`:""}
            `:""}

            ${this.deviceViewEditMode?d.qy`
            <button type="button"
              @click=${this._addLovelaceCard}
              .domain=${e.domain}
              .position=${"bottom"}
              class="cursor-pointer my-4 relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg class="mx-auto h-12 w-12 text-gray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
              <span class="mt-2 block text-sm font-medium text-gray">
                ${this._hass.localize("ui.panel.lovelace.editor.edit_card.add")}
              </span>
            </button>`:""}
          </div>`}},{EventSubscriptionOwner:k}=i(5179),{EventListenerOwner:C}=i(2866),{TimerOwner:E}=i(9792),{PopupOpenScheduler:A}=i(6138),{ReloadableLoadOwner:S}=i(5833),{hassConnectionIdentity:D,hasHassConnectionChanged:q}=i(9187),{websocketReadStore:O}=i(7069),{loadDashboardRegistrySnapshot:H}=i(5768),{registryOrderedEntityUnion:T}=i(6037),{resolveHass:z}=i(7610),{loadCardHelpers:P}=i(393),{defineDwainsElement:M}=i(1415),{attachDeferredCard:R}=i(2815);const j=new Set(["person","weather","alarm_control_panel"]);class V extends($(v(y(d.WF)))){static get properties(){return{data:{},selectedDevice:{},deviceEditMode:{},deviceViewDisplayGrouped:{},deviceViewEditMode:{}}}constructor(){super(),this._subscriptions=new k,this._listeners=new C,this._timers=new E,this._popupOpens=new A(this._timers),this._loads=new S(e=>this._loadConfiguration(e)),this._locationChangedHandler=()=>this._syncSelectedDeviceFromLocation(),this._listeners.listen("location-changed",window,"location-changed",this._locationChangedHandler),this._startedHass=void 0}async loadHelpers(){return P()}_entityDisplayName(e,t){const i=t||this.entitiesById?.get(e),a=i?.device_id?this.devicesById?.get(i.device_id):void 0;return(0,l.Hg)(this._hass,this.configuration,e,i,a)}set hass(e){const t=q(this._hass,e);this._hass=e,this.startedUp&&this._update_hass(e),t&&this.isConnected&&(this._subscriptions.disconnect(),this._subscriptions.connect()),this._startIfReady(t)}_update_hass(e){if(this._hass=e,null==this.data||0===this.data.length)return;if(Object.values(this.data).map(t=>{t.domain==this.selectedDevice&&(t.cards.forEach(t=>{t.card&&(t.card.hass=e)}),t.customCardsTop.forEach(t=>{t.card&&(t.card.hass=e)}),t.customCardsBottom.forEach(t=>{t.card&&(t.card.hass=e)}))}),this.timeout)return void(this._pendingHassUpdate=!0);this.timeout=!0,this._pendingHassUpdate=!1;void 0===this._timers.schedule("hass-update-throttle",()=>{this.timeout=!1,this._pendingHassUpdate&&(this._pendingHassUpdate=!1,this.requestUpdate())},100)&&(this.timeout=!1,this._pendingHassUpdate=!1),this.requestUpdate()}async setConfig(e){this.startedUp=!1,this.timeout=!1,this._pendingHassUpdate=!1,this._hass||(this._hass=z()),this.selectedDevice=window.location.hash.substring(1),this.deviceEditMode=!1,this.deviceViewEditMode=!1,this.deviceViewDisplayGrouped=(()=>{const e=r.O.get("dwains_dashboard_deviceViewDisplayGrouped");return!!e&&"false"!==e})(),this._config=e,this.notificationCard,this.weatherCard,this._cardHelpersReady=this.loadHelpers(),this.cardHelpers=await this._cardHelpersReady,await this._startIfReady()}updated(e){e.has("state")||this._syncSelectedDeviceFromLocation()}_syncSelectedDeviceFromLocation(){const e=window.location.hash.substring(1);e?this.selectedDevice=e:null!=this.data&&0!=Object.keys(this.data).length&&(this.selectedDevice=Object.values(this.data)[0].domain)}async connectedCallback(){super.connectedCallback(),this._subscriptions.connect(),this._timers.connect(),this._listeners.connect(),await this._startIfReady()}async _startIfReady(e=!1){const t=D(this._hass);if(!this.isConnected||!this._hass||!this._config||this._startedHass===t)return;this._hass;this._startedHass=t;try{this._cardHelpersReady&&(this.cardHelpers=await this._cardHelpersReady),e?await this._reloadCard():await this._loadData(),this.isConnected&&D(this._hass)===t&&this._startedHass===t&&await this._subscribeReload()}catch(e){this._startedHass===t&&(this._startedHass=void 0),console.error("Error starting devices page card:",e)}}disconnectedCallback(){super.disconnectedCallback(),this._subscriptions.disconnect(),this._timers.disconnect(),this._listeners.disconnect(),this._startedHass=void 0,this._loads.invalidate(),this.timeout=!1,this._pendingHassUpdate=!1}_subscribeReload(){return this._subscriptions.subscribeEvent("devices-page",this._hass,"dwains_dashboard_devicespage_card_reload",()=>{O.invalidate(this._hass),this._reloadCard().catch(e=>{console.error("Error reloading devices page card:",e)})})}async _reloadCard(){await this._loads.reload(),this.requestUpdate()}_loadData(){return this._loads.load()}async _loadConfiguration({isCurrent:e=()=>!0}={}){this.selectedArea=this.selectedArea||"",this.startedUp=!1;const t=await H(this._hass);if(e())if(Object.assign(this,t),null==this.areas||0===this.areas.length||null==this.devices||0===this.devices.length||null==this.entities||0===this.entities.length||null==this.configuration||0===this.configuration.length);else{const t=[],i=[],a=new Set,s=this.entities.filter(e=>j.has((0,o.mD)(e.entity_id)));for(const e of this.areas)if(!this.configuration.areas[e.area_id]||!this.configuration.areas[e.area_id].disabled){const r=new Set((this.devicesByAreaId.get(e.area_id)||[]).map(e=>e.id)),n=T([this.entitiesByAreaId.get(e.area_id),s.filter(e=>!a.has(e.entity_id))],this.entityOrderById);for(const s of n)if(s.area_id?s.area_id===e.area_id:r.has(s.device_id)||"person"==(0,o.mD)(s.entity_id)&&!a.has(s.entity_id)||"weather"==(0,o.mD)(s.entity_id)&&!a.has(s.entity_id)||"alarm_control_panel"==(0,o.mD)(s.entity_id)&&!a.has(s.entity_id)){if(s.hidden_by)continue;const r=(0,o.mD)(s.entity_id),n=this._hass.states[s.entity_id];if(this.configuration.devices[r]&&this.configuration.devices[r].hidden){i.includes(r)||i.push(r);continue}if(!(r in t)){const e=[],i=[];0!==this.configuration.device_cards.length&&this.configuration.device_cards[r]&&Object.entries(this.configuration.device_cards[r]).forEach(([t,a])=>{const s=a.row_span?a.row_span:"1",o=a.col_span?a.col_span:"1",n=a.row_span_lg?a.row_span_lg:"1",d=a.col_span_lg?a.col_span_lg:"1",c=a.row_span_xl?a.row_span_xl:"1",l=a.col_span_xl?a.col_span_xl:"1";"bottom"==a.position?i.push(R({filename:t,domain:r,rowSpan:s,colSpan:o,rowSpanLg:n,colSpanLg:d,rowSpanXl:c,colSpanXl:l},()=>this.createCardElement2(a))):e.push(R({filename:t,domain:r,rowSpan:s,colSpan:o,rowSpanLg:n,colSpanLg:d,rowSpanXl:c,colSpanXl:l},()=>this.createCardElement2(a)))}),t[r]={domain:r,cards:[],entitiesNoState:[],entitiesHidden:[],entitiesDisabled:[],customCardsTop:e,customCardsBottom:i,sort_order:this.configuration.devices[r]&&this.configuration.devices[r].sort_order?this.configuration.devices[r].sort_order:99}}if(!!this.configuration.entities[s.entity_id]&&!!this.configuration.entities[s.entity_id].disabled){t[r].entitiesDisabled.push(s.entity_id),a.add(s.entity_id);continue}if(!n){t[r].entitiesNoState.push(s.entity_id),a.add(s.entity_id);continue}{const i=!!this.configuration.entities[s.entity_id]&&!!this.configuration.entities[s.entity_id].hidden,o=!!this.configuration.entities[s.entity_id]&&!!this.configuration.entities[s.entity_id].excluded,n=this.configuration.entities[s.entity_id]?this.configuration.entities[s.entity_id].friendly_name:"",d=this._entityDisplayName(s.entity_id,s),c=!(!this.configuration.entities[s.entity_id]||!this.configuration.entities[s.entity_id].custom_card)&&this.configuration.entities[s.entity_id].custom_card,l=!(!this.configuration.entities[s.entity_id]||!this.configuration.entities[s.entity_id].custom_popup)&&this.configuration.entities[s.entity_id].custom_popup;if(i){t[r].entitiesHidden.includes(s.entity_id)||t[r].entitiesHidden.push(s.entity_id);continue}let h={},p="1",u="1",m="1",g="1",_="1",f="1";if(c&&this.configuration.entity_cards&&this.configuration.entity_cards[s.entity_id])h={input_name:d,input_entity:s.entity_id,...this.configuration.entity_cards[s.entity_id]};else if(this.configuration.devices_card[r])h={input_name:d,input_entity:s.entity_id,...this.configuration.devices_card[r]};else if("sensor"===r&&this._hass&&this._hass.states[s.entity_id]?.attributes?.unit_of_measurement)h={graph:"line",type:"sensor",hours_to_show:24,detail:1,entity:s.entity_id,...d?{name:d}:{}};else{switch(r){default:h=d?{type:"tile",name:d}:{type:"tile"};break;case"camera":h={type:"picture-entity",camera_view:"auto"},p="2",u="2",m="2",g="2",_="2",f="2";break;case"climate":h=d?{type:"thermostat",name:d,features:[{type:"climate-fan-modes",fan_modes:["quiet","low","medium","high"]},{type:"climate-hvac-modes",hvac_modes:["heat_cool","heat","dry","fan_only","cool","off"]}]}:{type:"thermostat",features:[{type:"climate-fan-modes",fan_modes:["quiet","low","medium","high"]},{type:"climate-hvac-modes",hvac_modes:["heat_cool","heat","dry","fan_only","cool","off"]}]};break;case"cover":h=d?{type:"tile",name:d,features:[{type:"cover-open-close"},{type:"cover-position"}]}:{type:"tile",features:[{type:"cover-open-close"},{type:"cover-position"}]};break;case"light":h=d?{type:"tile",name:d,features:[{type:"light-brightness"}]}:{type:"tile",features:[{type:"light-brightness"}]}}h={entity:s.entity_id,...h}}this.configuration.entities[s.entity_id]&&this.configuration.entities[s.entity_id].row_span&&(p=this.configuration.entities[s.entity_id].row_span),this.configuration.entities[s.entity_id]&&this.configuration.entities[s.entity_id].col_span&&(u=this.configuration.entities[s.entity_id].col_span),this.configuration.entities[s.entity_id]&&this.configuration.entities[s.entity_id].row_span_lg&&(m=this.configuration.entities[s.entity_id].row_span_lg),this.configuration.entities[s.entity_id]&&this.configuration.entities[s.entity_id].col_span_lg&&(g=this.configuration.entities[s.entity_id].col_span_lg),this.configuration.entities[s.entity_id]&&this.configuration.entities[s.entity_id].row_span_xl&&(_=this.configuration.entities[s.entity_id].row_span_xl),this.configuration.entities[s.entity_id]&&this.configuration.entities[s.entity_id].col_span_xl&&(f=this.configuration.entities[s.entity_id].col_span_xl),a.add(s.entity_id),t[r].cards.push(R({area:e,entity:s.entity_id,rowSpan:p,colSpan:u,rowSpanLg:m,colSpanLg:g,rowSpanXl:_,colSpanXl:f,friendlyName:n,hideEntity:i,excludeEntity:o,customCard:c,customPopup:l,sort_order:this.configuration.entities[s.entity_id]&&this.configuration.entities[s.entity_id].devices_sort_order?this.configuration.entities[s.entity_id].devices_sort_order:99,grouped_sort_order:this.configuration.entities[s.entity_id]&&this.configuration.entities[s.entity_id].devices_grouped_sort_order?this.configuration.entities[s.entity_id].devices_grouped_sort_order:99},()=>this.createCardElement2(h)))}}}const r=Object.keys(t).sort(function(e,i){return t[e].sort_order-t[i].sort_order}).map(function(e){return t[e]});if(!e())return;this.data=r,this.disabledDevices=i,this.startedUp=!0,0===this.selectedDevice.length&&(this.selectedDevice=Object.values(r)[0].domain)}}_handleDeviceClick(e){const t=e.currentTarget.dataset.device;window.location.hash=t,this.selectedDevice=t,window.scrollTo(0,0),this._update_hass(this._hass)}_backButtonClick(){window.location.hash="",this._update_hass(this._hass)}async createCardElement2(e){if(this.cardHelpers)return(0,l.Kq)(this.cardHelpers,e,this._hass);console.error("Card helpers zijn niet geladen.")}shouldUpdate(e){return!e.has("_hass")}render(){return null==this.data||0===Object.keys(this.data).length?d.qy``:d.qy`
                <div class="flex flex-wrap dd-dashboard-style-refresh">
                  <div class="w-full ${this.configuration.homepage_header.v2_mode?"":"lg-w-1-2 xl-w-1-3"} ${window.location.hash?this.configuration.homepage_header.v2_mode?"hidden":"hidden lg-block":""} p-4">
                    <div id="devices">
                      <div class="flex justify-between mb-2">
                        <div>
                          <h2 class="font-semibold text-lg capitalize">
                            ${(0,c.A)(this._hass,"device.title_plural")}
                          </h2>
                          <span class="text-gray">
                            ${Object.keys(this.data).length} ${(0,c.A)(this._hass,"device.title_plural")}
                          </span>
                        </div>
                        <div>
                          ${this._hass.user.is_admin?d.qy`
                          <ha-dropdown
                            class="ha-icon-overflow-menu-overflow"
                            placement="bottom-end"
                          >
                            <ha-icon-button
                              label=${this._hass.localize("ui.common.overflow_menu")}
                              .path=${n.TdJ}
                              slot="trigger"
                            ></ha-icon-button>
                              ${this.deviceEditMode?d.qy`
                                <ha-dropdown-item
                                  .ddValue=${!1}
                                  @click=${this._handleDeviceEditModeClicked}
                                >
                                  <ha-svg-icon slot="icon" .path=${n.CZ3}></ha-svg-icon>
                                  ${(0,c.A)(this._hass,"global.disable_edit_mode")}
                                </ha-dropdown-item>`:d.qy`
                                <ha-dropdown-item
                                  .ddValue=${!0}
                                  @click=${this._handleDeviceEditModeClicked}
                                >
                                  <ha-svg-icon slot="icon" .path=${n.CZ3}></ha-svg-icon>
                                  ${(0,c.A)(this._hass,"global.enable_edit_mode")}
                                </ha-dropdown-item>
                                `}
                          </ha-dropdown>
                          `:""}
                        </div>
                      </div>

                      <div class="grid grid-cols-2 dd-overview-grid md-grid-cols-3 ${this.configuration.homepage_header.v2_mode?"lg-grid-cols-4 xl-grid-cols-5":""} gap-4" id="sortable">
                        ${Object.values(this.data).map(e=>this._renderDeviceButton(e))}
                      </div>

                      ${this.deviceEditMode?d.qy`
                        ${this.disabledDevices.length?d.qy`
                          <div class="mb-5">
                            <h3 class="font-semibold capitalize text-gray">${(0,c.A)(this._hass,"device.hidden")}</h3>
                            <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 gap-4">
                            ${this.disabledDevices.map(e=>d.qy`${this._renderDeviceButtonCard(e,"disabled")}`)}
                            </div>
                          </div>`:""}
                      `:""}
                    </div>
                  </div>
                  <div class="w-full ${this.configuration.homepage_header.v2_mode?"":"lg-w-1-2 xl-w-2-3"} ${window.location.hash?"":this.configuration.homepage_header.v2_mode?"hidden":"hidden lg-block"} p-4">
                    ${Object.values(this.data).map(e=>this._renderDeviceView(e))}
                  </div>
                </div>
                <div class="sticky z-30 bottom-0 ${window.location.hash?"":"hidden"} ${this.configuration.homepage_header.v2_mode?"":"lg-hidden"} text-right">
                <div @click=${this._backButtonClick} class="back-button">
                    <div class="button">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                </div>
                </div>
            `}static get styles(){return p}}M("devices-card",V)},7897(e,t,i){"use strict";var a=i(4169),s=i(6684);const{loadCardHelpers:r}=i(393),{defineDwainsElement:o}=i(1415),n=r(),d=async(e,t)=>{const i=await n;if(i){return(0,a.Kq)(i,t)}const s=document.createElement(e);try{s.setConfig(t)}catch(i){return console.error(e,i),((e,t)=>d("hui-error-card",{type:"error",error:e,config:t}))(i.message,t)}return s};class c extends s.WF{constructor(){super(),this._renderGeneration=0}static get properties(){return{_config:{},_refCards:{}}}set hass(e){this._hass=e,!this._refCards&&this._config&&this.renderCard(),this._refCards&&this._refCards.forEach(t=>{t.hass=e})}setConfig(e){const t=Array.isArray(e?.cards),i=Array.isArray(e?.entities);if(!t&&!i)throw new Error("Card config incorrect");this._config=e,this._hass&&this.renderCard()}renderCard(){const e=this._config.entities||this._config.cards,t=++this._renderGeneration,i=e.map(e=>this.createCardElement(e));Promise.all(i).then(e=>{t===this._renderGeneration&&(this._refCards=e)}).catch(e=>{console.error("Failed to render dwains-flexbox-card children",e)})}disconnectedCallback(){super.disconnectedCallback(),this._renderGeneration+=1}async createCardElement(e){let t=e.type;t=t.startsWith("divider")?"hui-divider-row":t.startsWith("custom:")?t.slice(7):`hui-${t}-card`;const i=await d(t,e);return e.item_classes?i.className="item "+e.item_classes:this._config.items_classes?i.className="item "+this._config.items_classes:i.className="item",i.hass=this._hass,i.addEventListener("ll-rebuild",e=>{e.stopPropagation(),this.renderCard()},{once:!0}),i}render(){if(!this._config||!this._hass||!this._refCards)return s.qy``;let e;return this._config.padding&&(e="padding"),s.qy`
      <div style="${this._config.css}">
        <div class="wrapper ${e}">
          <div class="row">
            ${this._refCards}
          </div>
        </div>
      </div>
      `}static get styles(){return[s.AH`
          /* I used flexbox grid (http://flexboxgrid.com/) for now, not sure if it's good for all browsers */
          .container,
          .container-fluid {
            margin-right: auto;
            margin-left: auto;
          }
          .container-fluid {
            padding-right: 2rem;
            padding-left: 2rem;
          }
          .row {
            box-sizing: border-box;
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-flex: 0;
            -ms-flex: 0 1 auto;
            flex: 0 1 auto;
            -webkit-box-orient: horizontal;
            -webkit-box-direction: normal;
            -ms-flex-direction: row;
            flex-direction: row;
            -ms-flex-wrap: wrap;
            flex-wrap: wrap;
            margin-right: -0.25rem;
            margin-left: -0.25rem;
          }
          .row.reverse {
            -webkit-box-orient: horizontal;
            -webkit-box-direction: reverse;
            -ms-flex-direction: row-reverse;
            flex-direction: row-reverse;
          }
          .col.reverse {
            -webkit-box-orient: vertical;
            -webkit-box-direction: reverse;
            -ms-flex-direction: column-reverse;
            flex-direction: column-reverse;
          }
          .col-xs,
          .col-xs-1,
          .col-xs-10,
          .col-xs-11,
          .col-xs-12,
          .col-xs-2,
          .col-xs-3,
          .col-xs-4,
          .col-xs-5,
          .col-xs-6,
          .col-xs-7,
          .col-xs-8,
          .col-xs-9,
          .col-xs-offset-0,
          .col-xs-offset-1,
          .col-xs-offset-10,
          .col-xs-offset-11,
          .col-xs-offset-12,
          .col-xs-offset-2,
          .col-xs-offset-3,
          .col-xs-offset-4,
          .col-xs-offset-5,
          .col-xs-offset-6,
          .col-xs-offset-7,
          .col-xs-offset-8,
          .col-xs-offset-9 {
            box-sizing: border-box;
            -webkit-box-flex: 0;
            -ms-flex: 0 0 auto;
            flex: 0 0 auto;
            padding-right: 0.25rem;
            padding-left: 0.25rem;
          }
          .col-xs {
            -webkit-box-flex: 1;
            -ms-flex-positive: 1;
            flex-grow: 1;
            -ms-flex-preferred-size: 0;
            flex-basis: 0;
            max-width: 100%;
          }
          .col-xs-1 {
            -ms-flex-preferred-size: 8.33333333%;
            flex-basis: 8.33333333%;
            max-width: 8.33333333%;
          }
          .col-xs-2 {
            -ms-flex-preferred-size: 16.66666667%;
            flex-basis: 16.66666667%;
            max-width: 16.66666667%;
          }
          .col-xs-3 {
            -ms-flex-preferred-size: 25%;
            flex-basis: 25%;
            max-width: 25%;
          }
          .col-xs-4 {
            -ms-flex-preferred-size: 33.33333333%;
            flex-basis: 33.33333333%;
            max-width: 33.33333333%;
          }
          .col-xs-5 {
            -ms-flex-preferred-size: 41.66666667%;
            flex-basis: 41.66666667%;
            max-width: 41.66666667%;
          }
          .col-xs-6 {
            -ms-flex-preferred-size: 50%;
            flex-basis: 50%;
            max-width: 50%;
          }
          .col-xs-7 {
            -ms-flex-preferred-size: 58.33333333%;
            flex-basis: 58.33333333%;
            max-width: 58.33333333%;
          }
          .col-xs-8 {
            -ms-flex-preferred-size: 66.66666667%;
            flex-basis: 66.66666667%;
            max-width: 66.66666667%;
          }
          .col-xs-9 {
            -ms-flex-preferred-size: 75%;
            flex-basis: 75%;
            max-width: 75%;
          }
          .col-xs-10 {
            -ms-flex-preferred-size: 83.33333333%;
            flex-basis: 83.33333333%;
            max-width: 83.33333333%;
          }
          .col-xs-11 {
            -ms-flex-preferred-size: 91.66666667%;
            flex-basis: 91.66666667%;
            max-width: 91.66666667%;
          }
          .col-xs-12 {
            -ms-flex-preferred-size: 100%;
            flex-basis: 100%;
            max-width: 100%;
          }
          .col-xs-offset-0 {
            margin-left: 0;
          }
          .col-xs-offset-1 {
            margin-left: 8.33333333%;
          }
          .col-xs-offset-2 {
            margin-left: 16.66666667%;
          }
          .col-xs-offset-3 {
            margin-left: 25%;
          }
          .col-xs-offset-4 {
            margin-left: 33.33333333%;
          }
          .col-xs-offset-5 {
            margin-left: 41.66666667%;
          }
          .col-xs-offset-6 {
            margin-left: 50%;
          }
          .col-xs-offset-7 {
            margin-left: 58.33333333%;
          }
          .col-xs-offset-8 {
            margin-left: 66.66666667%;
          }
          .col-xs-offset-9 {
            margin-left: 75%;
          }
          .col-xs-offset-10 {
            margin-left: 83.33333333%;
          }
          .col-xs-offset-11 {
            margin-left: 91.66666667%;
          }
          .start-xs {
            -webkit-box-pack: start;
            -ms-flex-pack: start;
            justify-content: flex-start;
            text-align: start;
          }
          .center-xs {
            -webkit-box-pack: center;
            -ms-flex-pack: center;
            justify-content: center;
            text-align: center;
          }
          .end-xs {
            -webkit-box-pack: end;
            -ms-flex-pack: end;
            justify-content: flex-end;
            text-align: end;
          }
          .top-xs {
            -webkit-box-align: start;
            -ms-flex-align: start;
            align-items: flex-start;
          }
          .middle-xs {
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
          }
          .bottom-xs {
            -webkit-box-align: end;
            -ms-flex-align: end;
            align-items: flex-end;
          }
          .around-xs {
            -ms-flex-pack: distribute;
            justify-content: space-around;
          }
          .between-xs {
            -webkit-box-pack: justify;
            -ms-flex-pack: justify;
            justify-content: space-between;
          }
          .first-xs {
            -webkit-box-ordinal-group: 0;
            -ms-flex-order: -1;
            order: -1;
          }
          .last-xs {
            -webkit-box-ordinal-group: 2;
            -ms-flex-order: 1;
            order: 1;
          }
          @media only screen and (min-width: 48em) {
            .container {
              width: 49rem;
            }
            .col-sm,
            .col-sm-1,
            .col-sm-10,
            .col-sm-11,
            .col-sm-12,
            .col-sm-2,
            .col-sm-3,
            .col-sm-4,
            .col-sm-5,
            .col-sm-6,
            .col-sm-7,
            .col-sm-8,
            .col-sm-9,
            .col-sm-offset-0,
            .col-sm-offset-1,
            .col-sm-offset-10,
            .col-sm-offset-11,
            .col-sm-offset-12,
            .col-sm-offset-2,
            .col-sm-offset-3,
            .col-sm-offset-4,
            .col-sm-offset-5,
            .col-sm-offset-6,
            .col-sm-offset-7,
            .col-sm-offset-8,
            .col-sm-offset-9 {
              box-sizing: border-box;
              -webkit-box-flex: 0;
              -ms-flex: 0 0 auto;
              flex: 0 0 auto;
              padding-right: 0.25rem;
              padding-left: 0.25rem;
            }
            .col-sm {
              -webkit-box-flex: 1;
              -ms-flex-positive: 1;
              flex-grow: 1;
              -ms-flex-preferred-size: 0;
              flex-basis: 0;
              max-width: 100%;
            }
            .col-sm-1 {
              -ms-flex-preferred-size: 8.33333333%;
              flex-basis: 8.33333333%;
              max-width: 8.33333333%;
            }
            .col-sm-2 {
              -ms-flex-preferred-size: 16.66666667%;
              flex-basis: 16.66666667%;
              max-width: 16.66666667%;
            }
            .col-sm-3 {
              -ms-flex-preferred-size: 25%;
              flex-basis: 25%;
              max-width: 25%;
            }
            .col-sm-4 {
              -ms-flex-preferred-size: 33.33333333%;
              flex-basis: 33.33333333%;
              max-width: 33.33333333%;
            }
            .col-sm-5 {
              -ms-flex-preferred-size: 41.66666667%;
              flex-basis: 41.66666667%;
              max-width: 41.66666667%;
            }
            .col-sm-6 {
              -ms-flex-preferred-size: 50%;
              flex-basis: 50%;
              max-width: 50%;
            }
            .col-sm-7 {
              -ms-flex-preferred-size: 58.33333333%;
              flex-basis: 58.33333333%;
              max-width: 58.33333333%;
            }
            .col-sm-8 {
              -ms-flex-preferred-size: 66.66666667%;
              flex-basis: 66.66666667%;
              max-width: 66.66666667%;
            }
            .col-sm-9 {
              -ms-flex-preferred-size: 75%;
              flex-basis: 75%;
              max-width: 75%;
            }
            .col-sm-10 {
              -ms-flex-preferred-size: 83.33333333%;
              flex-basis: 83.33333333%;
              max-width: 83.33333333%;
            }
            .col-sm-11 {
              -ms-flex-preferred-size: 91.66666667%;
              flex-basis: 91.66666667%;
              max-width: 91.66666667%;
            }
            .col-sm-12 {
              -ms-flex-preferred-size: 100%;
              flex-basis: 100%;
              max-width: 100%;
            }
            .col-sm-offset-0 {
              margin-left: 0;
            }
            .col-sm-offset-1 {
              margin-left: 8.33333333%;
            }
            .col-sm-offset-2 {
              margin-left: 16.66666667%;
            }
            .col-sm-offset-3 {
              margin-left: 25%;
            }
            .col-sm-offset-4 {
              margin-left: 33.33333333%;
            }
            .col-sm-offset-5 {
              margin-left: 41.66666667%;
            }
            .col-sm-offset-6 {
              margin-left: 50%;
            }
            .col-sm-offset-7 {
              margin-left: 58.33333333%;
            }
            .col-sm-offset-8 {
              margin-left: 66.66666667%;
            }
            .col-sm-offset-9 {
              margin-left: 75%;
            }
            .col-sm-offset-10 {
              margin-left: 83.33333333%;
            }
            .col-sm-offset-11 {
              margin-left: 91.66666667%;
            }
            .start-sm {
              -webkit-box-pack: start;
              -ms-flex-pack: start;
              justify-content: flex-start;
              text-align: start;
            }
            .center-sm {
              -webkit-box-pack: center;
              -ms-flex-pack: center;
              justify-content: center;
              text-align: center;
            }
            .end-sm {
              -webkit-box-pack: end;
              -ms-flex-pack: end;
              justify-content: flex-end;
              text-align: end;
            }
            .top-sm {
              -webkit-box-align: start;
              -ms-flex-align: start;
              align-items: flex-start;
            }
            .middle-sm {
              -webkit-box-align: center;
              -ms-flex-align: center;
              align-items: center;
            }
            .bottom-sm {
              -webkit-box-align: end;
              -ms-flex-align: end;
              align-items: flex-end;
            }
            .around-sm {
              -ms-flex-pack: distribute;
              justify-content: space-around;
            }
            .between-sm {
              -webkit-box-pack: justify;
              -ms-flex-pack: justify;
              justify-content: space-between;
            }
            .first-sm {
              -webkit-box-ordinal-group: 0;
              -ms-flex-order: -1;
              order: -1;
            }
            .last-sm {
              -webkit-box-ordinal-group: 2;
              -ms-flex-order: 1;
              order: 1;
            }
          }
          @media only screen and (min-width: 64em) {
            .container {
              width: 65rem;
            }
            .col-md,
            .col-md-1,
            .col-md-10,
            .col-md-11,
            .col-md-12,
            .col-md-2,
            .col-md-3,
            .col-md-4,
            .col-md-5,
            .col-md-6,
            .col-md-7,
            .col-md-8,
            .col-md-9,
            .col-md-offset-0,
            .col-md-offset-1,
            .col-md-offset-10,
            .col-md-offset-11,
            .col-md-offset-12,
            .col-md-offset-2,
            .col-md-offset-3,
            .col-md-offset-4,
            .col-md-offset-5,
            .col-md-offset-6,
            .col-md-offset-7,
            .col-md-offset-8,
            .col-md-offset-9 {
              box-sizing: border-box;
              -webkit-box-flex: 0;
              -ms-flex: 0 0 auto;
              flex: 0 0 auto;
              padding-right: 0.25rem;
              padding-left: 0.25rem;
            }
            .col-md {
              -webkit-box-flex: 1;
              -ms-flex-positive: 1;
              flex-grow: 1;
              -ms-flex-preferred-size: 0;
              flex-basis: 0;
              max-width: 100%;
            }
            .col-md-1 {
              -ms-flex-preferred-size: 8.33333333%;
              flex-basis: 8.33333333%;
              max-width: 8.33333333%;
            }
            .col-md-2 {
              -ms-flex-preferred-size: 16.66666667%;
              flex-basis: 16.66666667%;
              max-width: 16.66666667%;
            }
            .col-md-3 {
              -ms-flex-preferred-size: 25%;
              flex-basis: 25%;
              max-width: 25%;
            }
            .col-md-4 {
              -ms-flex-preferred-size: 33.33333333%;
              flex-basis: 33.33333333%;
              max-width: 33.33333333%;
            }
            .col-md-5 {
              -ms-flex-preferred-size: 41.66666667%;
              flex-basis: 41.66666667%;
              max-width: 41.66666667%;
            }
            .col-md-6 {
              -ms-flex-preferred-size: 50%;
              flex-basis: 50%;
              max-width: 50%;
            }
            .col-md-7 {
              -ms-flex-preferred-size: 58.33333333%;
              flex-basis: 58.33333333%;
              max-width: 58.33333333%;
            }
            .col-md-8 {
              -ms-flex-preferred-size: 66.66666667%;
              flex-basis: 66.66666667%;
              max-width: 66.66666667%;
            }
            .col-md-9 {
              -ms-flex-preferred-size: 75%;
              flex-basis: 75%;
              max-width: 75%;
            }
            .col-md-10 {
              -ms-flex-preferred-size: 83.33333333%;
              flex-basis: 83.33333333%;
              max-width: 83.33333333%;
            }
            .col-md-11 {
              -ms-flex-preferred-size: 91.66666667%;
              flex-basis: 91.66666667%;
              max-width: 91.66666667%;
            }
            .col-md-12 {
              -ms-flex-preferred-size: 100%;
              flex-basis: 100%;
              max-width: 100%;
            }
            .col-md-offset-0 {
              margin-left: 0;
            }
            .col-md-offset-1 {
              margin-left: 8.33333333%;
            }
            .col-md-offset-2 {
              margin-left: 16.66666667%;
            }
            .col-md-offset-3 {
              margin-left: 25%;
            }
            .col-md-offset-4 {
              margin-left: 33.33333333%;
            }
            .col-md-offset-5 {
              margin-left: 41.66666667%;
            }
            .col-md-offset-6 {
              margin-left: 50%;
            }
            .col-md-offset-7 {
              margin-left: 58.33333333%;
            }
            .col-md-offset-8 {
              margin-left: 66.66666667%;
            }
            .col-md-offset-9 {
              margin-left: 75%;
            }
            .col-md-offset-10 {
              margin-left: 83.33333333%;
            }
            .col-md-offset-11 {
              margin-left: 91.66666667%;
            }
            .start-md {
              -webkit-box-pack: start;
              -ms-flex-pack: start;
              justify-content: flex-start;
              text-align: start;
            }
            .center-md {
              -webkit-box-pack: center;
              -ms-flex-pack: center;
              justify-content: center;
              text-align: center;
            }
            .end-md {
              -webkit-box-pack: end;
              -ms-flex-pack: end;
              justify-content: flex-end;
              text-align: end;
            }
            .top-md {
              -webkit-box-align: start;
              -ms-flex-align: start;
              align-items: flex-start;
            }
            .middle-md {
              -webkit-box-align: center;
              -ms-flex-align: center;
              align-items: center;
            }
            .bottom-md {
              -webkit-box-align: end;
              -ms-flex-align: end;
              align-items: flex-end;
            }
            .around-md {
              -ms-flex-pack: distribute;
              justify-content: space-around;
            }
            .between-md {
              -webkit-box-pack: justify;
              -ms-flex-pack: justify;
              justify-content: space-between;
            }
            .first-md {
              -webkit-box-ordinal-group: 0;
              -ms-flex-order: -1;
              order: -1;
            }
            .last-md {
              -webkit-box-ordinal-group: 2;
              -ms-flex-order: 1;
              order: 1;
            }
          }
          @media only screen and (min-width: 75em) {
            .container {
              width: 76rem;
            }
            .col-lg,
            .col-lg-1,
            .col-lg-10,
            .col-lg-11,
            .col-lg-12,
            .col-lg-2,
            .col-lg-3,
            .col-lg-4,
            .col-lg-5,
            .col-lg-6,
            .col-lg-7,
            .col-lg-8,
            .col-lg-9,
            .col-lg-offset-0,
            .col-lg-offset-1,
            .col-lg-offset-10,
            .col-lg-offset-11,
            .col-lg-offset-12,
            .col-lg-offset-2,
            .col-lg-offset-3,
            .col-lg-offset-4,
            .col-lg-offset-5,
            .col-lg-offset-6,
            .col-lg-offset-7,
            .col-lg-offset-8,
            .col-lg-offset-9 {
              box-sizing: border-box;
              -webkit-box-flex: 0;
              -ms-flex: 0 0 auto;
              flex: 0 0 auto;
              padding-right: 0.25rem;
              padding-left: 0.25rem;
            }
            .col-lg {
              -webkit-box-flex: 1;
              -ms-flex-positive: 1;
              flex-grow: 1;
              -ms-flex-preferred-size: 0;
              flex-basis: 0;
              max-width: 100%;
            }
            .col-lg-1 {
              -ms-flex-preferred-size: 8.33333333%;
              flex-basis: 8.33333333%;
              max-width: 8.33333333%;
            }
            .col-lg-2 {
              -ms-flex-preferred-size: 16.66666667%;
              flex-basis: 16.66666667%;
              max-width: 16.66666667%;
            }
            .col-lg-3 {
              -ms-flex-preferred-size: 25%;
              flex-basis: 25%;
              max-width: 25%;
            }
            .col-lg-4 {
              -ms-flex-preferred-size: 33.33333333%;
              flex-basis: 33.33333333%;
              max-width: 33.33333333%;
            }
            .col-lg-5 {
              -ms-flex-preferred-size: 41.66666667%;
              flex-basis: 41.66666667%;
              max-width: 41.66666667%;
            }
            .col-lg-6 {
              -ms-flex-preferred-size: 50%;
              flex-basis: 50%;
              max-width: 50%;
            }
            .col-lg-7 {
              -ms-flex-preferred-size: 58.33333333%;
              flex-basis: 58.33333333%;
              max-width: 58.33333333%;
            }
            .col-lg-8 {
              -ms-flex-preferred-size: 66.66666667%;
              flex-basis: 66.66666667%;
              max-width: 66.66666667%;
            }
            .col-lg-9 {
              -ms-flex-preferred-size: 75%;
              flex-basis: 75%;
              max-width: 75%;
            }
            .col-lg-10 {
              -ms-flex-preferred-size: 83.33333333%;
              flex-basis: 83.33333333%;
              max-width: 83.33333333%;
            }
            .col-lg-11 {
              -ms-flex-preferred-size: 91.66666667%;
              flex-basis: 91.66666667%;
              max-width: 91.66666667%;
            }
            .col-lg-12 {
              -ms-flex-preferred-size: 100%;
              flex-basis: 100%;
              max-width: 100%;
            }
            .col-lg-offset-0 {
              margin-left: 0;
            }
            .col-lg-offset-1 {
              margin-left: 8.33333333%;
            }
            .col-lg-offset-2 {
              margin-left: 16.66666667%;
            }
            .col-lg-offset-3 {
              margin-left: 25%;
            }
            .col-lg-offset-4 {
              margin-left: 33.33333333%;
            }
            .col-lg-offset-5 {
              margin-left: 41.66666667%;
            }
            .col-lg-offset-6 {
              margin-left: 50%;
            }
            .col-lg-offset-7 {
              margin-left: 58.33333333%;
            }
            .col-lg-offset-8 {
              margin-left: 66.66666667%;
            }
            .col-lg-offset-9 {
              margin-left: 75%;
            }
            .col-lg-offset-10 {
              margin-left: 83.33333333%;
            }
            .col-lg-offset-11 {
              margin-left: 91.66666667%;
            }
            .start-lg {
              -webkit-box-pack: start;
              -ms-flex-pack: start;
              justify-content: flex-start;
              text-align: start;
            }
            .center-lg {
              -webkit-box-pack: center;
              -ms-flex-pack: center;
              justify-content: center;
              text-align: center;
            }
            .end-lg {
              -webkit-box-pack: end;
              -ms-flex-pack: end;
              justify-content: flex-end;
              text-align: end;
            }
            .top-lg {
              -webkit-box-align: start;
              -ms-flex-align: start;
              align-items: flex-start;
            }
            .middle-lg {
              -webkit-box-align: center;
              -ms-flex-align: center;
              align-items: center;
            }
            .bottom-lg {
              -webkit-box-align: end;
              -ms-flex-align: end;
              align-items: flex-end;
            }
            .around-lg {
              -ms-flex-pack: distribute;
              justify-content: space-around;
            }
            .between-lg {
              -webkit-box-pack: justify;
              -ms-flex-pack: justify;
              justify-content: space-between;
            }
            .first-lg {
              -webkit-box-ordinal-group: 0;
              -ms-flex-order: -1;
              order: -1;
            }
            .last-lg {
              -webkit-box-ordinal-group: 2;
              -ms-flex-order: 1;
              order: 1;
            }
          }

          .item {
            margin-bottom: 0.5rem;
          }

          .wrapper {
            overflow: hidden;
            padding: 0px;
          }
          .wrapper.padding {
            padding: 11px;
          }
          .row {
            overflow: hidden;
            width: auto;
          }

          .d-none {
            display: none !important;
          }
          .d-inline {
            display: inline !important;
          }
          .d-inline-block {
            display: inline-block !important;
          }
          .d-block {
            display: block !important;
          }
          .d-table {
            display: table !important;
          }
          .d-table-row {
            display: table-row !important;
          }
          .d-table-cell {
            display: table-cell !important;
          }
          .d-flex {
            display: -webkit-box !important;
            display: -ms-flexbox !important;
            display: flex !important;
          }
          .d-inline-flex {
            display: -webkit-inline-box !important;
            display: -ms-inline-flexbox !important;
            display: inline-flex !important;
          }

          @media (min-width: 576px) {
            .d-sm-none {
              display: none !important;
            }
            .d-sm-inline {
              display: inline !important;
            }
            .d-sm-inline-block {
              display: inline-block !important;
            }
            .d-sm-block {
              display: block !important;
            }
            .d-sm-table {
              display: table !important;
            }
            .d-sm-table-row {
              display: table-row !important;
            }
            .d-sm-table-cell {
              display: table-cell !important;
            }
            .d-sm-flex {
              display: -webkit-box !important;
              display: -ms-flexbox !important;
              display: flex !important;
            }
            .d-sm-inline-flex {
              display: -webkit-inline-box !important;
              display: -ms-inline-flexbox !important;
              display: inline-flex !important;
            }
          }

          @media (min-width: 768px) {
            .d-md-none {
              display: none !important;
            }
            .d-md-inline {
              display: inline !important;
            }
            .d-md-inline-block {
              display: inline-block !important;
            }
            .d-md-block {
              display: block !important;
            }
            .d-md-table {
              display: table !important;
            }
            .d-md-table-row {
              display: table-row !important;
            }
            .d-md-table-cell {
              display: table-cell !important;
            }
            .d-md-flex {
              display: -webkit-box !important;
              display: -ms-flexbox !important;
              display: flex !important;
            }
            .d-md-inline-flex {
              display: -webkit-inline-box !important;
              display: -ms-inline-flexbox !important;
              display: inline-flex !important;
            }
          }

          @media (min-width: 992px) {
            .d-lg-none {
              display: none !important;
            }
            .d-lg-inline {
              display: inline !important;
            }
            .d-lg-inline-block {
              display: inline-block !important;
            }
            .d-lg-block {
              display: block !important;
            }
            .d-lg-table {
              display: table !important;
            }
            .d-lg-table-row {
              display: table-row !important;
            }
            .d-lg-table-cell {
              display: table-cell !important;
            }
            .d-lg-flex {
              display: -webkit-box !important;
              display: -ms-flexbox !important;
              display: flex !important;
            }
            .d-lg-inline-flex {
              display: -webkit-inline-box !important;
              display: -ms-inline-flexbox !important;
              display: inline-flex !important;
            }
          }

          @media (min-width: 1200px) {
            .d-xl-none {
              display: none !important;
            }
            .d-xl-inline {
              display: inline !important;
            }
            .d-xl-inline-block {
              display: inline-block !important;
            }
            .d-xl-block {
              display: block !important;
            }
            .d-xl-table {
              display: table !important;
            }
            .d-xl-table-row {
              display: table-row !important;
            }
            .d-xl-table-cell {
              display: table-cell !important;
            }
            .d-xl-flex {
              display: -webkit-box !important;
              display: -ms-flexbox !important;
              display: flex !important;
            }
            .d-xl-inline-flex {
              display: -webkit-inline-box !important;
              display: -ms-inline-flexbox !important;
              display: inline-flex !important;
            }
          }
        `]}}customElements.get("dwains-flexbox-card")||o("dwains-flexbox-card",c)},851(e,t,i){"use strict";var a=i(6684);const{defineDwainsElement:s}=i(1415);class r extends a.WF{static get properties(){return{_config:{}}}static styles=a.AH`
    ha-card {
      box-shadow: none;
      background: none;
      padding: 0 16px 0 0;
      font-weight: bold;
      font-size: 14px;
    }
  `;setConfig(e){if(!e||!e.title)throw new Error("Title configuration required");this._config={...e}}render(){return a.qy`
      <ha-card>
        ${this._config.title}
      </ha-card>
    `}getCardSize(){return 1}}customElements.get("dwains-heading-card")||s("dwains-heading-card",r)},3853(e,t,i){"use strict";var a=i.cw(function(e,t){const i=Object.freeze({carbon_monoxide:"carbon_monoxide",cold:"cold",door:"door",garage_door:"garage_door",gas:"gas",lock:"lock",moisture:"moisture",motion:"motion",occupancy:"occupancy",opening:"opening",presence:"presence",problem:"problem",running:"running",safety:"safety",smoke:"smoke",sound:"sound",valve:"valve",vibration:"vibration",window:"window"});e.exports={collectAreaBinarySensorValues:function({areaId:e,areaEntityIds:t,states:i,deviceClasses:a,explicitEntityIds:s,unavailableStates:r,offStates:o,belongsToArea:n,summary:d,displayName:c,stateLabel:l}){const h=t.map(e=>i[e]).filter(e=>e?.entity_id?.startsWith("binary_sensor.")),p=[];for(const e of a){const t=h.filter(t=>t.attributes.device_class===e&&!r.includes(t.state));if(!t.length)continue;const i=t.filter(e=>!o.includes(e.state)).length;p.push(d(e,i))}for(const t of s){if(!n(t,e))continue;const a=i[t];a&&!r.includes(a.state)&&p.push(`${c(t)}: ${l(a)}`)}return p},entityBelongsToArea:function(e,t,{entitiesById:i,entities:a=[],devicesById:s}){const r=i?.get(e)||a.find(t=>t.entity_id===e);return!!r&&(r.area_id?r.area_id===t:!!r.device_id&&s?.get(r.device_id)?.area_id===t)},summaryTranslationKey:function(e,t){const a=i[e],s=0===t?"zero":1===t?"one":"many";return a?`area_binary_sensor.summary.${a}.${s}`:`area_binary_sensor.summary.fallback.${s}`}}}),s=i.cw(function(e,t){const{historyToPoints:i,statisticsToPoints:a,usesStatistics:s}=r();e.exports={createAreaGraphLoader:function({now:e=()=>Date.now(),schedule:t=e=>setTimeout(e,30)}={}){const r=new Map,o=new Map;async function n(t,a,s){const r=await t.callWS({type:"history/history_during_period",start_time:new Date(e()-3600*s*1e3).toISOString(),entity_ids:a,minimal_response:!0,no_attributes:!0,significant_changes_only:!1});return Object.fromEntries(a.map(e=>[e,i(r?.[e])]))}function d(t,i){const d=o.get(i);o.delete(i);const c=[...d.keys()],l=s(i)?async function(t,i,s){const r=await t.callWS({type:"recorder/statistics_during_period",start_time:new Date(e()-3600*s*1e3).toISOString(),statistic_ids:i,period:"hour",types:["mean"]}),o=Object.fromEntries(i.map(e=>[e,a(r?.[e])])),d=i.filter(e=>o[e].length<2);return d.length&&Object.assign(o,await n(t,d,s)),o}(t,c,i):n(t,c,i);l.then(e=>d.forEach(({resolve:t},i)=>t(e[i]||[])),e=>d.forEach(({reject:t},a)=>{r.delete(`${a}|${i}`),t(e)}))}return{load:function(i,a,s,{force:n=!1}={}){const c=`${a}|${s}`,l=r.get(c);if(!n&&l&&e()-l.fetchedAt<3e5)return l.promise;let h=o.get(s);h||(h=new Map,o.set(s,h),t(()=>d(i,s)));let p=h.get(a);return p||(p={},p.promise=new Promise((e,t)=>Object.assign(p,{resolve:e,reject:t})),h.set(a,p)),r.set(c,{promise:p.promise,fetchedAt:e()}),p.promise}}}}}),r=()=>i(1495),o=i.cw(function(e,t){const{formatValueWithUnit:i}=p();function a(e,t,a){const s=e.attributes.unit_of_measurement,r=function(e){if(""===e.state||null===e.state)return;const t=Number(e.state);return Number.isFinite(t)?t:void 0}(e);if(void 0!==r&&s)return i(r,s,a);const o=void 0!==r?String(r):e.state;return`${t(e.entity_id)}: ${s?`${o}${s}`:o}`}e.exports={collectAreaSensorValues:function({areaId:e,deviceClasses:t,average:i,explicitEntityIds:s,states:r,unavailableStates:o,belongsToArea:n,displayName:d,locale:c}){const l=[];for(const t of s||[]){if(!t?.startsWith("sensor.")||!n(t,e))continue;const i=r[t];i&&!o.includes(i.state)&&l.push(i)}const h=[],p=new Set;for(const e of t){const t=l.filter(t=>t.attributes.device_class===e);if(t.length){for(const e of t)h.push(a(e,d,c)),p.add(e.entity_id);continue}const s=i(e);s&&h.push(s)}for(const e of l)p.has(e.entity_id)||h.push(a(e,d,c));return h}}}),n=()=>i(1415),d=i.cw(function(e,t){const{defineDwainsElement:i}=n(),{normalizeGraphHours:a,bucketPoints:o,graphPaths:d}=r(),{createAreaGraphLoader:c}=s(),l=6e5,h=c();let p=0;class u extends _.WF{static get properties(){return{hass:{attribute:!1},entity:{type:String},hours:{type:Number},_points:{state:!0}}}static get styles(){return _.AH`
      :host {
        display: block;
        width: 100%;
        height: 100%;
        pointer-events: none;
        color: var(--dwains-area-graph-color, var(--primary-color));
      }
      svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      .line {
        fill: none;
        stroke: currentColor;
        stroke-width: 1.75;
        stroke-linecap: round;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
      }
    `}constructor(){super(),this._gradientId="dwains-area-graph-"+ ++p,this._points=[]}connectedCallback(){super.connectedCallback();const e=l-Date.now()%l;this._timer=setTimeout(()=>{this._load(!0),this._timer=setInterval(()=>this._load(!0),l)},e)}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this._timer),clearInterval(this._timer)}updated(e){(e.has("entity")||e.has("hours")||e.has("hass")&&!this._loadedFor)&&this._load(!1),e.has("hass")&&this._appendLiveState()}async _load(e){const t=this.entity;if(!this.hass?.callWS||!t)return;const i=a(this.hours),s=`${t}|${i}`;this._loadedFor=s;try{const a=await h.load(this.hass,t,i,{force:e});this._loadedFor===s&&(this._points=a.slice())}catch(e){this._loadedFor===s&&(this._points=[])}this._loadedFor===s&&this._appendLiveState()}_appendLiveState(){const e=this.hass?.states?.[this.entity];if(!e||this._loadedFor!==`${this.entity}|${a(this.hours)}`)return;const t=Number(e.state),i=Date.parse(e.last_updated);if(""===e.state||!Number.isFinite(t)||!Number.isFinite(i))return;const s=this._points[this._points.length-1];s&&i<=s.time||(this._points=[...this._points,{time:i,value:t}])}render(){const e=a(this.hours),t=Date.now(),i=o(this._points,{start:t-3600*e*1e3,end:t}),s=d(i,300,48);if(!s)return _.qy``;const r=this._gradientId;return _.qy`
      <svg viewBox="0 0 300 48" preserveAspectRatio="none" aria-hidden="true">
        ${_.JW`
          <defs>
            <linearGradient id=${r} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="currentColor" stop-opacity="0.22"></stop>
              <stop offset="1" stop-color="currentColor" stop-opacity="0"></stop>
            </linearGradient>
          </defs>
          <path d=${s.area} fill=${`url(#${r})`}></path>
          <path class="line" d=${s.line}></path>
        `}
      </svg>
    `}}i("dwains-area-graph",u)}),c=()=>i(1055),l=i.cw(function(e,t){const i=["card","badgesCard","roomsCard","favoritesCard","personsCard","houseInfoCard","devicesCard","areasCard","headerCard","footerCard","header","bodyCard","servicesCard","shortcutsCard","chipsCard"];function a(e,t,i){if(e)try{e.hass=t}catch(e){i("Failed to propagate Home Assistant to a homepage child",e)}}function s(e){return e?.entity?{type:"entities",entities:[e.entity]}:Array.isArray(e?.entities)&&e.entities.length?{type:"entities",entities:e.entities}:e?.card?.entity?{type:"entities",entities:[e.card.entity]}:Array.isArray(e?.card?.entities)&&e.card.entities.length?{type:"entities",entities:e.card.entities}:{type:"entities",entities:[]}}e.exports={createHomepageCardElement:async function({helpers:e,config:t,hass:i,createCardElement:r,reportError:o=(e,t)=>console.error(e,t)}){let n;try{n=await r(e,t,i)}catch(a){o("Failed to create homepage card; using entities fallback",a),n=await r(e,s(t),i)}return i&&a(n,i,o),n},propagateHomepageHass:function(e,t,{reportError:s=(e,t)=>console.error(e,t)}={}){const r=new Set,o=e=>{e&&!r.has(e)&&(r.add(e),a(e,t,s))};for(const t of i){const i=e[t];Array.isArray(i)?i.forEach(o):o(i)}for(const t of Object.values(e)){const e=Array.isArray(t)?t:[t];for(const t of e)t&&"object"==typeof t&&("hass"in t&&o(t),o(t.card),o(t.badgesCard))}}}}),h=i.cw(function(e,t){const i=new Set(["client","enabled","disabled"]);function a(e){return e?.homepage_header||{}}function s(e,t){const s=a(e)[t]||"client";return i.has(s)?s:"client"}function r(e,t=[]){return void 0===e?[...t]:Array.isArray(e)?e:e?[e]:[]}function o(e,t,i,s){return[...new Set([...r((e?.areas?.[t]||{})[i]),...r(a(e)[s])])]}e.exports={areaBinarySensorDeviceClasses:function(e){return r(a(e).area_binary_sensor_device_classes)},areaBinarySensorEntities:function(e,t){return o(e,t,"binary_sensor_entities","area_binary_sensor_entities")},areaSensorDeviceClasses:function(e){const t=a(e);return Object.prototype.hasOwnProperty.call(t,"area_sensor_device_classes")?Array.isArray(t.area_sensor_device_classes)?t.area_sensor_device_classes:[]:["temperature","humidity"]},areaSensorEntities:function(e,t){return o(e,t,"sensor_entities","area_sensor_entities")},groupingMode:s,readBooleanCookie:function(e,t,i=!1){const a=e.get(t);return void 0===a?i:"false"!==a},resolveGroupingPreference:function(e,t,i){const a=s(e,t);return"enabled"===a||"disabled"!==a&&i}}}),p=()=>i(4396),u=i(2330),m=i(4849),g=i(9165),_=i(6684),f=i(3196),y=i(5890),b=i(3475),v=i(1621),w=i(4169),x=i(216);const{areaBinarySensorDeviceClasses:$,areaBinarySensorEntities:k,areaSensorDeviceClasses:C,areaSensorEntities:E}=h(),{collectAreaBinarySensorValues:A,entityBelongsToArea:S,summaryTranslationKey:D}=a(),{collectAreaSensorValues:q}=o();d();const O=e=>class extends e{_areaGraph(e){const t=this.configuration.areas?this.configuration.areas[e]:void 0,i=t&&t.graph_entity;return i&&this._hass.states[i]?{entityId:i,hours:t.graph_hours}:void 0}_renderAreaButtons(e){const t=e.some(e=>this._areaGraph(e.area.area_id))?"with-graphs":"";if(this.areaDisplayGrouped){e.sort(function(e,t){let i=e.floor,a=t.floor;return i==a?0:i>a?1:-1}),e.sort(function(e,t){let i=e.grouped_sort_order,a=t.grouped_sort_order;return i==a?0:i>a?1:-1});let i=e.reduce((e,t)=>(e[t.floor]=[...e[t.floor]||[],t],e),{});return _.qy`
        <div>
        ${Object.keys(i).map(e=>_.qy`
            <div class="mb-5">
              <h3 class="font-semibold capitalize text-gray">${e.replace(/_/g," ")}</h3>
              <div class="grid grid-cols-2 dd-overview-grid md-grid-cols-3 ${this.configuration.homepage_header.v2_mode?"lg-grid-cols-4 xl-grid-cols-5":""} gap-4 sortable ${t}">
              ${Object.entries(i[e]).map(([e,t])=>_.qy`${this._renderAreaButton(t)}`)}
              </div>
            </div>
          `)}
        </div>
        `}return _.qy`
          <div class="grid grid-cols-2 dd-overview-grid md-grid-cols-3 ${this.configuration.homepage_header.v2_mode?"lg-grid-cols-4 xl-grid-cols-5":""} gap-4 sortable ${t}">
            ${e.map(e=>this._renderAreaButton(e))}
          </div>`}_renderAreaButtonCard(e,t){return _.qy`
        <div>
          <ha-card class="p-2">
            ${(0,v.A)(this._hass,"area.title")}:<br>
            <span class="break-words">
            ${e.name}
            </span>
          </ha-card>
          <ha-card>
            <div class="card-actions">
              <ha-button
                .areaId="${e.area_id}"
                .key=${"disabled"}
                .ddValue=${!1}
                @click=${this._handleAreaEditBoolValueClick}
              >
                ${(0,v.A)(this._hass,"area.enable")}
              </ha-button>
            </div>
          </ha-card>
        </div>
      `}_areaSensorDeviceClasses(){return C(this.configuration)}_areaBinarySensorDeviceClasses(){return $(this.configuration)}_areaBinarySensorEntities(e){return k(this.configuration,e)}_areaSensorEntities(e){return E(this.configuration,e)}_areaBinarySensorLabel(e){return(0,v.A)(this._hass,`device.${e}`,void 0,e.replace(/_/g," "))}_translateAreaBinarySensorText(e,t={}){let i=(0,v.A)(this._hass,e,void 0,e);return Object.entries(t).forEach(([e,t])=>{i=i.replace(new RegExp(`\\{${e}\\}`,"g"),t)}),i}_isAvailableEntity(e){return e&&!y.s7.includes(e.state)}_areaBinarySensorSummary(e,t){const i=this._areaBinarySensorLabel(e);return this._translateAreaBinarySensorText(D(e,t),{count:t,label:i})}_entityBelongsToArea(e,t){return S(e,t,{entitiesById:this.entitiesById,entities:this.entities,devicesById:this.devicesById})}_areaEntityIdsForArea(e){return(this.entitiesByAreaId?.get(e)||[]).filter(e=>!e.hidden_by).filter(e=>!(this.configuration.entities[e.entity_id]&&this.configuration.entities[e.entity_id].disabled)).filter(e=>this._hass.states[e.entity_id]).map(e=>e.entity_id)}_renderAreaBadges(e,t){const i=[],a=(e,t,a,s,r)=>i.push({priority:e,icon:t,count:a,title:s,toggle:r});for(const e of y.Zz){if(!(e in t))continue;const i=this._isOn(t,e);("light"==e||i)&&a("light"==e?0:2,y.qJ[e][i?"on":"off"],i,this._badgeTitle(e,i),e)}for(const e of y.Ti)if(e in t)for(const i of y.gJ[e]){const s=this._isOn(t,e,i),r=y.qJ[e][i];s&&r&&a(y.Hh.includes(i)?1:3,r,s,this._badgeTitle(i,s))}for(const e of y.K5)if(e in t)for(const i of y.gJ[e]){const s=this._coverOpenCount(t,i),r=y.qJ[e][i];s&&r&&a(4,r,s,this._badgeTitle(i,s))}for(const e of y.R9){if(!(e in t))continue;const i=this._isOn(t,e);i&&a(5,y.qJ[e].on,i,this._badgeTitle(e,i))}return i.sort((e,t)=>e.priority-t.priority),_.qy`
        <div class="row-span-2 text-right space-y-0.5 info">
          ${i.map(t=>t.toggle?_.qy`
            <span
              class="info-badge toggle-badge badge-${t.toggle} inline-flex items-center px-1 py-0.5 rounded text-xs font-medium"
              title=${(0,v.A)(this._hass,t.count?"area.toggle_all_off":"area.toggle_all_on").replace("{domain}",(0,v.A)(this._hass,"device."+t.toggle))}
              data-summary=${t.title}
              role="button"
              .domain=${t.toggle}
              .area_id=${e.area.area_id}
              .state=${t.count}
              @click=${this._toggle}
            >
              <ha-icon class="${t.count?"on":"off"} w-6 h-6 mr-0.5" .icon=${t.icon}></ha-icon>
              ${t.count}
            </span>
          `:_.qy`
            <span class="info-badge inline-flex items-center px-1 py-0.5 rounded text-xs font-medium" title=${t.title} data-summary=${t.title}>
              <ha-icon class="w-6 h-6 mr-0.5" .icon=${t.icon}></ha-icon> ${t.count}
            </span>
          `)}
          <span class="info-badge more-badge inline-flex items-center px-1 py-0.5 rounded text-xs font-medium" style="display: none"></span>
        </div>
      `}_fitAreaBadges(){this.shadowRoot&&this.shadowRoot.querySelectorAll(".area-button .info").forEach(e=>{const t=e.querySelector(".more-badge");if(!t)return;const i=Array.from(e.children).filter(e=>e!==t);i.forEach(e=>{e.style.display&&(e.style.display="")}),t.style.display="none";const a=e.closest(".area-button")?.querySelector("h3")?.parentElement;if(a&&i.length){const t=a.getBoundingClientRect().top-e.getBoundingClientRect().top-4,s=`${Math.max(t,i[0].offsetHeight)}px`;e.style.maxHeight!==s&&(e.style.maxHeight=s)}let s=i.length?1:0,r=i.length;for(let e=1;e<i.length;e++)i[e].offsetTop<=i[e-1].offsetTop&&(1===s&&(r=e),s++);if(s<=2)return;const o=Math.max(1,2*r-1),n=i.slice(o);n.forEach(e=>{e.style.display="none"}),t.textContent=`+${n.length}`,t.title=n.map(e=>e.dataset.summary).join(" · "),t.style.display=""})}_badgeTitle(e,t){return(0,v.A)(this._hass,D(e,t)).replace("{count}",t).replace("{label}",(0,v.A)(this._hass,"device."+e))}_binarySensorStateLabel(e){if(!e)return"";const t=e.attributes.device_class||"_";return this._hass.localize(`component.binary_sensor.entity_component.${t}.state.${e.state}`)||this._hass.localize(`component.binary_sensor.entity_component._.state.${e.state}`)||e.state}_areaBinarySensorValues(e){const t=e.area_id;return A({areaId:t,areaEntityIds:this._areaEntityIdsForArea(t),states:this._hass.states,deviceClasses:this._areaBinarySensorDeviceClasses(),explicitEntityIds:this._areaBinarySensorEntities(t),unavailableStates:y.s7,offStates:y.jj,belongsToArea:(e,t)=>this._entityBelongsToArea(e,t),summary:(e,t)=>this._areaBinarySensorSummary(e,t),displayName:e=>this._entityDisplayName(e),stateLabel:e=>this._binarySensorStateLabel(e)})}_areaValues(e,t=this._entitiesByDomain(e.entities)){const i=q({areaId:e.area.area_id,deviceClasses:this._areaSensorDeviceClasses(),average:e=>y.Xt.map(i=>this._average(t,i,e)).find(Boolean),explicitEntityIds:this._areaSensorEntities(e.area.area_id),states:this._hass.states,unavailableStates:y.s7,belongsToArea:(e,t)=>this._entityBelongsToArea(e,t),displayName:e=>this._entityDisplayName(e),locale:this._hass?.locale?.language||this._hass?.language});return i.push(...this._areaBinarySensorValues(e.area)),i}_renderAreaButton(e){const t=this._entitiesByDomain(e.entities),i=this._areaValues(e,t),a=this.configuration.areas?this.configuration.areas[e.area.area_id]:void 0,s=a&&a.hide_icon?"":a&&a.icon||e.area.icon||"mdi:texture-box",r=this._areaGraph(e.area.area_id);return _.qy`
        <div class="relative" data-area-id='${e.area.area_id}'>
          <div
            class="flex justify-between h-44 p-3 area-button ${r?"has-graph":""} ${this.selectedArea!=e.area.area_id||this.configuration.homepage_header.v2_mode?"":"current"}"
            data-area-id='${e.area.area_id}'
            @click=${this._handleAreaClick}
            .lightState=${this._isOn(t,"light")}
            @dblclick="${this._handleAreaDoubleClick}"
          >
            ${r?_.qy`
              <div
                class="area-graph"
                title=${(0,v.A)(this._hass,"area.graph_open_history")}
                .entity=${r.entityId}
                @click=${this._handleGraphClick}
                @dblclick=${e=>e.stopPropagation()}
              >
                <dwains-area-graph
                  .hass=${this._hass}
                  .entity=${r.entityId}
                  .hours=${r.hours}
                ></dwains-area-graph>
              </div>
            `:""}
            <div class="h-full flex flex-wrap content-between">
              <div class="w-full ha-icon">
                ${s?_.qy`
                  <ha-icon
                    class="h-14 w-14"
                    style="color: var(--primary-color);"
                    .hass=${this._hass}
                    .icon=${s}
                  ></ha-icon>
                `:""}
              </div>
              <div class="w-full">
                <h3 class="font-semibold text-lg">${e.area.name}</h3>
                ${i.length?_.qy`
                    <div
                      class="sensors text-gray"
                      title="${i.join(" · ")}"
                    >
                      ${i.map((e,t)=>_.qy`
                        <span class="sensor-chip">${e}</span>${t<i.length-1?_.qy`<span class="sensor-separator"> · </span>`:""}
                      `)}
                    </div>`:""}
                <span class="text-gray text-sm capitalize">${this._climateState(t,"climate")}</span>
              </div>
            </div>
            ${this._renderAreaBadges(e,t)}
          </div>
          ${this.areaEditMode?_.qy`
            <ha-card>
              <div class="card-actions-multiple">
                <div class="sortable-move">
                  <ha-icon
                    .icon=${"mdi:cursor-move"}
                  >
                  </ha-icon>
                </div>
                <ha-button
                  .area_id=${e.area.area_id}
                  .area_icon=${this.configuration.areas[e.area.area_id]&&this.configuration.areas[e.area.area_id].icon?this.configuration.areas[e.area.area_id].icon:""}
                  .disable_area=${!(!this.configuration.areas[e.area.area_id]||!this.configuration.areas[e.area.area_id].disabled)&&this.configuration.areas[e.area.area_id].disabled}
                  .hide_icon=${!(!this.configuration.areas[e.area.area_id]||!this.configuration.areas[e.area.area_id].hide_icon)&&this.configuration.areas[e.area.area_id].hide_icon}

                  @click=${this._handleAreaEditClick}
                >
                  ${this._hass.localize("ui.components.entity.entity-picker.edit")}
                </ha-button>
              </div>
            </ha-card>
            `:""}
        </div>
      `}},{entityRecoveryActions:H}=c(),T=e=>class extends e{_renderAreaViewCustomCards(e,t){return _.qy`
      <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 xl-grid-cols-4 gap-4 my-4">
        ${"bottom"==t?e.customCardsBottom.map(e=>_.qy`${this._renderAreaViewCustomCard(e)}`):e.customCardsTop.map(e=>_.qy`${this._renderAreaViewCustomCard(e)}`)}
      </div>
      `}_renderAreaViewCustomCard(e){return _.qy`
	      <div class="col-span-${e.colSpan} row-span-${e.rowSpan} lg-col-span-${e.colSpanLg} lg-row-span-${e.rowSpanLg} xl-col-span-${e.colSpanXl} xl-row-span-${e.rowSpanXl} relative">
	        <div>
	          <dd-lazy-card .card=${e.card} .cardFactory=${e.cardFactory} .hass=${this._hass}></dd-lazy-card>
	        </div>
        ${this.areaViewEditMode?_.qy`
        <ha-card>
          <div class="card-actions">
            <ha-button
              @click=${this._handleCustomCardEditClick}
              .area_id=${e.area_id}
              .filename=${e.filename}
              .rowSpan=${e.rowSpan}
              .colSpan=${e.colSpan}
              .rowSpanLg=${e.rowSpanLg}
              .colSpanLg=${e.colSpanLg}
              .rowSpanXl=${e.rowSpanXl}
              .colSpanXl=${e.colSpanXl}
            >
            ${this._hass.localize("ui.components.entity.entity-picker.edit")}
            </ha-button>
          </div>
        </ha-card>`:""}
      </div>
      `}_areaViewGridLayout(){return this.areaViewEditMode?"":this._masonryEnabled()?"dd-masonry":"dd-uniform"}_hideUnavailableEntitiesEnabled(){return!!(this.configuration&&this.configuration.homepage_header&&this.configuration.homepage_header.hide_unavailable_entities)}_filterUnavailableCards(e){return this.areaViewEditMode||this.favoriteEditMode||!this._hideUnavailableEntitiesEnabled()?e:e.filter(e=>{const t=this._hass.states[e.entity];return!(t&&"unavailable"===t.state)})}_renderAreaViewCards(e){const t=this._filterUnavailableCards(e.cards);if(this.areaViewDisplayGrouped){t.sort(function(e,t){let i=e.grouped_sort_order,a=t.grouped_sort_order;return i==a?0:i>a?1:-1});let e=t.reduce((e,t)=>(e[t.domain]=[...e[t.domain]||[],t],e),{}),i=Object.keys(e).sort((e,t)=>{let i=this.configuration.devices[e]&&this.configuration.devices[e].sort_order?this.configuration.devices[e].sort_order:99,a=this.configuration.devices[t]&&this.configuration.devices[t].sort_order?this.configuration.devices[t].sort_order:99;return i==a?0:i>a?1:-1});return _.qy`
        <div>
        ${i.map(t=>_.qy`
            <div class="mb-5">
              <h3 class="font-semibold capitalize text-gray">${(0,v.A)(this._hass,"device."+t)}</h3>
              <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 xl-grid-cols-4 gap-4 sortable area-view-entity-sortable ${this._areaViewGridLayout()}">
                ${Object.entries(e[t]).map(([e,t])=>_.qy`${this._renderAreaViewCard(t)}`)}
              </div>
            </div>
          `)}
        </div>
        `}return t.sort(function(e,t){let i=e.sort_order,a=t.sort_order;return i==a?0:i>a?1:-1}),_.qy`
	        <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 xl-grid-cols-4 gap-4 sortable area-view-entity-sortable ${this._areaViewGridLayout()}">
	          ${t.map(e=>_.qy`${this._renderAreaViewCard(e)}`)}
	        </div>
	        `}_renderEntityAreaVisibilityAction(e){const t=!0===this.configuration?.entities?.[e]?.hidden_in_area;return _.qy`
        <ha-dropdown-item
          @click=${i=>this._handleEntityAreaVisibilityClick(i,e,!t)}
        >
          <ha-icon slot="icon" .icon=${t?"mdi:eye":"mdi:eye-off"}></ha-icon>
          ${(0,v.A)(this._hass,t?"entity.unhide_in_area":"entity.hide_in_area")}
        </ha-dropdown-item>
      `}_renderAreaViewCard(e){return _.qy`
	      <div
	        data-entity='${e.entity}'
	        class="col-span-${e.colSpan} row-span-${e.rowSpan} lg-col-span-${e.colSpanLg} lg-row-span-${e.rowSpanLg} xl-col-span-${e.colSpanXl} xl-row-span-${e.rowSpanXl} relative"
	      >
	        <div>
	          <dd-lazy-card .card=${e.card} .cardFactory=${e.cardFactory} .hass=${this._hass}></dd-lazy-card>
	        </div>
        ${this.areaViewEditMode?_.qy`
        <ha-card>
          <div class="card-actions-multiple">
            <div class="sortable-move">
              <ha-icon
                .icon=${"mdi:cursor-move"}
              >
              </ha-icon>
            </div>
            <ha-dropdown
              class="ha-icon-overflow-menu-overflow"
              placement="bottom-end"
            >
              <ha-icon-button
                label=${this._hass.localize("ui.common.overflow_menu")}
                .path=${g.TdJ}
                slot="trigger"
              ></ha-icon-button>
                <ha-dropdown-item
                  .entity="${e.entity}"
                  .friendlyName="${e.friendlyName}"
                  .disableEntity=${e.disableEntity}
                  .hideEntity=${e.hideEntity}
                  .excludeEntity=${e.excludeEntity}
                  .rowSpan=${e.rowSpan}
                  .colSpan=${e.colSpan}
                  .rowSpanLg=${e.rowSpanLg}
                  .colSpanLg=${e.colSpanLg}
                  .rowSpanXl=${e.rowSpanXl}
                  .colSpanXl=${e.colSpanXl}
                  .customCard=${e.customCard}
                  .customPopup=${e.customPopup}
                  @click=${this._handleEntityEditClick}
                >
                  <ha-icon slot="icon" .icon=${"mdi:cog"}></ha-icon>
                  ${(0,v.A)(this._hass,"entity.settings")}
                </ha-dropdown-item>
                ${"t"!=e.entity?_.qy`
                  <ha-dropdown-item
                    .entity="${e.entity}"
                    @click="${this._handleEntityEditCardClick}"
                  >
                    <ha-icon slot="icon" .icon=${"mdi:pencil"}></ha-icon>
                    ${(0,v.A)(this._hass,"entity.entity_card")}
                  </ha-dropdown-item>`:""}
                ${"t"!=e.entity?_.qy`
                  <ha-dropdown-item
                    .entity="${e.entity}"
                    @click="${this._handleEntityEditPopupClick}"
                  >
                    <ha-icon slot="icon" .icon=${"mdi:pencil-box-multiple"}></ha-icon>
                    ${(0,v.A)(this._hass,"entity.popup_card")}
                  </ha-dropdown-item>`:""}
                ${e.isFavorite?"":_.qy`
                  <ha-dropdown-item
                    .entity="${e.entity}"
                    @click="${this._handleEntityAddToFavoritesClick}"
                  >
                    <ha-icon slot="icon" .icon=${"mdi:tag-heart"}></ha-icon>
                    ${(0,v.A)(this._hass,"entity.add_to_favorites")}
                  </ha-dropdown-item>`}
                <ha-dropdown-item
                  .entity="${e.entity}"
                  .key=${"excluded"}
                  .ddValue=${!0}
                  @click=${this._handleEntityEditBoolValueClick}
                >
                  <ha-icon slot="icon" .icon=${"mdi:table-eye-off"}></ha-icon>
                  ${(0,v.A)(this._hass,"entity.exclude")}
                </ha-dropdown-item>
                <ha-dropdown-item
                  .entity="${e.entity}"
                  .key=${"hidden"}
                  .ddValue=${!0}
                  @click=${this._handleEntityEditBoolValueClick}
                >
                  <ha-icon slot="icon" .icon=${"mdi:eye-off"}></ha-icon>
                  ${(0,v.A)(this._hass,"entity.hide")}
                </ha-dropdown-item>
                ${this._renderEntityAreaVisibilityAction(e.entity)}
                <ha-dropdown-item
                  .entity="${e.entity}"
                  .key=${"disabled"}
                  .ddValue=${!0}
                  @click=${this._handleEntityEditBoolValueClick}
                >
                  <ha-icon slot="icon" .icon=${"mdi:tray-remove"}></ha-icon>
                  ${(0,v.A)(this._hass,"entity.disable")}
                </ha-dropdown-item>
            </ha-dropdown>
          </div>
        </ha-card>`:""}
      </div>
      `}_renderAreaViewEntityCard(e,t){const i=H(this.configuration,e,t);return _.qy`
        <div>
          <ha-card class="p-2">
            ${(0,v.A)(this._hass,"entity.title")}:<br>
            <span class="break-words">
            ${e}
            </span>
          </ha-card>
          <ha-card>
            <div class="card-actions">
              ${i.map(t=>_.qy`
                <ha-button
                  .entity="${e}"
                  .key=${t.key}
                  .ddValue=${!1}
                  @click=${this._handleEntityEditBoolValueClick}
                >
                  ${(0,v.A)(this._hass,t.translationKey)}
                </ha-button>
              `)}
              <ha-button
                .entity="${e}"
                @click=${this._handleUnavailableEntityEditClick}
              >
                <ha-svg-icon .path=${g.CZ3}></ha-svg-icon>
                ${(0,v.A)(this._hass,"entity.settings")}
              </ha-button>
            </div>
          </ha-card>
        </div>
      `}_renderAreaView(e){if(this.__ddVisited=this.__ddVisited||{},this.selectedArea==e.area.area_id&&(this.__ddVisited[e.area.area_id]=!0),!this.__ddVisited[e.area.area_id])return _.qy``;const t=this.selectedArea==e.area.area_id?"block":"hidden";return e.cards.sort(function(e,t){let i=e.domain,a=t.domain;return i==a?0:i>a?1:-1}),_.qy`
          <div class="dd-area-view w-full mb-12 ${t}" id="${e.area.area_id}">
            <div class="dd-area-view-header dd-detail-view-header flex justify-between ${this.configuration.homepage_header.v2_mode?"with-back":""}">
              <ha-icon-button
                class="dd-area-view-back"
                label=${this._hass.localize("ui.common.back")||"Back"}
                .path=${g.NSe}
                @click=${this._backButtonClick}
              ></ha-icon-button>
              <div class="dd-area-view-title dd-detail-view-title sticky top-0">
                <h2 class="font-semibold text-lg">
                  ${e.area.name}
                </h2>
                <span class="text-gray">
                  ${[...this._areaValues(e),`${e.cards.length} ${(0,v.A)(this._hass,"entity.title_plural")}`].join(" · ")}
                </span>
              </div>
              <div>
                <ha-dropdown
                  class="ha-icon-overflow-menu-overflow"
                  placement="bottom-end"
                >
                  <ha-icon-button
                    label=${this._hass.localize("ui.common.overflow_menu")}
                    .path=${g.TdJ}
                    slot="trigger"
                  ></ha-icon-button>
                    ${"client"==this._areaViewGroupingMode()?_.qy`
                      ${this.areaViewDisplayGrouped?_.qy`
                        <ha-dropdown-item
                          .ddValue=${!1}
                          @click=${this._handleAreaViewDisplayGroupedClicked}
                        >
                          <ha-icon slot="icon" .icon=${"mdi:grid"}></ha-icon>
                          ${(0,v.A)(this._hass,"entity.ungroup")}
                        </ha-dropdown-item>
                        `:_.qy`
                        <ha-dropdown-item
                          .ddValue=${!0}
                          @click=${this._handleAreaViewDisplayGroupedClicked}
                        >
                          <ha-icon slot="icon" .icon=${"mdi:format-list-group"}></ha-icon>
                          ${(0,v.A)(this._hass,"entity.group")}
                        </ha-dropdown-item>`}
                    `:""}
                    ${this._hass.user.is_admin?_.qy`
                      ${this.areaViewEditMode?_.qy`
                        <ha-dropdown-item
                          .ddValue=${!1}
                          @click=${this._handleAreaViewEditModeClicked}
                        >
                          <ha-svg-icon slot="icon" .path=${g.CZ3}></ha-svg-icon>
                          ${(0,v.A)(this._hass,"global.disable_edit_mode")}
                        </ha-dropdown-item>`:_.qy`
                        <ha-dropdown-item
                          .ddValue=${!0}
                          @click=${this._handleAreaViewEditModeClicked}
                        >
                          <ha-svg-icon slot="icon" .path=${g.CZ3}></ha-svg-icon>
                          ${(0,v.A)(this._hass,"global.enable_edit_mode")}
                        </ha-dropdown-item>
                        `}
                    `:""}
                </ha-dropdown>
              </div>
            </div>

            ${this.areaViewEditMode?_.qy`
            <ha-card class="card-actions-centered">
              <ha-button
                .area=${e.area.area_id}
                .key=${"disabled"}
                .ddValue=${!0}
                @click=${this._handleAreaDisableAllEntitiesClicked}
              >
                ${(0,v.A)(this._hass,"entity.disable_all")}
              </ha-button>
              <ha-button
                .area=${e.area.area_id}
                .key=${"hidden"}
                .ddValue=${!0}
                @click=${this._handleAreaDisableAllEntitiesClicked}
              >
                ${(0,v.A)(this._hass,"entity.hide_all")}
              </ha-button>
            </ha-card>

            <button type="button"
              @click=${this._addLovelaceCard}
              .area=${e.area.area_id}
              .areaName=${e.area.name}
              .position=${"top"}
              class="cursor-pointer my-4 relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <svg class="mx-auto h-12 w-12 text-gray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
              <span class="mt-2 block text-sm font-medium text-gray">
                ${this._hass.localize("ui.panel.lovelace.editor.edit_card.add")}
              </span>
            </button>`:""}

            ${this._renderAreaViewCustomCards(e,"top")}

            ${this._renderAreaViewCards(e)}

            ${this._renderAreaViewCustomCards(e,"bottom")}

            ${this.areaViewEditMode?_.qy`
              ${e.entitiesNoState.length?_.qy`
                <div class="mb-5">
                  <h3 class="font-semibold capitalize text-gray">${(0,v.A)(this._hass,"entity.unavailable")}</h3>
                  <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 gap-4">
                  ${e.entitiesNoState.map(e=>_.qy`${this._renderAreaViewEntityCard(e,"noState")}`)}
                  </div>
                </div>`:""}
              ${e.entitiesHidden.length?_.qy`
                <div class="mb-5">
                  <h3 class="font-semibold capitalize text-gray">${(0,v.A)(this._hass,"entity.hidden")}</h3>
                  <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 gap-4">
                  ${e.entitiesHidden.map(e=>_.qy`${this._renderAreaViewEntityCard(e,"hidden")}`)}
                  </div>
                </div>`:""}
              ${e.entitiesDisabled.length?_.qy`
                <div class="mb-5">
                  <h3 class="font-semibold capitalize text-gray">${(0,v.A)(this._hass,"entity.disabled")}</h3>
                  <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 gap-4">
                  ${e.entitiesDisabled.map(e=>_.qy`${this._renderAreaViewEntityCard(e,"disabled")}`)}
                  </div>
                </div>`:""}
            `:""}

            ${this.areaViewEditMode?_.qy`
            <button type="button"
              @click=${this._addLovelaceCard}
              .area=${e.area.area_id}
              .areaName=${e.area.name}
              .position=${"bottom"}
              class="cursor-pointer my-4 relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <svg class="mx-auto h-12 w-12 text-gray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
              <span class="mt-2 block text-sm font-medium text-gray">
                ${this._hass.localize("ui.panel.lovelace.editor.edit_card.add")}
              </span>
            </button>`:""}
          </div>`}},{EventSubscriptionOwner:z}=i(5179),{averageEntityStates:P,countActiveEntities:M,groupEntityStatesByDomain:R,isEntityHiddenInArea:j,localizedClimateState:V}=i(7903),{TimerOwner:L}=i(9792),{PopupOpenScheduler:I}=i(6138),{ReloadableLoadOwner:N}=i(5833),{hassConnectionIdentity:F,hasHassConnectionChanged:B}=i(9187),{websocketReadStore:U}=i(7069),{loadDashboardRegistrySnapshot:G}=i(5768),{resolveHass:W}=i(7610),{loadCardHelpers:X}=i(393),{loadSortable:J}=i(4725),{closeParentDropdown:Z}=i(9823),{defineDwainsElement:K}=n(),{attachDeferredCard:Y}=i(2815),{entitySettingsFromConfiguration:Q}=c(),{createHomepageCardElement:ee,propagateHomepageHass:te}=l(),{groupingMode:ie,readBooleanCookie:ae,resolveGroupingPreference:se}=h(),{formatValueWithUnit:re}=p();class oe extends(T(O(_.WF))){static get properties(){return{data:{},favorites:{},favoriteEditMode:{},selectedArea:{},areaEditMode:{},areaViewEditMode:{},areaViewDisplayGrouped:{},areaDisplayGrouped:{}}}constructor(){super(),this._subscriptions=new z,this._timers=new L,this._popupOpens=new I(this._timers),this._loads=new N(e=>this._loadConfiguration(e)),this._startedHass=void 0}async loadHelpers(){return X()}_entityDisplayName(e,t){const i=t||this.entitiesById?.get(e),a=i?.device_id?this.devicesById?.get(i.device_id):void 0;return(0,w.Hg)(this._hass,this.configuration,e,i,a)}set hass(e){const t=B(this._hass,e);this._hass=e,te(this,e),this.startedUp&&this._update_hass(e),t&&this.isConnected&&(this._subscriptions.disconnect(),this._subscriptions.connect()),this._startIfReady(t)}_update_hass(e){if(this._hass=e,te(this,e),null==this.data||0===this.data.length)return;if(this.data.forEach(t=>{t.area.area_id==this.selectedArea&&(t.cards.forEach(t=>{t.card&&(t.card.hass=e)}),t.customCardsTop.forEach(t=>{t.card&&(t.card.hass=e)}),t.customCardsBottom.forEach(t=>{t.card&&(t.card.hass=e)}))}),0!=this.favorites.length&&this.favorites.forEach(t=>{t.card&&(t.card.hass=e)}),this.badgesCard&&(this.badgesCard.hass=e),this.timeout)return void(this._pendingHassUpdate=!0);this.timeout=!0,this._pendingHassUpdate=!1;const t=this.areaEditMode||this.favoriteEditMode||this.areaViewEditMode?1e3:100;void 0===this._timers.schedule("hass-update-throttle",()=>{this.timeout=!1,this._pendingHassUpdate&&(this._pendingHassUpdate=!1,this.requestUpdate())},t)&&(this.timeout=!1,this._pendingHassUpdate=!1),this.requestUpdate()}async setConfig(e){this.startedUp=!1,this.timeout=!1,this._pendingHassUpdate=!1,this._hass||(this._hass=W()),this.selectedArea=window.location.hash.substring(1),this.areaEditMode=!1,this.favoriteEditMode=!1,this.areaViewEditMode=!1,this.areaViewDisplayGrouped=this._areaViewDisplayGroupedFromClient(),this.areaDisplayGrouped=this._areaDisplayGroupedFromClient(),this._config=e,this._cardHelpersReady=this.loadHelpers(),this.cardHelpers=await this._cardHelpersReady,await this._startIfReady()}_areaViewDisplayGroupedFromClient(){return ae(f.O,"dwains_dashboard_areaViewDisplayGrouped")}_areaViewGroupingMode(){return ie(this.configuration,"area_view_grouping_mode")}_areaViewDisplayGroupedFromPreference(){return se(this.configuration,"area_view_grouping_mode",this._areaViewDisplayGroupedFromClient())}_applyAreaViewGroupingPreference(){this.areaViewDisplayGrouped=this._areaViewDisplayGroupedFromPreference()}_areaDisplayGroupedFromClient(){return ae(f.O,"dwains_dashboard_areaDisplayGrouped")}_areaFloorGroupingMode(){return ie(this.configuration,"area_floor_grouping_mode")}_areaDisplayGroupedFromPreference(){return se(this.configuration,"area_floor_grouping_mode",this._areaDisplayGroupedFromClient())}_applyAreaDisplayGroupingPreference(){this.areaDisplayGrouped=this._areaDisplayGroupedFromPreference()}async connectedCallback(){super.connectedCallback(),this._subscriptions.connect(),this._timers.connect(),await this._startIfReady()}async _startIfReady(e=!1){const t=F(this._hass);if(!this.isConnected||!this._hass||!this._config||this._startedHass===t)return;this._hass;this._startedHass=t;try{this._cardHelpersReady&&(this.cardHelpers=await this._cardHelpersReady),e?await this._reloadCard():await this._loadData(),this.isConnected&&F(this._hass)===t&&this._startedHass===t&&(await this._subscribeReload(),this._scheduleIconRepoke())}catch(e){this._startedHass===t&&(this._startedHass=void 0),console.error("Error starting homepage card:",e)}}disconnectedCallback(){super.disconnectedCallback(),this._subscriptions.disconnect(),this._timers.disconnect(),this._startedHass=void 0,this._loads.invalidate(),this.timeout=!1,this._pendingHassUpdate=!1,this.__iconRepokeScheduled=!1,this.__masonryRO&&(this.__masonryRO.disconnect(),this.__masonryRO=void 0),this.__masonryRaf&&(cancelAnimationFrame(this.__masonryRaf),this.__masonryRaf=0),this.__masonryLayoutRaf&&(cancelAnimationFrame(this.__masonryLayoutRaf),this.__masonryLayoutRaf=0)}_subscribeReload(){return this._subscriptions.subscribeEvent("homepage",this._hass,"dwains_dashboard_homepage_card_reload",()=>{U.invalidate(this._hass),this._reloadCard().catch(e=>{console.error("Error reloading homepage card:",e)})})}updated(){this._scheduleIconRepoke(),this._scheduleMasonryLayout()}_masonryEnabled(){return!this.configuration?.homepage_header?.disable_masonry}_scheduleMasonryLayout(){this.__masonryLayoutRaf||(this.__masonryLayoutRaf=requestAnimationFrame(()=>{this.__masonryLayoutRaf=0,this._fitAreaBadges(),this._layoutMasonry()}))}_repokeIcons(){try{if(!this.shadowRoot)return;this.shadowRoot.querySelectorAll(".area-button ha-icon").forEach(e=>{const t=e.icon;if(!t||t.indexOf(":")<1)return;const i=e.shadowRoot,a=i&&i.querySelector("ha-svg-icon");if(a&&a.path)return;const s=i&&i.querySelector("svg path");s&&(s.getAttribute("d")||"").length||(e.icon="",e.icon=t)})}catch(e){console.error("Failed to repoke homepage icons",e)}}_scheduleIconRepoke(){if(this.__iconRepokeScheduled)return;this.__iconRepokeScheduled=!0;const e=[60,300,900,2e3,4e3,8e3,12e3];e.map((t,i)=>this._timers.schedule(`icon-repoke-${i}`,()=>{i===e.length-1&&(this.__iconRepokeScheduled=!1),this._repokeIcons()},t)).every(e=>void 0===e)&&(this.__iconRepokeScheduled=!1)}_layoutMasonry(){try{if(!this.shadowRoot)return;const e=this.shadowRoot.querySelectorAll(this.areaViewEditMode?".dd-masonry, .dd-fav-masonry, .area-view-entity-sortable":".dd-masonry, .dd-fav-masonry");if(!e.length)return;!this.__masonryRO&&"ResizeObserver"in window&&(this.__masonryRO=new ResizeObserver(()=>{this.__masonryRaf||(this.__masonryRaf=requestAnimationFrame(()=>{this.__masonryRaf=0,this._applyMasonrySpans()}))})),e.forEach(e=>{Array.from(e.children).forEach(e=>{try{this.__masonryRO&&this.__masonryRO.observe(e),this.__masonryRO&&e.firstElementChild&&this.__masonryRO.observe(e.firstElementChild)}catch(e){console.error("Failed to observe a homepage masonry item",e)}})}),this._applyMasonrySpans()}catch(e){console.error("Failed to update homepage masonry observers",e)}}_currentMasonryRowSpan(e){const t=window.innerWidth||0,i=Array.from(e.classList||[]);let a;a=t>=1536?i.find(e=>e.startsWith("xl-row-span-")):t>=1024?i.find(e=>e.startsWith("lg-row-span-")):i.find(e=>e.startsWith("row-span-"));const s=a?Number(a.split("-").pop()):1;return Number.isFinite(s)&&s>0?s:1}_applyMasonrySpans(){try{if(!this.shadowRoot)return;const e=Array.from(this.shadowRoot.querySelectorAll(".dd-fav-masonry, .dd-masonry"));e.map(e=>{const t=Array.from(e.children),i=t.map(e=>{const t=e.firstElementChild;return t?t.getBoundingClientRect().height:0}),a=i.filter((e,i)=>e>0&&1===this._currentMasonryRowSpan(t[i])).sort((e,t)=>e-t),s=a.length?a[Math.floor(a.length/2)]:0;return t.map((e,t)=>{const a=this._currentMasonryRowSpan(e),r=Math.max(i[t],a>1?a*s+16*(a-1):0);return[e,r>0?Math.ceil((r+16)/8):void 0]})}).flat().forEach(([e,t])=>{const i=t&&`span ${t} / span ${t}`;i&&e.style.gridRow!==i&&(e.style.gridRow=i)}),this.shadowRoot.querySelectorAll(".area-view-entity-sortable:not(.dd-masonry) > *, .sortable:not(.dd-fav-masonry):not(.dd-masonry) > *").forEach(e=>{e.style.gridRow&&(e.style.gridRow="")})}catch(e){console.error("Failed to apply homepage masonry spans",e)}}async _reloadCard(){await this._loads.reload(),this.requestUpdate()}_loadData(){return this._loads.load()}async _loadConfiguration({isCurrent:e=()=>!0}={}){this.startedUp=!1;const t=await G(this._hass,{includeFloors:!0});if(!e())return;Object.assign(this,t),this._applyAreaViewGroupingPreference(),this._applyAreaDisplayGroupingPreference();const i=[],a=[];if(null==this.areas||0===this.areas.length||null==this.devices||0===this.devices.length||null==this.entities||0===this.entities.length||null==this.configuration||0===this.configuration.length);else{const[t,s]=await Promise.all([this.createCardElement2({type:"custom:dwains-notification-card",hass:this._hass}),this.createCardElement2({type:"custom:dwains-house-information-card",hass:this._hass})]);if(!e())return;if(this.notificationCard=t,this.badgesCard=s,this.configuration.entities){const e=[];await Promise.all(Object.entries(this.configuration.entities).map(async([t,i])=>{if(i.favorite){const i=(0,b.mD)(t),a=!!this.configuration.entities[t]&&!!this.configuration.entities[t].hidden,s=!!this.configuration.entities[t]&&!!this.configuration.entities[t].excluded,r=this.configuration.entities[t]?this.configuration.entities[t].friendly_name:"",o=this._entityDisplayName(t),n=!(!this.configuration.entities[t]||!this.configuration.entities[t].custom_card)&&this.configuration.entities[t].custom_card,d=!(!this.configuration.entities[t]||!this.configuration.entities[t].custom_popup)&&this.configuration.entities[t].custom_popup,c=!(!this.configuration.entities[t]||!this.configuration.entities[t].favorite)&&this.configuration.entities[t].favorite;let l={},h="1",p="1",u="1",m="1",g="1",_="1";if(n&&this.configuration.entity_cards&&this.configuration.entity_cards[t])l={input_name:o,input_entity:t,...this.configuration.entity_cards[t]};else if(this.configuration.devices_card[i])l={input_name:o,input_entity:t,...this.configuration.devices_card[i]};else if("sensor"===i&&this._hass&&this._hass.states[t]?.attributes?.unit_of_measurement&&!this.configuration.homepage_header.disable_sensor_graph)l={graph:"line",type:"sensor",hours_to_show:24,detail:1,entity:t,...o?{name:o}:{}};else{switch(i){default:l=o?{type:"tile",name:o}:{type:"tile"};break;case"camera":l={type:"picture-entity",camera_view:"auto"},h="2",p="2",u="2",m="2",g="2",_="2";break;case"climate":l=o?{type:"thermostat",name:o,features:[{type:"climate-fan-modes",fan_modes:["quiet","low","medium","high"]},{type:"climate-hvac-modes",hvac_modes:["heat_cool","heat","dry","fan_only","cool","off"]}]}:{type:"thermostat",features:[{type:"climate-fan-modes",fan_modes:["quiet","low","medium","high"]},{type:"climate-hvac-modes",hvac_modes:["heat_cool","heat","dry","fan_only","cool","off"]}]};break;case"cover":l=o?{type:"tile",name:o,features:[{type:"cover-open-close"},{type:"cover-position"}]}:{type:"tile",features:[{type:"cover-open-close"},{type:"cover-position"}]};break;case"light":l=o?{type:"tile",name:o,features:[{type:"light-brightness"}]}:{type:"tile",features:[{type:"light-brightness"}]}}l={entity:t,...l}}this.configuration.entities[t]&&this.configuration.entities[t].row_span&&(h=this.configuration.entities[t].row_span),this.configuration.entities[t]&&this.configuration.entities[t].col_span&&(p=this.configuration.entities[t].col_span),this.configuration.entities[t]&&this.configuration.entities[t].row_span_lg&&(u=this.configuration.entities[t].row_span_lg),this.configuration.entities[t]&&this.configuration.entities[t].col_span_lg&&(m=this.configuration.entities[t].col_span_lg),this.configuration.entities[t]&&this.configuration.entities[t].row_span_xl&&(g=this.configuration.entities[t].row_span_xl),this.configuration.entities[t]&&this.configuration.entities[t].col_span_xl&&(_=this.configuration.entities[t].col_span_xl),e.push(Y({domain:i,entity:t,rowSpan:h,colSpan:p,rowSpanLg:u,colSpanLg:m,rowSpanXl:g,colSpanXl:_,friendlyName:r,hideEntity:a,excludeEntity:s,customCard:n,customPopup:d,isFavorite:c,favorite_sort_order:this.configuration.entities[t]&&this.configuration.entities[t].favorite_sort_order?this.configuration.entities[t].favorite_sort_order:99},()=>this.createCardElement2(l)))}})),this.favorites=e}for(const e of this.areas)if(this.configuration.areas[e.area_id]&&this.configuration.areas[e.area_id].disabled)a.push(e);else{const t=new Set,a=[],s=[],r=[],o=[],n=[],d=[];for(const i of this.entitiesByAreaId.get(e.area_id)||[]){if(i.hidden_by)continue;const e=this.configuration.entities?.[i.entity_id];if(j(e)){r.push(i.entity_id);continue}if(!!this.configuration.entities[i.entity_id]&&!!this.configuration.entities[i.entity_id].disabled){o.push(i.entity_id);continue}const n=i.entity_id.slice(0,i.entity_id.indexOf("."));if(this._hass.states[i.entity_id]){const e=!!this.configuration.entities[i.entity_id]&&!!this.configuration.entities[i.entity_id].hidden,s=!!this.configuration.entities[i.entity_id]&&!!this.configuration.entities[i.entity_id].excluded,o=this.configuration.entities[i.entity_id]?this.configuration.entities[i.entity_id].friendly_name:"",d=this._entityDisplayName(i.entity_id,i),c=!(!this.configuration.entities[i.entity_id]||!this.configuration.entities[i.entity_id].custom_card)&&this.configuration.entities[i.entity_id].custom_card,l=!(!this.configuration.entities[i.entity_id]||!this.configuration.entities[i.entity_id].custom_popup)&&this.configuration.entities[i.entity_id].custom_popup,h=!(!this.configuration.entities[i.entity_id]||!this.configuration.entities[i.entity_id].favorite)&&this.configuration.entities[i.entity_id].favorite;if(e)r.push(i.entity_id),t.add(i.entity_id);else{let r={},p="1",u="1",m="1",g="1",_="1",f="1";if(c&&this.configuration.entity_cards&&this.configuration.entity_cards[i.entity_id])r={input_name:d,input_entity:i.entity_id,...this.configuration.entity_cards[i.entity_id]};else if(this.configuration.devices_card[n])r={input_name:d,input_entity:i.entity_id,...this.configuration.devices_card[n]};else if("sensor"===n&&this._hass&&this._hass.states[i.entity_id]?.attributes?.unit_of_measurement&&!this.configuration.homepage_header.disable_sensor_graph)r={graph:"line",type:"sensor",hours_to_show:24,detail:1,entity:i.entity_id,...d?{name:d}:{}};else{switch(n){default:r=d?{type:"tile",name:d}:{type:"tile"};break;case"camera":r={type:"picture-entity",camera_view:"auto"},p="2",u="2",m="2",g="2",_="2",f="2";break;case"climate":r=d?{type:"thermostat",name:d,features:[{type:"climate-fan-modes",fan_modes:["quiet","low","medium","high"]},{type:"climate-hvac-modes",hvac_modes:["heat_cool","heat","dry","fan_only","cool","off"]}]}:{type:"thermostat",features:[{type:"climate-fan-modes",fan_modes:["quiet","low","medium","high"]},{type:"climate-hvac-modes",hvac_modes:["heat_cool","heat","dry","fan_only","cool","off"]}]};break;case"cover":r=d?{type:"tile",name:d,features:[{type:"cover-open-close"},{type:"cover-position"}]}:{type:"tile",features:[{type:"cover-open-close"},{type:"cover-position"}]};break;case"light":r=d?{type:"tile",name:d,features:[{type:"light-brightness"}]}:{type:"tile",features:[{type:"light-brightness"}]}}r={entity:i.entity_id,...r}}this.configuration.entities[i.entity_id]&&this.configuration.entities[i.entity_id].row_span&&(p=this.configuration.entities[i.entity_id].row_span),this.configuration.entities[i.entity_id]&&this.configuration.entities[i.entity_id].col_span&&(u=this.configuration.entities[i.entity_id].col_span),this.configuration.entities[i.entity_id]&&this.configuration.entities[i.entity_id].row_span_lg&&(m=this.configuration.entities[i.entity_id].row_span_lg),this.configuration.entities[i.entity_id]&&this.configuration.entities[i.entity_id].col_span_lg&&(g=this.configuration.entities[i.entity_id].col_span_lg),this.configuration.entities[i.entity_id]&&this.configuration.entities[i.entity_id].row_span_xl&&(_=this.configuration.entities[i.entity_id].row_span_xl),this.configuration.entities[i.entity_id]&&this.configuration.entities[i.entity_id].col_span_xl&&(f=this.configuration.entities[i.entity_id].col_span_xl),a.push(Y({domain:n,entity:i.entity_id,rowSpan:p,colSpan:u,rowSpanLg:m,colSpanLg:g,rowSpanXl:_,colSpanXl:f,friendlyName:o,hideEntity:e,excludeEntity:s,customCard:c,customPopup:l,isFavorite:h,sort_order:this.configuration.entities[i.entity_id]&&this.configuration.entities[i.entity_id].sort_order?this.configuration.entities[i.entity_id].sort_order:99,grouped_sort_order:this.configuration.entities[i.entity_id]&&this.configuration.entities[i.entity_id].grouped_sort_order?this.configuration.entities[i.entity_id].grouped_sort_order:99},()=>this.createCardElement2(r))),t.add(i.entity_id)}}else s.push(i.entity_id)}0!==this.configuration.area_cards.length&&this.configuration.area_cards[e.area_id]&&Object.entries(this.configuration.area_cards[e.area_id]).forEach(([t,i])=>{const a=i.row_span?i.row_span:"1",s=i.col_span?i.col_span:"1",r=i.row_span_lg?i.row_span_lg:"1",o=i.col_span_lg?i.col_span_lg:"1",c=i.row_span_xl?i.row_span_xl:"1",l=i.col_span_xl?i.col_span_xl:"1";"bottom"==i.position?d.push(Y({filename:t,area_id:e.area_id,rowSpan:a,colSpan:s,rowSpanLg:r,colSpanLg:o,rowSpanXl:c,colSpanXl:l},()=>this.createCardElement2(i))):n.push(Y({filename:t,area_id:e.area_id,rowSpan:a,colSpan:s,rowSpanLg:r,colSpanLg:o,rowSpanXl:c,colSpanXl:l},()=>this.createCardElement2(i)))});const c=this.floorsById.get(e.floor_id);i.push({entitiesNoState:s,entitiesHidden:r,entitiesDisabled:o,entities:t,area:e,cards:a,customCardsTop:n,customCardsBottom:d,floor:c?.name||(0,v.A)(this._hass,"area.no_floor"),floorLevel:c?.level??9999,sort_order:this.configuration.areas[e.area_id]&&this.configuration.areas[e.area_id].sort_order?this.configuration.areas[e.area_id].sort_order:99,grouped_sort_order:this.configuration.areas[e.area_id]&&this.configuration.areas[e.area_id].grouped_sort_order?this.configuration.areas[e.area_id].grouped_sort_order:99})}if(!e())return;if(i.sort(function(e,t){let i=e.sort_order,a=t.sort_order;return i==a?0:i>a?1:-1}),!e())return;0===this.selectedArea.length&&(this.selectedArea=i[0].area.area_id),this.data=i,this.disabledAreas=a,this.startedUp=!0}}_average(e,t,i){return P(e,t,i,{isAvailable:e=>this._isAvailableEntity(e),locale:this._hass?.locale?.language||this._hass?.language})}_isOn(e,t,i){return M(e,t,i,{unavailableStates:y.s7,statesOff:y.jj})}_coverOpenCount(e,t){const i=e.cover;if(!i)return;const a=!!(this.configuration&&this.configuration.homepage_header&&this.configuration.homepage_header.invert_cover);return i.filter(e=>!t||e.attributes.device_class===t).filter(e=>!y.s7.includes(e.state)).filter(e=>{const t=Number(e.attributes.current_position);return Number.isNaN(t)?a?y.jj.includes(e.state):!y.jj.includes(e.state):a?0===t:t>0}).length}_climateState(e,t){return V(e,t,{hass:this._hass,unavailableStates:y.s7,statesOff:y.jj})}_handleAreaDisableAllEntitiesClicked(e){const t=e.currentTarget.area,i=this.data.find(e=>e.area.area_id==t),a=e.currentTarget.key,s=e.currentTarget.ddValue;this._hass.callWS({type:"dwains_dashboard/edit_entities_bool_value",entities:JSON.stringify([...i.entities]),key:a,value:s}).catch(e=>console.error("Message failed!",e))}_handleAreaClick(e){const t=e.currentTarget.dataset.areaId;window.location.hash=t,this.selectedArea=t,window.scrollTo(0,0),this._update_hass(this._hass)}_handleAreaDoubleClick(e){const t=e.currentTarget.dataset.areaId,i=e.currentTarget.lightState;this._hass.callService("light",i?"turn_off":"turn_on",void 0,{area_id:t})}_subscribeWeatherForecast(e,t){if(!(1&Number(t.attributes.supported_features)))return;const i=this._hass?.connection;"function"==typeof i?.subscribeMessage&&this._subscriptions.subscribe(`weather-forecast:${e}`,()=>i.subscribeMessage(t=>{this._weatherForecast={entity:e,forecast:t?.forecast||[]},this.requestUpdate()},{type:"weather/subscribe_forecast",forecast_type:"daily",entity_id:e})).catch(()=>{})}_handleGraphClick(e){e.preventDefault(),e.stopPropagation(),(0,u.Q)(e.currentTarget.entity)}_backButtonClick(){window.location.hash="",this._update_hass(this._hass)}_handleMoreInfo(e){(0,u.Q)(e.currentTarget.entity)}_entitiesByDomain(e){return R(e,{states:this._hass.states,excludedEntities:this.configuration.entities,domainGroups:{toggle:y.Zz,sensor:y.Xt,alert:y.Ti,cover:y.K5,climate:y.ge,other:y.R9},deviceClasses:y.gJ,sensorDeviceClasses:this._areaSensorDeviceClasses()})}async createCardElement2(e){return this.cardHelpers||(this.cardHelpers=await X()),ee({helpers:this.cardHelpers,config:e,hass:this._hass,createCardElement:w.Kq})}_toggle(e){Z(e),e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation&&e.stopImmediatePropagation();const t=e.currentTarget.domain;y.Zz.includes(t)&&this._hass.callService(t,e.currentTarget.state?"turn_off":"turn_on",void 0,{area_id:e.currentTarget.area_id})}_addLovelaceCard(e){Z(e),e.stopPropagation();const t=e.currentTarget.area,i=e.currentTarget.areaName,a=e.currentTarget.position;this._popupOpens.schedule(()=>{(0,m.d)((0,v.A)(this._hass,"entity.add_card_to")+i,{type:"custom:dwains-create-custom-card-card",area:t,position:a,page:"areas",name:i},!0,"")})}_handleAreaEditClick(e){Z(e),e.stopPropagation();const t=e.currentTarget.area_id,i=e.currentTarget.area_icon,a=e.currentTarget.disable_area,s=e.currentTarget.hide_icon,r=this.configuration.areas&&this.configuration.areas[t]||{};this._popupOpens.schedule(()=>{(0,m.d)((0,v.A)(this._hass,"area.edit_area_button"),{type:"custom:dwains-edit-area-button-card",areaId:t,icon:i,disableArea:a,hideIcon:s,graphEntity:r.graph_entity||"",graphHours:r.graph_hours,sensorEntities:r.sensor_entities||[],binarySensorEntities:r.binary_sensor_entities||[]},!1,"")})}_handleEntityEditClick(e){Z(e),e.stopPropagation();const t=e.currentTarget.entity,i=Q(this.configuration,t),a={};for(const t of Object.keys(i))a[t]=e.currentTarget[t]??i[t];this._openEntitySettings(a)}_handleUnavailableEntityEditClick(e){Z(e),e.stopPropagation(),this._openEntitySettings(Q(this.configuration,e.currentTarget.entity))}_openEntitySettings(e){this._popupOpens.schedule(()=>{(0,m.d)((0,v.A)(this._hass,"entity.edit_entity"),{type:"custom:dwains-edit-entity-card",...e},!1,"")})}_saveEntityBoolValue(e,t,i){return this._hass.callWS({type:"dwains_dashboard/edit_entity_bool_value",entityId:e,key:t,value:i}).catch(e=>{console.error("Failed to update entity setting:",e)})}_handleEntityEditBoolValueClick(e){Z(e),e.stopPropagation(),this._saveEntityBoolValue(e.currentTarget.entity,e.currentTarget.key,e.currentTarget.ddValue)}_handleEntityAreaVisibilityClick(e,t,i){Z(e),e.stopPropagation(),this._saveEntityBoolValue(t,"hidden_in_area",i)}_handleAreaEditBoolValueClick(e){Z(e),e.stopPropagation();const t=e.currentTarget.areaId,i=e.currentTarget.key,a=e.currentTarget.ddValue;this._hass.callWS({type:"dwains_dashboard/edit_area_bool_value",areaId:t,key:i,value:a}).catch(e=>console.error("Message failed!",e))}_handleEntityEditCardClick(e){Z(e),e.stopPropagation();const t=e.currentTarget.entity;let i,a;if(this.configuration.entity_cards&&this.configuration.entity_cards[t]){const e=this._entityDisplayName(t);i={input_name:e,input_entity:t,...this.configuration.entity_cards[t]},a="editor-element"}this._popupOpens.schedule(()=>{(0,m.d)((0,v.A)(this._hass,"entity.edit_entity_card"),{type:"custom:dwains-edit-entity-card-card",entity_id:t,cardConfig:i,mode:a,existingCardEdit:!!i},!0,"")})}_handleEntityEditPopupClick(e){Z(e),e.stopPropagation();const t=e.currentTarget.entity;let i,a;if(this.configuration.entities_popup&&this.configuration.entities_popup[t]){const e=this._entityDisplayName(t);i={input_name:e,input_entity:t,...this.configuration.entities_popup[t]},a="editor-element"}this._popupOpens.schedule(()=>{(0,m.d)((0,v.A)(this._hass,"entity.edit_entity_popup_card"),{type:"custom:dwains-edit-entity-popup-card",entity_id:t,cardConfig:i,mode:a,existingCardEdit:!!i},!0,"")})}_handleEntityAddToFavoritesClick(e){Z(e),e.stopPropagation();const t=e.currentTarget.entity;this._hass.callWS({type:"dwains_dashboard/edit_entity_favorite",entityId:t,favorite:!0}).catch(e=>console.error("Message failed!",e))}_handleEntityRemoveFromFavoritesClick(e){Z(e),e.stopPropagation();const t=e.currentTarget.entity;this._hass.callWS({type:"dwains_dashboard/edit_entity_favorite",entityId:t,favorite:!1}).catch(e=>console.error("Message failed!",e))}_handleAreaViewDisplayGroupedClicked(e){Z(e),e.stopPropagation();const t=e.currentTarget.ddValue,i=this._areaViewGroupingMode();if("client"!=i)return this.areaViewDisplayGrouped="enabled"==i,void(this.areaViewEditMode&&this._requestAreaViewSortableRebuild());this.areaViewDisplayGrouped=t,f.O.set("dwains_dashboard_areaViewDisplayGrouped",t),this.areaViewEditMode&&this._requestAreaViewSortableRebuild()}_handleAreaDisplayGroupedClicked(e){Z(e),e.stopPropagation();const t=e.currentTarget.ddValue,i=this._areaFloorGroupingMode();"client"==i?(this.areaDisplayGrouped=t,f.O.set("dwains_dashboard_areaDisplayGrouped",t)):this.areaDisplayGrouped="enabled"==i}_handleFavoriteEditModeClicked(e){Z(e),e.stopPropagation();const t=e.currentTarget.ddValue;t?this._attachSortables(".sortable","data-entity","dwains_dashboard/sort_entity","favorite_sort_order",()=>this.favoriteEditMode):this._destroySortables(),this.favoriteEditMode=t}_handleAreaEditModeClicked(e){Z(e),e.stopPropagation();const t=e.currentTarget.ddValue;t?this._attachSortables(".sortable","data-area-id","dwains_dashboard/sort_area_button",this.areaDisplayGrouped?"grouped_sort_order":"sort_order",()=>this.areaEditMode):this._destroySortables(),this.areaEditMode=t}async _attachSortables(e,t,i,a,s){let r;try{r=await J()}catch(e){return void console.error("Dwains Dashboard: failed to load drag and drop (reload the page after an update)",e)}if(!s())return;this._destroySortables();const o=this._hass;this._sortable=[...this.shadowRoot.querySelectorAll(e)].map(e=>new r(e,{forceFallback:!0,animation:150,dataIdAttr:t,handle:".sortable-move",onEnd:function(){o.callWS({type:i,sortData:JSON.stringify(this.toArray()),sortType:a}).catch(e=>console.error("Message failed!",e))}}))}_destroySortables(){this._sortable&&(this._sortable.forEach(e=>e.destroy()),this._sortable=void 0)}_requestAreaViewSortableRebuild(){this._destroySortables(),this.updateComplete.then(()=>{this.areaViewEditMode&&this._attachSortables(".area-view-entity-sortable","data-entity","dwains_dashboard/sort_entity",this.areaViewDisplayGrouped?"grouped_sort_order":"sort_order",()=>this.areaViewEditMode)})}_handleAreaViewEditModeClicked(e){Z(e),e.stopPropagation();const t=e.currentTarget.ddValue;this.areaViewEditMode=t,t?this._requestAreaViewSortableRebuild():this._destroySortables()}_handleCustomCardEditClick(e){Z(e),e.stopPropagation();const t=e.currentTarget.area_id,i=e.currentTarget.filename,a=e.currentTarget.colSpan,s=e.currentTarget.rowSpan,r=e.currentTarget.colSpanLg,o=e.currentTarget.rowSpanLg,n=e.currentTarget.colSpanXl,d=e.currentTarget.rowSpanXl,c=structuredClone(this.configuration.area_cards[t][i]);let l="top";c.position&&(l=c.position,delete c.position),delete c.col_span,delete c.row_span,delete c.col_span_lg,delete c.row_span_lg,delete c.col_span_xl,delete c.row_span_xl,this._popupOpens.schedule(()=>{(0,m.d)(this._hass.localize("ui.components.entity.entity-picker.edit"),{type:"custom:dwains-create-custom-card-card",area:t,mode:"editor-element",page:"areas",cardConfig:c,position:l,filename:i,colSpan:a,rowSpan:s,colSpanLg:r,rowSpanLg:o,colSpanXl:n,rowSpanXl:d},!0,"")})}_renderFavoriteViewCard(e){return _.qy`
	      <div data-entity='${e.entity}' class="col-span-${e.colSpan} row-span-${e.rowSpan} lg-col-span-${e.colSpanLg} lg-row-span-${e.rowSpanLg}  relative">
	        <div>
	          <dd-lazy-card .card=${e.card} .cardFactory=${e.cardFactory} .hass=${this._hass}></dd-lazy-card>
	        </div>
        ${this.favoriteEditMode?_.qy`
        <ha-card>
          <div class="card-actions-multiple">
            <div class="sortable-move">
              <ha-icon
                .icon=${"mdi:cursor-move"}
              >
              </ha-icon>
            </div>
            <ha-dropdown
              class="ha-icon-overflow-menu-overflow"
              placement="bottom-end"
            >
              <ha-icon-button
                label=${this._hass.localize("ui.common.overflow_menu")}
                .path=${g.TdJ}
                slot="trigger"
              ></ha-icon-button>
                <ha-dropdown-item
                  .entity="${e.entity}"
                  .friendlyName="${e.friendlyName}"
                  .disableEntity=${e.disableEntity}
                  .hideEntity=${e.hideEntity}
                  .excludeEntity=${e.excludeEntity}
                  .rowSpan=${e.rowSpan}
                  .colSpan=${e.colSpan}
                  .rowSpanLg=${e.rowSpanLg}
                  .colSpanLg=${e.colSpanLg}
                  .rowSpanXl=${e.rowSpanXl}
                  .colSpanXl=${e.colSpanXl}
                  .customCard=${e.customCard}
                  .customPopup=${e.customPopup}
                  @click=${this._handleEntityEditClick}
                >
                  <ha-icon slot="icon" .icon=${"mdi:cog"}></ha-icon>
                  ${(0,v.A)(this._hass,"entity.settings")}
                </ha-dropdown-item>
                ${"t"!=e.entity?_.qy`
                  <ha-dropdown-item
                    .entity="${e.entity}"
                    @click="${this._handleEntityEditCardClick}"
                  >
                    <ha-icon slot="icon" .icon=${"mdi:pencil"}></ha-icon>
                    ${(0,v.A)(this._hass,"entity.entity_card")}
                  </ha-dropdown-item>`:""}
                ${"t"!=e.entity?_.qy`
                  <ha-dropdown-item
                    .entity="${e.entity}"
                    @click="${this._handleEntityEditPopupClick}"
                  >
                    <ha-icon slot="icon" .icon=${"mdi:pencil-box-multiple"}></ha-icon>
                    ${(0,v.A)(this._hass,"entity.popup_card")}
                  </ha-dropdown-item>`:""}
                <ha-dropdown-item
                  .entity="${e.entity}"
                  @click="${this._handleEntityRemoveFromFavoritesClick}"
                >
                  <ha-icon slot="icon" .icon=${"mdi:tag-heart"}></ha-icon>
                  ${(0,v.A)(this._hass,"entity.remove_from_favorites")}
                </ha-dropdown-item>
                ${this._renderEntityAreaVisibilityAction(e.entity)}
            </ha-dropdown>
          </div>
        </ha-card>`:""}
      </div>
      `}_renderFavorites(){return 0==this.favorites.length?_.qy``:(this.favorites.sort(function(e,t){let i=e.favorite_sort_order,a=t.favorite_sort_order;return i==a?0:i>a?1:-1}),_.qy`
        <div id="favorites" class="mt-4">
          <div class="flex justify-between mb-2">
            <div>
              <h2 class="font-semibold text-lg">
                ${(0,v.A)(this._hass,"favorite.title_plural")}
              </h2>
              <span class="text-gray">
                ${(0,v.A)(this._hass,"favorite.all_favorites")}
              </span>
            </div>
            <div>
              ${this._hass.user.is_admin?_.qy`
              <ha-dropdown
                class="ha-icon-overflow-menu-overflow"
                placement="bottom-end"
              >
                <ha-icon-button
                  label=${this._hass.localize("ui.common.overflow_menu")}
                  .path=${g.TdJ}
                  slot="trigger"
                ></ha-icon-button>
                  ${this.favoriteEditMode?_.qy`
                    <ha-dropdown-item
                      .ddValue=${!1}
                      @click=${this._handleFavoriteEditModeClicked}
                    >
                      <ha-svg-icon slot="icon" .path=${g.CZ3}></ha-svg-icon>
                      ${(0,v.A)(this._hass,"global.disable_edit_mode")}
                    </ha-dropdown-item>`:_.qy`
                    <ha-dropdown-item
                      .ddValue=${!0}
                      @click=${this._handleFavoriteEditModeClicked}
                    >
                      <ha-svg-icon slot="icon" .path=${g.CZ3}></ha-svg-icon>
                      ${(0,v.A)(this._hass,"global.enable_edit_mode")}
                    </ha-dropdown-item>
                    `}
              </ha-dropdown>
              `:""}
            </div>
          </div>
          <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 gap-4 sortable ${this.favoriteEditMode||!this._masonryEnabled()?"":"dd-fav-masonry"}">
            ${this.favorites.map(e=>_.qy`${this._renderFavoriteViewCard(e)}`)}
          </div>
        </div>
        `)}render(){if(null==this.data||0===this.data.length)return _.qy``;{const e=new Date,t=(e.getHours()<10?"0":"")+e.getHours(),i=(e.getMinutes()<10?"0":"")+e.getMinutes(),a=e.toLocaleDateString(this._hass.locale.language,{weekday:"long",month:"short",day:"numeric"}),s=t>=12?`${t-12}:${i} pm`:`${t}:${i} am`;let r,o,n,d,c,l,h,p,u,m,f;if(r=e.getHours()<12?(0,v.A)(this._hass,"global.greeting_morning"):e.getHours()<18?(0,v.A)(this._hass,"global.greeting_afternoon"):(0,v.A)(this._hass,"global.greeting_evening"),this.configuration.homepage_header.weather_entity&&(o=this.configuration.homepage_header.weather_entity,n=this._hass.states[o],n)){d=y.My[n.state]||"mdi:weather-cloudy-alert";const e=this._hass.selectedLanguage||this._hass.language;c=(this._hass.resources&&this._hass.resources[e]?this._hass.resources[e]:{})["component.weather.entity_component._.state."+n.state]||this._hass.localize(`component.weather.entity_component._.state.${n.state}`)||this._hass.localize(`state.default.${n.state}`)||n.state;const t=n.attributes.temperature,i=n.attributes.temperature_unit||this._hass.config.unit_system.temperature,a=this._hass.locale?.language||this._hass.language;null!=t&&""!==t&&(l=re(Number(t),i,a)),this._subscribeWeatherForecast(o,n);const s=this._weatherForecast?.entity===o?this._weatherForecast.forecast?.[0]:void 0;if(s&&void 0!==s.temperature&&null!==s.temperature){const e=re(Number(s.temperature),"°",a,0).replace(/\u00a0/,""),t=void 0!==s.templow&&null!==s.templow?re(Number(s.templow),"°",a,0).replace(/\u00a0/,""):void 0;h=t?`${e} / ${t}`:e}}return this.configuration.homepage_header.alarm_entity&&(p=this.configuration.homepage_header.alarm_entity,u=this._hass.states[p]?.state,u&&(f=y.TC[u],m=this._hass.localize(`component.alarm_control_panel.state._.${u}`))),_.qy`
            <div class="dd-homepage-horizontal-scroll dd-dashboard-style-refresh">
            <div class="dd-homepage-columns flex flex-wrap">
              <div class="w-full ${this.configuration.homepage_header.v2_mode?"":"lg-w-1-2 xl-w-1-3"} ${window.location.hash?this.configuration.homepage_header.v2_mode?"hidden":"hidden lg-block":""} p-4">
                <div class="dd-homepage-status mb-2">
                  <div>
                    ${u?_.qy`
                      <div class="area-button py-1 px-2" .entity=${this.configuration.homepage_header.alarm_entity} @click=${this._handleMoreInfo}>
                        <ha-icon icon="${f}"></ha-icon> ${m}
                      </div>`:""}
                  </div>

                  <div id="weather">
                    ${n?_.qy`
                      <div class="area-button py-1 px-2" .entity=${this.configuration.homepage_header.weather_entity} @click=${this._handleMoreInfo}>
                        <ha-icon icon="${d}"></ha-icon> ${c}${l?`, ${l}`:""}${h?_.qy`<span class="weather-range">${h}</span>`:""}
                      </div>`:""}
                  </div>

                </div>
                <div class="mb-4 grid grid-cols-1 lg-grid-cols-2">
                  <div>
                    ${this.configuration.homepage_header.disable_welcome_message?"":_.qy`<h1 class="font-semibold text-xl">${r}, ${this._hass.user.name}</h1>`}
                    ${this.notificationCard}
                  </div>
                  ${this.configuration.homepage_header.disable_clock?"":_.qy`
                    <div class="text-right">
                      <div id="clock" class="mb-2 hidden lg-block">
                        <h2 class="font-semibold text-xl">${this.configuration.homepage_header.am_pm_clock?_.qy`${s}`:_.qy`${t}:${i}`}</h2>
                        <span class="text-gray capitalize">${a}</span>
                      </div>
                    </div>`}
                </div>

                ${this.badgesCard}

                ${this._renderFavorites()}

                <div id="areas" class="mt-4">
                  <div class="flex justify-between mb-2">
                    <div>
                      <h2 class="font-semibold text-lg capitalize">
                        ${(0,v.A)(this._hass,"area.title_plural")}
                      </h2>
                      <span class="text-gray">
                        ${this.data.length} ${(0,v.A)(this._hass,"area.title_plural")}
                      </span>
                    </div>
                    <div>
                      <ha-dropdown
                        class="ha-icon-overflow-menu-overflow"
                        placement="bottom-end"
                      >
                        <ha-icon-button
                          label=${this._hass.localize("ui.common.overflow_menu")}
                          .path=${g.TdJ}
                          slot="trigger"
                        ></ha-icon-button>
                          ${"client"==this._areaFloorGroupingMode()?_.qy`
                            ${this.areaDisplayGrouped?_.qy`
                              <ha-dropdown-item
                                .ddValue=${!1}
                                @click=${this._handleAreaDisplayGroupedClicked}
                              >
                                <ha-icon slot="icon" .icon=${"mdi:grid"}></ha-icon>
                                ${(0,v.A)(this._hass,"area.ungroup_by_floor")}
                              </ha-dropdown-item>
                              `:_.qy`
                              <ha-dropdown-item
                                .ddValue=${!0}
                                @click=${this._handleAreaDisplayGroupedClicked}
                              >
                                <ha-icon slot="icon" .icon=${"mdi:format-list-group"}></ha-icon>
                                ${(0,v.A)(this._hass,"area.group_by_floor")}
                              </ha-dropdown-item>`}
                          `:""}
                          ${this._hass.user.is_admin?_.qy`
                            ${this.areaEditMode?_.qy`
                              <ha-dropdown-item
                                .ddValue=${!1}
                                @click=${this._handleAreaEditModeClicked}
                              >
                                <ha-svg-icon slot="icon" .path=${g.CZ3}></ha-svg-icon>
                                ${(0,v.A)(this._hass,"global.disable_edit_mode")}
                              </ha-dropdown-item>
                              `:_.qy`
                              <ha-dropdown-item
                                .ddValue=${!0}
                                @click=${this._handleAreaEditModeClicked}
                              >
                                <ha-svg-icon slot="icon" .path=${g.CZ3}></ha-svg-icon>
                                ${(0,v.A)(this._hass,"global.enable_edit_mode")}
                              </ha-dropdown-item>`}
                          `:""}
                      </ha-dropdown>
                    </div>
                  </div>

                  ${this._renderAreaButtons(this.data)}

                  ${this.areaEditMode?_.qy`
                    ${this.disabledAreas.length?_.qy`
                      <div class="mb-5">
                        <h3 class="font-semibold capitalize text-gray">${(0,v.A)(this._hass,"area.disabled")}</h3>
                        <div class="grid grid-flow-row-dense grid-cols-2 lg-grid-cols-3 gap-4">
                        ${this.disabledAreas.map(e=>_.qy`${this._renderAreaButtonCard(e,"disabled")}`)}
                        </div>
                      </div>`:""}
                  `:""}
                </div>
              </div>
              <div class="w-full ${this.configuration.homepage_header.v2_mode?"":"lg-w-1-2 xl-w-2-3"} ${window.location.hash?"":this.configuration.homepage_header.v2_mode?"hidden":"hidden lg-block"} p-4">
                ${this.data.map(e=>this._renderAreaView(e))}
              </div>
            </div>
            </div>
            <div class="sticky z-30 bottom-0 ${window.location.hash?"":"hidden"} lg-hidden text-right">
              <div @click=${this._backButtonClick} class="back-button">
                  <div class="button">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  </div>
              </div>
            </div>
        `}}static get styles(){return[(e=_.AH,e`
        :host {
          display: block;
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          max-width: 100%;
        }
        .dd-overview-grid {
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          max-width: 100%;
        }
        @media (max-width: 599px) {
          .w-full {
            box-sizing: border-box;
            max-width: 100%;
          }
          .grid.dd-overview-grid > * {
            min-width: 0;
            max-width: 100%;
          }
        }
        .back-button {
          margin-right: 1rem;
          margin-bottom: 3.4rem;
          display: inline-block;
        }
        .back-button .button {
          background-color: var(--secondary-background-color);
          padding: 0.75rem;
          border-radius: 9999px;
          margin-bottom: env(safe-area-inset-bottom);
        }
        .card-actions {
          text-align: right;
        }
        .card-actions-centered {
          display: flex;
          justify-content: space-around;
          padding: 0.25rem 0.5rem;
        }
        .card-actions-multiple {
          display: flex;
          justify-content: space-between;
          padding: 0.25rem 0.5rem;
        }
        .sortable-move {
          cursor: -webkit-grabbing;
          cursor: grab;
          margin: auto 0;
        }
        .area-button .info ha-icon, .ha-icon ha-icon {
          display: inline-block;
          margin: auto;
          --mdc-icon-size: 100% !important;
          --iron-icon-width: 100% !important;
          --iron-icon-height: 100% !important;
        }
        .area-button .info {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          left: 0.75rem;
          bottom: 4.25rem;
          z-index: 3;
          display: flex;
          flex-direction: column;
          flex-wrap: wrap-reverse;
          justify-content: flex-start;
          align-content: flex-start;
          align-items: flex-end;
          height: auto;
          max-height: calc(100% - 5rem);
          gap: 0 0.125rem;
          overflow: hidden;
          pointer-events: none;
        }
        .area-button .info br {
          display: none;
        }
        @media (min-width: 1024px) {
          .dd-area-view-header.with-back .dd-area-view-back { display: inline-flex; }
        }
        .dd-area-view-back {
          display: none;
          margin: -0.5rem 0 -0.5rem -0.5rem;
        }
        .dd-area-view-header .dd-area-view-title {
          flex: 1;
          min-width: 0;
        }
        .with-graphs .area-button {
          height: 13.5rem;
        }
        .area-button.has-graph {
          overflow: hidden;
          padding-bottom: 3.5rem;
        }
        .area-graph {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 3rem;
          cursor: pointer;
          z-index: 4;
        }
        .area-button .toggle-badge {
          transition: background-color 120ms ease;
        }
        .area-button .toggle-badge:hover {
          background-color: color-mix(in srgb, var(--primary-color) 14%, var(--dwains-info-badge-background, var(--secondary-background-color)));
        }
        .area-button .sensors {
          display: -webkit-box;
          box-sizing: border-box;
          width: 100%;
          white-space: normal;
          overflow: hidden;
          line-height: 1.18;
          max-height: 2.36em;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        @media (max-width: 640px) {
          .area-button .sensors {
            font-size: 1rem;
            line-height: 1.15;
            max-height: 2.3em;
          }
        }
        #badges {
          cursor: pointer;
          background: var( --ha-card-background, var(--card-background-color, white) );
          box-shadow: var( --ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12) );
          color: var(--primary-text-color);
        }
        .area-button {
          position: relative;
          cursor: pointer;
          background: var( --ha-card-background, var(--card-background-color, white) );
          border-radius: var(--ha-card-border-radius, 4px);
          box-shadow: var( --ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12) );
          color: var(--test-primary-text-color, var(--primary-text-color));
        }
        .info-badge {
          /*background-color: var(--sidebar-icon-color); */
          color: var( --dwains-info-badge-color, var(--primary-text-color) );
          background-color: var(--dwains-info-badge-background, var(--secondary-background-color));
        }
        .area-button .info .toggle-badge {
          cursor: pointer;
          pointer-events: auto;
        }
        /* Refresh: rounder badges, same size as before */
        .area-button .info-badge {
          border-radius: 999px;
        }

        @media (min-width: 1024px) {
          .area-button.current {
            background: transparent;
            z-index: 1;
            position: relative;
          }
          .area-button.current::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: .12;
            z-index: -1;
            background: var(--sidebar-selected-icon-color);
            border-radius: var(--ha-card-border-radius, 4px);
          }
        }
        /*styling tailwind dwains version*/
        *, ::after, ::before {
          box-sizing: border-box;
        }
        h1,h2,h3 {
          margin: 0;
        }
        h3 {
          font-size: 1em;
        }
        .absolute {
          position: absolute
        }
        .break-words {
          overflow-wrap: break-word;
        }
        .relative {
            position: relative
        }
        .sticky {
            position: -webkit-sticky;
            position: sticky
        }
        .top-0 {
            top: 0px
        }
        .bottom-0 {
            bottom: 0px
        }
        .z-30 {
            z-index: 7;
        }
        .col-span-1 {
            grid-column: span 1 / span 1
        }
        .col-span-2 {
            grid-column: span 2 / span 2
        }
        .row-span-1 {
            grid-row: span 1 / span 1
        }
        .row-span-2 {
            grid-row: span 2 / span 2
        }
        .my-4 {
            margin-top: 1rem;
            margin-bottom: 1rem
        }
        .mx-auto {
          margin-left: auto;
          margin-right: auto
        }
        .mb-2 {
            margin-bottom: 0.5rem
        }
        .mb-4 {
            margin-bottom: 1rem
        }
        .mt-4 {
            margin-top: 1rem
        }
        .mr-0\.5 {
            margin-right: 0.125rem
        }
        .mr-0 {
            margin-right: 0px
        }
        .mb-12 {
            margin-bottom: 3rem
        }
        .mb-5 {
            margin-bottom: 1.25rem
        }
        .mb-16 {
            margin-bottom: 4rem
        }
        .ml-4 {
            margin-left: 1rem
        }
        .block {
            display: block
        }
        .inline-block {
            display: inline-block
        }
        .flex {
            display: flex
        }
        .inline-flex {
            display: inline-flex
        }
        .grid {
            display: grid
        }
        .hidden {
            display: none
        }
        .h-6 {
            height: 1.5rem
        }
        .h-44 {
            height: 11rem
        }
        .h-full {
            height: 100%
        }
        .h-14 {
            height: 3.5rem
        }
        .h-8 {
            height: 2rem
        }
        .w-full {
            width: 100%
        }
        .w-6 {
            width: 1.5rem
        }
        .w-14 {
            width: 3.5rem
        }
        .w-8 {
            width: 2rem
        }
        .w-12 {
          width: 3rem
        }
        .cursor-pointer {
            cursor: pointer
        }
        .grid-flow-row-dense {
            grid-auto-flow: row dense
        }
        .dd-fav-masonry,
        .dd-masonry {
          grid-auto-rows: 8px;
          row-gap: 0 !important;
          align-items: start;
        }
        .dd-uniform > div > div,
        .dd-uniform > div > div > dd-lazy-card {
          display: block;
          height: 100%;
        }
        /* Each cell includes the 16px gap below its card; the last row's
           gap would add to the spacing of the next group. */
        .dd-masonry {
          margin-bottom: -1rem;
        }
        .grid-cols-1 {
            grid-template-columns: repeat(1, minmax(0, 1fr))
        }
        .grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr))
        }
        .flex-wrap {
            flex-wrap: wrap
        }
        .content-between {
            align-content: space-between
        }
        .items-center {
            align-items: center
        }
        .justify-between {
            justify-content: space-between
        }
        .dd-homepage-status {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
            align-items: start;
            gap: .5rem;
        }
        .dd-homepage-status > :first-child {
            justify-self: start;
            min-width: 0;
        }
        .weather-range {
          margin-left: 0.5rem;
          color: var(--secondary-text-color);
          font-size: 0.9em;
        }
        .dd-homepage-status #weather {
            justify-self: center;
        }
        .dd-homepage-horizontal-scroll {
            max-width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-x: contain;
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
        .dd-homepage-horizontal-scroll::-webkit-scrollbar {
            display: none;
            width: 0;
            height: 0;
        }
        .gap-4 {
            gap: 1rem
        }
        .space-y-0.5 > :not([hidden]) ~ :not([hidden]) {
            --tw-space-y-reverse: 0;
            margin-top: calc(0.125rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0.125rem * var(--tw-space-y-reverse))
        }
        .space-y-0 > :not([hidden]) ~ :not([hidden]) {
            --tw-space-y-reverse: 0;
            margin-top: calc(0px * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0px * var(--tw-space-y-reverse))
        }
        .rounded {
            border-radius: 0.25rem
        }
        .rounded-md {
            border-radius: 0.375rem
        }
        .bg-gray-800 {
            --tw-bg-opacity: 1;
            background-color: rgb(31 41 55 / var(--tw-bg-opacity))
        }
        .rounded-lg {
          border-radius: 0.5rem
        }
        .border-2 {
            border-width: 2px
        }
        .border-dashed {
            border-style: dashed
        }
        .border-gray-300 {
            --tw-border-opacity: 1;
            border-color: rgb(209 213 219 / var(--tw-border-opacity))
        }
        .bg-gray-800 {
            --tw-bg-opacity: 1;
            background-color: rgb(31 41 55 / var(--tw-bg-opacity))
        }
        .bg-opacity-50 {
            --tw-bg-opacity: 0.5
        }
        .p-2 {
          padding: 0.5rem;
        }
        .p-4 {
            padding: 1rem
        }
        .p-1 {
            padding: 0.25rem
        }
        .p-3 {
            padding: 0.75rem
        }
        .px-1 {
            padding-left: 0.25rem;
            padding-right: 0.25rem
        }
        .p-12 {
          padding: 3rem
        }
        .py-0\.5 {
            padding-top: 0.125rem;
            padding-bottom: 0.125rem
        }
        .py-0 {
            padding-top: 0px;
            padding-bottom: 0px
        }
        .py-1 {
          padding-top: 0.25rem;
          padding-bottom: 0.25rem
        }
        .px-2 {
          padding-left: 0.5rem;
          padding-right: 0.5rem
        }
        .text-center {
          text-align: center
        }
        .text-right {
            text-align: right
        }
        .text-xl {
            font-size: 1.5rem;
            line-height: 2rem
        }
        .text-lg {
            font-size: 1.125rem;
            line-height: 1.75rem
        }
        .text-sm {
            font-size: 0.875rem;
            line-height: 1.25rem
        }
        .text-xs {
            font-size: 0.75rem;
            line-height: 1rem
        }
        .font-semibold {
            font-weight: 600
        }
        .font-medium {
            font-weight: 500
        }
        .capitalize {
            text-transform: capitalize
        }
        .text-gray {
            color: var(--paper-item-body-secondary-color, var(--secondary-text-color));
        }
        .text-white {
            --tw-text-opacity: 1;
            color: rgb(255 255 255 / var(--tw-text-opacity))
        }
        @media (min-width: 768px) {
            .md-grid-cols-3 {
                grid-template-columns: repeat(3, minmax(0, 1fr))
            }
        }
        @media (min-width: 1024px) {
            .lg-col-span-1 {
                grid-column: span 1 / span 1
            }
            .lg-col-span-3 {
                grid-column: span 3 / span 3
            }
            .lg-col-span-2 {
                grid-column: span 2 / span 2
            }
            .lg-row-span-1 {
                grid-row: span 1 / span 1
            }
            .lg-row-span-3 {
                grid-row: span 3 / span 3
            }
            .lg-row-span-2 {
                grid-row: span 2 / span 2
            }
            .lg-block {
                display: block
            }
            .lg-hidden {
                display: none
            }
            .lg-w-1-2 {
                width: 50%
            }
            .lg-grid-cols-2 {
                grid-template-columns: repeat(2, minmax(0, 1fr))
            }
            .lg-grid-cols-3 {
                grid-template-columns: repeat(3, minmax(0, 1fr))
            }
            .lg-grid-cols-4 {
              grid-template-columns: repeat(4, minmax(0, 1fr))
            }
        }
        @media (min-width: 1536px) {
          .xl-col-span-1 {
              grid-column: span 1 / span 1
          }
          .xl-col-span-4 {
              grid-column: span 4 / span 4
          }
          .xl-col-span-2 {
              grid-column: span 2 / span 2
          }
          .xl-row-span-1 {
              grid-row: span 1 / span 1
          }
          .xl-row-span-4 {
              grid-row: span 4 / span 4
          }
          .xl-row-span-2 {
              grid-row: span 2 / span 2
          }
          .xl-w-1-3 {
              width: 33.333333%
          }
          .xl-w-2-3 {
              width: 66.666667%
          }
          .xl-grid-cols-4 {
              grid-template-columns: repeat(4, minmax(0, 1fr))
          }
          .xl-grid-cols-5 {
            grid-template-columns: repeat(5, minmax(0, 1fr))
          }
      }
`),(0,x.Cn)(_.AH),(0,x.ww)(_.AH)];var e}}K("homepage-card",oe)},3080(e,t,i){"use strict";var a=i(6684),s=i(2330),r=i(4849),o=i(3475),n=i(5890),d=i(1621),c=i(4169),l=i(216);const{defineDwainsElement:h}=i(1415),{loadDashboardRegistrySnapshot:p}=i(5768),{loadCardHelpers:u}=i(393),{TimerOwner:m}=i(9792),{PopupOpenScheduler:g}=i(6138),{ReloadableLoadOwner:_}=i(5833),{hassConnectionIdentity:f,hasHassConnectionChanged:y}=i(9187),{isEntityHiddenInArea:b}=i(7903);class v extends a.WF{constructor(){super(),this._timers=new m,this._popupOpens=new g(this._timers),this._loads=new _(e=>this._loadConfiguration(e))}static get styles(){return[a.AH`
      ha-card {
        overflow: hidden;
      }
      .flex {
        display: flex;
      }
      .justify-center {
        justify-content: center;
      }
      .items-center {
        align-items: center;
      }
      .font-semibold {
        font-weight: 600;
      }
      h1, h2, h3, h4, h5, h6 {
        font-size: inherit;
      }
      blockquote, dd, dl, figure, h1, h2, h3, h4, h5, h6, hr, p, pre {
        margin: 0;
      }
      .p-2 {
        padding: 0.5rem;
      }
      .cursor-pointer {
        cursor: pointer;
      }
      .w-8 {
        width: 1.5rem;
      }
      .h-8 {
        height: 1.5rem;
      }
      .space-x-2>:not([hidden])~:not([hidden]) {
        --tw-space-x-reverse: 0;
        margin-right: calc(0.5rem * var(--tw-space-x-reverse));
        margin-left: calc(0.5rem * calc(1 - var(--tw-space-x-reverse)));
      }
      .text-gray-500 {
        --tw-text-opacity: 1;
        color: rgba(107,114,128,var(--tw-text-opacity));
      }
      .capitalize {
          text-transform: capitalize;
      }
      .ha-icon ha-icon {
        display: inline-block;
        margin: auto;
        --mdc-icon-size: 100% !important;
        --iron-icon-width: 100% !important;
        --iron-icon-height: 100% !important;
      }
      .text-center {
        text-align: center;
      }
      .rounded-full {
        border-radius: 9999px;
      }
      .not_home {
        filter: grayscale(100%);
      }
      .domain-badge-card h3 {
        margin-top: 0.4rem;
      }
      .m-auto {
        margin: 0 auto;
      }
      .round-badge {
        background-color: var(--dwains-house-information-badge-background, var(--sidebar-icon-color));
      }
      .badge-icon {
        color: var(--dwains-house-information-badge-color, var(--ha-card-background, var(--card-background-color, white) ) );
      }
      .dd-header-tabs {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        height: 110px;
        padding: 4px 8px;
        margin: 0 .25rem;
        overflow-x: auto;
        overscroll-behavior-x: contain;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        background: rgba(var(--rgb-card-background-color), .08);
        border-radius: 12px;
      }
      .dd-header-tabs::-webkit-scrollbar {
        display: none;
      }
      /* Entries keep their width (at least 88px, more for long names) and
         the bar scrolls sideways when they do not fit, also on desktop;
         shrinking them made the names run into each other. */
      .dd-header-tab {
        display: flex;
        flex: 0 0 auto;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 88px;
        padding: 0 4px;
      }
      .dd-header-tabs h3 {
        max-width: 100%;
        margin: 10px 0 2px;
        overflow: hidden;
        font-size: 1rem;
        font-weight: 500;
        line-height: 1.3;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dd-header-tabs span {
        font-size: .92rem;
        line-height: 1.25;
        white-space: nowrap;
      }
      @media (max-width: 600px) {
        .dd-header-tabs {
          gap: 6px;
          padding-inline: 6px;
        }
        .dd-header-tab {
          flex: 0 0 auto;
          min-width: 68px;
        }
      }

      .loading-component {
        height: 110px;
      }
    `,(0,l.MP)(a.AH)]}static get properties(){return{_hass:{type:Object},configuration:{type:Object},domains:{type:Object},persons:{type:Array}}}setConfig(e){this.configuration=e}set hass(e){const t=y(this._hass,e);this._hass=e,this.requestUpdate(),this._startIfReady(t)}_entityDisplayName(e,t){const i=t||this.entitiesById?.get(e),a=i?.device_id?this.devicesById?.get(i.device_id):void 0;return(0,c.Hg)(this._hass,this.configuration,e,i,a)}async connectedCallback(){super.connectedCallback(),this._timers.connect(),await this._startIfReady()}async _startIfReady(e=!1){const t=f(this._hass);if(!this.isConnected||!this._hass||this._startedHass===t)return;this._hass;this._startedHass=t;try{e?await this._loads.reload():await this._loadData()}catch(e){this._startedHass===t&&(this._startedHass=void 0),console.error("Error starting house information card:",e)}}disconnectedCallback(){super.disconnectedCallback(),this._startedHass=void 0,this._loads.invalidate(),this._timers.disconnect()}async _reloadCard(){await this._loads.reload(),this.requestUpdate()}_loadData(){return this._loads.load()}async _loadConfiguration({isCurrent:e=()=>!0}={}){const t=await p(this._hass);if(e())if(Object.assign(this,t),u().catch(e=>{console.error("Failed to preload house-information card helpers",e)}),null==this.areas||0===this.areas.length||null==this.devices||0===this.devices.length||null==this.entities||0===this.entities.length||null==this.configuration||0===this.configuration.length);else{const e=[],t=[];for(const e of this.entities){if("person"==(0,o.mD)(e.entity_id)){const i=this.configuration.entities&&this.configuration.entities[e.entity_id]||{};e.hidden_by||i.disabled||i.excluded||i.hidden||t.push(e.entity_id)}}for(const t of this.areas)if(!this.configuration.areas[t.area_id]||!this.configuration.areas[t.area_id].disabled){new Set;for(const i of this.entitiesByAreaId.get(t.area_id)||[])if(!i.hidden_by){const a=!!this.configuration.entities[i.entity_id]&&!!this.configuration.entities[i.entity_id].disabled,s=!!this.configuration.entities[i.entity_id]&&!!this.configuration.entities[i.entity_id].excluded,r=!!this.configuration.entities[i.entity_id]&&!!this.configuration.entities[i.entity_id].hidden,d=b(this.configuration.entities?.[i.entity_id]);if(!(a||s||r||d)){const a=this._entityDisplayName(i.entity_id,i),s=(0,o.mD)(i.entity_id);if(!(n.Zz.includes(s)||n.Ti.includes(s)||n.K5.includes(s)||n.ge.includes(s)||n.R9.includes(s)))continue;s in e||(e[s]={domain:s,entities:[]}),e[s].entities.push({entity_id:i.entity_id,area:t,friendlyName:a})}}}this.domains=e,this.persons=t}}_handleMoreInfo(e){if(e.currentTarget.entity)(0,s.Q)(e.currentTarget.entity);else{const t=e.currentTarget.domain,i=e.currentTarget.deviceClass,a=this.domains?.[t]?.entities,o="climate"!==t||a&&0!==a.length?a||[]:Object.keys(this._hass.states).filter(e=>e.startsWith("climate.")&&!b(this.configuration?.entities?.[e])).map(e=>({entity_id:e,area:{},friendlyName:this._entityDisplayName(e)}));this._popupOpens.schedule(()=>{(0,s.fireEvent)("hass-more-info",{entityId:""},this),(0,r.d)((0,d.A)(this._hass,"device."+t),{type:"custom:dwains-house-information-more-info-card",domain:t,entities:o,deviceClass:"climate"===t?"":i,configuration:this.configuration},!0,"")})}}_isOn(e,t,i){if(e)return(i?e.filter(e=>e.attributes.device_class===i):e).filter(e=>{const t=this.configuration?.entities?.[e.entity_id];return!(e.hidden_by||t?.disabled||t?.excluded||t?.hidden||t?.hidden_in_area||n.s7.includes(e.state)||n.jj.includes(e.state))}).length}_isOnCover(e,t,i){if(e)return(i?e.filter(e=>e.attributes.device_class===i):e).filter(e=>!n.s7.includes(e.state)&&!n.jj.includes(e.state)&&!this.configuration.homepage_header.invert_cover).length}_isOffCover(e,t,i){if(e)return(i?e.filter(e=>e.attributes.device_class===i):e).filter(e=>!n.s7.includes(e.state)&&n.jj.includes(e.state)&&this.configuration.homepage_header.invert_cover).length}_isOnClimate(e,t){if(!e)return;const i=[];for(const t of e)t.attributes.hvac_action&&"idle"!=t.attributes.hvac_action?n.s7.includes(t.attributes.hvac_action)||n.jj.includes(t.attributes.hvac_action)||i.push(t.entity_id):t.attributes.hvac_action||n.s7.includes(t.state)||n.jj.includes(t.state)||i.push(t.entity_id);return i.length}_renderDomain(e){const t=[];for(const i of e.entities){const e=this._hass.states[i.entity_id];e&&t.push(e)}if(n.Zz.includes(e.domain)){if(!this._showsEntry(e.domain))return;const i=this._isOn(t,e);if(i)return this._renderDomainBadgeCard(e.domain,(0,d.A)(this._hass,"device."+e.domain),n.qJ[e.domain][i?"on":"off"],i,"")}else{if(n.Ti.includes(e.domain))return n.gJ[e.domain].map(i=>{if(!this._showsEntry(i))return;const a=this._isOn(t,e.domain,i);return a?this._renderDomainBadgeCard(e.domain,(0,d.A)(this._hass,"device."+i),n.qJ[e.domain][i],a,i):void 0});if(n.K5.includes(e.domain)){if(!this._showsEntry("cover"))return;return n.gJ[e.domain].map(i=>{const a=this._isOnCover(t,e.domain,i),s=this._isOffCover(t,e.domain,i);return a?this._renderDomainBadgeCard(e.domain,(0,d.A)(this._hass,"device."+i),n.qJ[e.domain][i],a,i):s?this._renderDomainBadgeCard(e.domain,(0,d.A)(this._hass,"device."+i),n.qJ[e.domain][i],s,i):void 0})}if(n.ge.includes(e.domain)){if(!this._showsEntry("climate"))return;const i=this._isOnClimate(t,e.domain);if(i)return this._renderDomainBadgeCard(e.domain,(0,d.A)(this._hass,"device."+e.domain),n.qJ[e.domain][i?"on":"off"],i,"")}else if(n.R9.includes(e.domain)){if(!this._showsEntry(e.domain))return;const i=this._isOn(t,e);if(i)return this._renderDomainBadgeCard(e.domain,(0,d.A)(this._hass,"device."+e.domain),n.qJ[e.domain][i?"on":"off"],i,"")}}}_showsEntry(e){const t=this.configuration?.homepage_header?.house_information_entries;return!Array.isArray(t)||t.includes(e)}_scrollTabsWithWheel(e){const t=e.currentTarget;if(t.scrollWidth<=t.clientWidth||Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;const i=t.scrollLeft;t.scrollLeft+=e.deltaY,t.scrollLeft!==i&&e.preventDefault()}_renderDomainBadgeCard(e,t,i,s,r){let o;return o=!(n.Hi.includes(r)||["cover","lock","valve"].includes(e))||this.configuration.homepage_header.invert_cover&&"cover"==e?this.configuration.homepage_header.invert_cover&&"cover"==e?(0,d.A)(this._hass,"device.closed"):n.Hh.includes(r)?(0,d.A)(this._hass,"device.detected"):(0,d.A)(this._hass,"device.on"):(0,d.A)(this._hass,"device.open"),a.qy`
      <div class="dd-header-tab">
        <div class="text-center cursor-pointer domain-badge-card" .domain=${e} .deviceClass=${r} @click=${this._handleMoreInfo}>
          <div class="rounded-full flex items-center justify-center m-auto round-badge" style="width: 50px; height: 50px;">
            <div class="">
              <ha-icon
                class="w-8 h-8 badge-icon"
                .icon=${this.configuration.devices[e]&&this.configuration.devices[e].icon?this.configuration.devices[e].icon:i}
              ></ha-icon>
            </div>
          </div>
          <h3 class="capitalize">${t}</h3>
          <span class="text-gray-500">
          ${s} ${o}
          </span>
        </div>
      </div>
      `}_renderPersonCard(e){const t=this._hass.states[e];if(t&&t.attributes){let i=t.attributes.entity_picture_local||t.attributes.entity_picture;i&&this._hass&&(i=this._hass.hassUrl(i));const s=this._entityDisplayName(e);return a.qy`
                <div class="dd-header-tab">
                <div class="text-center cursor-pointer" .entity=${e} @click=${this._handleMoreInfo}>
                    ${i?a.qy`
                    <img src="${i}" width="50" class="rounded-full m-auto ${t.state}">
                    `:a.qy`
                    <div class="rounded-full flex items-center justify-center m-auto round-badge" style="width: 50px; height: 50px; margin-bottom: 6px;">
                    <div class="">
                        <ha-icon
                        class="w-8 h-8 badge-icon"
                        .icon=${"mdi:account"}
                        ></ha-icon>
                    </div>
                    </div>
                    `}
                    <h3 class="capitalize">${s.split(" ")[0]}</h3>
                    <span class="text-gray-500">
                    ${(0,c.FI)(this._hass.localize,t,this._hass.locale)}
                    </span>
                </div>
                </div>`}}render(){return this._hass?null==this.domains||0===Object.keys(this.domains).length?a.qy``:a.qy`
                <ha-card>
                <div class="dd-header-tabs" @wheel=${this._scrollTabsWithWheel}>
                    ${this._showsEntry("person")?this.persons.map(e=>this._renderPersonCard(e)):""}
                    ${Object.values(this.domains).map(e=>this._renderDomain(e))}
                </div>
                </ha-card>
            `:a.qy``}}h("dwains-house-information-card",v)},6315(e,t,i){"use strict";var a=i(6684),s=i(4169),r=i(1621),o=i(5890),n=i(3475);const{websocketReadStore:d}=i(7069),{loadCardHelpers:c}=i(393),{TimerOwner:l}=i(9792),{dashboardRouteState:h}=i(3991),{defineDwainsElement:p}=i(1415);class u extends a.WF{static get styles(){return a.AH`
        .p-20px {
            padding: 20px;
        }
        .flex {
            display: flex;
        }
        .grid-flow-row-dense {
            grid-auto-flow: row dense

        }
        .grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr))
        }
        .grid {
            display: grid;
            gap: 1rem;
        }
        .cards.single-card-section > * {
            grid-column: 1 / -1;
        }
        @media (min-width: 1024px) {
            .lg-grid-cols-3 {
                grid-template-columns: repeat(3, minmax(0, 1fr))
            }
        }
        @media (min-width: 1536px) {
            .xl-col-span-4 {
                grid-column: span 4 / span 4
            }
        }
        .font-semibold {
            font-weight: 600;
        }
        h1, h2, h3, h4, h5, h6 {
            font-size: inherit;
        }
        h3 {
            font-size: 1.5rem;
            padding-bottom: 0.5rem;
        }
        blockquote, dd, dl, figure, h1, h2, h3, h4, h5, h6, hr, p, pre {
            margin: 0;
        }
        .p-2 {
            padding: 0.5rem;
        }
        .cursor-pointer {
            cursor: pointer;
        }
        .space-x-2>:not([hidden])~:not([hidden]) {
            --tw-space-x-reverse: 0;
            margin-right: calc(0.5rem * var(--tw-space-x-reverse));
            margin-left: calc(0.5rem * calc(1 - var(--tw-space-x-reverse)));
        }
        .capitalize {
            text-transform: capitalize;
        }
        .icon ha-state-icon {
            display: inline-block;
            margin: auto;
            --mdc-icon-size: 100% !important;
            --iron-icon-width: 100% !important;
            --iron-icon-height: 100% !important;

            width: 1.5rem;
            height: 1.5rem;
        }
        .icon {
            padding: 0.75rem;
            background-color: var(--secondary-background-color);
            border-radius: 999px;
        }
        .information {
            line-height: 1.10;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .information .state {
            font-size: 0.9rem;
            line-height: 1.25rem;
            color: var(--paper-item-body-secondary-color, var(--secondary-text-color));
        }
        .handle-button {
            background-color: var(--secondary-background-color);
            border-radius: var(--ha-card-border-radius, 4px);
            color: var(--primary-text-color);
            display: block;
            text-align: center;
            padding: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
        }
        .single-button {

        }
        .two-buttons {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(2,minmax(0,1fr));
        }
        .mb-5 {
            margin-bottom: 1.5rem;
        }
        `}static get properties(){return{_hass:{},configuration:{},areas:{type:Object}}}constructor(){super(),this.areas={},this._timers=new l,this._loadGeneration=0,this._lifecycleActive=!1}connectedCallback(){super.connectedCallback(),this._lifecycleActive=!0,this._timers.connect(),this._debounceLoadCards()}disconnectedCallback(){super.disconnectedCallback(),this._lifecycleActive=!1,this._loadGeneration+=1,this._timers.disconnect()}set hass(e){this._hass=e,this._debounceLoadCards()}async _debounceLoadCards(){if(!this._hass||!this._config)return;this._timers.schedule("load-cards",async()=>{await this.loadCards(),this._lifecycleActive&&this.requestUpdate()},0)}async _loadCardHelpers(){return c()}async setConfig(e){if(!e.entities)throw new Error("Specify entities list");this._config=e,this.entities=e.entities,this.domain=e.domain,this.deviceClass=e.deviceClass,this.configuration=e.configuration,this.cardHelpers=await this._loadCardHelpers(),this._debounceLoadCards()}async loadCards(){const e=++this._loadGeneration;if(this.configuration||(this.configuration=await d.read(this._hass,{type:"dwains_dashboard/configuration/get"})),this.cardHelpers||(this.cardHelpers=await this._loadCardHelpers()),e!==this._loadGeneration)return;this.areas={};const t=await Promise.all(this.entities.map(async e=>{const t=this._hass.states[e.entity_id];let i=!1;if(t){t.entity_id.startsWith("cover.")&&(o.s7.includes(t.state)||o.jj.includes(t.state)||this.configuration.homepage_header.invert_cover?!o.s7.includes(t.state)&&o.jj.includes(t.state)&&this.configuration.homepage_header.invert_cover&&(i=!0):i=!0),o.s7.includes(t.state)||o.jj.includes(t.state)||t.entity_id.startsWith("cover.")||(i=!0);const a=!this.deviceClass||t.attributes.device_class===this.deviceClass;if(i&&a){const t=await this.createEntityCard(e.entity_id,e.friendlyName);if(t){return{areaId:e.area.area_id||"default",areaName:e.area.name||"Default",card:t}}}}return null}));if(e===this._loadGeneration)for(const e of t)e&&(this.areas[e.areaId]||(this.areas[e.areaId]={cards:[],name:e.areaName}),this.areas[e.areaId].cards.push(e.card))}async createEntityCard(e,t){const i=this._hass.states[e],a=e.slice(0,e.indexOf("."));if(!i)return null;const r=t||(0,s.Hg)(this._hass,this.configuration,e);let o={};switch(a){default:o={type:"tile",name:r};break;case"camera":o={type:"picture-entity",camera_view:"auto"};break;case"climate":o={type:"thermostat",name:r,features:[{type:"climate-fan-modes",fan_modes:["quiet","low","medium","high"]},{type:"climate-hvac-modes",hvac_modes:["heat_cool","heat","dry","fan_only","cool","off"]}]};break;case"cover":o={type:"tile",name:r,features:[{type:"cover-open-close"},{type:"cover-position"}]};break;case"light":o={type:"tile",name:r,features:[{type:"light-brightness"}]}}return o={entity:e,...o},(0,s.Kq)(this.cardHelpers,o,this._hass)}_navigateToDevices(e){const t=e.currentTarget.domain;(0,s.fs)(),h.navigateToDevices(t)}_currentOn(){const e=[],t=this.deviceClass;for(const t of this.entities){const i=this._hass.states[t.entity_id];i&&e.push({area:t.area,stateObj:i})}if(e){if("climate"==this.domain){const t=[];for(const i of e)i.stateObj.attributes.hvac_action&&"idle"!=i.stateObj.attributes.hvac_action?o.s7.includes(i.stateObj.attributes.hvac_action)||o.jj.includes(i.stateObj.attributes.hvac_action)||t.push({area:i.area,stateObj:i.stateObj}):i.stateObj.attributes.hvac_action||o.s7.includes(i.stateObj.state)||o.jj.includes(i.stateObj.state)||t.push({area:i.area,stateObj:i.stateObj});return t}return(t?e.filter(e=>e.stateObj.attributes.device_class===t):e).filter(e=>!o.s7.includes(e.stateObj.state)&&!o.jj.includes(e.stateObj.state))}}_handleTurnAllOffClicked(e){const t=this._currentOn();0==t.length&&(0,s.fs)(),t.map(e=>{const t=e.stateObj.entity_id,i=(0,n.mD)(t),a="group"===i?"homeassistant":i;let s;switch(i){case"lock":s="lock";break;case"cover":s="close_cover";break;default:s="turn_off"}this._hass.callService(a,s,{entity_id:t})})}render(){if(!this._hass||!this._config||0===Object.keys(this.areas).length)return a.qy``;let e=!1;return"light"!=this.domain&&"switch"!=this.domain&&"cover"!=this.domain||(e=!0),a.qy`
            <div class="p-20px">
                ${Object.entries(this.areas).map(([e,t])=>a.qy`
                    <div class="area mb-5" id="area-${e}">
                        <h3 class="font-semibold capitalize text-gray">${t.name}</h3>
                        <div class="cards grid grid-flow-row-dense grid-cols-2 ${1===t.cards.length?"single-card-section":""} gap-4">
                            ${t.cards.map(e=>a.qy`${e}`)}
                        </div>
                    </div>
                `)}
                <div class="${e?"two-buttons":"single-button"}">
                    ${e?a.qy`
                    <div class="handle-button" @click=${this._handleTurnAllOffClicked}>
                        ${(0,r.A)(this._hass,"device.turn_all_off")}
                    </div>
                    `:""}
                    <div class="handle-button" @click=${this._navigateToDevices} .domain=${this.domain}>
                        ${(0,r.A)(this._hass,"device.see_all")}
                        <ha-icon
                        .icon=${"mdi:chevron-right"}
                        ></ha-icon>
                    </div>
                </div>
            </div>
        `}}p("dwains-house-information-more-info-card",u)},5012(e,t,i){"use strict";var a=i(4849),s=i(2330),r=i(9165),o=i(3475),n=i(6684),d=i(4169),c=i(1621),l=i(216);const{EventSubscriptionOwner:h}=i(5179),{EventListenerOwner:p}=i(2866),{TimerOwner:u}=i(9792),{PopupOpenScheduler:m}=i(6138),{ReloadableLoadOwner:g}=i(5833),{hassConnectionIdentity:_,hasHassConnectionChanged:f}=i(9187),{websocketReadStore:y}=i(7069),{loadCardHelpers:b}=i(393),{defineDwainsElement:v}=i(1415),{MORE_PAGE_SAVED_EVENT:w}=i(6392),{closeParentDropdown:x}=i(9823);class $ extends n.WF{static get styles(){return[n.AH`
        #more-page {
          padding: 1rem;
        }
        .justify-between {
          justify-content: space-between;
        }
        .flex {
            display: flex;
        }
        .mb-2 {
            margin-bottom: 0.5rem;
        }
        .font-semibold {
          font-weight: 600;
        }
        .text-lg {
            font-size: 1.125rem;
            line-height: 1.75rem;
        }
        .capitalize {
          text-transform: capitalize;
        }
        .more-page-back-layer {
          position: sticky;
          bottom: 0;
          z-index: 7;
          text-align: right;
          pointer-events: none;
        }
        .more-page-back-layer .back-button {
          pointer-events: auto;
        }
        .h-8 {
          height: 2rem;
        }
        .w-8 {
          width: 2rem;
        }
        .page-actions {
          display: flex;
          align-items: center;
        }
        .page-state {
          display: flex;
          min-height: 8rem;
          align-items: center;
          justify-content: center;
          color: var(--secondary-text-color);
        }
        .page-error {
          color: var(--error-color);
        }
      `,(0,l.Ve)(n.AH),(0,l.ww)(n.AH)]}static get properties(){return{card:{},_hass:{},configuration:{},_cardLoading:{state:!0},_cardError:{state:!0},_configurationError:{state:!0}}}async loadHelpers(){return this.cardHelpers=await b(),this.cardHelpers}constructor(){super(),this._subscriptions=new h,this._listeners=new p,this._timers=new u,this._popupOpens=new m(this._timers),this._loads=new g(e=>this._loadConfiguration(e)),this._configReady=!1,this._forcePageRead=!1,this._savedPageChanged=e=>{const t=e.detail?.page;t&&t.foldername===this.foldername&&(this._pendingPage=t,this._loads.reload().catch(e=>{console.error("Failed to render the saved More Page:",e)}))}}set hass(e){const t=f(this._hass,e);this._hass=e,null!=this.card&&0!==this.card.length&&(this.card.hass=e),t&&this.isConnected&&(this._subscriptions.disconnect(),this._subscriptions.connect(),this._startedHass=void 0),this._startIfReady(t)}setConfig(e){this.name=e.name,this.foldername=e.foldername,this.icon=e.icon,this.showInNavbar=e.show_in_navbar??e.showInNavbar,this.cardConfig=e.card,this.card=void 0,this._cardError=void 0,this._cardLoading=!0,this._configReady=!0,this._startIfReady()}async connectedCallback(){super.connectedCallback(),this._subscriptions.connect(),this._listeners.listen("saved-more-page",window,w,this._savedPageChanged),this._listeners.connect(),this._timers.connect(),await this._startIfReady()}async _startIfReady(e=!1){const t=_(this._hass);if(!(this.isConnected&&this._hass&&this._configReady&&this.foldername&&this._startedHass!==t))return;this._hass;this._startedHass=t;try{e?await this._loads.reload():await this._loadData(),this.isConnected&&_(this._hass)===t&&await this._subscribeReload()}catch(e){this._configurationError=e,this._cardError=e,this._cardLoading=!1,this.requestUpdate(),console.error("Error starting more page card:",e)}}disconnectedCallback(){super.disconnectedCallback(),this._startedHass=void 0,this._loads.invalidate(),this._subscriptions.disconnect(),this._listeners.disconnect(),this._timers.disconnect()}_subscribeReload(){return this._subscriptions.subscribeEvent("more-page",this._hass,"dwains_dashboard_more_pages_reload",()=>{y.invalidate(this._hass,{type:"dwains_dashboard/configuration/get"}),y.invalidate(this._hass,{type:"dwains_dashboard/more_page/get",foldername:this.foldername}),this._reloadCard().catch(e=>{console.error("Error reloading more page card:",e)})})}async _reloadCard(){this._forcePageRead=!0;try{await this._loads.reload(),this.requestUpdate()}finally{this._forcePageRead=!1}}_loadData(){return this._loads.load()}async _loadConfiguration({isCurrent:e=()=>!0}={}){const t=this._pendingPage,i=t||await y.readPreferred(this._hass,{type:"dwains_dashboard/more_page/get",foldername:this.foldername},{type:"dwains_dashboard/configuration/get"},{capability:"dashboard-read-slices",selectFallback:e=>e?.more_pages?.[this.foldername]});if(!i)throw new Error(`More page "${this.foldername}" has no card configuration`);if(!e())return;if(this.cardHelpers=await this.loadHelpers(),!e())return;const a=Array.isArray(i.card)?{type:"vertical-stack",cards:i.card}:i.card,s=await this.createCardElement2(a);e()&&(this.name=i.name,this.icon=i.icon,this.showInNavbar=i.show_in_navbar,this.cardConfig=i.card,this.configuration={more_pages:{[i.foldername]:i}},this.card=s,this._cardError=void 0,this._configurationError=void 0,this._cardLoading=!1,this._pendingPage===t&&(this._pendingPage=void 0))}async createCardElement2(e){const t=await(0,d.Kq)(this.cardHelpers,e,this._hass);return t.hass=this._hass,t}_handleEditMorePageClicked(e){x(e);const t=this.foldername,i=this.configuration?.more_pages?.[t]||{},r=i.name||this.name||"",o=i.icon||this.icon||"",n=i.show_in_navbar??!!this.showInNavbar;this._popupOpens.schedule(()=>{(0,s.fireEvent)("hass-more-info",{entityId:""},this),(0,a.d)(this._hass.localize("ui.components.entity.entity-picker.edit"),{type:"custom:dwains-edit-more-page-card",more_page:t,name:r,icon:o,showInNavbar:n,foldername:t,mode:"editor-element",cardConfig:this.cardConfig},!0,"")})}_backButtonClick(){(0,o.oo)(window,"/dwains-dashboard/more_page")}render(){return n.qy`
          <div id="more-page" class="dd-dashboard-style-refresh">
            <div class="dd-detail-view-header flex justify-between">
              <div class="dd-detail-view-title">
                <h2 class="font-semibold text-lg capitalize">
                  ${this.name}
                </h2>
                <span class="text-gray">
                  ${(0,c.A)(this._hass,"more.title_plural")}
                </span>
              </div>
              <div class="page-actions">
                ${this._hass?.user?.is_admin?n.qy`
                <ha-dropdown
                  class="ha-icon-overflow-menu-overflow"
                  placement="bottom-end"
                >
                  <ha-icon-button
                    label=${this._hass.localize("ui.common.overflow_menu")}
                    .path=${r.TdJ}
                    slot="trigger"
                  ></ha-icon-button>
                  <ha-dropdown-item
                    @click=${this._handleEditMorePageClicked}
                  >
                    <ha-svg-icon slot="icon" .path=${r.Q43}></ha-svg-icon>
                    ${this._hass.localize("ui.components.entity.entity-picker.edit")}
                  </ha-dropdown-item>
                </ha-dropdown>
                `:""}
              </div>
            </div>

            ${this._cardLoading?n.qy`
              <div class="page-state"><ha-spinner></ha-spinner></div>
            `:this._cardError?n.qy`
              <div class="page-state page-error">${this._cardError.message||this._cardError}</div>
            `:this.card||n.qy`
              <div class="page-state">No page content is configured.</div>
            `}

            <div class="more-page-back-layer">
              <div @click=${this._backButtonClick} class="back-button">
                <div class="button">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        `}}v("more-page-card",$)},2970(e,t,i){"use strict";var a=i(6009),s=i(3475),r=i(4849),o=i(2330),n=i(9165),d=i(6684),c=i(6752);class l{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}const{I:h}=c.ge,p={},u=(e=>(...t)=>({_$litDirective$:e,values:t}))(class extends l{constructor(){super(...arguments),this.key=c.s6}render(e,t){return this.key=e,t}update(e,[t,i]){return t!==this.key&&(((e,t=p)=>{e._$AH=t})(e),this.key=t),i}});var m=i(1621),g=i(216);const{loadSortable:_}=i(4725),{EventSubscriptionOwner:f}=i(5179),{TimerOwner:y}=i(9792),{PopupOpenScheduler:b}=i(6138),{ReloadableLoadOwner:v}=i(5833),{hassConnectionIdentity:w,hasHassConnectionChanged:x}=i(9187),{websocketReadStore:$}=i(7069),{closeParentDropdown:k}=i(9823),{defineDwainsElement:C}=i(1415),{dispatchMorePageMetadataChanged:E}=i(6392),A=new WeakMap;function S(e){const t=e?.connection||e;return!t||"object"!=typeof t&&"function"!=typeof t?void 0:t}class D extends d.WF{static get properties(){return{configuration:{},editMode:{},_loading:{state:!0},_loadError:{state:!0},_actionError:{state:!0},_sortError:{state:!0}}}constructor(){super(),this._subscriptions=new f,this._timers=new y,this._popupOpens=new b(this._timers),this._loads=new v(e=>this._loadConfiguration(e)),this._startedHass=void 0,this._configReady=!1,this._loading=!0,this.editMode=!1,this._sortGeneration=0,this._gridRevision=0,this._pendingSortOrder=void 0,this._dragActive=!1,this._reloadAfterSort=!1,this._confirmedVisibility=new Map}set hass(e){const t=x(this._hass,e);this._hass=e;const i=S(e);this.editMode=!!i&&(A.get(i)??!1),t&&this.isConnected&&(this._subscriptions.disconnect(),this._subscriptions.connect()),this._startIfReady(t)}setConfig(e){this._hass||(this._hass=(0,a.mo)());const t=S(this._hass);this.editMode=!!t&&(A.get(t)??!1),this._configReady=!0,this._startIfReady()}async connectedCallback(){super.connectedCallback(),this._subscriptions.connect(),this._timers.connect(),await this._startIfReady()}async _startIfReady(e=!1){const t=w(this._hass);if(!this.isConnected||!this._hass||!this._configReady||this._startedHass===t)return;this._hass;this._startedHass=t;try{e?await this._reloadCard():await this._loadData(),this.isConnected&&w(this._hass)===t&&this._startedHass===t&&await this._subscribeReload()}catch(e){this._startedHass===t&&(this._startedHass=void 0),this._loading=!1,this._loadError=e,console.error("Error starting more pages card:",e)}}disconnectedCallback(){super.disconnectedCallback(),this._subscriptions.disconnect(),this._timers.disconnect(),this._startedHass=void 0,this._sortGeneration+=1,this._pendingSortOrder=void 0,this._dragActive=!1,this._reloadAfterSort=!1,this._loads.invalidate(),this._destroySortable()}updated(e){(e.has("editMode")||this.editMode&&e.has("configuration"))&&this._syncSortable()}_subscribeReload(){return this._subscriptions.subscribeEvent("more-pages",this._hass,"dwains_dashboard_more_pages_reload",()=>{$.invalidate(this._hass,{type:"dwains_dashboard/configuration/get"}),$.invalidate(this._hass,{type:"dwains_dashboard/more_pages/get"}),this._dragActive||this._pendingSortOrder?this._reloadAfterSort=!0:this._reloadCard().catch(e=>{console.error("Error reloading more pages card:",e)})})}async _reloadCard(){await this._loads.reload(),this.requestUpdate()}_loadData(){return this._loads.load()}async _loadConfiguration({isCurrent:e=()=>!0}={}){let t=await $.readPreferred(this._hass,{type:"dwains_dashboard/more_pages/get"},{type:"dwains_dashboard/configuration/get"},{capability:"dashboard-read-slices"});if(e()){for(const[e,i]of this._confirmedVisibility){const a=t.more_pages?.[e]||{};a.show_in_navbar===i?this._confirmedVisibility.delete(e):t={...t,more_pages:{...t.more_pages||{},[e]:{...a,foldername:e,show_in_navbar:i}}}}this._pendingSortOrder&&(t=this._configurationWithMorePageOrder(t,this._pendingSortOrder)),this.configuration=t,this._loading=!1,this._loadError=void 0}}_handleMorePageClick(e){const t=e.currentTarget.path;(0,s.oo)(window,"/dwains-dashboard/more_page_"+t),this.requestUpdate()}_handleCreateMorePageClicked(e){k(e),e.stopPropagation(),this._popupOpens.schedule(()=>{(0,o.fireEvent)("hass-more-info",{entityId:""},this),(0,r.d)((0,m.A)(this._hass,"more.create"),{type:"custom:dwains-edit-more-page-card"},!0,"")})}_handleRemoveMorePageClicked(e){k(e),e.stopPropagation();const t=e.currentTarget.more_page;this._hass.callWS({type:"dwains_dashboard/remove_more_page",foldername:t}).then(async e=>{if(this.configuration&&this.configuration.more_pages&&this.configuration.more_pages[t]){const e={...this.configuration.more_pages};delete e[t],this.configuration={...this.configuration,more_pages:e},this.requestUpdate()}$.invalidate(this._hass,{type:"dwains_dashboard/configuration/get"}),$.invalidate(this._hass,{type:"dwains_dashboard/more_pages/get"}),await this._reloadCard()},e=>{console.error("Message failed!",e)})}async _handleNavbarVisibilityClick(e){k(e),e.stopPropagation();const t=e.currentTarget.more_page,i=Boolean(e.currentTarget.show_in_navbar),a=this.configuration?.more_pages?.[t]||{};this._actionError=void 0;try{const e=await this._hass.callWS(i?{type:"dwains_dashboard/add_more_page_to_navbar",more_page:t}:{type:"dwains_dashboard/edit_more_page_button",more_page:t,name:a.name||t,icon:a.icon||"mdi:puzzle",showInNavbar:!1}),s={...a,...e?.page||{},foldername:e?.foldername||t,show_in_navbar:i};this.configuration={...this.configuration,more_pages:{...this.configuration?.more_pages||{},[t]:s}},this._confirmedVisibility.set(t,i),E(window,s),$.invalidate(this._hass,{type:"dwains_dashboard/configuration/get"}),$.invalidate(this._hass,{type:"dwains_dashboard/more_pages/get"}),this._actionError=void 0,this.requestUpdate()}catch(e){this._actionError=e,console.error("Failed to change More Page navigation visibility:",e)}}async _handleEditMorePageClicked(e){k(e),e.stopPropagation();const t=e.currentTarget.more_page;try{const e=await $.readPreferred(this._hass,{type:"dwains_dashboard/more_page/get",foldername:t},{type:"dwains_dashboard/configuration/get"},{capability:"dashboard-read-slices",selectFallback:e=>e?.more_pages?.[t]});if(!e?.card)throw new Error(`More page "${t}" has no card configuration`);const i=this._confirmedVisibility.get(t);this._popupOpens.schedule(()=>{(0,o.fireEvent)("hass-more-info",{entityId:""},this),(0,r.d)((0,m.A)(this._hass,"more.edit"),{type:"custom:dwains-edit-more-page-card",foldername:e.foldername||t,name:e.name,icon:e.icon,showInNavbar:i??e.show_in_navbar,cardConfig:e.card,mode:"editor-element"},!0,"")})}catch(e){console.error("Failed to load more page for editing:",e),this._loadError=e}}_handleEditModeClicked(e){k(e),e.stopPropagation();const t=!0===e.currentTarget.ddValue;this.editMode=t;const i=S(this._hass);i&&A.set(i,t)}async _syncSortable(){if(this._destroySortable(),!this.editMode||!this.isConnected)return;const e=this._sortableGeneration=(this._sortableGeneration||0)+1;let t;try{t=await _()}catch(e){return void console.error("Dwains Dashboard: failed to load drag and drop (reload the page after an update)",e)}if(e!==this._sortableGeneration||!this.editMode||!this.isConnected)return;this._destroySortable();const i=this.shadowRoot?.querySelector(".sortable");if(!i)return;const a=this;this._sortable=[new t(i,{forceFallback:!0,animation:150,dataIdAttr:"data-more_page",handle:".sortable-move",onStart(){a._dragActive=!0},onEnd(){const e=this.toArray();a._dragActive=!1,a._reloadAfterSort=!1,a._saveMorePageOrder(e)}})]}_configurationWithMorePageOrder(e,t){const i={...e?.more_pages||{}};return t.forEach((e,t)=>{i[e]&&(i[e]={...i[e],sort_order:t+1})}),{...e||{},more_pages:i}}async _saveMorePageOrder(e){if(!Array.isArray(e)||0===e.length)return;const t=++this._sortGeneration;this._pendingSortOrder=[...e],this._gridRevision+=1,this._sortError=void 0,this.configuration=this._configurationWithMorePageOrder(this.configuration,e),this.requestUpdate();try{const i=await this._hass.callWS({type:"dwains_dashboard/sort_more_page",sortData:JSON.stringify(e)});if(t!==this._sortGeneration)return;const a=Array.isArray(i?.order)?i.order:e;if(this._pendingSortOrder=[...a],this.configuration=this._configurationWithMorePageOrder(this.configuration,a),$.invalidate(this._hass,{type:"dwains_dashboard/configuration/get"}),$.invalidate(this._hass,{type:"dwains_dashboard/more_pages/get"}),this._reloadAfterSort=!1,await this._reloadCard(),t!==this._sortGeneration)return;this._pendingSortOrder=void 0,this._reloadAfterSort=!1,this.requestUpdate()}catch(e){if(t!==this._sortGeneration)return;this._pendingSortOrder=void 0,this._reloadAfterSort=!1,this._sortError=e,console.error("Failed to save More Page order:",e),$.invalidate(this._hass,{type:"dwains_dashboard/configuration/get"}),$.invalidate(this._hass,{type:"dwains_dashboard/more_pages/get"}),await this._reloadCard().catch(e=>{console.error("Failed to restore More Page order:",e)})}}_destroySortable(){this._sortable?.forEach(e=>e.destroy()),this._sortable=void 0}_renderPageButton(e,t){return t.name?d.qy`
            <div class="relative" data-more_page="${e}">
              <div class="flex justify-between h-44 p-3 more-page-button" .path=${e} @click=${this._handleMorePageClick}>
                <div class="h-full flex flex-wrap content-between">
                  <div class="w-full ha-icon">
                    ${this.configuration.more_pages[e]&&this.configuration.more_pages[e].icon?d.qy`
                      <ha-icon
                        class="h-14 w-14"
                        style="color: var(--primary-color);"
                        .icon=${this.configuration.more_pages[e].icon}
                      ></ha-icon>`:""}
                  </div>
                  <div class="w-full">
                    <h3 class="font-semibold text-lg capitalize">${t.name.replace(/_/g," ")}</h3>
                  </div>
                </div>
              </div>
            ${this.editMode?d.qy`
              <ha-card>
                <div class="card-actions-multiple">
                  <div class="sortable-move">
                    <ha-icon
                      .icon=${"mdi:cursor-move"}
                    >
                    </ha-icon>
                  </div>
                  <ha-dropdown
                    class="ha-icon-overflow-menu-overflow"
                    placement="bottom-end"
                  >
                    <ha-icon-button
                      label=${this._hass.localize("ui.common.overflow_menu")}
                      .path=${n.TdJ}
                      slot="trigger"
                    ></ha-icon-button>
                      <ha-dropdown-item
                        .more_page=${e}
                        @click=${this._handleEditMorePageClicked}
                      >
                        <ha-svg-icon slot="icon" .path=${n.Q43}></ha-svg-icon>
                        ${this._hass.localize("ui.components.entity.entity-picker.edit")}
                      </ha-dropdown-item>
                      <ha-dropdown-item
                        .more_page=${e}
                        @click=${this._handleRemoveMorePageClicked}
                      >
                        <ha-icon slot="icon" .icon=${"mdi:trash-can"}></ha-icon>
                        ${this._hass.localize("ui.common.remove")}
                      </ha-dropdown-item>
                      <ha-dropdown-item
                        .more_page=${e}
                        .show_in_navbar=${!t.show_in_navbar}
                        @click=${this._handleNavbarVisibilityClick}
                      >
                        <ha-icon slot="icon" .icon=${t.show_in_navbar?"mdi:tag-minus":"mdi:tag-plus"}></ha-icon>
                        ${(0,m.A)(this._hass,t.show_in_navbar?"more.remove_navbar":"more.add_navbar")}
                      </ha-dropdown-item>
                  </ha-dropdown>
                </div>
              </ha-card>`:""}
            </div>
          `:d.qy``}render(){if(this._loading)return d.qy`<div class="overview-state"><ha-spinner></ha-spinner></div>`;if(this._loadError)return d.qy`<div class="overview-state overview-error">${this._loadError.message||this._loadError}</div>`;const e=this.configuration?.more_pages||{},t=Object.entries(e).sort(function(e,t){let i=e[1].sort_order??99,a=t[1].sort_order??99;return i==a?0:i>a?1:-1});return d.qy`
                <div id="more_pages" class="p-4 dd-dashboard-style-refresh">
                    ${this._actionError?d.qy`
                      <div class="overview-state overview-error">
                        ${this._actionError.message||this._actionError}
                      </div>
                    `:""}
                    <div class="flex justify-between mb-2">
                    <div>
                        <h2 class="font-semibold text-lg capitalize">
                        ${(0,m.A)(this._hass,"more.title_plural")}
                        </h2>
                        <span class="text-gray-700">
                        ${t.length} ${(0,m.A)(this._hass,"more.pages")}
                        </span>
                    </div>
                    <div>
                      ${this._hass.user.is_admin?d.qy`
                        <ha-dropdown
                        class="ha-icon-overflow-menu-overflow"
                        placement="bottom-end"
                        >
                          <ha-icon-button
                              label=${this._hass.localize("ui.common.overflow_menu")}
                              .path=${n.TdJ}
                              slot="trigger"
                          ></ha-icon-button>
                            <ha-dropdown-item
                                @click=${this._handleCreateMorePageClicked}
                            >
                                <ha-svg-icon slot="icon" .path=${n.noC}></ha-svg-icon>
                                ${(0,m.A)(this._hass,"more.create")}
                            </ha-dropdown-item>
                            ${this.editMode?d.qy`
                            <ha-dropdown-item
                              .ddValue=${!1}
                              @click=${this._handleEditModeClicked}
                            >
                              <ha-svg-icon slot="icon" .path=${n.CZ3}></ha-svg-icon>
                              ${(0,m.A)(this._hass,"global.disable_edit_mode")}
                            </ha-dropdown-item>`:d.qy`
                            <ha-dropdown-item
                              .ddValue=${!0}
                              @click=${this._handleEditModeClicked}
                            >
                              <ha-svg-icon slot="icon" .path=${n.CZ3}></ha-svg-icon>
                              ${(0,m.A)(this._hass,"global.enable_edit_mode")}
                            </ha-dropdown-item>
                            `}
                        </ha-dropdown>
                        `:""}
                    </div>
                    </div>

                    ${this._sortError?d.qy`
                      <div class="sort-error" role="alert">
                        ${this._sortError.message||this._sortError}
                      </div>
                    `:""}
                    ${u(this._gridRevision,d.qy`
                      <div class="grid grid-cols-2 dd-overview-grid md-grid-cols-3 xl-grid-cols-4 gap-4 sortable">
                        ${t.map(([e,t])=>this._renderPageButton(e,t))}
                      </div>
                    `)}
                </div>
            `}static get styles(){return[d.AH`
            :host {
              display: block;
              box-sizing: border-box;
              width: 100%;
              min-width: 0;
              max-width: 100%;
            }
            .dd-overview-grid {
              box-sizing: border-box;
              width: 100%;
              min-width: 0;
              max-width: 100%;
            }
            .sort-error {
              margin: 0 0 1rem;
              padding: .75rem;
              border-radius: .25rem;
              color: var(--error-color);
              background: color-mix(in srgb, var(--error-color) 10%, transparent);
            }
            @media (max-width: 599px) {
              #more_pages {
                box-sizing: border-box;
                max-width: 100%;
              }
              .grid.dd-overview-grid > * {
                min-width: 0;
                max-width: 100%;
              }
            }
            .sortable-move {
              cursor: -webkit-grabbing;
              cursor: grab;
              margin: auto 0;
            }
            .overview-state {
              display: flex;
              min-height: 10rem;
              align-items: center;
              justify-content: center;
              color: var(--secondary-text-color);
            }
            .overview-error {
              color: var(--error-color);
            }
            .card-actions-multiple {
              display: flex;
              justify-content: space-between;
              padding: 0.25rem 0.5rem;
            }
            .more-page-button .info ha-icon, .ha-icon ha-icon {
              display: inline-block;
              margin: auto;
              --mdc-icon-size: 100% !important;
              --iron-icon-width: 100% !important;
              --iron-icon-height: 100% !important;
            }
            #badges {
              cursor: pointer;
              background: var( --ha-card-background, var(--card-background-color, white) );
              box-shadow: var( --ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12) );
              color: var(--primary-text-color);
            }
            .more-page-button {
              cursor: pointer;
              background: var( --ha-card-background, var(--card-background-color, white) );
              border-radius: var(--ha-card-border-radius, 4px);
              box-shadow: var( --ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12) );
              color: var(--test-primary-text-color, var(--primary-text-color));
            }
            .info-badge {
              /*background-color: var(--sidebar-icon-color);
              color: var( --ha-card-background, var(--card-background-color, white) );*/
              background-color: var(--secondary-background-color);
            }
            /*styling tailwind dwains version*/
            *, ::after, ::before {
              box-sizing: border-box;
            }
            h1,h2,h3 {
              margin: 0;
            }
            h3 {
              font-size: 1em;
            }
            .absolute {
              position: absolute
            }
            .break-words {
              overflow-wrap: break-word;
            }
            .relative {
                position: relative
            }
            .sticky {
                position: -webkit-sticky;
                position: sticky
            }
            .top-0 {
                top: 0px
            }
            .bottom-0 {
                bottom: 0px
            }
            .z-30 {
                z-index: 30
            }
            .col-span-1 {
                grid-column: span 1 / span 1
            }
            .col-span-2 {
                grid-column: span 2 / span 2
            }
            .row-span-1 {
                grid-row: span 1 / span 1
            }
            .row-span-2 {
                grid-row: span 2 / span 2
            }
            .my-4 {
                margin-top: 1rem;
                margin-bottom: 1rem
            }
            .mx-auto {
              margin-left: auto;
              margin-right: auto
            }
            .mb-2 {
                margin-bottom: 0.5rem
            }
            .mb-4 {
                margin-bottom: 1rem
            }
            .mt-4 {
                margin-top: 1rem
            }
            .mr-0\.5 {
                margin-right: 0.125rem
            }
            .mr-0 {
                margin-right: 0px
            }
            .mb-12 {
                margin-bottom: 3rem
            }
            .mb-5 {
                margin-bottom: 1.25rem
            }
            .mb-16 {
                margin-bottom: 4rem
            }
            .ml-4 {
                margin-left: 1rem
            }
            .block {
                display: block
            }
            .inline-block {
                display: inline-block
            }
            .flex {
                display: flex
            }
            .inline-flex {
                display: inline-flex
            }
            .grid {
                display: grid
            }
            .hidden {
                display: none
            }
            .h-6 {
                height: 1.5rem
            }
            .h-44 {
                height: 11rem
            }
            .h-full {
                height: 100%
            }
            .h-14 {
                height: 3.5rem
            }
            .h-8 {
                height: 2rem
            }
            .w-full {
                width: 100%
            }
            .w-6 {
                width: 1.5rem
            }
            .w-14 {
                width: 3.5rem
            }
            .w-8 {
                width: 2rem
            }
            .w-12 {
              width: 3rem
            }
            .cursor-pointer {
                cursor: pointer
            }
            .grid-flow-row-dense {
                grid-auto-flow: row dense
            }
            .grid-cols-1 {
                grid-template-columns: repeat(1, minmax(0, 1fr))
            }
            .grid-cols-2 {
                grid-template-columns: repeat(2, minmax(0, 1fr))
            }
            .flex-wrap {
                flex-wrap: wrap
            }
            .content-between {
                align-content: space-between
            }
            .items-center {
                align-items: center
            }
            .justify-between {
                justify-content: space-between
            }
            .gap-4 {
                gap: 1rem
            }
            .space-y-0.5 > :not([hidden]) ~ :not([hidden]) {
                --tw-space-y-reverse: 0;
                margin-top: calc(0.125rem * calc(1 - var(--tw-space-y-reverse)));
                margin-bottom: calc(0.125rem * var(--tw-space-y-reverse))
            }
            .space-y-0 > :not([hidden]) ~ :not([hidden]) {
                --tw-space-y-reverse: 0;
                margin-top: calc(0px * calc(1 - var(--tw-space-y-reverse)));
                margin-bottom: calc(0px * var(--tw-space-y-reverse))
            }
            .rounded {
                border-radius: 0.25rem
            }
            .rounded-md {
                border-radius: 0.375rem
            }
            .bg-gray-800 {
                --tw-bg-opacity: 1;
                background-color: rgb(31 41 55 / var(--tw-bg-opacity))
            }
            .rounded-lg {
              border-radius: 0.5rem
            }
            .border-2 {
                border-width: 2px
            }
            .border-dashed {
                border-style: dashed
            }
            .border-gray-300 {
                --tw-border-opacity: 1;
                border-color: rgb(209 213 219 / var(--tw-border-opacity))
            }
            .bg-gray-800 {
                --tw-bg-opacity: 1;
                background-color: rgb(31 41 55 / var(--tw-bg-opacity))
            }
            .bg-opacity-50 {
                --tw-bg-opacity: 0.5
            }
            .p-2 {
              padding: 0.5rem;
            }
            .p-4 {
                padding: 1rem
            }
            .p-1 {
                padding: 0.25rem
            }
            .p-3 {
                padding: 0.75rem
            }
            .px-1 {
                padding-left: 0.25rem;
                padding-right: 0.25rem
            }
            .p-12 {
              padding: 3rem
            }
            .py-0\.5 {
                padding-top: 0.125rem;
                padding-bottom: 0.125rem
            }
            .py-0 {
                padding-top: 0px;
                padding-bottom: 0px
            }
            .py-1 {
              padding-top: 0.25rem;
              padding-bottom: 0.25rem
            }
            .px-2 {
              padding-left: 0.5rem;
              padding-right: 0.5rem
            }
            .text-center {
              text-align: center
            }
            .text-right {
                text-align: right
            }
            .text-xl {
                font-size: 1.5rem;
                line-height: 2rem
            }
            .text-lg {
                font-size: 1.125rem;
                line-height: 1.75rem
            }
            .text-sm {
                font-size: 0.875rem;
                line-height: 1.25rem
            }
            .text-xs {
                font-size: 0.75rem;
                line-height: 1rem
            }
            .font-semibold {
                font-weight: 600
            }
            .font-medium {
                font-weight: 500
            }
            .capitalize {
                text-transform: capitalize
            }
            .text-gray {
                color: var(--paper-item-body-secondary-color, var(--secondary-text-color));
            }
            .text-white {
                --tw-text-opacity: 1;
                color: rgb(255 255 255 / var(--tw-text-opacity))
            }
            @media (min-width: 768px) {
                .md-grid-cols-3 {
                    grid-template-columns: repeat(3, minmax(0, 1fr))
                }
            }
            @media (min-width: 1024px) {
                .lg-col-span-1 {
                    grid-column: span 1 / span 1
                }
                .lg-col-span-3 {
                    grid-column: span 3 / span 3
                }
                .lg-col-span-2 {
                    grid-column: span 2 / span 2
                }
                .lg-row-span-1 {
                    grid-row: span 1 / span 1
                }
                .lg-row-span-3 {
                    grid-row: span 3 / span 3
                }
                .lg-row-span-2 {
                    grid-row: span 2 / span 2
                }
                .lg-block {
                    display: block
                }
                .lg-hidden {
                    display: none
                }
                .lg-w-1-2 {
                    width: 50%
                }
                .lg-grid-cols-2 {
                    grid-template-columns: repeat(2, minmax(0, 1fr))
                }
                .lg-grid-cols-3 {
                    grid-template-columns: repeat(3, minmax(0, 1fr))
                }
            }
            @media (min-width: 1536px) {
              .xl-col-span-1 {
                  grid-column: span 1 / span 1
              }
              .xl-col-span-4 {
                  grid-column: span 4 / span 4
              }
              .xl-col-span-2 {
                  grid-column: span 2 / span 2
              }
              .xl-row-span-1 {
                  grid-row: span 1 / span 1
              }
              .xl-row-span-4 {
                  grid-row: span 4 / span 4
              }
              .xl-row-span-2 {
                  grid-row: span 2 / span 2
              }
              .xl-w-1-3 {
                  width: 33.333333%
              }
              .xl-w-2-3 {
                  width: 66.666667%
              }
              .xl-grid-cols-4 {
                  grid-template-columns: repeat(4, minmax(0, 1fr))
              }
          }
          `,(0,g.X5)(d.AH)]}}C("more-pages-card",D)},3036(e,t,i){"use strict";var a=()=>i(2866),s=i.cw(function(e,t){const i="/dwains-dashboard/more_page",a=`${i}_`;function s(e){const t=String(e||"").split("#",1)[0].split("?",1)[0];return t.length>1?t.replace(/\/+$/,""):t}function r(e){const t=String(e||"").replace(/^#/,"");try{return decodeURIComponent(t)}catch(e){return t}}function o(e){const t=String(e||"").toLowerCase().replace(/'/g,"_").replace(/ /g,"_");return`${a}${t}`}e.exports={createNavigationActiveState:function({currentPath:e,fallbackHash:t,devices:n={},morePages:d={}}){const{pathname:c,hash:l}=function(e,t=""){const i=String(e||""),a=i.indexOf("#");return{pathname:s(i),hash:r(-1===a?t:i.slice(a))}}(e,t),h=Object.entries(n).find(([e,t])=>t?.show_in_navbar&&r(e)===l)?.[0],p=Object.entries(d).find(([e,t])=>t?.show_in_navbar&&o(e)===c)?.[0],u="/dwains-dashboard/devices"===c,m=c===i||c.startsWith(a);return{home:"/dwains-dashboard/home"===c,devices:u&&void 0===h,device:e=>u&&h===e,morePages:m&&void 0===p,morePage:e=>m&&p===e}},morePageRoutePath:o,navigationLocationPath:function(e,t=""){return e?.pathname?`${e.pathname}${e.search||""}${e.hash||""}`:String(t||"")}}}),r=i.cw(function(e,t){const{EventListenerOwner:i}=a();function s(e,t=0){return Number.isFinite(e)?e:t}function r(e,t){const i=e?.visualViewport,a=s(i?.scale,1),r=a>0?a:1,o=s(i?.width,e?.innerWidth||0),n=i?o*r:o,d=n<=768,c=n<=871,l=d&&r<.999,h=l?Math.max(r,.5):1;if(!l)return Object.freeze({mobile:d,compact:c,compensate:!1});const p=s(t?.documentElement?.clientHeight,e?.innerHeight||0),u=s(i?.height,p),m=s(i?.offsetLeft,0),g=s(i?.offsetTop,0)+u-p;return Object.freeze({mobile:d,compact:c,compensate:!0,width:o*h,inverseScale:1/h,offsetLeft:m,offsetTop:g})}function o(e,t,i){e?.toggleAttribute&&e.toggleAttribute(t,i)}function n(e,t){o(e,"mobile-navigation",t.mobile),o(e,"compact-navigation",t.compact);const i=e?.getRootNode?.(),a="dwains-dashboard-layout"===i?.host?.localName?i.host:void 0,s="dwains_navigation"===e?.parentElement?.id?e.parentElement:i?.querySelector?.("#dwains_navigation");o(a,"mobile-navigation",t.mobile),t.compensate&&s?.style?(s.style.setProperty("width",`${t.width}px`),s.style.setProperty("right","auto"),s.style.setProperty("transform-origin","left bottom"),s.style.setProperty("transform",`translate(${t.offsetLeft}px, ${t.offsetTop}px) scale(${t.inverseScale})`)):function(e){if(e?.style)for(const t of["width","right","transform","transform-origin"])e.style.removeProperty(t)}(s)}e.exports={VisualViewportNavigationOwner:class{constructor({windowRef:e=window,documentRef:t=document}={}){this._window=e,this._document=t,this._listeners=new i,this._scheduleRefresh=this._scheduleRefresh.bind(this)}connect(e){this.disconnect(),this._target=e;const t=this._window?.visualViewport;t&&(this._listeners.listen("viewport-resize",t,"resize",this._scheduleRefresh),this._listeners.listen("viewport-scroll",t,"scroll",this._scheduleRefresh)),this._listeners.listen("window-resize",this._window,"resize",this._scheduleRefresh),this._listeners.connect(),this.refresh()}refresh(){this._target&&n(this._target,r(this._window,this._document))}_scheduleRefresh(){this._target&&void 0===this._frame&&(this._frame=this._window.requestAnimationFrame(()=>{this._frame=void 0,this.refresh()}))}disconnect(){void 0!==this._frame&&(this._window.cancelAnimationFrame(this._frame),this._frame=void 0),this._listeners.disconnect(),this._target&&n(this._target,{mobile:!1,compact:!1,compensate:!1}),this._target=void 0}}}}),o=i(6684),n=i(3475),d=i(2330),c=i(1621),l=i(216);const{EventSubscriptionOwner:h}=i(5179),{EventListenerOwner:p}=a(),{ReloadableLoadOwner:u}=i(5833),{hassConnectionIdentity:m,hasHassConnectionChanged:g}=i(9187),{websocketReadStore:_}=i(7069),{defineDwainsElement:f}=i(1415),{VisualViewportNavigationOwner:y}=r(),{createNavigationActiveState:b,morePageRoutePath:v,navigationLocationPath:w}=s(),{MORE_PAGE_METADATA_CHANGED_EVENT:x,MORE_PAGE_SAVED_EVENT:$}=i(6392),k=new WeakMap,C=new WeakMap;function E(e){const t=e?.connection||e;return!t||"object"!=typeof t&&"function"!=typeof t?void 0:t}class A extends o.WF{static get styles(){return[o.AH`
        :host {
            width: -webkit-fill-available;
            display: flex;
            flex-direction: column;
            background-color: var( --ha-card-background, var(--card-background-color, white) );
            height: auto;
            top: 0;
            z-index: 8;
            position: sticky;
        }
        .mainNavItems {
            flex-grow: 1;
            display: flex;
            align-items: stretch;
            padding: 0.25rem;
            justify-content: space-between;
            overflow-x: scroll;
            overscroll-behavior-x: contain;
            touch-action: pan-x;
            scrollbar-width: none;
        }
        .mainNavItems::-webkit-scrollbar {
            height: 0px;
        }
        .mainNavItems::before, .mainNavItems::after {
            content: ''; /* Insert space before the first item and after the last one */
        }
        .mainNavItems .nav-item {
            padding: 0.5rem;
            color: var(--primary-text-color);
            position: relative;
            text-align: center;
            display: grid;
            cursor: pointer;
            appearance: none;
            border: 0;
            outline: 0;
            background: transparent;
            font: inherit;
            line-height: normal;
            touch-action: pan-x;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        }
        .mainNavItems .nav-item span {
            text-transform: capitalize;
        }
        .mainNavItems .nav-item.active {
            color: var(--sidebar-selected-icon-color);
        }
        .mainNavItems .nav-item:focus-visible,
        .toggle-sidebar:focus-visible {
            outline: 2px solid var(--primary-color);
            outline-offset: -2px;
        }

        .dwains-dashboard-nav {
            display: flex;
            isolation: isolate;
            pointer-events: auto;
            touch-action: pan-x;
        }
        .toggle-sidebar {
            padding: 1.35rem;
            background: var(--secondary-background-color);
            display: none;
            cursor: pointer;
            appearance: none;
            border: 0;
            outline: 0;
            color: var(--primary-text-color);
            font: inherit;
            touch-action: manipulation;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        }
        .sidebar-always_hidden {
            /* User has the sidebar hidden so always show the button */
            display: block !important;
        }
        :host([compact-navigation]) .mainNavItems .nav-item span {
            display: none;
        }
        :host([compact-navigation]) .toggle-sidebar {
            display: block;
            padding: 0.75rem;
        }
        :host([mobile-navigation]) {
            position: relative;
            bottom: auto;
            top: auto;
            padding: 0 env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
        }
        :host([mobile-navigation]) .dwains-dashboard-nav {
            min-height: var(--dd-mobile-navigation-height, 2.75rem);
        }
        :host([mobile-navigation]) .mainNavItems {
            align-items: flex-start;
            padding: 0 0.125rem;
        }
        :host([mobile-navigation]) .mainNavItems .nav-item {
            box-sizing: border-box;
            min-width: var(--dd-mobile-navigation-height, 2.75rem);
            height: var(--dd-mobile-navigation-control-height, 2.375rem);
            margin-top: var(--dd-mobile-navigation-top-gap, 0.375rem);
            padding: 0.1875rem 0.5rem;
            place-items: center;
        }
        :host([mobile-navigation]) .mainNavItems ha-icon,
        :host([mobile-navigation]) .toggle-sidebar ha-icon {
            --mdc-icon-size: var(--dd-mobile-navigation-icon-size, 2rem);
            width: var(--dd-mobile-navigation-icon-size, 2rem);
            height: var(--dd-mobile-navigation-icon-size, 2rem);
        }
        :host([mobile-navigation]) .toggle-sidebar {
            box-sizing: border-box;
            width: var(--dd-mobile-navigation-height, 2.75rem);
            height: var(--dd-mobile-navigation-control-height, 2.375rem);
            margin-top: var(--dd-mobile-navigation-top-gap, 0.375rem);
            padding: 0.1875rem 0.375rem;
        }
        `,(0,l.YV)(o.AH)]}static get properties(){return{_hass:{type:Object},config:{type:Object},currentPath:{type:String},configuration:{type:Object},isLoading:{type:Boolean}}}set hass(e){const t=g(this._hass,e);this._hass=e;const i=k.get(E(e));i&&(this.configuration=i,this.isLoading=!1),t&&this.isConnected&&(this._subscriptions.disconnect(),this._subscriptions.connect(),this.isLoading=!0),this.isConnected&&(this.isLoading||t)&&this._startNavigation(t)}constructor(){super(),this.currentPath=w(document.location),this.isLoading=!0,this._subscriptions=new h,this._listeners=new p,this._viewportNavigation=new y,this._loads=new u(e=>this._loadConfiguration(e)),this._navigationGeneration=0,this._morePageMetadataChanged=e=>{const t=e.detail?.page;if(!t?.foldername)return;const i=E(this._hass);if(i&&"boolean"==typeof t.show_in_navbar){let e=C.get(i);e||(e=new Map,C.set(i,e)),e.set(t.foldername,t.show_in_navbar)}const a=this.configuration||{devices:{},more_pages:{}};this.configuration={...a,more_pages:{...a.more_pages||{},[t.foldername]:{...a.more_pages?.[t.foldername]||{},...t}}},i&&k.set(i,this.configuration),this.isLoading=!1,this.requestUpdate()},this._routeChanged=()=>{this.currentPath=w(document.location,this.currentPath),this.requestUpdate()}}connectedCallback(){super.connectedCallback(),this._viewportNavigation.connect(this),this._subscriptions.connect(),this._listeners.listen("location-changed",window,"location-changed",this._routeChanged),this._listeners.listen("popstate",window,"popstate",this._routeChanged),this._listeners.listen("more-page-metadata",window,x,this._morePageMetadataChanged),this._listeners.listen("more-page-saved",window,$,this._morePageMetadataChanged),this._listeners.connect(),this._hass&&this._startNavigation()}disconnectedCallback(){super.disconnectedCallback(),this._viewportNavigation.disconnect(),this._subscriptions.disconnect(),this._listeners.disconnect(),this._navigationGeneration+=1,this._loads.invalidate(),this._navigationPromise=void 0,this._navigationConnection=void 0,this.isLoading=!0}_startNavigation(e=!1){const t=m(this._hass);if(this._navigationConnection===t&&this._navigationPromise)return this._navigationPromise;const i=++this._navigationGeneration;this._navigationConnection=t;const a=(e?this._loads.reload():this.loadConfig()).then(()=>{if(this.isConnected&&i===this._navigationGeneration&&m(this._hass)===t)return this._subscribeNavigation()}).catch(e=>{console.error("Error loading navigation:",e),i===this._navigationGeneration&&(this.isLoading=!1)}).finally(()=>{this._navigationPromise===a&&(this._navigationPromise=void 0)});return this._navigationPromise=a,a}loadConfig(){return this._loads.load()}async _loadConfiguration({isCurrent:e=()=>!0}={}){const t=this._hass,i=m(t),a=await _.readPreferred(t,{type:"dwains_dashboard/navigation/get"},{type:"dwains_dashboard/configuration/get"},{capability:"dashboard-read-slices"});if(!e()||m(this._hass)!==i)return;let s=a;const r=E(t),o=r&&C.get(r);for(const[e,t]of o||[]){const i=s.more_pages?.[e]||{};i.show_in_navbar===t?o.delete(e):s={...s,more_pages:{...s.more_pages||{},[e]:{...i,foldername:e,show_in_navbar:t}}}}o&&!o.size&&C.delete(r),this.configuration=s,r&&k.set(r,s),this.isLoading=!1,this.requestUpdate()}_subscribeNavigation(){return this._subscriptions.subscribeEvent("navigation",this._hass,"dwains_dashboard_navigation_card_reload",()=>{_.invalidate(this._hass,{type:"dwains_dashboard/configuration/get"}),_.invalidate(this._hass,{type:"dwains_dashboard/navigation/get"}),this._reloadCard().catch(e=>{console.error("Error reloading navigation:",e)})})}async _reloadCard(){await this._loads.reload(),this.requestUpdate()}_stopNavigationEvent(e){e.stopPropagation()}_menuClick(e){e.preventDefault(),e.stopPropagation();const t=e.currentTarget.path;(0,n.oo)(window,t)&&(this.currentPath=w(document.location,t)),this.requestUpdate()}_toggleSidebarClick(){(0,d.fireEvent)("hass-toggle-menu",{open:!0},this)}render(){const e=this.configuration||{devices:{},more_pages:{}},t=Object.entries(e.more_pages||{}).sort(function(e,t){let i=e[1]&&e[1].sort_order?e[1].sort_order:99,a=t[1]&&t[1].sort_order?t[1].sort_order:99;return i==a?0:i>a?1:-1}),i=b({currentPath:w(document.location,this.currentPath),fallbackHash:window.location.hash,devices:e.devices,morePages:e.more_pages});return o.qy`
            <div
                class="dwains-dashboard-nav"
                @pointerdown=${this._stopNavigationEvent}
                @pointerup=${this._stopNavigationEvent}
                @pointercancel=${this._stopNavigationEvent}
                @click=${this._stopNavigationEvent}
            >
                <button
                    type="button"
                    @click=${this._toggleSidebarClick}
                    class="toggle-sidebar sidebar-${this._hass.dockedSidebar}"
                    aria-label=${this._hass.localize?.("ui.common.menu")||"Menu"}
                >
                    <ha-icon icon="${"mdi:menu"}"></ha-icon>
                </button>
                <div class="mainNavItems">
                    <button
                        type="button"
                        class="nav-item ${i.home?"active":""}"
                        @click=${this._menuClick}
                        .path=${"/dwains-dashboard/home"}
                    >
                        <ha-icon icon="${"mdi:home"}"></ha-icon>
                        <span>${(0,c.A)(this._hass,"home.title")}</span>
                    </button>
                    <button
                        type="button"
                        class="nav-item ${i.devices?"active":""}"
                        @click=${this._menuClick}
                        .path=${"/dwains-dashboard/devices"}
                    >
                        <ha-icon icon="${"mdi:format-list-bulleted-type"}"></ha-icon>
                        <span>${(0,c.A)(this._hass,"device.title_plural")}</span>
                    </button>
                    ${Object.entries(e.devices||{}).map(([e,t])=>o.qy`
                            ${t.show_in_navbar?o.qy`
                                <button
                                    type="button"
                                    class="nav-item ${i.device(e)?"active":""}"
                                    @click=${this._menuClick}
                                    .path=${"/dwains-dashboard/devices#"+e}
                                >
                                    <ha-icon icon="${t.icon}"></ha-icon>
                                    <span>${(0,c.A)(this._hass,"device."+e)}</span>
                                </button>`:""}
                        `)}
                    ${t.map(([e,t])=>o.qy`
                            ${t.show_in_navbar?o.qy`
                                <button
                                    type="button"
                                    class="nav-item ${i.morePage(e)?"active":""}"
                                    @click=${this._menuClick}
                                    .path=${v(e)}
                                >
                                    <ha-icon icon="${t.icon}"></ha-icon>
                                    <span>${t.name}</span>
                                </button>`:""}
                        `)}
                    <button
                        type="button"
                        class="nav-item ${i.morePages?"active":""}"
                        @click=${this._menuClick}
                        .path=${"/dwains-dashboard/more_page"}
                    >
                        <ha-icon icon="${"mdi:view-grid-outline"}"></ha-icon>
                        <span>${(0,c.A)(this._hass,"more.title")}</span>
                    </button>
                </div>
            </div>
        `}}f("dwainsboard-navigation-card",A),window.dispatchEvent(new CustomEvent("dwains-dashboard-runtime-ready"))},678(e,t,i){"use strict";var a=i(6684);const{EventSubscriptionOwner:s}=i(5179),{ReloadableLoadOwner:r}=i(5833),{hassConnectionIdentity:o,hasHassConnectionChanged:n}=i(9187),{defineDwainsElement:d}=i(1415),{websocketReadStore:c}=i(7069),l=Object.freeze({type:"dwains_dashboard_notification/get"});class h extends a.WF{static styles=a.AH`
    ha-card {
      box-shadow: none;
      background: transparent;
      color: var(--primary-text-color);
    }
    .notification-button ha-icon {
      display: inline-block;
      margin: auto;
      --mdc-icon-size: 100% !important;
      --iron-icon-width: 100% !important;
      --iron-icon-height: 100% !important;
      cursor: pointer;
      opacity: 0.8;
    }
    .notification-button ha-icon:hover {
      opacity: 1.0;
    }
    .w-6 {
      width: 1.5rem;
    }
    .h-6 {
      height: 1.5rem;
    }
    .notification-button {
      background: var(--ha-card-background, var(--card-background-color, white));
      border-radius: var(--ha-card-border-radius, 4px);
      box-shadow: var(--ha-card-box-shadow, 0 2px 1px -1px rgba(0,0,0,0.2), 0 1px 1px 0 rgba(0,0,0,0.14), 0 1px 3px 0 rgba(0,0,0,0.12));
      color: var(--primary-text-color);
      padding: 1rem;
      line-height: 1.25rem;
      margin: 0.25rem 0;
    }
    .sub {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .text {
      font-size: 0.875rem;
      line-height: 1.25rem;
      flex: 1 1 0%;
      width: 0px;
      font-weight: 500;
      text-transform: capitalize;
    }
    .close {
      flex-shrink: 0;
    }
  `;static get properties(){return{_hass:{},_config:{},notifications:{type:Array}}}setConfig(e){this.config=e}set hass(e){const t=n(this._hass,e);this._hass=e,this.requestUpdate(),t&&this.isConnected&&(this._subscriptions.disconnect(),this._subscriptions.connect(),this._notificationHass=void 0),this._startNotifications(t)}constructor(){super(),this.notifications=[],this._subscriptions=new s,this._loads=new r(e=>this._loadNotifications(e))}connectedCallback(){super.connectedCallback(),this._subscriptions.connect(),this._startNotifications()}_startNotifications(e=!1){const t=o(this._hass);if(!this.isConnected||!this._hass||this._notificationHass===t)return;this._hass;this._notificationHass=t,this._subscribeNotifications().catch(e=>{this._notificationHass===t&&(this._notificationHass=void 0),console.error("Failed to subscribe to notification updates",e)});(e?this._loads.reload():this._loads.load()).catch(e=>{console.error("Failed to load notifications",e)})}async _subscribeNotifications(){await this._subscriptions.subscribeEvent("notifications",this._hass,"dwains_dashboard_notifications_updated",()=>{this._notificationsUpdated().catch(e=>{console.error("Failed to refresh notifications",e)})})}disconnectedCallback(){super.disconnectedCallback(),this._notificationHass=void 0,c.invalidate(this._hass,l),this._loads.invalidate(),this._subscriptions.disconnect()}_notificationsUpdated(){return c.invalidate(this._hass,l),this._loads.reload()}async _loadNotifications({isCurrent:e=()=>!0}={}){const t=this._hass,i=o(t),a=await c.read(t,l)||[];e()&&this.isConnected&&o(this._hass)===i&&(this.notifications=a,this.requestUpdate())}_handleDismiss(e){const t=this._hass.callService("dwains_dashboard","notification_dismiss",{notification_id:e});Promise.resolve(t).catch(e=>{console.error("Failed to dismiss Dwains Dashboard notification",e)}),this._notificationsUpdated().catch(e=>{console.error("Failed to refresh notifications after dismiss",e)})}_renderNotification(e){return a.qy`
      <div class="notification-button">
        <div class="sub">
          <div class="text">${e.message}</div>
          <ha-icon
            class="h-6 w-6 close"
            icon="mdi:close"
            @click=${()=>this._handleDismiss(e.notification_id)}>
          </ha-icon>
        </div>
      </div>
    `}render(){return this.notifications.length?a.qy`
      <ha-card>
        <div id="notifications">
          ${this.notifications.map(e=>this._renderNotification(e))}
        </div>
      </ha-card>
    `:a.qy``}}d("dwains-notification-card",h)},4849(e,t,i){"use strict";i.d(t,{d:()=>v});var a=i.cw(function(e,t){e.exports={CardBuildOwner:class{constructor({loadHelpers:e,createCard:t,reportError:i=(e,t)=>console.error(e,t)}){if("function"!=typeof e||"function"!=typeof t)throw new TypeError("CardBuildOwner requires helper and card factories");this._loadHelpers=e,this._createCard=t,this._reportError=i,this._generation=0}async build(e,t){const i=++this._generation;try{const a=await this._loadHelpers(),s=await this._createCard(a,e,t);if(i!==this._generation)return;return s&&(s.hass=t),s}catch(e){return void this._reportError("Failed to create popup card",e)}}invalidate(){this._generation+=1}}}}),s=i.cw(function(e,t){const{EventListenerOwner:a}=i(2866);class s{constructor({windowObject:e=("undefined"!=typeof window?window:void 0),reportError:t=(e,t)=>console.error(e,t)}={}){this._window=e,this._history=e?.history,this._reportError=t,this._listeners=new a,this._popup=void 0,this._reopen=void 0,this._started=!1,this._popstateHandler=e=>this._handlePopstate(e)}connect(e,t){this._popup=e,this._reopen=t,!this._started&&this._window&&(this._listeners.listen("popstate",this._window,"popstate",this._popstateHandler),this._listeners.connect(),this._started=!0)}recordOpen(e){const t=this._stateWith({cardToolsPopup:!1},this._history?.state),i=this._stateWith({cardToolsPopup:!0,params:e},this._history?.state);try{this._history?.replaceState(t,""),this._history?.pushState(i,"")}catch(e){throw this._reportError("Failed to record popup navigation state",e),e}}markClosed(){if(this._history?.state?.cardToolsPopup)try{this._history.replaceState(this._stateWith({cardToolsPopup:!1},this._history.state),"")}catch(e){this._reportError("Failed to close popup navigation state",e)}}destroy(){this._started&&this._listeners.disconnect(),this._started=!1,this._popup=void 0,this._reopen=void 0}_stateWith(e,t){return{...t&&"object"==typeof t?t:{},...e}}_handlePopstate(e){e?.state&&"cardToolsPopup"in e.state&&(e.state.cardToolsPopup?Promise.resolve(this._reopen?.(e.state.params)).catch(e=>{this._reportError("Failed to restore popup navigation state",e)}):this._popup?.closeDialog())}}const r=new s;e.exports={popupHistoryController:r}}),r=i.cw(function(e,t){function i(e){const t="string"==typeof e?.type?e.type.replace(/^custom:/,""):"";return t.startsWith("dwains-edit-")||t.startsWith("dwains-create-")}e.exports={handlePopupCardRebuild:function(e,t,a){return i(e)?(t?.stopPropagation?.(),!1):(a(),!0)}}}),o=i(6009),n=i(2330),d=i(6684),c=i(4169),l=i(216);const{loadCardHelpers:h}=i(393),{CardBuildOwner:p}=a(),{popupHistoryController:u}=s(),{handlePopupCardRebuild:m}=r(),{defineOwnedElement:g}=i(1415),{closeCardToolsPopup:_,findCardToolsPopup:f,findPopupRoot:y,mountCardToolsPopup:b}=i(460);async function v(e,t,i=!1,a={},s=!1,r=!0){if(!customElements.get("card-tools-popup")){class e extends d.WF{constructor(){super(),this._cardBuilds=new p({loadHelpers:h,createCard:c.Kq})}static get properties(){return{open:{},large:{reflect:!0,type:Boolean},hass:{}}}updated(e){e.has("hass")&&this.card&&(this.card.hass=this.hass)}closeDialog(){this._cardBuilds.invalidate(),this.open=!1,u.markClosed()}async _makeCard(){this.card=null;const e=await this._cardBuilds.build(this._card,this.hass);e&&(this.card=e,this.requestUpdate())}_handleCardRebuild(e){m(this._card,e,()=>this._makeCard())}disconnectedCallback(){super.disconnectedCallback(),this._cardBuilds.invalidate()}async _applyStyles(){let e=await(0,n.V)(this,"$ ha-dialog");customElements.whenDefined("card-mod").then(async()=>{if(!e)return;const t=window.cardMod||customElements.get("card-mod");t&&"function"==typeof t.applyToElement&&(t.applyToElement.length<=3?t.applyToElement(e,this._style,{config:this._card,tag:"more-info"}):t.applyToElement(e,"more-info",this._style,{config:this._card},[],!1))})}async showDialog(e,t,i=!1,a={},s=!1){this.title=e,this._card=t,this.large=i,this._style=a,this.fullscreen=!!s,this._makeCard(),await this.updateComplete,this.open=!0,await this._applyStyles()}_enlarge(){this.large=!this.large}render(){return this.open?d.qy`
            <ha-dialog
              open
              @closed=${this.closeDialog}
              .heading=${!0}
              hideActions
              @ll-rebuild=${this._handleCardRebuild}
            >
            ${this.fullscreen?d.qy`<div slot="heading"></div>`:d.qy`
                <app-toolbar slot="heading">
                  <ha-icon-button
                    label=${"dismiss"}
                    dialogAction="cancel"
                  >
                    <ha-icon
                      .icon=${"mdi:close"}
                    ></ha-icon>
                  </ha-icon-button>
                  <div class="main-title" @click=${this._enlarge}>
                    ${this.title}
                  </div>
                </app-toolbar>
              `}
              <div class="content">
                ${this.card}
              </div>
            </ha-dialog>
          `:d.qy``}static get styles(){return[d.AH`
          ha-dialog {
            --mdc-dialog-min-width: 400px;
            --mdc-dialog-max-width: min(95vw, 960px);
            --mdc-dialog-heading-ink-color: var(--primary-text-color);
            --mdc-dialog-content-ink-color: var(--primary-text-color);
            --justify-action-buttons: space-between;
          }
          @media all and (max-width: 450px), all and (max-height: 500px) {
            ha-dialog {
              --mdc-dialog-min-width: 100vw;
              --mdc-dialog-max-width: 100vw;
              --mdc-dialog-min-height: 100%;
              --mdc-dialog-max-height: 100%;
              --mdc-shape-medium: 0px;
              --vertial-align-dialog: flex-end;
            }
          }

          app-toolbar {
            flex-shrink: 0;
            color: var(--primary-text-color);
            // background-color: var(--secondary-background-color);
            display: flex;
            flex-direction: row;
            align-items: flex-start;
          }

          .main-title {
            flex: 1;
            font-size: 22px;
            line-height: 28px;
            font-weight: 400;
            padding: 14px 4px 10px 4px;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .content {
            box-sizing: border-box;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            margin: 0;
            overflow-x: hidden;
          }

          .content > * {
            display: block;
            box-sizing: border-box;
            width: 100%;
            max-width: 100%;
            min-width: 0;
          }

          @media all and (max-width: 450px), all and (max-height: 500px) {
            app-toolbar {
              background-color: var(--app-header-background-color);
              color: var(--app-header-text-color, white);
            }
          }

          @media all and (min-width: 451px) and (min-height: 501px) {
            ha-dialog {
              --mdc-dialog-max-width: 90vw;
            }

            .content {
              width: min(600px, calc(90vw - 48px));
            }
            :host([large]) .content {
              width: calc(90vw - 48px);
            }

            :host([large]) app-toolbar {
              max-width: calc(90vw - 32px);
            }
          }
          `,(0,l.yw)(d.AH)]}}g("card-tools-popup",e)}const _=y();if(!_)return;let w=await f({root:_,selectTree:n.V});(w||(w=document.createElement("card-tools-popup"),b({root:_,popup:w,provideHass:o.zo})))&&(u.connect(w,e=>{if(!e)return;const{title:t,card:i,large:a,style:s,fullscreen:r}=e;return v(t,i,a,s,r,!1)}),r&&u.recordOpen({title:e,card:t,large:i,style:a,fullscreen:s}),w.showDialog(e,t,i,a,s))}},4912(e,t,i){const{reportRuntimeWindowError:a,reportUnhandledRejection:s}=i(7212),{iconDbRecovery:r}=i(8173),{registerLazyCard:o}=i(8116),{getDwainsRuntimeState:n}=i(5875);!function(){"use strict";const e=n();e.bundleLoaded?console.info("Dwains bundle already loaded; skipping second init"):(e.bundleLoaded=!0,r.start(),o(),window.addEventListener("error",a,!0),window.addEventListener("unhandledrejection",s))}()},7903(e,t,i){"use strict";const{formatValueWithUnit:a}=i(4396);e.exports={averageEntityStates:function(e,t,i,{isAvailable:s=()=>!0,locale:r}={}){const o=e?.[t];if(!o)return;let n;const d=o.filter(e=>!i||e.attributes.device_class===i).filter(e=>!(!s(e)||!e.attributes.unit_of_measurement||Number.isNaN(Number(e.state)))&&(n?e.attributes.unit_of_measurement===n:(n=e.attributes.unit_of_measurement,!0)));if(!d.length)return;const c=d.reduce((e,t)=>e+Number(t.state),0);return a(c/d.length,n,r)},countActiveEntities:function(e,t,i,{unavailableStates:a,statesOff:s}){const r=e?.[t];if(r)return r.filter(e=>!i||e.attributes.device_class===i).filter(e=>!a.includes(e.state)&&!s.includes(e.state)).length},groupEntityStatesByDomain:function(e,{states:t,excludedEntities:i={},domainGroups:a,deviceClasses:s,sensorDeviceClasses:r}){const o={},n=new Set(Object.values(a).flat());for(const d of e){if(i[d]?.excluded||i[d]?.hidden_in_area)continue;const e=d.indexOf(".");if(-1===e)continue;const c=d.slice(0,e);if(!n.has(c))continue;const l=t[d];if(!l)continue;const h=a.sensor.includes(c)||a.alert.includes(c)||a.cover.includes(c),p=a.sensor.includes(c)?r:s[c];h&&!p.includes(l.attributes.device_class||"")||(o[c]||=[]).push(l)}return o},isEntityHiddenInArea:function(e){return!0===e?.hidden_in_area},localizedClimateState:function(e,t,{hass:i,unavailableStates:s,statesOff:r}){const o=e?.[t];if(!o)return;const n=[];for(const e of o){const t=e.attributes.hvac_action,o=e.attributes.temperature,d=o?` (${a(Number(o),i.config.unit_system.temperature,i.locale?.language||i.language)})`:"";if(t&&"idle"!==t){const e=i.localize(`component.climate.entity_component._.state_attributes.hvac_action.state.${t}`)||i.localize(`state_attributes.climate.hvac_action.${t}`)||t;n.push(e+d)}else t||s.includes(e.state)||r.includes(e.state)||n.push(i.localize(`component.climate.state._.${e.state}`)+d)}return n.join(", ")}}},1055(e){"use strict";function t(e,t){const i=e?.entities?.[t]||{};return{entity:t,friendlyName:i.friendly_name||"",hideEntity:!0===i.hidden,hideEntityInArea:!0===i.hidden_in_area,disableEntity:!0===i.disabled,excludeEntity:!0===i.excluded,rowSpan:i.row_span||"1",colSpan:i.col_span||"1",rowSpanLg:i.row_span_lg||"1",colSpanLg:i.col_span_lg||"1",rowSpanXl:i.row_span_xl||"1",colSpanXl:i.col_span_xl||"1",customCard:Boolean(i.custom_card),customPopup:Boolean(i.custom_popup)}}e.exports={entityRecoveryActions:function(e,i,a){const s=t(e,i),r=[];return("hidden"===a||s.hideEntity)&&r.push({key:"hidden",translationKey:"entity.unhide"}),s.hideEntityInArea&&r.push({key:"hidden_in_area",translationKey:"entity.unhide_in_area"}),("disabled"===a||s.disableEntity)&&r.push({key:"disabled",translationKey:"entity.enable"}),r},entitySettingsFromConfiguration:t}},2866(e){"use strict";e.exports={EventListenerOwner:class{constructor(){this._connected=!1,this._entries=new Map}listen(e,t,i,a,s){if(!e)throw new TypeError("An event-listener key is required");if(!t||"function"!=typeof t.addEventListener||"function"!=typeof t.removeEventListener)throw new TypeError("An EventTarget-compatible listener host is required");if("function"!=typeof a)throw new TypeError("An event-listener callback is required");const r=this._entries.get(e);if(r&&r.target===t&&r.type===i&&r.listener===a&&r.options===s)return!1;r?.attached&&this._detach(r);const o={target:t,type:i,listener:a,options:s,attached:!1};return this._connected&&this._attach(o),this._entries.set(e,o),!0}connect(){if(this._connected)return;const e=[];try{for(const t of this._entries.values())this._attach(t),e.push(t)}catch(t){const i=[t];for(const t of e.reverse())try{this._detach(t)}catch(e){i.push(e)}if(i.length>1)throw new AggregateError(i,"Failed to attach event listeners");throw t}this._connected=!0}disconnect(){if(!this._connected)return;const e=[];for(const t of this._entries.values())try{this._detach(t)}catch(t){e.push(t)}if(this._connected=!1,1===e.length)throw e[0];if(e.length>1)throw new AggregateError(e,"Failed to detach event listeners")}_attach(e){e.attached||(e.target.addEventListener(e.type,e.listener,e.options),e.attached=!0)}_detach(e){e.attached&&(e.target.removeEventListener(e.type,e.listener,e.options),e.attached=!1)}}}},5179(e){"use strict";e.exports={EventSubscriptionOwner:class{constructor(e=(e,t)=>console.error(e,t)){this._reportError=e,this._connected=!1,this._entries=new Map}connect(){this._connected=!0}subscribe(e,t){const i=this._entries.get(e);if(i)return i.ready;const a={};return a.ready=Promise.resolve().then(()=>t()).then(t=>{if("function"!=typeof t)throw new TypeError(`Subscription ${e} did not return an unsubscribe function`);return this._connected&&this._entries.get(e)===a?(a.unsubscribe=t,t):this._unsubscribe(e,t).then(()=>{})}).catch(t=>{throw this._entries.get(e)===a&&this._entries.delete(e),t}),this._entries.set(e,a),a.ready}subscribeEvent(e,t,i,a){return this.subscribe(e,()=>{const s=t?.connection,r=s?.subscribeMessage,o=s?.subscribeEvents;if("function"!=typeof r&&"function"!=typeof o)throw new TypeError(`Subscription ${e} requires a Home Assistant event connection`);if("function"!=typeof a)throw new TypeError(`Subscription ${e} requires an event listener`);return"function"==typeof r?Promise.resolve(r.call(s,a,{type:"dwains_dashboard/event/subscribe",event_type:i})).catch(e=>{if("unknown_command"!==e?.code||"function"!=typeof o)throw e;return o.call(s,a,i)}):o.call(s,a,i)})}disconnect(){this._connected=!1;const e=[...this._entries.entries()];this._entries.clear();for(const[t,i]of e)i.unsubscribe&&this._unsubscribe(t,i.unsubscribe)}_unsubscribe(e,t){return Promise.resolve().then(()=>t()).catch(t=>{this._reportError(`Failed to unsubscribe ${e}`,t)})}}}},3475(e,t,i){"use strict";const{dashboardRouteState:a}=i(3991),s=new WeakMap;e.exports={QD:function(e,t,i,a=!1){if(!e?.style||!t?.themes)return!1;let r=t.default_theme;("default"===i||i&&t.themes[i])&&(r=i);const o="default"===r?{}:t.themes[r]||{},n=s.get(e)||new Set,d=new Set;for(const t of Object.keys(o)){const i=t.startsWith("--")?t:`--${t}`;e.style.setProperty(i,o[t]),d.add(i)}for(const t of n)d.has(t)||e.style.removeProperty(t);if(s.set(e,d),a&&"undefined"!=typeof document){const e=document.querySelector('meta[name="theme-color"]');if(e){e.hasAttribute("default-content")||e.setAttribute("default-content",e.getAttribute("content"));const t=o["primary-color"]||o["--primary-color"]||e.getAttribute("default-content");t&&e.setAttribute("content",t)}}return!0},mD:function(e){const t=e.indexOf(".");return-1===t?"":e.slice(0,t)},oo:function(e,t,i=!1){return a.navigate(t,{replace:i})}}},6009(e,t,i){"use strict";i.d(t,{mo:()=>c,zo:()=>l});var a=i.cw(function(e,t){const{loadCardHelpers:a}=i(393);e.exports={ensureLovelaceLoaded:async function({registry:e=("undefined"!=typeof customElements?customElements:void 0),helperLoader:t=a,reportError:i=(e,t)=>console.error(e,t)}={}){if(e?.get("hui-view"))return!0;try{return await t(),!0}catch(e){return i("Failed to load the supported Home Assistant card helpers",e),!1}}}});const{resolveHass:s}=i(7610),{ensureLovelaceLoaded:r}=a(),{findHcMain:o,findHomeAssistantHost:n,findLovelaceView:d}=i(7921);function c(){return s()}function l(e){const t=o(),i=n(),a=t||i;if(a&&"function"==typeof a.provideHass)return a.provideHass(e);const s=c();return e&&s&&(e.hass=s),e}},9187(e){"use strict";function t(e){return e?.connection??e}e.exports={hassConnectionIdentity:t,hasHassConnectionChanged:function(e,i){return Boolean(e&&t(e)!==t(i))}}},7610(e,t,i){"use strict";const{findHcMain:a,findHomeAssistantHost:s}=i(7921);e.exports={resolveHass:function({windowObject:e=window,documentObject:t=document,reportError:i=(e,t)=>console.error(e,t)}={}){try{const i={rethrow:!0},r=s(t,i);if(r?.hass)return r.hass;const o=a(t,i);return o?.hass?o.hass:r?.__hass||e.hass}catch(e){return void i("Failed to resolve the Home Assistant client",e)}}}},4169(e,t,i){"use strict";i.d(t,{fs:()=>g,Kq:()=>m,FI:()=>b,Hg:()=>f});var a=i.cw(function(e,t){e.exports={isInvalidDwainsCardElement:function(e,t){return Boolean(t&&(!e||"function"!=typeof e.setConfig||"hui-error-card"===e.localName))}}}),s=i(2330),r=i(3475);const{isInvalidDwainsCardElement:o}=a(),{defineDwainsElement:n}=i(1415),{closeCardToolsPopup:d}=i(460),{getDwainsRuntimeState:c}=i(5875),{isEditorTag:l,loadEditors:h}=i(4725),p=e=>{const t=c(),i=e=>Boolean(e?.prototype&&"function"==typeof e.prototype.setConfig);return i(t.originalConstructors?.[e])&&t.originalConstructors[e]||i(t.constructors?.[e])&&t.constructors[e]||i(customElements.get(e))&&customElements.get(e)},u=async(e,t,i)=>{const a=`${e}-ddfix`;customElements.get(a)||n(a,class extends t{});const s=document.createElement(a);if(customElements.upgrade&&customElements.upgrade(s),"function"!=typeof s.setConfig)throw new TypeError(`${a}.setConfig is not a function`);return await s.setConfig(i),s};async function m(e,t,i){const a="string"==typeof t?.type?t.type.replace(/^custom:/,""):"",s=a.startsWith("dwains-")||["homepage-card","devices-card","more-page-card","more-pages-card"].includes(a);let r,n;if(l(a))try{await h()}catch(e){console.error("Dwains Dashboard: failed to load the editors (reload the page after an update)",e)}if(s){const e=await(async e=>{let t=p(e);for(let i=0;!t&&i<100;i++)await new Promise(e=>setTimeout(e,20)),t=p(e);return t})(a);if(e)try{const s=await u(a,e,t);return i&&(s.hass=i),s}catch(e){r=e}}try{n=await e.createCardElement(t)}catch(e){r=r||e}if(o(n,s)){const e=p(a);e&&(n=await u(a,e,t))}if(!n)throw r||new Error(`Unable to create card: ${t?.type||"unknown"}`);return i&&(n.hass=i),n}async function g(){return d({selectTree:s.V})}const _=e=>"string"==typeof e?e.trim():"";function f(e,t,i,a,s){const r=_(t?.entities?.[i]?.friendly_name),o=_(a?.name),n=_(s?.name_by_user),d=_(s?.name),c=_(e?.states?.[i]?.attributes?.friendly_name),l=_(a?.original_name);return r||o||n||d||c||l||i?.split(".").pop()?.replace(/_/g," ")||i}const y=(e,t,i)=>{try{const a="string"==typeof t?t:t?.language;return new Intl.DateTimeFormat(a,i).format(e)}catch(t){return new Intl.DateTimeFormat(void 0,i).format(e)}},b=(e,t,i)=>{if("unknown"===t.state||"unavailable"===t.state)return e(`state.default.${t.state}`);if(t.attributes.unit_of_measurement)return`${t.state} ${t.attributes.unit_of_measurement}`;const a=(0,r.mD)(t.entity_id);if("input_datetime"===a){let e;if(!t.attributes.has_time)return e=new Date(t.attributes.year,t.attributes.month-1,t.attributes.day),((e,t)=>y(e,t,{dateStyle:"medium"}))(e,i);if(!t.attributes.has_date){const a=new Date;return e=new Date(a.getFullYear(),a.getMonth(),a.getDay(),t.attributes.hour,t.attributes.minute),((e,t)=>y(e,t,{timeStyle:"short"}))(e,i)}return e=new Date(t.attributes.year,t.attributes.month-1,t.attributes.day,t.attributes.hour,t.attributes.minute),((e,t)=>y(e,t,{dateStyle:"medium",timeStyle:"short"}))(e,i)}return t?.translation_key&&e(`component.${t.platform}.entity.${a}.${t.translation_key}.state.${t.state}`)||t.attributes.device_class&&e(`component.${a}.entity_component.${t.attributes.device_class}.state.${t.state}`)||e(`component.${a}.entity_component._.state.${t.state}`)||t.state}},8173(e,t,i){"use strict";const{EventListenerOwner:a}=i(2866);class s{constructor({windowObject:e=("undefined"!=typeof window?window:void 0),reportError:t=(e,t)=>console.error(e,t)}={}){this._window=e,this._indexedDb=e?.indexedDB,this._reportError=t,this._listeners=new a,this._started=!1,this._reset=!1,this._rejectionHandler=e=>this._handleRejection(e)}start(){if(!this._started){this._started=!0;try{this._window&&(this._listeners.listen("unhandledrejection",this._window,"unhandledrejection",this._rejectionHandler),this._listeners.connect())}catch(e){this._reportError("Failed to install icon database recovery listener",e)}this._inspect().catch(e=>{this._reportError("Failed to inspect the Home Assistant icon database",e)})}}stop(){if(this._started){this._started=!1;try{this._listeners.disconnect()}catch(e){this._reportError("Failed to remove icon database recovery listener",e)}}}_handleRejection(e){try{const t=e?.reason;(t?.message||String(t||"")).includes("mdi-icon-store")&&this._resetDatabase()}catch(e){this._reportError("Failed to inspect an icon database rejection",e)}}_resetDatabase(){if(!this._reset){this._reset=!0;try{this._indexedDb?.deleteDatabase("hass-icon-db")}catch(e){this._reportError("Failed to reset the Home Assistant icon database",e)}}}async _inspect(){if("function"!=typeof this._indexedDb?.databases)return;const e=await this._indexedDb.databases();if(!e?.some(e=>"hass-icon-db"===e?.name))return;const t=this._indexedDb.open("hass-icon-db");t.onerror=()=>{this._reportError("Failed to open the Home Assistant icon database",t.error||new Error("IndexedDB open failed"))},t.onsuccess=()=>{try{const e=t.result,i=!e.objectStoreNames.contains("mdi-icon-store");e.close(),i&&this._resetDatabase()}catch(e){this._reportError("Failed to validate the Home Assistant icon database",e),this._resetDatabase()}}}}const r=new s;e.exports={iconDbRecovery:r}},8116(e){"use strict";function t({HTMLElementBase:e,IntersectionObserverClass:t,reportError:i=(e,t)=>console.error(e,t)}){return class extends e{set eager(e){this.__eager=Boolean(e),this.__eager&&this.isConnected&&this._mount()}get eager(){return Boolean(this.__eager)}set hass(e){if(this.__latestHass=e,this.__c)try{this.__c.hass=e}catch(e){i("Failed to update the mounted lazy card",e)}}get hass(){return this.__latestHass}set cardFactory(e){const t="function"==typeof e?e:void 0;this.__cardFactory!==t&&(this.__cardFactory=t,this.__cardCreation=void 0,this.__cardFromFactory&&this._setCard(void 0,!1),this.__mounted&&!this.__c&&this._createCard())}get cardFactory(){return this.__cardFactory}set card(e){this._setCard(e,!1)}_setCard(e,t){if(this.__c!==e){if(this.__c=e,this.__cardFromFactory=Boolean(e&&t),e&&void 0!==this.__latestHass)try{e.hass=this.__latestHass}catch(e){i("Failed to initialize the mounted lazy card",e)}this.__mounted&&this.isConnected&&this._replaceCard(e)}}_replaceCard(e){try{for(;this.firstChild;)this.removeChild(this.firstChild)}catch(e){i("Failed to remove the previous mounted lazy card",e)}if(e)try{this.appendChild(e)}catch(e){i("Failed to append the replacement lazy card",e)}}get card(){return this.__c}connectedCallback(){this.style.display="block",this.__mounted?this.__c?this._replaceCard(this.__c):this._createCard():this.__eager||this.hasAttribute("eager")?this._mount():(this.style.minHeight||(this.style.minHeight="48px"),!this.__io&&t&&(this.__io=new t(e=>{e.some(e=>e.isIntersecting)&&this._mount()},{rootMargin:"400px 0px"})),this.__io?this.__io.observe(this):this._mount())}disconnectedCallback(){this.__io?.disconnect()}_mount(){this.__mounted||(this.__mounted=!0,this.__io?.disconnect(),this.style.minHeight="",this.__c?this._replaceCard(this.__c):this._createCard())}async _createCard(){if(this.__c||this.__cardCreation||!this.__cardFactory)return;let e;try{e=Promise.resolve(this.__cardFactory())}catch(e){return void i("Failed to create lazy card",e)}this.__cardCreation=e;try{const t=await e;if(this.__cardCreation!==e)return;if(this.__cardCreation=void 0,this.__c)return;this._setCard(t,!0)}catch(t){this.__cardCreation===e&&(this.__cardCreation=void 0),i("Failed to create lazy card",t)}}}}e.exports={registerLazyCard:function({registry:e=("undefined"!=typeof customElements?customElements:void 0),HTMLElementBase:i=("undefined"!=typeof HTMLElement?HTMLElement:void 0),IntersectionObserverClass:a=("undefined"!=typeof IntersectionObserver?IntersectionObserver:void 0),reportError:s=(e,t)=>console.error(e,t)}={}){if(!e||!i||e.get("dd-lazy-card"))return;const r=t({HTMLElementBase:i,IntersectionObserverClass:a,reportError:s});try{return e.define("dd-lazy-card",r),r}catch(e){return void s("Failed to register dd-lazy-card",e)}}}},4725(e,t,i){"use strict";function a(e){let t;return()=>(t||=e().catch(e=>{throw t=void 0,e}),t)}const s=a(()=>i.e(723).then(()=>i(1836))),r=a(()=>i.e(587).then(()=>i(8331)).then(e=>e.default));e.exports={isEditorTag:function(e){return"string"==typeof e&&(e.startsWith("dwains-edit-")||e.startsWith("dwains-create-")||e.startsWith("dwains-card-"))},loadEditors:s,loadSortable:r}},7921(e){"use strict";function t(e,t,{reportError:i=(e,t)=>console.error(e,t),rethrow:a=!1}={}){try{return t()}catch(t){if(a)throw t;return i(`Failed to resolve ${e}`,t),null}}function i(e){return e?.querySelector("home-assistant")||null}function a(e){return i(e)?.shadowRoot?.querySelector("home-assistant-main")||null}function s(e){return e?.querySelector("hc-main")||null}const r=[["ha-drawer partial-panel-resolver","ha-drawer"],["app-drawer-layout partial-panel-resolver","app-drawer-layout"],["partial-panel-resolver","direct-resolver"],["ha-panel-lovelace","direct-panel"]];function o(e){const t=a(e)?.shadowRoot;if(!t)return{root:null,variant:"unresolved"};for(const[e,i]of r){const a=t.querySelector(e);if(!a)continue;const s="ha-panel-lovelace"===e?a:(a.shadowRoot||a).querySelector("ha-panel-lovelace"),r=s?.shadowRoot||s,o=r?.querySelector("hui-root")||null;if(o)return{root:o,variant:i}}return{root:null,variant:"unresolved"}}function n(e){return o(e).root}e.exports={findHomeAssistantHost:function(e=("undefined"!=typeof document?document:void 0),a){return t("the Home Assistant host",()=>i(e),a)},findHomeAssistantMain:function(e=("undefined"!=typeof document?document:void 0),i){return t("Home Assistant main",()=>a(e),i)},findHcMain:function(e=("undefined"!=typeof document?document:void 0),i){return t("hc-main",()=>s(e),i)},findLovelaceConfig:function(e,i){return t("the Lovelace configuration",()=>n(e)?.lovelace||null,i)},findLovelaceRoot:function(e=("undefined"!=typeof document?document:void 0),i){return t("the Lovelace root",()=>n(e),i)},findLovelaceShell:function(e,{reportError:t=(e,t)=>console.error(e,t)}={}){try{const t=e?.shadowRoot;if(!t)return;return{header:t.querySelector(".header"),view:t.querySelector("#view")}}catch(e){return void t("Failed to resolve the Lovelace shell",e)}},findLovelaceView:function(e=("undefined"!=typeof document?document:void 0),i){return t("the Lovelace view",()=>{const t=s(e);if(t){const e=t.shadowRoot?.querySelector("hc-lovelace")?.shadowRoot;return e?.querySelector("hui-view")||e?.querySelector("hui-panel-view")||null}const i=n(e);let a=i?.shadowRoot;return a=a?.querySelector("ha-app-layout")||a,a=a?.querySelector("#view")||a,a?.querySelector("hui-view")||a?.querySelector("hui-panel-view")||a?.querySelector("hui-unused-entities")||a?.firstElementChild||null},i)}}},6392(e){"use strict";const t="dwains-dashboard-more-page-saved",i="dwains-dashboard-more-page-metadata-changed";e.exports={MORE_PAGE_METADATA_CHANGED_EVENT:i,MORE_PAGE_SAVED_EVENT:t,dispatchMorePageMetadataChanged:function(e,t){if(!e||"function"!=typeof e.dispatchEvent)throw new TypeError("A More Page event target is required");if(!t||"object"!=typeof t||!t.foldername)throw new TypeError("More Page metadata with a folder name is required");e.dispatchEvent(new CustomEvent(i,{detail:{page:t}}))},dispatchMorePageSaved:function(e,i){if(!e||"function"!=typeof e.dispatchEvent)throw new TypeError("A More Page event target is required");if(!i||"object"!=typeof i||!i.foldername||!i.card)throw new TypeError("A complete saved More Page is required");e.dispatchEvent(new CustomEvent(t,{detail:{page:i}}))}}},460(e,t,i){"use strict";const{findHomeAssistantHost:a}=i(7921);function s({documentObject:e=("undefined"==typeof document?void 0:document),reportError:t=(e,t)=>console.error(e,t)}={}){try{return a(e,{rethrow:!0})||e?.querySelector("hc-root")||void 0}catch(e){return void t("Failed to resolve the Home Assistant popup root",e)}}async function r({root:e,documentObject:t,selectTree:i,reportError:a=(e,t)=>console.error(e,t)}={}){const r=e||s({documentObject:t,reportError:a});if(r)if("function"==typeof i)try{return await i(r,"$ card-tools-popup")}catch(e){return void a("Failed to resolve card-tools-popup",e)}else a("Failed to resolve card-tools-popup",new TypeError("A selectTree function is required"))}e.exports={closeCardToolsPopup:async function({reportError:e=(e,t)=>console.error(e,t),...t}={}){const i=await r({...t,reportError:e});if(!i)return!1;if("function"!=typeof i.closeDialog)return e("Failed to close card-tools-popup",new TypeError("card-tools-popup.closeDialog is not available")),!1;try{return i.closeDialog(),!0}catch(t){return e("Failed to close card-tools-popup",t),!1}},findCardToolsPopup:r,findPopupRoot:s,mountCardToolsPopup:function({root:e,popup:t,provideHass:i,reportError:a=(e,t)=>console.error(e,t)}={}){const s=e?.shadowRoot;if(!s||!t)return a("Failed to mount card-tools-popup",new TypeError("A popup and Home Assistant shadow root are required")),!1;try{const e=s.querySelector("ha-more-info-dialog");return e?s.insertBefore(t,e):s.appendChild(t),i?.(t),!0}catch(e){return a("Failed to mount card-tools-popup",e),!1}}}},6138(e){"use strict";e.exports={PopupOpenScheduler:class{constructor(e,{delay:t=50,keyPrefix:i="popup-open"}={}){if(!e?.schedule)throw new Error("PopupOpenScheduler requires a TimerOwner");this._timers=e,this._delay=t,this._keyPrefix=i,this._sequence=0}schedule(e){if("function"!=typeof e)throw new TypeError("PopupOpenScheduler callback must be a function");const t=`${this._keyPrefix}-${++this._sequence}`;return this._timers.schedule(t,e,this._delay)}}}},6037(e){"use strict";function t(e,t,i){if(null==t)return;const a=e.get(t);a?a.push(i):e.set(t,[i])}e.exports={buildRegistryIndexes:function(e,i){const a=new Map,s=new Map,r=new Map,o=new Map,n=new Map,d=new Map;for(const i of e||[])if(a.set(i.id,i),t(o,i.area_id,i),null!=i.area_id){const e=n.get(i.id);e?e.add(i.area_id):n.set(i.id,new Set([i.area_id]))}for(const[e,a]of(i||[]).entries())if(s.set(a.entity_id,a),r.set(a.entity_id,e),a.area_id)t(d,a.area_id,a);else for(const e of n.get(a.device_id)||[])t(d,e,a);return{devicesById:a,entitiesById:s,devicesByAreaId:o,entitiesByAreaId:d,entityOrderById:r}},registryOrderedEntityUnion:function(e,t){const i=new Map;for(const t of e||[])for(const e of t||[])i.has(e.entity_id)||i.set(e.entity_id,e);return[...i.values()].sort((e,i)=>(t?.get(e.entity_id)??Number.MAX_SAFE_INTEGER)-(t?.get(i.entity_id)??Number.MAX_SAFE_INTEGER))}}},5833(e){"use strict";e.exports={ReloadableLoadOwner:class{constructor(e){if("function"!=typeof e)throw new TypeError("ReloadableLoadOwner requires a load function");this._load=e,this._generation=0,this._abortController=void 0}load(){if(this._current)return this._current;let e;const t=++this._generation,i=new AbortController;this._abortController=i;try{e=this._load({isCurrent:()=>this._generation===t,signal:i.signal})}catch(t){e=Promise.reject(t)}let a;return a=Promise.resolve(e).then(e=>(this._current===a&&(this._current=void 0),this._abortController===i&&(this._abortController=void 0),e),e=>{throw this._current===a&&(this._current=void 0),this._abortController===i&&(this._abortController=void 0),e}),this._current=a,a}reload(){if(!this._current)return this.load();if(this._queued)return this._queued;this._generation+=1,this._abortController?.abort("reload");const e=this._current;let t;return t=e.then(()=>{if(this._queued===t)return this._queued=void 0,this.load()},()=>{if(this._queued===t)return this._queued=void 0,this.load()}),this._queued=t,t}invalidate(){this._generation+=1,this._abortController?.abort("invalidate"),this._abortController=void 0,this._current=void 0,this._queued=void 0}}}},7212(e){"use strict";e.exports={reportRuntimeWindowError:function(e,{logError:t=(...e)=>console.error(...e)}={}){return!!e?.message?.includes("Illegal constructor")&&(t("[dwains] Illegal constructor (NOT suppressed):",e.message,`${e.filename||""}:${e.lineno||""}`),!0)},reportUnhandledRejection:function(e,{logError:t=(...e)=>console.error(...e)}={}){try{const i=e?.reason;t("[dwains] unhandledrejection (NOT suppressed):",i?.message||i||"Unknown promise rejection")}catch(e){t("[dwains] failed to inspect unhandled rejection:",e)}}}},5875(e){"use strict";const t=Symbol.for("dwains-dashboard.runtime");e.exports={getDwainsRuntimeState:function(e=("undefined"==typeof window?void 0:window)){if(!e)throw new TypeError("A Window object is required for Dwains runtime state");return e[t]||={}}}},216(e,t,i){"use strict";const a=e=>e`
  --dd-subtle-surface: var(--ha-card-background, var(--card-background-color, white));
  --dd-subtle-page-background: color-mix(in srgb, var(--primary-background-color) 82%, var(--dd-subtle-surface) 18%);
  --dd-subtle-muted: rgba(127, 127, 127, 0.055);
  --dd-subtle-muted-hover: rgba(127, 127, 127, 0.085);
  --dd-subtle-divider: rgba(127, 127, 127, 0.085);
  --dd-subtle-radius: 16px;
  --dd-subtle-radius-small: 12px;
  --dd-subtle-shadow: 0 3px 14px rgba(0, 0, 0, 0.052);
  --dd-subtle-shadow-hover: 0 7px 22px rgba(0, 0, 0, 0.078);
`,s=e=>e`
  .back-button,
  .dd-dashboard-style-refresh .back-button {
    margin-right: 1.25rem;
    margin-bottom: 4rem;
    display: inline-block;
    cursor: pointer;
  }

  .back-button .button,
  .dd-dashboard-style-refresh .back-button .button {
    box-sizing: border-box;
    width: 3.5rem;
    height: 3.5rem;
    min-width: 3.5rem;
    min-height: 3.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem !important;
    border-radius: 9999px !important;
    border: 0 !important;
    outline: 0 !important;
    background: var(--primary-color) !important;
    background-color: var(--primary-color) !important;
    color: var(--text-primary-color, #fff) !important;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18) !important;
    transition: background-color 150ms ease, box-shadow 150ms ease;
    margin-bottom: env(safe-area-inset-bottom);
  }

  .back-button .button:hover,
  .dd-dashboard-style-refresh .back-button .button:hover {
    background: color-mix(in srgb, var(--primary-color) 88%, var(--primary-text-color) 12%) !important;
    background-color: color-mix(in srgb, var(--primary-color) 88%, var(--primary-text-color) 12%) !important;
    box-shadow: 0 10px 32px rgba(0, 0, 0, 0.22) !important;
  }
`;i.d(t,["Cn",0,e=>e`
  .dd-dashboard-style-refresh {
    ${a(e)}
    --ha-card-border-radius: var(--dd-subtle-radius);
    --ha-card-box-shadow: var(--dd-subtle-shadow);
    background: var(--dd-subtle-page-background);
    color: var(--primary-text-color);
    min-height: 100%;
  }

  .dd-dashboard-style-refresh .dd-homepage-greeting {
    align-items: center;
    gap: 0.75rem;
    padding: 0.25rem 0 0.4rem;
  }

  .dd-dashboard-style-refresh .dd-homepage-greeting h1,
  .dd-dashboard-style-refresh h2,
  .dd-dashboard-style-refresh h3 {
    letter-spacing: -0.015em;
  }

  .dd-dashboard-style-refresh .dd-homepage-greeting #clock {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.45rem 0.7rem;
    border-radius: var(--dd-subtle-radius-small);
    background: var(--dd-subtle-surface);
    box-shadow: var(--dd-subtle-shadow);
    border: 0;
    color: var(--primary-text-color);
    font-weight: 650;
    line-height: 1.18;
    letter-spacing: -0.01em;
    text-shadow: none;
    -webkit-font-smoothing: antialiased;
    text-rendering: geometricPrecision;
  }

  .dd-dashboard-style-refresh #badges,
  .dd-dashboard-style-refresh .area-button {
    background: var(--dd-subtle-surface);
    border: 0;
    border-radius: var(--dd-subtle-radius);
    box-shadow: var(--dd-subtle-shadow);
    color: var(--primary-text-color);
  }

.dd-dashboard-style-refresh .area-button {
  overflow: hidden;
  transition: box-shadow 150ms ease, background-color 150ms ease;
}

.dd-dashboard-style-refresh .area-button.h-44:hover {
  box-shadow: var(--dd-subtle-shadow), 0 0 0 1px var(--dd-subtle-divider), 0 5px 18px rgba(0, 0, 0, 0.058);
}

  .dd-dashboard-style-refresh .area-button h3 {
    font-weight: 720;
    line-height: 1.16;
  }

  .dd-dashboard-style-refresh .area-button .sensors {
    display: block;
    color: var(--secondary-text-color);
    font-weight: 500;
    line-height: 1.28;
    max-height: 2.7em;
    overflow: hidden;
  }

  .dd-dashboard-style-refresh .area-button .sensor-separator {
    display: inline;
    color: var(--secondary-text-color);
    opacity: 0.55;
  }

  .dd-dashboard-style-refresh .area-button .sensor-chip {
    display: inline;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--secondary-text-color);
    white-space: normal;
  }

  .dd-dashboard-style-refresh .area-button.current {
    box-shadow: var(--dd-subtle-shadow-hover);
  }

  ${s(e)}

  .dd-dashboard-style-refresh .dd-area-view > h3,
  .dd-dashboard-style-refresh .dd-area-view .font-semibold.capitalize {
    margin: 1.1rem 0 0.55rem;
    color: var(--secondary-text-color);
    font-size: 0.92rem;
    font-weight: 720;
    letter-spacing: 0.005em;
  }

  .dd-dashboard-style-refresh .text-gray,
  .dd-dashboard-style-refresh .text-gray-500,
  .dd-dashboard-style-refresh .text-gray-600,
  .dd-dashboard-style-refresh .text-gray-700 {
    color: var(--secondary-text-color);
  }

  .dd-dashboard-style-refresh .relative > ha-card,
  .dd-dashboard-style-refresh .dd-masonry > div > div,
  .dd-dashboard-style-refresh .area-view-entity-sortable > div > div {
    border-radius: var(--dd-subtle-radius);
    overflow: hidden;
  }

  .dd-dashboard-style-refresh hui-card,
  .dd-dashboard-style-refresh ha-card {
    --ha-card-border-radius: var(--dd-subtle-radius);
    --ha-card-box-shadow: var(--dd-subtle-shadow);
    --ha-card-border-width: 0;
    --ha-card-border-color: transparent;
  }

  .dd-dashboard-style-refresh .card-actions-centered,
  .dd-dashboard-style-refresh .card-actions-multiple {
    border-top: 1px solid var(--dd-subtle-divider);
    background: var(--dd-subtle-surface);
    border-radius: 0 0 var(--dd-subtle-radius) var(--dd-subtle-radius);
    padding: 0.45rem 0.55rem;
  }

  .dd-dashboard-style-refresh button.border-dashed {
    border-color: var(--dd-subtle-divider);
    background: var(--dd-subtle-muted);
    border-radius: var(--dd-subtle-radius);
  }

  .dd-dashboard-style-refresh .sortable-move {
    color: var(--secondary-text-color);
    background: transparent;
    border-radius: 10px;
    padding: 0.35rem;
  }

  .dd-dashboard-style-refresh .sortable-move:hover {
    color: var(--primary-text-color);
    background: var(--dd-subtle-muted);
  }
`,"MP",0,e=>e`
  ha-card {
    ${a(e)}
    border: 0;
    border-radius: var(--dd-subtle-radius);
    box-shadow: var(--dd-subtle-shadow);
    background: var(--dd-subtle-surface);
    color: var(--primary-text-color);
  }

  ha-card .dd-header-tabs {
    gap: 0.45rem;
    padding: 0.7rem;
  }

  ha-card .dd-header-tab {
    padding: 0;
    border-radius: var(--dd-subtle-radius-small);
  }

  ha-card .dd-header-tab:hover {
    background: transparent;
  }

  ha-card .dd-header-tab > div {
    box-sizing: border-box;
    padding: 0.35rem 0.55rem;
    border: 0;
    border-radius: var(--dd-subtle-radius-small);
    background: transparent;
    transition: background-color 150ms ease, color 150ms ease;
  }

  ha-card .dd-header-tab > div:hover {
    background: var(--dd-subtle-muted-hover);
  }

  ha-card .round-badge {
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
  }

  ha-card .badge-icon {
    color: var(--primary-color);
    filter: none;
  }

  ha-card .domain-badge-card h3,
  ha-card .dd-header-tab h3 {
    margin-top: 0.42rem;
    font-weight: 650;
    letter-spacing: -0.01em;
    color: var(--primary-text-color);
  }

  ha-card .dd-header-tabs span {
    color: var(--secondary-text-color);
    font-weight: 500;
  }

  ha-card img.rounded-full {
    box-shadow: none;
  }
`,"Ve",0,s,"X5",0,e=>e`
  .dd-dashboard-style-refresh {
    ${a(e)}
    --ha-card-border-radius: var(--dd-subtle-radius);
    --ha-card-box-shadow: var(--dd-subtle-shadow);
    background: var(--dd-subtle-page-background);
    min-height: 100%;
  }

  .dd-dashboard-style-refresh > .flex:first-child {
    padding: 0.9rem 1rem;
    background: var(--dd-subtle-surface);
    border-radius: var(--dd-subtle-radius);
    box-shadow: var(--dd-subtle-shadow);
  }

  .dd-dashboard-style-refresh .more-page-button {
    border: 0;
    border-radius: var(--dd-subtle-radius);
    box-shadow: var(--dd-subtle-shadow);
    background: var(--dd-subtle-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 1rem;
    transition: box-shadow 150ms ease, background-color 150ms ease;
  }

  .dd-dashboard-style-refresh .more-page-button:hover {
    box-shadow: var(--dd-subtle-shadow), 0 0 0 1px var(--dd-subtle-divider), 0 5px 18px rgba(0, 0, 0, 0.058);
  }

  .dd-dashboard-style-refresh .more-page-button .ha-icon {
    width: 3.25rem;
    height: 3.25rem;
    display: grid;
    place-items: center;
    border-radius: 0;
    background: transparent;
    margin: 0 auto;
  }

  .dd-dashboard-style-refresh .more-page-button .ha-icon ha-icon {
    width: 2.15rem !important;
    height: 2.15rem !important;
    color: var(--primary-color) !important;
    filter: none;
  }

  .dd-dashboard-style-refresh .more-page-button > div:first-child {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    align-content: center;
    gap: 0.85rem;
  }

  .dd-dashboard-style-refresh .more-page-button > div:first-child > .w-full {
    display: flex;
    justify-content: center;
  }

  .dd-dashboard-style-refresh .more-page-button h3 {
    width: 100%;
    text-align: center;
    font-weight: 720;
    letter-spacing: -0.01em;
    line-height: 1.15;
  }
`,"YV",0,e=>e`
  :host {
    ${a(e)}
    border: 0;
    box-shadow: 0 1px 14px rgba(0, 0, 0, 0.055);
    background: var(--dd-subtle-surface);
  }

  :host .mainNavItems .nav-item {
    padding: 0.52rem 0.78rem;
    border-radius: var(--dd-subtle-radius-small);
    color: var(--secondary-text-color);
    transition: background-color 150ms ease, color 150ms ease;
  }

  :host .mainNavItems .nav-item.active {
    color: var(--primary-color);
    background: var(--dd-subtle-muted);
    box-shadow: none;
  }

  :host .mainNavItems .nav-item:hover {
    background: var(--dd-subtle-muted-hover);
    color: var(--primary-text-color);
  }

  :host([mobile-navigation]) {
    box-shadow: 0 -1px 14px rgba(0, 0, 0, 0.065);
  }

`,"md",0,e=>e`
  .dd-dashboard-style-refresh {
    ${a(e)}
    --ha-card-border-radius: var(--dd-subtle-radius);
    --ha-card-box-shadow: var(--dd-subtle-shadow);
    background: var(--dd-subtle-page-background);
    min-height: 100%;
  }

  .dd-dashboard-style-refresh #devices > .flex:first-child {
    padding: 0.9rem 1rem;
    background: var(--dd-subtle-surface);
    border-radius: var(--dd-subtle-radius);
    box-shadow: var(--dd-subtle-shadow);
  }

.dd-dashboard-style-refresh .device-button {
    border: 0;
    border-radius: var(--dd-subtle-radius);
    box-shadow: var(--dd-subtle-shadow);
    background: var(--dd-subtle-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 1rem;
  transition: box-shadow 150ms ease, background-color 150ms ease;
}

.dd-dashboard-style-refresh .device-button:hover {
  box-shadow: var(--dd-subtle-shadow), 0 0 0 1px var(--dd-subtle-divider), 0 5px 18px rgba(0, 0, 0, 0.058);
}

.dd-dashboard-style-refresh .device-button .ha-icon {
  width: 3.25rem;
  height: 3.25rem;
  display: grid;
  place-items: center;
  border-radius: 0;
  background: transparent;
  margin: 0 auto;
}

  .dd-dashboard-style-refresh .device-button .ha-icon ha-icon {
    width: 2.15rem !important;
    height: 2.15rem !important;
    color: var(--primary-color) !important;
    filter: none;
  }

  .dd-dashboard-style-refresh .device-button > div:first-child {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    align-content: center;
    gap: 0.85rem;
  }

  .dd-dashboard-style-refresh .device-button > div:first-child > .w-full {
    display: flex;
    justify-content: center;
  }

  .dd-dashboard-style-refresh .device-button h3 {
    width: 100%;
    text-align: center;
    font-weight: 720;
    letter-spacing: -0.01em;
    line-height: 1.15;
  }

  .dd-dashboard-style-refresh hui-card,
  .dd-dashboard-style-refresh ha-card {
    --ha-card-border-radius: var(--dd-subtle-radius);
    --ha-card-box-shadow: var(--dd-subtle-shadow);
    --ha-card-border-width: 0;
    --ha-card-border-color: transparent;
  }
`,"ww",0,e=>e`
  .dd-dashboard-style-refresh {
    ${a(e)}
    color: var(--primary-text-color);
  }

  .dd-dashboard-style-refresh .dd-detail-view-header {
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 0.9rem 1rem;
    background: var(--dd-subtle-surface);
    border: 0;
    border-radius: var(--dd-subtle-radius);
    box-shadow: var(--dd-subtle-shadow);
  }

  .dd-dashboard-style-refresh .dd-detail-view-title {
    position: sticky;
    top: 0;
    min-width: 0;
  }

  .dd-dashboard-style-refresh .dd-detail-view-title h1,
  .dd-dashboard-style-refresh .dd-detail-view-title h2,
  .dd-dashboard-style-refresh .dd-detail-view-title h3 {
    margin: 0;
    font-weight: 760;
    letter-spacing: -0.02em;
  }

  .dd-dashboard-style-refresh .dd-detail-view-title .text-gray {
    color: var(--secondary-text-color);
  }
`,"yw",0,e=>e`
  :host {
    ${a(e)}
  }

  :host ha-dialog {
    --mdc-shape-medium: 18px;
    --ha-card-border-radius: var(--dd-subtle-radius);
    --ha-card-box-shadow: var(--dd-subtle-shadow);
  }

  :host app-toolbar {
    border-bottom: 1px solid var(--dd-subtle-divider);
    background: var(--dd-subtle-surface);
  }

  :host .main-title {
    font-weight: 700;
    letter-spacing: -0.015em;
  }
`])},5213(e,t,i){"use strict";i.d(t,{H:()=>a});function a(e){const t=e.currentTarget.querySelector("ha-checkbox, ha-switch");t&&!t.disabled&&(e.composedPath().includes(t)||(e.preventDefault(),t.checked=!t.checked,t.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))))}i.d(t,["F",0,e=>e`
  .dd-check {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin: 0.6rem 0;
    padding-inline-start: 0.25rem;
    cursor: pointer;
    color: var(--primary-text-color);
  }
`])},9792(e){"use strict";e.exports={TimerOwner:class{constructor({setTimer:e=(e,t)=>setTimeout(e,t),clearTimer:t=e=>clearTimeout(e),reportError:i=(e,t)=>console.error(e,t)}={}){this._setTimer=e,this._clearTimer=t,this._reportError=i,this._connected=!1,this._timers=new Map}connect(){this._connected=!0}has(e){return this._timers.has(e)}schedule(e,t,i,{replace:a=!0}={}){if(!this._connected)return;const s=this._timers.get(e);if(s&&!a)return s.timer;s&&this.clear(e);const r={};return r.timer=this._setTimer(()=>{this._timers.get(e)===r&&this._timers.delete(e);try{Promise.resolve(t()).catch(t=>{this._reportError(`Timer ${e} failed`,t)})}catch(t){this._reportError(`Timer ${e} failed`,t)}},i),this._timers.set(e,r),r.timer}delay(e,t,{replace:i=!0}={}){if(!this._connected)return Promise.resolve(!1);const a=this._timers.get(e);if(a?.promise&&!i)return a.promise;a&&this.clear(e);const s={};return s.promise=new Promise(i=>{s.cancel=()=>i(!1),s.timer=this._setTimer(()=>{this._timers.get(e)===s&&this._timers.delete(e),s.cancel=void 0,i(!0)},t)}),this._timers.set(e,s),s.promise}clear(e){const t=this._timers.get(e);if(t){this._timers.delete(e);try{this._clearTimer(t.timer)}catch(t){this._reportError(`Failed to clear timer ${e}`,t)}finally{t.cancel?.()}}}disconnect(){this._connected=!1;for(const e of[...this._timers.keys()])this.clear(e)}}}},1621(e,t,i){"use strict";i.d(t,{A:()=>l});var a=i.cw(function(e,t){const{getDwainsRuntimeState:a}=s(),{isDwainsElementName:r}=i(1415);function o(e){const t=a(e);return t.translations||={},t.languageFiles||={},t.languageRequests||={},t}function n(e){if(e&&"function"==typeof e.querySelectorAll)for(const t of e.querySelectorAll("*"))r(t.localName)&&"function"==typeof t.requestUpdate&&t.requestUpdate(),t.shadowRoot&&n(t.shadowRoot)}e.exports={loadedLanguage:function(e,t=window){return o(t).translations[e]},requestLanguage:function(e,{windowObject:t=window,onLoaded:i=()=>n(t.document),reportError:a=(...e)=>console.error(...e)}={}){const s=o(t);if(s.translations[e])return Promise.resolve(s.translations[e]);if(s.languageRequests[e])return s.languageRequests[e];const r=s.languageFiles[e];return r&&"function"==typeof t.fetch?(s.languageRequests[e]=t.fetch(r).then(e=>{if(!e.ok)throw new Error(`HTTP ${e.status}`);return e.json()}).then(t=>(s.translations[e]=t,i(),t)).catch(t=>{a(`Dwains Dashboard: failed to load the "${e}" strings`,t)}),s.languageRequests[e]):Promise.resolve(void 0)}}}),s=()=>i(5875);const r=JSON.parse('{"global":{"enable_edit_mode":"Enable edit mode","disable_edit_mode":"Disable edit mode","version":"Version","disable_clock":"Disable clock","am_pm_clock":"AM/PM clock","disable_welcome_message":"Disable Welcome message","settings":"Global settings","dashboard_information":"Dashboard information","alarm_entity":"Alarm entity","weather_entity":"Weather entity","greeting_morning":"Good morning","greeting_afternoon":"Good afternoon","greeting_evening":"Good evening","v2_mode":"Enable Dwains Dashboard v2 mode (layout)","disable_sensor_graph":"Disable show sensor as graph","invert_cover":"Invert Cover"},"editor":{"lovelace_card":"Lovelace Card","create_lovelace_card":"Create a new lovelace card from scratch","select_card_for":"Select a card for","select_popup_card_for":"Select a popup card for","loading_card_editor":"Loading card editor…","no_visual_editor":"This card has no visual editor. Edit its JSON configuration:","dwains_dashboard_blueprint":"Dwains Dashboard Blueprint","use_dwains_dashboard_blueprint":"Use a Dwain Dashboard Blueprint to create a card","row_span":"Row span","row":"Row","rows":"Rows","col_span":"Col span","column":"Column","columns":"Columns","default_col_row":"Default col and row size","large_col_row":"Large screen col and row size","extra_large_col_row":"Extra large screen col and row size"},"entity":{"title":"Entity","title_plural":"entities","add_card_to":"Add card to ","edit_entity":"Edit entity","edit_entity_card":"Edit entity card","edit_entity_popup_card":"Edit entity popup card","add_to_favorites":"Add to favorites","remove_from_favorites":"Remove from favorites","popup_card":"Popup card","entity_card":"Entity card","settings":"Entity settings","group":"Group by devices","ungroup":"Ungroup by devices","enable":"Enable entity","disable":"Disable entity in DD","disable_all":"Disable all entities","hide_all":"Hide all entities","exclude":"Exclude entity in DD","hide":"Hide entity in DD","hide_in_area":"Hide entity from area views","unhide_in_area":"Show entity in area views","unhide":"Unhide entity","use_popup_card":"Use own popup card","use_entity_card":"Use own entity card","friendly_name":"Rename for DD","hidden":"The following entities are hidden:","disabled":"The following entities are disabled:","unavailable":"The following entities are unavailable:"},"favorite":{"title":"Favorite","title_plural":"Favorites","all_favorites":"All favorites"},"home":{"title":"Home"},"area":{"sensor_entities":"Sensors below the area name","sensor_entities_helper":"Their values are shown below the area name. A chosen sensor replaces the average of its kind in this area (for example one thermometer instead of the average of all).","binary_sensor_entities":"Binary sensors below the area name","binary_sensor_entities_helper":"Their state is shown after the values, for example \\"Window: Open\\".","title":"Area","title_plural":"Areas","edit_area_button":"Edit area button","group_by_floor":"Group by floor","ungroup_by_floor":"Ungroup by floor","icon":"Area icon","hide_icon":"Hide icon","graph_entity":"Graph in the area tile","graph_entity_helper":"Sensor whose history is drawn at the bottom of the tile. Leave empty for no graph.","graph_hours":"Graph period","graph_hours_6":"6 hours","graph_hours_12":"12 hours","graph_hours_24":"24 hours","graph_hours_48":"2 days","graph_hours_168":"7 days","graph_open_history":"Show history","toggle_all_off":"Tap to turn off all {domain} in this area","toggle_all_on":"Tap to turn on all {domain} in this area","floor":"Area floor","no_floor":"No floor","disable":"Disable area in DD","disabled":"The following areas are disabled:","enable":"Enable area"},"area_binary_sensor":{"summary":{"valve":{"zero":"Valves closed","one":"1 valve open","many":"{count} valves open"},"carbon_monoxide":{"zero":"No carbon monoxide","one":"Carbon monoxide detected","many":"Carbon monoxide detected"},"gas":{"zero":"No gas","one":"Gas detected","many":"Gas detected"},"occupancy":{"zero":"Unoccupied","one":"Occupied","many":"Occupied"},"opening":{"zero":"All closed","one":"1 contact open","many":"{count} contacts open"},"presence":{"zero":"No presence","one":"Presence detected","many":"Presence detected"},"problem":{"zero":"No problem","one":"Problem detected","many":"{count} problems"},"running":{"zero":"Not running","one":"1 running","many":"{count} running"},"cold":{"zero":"No cold detected","one":"Cold detected","many":"Cold detected"},"door":{"zero":"Doors closed","one":"1 door open","many":"{count} doors open"},"fallback":{"zero":"{label}: off","one":"{label}: active","many":"{label}: {count} active"},"garage_door":{"zero":"Garage door closed","one":"1 garage door open","many":"{count} garage doors open"},"lock":{"zero":"Locks secured","one":"1 lock unlocked","many":"{count} locks unlocked"},"moisture":{"zero":"Dry","one":"Moisture detected","many":"Moisture detected"},"motion":{"zero":"No motion","one":"Motion detected","many":"Motion detected"},"safety":{"zero":"Safe","one":"Unsafe","many":"Unsafe"},"smoke":{"zero":"No smoke","one":"Smoke detected","many":"Smoke detected"},"sound":{"zero":"No sound","one":"Sound detected","many":"Sound detected"},"vibration":{"zero":"No vibration","one":"Vibration detected","many":"Vibration detected"},"window":{"zero":"Windows closed","one":"1 window open","many":"{count} windows open"}}},"device":{"opening":"Opening","garage_door":"Garage door","valve":"Valve","humidifier":"Humidifier","lawn_mower":"Lawn mower","detected":"detected","title":"Device","title_plural":"devices","edit_device_button":"Edit device button","edit_device_card":"Set custom entities card for domain ","edit_device_popup":"Set custom entities popup for domain ","current_blueprint_card":"You are currently using the following blueprint for all entities cards in the domain ","current_blueprint_popup":"You are currently using the following blueprint for all entities popups in the domain ","icon_required":"If you want to add it to navbar you must select an icon!","icon":"Device icon","show_in_navbar":"Add device page in main navbar","hide":"Hide device overview","unhide":"Unhide device overview","hidden":"The following device overviews are hidden","see_all":"See all","turn_all_off":"Turn all off","on":"on","open":"open","closed":"closed","cover":"Cover","light":"Light","climate":"Climate","sensor":"Sensors","binary_sensor":"Binary sensors","media_player":"Media player","garage":"Garage","shutter":"Shutter","running":"Running","remote":"Remote","scene":"Scene","number":"Number","switch":"Switch","button":"Button","water_heater":"Water heater","camera":"Camera","select":"Select","vacuum":"Vacuum","fan":"Fan","door":"Door","window":"Window","vibration":"Vibration","motion":"Motion","occupancy":"Occupancy","presence":"Presence","device_tracker":"Device tracker","lock":"Lock","siren":"Siren","input_boolean":"Input boolean","weather":"Weather","moisture":"Moisture","input_select":"Input select","carbon_monoxide":"Carbon monoxide","gas":"Gas","problem":"Problem","safety":"Safety","smoke":"Smoke","tamper":"Tamper","update":"Update","person":"Person","alarm_control_panel":"Alarm control panel","automation":"Automation","group":"Group by areas","ungroup":"Ungroup by areas","script":"Script","time":"Time","event":"Event","text":"Text"},"more":{"title":"More","title_plural":"More pages","pages":"pages","create":"Create new more page","edit":"Edit more page","name_required":"You must specify a name for the page","icon_required":"If you want to add it to navbar you must select an icon!","add_navbar":"Add this more page in main navbar","remove_navbar":"Remove this more page from main navbar","name":"More page name","icon":"More page icon"},"blueprint":{"title":"Blueprint","title_plural":"Blueprints","yaml_required":"No YAML code entered!","installed":"Installed","no_blueprints_installed":"No blueprints installed","not_installed":"Not installed","installed_blueprints":"Installed blueprints","type":"Type blueprint","used_custom_cards":"Used custom cards","use":"Use this blueprint","install":"Install blueprint","yaml_code":"Blueprint YAML code","instruction":"Look for the blueprint you want to install in the Dwains Dashboard Community Blueprints Github and paste the blueprint yaml code below. After succesfull installation lovelace and this page will reload. Then you can use the installed blueprint."}}'),{loadedLanguage:o,requestLanguage:n}=a(),d=(e,t)=>t.split(".").reduce((e,t)=>e&&e[t]||null,e),c=e=>{if("en"===e)return r;const t=o(e);return t||n(e),t},l=(e,t,i=void 0,a="unknown")=>{const s=e.selectedLanguage||e.language||e.locale&&e.locale.language||"en",o=s.split("-")[0];return d(c(s),t)||e&&e.resources&&e.resources[s]&&e.resources[s][i]||o!==s&&d(c(o),t)||d(r,t)||a}},4396(e){"use strict";const t=new Set(["cs","de","fi","fr","sk","sv"]);e.exports={formatValueWithUnit:function(e,i,a="en",s=1){let r;try{r=new Intl.NumberFormat(a,{maximumFractionDigits:s}).format(e)}catch(t){r=String(Math.round(e*10**s)/10**s)}return i?"%"===i?t.has(function(e){return String(e||"en").split("-")[0].toLowerCase()}(a))?`${r} %`:`${r}%`:`${r} ${i}`:r}}},5890(e,t,i){"use strict";i.d(t,["Hh",0,["smoke","carbon_monoxide","gas","moisture","problem","safety"],"Hi",0,["door","window","opening","garage_door","lock"],"K5",0,["cover"],"My",0,{"clear-night":"mdi:weather-night",cloudy:"mdi:weather-cloudy",overcast:"mdi:weather-cloudy-arrow-right",fog:"mdi:weather-fog",hail:"mdi:weather-hail",lightning:"mdi:weather-lightning","lightning-rainy":"mdi:weather-lightning-rainy",partlycloudy:"mdi:weather-partly-cloudy",pouring:"mdi:weather-pouring",rainy:"mdi:weather-rainy",snowy:"mdi:weather-snowy","snowy-rainy":"mdi:weather-snowy-rainy",sunny:"mdi:weather-sunny",windy:"mdi:weather-windy","windy-variant":"mdi:weather-windy-variant"},"R9",0,["vacuum","media_player","lock","valve","humidifier","lawn_mower","siren"],"SG",0,["button","calendar","entity","gauge","history-graph","light","media-control","picture-entity","sensor","thermostat","weather-forecast","custom:button-card","custom:mushroom-fan-card","custom:mushroom-cover-card","custom:mushroom-entity-card","custom:mushroom-light-card"],"Su",0,{light:"mdi:lightbulb",climate:"mdi:thermostat",switch:"mdi:power-plug",fan:"mdi:fan",sensor:"mdi:eye",humidity:"mdi:water-percent",temperature:"mdi:thermometer",binary_sensor:"mdi:radiobox-blank",motion:"mdi:motion-sensor",occupancy:"mdi:home-account",presence:"mdi:motion-sensor",door:"mdi:door-open",window:"mdi:window-open-variant",vibration:"mdi:vibrate",moisture:"mdi:water-alert",vacuum:"mdi:robot-vacuum",media_player:"mdi:cast-connected",camera:"mdi:video",cover:"mdi:window-shutter",remote:"mdi:remote",scene:"mdi:palette",number:"mdi:ray-vertex",button:"mdi:gesture-tap-button",water_heater:"mdi:thermometer",select:"mdi:format-list-bulleted",lock:"mdi:lock",device_tracker:"mdi:radar",person:"mdi:account-multiple",weather:"mdi:weather-cloudy",automation:"mdi:robot-outline",alarm_control_panel:"mdi:shield-home",siren:"mdi:alarm-light-outline",valve:"mdi:valve",humidifier:"mdi:air-humidifier",lawn_mower:"mdi:robot-mower",unknown:"mdi:help-circle-outline",text:"mdi:format-text",event:"mdi:calendar-clock",update:"mdi:cloud-upload",script:"mdi:file-document-outline",time:"mdi:clock-outline",input_boolean:"mdi:toggle-switch",group:"mdi:account-group",input_datetime:"mdi:calendar-clock",tts:"mdi:volume-high",zone:"mdi:map-marker-radius"},"TC",0,{armed_away:"mdi:shield-lock",armed_vacation:"mdi:shield-airplane",armed_home:"mdi:shield-home",armed_night:"mdi:shield-moon",armed_custom_bypass:"mdi:security",pending:"mdi:shield-outline",triggered:"mdi:bell-ring",disarmed:"mdi:shield-off"},"Ti",0,["binary_sensor"],"Xt",0,["sensor"],"Zz",0,["light","switch","fan"],"gJ",0,{sensor:["temperature","humidity"],binary_sensor:["smoke","carbon_monoxide","gas","moisture","problem","safety","door","window","opening","garage_door","lock","motion","occupancy","presence","vibration","running"],cover:["garage","shutter"]},"ge",0,["climate"],"jj",0,["closed","locked","off","docked","idle","standby","paused","auto"],"qJ",0,{light:{on:"mdi:lightbulb",off:"mdi:lightbulb-outline"},switch:{on:"mdi:power-plug",off:"mdi:power-plug"},fan:{on:"mdi:fan",off:"mdi:fan-off"},sensor:{humidity:"mdi:water-percent",temperature:"mdi:thermometer"},binary_sensor:{motion:"mdi:motion-sensor",occupancy:"mdi:home-account",presence:"mdi:motion-sensor",door:"mdi:door-open",window:"mdi:window-open-variant",opening:"mdi:square-outline",garage_door:"mdi:garage-open",lock:"mdi:lock-open",vibration:"mdi:vibrate",moisture:"mdi:water-alert",smoke:"mdi:smoke-detector-variant-alert",carbon_monoxide:"mdi:molecule-co",gas:"mdi:gas-cylinder",problem:"mdi:alert-circle",safety:"mdi:alert-circle",running:"mdi:play"},cover:{garage:"mdi:garage",shutter:"mdi:window-shutter"},vacuum:{on:"mdi:robot-vacuum"},media_player:{on:"mdi:cast-connected"},lock:{on:"mdi:lock-open"},valve:{on:"mdi:valve-open"},humidifier:{on:"mdi:air-humidifier"},lawn_mower:{on:"mdi:robot-mower"},siren:{on:"mdi:bullhorn"},climate:{on:"mdi:thermostat"}},"s7",0,["unavailable","unknown"]])},5450(e){"use strict";const t=Object.freeze({configuration:"dwains_dashboard/configuration/get",navigation:"dwains_dashboard/navigation/get",morePages:"dwains_dashboard/more_pages/get",morePage:"dwains_dashboard/more_page/get",blueprints:"dwains_dashboard/get_blueprints",notifications:"dwains_dashboard_notification/get",areas:"config/area_registry/list",devices:"config/device_registry/list",entities:"config/entity_registry/list",floors:"config/floor_registry/list"}),i=Object.freeze(Object.fromEntries(Object.entries(t).map(([e,t])=>[e,Object.freeze({type:t})])));e.exports={READ_MESSAGES:i,READ_TYPES:t}},7069(e,t,i){"use strict";const{READ_TYPES:a}=i(5450),s=new Set(Object.values(a)),r=Object.freeze({[a.entities]:"entities",[a.devices]:"devices",[a.areas]:"areas",[a.floors]:"floors"}),o=new Set([a.configuration,a.navigation,a.morePages]);function n(e,t){const i=r[t?.type],a=i?e?.[i]:void 0;return a&&"object"==typeof a?a:void 0}class d{constructor({ttl:e=3e3,now:t=()=>Date.now(),reportError:i=(e,t)=>console.error(e,t),reportCompatibility:a=e=>console.info(e),freshnessToken:s=n}={}){this._ttl=e,this._freshnessToken=s,this._now=t,this._reportError=i,this._reportCompatibility=a,this._connections=new WeakMap,this._eventInvalidated=new WeakSet,this._unsupportedCapabilities=new WeakMap}readPreferred(e,t,i,{capability:a=t?.type,selectFallback:s=e=>e}={}){const r=e?.connection||e;if("object"!=typeof r&&"function"!=typeof r||null===r)return Promise.reject(new TypeError("A stable Home Assistant connection is required"));let o=this._unsupportedCapabilities.get(r);o||(o=new Set,this._unsupportedCapabilities.set(r,o));const n=()=>this.read(e,i).then(s);return o.has(a)?n():this.read(e,t).catch(e=>{if("unknown_command"!==e?.code)throw e;return o.add(a),this._reportCompatibility(`Home Assistant does not expose ${t.type}; using the compatible configuration read.`),n()})}read(e,t){if(!e||"function"!=typeof e.callWS)return Promise.reject(new TypeError("A Home Assistant callWS client is required"));if(!t||!s.has(t.type))return Promise.reject(new TypeError("Only registered read-only messages may be cached"));const i=e.connection||e;if("object"!=typeof i&&"function"!=typeof i||null===i)return Promise.reject(new TypeError("A stable Home Assistant connection is required"));let a,r=this._connections.get(i);r||(r={cache:new Map,inflight:new Map,generations:new Map,invalidated:!1},this._connections.set(i,r));try{a=JSON.stringify(t)}catch(e){return Promise.reject(e)}const n=r.generations.get(a)||0,d=this._freshnessToken(e,t),c=this._eventInvalidated.has(i)&&o.has(t.type)?6e5:this._ttl,l=r.cache.get(a);if(l&&(void 0!==d&&l.token===d||this._now()-l.storedAt<c))return Promise.resolve(l.value);const h=r.inflight.get(a);if(h&&h.generation===n)return h.promise;let p;return p=Promise.resolve().then(()=>e.callWS({...t})).then(i=>(r.inflight.get(a)?.promise===p&&r.inflight.delete(a),r.invalidated||(r.generations.get(a)||0)!==n?this.read(e,t):(r.cache.set(a,{storedAt:this._now(),token:d,value:i}),i)),i=>{if(r.inflight.get(a)?.promise===p&&r.inflight.delete(a),r.invalidated||(r.generations.get(a)||0)!==n)return this.read(e,t);throw i}),r.inflight.set(a,{generation:n,promise:p}),p}markEventInvalidation(e,t){const i=e?.connection||e;"object"!=typeof i&&"function"!=typeof i||null===i||(t?this._eventInvalidated.add(i):this._eventInvalidated.delete(i))}readOptional(e,t,i){return this.read(e,t).catch(e=>(this._reportError(`Optional WebSocket read failed: ${t?.type||"unknown"}`,e),i))}invalidate(e,t){if(!e)return;const i=e.connection||e;if(("object"==typeof i||"function"==typeof i)&&null!==i){const e=this._connections.get(i);if(!e)return;if(t){let i;try{i=JSON.stringify(t)}catch(e){return void this._reportError("Unable to invalidate WebSocket read",e)}return e.generations.set(i,(e.generations.get(i)||0)+1),e.cache.delete(i),void e.inflight.delete(i)}e.invalidated=!0,this._connections.delete(i)}}}const c=new d;e.exports={websocketReadStore:c}},9165(e,t,i){"use strict";i.d(t,{CZ3:()=>s,NSe:()=>a,Q43:()=>n,TdJ:()=>r,noC:()=>o});var a="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z",s="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z",r="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z",o="M19 13C19.7 13 20.37 13.13 21 13.35V9L15 3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.9 21 5 21H13.35C13.13 20.37 13 19.7 13 19C13 15.69 15.69 13 19 13M14 4.5L19.5 10H14V4.5M23 18V20H20V23H18V20H15V18H18V15H20V18H23Z",n="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"},6752(e,t,i){"use strict";const a=globalThis,s=e=>e,r=a.trustedTypes,o=r?r.createPolicy("lit-html",{createHTML:e=>e}):void 0,n="$lit$",d=`lit$${Math.random().toFixed(9).slice(2)}$`,c="?"+d,l=`<${c}>`,h=document,p=()=>h.createComment(""),u=e=>null===e||"object"!=typeof e&&"function"!=typeof e,m=Array.isArray,g=e=>m(e)||"function"==typeof e?.[Symbol.iterator],_="[ \t\n\f\r]",f=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,y=/-->/g,b=/>/g,v=RegExp(`>|${_}(?:([^\\s"'>=/]+)(${_}*=${_}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),w=/'/g,x=/"/g,$=/^(?:script|style|textarea|title)$/i,k=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),C=k(1),E=k(2),A=(k(3),Symbol.for("lit-noChange")),S=Symbol.for("lit-nothing"),D=new WeakMap,q=h.createTreeWalker(h,129);function O(e,t){if(!m(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==o?o.createHTML(t):t}const H=(e,t)=>{const i=e.length-1,a=[];let s,r=2===t?"<svg>":3===t?"<math>":"",o=f;for(let t=0;t<i;t++){const i=e[t];let c,h,p=-1,u=0;for(;u<i.length&&(o.lastIndex=u,h=o.exec(i),null!==h);)u=o.lastIndex,o===f?"!--"===h[1]?o=y:void 0!==h[1]?o=b:void 0!==h[2]?($.test(h[2])&&(s=RegExp("</"+h[2],"g")),o=v):void 0!==h[3]&&(o=v):o===v?">"===h[0]?(o=s??f,p=-1):void 0===h[1]?p=-2:(p=o.lastIndex-h[2].length,c=h[1],o=void 0===h[3]?v:'"'===h[3]?x:w):o===x||o===w?o=v:o===y||o===b?o=f:(o=v,s=void 0);const m=o===v&&e[t+1].startsWith("/>")?" ":"";r+=o===f?i+l:p>=0?(a.push(c),i.slice(0,p)+n+i.slice(p)+d+m):i+d+(-2===p?t:m)}return[O(e,r+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),a]};class T{constructor({strings:e,_$litType$:t},i){let a;this.parts=[];let s=0,o=0;const l=e.length-1,h=this.parts,[u,m]=H(e,t);if(this.el=T.createElement(u,i),q.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(a=q.nextNode())&&h.length<l;){if(1===a.nodeType){if(a.hasAttributes())for(const e of a.getAttributeNames())if(e.endsWith(n)){const t=m[o++],i=a.getAttribute(e).split(d),r=/([.?@])?(.*)/.exec(t);h.push({type:1,index:s,name:r[2],strings:i,ctor:"."===r[1]?j:"?"===r[1]?V:"@"===r[1]?L:R}),a.removeAttribute(e)}else e.startsWith(d)&&(h.push({type:6,index:s}),a.removeAttribute(e));if($.test(a.tagName)){const e=a.textContent.split(d),t=e.length-1;if(t>0){a.textContent=r?r.emptyScript:"";for(let i=0;i<t;i++)a.append(e[i],p()),q.nextNode(),h.push({type:2,index:++s});a.append(e[t],p())}}}else if(8===a.nodeType)if(a.data===c)h.push({type:2,index:s});else{let e=-1;for(;-1!==(e=a.data.indexOf(d,e+1));)h.push({type:7,index:s}),e+=d.length-1}s++}}static createElement(e,t){const i=h.createElement("template");return i.innerHTML=e,i}}function z(e,t,i=e,a){if(t===A)return t;let s=void 0!==a?i._$Co?.[a]:i._$Cl;const r=u(t)?void 0:t._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),void 0===r?s=void 0:(s=new r(e),s._$AT(e,i,a)),void 0!==a?(i._$Co??=[])[a]=s:i._$Cl=s),void 0!==s&&(t=z(e,s._$AS(e,t.values),s,a)),t}class P{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,a=(e?.creationScope??h).importNode(t,!0);q.currentNode=a;let s=q.nextNode(),r=0,o=0,n=i[0];for(;void 0!==n;){if(r===n.index){let t;2===n.type?t=new M(s,s.nextSibling,this,e):1===n.type?t=new n.ctor(s,n.name,n.strings,this,e):6===n.type&&(t=new I(s,this,e)),this._$AV.push(t),n=i[++o]}r!==n?.index&&(s=q.nextNode(),r++)}return q.currentNode=h,a}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class M{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,a){this.type=2,this._$AH=S,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=z(this,e,t),u(e)?e===S||null==e||""===e?(this._$AH!==S&&this._$AR(),this._$AH=S):e!==this._$AH&&e!==A&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):g(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==S&&u(this._$AH)?this._$AA.nextSibling.data=e:this.T(h.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,a="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=T.createElement(O(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===a)this._$AH.p(t);else{const e=new P(a,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=D.get(e.strings);return void 0===t&&D.set(e.strings,t=new T(e)),t}k(e){m(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,a=0;for(const s of e)a===t.length?t.push(i=new M(this.O(p()),this.O(p()),this,this.options)):i=t[a],i._$AI(s),a++;a<t.length&&(this._$AR(i&&i._$AB.nextSibling,a),t.length=a)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=s(e).nextSibling;s(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class R{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,a,s){this.type=1,this._$AH=S,this._$AN=void 0,this.element=e,this.name=t,this._$AM=a,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=S}_$AI(e,t=this,i,a){const s=this.strings;let r=!1;if(void 0===s)e=z(this,e,t,0),r=!u(e)||e!==this._$AH&&e!==A,r&&(this._$AH=e);else{const a=e;let o,n;for(e=s[0],o=0;o<s.length-1;o++)n=z(this,a[i+o],t,o),n===A&&(n=this._$AH[o]),r||=!u(n)||n!==this._$AH[o],n===S?e=S:e!==S&&(e+=(n??"")+s[o+1]),this._$AH[o]=n}r&&!a&&this.j(e)}j(e){e===S?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class j extends R{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===S?void 0:e}}class V extends R{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==S)}}class L extends R{constructor(e,t,i,a,s){super(e,t,i,a,s),this.type=5}_$AI(e,t=this){if((e=z(this,e,t,0)??S)===A)return;const i=this._$AH,a=e===S&&i!==S||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,s=e!==S&&(i===S||a);a&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class I{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){z(this,e)}}const N={M:n,P:d,A:c,C:1,L:H,R:P,D:g,V:z,I:M,H:R,N:V,U:L,B:j,F:I},F=a.litHtmlPolyfillSupport;F?.(T,M),(a.litHtmlVersions??=[]).push("3.3.3");i.d(t,["JW",0,E,"XX",0,(e,t,i)=>{const a=i?.renderBefore??t;let s=a._$litPart$;if(void 0===s){const e=i?.renderBefore??null;a._$litPart$=s=new M(t.insertBefore(p(),e),e,void 0,i??{})}return s._$AI(e),s},"c0",0,A,"ge",0,N,"qy",0,C,"s6",0,S])},6684(e,t,i){"use strict";i.d(t,{WF:()=>D,AH:()=>c,qy:()=>A.qy,JW:()=>A.JW,iz:()=>d});const a=globalThis,s=a.ShadowRoot&&(void 0===a.ShadyCSS||a.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),o=new WeakMap;class n{constructor(e,t,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(s&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=o.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(t,e))}return e}toString(){return this.cssText}}const d=e=>new n("string"==typeof e?e:e+"",void 0,r),c=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,a)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[a+1],e[0]);return new n(i,e,r)},l=(e,t)=>{if(s)e.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of t){const t=document.createElement("style"),s=a.litNonce;void 0!==s&&t.setAttribute("nonce",s),t.textContent=i.cssText,e.appendChild(t)}},h=s?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return d(t)})(e):e,{is:p,defineProperty:u,getOwnPropertyDescriptor:m,getOwnPropertyNames:g,getOwnPropertySymbols:_,getPrototypeOf:f}=Object,y=globalThis,b=y.trustedTypes,v=b?b.emptyScript:"",w=y.reactiveElementPolyfillSupport,x=(e,t)=>e,$={toAttribute(e,t){switch(t){case Boolean:e=e?v:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},k=(e,t)=>!p(e,t),C={attribute:!0,type:String,converter:$,reflect:!1,useDefault:!1,hasChanged:k};Symbol.metadata??=Symbol("metadata"),y.litPropertyMetadata??=new WeakMap;class E extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=C){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),a=this.getPropertyDescriptor(e,i,t);void 0!==a&&u(this.prototype,e,a)}}static getPropertyDescriptor(e,t,i){const{get:a,set:s}=m(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:a,set(t){const r=a?.call(this);s?.call(this,t),this.requestUpdate(e,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??C}static _$Ei(){if(this.hasOwnProperty(x("elementProperties")))return;const e=f(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(x("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(x("properties"))){const e=this.properties,t=[...g(e),..._(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(h(e))}else void 0!==e&&t.push(h(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return l(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),a=this.constructor._$Eu(e,i);if(void 0!==a&&!0===i.reflect){const s=(void 0!==i.converter?.toAttribute?i.converter:$).toAttribute(t,i.type);this._$Em=e,null==s?this.removeAttribute(a):this.setAttribute(a,s),this._$Em=null}}_$AK(e,t){const i=this.constructor,a=i._$Eh.get(e);if(void 0!==a&&this._$Em!==a){const e=i.getPropertyOptions(a),s="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:$;this._$Em=a;const r=s.fromAttribute(t,e.type);this[a]=r??this._$Ej?.get(a)??r,this._$Em=null}}requestUpdate(e,t,i,a=!1,s){if(void 0!==e){const r=this.constructor;if(!1===a&&(s=this[e]),i??=r.getPropertyOptions(e),!((i.hasChanged??k)(s,t)||i.useDefault&&i.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:a,wrapped:s},r){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,r??t??this[e]),!0!==s||void 0!==r)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===a&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,a=this[t];!0!==e||this._$AL.has(t)||void 0===a||this.C(t,void 0,i,a)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}}E.elementStyles=[],E.shadowRootOptions={mode:"open"},E[x("elementProperties")]=new Map,E[x("finalized")]=new Map,w?.({ReactiveElement:E}),(y.reactiveElementVersions??=[]).push("2.1.2");var A=i(6752);const S=globalThis;class D extends E{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=(0,A.XX)(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return A.c0}}D._$litElement$=!0,D.finalized=!0,S.litElementHydrateSupport?.({LitElement:D});const q=S.litElementPolyfillSupport;q?.({LitElement:D});(S.litElementVersions??=[]).push("4.2.2")}};const t={};function i(a){const s=t[a];if(void 0!==s)return s.exports;const r=t[a]={exports:{}};return e[a](r,r.exports,i),r.exports}i.m=e,i.cw=e=>{var t;return()=>{if(e){var i=e;e=0,t={exports:{}},i.call(t.exports,t,t.exports)}return t.exports}},i.d=(e,t)=>{if(Array.isArray(t))for(var a=0;a<t.length;){var s=t[a++],r=t[a++],o=0===r?{enumerable:!0,value:t[a++]}:{enumerable:!0,get:r};i.o(e,s)||Object.defineProperty(e,s,o)}else for(var s in t)i.o(t,s)&&!i.o(e,s)&&Object.defineProperty(e,s,{enumerable:!0,get:t[s]})},i.f={},i.e=e=>{const t=[];return i.f.j(e,t),Promise.all(t)},i.u=e=>"chunks/"+{587:"sortable",723:"editors"}[e]+"."+{587:"ab558d19",723:"94fa11e0"}[e]+".js",i.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{const e={},t="dwains-dashboard:";i.l=(a,s,r,o)=>{if(e[a])return void e[a].push(s);let n,d;if(void 0!==r){const e=document.getElementsByTagName("script");for(var c=0;c<e.length;c++){const i=e[c];if(i.getAttribute("src")==a||i.getAttribute("data-webpack")==t+r){n=i;break}}}n||(d=!0,n=document.createElement("script"),n.charset="utf-8",i.nc&&n.setAttribute("nonce",i.nc),n.setAttribute("data-webpack",t+r),n.src=a),e[a]=[s];const l=(t,i)=>{n.onerror=n.onload=null,clearTimeout(h);const s=e[a];if(delete e[a],n.parentNode?.removeChild(n),s?.forEach(e=>e(i)),t)return t(i)},h=setTimeout(l.bind(null,void 0,{type:"timeout",target:n}),12e4);n.onerror=l.bind(null,n.onerror),n.onload=l.bind(null,n.onload),d&&document.head.appendChild(n)}})(),i.p="/dwains_dashboard/js/",(()=>{const e={792:0};i.f.j=(t,a)=>{let s=i.o(e,t)?e[t]:void 0;if(0!==s)if(s)a.push(s[2]);else{const r=new Promise((i,a)=>s=e[t]=[i,a]);a.push(s[2]=r);const o=new Error,n=a=>{if(i.o(e,t)&&(s=e[t],0!==s&&(e[t]=void 0),s)){const e=a&&("load"===a.type?"missing":a.type),i=a&&a.target&&a.target.src;o.message="Loading chunk "+t+" failed.\n("+e+": "+i+")",o.name="ChunkLoadError",o.type=e,o.request=i,o.event=a,s[1](o)}};i.l(i.p+i.u(t),n,"chunk-"+t,t)}};const t=(t,a)=>{let[s,r,o]=a;var n,d,c=0;if(s.some(t=>0!==e[t])){for(n in r)i.o(r,n)&&(i.m[n]=r[n]);if(o)o(i)}for(t&&t(a);c<s.length;c++)d=s[c],i.o(e,d)&&e[d]&&e[d][0](),e[d]=0},a=self.webpackChunkdwains_dashboard=self.webpackChunkdwains_dashboard||[];a.forEach(t.bind(null,0)),a.push=t.bind(null,a.push.bind(a))})(),i(4912),i(9992),i(2970),i(3977),i(851),i(5012),i(6315),i(3036),i(3853),i(3080),i(9823),i(4576),i(7897),i(5041);i(678)})();