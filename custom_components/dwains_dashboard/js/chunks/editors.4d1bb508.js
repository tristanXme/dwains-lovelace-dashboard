"use strict";(self.webpackChunkdwains_dashboard=self.webpackChunkdwains_dashboard||[]).push([[723],{870(e,t,i){var a=i.cw(function(e,t){e.exports={areaSensorChoices:function({deviceClasses:e,areaSensorIds:t,chosenIds:i,deviceClassOf:a}){const s=new Set(e),r=[...new Set([...t,...i])];return{types:e.map(e=>({deviceClass:e,sensors:r.filter(t=>a(t)===e),averaged:t.filter(t=>a(t)===e).length,chosen:i.find(t=>a(t)===e)})).filter(e=>e.sensors.length),extras:i.filter(e=>!s.has(a(e))),extraCandidates:r.filter(e=>!s.has(a(e)))}},chooseExtraSensors:function(e,t,i,a){const s=new Set(i);return[...e.filter(e=>s.has(a(e))),...t]},chooseTypeSensor:function(e,t,i,a){const s=e.filter(e=>a(e)!==t);return i?[...s,i]:s}}}),s=i.cw(function(e,t){const{errorText:i}=c(),a=[["Blueprint is not valid YAML","blueprint.error_invalid_yaml"],["Blueprint must be a YAML mapping","blueprint.error_not_mapping"],["Blueprint has invalid data","blueprint.error_no_blueprint_section"],["Blueprint has no card","blueprint.error_no_card"],["Blueprint has no usable name","blueprint.error_no_name"]];function s(e,t){const s=i(e),r=a.find(([e])=>s.startsWith(e));if(!r)return s;const n=s.slice(r[0].length).replace(/^:\s*/,"");return n?`${t(r[1])}: ${n}`:t(r[1])}e.exports={installBlueprint:async function({hass:e,yamlCode:t,translate:i,notify:a=e=>window.alert(e),onInstalled:r=()=>{}}){if("string"!=typeof t||!t.trim())return a(i("blueprint.yaml_required")),!1;let n;try{n=await e.callWS({type:"dwains_dashboard/install_blueprint",yamlCode:t})}catch(e){return a(`${i("blueprint.install_failed")}: ${s(e,i)}`),!1}if(!n?.succesfull)return a(`${i("blueprint.install_failed")}: ${s(n?.error??"unknown error",i)}`),!1;a(e.localize("ui.common.successfully_saved"));try{await r(n.succesfull)}catch(e){console.error("Dwains Dashboard: failed to refresh after installing a blueprint",e)}return!0}}}),r=i.cw(function(e,t){function i(e){return"string"==typeof e?.blueprint&&e.blueprint.length>0}function a(e,t){if(!i(e))return;const a=e.blueprint,s=t?.blueprints?.[a],r=s?.blueprint||{};return{id:a,installed:Boolean(s),name:r.name||a,description:r.description||"",version:r.version??""}}e.exports={prepareEntityEditorCardConfig:function(e,t){if(!e||"object"!=typeof e)return"";const a=structuredClone(e);return i(a)?a.input_entity=t:(delete a.input_entity,delete a.input_name),a},renderBlueprintSelection:function(e,t,i,s,r){const n=a(s,r);if(!n)return"";const o="color:var(--secondary-text-color);font-size:.85rem";return e`
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
  `}}}),n=i.cw(function(e,t){e.exports={ConnectedLoadOwner:class{constructor(e,{reportError:t,errorMessage:i="Connected load failed"}={}){if("function"!=typeof e)throw new TypeError("ConnectedLoadOwner requires a load function");this._load=e,this._reportError=t,this._errorMessage=i,this._connected=!1,this._ready=!1,this._loaded=!1,this._pending=void 0,this._generation=0,this._abortController=void 0}connect(){return this._connected=!0,this._start()}ready(){return this._ready=!0,this._start()}reload(){return this._abortController?.abort("reload"),this._abortController=void 0,this._loaded=!1,this._pending=void 0,this._generation+=1,this._start()}disconnect(){this._abortController?.abort("disconnect"),this._abortController=void 0,this._connected=!1,this._loaded=!1,this._pending=void 0,this._generation+=1}_start(){if(!this._connected||!this._ready||this._loaded)return;if(this._pending)return this._pending;const e=++this._generation,t=new AbortController;this._abortController=t;const i=()=>this._connected&&e===this._generation,a=Promise.resolve().then(()=>this._load({isCurrent:i,signal:t.signal})).then(e=>(i()&&(this._loaded=!0),e),e=>{throw e}).finally(()=>{this._pending===a&&(this._pending=void 0),this._abortController===t&&(this._abortController=void 0)});return this._pending=a,"function"==typeof this._reportError&&a.catch(e=>this._reportError(this._errorMessage,e)),a}}}}),o=()=>i(1415),d=()=>i(9823),l=()=>i(9187),c=()=>i(217),h=i.cw(function(e,t){e.exports={readSelectEvent:function(e){const t=e?.currentTarget||e?.target,i=t?.name||t?.dataset?.field||t?.type;let a=e?.detail?.value;if(void 0===a&&void 0!==e?.detail?.index){const i=e.detail.index;a=t?.children?.[i]?.value??t?.items?.[i]?.value}return void 0===a&&e?.target!==t&&(a=e?.target?.value),a??=t?.value??t?.selectedValue,{field:i,value:a}}}}),p=()=>i(7069),u=i(6684),m=i(1621);const{loadCardHelpers:g}=i(393),{defineDwainsElement:b}=o(),_=Object.freeze({views:Object.freeze([])}),y=new Set(["button","entity","gauge","light","media-control","picture-entity","sensor","thermostat","weather-forecast","custom:button-card","custom:mushroom-cover-card","custom:mushroom-entity-card","custom:mushroom-fan-card","custom:mushroom-light-card"]),v=new Set(["calendar","history-graph"]);function f(e){return!e||Array.isArray(e.views)&&0===e.views.length?_:e}const w=Object.freeze([["alarm-panel","Alarm panel"],["area","Area"],["button","Button"],["calendar","Calendar"],["conditional","Conditional"],["entities","Entities"],["entity","Entity"],["entity-filter","Entity filter"],["gauge","Gauge"],["glance","Glance"],["grid","Grid"],["heading","Heading"],["history-graph","History graph"],["horizontal-stack","Horizontal stack"],["humidifier","Humidifier"],["iframe","Web page"],["light","Light"],["logbook","Logbook"],["map","Map"],["markdown","Markdown"],["media-control","Media control"],["picture","Picture"],["picture-elements","Picture elements"],["picture-entity","Picture entity"],["plant-status","Plant status"],["sensor","Sensor"],["shopping-list","Shopping list"],["statistic","Statistic"],["statistics-graph","Statistics graph"],["thermostat","Thermostat"],["tile","Tile"],["todo-list","To-do list"],["vertical-stack","Vertical stack"],["weather-forecast","Weather forecast"]]);function $(e,t){e.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}function x(e){return e&&"object"==typeof e?structuredClone(e):e}function C(e){return JSON.stringify(e)}function k(e=window){const t=Array.isArray(e.customCards)?e.customCards:[],i=new Set;return t.map(e=>{const t="string"==typeof e?.type?e.type.trim():"";if(!t)return;const a=t.startsWith("custom:")?t:`custom:${t}`;return i.has(a)?void 0:(i.add(a),[a,e.name||t])}).filter(Boolean).sort((e,t)=>e[1].localeCompare(t[1]))}function S(e,t,i=customElements){const a=i?.get?.(function(e){return e.startsWith("custom:")?e.slice(7):`hui-${e}-card`}(e));return a||t?.constructor}function A(e,t,i){if(!e||"object"!=typeof e||!i)return e;const a=x(e);return y.has(t)||t.startsWith("custom:")&&Object.hasOwn(a,"entity")?a.entity=i:v.has(t)&&(a.entities=[i]),a}function E(e,t){const i=Object.keys(e?.states||{})[0],a=(t,i)=>function(e,t,i=()=>!0){const a=new Set(Array.isArray(t)?t:[t]);return Object.entries(e?.states||{}).find(([e,t])=>a.has(e.split(".",1)[0])&&i(t))?.[0]}(e,t,i),s=e=>e&&Number.isFinite(Number.parseFloat(e.state)),r={type:"button",name:"Button"},n={"alarm-panel":()=>{const e=a("alarm_control_panel");return e&&{type:t,entity:e}},button:()=>r,calendar:()=>{const e=a("calendar");return e&&{type:t,entities:[e]}},entities:()=>i&&{type:t,entities:[i]},entity:()=>i&&{type:t,entity:i},"entity-filter":()=>i&&{type:t,entities:[i],state_filter:["on"]},gauge:()=>{const e=a(["sensor","number","input_number"],s);return e&&{type:t,entity:e}},glance:()=>i&&{type:t,entities:[i]},grid:()=>({type:t,cards:[r]}),heading:()=>({type:t,heading:"Heading"}),"history-graph":()=>i&&{type:t,entities:[i]},"horizontal-stack":()=>({type:t,cards:[r]}),humidifier:()=>{const e=a("humidifier");return e&&{type:t,entity:e}},light:()=>{const e=a("light");return e&&{type:t,entity:e}},logbook:()=>i&&{type:t,entities:[i]},map:()=>{const e=a(["device_tracker","person"]);return e&&{type:t,entities:[e]}},markdown:()=>({type:t,content:"**Markdown**"}),"media-control":()=>{const e=a("media_player");return e&&{type:t,entity:e}},"picture-entity":()=>i&&{type:t,entity:i},"plant-status":()=>{const e=a("plant");return e&&{type:t,entity:e}},sensor:()=>{const e=a("sensor");return e&&{type:t,entity:e}},statistic:()=>{const e=a("sensor",s);return e&&{type:t,entity:e}},"statistics-graph":()=>{const e=a("sensor",s);return e&&{type:t,entities:[e]}},thermostat:()=>{const e=a("climate");return e&&{type:t,entity:e}},tile:()=>i&&{type:t,entity:i},"todo-list":()=>{const e=a("todo");return e&&{type:t,entity:e}},"vertical-stack":()=>({type:t,cards:[r]}),"weather-forecast":()=>{const e=a("weather");return e&&{type:t,entity:e}}};return n[t]?.()}async function q(e,t,i){const a={type:t},s=await g();let r;try{r=await s.createCardElement(x(a))}catch(e){console.warn(`Unable to instantiate ${t} while loading its defaults`,e)}const n=S(t,r),o=n?.getStubConfig;if("function"!=typeof o)return A(a,t,i);try{const s=Object.keys(e?.states||{}),r=i&&s.includes(i)?[i,...s.filter(e=>e!==i)]:s,d=await o.call(n,e,r,[]);return A(d&&"object"==typeof d?{type:t,...d}:a,t,i)}catch(e){return console.warn(`Unable to create a default configuration for ${t}`,e),A(a,t,i)}}class I extends u.WF{static properties={hass:{attribute:!1},lovelace:{attribute:!1},entityId:{attribute:!1},_filter:{state:!0},_manualType:{state:!0},_selecting:{state:!0},_error:{state:!0}};constructor(){super(),this._filter="",this._manualType="",this._selecting=!1,this._previewGeneration=0,this._previewConfigs=new Map,this._selectionConfigs=new Map,this._previewObserver=void 0,this._pointerStart=void 0,this._pointerMoved=!1}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this._previewGeneration+=1,this._previewObserver?.disconnect(),this._previewObserver=void 0}shouldUpdate(e){if(1!==e.size||!e.has("hass"))return!0;const t=e.get("hass");if(!t)return!0;const i=e=>e?.selectedLanguage||e?.language||e?.locale?.language;return i(t)!==i(this.hass)||(this.renderRoot?.querySelectorAll?.("[data-card-preview] > *").forEach(e=>{"hass"in e&&(e.hass=this.hass)}),!1)}firstUpdated(){this._observePreviews()}updated(e){(e.has("_filter")||e.has("hass"))&&this._observePreviews()}_localizedCardName(e,t){return e.startsWith("custom:")?t:this.hass?.localize?.(`ui.panel.lovelace.editor.card.${e}.name`)||t}_localizedCardDescription(e){if(e.startsWith("custom:")){const t=e.slice(7),i=(window.customCards||[]).find(i=>i?.type===t||i?.type===e);return i?.description||e}return this.hass?.localize?.(`ui.panel.lovelace.editor.card.${e}.description`)||e}_observePreviews(){this._previewObserver?.disconnect();const e=this.renderRoot?.querySelectorAll?.("[data-card-preview]");if(!e?.length)return;const t=e=>{const t=e.dataset.cardPreview;t&&this._loadPreview(t,e)};"function"==typeof IntersectionObserver?(this._previewObserver=new IntersectionObserver((e,i)=>{for(const a of e)a.isIntersecting&&(i.unobserve(a.target),t(a.target))},{rootMargin:"160px"}),e.forEach(e=>this._previewObserver.observe(e))):e.forEach(t)}_showPreviewDescription(e,t){const i=document.createElement("span");i.className="preview-description",i.textContent=this._localizedCardDescription(e),t.replaceChildren(i)}async _loadPreview(e,t){if("true"===t.dataset.previewLoading)return;t.dataset.previewLoading="true";const i=this._previewGeneration;try{const a=e.startsWith("custom:")?(window.customCards||[]).find(t=>t?.type===e||t?.type===e.slice(7)):void 0,s=this._previewConfigs.get(e)||(a?.preview?await q(this.hass,e):E(this.hass,e));if(!s)return void(this.isConnected&&t.isConnected&&this._showPreviewDescription(e,t));this._previewConfigs.set(e,s);const r=await g(),n=await r.createCardElement(x(s));if("HUI-ERROR-CARD"===n?.tagName)throw new Error(`Home Assistant rejected the preview for ${e}`);if(!this.isConnected||i!==this._previewGeneration||!t.isConnected)return;n.hass=this.hass,n.tabIndex=-1,t.replaceChildren(n)}catch(a){if(!this.isConnected||i!==this._previewGeneration||!t.isConnected)return;this._showPreviewDescription(e,t),console.warn(`Unable to preview Lovelace card ${e}`,a)}}_cards(){return[...w,...k()]}async _selectType(e){if(!this._selecting&&e){this._selecting=!0,this._error=void 0;try{const t=`${this.entityId||""}\0${e}`,i=this._selectionConfigs.get(t)||await q(this.hass,e,this.entityId);this._selectionConfigs.set(t,i),$(this,i)}catch(t){this._error=t instanceof Error?t.message:String(t),console.error(`Unable to select Lovelace card ${e}`,t)}finally{this._selecting=!1}}}_cardClicked(e){if(!this._selecting)return this._pointerMoved?(e.preventDefault(),e.stopPropagation(),void(this._pointerMoved=!1)):void this._selectType(e.currentTarget.dataset.type)}_cardKeyDown(e){"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._cardClicked(e))}_cardPointerDown(e){this._pointerStart={x:e.clientX,y:e.clientY},this._pointerMoved=!1}_cardPointerMove(e){if(!this._pointerStart||this._pointerMoved)return;const t=Math.abs(e.clientX-this._pointerStart.x),i=Math.abs(e.clientY-this._pointerStart.y);(t>8||i>8)&&(this._pointerMoved=!0)}_cardPointerCancel(){this._pointerStart=void 0,this._pointerMoved=!1}_stopPreviewEvent(e){e.stopPropagation()}_manualSubmit(){let e=this._manualType.trim();e&&!e.includes(":")&&(e=`custom:${e}`),this._selectType(e)}render(){const e=this._filter.trim().toLowerCase(),t=this._cards().map(([e,t])=>({type:e,name:this._localizedCardName(e,t)})).filter(({type:t,name:i})=>!e||t.toLowerCase().includes(e)||i.toLowerCase().includes(e));return u.qy`
      <div class="controls">
        <input
          type="search"
          placeholder="${this.hass?.localize?.("ui.common.search")||"Search"}"
          .value=${this._filter}
          @input=${e=>{this._filter=e.target.value}}
        />
      </div>
      <div class="cards">
        ${t.map(({type:e,name:t})=>u.qy`
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
  `}class z extends u.WF{static properties={hass:{attribute:!1},lovelace:{attribute:!1},value:{attribute:!1},_fallbackText:{state:!0},_error:{state:!0},_loading:{state:!0}};constructor(){super(),this._generation=0,this._loading=!1,this._editor=void 0,this._loadedType=void 0,this._lastEmittedSignature=void 0,this._currentValue=void 0,this._currentSignature=void 0}disconnectedCallback(){super.disconnectedCallback(),this._generation+=1,this._editor=void 0,this._loadedType=void 0}updated(e){if(e.has("hass")&&this._editor&&(this._editor.hass=this.hass),e.has("lovelace")&&this._editor){const e=f(this.lovelace);this._editor.lovelace!==e&&(this._editor.lovelace=e)}if(!e.has("value"))return;const t=x(this.value),i=C(t);i!==this._lastEmittedSignature&&i!==this._currentSignature?(this._currentValue=t,this._currentSignature=i,this._editor&&this._loadedType===this.value?.type?this._editor.setConfig(x(t)):this._loadEditor()):this._lastEmittedSignature=void 0}async _loadEditor(){if(!this.isConnected||!this.hass||!this.value?.type)return;const e=++this._generation;this._loading=!0,this._error=void 0,this._fallbackText=void 0;try{const t=await g();let i,a;try{i=await t.createCardElement(x(this.value))}catch(e){a=e}const s=S(this.value.type,i);if(!s&&a)throw a;const r=s?.getConfigElement,n="function"==typeof r?await r.call(s):void 0;if(!this.isConnected||e!==this._generation)return;if(!n||"function"!=typeof n.setConfig)return void(this._fallbackText=JSON.stringify(this.value,null,2));if(await this.updateComplete,!this.isConnected||e!==this._generation)return;n.hass=this.hass,n.lovelace=f(this.lovelace),n.setConfig(x(this.value)),n.addEventListener("config-changed",e=>{if(e.stopPropagation(),e.detail?.config){const t=x(e.detail.config),i=C(t);this._currentValue=t,this._currentSignature=i,this._lastEmittedSignature=i,$(this,x(t))}}),this.renderRoot.querySelector("#editor")?.replaceChildren(n),this._editor=n,this._loadedType=this.value.type}catch(t){if(!this.isConnected||e!==this._generation)return;this._error=t instanceof Error?t.message:String(t),this._fallbackText=JSON.stringify(this.value,null,2),console.error(`Unable to load the editor for ${this.value.type}`,t)}finally{e===this._generation&&(this._loading=!1)}}_fallbackChanged(e){this._fallbackText=e.target.value;try{const e=JSON.parse(this._fallbackText);this._error=void 0,this._currentValue=x(e),this._currentSignature=C(e),this._lastEmittedSignature=this._currentSignature,$(this,x(e))}catch(e){this._error=e instanceof Error?e.message:String(e)}}getConfig(){const e=this._currentValue??this.value;return e&&"object"==typeof e?structuredClone(e):e}async commitConfig(){return function(e){let t=e?.activeElement;for(;t?.shadowRoot?.activeElement;)t=t.shadowRoot.activeElement;return t}(this.renderRoot)?.blur?.(),await Promise.resolve(),this._editor?.updateComplete&&await this._editor.updateComplete,await Promise.resolve(),await this.updateComplete,this.getConfig()}render(){return u.qy`
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
  `}class P extends u.WF{static properties={hass:{attribute:!1},config:{attribute:!1},_error:{state:!0}};constructor(){super(),this._generation=0,this._card=void 0,this._loadedType=void 0}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this._generation+=1,this._card=void 0,this._loadedType=void 0}updated(e){e.has("hass")&&this._card&&(this._card.hass=this.hass),(e.has("config")||e.has("hass")&&!this._card)&&this._loadPreview()}async _loadPreview(){if(!this.isConnected||!this.hass||!this.config?.type)return;const e=++this._generation;if(this._error=void 0,this._card&&this._loadedType===this.config.type&&"function"==typeof this._card.setConfig)try{if(await this._card.setConfig(x(this.config)),!this.isConnected||e!==this._generation)return;return void(this._card.hass=this.hass)}catch(e){console.warn(`Unable to update preview ${this.config.type} in place`,e)}try{const t=await g(),i=await t.createCardElement(x(this.config));if(!this.isConnected||e!==this._generation)return;if(await this.updateComplete,!this.isConnected||e!==this._generation)return;i.hass=this.hass,this.renderRoot.querySelector("#preview")?.replaceChildren(i),this._card=i,this._loadedType=this.config.type}catch(t){if(!this.isConnected||e!==this._generation)return;this._error=t instanceof Error?t.message:String(t),console.error(`Unable to preview ${this.config.type}`,t)}}render(){return u.qy`<div id="preview"></div>${this._error?u.qy`<p>${this._error}</p>`:""}`}static styles=u.AH`
    :host { display: block; width: 100%; margin-top: 16px; }
    p { color: var(--error-color); overflow-wrap: anywhere; }
  `}b("dwains-card-picker",I),b("dwains-card-config-editor",z),b("dwains-card-preview",P);var B=i(4743),L=i(2786);const{readSelectEvent:N}=h(),{websocketReadStore:O}=p(),{installBlueprint:M}=s(),{ConnectedLoadOwner:T}=n(),{hassConnectionIdentity:D,hasHassConnectionChanged:R}=l(),{defineDwainsElement:H}=o();class U extends u.WF{constructor(){super(),this._connectedLoadOwner=new T(e=>this._loadEditor(e),{reportError:(e,t)=>console.error(e,t),errorMessage:"Failed to load custom-card editor data"}),this._configReady=!1}set hass(e){const t=R(this._hass,e);this._hass=e,t&&(this._connectedLoadOwner.disconnect(),this.isConnected&&this._connectedLoadOwner.connect()),this._startEditorIfReady()}get hass(){return this._hass}static get styles(){return[u.AH`
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
        `]}static get properties(){return{mode:{},blueprints:{}}}setConfig(e){if(this._editorSessionInitialized)return this._configReady=!0,void this._startEditorIfReady();if(this._editorSessionInitialized=!0,this.mode=e.mode?e.mode:"pre-select",this.area_id=e.area?e.area:"",this.domain=e.domain?e.domain:"",this.position=e.position,this.page=e.page,e.cardConfig){const t=structuredClone(e.cardConfig);delete t.input_entity,delete t.input_name,this.cardConfig=t}else this.cardConfig="";this.filename=e.filename?e.filename.replace(".yaml",""):"",this.name=e.name?e.name:"Dwains Dashboard",this.rowSpan=e.rowSpan?e.rowSpan:"1",this.colSpan=e.colSpan?e.colSpan:"1",this.rowSpanLg=e.rowSpanLg?e.rowSpanLg:"1",this.colSpanLg=e.colSpanLg?e.colSpanLg:"1",this.rowSpanXl=e.rowSpanXl?e.rowSpanXl:"1",this.colSpanXl=e.colSpanXl?e.colSpanXl:"1",this._configReady=!0,this._startEditorIfReady()}connectedCallback(){super.connectedCallback(),this._connectedLoadOwner.connect(),this._startEditorIfReady()}disconnectedCallback(){super.disconnectedCallback(),this._connectedLoadOwner.disconnect()}_startEditorIfReady(){this._configReady&&this._hass&&this._connectedLoadOwner.ready()}async _loadEditor({isCurrent:e}){const t=this._hass,i=D(t),a=await O.read(t,{type:"dwains_dashboard/get_blueprints"});e()&&D(this._hass)===i&&(this.blueprints=a)}_loadBlueprints(){return this._connectedLoadOwner.reload()}magicStuff(e){this.cardConfig=structuredClone(e.detail.config),this.mode="editor-element"}magicStuffSecond(e){}async _sendCard(){const e=this.renderRoot?.querySelector("dwains-card-config-editor"),t=await(e?.commitConfig?.()??e?.getConfig?.());t&&"object"==typeof t&&(this.cardConfig=t),this.shadowRoot?.querySelectorAll("ha-select").forEach(e=>{const t=e.name||e.type;t&&void 0!==e.value&&(this[t]=`${e.value}`)});const i=JSON.stringify(this.cardConfig);this.hass.callWS({type:"dwains_dashboard/add_card",card_data:i,area_id:this.area_id,domain:this.domain,position:this.position,filename:this.filename,page:this.page,rowSpan:this.rowSpan,colSpan:this.colSpan,rowSpanLg:this.rowSpanLg,colSpanLg:this.colSpanLg,rowSpanXl:this.rowSpanXl,colSpanXl:this.colSpanXl}).then(e=>{(0,L.fs)()},e=>{(0,B.Ny)(this.hass,e)})}_removeCard(){(0,B.v7)(this.hass)&&this.hass.callWS({type:"dwains_dashboard/remove_card",area_id:this.area_id,domain:this.domain,filename:this.filename,page:this.page}).then(e=>{(0,L.fs)()},e=>{(0,B.Ny)(this.hass,e)})}_switchMode(e){const t=e.currentTarget.mode;this.mode=t,this.requestUpdate()}_handleDeleteBlueprintClicked(e){const t=e.currentTarget.blueprint;(0,B.v7)(this.hass,t)&&this.hass.callWS({type:"dwains_dashboard/delete_blueprint",blueprint:t}).then(e=>{O.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()},e=>{(0,B.Ny)(this.hass,e)})}_handleUseBlueprintClicked(e){const t=e.currentTarget.blueprint;this.mode="editor-element",this.name=this.blueprints.blueprints[t].blueprint.name,this.cardConfig={type:"custom:dwains-blueprint-card",blueprint:t,card:this.blueprints.blueprints[t].card}}_installBlueprintYamlChanged(e){this.installBlueprintYaml=e.target.value}_handleInstallBlueprintClicked(e){M({hass:this.hass,yamlCode:this.installBlueprintYaml,translate:e=>(0,m.A)(this.hass,e),onInstalled:()=>(O.invalidate(this.hass),this.requestUpdate(),this._loadBlueprints())})}_haSelectChanged(e){e.stopPropagation();const{field:t,value:i}=N(e);t&&void 0!==i&&(this[t]=`${i}`,this.requestUpdate())}_stopPropagation(e){e.stopPropagation()}_checkCustomCard(e){const t=customElements.get(e);return u.qy`
        <div>
          ${t?u.qy`
            <ha-icon
              style="color: green;"
              .icon=${"mdi:check-bold"}
            ></ha-icon>`:u.qy`
            <ha-icon
              style="color: red;"
              .icon=${"mdi:close-thick"}
            ></ha-icon>
            `}
          ${e}
          ${t?u.qy`(${(0,m.A)(this.hass,"blueprint.installed")})`:u.qy`(${(0,m.A)(this.hass,"blueprint.not_installed")})`}
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
        `;if("dwains-dashboard-blueprint-select"==this.mode){const e=Object.entries(this.blueprints.blueprints).sort(function(e,t){let i=e[1].blueprint.type,a=t[1].blueprint.type;return i==a?0:i>a?1:-1});return u.qy`
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
              ${0==Object.values(e).length?u.qy`
                <tr>
                  <td  class="px-6 py-4" colspan="5">${(0,m.A)(this.hass,"blueprint.no_blueprints_installed")}</td>
                </tr>`:u.qy`
                ${Object.entries(e).map(([e,t])=>u.qy`
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
                            ${t[1].blueprint.custom_cards&&0!==t[1].blueprint.custom_cards.length?u.qy`
                                ${t[1].blueprint.custom_cards.map(e=>this._checkCustomCard(e))}
                              `:"None"}
                          </td>
                          <td>
                            ${"card"==t[1].blueprint.type?u.qy`
                              <ha-button .blueprint=${t[0]} @click=${this._handleUseBlueprintClicked} unelevated>
                                ${(0,m.A)(this.hass,"blueprint.use")}
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
              <ha-button appearance="plain" slot="secondaryAction" @click=${e=>(0,L.fs)()}>
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
        `:void 0}}H("dwains-create-custom-card-card",U);var j=i(5890),W=i(3312);const{websocketReadStore:X}=p(),{installBlueprint:V}=s(),{ConnectedLoadOwner:F}=n(),{hassConnectionIdentity:G,hasHassConnectionChanged:Y}=l(),{prepareEntityEditorCardConfig:J,renderBlueprintSelection:K}=r(),{defineDwainsElement:Q}=o();class Z extends u.WF{constructor(){super(),this._connectedLoadOwner=new F(e=>this._loadEditor(e),{reportError:(e,t)=>console.error(e,t),errorMessage:`Failed to load ${this.constructor.target.name} editor data`}),this._configReady=!1}set hass(e){const t=Y(this._hass,e);this._hass=e,t&&(this._connectedLoadOwner.disconnect(),this.isConnected&&this._connectedLoadOwner.connect()),this._startEditorIfReady()}get hass(){return this._hass}static get styles(){return[u.AH`
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
        `]}static get properties(){return{mode:{},blueprints:{}}}setConfig(e){if(this._editorSessionInitialized)return this._configReady=!0,void this._startEditorIfReady();this._editorSessionInitialized=!0,this._applyConfig(e),this.existingCardEdit=!!e.existingCardEdit&&e.existingCardEdit,this._configReady=!0,this._startEditorIfReady()}connectedCallback(){super.connectedCallback(),this._connectedLoadOwner.connect(),this._startEditorIfReady()}disconnectedCallback(){super.disconnectedCallback(),this._connectedLoadOwner.disconnect()}_startEditorIfReady(){this._configReady&&this._hass&&this._connectedLoadOwner.ready()}async _loadEditor({isCurrent:e}){const t=this._hass,i=G(t),a=await X.read(t,{type:"dwains_dashboard/get_blueprints"});e()&&G(this._hass)===i&&(this.blueprints=a)}_loadBlueprints(){return this._connectedLoadOwner.reload()}_switchMode(e){const t=e.currentTarget.mode;this.mode=t,this.requestUpdate()}_removeCard(){(0,B.v7)(this.hass)&&this.hass.callWS({type:this.constructor.target.remove,...this._targetId()}).then(e=>{(0,L.fs)()},e=>{(0,B.Ny)(this.hass,e)})}_handleDeleteBlueprintClicked(e){const t=e.currentTarget.blueprint;(0,B.v7)(this.hass,t)&&this.hass.callWS({type:"dwains_dashboard/delete_blueprint",blueprint:t}).then(e=>{X.invalidate(this.hass),this._loadBlueprints(),this.requestUpdate()},e=>{(0,B.Ny)(this.hass,e)})}_installBlueprintYamlChanged(e){this.installBlueprintYaml=e.target.value}_handleInstallBlueprintClicked(e){V({hass:this.hass,yamlCode:this.installBlueprintYaml,translate:e=>(0,m.A)(this.hass,e),onInstalled:()=>(X.invalidate(this.hass),this.requestUpdate(),this._loadBlueprints())})}_checkCustomCard(e){const t=customElements.get(e);return u.qy`
        <div>
          ${t?u.qy`
            <ha-icon
              style="color: green;"
              .icon=${"mdi:check-bold"}
            ></ha-icon>`:u.qy`
            <ha-icon
              style="color: red;"
              .icon=${"mdi:close-thick"}
            ></ha-icon>
            `}
          ${e}
          ${t?u.qy`(${(0,m.A)(this.hass,"blueprint.installed")})`:u.qy`(${(0,m.A)(this.hass,"blueprint.not_installed")})`}
        </div>
      `}_renderBlueprintSelect({usable:e,back:t=!1}){const i=Object.entries(this.blueprints.blueprints||{}).sort(function(e,t){let i=e[1].blueprint.type,a=t[1].blueprint.type;return i==a?0:i>a?1:-1});return u.qy`
      <div class="edit-element">
        ${t?u.qy`
          <div style="margin-bottom: 20px;">
            <ha-button .mode=${"pre-select"} @click=${this._switchMode}>< ${this.hass.localize("ui.common.previous")}</ha-button>
          </div>
        `:""}
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
            ${0==i.length?u.qy`
              <tr>
                <td  class="px-6 py-4" colspan="5">${(0,m.A)(this.hass,"blueprint.no_blueprints_installed")}</td>
              </tr>`:i.map(([t,i])=>u.qy`
                <tr class="bg-white">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <h3>${i.blueprint.name}</h3>
                    ${i.blueprint.description}
                  </td>
                  <td class="px-6 py-4">
                    ${i.blueprint.version}
                  </td>
                  <td class="px-6 py-4">
                    ${i.blueprint.type}
                  </td>
                  <td class="px-6 py-4">
                    ${i.blueprint.custom_cards&&0!==i.blueprint.custom_cards.length?u.qy`
                        ${i.blueprint.custom_cards.map(e=>this._checkCustomCard(e))}
                      `:"None"}
                  </td>
                  <td>
                    ${e(i.blueprint.type)?u.qy`
                      <ha-button .blueprint=${t} @click=${this._handleUseBlueprintClicked} unelevated>
                        ${(0,m.A)(this.hass,"blueprint.use")}
                      </ha-button>
                    `:""}
                    <ha-button .blueprint=${t} @click=${this._handleDeleteBlueprintClicked} unelevated>
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
      </div>`}render(){return null==this.blueprints?u.qy`Loading...`:this._renderMode()}}class ee extends Z{_applyConfig(e){this.mode=e.mode?e.mode:"pre-select",this.entity_id=e.entity_id,this.cardConfig=e.cardConfig?J(e.cardConfig,this.entity_id):""}_targetId(){return{entityId:this.entity_id}}_cardChosen(e){const t=structuredClone(e.detail.config);j.SG.includes(t.type)&&!t.entity&&(t.entity=this.entity_id),this.cardConfig=t,this.mode="editor-element"}async _sendCard(){const e=this.renderRoot?.querySelector("dwains-card-config-editor"),t=await(e?.commitConfig?.()??e?.getConfig?.());t&&"object"==typeof t&&(this.cardConfig=t);try{await this.hass.callWS({type:this.constructor.target.save,cardData:JSON.stringify(this.cardConfig),entityId:this.entity_id}),X.invalidate(this.hass),(0,L.fs)()}catch(e){(0,B.Ny)(this.hass,e)}}_handleUseBlueprintClicked(e){const t=e.currentTarget.blueprint;this.mode="editor-element",this.cardConfig={type:"custom:dwains-blueprint-card",blueprint:t,input_entity:this.entity_id,card:this.blueprints.blueprints[t].card}}_renderMode(){return"pre-select"==this.mode?u.qy`
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
        `:"dwains-dashboard-blueprint-select"==this.mode?this._renderBlueprintSelect({usable:e=>"card"==e||"replace-card"==e,back:!0}):"hui-card-picker"==this.mode?u.qy`
          <div class="edit-element">
            <h1 style="font-size: 17px; font-weight: bold;">${(0,m.A)(this.hass,this.constructor.target.pickerTitle)} ${this.entity_id}</h1>
            <dwains-card-picker
              @config-changed=${this._cardChosen}
              .hass=${this.hass}
              .lovelace=${{views:[]}}
              .entityId=${this.entity_id}
            ></dwains-card-picker>
            <div class="card-footer">
              <ha-button appearance="plain" slot="secondaryAction" @click=${e=>(0,L.fs)()}>
                ${this.hass.localize("ui.common.cancel")}
              </ha-button>
            </div>
          </div>
        `:u.qy`
        <div class="edit-element">
          ${K(u.qy,m.A,this.hass,this.cardConfig,this.blueprints)}
          <dwains-card-config-editor
            @config-changed=${this._cardChosen}
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
                  <ha-button class="warning" @click=${e=>this.mode="hui-card-picker"}}>${this.hass.localize("ui.common.previous")}</ha-button>
                </div>
              `:u.qy`<div></div>`}
            <div>
              <ha-button appearance="plain" slot="secondaryAction" @click=${e=>(0,L.fs)()}>
                ${this.hass.localize("ui.common.cancel")}
              </ha-button>
              <ha-button slot="primaryAction" @click=${this._sendCard}>
                ${this.hass.localize("ui.common.submit")}
              </ha-button>
            </div>
          </div>
        </div>
      `}}class te extends Z{_applyConfig(e){if(this.mode=e.mode?e.mode:"dwains-dashboard-blueprint-select",this.domain=e.domain,e.cardConfig){const t=structuredClone(e.cardConfig);delete t.input_entity,delete t.input_name,this.cardConfig=t}else this.cardConfig=""}_targetId(){return{domain:this.domain}}_handleUseBlueprintClicked(e){const t=e.currentTarget.blueprint,i=this.blueprints.blueprints[t]?.card;i&&this.hass.callWS({type:this.constructor.target.save,cardData:JSON.stringify({type:"custom:dwains-blueprint-card",blueprint:t,card:i}),domain:this.domain}).then(e=>{(0,L.fs)()},e=>{(0,B.Ny)(this.hass,e)})}_renderMode(){if("dwains-dashboard-blueprint-select"==this.mode)return this._renderBlueprintSelect({usable:e=>"replace-card"==e});if("current-selected-blueprint"==this.mode){const e=this.blueprints.blueprints?.[this.cardConfig.blueprint]?.blueprint;return u.qy`
          <div class="edit-element">
            <p>
            ${(0,m.A)(this.hass,this.constructor.target.currentText)} ${(0,W.O)(this.hass,this.domain)}:<br>
              <strong>${e?.name??this.cardConfig.blueprint}</strong><br>
              ${e?.description??""}
            </p>

            <div class="card-footer-multiple">
              ${this.existingCardEdit?u.qy`
                  <div>
                    <ha-button class="warning" @click=${this._removeCard}>${this.hass.localize("ui.common.remove")}</ha-button>
                    <ha-button class="warning" @click=${e=>this.mode="dwains-dashboard-blueprint-select"}}>${this.hass.localize("ui.common.previous")}</ha-button>
                  </div>
                `:u.qy`<div></div>`}
              <div>
                <ha-button appearance="plain" slot="secondaryAction" @click=${e=>(0,L.fs)()}>
                  ${this.hass.localize("ui.common.cancel")}
                </ha-button>
                <ha-button slot="primaryAction" .blueprint=${this.cardConfig.blueprint} @click=${this._handleUseBlueprintClicked}>
                  ${this.hass.localize("ui.common.submit")}
                </ha-button>
              </div>
            </div>
          </div>
        `}return u.qy``}}Q("dwains-edit-entity-card-card",class extends ee{static target={name:"entity-card",save:"dwains_dashboard/edit_entity_card",remove:"dwains_dashboard/remove_entity_card",pickerTitle:"editor.select_card_for"}}),Q("dwains-edit-entity-popup-card",class extends ee{static target={name:"entity-popup",save:"dwains_dashboard/edit_entity_popup",remove:"dwains_dashboard/remove_entity_popup",pickerTitle:"editor.select_popup_card_for"}}),Q("dwains-edit-device-card-card",class extends te{static target={name:"device-card",save:"dwains_dashboard/edit_device_card",remove:"dwains_dashboard/remove_device_card",currentText:"device.current_blueprint_card"}}),Q("dwains-edit-device-popup-card",class extends te{static target={name:"device-popup",save:"dwains_dashboard/edit_device_popup",remove:"dwains_dashboard/remove_device_popup",currentText:"device.current_blueprint_popup"}});var ie=i(5213);const{closeParentDropdown:ae}=d(),{defineDwainsElement:se}=o(),{AREA_GRAPH_HOURS:re,normalizeGraphHours:ne}=i(1495),{areaSensorChoices:oe,chooseExtraSensors:de,chooseTypeSensor:le}=a();class ce extends u.WF{static get styles(){return[(0,ie.F)(u.AH),u.AH`
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
        .edit-element .section-title {
          margin: 1.1rem 0 .1rem;
        }
        .edit-element .section-helper {
          color: var(--secondary-text-color);
          font-size: .85rem;
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
        `]}setConfig(e){this.areaId=e.areaId,this.icon=e.icon?e.icon:"",this.disableArea=!!e.disableArea&&e.disableArea,this.hideIcon=!!e.hideIcon&&e.hideIcon,this.graphEntity=e.graphEntity||"",this.graphHours=ne(e.graphHours),this.sensorEntities=Array.isArray(e.sensorEntities)?e.sensorEntities:[],this.sensorDeviceClasses=Array.isArray(e.sensorDeviceClasses)?e.sensorDeviceClasses:[],this.binarySensorEntities=Array.isArray(e.binarySensorEntities)?e.binarySensorEntities:[]}connectedCallback(){super.connectedCallback()}_iconPickerChange(e){this.icon=e.detail.value}_disableValueChanged(e){this.disableArea=e.target.checked}_hideIconValueChanged(e){this.hideIcon=e.target.checked,this.requestUpdate()}_graphEntityChanged(e){this.graphEntity=e.detail.value||"",this.requestUpdate()}_graphHoursChanged(e){e.stopPropagation();const t=e.detail?.value;null!=t&&""!==t&&(this.graphHours=ne(t),this.requestUpdate())}_graphEntityFilter(e){return Boolean(e.attributes&&e.attributes.unit_of_measurement)}_areaEntities(e){const t=this.hass?.entities||{},i=this.hass?.devices||{};return Object.values(t).filter(t=>t.entity_id.startsWith(`${e}.`)).filter(e=>(e.area_id||i[e.device_id]?.area_id)===this.areaId).map(e=>e.entity_id)}_renderEntityPickers({className:e,label:t,helper:i,values:a,candidates:s,onChange:r}){const n=s.filter(e=>!a.includes(e));return u.qy`
        <div class="section-title">${t}</div>
        ${a.map((t,i)=>u.qy`
          <ha-entity-picker
            class=${e}
            .hass=${this.hass}
            .showEntityId=${!0}
            .value=${t}
            .includeEntities=${[t,...n]}
            @value-changed=${e=>((e,t)=>{t.stopPropagation();const i=[...a];t.detail.value?i[e]=t.detail.value:i.splice(e,1),r(i)})(i,e)}
          ></ha-entity-picker>
        `)}
        <ha-entity-picker
          class=${e}
          .hass=${this.hass}
          .showEntityId=${!0}
          .value=${""}
          .disabled=${!n.length}
          .includeEntities=${n.length?n:["none.none"]}
          .helper=${i}
          @value-changed=${e=>{e.stopPropagation();const t=e.detail.value;e.target.value="",t&&r([...a,t])}}
        ></ha-entity-picker>
      `}_deviceClassOf(e){return this.hass?.states?.[e]?.attributes?.device_class}_typeSensorChanged(e,t){t.stopPropagation();const i=t.detail?.value||void 0;this.sensorEntities=le(this.sensorEntities,e,i,e=>this._deviceClassOf(e)),this.requestUpdate()}_extraSensorsChanged(e){this.sensorEntities=de(this.sensorEntities,e,this.sensorDeviceClasses,e=>this._deviceClassOf(e)),this.requestUpdate()}_renderSensorValues(){const{types:e,extras:t,extraCandidates:i}=oe({deviceClasses:this.sensorDeviceClasses,areaSensorIds:this._areaEntities("sensor"),chosenIds:this.sensorEntities,deviceClassOf:e=>this._deviceClassOf(e)});return u.qy`
        <div class="section-title">${(0,m.A)(this.hass,"area.sensor_values")}</div>
        <div class="section-helper">${(0,m.A)(this.hass,"area.sensor_values_helper")}</div>
        ${e.map(e=>u.qy`
          <ha-entity-picker
            class="sensor-type"
            .hass=${this.hass}
            .showEntityId=${!0}
            .label=${this.hass.localize(`component.sensor.entity_component.${e.deviceClass}.name`)||e.deviceClass.replace(/_/g," ")}
            .placeholder=${(0,m.A)(this.hass,"area.sensor_average").replace("{count}",e.averaged)}
            .value=${e.chosen||""}
            .includeEntities=${e.sensors}
            @value-changed=${t=>this._typeSensorChanged(e.deviceClass,t)}
          ></ha-entity-picker>
        `)}
        ${this._renderEntityPickers({className:"extra-sensors",label:(0,m.A)(this.hass,"area.extra_sensor_entities"),helper:(0,m.A)(this.hass,"area.extra_sensor_entities_helper"),values:t,candidates:i,onChange:e=>this._extraSensorsChanged(e)})}
      `}_renderEntityList(e,t,i,a){const s=[...new Set([...this._areaEntities(t),...this[e]])];return this._renderEntityPickers({className:`entity-list-${t}`,label:i,helper:a,values:this[e],candidates:s,onChange:t=>{this[e]=t,this.requestUpdate()}})}_saveButton(e){ae(e),e.stopPropagation(),this.hass.callWS({type:"dwains_dashboard/edit_area_button",icon:this.icon,areaId:this.areaId,disableArea:this.disableArea,hideIcon:this.hideIcon,graphEntity:this.graphEntity,graphHours:this.graphHours,sensorEntities:this.sensorEntities,binarySensorEntities:this.binarySensorEntities}).then(e=>{(0,L.fs)()},e=>{(0,B.Ny)(this.hass,e)})}render(){return u.qy`
      <div class="edit-element">
          <ha-icon-picker
            label=${(0,m.A)(this.hass,"area.icon")}
            .value=${this.icon}
            .name=${(0,m.A)(this.hass,"area.icon")}
            .disabled=${this.hideIcon}
            @value-changed=${this._iconPickerChange}
          ></ha-icon-picker>
          <label class="dd-check" @click=${ie.H}>
              <ha-checkbox
              @change=${this._hideIconValueChanged}
              .checked=${this.hideIcon}
            ></ha-checkbox>
              <span>${(0,m.A)(this.hass,"area.hide_icon")}</span>
            </label>
          <ha-entity-picker
            .hass=${this.hass}
            .showEntityId=${!0}
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
              .selector=${{select:{mode:"dropdown",options:re.map(e=>({value:String(e),label:(0,m.A)(this.hass,`area.graph_hours_${e}`)}))}}}
              @value-changed=${this._graphHoursChanged}
            ></ha-selector>
          `:""}
          ${this._renderSensorValues()}
          ${this._renderEntityList("binarySensorEntities","binary_sensor",(0,m.A)(this.hass,"area.binary_sensor_entities"),(0,m.A)(this.hass,"area.binary_sensor_entities_helper"))}
          <label class="dd-check" @click=${ie.H}>
              <ha-checkbox
              @change=${this._disableValueChanged}
              .checked=${this.disableArea}
            ></ha-checkbox>
              <span>${(0,m.A)(this.hass,"area.disable")}</span>
            </label>
          <div class="card-footer">
            <ha-button appearance="plain" slot="secondaryAction" @click=${e=>(0,L.fs)()}>
              ${this.hass.localize("ui.common.cancel")}
            </ha-button>
            <ha-button slot="primaryAction" @click=${this._saveButton}>
              ${this.hass.localize("ui.common.submit")}
            </ha-button>
          </div>
      </div>
      `}}se("dwains-edit-area-button-card",ce);const{closeParentDropdown:he}=d(),{defineDwainsElement:pe}=o();class ue extends u.WF{static get styles(){return[(0,ie.F)(u.AH),u.AH`
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
          `]}setConfig(e){this.device=e.device,this.icon=e.icon?e.icon:"",this.showInNavbar=!!e.showInNavbar&&e.showInNavbar}connectedCallback(){super.connectedCallback()}_iconPickerChange(e){this.icon=e.detail.value}_showInMainNavbarValueChanged(e){this.showInNavbar=e.target.checked}_saveButton(e){he(e),e.stopPropagation(),!this.showInNavbar||this.icon?this.hass.callWS({type:"dwains_dashboard/edit_device_button",icon:this.icon,device:this.device,showInNavbar:this.showInNavbar}).then(e=>{(0,L.fs)()},e=>{(0,B.Ny)(this.hass,e)}):alert((0,m.A)(this.hass,"device.icon_required"))}render(){return u.qy`
        <div class="edit-element">
            <ha-icon-picker
              label=${(0,m.A)(this.hass,"device.icon")}
              .value=${this.icon}
              @value-changed=${this._iconPickerChange}
            ></ha-icon-picker>

          <label class="dd-check" @click=${ie.H}>
              <ha-switch
                @change=${this._showInMainNavbarValueChanged}
                .checked=${this.showInNavbar}
              ></ha-switch>
              <span>${(0,m.A)(this.hass,"device.show_in_navbar")}</span>
            </label>

            <div class="card-footer">
              <ha-button appearance="plain" slot="secondaryAction" @click=${e=>(0,L.fs)()}>
                ${this.hass.localize("ui.common.cancel")}
              </ha-button>
              <ha-button slot="primaryAction" @click=${this._saveButton}>
                ${this.hass.localize("ui.common.submit")}
              </ha-button>
            </div>
        </div>
        `}}pe("dwains-edit-device-button-card",ue);const{closeParentDropdown:me}=d(),{defineDwainsElement:ge}=o();class be extends u.WF{static get styles(){return[(0,ie.F)(u.AH),u.AH`
        h2 {
          margin: 16px 0 8px;
          font-size: 1rem;
        }
        .edit-element {
          padding: 20px;
        }
        .dd-check-help {
          display: block;
          font-size: 0.85em;
          color: var(--secondary-text-color);
        }
        .entity-id {
          margin-bottom: 12px;
          color: var(--secondary-text-color);
          font-family: var(--ha-font-family-code, monospace);
          font-size: 0.85rem;
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
        `]}setConfig(e){this.entity=e.entity,this.friendlyName=e.friendlyName?e.friendlyName:"",this.hideEntity=!!e.hideEntity&&e.hideEntity,this.hideEntityInArea=e.hideEntityInArea??!1,this.disableEntity=!!e.disableEntity&&e.disableEntity,this.excludeEntity=!!e.excludeEntity&&e.excludeEntity,this.rowSpan=e.rowSpan?e.rowSpan:"1",this.colSpan=e.colSpan?e.colSpan:"1",this.rowSpanLg=e.rowSpanLg?e.rowSpanLg:"1",this.colSpanLg=e.colSpanLg?e.colSpanLg:"1",this.rowSpanXl=e.rowSpanXl?e.rowSpanXl:"1",this.colSpanXl=e.colSpanXl?e.colSpanXl:"1",this.customCard=!!e.customCard&&e.customCard,this.customPopup=!!e.customPopup&&e.customPopup}async _saveButton(e){me(e),e.stopPropagation();try{await this.hass.callWS({type:"dwains_dashboard/edit_entity",entity:this.entity,friendlyName:this.friendlyName,disableEntity:this.disableEntity,hideEntity:this.hideEntity,excludeEntity:this.excludeEntity,rowSpan:this.rowSpan,colSpan:this.colSpan,rowSpanLg:this.rowSpanLg,colSpanLg:this.colSpanLg,rowSpanXl:this.rowSpanXl,colSpanXl:this.colSpanXl,customCard:this.customCard,customPopup:this.customPopup,hideEntityInArea:this.hideEntityInArea}),(0,L.fs)()}catch(e){(0,B.Ny)(this.hass,e)}}_friendlyNameChanged(e){this.friendlyName=e.target.value}_disableValueChanged(e){this.disableEntity=e.target.checked}_hideValueChanged(e){this.hideEntity=e.target.checked}_hideInAreaValueChanged(e){this.hideEntityInArea=e.target.checked}_excludeValueChanged(e){this.excludeEntity=e.target.checked}_customCardValueChanged(e){this.customCard=e.target.checked}_customPopupValueChanged(e){this.customPopup=e.target.checked}_haSelectChanged(e){me(e),e.stopPropagation();const t=e.currentTarget||e.target,i=t.name||t.type||t.getAttribute?.("type"),a=e.detail?.value??e.detail?.item?.value??t.selectedItem?.value??t.value;i&&void 0!==a&&(this[i]=a),this.requestUpdate()}_stopPropagation(e){e.stopPropagation()}render(){return u.qy`
        <div class="edit-element">
            <div class="entity-id">${this.entity}</div>

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

            ${[["entity.hide","entity.hide_help",this.hideEntity,this._hideValueChanged],["entity.hide_in_area","entity.hide_in_area_help",this.hideEntityInArea,this._hideInAreaValueChanged],["entity.exclude","entity.exclude_help",this.excludeEntity,this._excludeValueChanged],["entity.disable","entity.disable_help",this.disableEntity,this._disableValueChanged]].map(([e,t,i,a])=>u.qy`
              <label class="dd-check" @click=${ie.H}>
                <ha-checkbox @change=${a} .checked=${i}></ha-checkbox>
                <span>
                  ${(0,m.A)(this.hass,e)}
                  <span class="dd-check-help">${(0,m.A)(this.hass,t)}</span>
                </span>
              </label>
            `)}
            <label class="dd-check" @click=${ie.H}>
              <ha-checkbox
                @change=${this._customCardValueChanged}
                .checked=${this.customCard}
              ></ha-checkbox>
              <span>${(0,m.A)(this.hass,"entity.use_entity_card")}</span>
            </label>
            <label class="dd-check" @click=${ie.H}>
              <ha-checkbox
                @change=${this._customPopupValueChanged}
                .checked=${this.customPopup}
              ></ha-checkbox>
              <span>${(0,m.A)(this.hass,"entity.use_popup_card")}</span>
            </label>

            <div class="card-footer">
              <ha-button appearance="plain" slot="secondaryAction" @click=${e=>(0,L.fs)()}>
                ${this.hass.localize("ui.common.cancel")}
              </ha-button>
              <ha-button slot="primaryAction" @click=${this._saveButton}>
                ${this.hass.localize("ui.common.submit")}
              </ha-button>
            </div>
        </div>
      `}}ge("dwains-edit-entity-card",be);var _e=i(3475);const{websocketReadStore:ye}=p(),{installBlueprint:ve}=s(),{ConnectedLoadOwner:fe}=n(),{hassConnectionIdentity:we,hasHassConnectionChanged:$e}=l(),{defineDwainsElement:xe}=o(),{refreshLovelaceConfig:Ce}=i(7753),{dispatchMorePageSaved:ke}=i(6392);class Se extends u.WF{constructor(){super(),this._connectedLoadOwner=new fe(e=>this._loadEditor(e),{reportError:(e,t)=>console.error(e,t),errorMessage:"Failed to load more-page editor data"}),this._configReady=!1,this.blueprints={blueprints:{}},this._blueprintsLoading=!0}static get styles(){return[(0,ie.F)(u.AH),u.AH`
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
        `]}static get properties(){return{mode:{},blueprints:{},_hass:{},_saving:{state:!0},_saveError:{state:!0}}}set hass(e){const t=$e(this._hass,e);this._hass=e,t&&(this._connectedLoadOwner.disconnect(),this.isConnected&&this._connectedLoadOwner.connect()),this._startEditorIfReady()}setConfig(e){if(this._editorSessionInitialized)return this._configReady=!0,void this._startEditorIfReady();if(this._editorSessionInitialized=!0,this.mode=e.mode?e.mode:"pre-select",this.foldername=e.foldername?e.foldername:"",e.cardConfig){const t=structuredClone(e.cardConfig);delete t.input_entity,delete t.input_name,this.cardConfig=t}else this.cardConfig="";this.name=e.name?e.name:"",this._nameTouched=!!this.name,this._nameAutoGenerated=!1,this.icon=e.icon?e.icon:"",this.showInNavbar=!!e.showInNavbar&&e.showInNavbar,this._saving=!1,this._saveError=void 0,this._configReady=!0,this._startEditorIfReady()}connectedCallback(){super.connectedCallback(),this._connectedLoadOwner.connect(),this._startEditorIfReady()}disconnectedCallback(){super.disconnectedCallback(),this._connectedLoadOwner.disconnect()}_startEditorIfReady(){this._configReady&&this._hass&&this._connectedLoadOwner.ready()}async _loadEditor({isCurrent:e}){const t=this._hass,i=we(t),a=await ye.read(t,{type:"dwains_dashboard/get_blueprints"});e()&&we(this._hass)===i&&(this.blueprints=a?.blueprints?a:{blueprints:{}},this._blueprintsLoading=!1)}_loadBlueprints(){return this._connectedLoadOwner.reload()}magicStuff(e){this.cardConfig=structuredClone(e.detail.config),this._applyDefaultMorePageName(),this.mode="editor-element"}magicStuffSecond(e){}async _sendCard(){if(this._saving)return;this._syncMorePageSettingsFromDom();const e=this.renderRoot?.querySelector("dwains-card-config-editor"),t=await(e?.commitConfig?.()??e?.getConfig?.());if(t&&"object"==typeof t&&(this.cardConfig=t),this._applyDefaultMorePageName(),!this.name)return void alert((0,m.A)(this._hass,"more.name_required"));if(this.showInNavbar&&!this.icon)return void alert((0,m.A)(this._hass,"more.icon_required"));if(!this.cardConfig||"object"!=typeof this.cardConfig)return void(this._saveError=new Error("No valid Lovelace card is configured."));const i=!this.foldername;this._saving=!0,this._saveError=void 0;try{const e=await this._hass.callWS({type:"dwains_dashboard/edit_more_page",card_data:JSON.stringify(this.cardConfig),foldername:this.foldername,name:this.name,icon:this.icon,showInNavbar:this.showInNavbar});if(!e?.foldername)throw new Error("The backend did not return the saved page name.");this.foldername=e.foldername,ye.invalidate(this._hass);const t=e.view_path||`more_page_${e.foldername}`,a=e.page||{foldername:e.foldername,name:this.name,icon:this.icon,show_in_navbar:this.showInNavbar,card:structuredClone(this.cardConfig)};ke(window,a),i?(await Ce({viewPath:t}),(0,L.fs)(),(0,_e.oo)(window,`/dwains-dashboard/${t}`)):(0,L.fs)()}catch(e){this._saveError=e,console.error("Failed to save and refresh more page:",e)}finally{this._saving=!1}}_switchMode(e){const t=e.currentTarget.mode;this.mode=t,this.requestUpdate()}_deriveDefaultMorePageName(e=this.cardConfig){if(!e||"object"!=typeof e)return"";const t=[e.title,e.name,e.heading,e.card&&e.card.title,e.card&&e.card.name].find(e=>"string"==typeof e&&e.trim());return t?t.trim():""}_applyDefaultMorePageName(){if(this._nameTouched&&!this._nameAutoGenerated)return;const e=this._deriveDefaultMorePageName();e&&e!==this.name&&(this.name=e,this._nameAutoGenerated=!0)}_syncMorePageSettingsFromDom(){const e=this.shadowRoot?.querySelector("#more-page-name");e&&(this.name=e.value.trim());const t=this.shadowRoot?.querySelector(".more-page-settings ha-icon-picker");t&&void 0!==t.value&&(this.icon=t.value);const i=this.shadowRoot?.querySelector(".more-page-settings ha-checkbox");i&&(this.showInNavbar=i.checked)}_iconPickerChange(e){this.icon=e.detail.value}_showInMainNavbarValueChanged(e){this.showInNavbar=e.target.checked}_nameChanged(e){this.name=e.target.value,this._nameTouched=!0,this._nameAutoGenerated=!1}async _removeMorePage(){if(!this._saving&&(0,B.v7)(this._hass,this.name||this.foldername)){this._saving=!0,this._saveError=void 0;try{await this._hass.callWS({type:"dwains_dashboard/remove_more_page",foldername:this.foldername}),ye.invalidate(this._hass),await Ce(),(0,L.fs)(),(0,_e.oo)(window,"/dwains-dashboard/more_page")}catch(e){this._saveError=e,console.error("Failed to remove and refresh more page:",e)}finally{this._saving=!1}}}_handleDeleteBlueprintClicked(e){const t=e.currentTarget.blueprint;(0,B.v7)(this._hass,t)&&this._hass.callWS({type:"dwains_dashboard/delete_blueprint",blueprint:t}).then(e=>{ye.invalidate(this._hass),this._loadBlueprints(),this.requestUpdate()},e=>{(0,B.Ny)(this._hass,e)})}_handleUseBlueprintClicked(e){const t=e.currentTarget.blueprint;this.mode="editor-element",this.name=this.blueprints.blueprints[t].blueprint.name,this.cardConfig={type:"custom:dwains-blueprint-card",blueprint:t,card:this.blueprints.blueprints[t].card}}_installBlueprintYamlChanged(e){this.installBlueprintYaml=e.target.value}_handleInstallBlueprintClicked(e){ve({hass:this._hass,yamlCode:this.installBlueprintYaml,translate:e=>(0,m.A)(this._hass,e),onInstalled:()=>(ye.invalidate(this._hass),this.requestUpdate(),this._loadBlueprints())})}_checkCustomCard(e){const t=customElements.get(e);return u.qy`
        <div>
        ${t?u.qy`
            <ha-icon
            style="color: green;"
            .icon=${"mdi:check-bold"}
            ></ha-icon>`:u.qy`
            <ha-icon
            style="color: red;"
            .icon=${"mdi:close-thick"}
            ></ha-icon>
            `}
        ${e}
        ${t?u.qy`(${(0,m.A)(this._hass,"blueprint.installed")})`:u.qy`(${(0,m.A)(this._hass,"blueprint.not_installed")})`}
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
        `;if("dwains-dashboard-blueprint-select"==this.mode){if(this._blueprintsLoading)return u.qy`<div class="edit-element"><ha-spinner></ha-spinner></div>`;const e=Object.entries(this.blueprints.blueprints).sort(function(e,t){let i=e[1].blueprint.type,a=t[1].blueprint.type;return i==a?0:i>a?1:-1});return u.qy`
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
                ${Object.entries(e).map(([e,t])=>u.qy`
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
                            ${t[1].blueprint.custom_cards&&0!==t[1].blueprint.custom_cards.length?u.qy`
                                ${t[1].blueprint.custom_cards.map(e=>this._checkCustomCard(e))}
                            `:"None"}
                        </td>
                        <td>
                            ${"page"==t[1].blueprint.type?u.qy`
                            <ha-button .blueprint=${t[0]} @click=${this._handleUseBlueprintClicked} unelevated>
                                ${(0,m.A)(this._hass,"blueprint.use")}
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
            <label class="dd-check" @click=${ie.H}>
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
        `:void 0}}xe("dwains-edit-more-page-card",Se)}}]);