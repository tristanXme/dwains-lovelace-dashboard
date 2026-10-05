"use strict";(self.webpackChunkdwains_dashboard=self.webpackChunkdwains_dashboard||[]).push([[723],{404(t,e,i){var a=i.cw(function(t,e){function i(t){return"string"==typeof t?t:t?.message||t?.code||String(t)}t.exports={installBlueprint:async function({hass:t,yamlCode:e,translate:a,notify:s=t=>window.alert(t),onInstalled:r=()=>{}}){if("string"!=typeof e||!e.trim())return s(a("blueprint.yaml_required")),!1;let n;try{n=await t.callWS({type:"dwains_dashboard/install_blueprint",yamlCode:e})}catch(t){return s(`${a("blueprint.install_failed")}: ${i(t)}`),!1}if(!n?.succesfull)return s(`${a("blueprint.install_failed")}: ${i(n?.error??"unknown error")}`),!1;s(t.localize("ui.common.successfully_saved"));try{await r(n.succesfull)}catch(t){console.error("Dwains Dashboard: failed to refresh after installing a blueprint",t)}return!0}}}),s=i.cw(function(t,e){function i(t){return"string"==typeof t?.blueprint&&t.blueprint.length>0}function a(t,e){if(!i(t))return;const a=t.blueprint,s=e?.blueprints?.[a],r=s?.blueprint||{};return{id:a,installed:Boolean(s),name:r.name||a,description:r.description||"",version:r.version??""}}t.exports={prepareEntityEditorCardConfig:function(t,e){if(!t||"object"!=typeof t)return"";const a=structuredClone(t);return i(a)?a.input_entity=e:(delete a.input_entity,delete a.input_name),a},renderBlueprintSelection:function(t,e,i,s,r){const n=a(s,r);if(!n)return"";const o="color:var(--secondary-text-color);font-size:.85rem";return t`
    <section style="box-sizing:border-box;margin-bottom:16px;padding:14px 16px;border:1px solid var(--divider-color);border-radius:var(--ha-card-border-radius,12px);background:var(--card-background-color)">
      <div style=${o}>${e(i,"blueprint.title")}</div>
      <strong style="display:block;margin:3px 0;color:var(--primary-text-color);font-size:1rem">${n.name}</strong>
      ${""!==n.version?t`
        <div style=${o}>${e(i,"global.version")}: ${n.version}</div>
      `:""}
      ${n.description?t`
        <div style="margin-top:6px;color:var(--primary-text-color)">${n.description}</div>
      `:""}
      ${n.installed?"":t`
        <div style=${o}>${e(i,"blueprint.not_installed")} (${n.id})</div>
      `}
    </section>
  `}}}),r=i.cw(function(t,e){t.exports={ConnectedLoadOwner:class{constructor(t,{reportError:e,errorMessage:i="Connected load failed"}={}){if("function"!=typeof t)throw new TypeError("ConnectedLoadOwner requires a load function");this._load=t,this._reportError=e,this._errorMessage=i,this._connected=!1,this._ready=!1,this._loaded=!1,this._pending=void 0,this._generation=0,this._abortController=void 0}connect(){return this._connected=!0,this._start()}ready(){return this._ready=!0,this._start()}reload(){return this._abortController?.abort("reload"),this._abortController=void 0,this._loaded=!1,this._pending=void 0,this._generation+=1,this._start()}disconnect(){this._abortController?.abort("disconnect"),this._abortController=void 0,this._connected=!1,this._loaded=!1,this._pending=void 0,this._generation+=1}_start(){if(!this._connected||!this._ready||this._loaded)return;if(this._pending)return this._pending;const t=++this._generation,e=new AbortController;this._abortController=e;const i=()=>this._connected&&t===this._generation,a=Promise.resolve().then(()=>this._load({isCurrent:i,signal:e.signal})).then(t=>(i()&&(this._loaded=!0),t),t=>{throw t}).finally(()=>{this._pending===a&&(this._pending=void 0),this._abortController===e&&(this._abortController=void 0)});return this._pending=a,"function"==typeof this._reportError&&a.catch(t=>this._reportError(this._errorMessage,t)),a}}}}),n=()=>i(1415),o=()=>i(9823),d=()=>i(9187),l=i.cw(function(t,e){const{fireEvent:a}=i(2330),{findLovelaceRoot:s}=c();function r(t,e){return t?.config?.views?.some(t=>t?.path===e)||!1}function n(t,e=setTimeout){return new Promise(i=>e(i,t))}t.exports={refreshLovelaceConfig:async function({documentObject:t=("undefined"!=typeof document?document:void 0),viewPath:e,timeout:i=1e4,interval:o=100,now:d=()=>Date.now(),setTimer:l,resolveRoot:c=s,dispatchRefresh:h=t=>a("config-refresh",{},t)}={}){const p=c(t);if(!p)throw new Error("The Lovelace root is not available");const u=p.lovelace?.config;h(p);const m=d()+i;do{const t=p.lovelace;if(t?.config!==u&&(!e||r(t,e)))return t;await n(o,l)}while(d()<m);throw new Error(e?`Lovelace did not load the new view "${e}" in time`:"Lovelace did not refresh its configuration in time")}}}),c=()=>i(7921),h=i.cw(function(t,e){t.exports={readSelectEvent:function(t){const e=t?.currentTarget||t?.target,i=e?.name||e?.dataset?.field||e?.type;let a=t?.detail?.value;if(void 0===a&&void 0!==t?.detail?.index){const i=t.detail.index;a=e?.children?.[i]?.value??e?.items?.[i]?.value}return void 0===a&&t?.target!==e&&(a=t?.target?.value),a??=e?.value??e?.selectedValue,{field:i,value:a}}}}),p=()=>i(7069),u=i(6684),m=i(1621);const{loadCardHelpers:g}=i(393),{defineDwainsElement:b}=n(),y=Object.freeze({views:Object.freeze([])}),f=new Set(["button","entity","gauge","light","media-control","picture-entity","sensor","thermostat","weather-forecast","custom:button-card","custom:mushroom-cover-card","custom:mushroom-entity-card","custom:mushroom-fan-card","custom:mushroom-light-card"]),_=new Set(["calendar","history-graph"]);function w(t){return!t||Array.isArray(t.views)&&0===t.views.length?y:t}const v=Object.freeze([["alarm-panel","Alarm panel"],["area","Area"],["button","Button"],["calendar","Calendar"],["conditional","Conditional"],["entities","Entities"],["entity","Entity"],["entity-filter","Entity filter"],["gauge","Gauge"],["glance","Glance"],["grid","Grid"],["heading","Heading"],["history-graph","History graph"],["horizontal-stack","Horizontal stack"],["humidifier","Humidifier"],["iframe","Web page"],["light","Light"],["logbook","Logbook"],["map","Map"],["markdown","Markdown"],["media-control","Media control"],["picture","Picture"],["picture-elements","Picture elements"],["picture-entity","Picture entity"],["plant-status","Plant status"],["sensor","Sensor"],["shopping-list","Shopping list"],["statistic","Statistic"],["statistics-graph","Statistics graph"],["thermostat","Thermostat"],["tile","Tile"],["todo-list","To-do list"],["vertical-stack","Vertical stack"],["weather-forecast","Weather forecast"]]);function x(t,e){t.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}function $(t){return t&&"object"==typeof t?structuredClone(t):t}function C(t){return JSON.stringify(t)}function k(t=window){const e=Array.isArray(t.customCards)?t.customCards:[],i=new Set;return e.map(t=>{const e="string"==typeof t?.type?t.type.trim():"";if(!e)return;const a=e.startsWith("custom:")?e:`custom:${e}`;return i.has(a)?void 0:(i.add(a),[a,t.name||e])}).filter(Boolean).sort((t,e)=>t[1].localeCompare(e[1]))}function A(t,e,i=customElements){const a=i?.get?.(function(t){return t.startsWith("custom:")?t.slice(7):`hui-${t}-card`}(t));return a||e?.constructor}function S(t,e,i){if(!t||"object"!=typeof t||!i)return t;const a=$(t);return f.has(e)||e.startsWith("custom:")&&Object.hasOwn(a,"entity")?a.entity=i:_.has(e)&&(a.entities=[i]),a}function E(t,e){const i=Object.keys(t?.states||{})[0],a=(e,i)=>function(t,e,i=()=>!0){const a=new Set(Array.isArray(e)?e:[e]);return Object.entries(t?.states||{}).find(([t,e])=>a.has(t.split(".",1)[0])&&i(e))?.[0]}(t,e,i),s=t=>t&&Number.isFinite(Number.parseFloat(t.state)),r={type:"button",name:"Button"},n={"alarm-panel":()=>{const t=a("alarm_control_panel");return t&&{type:e,entity:t}},button:()=>r,calendar:()=>{const t=a("calendar");return t&&{type:e,entities:[t]}},entities:()=>i&&{type:e,entities:[i]},entity:()=>i&&{type:e,entity:i},"entity-filter":()=>i&&{type:e,entities:[i],state_filter:["on"]},gauge:()=>{const t=a(["sensor","number","input_number"],s);return t&&{type:e,entity:t}},glance:()=>i&&{type:e,entities:[i]},grid:()=>({type:e,cards:[r]}),heading:()=>({type:e,heading:"Heading"}),"history-graph":()=>i&&{type:e,entities:[i]},"horizontal-stack":()=>({type:e,cards:[r]}),humidifier:()=>{const t=a("humidifier");return t&&{type:e,entity:t}},light:()=>{const t=a("light");return t&&{type:e,entity:t}},logbook:()=>i&&{type:e,entities:[i]},map:()=>{const t=a(["device_tracker","person"]);return t&&{type:e,entities:[t]}},markdown:()=>({type:e,content:"**Markdown**"}),"media-control":()=>{const t=a("media_player");return t&&{type:e,entity:t}},"picture-entity":()=>i&&{type:e,entity:i},"plant-status":()=>{const t=a("plant");return t&&{type:e,entity:t}},sensor:()=>{const t=a("sensor");return t&&{type:e,entity:t}},statistic:()=>{const t=a("sensor",s);return t&&{type:e,entity:t}},"statistics-graph":()=>{const t=a("sensor",s);return t&&{type:e,entities:[t]}},thermostat:()=>{const t=a("climate");return t&&{type:e,entity:t}},tile:()=>i&&{type:e,entity:i},"todo-list":()=>{const t=a("todo");return t&&{type:e,entity:t}},"vertical-stack":()=>({type:e,cards:[r]}),"weather-forecast":()=>{const t=a("weather");return t&&{type:e,entity:t}}};return n[e]?.()}async function q(t,e,i){const a={type:e},s=await g();let r;try{r=await s.createCardElement($(a))}catch(t){console.warn(`Unable to instantiate ${e} while loading its defaults`,t)}const n=A(e,r),o=n?.getStubConfig;if("function"!=typeof o)return S(a,e,i);try{const s=Object.keys(t?.states||{}),r=i&&s.includes(i)?[i,...s.filter(t=>t!==i)]:s,d=await o.call(n,t,r,[]);return S(d&&"object"==typeof d?{type:e,...d}:a,e,i)}catch(t){return console.warn(`Unable to create a default configuration for ${e}`,t),S(a,e,i)}}class B extends u.WF{static properties={hass:{attribute:!1},lovelace:{attribute:!1},entityId:{attribute:!1},_filter:{state:!0},_manualType:{state:!0},_selecting:{state:!0},_error:{state:!0}};constructor(){super(),this._filter="",this._manualType="",this._selecting=!1,this._previewGeneration=0,this._previewConfigs=new Map,this._selectionConfigs=new Map,this._previewObserver=void 0,this._pointerStart=void 0,this._pointerMoved=!1}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this._previewGeneration+=1,this._previewObserver?.disconnect(),this._previewObserver=void 0}shouldUpdate(t){if(1!==t.size||!t.has("hass"))return!0;const e=t.get("hass");if(!e)return!0;const i=t=>t?.selectedLanguage||t?.language||t?.locale?.language;return i(e)!==i(this.hass)||(this.renderRoot?.querySelectorAll?.("[data-card-preview] > *").forEach(t=>{"hass"in t&&(t.hass=this.hass)}),!1)}firstUpdated(){this._observePreviews()}updated(t){(t.has("_filter")||t.has("hass"))&&this._observePreviews()}_localizedCardName(t,e){return t.startsWith("custom:")?e:this.hass?.localize?.(`ui.panel.lovelace.editor.card.${t}.name`)||e}_localizedCardDescription(t){if(t.startsWith("custom:")){const e=t.slice(7),i=(window.customCards||[]).find(i=>i?.type===e||i?.type===t);return i?.description||t}return this.hass?.localize?.(`ui.panel.lovelace.editor.card.${t}.description`)||t}_observePreviews(){this._previewObserver?.disconnect();const t=this.renderRoot?.querySelectorAll?.("[data-card-preview]");if(!t?.length)return;const e=t=>{const e=t.dataset.cardPreview;e&&this._loadPreview(e,t)};"function"==typeof IntersectionObserver?(this._previewObserver=new IntersectionObserver((t,i)=>{for(const a of t)a.isIntersecting&&(i.unobserve(a.target),e(a.target))},{rootMargin:"160px"}),t.forEach(t=>this._previewObserver.observe(t))):t.forEach(e)}_showPreviewDescription(t,e){const i=document.createElement("span");i.className="preview-description",i.textContent=this._localizedCardDescription(t),e.replaceChildren(i)}async _loadPreview(t,e){if("true"===e.dataset.previewLoading)return;e.dataset.previewLoading="true";const i=this._previewGeneration;try{const a=t.startsWith("custom:")?(window.customCards||[]).find(e=>e?.type===t||e?.type===t.slice(7)):void 0,s=this._previewConfigs.get(t)||(a?.preview?await q(this.hass,t):E(this.hass,t));if(!s)return void(this.isConnected&&e.isConnected&&this._showPreviewDescription(t,e));this._previewConfigs.set(t,s);const r=await g(),n=await r.createCardElement($(s));if("HUI-ERROR-CARD"===n?.tagName)throw new Error(`Home Assistant rejected the preview for ${t}`);if(!this.isConnected||i!==this._previewGeneration||!e.isConnected)return;n.hass=this.hass,n.tabIndex=-1,e.replaceChildren(n)}catch(a){if(!this.isConnected||i!==this._previewGeneration||!e.isConnected)return;this._showPreviewDescription(t,e),console.warn(`Unable to preview Lovelace card ${t}`,a)}}_cards(){return[...v,...k()]}async _selectType(t){if(!this._selecting&&t){this._selecting=!0,this._error=void 0;try{const e=`${this.entityId||""}\0${t}`,i=this._selectionConfigs.get(e)||await q(this.hass,t,this.entityId);this._selectionConfigs.set(e,i),x(this,i)}catch(e){this._error=e instanceof Error?e.message:String(e),console.error(`Unable to select Lovelace card ${t}`,e)}finally{this._selecting=!1}}}_cardClicked(t){if(!this._selecting)return this._pointerMoved?(t.preventDefault(),t.stopPropagation(),void(this._pointerMoved=!1)):void this._selectType(t.currentTarget.dataset.type)}_cardKeyDown(t){"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._cardClicked(t))}_cardPointerDown(t){this._pointerStart={x:t.clientX,y:t.clientY},this._pointerMoved=!1}_cardPointerMove(t){if(!this._pointerStart||this._pointerMoved)return;const e=Math.abs(t.clientX-this._pointerStart.x),i=Math.abs(t.clientY-this._pointerStart.y);(e>8||i>8)&&(this._pointerMoved=!0)}_cardPointerCancel(){this._pointerStart=void 0,this._pointerMoved=!1}_stopPreviewEvent(t){t.stopPropagation()}_manualSubmit(){let t=this._manualType.trim();t&&!t.includes(":")&&(t=`custom:${t}`),this._selectType(t)}render(){const t=this._filter.trim().toLowerCase(),e=this._cards().map(([t,e])=>({type:t,name:this._localizedCardName(t,e)})).filter(({type:e,name:i})=>!t||e.toLowerCase().includes(t)||i.toLowerCase().includes(t));return u.qy`
      <div class="controls">
        <input
          type="search"
          placeholder="${this.hass?.localize?.("ui.common.search")||"Search"}"
          .value=${this._filter}
          @input=${t=>{this._filter=t.target.value}}
        />
      </div>
      <div class="cards">
        ${e.map(({type:t,name:e})=>u.qy`
          <div
            class="card-option"
            data-type=${t}
            role="button"
            tabindex="0"
            aria-disabled=${this._selecting?"true":"false"}
            @pointerdown=${this._cardPointerDown}
            @pointermove=${this._cardPointerMove}
            @pointercancel=${this._cardPointerCancel}
            @click=${this._cardClicked}
            @keydown=${this._cardKeyDown}
          >
            <strong>${e}</strong>
            <div
              class="preview"
              data-card-preview=${t}
              @config-changed=${this._stopPreviewEvent}
            >
              <ha-spinner></ha-spinner>
            </div>
            <small>${t}</small>
          </div>
        `)}
      </div>
      <div class="manual">
        <input
          placeholder="custom:my-card"
          .value=${this._manualType}
          @input=${t=>{this._manualType=t.target.value}}
          @keydown=${t=>{"Enter"===t.key&&this._manualSubmit()}}
        />
        <ha-button @click=${this._manualSubmit} ?disabled=${this._selecting||!this._manualType.trim()}>
          ${this.hass?.localize?.("ui.common.add")||"Add"}
        </ha-button>
      </div>
      ${this._selecting?u.qy`<p class="status">${(0,m.A)(this.hass,"editor.loading_card_editor")}</p>`:""}
      ${this._error?u.qy`<p class="error">${this._error}</p>`:""}
    `}static styles=u.AH`
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
  `}class I extends u.WF{static properties={hass:{attribute:!1},lovelace:{attribute:!1},value:{attribute:!1},_fallbackText:{state:!0},_error:{state:!0},_loading:{state:!0}};constructor(){super(),this._generation=0,this._loading=!1,this._editor=void 0,this._loadedType=void 0,this._lastEmittedSignature=void 0,this._currentValue=void 0,this._currentSignature=void 0}disconnectedCallback(){super.disconnectedCallback(),this._generation+=1,this._editor=void 0,this._loadedType=void 0}updated(t){if(t.has("hass")&&this._editor&&(this._editor.hass=this.hass),t.has("lovelace")&&this._editor){const t=w(this.lovelace);this._editor.lovelace!==t&&(this._editor.lovelace=t)}if(!t.has("value"))return;const e=$(this.value),i=C(e);i!==this._lastEmittedSignature&&i!==this._currentSignature?(this._currentValue=e,this._currentSignature=i,this._editor&&this._loadedType===this.value?.type?this._editor.setConfig($(e)):this._loadEditor()):this._lastEmittedSignature=void 0}async _loadEditor(){if(!this.isConnected||!this.hass||!this.value?.type)return;const t=++this._generation;this._loading=!0,this._error=void 0,this._fallbackText=void 0;try{const e=await g();let i,a;try{i=await e.createCardElement($(this.value))}catch(t){a=t}const s=A(this.value.type,i);if(!s&&a)throw a;const r=s?.getConfigElement,n="function"==typeof r?await r.call(s):void 0;if(!this.isConnected||t!==this._generation)return;if(!n||"function"!=typeof n.setConfig)return void(this._fallbackText=JSON.stringify(this.value,null,2));if(await this.updateComplete,!this.isConnected||t!==this._generation)return;n.hass=this.hass,n.lovelace=w(this.lovelace),n.setConfig($(this.value)),n.addEventListener("config-changed",t=>{if(t.stopPropagation(),t.detail?.config){const e=$(t.detail.config),i=C(e);this._currentValue=e,this._currentSignature=i,this._lastEmittedSignature=i,x(this,$(e))}}),this.renderRoot.querySelector("#editor")?.replaceChildren(n),this._editor=n,this._loadedType=this.value.type}catch(e){if(!this.isConnected||t!==this._generation)return;this._error=e instanceof Error?e.message:String(e),this._fallbackText=JSON.stringify(this.value,null,2),console.error(`Unable to load the editor for ${this.value.type}`,e)}finally{t===this._generation&&(this._loading=!1)}}_fallbackChanged(t){this._fallbackText=t.target.value;try{const t=JSON.parse(this._fallbackText);this._error=void 0,this._currentValue=$(t),this._currentSignature=C(t),this._lastEmittedSignature=this._currentSignature,x(this,$(t))}catch(t){this._error=t instanceof Error?t.message:String(t)}}getConfig(){const t=this._currentValue??this.value;return t&&"object"==typeof t?structuredClone(t):t}async commitConfig(){return function(t){let e=t?.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e}(this.renderRoot)?.blur?.(),await Promise.resolve(),this._editor?.updateComplete&&await this._editor.updateComplete,await Promise.resolve(),await this.updateComplete,this.getConfig()}render(){return u.qy`
      <div id="editor"></div>
      ${this._loading?u.qy`<p class="status">${(0,m.A)(this.hass,"editor.loading_card_editor")}</p>`:""}
      ${void 0!==this._fallbackText?u.qy`
        <p>${(0,m.A)(this.hass,"editor.no_visual_editor")}</p>
        <textarea .value=${this._fallbackText} @input=${this._fallbackChanged}></textarea>
      `:""}
      ${this._error?u.qy`<p class="error">${this._error}</p>`:""}
    `}static styles=u.AH`
    :host, #editor { display: block; width: 100%; }
    textarea {
      box-sizing: border-box; width: 100%; min-height: 220px; padding: 12px;
      border: 1px solid var(--divider-color); border-radius: 8px;
      color: var(--primary-text-color); background: var(--card-background-color);
      font: 13px/1.45 monospace; resize: vertical;
    }
    .status { color: var(--secondary-text-color); }
    .error { color: var(--error-color); overflow-wrap: anywhere; }
  `}class z extends u.WF{static properties={hass:{attribute:!1},config:{attribute:!1},_error:{state:!0}};constructor(){super(),this._generation=0,this._card=void 0,this._loadedType=void 0}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this._generation+=1,this._card=void 0,this._loadedType=void 0}updated(t){t.has("hass")&&this._card&&(this._card.hass=this.hass),(t.has("config")||t.has("hass")&&!this._card)&&this._loadPreview()}async _loadPreview(){if(!this.isConnected||!this.hass||!this.config?.type)return;const t=++this._generation;if(this._error=void 0,this._card&&this._loadedType===this.config.type&&"function"==typeof this._card.setConfig)try{if(await this._card.setConfig($(this.config)),!this.isConnected||t!==this._generation)return;return void(this._card.hass=this.hass)}catch(t){console.warn(`Unable to update preview ${this.config.type} in place`,t)}try{const e=await g(),i=await e.createCardElement($(this.config));if(!this.isConnected||t!==this._generation)return;if(await this.updateComplete,!this.isConnected||t!==this._generation)return;i.hass=this.hass,this.renderRoot.querySelector("#preview")?.replaceChildren(i),this._card=i,this._loadedType=this.config.type}catch(e){if(!this.isConnected||t!==this._generation)return;this._error=e instanceof Error?e.message:String(e),console.error(`Unable to preview ${this.config.type}`,e)}}render(){return u.qy`<div id="preview"></div>${this._error?u.qy`<p>${this._error}</p>`:""}`}static styles=u.AH`
    :host { display: block; width: 100%; margin-top: 16px; }
    p { color: var(--error-color); overflow-wrap: anywhere; }
  `}b("dwains-card-picker",B),b("dwains-card-config-editor",I),b("dwains-card-preview",z);var L=i(4169);const{readSelectEvent:O}=h(),{websocketReadStore:R}=p(),{installBlueprint:P}=a(),{ConnectedLoadOwner:M}=r(),{hassConnectionIdentity:D,hasHassConnectionChanged:N}=d(),{defineDwainsElement:T}=n();class j extends u.WF{constructor(){super(),this._connectedLoadOwner=new M(t=>this._loadEditor(t),{reportError:(t,e)=>console.error(t,e),errorMessage:"Failed to load custom-card editor data"}),this._configReady=!1}set hass(t){const e=N(this._hass,t);this._hass=t,e&&(this._connectedLoadOwner.disconnect(),this.isConnected&&this._connectedLoadOwner.connect()),this._startEditorIfReady()}get hass(){return this._hass}static get styles(){return[u.AH`
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
        `]}static get properties(){return{mode:{},blueprints:{}}}setConfig(t){if(this._editorSessionInitialized)return this._configReady=!0,void this._startEditorIfReady();if(this._editorSessionInitialized=!0,this.mode=t.mode?t.mode:"pre-select",this.area_id=t.area?t.area:"",this.domain=t.domain?t.domain:"",this.position=t.position,this.page=t.page,t.cardConfig){const e=structuredClone(t.cardConfig);delete e.input_entity,delete e.input_name,this.cardConfig=e}else this.cardConfig="";this.filename=t.filename?t.filename.replace(".yaml",""):"",this.name=t.name?t.name:"Dwains Dashboard",this.rowSpan=t.rowSpan?t.rowSpan:"1",this.colSpan=t.colSpan?t.colSpan:"1",this.rowSpanLg=t.rowSpanLg?t.rowSpanLg:"1",this.colSpanLg=t.colSpanLg?t.colSpanLg:"1",this.rowSpanXl=t.rowSpanXl?t.rowSpanXl:"1",this.colSpanXl=t.colSpanXl?t.colSpanXl:"1",this._configReady=!0,this._startEditorIfReady()}connectedCallback(){super.connectedCallback(),this._connectedLoadOwner.connect(),this._startEditorIfReady()}disconnectedCallback(){super.disconnectedCallback(),this._connectedLoadOwner.disconnect()}_startEditorIfReady(){this._configReady&&this._hass&&this._connectedLoadOwner.ready()}async _loadEditor({isCurrent:t}){const e=this._hass,i=D(e),a=await R.read(e,{type:"dwains_dashboard/get_blueprints"});t()&&D(this._hass)===i&&(this.blueprints=a)}_loadBlueprints(){return this._connectedLoadOwner.reload()}magicStuff(t){this.cardConfig=structuredClone(t.detail.config),this.mode="editor-element"}magicStuffSecond(t){}async _sendCard(){const t=this.renderRoot?.querySelector("dwains-card-config-editor"),e=await(t?.commitConfig?.()??t?.getConfig?.());e&&"object"==typeof e&&(this.cardConfig=e),this.shadowRoot?.querySelectorAll("ha-select").forEach(t=>{const e=t.name||t.type;e&&void 0!==t.value&&(this[e]=`${t.value}`)});const i=JSON.stringify(this.cardConfig);this.hass.callWS({type:"dwains_dashboard/add_card",card_data:i,area_id:this.area_id,domain:this.domain,position:this.position,filename:this.filename,page:this.page,rowSpan:this.rowSpan,colSpan:this.colSpan,rowSpanLg:this.rowSpanLg,colSpanLg:this.colSpanLg,rowSpanXl:this.rowSpanXl,colSpanXl:this.colSpanXl}).then(t=>{(0,L.fs)()},t=>{console.error("Message failed!",t)})}_removeCard(){this.hass.callWS({type:"dwains_dashboard/remove_card",area_id:this.area_id,domain:this.domain,filename:this.filename,page:this.page}).then(t=>{(0,L.fs)()},t=>{console.error("Message failed!",t)})}_switchMode(t){const e=t.currentTarget.mode;this.mode=e,this.requestUpdate()}_handleDeleteBlueprintClicked(t){const e=t.currentTarget.blueprint;this.hass.callWS({type:"dwains_dashboard/delete_blueprint",blueprint:e}).then(t=>{R.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()},t=>{console.error("Message failed!",t)})}_handleUseBlueprintClicked(t){const e=t.currentTarget.blueprint;this.mode="editor-element",this.name=this.blueprints.blueprints[e].blueprint.name,this.cardConfig={type:"custom:dwains-blueprint-card",blueprint:e,card:this.blueprints.blueprints[e].card}}_installBlueprintYamlChanged(t){this.installBlueprintYaml=t.target.value}_handleInstallBlueprintClicked(t){P({hass:this.hass,yamlCode:this.installBlueprintYaml,translate:t=>(0,m.A)(this.hass,t),onInstalled:()=>{R.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()}})}_haSelectChanged(t){t.stopPropagation();const{field:e,value:i}=O(t);e&&void 0!==i&&(this[e]=`${i}`,this.requestUpdate())}_stopPropagation(t){t.stopPropagation()}_checkCustomCard(t){const e=customElements.get(t);return u.qy`
        <div>
          ${e?u.qy`
            <ha-icon
              style="color: green;"
              .icon=${"mdi:check-bold"}
            ></ha-icon>`:u.qy`
            <ha-icon
              style="color: red;"
              .icon=${"mdi:close-thick"}
            ></ha-icon>
            `}
          ${t}
          ${e?u.qy`(${(0,m.A)(this.hass,"blueprint.installed")})`:u.qy`(${(0,m.A)(this.hass,"blueprint.not_installed")})`}
        </div>
      `}render(){if(null==this.blueprints||0===this.blueprints.length)return u.qy`Loading...`;if("pre-select"==this.mode)return u.qy`
          <ha-md-list>
            <ha-md-list-item type="button" .mode=${"hui-card-picker"} @click=${this._switchMode}>
              <span slot="headline">${(0,m.A)(this.hass,"editor.lovelace_card")}</span>
              <span slot="supporting-text">${(0,m.A)(this.hass,"editor.create_lovelace_card")}</span>
            </ha-md-list-item>
            <li divider role="separator"></li>
            <ha-md-list-item type="button" .mode=${"dwains-dashboard-blueprint-select"} @click=${this._switchMode}>
              <span slot="headline">${(0,m.A)(this.hass,"editor.dwains_dashboard_blueprint")}</span>
              <span slot="supporting-text">${(0,m.A)(this.hass,"editor.use_dwains_dashboard_blueprint")}</span>
              <ha-icon-next slot="end"></ha-icon-next>
            </ha-md-list-item>
          </ha-md-list>
        `;if("dwains-dashboard-blueprint-select"==this.mode){const t=Object.entries(this.blueprints.blueprints).sort(function(t,e){let i=t[1].blueprint.type,a=e[1].blueprint.type;return i==a?0:i>a?1:-1});return u.qy`
        <div class="edit-element">

          <div style="margin-bottom: 20px;">
            <ha-button .mode=${"pre-select"} @click=${this._switchMode}>< ${this.hass.localize("ui.common.previous")}</ha-button>
          </div>

          <strong>${(0,m.A)(this.hass,"blueprint.installed_blueprints")}:</strong>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"blueprint.title")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"global.version")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"blueprint.type")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"blueprint.used_custom_cards")}</th>
                <th scope="col" class="relative px-6 py-3">
                </th>
              </tr>
            </thead>
            <tbody>
              ${0==Object.values(t).length?u.qy`
                <tr>
                  <td  class="px-6 py-4" colspan="5">${(0,m.A)(this.hass,"blueprint.no_blueprints_installed")}</td>
                </tr>`:u.qy`
                ${Object.entries(t).map(([t,e])=>u.qy`
                        <tr class="bg-white">
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <h3>${e[1].blueprint.name}</h3>
                            ${e[1].blueprint.description}
                          </td>
                          <td class="px-6 py-4">
                            ${e[1].blueprint.version}
                          </td>
                          <td class="px-6 py-4">
                            ${e[1].blueprint.type}
                          </td>
                          <td class="px-6 py-4">
                            ${e[1].blueprint.custom_cards&&0!==e[1].blueprint.custom_cards.length?u.qy`
                                ${e[1].blueprint.custom_cards.map(t=>this._checkCustomCard(t))}
                              `:"None"}
                          </td>
                          <td>
                            ${"card"==e[1].blueprint.type?u.qy`
                              <ha-button .blueprint=${e[0]} @click=${this._handleUseBlueprintClicked} unelevated>
                                ${(0,m.A)(this.hass,"blueprint.use")}
                              </ha-button>
                            `:""}
                            <ha-button .blueprint=${e[0]} @click=${this._handleDeleteBlueprintClicked} unelevated>
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
          <strong>${(0,m.A)(this.hass,"blueprint.install")}</strong>
          <p>${(0,m.A)(this.hass,"blueprint.instruction")}</p>
          <a href="https://github.com/dwainscheeren/dwains-dashboard-blueprints" target="_blank">Dwains Dashboard Blueprints Github</a>
          <ha-yaml-editor
            label=${(0,m.A)(this.hass,"blueprint.yaml_code")}
            name="description"
            @value-changed=${this._installBlueprintYamlChanged}
          ><ha-code-editor mode="yaml" autocomplete-entities="" autocomplete-icons="" dir="ltr"></ha-code-editor></ha-yaml-editor>
          <div style="margin-top: 15px; margin-bottom: 20px;">
            <ha-button @click=${this._handleInstallBlueprintClicked} unelevated>
              ${(0,m.A)(this.hass,"blueprint.install")}
            </ha-button>
          </div>
        </div>`}return"hui-card-picker"==this.mode?u.qy`
          <div class="edit-element">
            <h1 style="font-size: 17px; font-weight: bold;">${(0,m.A)(this.hass,"editor.select_card_for")} ${this.name}</h1>
            <dwains-card-picker
              @config-changed=${this.magicStuff}
              .hass=${this.hass}
              .lovelace=${{views:[]}}
            ></dwains-card-picker>
            <div class="card-footer">
              <ha-button slot="secondaryAction" @click=${t=>(0,L.fs)()}>
                ${this.hass.localize("ui.common.cancel")}
              </ha-button>
            </div>
          </div>
        `:"editor-element"==this.mode?u.qy`
          <div class="edit-element">
            <div class="card-dd-settings">

            <h2>${(0,m.A)(this.hass,"editor.default_col_row")}</h2>
            <div class="grid-2">
              <ha-select
                label=${(0,m.A)(this.hass,"editor.row_span")}
                .value=${this.rowSpan}
                .type=${"rowSpan"}
                name="rowSpan"
                @selected=${this._haSelectChanged}
                @closed=${this._stopPropagation}
              >
                <ha-dropdown-item value="1">1 ${(0,m.A)(this.hass,"editor.row")}</ha-dropdown-item>
                <ha-dropdown-item value="2">2 ${(0,m.A)(this.hass,"editor.rows")}</ha-dropdown-item>
              </ha-select>
              <ha-select
                label=${(0,m.A)(this.hass,"editor.col_span")}
                .value=${this.colSpan}
                .type=${"colSpan"}
                name="colSpan"
                @selected=${this._haSelectChanged}
                @closed=${this._stopPropagation}
              >
                <ha-dropdown-item value="1">1 ${(0,m.A)(this.hass,"editor.column")}</ha-dropdown-item>
                <ha-dropdown-item value="2">2 ${(0,m.A)(this.hass,"editor.columns")}</ha-dropdown-item>
              </ha-select>
            </div>

            <h2>${(0,m.A)(this.hass,"editor.large_col_row")}</h2>
            <div class="grid-2">
              <ha-select
                label=${(0,m.A)(this.hass,"editor.row_span")}
                .value=${this.rowSpanLg}
                .type=${"rowSpanLg"}
                name="rowSpanLg"
                @selected=${this._haSelectChanged}
                @closed=${this._stopPropagation}
              >
                <ha-dropdown-item value="1">1 ${(0,m.A)(this.hass,"editor.row")}</ha-dropdown-item>
                <ha-dropdown-item value="2">2 ${(0,m.A)(this.hass,"editor.rows")}</ha-dropdown-item>
                <ha-dropdown-item value="3">3 ${(0,m.A)(this.hass,"editor.rows")}</ha-dropdown-item>
              </ha-select>
              <ha-select
                label=${(0,m.A)(this.hass,"editor.col_span")}
                .value=${this.colSpanLg}
                .type=${"colSpanLg"}
                name="colSpanLg"
                @selected=${this._haSelectChanged}
                @closed=${this._stopPropagation}
              >
                <ha-dropdown-item value="1">1 ${(0,m.A)(this.hass,"editor.column")}</ha-dropdown-item>
                <ha-dropdown-item value="2">2 ${(0,m.A)(this.hass,"editor.columns")}</ha-dropdown-item>
                <ha-dropdown-item value="3">3 ${(0,m.A)(this.hass,"editor.columns")}</ha-dropdown-item>
              </ha-select>
            </div>

            <h2>${(0,m.A)(this.hass,"editor.extra_large_col_row")}</h2>
            <div class="grid-2">
              <ha-select
                label=${(0,m.A)(this.hass,"editor.row_span")}
                .value=${this.rowSpanXl}
                .type=${"rowSpanXl"}
                name="rowSpanXl"
                @selected=${this._haSelectChanged}
                @closed=${this._stopPropagation}
              >
                <ha-dropdown-item value="1">1 ${(0,m.A)(this.hass,"editor.row")}</ha-dropdown-item>
                <ha-dropdown-item value="2">2 ${(0,m.A)(this.hass,"editor.rows")}</ha-dropdown-item>
                <ha-dropdown-item value="3">3 ${(0,m.A)(this.hass,"editor.rows")}</ha-dropdown-item>
                <ha-dropdown-item value="4">4 ${(0,m.A)(this.hass,"editor.rows")}</ha-dropdown-item>
              </ha-select>
              <ha-select
                label=${(0,m.A)(this.hass,"editor.col_span")}
                .value=${this.colSpanXl}
                .type=${"colSpanXl"}
                name="colSpanXl"
                @selected=${this._haSelectChanged}
                @closed=${this._stopPropagation}
              >
                <ha-dropdown-item value="1">1 ${(0,m.A)(this.hass,"editor.column")}</ha-dropdown-item>
                <ha-dropdown-item value="2">2 ${(0,m.A)(this.hass,"editor.columns")}</ha-dropdown-item>
                <ha-dropdown-item value="3">3 ${(0,m.A)(this.hass,"editor.columns")}</ha-dropdown-item>
                <ha-dropdown-item value="4">4 ${(0,m.A)(this.hass,"editor.columns")}</ha-dropdown-item>
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
              ${this.filename?u.qy`<ha-button @click=${this._removeCard}>${this.hass.localize("ui.common.remove")}</ha-button>`:""}
              <ha-button @click=${this._sendCard}>${this.hass.localize("ui.common.submit")}</ha-button>
            </div>
          </div>
        `:void 0}}T("dwains-create-custom-card-card",j);var H=i(5213);const{closeParentDropdown:U}=o(),{defineDwainsElement:W}=n(),{AREA_GRAPH_HOURS:F,normalizeGraphHours:X}=i(1495);class V extends u.WF{static get styles(){return[(0,H.F)(u.AH),u.AH`
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
        `]}setConfig(t){this.areaId=t.areaId,this.icon=t.icon?t.icon:"",this.disableArea=!!t.disableArea&&t.disableArea,this.hideIcon=!!t.hideIcon&&t.hideIcon,this.graphEntity=t.graphEntity||"",this.graphHours=X(t.graphHours),this.sensorEntities=Array.isArray(t.sensorEntities)?t.sensorEntities:[],this.binarySensorEntities=Array.isArray(t.binarySensorEntities)?t.binarySensorEntities:[]}connectedCallback(){super.connectedCallback()}_iconPickerChange(t){this.icon=t.detail.value}_disableValueChanged(t){this.disableArea=t.target.checked}_hideIconValueChanged(t){this.hideIcon=t.target.checked,this.requestUpdate()}_graphEntityChanged(t){this.graphEntity=t.detail.value||"",this.requestUpdate()}_graphHoursChanged(t){t.stopPropagation();const e=t.detail?.value;null!=e&&""!==e&&(this.graphHours=X(e),this.requestUpdate())}_graphEntityFilter(t){return Boolean(t.attributes&&t.attributes.unit_of_measurement)}_areaEntities(t){const e=this.hass?.entities||{},i=this.hass?.devices||{};return Object.values(e).filter(e=>e.entity_id.startsWith(`${t}.`)).filter(t=>(t.area_id||i[t.device_id]?.area_id)===this.areaId).map(t=>t.entity_id)}_entityListChanged(t,e){e.stopPropagation(),this[t]=Array.isArray(e.detail.value)?e.detail.value:[],this.requestUpdate()}_renderEntityList(t,e,i,a){const s=this._areaEntities(e),r=[...new Set([...s,...this[t]])];return u.qy`
        <ha-selector
          .hass=${this.hass}
          .label=${i}
          .helper=${a}
          .value=${this[t]}
          .selector=${{entity:{multiple:!0,include_entities:r.length?r:["none.none"]}}}
          @value-changed=${e=>this._entityListChanged(t,e)}
        ></ha-selector>
      `}_saveButton(t){U(t),t.stopPropagation(),this.hass.callWS({type:"dwains_dashboard/edit_area_button",icon:this.icon,areaId:this.areaId,disableArea:this.disableArea,hideIcon:this.hideIcon,graphEntity:this.graphEntity,graphHours:this.graphHours,sensorEntities:this.sensorEntities,binarySensorEntities:this.binarySensorEntities}).then(t=>{(0,L.fs)()},t=>{console.error("Message failed!",t)})}render(){return u.qy`
      <div class="edit-element">
          <ha-icon-picker
            label=${(0,m.A)(this.hass,"area.icon")}
            .value=${this.icon}
            .name=${(0,m.A)(this.hass,"area.icon")}
            .disabled=${this.hideIcon}
            @value-changed=${this._iconPickerChange}
          ></ha-icon-picker>
          <label class="dd-check" @click=${H.H}>
              <ha-checkbox
              @change=${this._hideIconValueChanged}
              .checked=${this.hideIcon}
            ></ha-checkbox>
              <span>${(0,m.A)(this.hass,"area.hide_icon")}</span>
            </label>
          <ha-entity-picker
            .hass=${this.hass}
            .label=${(0,m.A)(this.hass,"area.graph_entity")}
            .helper=${(0,m.A)(this.hass,"area.graph_entity_helper")}
            .value=${this.graphEntity}
            .includeDomains=${["sensor"]}
            .entityFilter=${this._graphEntityFilter}
            allow-custom-entity
            @value-changed=${this._graphEntityChanged}
          ></ha-entity-picker>
          ${this.graphEntity?u.qy`
            <ha-selector
              .hass=${this.hass}
              .label=${(0,m.A)(this.hass,"area.graph_hours")}
              .value=${String(this.graphHours)}
              .selector=${{select:{mode:"dropdown",options:F.map(t=>({value:String(t),label:(0,m.A)(this.hass,`area.graph_hours_${t}`)}))}}}
              @value-changed=${this._graphHoursChanged}
            ></ha-selector>
          `:""}
          ${this._renderEntityList("sensorEntities","sensor",(0,m.A)(this.hass,"area.sensor_entities"),(0,m.A)(this.hass,"area.sensor_entities_helper"))}
          ${this._renderEntityList("binarySensorEntities","binary_sensor",(0,m.A)(this.hass,"area.binary_sensor_entities"),(0,m.A)(this.hass,"area.binary_sensor_entities_helper"))}
          <label class="dd-check" @click=${H.H}>
              <ha-checkbox
              @change=${this._disableValueChanged}
              .checked=${this.disableArea}
            ></ha-checkbox>
              <span>${(0,m.A)(this.hass,"area.disable")}</span>
            </label>
          <div class="card-footer">
            <ha-button slot="secondaryAction" @click=${t=>(0,L.fs)()}>
              ${this.hass.localize("ui.common.cancel")}
            </ha-button>
            <ha-button slot="primaryAction" @click=${this._saveButton}>
              ${this.hass.localize("ui.common.submit")}
            </ha-button>
          </div>
      </div>
      `}}W("dwains-edit-area-button-card",V);const{closeParentDropdown:Y}=o(),{defineDwainsElement:G}=n();class J extends u.WF{static get styles(){return[(0,H.F)(u.AH),u.AH`
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
          `]}setConfig(t){this.device=t.device,this.icon=t.icon?t.icon:"",this.showInNavbar=!!t.showInNavbar&&t.showInNavbar}connectedCallback(){super.connectedCallback()}_iconPickerChange(t){this.icon=t.detail.value}_showInMainNavbarValueChanged(t){this.showInNavbar=t.target.checked}_saveButton(t){Y(t),t.stopPropagation(),!this.showInNavbar||this.icon?this.hass.callWS({type:"dwains_dashboard/edit_device_button",icon:this.icon,device:this.device,showInNavbar:this.showInNavbar}).then(t=>{(0,L.fs)()},t=>{console.error("Message failed!",t)}):alert((0,m.A)(this.hass,"device.icon_required"))}render(){return u.qy`
        <div class="edit-element">
            <ha-icon-picker
              label=${(0,m.A)(this.hass,"device.icon")}
              .value=${this.icon}
              @value-changed=${this._iconPickerChange}
            ></ha-icon-picker>

          <label class="dd-check" @click=${H.H}>
              <ha-switch
                @change=${this._showInMainNavbarValueChanged}
                .checked=${this.showInNavbar}
              ></ha-switch>
              <span>${(0,m.A)(this.hass,"device.show_in_navbar")}</span>
            </label>

            <div class="card-footer">
              <ha-button slot="secondaryAction" @click=${t=>(0,L.fs)()}>
                ${this.hass.localize("ui.common.cancel")}
              </ha-button>
              <ha-button slot="primaryAction" @click=${this._saveButton}>
                ${this.hass.localize("ui.common.submit")}
              </ha-button>
            </div>
        </div>
        `}}G("dwains-edit-device-button-card",J);const{websocketReadStore:K}=p(),{installBlueprint:Q}=a(),{ConnectedLoadOwner:Z}=r(),{hassConnectionIdentity:tt,hasHassConnectionChanged:et}=d(),{defineDwainsElement:it}=n();class at extends u.WF{constructor(){super(),this._connectedLoadOwner=new Z(t=>this._loadEditor(t),{reportError:(t,e)=>console.error(t,e),errorMessage:"Failed to load device-card editor data"}),this._configReady=!1}set hass(t){const e=et(this._hass,t);this._hass=t,e&&(this._connectedLoadOwner.disconnect(),this.isConnected&&this._connectedLoadOwner.connect()),this._startEditorIfReady()}get hass(){return this._hass}static get styles(){return[u.AH`
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
          `]}static get properties(){return{mode:{},blueprints:{}}}setConfig(t){if(this._editorSessionInitialized)return this._configReady=!0,void this._startEditorIfReady();if(this._editorSessionInitialized=!0,this.mode=t.mode?t.mode:"dwains-dashboard-blueprint-select",this.domain=t.domain,t.cardConfig){const e=structuredClone(t.cardConfig);delete e.input_entity,delete e.input_name,this.cardConfig=e}else this.cardConfig="";this.existingCardEdit=!!t.existingCardEdit&&t.existingCardEdit,this._configReady=!0,this._startEditorIfReady()}connectedCallback(){super.connectedCallback(),this._connectedLoadOwner.connect(),this._startEditorIfReady()}disconnectedCallback(){super.disconnectedCallback(),this._connectedLoadOwner.disconnect()}_startEditorIfReady(){this._configReady&&this._hass&&this._connectedLoadOwner.ready()}async _loadEditor({isCurrent:t}){const e=this._hass,i=tt(e),a=await K.read(e,{type:"dwains_dashboard/get_blueprints"});t()&&tt(this._hass)===i&&(this.blueprints=a)}_loadBlueprints(){return this._connectedLoadOwner.reload()}_switchMode(t){const e=t.currentTarget.mode;this.mode=e,this.requestUpdate()}_removeCard(){this.hass.callWS({type:"dwains_dashboard/remove_device_card",domain:this.domain}).then(t=>{(0,L.fs)()},t=>{console.error("Message failed!",t)})}_handleDeleteBlueprintClicked(t){const e=t.currentTarget.blueprint;this.hass.callWS({type:"dwains_dashboard/delete_blueprint",blueprint:e}).then(t=>{K.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()},t=>{console.error("Message failed!",t)})}_handleUseBlueprintClicked(t){const e=t.currentTarget.blueprint,i=JSON.stringify({type:"custom:dwains-blueprint-card",blueprint:e,card:this.blueprints.blueprints[e].card});this.hass.callWS({type:"dwains_dashboard/edit_device_card",cardData:i,domain:this.domain}).then(t=>{(0,L.fs)()},t=>{console.error("Message failed!",t)})}_installBlueprintYamlChanged(t){this.installBlueprintYaml=t.target.value}_handleInstallBlueprintClicked(t){Q({hass:this.hass,yamlCode:this.installBlueprintYaml,translate:t=>(0,m.A)(this.hass,t),onInstalled:()=>{K.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()}})}_checkCustomCard(t){const e=customElements.get(t);return u.qy`
          <div>
            ${e?u.qy`
              <ha-icon
                style="color: green;"
                .icon=${"mdi:check-bold"}
              ></ha-icon>`:u.qy`
              <ha-icon
                style="color: red;"
                .icon=${"mdi:close-thick"}
              ></ha-icon>
              `}
            ${t}
            ${e?u.qy`(${(0,m.A)(this.hass,"blueprint.installed")})`:u.qy`(${(0,m.A)(this.hass,"blueprint.not_installed")})`}
          </div>
        `}render(){if(null==this.blueprints||0===this.blueprints.length)return u.qy`Loading...`;if("dwains-dashboard-blueprint-select"==this.mode){const t=Object.entries(this.blueprints.blueprints).sort(function(t,e){let i=t[1].blueprint.type,a=e[1].blueprint.type;return i==a?0:i>a?1:-1});return u.qy`
          <div class="edit-element">
            <strong>${(0,m.A)(this.hass,"blueprint.installed_blueprints")}:</strong>
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"blueprint.title")}</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"global.version")}</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"blueprint.type")}</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"blueprint.used_custom_cards")}</th>
                  <th scope="col" class="relative px-6 py-3">
                  </th>
                </tr>
              </thead>
              <tbody>
                ${0==Object.values(this.blueprints.blueprints).length?u.qy`
                  <tr>
                    <td  class="px-6 py-4" colspan="5">${(0,m.A)(this.hass,"blueprint.no_blueprints_installed")}</td>
                  </tr>`:u.qy`
                  ${Object.entries(t).map(([t,e])=>u.qy`
                          <tr class="bg-white">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <h3>${e[1].blueprint.name}</h3>
                              ${e[1].blueprint.description}
                            </td>
                            <td class="px-6 py-4">
                              ${e[1].blueprint.version}
                            </td>
                            <td class="px-6 py-4">
                              ${e[1].blueprint.type}
                            </td>
                            <td class="px-6 py-4">
                              ${e[1].blueprint.custom_cards&&0!==e[1].blueprint.custom_cards.length?u.qy`
                                  ${e[1].blueprint.custom_cards.map(t=>this._checkCustomCard(t))}
                                `:"None"}
                            </td>
                            <td>
                              ${"replace-card"==e[1].blueprint.type?u.qy`
                                <ha-button .blueprint=${e[0]} @click=${this._handleUseBlueprintClicked} unelevated>
                                  ${(0,m.A)(this.hass,"blueprint.use")}
                                </ha-button>
                              `:""}
                              <ha-button .blueprint=${e[0]} @click=${this._handleDeleteBlueprintClicked} unelevated>
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
            <strong>${(0,m.A)(this.hass,"blueprint.install")}</strong>
            <p>${(0,m.A)(this.hass,"blueprint.instruction")}</p>
            <a href="https://github.com/dwainscheeren/dwains-dashboard-blueprints" target="_blank">Dwains Dashboard Blueprints Github</a>
            <ha-yaml-editor
              label=${(0,m.A)(this.hass,"blueprint.yaml_code")}
              name="description"
              @value-changed=${this._installBlueprintYamlChanged}
            ><ha-code-editor mode="yaml" autocomplete-entities="" autocomplete-icons="" dir="ltr"></ha-code-editor></ha-yaml-editor>
            <div style="margin-top: 15px; margin-bottom: 20px;">
              <ha-button @click=${this._handleInstallBlueprintClicked} unelevated>
                ${(0,m.A)(this.hass,"blueprint.install")}
              </ha-button>
            </div>
          </div>`}return"current-selected-blueprint"==this.mode?u.qy`
            <div class="edit-element">
              <p>
              ${(0,m.A)(this.hass,"device.current_blueprint_card")} ${(0,m.A)(this.hass,"device."+this.domain)}:<br>
                <strong>${this.blueprints.blueprints[this.cardConfig.blueprint].blueprint.name}</strong><br>
                ${this.blueprints.blueprints[this.cardConfig.blueprint].blueprint.description}
              </p>

              <div class="card-footer-multiple">
                ${this.existingCardEdit?u.qy`
                    <div>
                      <ha-button class="warning" @click=${this._removeCard}>${this.hass.localize("ui.common.remove")}</ha-button>
                      <ha-button class="warning" @click=${t=>this.mode="dwains-dashboard-blueprint-select"}}>${this.hass.localize("ui.common.previous")}</ha-button>
                    </div>
                  `:u.qy`<div></div>`}
                <div>
                  <ha-button slot="secondaryAction" @click=${t=>(0,L.fs)()}>
                    ${this.hass.localize("ui.common.cancel")}
                  </ha-button>
                  <ha-button slot="primaryAction" .blueprint=${this.cardConfig.blueprint} @click=${this._handleUseBlueprintClicked}>
                    ${this.hass.localize("ui.common.submit")}
                  </ha-button>
                </div>
              </div>
            </div>
          `:void 0}}it("dwains-edit-device-card-card",at);const{websocketReadStore:st}=p(),{installBlueprint:rt}=a(),{ConnectedLoadOwner:nt}=r(),{hassConnectionIdentity:ot,hasHassConnectionChanged:dt}=d(),{defineDwainsElement:lt}=n();class ct extends u.WF{constructor(){super(),this._connectedLoadOwner=new nt(t=>this._loadEditor(t),{reportError:(t,e)=>console.error(t,e),errorMessage:"Failed to load device-popup editor data"}),this._configReady=!1}set hass(t){const e=dt(this._hass,t);this._hass=t,e&&(this._connectedLoadOwner.disconnect(),this.isConnected&&this._connectedLoadOwner.connect()),this._startEditorIfReady()}get hass(){return this._hass}static get styles(){return[u.AH`
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
          `]}static get properties(){return{mode:{},blueprints:{}}}setConfig(t){if(this._editorSessionInitialized)return this._configReady=!0,void this._startEditorIfReady();if(this._editorSessionInitialized=!0,this.mode=t.mode?t.mode:"dwains-dashboard-blueprint-select",this.domain=t.domain,t.cardConfig){const e=structuredClone(t.cardConfig);delete e.input_entity,delete e.input_name,this.cardConfig=e}else this.cardConfig="";this.existingCardEdit=!!t.existingCardEdit&&t.existingCardEdit,this._configReady=!0,this._startEditorIfReady()}connectedCallback(){super.connectedCallback(),this._connectedLoadOwner.connect(),this._startEditorIfReady()}disconnectedCallback(){super.disconnectedCallback(),this._connectedLoadOwner.disconnect()}_startEditorIfReady(){this._configReady&&this._hass&&this._connectedLoadOwner.ready()}async _loadEditor({isCurrent:t}){const e=this._hass,i=ot(e),a=await st.read(e,{type:"dwains_dashboard/get_blueprints"});t()&&ot(this._hass)===i&&(this.blueprints=a)}_loadBlueprints(){return this._connectedLoadOwner.reload()}_switchMode(t){const e=t.currentTarget.mode;this.mode=e,this.requestUpdate()}_removeCard(){this.hass.callWS({type:"dwains_dashboard/remove_device_popup",domain:this.domain}).then(t=>{(0,L.fs)()},t=>{console.error("Message failed!",t)})}_handleDeleteBlueprintClicked(t){const e=t.currentTarget.blueprint;this.hass.callWS({type:"dwains_dashboard/delete_blueprint",blueprint:e}).then(t=>{st.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()},t=>{console.error("Message failed!",t)})}_handleUseBlueprintClicked(t){const e=t.currentTarget.blueprint,i=JSON.stringify({type:"custom:dwains-blueprint-card",blueprint:e,card:this.blueprints.blueprints[e].card});this.hass.callWS({type:"dwains_dashboard/edit_device_popup",cardData:i,domain:this.domain}).then(t=>{(0,L.fs)()},t=>{console.error("Message failed!",t)})}_installBlueprintYamlChanged(t){this.installBlueprintYaml=t.target.value}_handleInstallBlueprintClicked(t){rt({hass:this.hass,yamlCode:this.installBlueprintYaml,translate:t=>(0,m.A)(this.hass,t),onInstalled:()=>{st.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()}})}_checkCustomCard(t){const e=customElements.get(t);return u.qy`
          <div>
            ${e?u.qy`
              <ha-icon
                style="color: green;"
                .icon=${"mdi:check-bold"}
              ></ha-icon>`:u.qy`
              <ha-icon
                style="color: red;"
                .icon=${"mdi:close-thick"}
              ></ha-icon>
              `}
            ${t}
            ${e?u.qy`(${(0,m.A)(this.hass,"blueprint.installed")})`:u.qy`(${(0,m.A)(this.hass,"blueprint.not_installed")})`}
          </div>
        `}render(){if("dwains-dashboard-blueprint-select"==this.mode){const t=Object.entries(this.blueprints.blueprints).sort(function(t,e){let i=t[1].blueprint.type,a=e[1].blueprint.type;return i==a?0:i>a?1:-1});return u.qy`
          <div class="edit-element">
            <strong>${(0,m.A)(this.hass,"blueprint.installed_blueprints")}:</strong>
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"blueprint.title")}</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"global.version")}</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"blueprint.type")}</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"blueprint.used_custom_cards")}</th>
                  <th scope="col" class="relative px-6 py-3">
                  </th>
                </tr>
              </thead>
              <tbody>
              ${Object.entries(t).map(([t,e])=>u.qy`
                      <tr class="bg-white">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <h3>${e[1].blueprint.name}</h3>
                          ${e[1].blueprint.description}
                        </td>
                        <td class="px-6 py-4">
                          ${e[1].blueprint.version}
                        </td>
                        <td class="px-6 py-4">
                          ${e[1].blueprint.type}
                        </td>
                        <td class="px-6 py-4">
                          ${e[1].blueprint.custom_cards&&0!==e[1].blueprint.custom_cards.length?u.qy`
                              ${e[1].blueprint.custom_cards.map(t=>this._checkCustomCard(t))}
                            `:"None"}
                        </td>
                        <td>
                          ${"replace-card"==e[1].blueprint.type?u.qy`
                            <ha-button .blueprint=${e[0]} @click=${this._handleUseBlueprintClicked} unelevated>
                              ${(0,m.A)(this.hass,"blueprint.use")}
                            </ha-button>
                          `:""}
                          <ha-button .blueprint=${e[0]} @click=${this._handleDeleteBlueprintClicked} unelevated>
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
            <strong>${(0,m.A)(this.hass,"blueprint.install")}</strong>
            <p>${(0,m.A)(this.hass,"blueprint.instruction")}</p>
            <a href="https://github.com/dwainscheeren/dwains-dashboard-blueprints" target="_blank">Dwains Dashboard Blueprints Github</a>
            <ha-yaml-editor
              label=${(0,m.A)(this.hass,"blueprint.yaml_code")}
              name="description"
              @value-changed=${this._installBlueprintYamlChanged}
            ><ha-code-editor mode="yaml" autocomplete-entities="" autocomplete-icons="" dir="ltr"></ha-code-editor></ha-yaml-editor>
            <div style="margin-top: 15px; margin-bottom: 20px;">
              <ha-button @click=${this._handleInstallBlueprintClicked} unelevated>
                ${(0,m.A)(this.hass,"blueprint.install")}
              </ha-button>
            </div>
          </div>`}if("current-selected-blueprint"==this.mode)return u.qy`
            <div class="edit-element">
              <p>
                ${(0,m.A)(this.hass,"device.current_blueprint_popup")} ${(0,m.A)(this.hass,"device."+this.domain)}:<br>
                <strong>${this.blueprints.blueprints[this.cardConfig.blueprint].blueprint.name}</strong><br>
                ${this.blueprints.blueprints[this.cardConfig.blueprint].blueprint.description}
              </p>
              <div class="card-footer-multiple">
                ${this.existingCardEdit?u.qy`
                    <div>
                      <ha-button class="warning" @click=${this._removeCard}>${this.hass.localize("ui.common.remove")}</ha-button>
                      <ha-button class="warning" @click=${t=>this.mode="dwains-dashboard-blueprint-select"}}>${this.hass.localize("ui.common.previous")}</ha-button>
                    </div>
                  `:u.qy`<div></div>`}
                <div>
                  <ha-button slot="secondaryAction" @click=${t=>(0,L.fs)()}>
                    ${this.hass.localize("ui.common.cancel")}
                  </ha-button>
                  <ha-button slot="primaryAction" .blueprint=${this.cardConfig.blueprint} @click=${this._handleUseBlueprintClicked}>
                    ${this.hass.localize("ui.common.submit")}
                  </ha-button>
                </div>
              </div>
            </div>
          `}}lt("dwains-edit-device-popup-card",ct);var ht=i(5890);const{websocketReadStore:pt}=p(),{installBlueprint:ut}=a(),{ConnectedLoadOwner:mt}=r(),{hassConnectionIdentity:gt,hasHassConnectionChanged:bt}=d(),{prepareEntityEditorCardConfig:yt,renderBlueprintSelection:ft}=s(),{defineDwainsElement:_t}=n();class wt extends u.WF{constructor(){super(),this._connectedLoadOwner=new mt(t=>this._loadEditor(t),{reportError:(t,e)=>console.error(t,e),errorMessage:"Failed to load entity-card editor data"}),this._configReady=!1}set hass(t){const e=bt(this._hass,t);this._hass=t,e&&(this._connectedLoadOwner.disconnect(),this.isConnected&&this._connectedLoadOwner.connect()),this._startEditorIfReady()}get hass(){return this._hass}static get styles(){return[u.AH`
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
        `]}static get properties(){return{mode:{},blueprints:{}}}setConfig(t){if(this._editorSessionInitialized)return this._configReady=!0,void this._startEditorIfReady();this._editorSessionInitialized=!0,this.mode=t.mode?t.mode:"pre-select",this.entity_id=t.entity_id,t.cardConfig?this.cardConfig=yt(t.cardConfig,this.entity_id):this.cardConfig="",this.existingCardEdit=!!t.existingCardEdit&&t.existingCardEdit,this._configReady=!0,this._startEditorIfReady()}connectedCallback(){super.connectedCallback(),this._connectedLoadOwner.connect(),this._startEditorIfReady()}disconnectedCallback(){super.disconnectedCallback(),this._connectedLoadOwner.disconnect()}_startEditorIfReady(){this._configReady&&this._hass&&this._connectedLoadOwner.ready()}async _loadEditor({isCurrent:t}){const e=this._hass,i=gt(e),a=await pt.read(e,{type:"dwains_dashboard/get_blueprints"});t()&&gt(this._hass)===i&&(this.blueprints=a)}_loadBlueprints(){return this._connectedLoadOwner.reload()}magicStuff(t){const e=structuredClone(t.detail.config),i=e.type;ht.SG.includes(i)?(e.entity||(e.entity=this.entity_id),this.cardConfig=e):this.cardConfig=e,this.mode="editor-element"}magicStuffSecond(t){}async _sendCard(){const t=this.renderRoot?.querySelector("dwains-card-config-editor"),e=await(t?.commitConfig?.()??t?.getConfig?.());e&&"object"==typeof e&&(this.cardConfig=e);try{await this.hass.callWS({type:"dwains_dashboard/edit_entity_card",cardData:JSON.stringify(this.cardConfig),entityId:this.entity_id}),pt.invalidate(this.hass),(0,L.fs)()}catch(t){console.error("Message failed!",t)}}_switchMode(t){const e=t.currentTarget.mode;this.mode=e,this.requestUpdate()}_removeCard(){this.hass.callWS({type:"dwains_dashboard/remove_entity_card",entityId:this.entity_id}).then(t=>{(0,L.fs)()},t=>{console.error("Message failed!",t)})}_handleDeleteBlueprintClicked(t){const e=t.currentTarget.blueprint;this.hass.callWS({type:"dwains_dashboard/delete_blueprint",blueprint:e}).then(t=>{pt.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()},t=>{console.error("Message failed!",t)})}_handleUseBlueprintClicked(t){const e=t.currentTarget.blueprint;this.mode="editor-element",this.name=this.blueprints.blueprints[e].blueprint.name,this.cardConfig={type:"custom:dwains-blueprint-card",blueprint:e,input_entity:this.entity_id,card:this.blueprints.blueprints[e].card}}_installBlueprintYamlChanged(t){this.installBlueprintYaml=t.target.value}_handleInstallBlueprintClicked(t){ut({hass:this.hass,yamlCode:this.installBlueprintYaml,translate:t=>(0,m.A)(this.hass,t),onInstalled:()=>{pt.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()}})}_checkCustomCard(t){const e=customElements.get(t);return u.qy`
        <div>
          ${e?u.qy`
            <ha-icon
              style="color: green;"
              .icon=${"mdi:check-bold"}
            ></ha-icon>`:u.qy`
            <ha-icon
              style="color: red;"
              .icon=${"mdi:close-thick"}
            ></ha-icon>
            `}
          ${t}
          ${e?u.qy`(${(0,m.A)(this.hass,"blueprint.installed")})`:u.qy`(${(0,m.A)(this.hass,"blueprint.not_installed")})`}
        </div>
      `}render(){if(null==this.blueprints||0===this.blueprints.length)return u.qy`Loading...`;if("pre-select"==this.mode)return u.qy`
          <ha-md-list>
            <ha-md-list-item type="button" .mode=${"hui-card-picker"} @click=${this._switchMode}>
              <span slot="headline">${(0,m.A)(this.hass,"editor.lovelace_card")}</span>
              <span slot="supporting-text">${(0,m.A)(this.hass,"editor.create_lovelace_card")}</span>
            </ha-md-list-item>
            <li divider role="separator"></li>
            <ha-md-list-item type="button" .mode=${"dwains-dashboard-blueprint-select"} @click=${this._switchMode}>
              <span slot="headline">${(0,m.A)(this.hass,"editor.dwains_dashboard_blueprint")}</span>
              <span slot="supporting-text">${(0,m.A)(this.hass,"editor.use_dwains_dashboard_blueprint")}</span>
              <ha-icon-next slot="end"></ha-icon-next>
            </ha-md-list-item>
          </ha-md-list>
        `;if("dwains-dashboard-blueprint-select"==this.mode){const t=Object.entries(this.blueprints.blueprints).sort(function(t,e){let i=t[1].blueprint.type,a=e[1].blueprint.type;return i==a?0:i>a?1:-1});return u.qy`
        <div class="edit-element">

          <div style="margin-bottom: 20px;">
            <ha-button .mode=${"pre-select"} @click=${this._switchMode}>< ${this.hass.localize("ui.common.previous")}</ha-button>
          </div>

          <strong>${(0,m.A)(this.hass,"blueprint.installed_blueprints")}:</strong>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"blueprint.title")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"global.version")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"blueprint.type")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"blueprint.used_custom_cards")}</th>
                <th scope="col" class="relative px-6 py-3">
                </th>
              </tr>
            </thead>
            <tbody>
              ${0==Object.values(this.blueprints.blueprints).length?u.qy`
                <tr>
                  <td  class="px-6 py-4" colspan="5">${(0,m.A)(this.hass,"blueprint.no_blueprints_installed")}</td>
                </tr>`:u.qy`
                  ${Object.entries(t).map(([t,e])=>u.qy`
                          <tr class="bg-white">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <h3>${e[1].blueprint.name}</h3>
                              ${e[1].blueprint.description}
                            </td>
                            <td class="px-6 py-4">
                              ${e[1].blueprint.version}
                            </td>
                            <td class="px-6 py-4">
                              ${e[1].blueprint.type}
                            </td>
                            <td class="px-6 py-4">
                              ${e[1].blueprint.custom_cards&&0!==e[1].blueprint.custom_cards.length?u.qy`
                                  ${e[1].blueprint.custom_cards.map(t=>this._checkCustomCard(t))}
                                `:"None"}
                            </td>
                            <td>
                              ${"card"==e[1].blueprint.type||"replace-card"==e[1].blueprint.type?u.qy`
                                <ha-button .blueprint=${e[0]} @click=${this._handleUseBlueprintClicked} unelevated>
                                  ${(0,m.A)(this.hass,"blueprint.use")}
                                </ha-button>
                              `:""}
                              <ha-button .blueprint=${e[0]} @click=${this._handleDeleteBlueprintClicked} unelevated>
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
          <strong>${(0,m.A)(this.hass,"blueprint.install")}</strong>
          <p>${(0,m.A)(this.hass,"blueprint.instruction")}</p>
          <a href="https://github.com/dwainscheeren/dwains-dashboard-blueprints" target="_blank">Dwains Dashboard Blueprints Github</a>
          <ha-yaml-editor
            label=${(0,m.A)(this.hass,"blueprint.yaml_code")}
            name="description"
            @value-changed=${this._installBlueprintYamlChanged}
          ><ha-code-editor mode="yaml" autocomplete-entities="" autocomplete-icons="" dir="ltr"></ha-code-editor></ha-yaml-editor>
          <div style="margin-top: 15px; margin-bottom: 20px;">
            <ha-button @click=${this._handleInstallBlueprintClicked} unelevated>
              ${(0,m.A)(this.hass,"blueprint.install")}
            </ha-button>
          </div>
        </div>`}return"hui-card-picker"==this.mode?u.qy`
          <div class="edit-element">
            <h1 style="font-size: 17px; font-weight: bold;">${(0,m.A)(this.hass,"editor.select_card_for")} ${this.entity_id}</h1>
            <dwains-card-picker
              @config-changed=${this.magicStuff}
              .hass=${this.hass}
              .lovelace=${{views:[]}}
              .entityId=${this.entity_id}
            ></dwains-card-picker>
            <div class="card-footer">
              <ha-button slot="secondaryAction" @click=${t=>(0,L.fs)()}>
                ${this.hass.localize("ui.common.cancel")}
              </ha-button>
            </div>
          </div>
        `:u.qy`
          <div class="edit-element">
            ${ft(u.qy,m.A,this.hass,this.cardConfig,this.blueprints)}
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
              ${this.existingCardEdit?u.qy`
                  <div>
                    <ha-button class="warning" @click=${this._removeCard}>${this.hass.localize("ui.common.remove")}</ha-button>
                    <ha-button class="warning" @click=${t=>this.mode="hui-card-picker"}}>${this.hass.localize("ui.common.previous")}</ha-button>
                  </div>
                `:u.qy`<div></div>`}
              <div>
                <ha-button slot="secondaryAction" @click=${t=>(0,L.fs)()}>
                  ${this.hass.localize("ui.common.cancel")}
                </ha-button>
                <ha-button slot="primaryAction" @click=${this._sendCard}>
                  ${this.hass.localize("ui.common.submit")}
                </ha-button>
              </div>
            </div>
          </div>
        `}}_t("dwains-edit-entity-card-card",wt);const{closeParentDropdown:vt}=o(),{defineDwainsElement:xt}=n();class $t extends u.WF{static get styles(){return[(0,H.F)(u.AH),u.AH`
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
        `]}setConfig(t){this.entity=t.entity,this.friendlyName=t.friendlyName?t.friendlyName:"",this.hideEntity=!!t.hideEntity&&t.hideEntity,this.hideEntityInArea=t.hideEntityInArea??!1,this.disableEntity=!!t.disableEntity&&t.disableEntity,this.excludeEntity=!!t.excludeEntity&&t.excludeEntity,this.rowSpan=t.rowSpan?t.rowSpan:"1",this.colSpan=t.colSpan?t.colSpan:"1",this.rowSpanLg=t.rowSpanLg?t.rowSpanLg:"1",this.colSpanLg=t.colSpanLg?t.colSpanLg:"1",this.rowSpanXl=t.rowSpanXl?t.rowSpanXl:"1",this.colSpanXl=t.colSpanXl?t.colSpanXl:"1",this.customCard=!!t.customCard&&t.customCard,this.customPopup=!!t.customPopup&&t.customPopup}async _saveButton(t){vt(t),t.stopPropagation();try{await this.hass.callWS({type:"dwains_dashboard/edit_entity",entity:this.entity,friendlyName:this.friendlyName,disableEntity:this.disableEntity,hideEntity:this.hideEntity,excludeEntity:this.excludeEntity,rowSpan:this.rowSpan,colSpan:this.colSpan,rowSpanLg:this.rowSpanLg,colSpanLg:this.colSpanLg,rowSpanXl:this.rowSpanXl,colSpanXl:this.colSpanXl,customCard:this.customCard,customPopup:this.customPopup}),await this.hass.callWS({type:"dwains_dashboard/edit_entity_bool_value",entityId:this.entity,key:"hidden_in_area",value:this.hideEntityInArea}),(0,L.fs)()}catch(t){console.error("Failed to save entity settings:",t)}}_friendlyNameChanged(t){this.friendlyName=t.target.value}_disableValueChanged(t){this.disableEntity=t.target.checked}_hideValueChanged(t){this.hideEntity=t.target.checked}_hideInAreaValueChanged(t){this.hideEntityInArea=t.target.checked}_excludeValueChanged(t){this.excludeEntity=t.target.checked}_customCardValueChanged(t){this.customCard=t.target.checked}_customPopupValueChanged(t){this.customPopup=t.target.checked}_haSelectChanged(t){vt(t),t.stopPropagation();const e=t.currentTarget||t.target,i=e.name||e.type||e.getAttribute?.("type"),a=t.detail?.value??t.detail?.item?.value??e.selectedItem?.value??e.value;i&&void 0!==a&&(this[i]=a),this.requestUpdate()}_stopPropagation(t){t.stopPropagation()}render(){return u.qy`
        <div class="edit-element">
            <h1 style="font-size: 15px; font-weight: bold;">${(0,m.A)(this.hass,"entity.edit_entity")} "${this.entity}"</h1>

            <ha-input
              label=${(0,m.A)(this.hass,"entity.friendly_name")}
              .value=${this.friendlyName}
              @input=${this._friendlyNameChanged}
            ></ha-input>

            <h2>${(0,m.A)(this.hass,"editor.default_col_row")}</h2>
            <div class="grid-2">
              <select name="rowSpan" .value=${this.rowSpan} @change=${this._haSelectChanged} @click=${this._stopPropagation}>
                <option value="1">1 ${(0,m.A)(this.hass,"editor.row")}</option>
                <option value="2">2 ${(0,m.A)(this.hass,"editor.rows")}</option>
              </select>
              <select name="colSpan" .value=${this.colSpan} @change=${this._haSelectChanged} @click=${this._stopPropagation}>
                <option value="1">1 ${(0,m.A)(this.hass,"editor.column")}</option>
                <option value="2">2 ${(0,m.A)(this.hass,"editor.columns")}</option>
              </select>
            </div>

            <h2>${(0,m.A)(this.hass,"editor.large_col_row")}</h2>
            <div class="grid-2">
              <select name="rowSpanLg" .value=${this.rowSpanLg} @change=${this._haSelectChanged} @click=${this._stopPropagation}>
                <option value="1">1 ${(0,m.A)(this.hass,"editor.row")}</option>
                <option value="2">2 ${(0,m.A)(this.hass,"editor.rows")}</option>
                <option value="3">3 ${(0,m.A)(this.hass,"editor.rows")}</option>
              </select>
              <select name="colSpanLg" .value=${this.colSpanLg} @change=${this._haSelectChanged} @click=${this._stopPropagation}>
                <option value="1">1 ${(0,m.A)(this.hass,"editor.column")}</option>
                <option value="2">2 ${(0,m.A)(this.hass,"editor.columns")}</option>
                <option value="3">3 ${(0,m.A)(this.hass,"editor.columns")}</option>
              </select>
            </div>

            <h2>${(0,m.A)(this.hass,"editor.extra_large_col_row")}</h2>
            <div class="grid-2">
              <select name="rowSpanXl" .value=${this.rowSpanXl} @change=${this._haSelectChanged} @click=${this._stopPropagation}>
                <option value="1">1 ${(0,m.A)(this.hass,"editor.row")}</option>
                <option value="2">2 ${(0,m.A)(this.hass,"editor.rows")}</option>
                <option value="3">3 ${(0,m.A)(this.hass,"editor.rows")}</option>
                <option value="4">4 ${(0,m.A)(this.hass,"editor.rows")}</option>
              </select>
              <select name="colSpanXl" .value=${this.colSpanXl} @change=${this._haSelectChanged} @click=${this._stopPropagation}>
                <option value="1">1 ${(0,m.A)(this.hass,"editor.column")}</option>
                <option value="2">2 ${(0,m.A)(this.hass,"editor.columns")}</option>
                <option value="3">3 ${(0,m.A)(this.hass,"editor.columns")}</option>
                <option value="4">4 ${(0,m.A)(this.hass,"editor.columns")}</option>
              </select>
            </div>

            <label class="dd-check" @click=${H.H}>
              <ha-checkbox
                @change=${this._disableValueChanged}
                .checked=${this.disableEntity}
              ></ha-checkbox>
              <span>${(0,m.A)(this.hass,"entity.disable")}</span>
            </label>
            <label class="dd-check" @click=${H.H}>
              <ha-checkbox
                @change=${this._hideValueChanged}
                .checked=${this.hideEntity}
              ></ha-checkbox>
              <span>${(0,m.A)(this.hass,"entity.hide")}</span>
            </label>
            <label class="dd-check" @click=${H.H}>
              <ha-checkbox
                @change=${this._hideInAreaValueChanged}
                .checked=${this.hideEntityInArea}
              ></ha-checkbox>
              <span>${(0,m.A)(this.hass,"entity.hide_in_area")}</span>
            </label>
            <label class="dd-check" @click=${H.H}>
              <ha-checkbox
                @change=${this._excludeValueChanged}
                .checked=${this.excludeEntity}
              ></ha-checkbox>
              <span>${(0,m.A)(this.hass,"entity.exclude")}</span>
            </label>
            <label class="dd-check" @click=${H.H}>
              <ha-checkbox
                @change=${this._customCardValueChanged}
                .checked=${this.customCard}
              ></ha-checkbox>
              <span>${(0,m.A)(this.hass,"entity.use_entity_card")}</span>
            </label>
            <label class="dd-check" @click=${H.H}>
              <ha-checkbox
                @change=${this._customPopupValueChanged}
                .checked=${this.customPopup}
              ></ha-checkbox>
              <span>${(0,m.A)(this.hass,"entity.use_popup_card")}</span>
            </label>

            <div class="card-footer">
              <ha-button slot="secondaryAction" @click=${t=>(0,L.fs)()}>
                ${this.hass.localize("ui.common.cancel")}
              </ha-button>
              <ha-button slot="primaryAction" @click=${this._saveButton}>
                ${this.hass.localize("ui.common.submit")}
              </ha-button>
            </div>
        </div>
      `}}xt("dwains-edit-entity-card",$t);const{websocketReadStore:Ct}=p(),{installBlueprint:kt}=a(),{ConnectedLoadOwner:At}=r(),{hassConnectionIdentity:St,hasHassConnectionChanged:Et}=d(),{prepareEntityEditorCardConfig:qt,renderBlueprintSelection:Bt}=s(),{defineDwainsElement:It}=n();class zt extends u.WF{constructor(){super(),this._connectedLoadOwner=new At(t=>this._loadEditor(t),{reportError:(t,e)=>console.error(t,e),errorMessage:"Failed to load entity-popup editor data"}),this._configReady=!1}set hass(t){const e=Et(this._hass,t);this._hass=t,e&&(this._connectedLoadOwner.disconnect(),this.isConnected&&this._connectedLoadOwner.connect()),this._startEditorIfReady()}get hass(){return this._hass}static get styles(){return[u.AH`
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
        `]}static get properties(){return{mode:{},blueprints:{}}}setConfig(t){if(this._editorSessionInitialized)return this._configReady=!0,void this._startEditorIfReady();this._editorSessionInitialized=!0,this.mode=t.mode?t.mode:"pre-select",this.entity_id=t.entity_id,t.cardConfig?this.cardConfig=qt(t.cardConfig,this.entity_id):this.cardConfig="",this.existingCardEdit=!!t.existingCardEdit&&t.existingCardEdit,this._configReady=!0,this._startEditorIfReady()}connectedCallback(){super.connectedCallback(),this._connectedLoadOwner.connect(),this._startEditorIfReady()}disconnectedCallback(){super.disconnectedCallback(),this._connectedLoadOwner.disconnect()}_startEditorIfReady(){this._configReady&&this._hass&&this._connectedLoadOwner.ready()}async _loadEditor({isCurrent:t}){const e=this._hass,i=St(e),a=await Ct.read(e,{type:"dwains_dashboard/get_blueprints"});t()&&St(this._hass)===i&&(this.blueprints=a)}_loadBlueprints(){return this._connectedLoadOwner.reload()}magicStuff(t){const e=structuredClone(t.detail.config),i=e.type;ht.SG.includes(i)?(e.entity||(e.entity=this.entity_id),this.cardConfig=e):this.cardConfig=e,this.mode="editor-element"}magicStuffSecond(t){}async _sendCard(){const t=this.renderRoot?.querySelector("dwains-card-config-editor"),e=await(t?.commitConfig?.()??t?.getConfig?.());e&&"object"==typeof e&&(this.cardConfig=e);try{await this.hass.callWS({type:"dwains_dashboard/edit_entity_popup",cardData:JSON.stringify(this.cardConfig),entityId:this.entity_id}),Ct.invalidate(this.hass),(0,L.fs)()}catch(t){console.error("Message failed!",t)}}_switchMode(t){const e=t.currentTarget.mode;this.mode=e,this.requestUpdate()}_removeCard(){this.hass.callWS({type:"dwains_dashboard/remove_entity_popup",entityId:this.entity_id}).then(t=>{(0,L.fs)()},t=>{console.error("Message failed!",t)})}_handleDeleteBlueprintClicked(t){const e=t.currentTarget.blueprint;this.hass.callWS({type:"dwains_dashboard/delete_blueprint",blueprint:e}).then(t=>{Ct.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()},t=>{console.error("Message failed!",t)})}_handleUseBlueprintClicked(t){const e=t.currentTarget.blueprint;this.mode="editor-element",this.name=this.blueprints.blueprints[e].blueprint.name,this.cardConfig={type:"custom:dwains-blueprint-card",blueprint:e,input_entity:this.entity_id,card:this.blueprints.blueprints[e].card}}_installBlueprintYamlChanged(t){this.installBlueprintYaml=t.target.value}_handleInstallBlueprintClicked(t){kt({hass:this.hass,yamlCode:this.installBlueprintYaml,translate:t=>(0,m.A)(this.hass,t),onInstalled:()=>{Ct.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()}})}_checkCustomCard(t){const e=customElements.get(t);return u.qy`
        <div>
          ${e?u.qy`
            <ha-icon
              style="color: green;"
              .icon=${"mdi:check-bold"}
            ></ha-icon>`:u.qy`
            <ha-icon
              style="color: red;"
              .icon=${"mdi:close-thick"}
            ></ha-icon>
            `}
          ${t}
          ${e?u.qy`(${(0,m.A)(this.hass,"blueprint.installed")})`:u.qy`(${(0,m.A)(this.hass,"blueprint.not_installed")})`}
        </div>
      `}render(){if(null==this.blueprints||0===this.blueprints.length)return u.qy`Loading...`;if("pre-select"==this.mode)return u.qy`
          <ha-md-list>
            <ha-md-list-item type="button" .mode=${"hui-card-picker"} @click=${this._switchMode}>
              <span slot="headline">${(0,m.A)(this.hass,"editor.lovelace_card")}</span>
              <span slot="supporting-text">${(0,m.A)(this.hass,"editor.create_lovelace_card")}</span>
            </ha-md-list-item>
            <li divider role="separator"></li>
            <ha-md-list-item type="button" .mode=${"dwains-dashboard-blueprint-select"} @click=${this._switchMode}>
              <span slot="headline">${(0,m.A)(this.hass,"editor.dwains_dashboard_blueprint")}</span>
              <span slot="supporting-text">${(0,m.A)(this.hass,"editor.use_dwains_dashboard_blueprint")}</span>
              <ha-icon-next slot="end"></ha-icon-next>
            </ha-md-list-item>
          </ha-md-list>
        `;if("dwains-dashboard-blueprint-select"==this.mode){const t=Object.entries(this.blueprints.blueprints).sort(function(t,e){let i=t[1].blueprint.type,a=e[1].blueprint.type;return i==a?0:i>a?1:-1});return u.qy`
        <div class="edit-element">

          <div style="margin-bottom: 20px;">
            <ha-button .mode=${"pre-select"} @click=${this._switchMode}>< ${this.hass.localize("ui.common.previous")}</ha-button>
          </div>

          <strong>${(0,m.A)(this.hass,"blueprint.installed_blueprints")}:</strong>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"blueprint.title")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"global.version")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"blueprint.type")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this.hass,"blueprint.used_custom_cards")}</th>
                <th scope="col" class="relative px-6 py-3">
                </th>
              </tr>
            </thead>
            <tbody>
              ${0==Object.values(this.blueprints.blueprints).length?u.qy`
                <tr>
                  <td  class="px-6 py-4" colspan="5">${(0,m.A)(this.hass,"blueprint.no_blueprints_installed")}</td>
                </tr>`:u.qy`
                ${Object.entries(t).map(([t,e])=>u.qy`
                        <tr class="bg-white">
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <h3>${e[1].blueprint.name}</h3>
                            ${e[1].blueprint.description}
                          </td>
                          <td class="px-6 py-4">
                            ${e[1].blueprint.version}
                          </td>
                          <td class="px-6 py-4">
                            ${e[1].blueprint.type}
                          </td>
                          <td class="px-6 py-4">
                            ${e[1].blueprint.custom_cards&&0!==e[1].blueprint.custom_cards.length?u.qy`
                                ${e[1].blueprint.custom_cards.map(t=>this._checkCustomCard(t))}
                              `:"None"}
                          </td>
                          <td>
                            ${"card"==e[1].blueprint.type||"replace-card"==e[1].blueprint.type?u.qy`
                              <ha-button .blueprint=${e[0]} @click=${this._handleUseBlueprintClicked} unelevated>
                                ${(0,m.A)(this.hass,"blueprint.use")}
                              </ha-button>
                            `:""}
                            <ha-button .blueprint=${e[0]} @click=${this._handleDeleteBlueprintClicked} unelevated>
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
          <strong>${(0,m.A)(this.hass,"blueprint.install")}</strong>
          <p>${(0,m.A)(this.hass,"blueprint.instruction")}</p>
          <a href="https://github.com/dwainscheeren/dwains-dashboard-blueprints" target="_blank">Dwains Dashboard Blueprints Github</a>
          <ha-yaml-editor
            label=${(0,m.A)(this.hass,"blueprint.yaml_code")}
            name="description"
            @value-changed=${this._installBlueprintYamlChanged}
          ><ha-code-editor mode="yaml" autocomplete-entities="" autocomplete-icons="" dir="ltr"></ha-code-editor></ha-yaml-editor>
          <div style="margin-top: 15px; margin-bottom: 20px;">
            <ha-button @click=${this._handleInstallBlueprintClicked} unelevated>
              ${(0,m.A)(this.hass,"blueprint.install")}
            </ha-button>
          </div>
        </div>`}return"hui-card-picker"==this.mode?u.qy`
          <div class="edit-element">
            <h1 style="font-size: 17px; font-weight: bold;">${(0,m.A)(this.hass,"editor.select_popup_card_for")} ${this.entity_id}</h1>
            <dwains-card-picker
              @config-changed=${this.magicStuff}
              .hass=${this.hass}
              .lovelace=${{views:[]}}
              .entityId=${this.entity_id}
            ></dwains-card-picker>
            <div class="card-footer">
              <ha-button slot="secondaryAction" @click=${t=>(0,L.fs)()}>
                ${this.hass.localize("ui.common.cancel")}
              </ha-button>
            </div>
          </div>
        `:u.qy`
          <div class="edit-element">
            ${Bt(u.qy,m.A,this.hass,this.cardConfig,this.blueprints)}
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
              ${this.existingCardEdit?u.qy`
                  <div>
                    <ha-button class="warning" @click=${this._removeCard}>${this.hass.localize("ui.common.remove")}</ha-button>
                    <ha-button class="warning" @click=${t=>this.mode="hui-card-picker"}}>${this.hass.localize("ui.common.previous")}</ha-button>
                  </div>
                `:u.qy`<div></div>`}
              <div>
                <ha-button slot="secondaryAction" @click=${t=>(0,L.fs)()}>
                  ${this.hass.localize("ui.common.cancel")}
                </ha-button>
                <ha-button slot="primaryAction" @click=${this._sendCard}>
                  ${this.hass.localize("ui.common.submit")}
                </ha-button>
              </div>
            </div>
          </div>
        `}}It("dwains-edit-entity-popup-card",zt);var Lt=i(3475);const{websocketReadStore:Ot}=p(),{installBlueprint:Rt}=a(),{ConnectedLoadOwner:Pt}=r(),{hassConnectionIdentity:Mt,hasHassConnectionChanged:Dt}=d(),{defineDwainsElement:Nt}=n(),{refreshLovelaceConfig:Tt}=l(),{dispatchMorePageSaved:jt}=i(6392);class Ht extends u.WF{constructor(){super(),this._connectedLoadOwner=new Pt(t=>this._loadEditor(t),{reportError:(t,e)=>console.error(t,e),errorMessage:"Failed to load more-page editor data"}),this._configReady=!1,this.blueprints={blueprints:{}},this._blueprintsLoading=!0}static get styles(){return[(0,H.F)(u.AH),u.AH`
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
        `]}static get properties(){return{mode:{},blueprints:{},_hass:{},_saving:{state:!0},_saveError:{state:!0}}}set hass(t){const e=Dt(this._hass,t);this._hass=t,e&&(this._connectedLoadOwner.disconnect(),this.isConnected&&this._connectedLoadOwner.connect()),this._startEditorIfReady()}setConfig(t){if(this._editorSessionInitialized)return this._configReady=!0,void this._startEditorIfReady();if(this._editorSessionInitialized=!0,this.mode=t.mode?t.mode:"pre-select",this.foldername=t.foldername?t.foldername:"",t.cardConfig){const e=structuredClone(t.cardConfig);delete e.input_entity,delete e.input_name,this.cardConfig=e}else this.cardConfig="";this.name=t.name?t.name:"",this._nameTouched=!!this.name,this._nameAutoGenerated=!1,this.icon=t.icon?t.icon:"",this.showInNavbar=!!t.showInNavbar&&t.showInNavbar,this._saving=!1,this._saveError=void 0,this._configReady=!0,this._startEditorIfReady()}connectedCallback(){super.connectedCallback(),this._connectedLoadOwner.connect(),this._startEditorIfReady()}disconnectedCallback(){super.disconnectedCallback(),this._connectedLoadOwner.disconnect()}_startEditorIfReady(){this._configReady&&this._hass&&this._connectedLoadOwner.ready()}async _loadEditor({isCurrent:t}){const e=this._hass,i=Mt(e),a=await Ot.read(e,{type:"dwains_dashboard/get_blueprints"});t()&&Mt(this._hass)===i&&(this.blueprints=a?.blueprints?a:{blueprints:{}},this._blueprintsLoading=!1)}_loadBlueprints(){return this._connectedLoadOwner.reload()}magicStuff(t){this.cardConfig=structuredClone(t.detail.config),this._applyDefaultMorePageName(),this.mode="editor-element"}magicStuffSecond(t){}async _sendCard(){if(this._saving)return;this._syncMorePageSettingsFromDom();const t=this.renderRoot?.querySelector("dwains-card-config-editor"),e=await(t?.commitConfig?.()??t?.getConfig?.());if(e&&"object"==typeof e&&(this.cardConfig=e),this._applyDefaultMorePageName(),!this.name)return void alert((0,m.A)(this._hass,"more.name_required"));if(this.showInNavbar&&!this.icon)return void alert((0,m.A)(this._hass,"more.icon_required"));if(!this.cardConfig||"object"!=typeof this.cardConfig)return void(this._saveError=new Error("No valid Lovelace card is configured."));const i=!this.foldername;this._saving=!0,this._saveError=void 0;try{const t=await this._hass.callWS({type:"dwains_dashboard/edit_more_page",card_data:JSON.stringify(this.cardConfig),foldername:this.foldername,name:this.name,icon:this.icon,showInNavbar:this.showInNavbar});if(!t?.foldername)throw new Error("The backend did not return the saved page name.");this.foldername=t.foldername,Ot.invalidate(this._hass);const e=t.view_path||`more_page_${t.foldername}`,a=t.page||{foldername:t.foldername,name:this.name,icon:this.icon,show_in_navbar:this.showInNavbar,card:structuredClone(this.cardConfig)};jt(window,a),i?(await Tt({viewPath:e}),(0,L.fs)(),(0,Lt.oo)(window,`/dwains-dashboard/${e}`)):(0,L.fs)()}catch(t){this._saveError=t,console.error("Failed to save and refresh more page:",t)}finally{this._saving=!1}}_switchMode(t){const e=t.currentTarget.mode;this.mode=e,this.requestUpdate()}_deriveDefaultMorePageName(t=this.cardConfig){if(!t||"object"!=typeof t)return"";const e=[t.title,t.name,t.heading,t.card&&t.card.title,t.card&&t.card.name].find(t=>"string"==typeof t&&t.trim());return e?e.trim():""}_applyDefaultMorePageName(){if(this._nameTouched&&!this._nameAutoGenerated)return;const t=this._deriveDefaultMorePageName();t&&t!==this.name&&(this.name=t,this._nameAutoGenerated=!0)}_syncMorePageSettingsFromDom(){const t=this.shadowRoot?.querySelector("#more-page-name");t&&(this.name=t.value.trim());const e=this.shadowRoot?.querySelector(".more-page-settings ha-icon-picker");e&&void 0!==e.value&&(this.icon=e.value);const i=this.shadowRoot?.querySelector(".more-page-settings ha-checkbox");i&&(this.showInNavbar=i.checked)}_iconPickerChange(t){this.icon=t.detail.value}_showInMainNavbarValueChanged(t){this.showInNavbar=t.target.checked}_nameChanged(t){this.name=t.target.value,this._nameTouched=!0,this._nameAutoGenerated=!1}async _removeMorePage(){if(!this._saving){this._saving=!0,this._saveError=void 0;try{await this._hass.callWS({type:"dwains_dashboard/remove_more_page",foldername:this.foldername}),Ot.invalidate(this._hass),await Tt(),(0,L.fs)(),(0,Lt.oo)(window,"/dwains-dashboard/more_page")}catch(t){this._saveError=t,console.error("Failed to remove and refresh more page:",t)}finally{this._saving=!1}}}_handleDeleteBlueprintClicked(t){const e=t.currentTarget.blueprint;this._hass.callWS({type:"dwains_dashboard/delete_blueprint",blueprint:e}).then(t=>{Ot.invalidate(this._hass),this._loadBlueprints(),this.requestUpdate()},t=>{console.error("Message failed!",t)})}_handleUseBlueprintClicked(t){const e=t.currentTarget.blueprint;this.mode="editor-element",this.name=this.blueprints.blueprints[e].blueprint.name,this.cardConfig={type:"custom:dwains-blueprint-card",blueprint:e,card:this.blueprints.blueprints[e].card}}_installBlueprintYamlChanged(t){this.installBlueprintYaml=t.target.value}_handleInstallBlueprintClicked(t){Rt({hass:this._hass,yamlCode:this.installBlueprintYaml,translate:t=>(0,m.A)(this._hass,t),onInstalled:()=>{Ot.invalidate(this._hass),this._loadBlueprints(),this.requestUpdate()}})}_checkCustomCard(t){const e=customElements.get(t);return u.qy`
        <div>
        ${e?u.qy`
            <ha-icon
            style="color: green;"
            .icon=${"mdi:check-bold"}
            ></ha-icon>`:u.qy`
            <ha-icon
            style="color: red;"
            .icon=${"mdi:close-thick"}
            ></ha-icon>
            `}
        ${t}
        ${e?u.qy`(${(0,m.A)(this._hass,"blueprint.installed")})`:u.qy`(${(0,m.A)(this._hass,"blueprint.not_installed")})`}
        </div>
    `}render(){if("pre-select"==this.mode)return u.qy`
        <ha-md-list>
            <ha-md-list-item type="button" .mode=${"hui-card-picker"} @click=${this._switchMode}>
              <span slot="headline">${(0,m.A)(this._hass,"editor.lovelace_card")}</span>
              <span slot="supporting-text">${(0,m.A)(this._hass,"editor.create_lovelace_card")}</span>
            </ha-md-list-item>
            <li divider role="separator"></li>
            <ha-md-list-item type="button" .mode=${"dwains-dashboard-blueprint-select"} @click=${this._switchMode}>
              <span slot="headline">${(0,m.A)(this._hass,"editor.dwains_dashboard_blueprint")}</span>
              <span slot="supporting-text">${(0,m.A)(this._hass,"editor.use_dwains_dashboard_blueprint")}</span>
              <ha-icon-next slot="end"></ha-icon-next>
            </ha-md-list-item>
        </ha-md-list>
        `;if("dwains-dashboard-blueprint-select"==this.mode){if(this._blueprintsLoading)return u.qy`<div class="edit-element"><ha-spinner></ha-spinner></div>`;const t=Object.entries(this.blueprints.blueprints).sort(function(t,e){let i=t[1].blueprint.type,a=e[1].blueprint.type;return i==a?0:i>a?1:-1});return u.qy`
        <div class="edit-element">

        <div style="margin-bottom: 20px;">
            <ha-button .mode=${"pre-select"} @click=${this._switchMode}>< ${this._hass.localize("ui.common.previous")}</ha-button>
        </div>

        <strong>${(0,m.A)(this._hass,"blueprint.installed_blueprints")}:</strong>
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this._hass,"blueprint.title")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this._hass,"global.version")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this._hass,"blueprint.type")}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${(0,m.A)(this._hass,"blueprint.used_custom_cards")}</th>
                <th scope="col" class="relative px-6 py-3">
                </th>
            </tr>
            </thead>
            <tbody>
            ${0==Object.values(this.blueprints.blueprints).length?u.qy`
                <tr>
                <td  class="px-6 py-4" colspan="5">${(0,m.A)(this._hass,"blueprint.no_blueprints_installed")}</td>
                </tr>`:u.qy`
                ${Object.entries(t).map(([t,e])=>u.qy`
                        <tr class="bg-white">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <h3>${e[1].blueprint.name}</h3>
                            ${e[1].blueprint.description}
                        </td>
                        <td class="px-6 py-4">
                            ${e[1].blueprint.version}
                        </td>
                        <td class="px-6 py-4">
                            ${e[1].blueprint.type}
                        </td>
                        <td class="px-6 py-4">
                            ${e[1].blueprint.custom_cards&&0!==e[1].blueprint.custom_cards.length?u.qy`
                                ${e[1].blueprint.custom_cards.map(t=>this._checkCustomCard(t))}
                            `:"None"}
                        </td>
                        <td>
                            ${"page"==e[1].blueprint.type?u.qy`
                            <ha-button .blueprint=${e[0]} @click=${this._handleUseBlueprintClicked} unelevated>
                                ${(0,m.A)(this._hass,"blueprint.use")}
                            </ha-button>
                            `:""}
                            <ha-button .blueprint=${e[0]} @click=${this._handleDeleteBlueprintClicked} unelevated>
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
        <strong>${(0,m.A)(this._hass,"blueprint.install")}</strong>
        <p>${(0,m.A)(this._hass,"blueprint.instruction")}</p>
        <a href="https://github.com/dwainscheeren/dwains-dashboard-blueprints" target="_blank">Dwains Dashboard Blueprints Github</a>
        <ha-yaml-editor
            label=${(0,m.A)(this._hass,"blueprint.yaml_code")}
            name="description"
            @value-changed=${this._installBlueprintYamlChanged}
        ><ha-code-editor mode="yaml" autocomplete-entities="" autocomplete-icons="" dir="ltr"></ha-code-editor></ha-yaml-editor>
        <div style="margin-top: 15px; margin-bottom: 20px;">
            <ha-button @click=${this._handleInstallBlueprintClicked} unelevated>
            ${(0,m.A)(this._hass,"blueprint.install")}
            </ha-button>
        </div>
        </div>`}return"hui-card-picker"==this.mode?u.qy`
        <div class="edit-element">
            <h1 style="font-size: 17px; font-weight: bold;">${(0,m.A)(this._hass,"editor.select_card_for")} ${this.name}</h1>
            <dwains-card-picker
            @config-changed=${this.magicStuff}
            .hass=${this._hass}
            .lovelace=${{views:[]}}
            ></dwains-card-picker>
        </div>
        `:"editor-element"==this.mode?u.qy`
        <div class="edit-element">
            <div class="more-page-settings-title">${(0,m.A)(this._hass,"more.edit")}</div>
            <div class="more-page-name-field">
            <label class="more-page-name-label" for="more-page-name">${(0,m.A)(this._hass,"more.name")}</label>
            <input
                id="more-page-name"
                class="more-page-name-input"
                type="text"
                .value=${this.name}
                placeholder=${(0,m.A)(this._hass,"more.name")}
                @input=${this._nameChanged}
            />
            </div>
            <div class="more-page-settings">
            <ha-icon-picker
                label=${(0,m.A)(this._hass,"more.icon")}
                .value=${this.icon}
                @value-changed=${this._iconPickerChange}
            ></ha-icon-picker>
            <label class="dd-check" @click=${H.H}>
              <ha-checkbox
                @change=${this._showInMainNavbarValueChanged}
                .checked=${this.showInNavbar}
                ></ha-checkbox>
              <span>${(0,m.A)(this._hass,"more.add_navbar")}</span>
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
            ${this._saveError?u.qy`<div class="save-error" role="alert">${this._saveError.message||this._saveError}</div>`:""}
            <div class="card-footer">
            ${this.foldername?u.qy`<ha-button @click=${this._removeMorePage}>${this._hass.localize("ui.common.remove")}</ha-button>`:""}
            <ha-button .disabled=${this._saving} @click=${this._sendCard}>
              ${this._saving?u.qy`<ha-spinner size="small"></ha-spinner>`:this._hass.localize("ui.common.submit")}
            </ha-button>
            </div>
        </div>
        `:void 0}}Nt("dwains-edit-more-page-card",Ht)}}]);