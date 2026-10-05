"use strict";(self.webpackChunkdwains_dashboard=self.webpackChunkdwains_dashboard||[]).push([[723],{1836(e,t,i){var s=i.cw(function(e,t){function i(e){return"string"==typeof e?.blueprint&&e.blueprint.length>0}function s(e,t){if(!i(e))return;const s=e.blueprint,a=t?.blueprints?.[s],r=a?.blueprint||{};return{id:s,installed:Boolean(a),name:r.name||s,description:r.description||"",version:r.version??""}}e.exports={prepareEntityEditorCardConfig:function(e,t){if(!e||"object"!=typeof e)return"";const s=structuredClone(e);return i(s)?s.input_entity=t:(delete s.input_entity,delete s.input_name),s},renderBlueprintSelection:function(e,t,i,a,r){const n=s(a,r);if(!n)return"";const o="color:var(--secondary-text-color);font-size:.85rem";return e`
    <section style="box-sizing:border-box;margin-bottom:16px;padding:14px 16px;border:1px solid var(--divider-color);border-radius:var(--ha-card-border-radius,12px);background:var(--card-background-color)">
      <div style=${o}>${t(i,"blueprint.title")}</div>
      <strong style="display:block;margin:3px 0;color:var(--primary-text-color);font-size:1rem">${n.name}</strong>
      ${""!==n.version?e`
        <div style=${o}>${t(i,"global.version")}: ${n.version}</div>
      `:""}
      ${n.description?e`
        <div style="margin-top:6px;color:var(--primary-text-color)">${n.description}</div>
      `:""}
      ${n.installed?"":e`
        <div style=${o}>${t(i,"blueprint.not_installed")} (${n.id})</div>
      `}
    </section>
  `}}}),a=i.cw(function(e,t){e.exports={ConnectedLoadOwner:class{constructor(e,{reportError:t,errorMessage:i="Connected load failed"}={}){if("function"!=typeof e)throw new TypeError("ConnectedLoadOwner requires a load function");this._load=e,this._reportError=t,this._errorMessage=i,this._connected=!1,this._ready=!1,this._loaded=!1,this._pending=void 0,this._generation=0,this._abortController=void 0}connect(){return this._connected=!0,this._start()}ready(){return this._ready=!0,this._start()}reload(){return this._abortController?.abort("reload"),this._abortController=void 0,this._loaded=!1,this._pending=void 0,this._generation+=1,this._start()}disconnect(){this._abortController?.abort("disconnect"),this._abortController=void 0,this._connected=!1,this._loaded=!1,this._pending=void 0,this._generation+=1}_start(){if(!this._connected||!this._ready||this._loaded)return;if(this._pending)return this._pending;const e=++this._generation,t=new AbortController;this._abortController=t;const i=()=>this._connected&&e===this._generation,s=Promise.resolve().then(()=>this._load({isCurrent:i,signal:t.signal})).then(e=>(i()&&(this._loaded=!0),e),e=>{throw e}).finally(()=>{this._pending===s&&(this._pending=void 0),this._abortController===t&&(this._abortController=void 0)});return this._pending=s,"function"==typeof this._reportError&&s.catch(e=>this._reportError(this._errorMessage,e)),s}}}}),r=()=>i(1415),n=()=>i(9823),o=()=>i(9187),d=i.cw(function(e,t){const{fireEvent:s}=i(2330),{findLovelaceRoot:a}=l();function r(e,t){return e?.config?.views?.some(e=>e?.path===t)||!1}function n(e,t=setTimeout){return new Promise(i=>t(i,e))}e.exports={refreshLovelaceConfig:async function({documentObject:e=("undefined"!=typeof document?document:void 0),viewPath:t,timeout:i=1e4,interval:o=100,now:d=()=>Date.now(),setTimer:l,resolveRoot:c=a,dispatchRefresh:h=e=>s("config-refresh",{},e)}={}){const p=c(e);if(!p)throw new Error("The Lovelace root is not available");const u=p.lovelace?.config;h(p);const m=d()+i;do{const e=p.lovelace;if(e?.config!==u&&(!t||r(e,t)))return e;await n(o,l)}while(d()<m);throw new Error(t?`Lovelace did not load the new view "${t}" in time`:"Lovelace did not refresh its configuration in time")}}}),l=()=>i(7921),c=i.cw(function(e,t){e.exports={readSelectEvent:function(e){const t=e?.currentTarget||e?.target,i=t?.name||t?.dataset?.field||t?.type;let s=e?.detail?.value;if(void 0===s&&void 0!==e?.detail?.index){const i=e.detail.index;s=t?.children?.[i]?.value??t?.items?.[i]?.value}return void 0===s&&e?.target!==t&&(s=e?.target?.value),s??=t?.value??t?.selectedValue,{field:i,value:s}}}}),h=()=>i(7069),p=i(6684),u=i(1621);const{loadCardHelpers:m}=i(393),{defineDwainsElement:g}=r(),b=Object.freeze({views:Object.freeze([])}),y=new Set(["button","entity","gauge","light","media-control","picture-entity","sensor","thermostat","weather-forecast","custom:button-card","custom:mushroom-cover-card","custom:mushroom-entity-card","custom:mushroom-fan-card","custom:mushroom-light-card"]),f=new Set(["calendar","history-graph"]);function _(e){return!e||Array.isArray(e.views)&&0===e.views.length?b:e}const w=Object.freeze([["alarm-panel","Alarm panel"],["area","Area"],["button","Button"],["calendar","Calendar"],["conditional","Conditional"],["entities","Entities"],["entity","Entity"],["entity-filter","Entity filter"],["gauge","Gauge"],["glance","Glance"],["grid","Grid"],["heading","Heading"],["history-graph","History graph"],["horizontal-stack","Horizontal stack"],["humidifier","Humidifier"],["iframe","Web page"],["light","Light"],["logbook","Logbook"],["map","Map"],["markdown","Markdown"],["media-control","Media control"],["picture","Picture"],["picture-elements","Picture elements"],["picture-entity","Picture entity"],["plant-status","Plant status"],["sensor","Sensor"],["shopping-list","Shopping list"],["statistic","Statistic"],["statistics-graph","Statistics graph"],["thermostat","Thermostat"],["tile","Tile"],["todo-list","To-do list"],["vertical-stack","Vertical stack"],["weather-forecast","Weather forecast"]]);function v(e,t){e.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}function x(e){return e&&"object"==typeof e?structuredClone(e):e}function $(e){return JSON.stringify(e)}function C(e=window){const t=Array.isArray(e.customCards)?e.customCards:[],i=new Set;return t.map(e=>{const t="string"==typeof e?.type?e.type.trim():"";if(!t)return;const s=t.startsWith("custom:")?t:`custom:${t}`;return i.has(s)?void 0:(i.add(s),[s,e.name||t])}).filter(Boolean).sort((e,t)=>e[1].localeCompare(t[1]))}function k(e,t,i=customElements){const s=i?.get?.(function(e){return e.startsWith("custom:")?e.slice(7):`hui-${e}-card`}(e));return s||t?.constructor}function S(e,t,i){if(!e||"object"!=typeof e||!i)return e;const s=x(e);return y.has(t)||t.startsWith("custom:")&&Object.hasOwn(s,"entity")?s.entity=i:f.has(t)&&(s.entities=[i]),s}function A(e,t){const i=Object.keys(e?.states||{})[0],s=(t,i)=>function(e,t,i=()=>!0){const s=new Set(Array.isArray(t)?t:[t]);return Object.entries(e?.states||{}).find(([e,t])=>s.has(e.split(".",1)[0])&&i(t))?.[0]}(e,t,i),a=e=>e&&Number.isFinite(Number.parseFloat(e.state)),r={type:"button",name:"Button"},n={"alarm-panel":()=>{const e=s("alarm_control_panel");return e&&{type:t,entity:e}},button:()=>r,calendar:()=>{const e=s("calendar");return e&&{type:t,entities:[e]}},entities:()=>i&&{type:t,entities:[i]},entity:()=>i&&{type:t,entity:i},"entity-filter":()=>i&&{type:t,entities:[i],state_filter:["on"]},gauge:()=>{const e=s(["sensor","number","input_number"],a);return e&&{type:t,entity:e}},glance:()=>i&&{type:t,entities:[i]},grid:()=>({type:t,cards:[r]}),heading:()=>({type:t,heading:"Heading"}),"history-graph":()=>i&&{type:t,entities:[i]},"horizontal-stack":()=>({type:t,cards:[r]}),humidifier:()=>{const e=s("humidifier");return e&&{type:t,entity:e}},light:()=>{const e=s("light");return e&&{type:t,entity:e}},logbook:()=>i&&{type:t,entities:[i]},map:()=>{const e=s(["device_tracker","person"]);return e&&{type:t,entities:[e]}},markdown:()=>({type:t,content:"**Markdown**"}),"media-control":()=>{const e=s("media_player");return e&&{type:t,entity:e}},"picture-entity":()=>i&&{type:t,entity:i},"plant-status":()=>{const e=s("plant");return e&&{type:t,entity:e}},sensor:()=>{const e=s("sensor");return e&&{type:t,entity:e}},statistic:()=>{const e=s("sensor",a);return e&&{type:t,entity:e}},"statistics-graph":()=>{const e=s("sensor",a);return e&&{type:t,entities:[e]}},thermostat:()=>{const e=s("climate");return e&&{type:t,entity:e}},tile:()=>i&&{type:t,entity:i},"todo-list":()=>{const e=s("todo");return e&&{type:t,entity:e}},"vertical-stack":()=>({type:t,cards:[r]}),"weather-forecast":()=>{const e=s("weather");return e&&{type:t,entity:e}}};return n[t]?.()}async function E(e,t,i){const s={type:t},a=await m();let r;try{r=await a.createCardElement(x(s))}catch(e){console.warn(`Unable to instantiate ${t} while loading its defaults`,e)}const n=k(t,r),o=n?.getStubConfig;if("function"!=typeof o)return S(s,t,i);try{const a=Object.keys(e?.states||{}),r=i&&a.includes(i)?[i,...a.filter(e=>e!==i)]:a,d=await o.call(n,e,r,[]);return S(d&&"object"==typeof d?{type:t,...d}:s,t,i)}catch(e){return console.warn(`Unable to create a default configuration for ${t}`,e),S(s,t,i)}}class q extends p.WF{static properties={hass:{attribute:!1},lovelace:{attribute:!1},entityId:{attribute:!1},_filter:{state:!0},_manualType:{state:!0},_selecting:{state:!0},_error:{state:!0}};constructor(){super(),this._filter="",this._manualType="",this._selecting=!1,this._previewGeneration=0,this._previewConfigs=new Map,this._selectionConfigs=new Map,this._previewObserver=void 0,this._pointerStart=void 0,this._pointerMoved=!1}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this._previewGeneration+=1,this._previewObserver?.disconnect(),this._previewObserver=void 0}shouldUpdate(e){if(1!==e.size||!e.has("hass"))return!0;const t=e.get("hass");if(!t)return!0;const i=e=>e?.selectedLanguage||e?.language||e?.locale?.language;return i(t)!==i(this.hass)||(this.renderRoot?.querySelectorAll?.("[data-card-preview] > *").forEach(e=>{"hass"in e&&(e.hass=this.hass)}),!1)}firstUpdated(){this._observePreviews()}updated(e){(e.has("_filter")||e.has("hass"))&&this._observePreviews()}_localizedCardName(e,t){return e.startsWith("custom:")?t:this.hass?.localize?.(`ui.panel.lovelace.editor.card.${e}.name`)||t}_localizedCardDescription(e){if(e.startsWith("custom:")){const t=e.slice(7),i=(window.customCards||[]).find(i=>i?.type===t||i?.type===e);return i?.description||e}return this.hass?.localize?.(`ui.panel.lovelace.editor.card.${e}.description`)||e}_observePreviews(){this._previewObserver?.disconnect();const e=this.renderRoot?.querySelectorAll?.("[data-card-preview]");if(!e?.length)return;const t=e=>{const t=e.dataset.cardPreview;t&&this._loadPreview(t,e)};"function"==typeof IntersectionObserver?(this._previewObserver=new IntersectionObserver((e,i)=>{for(const s of e)s.isIntersecting&&(i.unobserve(s.target),t(s.target))},{rootMargin:"160px"}),e.forEach(e=>this._previewObserver.observe(e))):e.forEach(t)}_showPreviewDescription(e,t){const i=document.createElement("span");i.className="preview-description",i.textContent=this._localizedCardDescription(e),t.replaceChildren(i)}async _loadPreview(e,t){if("true"===t.dataset.previewLoading)return;t.dataset.previewLoading="true";const i=this._previewGeneration;try{const s=e.startsWith("custom:")?(window.customCards||[]).find(t=>t?.type===e||t?.type===e.slice(7)):void 0,a=this._previewConfigs.get(e)||(s?.preview?await E(this.hass,e):A(this.hass,e));if(!a)return void(this.isConnected&&t.isConnected&&this._showPreviewDescription(e,t));this._previewConfigs.set(e,a);const r=await m(),n=await r.createCardElement(x(a));if("HUI-ERROR-CARD"===n?.tagName)throw new Error(`Home Assistant rejected the preview for ${e}`);if(!this.isConnected||i!==this._previewGeneration||!t.isConnected)return;n.hass=this.hass,n.tabIndex=-1,t.replaceChildren(n)}catch(s){if(!this.isConnected||i!==this._previewGeneration||!t.isConnected)return;this._showPreviewDescription(e,t),console.warn(`Unable to preview Lovelace card ${e}`,s)}}_cards(){return[...w,...C()]}async _selectType(e){if(!this._selecting&&e){this._selecting=!0,this._error=void 0;try{const t=`${this.entityId||""}\0${e}`,i=this._selectionConfigs.get(t)||await E(this.hass,e,this.entityId);this._selectionConfigs.set(t,i),v(this,i)}catch(t){this._error=t instanceof Error?t.message:String(t),console.error(`Unable to select Lovelace card ${e}`,t)}finally{this._selecting=!1}}}_cardClicked(e){if(!this._selecting)return this._pointerMoved?(e.preventDefault(),e.stopPropagation(),void(this._pointerMoved=!1)):void this._selectType(e.currentTarget.dataset.type)}_cardKeyDown(e){"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._cardClicked(e))}_cardPointerDown(e){this._pointerStart={x:e.clientX,y:e.clientY},this._pointerMoved=!1}_cardPointerMove(e){if(!this._pointerStart||this._pointerMoved)return;const t=Math.abs(e.clientX-this._pointerStart.x),i=Math.abs(e.clientY-this._pointerStart.y);(t>8||i>8)&&(this._pointerMoved=!0)}_cardPointerCancel(){this._pointerStart=void 0,this._pointerMoved=!1}_stopPreviewEvent(e){e.stopPropagation()}_manualSubmit(){let e=this._manualType.trim();e&&!e.includes(":")&&(e=`custom:${e}`),this._selectType(e)}render(){const e=this._filter.trim().toLowerCase(),t=this._cards().map(([e,t])=>({type:e,name:this._localizedCardName(e,t)})).filter(({type:t,name:i})=>!e||t.toLowerCase().includes(e)||i.toLowerCase().includes(e));return p.qy`
      <div class="controls">
        <input
          type="search"
          placeholder="${this.hass?.localize?.("ui.common.search")||"Search"}"
          .value=${this._filter}
          @input=${e=>{this._filter=e.target.value}}
        />
      </div>
      <div class="cards">
        ${t.map(({type:e,name:t})=>p.qy`
          <div
            class="card-option"
            data-type=${e}
            role="button"
            tabindex="0"
            aria-disabled=${this._selecting?"true":"false"}
            @pointerdown=${this._cardPointerDown}
            @pointermove=${this._cardPointerMove}
            @pointercancel=${this._cardPointerCancel}
            @click=${this._cardClicked}
            @keydown=${this._cardKeyDown}
          >
            <strong>${t}</strong>
            <div
              class="preview"
              data-card-preview=${e}
              @config-changed=${this._stopPreviewEvent}
            >
              <ha-spinner></ha-spinner>
            </div>
            <small>${e}</small>
          </div>
        `)}
      </div>
      <div class="manual">
        <input
          placeholder="custom:my-card"
          .value=${this._manualType}
          @input=${e=>{this._manualType=e.target.value}}
          @keydown=${e=>{"Enter"===e.key&&this._manualSubmit()}}
        />
        <ha-button @click=${this._manualSubmit} ?disabled=${this._selecting||!this._manualType.trim()}>
          ${this.hass?.localize?.("ui.common.add")||"Add"}
        </ha-button>
      </div>
      ${this._selecting?p.qy`<p class="status">${(0,u.A)(this.hass,"editor.loading_card_editor")}</p>`:""}
      ${this._error?p.qy`<p class="error">${this._error}</p>`:""}
    `}static styles=p.AH`
    :host { display: block; color: var(--primary-text-color); }
    input {
      box-sizing: border-box; width: 100%; min-height: 44px; padding: 10px 12px;
      border: 1px solid var(--divider-color); border-radius: 8px;
      color: var(--primary-text-color); background: var(--card-background-color);
      font: inherit;
    }
    .cards {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 12px; margin-top: 12px;
    }
    .card-option {
      box-sizing: border-box; min-width: 0; height: 200px; padding: 12px;
      border: 1px solid var(--divider-color); border-radius: var(--ha-card-border-radius, 12px);
      color: var(--primary-text-color); background: var(--card-background-color);
      text-align: center; cursor: pointer; overflow: hidden;
      display: grid; grid-template-rows: minmax(20px, auto) 1fr auto;
      touch-action: pan-y;
    }
    .card-option:hover, .card-option:focus-visible {
      border-color: var(--primary-color); outline: none;
    }
    .card-option[aria-disabled="true"] { opacity: 0.6; pointer-events: none; }
    .card-option strong, .card-option small { display: block; overflow-wrap: anywhere; }
    .card-option strong { font-size: 16px; }
    .card-option small { margin-top: 4px; color: var(--secondary-text-color); }
    .preview {
      box-sizing: border-box; display: flex; height: 130px; min-height: 0;
      margin: 8px 0; overflow: hidden; contain: layout paint;
      align-items: center; justify-content: center; pointer-events: none;
    }
    .preview > * { width: 100%; max-height: 130px; overflow: hidden; }
    .preview ha-spinner { width: auto; }
    .preview-description {
      color: var(--secondary-text-color); line-height: 1.4;
    }
    .manual { display: grid; grid-template-columns: 1fr auto; gap: 8px; margin-top: 16px; }
    .status { color: var(--secondary-text-color); }
    .error { color: var(--error-color); overflow-wrap: anywhere; }
  `}class B extends p.WF{static properties={hass:{attribute:!1},lovelace:{attribute:!1},value:{attribute:!1},_fallbackText:{state:!0},_error:{state:!0},_loading:{state:!0}};constructor(){super(),this._generation=0,this._loading=!1,this._editor=void 0,this._loadedType=void 0,this._lastEmittedSignature=void 0,this._currentValue=void 0,this._currentSignature=void 0}disconnectedCallback(){super.disconnectedCallback(),this._generation+=1,this._editor=void 0,this._loadedType=void 0}updated(e){if(e.has("hass")&&this._editor&&(this._editor.hass=this.hass),e.has("lovelace")&&this._editor){const e=_(this.lovelace);this._editor.lovelace!==e&&(this._editor.lovelace=e)}if(!e.has("value"))return;const t=x(this.value),i=$(t);i!==this._lastEmittedSignature&&i!==this._currentSignature?(this._currentValue=t,this._currentSignature=i,this._editor&&this._loadedType===this.value?.type?this._editor.setConfig(x(t)):this._loadEditor()):this._lastEmittedSignature=void 0}async _loadEditor(){if(!this.isConnected||!this.hass||!this.value?.type)return;const e=++this._generation;this._loading=!0,this._error=void 0,this._fallbackText=void 0;try{const t=await m();let i,s;try{i=await t.createCardElement(x(this.value))}catch(e){s=e}const a=k(this.value.type,i);if(!a&&s)throw s;const r=a?.getConfigElement,n="function"==typeof r?await r.call(a):void 0;if(!this.isConnected||e!==this._generation)return;if(!n||"function"!=typeof n.setConfig)return void(this._fallbackText=JSON.stringify(this.value,null,2));if(await this.updateComplete,!this.isConnected||e!==this._generation)return;n.hass=this.hass,n.lovelace=_(this.lovelace),n.setConfig(x(this.value)),n.addEventListener("config-changed",e=>{if(e.stopPropagation(),e.detail?.config){const t=x(e.detail.config),i=$(t);this._currentValue=t,this._currentSignature=i,this._lastEmittedSignature=i,v(this,x(t))}}),this.renderRoot.querySelector("#editor")?.replaceChildren(n),this._editor=n,this._loadedType=this.value.type}catch(t){if(!this.isConnected||e!==this._generation)return;this._error=t instanceof Error?t.message:String(t),this._fallbackText=JSON.stringify(this.value,null,2),console.error(`Unable to load the editor for ${this.value.type}`,t)}finally{e===this._generation&&(this._loading=!1)}}_fallbackChanged(e){this._fallbackText=e.target.value;try{const e=JSON.parse(this._fallbackText);this._error=void 0,this._currentValue=x(e),this._currentSignature=$(e),this._lastEmittedSignature=this._currentSignature,v(this,x(e))}catch(e){this._error=e instanceof Error?e.message:String(e)}}getConfig(){const e=this._currentValue??this.value;return e&&"object"==typeof e?structuredClone(e):e}async commitConfig(){return function(e){let t=e?.activeElement;for(;t?.shadowRoot?.activeElement;)t=t.shadowRoot.activeElement;return t}(this.renderRoot)?.blur?.(),await Promise.resolve(),this._editor?.updateComplete&&await this._editor.updateComplete,await Promise.resolve(),await this.updateComplete,this.getConfig()}render(){return p.qy`
      <div id="editor"></div>
      ${this._loading?p.qy`<p class="status">${(0,u.A)(this.hass,"editor.loading_card_editor")}</p>`:""}
      ${void 0!==this._fallbackText?p.qy`
        <p>${(0,u.A)(this.hass,"editor.no_visual_editor")}</p>
        <textarea .value=${this._fallbackText} @input=${this._fallbackChanged}></textarea>
      `:""}
      ${this._error?p.qy`<p class="error">${this._error}</p>`:""}
    `}static styles=p.AH`
    :host, #editor { display: block; width: 100%; }
    textarea {
      box-sizing: border-box; width: 100%; min-height: 220px; padding: 12px;
      border: 1px solid var(--divider-color); border-radius: 8px;
      color: var(--primary-text-color); background: var(--card-background-color);
      font: 13px/1.45 monospace; resize: vertical;
    }
    .status { color: var(--secondary-text-color); }
    .error { color: var(--error-color); overflow-wrap: anywhere; }
  `}class z extends p.WF{static properties={hass:{attribute:!1},config:{attribute:!1},_error:{state:!0}};constructor(){super(),this._generation=0,this._card=void 0,this._loadedType=void 0}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this._generation+=1,this._card=void 0,this._loadedType=void 0}updated(e){e.has("hass")&&this._card&&(this._card.hass=this.hass),(e.has("config")||e.has("hass")&&!this._card)&&this._loadPreview()}async _loadPreview(){if(!this.isConnected||!this.hass||!this.config?.type)return;const e=++this._generation;if(this._error=void 0,this._card&&this._loadedType===this.config.type&&"function"==typeof this._card.setConfig)try{if(await this._card.setConfig(x(this.config)),!this.isConnected||e!==this._generation)return;return void(this._card.hass=this.hass)}catch(e){console.warn(`Unable to update preview ${this.config.type} in place`,e)}try{const t=await m(),i=await t.createCardElement(x(this.config));if(!this.isConnected||e!==this._generation)return;if(await this.updateComplete,!this.isConnected||e!==this._generation)return;i.hass=this.hass,this.renderRoot.querySelector("#preview")?.replaceChildren(i),this._card=i,this._loadedType=this.config.type}catch(t){if(!this.isConnected||e!==this._generation)return;this._error=t instanceof Error?t.message:String(t),console.error(`Unable to preview ${this.config.type}`,t)}}render(){return p.qy`<div id="preview"></div>${this._error?p.qy`<p>${this._error}</p>`:""}`}static styles=p.AH`
    :host { display: block; width: 100%; margin-top: 16px; }
    p { color: var(--error-color); overflow-wrap: anywhere; }
  `}g("dwains-card-picker",q),g("dwains-card-config-editor",B),g("dwains-card-preview",z);var I=i(4169);const{readSelectEvent:L}=c(),{websocketReadStore:O}=h(),{ConnectedLoadOwner:R}=a(),{hassConnectionIdentity:M,hasHassConnectionChanged:P}=o(),{defineDwainsElement:N}=r();class D extends p.WF{constructor(){super(),this._connectedLoadOwner=new R(e=>this._loadEditor(e),{reportError:(e,t)=>console.error(e,t),errorMessage:"Failed to load custom-card editor data"}),this._configReady=!1}set hass(e){const t=P(this._hass,e);this._hass=e,t&&(this._connectedLoadOwner.disconnect(),this.isConnected&&this._connectedLoadOwner.connect()),this._startEditorIfReady()}get hass(){return this._hass}static get styles(){return[p.AH`
        .edit-element {
          padding: 20px;
        }
        .add-button {
          font-size: 16px;
          border: 2px solid #4591B8;
          padding: 5px;
          margin-bottom: 50px;
          background: #459CEE;
          border-radius: 20px;
          color: white;
        }
        .card-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: .75rem;
          padding: 8px;
          border-top: 1px solid var(--divider-color);
        }
        .grid {
          display: grid;
          gap: 2rem;
        }
        @media (min-width: 768px){
          .grid-cols-2 {
            grid-template-columns: repeat(2,minmax(0,1fr));
          }
        }
        .pre-select {
          padding: 2.5rem;
        }
        .pre-select-option {
          padding: 2.5rem;
          border: 1px solid #4591B8;
          text-align: center;
          cursor: pointer;
        }
        .pre-selected-option:hover {
          border: 2px solid #4591B8;
        }
        .seperator {
          background-color: var(--secondary-background-color);
          width: 100%;
          height: 3px;
          margin-top: 15px;
          margin-bottom: 15px;
        }
        /*Start blueprint table*/
        /* Blueprint table responsive fix */
        table.min-w-full {
          width: 100%;
          table-layout: fixed;
        }
        table.min-w-full th,
        table.min-w-full td {
          overflow-wrap: anywhere;
          word-break: break-word;
          vertical-align: top;
        }
        table.min-w-full .px-6 {
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }
        table.min-w-full .whitespace-nowrap {
          white-space: normal;
        }
        table.min-w-full th:last-child,
        table.min-w-full td:last-child {
          width: 6.5rem;
          min-width: 6.5rem;
        }
        table.min-w-full td:last-child ha-button {
          display: block;
          margin: 0.125rem 0;
        }
        @media (max-width: 640px) {
          table.min-w-full .px-6 {
            padding-left: 0.25rem;
            padding-right: 0.25rem;
          }
          table.min-w-full .py-4 {
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
          }
          table.min-w-full th,
          table.min-w-full td {
            font-size: 0.75rem;
            line-height: 1rem;
          }
          table.min-w-full th:last-child,
          table.min-w-full td:last-child {
            width: 5.75rem;
            min-width: 5.75rem;
          }
        }
        .min-w-full {
          min-width: 100%;
        }
        table {
            text-indent: 0;
            border-color: inherit;
            border-collapse: collapse;
        }
        .bg-gray-50 {
          background-color: var(--secondary-background-color);
        }
        .tracking-wider {
            letter-spacing: .05em;
        }
        .text-sm {
          font-size: .875rem;
          line-height: 1.25rem;
        }
        .py-4 {
            padding-top: 1rem;
            padding-bottom: 1rem;
        }
        .uppercase {
            text-transform: uppercase;
        }
        .font-medium {
            font-weight: 500;
        }
        .text-xs {
            font-size: .75rem;
            line-height: 1rem;
        }
        .text-left {
            text-align: left;
        }
        .px-6 {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
        }
        .py-3 {
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
        }
        .card-dd-settings {
          padding: 0.75rem;
          border: 2px solid grey;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 1rem;
        }
        ha-select, ha-input, .dd-check {
          width: 100%;
        }
        h2,h3 {
          margin: 0;
          font-size: 1rem;
        }
        `]}static get properties(){return{mode:{},blueprints:{}}}setConfig(e){if(this._editorSessionInitialized)return this._configReady=!0,void this._startEditorIfReady();if(this._editorSessionInitialized=!0,this.mode=e.mode?e.mode:"pre-select",this.area_id=e.area?e.area:"",this.domain=e.domain?e.domain:"",this.position=e.position,this.page=e.page,e.cardConfig){const t=structuredClone(e.cardConfig);delete t.input_entity,delete t.input_name,this.cardConfig=t}else this.cardConfig="";this.filename=e.filename?e.filename.replace(".yaml",""):"",this.name=e.name?e.name:"Dwains Dashboard",this.rowSpan=e.rowSpan?e.rowSpan:"1",this.colSpan=e.colSpan?e.colSpan:"1",this.rowSpanLg=e.rowSpanLg?e.rowSpanLg:"1",this.colSpanLg=e.colSpanLg?e.colSpanLg:"1",this.rowSpanXl=e.rowSpanXl?e.rowSpanXl:"1",this.colSpanXl=e.colSpanXl?e.colSpanXl:"1",this._configReady=!0,this._startEditorIfReady()}connectedCallback(){super.connectedCallback(),this._connectedLoadOwner.connect(),this._startEditorIfReady()}disconnectedCallback(){super.disconnectedCallback(),this._connectedLoadOwner.disconnect()}_startEditorIfReady(){this._configReady&&this._hass&&this._connectedLoadOwner.ready()}async _loadEditor({isCurrent:e}){const t=this._hass,i=M(t),s=await O.read(t,{type:"dwains_dashboard/get_blueprints"});e()&&M(this._hass)===i&&(this.blueprints=s)}_loadBlueprints(){return this._connectedLoadOwner.reload()}magicStuff(e){this.cardConfig=structuredClone(e.detail.config),this.mode="editor-element"}magicStuffSecond(e){}async _sendCard(){const e=this.renderRoot?.querySelector("dwains-card-config-editor"),t=await(e?.commitConfig?.()??e?.getConfig?.());t&&"object"==typeof t&&(this.cardConfig=t),this.shadowRoot?.querySelectorAll("ha-select").forEach(e=>{const t=e.name||e.type;t&&void 0!==e.value&&(this[t]=`${e.value}`)});const i=JSON.stringify(this.cardConfig);this.hass.callWS({type:"dwains_dashboard/add_card",card_data:i,area_id:this.area_id,domain:this.domain,position:this.position,filename:this.filename,page:this.page,rowSpan:this.rowSpan,colSpan:this.colSpan,rowSpanLg:this.rowSpanLg,colSpanLg:this.colSpanLg,rowSpanXl:this.rowSpanXl,colSpanXl:this.colSpanXl}).then(e=>{(0,I.fs)()},e=>{console.error("Message failed!",e)})}_removeCard(){this.hass.callWS({type:"dwains_dashboard/remove_card",area_id:this.area_id,domain:this.domain,filename:this.filename,page:this.page}).then(e=>{(0,I.fs)()},e=>{console.error("Message failed!",e)})}_switchMode(e){const t=e.currentTarget.mode;this.mode=t,this.requestUpdate()}_handleDeleteBlueprintClicked(e){const t=e.currentTarget.blueprint;this.hass.callWS({type:"dwains_dashboard/delete_blueprint",blueprint:t}).then(e=>{O.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()},e=>{console.error("Message failed!",e)})}_handleUseBlueprintClicked(e){const t=e.currentTarget.blueprint;this.mode="editor-element",this.name=this.blueprints.blueprints[t].blueprint.name,this.cardConfig={type:"custom:dwains-blueprint-card",blueprint:t,card:this.blueprints.blueprints[t].card}}_installBlueprintYamlChanged(e){this.installBlueprintYaml=e.target.value}_handleInstallBlueprintClicked(e){this.installBlueprintYaml||alert("No YAML code entered!"),this.hass.callWS({type:"dwains_dashboard/install_blueprint",yamlCode:JSON.stringify(this.installBlueprintYaml)}).then(e=>{e.succesfull?(alert(this.hass.localize("ui.common.successfully_saved")),O.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()):alert(e.error)},e=>{console.error("Message failed!",e)})}_haSelectChanged(e){e.stopPropagation();const{field:t,value:i}=L(e);t&&void 0!==i&&(this[t]=`${i}`,this.requestUpdate())}_stopPropagation(e){e.stopPropagation()}_checkCustomCard(e){const t=customElements.get(e);return p.qy`
        <div>
          ${t?p.qy`
            <ha-icon
              style="color: green;"
              .icon=${"mdi:check-bold"}
            ></ha-icon>`:p.qy`
            <ha-icon
              style="color: red;"
              .icon=${"mdi:close-thick"}
            ></ha-icon>
            `}
          ${e}
          ${t?p.qy`(${(0,u.A)(this.hass,"blueprint.installed")})`:p.qy`(${(0,u.A)(this.hass,"blueprint.not_installed")})`}
        </div>
      `}render(){if(null==this.blueprints||0===this.blueprints.length)return p.qy`Loading...`;if("pre-select"==this.mode)return p.qy`
          <ha-md-list>
            <ha-md-list-item type="button" .mode=${"hui-card-picker"} @click=${this._switchMode}>
              <span slot="headline">${(0,u.A)(this.hass,"editor.lovelace_card")}</span>
              <span slot="supporting-text">${(0,u.A)(this.hass,"editor.create_lovelace_card")}</span>
            </ha-md-list-item>
            <li divider role="separator"></li>
            <ha-md-list-item type="button" .mode=${"dwains-dashboard-blueprint-select"} @click=${this._switchMode}>
              <span slot="headline">${(0,u.A)(this.hass,"editor.dwains_dashboard_blueprint")}</span>
              <span slot="supporting-text">${(0,u.A)(this.hass,"editor.use_dwains_dashboard_blueprint")}</span>
              <ha-icon-next slot="end"></ha-icon-next>
            </ha-md-list-item>
          </ha-md-list>
        `;if("dwains-dashboard-blueprint-select"==this.mode){const e=Object.entries(this.blueprints.blueprints).sort(function(e,t){let i=e[1].blueprint.type,s=t[1].blueprint.type;return i==s?0:i>s?1:-1});return p.qy`
        <div class="edit-element">

          <div style="margin-bottom: 20px;">
            <ha-button .mode=${"pre-select"} @click=${this._switchMode}>< ${this.hass.localize("ui.common.previous")}</ha-button>
          </div>

          <strong>${(0,u.A)(this.hass,"blueprint.installed_blueprints")}:</strong>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"blueprint.title")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"global.version")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"blueprint.type")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"blueprint.used_custom_cards")}</th>
                <th scope="col" class="relative px-6 py-3">
                </th>
              </tr>
            </thead>
            <tbody>
              ${0==Object.values(e).length?p.qy`
                <tr>
                  <td  class="px-6 py-4" colspan="5">${(0,u.A)(this.hass,"blueprint.no_blueprints_installed")}</td>
                </tr>`:p.qy`
                ${Object.entries(e).map(([e,t])=>p.qy`
                        <tr class="bg-white">
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <h3>${t[1].blueprint.name}</h3>
                            ${t[1].blueprint.description}
                          </td>
                          <td class="px-6 py-4">
                            ${t[1].blueprint.version}
                          </td>
                          <td class="px-6 py-4">
                            ${t[1].blueprint.type}
                          </td>
                          <td class="px-6 py-4">
                            ${t[1].blueprint.custom_cards&&0!==t[1].blueprint.custom_cards.length?p.qy`
                                ${t[1].blueprint.custom_cards.map(e=>this._checkCustomCard(e))}
                              `:"None"}
                          </td>
                          <td>
                            ${"card"==t[1].blueprint.type?p.qy`
                              <ha-button .blueprint=${t[0]} @click=${this._handleUseBlueprintClicked} unelevated>
                                ${(0,u.A)(this.hass,"blueprint.use")}
                              </ha-button>
                            `:""}
                            <ha-button .blueprint=${t[0]} @click=${this._handleDeleteBlueprintClicked} unelevated>
                              <ha-icon
                                .icon=${"mdi:delete"}
                              ></ha-icon>
                            </ha-button>
                          </td>
                        </tr>
                      `)}
                `}
            </tbody>
          </table>
          <div class="seperator"></div>
          <strong>${(0,u.A)(this.hass,"blueprint.install")}</strong>
          <p>${(0,u.A)(this.hass,"blueprint.instruction")}</p>
          <a href="https://github.com/dwainscheeren/dwains-dashboard-blueprints" target="_blank">Dwains Dashboard Blueprints Github</a>
          <ha-yaml-editor
            label=${(0,u.A)(this.hass,"blueprint.yaml_code")}
            name="description"
            @value-changed=${this._installBlueprintYamlChanged}
          ><ha-code-editor mode="yaml" autocomplete-entities="" autocomplete-icons="" dir="ltr"></ha-code-editor></ha-yaml-editor>
          <div style="margin-top: 15px; margin-bottom: 20px;">
            <ha-button @click=${this._handleInstallBlueprintClicked} unelevated>
              ${(0,u.A)(this.hass,"blueprint.install")}
            </ha-button>
          </div>
        </div>`}return"hui-card-picker"==this.mode?p.qy`
          <div class="edit-element">
            <h1 style="font-size: 17px; font-weight: bold;">${(0,u.A)(this.hass,"editor.select_card_for")} ${this.name}</h1>
            <dwains-card-picker
              @config-changed=${this.magicStuff}
              .hass=${this.hass}
              .lovelace=${{views:[]}}
            ></dwains-card-picker>
            <div class="card-footer">
              <ha-button slot="secondaryAction" @click=${e=>(0,I.fs)()}>
                ${this.hass.localize("ui.common.cancel")}
              </ha-button>
            </div>
          </div>
        `:"editor-element"==this.mode?p.qy`
          <div class="edit-element">
            <div class="card-dd-settings">

            <h2>${(0,u.A)(this.hass,"editor.default_col_row")}</h2>
            <div class="grid-2">
              <ha-select
                label=${(0,u.A)(this.hass,"editor.row_span")}
                .value=${this.rowSpan}
                .type=${"rowSpan"}
                name="rowSpan"
                @selected=${this._haSelectChanged}
                @closed=${this._stopPropagation}
              >
                <ha-dropdown-item value="1">1 ${(0,u.A)(this.hass,"editor.row")}</ha-dropdown-item>
                <ha-dropdown-item value="2">2 ${(0,u.A)(this.hass,"editor.rows")}</ha-dropdown-item>
              </ha-select>
              <ha-select
                label=${(0,u.A)(this.hass,"editor.col_span")}
                .value=${this.colSpan}
                .type=${"colSpan"}
                name="colSpan"
                @selected=${this._haSelectChanged}
                @closed=${this._stopPropagation}
              >
                <ha-dropdown-item value="1">1 ${(0,u.A)(this.hass,"editor.column")}</ha-dropdown-item>
                <ha-dropdown-item value="2">2 ${(0,u.A)(this.hass,"editor.columns")}</ha-dropdown-item>
              </ha-select>
            </div>

            <h2>${(0,u.A)(this.hass,"editor.large_col_row")}</h2>
            <div class="grid-2">
              <ha-select
                label=${(0,u.A)(this.hass,"editor.row_span")}
                .value=${this.rowSpanLg}
                .type=${"rowSpanLg"}
                name="rowSpanLg"
                @selected=${this._haSelectChanged}
                @closed=${this._stopPropagation}
              >
                <ha-dropdown-item value="1">1 ${(0,u.A)(this.hass,"editor.row")}</ha-dropdown-item>
                <ha-dropdown-item value="2">2 ${(0,u.A)(this.hass,"editor.rows")}</ha-dropdown-item>
                <ha-dropdown-item value="3">3 ${(0,u.A)(this.hass,"editor.rows")}</ha-dropdown-item>
              </ha-select>
              <ha-select
                label=${(0,u.A)(this.hass,"editor.col_span")}
                .value=${this.colSpanLg}
                .type=${"colSpanLg"}
                name="colSpanLg"
                @selected=${this._haSelectChanged}
                @closed=${this._stopPropagation}
              >
                <ha-dropdown-item value="1">1 ${(0,u.A)(this.hass,"editor.column")}</ha-dropdown-item>
                <ha-dropdown-item value="2">2 ${(0,u.A)(this.hass,"editor.columns")}</ha-dropdown-item>
                <ha-dropdown-item value="3">3 ${(0,u.A)(this.hass,"editor.columns")}</ha-dropdown-item>
              </ha-select>
            </div>

            <h2>${(0,u.A)(this.hass,"editor.extra_large_col_row")}</h2>
            <div class="grid-2">
              <ha-select
                label=${(0,u.A)(this.hass,"editor.row_span")}
                .value=${this.rowSpanXl}
                .type=${"rowSpanXl"}
                name="rowSpanXl"
                @selected=${this._haSelectChanged}
                @closed=${this._stopPropagation}
              >
                <ha-dropdown-item value="1">1 ${(0,u.A)(this.hass,"editor.row")}</ha-dropdown-item>
                <ha-dropdown-item value="2">2 ${(0,u.A)(this.hass,"editor.rows")}</ha-dropdown-item>
                <ha-dropdown-item value="3">3 ${(0,u.A)(this.hass,"editor.rows")}</ha-dropdown-item>
                <ha-dropdown-item value="4">4 ${(0,u.A)(this.hass,"editor.rows")}</ha-dropdown-item>
              </ha-select>
              <ha-select
                label=${(0,u.A)(this.hass,"editor.col_span")}
                .value=${this.colSpanXl}
                .type=${"colSpanXl"}
                name="colSpanXl"
                @selected=${this._haSelectChanged}
                @closed=${this._stopPropagation}
              >
                <ha-dropdown-item value="1">1 ${(0,u.A)(this.hass,"editor.column")}</ha-dropdown-item>
                <ha-dropdown-item value="2">2 ${(0,u.A)(this.hass,"editor.columns")}</ha-dropdown-item>
                <ha-dropdown-item value="3">3 ${(0,u.A)(this.hass,"editor.columns")}</ha-dropdown-item>
                <ha-dropdown-item value="4">4 ${(0,u.A)(this.hass,"editor.columns")}</ha-dropdown-item>
              </ha-select>
            </div>
            </div>
            <dwains-card-config-editor
              @save-config=${this.magicStuffSecond}
              @config-changed=${this.magicStuff}
              .value=${this.cardConfig}
              .hass=${this.hass}
              .lovelace=${{views:[]}}
            ></dwains-card-config-editor>
            <dwains-card-preview
              .hass=${this.hass}
              .config=${this.cardConfig}
            ></dwains-card-preview>
            <div class="card-footer">
              ${this.filename?p.qy`<ha-button @click=${this._removeCard}>${this.hass.localize("ui.common.remove")}</ha-button>`:""}
              <ha-button @click=${this._sendCard}>${this.hass.localize("ui.common.submit")}</ha-button>
            </div>
          </div>
        `:void 0}}N("dwains-create-custom-card-card",D);var T=i(5213);const{closeParentDropdown:j}=n(),{defineDwainsElement:H}=r(),{AREA_GRAPH_HOURS:U,normalizeGraphHours:W}=i(1495);class F extends p.WF{static get styles(){return[(0,T.F)(p.AH),p.AH`
        .edit-element {
          padding: 20px;
          max-width: 460px;
          margin-right: auto;
          margin-left: auto;
        }
        .edit-element ha-icon-picker, .edit-element ha-select, .edit-element ha-entity-picker, .edit-element ha-selector {
          display: block;
          margin: .8rem 0;
        }
        .edit-element .dd-check {
          display: flex;
          align-items: center;
          gap: .6rem;
          margin: .9rem 0;
          padding-inline-start: .25rem;
        }
        .add-button {
          font-size: 16px;
          border: 2px solid #4591B8;
          padding: 5px;
          margin-bottom: 50px;
          background: #459CEE;
          border-radius: 20px;
          color: white;
        }
        .card-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: .75rem;
          padding: 8px;
          border-top: 1px solid var(--divider-color);
        }
        `]}setConfig(e){this.areaId=e.areaId,this.icon=e.icon?e.icon:"",this.disableArea=!!e.disableArea&&e.disableArea,this.hideIcon=!!e.hideIcon&&e.hideIcon,this.graphEntity=e.graphEntity||"",this.graphHours=W(e.graphHours),this.sensorEntities=Array.isArray(e.sensorEntities)?e.sensorEntities:[],this.binarySensorEntities=Array.isArray(e.binarySensorEntities)?e.binarySensorEntities:[]}connectedCallback(){super.connectedCallback()}_iconPickerChange(e){this.icon=e.detail.value}_disableValueChanged(e){this.disableArea=e.target.checked}_hideIconValueChanged(e){this.hideIcon=e.target.checked,this.requestUpdate()}_graphEntityChanged(e){this.graphEntity=e.detail.value||"",this.requestUpdate()}_graphHoursChanged(e){e.stopPropagation();const t=e.detail?.value;null!=t&&""!==t&&(this.graphHours=W(t),this.requestUpdate())}_graphEntityFilter(e){return Boolean(e.attributes&&e.attributes.unit_of_measurement)}_areaEntities(e){const t=this.hass?.entities||{},i=this.hass?.devices||{};return Object.values(t).filter(t=>t.entity_id.startsWith(`${e}.`)).filter(e=>(e.area_id||i[e.device_id]?.area_id)===this.areaId).map(e=>e.entity_id)}_entityListChanged(e,t){t.stopPropagation(),this[e]=Array.isArray(t.detail.value)?t.detail.value:[],this.requestUpdate()}_renderEntityList(e,t,i,s){const a=this._areaEntities(t),r=[...new Set([...a,...this[e]])];return p.qy`
        <ha-selector
          .hass=${this.hass}
          .label=${i}
          .helper=${s}
          .value=${this[e]}
          .selector=${{entity:{multiple:!0,include_entities:r.length?r:["none.none"]}}}
          @value-changed=${t=>this._entityListChanged(e,t)}
        ></ha-selector>
      `}_saveButton(e){j(e),e.stopPropagation(),this.hass.callWS({type:"dwains_dashboard/edit_area_button",icon:this.icon,areaId:this.areaId,disableArea:this.disableArea,hideIcon:this.hideIcon,graphEntity:this.graphEntity,graphHours:this.graphHours,sensorEntities:this.sensorEntities,binarySensorEntities:this.binarySensorEntities}).then(e=>{(0,I.fs)()},e=>{console.error("Message failed!",e)})}render(){return p.qy`
      <div class="edit-element">
          <ha-icon-picker
            label=${(0,u.A)(this.hass,"area.icon")}
            .value=${this.icon}
            .name=${(0,u.A)(this.hass,"area.icon")}
            .disabled=${this.hideIcon}
            @value-changed=${this._iconPickerChange}
          ></ha-icon-picker>
          <label class="dd-check" @click=${T.H}>
              <ha-checkbox
              @change=${this._hideIconValueChanged}
              .checked=${this.hideIcon}
            ></ha-checkbox>
              <span>${(0,u.A)(this.hass,"area.hide_icon")}</span>
            </label>
          <ha-entity-picker
            .hass=${this.hass}
            .label=${(0,u.A)(this.hass,"area.graph_entity")}
            .helper=${(0,u.A)(this.hass,"area.graph_entity_helper")}
            .value=${this.graphEntity}
            .includeDomains=${["sensor"]}
            .entityFilter=${this._graphEntityFilter}
            allow-custom-entity
            @value-changed=${this._graphEntityChanged}
          ></ha-entity-picker>
          ${this.graphEntity?p.qy`
            <ha-selector
              .hass=${this.hass}
              .label=${(0,u.A)(this.hass,"area.graph_hours")}
              .value=${String(this.graphHours)}
              .selector=${{select:{mode:"dropdown",options:U.map(e=>({value:String(e),label:(0,u.A)(this.hass,`area.graph_hours_${e}`)}))}}}
              @value-changed=${this._graphHoursChanged}
            ></ha-selector>
          `:""}
          ${this._renderEntityList("sensorEntities","sensor",(0,u.A)(this.hass,"area.sensor_entities"),(0,u.A)(this.hass,"area.sensor_entities_helper"))}
          ${this._renderEntityList("binarySensorEntities","binary_sensor",(0,u.A)(this.hass,"area.binary_sensor_entities"),(0,u.A)(this.hass,"area.binary_sensor_entities_helper"))}
          <label class="dd-check" @click=${T.H}>
              <ha-checkbox
              @change=${this._disableValueChanged}
              .checked=${this.disableArea}
            ></ha-checkbox>
              <span>${(0,u.A)(this.hass,"area.disable")}</span>
            </label>
          <div class="card-footer">
            <ha-button slot="secondaryAction" @click=${e=>(0,I.fs)()}>
              ${this.hass.localize("ui.common.cancel")}
            </ha-button>
            <ha-button slot="primaryAction" @click=${this._saveButton}>
              ${this.hass.localize("ui.common.submit")}
            </ha-button>
          </div>
      </div>
      `}}H("dwains-edit-area-button-card",F);const{closeParentDropdown:X}=n(),{defineDwainsElement:Y}=r();class V extends p.WF{static get styles(){return[(0,T.F)(p.AH),p.AH`
        .edit-element {
          padding: 20px;
          max-width: 460px;
          margin-right: auto;
          margin-left: auto;
        }
        .edit-element ha-icon-picker, .edit-element ha-input, .edit-element ha-select, .edit-element ha-entity-picker {
          display: block;
          margin: .8rem 0;
        }
        .edit-element .dd-check {
          display: flex;
          align-items: center;
          gap: .6rem;
          margin: .9rem 0;
          padding-inline-start: .25rem;
        }
          .add-button {
            font-size: 16px;
            border: 2px solid #4591B8;
            padding: 5px;
            margin-bottom: 50px;
            background: #459CEE;
            border-radius: 20px;
            color: white;
          }
        .card-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: .75rem;
            padding: 8px;
            border-top: 1px solid var(--divider-color);
          }
          .dd-check {
            padding: 16px 6px;
          }
          `]}setConfig(e){this.device=e.device,this.icon=e.icon?e.icon:"",this.showInNavbar=!!e.showInNavbar&&e.showInNavbar}connectedCallback(){super.connectedCallback()}_iconPickerChange(e){this.icon=e.detail.value}_showInMainNavbarValueChanged(e){this.showInNavbar=e.target.checked}_saveButton(e){X(e),e.stopPropagation(),!this.showInNavbar||this.icon?this.hass.callWS({type:"dwains_dashboard/edit_device_button",icon:this.icon,device:this.device,showInNavbar:this.showInNavbar}).then(e=>{(0,I.fs)()},e=>{console.error("Message failed!",e)}):alert((0,u.A)(this.hass,"device.icon_required"))}render(){return p.qy`
        <div class="edit-element">
            <ha-icon-picker
              label=${(0,u.A)(this.hass,"device.icon")}
              .value=${this.icon}
              @value-changed=${this._iconPickerChange}
            ></ha-icon-picker>

          <label class="dd-check" @click=${T.H}>
              <ha-switch
                @change=${this._showInMainNavbarValueChanged}
                .checked=${this.showInNavbar}
              ></ha-switch>
              <span>${(0,u.A)(this.hass,"device.show_in_navbar")}</span>
            </label>

            <div class="card-footer">
              <ha-button slot="secondaryAction" @click=${e=>(0,I.fs)()}>
                ${this.hass.localize("ui.common.cancel")}
              </ha-button>
              <ha-button slot="primaryAction" @click=${this._saveButton}>
                ${this.hass.localize("ui.common.submit")}
              </ha-button>
            </div>
        </div>
        `}}Y("dwains-edit-device-button-card",V);const{websocketReadStore:G}=h(),{ConnectedLoadOwner:J}=a(),{hassConnectionIdentity:K,hasHassConnectionChanged:Q}=o(),{defineDwainsElement:Z}=r();class ee extends p.WF{constructor(){super(),this._connectedLoadOwner=new J(e=>this._loadEditor(e),{reportError:(e,t)=>console.error(e,t),errorMessage:"Failed to load device-card editor data"}),this._configReady=!1}set hass(e){const t=Q(this._hass,e);this._hass=e,t&&(this._connectedLoadOwner.disconnect(),this.isConnected&&this._connectedLoadOwner.connect()),this._startEditorIfReady()}get hass(){return this._hass}static get styles(){return[p.AH`
          .edit-element {
            padding: 20px;
          }
          h1, h2, h3, h4, h5, h6 {
            font-size: inherit;
          }
          blockquote, dd, dl, figure, h1, h2, h3, h4, h5, h6, hr, p, pre {
            margin: 0;
          }
          .add-button {
            font-size: 16px;
            border: 2px solid #4591B8;
            padding: 5px;
            margin-bottom: 50px;
            background: #459CEE;
            border-radius: 20px;
            color: white;
          }
        .card-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: .75rem;
            padding: 8px;
            border-top: 1px solid var(--divider-color);
          }
          .grid {
            display: grid;
            gap: 2rem;
          }
          @media (min-width: 768px){
            .grid-cols-2 {
              grid-template-columns: repeat(2,minmax(0,1fr));
            }
          }
          .pre-select {
            padding: 2.5rem;
          }
          .pre-select-option {
            padding: 2.5rem;
            border: 1px solid #4591B8;
            text-align: center;
            cursor: pointer;
          }
          .pre-selected-option:hover {
            border: 2px solid #4591B8;
          }
          .more-page-settings {
            padding: 0.75rem;
            border: 2px solid grey;
          }
          .seperator {
            background-color: var(--secondary-background-color);
            width: 100%;
            height: 3px;
            margin-top: 15px;
            margin-bottom: 15px;
        }
        /*Start blueprint table*/
        /* Blueprint table responsive fix */
        table.min-w-full {
          width: 100%;
          table-layout: fixed;
        }
        table.min-w-full th,
        table.min-w-full td {
          overflow-wrap: anywhere;
          word-break: break-word;
          vertical-align: top;
        }
        table.min-w-full .px-6 {
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }
        table.min-w-full .whitespace-nowrap {
          white-space: normal;
        }
        table.min-w-full th:last-child,
        table.min-w-full td:last-child {
          width: 6.5rem;
          min-width: 6.5rem;
        }
        table.min-w-full td:last-child ha-button {
          display: block;
          margin: 0.125rem 0;
        }
        @media (max-width: 640px) {
          table.min-w-full .px-6 {
            padding-left: 0.25rem;
            padding-right: 0.25rem;
          }
          table.min-w-full .py-4 {
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
          }
          table.min-w-full th,
          table.min-w-full td {
            font-size: 0.75rem;
            line-height: 1rem;
          }
          table.min-w-full th:last-child,
          table.min-w-full td:last-child {
            width: 5.75rem;
            min-width: 5.75rem;
          }
        }
        .min-w-full {
          min-width: 100%;
        }
          table {
              text-indent: 0;
              border-color: inherit;
              border-collapse: collapse;
          }
          .bg-gray-50 {
            background-color: var(--secondary-background-color);
          }
          .tracking-wider {
              letter-spacing: .05em;
          }
          .text-sm {
            font-size: .875rem;
            line-height: 1.25rem;
          }
          .py-4 {
              padding-top: 1rem;
              padding-bottom: 1rem;
          }
          .uppercase {
              text-transform: uppercase;
          }
          .font-medium {
              font-weight: 500;
          }
          .text-xs {
              font-size: .75rem;
              line-height: 1rem;
          }
          .text-left {
              text-align: left;
          }
          .px-6 {
              padding-left: 1.5rem;
              padding-right: 1.5rem;
          }
          .py-3 {
              padding-top: 0.75rem;
              padding-bottom: 0.75rem;
          }
          .card-footer-multiple {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            border-top: 1px solid var(--divider-color);
          }
          `]}static get properties(){return{mode:{},blueprints:{}}}setConfig(e){if(this._editorSessionInitialized)return this._configReady=!0,void this._startEditorIfReady();if(this._editorSessionInitialized=!0,this.mode=e.mode?e.mode:"dwains-dashboard-blueprint-select",this.domain=e.domain,e.cardConfig){const t=structuredClone(e.cardConfig);delete t.input_entity,delete t.input_name,this.cardConfig=t}else this.cardConfig="";this.existingCardEdit=!!e.existingCardEdit&&e.existingCardEdit,this._configReady=!0,this._startEditorIfReady()}connectedCallback(){super.connectedCallback(),this._connectedLoadOwner.connect(),this._startEditorIfReady()}disconnectedCallback(){super.disconnectedCallback(),this._connectedLoadOwner.disconnect()}_startEditorIfReady(){this._configReady&&this._hass&&this._connectedLoadOwner.ready()}async _loadEditor({isCurrent:e}){const t=this._hass,i=K(t),s=await G.read(t,{type:"dwains_dashboard/get_blueprints"});e()&&K(this._hass)===i&&(this.blueprints=s)}_loadBlueprints(){return this._connectedLoadOwner.reload()}_switchMode(e){const t=e.currentTarget.mode;this.mode=t,this.requestUpdate()}_removeCard(){this.hass.callWS({type:"dwains_dashboard/remove_device_card",domain:this.domain}).then(e=>{(0,I.fs)()},e=>{console.error("Message failed!",e)})}_handleDeleteBlueprintClicked(e){const t=e.currentTarget.blueprint;this.hass.callWS({type:"dwains_dashboard/delete_blueprint",blueprint:t}).then(e=>{G.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()},e=>{console.error("Message failed!",e)})}_handleUseBlueprintClicked(e){const t=e.currentTarget.blueprint,i=JSON.stringify({type:"custom:dwains-blueprint-card",blueprint:t,card:this.blueprints.blueprints[t].card});this.hass.callWS({type:"dwains_dashboard/edit_device_card",cardData:i,domain:this.domain}).then(e=>{(0,I.fs)()},e=>{console.error("Message failed!",e)})}_installBlueprintYamlChanged(e){this.installBlueprintYaml=e.target.value}_handleInstallBlueprintClicked(e){this.hass.callWS({type:"dwains_dashboard/install_blueprint",yamlCode:JSON.stringify(this.installBlueprintYaml)}).then(e=>{e.succesfull?(alert(this.hass.localize("ui.common.successfully_saved")),G.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()):alert(e.error)},e=>{console.error("Message failed!",e)})}_checkCustomCard(e){const t=customElements.get(e);return p.qy`
          <div>
            ${t?p.qy`
              <ha-icon
                style="color: green;"
                .icon=${"mdi:check-bold"}
              ></ha-icon>`:p.qy`
              <ha-icon
                style="color: red;"
                .icon=${"mdi:close-thick"}
              ></ha-icon>
              `}
            ${e}
            ${t?p.qy`(${(0,u.A)(this.hass,"blueprint.installed")})`:p.qy`(${(0,u.A)(this.hass,"blueprint.not_installed")})`}
          </div>
        `}render(){if(null==this.blueprints||0===this.blueprints.length)return p.qy`Loading...`;if("dwains-dashboard-blueprint-select"==this.mode){const e=Object.entries(this.blueprints.blueprints).sort(function(e,t){let i=e[1].blueprint.type,s=t[1].blueprint.type;return i==s?0:i>s?1:-1});return p.qy`
          <div class="edit-element">
            <strong>${(0,u.A)(this.hass,"blueprint.installed_blueprints")}:</strong>
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"blueprint.title")}</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"global.version")}</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"blueprint.type")}</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"blueprint.used_custom_cards")}</th>
                  <th scope="col" class="relative px-6 py-3">
                  </th>
                </tr>
              </thead>
              <tbody>
                ${0==Object.values(this.blueprints.blueprints).length?p.qy`
                  <tr>
                    <td  class="px-6 py-4" colspan="5">${(0,u.A)(this.hass,"blueprint.no_blueprints_installed")}</td>
                  </tr>`:p.qy`
                  ${Object.entries(e).map(([e,t])=>p.qy`
                          <tr class="bg-white">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <h3>${t[1].blueprint.name}</h3>
                              ${t[1].blueprint.description}
                            </td>
                            <td class="px-6 py-4">
                              ${t[1].blueprint.version}
                            </td>
                            <td class="px-6 py-4">
                              ${t[1].blueprint.type}
                            </td>
                            <td class="px-6 py-4">
                              ${t[1].blueprint.custom_cards&&0!==t[1].blueprint.custom_cards.length?p.qy`
                                  ${t[1].blueprint.custom_cards.map(e=>this._checkCustomCard(e))}
                                `:"None"}
                            </td>
                            <td>
                              ${"replace-card"==t[1].blueprint.type?p.qy`
                                <ha-button .blueprint=${t[0]} @click=${this._handleUseBlueprintClicked} unelevated>
                                  ${(0,u.A)(this.hass,"blueprint.use")}
                                </ha-button>
                              `:""}
                              <ha-button .blueprint=${t[0]} @click=${this._handleDeleteBlueprintClicked} unelevated>
                                <ha-icon
                                  .icon=${"mdi:delete"}
                                ></ha-icon>
                              </ha-button>
                            </td>
                          </tr>
                        `)}
                  `}
              </tbody>
            </table>
            <div class="seperator"></div>
            <strong>${(0,u.A)(this.hass,"blueprint.install")}</strong>
            <p>${(0,u.A)(this.hass,"blueprint.instruction")}</p>
            <a href="https://github.com/dwainscheeren/dwains-dashboard-blueprints" target="_blank">Dwains Dashboard Blueprints Github</a>
            <ha-yaml-editor
              label=${(0,u.A)(this.hass,"blueprint.yaml_code")}
              name="description"
              @value-changed=${this._installBlueprintYamlChanged}
            ><ha-code-editor mode="yaml" autocomplete-entities="" autocomplete-icons="" dir="ltr"></ha-code-editor></ha-yaml-editor>
            <div style="margin-top: 15px; margin-bottom: 20px;">
              <ha-button @click=${this._handleInstallBlueprintClicked} unelevated>
                ${(0,u.A)(this.hass,"blueprint.install")}
              </ha-button>
            </div>
          </div>`}return"current-selected-blueprint"==this.mode?p.qy`
            <div class="edit-element">
              <p>
              ${(0,u.A)(this.hass,"device.current_blueprint_card")} ${(0,u.A)(this.hass,"device."+this.domain)}:<br>
                <strong>${this.blueprints.blueprints[this.cardConfig.blueprint].blueprint.name}</strong><br>
                ${this.blueprints.blueprints[this.cardConfig.blueprint].blueprint.description}
              </p>

              <div class="card-footer-multiple">
                ${this.existingCardEdit?p.qy`
                    <div>
                      <ha-button class="warning" @click=${this._removeCard}>${this.hass.localize("ui.common.remove")}</ha-button>
                      <ha-button class="warning" @click=${e=>this.mode="dwains-dashboard-blueprint-select"}}>${this.hass.localize("ui.common.previous")}</ha-button>
                    </div>
                  `:p.qy`<div></div>`}
                <div>
                  <ha-button slot="secondaryAction" @click=${e=>(0,I.fs)()}>
                    ${this.hass.localize("ui.common.cancel")}
                  </ha-button>
                  <ha-button slot="primaryAction" .blueprint=${this.cardConfig.blueprint} @click=${this._handleUseBlueprintClicked}>
                    ${this.hass.localize("ui.common.submit")}
                  </ha-button>
                </div>
              </div>
            </div>
          `:void 0}}Z("dwains-edit-device-card-card",ee);const{websocketReadStore:te}=h(),{ConnectedLoadOwner:ie}=a(),{hassConnectionIdentity:se,hasHassConnectionChanged:ae}=o(),{defineDwainsElement:re}=r();class ne extends p.WF{constructor(){super(),this._connectedLoadOwner=new ie(e=>this._loadEditor(e),{reportError:(e,t)=>console.error(e,t),errorMessage:"Failed to load device-popup editor data"}),this._configReady=!1}set hass(e){const t=ae(this._hass,e);this._hass=e,t&&(this._connectedLoadOwner.disconnect(),this.isConnected&&this._connectedLoadOwner.connect()),this._startEditorIfReady()}get hass(){return this._hass}static get styles(){return[p.AH`
          .edit-element {
            padding: 20px;
          }
          h1, h2, h3, h4, h5, h6 {
            font-size: inherit;
          }
          blockquote, dd, dl, figure, h1, h2, h3, h4, h5, h6, hr, p, pre {
            margin: 0;
          }
          .add-button {
            font-size: 16px;
            border: 2px solid #4591B8;
            padding: 5px;
            margin-bottom: 50px;
            background: #459CEE;
            border-radius: 20px;
            color: white;
          }
        .card-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: .75rem;
            padding: 8px;
            border-top: 1px solid var(--divider-color);
          }
          .grid {
            display: grid;
            gap: 2rem;
          }
          @media (min-width: 768px){
            .grid-cols-2 {
              grid-template-columns: repeat(2,minmax(0,1fr));
            }
          }
          .pre-select {
            padding: 2.5rem;
          }
          .pre-select-option {
            padding: 2.5rem;
            border: 1px solid #4591B8;
            text-align: center;
            cursor: pointer;
          }
          .pre-selected-option:hover {
            border: 2px solid #4591B8;
          }
          .more-page-settings {
            padding: 0.75rem;
            border: 2px solid grey;
          }
          .seperator {
            background-color: var(--secondary-background-color);
            width: 100%;
            height: 3px;
            margin-top: 15px;
            margin-bottom: 15px;
        }
        /*Start blueprint table*/
        /* Blueprint table responsive fix */
        table.min-w-full {
          width: 100%;
          table-layout: fixed;
        }
        table.min-w-full th,
        table.min-w-full td {
          overflow-wrap: anywhere;
          word-break: break-word;
          vertical-align: top;
        }
        table.min-w-full .px-6 {
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }
        table.min-w-full .whitespace-nowrap {
          white-space: normal;
        }
        table.min-w-full th:last-child,
        table.min-w-full td:last-child {
          width: 6.5rem;
          min-width: 6.5rem;
        }
        table.min-w-full td:last-child ha-button {
          display: block;
          margin: 0.125rem 0;
        }
        @media (max-width: 640px) {
          table.min-w-full .px-6 {
            padding-left: 0.25rem;
            padding-right: 0.25rem;
          }
          table.min-w-full .py-4 {
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
          }
          table.min-w-full th,
          table.min-w-full td {
            font-size: 0.75rem;
            line-height: 1rem;
          }
          table.min-w-full th:last-child,
          table.min-w-full td:last-child {
            width: 5.75rem;
            min-width: 5.75rem;
          }
        }
        .min-w-full {
          min-width: 100%;
        }
          table {
              text-indent: 0;
              border-color: inherit;
              border-collapse: collapse;
          }
          .bg-gray-50 {
            background-color: var(--secondary-background-color);
          }
          .tracking-wider {
              letter-spacing: .05em;
          }
          .text-sm {
            font-size: .875rem;
            line-height: 1.25rem;
          }
          .py-4 {
              padding-top: 1rem;
              padding-bottom: 1rem;
          }
          .uppercase {
              text-transform: uppercase;
          }
          .font-medium {
              font-weight: 500;
          }
          .text-xs {
              font-size: .75rem;
              line-height: 1rem;
          }
          .text-left {
              text-align: left;
          }
          .px-6 {
              padding-left: 1.5rem;
              padding-right: 1.5rem;
          }
          .py-3 {
              padding-top: 0.75rem;
              padding-bottom: 0.75rem;
          }
          .card-footer-multiple {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            border-top: 1px solid var(--divider-color);
          }
          `]}static get properties(){return{mode:{},blueprints:{}}}setConfig(e){if(this._editorSessionInitialized)return this._configReady=!0,void this._startEditorIfReady();if(this._editorSessionInitialized=!0,this.mode=e.mode?e.mode:"dwains-dashboard-blueprint-select",this.domain=e.domain,e.cardConfig){const t=structuredClone(e.cardConfig);delete t.input_entity,delete t.input_name,this.cardConfig=t}else this.cardConfig="";this.existingCardEdit=!!e.existingCardEdit&&e.existingCardEdit,this._configReady=!0,this._startEditorIfReady()}connectedCallback(){super.connectedCallback(),this._connectedLoadOwner.connect(),this._startEditorIfReady()}disconnectedCallback(){super.disconnectedCallback(),this._connectedLoadOwner.disconnect()}_startEditorIfReady(){this._configReady&&this._hass&&this._connectedLoadOwner.ready()}async _loadEditor({isCurrent:e}){const t=this._hass,i=se(t),s=await te.read(t,{type:"dwains_dashboard/get_blueprints"});e()&&se(this._hass)===i&&(this.blueprints=s)}_loadBlueprints(){return this._connectedLoadOwner.reload()}_switchMode(e){const t=e.currentTarget.mode;this.mode=t,this.requestUpdate()}_removeCard(){this.hass.callWS({type:"dwains_dashboard/remove_device_popup",domain:this.domain}).then(e=>{(0,I.fs)()},e=>{console.error("Message failed!",e)})}_handleDeleteBlueprintClicked(e){const t=e.currentTarget.blueprint;this.hass.callWS({type:"dwains_dashboard/delete_blueprint",blueprint:t}).then(e=>{te.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()},e=>{console.error("Message failed!",e)})}_handleUseBlueprintClicked(e){const t=e.currentTarget.blueprint,i=JSON.stringify({type:"custom:dwains-blueprint-card",blueprint:t,card:this.blueprints.blueprints[t].card});this.hass.callWS({type:"dwains_dashboard/edit_device_popup",cardData:i,domain:this.domain}).then(e=>{(0,I.fs)()},e=>{console.error("Message failed!",e)})}_installBlueprintYamlChanged(e){this.installBlueprintYaml=e.target.value}_handleInstallBlueprintClicked(e){this.hass.callWS({type:"dwains_dashboard/install_blueprint",yamlCode:JSON.stringify(this.installBlueprintYaml)}).then(e=>{e.succesfull?(alert(this.hass.localize("ui.common.successfully_saved")),te.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()):alert(e.error)},e=>{console.error("Message failed!",e)})}_checkCustomCard(e){const t=customElements.get(e);return p.qy`
          <div>
            ${t?p.qy`
              <ha-icon
                style="color: green;"
                .icon=${"mdi:check-bold"}
              ></ha-icon>`:p.qy`
              <ha-icon
                style="color: red;"
                .icon=${"mdi:close-thick"}
              ></ha-icon>
              `}
            ${e}
            ${t?p.qy`(${(0,u.A)(this.hass,"blueprint.installed")})`:p.qy`(${(0,u.A)(this.hass,"blueprint.not_installed")})`}
          </div>
        `}render(){if("dwains-dashboard-blueprint-select"==this.mode){const e=Object.entries(this.blueprints.blueprints).sort(function(e,t){let i=e[1].blueprint.type,s=t[1].blueprint.type;return i==s?0:i>s?1:-1});return p.qy`
          <div class="edit-element">
            <strong>${(0,u.A)(this.hass,"blueprint.installed_blueprints")}:</strong>
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"blueprint.title")}</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"global.version")}</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"blueprint.type")}</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"blueprint.used_custom_cards")}</th>
                  <th scope="col" class="relative px-6 py-3">
                  </th>
                </tr>
              </thead>
              <tbody>
              ${Object.entries(e).map(([e,t])=>p.qy`
                      <tr class="bg-white">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <h3>${t[1].blueprint.name}</h3>
                          ${t[1].blueprint.description}
                        </td>
                        <td class="px-6 py-4">
                          ${t[1].blueprint.version}
                        </td>
                        <td class="px-6 py-4">
                          ${t[1].blueprint.type}
                        </td>
                        <td class="px-6 py-4">
                          ${t[1].blueprint.custom_cards&&0!==t[1].blueprint.custom_cards.length?p.qy`
                              ${t[1].blueprint.custom_cards.map(e=>this._checkCustomCard(e))}
                            `:"None"}
                        </td>
                        <td>
                          ${"replace-card"==t[1].blueprint.type?p.qy`
                            <ha-button .blueprint=${t[0]} @click=${this._handleUseBlueprintClicked} unelevated>
                              ${(0,u.A)(this.hass,"blueprint.use")}
                            </ha-button>
                          `:""}
                          <ha-button .blueprint=${t[0]} @click=${this._handleDeleteBlueprintClicked} unelevated>
                            <ha-icon
                              .icon=${"mdi:delete"}
                            ></ha-icon>
                          </ha-button>
                        </td>
                      </tr>
                    `)}
              </tbody>
            </table>
            <div class="seperator"></div>
            <strong>${(0,u.A)(this.hass,"blueprint.install")}</strong>
            <p>${(0,u.A)(this.hass,"blueprint.instruction")}</p>
            <a href="https://github.com/dwainscheeren/dwains-dashboard-blueprints" target="_blank">Dwains Dashboard Blueprints Github</a>
            <ha-yaml-editor
              label=${(0,u.A)(this.hass,"blueprint.yaml_code")}
              name="description"
              @value-changed=${this._installBlueprintYamlChanged}
            ><ha-code-editor mode="yaml" autocomplete-entities="" autocomplete-icons="" dir="ltr"></ha-code-editor></ha-yaml-editor>
            <div style="margin-top: 15px; margin-bottom: 20px;">
              <ha-button @click=${this._handleInstallBlueprintClicked} unelevated>
                ${(0,u.A)(this.hass,"blueprint.install")}
              </ha-button>
            </div>
          </div>`}if("current-selected-blueprint"==this.mode)return p.qy`
            <div class="edit-element">
              <p>
                ${(0,u.A)(this.hass,"device.current_blueprint_popup")} ${(0,u.A)(this.hass,"device."+this.domain)}:<br>
                <strong>${this.blueprints.blueprints[this.cardConfig.blueprint].blueprint.name}</strong><br>
                ${this.blueprints.blueprints[this.cardConfig.blueprint].blueprint.description}
              </p>
              <div class="card-footer-multiple">
                ${this.existingCardEdit?p.qy`
                    <div>
                      <ha-button class="warning" @click=${this._removeCard}>${this.hass.localize("ui.common.remove")}</ha-button>
                      <ha-button class="warning" @click=${e=>this.mode="dwains-dashboard-blueprint-select"}}>${this.hass.localize("ui.common.previous")}</ha-button>
                    </div>
                  `:p.qy`<div></div>`}
                <div>
                  <ha-button slot="secondaryAction" @click=${e=>(0,I.fs)()}>
                    ${this.hass.localize("ui.common.cancel")}
                  </ha-button>
                  <ha-button slot="primaryAction" .blueprint=${this.cardConfig.blueprint} @click=${this._handleUseBlueprintClicked}>
                    ${this.hass.localize("ui.common.submit")}
                  </ha-button>
                </div>
              </div>
            </div>
          `}}re("dwains-edit-device-popup-card",ne);var oe=i(5890);const{websocketReadStore:de}=h(),{ConnectedLoadOwner:le}=a(),{hassConnectionIdentity:ce,hasHassConnectionChanged:he}=o(),{prepareEntityEditorCardConfig:pe,renderBlueprintSelection:ue}=s(),{defineDwainsElement:me}=r();class ge extends p.WF{constructor(){super(),this._connectedLoadOwner=new le(e=>this._loadEditor(e),{reportError:(e,t)=>console.error(e,t),errorMessage:"Failed to load entity-card editor data"}),this._configReady=!1}set hass(e){const t=he(this._hass,e);this._hass=e,t&&(this._connectedLoadOwner.disconnect(),this.isConnected&&this._connectedLoadOwner.connect()),this._startEditorIfReady()}get hass(){return this._hass}static get styles(){return[p.AH`
        .edit-element {
          padding: 20px;
        }
        h1, h2, h3, h4, h5, h6 {
          font-size: inherit;
        }
        blockquote, dd, dl, figure, h1, h2, h3, h4, h5, h6, hr, p, pre {
          margin: 0;
        }
        .add-button {
          font-size: 16px;
          border: 2px solid #4591B8;
          padding: 5px;
          margin-bottom: 50px;
          background: #459CEE;
          border-radius: 20px;
          color: white;
        }
        .card-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: .75rem;
          padding: 8px;
          border-top: 1px solid var(--divider-color);
        }
        .grid {
          display: grid;
          gap: 2rem;
        }
        @media (min-width: 768px){
          .grid-cols-2 {
            grid-template-columns: repeat(2,minmax(0,1fr));
          }
        }
        .pre-select {
          padding: 2.5rem;
        }
        .pre-select-option {
          padding: 2.5rem;
          border: 1px solid #4591B8;
          text-align: center;
          cursor: pointer;
        }
        .pre-selected-option:hover {
          border: 2px solid #4591B8;
        }
        .more-page-settings {
          padding: 0.75rem;
          border: 2px solid grey;
        }
        .seperator {
          background-color: var(--secondary-background-color);
          width: 100%;
          height: 3px;
          margin-top: 15px;
          margin-bottom: 15px;
        }
        /*Start blueprint table*/
        /* Blueprint table responsive fix */
        table.min-w-full {
          width: 100%;
          table-layout: fixed;
        }
        table.min-w-full th,
        table.min-w-full td {
          overflow-wrap: anywhere;
          word-break: break-word;
          vertical-align: top;
        }
        table.min-w-full .px-6 {
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }
        table.min-w-full .whitespace-nowrap {
          white-space: normal;
        }
        table.min-w-full th:last-child,
        table.min-w-full td:last-child {
          width: 6.5rem;
          min-width: 6.5rem;
        }
        table.min-w-full td:last-child ha-button {
          display: block;
          margin: 0.125rem 0;
        }
        @media (max-width: 640px) {
          table.min-w-full .px-6 {
            padding-left: 0.25rem;
            padding-right: 0.25rem;
          }
          table.min-w-full .py-4 {
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
          }
          table.min-w-full th,
          table.min-w-full td {
            font-size: 0.75rem;
            line-height: 1rem;
          }
          table.min-w-full th:last-child,
          table.min-w-full td:last-child {
            width: 5.75rem;
            min-width: 5.75rem;
          }
        }
        .min-w-full {
          min-width: 100%;
        }
        table {
            text-indent: 0;
            border-color: inherit;
            border-collapse: collapse;
        }
        .bg-gray-50 {
          background-color: var(--secondary-background-color);
        }
        .tracking-wider {
            letter-spacing: .05em;
        }
        .text-sm {
          font-size: .875rem;
          line-height: 1.25rem;
        }
        .py-4 {
            padding-top: 1rem;
            padding-bottom: 1rem;
        }
        .uppercase {
            text-transform: uppercase;
        }
        .font-medium {
            font-weight: 500;
        }
        .text-xs {
            font-size: .75rem;
            line-height: 1rem;
        }
        .text-left {
            text-align: left;
        }
        .px-6 {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
        }
        .py-3 {
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
        }
        .card-footer-multiple {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          border-top: 1px solid var(--divider-color);
        }
        `]}static get properties(){return{mode:{},blueprints:{}}}setConfig(e){if(this._editorSessionInitialized)return this._configReady=!0,void this._startEditorIfReady();this._editorSessionInitialized=!0,this.mode=e.mode?e.mode:"pre-select",this.entity_id=e.entity_id,e.cardConfig?this.cardConfig=pe(e.cardConfig,this.entity_id):this.cardConfig="",this.existingCardEdit=!!e.existingCardEdit&&e.existingCardEdit,this._configReady=!0,this._startEditorIfReady()}connectedCallback(){super.connectedCallback(),this._connectedLoadOwner.connect(),this._startEditorIfReady()}disconnectedCallback(){super.disconnectedCallback(),this._connectedLoadOwner.disconnect()}_startEditorIfReady(){this._configReady&&this._hass&&this._connectedLoadOwner.ready()}async _loadEditor({isCurrent:e}){const t=this._hass,i=ce(t),s=await de.read(t,{type:"dwains_dashboard/get_blueprints"});e()&&ce(this._hass)===i&&(this.blueprints=s)}_loadBlueprints(){return this._connectedLoadOwner.reload()}magicStuff(e){const t=structuredClone(e.detail.config),i=t.type;oe.SG.includes(i)?(t.entity||(t.entity=this.entity_id),this.cardConfig=t):this.cardConfig=t,this.mode="editor-element"}magicStuffSecond(e){}async _sendCard(){const e=this.renderRoot?.querySelector("dwains-card-config-editor"),t=await(e?.commitConfig?.()??e?.getConfig?.());t&&"object"==typeof t&&(this.cardConfig=t);try{await this.hass.callWS({type:"dwains_dashboard/edit_entity_card",cardData:JSON.stringify(this.cardConfig),entityId:this.entity_id}),de.invalidate(this.hass),(0,I.fs)()}catch(e){console.error("Message failed!",e)}}_switchMode(e){const t=e.currentTarget.mode;this.mode=t,this.requestUpdate()}_removeCard(){this.hass.callWS({type:"dwains_dashboard/remove_entity_card",entityId:this.entity_id}).then(e=>{(0,I.fs)()},e=>{console.error("Message failed!",e)})}_handleDeleteBlueprintClicked(e){const t=e.currentTarget.blueprint;this.hass.callWS({type:"dwains_dashboard/delete_blueprint",blueprint:t}).then(e=>{de.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()},e=>{console.error("Message failed!",e)})}_handleUseBlueprintClicked(e){const t=e.currentTarget.blueprint;this.mode="editor-element",this.name=this.blueprints.blueprints[t].blueprint.name,this.cardConfig={type:"custom:dwains-blueprint-card",blueprint:t,input_entity:this.entity_id,card:this.blueprints.blueprints[t].card}}_installBlueprintYamlChanged(e){this.installBlueprintYaml=e.target.value}_handleInstallBlueprintClicked(e){this.hass.callWS({type:"dwains_dashboard/install_blueprint",yamlCode:JSON.stringify(this.installBlueprintYaml)}).then(e=>{e.succesfull?(alert(this.hass.localize("ui.common.successfully_saved")),de.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()):alert(e.error)},e=>{console.error("Message failed!",e)})}_checkCustomCard(e){const t=customElements.get(e);return p.qy`
        <div>
          ${t?p.qy`
            <ha-icon
              style="color: green;"
              .icon=${"mdi:check-bold"}
            ></ha-icon>`:p.qy`
            <ha-icon
              style="color: red;"
              .icon=${"mdi:close-thick"}
            ></ha-icon>
            `}
          ${e}
          ${t?p.qy`(${(0,u.A)(this.hass,"blueprint.installed")})`:p.qy`(${(0,u.A)(this.hass,"blueprint.not_installed")})`}
        </div>
      `}render(){if(null==this.blueprints||0===this.blueprints.length)return p.qy`Loading...`;if("pre-select"==this.mode)return p.qy`
          <ha-md-list>
            <ha-md-list-item type="button" .mode=${"hui-card-picker"} @click=${this._switchMode}>
              <span slot="headline">${(0,u.A)(this.hass,"editor.lovelace_card")}</span>
              <span slot="supporting-text">${(0,u.A)(this.hass,"editor.create_lovelace_card")}</span>
            </ha-md-list-item>
            <li divider role="separator"></li>
            <ha-md-list-item type="button" .mode=${"dwains-dashboard-blueprint-select"} @click=${this._switchMode}>
              <span slot="headline">${(0,u.A)(this.hass,"editor.dwains_dashboard_blueprint")}</span>
              <span slot="supporting-text">${(0,u.A)(this.hass,"editor.use_dwains_dashboard_blueprint")}</span>
              <ha-icon-next slot="end"></ha-icon-next>
            </ha-md-list-item>
          </ha-md-list>
        `;if("dwains-dashboard-blueprint-select"==this.mode){const e=Object.entries(this.blueprints.blueprints).sort(function(e,t){let i=e[1].blueprint.type,s=t[1].blueprint.type;return i==s?0:i>s?1:-1});return p.qy`
        <div class="edit-element">

          <div style="margin-bottom: 20px;">
            <ha-button .mode=${"pre-select"} @click=${this._switchMode}>< ${this.hass.localize("ui.common.previous")}</ha-button>
          </div>

          <strong>${(0,u.A)(this.hass,"blueprint.installed_blueprints")}:</strong>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"blueprint.title")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"global.version")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"blueprint.type")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"blueprint.used_custom_cards")}</th>
                <th scope="col" class="relative px-6 py-3">
                </th>
              </tr>
            </thead>
            <tbody>
              ${0==Object.values(this.blueprints.blueprints).length?p.qy`
                <tr>
                  <td  class="px-6 py-4" colspan="5">${(0,u.A)(this.hass,"blueprint.no_blueprints_installed")}</td>
                </tr>`:p.qy`
                  ${Object.entries(e).map(([e,t])=>p.qy`
                          <tr class="bg-white">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <h3>${t[1].blueprint.name}</h3>
                              ${t[1].blueprint.description}
                            </td>
                            <td class="px-6 py-4">
                              ${t[1].blueprint.version}
                            </td>
                            <td class="px-6 py-4">
                              ${t[1].blueprint.type}
                            </td>
                            <td class="px-6 py-4">
                              ${t[1].blueprint.custom_cards&&0!==t[1].blueprint.custom_cards.length?p.qy`
                                  ${t[1].blueprint.custom_cards.map(e=>this._checkCustomCard(e))}
                                `:"None"}
                            </td>
                            <td>
                              ${"card"==t[1].blueprint.type||"replace-card"==t[1].blueprint.type?p.qy`
                                <ha-button .blueprint=${t[0]} @click=${this._handleUseBlueprintClicked} unelevated>
                                  ${(0,u.A)(this.hass,"blueprint.use")}
                                </ha-button>
                              `:""}
                              <ha-button .blueprint=${t[0]} @click=${this._handleDeleteBlueprintClicked} unelevated>
                                <ha-icon
                                  .icon=${"mdi:delete"}
                                ></ha-icon>
                              </ha-button>
                            </td>
                          </tr>
                        `)}
                `}
            </tbody>
          </table>
          <div class="seperator"></div>
          <strong>${(0,u.A)(this.hass,"blueprint.install")}</strong>
          <p>${(0,u.A)(this.hass,"blueprint.instruction")}</p>
          <a href="https://github.com/dwainscheeren/dwains-dashboard-blueprints" target="_blank">Dwains Dashboard Blueprints Github</a>
          <ha-yaml-editor
            label=${(0,u.A)(this.hass,"blueprint.yaml_code")}
            name="description"
            @value-changed=${this._installBlueprintYamlChanged}
          ><ha-code-editor mode="yaml" autocomplete-entities="" autocomplete-icons="" dir="ltr"></ha-code-editor></ha-yaml-editor>
          <div style="margin-top: 15px; margin-bottom: 20px;">
            <ha-button @click=${this._handleInstallBlueprintClicked} unelevated>
              ${(0,u.A)(this.hass,"blueprint.install")}
            </ha-button>
          </div>
        </div>`}return"hui-card-picker"==this.mode?p.qy`
          <div class="edit-element">
            <h1 style="font-size: 17px; font-weight: bold;">${(0,u.A)(this.hass,"editor.select_card_for")} ${this.entity_id}</h1>
            <dwains-card-picker
              @config-changed=${this.magicStuff}
              .hass=${this.hass}
              .lovelace=${{views:[]}}
              .entityId=${this.entity_id}
            ></dwains-card-picker>
            <div class="card-footer">
              <ha-button slot="secondaryAction" @click=${e=>(0,I.fs)()}>
                ${this.hass.localize("ui.common.cancel")}
              </ha-button>
            </div>
          </div>
        `:p.qy`
          <div class="edit-element">
            ${ue(p.qy,u.A,this.hass,this.cardConfig,this.blueprints)}
            <dwains-card-config-editor
              @save-config=${this.magicStuffSecond}
              @config-changed=${this.magicStuff}
              .value=${this.cardConfig}
              .hass=${this.hass}
              .lovelace=${{views:[]}}
            ></dwains-card-config-editor>
            <dwains-card-preview
              .hass=${this.hass}
              .config=${this.cardConfig}
            ></dwains-card-preview>
            <div class="card-footer-multiple">
              ${this.existingCardEdit?p.qy`
                  <div>
                    <ha-button class="warning" @click=${this._removeCard}>${this.hass.localize("ui.common.remove")}</ha-button>
                    <ha-button class="warning" @click=${e=>this.mode="hui-card-picker"}}>${this.hass.localize("ui.common.previous")}</ha-button>
                  </div>
                `:p.qy`<div></div>`}
              <div>
                <ha-button slot="secondaryAction" @click=${e=>(0,I.fs)()}>
                  ${this.hass.localize("ui.common.cancel")}
                </ha-button>
                <ha-button slot="primaryAction" @click=${this._sendCard}>
                  ${this.hass.localize("ui.common.submit")}
                </ha-button>
              </div>
            </div>
          </div>
        `}}me("dwains-edit-entity-card-card",ge);const{closeParentDropdown:be}=n(),{defineDwainsElement:ye}=r();class fe extends p.WF{static get styles(){return[(0,T.F)(p.AH),p.AH`
        h2 {
          margin: 0;
          font-size: 1rem;
        }
        .edit-element {
          padding: 20px;
        }
        .add-button {
          font-size: 16px;
          border: 2px solid #4591B8;
          padding: 5px;
          margin-bottom: 50px;
          background: #459CEE;
          border-radius: 20px;
          color: white;
        }
        .card-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: .75rem;
          padding: 8px;
          border-top: 1px solid var(--divider-color);
        }
        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 1rem;
        }
        ha-select, select, ha-input, .dd-check {
          width: 100%;
        }
        select {
          min-height: 56px;
          padding: 0 40px 0 14px;
          color: var(--primary-text-color);
          background: var(--ha-color-surface-high, var(--ha-color-form-background, var(--ha-color-surface-default, var(--card-background-color))));
          border: 1px solid var(--divider-color);
          border-radius: var(--ha-card-border-radius, 12px);
        }
        select:focus, select:focus-visible {
          outline: none;
          border-color: var(--accent-color);
        }
        `]}setConfig(e){this.entity=e.entity,this.friendlyName=e.friendlyName?e.friendlyName:"",this.hideEntity=!!e.hideEntity&&e.hideEntity,this.hideEntityInArea=e.hideEntityInArea??!1,this.disableEntity=!!e.disableEntity&&e.disableEntity,this.excludeEntity=!!e.excludeEntity&&e.excludeEntity,this.rowSpan=e.rowSpan?e.rowSpan:"1",this.colSpan=e.colSpan?e.colSpan:"1",this.rowSpanLg=e.rowSpanLg?e.rowSpanLg:"1",this.colSpanLg=e.colSpanLg?e.colSpanLg:"1",this.rowSpanXl=e.rowSpanXl?e.rowSpanXl:"1",this.colSpanXl=e.colSpanXl?e.colSpanXl:"1",this.customCard=!!e.customCard&&e.customCard,this.customPopup=!!e.customPopup&&e.customPopup}async _saveButton(e){be(e),e.stopPropagation();try{await this.hass.callWS({type:"dwains_dashboard/edit_entity",entity:this.entity,friendlyName:this.friendlyName,disableEntity:this.disableEntity,hideEntity:this.hideEntity,excludeEntity:this.excludeEntity,rowSpan:this.rowSpan,colSpan:this.colSpan,rowSpanLg:this.rowSpanLg,colSpanLg:this.colSpanLg,rowSpanXl:this.rowSpanXl,colSpanXl:this.colSpanXl,customCard:this.customCard,customPopup:this.customPopup}),await this.hass.callWS({type:"dwains_dashboard/edit_entity_bool_value",entityId:this.entity,key:"hidden_in_area",value:this.hideEntityInArea}),(0,I.fs)()}catch(e){console.error("Failed to save entity settings:",e)}}_friendlyNameChanged(e){this.friendlyName=e.target.value}_disableValueChanged(e){this.disableEntity=e.target.checked}_hideValueChanged(e){this.hideEntity=e.target.checked}_hideInAreaValueChanged(e){this.hideEntityInArea=e.target.checked}_excludeValueChanged(e){this.excludeEntity=e.target.checked}_customCardValueChanged(e){this.customCard=e.target.checked}_customPopupValueChanged(e){this.customPopup=e.target.checked}_haSelectChanged(e){be(e),e.stopPropagation();const t=e.currentTarget||e.target,i=t.name||t.type||t.getAttribute?.("type"),s=e.detail?.value??e.detail?.item?.value??t.selectedItem?.value??t.value;i&&void 0!==s&&(this[i]=s),this.requestUpdate()}_stopPropagation(e){e.stopPropagation()}render(){return p.qy`
        <div class="edit-element">
            <h1 style="font-size: 15px; font-weight: bold;">${(0,u.A)(this.hass,"entity.edit_entity")} "${this.entity}"</h1>

            <ha-input
              label=${(0,u.A)(this.hass,"entity.friendly_name")}
              .value=${this.friendlyName}
              @input=${this._friendlyNameChanged}
            ></ha-input>

            <h2>${(0,u.A)(this.hass,"editor.default_col_row")}</h2>
            <div class="grid-2">
              <select name="rowSpan" .value=${this.rowSpan} @change=${this._haSelectChanged} @click=${this._stopPropagation}>
                <option value="1">1 ${(0,u.A)(this.hass,"editor.row")}</option>
                <option value="2">2 ${(0,u.A)(this.hass,"editor.rows")}</option>
              </select>
              <select name="colSpan" .value=${this.colSpan} @change=${this._haSelectChanged} @click=${this._stopPropagation}>
                <option value="1">1 ${(0,u.A)(this.hass,"editor.column")}</option>
                <option value="2">2 ${(0,u.A)(this.hass,"editor.columns")}</option>
              </select>
            </div>

            <h2>${(0,u.A)(this.hass,"editor.large_col_row")}</h2>
            <div class="grid-2">
              <select name="rowSpanLg" .value=${this.rowSpanLg} @change=${this._haSelectChanged} @click=${this._stopPropagation}>
                <option value="1">1 ${(0,u.A)(this.hass,"editor.row")}</option>
                <option value="2">2 ${(0,u.A)(this.hass,"editor.rows")}</option>
                <option value="3">3 ${(0,u.A)(this.hass,"editor.rows")}</option>
              </select>
              <select name="colSpanLg" .value=${this.colSpanLg} @change=${this._haSelectChanged} @click=${this._stopPropagation}>
                <option value="1">1 ${(0,u.A)(this.hass,"editor.column")}</option>
                <option value="2">2 ${(0,u.A)(this.hass,"editor.columns")}</option>
                <option value="3">3 ${(0,u.A)(this.hass,"editor.columns")}</option>
              </select>
            </div>

            <h2>${(0,u.A)(this.hass,"editor.extra_large_col_row")}</h2>
            <div class="grid-2">
              <select name="rowSpanXl" .value=${this.rowSpanXl} @change=${this._haSelectChanged} @click=${this._stopPropagation}>
                <option value="1">1 ${(0,u.A)(this.hass,"editor.row")}</option>
                <option value="2">2 ${(0,u.A)(this.hass,"editor.rows")}</option>
                <option value="3">3 ${(0,u.A)(this.hass,"editor.rows")}</option>
                <option value="4">4 ${(0,u.A)(this.hass,"editor.rows")}</option>
              </select>
              <select name="colSpanXl" .value=${this.colSpanXl} @change=${this._haSelectChanged} @click=${this._stopPropagation}>
                <option value="1">1 ${(0,u.A)(this.hass,"editor.column")}</option>
                <option value="2">2 ${(0,u.A)(this.hass,"editor.columns")}</option>
                <option value="3">3 ${(0,u.A)(this.hass,"editor.columns")}</option>
                <option value="4">4 ${(0,u.A)(this.hass,"editor.columns")}</option>
              </select>
            </div>

            <label class="dd-check" @click=${T.H}>
              <ha-checkbox
                @change=${this._disableValueChanged}
                .checked=${this.disableEntity}
              ></ha-checkbox>
              <span>${(0,u.A)(this.hass,"entity.disable")}</span>
            </label>
            <label class="dd-check" @click=${T.H}>
              <ha-checkbox
                @change=${this._hideValueChanged}
                .checked=${this.hideEntity}
              ></ha-checkbox>
              <span>${(0,u.A)(this.hass,"entity.hide")}</span>
            </label>
            <label class="dd-check" @click=${T.H}>
              <ha-checkbox
                @change=${this._hideInAreaValueChanged}
                .checked=${this.hideEntityInArea}
              ></ha-checkbox>
              <span>${(0,u.A)(this.hass,"entity.hide_in_area")}</span>
            </label>
            <label class="dd-check" @click=${T.H}>
              <ha-checkbox
                @change=${this._excludeValueChanged}
                .checked=${this.excludeEntity}
              ></ha-checkbox>
              <span>${(0,u.A)(this.hass,"entity.exclude")}</span>
            </label>
            <label class="dd-check" @click=${T.H}>
              <ha-checkbox
                @change=${this._customCardValueChanged}
                .checked=${this.customCard}
              ></ha-checkbox>
              <span>${(0,u.A)(this.hass,"entity.use_entity_card")}</span>
            </label>
            <label class="dd-check" @click=${T.H}>
              <ha-checkbox
                @change=${this._customPopupValueChanged}
                .checked=${this.customPopup}
              ></ha-checkbox>
              <span>${(0,u.A)(this.hass,"entity.use_popup_card")}</span>
            </label>

            <div class="card-footer">
              <ha-button slot="secondaryAction" @click=${e=>(0,I.fs)()}>
                ${this.hass.localize("ui.common.cancel")}
              </ha-button>
              <ha-button slot="primaryAction" @click=${this._saveButton}>
                ${this.hass.localize("ui.common.submit")}
              </ha-button>
            </div>
        </div>
      `}}ye("dwains-edit-entity-card",fe);const{websocketReadStore:_e}=h(),{ConnectedLoadOwner:we}=a(),{hassConnectionIdentity:ve,hasHassConnectionChanged:xe}=o(),{prepareEntityEditorCardConfig:$e,renderBlueprintSelection:Ce}=s(),{defineDwainsElement:ke}=r();class Se extends p.WF{constructor(){super(),this._connectedLoadOwner=new we(e=>this._loadEditor(e),{reportError:(e,t)=>console.error(e,t),errorMessage:"Failed to load entity-popup editor data"}),this._configReady=!1}set hass(e){const t=xe(this._hass,e);this._hass=e,t&&(this._connectedLoadOwner.disconnect(),this.isConnected&&this._connectedLoadOwner.connect()),this._startEditorIfReady()}get hass(){return this._hass}static get styles(){return[p.AH`
        .edit-element {
          padding: 20px;
        }
        h1, h2, h3, h4, h5, h6 {
          font-size: inherit;
        }
        blockquote, dd, dl, figure, h1, h2, h3, h4, h5, h6, hr, p, pre {
          margin: 0;
        }
        .add-button {
          font-size: 16px;
          border: 2px solid #4591B8;
          padding: 5px;
          margin-bottom: 50px;
          background: #459CEE;
          border-radius: 20px;
          color: white;
        }
        .card-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: .75rem;
          padding: 8px;
          border-top: 1px solid var(--divider-color);
        }
        .grid {
          display: grid;
          gap: 2rem;
        }
        @media (min-width: 768px){
          .grid-cols-2 {
            grid-template-columns: repeat(2,minmax(0,1fr));
          }
        }
        .pre-select {
          padding: 2.5rem;
        }
        .pre-select-option {
          padding: 2.5rem;
          border: 1px solid #4591B8;
          text-align: center;
          cursor: pointer;
        }
        .pre-selected-option:hover {
          border: 2px solid #4591B8;
        }
        .more-page-settings {
          padding: 0.75rem;
          border: 2px solid grey;
        }
        .seperator {
          background-color: var(--secondary-background-color);
          width: 100%;
          height: 3px;
          margin-top: 15px;
          margin-bottom: 15px;
        }
        /*Start blueprint table*/
        /* Blueprint table responsive fix */
        table.min-w-full {
          width: 100%;
          table-layout: fixed;
        }
        table.min-w-full th,
        table.min-w-full td {
          overflow-wrap: anywhere;
          word-break: break-word;
          vertical-align: top;
        }
        table.min-w-full .px-6 {
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }
        table.min-w-full .whitespace-nowrap {
          white-space: normal;
        }
        table.min-w-full th:last-child,
        table.min-w-full td:last-child {
          width: 6.5rem;
          min-width: 6.5rem;
        }
        table.min-w-full td:last-child ha-button {
          display: block;
          margin: 0.125rem 0;
        }
        @media (max-width: 640px) {
          table.min-w-full .px-6 {
            padding-left: 0.25rem;
            padding-right: 0.25rem;
          }
          table.min-w-full .py-4 {
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
          }
          table.min-w-full th,
          table.min-w-full td {
            font-size: 0.75rem;
            line-height: 1rem;
          }
          table.min-w-full th:last-child,
          table.min-w-full td:last-child {
            width: 5.75rem;
            min-width: 5.75rem;
          }
        }
        .min-w-full {
          min-width: 100%;
        }
        table {
            text-indent: 0;
            border-color: inherit;
            border-collapse: collapse;
        }
        .bg-gray-50 {
          background-color: var(--secondary-background-color);
        }
        .tracking-wider {
            letter-spacing: .05em;
        }
        .text-sm {
          font-size: .875rem;
          line-height: 1.25rem;
        }
        .py-4 {
            padding-top: 1rem;
            padding-bottom: 1rem;
        }
        .uppercase {
            text-transform: uppercase;
        }
        .font-medium {
            font-weight: 500;
        }
        .text-xs {
            font-size: .75rem;
            line-height: 1rem;
        }
        .text-left {
            text-align: left;
        }
        .px-6 {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
        }
        .py-3 {
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
        }
        .card-footer-multiple {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          border-top: 1px solid var(--divider-color);
        }
        `]}static get properties(){return{mode:{},blueprints:{}}}setConfig(e){if(this._editorSessionInitialized)return this._configReady=!0,void this._startEditorIfReady();this._editorSessionInitialized=!0,this.mode=e.mode?e.mode:"pre-select",this.entity_id=e.entity_id,e.cardConfig?this.cardConfig=$e(e.cardConfig,this.entity_id):this.cardConfig="",this.existingCardEdit=!!e.existingCardEdit&&e.existingCardEdit,this._configReady=!0,this._startEditorIfReady()}connectedCallback(){super.connectedCallback(),this._connectedLoadOwner.connect(),this._startEditorIfReady()}disconnectedCallback(){super.disconnectedCallback(),this._connectedLoadOwner.disconnect()}_startEditorIfReady(){this._configReady&&this._hass&&this._connectedLoadOwner.ready()}async _loadEditor({isCurrent:e}){const t=this._hass,i=ve(t),s=await _e.read(t,{type:"dwains_dashboard/get_blueprints"});e()&&ve(this._hass)===i&&(this.blueprints=s)}_loadBlueprints(){return this._connectedLoadOwner.reload()}magicStuff(e){const t=structuredClone(e.detail.config),i=t.type;oe.SG.includes(i)?(t.entity||(t.entity=this.entity_id),this.cardConfig=t):this.cardConfig=t,this.mode="editor-element"}magicStuffSecond(e){}async _sendCard(){const e=this.renderRoot?.querySelector("dwains-card-config-editor"),t=await(e?.commitConfig?.()??e?.getConfig?.());t&&"object"==typeof t&&(this.cardConfig=t);try{await this.hass.callWS({type:"dwains_dashboard/edit_entity_popup",cardData:JSON.stringify(this.cardConfig),entityId:this.entity_id}),_e.invalidate(this.hass),(0,I.fs)()}catch(e){console.error("Message failed!",e)}}_switchMode(e){const t=e.currentTarget.mode;this.mode=t,this.requestUpdate()}_removeCard(){this.hass.callWS({type:"dwains_dashboard/remove_entity_popup",entityId:this.entity_id}).then(e=>{(0,I.fs)()},e=>{console.error("Message failed!",e)})}_handleDeleteBlueprintClicked(e){const t=e.currentTarget.blueprint;this.hass.callWS({type:"dwains_dashboard/delete_blueprint",blueprint:t}).then(e=>{_e.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()},e=>{console.error("Message failed!",e)})}_handleUseBlueprintClicked(e){const t=e.currentTarget.blueprint;this.mode="editor-element",this.name=this.blueprints.blueprints[t].blueprint.name,this.cardConfig={type:"custom:dwains-blueprint-card",blueprint:t,input_entity:this.entity_id,card:this.blueprints.blueprints[t].card}}_installBlueprintYamlChanged(e){this.installBlueprintYaml=e.target.value}_handleInstallBlueprintClicked(e){this.hass.callWS({type:"dwains_dashboard/install_blueprint",yamlCode:JSON.stringify(this.installBlueprintYaml)}).then(e=>{e.succesfull?(alert(this.hass.localize("ui.common.successfully_saved")),_e.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()):alert(e.error)},e=>{console.error("Message failed!",e)})}_checkCustomCard(e){const t=customElements.get(e);return p.qy`
        <div>
          ${t?p.qy`
            <ha-icon
              style="color: green;"
              .icon=${"mdi:check-bold"}
            ></ha-icon>`:p.qy`
            <ha-icon
              style="color: red;"
              .icon=${"mdi:close-thick"}
            ></ha-icon>
            `}
          ${e}
          ${t?p.qy`(${(0,u.A)(this.hass,"blueprint.installed")})`:p.qy`(${(0,u.A)(this.hass,"blueprint.not_installed")})`}
        </div>
      `}render(){if(null==this.blueprints||0===this.blueprints.length)return p.qy`Loading...`;if("pre-select"==this.mode)return p.qy`
          <ha-md-list>
            <ha-md-list-item type="button" .mode=${"hui-card-picker"} @click=${this._switchMode}>
              <span slot="headline">${(0,u.A)(this.hass,"editor.lovelace_card")}</span>
              <span slot="supporting-text">${(0,u.A)(this.hass,"editor.create_lovelace_card")}</span>
            </ha-md-list-item>
            <li divider role="separator"></li>
            <ha-md-list-item type="button" .mode=${"dwains-dashboard-blueprint-select"} @click=${this._switchMode}>
              <span slot="headline">${(0,u.A)(this.hass,"editor.dwains_dashboard_blueprint")}</span>
              <span slot="supporting-text">${(0,u.A)(this.hass,"editor.use_dwains_dashboard_blueprint")}</span>
              <ha-icon-next slot="end"></ha-icon-next>
            </ha-md-list-item>
          </ha-md-list>
        `;if("dwains-dashboard-blueprint-select"==this.mode){const e=Object.entries(this.blueprints.blueprints).sort(function(e,t){let i=e[1].blueprint.type,s=t[1].blueprint.type;return i==s?0:i>s?1:-1});return p.qy`
        <div class="edit-element">

          <div style="margin-bottom: 20px;">
            <ha-button .mode=${"pre-select"} @click=${this._switchMode}>< ${this.hass.localize("ui.common.previous")}</ha-button>
          </div>

          <strong>${(0,u.A)(this.hass,"blueprint.installed_blueprints")}:</strong>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"blueprint.title")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"global.version")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"blueprint.type")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this.hass,"blueprint.used_custom_cards")}</th>
                <th scope="col" class="relative px-6 py-3">
                </th>
              </tr>
            </thead>
            <tbody>
              ${0==Object.values(this.blueprints.blueprints).length?p.qy`
                <tr>
                  <td  class="px-6 py-4" colspan="5">${(0,u.A)(this.hass,"blueprint.no_blueprints_installed")}</td>
                </tr>`:p.qy`
                ${Object.entries(e).map(([e,t])=>p.qy`
                        <tr class="bg-white">
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <h3>${t[1].blueprint.name}</h3>
                            ${t[1].blueprint.description}
                          </td>
                          <td class="px-6 py-4">
                            ${t[1].blueprint.version}
                          </td>
                          <td class="px-6 py-4">
                            ${t[1].blueprint.type}
                          </td>
                          <td class="px-6 py-4">
                            ${t[1].blueprint.custom_cards&&0!==t[1].blueprint.custom_cards.length?p.qy`
                                ${t[1].blueprint.custom_cards.map(e=>this._checkCustomCard(e))}
                              `:"None"}
                          </td>
                          <td>
                            ${"card"==t[1].blueprint.type||"replace-card"==t[1].blueprint.type?p.qy`
                              <ha-button .blueprint=${t[0]} @click=${this._handleUseBlueprintClicked} unelevated>
                                ${(0,u.A)(this.hass,"blueprint.use")}
                              </ha-button>
                            `:""}
                            <ha-button .blueprint=${t[0]} @click=${this._handleDeleteBlueprintClicked} unelevated>
                              <ha-icon
                                .icon=${"mdi:delete"}
                              ></ha-icon>
                            </ha-button>
                          </td>
                        </tr>
                      `)}
                `}
            </tbody>
          </table>
          <div class="seperator"></div>
          <strong>${(0,u.A)(this.hass,"blueprint.install")}</strong>
          <p>${(0,u.A)(this.hass,"blueprint.instruction")}</p>
          <a href="https://github.com/dwainscheeren/dwains-dashboard-blueprints" target="_blank">Dwains Dashboard Blueprints Github</a>
          <ha-yaml-editor
            label=${(0,u.A)(this.hass,"blueprint.yaml_code")}
            name="description"
            @value-changed=${this._installBlueprintYamlChanged}
          ><ha-code-editor mode="yaml" autocomplete-entities="" autocomplete-icons="" dir="ltr"></ha-code-editor></ha-yaml-editor>
          <div style="margin-top: 15px; margin-bottom: 20px;">
            <ha-button @click=${this._handleInstallBlueprintClicked} unelevated>
              ${(0,u.A)(this.hass,"blueprint.install")}
            </ha-button>
          </div>
        </div>`}return"hui-card-picker"==this.mode?p.qy`
          <div class="edit-element">
            <h1 style="font-size: 17px; font-weight: bold;">${(0,u.A)(this.hass,"editor.select_popup_card_for")} ${this.entity_id}</h1>
            <dwains-card-picker
              @config-changed=${this.magicStuff}
              .hass=${this.hass}
              .lovelace=${{views:[]}}
              .entityId=${this.entity_id}
            ></dwains-card-picker>
            <div class="card-footer">
              <ha-button slot="secondaryAction" @click=${e=>(0,I.fs)()}>
                ${this.hass.localize("ui.common.cancel")}
              </ha-button>
            </div>
          </div>
        `:p.qy`
          <div class="edit-element">
            ${Ce(p.qy,u.A,this.hass,this.cardConfig,this.blueprints)}
            <dwains-card-config-editor
              @save-config=${this.magicStuffSecond}
              @config-changed=${this.magicStuff}
              .value=${this.cardConfig}
              .hass=${this.hass}
              .lovelace=${{views:[]}}
            ></dwains-card-config-editor>
            <dwains-card-preview
              .hass=${this.hass}
              .config=${this.cardConfig}
            ></dwains-card-preview>
            <div class="card-footer-multiple">
              ${this.existingCardEdit?p.qy`
                  <div>
                    <ha-button class="warning" @click=${this._removeCard}>${this.hass.localize("ui.common.remove")}</ha-button>
                    <ha-button class="warning" @click=${e=>this.mode="hui-card-picker"}}>${this.hass.localize("ui.common.previous")}</ha-button>
                  </div>
                `:p.qy`<div></div>`}
              <div>
                <ha-button slot="secondaryAction" @click=${e=>(0,I.fs)()}>
                  ${this.hass.localize("ui.common.cancel")}
                </ha-button>
                <ha-button slot="primaryAction" @click=${this._sendCard}>
                  ${this.hass.localize("ui.common.submit")}
                </ha-button>
              </div>
            </div>
          </div>
        `}}ke("dwains-edit-entity-popup-card",Se);var Ae=i(3475);const{websocketReadStore:Ee}=h(),{ConnectedLoadOwner:qe}=a(),{hassConnectionIdentity:Be,hasHassConnectionChanged:ze}=o(),{defineDwainsElement:Ie}=r(),{refreshLovelaceConfig:Le}=d(),{dispatchMorePageSaved:Oe}=i(6392);class Re extends p.WF{constructor(){super(),this._connectedLoadOwner=new qe(e=>this._loadEditor(e),{reportError:(e,t)=>console.error(e,t),errorMessage:"Failed to load more-page editor data"}),this._configReady=!1,this.blueprints={blueprints:{}},this._blueprintsLoading=!0}static get styles(){return[(0,T.F)(p.AH),p.AH`
        .edit-element {
          box-sizing: border-box;
          width: min(100%, 560px);
          max-width: 560px;
          padding: 20px;
          margin-right: auto;
          margin-left: auto;
          overflow: visible;
        }
        .edit-element ha-icon-picker,
        .edit-element ha-input,
        .edit-element ha-select,
        .edit-element ha-entity-picker {
          display: block;
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
          margin: .8rem 0;
        }
        .edit-element .dd-check {
        display: flex;
        align-items: center;
        gap: .6rem;
        margin: .9rem 0;
        padding-inline-start: .25rem;
        }
        h1, h2, h3, h4, h5, h6 {
        font-size: inherit;
        }
        blockquote, dd, dl, figure, h1, h2, h3, h4, h5, h6, hr, p, pre {
        margin: 0;
        }
        .add-button {
        font-size: 16px;
        border: 2px solid #4591B8;
        padding: 5px;
        margin-bottom: 50px;
        background: #459CEE;
        border-radius: 20px;
        color: white;
        }
        .card-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: .75rem;
        padding: 8px;
        border-top: 1px solid var(--divider-color);
        }
        .save-error {
          margin: 0.75rem 0;
          padding: 0.75rem;
          border-radius: 4px;
          color: var(--error-color);
          background: color-mix(in srgb, var(--error-color) 10%, transparent);
        }
        .grid {
        display: grid;
        gap: 2rem;
        }
        @media (min-width: 768px){
        .grid-cols-2 {
            grid-template-columns: repeat(2,minmax(0,1fr));
        }
        }
        .pre-select {
        padding: 2.5rem;
        }
        .pre-select-option {
        padding: 2.5rem;
        border: 1px solid #4591B8;
        text-align: center;
        cursor: pointer;
        }
        .pre-selected-option:hover {
        border: 2px solid #4591B8;
        }
        .more-page-settings {
          box-sizing: border-box;
          width: 100%;
          padding: 0.75rem;
          border: 2px solid grey;
          overflow: visible;
        }
        .more-page-name-field {
          box-sizing: border-box;
          width: 100%;
          margin: 0 0 0.9rem;
        }
        .more-page-name-label {
          display: block;
          margin: 0 0 0.25rem;
          color: var(--primary-color);
          font-size: 12px;
          line-height: 1.2;
        }
        .more-page-name-input {
          box-sizing: border-box;
          width: 100%;
          min-height: 56px;
          padding: 18px 12px 6px;
          border: 0;
          border-bottom: 1px solid var(--secondary-text-color);
          border-radius: 4px 4px 0 0;
          outline: none;
          color: var(--primary-text-color);
          background: var(--secondary-background-color);
          font-family: inherit;
          font-size: 16px;
        }
        .more-page-name-input:focus {
          border-bottom-color: var(--primary-color);
          box-shadow: inset 0 -1px 0 var(--primary-color);
        }
        .more-page-settings ha-input,
        .more-page-settings ha-icon-picker {
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
        }
        .more-page-settings-title {
          margin: 0 0 0.75rem;
          color: var(--primary-text-color);
          font-size: 0.95rem;
          font-weight: 600;
        }
        .edit-element dwains-card-picker,
        .edit-element dwains-card-config-editor,
        .edit-element dwains-card-preview,
        .edit-element ha-yaml-editor,
        .edit-element ha-code-editor {
          display: block;
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
          overflow: visible;
        }
        .seperator {
        background-color: var(--secondary-background-color);
        width: 100%;
        height: 3px;
        margin-top: 15px;
        margin-bottom: 15px;
        }
        /*Start blueprint table*/
        /* Blueprint table responsive fix */
        table.min-w-full {
          width: 100%;
          table-layout: fixed;
        }
        table.min-w-full th,
        table.min-w-full td {
          overflow-wrap: anywhere;
          word-break: break-word;
          vertical-align: top;
        }
        table.min-w-full .px-6 {
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }
        table.min-w-full .whitespace-nowrap {
          white-space: normal;
        }
        table.min-w-full th:last-child,
        table.min-w-full td:last-child {
          width: 6.5rem;
          min-width: 6.5rem;
        }
        table.min-w-full td:last-child ha-button {
          display: block;
          margin: 0.125rem 0;
        }
        @media (max-width: 640px) {
          table.min-w-full .px-6 {
            padding-left: 0.25rem;
            padding-right: 0.25rem;
          }
          table.min-w-full .py-4 {
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
          }
          table.min-w-full th,
          table.min-w-full td {
            font-size: 0.75rem;
            line-height: 1rem;
          }
          table.min-w-full th:last-child,
          table.min-w-full td:last-child {
            width: 5.75rem;
            min-width: 5.75rem;
          }
        }
        .min-w-full {
          min-width: 100%;
        }
        table {
            text-indent: 0;
            border-color: inherit;
            border-collapse: collapse;
        }
        .bg-gray-50 {
        background-color: var(--secondary-background-color);
        }
        .tracking-wider {
            letter-spacing: .05em;
        }
        .text-sm {
        font-size: .875rem;
        line-height: 1.25rem;
        }
        .py-4 {
            padding-top: 1rem;
            padding-bottom: 1rem;
        }
        .uppercase {
            text-transform: uppercase;
        }
        .font-medium {
            font-weight: 500;
        }
        .text-xs {
            font-size: .75rem;
            line-height: 1rem;
        }
        .text-left {
            text-align: left;
        }
        .px-6 {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
        }
        .py-3 {
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
        }
        `]}static get properties(){return{mode:{},blueprints:{},_hass:{},_saving:{state:!0},_saveError:{state:!0}}}set hass(e){const t=ze(this._hass,e);this._hass=e,t&&(this._connectedLoadOwner.disconnect(),this.isConnected&&this._connectedLoadOwner.connect()),this._startEditorIfReady()}setConfig(e){if(this._editorSessionInitialized)return this._configReady=!0,void this._startEditorIfReady();if(this._editorSessionInitialized=!0,this.mode=e.mode?e.mode:"pre-select",this.foldername=e.foldername?e.foldername:"",e.cardConfig){const t=structuredClone(e.cardConfig);delete t.input_entity,delete t.input_name,this.cardConfig=t}else this.cardConfig="";this.name=e.name?e.name:"",this._nameTouched=!!this.name,this._nameAutoGenerated=!1,this.icon=e.icon?e.icon:"",this.showInNavbar=!!e.showInNavbar&&e.showInNavbar,this._saving=!1,this._saveError=void 0,this._configReady=!0,this._startEditorIfReady()}connectedCallback(){super.connectedCallback(),this._connectedLoadOwner.connect(),this._startEditorIfReady()}disconnectedCallback(){super.disconnectedCallback(),this._connectedLoadOwner.disconnect()}_startEditorIfReady(){this._configReady&&this._hass&&this._connectedLoadOwner.ready()}async _loadEditor({isCurrent:e}){const t=this._hass,i=Be(t),s=await Ee.read(t,{type:"dwains_dashboard/get_blueprints"});e()&&Be(this._hass)===i&&(this.blueprints=s?.blueprints?s:{blueprints:{}},this._blueprintsLoading=!1)}_loadBlueprints(){return this._connectedLoadOwner.reload()}magicStuff(e){this.cardConfig=structuredClone(e.detail.config),this._applyDefaultMorePageName(),this.mode="editor-element"}magicStuffSecond(e){}async _sendCard(){if(this._saving)return;this._syncMorePageSettingsFromDom();const e=this.renderRoot?.querySelector("dwains-card-config-editor"),t=await(e?.commitConfig?.()??e?.getConfig?.());if(t&&"object"==typeof t&&(this.cardConfig=t),this._applyDefaultMorePageName(),!this.name)return void alert((0,u.A)(this._hass,"more.name_required"));if(this.showInNavbar&&!this.icon)return void alert((0,u.A)(this._hass,"more.icon_required"));if(!this.cardConfig||"object"!=typeof this.cardConfig)return void(this._saveError=new Error("No valid Lovelace card is configured."));const i=!this.foldername;this._saving=!0,this._saveError=void 0;try{const e=await this._hass.callWS({type:"dwains_dashboard/edit_more_page",card_data:JSON.stringify(this.cardConfig),foldername:this.foldername,name:this.name,icon:this.icon,showInNavbar:this.showInNavbar});if(!e?.foldername)throw new Error("The backend did not return the saved page name.");this.foldername=e.foldername,Ee.invalidate(this._hass);const t=e.view_path||`more_page_${e.foldername}`,s=e.page||{foldername:e.foldername,name:this.name,icon:this.icon,show_in_navbar:this.showInNavbar,card:structuredClone(this.cardConfig)};Oe(window,s),i?(await Le({viewPath:t}),(0,I.fs)(),(0,Ae.oo)(window,`/dwains-dashboard/${t}`)):(0,I.fs)()}catch(e){this._saveError=e,console.error("Failed to save and refresh more page:",e)}finally{this._saving=!1}}_switchMode(e){const t=e.currentTarget.mode;this.mode=t,this.requestUpdate()}_deriveDefaultMorePageName(e=this.cardConfig){if(!e||"object"!=typeof e)return"";const t=[e.title,e.name,e.heading,e.card&&e.card.title,e.card&&e.card.name].find(e=>"string"==typeof e&&e.trim());return t?t.trim():""}_applyDefaultMorePageName(){if(this._nameTouched&&!this._nameAutoGenerated)return;const e=this._deriveDefaultMorePageName();e&&e!==this.name&&(this.name=e,this._nameAutoGenerated=!0)}_syncMorePageSettingsFromDom(){const e=this.shadowRoot?.querySelector("#more-page-name");e&&(this.name=e.value.trim());const t=this.shadowRoot?.querySelector(".more-page-settings ha-icon-picker");t&&void 0!==t.value&&(this.icon=t.value);const i=this.shadowRoot?.querySelector(".more-page-settings ha-checkbox");i&&(this.showInNavbar=i.checked)}_iconPickerChange(e){this.icon=e.detail.value}_showInMainNavbarValueChanged(e){this.showInNavbar=e.target.checked}_nameChanged(e){this.name=e.target.value,this._nameTouched=!0,this._nameAutoGenerated=!1}async _removeMorePage(){if(!this._saving){this._saving=!0,this._saveError=void 0;try{await this._hass.callWS({type:"dwains_dashboard/remove_more_page",foldername:this.foldername}),Ee.invalidate(this._hass),await Le(),(0,I.fs)(),(0,Ae.oo)(window,"/dwains-dashboard/more_page")}catch(e){this._saveError=e,console.error("Failed to remove and refresh more page:",e)}finally{this._saving=!1}}}_handleDeleteBlueprintClicked(e){const t=e.currentTarget.blueprint;this._hass.callWS({type:"dwains_dashboard/delete_blueprint",blueprint:t}).then(e=>{Ee.invalidate(this._hass),this._loadBlueprints(),this.requestUpdate()},e=>{console.error("Message failed!",e)})}_handleUseBlueprintClicked(e){const t=e.currentTarget.blueprint;this.mode="editor-element",this.name=this.blueprints.blueprints[t].blueprint.name,this.cardConfig={type:"custom:dwains-blueprint-card",blueprint:t,card:this.blueprints.blueprints[t].card}}_installBlueprintYamlChanged(e){this.installBlueprintYaml=e.target.value}_handleInstallBlueprintClicked(e){this.installBlueprintYaml||alert((0,u.A)(this._hass,"blueprint.yaml_required")),this._hass.callWS({type:"dwains_dashboard/install_blueprint",yamlCode:JSON.stringify(this.installBlueprintYaml)}).then(e=>{e.succesfull?(alert(this._hass.localize("ui.common.successfully_saved")),Ee.invalidate(this._hass),this._loadBlueprints(),this.requestUpdate()):alert(e.error)},e=>{console.error("Message failed!",e)})}_checkCustomCard(e){const t=customElements.get(e);return p.qy`
        <div>
        ${t?p.qy`
            <ha-icon
            style="color: green;"
            .icon=${"mdi:check-bold"}
            ></ha-icon>`:p.qy`
            <ha-icon
            style="color: red;"
            .icon=${"mdi:close-thick"}
            ></ha-icon>
            `}
        ${e}
        ${t?p.qy`(${(0,u.A)(this._hass,"blueprint.installed")})`:p.qy`(${(0,u.A)(this._hass,"blueprint.not_installed")})`}
        </div>
    `}render(){if("pre-select"==this.mode)return p.qy`
        <ha-md-list>
            <ha-md-list-item type="button" .mode=${"hui-card-picker"} @click=${this._switchMode}>
              <span slot="headline">${(0,u.A)(this._hass,"editor.lovelace_card")}</span>
              <span slot="supporting-text">${(0,u.A)(this._hass,"editor.create_lovelace_card")}</span>
            </ha-md-list-item>
            <li divider role="separator"></li>
            <ha-md-list-item type="button" .mode=${"dwains-dashboard-blueprint-select"} @click=${this._switchMode}>
              <span slot="headline">${(0,u.A)(this._hass,"editor.dwains_dashboard_blueprint")}</span>
              <span slot="supporting-text">${(0,u.A)(this._hass,"editor.use_dwains_dashboard_blueprint")}</span>
              <ha-icon-next slot="end"></ha-icon-next>
            </ha-md-list-item>
        </ha-md-list>
        `;if("dwains-dashboard-blueprint-select"==this.mode){if(this._blueprintsLoading)return p.qy`<div class="edit-element"><ha-spinner></ha-spinner></div>`;const e=Object.entries(this.blueprints.blueprints).sort(function(e,t){let i=e[1].blueprint.type,s=t[1].blueprint.type;return i==s?0:i>s?1:-1});return p.qy`
        <div class="edit-element">

        <div style="margin-bottom: 20px;">
            <ha-button .mode=${"pre-select"} @click=${this._switchMode}>< ${this._hass.localize("ui.common.previous")}</ha-button>
        </div>

        <strong>${(0,u.A)(this._hass,"blueprint.installed_blueprints")}:</strong>
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this._hass,"blueprint.title")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this._hass,"global.version")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this._hass,"blueprint.type")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,u.A)(this._hass,"blueprint.used_custom_cards")}</th>
                <th scope="col" class="relative px-6 py-3">
                </th>
            </tr>
            </thead>
            <tbody>
            ${0==Object.values(this.blueprints.blueprints).length?p.qy`
                <tr>
                <td  class="px-6 py-4" colspan="5">${(0,u.A)(this._hass,"blueprint.no_blueprints_installed")}</td>
                </tr>`:p.qy`
                ${Object.entries(e).map(([e,t])=>p.qy`
                        <tr class="bg-white">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <h3>${t[1].blueprint.name}</h3>
                            ${t[1].blueprint.description}
                        </td>
                        <td class="px-6 py-4">
                            ${t[1].blueprint.version}
                        </td>
                        <td class="px-6 py-4">
                            ${t[1].blueprint.type}
                        </td>
                        <td class="px-6 py-4">
                            ${t[1].blueprint.custom_cards&&0!==t[1].blueprint.custom_cards.length?p.qy`
                                ${t[1].blueprint.custom_cards.map(e=>this._checkCustomCard(e))}
                            `:"None"}
                        </td>
                        <td>
                            ${"page"==t[1].blueprint.type?p.qy`
                            <ha-button .blueprint=${t[0]} @click=${this._handleUseBlueprintClicked} unelevated>
                                ${(0,u.A)(this._hass,"blueprint.use")}
                            </ha-button>
                            `:""}
                            <ha-button .blueprint=${t[0]} @click=${this._handleDeleteBlueprintClicked} unelevated>
                            <ha-icon
                                .icon=${"mdi:delete"}
                            ></ha-icon>
                            </ha-button>
                        </td>
                        </tr>
                    `)}
                `}
            </tbody>
        </table>
        <div class="seperator"></div>
        <strong>${(0,u.A)(this._hass,"blueprint.install")}</strong>
        <p>${(0,u.A)(this._hass,"blueprint.instruction")}</p>
        <a href="https://github.com/dwainscheeren/dwains-dashboard-blueprints" target="_blank">Dwains Dashboard Blueprints Github</a>
        <ha-yaml-editor
            label=${(0,u.A)(this._hass,"blueprint.yaml_code")}
            name="description"
            @value-changed=${this._installBlueprintYamlChanged}
        ><ha-code-editor mode="yaml" autocomplete-entities="" autocomplete-icons="" dir="ltr"></ha-code-editor></ha-yaml-editor>
        <div style="margin-top: 15px; margin-bottom: 20px;">
            <ha-button @click=${this._handleInstallBlueprintClicked} unelevated>
            ${(0,u.A)(this._hass,"blueprint.install")}
            </ha-button>
        </div>
        </div>`}return"hui-card-picker"==this.mode?p.qy`
        <div class="edit-element">
            <h1 style="font-size: 17px; font-weight: bold;">${(0,u.A)(this._hass,"editor.select_card_for")} ${this.name}</h1>
            <dwains-card-picker
            @config-changed=${this.magicStuff}
            .hass=${this._hass}
            .lovelace=${{views:[]}}
            ></dwains-card-picker>
        </div>
        `:"editor-element"==this.mode?p.qy`
        <div class="edit-element">
            <div class="more-page-settings-title">${(0,u.A)(this._hass,"more.edit")}</div>
            <div class="more-page-name-field">
            <label class="more-page-name-label" for="more-page-name">${(0,u.A)(this._hass,"more.name")}</label>
            <input
                id="more-page-name"
                class="more-page-name-input"
                type="text"
                .value=${this.name}
                placeholder=${(0,u.A)(this._hass,"more.name")}
                @input=${this._nameChanged}
            />
            </div>
            <div class="more-page-settings">
            <ha-icon-picker
                label=${(0,u.A)(this._hass,"more.icon")}
                .value=${this.icon}
                @value-changed=${this._iconPickerChange}
            ></ha-icon-picker>
            <label class="dd-check" @click=${T.H}>
              <ha-checkbox
                @change=${this._showInMainNavbarValueChanged}
                .checked=${this.showInNavbar}
                ></ha-checkbox>
              <span>${(0,u.A)(this._hass,"more.add_navbar")}</span>
            </label>
            </div>

            <dwains-card-config-editor
            @save-config=${this.magicStuffSecond}
            @config-changed=${this.magicStuff}
            .value=${this.cardConfig}
            .hass=${this._hass}
            .lovelace=${{views:[]}}
            ></dwains-card-config-editor>
            <dwains-card-preview
            .hass=${this._hass}
            .config=${this.cardConfig}
            ></dwains-card-preview>
            ${this._saveError?p.qy`<div class="save-error" role="alert">${this._saveError.message||this._saveError}</div>`:""}
            <div class="card-footer">
            ${this.foldername?p.qy`<ha-button @click=${this._removeMorePage}>${this._hass.localize("ui.common.remove")}</ha-button>`:""}
            <ha-button .disabled=${this._saving} @click=${this._sendCard}>
              ${this._saving?p.qy`<ha-spinner size="small"></ha-spinner>`:this._hass.localize("ui.common.submit")}
            </ha-button>
            </div>
        </div>
        `:void 0}}Ie("dwains-edit-more-page-card",Re)}}]);