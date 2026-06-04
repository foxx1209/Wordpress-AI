/**
 * Dev Inspector — Chrome拡張版
 * WebSocket経由でdev-inspector-serverと通信
 */
(function() {
  if (window.__devInspectorLoaded) return;
  window.__devInspectorLoaded = true;

  // === WebSocket通信レイヤー ===
  let __diWs = null;
  const __diHandlers = {};
  let __diRemMode = 'css-var'; // デフォルト: Vite方式（既存動作維持）

  // rem() → ブラウザ解釈可能なCSSに変換（モード切替対応）
  function __diConvertRem(val) {
    return val.replace(/rem\(([-\d.]+)\)/g, (_, n) => {
      if (__diRemMode === 'scss') {
        // Gulp方式: rem(20) → 1.25rem (N / 16)
        const num = parseFloat(n);
        const rem = Math.round((num / 16) * 10000) / 10000;
        return rem + 'rem';
      }
      // Vite方式: rem(20) → calc(20 * var(--to-rem))
      return 'calc(' + n + ' * var(--to-rem))';
    });
  }

  function __diConnect() {
    try {
      __diWs = new WebSocket('ws://localhost:54321');
      __diWs.onopen = () => console.log('[Inspector] Server connected');
      __diWs.onclose = () => { __diWs = null; console.log('[Inspector] Server disconnected'); };
      __diWs.onerror = () => { __diWs = null; };
      __diWs.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type && __diHandlers[msg.type]) {
            __diHandlers[msg.type].forEach(fn => fn(msg.data));
          }
        } catch {}
      };
    } catch { __diWs = null; }
  }

  function __diSend(type, data) {
    if (__diWs && __diWs.readyState === 1) {
      __diWs.send(JSON.stringify({ type, data }));
    }
  }

  function __diOn(type, fn) {
    if (!__diHandlers[type]) __diHandlers[type] = [];
    __diHandlers[type] = [fn]; // 最新のハンドラのみ保持
  }

  __diConnect();

  // サーバーからの設定を受信
  __diOn('inspector:config', (data) => {
    if (data && data.remMode) {
      __diRemMode = data.remMode;
      console.log('[Inspector] rem-mode:', __diRemMode);
    }
  });

  let active = false;
  let pipWindow = null;

  // === リロード後の状態復元 ===
  const DI_STATE_KEY = "__diRestoreState";

  function saveStateForReload() {
    if (!selectedEl) return;
    const classList = selectedEl.className && typeof selectedEl.className === "string" ? selectedEl.className.trim() : "";
    if (!classList) return;
    const state = {
      classList: classList,
      activeClass: window.__diActiveClass || "",
      scrollY: window.scrollY,
      tag: selectedEl.tagName.toLowerCase(),
    };
    sessionStorage.setItem(DI_STATE_KEY, JSON.stringify(state));
  }

  function tryRestoreState() {
    const raw = sessionStorage.getItem(DI_STATE_KEY);
    if (!raw) return;
    sessionStorage.removeItem(DI_STATE_KEY);
    try {
      const state = JSON.parse(raw);
      if (!state.classList) return;
      // スクロール位置を復元
      if (state.scrollY) window.scrollTo(0, state.scrollY);
      // アクティブクラスを事前設定
      if (state.activeClass) window.__diActiveClass = state.activeClass;
      // 要素を再検索して選択
      const classes = state.classList.split(/\s+/);
      const selector = classes.map(c => "." + CSS.escape(c)).join("");
      const el = document.querySelector(selector);
      if (el) {
        selectedEl = el;
        updatePanel(el);
        const rect = el.getBoundingClientRect();
        selectedOverlay.style.display = "block";
        selectedOverlay.style.left = rect.left + "px";
        selectedOverlay.style.top = rect.top + "px";
        selectedOverlay.style.width = rect.width + "px";
        selectedOverlay.style.height = rect.height + "px";
      }
    } catch {}
  }

  // 選択中要素がDOM上で同じクラスの何番目かを返す
  function getMatchIndex(el, className) {
    if (!el || !className) return 0;
    const allEls = document.querySelectorAll("." + CSS.escape(className));
    for (let i = 0; i < allEls.length; i++) {
      if (allEls[i] === el) return i;
    }
    return 0;
  }

  document.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) return;
    if (e.key === "q" || e.key === "Q" || e.key === "i" || e.key === "I") {
      if (active) {
        destroyInspector();
      } else {
        initInspector();
      }
    }
  });

  let panel, hoverOverlay, hoverLabel, selectedOverlay, toast, style;
  let selectedEl = null;
  let isDragging = false;
  let dragX = 0;
  let dragY = 0;
  let pendingChanges = new Map();
  let pendingDeletes = new Map();

  function initInspector() {
    active = true;

    style = document.createElement("style");
    style.id = "__diStyle";
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      #__diPanel{position:fixed;top:16px;right:16px;width:560px;max-height:calc(100vh - 32px);background:linear-gradient(168deg,#1a1d2e 0%,#141722 50%,#0f1118 100%);color:#d0d4de;font-family:'JetBrains Mono',-apple-system,BlinkMacSystemFont,monospace;font-size:14px;border-radius:16px;border:1px solid rgba(120,130,180,.15);box-shadow:0 2px 0 rgba(255,255,255,.03) inset,0 -1px 0 rgba(0,0,0,.4) inset,0 24px 80px rgba(0,0,0,.7),0 0 0 1px rgba(0,0,0,.3),0 0 120px rgba(80,100,200,.06);z-index:2147483647;overflow:hidden;user-select:text;display:flex;flex-direction:column;backdrop-filter:blur(20px)}
      #__diPanel.di-collapsed #__diPresets,#__diPanel.di-collapsed #__diBody,#__diPanel.di-collapsed #__diSaveBar{display:none!important}
      #__diPanel.di-collapsed{max-height:none}
      #__diPanel *{box-sizing:border-box}
      #__diHeader{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:linear-gradient(180deg,rgba(40,44,60,.9) 0%,rgba(28,32,46,.8) 100%);cursor:move;border-bottom:1px solid rgba(80,90,140,.12);box-shadow:0 1px 0 rgba(255,255,255,.04) inset;flex-shrink:0}
      #__diHeader h3{font-size:15px;font-weight:700;color:#e8ecf4;margin:0;letter-spacing:1px;text-shadow:0 1px 3px rgba(0,0,0,.5)}
      #__diHeaderBtns{display:flex;gap:6px}
      #__diHeaderBtns button{background:linear-gradient(180deg,rgba(60,65,85,.8),rgba(40,44,58,.8));border:1px solid rgba(100,110,150,.25);border-bottom-color:rgba(20,22,30,.5);color:#a0a6b8;font-size:13px;padding:5px 13px;border-radius:6px;cursor:pointer;font-family:inherit;transition:all .2s;text-shadow:0 1px 1px rgba(0,0,0,.3);box-shadow:0 1px 0 rgba(255,255,255,.04) inset,0 2px 4px rgba(0,0,0,.2)}
      #__diHeaderBtns button:hover{background:linear-gradient(180deg,rgba(75,80,105,.8),rgba(55,60,78,.8));color:#d0d6e4;border-color:rgba(120,130,170,.35)}
      #__diHeaderBtns button:active{background:linear-gradient(180deg,rgba(35,38,52,.9),rgba(45,50,65,.9));box-shadow:0 1px 4px rgba(0,0,0,.4) inset}
      #__diBody{padding:0;overflow-y:auto;flex:1;min-height:0;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.08) transparent}
      #__diBody::-webkit-scrollbar{width:6px}
      #__diBody::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:10px}
      #__diBody::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.18)}
      #__diSelector{padding:16px 20px;background:linear-gradient(180deg,rgba(35,40,55,.5),rgba(25,28,40,.3));border-bottom:1px solid rgba(80,90,140,.08)}
      .di-sel-label{font-size:12px;color:#7a8194;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;font-weight:600;display:flex;align-items:center;gap:8px}
      .di-sel-value{font-size:15px;font-weight:600;color:#6cc7f0;cursor:pointer;padding:6px 12px;background:rgba(108,199,240,.05);border:1px solid rgba(108,199,240,.12);border-radius:8px;word-break:break-all;transition:all .2s;display:inline-block;text-shadow:0 0 12px rgba(108,199,240,.1)}
      .di-sel-value:hover{background:rgba(108,199,240,.1);border-color:rgba(108,199,240,.28)}
      .di-sel-value:active{background:rgba(108,199,240,.18);color:#fff}
      #__diBoxModel{padding:14px 20px;border-bottom:1px solid rgba(80,90,140,.08)}
      .di-bm-title{font-size:12px;color:#7a8194;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;font-weight:600}
      .di-bm-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}
      .di-bm-item{background:linear-gradient(180deg,rgba(45,50,68,.5),rgba(30,34,48,.5));padding:8px 6px;border-radius:6px;text-align:center;border:1px solid rgba(80,90,140,.1);border-bottom-color:rgba(0,0,0,.15);box-shadow:0 1px 0 rgba(255,255,255,.02) inset}
      .di-bm-key{font-size:10px;color:#636b80;display:block;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px}
      .di-bm-val{font-size:15px;color:#e0b050;font-weight:600;text-shadow:0 0 8px rgba(224,176,80,.08)}
      #__diCSSList{padding:8px 0}
      .di-css-group{padding:0 20px;margin-bottom:2px}
      .di-css-group-title{font-size:12px;color:#7a8194;text-transform:uppercase;letter-spacing:2px;padding:12px 0 8px;font-weight:600;border-bottom:1px solid rgba(80,90,140,.08);margin-bottom:6px;display:flex;align-items:center;gap:8px}
      .di-css-row{display:flex;align-items:center;padding:6px 2px;border-bottom:1px solid rgba(80,90,140,.04);font-size:14px;transition:all .15s;border-radius:4px}
      .di-css-toggle{width:13px;height:13px;cursor:pointer;accent-color:#42ab94;flex-shrink:0;margin:0 4px 0 0}
      .di-css-row.di-toggled-off .di-css-key,.di-css-row.di-toggled-off .di-css-val{text-decoration:line-through;opacity:.35}
      .di-css-row:hover{background:rgba(108,199,240,.03)}
      .di-css-key{color:#8ea0d0;min-width:170px;flex-shrink:0;cursor:pointer;font-weight:500;transition:color .2s}
      .di-css-key:hover{color:#b0c0e8}
      .di-css-val{color:#e0b050;flex:1;cursor:text;padding:3px 8px;border-radius:5px;outline:none;border:1px solid transparent;transition:all .2s;font-weight:500}
      .di-css-val:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.06)}
      .di-css-val:focus{border-color:rgba(108,199,240,.5);background:rgba(108,199,240,.06);box-shadow:0 0 0 2px rgba(108,199,240,.08)}
      .di-css-val.di-changed{color:#f06880;font-weight:600}
      #__diCopied{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(180deg,rgba(55,60,80,.95),rgba(40,44,60,.95));color:#e8ecf4;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;z-index:2147483647;pointer-events:none;opacity:0;transition:opacity .25s;font-family:inherit;border:1px solid rgba(100,110,150,.3);box-shadow:0 1px 0 rgba(255,255,255,.05) inset,0 12px 36px rgba(0,0,0,.5);text-shadow:0 1px 2px rgba(0,0,0,.3);backdrop-filter:blur(12px)}
      #__diCopied.di-show{opacity:1}
      #__diHoverOverlay{position:fixed;pointer-events:none;z-index:2147483640;border:2px solid rgba(108,199,240,.7);background:rgba(108,199,240,.04);transition:all .05s;display:none;border-radius:3px;box-shadow:0 0 12px rgba(108,199,240,.1)}
      #__diHoverLabel{position:fixed;pointer-events:none;z-index:2147483641;background:linear-gradient(180deg,rgba(55,60,80,.95),rgba(40,44,60,.95));color:#e8ecf4;font-size:11px;font-weight:600;padding:6px 12px;border-radius:6px;font-family:'SF Mono',monospace,inherit;white-space:pre;display:none;border:1px solid rgba(100,110,150,.25);box-shadow:0 1px 0 rgba(255,255,255,.05) inset,0 6px 16px rgba(0,0,0,.4);backdrop-filter:blur(8px);line-height:1.5;max-width:400px}
      #__diSelectedOverlay{position:fixed;pointer-events:none;z-index:2147483639;border:2px solid rgba(224,176,80,.7);background:rgba(224,176,80,.03);display:none;border-radius:3px;box-shadow:0 0 12px rgba(224,176,80,.08)}
      .__diBoxMargin{position:fixed;pointer-events:none;z-index:2147483636;background:rgba(246,178,107,.4);display:none}
      .__diBoxPadding{position:fixed;pointer-events:none;z-index:2147483637;background:rgba(147,196,125,.4);display:none}
      .__diBoxContent{position:fixed;pointer-events:none;z-index:2147483638;background:rgba(111,168,220,.35);display:none}
      .__diBoxLabel{position:fixed;pointer-events:none;z-index:2147483642;font-size:12px;font-weight:700;font-family:'JetBrains Mono',monospace;color:#fff;display:none;white-space:nowrap;line-height:1;padding:2px 6px;border-radius:3px}
      .__diHoverMargin{position:fixed;pointer-events:none;z-index:2147483633;background:rgba(246,178,107,.3);display:none}
      .__diHoverPadding{position:fixed;pointer-events:none;z-index:2147483634;background:rgba(147,196,125,.3);display:none}
      .__diHoverContent{position:fixed;pointer-events:none;z-index:2147483635;background:rgba(111,168,220,.25);display:none}
      .__diGap{position:fixed;pointer-events:none;z-index:2147483639;display:none;background:repeating-linear-gradient(45deg,rgba(168,130,214,.4),rgba(168,130,214,.4) 2px,rgba(168,130,214,.15) 2px,rgba(168,130,214,.15) 6px)}
      .__diGapLabel{position:fixed;pointer-events:none;z-index:2147483643;font-size:12px;font-weight:700;font-family:'JetBrains Mono',monospace;color:#fff;background:#a882d6d9;padding:2px 6px;border-radius:3px;white-space:nowrap;line-height:1.3;text-shadow:0 1px 1px #00000066;display:none}
      #__diNoSelect{font-size:14px;color:#636b80;text-align:center;padding:48px 24px}
      #__diHint{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:linear-gradient(180deg,rgba(55,60,80,.95),rgba(40,44,60,.95));color:#e8ecf4;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;z-index:2147483647;font-family:inherit;border:1px solid rgba(100,110,150,.25);box-shadow:0 1px 0 rgba(255,255,255,.05) inset,0 12px 36px rgba(0,0,0,.5);opacity:1;transition:opacity .5s;backdrop-filter:blur(8px)}
      #__diSaveBar{display:flex;gap:10px;padding:12px 18px;background:linear-gradient(180deg,rgba(24,27,36,.95),rgba(18,20,28,.95));border-top:1px solid rgba(80,90,140,.1);align-items:center;flex-shrink:0;box-shadow:0 -1px 0 rgba(0,0,0,.2)}
      #__diSaveBtn{background:linear-gradient(180deg,#3a7e96,#2c6478);border:1px solid rgba(80,160,190,.4);border-bottom-color:rgba(30,60,72,.6);color:#e0f4fc;font-size:13px;font-weight:700;padding:8px 22px;border-radius:8px;cursor:pointer;font-family:inherit;transition:all .2s;box-shadow:0 1px 0 rgba(255,255,255,.1) inset,0 3px 8px rgba(0,0,0,.25);text-shadow:0 1px 2px rgba(0,0,0,.3)}
      #__diSaveBtn:hover{background:linear-gradient(180deg,#4a90a8,#3a7488);box-shadow:0 1px 0 rgba(255,255,255,.12) inset,0 6px 16px rgba(0,0,0,.3);transform:translateY(-1px)}
      #__diSaveBtn:active{background:linear-gradient(180deg,#2c6478,#3a7e96);box-shadow:0 2px 6px rgba(0,0,0,.4) inset;transform:translateY(0)}
      #__diSaveBtn:disabled{opacity:.25;cursor:default;filter:none;box-shadow:none;transform:none}
      #__diResetBtn{background:linear-gradient(180deg,rgba(80,40,55,.7),rgba(60,28,42,.7));border:1px solid rgba(140,60,80,.3);border-bottom-color:rgba(40,18,28,.5);color:#e08898;font-size:12px;font-weight:600;padding:7px 14px;border-radius:7px;cursor:pointer;font-family:inherit;transition:all .2s;box-shadow:0 1px 0 rgba(255,255,255,.05) inset,0 2px 4px rgba(0,0,0,.2);text-shadow:0 1px 1px rgba(0,0,0,.3)}
      #__diResetBtn:hover{background:linear-gradient(180deg,rgba(100,48,65,.7),rgba(75,35,50,.7));color:#f0a0b0;transform:translateY(-1px)}
      #__diResetBtn:disabled{opacity:.25;cursor:default;transform:none}
      #__diChangeCount{font-size:12px;color:#636b80;margin-left:auto}
      #__diBreadcrumb{display:flex;flex-wrap:wrap;gap:3px;padding:8px 16px;background:linear-gradient(180deg,rgba(22,25,36,.8),rgba(18,20,28,.6));border-bottom:1px solid rgba(80,90,140,.06);align-items:center;flex-shrink:0}
      .di-bc-item{font-size:12px;color:#636b80;cursor:pointer;padding:3px 8px;border-radius:4px;white-space:nowrap;transition:all .2s}
      .di-bc-item:hover{background:rgba(108,199,240,.08);color:#6cc7f0}
      .di-bc-item.di-bc-current{color:#6cc7f0;font-weight:700;background:rgba(108,199,240,.08);border:1px solid rgba(108,199,240,.15)}
      .di-bc-sep{font-size:10px;color:#3a3f50}
      .di-css-del{color:#636b80;font-size:14px;cursor:pointer;padding:4px 10px;border-radius:4px;margin-left:6px;flex-shrink:0;transition:all .2s;border:1px solid transparent}
      .di-css-del:hover{color:#f06880;background:rgba(240,104,128,.06);border-color:rgba(240,104,128,.15)}
      .di-css-row.di-deleted .di-css-key,.di-css-row.di-deleted .di-css-val{text-decoration:line-through;opacity:.3}
      .di-val-opts{display:flex;flex-wrap:wrap;gap:5px;padding:4px 8px 8px 178px}
      .di-val-opt{font-size:13px;color:#636b80;background:linear-gradient(180deg,rgba(45,50,68,.4),rgba(30,34,48,.4));border:1px solid rgba(80,90,140,.1);padding:3px 10px;border-radius:5px;cursor:pointer;transition:all .2s;box-shadow:0 1px 0 rgba(255,255,255,.02) inset}
      .di-val-opt:hover{color:#6cc7f0;border-color:rgba(108,199,240,.25);background:rgba(108,199,240,.06)}
      .di-add-bar{padding:12px 20px;border-top:1px solid rgba(80,90,140,.08)}
      .di-add-title{font-size:11px;color:#636b80;margin-bottom:8px;text-transform:uppercase;letter-spacing:1.2px;font-weight:600}
      .di-add-btn{font-size:13px;color:#6cc7f0;background:linear-gradient(180deg,rgba(45,50,68,.5),rgba(30,34,48,.5));border:1px solid rgba(108,199,240,.12);padding:5px 12px;border-radius:6px;cursor:pointer;margin:2px;transition:all .2s;box-shadow:0 1px 0 rgba(255,255,255,.02) inset}
      .di-add-btn:hover{background:rgba(108,199,240,.1);border-color:rgba(108,199,240,.28)}
      .di-addClass-bar{padding:10px 20px;border-top:1px solid rgba(80,90,140,.08);display:flex;gap:8px;align-items:center}
      .di-addClass-input{flex:1;background:rgba(0,0,0,.25);border:1px solid rgba(80,90,140,.15);color:#d0d4de;font-size:13px;padding:6px 12px;border-radius:6px;font-family:inherit;outline:none;transition:all .2s;box-shadow:0 2px 4px rgba(0,0,0,.2) inset}
      .di-addClass-input:focus{border-color:rgba(108,199,240,.4);box-shadow:0 0 0 2px rgba(108,199,240,.08)}
      .di-addClass-btn{background:linear-gradient(180deg,#3a7e96,#2c6478);border:1px solid rgba(80,160,190,.4);border-bottom-color:rgba(30,60,72,.6);color:#e0f4fc;font-size:12px;font-weight:700;padding:6px 14px;border-radius:6px;cursor:pointer;white-space:nowrap;transition:all .2s;box-shadow:0 1px 0 rgba(255,255,255,.1) inset;text-shadow:0 1px 1px rgba(0,0,0,.3)}
      .di-addClass-btn:hover{background:linear-gradient(180deg,#4a90a8,#3a7488)}
      .di-addClass-suggest{font-size:11px;color:#6cc7f0;cursor:pointer;background:rgba(108,199,240,.05);border:1px solid rgba(108,199,240,.1);padding:3px 10px;border-radius:5px;white-space:nowrap;transition:all .2s}
      .di-addClass-suggest:hover{border-color:rgba(108,199,240,.28)}
      .di-mq-title{color:#e0a840;background:linear-gradient(180deg,rgba(55,45,30,.5),rgba(40,34,24,.5));padding:4px 12px;border-radius:5px;font-size:12px;font-weight:700;display:inline-block;margin-bottom:4px;letter-spacing:.8px;border:1px solid rgba(224,168,64,.15);text-shadow:0 0 8px rgba(224,168,64,.08)}
      .di-mq-group .di-css-key{color:#e0a840}
      .di-mq-group .di-css-val{color:#d090b0}
      .di-mq-group .di-css-val.di-changed{color:#f06880}
      .di-mq-group .di-css-row{border-bottom-color:rgba(224,168,64,.04)}
      @media(max-width:768px){#__diPanel{width:320px;font-size:13px}#__diHeader h3{font-size:14px}.di-css-key{min-width:120px;font-size:13px}.di-css-val{font-size:13px}.di-val-opts{padding-left:128px}.di-sel-value{font-size:14px}.di-css-row{font-size:13px}#__diHeaderBtns button{font-size:12px;padding:4px 10px}}
      .di-open-editor{font-size:12px;color:#6cc7f0;cursor:pointer;background:linear-gradient(180deg,rgba(45,50,68,.5),rgba(30,34,48,.5));border:1px solid rgba(108,199,240,.15);padding:3px 10px;border-radius:5px;margin-left:auto;white-space:nowrap;transition:all .2s;font-weight:600;box-shadow:0 1px 0 rgba(255,255,255,.02) inset}
      .di-open-editor:hover{border-color:rgba(108,199,240,.35);background:rgba(108,199,240,.08)}
      .di-sel-class{display:inline-block;margin:4px 5px 4px 0;font-size:14px;padding:5px 12px;font-weight:600;border-radius:6px;cursor:pointer;transition:all .2s;word-break:break-all}
      .di-sel-class.di-class-active{color:#6cc7f0;background:rgba(108,199,240,.1);border:1px solid rgba(108,199,240,.25);text-shadow:0 0 10px rgba(108,199,240,.12)}
      .di-sel-class:not(.di-class-active){color:#7a8194;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)}
      .di-sel-class:not(.di-class-active):hover{color:#a0a8be;background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
      .di-pseudo-title{color:#c090f8;background:rgba(192,144,248,.08);padding:4px 12px;border-radius:6px;font-size:12px;font-weight:700;display:inline-block;margin-bottom:4px;letter-spacing:.8px;border:1px solid rgba(192,144,248,.12)}
      .di-pseudo-group .di-css-key{color:#c090f8}
      .di-pseudo-group .di-css-val{color:#f0a8d0}
      .di-pseudo-group .di-css-row{border-bottom-color:rgba(192,144,248,.04)}
      #__diLayerPicker{position:fixed;z-index:2147483647;background:linear-gradient(168deg,#1a1d2e 0%,#141722 50%,#0f1118 100%);border:1px solid rgba(120,130,180,.2);border-radius:10px;box-shadow:0 12px 48px rgba(0,0,0,.6),0 0 0 1px rgba(0,0,0,.3);padding:6px 0;min-width:280px;max-width:400px;max-height:400px;overflow-y:auto;display:none;font-family:'JetBrains Mono',-apple-system,monospace;backdrop-filter:blur(16px);scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.08) transparent}
      #__diLayerPicker::-webkit-scrollbar{width:5px}
      #__diLayerPicker::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:10px}
      .di-layer-title{font-size:10px;color:#636b80;text-transform:uppercase;letter-spacing:1.5px;padding:6px 14px 4px;font-weight:600;border-bottom:1px solid rgba(80,90,140,.1)}
      .di-layer-item{display:flex;align-items:center;gap:8px;padding:7px 14px;cursor:pointer;font-size:13px;color:#b0b8cc;transition:all .15s;border-left:3px solid transparent}
      .di-layer-item:hover{background:rgba(108,199,240,.06);color:#e8ecf4;border-left-color:#6cc7f0}
      .di-layer-item .di-layer-tag{color:#6cc7f0;font-weight:600;min-width:0;flex-shrink:0}
      .di-layer-item .di-layer-class{color:#e0b050;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .di-layer-item .di-layer-pos{font-size:10px;color:#636b80;flex-shrink:0;background:rgba(255,255,255,.04);padding:2px 6px;border-radius:3px}
      .di-layer-item .di-layer-pseudo{font-size:10px;color:#c090f8;flex-shrink:0;background:rgba(192,144,248,.08);padding:2px 6px;border-radius:3px;border:1px solid rgba(192,144,248,.12)}
      .di-layer-item.di-layer-abs .di-layer-pos{color:#f0a860;background:rgba(240,168,96,.08)}
      .di-layer-item .di-layer-behind{font-size:10px;color:#60c0a0;flex-shrink:0;background:rgba(96,192,160,.1);padding:2px 6px;border-radius:3px;border:1px solid rgba(96,192,160,.15)}
      .di-layer-item.di-layer-hidden{opacity:.7}
      .di-layer-item.di-layer-hidden:hover{opacity:1}
      .di-layer-separator{font-size:10px;color:#636b80;text-transform:uppercase;letter-spacing:1.5px;padding:8px 14px 4px;font-weight:600;border-top:1px solid rgba(80,90,140,.12);margin-top:2px}
    `;
    document.head.appendChild(style);

    toast = document.createElement("div");
    toast.id = "__diCopied";
    document.documentElement.appendChild(toast);

    hoverOverlay = document.createElement("div");
    hoverOverlay.id = "__diHoverOverlay";
    document.documentElement.appendChild(hoverOverlay);

    hoverLabel = document.createElement("div");
    hoverLabel.id = "__diHoverLabel";
    document.documentElement.appendChild(hoverLabel);

    selectedOverlay = document.createElement("div");
    selectedOverlay.id = "__diSelectedOverlay";
    document.documentElement.appendChild(selectedOverlay);

    // Layer picker for Alt+Click
    window.__diLayerPicker = document.createElement("div");
    window.__diLayerPicker.id = "__diLayerPicker";
    document.documentElement.appendChild(window.__diLayerPicker);

    // Box model overlays (DevTools style)
    window.__diBoxEls = { margin: [], padding: [], content: null };
    for (let i = 0; i < 4; i++) {
      const m = document.createElement("div"); m.className = "__diBoxMargin";
      document.documentElement.appendChild(m); window.__diBoxEls.margin.push(m);
      const p = document.createElement("div"); p.className = "__diBoxPadding";
      document.documentElement.appendChild(p); window.__diBoxEls.padding.push(p);
    }
    const c = document.createElement("div"); c.className = "__diBoxContent";
    // Dimension labels (margin top/right/bottom/left, padding top/right/bottom/left)
    window.__diBoxLabels = [];
    for (let i = 0; i < 8; i++) {
      const lbl = document.createElement("div"); lbl.className = "__diBoxLabel";
      document.documentElement.appendChild(lbl); window.__diBoxLabels.push(lbl);
    }
    // Hover box model overlays
    window.__diHoverBoxEls = { margin: [], padding: [], content: null };
    for (let i = 0; i < 4; i++) {
      const hm = document.createElement("div"); hm.className = "__diHoverMargin";
      document.documentElement.appendChild(hm); window.__diHoverBoxEls.margin.push(hm);
      const hp = document.createElement("div"); hp.className = "__diHoverPadding";
      document.documentElement.appendChild(hp); window.__diHoverBoxEls.padding.push(hp);
    }
    const hc = document.createElement("div"); hc.className = "__diHoverContent";
    document.documentElement.appendChild(hc); window.__diHoverBoxEls.content = hc;
    document.documentElement.appendChild(c); window.__diBoxEls.content = c;

    panel = document.createElement("div");
    panel.id = "__diPanel";
    panel.innerHTML = `<div id="__diHeader"><h3>🔍 DivInspector WP</h3><div id="__diHeaderBtns"><button id="__diPipBtn" title="別ウィンドウで開く">📌</button><button id="__diFoldBtn" title="折りたたみ">▼</button><button id="__diCloseBtn">✕</button></div></div><div id="__diPresets" style="display:flex;gap:4px;padding:8px 12px;background:rgba(10,14,39,.9);border-bottom:1px solid #2a2a4a;flex-wrap:wrap;align-items:center"><span style="font-size:10px;color:#666;margin-right:4px">幅:</span></div><div id="__diBody"><div id="__diNoSelect">ページ上の要素をクリックして検証<br><span style="font-size:12px;color:#666;margin-top:8px;display:block">Qキーで終了</span></div></div><div id="__diSaveBar"><button id="__diResetBtn" disabled>↩ Reset</button><button id="__diSaveBtn" disabled>💾 Save</button><span id="__diChangeCount">0件</span></div>`;
    document.documentElement.appendChild(panel);
    panel.querySelector("#__diSaveBtn").addEventListener("click", function(e) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      saveChanges();
    }, true);
    panel.querySelector("#__diResetBtn").addEventListener("click", function(e) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      resetChanges();
    }, true);

    // プリセット幅ボタン
    const presets = [
      { label: "2560", w: 2560, rem: "1px" },
      { label: "1920", w: 1920, rem: "1px" },
      { label: "1680", w: 1680, rem: "1px" },
      { label: "1440", w: 1440, rem: "1px" },
      { label: "1300", w: 1300, rem: "1px" },
      { label: "1024", w: 1024, rem: "calc(1024 / 1300 * 1px)" },
      { label: "768",  w: 768,  rem: "calc(768 / 440 * 1px)" },
      { label: "390",  w: 390,  rem: "calc(390 / 440 * 1px)" },
      { label: "375",  w: 375,  rem: "calc(375 / 440 * 1px)" },
    ];
    let activePreset = null;
    const presetBar = panel.querySelector("#__diPresets");

    presets.forEach(p => {
      const btn = document.createElement("button");
      btn.textContent = p.label;
      btn.style.cssText = "background:#16213e;border:1px solid #333;color:#aaa;font-size:12px;padding:4px 10px;border-radius:5px;cursor:pointer;font-family:inherit";
      btn.addEventListener("click", function(e) {
        e.stopPropagation();
        const h = window.screen.availHeight || 900;
        window.open(window.location.href, "_blank", "width=" + p.w + ",height=" + h + ",menubar=no,toolbar=no,location=yes,resizable=yes,scrollbars=yes");
      });
      presetBar.appendChild(btn);
    });

    // Hint
    const hint = document.createElement("div");
    hint.id = "__diHint";
    hint.textContent = "🔍 DivInspector WP ON — 要素をクリックで検証 / Qキーで終了";
    document.body.appendChild(hint);
    setTimeout(() => {
      hint.style.opacity = "0";
      setTimeout(() => hint.remove(), 500);
    }, 2500);

    // 📌 Picture-in-Picture ポップアウト
    // pipWindowは外部スコープで宣言済み
    async function openPiP() {
      if (!('documentPictureInPicture' in window)) return;
      if (pipWindow) return; // 既に開いている
      try {
        pipWindow = await documentPictureInPicture.requestWindow({
          width: 540,
          height: 900,
        });
        const pipStyle = pipWindow.document.createElement('style');
        pipStyle.textContent = style.textContent;
        pipWindow.document.head.appendChild(pipStyle);
        const pipBaseStyle = pipWindow.document.createElement('style');
        pipBaseStyle.textContent = `
          body{margin:0;background:rgba(15,17,28,.98);min-height:100vh}
          #__diPanel{position:static!important;width:100%!important;max-height:100vh!important;border-radius:0!important;box-shadow:none!important;border:none!important}
        `;
        pipWindow.document.head.appendChild(pipBaseStyle);
        pipWindow.document.body.appendChild(panel);
        pipWindow.addEventListener('pagehide', () => {
          document.documentElement.appendChild(panel);
          panel.style.position = '';
          panel.style.width = '';
          panel.style.maxHeight = '';
          panel.style.left = '';
          panel.style.top = '';
          panel.style.right = '16px';
          pipWindow = null;
        });
      } catch (err) {
        console.error('[Inspector PiP Error]', err);
      }
    }
    const pipBtn = panel.querySelector("#__diPipBtn");
    if (pipBtn) {
      pipBtn.addEventListener("click", (e) => { e.stopPropagation(); openPiP(); });
    }
    // 自動でPiPを開く
    openPiP();

    // Draggable — Pointer Capture方式（DevTools開いても動く）
    const header = panel.querySelector("#__diHeader");
    header.style.touchAction = "none";

    header.addEventListener("pointerdown", function(e) {
      if (e.target.tagName === "BUTTON") return;
      isDragging = true;
      const rect = panel.getBoundingClientRect();
      dragX = e.clientX - rect.left;
      dragY = e.clientY - rect.top;
      header.setPointerCapture(e.pointerId);
      document.body.style.userSelect = "none";
      e.preventDefault();
      e.stopPropagation();
    });

    header.addEventListener("pointermove", function(e) {
      if (!isDragging) return;
      let x = e.clientX - dragX;
      let y = e.clientY - dragY;
      panel.style.left = x + "px";
      panel.style.top = y + "px";
      panel.style.right = "auto";
      e.preventDefault();
    });

    header.addEventListener("pointerup", function(e) {
      if (!isDragging) return;
      isDragging = false;
      header.releasePointerCapture(e.pointerId);
      document.body.style.userSelect = "";
    });

    panel.querySelector("#__diCloseBtn").addEventListener("click", function(e) {
      e.stopPropagation();
      destroyInspector();
    });
    panel.querySelector("#__diFoldBtn").addEventListener("click", function(e) {
      e.stopPropagation();
      panel.classList.toggle("di-collapsed");
      this.textContent = panel.classList.contains("di-collapsed") ? "▲" : "▼";
    });
    document.addEventListener("mousemove", onHover, true);
    document.addEventListener("click", onSelect, true);
    window.addEventListener("scroll", onScroll, true);

    // リロード後の状態復元（少し遅延して要素が描画されてから実行）
    setTimeout(() => tryRestoreState(), 300);
  }

  function isInspectorEl(el) {
    if (panel?.contains(el) || el === hoverOverlay || el === hoverLabel || el === selectedOverlay || el === toast || el?.id === "__diHint") return true;
    if (el?.classList?.contains("__diBoxMargin") || el?.classList?.contains("__diBoxPadding") || el?.classList?.contains("__diBoxContent")) return true;
    if (el?.classList?.contains("__diHoverMargin") || el?.classList?.contains("__diHoverPadding") || el?.classList?.contains("__diHoverContent")) return true;
    if (el?.classList?.contains("__diBoxLabel")) return true;
    if (el?.classList?.contains("__diGap") || el?.classList?.contains("__diGapLabel")) return true;
    if (el?.id === "__diLayerPicker" || el?.closest?.("#__diLayerPicker")) return true;
    return false;
  }

  // Build parent path string like DevTools: section.p-mv > div.p-mv__inner > h1
  function getElementPath(el, maxDepth) {
    const parts = [];
    let cur = el;
    let depth = 0;
    while (cur && cur !== document.body && cur !== document.documentElement && depth < (maxDepth || 3)) {
      const tag = cur.tagName.toLowerCase();
      const cls = cur.className && typeof cur.className === "string" ? "." + cur.className.trim().split(/\s+/)[0] : "";
      parts.unshift(tag + cls);
      cur = cur.parentElement;
      depth++;
    }
    return parts.join(" › ");
  }

  // Position hover box model overlays (lighter version for hover)
  function updateHoverBoxModel(el) {
    const b = window.__diHoverBoxEls;
    if (!b) return;
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const mt = parseFloat(cs.marginTop) || 0;
    const mr = parseFloat(cs.marginRight) || 0;
    const mb = parseFloat(cs.marginBottom) || 0;
    const ml = parseFloat(cs.marginLeft) || 0;
    const pt = parseFloat(cs.paddingTop) || 0;
    const pr = parseFloat(cs.paddingRight) || 0;
    const pb = parseFloat(cs.paddingBottom) || 0;
    const pl = parseFloat(cs.paddingLeft) || 0;

    const mEls = b.margin;
    mEls[0].style.cssText = `position:fixed;pointer-events:none;z-index:2147483633;background:rgba(246,178,107,.3);display:${mt > 0 ? 'block' : 'none'};left:${rect.left - ml}px;top:${rect.top - mt}px;width:${rect.width + ml + mr}px;height:${mt}px`;
    mEls[1].style.cssText = `position:fixed;pointer-events:none;z-index:2147483633;background:rgba(246,178,107,.3);display:${mr > 0 ? 'block' : 'none'};left:${rect.right}px;top:${rect.top}px;width:${mr}px;height:${rect.height}px`;
    mEls[2].style.cssText = `position:fixed;pointer-events:none;z-index:2147483633;background:rgba(246,178,107,.3);display:${mb > 0 ? 'block' : 'none'};left:${rect.left - ml}px;top:${rect.bottom}px;width:${rect.width + ml + mr}px;height:${mb}px`;
    mEls[3].style.cssText = `position:fixed;pointer-events:none;z-index:2147483633;background:rgba(246,178,107,.3);display:${ml > 0 ? 'block' : 'none'};left:${rect.left - ml}px;top:${rect.top}px;width:${ml}px;height:${rect.height}px`;

    const pEls = b.padding;
    pEls[0].style.cssText = `position:fixed;pointer-events:none;z-index:2147483634;background:rgba(147,196,125,.3);display:${pt > 0 ? 'block' : 'none'};left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${pt}px`;
    pEls[1].style.cssText = `position:fixed;pointer-events:none;z-index:2147483634;background:rgba(147,196,125,.3);display:${pr > 0 ? 'block' : 'none'};left:${rect.right - pr}px;top:${rect.top + pt}px;width:${pr}px;height:${rect.height - pt - pb}px`;
    pEls[2].style.cssText = `position:fixed;pointer-events:none;z-index:2147483634;background:rgba(147,196,125,.3);display:${pb > 0 ? 'block' : 'none'};left:${rect.left}px;top:${rect.bottom - pb}px;width:${rect.width}px;height:${pb}px`;
    pEls[3].style.cssText = `position:fixed;pointer-events:none;z-index:2147483634;background:rgba(147,196,125,.3);display:${pl > 0 ? 'block' : 'none'};left:${rect.left}px;top:${rect.top + pt}px;width:${pl}px;height:${rect.height - pt - pb}px`;

    b.content.style.cssText = `position:fixed;pointer-events:none;z-index:2147483635;background:rgba(111,168,220,.25);display:block;left:${rect.left + pl}px;top:${rect.top + pt}px;width:${rect.width - pl - pr}px;height:${rect.height - pt - pb}px`;
  }

  function hideHoverBoxModel() {
    const b = window.__diHoverBoxEls;
    if (!b) return;
    b.margin.forEach(el => el.style.display = "none");
    b.padding.forEach(el => el.style.display = "none");
    if (b.content) b.content.style.display = "none";
  }

  function onHover(e) {
    if (!active || isDragging) return;
    const el = e.target;
    if (isInspectorEl(el)) {
      hoverOverlay.style.display = "none";
      hoverLabel.style.display = "none";
      hideHoverBoxModel();
      hideGapOverlay();
      return;
    }
    const rect = el.getBoundingClientRect();
    hoverOverlay.style.display = "block";
    hoverOverlay.style.left = rect.left + "px";
    hoverOverlay.style.top = rect.top + "px";
    hoverOverlay.style.width = rect.width + "px";
    hoverOverlay.style.height = rect.height + "px";

    const cs = getComputedStyle(el);
    const cls = el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : "";
    const tag = el.tagName.toLowerCase() + cls;
    const dims = Math.round(rect.width) + " × " + Math.round(rect.height);
    const mt = Math.round(parseFloat(cs.marginTop) || 0);
    const fontSize = cs.fontSize;
    const color = cs.color;
    const fontFamily = (cs.fontFamily || "").split(",")[0].replace(/['"]/g, "").trim();
    const display = cs.display;

    let lines = [tag + "  " + dims];
    // Font info
    if (fontSize) {
      let fontLine = "Font " + fontSize;
      if (fontFamily) fontLine += '  "' + fontFamily + '"';
      lines.push(fontLine);
    }
    // Color (rgb→hex)
    if (color) {
      const hex = color.replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+)?\s*\)/g, (_, r, g, b) =>
        "#" + [r, g, b].map(x => parseInt(x).toString(16).padStart(2, "0")).join("")
      );
      lines.push("Color " + hex);
    }
    // Display + gap
    if (display === "flex" || display === "inline-flex" || display === "grid" || display === "inline-grid") {
      const gap = cs.gap || cs.columnGap || cs.rowGap || "";
      let dispLine = display;
      if (gap && gap !== "normal" && gap !== "0px") dispLine += "  gap: " + gap;
      lines.push(dispLine);
    }

    hoverLabel.textContent = lines.join("\n");
    hoverLabel.style.display = "block";
    hoverLabel.style.left = Math.max(0, rect.left) + "px";
    // Position above margin-top
    const labelHeight = lines.length * 17 + 12;
    hoverLabel.style.top = Math.max(0, rect.top - mt - labelHeight) + "px";

    // Show hover box model + gap
    updateHoverBoxModel(el);
    updateGapOverlay(el);
  }

  function updateBoxModelOverlay(el) {
    const b = window.__diBoxEls;
    if (!b) return;
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const mt = parseFloat(cs.marginTop) || 0;
    const mr = parseFloat(cs.marginRight) || 0;
    const mb = parseFloat(cs.marginBottom) || 0;
    const ml = parseFloat(cs.marginLeft) || 0;
    const pt = parseFloat(cs.paddingTop) || 0;
    const pr = parseFloat(cs.paddingRight) || 0;
    const pb = parseFloat(cs.paddingBottom) || 0;
    const pl = parseFloat(cs.paddingLeft) || 0;

    const mEls = b.margin;
    mEls[0].style.cssText = `position:fixed;pointer-events:none;z-index:2147483636;background:rgba(246,178,107,.5);display:${mt > 0 ? 'block' : 'none'};left:${rect.left - ml}px;top:${rect.top - mt}px;width:${rect.width + ml + mr}px;height:${mt}px`;
    mEls[1].style.cssText = `position:fixed;pointer-events:none;z-index:2147483636;background:rgba(246,178,107,.5);display:${mr > 0 ? 'block' : 'none'};left:${rect.right}px;top:${rect.top}px;width:${mr}px;height:${rect.height}px`;
    mEls[2].style.cssText = `position:fixed;pointer-events:none;z-index:2147483636;background:rgba(246,178,107,.5);display:${mb > 0 ? 'block' : 'none'};left:${rect.left - ml}px;top:${rect.bottom}px;width:${rect.width + ml + mr}px;height:${mb}px`;
    mEls[3].style.cssText = `position:fixed;pointer-events:none;z-index:2147483636;background:rgba(246,178,107,.5);display:${ml > 0 ? 'block' : 'none'};left:${rect.left - ml}px;top:${rect.top}px;width:${ml}px;height:${rect.height}px`;

    const pEls = b.padding;
    pEls[0].style.cssText = `position:fixed;pointer-events:none;z-index:2147483637;background:rgba(147,196,125,.5);display:${pt > 0 ? 'block' : 'none'};left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${pt}px`;
    pEls[1].style.cssText = `position:fixed;pointer-events:none;z-index:2147483637;background:rgba(147,196,125,.5);display:${pr > 0 ? 'block' : 'none'};left:${rect.right - pr}px;top:${rect.top + pt}px;width:${pr}px;height:${rect.height - pt - pb}px`;
    pEls[2].style.cssText = `position:fixed;pointer-events:none;z-index:2147483637;background:rgba(147,196,125,.5);display:${pb > 0 ? 'block' : 'none'};left:${rect.left}px;top:${rect.bottom - pb}px;width:${rect.width}px;height:${pb}px`;
    pEls[3].style.cssText = `position:fixed;pointer-events:none;z-index:2147483637;background:rgba(147,196,125,.5);display:${pl > 0 ? 'block' : 'none'};left:${rect.left}px;top:${rect.top + pt}px;width:${pl}px;height:${rect.height - pt - pb}px`;

    b.content.style.cssText = `position:fixed;pointer-events:none;z-index:2147483638;background:rgba(111,168,220,.4);display:block;left:${rect.left + pl}px;top:${rect.top + pt}px;width:${rect.width - pl - pr}px;height:${rect.height - pt - pb}px`;

    // Dimension labels on margin/padding strips
    const lbls = window.__diBoxLabels;
    if (!lbls) return;
    const marginLabelBase = 'position:fixed;pointer-events:none;z-index:2147483642;font-size:12px;font-weight:700;font-family:"JetBrains Mono",monospace;color:#fff;background:#d4874acc;padding:2px 6px;border-radius:3px;white-space:nowrap;line-height:1;display:flex;align-items:center;justify-content:center;text-shadow:0 1px 1px #00000066;';
    const paddingLabelBase = 'position:fixed;pointer-events:none;z-index:2147483642;font-size:12px;font-weight:700;font-family:"JetBrains Mono",monospace;color:#fff;background:#6aaa52cc;padding:2px 6px;border-radius:3px;white-space:nowrap;line-height:1;display:flex;align-items:center;justify-content:center;text-shadow:0 1px 1px #00000066;';
    // Margin labels (0-3: top, right, bottom, left)
    lbls[0].style.cssText = marginLabelBase + (mt >= 8 ? `display:flex;left:${rect.left + rect.width / 2 - 12}px;top:${rect.top - mt + mt / 2 - 6}px` : 'display:none');
    lbls[0].textContent = mt > 0 ? Math.round(mt) : '';
    lbls[1].style.cssText = marginLabelBase + (mr >= 16 ? `display:flex;left:${rect.right + mr / 2 - 10}px;top:${rect.top + rect.height / 2 - 6}px` : 'display:none');
    lbls[1].textContent = mr > 0 ? Math.round(mr) : '';
    lbls[2].style.cssText = marginLabelBase + (mb >= 8 ? `display:flex;left:${rect.left + rect.width / 2 - 12}px;top:${rect.bottom + mb / 2 - 6}px` : 'display:none');
    lbls[2].textContent = mb > 0 ? Math.round(mb) : '';
    lbls[3].style.cssText = marginLabelBase + (ml >= 16 ? `display:flex;left:${rect.left - ml + ml / 2 - 10}px;top:${rect.top + rect.height / 2 - 6}px` : 'display:none');
    lbls[3].textContent = ml > 0 ? Math.round(ml) : '';
    // Padding labels (4-7: top, right, bottom, left)
    lbls[4].style.cssText = paddingLabelBase + (pt >= 8 ? `display:flex;left:${rect.left + rect.width / 2 - 12}px;top:${rect.top + pt / 2 - 6}px` : 'display:none');
    lbls[4].textContent = pt > 0 ? Math.round(pt) : '';
    lbls[5].style.cssText = paddingLabelBase + (pr >= 16 ? `display:flex;left:${rect.right - pr + pr / 2 - 10}px;top:${rect.top + rect.height / 2 - 6}px` : 'display:none');
    lbls[5].textContent = pr > 0 ? Math.round(pr) : '';
    lbls[6].style.cssText = paddingLabelBase + (pb >= 8 ? `display:flex;left:${rect.left + rect.width / 2 - 12}px;top:${rect.bottom - pb + pb / 2 - 6}px` : 'display:none');
    lbls[6].textContent = pb > 0 ? Math.round(pb) : '';
    lbls[7].style.cssText = paddingLabelBase + (pl >= 16 ? `display:flex;left:${rect.left + pl / 2 - 10}px;top:${rect.top + rect.height / 2 - 6}px` : 'display:none');
    lbls[7].textContent = pl > 0 ? Math.round(pl) : '';
  }

  function hideBoxModelOverlay() {
    const b = window.__diBoxEls;
    if (!b) return;
    b.margin.forEach(el => el.style.display = "none");
    b.padding.forEach(el => el.style.display = "none");
    if (b.content) b.content.style.display = "none";
    if (window.__diBoxLabels) window.__diBoxLabels.forEach(l => l.style.display = "none");
  }

  // Gap visualization
  function updateGapOverlay(el) {
    // Clean old gap elements and labels
    document.querySelectorAll(".__diGap").forEach(g => g.remove());
    document.querySelectorAll(".__diGapLabel").forEach(g => g.remove());
    const cs = getComputedStyle(el);
    const display = cs.display;
    if (display !== "flex" && display !== "inline-flex" && display !== "grid" && display !== "inline-grid") return;
    const gap = parseFloat(cs.gap) || parseFloat(cs.columnGap) || parseFloat(cs.rowGap) || 0;
    if (gap <= 0) return;

    const children = Array.from(el.children).filter(c => {
      const s = getComputedStyle(c);
      return s.display !== "none" && s.position !== "absolute" && s.position !== "fixed";
    });
    if (children.length < 2) return;

    const isRow = cs.flexDirection === "row" || cs.flexDirection === "row-reverse" || display === "grid" || display === "inline-grid";
    const rowGap = parseFloat(cs.rowGap) || parseFloat(cs.gap) || 0;
    const colGap = parseFloat(cs.columnGap) || parseFloat(cs.gap) || 0;

    for (let i = 0; i < children.length - 1; i++) {
      const r1 = children[i].getBoundingClientRect();
      const r2 = children[i + 1].getBoundingClientRect();
      const gapEl = document.createElement("div");
      gapEl.className = "__diGap";

      if (isRow && Math.abs(r1.top - r2.top) < r1.height * 0.5) {
        // Horizontal gap
        const gLeft = Math.min(r1.right, r2.right);
        const gRight = Math.max(r1.left, r2.left);
        const gW = gRight - gLeft;
        if (gW > 0 && gW < colGap * 2) {
          gapEl.style.cssText = `position:fixed;pointer-events:none;z-index:2147483639;display:block;left:${gLeft}px;top:${Math.min(r1.top, r2.top)}px;width:${gW}px;height:${Math.max(r1.height, r2.height)}px;background:repeating-linear-gradient(45deg,rgba(168,130,214,.4),rgba(168,130,214,.4) 2px,rgba(168,130,214,.15) 2px,rgba(168,130,214,.15) 6px)`;
          document.documentElement.appendChild(gapEl);
          // Gap value label (centered on gap area)
          const gapLabel = document.createElement("div");
          gapLabel.className = "__diGapLabel";
          gapLabel.textContent = Math.round(gW);
          const gapTop = Math.min(r1.top, r2.top);
          const gapHeight = Math.max(r1.height, r2.height);
          gapLabel.style.cssText = `position:fixed;pointer-events:none;z-index:2147483643;display:block;left:${gLeft + gW / 2}px;top:${gapTop + gapHeight / 2}px;transform:translate(-50%,-50%);font-size:12px;font-weight:700;font-family:'JetBrains Mono',monospace;color:#fff;background:#a882d6d9;padding:2px 6px;border-radius:3px;white-space:nowrap;line-height:1.3;text-shadow:0 1px 1px #00000066`;
          document.documentElement.appendChild(gapLabel);
        }
      } else if (r2.top > r1.bottom - 2) {
        // Vertical gap
        const gH = r2.top - r1.bottom;
        if (gH > 0 && gH < rowGap * 2) {
          const parentRect = el.getBoundingClientRect();
          gapEl.style.cssText = `position:fixed;pointer-events:none;z-index:2147483639;display:block;left:${parentRect.left}px;top:${r1.bottom}px;width:${parentRect.width}px;height:${gH}px;background:repeating-linear-gradient(45deg,rgba(168,130,214,.4),rgba(168,130,214,.4) 2px,rgba(168,130,214,.15) 2px,rgba(168,130,214,.15) 6px)`;
          document.documentElement.appendChild(gapEl);
          // Gap value label (centered on gap area)
          const gapLabel = document.createElement("div");
          gapLabel.className = "__diGapLabel";
          gapLabel.textContent = Math.round(gH);
          gapLabel.style.cssText = `position:fixed;pointer-events:none;z-index:2147483643;display:block;left:${parentRect.left + parentRect.width / 2}px;top:${r1.bottom + gH / 2}px;transform:translate(-50%,-50%);font-size:12px;font-weight:700;font-family:'JetBrains Mono',monospace;color:#fff;background:#a882d6d9;padding:2px 6px;border-radius:3px;white-space:nowrap;line-height:1.3;text-shadow:0 1px 1px #00000066`;
          document.documentElement.appendChild(gapLabel);
        }
      }
    }
  }

  function hideGapOverlay() {
    document.querySelectorAll(".__diGap").forEach(g => g.remove());
    document.querySelectorAll(".__diGapLabel").forEach(g => g.remove());
  }

  // Build ancestor chain from body to target element
  function getAncestorChain(el) {
    const chain = [];
    let cur = el;
    while (cur && cur !== document.body && cur !== document.documentElement) {
      chain.unshift(cur);
      cur = cur.parentElement;
    }
    return chain;
  }

  let drillChain = [];
  let drillIndex = -1;

  function onSelect(e) {
    if (!active) return;
    const el = e.target;
    if (isInspectorEl(el)) return;
    e.preventDefault();
    e.stopPropagation();

    // Alt+Click: show layer picker with all elements at this point
    if (e.altKey) {
      showLayerPicker(e.clientX, e.clientY);
      return;
    }

    // Hide layer picker if open
    hideLayerPicker();

    const chain = getAncestorChain(el);

    if (selectedEl && drillChain.length > 0 && drillChain[drillChain.length - 1] === el) {
      // Same deepest element clicked: drill down one step
      if (drillIndex < drillChain.length - 1) {
        drillIndex++;
      }
    } else if (selectedEl && selectedEl.contains(el)) {
      // Clicked inside current selection: drill into child
      // Rebuild chain from selectedEl to el
      const subChain = [];
      let cur = el;
      while (cur && cur !== selectedEl) {
        subChain.unshift(cur);
        cur = cur.parentElement;
      }
      subChain.unshift(selectedEl);
      drillChain = subChain;
      drillIndex = Math.min(1, drillChain.length - 1);
    } else {
      // New area clicked: start from parent
      drillChain = chain;
      drillIndex = Math.max(0, chain.length - 4); // Start ~3 levels up
    }

    const target = drillChain[drillIndex];
    selectElement(target);
  }

  // Select and inspect an element (shared between normal click and layer picker)
  function selectElement(target) {
    selectedEl = target;
    updatePanel(target);
    const rect = target.getBoundingClientRect();
    selectedOverlay.style.display = "block";
    selectedOverlay.style.left = rect.left + "px";
    selectedOverlay.style.top = rect.top + "px";
    selectedOverlay.style.width = rect.width + "px";
    selectedOverlay.style.height = rect.height + "px";
    updateBoxModelOverlay(target);
    updateGapOverlay(target);
  }

  // Find absolute/fixed positioned elements at a point via DOM traversal
  function findAllElementsAtPoint(x, y) {
    const results = [];
    const walk = (el) => {
      if (isInspectorEl(el)) return;
      if (el === document.body || el === document.documentElement) {
        for (const child of el.children) walk(child);
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 &&
          x >= rect.left && x <= rect.right &&
          y >= rect.top && y <= rect.bottom) {
        const cs = getComputedStyle(el);
        if (cs.display !== 'none' && cs.visibility !== 'hidden') {
          const pos = cs.position;
          // absolute / fixed のみ
          if (pos === 'absolute' || pos === 'fixed') {
            results.push(el);
          }
        }
      }
      for (const child of el.children) walk(child);
    };
    walk(document.body);
    return results;
  }

  // Layer picker: show all elements at a given point
  function showLayerPicker(x, y) {
    const picker = window.__diLayerPicker;
    if (!picker) return;

    // Get all elements at this point (normal hit-test)
    const hitTestEls = document.elementsFromPoint(x, y);
    const hitTestSet = new Set(hitTestEls);

    // Filter hit-test elements
    const frontCandidates = hitTestEls.filter(el => {
      if (isInspectorEl(el)) return false;
      if (el === document.body || el === document.documentElement) return false;
      if (el.tagName === 'HTML' || el.tagName === 'BODY') return false;
      return true;
    });

    // DOM traversal to find hidden/behind elements
    const allAtPoint = findAllElementsAtPoint(x, y);
    const behindCandidates = allAtPoint.filter(el => {
      if (hitTestSet.has(el)) return false; // Already in front list
      if (el.tagName === 'HTML' || el.tagName === 'BODY') return false;
      return true;
    });

    // Combined candidates: front first, then behind
    const candidates = [...frontCandidates, ...behindCandidates];

    if (candidates.length === 0) {
      hideLayerPicker();
      return;
    }

    // Build layer item HTML helper
    function buildLayerItemHTML(el, idx, isBehind) {
      const tag = el.tagName.toLowerCase();
      const allClasses = el.className && typeof el.className === 'string' ? el.className.trim() : '';
      // 背面要素はフルクラス名表示、前面は先頭クラスのみ
      const displayCls = isBehind ? allClasses : (allClasses ? allClasses.split(/\s+/)[0] : '');
      const cs = getComputedStyle(el);
      const pos = cs.position;
      const isAbs = pos === 'absolute' || pos === 'fixed';

      let itemClass = 'di-layer-item';
      if (isAbs) itemClass += ' di-layer-abs';
      if (isBehind) itemClass += ' di-layer-hidden';

      let h = '<div class="' + itemClass + '" data-layer-idx="' + idx + '">';
      h += '<span class="di-layer-tag">' + tag + '</span>';
      if (displayCls) h += '<span class="di-layer-class">.' + displayCls.split(/\s+/).join('.') + '</span>';
      if (isAbs) h += '<span class="di-layer-pos">' + pos + '</span>';
      h += '</div>';
      return h;
    }

    let html = '<div class="di-layer-title">⚡ Alt+Click — レイヤー選択 (' + candidates.length + ')</div>';

    // Front elements
    frontCandidates.forEach((el, i) => {
      html += buildLayerItemHTML(el, i, false);
    });

    // Behind elements section
    if (behindCandidates.length > 0) {
      html += '<div class="di-layer-separator">🔙 背面レイヤー (' + behindCandidates.length + ')</div>';
      behindCandidates.forEach((el, i) => {
        html += buildLayerItemHTML(el, frontCandidates.length + i, true);
      });
    }

    picker.innerHTML = html;
    picker.style.display = 'block';

    // Position near click, but keep within viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = x + 12;
    let top = y + 12;
    // Delay to get actual dimensions
    requestAnimationFrame(() => {
      const pw = picker.offsetWidth;
      const ph = picker.offsetHeight;
      if (left + pw > vw - 10) left = x - pw - 12;
      if (top + ph > vh - 10) top = y - ph - 12;
      if (left < 10) left = 10;
      if (top < 10) top = 10;
      picker.style.left = left + 'px';
      picker.style.top = top + 'px';
    });
    picker.style.left = left + 'px';
    picker.style.top = top + 'px';

    // Store candidates for click handler
    window.__diLayerCandidates = candidates;

    // Click handler for layer items
    picker.onclick = function(ev) {
      const item = ev.target.closest('.di-layer-item');
      if (!item) return;
      const idx = parseInt(item.dataset.layerIdx);
      const target = window.__diLayerCandidates[idx];
      if (target) {
        hideLayerPicker();
        // Set up drill chain for the selected element
        drillChain = getAncestorChain(target);
        drillIndex = drillChain.length - 1;
        selectElement(target);
      }
    };

    // Hover highlight for layer items
    picker.onmouseover = function(ev) {
      const item = ev.target.closest('.di-layer-item');
      if (!item) return;
      const idx = parseInt(item.dataset.layerIdx);
      const target = window.__diLayerCandidates[idx];
      if (target) {
        const rect = target.getBoundingClientRect();
        hoverOverlay.style.display = 'block';
        hoverOverlay.style.left = rect.left + 'px';
        hoverOverlay.style.top = rect.top + 'px';
        hoverOverlay.style.width = rect.width + 'px';
        hoverOverlay.style.height = rect.height + 'px';
      }
    };
    picker.onmouseleave = function() {
      hoverOverlay.style.display = 'none';
    };
  }

  function hideLayerPicker() {
    const picker = window.__diLayerPicker;
    if (picker) {
      picker.style.display = 'none';
      picker.innerHTML = '';
    }
    window.__diLayerCandidates = null;
  }

  function onScroll() {
    if (!selectedEl) return;
    const rect = selectedEl.getBoundingClientRect();
    selectedOverlay.style.left = rect.left + "px";
    selectedOverlay.style.top = rect.top + "px";
    selectedOverlay.style.width = rect.width + "px";
    selectedOverlay.style.height = rect.height + "px";
    updateBoxModelOverlay(selectedEl);
  }

  // プロパティごとのよくある値プリセット
  const valuePresets = {
    "display": ["flex", "block", "grid", "inline-flex", "inline-block", "none"],
    "align-items": ["center", "flex-start", "flex-end", "stretch", "baseline"],
    "justify-content": ["center", "flex-start", "flex-end", "space-between", "space-around", "space-evenly"],
    "flex-direction": ["row", "column", "row-reverse", "column-reverse"],
    "flex-wrap": ["wrap", "nowrap"],
    "position": ["relative", "absolute", "fixed", "sticky", "static"],
    "overflow": ["hidden", "auto", "scroll", "visible"],
    "text-align": ["left", "center", "right", "justify"],
    "font-weight": ["400", "500", "600", "700", "900"],
    "text-decoration": ["none", "underline", "line-through"],
    "white-space": ["nowrap", "normal", "pre-wrap"],
    "object-fit": ["cover", "contain", "fill", "none"],
  };

  function copyText(text) {
    function showToast() {
      toast.textContent = "✓ " + (text.length > 35 ? text.slice(0, 35) + "…" : text);
      toast.classList.add("di-show");
      setTimeout(() => toast.classList.remove("di-show"), 800);
    }
    // Try clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(showToast).catch(() => {
        // Fallback: execCommand
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.cssText = "position:fixed;left:-9999px;top:-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        showToast();
      });
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;left:-9999px;top:-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      showToast();
    }
  }

  function updatePanel(el) {
    const body = panel.querySelector("#__diBody");
    const cs = getComputedStyle(el);
    const classList = el.className && typeof el.className === "string" ? el.className.trim() : "";
    const classNames = classList ? classList.split(/\s+/) : [];
    // activeClass: ユーザーが切り替え可能なフォーカスクラス
    let activeClass = window.__diActiveClass && classNames.includes(window.__diActiveClass) ? window.__diActiveClass : (classNames[0] || "");
    window.__diActiveClass = activeClass; // applyValueと同期
    const tag = el.tagName.toLowerCase();
    const selector = tag + (classList ? "." + classList.split(/\s+/).join(".") : "");

    let html = "";

    // Breadcrumb — 親要素チェーン
    html += '<div id="__diBreadcrumb">';
    const ancestors = [];
    let parent = el;
    while (parent && parent !== document.body && parent !== document.documentElement) {
      ancestors.unshift(parent);
      parent = parent.parentElement;
    }
    // 最大6階層分表示
    const displayAncestors = ancestors.slice(-6);
    if (ancestors.length > 6) html += '<span class="di-bc-sep">…</span>';
    displayAncestors.forEach((anc, i) => {
      if (i > 0) html += '<span class="di-bc-sep">›</span>';
      const aTag = anc.tagName.toLowerCase();
      const aClass = anc.className && typeof anc.className === "string" ? anc.className.trim().split(/\s+/)[0] : "";
      const label = aTag + (aClass ? "." + aClass : "");
      const isCurrent = anc === el;
      html += '<span class="di-bc-item' + (isCurrent ? ' di-bc-current' : '') + '" data-bc-idx="' + i + '">' + esc(label) + '</span>';
    });
    html += '</div>';

    // Selector
    html += '<div id="__diSelector">';
    html += '<div class="di-sel-label">セレクタ (クリックでコピー)</div>';
    html += '<div class="di-sel-value" data-copy="' + esc(selector) + '">' + esc(selector) + "</div>";
    if (classList) {
      html += '<div style="margin-top:8px"><div class="di-sel-label">クラス名 (クリック=コピー / ダブルクリック=切替)</div>';
      classNames.forEach(c => {
        const isActive = c === activeClass;
        html += '<span class="di-sel-class' + (isActive ? ' di-class-active' : '') + '" data-focus-class="' + esc(c) + '" data-copy="' + esc(c) + '">' + esc(c) + '</span>';
      });
      html += "</div>";
      // クラス追加UI
      const mainClass = classList.split(/\s+/)[0] || "";
      const suggestClass = mainClass ? mainClass + "2" : "";
      html += '<div class="di-addClass-bar">';
      html += '<input class="di-addClass-input" id="__diAddClassInput" placeholder="追加クラス名" value="' + esc(suggestClass) + '">';
      html += '<button class="di-addClass-btn" id="__diAddClassBtn">追加</button>';
      html += '</div>';
    }
    html += "</div>";

    // HTML ソース
    const outerHtml = el.outerHTML;
    // 先頭の開始タグだけ抽出
    const tagMatch = outerHtml.match(/^<[^>]+>/);
    const openTag = tagMatch ? tagMatch[0] : "";
    // テキスト内容（直接の子テキストのみ、短縮）
    const textContent = el.childNodes.length > 0
      ? Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).filter(Boolean).join(" ")
      : "";
    const displayText = textContent.length > 80 ? textContent.slice(0, 80) + "…" : textContent;
    const childCount = el.children.length;

    html += '<div style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.05)">';
    const elSrc = el.getAttribute('src') || '';
    html += '<div class="di-sel-label">HTML <span class="di-open-editor" id="__diOpenHtml" data-class="' + esc(activeClass) + '" data-src="' + esc(elSrc) + '">📂 エディタで開く</span></div>';
    html += '<div data-copy="' + esc(openTag) + '" style="font-size:13px;color:#e06c75;background:rgba(255,255,255,.03);padding:8px 10px;border-radius:6px;cursor:pointer;word-break:break-all;margin-bottom:4px;font-family:inherit;line-height:1.5;border:1px solid rgba(255,255,255,.04)">' + esc(openTag) + "</div>";
    // 子要素ツリー（2階層まで）
    if (childCount > 0) {
      html += '<div style="margin-top:8px"><div class="di-sel-label" style="margin-bottom:6px">子要素ツリー (' + childCount + ')</div>';
      const treeEls = [];
      function buildTree(parent, depth) {
        let t = '';
        const maxDepth = 2;
        if (depth > maxDepth) return t;
        for (let i = 0; i < parent.children.length; i++) {
          const child = parent.children[i];
          if (child.id && child.id.startsWith('__di')) continue;
          const cTag = child.tagName.toLowerCase();
          const cClass = child.className && typeof child.className === 'string' ? child.className.trim() : '';
          const cFirst = cClass ? cClass.split(/\s+/)[0] : '';
          const label = cTag + (cFirst ? '.' + cFirst : '');
          const indent = depth * 16;
          const hasChildren = child.children.length > 0;
          const childColor = depth === 0 ? '#6ee7b7' : depth === 1 ? '#a78bfa' : '#fbbf24';
          const idx = treeEls.length;
          treeEls.push(child);
          t += '<div class="di-tree-item" data-tree-idx="' + idx + '" style="padding:3px 0 3px ' + indent + 'px;cursor:pointer;font-size:13px;color:' + childColor + ';transition:all .1s;display:flex;align-items:center;gap:4px;border-radius:4px">';
          t += '<span style="color:#4b5563;font-size:10px">' + (hasChildren ? '▸' : '·') + '</span>';
          t += '<span class="di-tree-label">' + esc(label) + '</span>';
          if (cClass && cClass.split(/\s+/).length > 1) {
            t += '<span style="font-size:10px;color:#6b7280;margin-left:4px">+' + (cClass.split(/\s+/).length - 1) + '</span>';
          }
          t += '</div>';
          if (hasChildren && depth < maxDepth) {
            t += buildTree(child, depth + 1);
          }
        }
        return t;
      }
      html += '<div id="__diTree" style="background:rgba(255,255,255,.02);border-radius:6px;padding:6px 8px;border:1px solid rgba(255,255,255,.04);max-height:200px;overflow-y:auto">';
      html += buildTree(el, 0);
      html += '</div></div>';
      // treeElsをwindowに保存（クリックハンドラで使用）
      window.__diTreeEls = treeEls;
    }
    html += "</div>";

    // テキスト内容（BR挿入 + テキスト編集機能）
    const fullText = el.innerText ? el.innerText.trim() : "";
    if (fullText) {
      html += '<div style="padding:12px 16px;border-bottom:1px solid #2a2a4a">';
      html += '<div style="display:flex;gap:8px;margin-bottom:8px">';
      html += '<button class="di-text-tab" data-tab="br" style="padding:4px 10px;font-size:11px;background:#2a4a6a;color:#fff;border:none;border-radius:4px;cursor:pointer">改行挿入</button>';
      html += '<button class="di-text-tab" data-tab="edit" style="padding:4px 10px;font-size:11px;background:#333;color:#888;border:none;border-radius:4px;cursor:pointer">HTML編集</button>';
      html += '</div>';
      html += '<div id="__diBrMode">';
      html += '<div id="__diBrText" style="font-size:13px;color:#98c379;background:#16213e;padding:8px 10px;border-radius:6px;word-break:break-all;line-height:2;font-family:-apple-system,sans-serif">';
      const displayText = fullText.length > 200 ? fullText.slice(0, 200) : fullText;
      for (let i = 0; i <= displayText.length; i++) {
        html += '<span class="di-br-slot" data-br-pos="' + i + '" style="display:inline-block;width:2px;height:1.2em;vertical-align:middle;cursor:pointer;background:transparent;margin:0 -1px;border-radius:1px;transition:all .15s;position:relative" title="ここに改行挿入"></span>';
        if (i < displayText.length) {
          const ch = displayText[i];
          if (ch === "\n") {
            html += '<span style="color:#555;font-size:10px">↵</span><br>';
          } else {
            html += '<span data-copy="' + esc(fullText) + '">' + esc(ch) + '</span>';
          }
        }
      }
      html += '</div>';
      html += '<div id="__diBrPanel" style="display:none;margin-top:8px;padding:8px;background:#1a1a3a;border-radius:6px;border:1px solid #3a3a6a">';
      html += '<div style="font-size:11px;color:#888;margin-bottom:6px">改行タグを選択:</div>';
      html += '<button class="di-br-btn" data-br-type="br" style="margin:2px;padding:4px 10px;font-size:12px;background:#2a4a6a;color:#fff;border:none;border-radius:4px;cursor:pointer">&lt;br&gt;</button>';
      html += '<button class="di-br-btn" data-br-type="u-sp" style="margin:2px;padding:4px 10px;font-size:12px;background:#6a4a2a;color:#fbbf24;border:none;border-radius:4px;cursor:pointer">&lt;br class=&quot;u-sp&quot;&gt;</button>';
      html += '<button class="di-br-btn" data-br-type="u-pc" style="margin:2px;padding:4px 10px;font-size:12px;background:#2a6a4a;color:#6ee7b7;border:none;border-radius:4px;cursor:pointer">&lt;br class=&quot;u-pc&quot;&gt;</button>';
      html += '<button class="di-br-btn" data-br-type="cancel" style="margin:2px;padding:4px 10px;font-size:12px;background:#4a2a2a;color:#e06c75;border:none;border-radius:4px;cursor:pointer">✕</button>';
      html += '</div></div>';
      const rawHtml = el.innerHTML.trim();
      html += '<div id="__diEditMode" style="display:none">';
      // innerHTMLの共通インデントを除去して左寄せ表示
      const rawLines = rawHtml.split('\n');
      const nonEmptyLines = rawLines.filter(l => l.trim().length > 0);
      let minIndent = Infinity;
      nonEmptyLines.forEach(l => { const m = l.match(/^(\s*)/); if (m) minIndent = Math.min(minIndent, m[1].length); });
      if (!isFinite(minIndent)) minIndent = 0;
      const dedented = rawLines.map(l => l.slice(minIndent)).join('\n').trim();
      html += '<textarea id="__diTextEdit" style="width:100%;min-height:200px;font-size:13px;color:#e5c07b;background:#16213e;padding:8px 10px;border-radius:6px;border:1px solid #3a3a6a;resize:vertical;font-family:\'Menlo\',\'Consolas\',monospace;line-height:1.6;box-sizing:border-box;white-space:pre-wrap;text-align:left;vertical-align:top">' + esc(dedented) + '</textarea>';
      html += '</div>';
      html += '<div style="display:flex;gap:6px;margin-top:6px;position:relative;z-index:10">';
      html += '<button id="__diTextSaveBtn" style="padding:5px 14px;font-size:12px;background:#42ab94;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600">💾 テキスト保存</button>';
      html += '</div>';
      html += "</div>";
    }



    // CSS groups
    const groups = {
      テキスト: ["font-family", "font-size", "font-weight", "line-height", "letter-spacing", "color", "text-align"],
      レイアウト: ["display", "position", "top", "right", "bottom", "left", "z-index", "flex-direction", "justify-content", "align-items", "gap"],
      サイズ: ["width", "height", "max-width", "min-width", "overflow"],
      余白: ["margin-top", "margin-right", "margin-bottom", "margin-left", "padding-top", "padding-right", "padding-bottom", "padding-left"],
      装飾: ["background-color", "background-image", "border", "border-radius", "box-shadow", "opacity"],
    };

    // px値をrem()形式に変換
    function pxToRem(val) {
      if (!val) return val;
      return val.replace(/([-\d.]+)px/g, (_, n) => {
        const num = parseFloat(n);
        return "rem(" + Math.round(num) + ")";
      });
    }

    // RGB/RGBA → hex変換
    function rgbToHex(val) {
      if (!val) return val;
      return val.replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+)?\s*\)/g, (_, r, g, b) => {
        return "#" + [r, g, b].map(x => parseInt(x).toString(16).padStart(2, "0")).join("");
      });
    }

    // 値のフォーマット
    function formatVal(prop, val) {
      // letter-spacing: 小数点を保持した rem() 表示
      if (prop === "letter-spacing" && val.endsWith("px")) {
        const px = parseFloat(val);
        return px === 0 ? "0" : "rem(" + (Math.round(px * 100) / 100) + ")";
      }
      val = pxToRem(val);
      if (prop.includes("color") || prop === "background-color") val = rgbToHex(val);
      return val;
    }


    // SCSSプロパティをWebSocketで取得して表示
    html += '<div id="__diCSSList"><div class="di-css-group"><div class="di-css-group-title">SCSS プロパティ</div><div style="color:#666;font-size:12px;padding:4px 8px">読み込み中...</div></div></div>';

    body.innerHTML = html;

    // SCSSプロパティを取得
    // クラスがない要素（spanなど）は親クラス＋タグ名でネスト検索
    let nestedTag = null;
    let propsClassName = activeClass;
    if (!classList && tag) {
      // 親を辿ってBEMクラスを見つける
      let p = el.parentElement;
      while (p && p !== document.body) {
        const pCls = p.className && typeof p.className === 'string' ? p.className.trim() : '';
        if (pCls) {
          propsClassName = pCls.split(/\s+/)[0];
          nestedTag = tag;
          break;
        }
        p = p.parentElement;
      }
    }
    if (__diWs && propsClassName) {
      __diSend("inspector:get-props", { className: propsClassName, nestedTag: nestedTag });
      __diOn("inspector:props-result", (data) => {
        const cssList = panel.querySelector("#__diCSSList");
        if (!cssList) return;

        let propsHtml = "";
        if (data.props && data.props.length > 0) {
          const openBtn = data.scssFile ? ' <span class="di-open-editor" id="__diOpenScss" data-file="' + data.scssFile + '" data-line="' + (data.scssLine || 1) + '">📂 エディタで開く</span>' : '';
          propsHtml += '<div class="di-css-group"><div class="di-css-group-title">SCSS プロパティ (' + data.props.length + ')' + openBtn + '</div>';
          for (const p of data.props) {
            const displayVal = p.scssValue || formatVal(p.property, cs.getPropertyValue(p.property));
            const partLabel = p.shorthandPart === 'start' ? ' ▲' : p.shorthandPart === 'end' ? ' ▼' : '';
            const partAttr = p.shorthandPart ? ' data-shorthand-part="' + p.shorthandPart + '"' : '';
            const toggleProp = p.shorthandPart ? p.property + '-' + p.shorthandPart : p.property;
            const copyVal = p.property + ": " + displayVal + ";";
            propsHtml += '<div class="di-css-row"><input type="checkbox" class="di-css-toggle" data-toggle-prop="' + toggleProp + '" checked><span class="di-css-key" data-copy="' + esc(copyVal) + '">' + p.property + partLabel + '</span><span class="di-css-val" contenteditable="true" data-prop="' + p.property + '"' + partAttr + '>' + esc(displayVal) + '</span><span class="di-css-del" data-del-prop="' + p.property + '">削除</span></div>';
            // 値プリセット
            const opts = valuePresets[p.property];
            if (opts) {
              propsHtml += '<div class="di-val-opts">';
              opts.forEach(v => {
                propsHtml += '<span class="di-val-opt" data-opt-prop="' + p.property + '" data-opt-val="' + v + '">' + v + '</span>';
              });
              propsHtml += '</div>';
            }
          }
          propsHtml += '</div>';
        } else {
          propsHtml += '<div class="di-css-group"><div class="di-css-group-title">基本プロパティ</div>';
          const fallback = ["display", "font-size", "font-weight", "color", "width", "height"];
          for (const prop of fallback) {
            const val = cs.getPropertyValue(prop);
            const displayVal = formatVal(prop, val);
            const copyVal = prop + ": " + displayVal + ";";
            propsHtml += '<div class="di-css-row"><input type="checkbox" class="di-css-toggle" data-toggle-prop="' + prop + '" checked><span class="di-css-key" data-copy="' + esc(copyVal) + '">' + prop + '</span><span class="di-css-val" contenteditable="true" data-prop="' + prop + '">' + esc(displayVal) + '</span></div>';
          }
          propsHtml += '</div>';
        }

        // @include mq("md") プロパティ
        if (data.mqProps && data.mqProps.length > 0) {
          propsHtml += '<div class="di-css-group di-mq-group"><div class="di-css-group-title"><span class="di-mq-title">レスポンシブ対応 @mq(md)</span> (' + data.mqProps.length + ')</div>';
          for (const p of data.mqProps) {
            const displayVal = p.scssValue || formatVal(p.property, cs.getPropertyValue(p.property));
            const partLabel = p.shorthandPart === 'start' ? ' ▲' : p.shorthandPart === 'end' ? ' ▼' : '';
            const partAttr = p.shorthandPart ? ' data-shorthand-part="' + p.shorthandPart + '"' : '';
            const toggleProp = p.shorthandPart ? p.property + '-' + p.shorthandPart : p.property;
            const copyVal = p.property + ": " + displayVal + ";";
            propsHtml += '<div class="di-css-row"><input type="checkbox" class="di-css-toggle" data-toggle-prop="' + toggleProp + '" checked><span class="di-css-key" data-copy="' + esc(copyVal) + '">' + p.property + partLabel + '</span><span class="di-css-val" contenteditable="true" data-prop="' + p.property + '"' + partAttr + ' data-mq="md">' + esc(displayVal) + '</span><span class="di-css-del" data-del-prop="' + p.property + '" data-del-mq="md">削除</span></div>';
            const opts = valuePresets[p.property];
            if (opts) {
              propsHtml += '<div class="di-val-opts">';
              opts.forEach(v => {
                propsHtml += '<span class="di-val-opt" data-opt-prop="' + p.property + '" data-opt-val="' + v + '" data-opt-mq="md">' + v + '</span>';
              });
              propsHtml += '</div>';
            }
          }
          propsHtml += '</div>';
        }

        // 疑似要素プロパティ（::before, ::after）— SCSSソースの値を使用
        if (data.pseudoProps) {
          const pseudoLabels = { before: "::before", after: "::after" };
          for (const [pseudo, pProps] of Object.entries(data.pseudoProps)) {
            if (!pProps || pProps.length === 0) continue;
            propsHtml += '<div class="di-css-group di-pseudo-group"><div class="di-css-group-title"><span class="di-pseudo-title">' + pseudoLabels[pseudo] + '</span> (' + pProps.length + ')</div>';
            for (const p of pProps) {
              const displayVal = p.scssValue;
              const copyVal = p.property + ": " + displayVal + ";";
              propsHtml += '<div class="di-css-row"><span class="di-css-key" data-copy="' + esc(copyVal) + '">' + p.property + '</span><span class="di-css-val di-pseudo-val" contenteditable="true" data-prop="' + p.property + '" data-pseudo="' + pseudo + '">' + esc(displayVal) + '</span></div>';
            }
            propsHtml += '</div>';
          }
        }

        // 疑似要素 @mq(md) プロパティ
        if (data.pseudoMqProps) {
          const pseudoLabels = { before: "::before", after: "::after" };
          for (const [pseudo, pProps] of Object.entries(data.pseudoMqProps)) {
            if (!pProps || pProps.length === 0) continue;
            propsHtml += '<div class="di-css-group di-pseudo-group di-mq-group"><div class="di-css-group-title"><span class="di-pseudo-title">' + pseudoLabels[pseudo] + '</span> <span class="di-mq-title">レスポンシブ対応 @mq(md)</span> (' + pProps.length + ')</div>';
            for (const p of pProps) {
              const displayVal = p.scssValue;
              const copyVal = p.property + ": " + displayVal + ";";
              propsHtml += '<div class="di-css-row"><span class="di-css-key" data-copy="' + esc(copyVal) + '">' + p.property + '</span><span class="di-css-val di-pseudo-val" contenteditable="true" data-prop="' + p.property + '" data-pseudo="' + pseudo + '" data-mq="md">' + esc(displayVal) + '</span></div>';
            }
            propsHtml += '</div>';
          }
        }

        // プロパティ追加ボタン（PC）
        propsHtml += '<div class="di-add-bar"><div class="di-add-title">＋ プロパティ追加 (PC)</div>';
        const addPresets = [
          ["width", "rem(100)"],
          ["height", "rem(100)"],
          ["margin-top", "rem(0)"],
          ["padding-top", "rem(0)"],
          ["gap", "rem(20)"],
          ["overflow", "hidden"],
          ["border-radius", "rem(10)"],
          ["max-width", "rem(1100)"],
          ["min-width", "rem(0)"],
          ["z-index", "1"],
          ["position", "relative"],
          ["top", "rem(0)"],
          ["left", "rem(0)"],
          ["right", "rem(0)"],
          ["bottom", "rem(0)"],
        ];
        addPresets.forEach(([p, v]) => {
          propsHtml += '<button class="di-add-btn" data-add-prop="' + p + '" data-add-val="' + v + '">' + p + '</button>';
        });
        propsHtml += '</div>';

        // プロパティ追加ボタン（SP）
        propsHtml += '<div class="di-add-bar di-mq-group"><div class="di-add-title"><span class="di-mq-title">＋ レスポンシブ対応 @mq(md) プロパティ追加</span></div>';
        addPresets.forEach(([p, v]) => {
          propsHtml += '<button class="di-add-btn" data-add-prop="' + p + '" data-add-val="' + v + '" data-add-mq="md">' + p + '</button>';
        });
        propsHtml += '</div>';

        cssList.innerHTML = propsHtml;

        // 再バインド: copy, editable
        cssList.querySelectorAll("[data-copy]").forEach(el => {
          el.addEventListener("click", function () { copyText(this.dataset.copy); });
        });
        bindEditableHandlers(cssList);

        // 削除ボタン — マーク/解除のみ
        cssList.querySelectorAll(".di-css-del").forEach(btn => {
          btn.addEventListener("click", function(e) {
            e.stopPropagation();
            const prop = this.dataset.delProp;
            const mqDel = this.dataset.delMq || null;
            const row = this.closest(".di-css-row");
            const delKey = activeClass + "|" + prop + (mqDel ? "|mq:" + mqDel : "");
            if (pendingDeletes.has(delKey)) {
              // 解除
              pendingDeletes.delete(delKey);
              row.classList.remove("di-deleted");
            } else {
              const mq = this.dataset.delMq || null;
              pendingDeletes.set(delKey, { className: activeClass, property: prop, mq });
              row.classList.add("di-deleted");
            }
            updateSaveButton();
          });
        });

        // チェックボックストグル — プロパティの一時的なON/OFF
        cssList.querySelectorAll(".di-css-toggle").forEach(cb => {
          cb.addEventListener("change", function(e) {
            e.stopPropagation();
            const prop = this.dataset.toggleProp;
            const row = this.closest(".di-css-row");
            if (!selectedEl) return;
            if (this.checked) {
              // 元に戻す
              selectedEl.style.removeProperty(prop);
              row.classList.remove("di-toggled-off");
            } else {
              // 無効化
              selectedEl.style.setProperty(prop, "unset", "important");
              row.classList.add("di-toggled-off");
            }
          });
        });

        // 値プリセット選択
        cssList.querySelectorAll(".di-val-opt").forEach(opt => {
          opt.addEventListener("click", function(e) {
            e.stopPropagation();
            const prop = this.dataset.optProp;
            const val = this.dataset.optVal;
            const mq = this.dataset.optMq || null;
            // mqスコープに応じて正しい値フィールドを選択
            const valSelector = mq
              ? '.di-css-val[data-prop="' + prop + '"][data-mq="' + mq + '"]'
              : '.di-css-val[data-prop="' + prop + '"]:not([data-mq])';
            const valEl = cssList.querySelector(valSelector);
            if (valEl) {
              valEl.textContent = val;
              // pendingChangesに記録（activeClassでスコープ限定）
              const currentActiveClass = window.__diActiveClass || "";
              const selector = currentActiveClass ? "." + currentActiveClass : selectedEl.tagName.toLowerCase();
              const key = selector + "|" + prop + (mq ? "|mq:" + mq : "");
              pendingChanges.set(key, { selector, property: prop, value: val, mq });
              valEl.classList.add("di-changed");
              updateSaveButton();
              // インラインプレビュー
              selectedEl.style.setProperty(prop, __diConvertRem(val));
            }
          });
        });

        // プロパティ追加ボタン
        cssList.querySelectorAll(".di-add-btn").forEach(btn => {
          btn.addEventListener("click", function(e) {
            e.stopPropagation();
            const prop = this.dataset.addProp;
            const val = this.dataset.addVal;
            const mq = this.dataset.addMq || null;
            if (!__diWs) return;
            __diSend("inspector:add-prop", { className: activeClass, property: prop, value: val, mq });
            __diOn("inspector:add-result", (res) => {
              toast.textContent = res.success ? "✅ " + res.message : "❌ " + res.message;
              toast.style.background = res.success ? "#42ab94" : "#e06c75";
              toast.classList.add("di-show");
              setTimeout(() => { toast.classList.remove("di-show"); toast.style.background = ""; }, 1500);
              // パネルを更新して新プロパティを表示
              if (res.success && selectedEl) {
                setTimeout(() => updatePanel(selectedEl), 500);
              }
            });
          });
        });
      });
    }

    // 📂 SCSS エディタで開くハンドラ（cssList内に追加されるのでMutationObserverで対応）
    const cssList = panel.querySelector("#__diCSSList");
    if (cssList) {
      const observer = new MutationObserver(() => {
        const openScssBtn = cssList.querySelector("#__diOpenScss");
        if (openScssBtn && __diWs && !openScssBtn._bound) {
          openScssBtn._bound = true;
          openScssBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            __diSend("inspector:open-file", { file: openScssBtn.dataset.file, line: parseInt(openScssBtn.dataset.line) || 1 });
          });
        }
      });
      observer.observe(cssList, { childList: true });
    }

    // 📂 エディタで開くハンドラ（HTML用 — bodyレベル）
    const openHtmlBtn = body.querySelector("#__diOpenHtml");
    if (openHtmlBtn && __diWs) {
      openHtmlBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        __diSend("inspector:open-html", { className: openHtmlBtn.dataset.class, src: openHtmlBtn.dataset.src || "" });
      });
    }

    // ツリーアイテムのクリックハンドラ
    const treeItems = body.querySelectorAll(".di-tree-item[data-tree-idx]");
    treeItems.forEach(item => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(item.dataset.treeIdx);
        if (window.__diTreeEls && window.__diTreeEls[idx]) {
          selectedEl = window.__diTreeEls[idx];
          updatePanel(selectedEl);
          updateOverlay(selectedEl, selectedOverlay);
        }
      });
      item.addEventListener("mouseenter", () => { item.style.background = 'rgba(255,255,255,.06)'; });
      item.addEventListener("mouseleave", () => { item.style.background = ''; });
    });

    // クラス追加ハンドラ
    const addClassBtn = body.querySelector("#__diAddClassBtn");
    const addClassInput = body.querySelector("#__diAddClassInput");
    if (addClassBtn && addClassInput) {
      addClassBtn.addEventListener("click", () => {
        const newClass = addClassInput.value.trim();
        if (!newClass || !selectedEl) return;
        // 既にある場合はスキップ
        if (selectedEl.classList.contains(newClass)) {
          toast.textContent = "⚠️ 既に存在: " + newClass;
          toast.style.background = "#e0a040";
          toast.classList.add("di-show");
          setTimeout(() => { toast.classList.remove("di-show"); toast.style.background = ""; }, 1500);
          return;
        }
        // まずDOMに即反映
        selectedEl.classList.add(newClass);
        // Viteプラグイン経由でHTMLファイルを更新
        if (__diWs) {
          const oldClass = selectedEl.className.replace(newClass, "").trim().replace(/\s+/g, " ");
          const allSame = document.querySelectorAll('.' + oldClass.split(/\s+/)[0]);
          let matchIndex = 0;
          for (let i = 0; i < allSame.length; i++) {
            if (allSame[i] === selectedEl) { matchIndex = i; break; }
          }
          __diSend("inspector:add-class", {
            oldClassList: oldClass,
            newClass: newClass,
            matchIndex: matchIndex,
          });
          __diOn("inspector:add-class-result", (res) => {
            toast.textContent = res.success ? "✅ " + res.message : "❌ " + res.message;
            toast.style.background = res.success ? "#42ab94" : "#e06c75";
            toast.classList.add("di-show");
            setTimeout(() => { toast.classList.remove("di-show"); toast.style.background = ""; }, 1500);
          });
        }
        // パネル再描画
        // 新しいクラスにフォーカスを切り替え
        window.__diActiveClass = newClass;
        updatePanel(selectedEl);
      });
    }

    // クラスフォーカス切替ハンドラ（ダブルクリックのみ）
    body.querySelectorAll(".di-sel-class[data-focus-class]").forEach(tag => {
      tag.addEventListener("dblclick", function(e) {
        e.stopPropagation();
        const cls = this.dataset.focusClass;
        if (cls !== activeClass) {
          window.__diActiveClass = cls;
          updatePanel(selectedEl);
        }
      });
    });

    // Copy handlers — 全data-copy要素（クラス名含む）
    body.addEventListener("click", function(e) {
      const copyEl = e.target.closest("[data-copy]");
      if (!copyEl) return;
      e.stopPropagation();
      copyText(copyEl.dataset.copy);
    });

    // Breadcrumb click — 親要素を選択
    const bcItems = body.querySelectorAll(".di-bc-item");
    const displayAncestorsRef = displayAncestors; // クロージャで保持
    bcItems.forEach(item => {
      item.addEventListener("click", function(e) {
        e.stopPropagation();
        const idx = parseInt(this.dataset.bcIdx);
        const target = displayAncestorsRef[idx];
        if (target && target !== el) {
          selectedEl = target;
          updatePanel(target);
          const rect = target.getBoundingClientRect();
          selectedOverlay.style.display = "block";
          selectedOverlay.style.left = rect.left + "px";
          selectedOverlay.style.top = rect.top + "px";
          selectedOverlay.style.width = rect.width + "px";
          selectedOverlay.style.height = rect.height + "px";
        }
      });
    });

    // BR挿入ハンドラ
    let selectedBrPos = -1;
    const brTextArea = body.querySelector("#__diBrText");
    const brPanel = body.querySelector("#__diBrPanel");
    if (brTextArea && brPanel) {
      // スロットクリック: 位置を選択してパネル表示
      brTextArea.querySelectorAll(".di-br-slot").forEach(slot => {
        slot.addEventListener("click", function(e) {
          e.stopPropagation();
          selectedBrPos = parseInt(this.dataset.brPos);
          // 前の選択をリセット
          brTextArea.querySelectorAll(".di-br-slot").forEach(s => {
            s.style.background = "transparent";
            s.style.width = "2px";
          });
          // 選択位置をハイライト
          this.style.background = "#e5c07b";
          this.style.width = "4px";
          brPanel.style.display = "block";
        });
        // ホバーエフェクト
        slot.addEventListener("mouseenter", function() {
          if (parseInt(this.dataset.brPos) !== selectedBrPos) {
            this.style.background = "rgba(229,192,123,.4)";
            this.style.width = "3px";
          }
        });
        slot.addEventListener("mouseleave", function() {
          if (parseInt(this.dataset.brPos) !== selectedBrPos) {
            this.style.background = "transparent";
            this.style.width = "2px";
          }
        });
      });
      // BRタイプボタン
      brPanel.querySelectorAll(".di-br-btn").forEach(btn => {
        btn.addEventListener("click", function(e) {
          e.stopPropagation();
          const brType = this.dataset.brType;
          if (brType === "cancel") {
            brPanel.style.display = "none";
            brTextArea.querySelectorAll(".di-br-slot").forEach(s => {
              s.style.background = "transparent";
              s.style.width = "2px";
            });
            selectedBrPos = -1;
            return;
          }
          if (selectedBrPos < 0 || !selectedEl || !__diWs) return;
          // テキストを取得して位置情報とともに送信
          const textContent = selectedEl.innerText ? selectedEl.innerText.trim() : "";
          const currentActiveClass = window.__diActiveClass || "";
          __diSend("inspector:insert-br", {
            className: currentActiveClass,
            textContent: textContent,
            position: selectedBrPos,
            brType: brType,
            matchIndex: getMatchIndex(selectedEl, currentActiveClass),
          });
          __diOn("inspector:insert-br-result", (res) => {
            toast.textContent = res.success ? "✅ " + res.message : "❌ " + res.message;
            toast.style.background = res.success ? "#42ab94" : "#e06c75";
            toast.classList.add("di-show");
            setTimeout(() => { toast.classList.remove("di-show"); toast.style.background = ""; }, 1500);
            if (res.success && selectedEl) {
              saveStateForReload();
              setTimeout(() => updatePanel(selectedEl), 800);
            }
          });
          brPanel.style.display = "none";
          selectedBrPos = -1;
        });
      });
    }

    // タブ切替ハンドラ
    // __diSourceHtml は updatePanel 時点のel.innerHTMLで初期化（dedent済み）
    const _initRaw = el.innerHTML.trim();
    const _initLines = _initRaw.split('\n');
    const _initNonEmpty = _initLines.filter(l => l.trim().length > 0);
    let _initMin = Infinity;
    _initNonEmpty.forEach(l => { const m = l.match(/^(\s*)/); if (m) _initMin = Math.min(_initMin, m[1].length); });
    if (!isFinite(_initMin)) _initMin = 0;
    let __diSourceHtml = _initLines.map(l => l.slice(_initMin)).join('\n').trim();
    body.querySelectorAll(".di-text-tab").forEach(tab => {
      tab.addEventListener("click", function(e) {
        e.stopPropagation();
        const mode = this.dataset.tab;
        const brMode = body.querySelector("#__diBrMode");
        const editMode = body.querySelector("#__diEditMode");
        if (!brMode || !editMode) return;
        body.querySelectorAll(".di-text-tab").forEach(t => {
          t.style.background = "#333"; t.style.color = "#888";
        });
        this.style.background = "#2a4a6a"; this.style.color = "#fff";
        if (mode === "edit") {
          brMode.style.display = "none";
          editMode.style.display = "block";
          // textareaの初期値はupdatePanel構築時に正しく設定済み。上書きしない。
        } else {
          brMode.style.display = "block";
          editMode.style.display = "none";
        }
      });
    });

    // テキスト保存ハンドラ
    const textSaveBtn = body.querySelector("#__diTextSaveBtn");
    const textEditArea = body.querySelector("#__diTextEdit");
    if (textSaveBtn) {
      textSaveBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        // Edit mode（textarea表示中）ならtextareaの値、そうでなければDOMのinnerHTMLを使用
        const editMode = body.querySelector("#__diEditMode");
        const isEditMode = editMode && editMode.style.display !== "none";
        let newHtml;
        if (isEditMode && textEditArea) {
          newHtml = textEditArea.value;
        } else if (selectedEl) {
          // DOMの現在値をdedentして取得
          const curRaw = selectedEl.innerHTML.trim();
          const curLines = curRaw.split('\n');
          const curNonEmpty = curLines.filter(l => l.trim().length > 0);
          let curMin = Infinity;
          curNonEmpty.forEach(l => { const m = l.match(/^(\s*)/); if (m) curMin = Math.min(curMin, m[1].length); });
          if (!isFinite(curMin)) curMin = 0;
          newHtml = curLines.map(l => l.slice(curMin)).join('\n').trim();
        } else {
          return;
        }
        const oldHtml = __diSourceHtml;
        const currentActiveClass = window.__diActiveClass || "";
        console.log("[DevInspector] テキスト保存 clicked", { oldHtmlLen: oldHtml ? oldHtml.length : "null", newHtmlLen: newHtml.length, equal: newHtml === oldHtml, ws: !!__diWs });
        if (!oldHtml) {
          console.log("[DevInspector] oldHtml is empty/null");
          toast.textContent = "❌ ソースHTML未取得";
          toast.style.background = "#e06c75";
          toast.classList.add("di-show");
          setTimeout(() => { toast.classList.remove("di-show"); toast.style.background = ""; }, 1500);
          return;
        }
        if (newHtml === oldHtml) {
          console.log("[DevInspector] newHtml === oldHtml (no change detected)");
          console.log("[DevInspector] oldHtml:", JSON.stringify(oldHtml.substring(0, 200)));
          console.log("[DevInspector] newHtml:", JSON.stringify(newHtml.substring(0, 200)));
          toast.textContent = "変更なし";
          toast.classList.add("di-show");
          setTimeout(() => toast.classList.remove("di-show"), 800);
          return;
        }

        console.log("[DevInspector] Sending update-text to server");
        if (__diWs) {
          __diSend("inspector:update-text", {
            className: currentActiveClass,
            oldHtml: oldHtml,
            newHtml: newHtml,
            matchIndex: getMatchIndex(selectedEl, currentActiveClass),
          });
          __diOn("inspector:update-text-result", (res) => {
            if (res.success) {
              toast.textContent = "✅ " + res.message;
              toast.style.background = "#42ab94";
              toast.classList.add("di-show");
              setTimeout(() => { toast.classList.remove("di-show"); toast.style.background = ""; }, 1500);
              if (selectedEl) {
                // DOMも即時反映
                selectedEl.innerHTML = newHtml;
                __diSourceHtml = newHtml;
                saveStateForReload();
                setTimeout(() => updatePanel(selectedEl), 800);
              }
            } else if (selectedEl) {
              // ソースファイルで見つからない場合、DOMを直接更新
              selectedEl.innerHTML = newHtml;
              __diSourceHtml = newHtml;
              toast.textContent = "✅ DOM更新（ソースファイルには未反映）";
              toast.style.background = "#42ab94";
              toast.classList.add("di-show");
              setTimeout(() => { toast.classList.remove("di-show"); toast.style.background = ""; }, 2500);
              setTimeout(() => updatePanel(selectedEl), 300);
            }
          });
        } else if (selectedEl) {
          // WebSocket未接続時はDOM直接更新
          selectedEl.innerHTML = newHtml;
          __diSourceHtml = newHtml;
          toast.textContent = "✅ DOM更新";
          toast.style.background = "#42ab94";
          toast.classList.add("di-show");
          setTimeout(() => { toast.classList.remove("di-show"); toast.style.background = ""; }, 1500);
          setTimeout(() => updatePanel(selectedEl), 300);
        }
      });
    }

    // 初期のeditableをバインド
    bindEditableHandlers(body);
    updateSaveButton();
  }

  function bindEditableHandlers(container) {
    // Editable CSS — arrow keys & scroll
    function adjustNumber(text, delta, cursorPos) {
      // 複数の rem() を持つショートハンド値に対応
      const remRegex = /rem\(([-\d.]+)\)/g;
      const matches = [];
      let m;
      while ((m = remRegex.exec(text)) !== null) {
        matches.push({ index: m.index, length: m[0].length, num: parseFloat(m[1]) });
      }

      if (matches.length > 0) {
        // カーソル位置に最も近い rem() を特定
        let targetIdx = 0;
        if (typeof cursorPos === "number" && matches.length > 1) {
          let minDist = Infinity;
          matches.forEach((match, i) => {
            const center = match.index + match.length / 2;
            const dist = Math.abs(cursorPos - center);
            if (dist < minDist) { minDist = dist; targetIdx = i; }
          });
        } else if (matches.length > 1 && typeof cursorPos !== "number") {
          // カーソル位置不明の場合、最後にフォーカスした位置を使う
          targetIdx = matches.length - 1;
        }

        const target = matches[targetIdx];
        const newNum = target.num + delta;
        const rounded = Math.abs(delta) < 1 ? Math.round(newNum * 10) / 10 : Math.round(newNum);
        return text.substring(0, target.index) + "rem(" + rounded + ")" + text.substring(target.index + target.length);
      }

      // calc(N * var(--to-rem)) 形式に対応
      const calcRegex = /calc\(\s*([-\d.]+)\s*\*\s*var\(--to-rem\)\s*\)/g;
      const calcMatches = [];
      while ((m = calcRegex.exec(text)) !== null) {
        calcMatches.push({ index: m.index, length: m[0].length, num: parseFloat(m[1]) });
      }
      if (calcMatches.length > 0) {
        let targetIdx = 0;
        if (typeof cursorPos === "number" && calcMatches.length > 1) {
          let minDist = Infinity;
          calcMatches.forEach((match, i) => {
            const center = match.index + match.length / 2;
            const dist = Math.abs(cursorPos - center);
            if (dist < minDist) { minDist = dist; targetIdx = i; }
          });
        }
        const target = calcMatches[targetIdx];
        const newNum = target.num + delta;
        const rounded = Math.abs(delta) < 1 ? Math.round(newNum * 10) / 10 : Math.round(newNum);
        return text.substring(0, target.index) + "calc(" + rounded + " * var(--to-rem))" + text.substring(target.index + target.length);
      }

      const numMatch = text.match(/^([-\d.]+)(.*)$/);
      if (numMatch) {
        const num = parseFloat(numMatch[1]) + delta;
        const rounded = Math.abs(delta) < 1 ? Math.round(num * 10) / 10 : Math.round(num * 100) / 100;
        return rounded + numMatch[2];
      }
      return text;
    }

    // contenteditableのカーソル位置を取得
    function getCursorPos(el) {
      const doc = el.ownerDocument || document;
      const sel = doc.getSelection();
      if (!sel || sel.rangeCount === 0) return null;
      const range = sel.getRangeAt(0);
      if (!el.contains(range.startContainer)) return null;
      // テキストノード内のオフセットを返す
      const preRange = doc.createRange();
      preRange.selectNodeContents(el);
      preRange.setEnd(range.startContainer, range.startOffset);
      return preRange.toString().length;
    }

    function getDelta(e) {
      const dir = e.key === "ArrowUp" || e.deltaY < 0 ? 1 : -1;
      if (e.altKey) return dir * 0.1;
      if (e.shiftKey) return dir * 10;
      return dir;
    }

    function applyValue(valEl) {
      if (!selectedEl) return;
      let val = valEl.textContent.trim();
      const prop = valEl.dataset.prop;
      const mq = valEl.dataset.mq || null;
      const shorthandPart = valEl.dataset.shorthandPart || null;
      // activeClassを使ってスコープを限定
      let currentActiveClass = window.__diActiveClass || "";
      let nestedTag = null;
      // クラスがない要素の場合、親クラスとタグ名を使う
      if (!currentActiveClass && selectedEl) {
        const selTag = selectedEl.tagName.toLowerCase();
        let p = selectedEl.parentElement;
        while (p && p !== document.body) {
          const pCls = p.className && typeof p.className === 'string' ? p.className.trim() : '';
          if (pCls) {
            currentActiveClass = pCls.split(/\s+/)[0];
            nestedTag = selTag;
            break;
          }
          p = p.parentElement;
        }
      }
      const selector = currentActiveClass ? "." + currentActiveClass : selectedEl.tagName.toLowerCase();
      const key = selector + "|" + prop + (shorthandPart ? "|" + shorthandPart : "") + (nestedTag ? "|nested:" + nestedTag : "") + (mq ? "|mq:" + mq : "");
      pendingChanges.set(key, { selector, property: prop, value: val, mq, shorthandPart, nestedTag });
      valEl.classList.add("di-changed");
      updateSaveButton();
      // インラインプレビュー: shorthandPartがある場合はCSSの個別プロパティで適用
      const previewProp = shorthandPart ? prop + '-' + shorthandPart : prop;
      const inlineVal = __diConvertRem(val);
      selectedEl.style.setProperty(previewProp, inlineVal);
    }

    // 疑似要素の値変更 (一時<style>でライブプレビュー + SCSS保存)
    function applyPseudoValue(valEl) {
      if (!selectedEl) return;
      let val = valEl.textContent.trim();
      const prop = valEl.dataset.prop;
      const pseudo = valEl.dataset.pseudo; // 'before' or 'after'
      const mq = valEl.dataset.mq || null;
      const currentActiveClass = window.__diActiveClass || "";
      const baseSelector = currentActiveClass ? "." + currentActiveClass : selectedEl.tagName.toLowerCase();
      const selector = baseSelector + "::" + pseudo;
      const key = selector + "|" + prop + (mq ? "|mq:" + mq : "");
      pendingChanges.set(key, { selector, property: prop, value: val, pseudo, mq });
      valEl.classList.add("di-changed");
      updateSaveButton();

      // ライブプレビュー: 一時<style>で詳細度を上げてオーバーライド（!important不使用）
      updatePseudoPreview();
    }

    // 疑似要素プレビュー用の一時スタイルを更新
    function updatePseudoPreview() {
      let previewStyle = document.getElementById("__diPseudoPreview");
      if (!previewStyle) {
        previewStyle = document.createElement("style");
        previewStyle.id = "__diPseudoPreview";
        document.head.appendChild(previewStyle);
      }
      // pendingChanges から疑似要素の変更だけ集める
      const pseudoRules = {};
      for (const [key, change] of pendingChanges) {
        if (!change.pseudo) continue;
        const cls = change.selector.replace("::" + change.pseudo, "");
        const ruleKey = cls + "::" + change.pseudo;
        if (!pseudoRules[ruleKey]) pseudoRules[ruleKey] = { cls, pseudo: change.pseudo, props: {} };
        // SCSS値 → CSS値に変換
        let cssVal = change.value;
        cssVal = __diConvertRem(cssVal);
        pseudoRules[ruleKey].props[change.property] = cssVal;
      }
      // 詳細度を上げたCSS生成（.class.class::before — !important不要）
      let css = "";
      for (const [, rule] of Object.entries(pseudoRules)) {
        const doubledSelector = rule.cls + rule.cls + "::" + rule.pseudo;
        const propsStr = Object.entries(rule.props).map(([k, v]) => k + ":" + v).join(";");
        css += doubledSelector + "{" + propsStr + "}\n";
      }
      previewStyle.textContent = css;
    }

    // 通常のCSS値ハンドラ（疑似要素を除外）
    container.querySelectorAll(".di-css-val[contenteditable]:not(.di-pseudo-val)").forEach(valEl => {
      valEl.addEventListener("blur", function () {
        applyValue(this);
      });
      valEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); this.blur(); return; }
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          const delta = getDelta(e);
          const pos = getCursorPos(this);
          this.textContent = adjustNumber(this.textContent.trim(), delta, pos);
          applyValue(this);
        }
      });
      valEl.addEventListener("wheel", function (e) {
        const doc = this.ownerDocument || document;
        if (doc.activeElement !== this) return;
        e.preventDefault();
        const delta = getDelta(e);
        const pos = getCursorPos(this);
        this.textContent = adjustNumber(this.textContent.trim(), delta, pos);
        applyValue(this);
      });
    });

    // 疑似要素の値ハンドラ
    container.querySelectorAll(".di-pseudo-val[contenteditable]").forEach(valEl => {
      valEl.addEventListener("blur", function () {
        applyPseudoValue(this);
      });
      valEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); this.blur(); return; }
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          const delta = getDelta(e);
          const pos = getCursorPos(this);
          this.textContent = adjustNumber(this.textContent.trim(), delta, pos);
          applyPseudoValue(this);
        }
      });
      valEl.addEventListener("wheel", function (e) {
        const doc = this.ownerDocument || document;
        if (doc.activeElement !== this) return;
        e.preventDefault();
        const delta = getDelta(e);
        const pos = getCursorPos(this);
        this.textContent = adjustNumber(this.textContent.trim(), delta, pos);
        applyPseudoValue(this);
      });
    });
  }

  function saveChanges() {
    if (pendingChanges.size === 0 && pendingDeletes.size === 0) return;
    const changes = Array.from(pendingChanges.values());

    // WebSocket 経由で送信
    if (__diWs) {
      __diSend("inspector:save", { changes });

      __diOn("inspector:save-result", (data) => {
        const { success, message, results } = data;
        if (success) {
          pendingChanges.clear();
          document.querySelectorAll(".di-changed").forEach(el => el.classList.remove("di-changed"));
        }

        // 削除を実行
        if (pendingDeletes.size > 0) {
          const deletes = Array.from(pendingDeletes.values());
          let delDone = 0;
          for (const del of deletes) {
            __diSend("inspector:delete-prop", del);
          }
          __diOn("inspector:delete-result", (res) => {
            delDone++;
            if (delDone >= deletes.length) {
              pendingDeletes.clear();
              document.querySelectorAll(".di-deleted").forEach(el => el.classList.remove("di-deleted"));
              updateSaveButton();
              if (selectedEl) setTimeout(() => updatePanel(selectedEl), 500);
            }
          });
        }
        updateSaveButton();
        // トースト表示
        toast.textContent = success ? "✅ " + message : "❌ " + message;
        toast.style.background = success ? "#42ab94" : "#e06c75";
        toast.classList.add("di-show");
        setTimeout(() => {
          toast.classList.remove("di-show");
          toast.style.background = "";
        }, 2000);

        // 詳細をコンソールに出力
        if (results) {
          console.group("Inspector Save Results");
          results.forEach(r => {
            if (r.success) {
              console.log(`✅ ${r.file}: ${r.property}: ${r.oldValue} → ${r.newValue}`);
            } else {
              console.warn(`❌ ${r.selector} ${r.property}: ${r.message}`);
            }
          });
          console.groupEnd();
        }
      });
    }
  }

  function updateSaveButton() {
    const countEl = panel.querySelector("#__diChangeCount");
    const saveBtn = panel.querySelector("#__diSaveBtn");
    const resetBtn = panel.querySelector("#__diResetBtn");
    const total = pendingChanges.size + pendingDeletes.size;
    if (countEl) countEl.textContent = total + "件";
    if (saveBtn) saveBtn.disabled = total === 0;
    if (resetBtn) resetBtn.disabled = total === 0;
  }

  function resetChanges() {
    if (pendingChanges.size === 0 && pendingDeletes.size === 0) return;
    for (const change of pendingChanges.values()) {
      if (change.pseudo) continue; // 疑似要素はelement.styleを使わないのでスキップ
      const className = change.selector.replace(/^[^.]*\./, "").split(".")[0];
      if (className) {
        document.querySelectorAll("." + className).forEach(el => el.style.removeProperty(change.property));
      }
    }
    pendingChanges.clear();
    pendingDeletes.clear();
    // 疑似要素プレビューもクリア
    const pseudoPreview = document.getElementById("__diPseudoPreview");
    if (pseudoPreview) pseudoPreview.textContent = "";
    document.querySelectorAll(".di-changed").forEach(el => el.classList.remove("di-changed"));
    document.querySelectorAll(".di-deleted").forEach(el => el.classList.remove("di-deleted"));
    updateSaveButton();
    if (selectedEl) updatePanel(selectedEl);
    toast.textContent = "↩ リセットしました";
    toast.classList.add("di-show");
    setTimeout(() => toast.classList.remove("di-show"), 800);
  }

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function destroyInspector() {
    active = false;
    selectedEl = null;
    // 疑似要素プレビュースタイルを削除
    const pseudoPreview = document.getElementById("__diPseudoPreview");
    if (pseudoPreview) pseudoPreview.remove();
    // PiPウィンドウを閉じる
    try {
      // グローバルAPIで取得して閉じる
      if ('documentPictureInPicture' in window && documentPictureInPicture.window) {
        const pw = documentPictureInPicture.window;
        // PiP内からclose()を実行
        pw.close();
      }
      if (pipWindow) {
        pipWindow.close();
      }
    } catch(e) {}
    pipWindow = null;
    document.removeEventListener("mousemove", onHover, true);
    document.removeEventListener("click", onSelect, true);
    window.removeEventListener("scroll", onScroll, true);
    // メインドキュメントとPiPドキュメント両方から要素を削除
    [panel, style, hoverOverlay, hoverLabel, selectedOverlay, toast].forEach(el => {
      try { if (el?.parentNode) el.parentNode.removeChild(el); } catch(e) {}
    });
    // Box model overlays cleanup
    if (window.__diBoxEls) {
      window.__diBoxEls.margin.forEach(el => { try { el.remove(); } catch(e) {} });
      window.__diBoxEls.padding.forEach(el => { try { el.remove(); } catch(e) {} });
      try { window.__diBoxEls.content?.remove(); } catch(e) {}
      window.__diBoxEls = null;
    }
    if (window.__diHoverBoxEls) {
      window.__diHoverBoxEls.margin.forEach(el => { try { el.remove(); } catch(e) {} });
      window.__diHoverBoxEls.padding.forEach(el => { try { el.remove(); } catch(e) {} });
      try { window.__diHoverBoxEls.content?.remove(); } catch(e) {}
      window.__diHoverBoxEls = null;
    }
    if (window.__diBoxLabels) {
      window.__diBoxLabels.forEach(el => { try { el.remove(); } catch(e) {} });
      window.__diBoxLabels = null;
    }
    hideGapOverlay();
    hideLayerPicker();
    if (window.__diLayerPicker) {
      try { window.__diLayerPicker.remove(); } catch(e) {}
      window.__diLayerPicker = null;
    }
    const hint = document.getElementById("__diHint");
    if (hint) hint.remove();
    panel = hoverOverlay = hoverLabel = selectedOverlay = toast = style = null;
    window.__devInspectorLoaded = false;
  }

  window.__devInspectorDestroy = destroyInspector;

  // 自動起動
  initInspector();
})();
