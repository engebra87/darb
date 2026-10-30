// «أرض طلبة العلم»: حديقة ثلاثية الأبعاد، لكل لاعب بيت يُبنى جزءًا جزءًا (١٢ جزءًا = ٤ مستويات × ٣ حارات).
// تتصل بقاعدة اللعبة عبر window.darbCore الذي تكشفه index.html، والدوال في supabase/ard.sql
(() => {
  "use strict";
  const PARTS = ["الأساس", "البلاط الأبلق", "الجدار الأول", "الجدران", "الشبابيك", "الباب الدمشقي",
    "السقف", "القبّة", "النافورة", "شجرة الياسمين", "الفانوس", "لوحة «دار العلم»"];
  const N = PARTS.length;
  const COUNTRIES = [
    ["SA","السعودية"],["AE","الإمارات"],["KW","الكويت"],["QA","قطر"],["BH","البحرين"],["OM","عُمان"],["YE","اليمن"],
    ["IQ","العراق"],["SY","سوريا"],["JO","الأردن"],["LB","لبنان"],["PS","فلسطين"],["EG","مصر"],["SD","السودان"],
    ["LY","ليبيا"],["TN","تونس"],["DZ","الجزائر"],["MA","المغرب"],["MR","موريتانيا"],["SO","الصومال"],["DJ","جيبوتي"],
    ["KM","جزر القمر"],["TR","تركيا"],["IR","إيران"],["PK","باكستان"],["AF","أفغانستان"],["IN","الهند"],["BD","بنغلاديش"],
    ["ID","إندونيسيا"],["MY","ماليزيا"],["NG","نيجيريا"],["SN","السنغال"],["ML","مالي"],["NE","النيجر"],["TD","تشاد"],
    ["AZ","أذربيجان"],["UZ","أوزبكستان"],["KZ","كازاخستان"],["BA","البوسنة"],["AL","ألبانيا"],["GB","بريطانيا"],
    ["FR","فرنسا"],["DE","ألمانيا"],["NL","هولندا"],["BE","بلجيكا"],["SE","السويد"],["NO","النرويج"],["DK","الدنمارك"],
    ["IT","إيطاليا"],["ES","إسبانيا"],["AT","النمسا"],["CH","سويسرا"],["RU","روسيا"],["US","أمريكا"],["CA","كندا"],
    ["BR","البرازيل"],["AU","أستراليا"],["ZA","جنوب أفريقيا"]];
  const NAME = Object.fromEntries(COUNTRIES);
  const flag = c => c && /^[A-Z]{2}$/.test(c) ? String.fromCodePoint(...[...c].map(x => 0x1F1A5 + x.charCodeAt(0))) : "🏳️";
  const AR = n => String(n).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const core = () => window.darbCore || null;
  const sb = () => (core() && core().sb()) || null;
  const me = () => (core() && core().user()) || null;
  async function rpc(fn, args) { const c = sb(); if (!c) throw new Error("offline"); const { data, error } = await c.rpc(fn, args || {}); if (error) throw error; return data; }
  const el = id => document.getElementById(id);
  const nextTxt = p => p >= N ? "اكتمل البيت، ما شاء الله!" : "الجزء التالي: <b>" + PARTS[p] + "</b>";

  // ——— رسم البيت الدمشقي، جزءًا جزءًا ———
  function house(parts, opts) {
    const o = opts || {}, p = Math.max(0, Math.min(N, parts | 0)), has = k => p >= k;
    const ghost = 'fill="none" stroke="rgba(240,180,76,.28)" stroke-width="1" stroke-dasharray="3 3"';
    const id = "h" + Math.random().toString(36).slice(2, 8);
    let s = `<svg viewBox="0 0 140 112" class="hs ${o.cls || ""}" role="img" aria-label="بيت: ${AR(p)} من ${AR(N)} أجزاء">
      <defs><pattern id="${id}" width="16" height="8" patternUnits="userSpaceOnUse"><rect width="16" height="8" fill="#cfc5b1"/><rect x=".5" y=".5" width="15" height="3.2" fill="#f4efe4"/><rect x="-7.5" y="4.3" width="15" height="3.2" fill="#efe8da"/><rect x="8.5" y="4.3" width="15" height="3.2" fill="#efe8da"/></pattern>
      <radialGradient id="${id}g"><stop offset="0" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="70" cy="104" rx="66" ry="6" fill="rgba(0,0,0,.25)"/>`;
    // المخطّط الكامل باهتًا: البيت الذي سيُبنى
    s += `<g ${ghost}><rect x="28" y="40" width="84" height="56"/><path d="M58 40 Q70 20 82 40"/><rect x="24" y="96" width="92" height="6"/></g>`;
    if (has(1)) s += `<rect x="22" y="95" width="96" height="8" rx="1.5" fill="#8a7a66"/><path d="M22 99h96" stroke="#6d5f4f" stroke-width=".8"/>`;
    if (has(2)) s += `<g>${[0,1,2,3,4,5,6,7,8,9,10,11].map(i => `<rect x="${22 + i * 8}" y="95" width="8" height="3" fill="${i % 2 ? "#3a3a40" : "#e6d8bc"}"/>`).join("")}</g>`;
    if (has(3) && !has(4)) s += `<rect x="28" y="56" width="18" height="40" fill="url(#${id})"/><rect x="28" y="56" width="18" height="40" fill="none" stroke="#b9ad96" stroke-width=".6"/>`;
    if (has(4)) s += `<rect x="28" y="40" width="84" height="56" fill="url(#${id})"/><rect x="28" y="40" width="84" height="56" fill="none" stroke="#b9ad96" stroke-width=".8"/>`;
    if (has(5)) s += [38, 92].map(x => `<path d="M${x} 72 v-12 a5 5 0 0 1 10 0 v12z" fill="#1d4e8a" stroke="#c9a46a" stroke-width="1.4"/><path d="M${x + 5} 55v17M${x} 64h10" stroke="#c9a46a" stroke-width=".8"/>`).join("");
    if (has(6)) s += `<path d="M61 96 v-20 a9 9 0 0 1 18 0 v20z" fill="#6b3f22" stroke="#c9a46a" stroke-width="1.6"/><path d="M70 67v29" stroke="#3d2412" stroke-width="1"/><circle cx="66" cy="84" r="1.1" fill="#f0b44c"/><circle cx="74" cy="84" r="1.1" fill="#f0b44c"/>`;
    if (has(7)) s += `<rect x="24" y="36" width="92" height="5" fill="#5a4636"/><g fill="#c9a46a">${Array.from({ length: 12 }, (_, i) => `<rect x="${26 + i * 7.6}" y="33" width="4" height="3"/>`).join("")}</g>`;
    if (has(8)) s += `<path d="M54 36 Q54 14 70 12 Q86 14 86 36z" fill="#3fbf86" fill-opacity=".85" stroke="#2a8a5e" stroke-width="1"/><path d="M70 12v-5" stroke="#c9a46a" stroke-width="1.2"/>`;
    if (has(9)) s += `<g><ellipse cx="128" cy="100" rx="9" ry="3" fill="#e6d8bc" stroke="#8a7a66" stroke-width=".8"/><rect x="119" y="96" width="18" height="4" fill="#3a3a40"/><ellipse cx="128" cy="96" rx="9" ry="2.5" fill="#5bb6e0"/><path d="M128 95 v-7 M128 88 q-4 1 -5 6 M128 88 q4 1 5 6" stroke="#9ad8f2" stroke-width="1" fill="none"/></g>`;
    if (has(10)) s += `<g><rect x="9" y="80" width="3" height="20" fill="#6b4a2a"/><circle cx="10.5" cy="74" r="10" fill="#2f7a3e"/><circle cx="5" cy="79" r="6" fill="#358a46"/><circle cx="16" cy="78" r="6" fill="#2a6e38"/>${[[6,70],[13,69],[10,76],[3,78],[17,75],[9,82]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="#fff"/>`).join("")}</g>`;
    if (has(11)) s += `<circle cx="86" cy="72" r="9" fill="url(#${id}g)"/><path d="M86 62v3" stroke="#3d2412" stroke-width=".8"/><path d="M83 65h6l-1 8h-4z" fill="#f0b44c" stroke="#8a5a14" stroke-width=".6"/>`;
    if (has(12)) s += `<rect x="52" y="44" width="36" height="9" rx="1.5" fill="#1d4e8a" stroke="#c9a46a" stroke-width="1"/><text x="70" y="51" text-anchor="middle" font-size="6.2" font-weight="700" fill="#f7f0e4" font-family="Reem Kufi, sans-serif">دار العلم</text><path d="M70 3.5 a2.6 2.6 0 1 0 2 4.2 a2 2 0 1 1 -2 -4.2z" fill="#f0b44c"/>`;
    return s + "</svg>";
  }

  // ——— الأنماط ———
  const css = `
  #ard{position:fixed;inset:0;z-index:12;direction:rtl;background:#9fd0ea;color:#f7f0e4;font-family:var(--f-ui,sans-serif);overflow:hidden;user-select:none;-webkit-user-select:none}
  #ard canvas.g3{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab}
  #ard canvas.g3:active{cursor:grabbing}
  #ard .ui{position:absolute;left:0;right:0;pointer-events:none;display:flex;gap:8px;align-items:center;padding-left:max(12px,env(safe-area-inset-left,0px));padding-right:max(12px,env(safe-area-inset-right,0px))}
  #ard .ui>*{pointer-events:auto}
  #ard .tp{top:0;padding-top:calc(env(safe-area-inset-top,0px) + 10px);flex-wrap:wrap}
  #ard .bt{bottom:0;padding-bottom:calc(env(safe-area-inset-bottom,0px) + 12px);align-items:flex-end;justify-content:center}
  #ard h1{margin:0;flex:1;min-width:0;font-family:var(--f-display,serif);font-size:24px;color:#fff3d6;text-shadow:0 2px 10px rgba(30,15,5,.75),0 0 2px #000;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #ard .pill{background:rgba(28,20,30,.82);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border:1.5px solid rgba(240,180,76,.55);color:#f7f0e4;border-radius:999px;padding:8px 14px;font:600 15px var(--f-ui,sans-serif);white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,.3)}
  #ard .pill.icon{width:42px;height:42px;padding:0;font-size:18px;display:grid;place-items:center}
  #ard .pill:active{transform:scale(.96)}
  #ard .card{background:rgba(28,20,30,.92);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1.5px solid rgba(240,180,76,.6);border-radius:18px;padding:12px 14px;box-shadow:0 10px 40px rgba(0,0,0,.35);width:min(520px,100%);box-sizing:border-box}
  #ard .card .r{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  #ard .card b.n{font-family:var(--f-display,serif);font-size:20px;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #ard .bar{height:8px;border-radius:99px;background:rgba(255,255,255,.14);overflow:hidden;margin:8px 0 6px}
  #ard .bar i{display:block;height:100%;background:linear-gradient(90deg,#3fbf86,#f0b44c);border-radius:99px;transition:width .6s}
  #ard .k{margin:0;color:#c8b8a2;font-size:14px;line-height:1.7}
  #ard .k b{color:#f7f0e4}
  #ard .lk{background:none;border:0;color:#f0b44c;font:600 14px var(--f-ui,sans-serif);text-decoration:underline;padding:4px}
  #ard .go{background:#f0b44c;color:#2a1a04;border:0;border-radius:12px;padding:9px 16px;font:700 15px var(--f-ui,sans-serif)}
  #ard .hint{position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 64px);transform:translateX(-50%);background:rgba(0,0,0,.45);color:#fff;padding:6px 14px;border-radius:999px;font-size:13px;pointer-events:none;transition:opacity .6s;white-space:nowrap}
  #ard .msgc{position:absolute;inset:0;display:grid;place-items:center;padding:20px;pointer-events:none}
  #ard .msgc .card{pointer-events:auto;text-align:center}
  #ard .sheetA{position:absolute;inset:0;background:rgba(8,5,10,.55);display:flex;align-items:flex-end;justify-content:center;padding:12px;padding-bottom:calc(env(safe-area-inset-bottom,0px) + 12px);user-select:text;-webkit-user-select:text}
  #ard .sheetA .card{max-height:78vh;overflow:auto;display:flex;flex-direction:column;gap:10px;animation:ardUp .25s ease-out}
  @keyframes ardUp{from{transform:translateY(30px);opacity:0}}
  #ard .sheetA h2{margin:0;font-family:var(--f-display,serif);color:#f0b44c;font-size:22px}
  #ard .qs{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px}
  #ard .qs button{text-align:right;background:rgba(255,255,255,.06);border:1px solid #5a4636;color:#f7f0e4;border-radius:12px;padding:9px 10px;font:600 15px var(--f-ui,sans-serif)}
  #ard .qs button.on{border-color:#f0b44c;color:#f0b44c;background:rgba(240,180,76,.12)}
  #ard .qs small{color:#c8b8a2;font-weight:500}
  #ard form{display:flex;gap:8px}
  #ard input[type=email],#ard input[type=search]{flex:1;min-width:0;background:rgba(255,255,255,.08);border:1.5px solid #5a4636;border-radius:12px;color:#f7f0e4;font:600 16px var(--f-ui,sans-serif);padding:10px 12px}
  #ard input[type=email]{direction:ltr;text-align:left}
  #ard input:focus{outline:none;border-color:#f0b44c}
  #ard .x{background:none;border:1px solid #5a4636;color:#c8b8a2;border-radius:12px;padding:10px;font:600 15px var(--f-ui,sans-serif)}
  #ard .msg{font-size:14px;color:#c8b8a2;min-height:1em;margin:0}
  #ard .msg.bad{color:#e8604d}
  #ard .found{display:grid;grid-template-columns:110px 1fr;gap:10px;align-items:center}
  #ard .hs{width:100%;height:auto;display:block}
  #ard .sw{display:flex;align-items:center;gap:8px;font-size:13px;color:#c8b8a2;cursor:pointer}
  #ard .sw input{width:18px;height:18px;accent-color:#f0b44c}
  #ard .flat{position:absolute;inset:0;overflow:auto;padding:calc(env(safe-area-inset-top,0px) + 70px) 12px 160px;background:linear-gradient(#1c1426,#21301f)}
  #ard .street{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;max-width:720px;margin:0 auto}
  #ard .lot{background:rgba(0,0,0,.25);border:1px solid rgba(90,70,54,.7);border-radius:14px;padding:6px;text-align:center}
  #ard .lot b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #ard .lot span{font-size:12px;color:#c8b8a2}
  .ardBuilt{position:fixed;left:50%;top:max(70px,calc(env(safe-area-inset-top,0px) + 64px));z-index:14;transform:translate(-50%,-12px);opacity:0;direction:rtl;display:flex;align-items:center;gap:10px;
    background:rgba(28,20,30,.96);border:2px solid #f0b44c;border-radius:16px;padding:8px 14px 8px 10px;box-shadow:0 10px 40px rgba(0,0,0,.5);transition:opacity .35s,transform .35s;pointer-events:none;max-width:calc(100% - 32px)}
  .ardBuilt.show{opacity:1;transform:translate(-50%,0)}
  .ardBuilt svg{width:74px;height:auto;flex:none}
  .ardBuilt small,.ardBuilt b{white-space:nowrap}
  .ardBuilt small{display:block;color:#c8b8a2;font-size:12px}
  .ardBuilt b{display:block;color:#f0b44c;font:700 17px "Reem Kufi","IBM Plex Sans Arabic",sans-serif}
  #ard .ardCg{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%) scale(.9);opacity:0;transition:opacity .5s,transform .5s;pointer-events:none;text-align:center;
    background:rgba(28,20,30,.5);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);border:1.5px solid rgba(240,180,76,.45);border-radius:22px;padding:16px 26px;max-width:calc(100% - 48px)}
  #ard .ardCg.show{opacity:1;transform:translate(-50%,-50%) scale(1)}
  #ard .ardCg b{display:block;font:700 40px var(--f-display,serif);color:#ffd27a;text-shadow:0 2px 12px rgba(0,0,0,.5)}
  #ard .ardCg span{display:block;font:600 19px var(--f-ui,sans-serif);color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.6);margin-top:4px;text-wrap:balance}
  @media (prefers-reduced-motion:reduce){#ard .ardCg,.ardBuilt,#ard .sheetA .card{transition:none;animation:none}}`;
  function ensureCss() { if (!el("ardCss")) { const st = document.createElement("style"); st.id = "ardCss"; st.textContent = css; document.head.appendChild(st); } }

  // ═══════════ المشهد ثلاثي الأبعاد ═══════════
  const T = () => window.THREE;
  const G = {};          // موارد مشتركة: هندسات ومواد وخامات
  const V = { renderer: null, scene: null, cam: null, world: null, lots: [], target: null, dist: 34, yaw: 0.6, pitch: 0.95, dirty: true, raf: 0, anims: [], fly: null, size: 0 };

  function canvasTex(w, h, draw, rep) {
    const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
    const t = new (T().CanvasTexture)(c); if (rep) { t.wrapS = t.wrapT = T().RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
    t.anisotropy = 4; return t;
  }
  function speckle(g, w, h, n, cols) { for (let i = 0; i < n; i++) { g.fillStyle = cols[i % cols.length]; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }

  function initShared() {
    if (G.ready) return; const THREE = T();
    const L = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
    // حجارة بيضاء بصفوف متداخلة وفواصل ملاط خفيفة
    const ablaq = (rx, ry) => canvasTex(128, 128, (g, w, h) => {
      g.fillStyle = "#cfc5b1"; g.fillRect(0, 0, w, h);
      const tones = ["#f4efe4", "#efe8da", "#f7f3ea", "#ebe3d3"];
      for (let r = 0; r < 4; r++) for (let c = -1; c < 3; c++) { const x = c * 64 + (r % 2 ? 32 : 0); g.fillStyle = tones[(r * 3 + c + 4) % 4]; g.fillRect(x + 2, r * 32 + 2, 60, 28); }
      speckle(g, w, h, 500, ["rgba(0,0,0,.05)", "rgba(255,255,255,.5)", "rgba(120,100,70,.06)"]);
    }, [rx, ry]);
    G.m = {
      stone: L(0x8a7a66), wallF: L(0xffffff, { map: ablaq(2.6, 3) }), wallS: L(0xffffff, { map: ablaq(2.2, 3) }), wallP: L(0xffffff, { map: ablaq(1, 3) }),
      lintel: L(0xffffff, { map: ablaq(.7, 1) }),
      floor: L(0xffffff, { map: canvasTex(64, 64, (g, w) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? "#3a3a40" : "#e9dcc0"; g.fillRect(x * 16, y * 16, 16, 16); } }, [3, 3]) }),
      glass: L(0x1d4e8a, { emissive: 0x0a1c33 }), gold: L(0xc9a46a, { emissive: 0x2a1a04 }), wood: L(0x6b3f22), roof: L(0x5a4636), crenel: L(0xd9c39a),
      dome: L(0x3fbf86, { emissive: 0x0b2a1c }), water: new THREE.MeshPhongMaterial({ color: 0x5bb6e0, shininess: 90, specular: 0xffffff, emissive: 0x0d3a52 }),
      trunk: L(0x6b4a2a), leaf: L(0xffffff, { map: canvasTex(64, 64, (g, w, h) => { g.fillStyle = "#2f7a3e"; g.fillRect(0, 0, w, h); speckle(g, w, h, 160, ["#255f31", "#3a9150"]); g.fillStyle = "#fff"; for (let i = 0; i < 22; i++) { g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 1.8, 0, 7); g.fill(); } }) }),
      tree: L(0x3a8a48), tree2: L(0x2e7340), lamp: new THREE.MeshBasicMaterial({ color: 0xffd27a }),
      ghost: new THREE.LineBasicMaterial({ color: 0xf0b44c, transparent: true, opacity: .55 }), pole: L(0xa07a4a),
      hit: new THREE.MeshBasicMaterial({ visible: false }), hedge: L(0x2f6e35), flower: L(0xffffff), plaza: L(0xffffff, { map: canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#d9c8a4"; g.fillRect(0, 0, w, h); g.strokeStyle = "#b9a684"; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16, h); g.moveTo(0, i * 16); g.lineTo(w, i * 16); g.stroke(); } speckle(g, w, h, 300, ["rgba(0,0,0,.08)", "rgba(255,255,255,.15)"]); }, [6, 6]) }),
      plot: L(0xc8b48a), shadow: new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 4, 32, 32, 32); r.addColorStop(0, "rgba(0,0,0,.38)"); r.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }) })
    };
    G.glow = new THREE.SpriteMaterial({ map: canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, "rgba(255,214,122,.95)"); r.addColorStop(1, "rgba(255,214,122,0)"); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    G.sign = new THREE.MeshBasicMaterial({ map: canvasTex(256, 64, (g, w, h) => { g.fillStyle = "#1d4e8a"; g.fillRect(0, 0, w, h); g.strokeStyle = "#c9a46a"; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); g.fillStyle = "#f7f0e4"; g.font = "700 38px 'Reem Kufi','IBM Plex Sans Arabic',sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.direction = "rtl"; g.fillText("دار العلم", w / 2, h / 2 + 2); }) });
    const B = (x, y, z) => new THREE.BoxGeometry(x, y, z);
    G.g = {
      found: B(5.2, .34, 4.4), floor: B(4.9, .05, 4.1), back: B(4.2, 3, .24), side: B(.24, 3, 3.6), fpanel: B(1.55, 3, .24), lintel: B(1.1, 1, .24),
      win: B(.62, .82, .06), winF: B(.78, .98, .04), winArch: new THREE.CylinderGeometry(.31, .31, .06, 14, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateY(Math.PI / 2), door: B(1, 1.95, .08), knob: new THREE.SphereGeometry(.05, 6, 4),
      roof: B(4.6, .22, 4), crenel: B(.26, .22, .26), drum: new THREE.CylinderGeometry(1.05, 1.15, .35, 16), dome: new THREE.SphereGeometry(1.05, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), fin: new THREE.CylinderGeometry(.04, .06, .5, 6),
      crescent: new THREE.TorusGeometry(.16, .04, 6, 14, Math.PI * 1.4), basin: new THREE.CylinderGeometry(.85, .95, .4, 8), water: new THREE.CylinderGeometry(.74, .74, .05, 8), spout: new THREE.CylinderGeometry(.08, .12, .7, 6), bowl: new THREE.CylinderGeometry(.3, .12, .14, 8),
      trunk: new THREE.CylinderGeometry(.12, .16, 1.4, 6), crown: new THREE.SphereGeometry(.75, 10, 8), lamp: B(.22, .32, .22), lampTop: new THREE.ConeGeometry(.18, .18, 4), signP: new THREE.PlaneGeometry(1.6, .4),
      hit: B(6, 6, 6), shadow: new THREE.PlaneGeometry(8, 8).rotateX(-Math.PI / 2), plot: new THREE.CylinderGeometry(4.2, 4.3, .08, 24), pole: new THREE.CylinderGeometry(.05, .05, 3.9, 5)
    };
    G.ghostGeo = new THREE.EdgesGeometry(B(4.2, 3, 3.6));
    G.ready = true;
  }

  // بيت ثلاثي الأبعاد؛ كل جزء مجموعة مستقلة (لتحريك بنائها)
  function buildHouse(parts) {
    const THREE = T(), m = G.m, g = G.g, h = new THREE.Group(), P = [];
    const add = (grp, geo, mat, x, y, z, ry) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); if (ry) o.rotation.y = ry; grp.add(o); return o; };
    const part = () => { const p = new THREE.Group(); h.add(p); P.push(p); return p; };
    const Y = .34, H = 3, top = Y + H, fz = 1.8;
    let p;
    p = part(); add(p, g.found, m.stone, 0, Y / 2, 0);                                                    // ١ الأساس
    p = part(); add(p, g.floor, m.floor, 0, Y + .025, 0);                                                  // ٢ البلاط
    p = part(); add(p, g.back, m.wallF, 0, Y + H / 2, -fz + .12);                                         // ٣ الجدار الأول
    p = part(); add(p, g.side, m.wallS, -2.1 + .12, Y + H / 2, 0); add(p, g.side, m.wallS, 2.1 - .12, Y + H / 2, 0);   // ٤ الجدران
    add(p, g.fpanel, m.wallP, -1.32, Y + H / 2, fz - .12); add(p, g.fpanel, m.wallP, 1.32, Y + H / 2, fz - .12); add(p, g.lintel, m.lintel, 0, top - .5, fz - .12);
    p = part();                                                                                            // ٥ الشبابيك
    [[-1.32, fz], [1.32, fz]].forEach(([x, z]) => { add(p, g.winF, m.gold, x, Y + 1.7, z + .01); add(p, g.win, m.glass, x, Y + 1.66, z + .03); add(p, g.winArch, m.glass, x, Y + 2.07, z + .03); });
    [-1, 1].forEach(s => { const o = add(p, g.winF, m.gold, s * 2.1, Y + 1.7, 0, Math.PI / 2); o.position.x += s * .01; const w = add(p, g.win, m.glass, s * (2.1 + .03), Y + 1.66, 0, Math.PI / 2); });
    p = part(); add(p, g.door, m.wood, 0, Y + .98, fz - .08); add(p, g.knob, m.gold, -.18, Y + 1, fz - .02); add(p, g.knob, m.gold, .18, Y + 1, fz - .02);   // ٦ الباب
    p = part(); add(p, g.roof, m.roof, 0, top + .11, 0);                                                   // ٧ السقف
    for (let i = -3; i <= 3; i++) { add(p, g.crenel, m.crenel, i * .64, top + .33, 1.88); add(p, g.crenel, m.crenel, i * .64, top + .33, -1.88); }
    for (let i = -2; i <= 2; i++) { add(p, g.crenel, m.crenel, 2.18, top + .33, i * .7); add(p, g.crenel, m.crenel, -2.18, top + .33, i * .7); }
    p = part(); add(p, g.drum, m.crenel, 0, top + .4, -.2); add(p, g.dome, m.dome, 0, top + .57, -.2); add(p, g.fin, m.gold, 0, top + 1.85, -.2);   // ٨ القبّة
    p = part(); p.position.set(3.1, 0, 2.6); add(p, g.basin, m.crenel, 0, .2, 0); add(p, g.water, m.water, 0, .4, 0); add(p, g.spout, m.stone, 0, .7, 0); add(p, g.bowl, m.water, 0, 1.08, 0);   // ٩ النافورة
    p = part(); p.position.set(-3.1, 0, 2.4); add(p, g.trunk, m.trunk, 0, .7, 0); add(p, g.crown, m.leaf, 0, 1.75, 0); add(p, g.crown, m.leaf, -.45, 1.45, .2).scale.setScalar(.7); add(p, g.crown, m.leaf, .45, 1.5, -.1).scale.setScalar(.72);   // ١٠ الياسمين
    p = part(); add(p, g.lamp, m.lamp, .85, Y + 2.35, fz + .05); add(p, g.lampTop, m.roof, .85, Y + 2.6, fz + .05).rotation.y = Math.PI / 4;   // ١١ الفانوس
    const glow = new THREE.Sprite(G.glow); glow.position.set(.85, Y + 2.35, fz + .2); glow.scale.set(1.3, 1.3, 1); p.add(glow);
    p = part(); add(p, g.signP, G.sign, 0, top - .45, fz + .01); const cr = add(p, g.crescent, m.gold, 0, top + 2.22, -.2); cr.rotation.z = -.9;   // ١٢ اللوحة والهلال
    P.forEach((q, i) => q.visible = parts > i);
    // المخطّط والسقالة حتى يكتمل
    if (parts < N) {
      const gh = new THREE.LineSegments(G.ghostGeo, m.ghost); gh.position.set(0, Y + H / 2, 0); h.add(gh); h.userData.ghost = gh;
      if (parts < 7) [[-2.3, -2], [2.3, -2], [-2.3, 2], [2.3, 2]].forEach(([x, z]) => add(h, g.pole, m.pole, x, 1.95, z));
    }
    h.userData.parts = P;
    return h;
  }

  function label(name, parts, mine) {
    const THREE = T();
    const tex = canvasTex(512, 128, (g, w, h) => {
      g.fillStyle = mine ? "rgba(120,72,10,.88)" : "rgba(28,20,30,.82)"; const r = 30;
      g.beginPath(); g.moveTo(r, 8); g.arcTo(w - 8, 8, w - 8, h - 8, r); g.arcTo(w - 8, h - 8, 8, h - 8, r); g.arcTo(8, h - 8, 8, 8, r); g.arcTo(8, 8, w - 8, 8, r); g.fill();
      g.strokeStyle = parts >= N ? "#3fbf86" : "#f0b44c"; g.lineWidth = 5; g.stroke();
      g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.direction = "rtl";
      let n = String(name || "لاعب"); g.font = "700 46px 'IBM Plex Sans Arabic',Tahoma,sans-serif";
      while (g.measureText(n).width > w - 60 && n.length > 3) n = n.slice(0, -2) + "…";
      g.fillText(n, w / 2, 50);
      g.font = "600 30px 'IBM Plex Sans Arabic',Tahoma,sans-serif"; g.fillStyle = parts >= N ? "#7fe0b0" : "#f6d38a";
      g.fillText(parts >= N ? "بيت مكتمل ✓" : AR(parts) + " من " + AR(N), w / 2, 94);
    });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, sizeAttenuation: false }));
    s.scale.set(.2, .05, 1); s.renderOrder = mine ? 7 : 5; return s;
  }

  // مواقع القطع: حلقات حول الساحة، الأقرب لأصحاب البيوت الأكمل
  function plots(n) {
    const out = [], S = 11, seen = new Set();
    for (let r = 1; out.length < n; r++) for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++) {
      if (Math.max(Math.abs(x), Math.abs(z)) !== r) continue;
      const k = x + "," + z; if (seen.has(k)) continue; seen.add(k); out.push([x * S, z * S]);
    }
    return out.sort((a, b) => Math.hypot(a[0], a[1]) - Math.hypot(b[0], b[1]) || Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0])).slice(0, n);
  }

  function setupRenderer(root) {
    const THREE = T();
    if (!V.renderer) {
      V.renderer = new THREE.WebGLRenderer({ antialias: true });
      V.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      V.renderer.domElement.className = "g3";
      V.scene = new THREE.Scene();
      V.scene.background = canvasTex(4, 256, (g, w, h) => { const r = g.createLinearGradient(0, 0, 0, h); r.addColorStop(0, "#5aa7d8"); r.addColorStop(.6, "#bfe3f2"); r.addColorStop(1, "#f6e9cf"); g.fillStyle = r; g.fillRect(0, 0, w, h); });
      V.scene.fog = new THREE.Fog(0xcfe6ef, 70, 220);
      V.scene.add(new THREE.HemisphereLight(0xfff4dc, 0x557a44, .95));
      const sun = new THREE.DirectionalLight(0xffe8c0, .75); sun.position.set(30, 50, 20); V.scene.add(sun);
      V.cam = new THREE.PerspectiveCamera(45, 1, .5, 600);
      V.target = new THREE.Vector3();
      bindControls(V.renderer.domElement);
      addEventListener("resize", () => { V.dirty = true; });
    }
    root.prepend(V.renderer.domElement);
  }

  function disposeWorld() {
    if (!V.world) return;
    V.world.traverse(o => { if (o.isSprite && o.material !== G.glow) { if (!o.userData.shared) o.material.map && o.material.map.dispose(); o.material.dispose(); } if (o.userData.own) { o.geometry && o.geometry.dispose(); if (o.material) { o.material.map && o.material.map.dispose(); o.material.dispose(); } } });
    V.scene.remove(V.world); V.world = null; V.lots = [];
  }

  function buildWorld(houses, country) {
    const THREE = T(); disposeWorld(); initShared();
    const w = new THREE.Group(); V.world = w; V.scene.add(w);
    const list = houses.slice(0, 160), P = plots(list.length), reach = Math.max(22, ...P.map(p => Math.max(Math.abs(p[0]), Math.abs(p[1])))) + 16;
    V.size = reach;
    // العشب والممرّات
    const cells = Math.ceil(reach / 11) * 2 + 1, grassTex = canvasTex(1024, 1024, (g, W, H) => {
      g.fillStyle = "#6fae4f"; g.fillRect(0, 0, W, H); speckle(g, W, H, 9000, ["#5f9c43", "#7dbd5c", "#68a64a", "#86c463"]);
      const c = W / cells; g.strokeStyle = "#d9c8a4"; g.lineWidth = c * .16; g.lineCap = "round";
      for (let i = 0; i <= cells; i++) { g.beginPath(); g.moveTo(i * c, 0); g.lineTo(i * c, H); g.moveTo(0, i * c); g.lineTo(W, i * c); g.stroke(); }
      g.strokeStyle = "rgba(160,140,100,.5)"; g.lineWidth = 1.5; for (let i = 0; i <= cells; i++) { g.beginPath(); g.moveTo(i * c - c * .08, 0); g.lineTo(i * c - c * .08, H); g.moveTo(i * c + c * .08, 0); g.lineTo(i * c + c * .08, H); g.moveTo(0, i * c - c * .08); g.lineTo(W, i * c - c * .08); g.moveTo(0, i * c + c * .08); g.lineTo(W, i * c + c * .08); g.stroke(); }
    });
    const span = cells * 11;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(span, span).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: grassTex }));
    ground.userData.own = 1; w.add(ground);   // عدد الخلايا فردي: البيوت في مراكزها والممرات على حدودها
    const outer = new THREE.Mesh(new THREE.PlaneGeometry(900, 900).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x5f9c43 })); outer.position.y = -.05; outer.userData.own = 1; w.add(outer);
    // الساحة الوسطى ونافورتها الكبيرة
    const plaza = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.4, .12, 40), G.m.plaza); plaza.position.y = .06; plaza.userData.own = 1; w.add(plaza);
    const fb = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, .7, 8), G.m.crenel); fb.position.y = .45; fb.userData.own = 1; w.add(fb);
    const fw = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.35, .06, 8), G.m.water); fw.position.y = .78; fw.userData.own = 1; w.add(fw);
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(.18, .3, 1.8, 8), G.m.stone); sp.position.y = 1.5; sp.userData.own = 1; w.add(sp);
    const bw = new THREE.Mesh(new THREE.CylinderGeometry(.9, .3, .3, 8), G.m.water); bw.position.y = 2.45; bw.userData.own = 1; w.add(bw);
    const qn = label(NAME[country] ? "حيّ " + NAME[country] : "أرض طلبة العلم", N, false); qn.material.map.dispose(); qn.material.map = canvasTex(512, 128, (g, W, H) => { g.fillStyle = "rgba(29,78,138,.92)"; g.fillRect(0, 0, W, H); g.strokeStyle = "#c9a46a"; g.lineWidth = 8; g.strokeRect(4, 4, W - 8, H - 8); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.direction = "rtl"; g.font = "700 54px 'Reem Kufi','IBM Plex Sans Arabic',sans-serif"; g.fillText((NAME[country] ? "حيّ " + NAME[country] : "أرض طلبة العلم") + " " + flag(country), W / 2, H / 2 + 4); }); qn.material.sizeAttenuation = true; qn.material.depthTest = true; qn.scale.set(6, 1.5, 1); qn.position.set(0, 6.4, 0); w.add(qn); V.sign = qn;
    // أشجار وسياج وزهور حول الحديقة (Instanced: رخيصة)
    const trees = [], flowers = [];
    const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    for (let i = 0; i < 90; i++) { const a = rnd() * Math.PI * 2, r = reach + 3 + rnd() * 26; trees.push([Math.cos(a) * r, Math.sin(a) * r, .8 + rnd() * .9]); }
    // أشجار على تقاطعات الممرات داخل الحديقة
    for (let x = -cells; x <= cells; x++) for (let z = -cells; z <= cells; z++) { const X = x * 11 + 5.5, Z = z * 11 + 5.5; if (Math.max(Math.abs(X), Math.abs(Z)) < reach - 4 && Math.hypot(X, Z) > 9 && rnd() < .55) trees.push([X + 2.2, Z + 2.2, .55 + rnd() * .3]); }
    P.forEach(([x, z]) => { for (let i = 0; i < 6; i++) { const a = rnd() * Math.PI * 2; flowers.push([x + Math.cos(a) * (4.4 + rnd() * .6), z + Math.sin(a) * (4.4 + rnd() * .6)]); } });
    for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; flowers.push([Math.cos(a) * 6.9, Math.sin(a) * 6.9]); }
    const tr = new THREE.InstancedMesh(new THREE.CylinderGeometry(.18, .26, 2, 6), G.m.trunk, trees.length), cr = new THREE.InstancedMesh(new THREE.ConeGeometry(1.6, 3.6, 8), G.m.tree, trees.length), cr2 = new THREE.InstancedMesh(new THREE.SphereGeometry(1.5, 10, 8), G.m.tree2, trees.length);
    const o = new THREE.Object3D();
    trees.forEach(([x, z, s], i) => { o.rotation.set(0, 0, 0); o.scale.setScalar(s); o.position.set(x, s, z); o.updateMatrix(); tr.setMatrixAt(i, o.matrix); o.position.set(x, s * 3.4, z); o.updateMatrix(); cr.setMatrixAt(i, o.matrix); o.position.set(x, s * 2.3, z); o.scale.setScalar(s * (i % 3 ? .001 : 1)); o.updateMatrix(); cr2.setMatrixAt(i, o.matrix); });
    const fl = new THREE.InstancedMesh(new THREE.SphereGeometry(.22, 6, 4), G.m.flower, flowers.length), cols = [0xff6b8a, 0xffd23f, 0xffffff, 0xc77dff, 0xff8c42];
    flowers.forEach(([x, z], i) => { o.scale.setScalar(1); o.position.set(x, .2, z); o.updateMatrix(); fl.setMatrixAt(i, o.matrix); fl.setColorAt(i, new THREE.Color(cols[i % cols.length])); });
    [tr, cr, cr2, fl].forEach(m => { m.userData.own = 1; w.add(m); });
    // البيوت
    list.forEach((x, i) => {
      const [px, pz] = P[i], grp = new THREE.Group(); grp.position.set(px, 0, pz);
      const plot = new THREE.Mesh(G.g.plot, G.m.plot); plot.position.y = .04; grp.add(plot);
      const sh = new THREE.Mesh(G.g.shadow, G.m.shadow); sh.position.y = .09; grp.add(sh);
      const hs = buildHouse(x.parts); hs.rotation.y = Math.atan2(-px, -pz); grp.add(hs);   // الواجهة نحو الساحة
      const lb = label(x.display_name, x.parts, x.is_me); lb.position.set(0, 6.4, 0); grp.add(lb);
      const hit = new THREE.Mesh(G.g.hit, G.m.hit); hit.position.y = 3; hit.userData.lot = i; grp.add(hit);
      w.add(grp); V.lots.push({ data: x, grp, house: hs, hit, label: lb, pos: new THREE.Vector3(px, 0, pz) });
    });
    V.dirty = true;
  }

  // ——— التحكم: سحب للتجوّل، إصبعان للتقريب والتدوير، ضغطة على بيت ———
  function bindControls(cv) {
    const pts = new Map(); let last = null, moved = 0, pinch = null;
    const toWorldDelta = (dx, dy) => { const s = V.dist * .0028 * (900 / Math.max(500, innerHeight)), c = Math.cos(V.yaw), n = Math.sin(V.yaw); return [(-dx * c - dy * n) * s, (dx * n - dy * c) * s]; };
    cv.addEventListener("pointerdown", e => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); moved = 0; last = [e.clientX, e.clientY]; V.fly = null; if (pts.size === 2) pinch = null; hideHint(); });
    cv.addEventListener("pointermove", e => {
      if (!pts.has(e.pointerId)) return; const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 1) {
        const dx = e.clientX - prev[0], dy = e.clientY - prev[1]; moved += Math.abs(dx) + Math.abs(dy);
        if (e.buttons === 2 || e.shiftKey) { V.yaw -= dx * .006; V.pitch = clamp(V.pitch - dy * .004, .45, 1.35); }
        else { const [wx, wz] = toWorldDelta(dx, dy); V.target.x += wx; V.target.z += wz; clampTarget(); }
        V.dirty = true;
      } else if (pts.size === 2) {
        const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), ang = Math.atan2(b[1] - a[1], b[0] - a[0]), mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        if (pinch) { V.dist = clamp(V.dist * pinch.d / d, 9, 120); let da = ang - pinch.a; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; V.yaw -= da; const [wx, wz] = toWorldDelta(mid[0] - pinch.m[0], mid[1] - pinch.m[1]); V.target.x += wx; V.target.z += wz; clampTarget(); V.dirty = true; }
        pinch = { d, a: ang, m: mid }; moved += 99;
      }
    });
    const up = e => { if (!pts.has(e.pointerId)) return; pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (pts.size === 0 && moved < 8 && e.type === "pointerup") tap(e.clientX, e.clientY); };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    cv.addEventListener("wheel", e => { e.preventDefault(); V.dist = clamp(V.dist * Math.exp(e.deltaY * .0012), 9, 120); V.dirty = true; hideHint(); }, { passive: false });
    cv.addEventListener("contextmenu", e => e.preventDefault());
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function clampTarget() { const r = V.size || 30; V.target.x = clamp(V.target.x, -r, r); V.target.z = clamp(V.target.z, -r, r); }

  function tap(cx, cy) {
    const THREE = T(), r = V.renderer.domElement.getBoundingClientRect(), ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2((cx - r.left) / r.width * 2 - 1, -(cy - r.top) / r.height * 2 + 1), V.cam);
    const hit = ray.intersectObjects(V.lots.map(l => l.hit))[0];
    if (hit) selectLot(hit.object.userData.lot); else closeInfo();
  }

  function flyTo(pos, dist) { V.fly = { from: V.target.clone(), to: pos.clone(), d0: V.dist, d1: dist || 26, y0: V.yaw, y1: pos.lengthSq() ? nearAngle(V.yaw, Math.atan2(-pos.x, -pos.z)) : V.yaw, p0: V.pitch, t: 0 }; V.dirty = true; }
  const nearAngle = (from, to) => { let d = (to - from) % (2 * Math.PI); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; return from + d; };

  function frame(now) {
    V.raf = requestAnimationFrame(frame);
    const root = el("ard"); if (!root || root.hidden) return;
    const cv = V.renderer.domElement, w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.floor(w * V.renderer.getPixelRatio()) || cv.height !== Math.floor(h * V.renderer.getPixelRatio())) { V.renderer.setSize(w, h, false); V.cam.aspect = w / Math.max(1, h); V.cam.updateProjectionMatrix(); V.dirty = true; }
    if (V.fly) { const f = V.fly; f.t = Math.min(1, f.t + 1 / 50); const e = 1 - Math.pow(1 - f.t, 3); V.target.lerpVectors(f.from, f.to, e); V.dist = f.d0 + (f.d1 - f.d0) * e; V.yaw = f.y0 + (f.y1 - f.y0) * e; V.pitch = f.p0 + (.68 - f.p0) * e; if (f.t >= 1) V.fly = null; V.dirty = true; }
    for (let i = V.anims.length - 1; i >= 0; i--) { const a = V.anims[i]; if (now < a.start) { V.dirty = true; continue; } const t = Math.min(1, (now - a.start) / 650), s = t < 1 ? 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2) : 1; a.g.visible = true; a.g.scale.setScalar(Math.max(.001, s)); a.g.position.y = (1 - t) * 3; if (t >= 1) { V.anims.splice(i, 1); a.done && a.done(); } V.dirty = true; }
    if (V.tick) { V.tick(now); V.dirty = true; }
    if (!V.dirty) return; V.dirty = false;
    const c = Math.cos(V.pitch);
    V.cam.position.set(V.target.x + Math.sin(V.yaw) * V.dist * c, V.dist * Math.sin(V.pitch), V.target.z + Math.cos(V.yaw) * V.dist * c);
    V.cam.lookAt(V.target.x, 1.5, V.target.z);
    for (const l of V.lots) l.label.visible = V.cam.position.distanceTo(l.pos) < 70;
    if (V.sign) V.sign.visible = V.dist > 34 || Math.hypot(V.target.x, V.target.z) < 4;
    V.renderer.render(V.scene, V.cam);
  }

  // بناء الأجزاء الجديدة أمام عين اللاعب
  function animateNew(lot, from) {
    const ps = lot.house.userData.parts, now = performance.now() + 900;
    for (let i = from; i < Math.min(N, lot.data.parts); i++) { ps[i].visible = false; V.anims.push({ g: ps[i], start: now + (i - from) * 520 }); }
  }

  // ═══════════ الحالة والواجهة ═══════════
  const S = { my: null, countries: [], sel: null, houses: null, err: "", info: null };
  let hintT = null;
  function hideHint() { const h = document.querySelector("#ard .hint"); if (h) h.style.opacity = 0; }
  const has3D = () => { try { if (!T()) return false; const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (_) { return false; } };

  function getRoot() {
    ensureCss();
    let root = el("ard");
    if (!root) {
      root = document.createElement("div"); root.id = "ard";
      root.addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Escape") { if (root.querySelector(".sheetA")) closeSheet(); else close(); } });
      root.innerHTML = `<div class="ui tp" id="ardTop"></div><div class="ui bt" id="ardBot"></div><div class="hint" id="ardHint">اسحب للتجوّل · قرّب وأدِر بإصبعين · اضغط على بيت</div>`;
      document.body.appendChild(root);
    }
    return root;
  }
  async function open() {
    const root = getRoot(); endBuild();
    root.hidden = false; S.err = ""; S.info = null;
    S.three = has3D();
    if (S.three) { setupRenderer(root); if (!V.raf) V.raf = requestAnimationFrame(frame); }
    const hint = el("ardHint"); hint.style.opacity = S.three ? 1 : 0; clearTimeout(hintT); hintT = setTimeout(hideHint, 6000);
    drawUI();
    if (!sb()) { S.err = "offline"; return drawUI(); }
    try {
      const [mine, cs] = await Promise.all([me() ? rpc("darb_my_house") : Promise.resolve(null), rpc("darb_land_countries")]);
      S.my = mine && mine[0] ? mine[0] : (me() ? { parts: 0, country: null, findable: true } : null);
      S.countries = cs || [];
      S.sel = (S.my && S.my.country) || S.sel || (S.countries[0] && S.countries[0].country) || null;
      drawUI();
      if (S.my && !S.my.country) pickCountry(true);
      else if (S.sel) loadQuarter(S.sel, true);
      else if (S.three) { buildWorld([], null); V.target.set(0, 0, 0); V.dist = 30; }
    } catch (e) { S.err = "load"; drawUI(); }
  }
  function close() { endBuild(); closeSheet(); const r = el("ard"); if (r) r.hidden = true; if (V.raf) { cancelAnimationFrame(V.raf); V.raf = 0; } }

  async function loadQuarter(c, first) {
    S.sel = c; S.houses = null; S.info = null; drawUI();
    let hs;
    try { hs = await rpc("darb_land", { p_country: c }) || []; } catch (e) { S.houses = "err"; return drawUI(); }
    if (S.sel !== c) return;
    S.houses = hs; drawUI();
    if (S.three) {
      buildWorld(hs, c);
      const mine = V.lots.find(l => l.data.is_me);
      if (mine) {
        let seen = 0; try { seen = +localStorage.getItem("ard-seen") || 0; } catch (_) {}
        V.target.copy(mine.pos); V.dist = 28; V.yaw = Math.atan2(-mine.pos.x, -mine.pos.z); V.pitch = .68;
        if (first && seen < mine.data.parts) { animateNew(mine, seen); try { localStorage.setItem("ard-seen", mine.data.parts); } catch (_) {} }
      } else { V.target.set(0, 0, 0); V.dist = Math.min(95, 40 + V.lots.length * 1.4); V.yaw = .6; V.pitch = .85; }
      V.dirty = true;
    }
  }

  function selectLot(i) {
    const l = V.lots[i]; if (!l) return; S.info = l.data; flyTo(l.pos, 24); drawUI();
  }
  function closeInfo() { if (S.info) { S.info = null; drawUI(); } }

  function drawUI() {
    const top = el("ardTop"), bot = el("ardBot"); if (!top) return;
    if (S.mode === "build") return drawBuildUI(top, bot);
    const signed = !!me(), m = S.my, q = S.sel;
    top.innerHTML = `<button class="pill icon" id="ardX" aria-label="رجوع">→</button><h1>أرض طلبة العلم</h1>
      ${S.countries.length || q ? `<button class="pill" id="ardQ">${q ? flag(q) + " " + esc(NAME[q] || q) : "الأحياء"} ▾</button>` : ""}
      ${signed ? `<button class="pill icon" id="ardS" aria-label="ابحث عن صديق">🔍</button>` : ""}`;
    let b = "";
    if (S.err === "offline") b = `<div class="card"><p class="k">الساحة تحتاج اتصالًا بخادم اللعبة. تأكد من الإنترنت ثم حاول مرة أخرى.</p></div>`;
    else if (S.err === "load") b = `<div class="card"><div class="r"><p class="k" style="flex:1">تعذّر تحميل الساحة الآن.</p><button class="go" id="ardRe">أعد المحاولة</button></div></div>`;
    else if (S.info) {
      const x = S.info;
      b = `<div class="card"><div class="r"><b class="n">${esc(x.display_name)}${x.is_me ? " (أنت)" : ""}</b><button class="lk" id="ardIX">إغلاق</button></div>
        <div class="bar"><i style="width:${x.parts / N * 100}%"></i></div><p class="k"><b>${AR(x.parts)}</b> من ${AR(N)} أجزاء · ${nextTxt(x.parts)}</p></div>`;
    } else if (!signed) b = `<div class="card"><p class="k"><b>ابنِ بيتك في هذه الحديقة!</b> كل حارة تُنهيها في اللعبة تبني جزءًا من بيتك حتى يكتمل بـ${AR(N)} أجزاء. سجّل الدخول من القائمة الرئيسية ليُبنى بيتك.</p></div>`;
    else if (m) b = `<div class="card"><div class="r"><b class="n">بيتك</b>${m.country ? `<button class="go" id="ardMine">🏡 اذهب لبيتي</button>` : ""}</div>
        <div class="bar"><i style="width:${m.parts / N * 100}%"></i></div>
        <p class="k"><b>${AR(m.parts)}</b> من ${AR(N)} أجزاء · ${nextTxt(m.parts)}</p>
        <p class="k">حيّك: ${m.country ? flag(m.country) + " " + esc(NAME[m.country] || m.country) : "لم تختر بعد"} <button class="lk" id="ardC">${m.country ? "غيّر" : "اختر بلدك"}</button></p></div>`;
    if (S.houses === null && q && !S.err) b = `<div class="card"><p class="k">جارٍ تحميل حيّ ${esc(NAME[q] || q)}…</p></div>`;
    if (S.houses === "err") b = `<div class="card"><p class="k">تعذّر تحميل بيوت هذا الحيّ.</p></div>`;
    bot.innerHTML = b;
    // بدون رسوميات ثلاثية: عرض مسطّح
    let flat = el("ardFlat");
    if (!S.three && Array.isArray(S.houses)) {
      if (!flat) { flat = document.createElement("div"); flat.className = "flat"; flat.id = "ardFlat"; el("ard").prepend(flat); }
      flat.innerHTML = `<div class="street">${S.houses.map(x => `<div class="lot">${house(x.parts)}<b>${esc(x.display_name)}${x.is_me ? " (أنت)" : ""}</b><span>${x.parts >= N ? "بيت مكتمل" : AR(x.parts) + "/" + AR(N)}</span></div>`).join("")}</div>`;
    }
    el("ardX").onclick = close;
    el("ardQ") && (el("ardQ").onclick = quarterSheet);
    el("ardS") && (el("ardS").onclick = searchSheet);
    el("ardRe") && (el("ardRe").onclick = open);
    el("ardIX") && (el("ardIX").onclick = closeInfo);
    el("ardC") && (el("ardC").onclick = () => pickCountry(false));
    el("ardMine") && (el("ardMine").onclick = () => {
      if (S.sel !== m.country) return loadQuarter(m.country);
      const l = V.lots.find(x => x.data.is_me); if (l) { flyTo(l.pos, 26); S.info = l.data; drawUI(); }
    });
  }

  function sheet(html) {
    closeSheet();
    const s = document.createElement("div"); s.className = "sheetA"; s.innerHTML = `<div class="card" role="dialog" aria-modal="true">${html}</div>`;
    s.addEventListener("pointerdown", e => { if (e.target === s) closeSheet(); });
    el("ard").appendChild(s); return s;
  }
  function closeSheet() { const s = document.querySelector("#ard .sheetA"); if (s) s.remove(); }

  function quarterSheet() {
    const s = sheet(`<h2>الأحياء</h2><p class="k">كل بلد حيّ في الحديقة. اختر حيًّا لتتجول فيه.</p>
      <div class="qs">${S.countries.map(c => `<button data-c="${esc(c.country)}" class="${c.country === S.sel ? "on" : ""}">${flag(c.country)} ${esc(NAME[c.country] || c.country)}<br><small>${AR(c.houses)} ${c.houses === 1 ? "بيت" : "بيوت"} · ${AR(c.built)} مكتملة</small></button>`).join("") || `<p class="k">لا أحياء بعد.</p>`}</div>
      <button class="x" id="ardSX">إغلاق</button>`);
    s.querySelector(".qs").onclick = e => { const b = e.target.closest("button"); if (b) { closeSheet(); loadQuarter(b.dataset.c); } };
    el("ardSX").onclick = closeSheet;
  }

  function searchSheet() {
    const m = S.my;
    const s = sheet(`<h2>ابحث عن بيت صديق</h2>
      <form id="ardSF"><input type="email" id="ardEmail" required placeholder="name@example.com" autocomplete="off" inputmode="email"><button class="go">ابحث</button></form>
      <p class="msg" id="ardMsg">اكتب بريده كاملًا. لا يظهر البريد لأحد، يظهر الاسم والبيت فقط.</p><div id="ardFound"></div>
      ${m ? `<label class="sw"><input type="checkbox" id="ardFind" ${m.findable !== false ? "checked" : ""}> يمكن لمن يعرف بريدي أن يجد بيتي</label>` : ""}
      <button class="x" id="ardSX">إغلاق</button>`);
    el("ardSX").onclick = closeSheet;
    if (matchMedia("(hover:hover)").matches) el("ardEmail").focus();
    el("ardFind") && (el("ardFind").onchange = async e => { const on = e.target.checked; try { await rpc("darb_set_findable", { p_on: on }); S.my.findable = on; } catch (_) { e.target.checked = !on; } });
    el("ardSF").onsubmit = async ev => {
      ev.preventDefault();
      const msg = el("ardMsg"), out = el("ardFound"); msg.className = "msg"; msg.textContent = "لحظة…"; out.innerHTML = "";
      try {
        const r = (await rpc("darb_find_house", { p_email: el("ardEmail").value.trim() }) || [])[0];
        if (!r) { msg.textContent = "لم نجد بيتًا بهذا البريد. ربما لم يبدأ اللعب بعد، أو أخفى بيته عن البحث."; return; }
        msg.textContent = "";
        out.innerHTML = `<div class="found"><div>${house(r.parts)}</div><div><b class="n" style="font-family:var(--f-display,serif);font-size:20px">${esc(r.display_name)}</b>
          <p class="k"><b>${AR(r.parts)}</b> من ${AR(N)} · ${r.parts >= N ? "بيت مكتمل" : "يبني الآن: " + PARTS[r.parts]}</p>
          ${r.country ? `<button class="go" id="ardVisit">${flag(r.country)} زُر بيته</button>` : `<p class="k">لم يختر بلده بعد.</p>`}</div></div>`;
        el("ardVisit") && (el("ardVisit").onclick = async () => {
          closeSheet();
          if (S.sel !== r.country || !Array.isArray(S.houses)) await loadQuarter(r.country);
          const i = V.lots.findIndex(l => l.data.display_name === r.display_name && l.data.parts === r.parts);
          if (i >= 0) selectLot(i);
        });
      } catch (e) { msg.className = "msg bad"; msg.textContent = "تعذّر البحث الآن. حاول بعد قليل."; }
    };
  }

  function pickCountry(first) {
    const cur = S.my && S.my.country;
    const s = sheet(`<h2>${first ? "من أي بلد أنت؟" : "غيّر حيّك"}</h2>
      <p class="k">يُبنى بيتك في حيّ بلدك، بجوار طلبة العلم من بلدك.</p>
      <input type="search" id="ardPickQ" placeholder="ابحث عن بلد" autocomplete="off">
      <div class="qs" id="ardPickL"></div><button class="x" id="ardSX">${first ? "لاحقًا" : "إلغاء"}</button>`);
    const draw = f => { el("ardPickL").innerHTML = COUNTRIES.filter(([c, n]) => !f || n.includes(f) || c.includes(f.toUpperCase())).map(([c, n]) => `<button data-c="${c}" class="${c === cur ? "on" : ""}">${flag(c)} ${n}</button>`).join(""); };
    draw(""); if (matchMedia("(hover:hover)").matches) el("ardPickQ").focus();
    el("ardPickQ").oninput = e => draw(e.target.value.trim());
    el("ardSX").onclick = () => { closeSheet(); if (first && S.sel) loadQuarter(S.sel, true); else if (first && S.three) buildWorld([], null); };
    el("ardPickL").onclick = async e => {
      const b = e.target.closest("button"); if (!b) return; b.textContent = "لحظة…";
      try {
        await rpc("darb_set_country", { p_country: b.dataset.c });
        closeSheet(); S.my.country = b.dataset.c;
        S.countries = await rpc("darb_land_countries") || S.countries;
        loadQuarter(b.dataset.c, true);
      } catch (_) { b.textContent = "تعذّر الحفظ، حاول مرة أخرى"; }
    };
  }


  // ═══════════ العمّال يبنون الجزء الجديد ═══════════
  function makeWorker(vest, carry) {
    const THREE = T(), g = new THREE.Group(), L = c => new THREE.MeshLambertMaterial({ color: c });
    const skin = L(0xc98b5e), dark = L(0x2b2b30), m = (geo, mat, x, y, z, parent) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); (parent || g).add(o); return o; };
    const legL = m(new THREE.BoxGeometry(.2, .62, .22), dark, -.13, .31, 0), legR = m(new THREE.BoxGeometry(.2, .62, .22), dark, .13, .31, 0);
    m(new THREE.CylinderGeometry(.3, .33, .78, 10), L(vest), 0, 1.0, 0);
    m(new THREE.BoxGeometry(.5, .08, .36), L(0xf7f0e4), 0, .98, 0);                       // شريط عاكس
    m(new THREE.SphereGeometry(.21, 12, 10), skin, 0, 1.58, 0);
    m(new THREE.SphereGeometry(.25, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), L(0xffc928), 0, 1.66, 0);   // خوذة
    m(new THREE.CylinderGeometry(.3, .3, .03, 12), L(0xffc928), 0, 1.66, .04);
    const arm = (side) => { const p = new THREE.Group(); p.position.set(side * .36, 1.3, 0); g.add(p); m(new THREE.BoxGeometry(.13, .55, .13), L(vest), 0, -.26, 0, p); m(new THREE.SphereGeometry(.08, 8, 6), skin, 0, -.56, 0, p); return p; };
    const aR = arm(1), aL = arm(-1);
    if (carry) { const blk = m(new THREE.BoxGeometry(.7, .32, .45), G.m.wallF, 0, 2.05, 0); g.userData.block = blk; aR.rotation.x = aL.rotation.x = Math.PI; }
    else { m(new THREE.CylinderGeometry(.03, .03, .55, 6), L(0x7a5230), 0, -.62, .22, aR).rotation.x = Math.PI / 2; m(new THREE.BoxGeometry(.12, .12, .26), dark, 0, -.62, .5, aR); }
    Object.assign(g.userData, { aR, aL, legL, legR, carry });
    return g;
  }

  let audio = null;
  function knock(f, v) {
    const c = core(); if (c && c.sound && !c.sound()) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === "suspended") audio.resume();
      const t = audio.currentTime, o = audio.createOscillator(), gn = audio.createGain();
      o.type = "triangle"; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .5, t + .08);
      gn.gain.setValueAtTime(v, t); gn.gain.exponentialRampToValueAtTime(.001, t + .12); o.connect(gn).connect(audio.destination); o.start(t); o.stop(t + .14);
    } catch (_) {}
  }
  function chime() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => knock(f * 2, .12), i * 110)); }

  const B = { parts: 0, lot: null, t0: 0, done: false, pct: -1, workers: [], puffs: [] };
  function buildScene(parts) {
    const root = getRoot(); closeSheet(); endBuild();
    S.mode = "build"; S.info = null; root.hidden = false;
    hideHint(); setupRenderer(root); if (!V.raf) V.raf = requestAnimationFrame(frame);
    const c = core(), name = (c && c.name && c.name()) || "بيتك";
    buildWorld([{ display_name: name, parts, is_me: true }], S.my && S.my.country);
    const lot = V.lots[0], THREE = T(), part = lot.house.userData.parts[parts - 1];
    Object.assign(B, { parts, lot, t0: performance.now(), done: false, pct: -1, workers: [], puffs: [], part });
    part.visible = true; part.scale.set(1, .001, 1);
    // كومة حجارة وعمّال حول البيت (بإحداثيات البيت: الواجهة +z)
    const pile = new THREE.Group(); pile.position.set(3.6, 0, -1.2);
    [[0, .16, 0], [.75, .16, 0], [.38, .48, 0], [0, .16, .5], [.75, .16, .5]].forEach(([x, y, z]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(.7, .32, .45), G.m.wallF); b.position.set(x, y, z); pile.add(b); });
    lot.house.add(pile);
    [[-1.9, 3.3, 0xff7a1a], [1.9, 3.3, 0x2f6fd0], [-3.3, -.4, 0x2fa05a]].forEach(([x, z, col], i) => {
      const w = makeWorker(col, false); w.position.set(x, .08, z); w.rotation.y = Math.atan2(-x, -z); w.userData.phase = i * 1.7; lot.house.add(w); B.workers.push(w);
    });
    const carrier = makeWorker(0xd94a4a, true); carrier.position.set(3.4, .08, 0); lot.house.add(carrier); carrier.userData.walk = true; B.workers.push(carrier);
    try { localStorage.setItem("ard-seen", parts); } catch (_) {}
    // الكاميرا أمام الواجهة
    const yaw = lot.house.rotation.y;
    V.target.copy(lot.pos).add(new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)).multiplyScalar(.8));
    V.yaw = yaw + .5; V.pitch = .62; V.dist = 25; V.fly = null;
    let lastKnock = 0, prev = performance.now();
    V.tick = now => {
      const dt = Math.min(.1, (now - prev) / 1000); prev = now;
      const t = (now - B.t0) / 1000, buildT = clamp((t - 1.2) / 4.2, 0, 1);
      V.yaw += dt * .1;
      // الجزء يرتفع طبقة طبقة
      const step = Math.min(1, Math.ceil(buildT * 9) / 9);
      B.part.scale.y = Math.max(.001, B.done ? 1 : step);
      B.workers.forEach(w => {
        const u = w.userData, ph = t * 9 + (u.phase || 0);
        if (B.done) { u.aR.rotation.x = u.aL.rotation.x = 0; u.legL.rotation.x = u.legR.rotation.x = 0; w.position.y = .08; if (u.block) u.block.visible = false; return; }
        if (u.walk) {           // يحمل الحجر بين الكومة والبيت
          const k = (Math.sin(t * 1.4) + 1) / 2; w.position.set(3.5 - k * 1.3, .08, -.6 + k * 2.6); w.rotation.y = Math.cos(t * 1.4) > 0 ? -.4 : Math.PI - .4;
          u.legL.rotation.x = Math.sin(t * 10) * .5; u.legR.rotation.x = -u.legL.rotation.x; w.position.y = .08 + Math.abs(Math.sin(t * 10)) * .05;
        } else {                // يطرق بالمطرقة
          u.aR.rotation.x = -1.6 + Math.max(0, Math.sin(ph)) * 1.7; u.aL.rotation.x = -.3; w.position.y = .08;
        }
      });
      if (!B.done && buildT > 0 && buildT < 1 && now - lastKnock > 260) { lastKnock = now; knock(170 + Math.random() * 60, .18); puff(); }
      B.puffs.forEach(p => { p.userData.life -= dt; p.material.opacity = Math.min(1, Math.max(0, p.userData.life)) * .8; p.scale.multiplyScalar(1 + dt * 1.2); p.position.y += dt * .6; p.visible = p.userData.life > 0; });
      const pct = Math.round(buildT * 100);
      if (pct !== B.pct) { B.pct = pct; const bar = el("ardBP"); if (bar) bar.style.width = pct + "%"; const st = el("ardBS"); if (st && !B.done) st.textContent = buildT <= 0 ? "العمّال يجهّزون الحجارة…" : "جارٍ البناء… " + AR(pct) + "٪"; }
      if (!B.done && buildT >= 1) { B.done = true; chime(); sparkle(); drawUI(); congrats(B.parts); }
    };
    drawUI();
  }
  function puff() {
    const THREE = T(); if (!B.lot) return;
    let p = B.puffs.find(x => !x.visible);
    if (!p) { if (B.puffs.length > 14) return; p = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xe9dcc0, transparent: true, depthWrite: false, map: G.m.shadow.map })); p.userData.shared = 1; B.lot.house.add(p); B.puffs.push(p); }
    p.position.set((Math.random() - .5) * 4, .4 + Math.random() * 2.2, 1.9); p.scale.setScalar(.7); p.userData.life = 1; p.visible = true; p.material.opacity = .7;
  }
  function sparkle() {
    const THREE = T(); if (!B.lot) return;
    for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(G.glow.clone()); s.userData.shared = 1; s.position.set((Math.random() - .5) * 6, 1 + Math.random() * 5, (Math.random() - .5) * 5); s.scale.setScalar(.25 + Math.random() * .3); s.userData.life = 1 + Math.random() * .8; B.lot.house.add(s); B.puffs.push(s); }
  }
  function congrats(p) {
    const root = el("ard"); if (!root) return;
    const c = document.createElement("div"); c.className = "ardCg"; c.setAttribute("role", "status");
    c.innerHTML = `<b>مبارك!</b><span>تمّ بناء المرحلة ${AR(p)} من بيتك</span>`;
    root.appendChild(c);
    requestAnimationFrame(() => c.classList.add("show"));
    setTimeout(() => c.classList.remove("show"), 2800); setTimeout(() => c.remove(), 3500);
  }
  function endBuild() { document.querySelectorAll("#ard .ardCg").forEach(x => x.remove()); if (S.mode !== "build") return; S.mode = null; V.tick = null; B.lot = null; }

  function drawBuildUI(top, bot) {
    const p = B.parts, signed = !!me();
    top.innerHTML = B.done ? "" : `<h1 style="text-align:center">العمّال يبنون بيتك 🔨</h1>`;
    bot.innerHTML = `<div class="card"><div class="r"><b class="n">${PARTS[p - 1]}</b><span class="k">الجزء ${AR(p)} من ${AR(N)}</span></div>
      <div class="bar"><i id="ardBP" style="width:${B.done ? 100 : Math.max(0, B.pct)}%;transition:none"></i></div>
      <p class="k" id="ardBS">${B.done ? (p >= N ? "ما شاء الله! بيتك في أرض طلبة العلم مكتمل." : nextTxt(p)) : "العمّال يجهّزون الحجارة…"}</p>
      ${!signed ? `<p class="k">سجّل الدخول من القائمة الرئيسية ليُحفظ بيتك ويظهر في الحديقة.</p>` : ""}
      ${B.done ? `<div class="r" style="margin-top:8px"><button class="go" id="ardCont" style="flex:1">تابع الرحلة ←</button>${signed ? `<button class="lk" id="ardSeeG">زُر الحديقة</button>` : ""}</div>`
               : `<div class="r" style="margin-top:6px;justify-content:flex-end"><button class="lk" id="ardSkip">تخطَّ</button></div>`}</div>`;
    el("ardCont") && (el("ardCont").onclick = close);
    el("ardSeeG") && (el("ardSeeG").onclick = open);
    el("ardSkip") && (el("ardSkip").onclick = () => { B.t0 = performance.now() - 6000; });
  }

  // ——— من داخل اللعبة: بُني جزء جديد ———
  let hideT = null, warned = false;
  function toast(parts, title, sub) {
    ensureCss();
    let t = document.querySelector(".ardBuilt");
    if (!t) { t = document.createElement("div"); t.className = "ardBuilt"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.innerHTML = `${house(parts)}<div><small>${sub}</small><b>${title}</b></div>`;
    requestAnimationFrame(() => t.classList.add("show"));
    clearTimeout(hideT); hideT = setTimeout(() => t.classList.remove("show"), 3200);
  }
  function built() {
    const c = core(); if (!c) return;
    const d = c.done() || {}, parts = Math.min(N, (Math.max(1, c.round()) - 1) * 3 + ["fiqh", "sira", "hadith"].filter(k => d[k]).length);
    if (!parts) return;
    if (!me()) { if (has3D()) return buildScene(parts); if (!warned) { warned = true; toast(parts, "سجّل الدخول ليُحفظ بيتك", "أرض طلبة العلم"); } return; }
    if (S.my) S.my.parts = Math.max(S.my.parts, parts);
    if (has3D()) return buildScene(parts);
    toast(parts, "مبارك! تمّ بناء المرحلة " + AR(parts) + " من بيتك", PARTS[parts - 1] + " · " + AR(parts) + " من " + AR(N));
  }
  function finish() { if (me() && sb()) rpc("darb_house_finish").then(n => { if (S.my) S.my.parts = n; }).catch(() => {}); }

  // ——— حذف الحساب (شرط Google Play) ———
  function deleteAccount() {
    ensureCss();
    const box = document.createElement("div"); box.id = "ardDel";
    box.style.cssText = "position:fixed;inset:0;z-index:20;background:rgba(8,5,10,.75);display:grid;place-items:center;padding:16px;direction:rtl";
    box.innerHTML = `<div style="width:min(420px,100%);background:#1f1622;border:2px solid #e8604d;border-radius:20px;padding:18px;display:flex;flex-direction:column;gap:12px;font-family:var(--f-ui,sans-serif);color:#f7f0e4">
      <h2 style="margin:0;font-family:var(--f-display,serif);color:#e8604d;font-size:24px">حذف الحساب</h2>
      <p style="margin:0;color:#c8b8a2;line-height:1.8">سيُحذف حسابك نهائيًا مع كل بياناته: البريد، والاسم، والنقاط، والتقدّم، وبيتك في أرض طلبة العلم. لا يمكن التراجع عن ذلك.</p>
      <p id="delMsg" style="margin:0;min-height:1em;color:#e8604d"></p>
      <button id="delYes" style="background:#e8604d;color:#fff;border:0;border-radius:14px;padding:14px;font:700 17px var(--f-ui,sans-serif)">احذف حسابي نهائيًا</button>
      <button id="delNo" style="background:none;border:1px solid #5a4636;color:#c8b8a2;border-radius:14px;padding:12px;font:600 15px var(--f-ui,sans-serif)">إلغاء</button></div>`;
    document.body.appendChild(box);
    box.addEventListener("keydown", e => e.stopPropagation());
    el("delNo").onclick = () => box.remove();
    el("delYes").onclick = async () => {
      const b = el("delYes"); b.disabled = true; b.textContent = "جارٍ الحذف…";
      try {
        await rpc("darb_delete_account");
        try { await sb().auth.signOut(); } catch (_) {}
        try { ["bawwabat-sham", "ard-seen"].forEach(k => localStorage.removeItem(k)); sessionStorage.removeItem("darb-guest"); } catch (_) {}
        box.firstElementChild.innerHTML = `<h2 style="margin:0;font-family:var(--f-display,serif);color:#3fbf86;font-size:24px">تمّ حذف حسابك</h2><p style="margin:0;color:#c8b8a2">نسأل الله أن ينفعك بما تعلّمت.</p>`;
        setTimeout(() => location.reload(), 1800);
      } catch (e) { b.disabled = false; b.textContent = "احذف حسابي نهائيًا"; el("delMsg").textContent = "تعذّر الحذف الآن. تحقق من الإنترنت وحاول مرة أخرى."; }
    };
  }

  window.darbArd = { open, close, built, finish, house, deleteAccount };
})();
