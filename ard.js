// «أرض طلبة العلم»: كل حارة ينهيها اللاعب تبني جزءًا من بيته (١٢ جزءًا).
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

  // ——— رسم البيت الدمشقي، جزءًا جزءًا ———
  function house(parts, opts) {
    const o = opts || {}, p = Math.max(0, Math.min(N, parts | 0)), has = k => p >= k;
    const ghost = 'fill="none" stroke="rgba(240,180,76,.28)" stroke-width="1" stroke-dasharray="3 3"';
    const id = "h" + Math.random().toString(36).slice(2, 8);
    let s = `<svg viewBox="0 0 140 112" class="hs ${o.cls || ""}" role="img" aria-label="بيت: ${AR(p)} من ${AR(N)} أجزاء">
      <defs><pattern id="${id}" width="140" height="8" patternUnits="userSpaceOnUse"><rect width="140" height="4" fill="#e6d8bc"/><rect y="4" width="140" height="4" fill="#3a3a40"/></pattern>
      <radialGradient id="${id}g"><stop offset="0" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="70" cy="104" rx="66" ry="6" fill="rgba(0,0,0,.25)"/>`;
    // المخطّط الكامل باهتًا: البيت الذي سيُبنى
    s += `<g ${ghost}><rect x="28" y="40" width="84" height="56"/><path d="M58 40 Q70 20 82 40"/><rect x="24" y="96" width="92" height="6"/></g>`;
    if (has(1)) s += `<rect x="22" y="95" width="96" height="8" rx="1.5" fill="#8a7a66"/><path d="M22 99h96" stroke="#6d5f4f" stroke-width=".8"/>`;
    if (has(2)) s += `<g>${[0,1,2,3,4,5,6,7,8,9,10,11].map(i => `<rect x="${22 + i * 8}" y="95" width="8" height="3" fill="${i % 2 ? "#3a3a40" : "#e6d8bc"}"/>`).join("")}</g>`;
    if (has(3) && !has(4)) s += `<rect x="28" y="56" width="18" height="40" fill="url(#${id})"/><rect x="28" y="56" width="18" height="40" fill="none" stroke="#1d1d22" stroke-width=".6"/>`;
    if (has(4)) s += `<rect x="28" y="40" width="84" height="56" fill="url(#${id})"/><rect x="28" y="40" width="84" height="56" fill="none" stroke="#1d1d22" stroke-width=".8"/>`;
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
  #ard{position:fixed;inset:0;z-index:12;direction:rtl;overflow:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;user-select:text;-webkit-user-select:text;
    background:radial-gradient(ellipse at 50% -10%,rgba(240,180,76,.18),transparent 60%),linear-gradient(#1c1426,#140e1c 70%,#21301f);color:var(--ink,#f7f0e4);font-family:var(--f-ui,sans-serif)}
  #ard .wrap{max-width:720px;margin:0 auto;padding:calc(env(safe-area-inset-top,0px) + 12px) max(16px,env(safe-area-inset-right,0px)) calc(env(safe-area-inset-bottom,0px) + 40px) max(16px,env(safe-area-inset-left,0px));display:flex;flex-direction:column;gap:16px}
  #ard .top{display:flex;align-items:center;gap:10px}
  #ard h1{flex:1;margin:0;font-family:var(--f-display,serif);font-size:28px;color:var(--lamp,#f0b44c);line-height:1.2}
  #ard .x{background:rgba(0,0,0,.35);border:1px solid var(--line,#5a4636);color:var(--ink,#f7f0e4);border-radius:12px;padding:8px 14px;font:600 15px var(--f-ui,sans-serif)}
  #ard .card{background:rgba(28,20,30,.82);border:1.5px solid var(--line,#5a4636);border-radius:18px;padding:14px}
  #ard .mine{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:12px;align-items:center;border-color:rgba(240,180,76,.6)}
  @media (max-width:520px){#ard .mine{grid-template-columns:1fr}}
  #ard .hs{width:100%;height:auto;display:block}
  #ard .bar{height:8px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden;margin:6px 0}
  #ard .bar i{display:block;height:100%;background:linear-gradient(90deg,#3fbf86,#f0b44c);border-radius:99px}
  #ard .k{color:var(--muted,#c8b8a2);font-size:14px;line-height:1.8}
  #ard .k b{color:var(--ink,#f7f0e4)}
  #ard .big2{font-family:var(--f-display,serif);font-size:22px;margin:0}
  #ard .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  #ard .chip{background:rgba(255,255,255,.07);border:1.5px solid var(--line,#5a4636);color:var(--ink,#f7f0e4);border-radius:999px;padding:6px 12px;font:600 14px var(--f-ui,sans-serif);white-space:nowrap}
  #ard .chip.on{border-color:var(--lamp,#f0b44c);background:rgba(240,180,76,.16);color:var(--lamp,#f0b44c)}
  #ard .chip small{color:var(--muted,#c8b8a2);font-weight:500;margin-inline-start:4px}
  #ard .tabs{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:thin}
  #ard .sec{font-family:var(--f-display,serif);font-size:20px;margin:4px 0 0;color:var(--ink,#f7f0e4)}
  #ard .street{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;background:repeating-linear-gradient(90deg,rgba(230,216,188,.05) 0 24px,rgba(0,0,0,.08) 24px 48px);border-radius:16px;padding:10px}
  #ard .lot{background:rgba(0,0,0,.25);border:1px solid rgba(90,70,54,.7);border-radius:14px;padding:6px 6px 8px;text-align:center;min-width:0}
  #ard .lot.me{outline:2px solid var(--lamp,#f0b44c)}
  #ard .lot b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #ard .lot span{font-size:12px;color:var(--muted,#c8b8a2)}
  #ard .lot.done span{color:#3fbf86}
  #ard form{display:flex;gap:8px}
  #ard input[type=email],#ard input[type=search]{flex:1;min-width:0;background:rgba(255,255,255,.08);border:1.5px solid var(--line,#5a4636);border-radius:12px;color:var(--ink,#f7f0e4);font:600 16px var(--f-ui,sans-serif);padding:11px 12px;direction:ltr;text-align:left}
  #ard input[type=search]{direction:rtl;text-align:right}
  #ard input:focus{outline:none;border-color:var(--lamp,#f0b44c)}
  #ard .go{background:var(--lamp,#f0b44c);color:#2a1a04;border:0;border-radius:12px;padding:0 18px;font:700 16px var(--f-ui,sans-serif)}
  #ard .msg{font-size:14px;color:var(--muted,#c8b8a2);min-height:1em}
  #ard .msg.bad{color:var(--bad,#e8604d)}
  #ard .found{display:grid;grid-template-columns:120px 1fr;gap:12px;align-items:center;margin-top:10px}
  #ard .sw{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted,#c8b8a2);cursor:pointer}
  #ard .sw input{width:18px;height:18px;accent-color:#f0b44c}
  #ard .empty{text-align:center;color:var(--muted,#c8b8a2);padding:20px 8px;font-size:15px;line-height:1.8}
  #ardPick{position:fixed;inset:0;z-index:13;background:rgba(8,5,10,.7);display:grid;place-items:center;direction:rtl;padding:16px}
  #ardPick .card{width:min(460px,100%);max-height:80vh;display:flex;flex-direction:column;gap:10px;background:#1f1622;border:2px solid var(--lamp,#f0b44c);border-radius:20px;padding:16px}
  #ardPick h2{margin:0;font-family:var(--f-display,serif);color:var(--lamp,#f0b44c);font-size:22px}
  #ardPick p{margin:0;color:var(--muted,#c8b8a2);font-size:14px;line-height:1.7}
  #ardPick .list{overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px}
  #ardPick .list button{text-align:right;background:rgba(255,255,255,.06);border:1px solid var(--line,#5a4636);color:var(--ink,#f7f0e4);border-radius:10px;padding:9px 10px;font:600 15px var(--f-ui,sans-serif)}
  #ardPick .list button.on{border-color:var(--lamp,#f0b44c);color:var(--lamp,#f0b44c)}
  #ardPick input{background:rgba(255,255,255,.08);border:1.5px solid var(--line,#5a4636);border-radius:12px;color:var(--ink,#f7f0e4);font:600 16px var(--f-ui,sans-serif);padding:10px 12px}
  #ardPick .x{background:none;border:1px solid var(--line,#5a4636);color:var(--muted,#c8b8a2);border-radius:12px;padding:10px;font:600 15px var(--f-ui,sans-serif)}
  .ardBuilt{position:fixed;left:50%;top:max(70px,calc(env(safe-area-inset-top,0px) + 64px));z-index:14;transform:translate(-50%,-12px);opacity:0;direction:rtl;display:flex;align-items:center;gap:10px;
    background:rgba(28,20,30,.96);border:2px solid #f0b44c;border-radius:16px;padding:8px 14px 8px 10px;box-shadow:0 10px 40px rgba(0,0,0,.5);transition:opacity .35s,transform .35s;pointer-events:none;max-width:calc(100% - 32px)}
  .ardBuilt.show{opacity:1;transform:translate(-50%,0)}
  .ardBuilt svg{width:74px;height:auto;flex:none}
  .ardBuilt small{display:block;color:#c8b8a2;font-size:12px}
  .ardBuilt small,.ardBuilt b{white-space:nowrap}
  .ardBuilt b{display:block;color:#f0b44c;font:700 17px "Reem Kufi","IBM Plex Sans Arabic",sans-serif}
  @media (prefers-reduced-motion:reduce){.ardBuilt{transition:none}}`;
  function ensureCss() { if (!document.getElementById("ardCss")) { const st = document.createElement("style"); st.id = "ardCss"; st.textContent = css; document.head.appendChild(st); } }

  // ——— الحالة ———
  const S = { my: null, countries: [], sel: null, houses: null, err: "" };

  function el(id) { return document.getElementById(id); }

  async function open() {
    ensureCss();
    let root = el("ard");
    if (!root) { root = document.createElement("div"); root.id = "ard"; root.addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Escape" && !el("ardPick")) close(); }); document.body.appendChild(root); }
    root.hidden = false;
    S.err = ""; S.houses = null;
    render();
    if (!sb()) { S.err = "offline"; return render(); }
    try {
      const [mine, cs] = await Promise.all([me() ? rpc("darb_my_house") : Promise.resolve(null), rpc("darb_land_countries")]);
      S.my = mine && mine[0] ? mine[0] : (me() ? { parts: 0, country: null, findable: true } : null);
      S.countries = cs || [];
      S.sel = S.sel || (S.my && S.my.country) || (S.countries[0] && S.countries[0].country) || null;
      render();
      if (S.my && !S.my.country) pickCountry(true);
      if (S.sel) loadQuarter(S.sel);
    } catch (e) { S.err = "load"; render(); }
  }
  function close() { const r = el("ard"); if (r) r.hidden = true; const p = el("ardPick"); if (p) p.remove(); }

  async function loadQuarter(c) {
    S.sel = c; S.houses = null; render();
    try { S.houses = await rpc("darb_land", { p_country: c }) || []; } catch (e) { S.houses = "err"; }
    if (S.sel === c) render();
  }

  function next(p) { return p >= N ? "اكتمل البيت، ما شاء الله!" : "الجزء التالي: <b>" + PARTS[p] + "</b>"; }

  function render() {
    const root = el("ard"); if (!root) return;
    const signed = !!me(), m = S.my;
    let h = `<div class="wrap"><div class="top"><h1>أرض طلبة العلم</h1><button class="x" id="ardX">رجوع</button></div>`;
    if (S.err === "offline") h += `<div class="card empty">الساحة تحتاج اتصالًا بخادم اللعبة. تأكد من الإنترنت ثم حاول مرة أخرى.</div>`;
    else if (S.err === "load") h += `<div class="card empty">تعذّر تحميل الساحة الآن. حاول بعد قليل.<br><button class="chip" id="ardRe" style="margin-top:10px">أعد المحاولة</button></div>`;
    // بيتي
    if (!S.err) {
      if (!signed) h += `<div class="card mine"><div>${house(0)}</div><div><p class="big2">ابنِ بيتك هنا</p><p class="k">كل حارة تُنهيها بنجاح تبني جزءًا من بيتك، حتى يكتمل بـ${AR(N)} أجزاء. سجّل الدخول من القائمة الرئيسية ليُبنى بيتك ويظهر لأصحابك.</p></div></div>`;
      else if (m) h += `<div class="card mine"><div>${house(m.parts)}</div><div>
        <p class="big2">بيتك</p>
        <div class="bar"><i style="width:${(m.parts / N) * 100}%"></i></div>
        <p class="k"><b>${AR(m.parts)}</b> من ${AR(N)} أجزاء · ${next(m.parts)}</p>
        <p class="k">الحيّ: <button class="chip" id="ardCountry">${m.country ? flag(m.country) + " " + esc(NAME[m.country] || m.country) : "اختر بلدك"}</button></p>
        <label class="sw"><input type="checkbox" id="ardFind" ${m.findable !== false ? "checked" : ""}> يمكن لمن يعرف بريدي أن يجد بيتي</label>
      </div></div>`;
      else h += `<div class="card empty">جارٍ التحميل…</div>`;
      // البحث بالبريد
      h += `<div class="card"><p class="sec" style="margin:0 0 8px">ابحث عن بيت شخص تعرفه</p>
        ${signed ? `<form id="ardSearch"><input type="email" id="ardEmail" required placeholder="name@example.com" autocomplete="off" inputmode="email"><button class="go">ابحث</button></form>
        <div class="msg" id="ardMsg">اكتب بريده كاملًا. لا يظهر البريد لأحد، يظهر الاسم والبيت فقط.</div><div id="ardFound"></div>` : `<p class="k">سجّل الدخول لتبحث عن أصحابك ببريدهم.</p>`}</div>`;
      // الأحياء
      h += `<p class="sec">الأحياء</p>`;
      if (!S.countries.length) h += `<div class="card empty">لم يسكن أحد الأرض بعد. ${signed ? "اختر بلدك وكن أول الساكنين!" : ""}</div>`;
      else {
        h += `<div class="tabs" role="tablist">${S.countries.map(c => `<button class="chip ${c.country === S.sel ? "on" : ""}" data-c="${esc(c.country)}" role="tab" aria-selected="${c.country === S.sel}">${flag(c.country)} ${esc(NAME[c.country] || c.country)}<small>${AR(c.houses)}</small></button>`).join("")}</div>`;
        const info = S.countries.find(c => c.country === S.sel);
        if (info) h += `<p class="k" style="margin:0">حيّ ${esc(NAME[S.sel] || S.sel)}: ${AR(info.houses)} ${info.houses === 1 ? "بيت" : "بيوت"}، منها ${AR(info.built)} مكتملة.</p>`;
        if (S.houses === null) h += `<div class="card empty">جارٍ تحميل البيوت…</div>`;
        else if (S.houses === "err") h += `<div class="card empty">تعذّر تحميل بيوت هذا الحيّ.</div>`;
        else h += `<div class="street">${S.houses.map(x => `<div class="lot ${x.is_me ? "me" : ""} ${x.parts >= N ? "done" : ""}">${house(x.parts)}<b>${esc(x.display_name)}${x.is_me ? " (أنت)" : ""}</b><span>${x.parts >= N ? "بيت مكتمل" : AR(x.parts) + "/" + AR(N)}</span></div>`).join("")}</div>`;
      }
    }
    root.innerHTML = h + `</div>`;
    el("ardX").onclick = close;
    if (el("ardRe")) el("ardRe").onclick = open;
    if (el("ardCountry")) el("ardCountry").onclick = () => pickCountry(false);
    if (el("ardFind")) el("ardFind").onchange = async e => { const on = e.target.checked; try { await rpc("darb_set_findable", { p_on: on }); S.my.findable = on; } catch (_) { e.target.checked = !on; } };
    root.querySelectorAll(".tabs .chip").forEach(b => b.onclick = () => loadQuarter(b.dataset.c));
    if (el("ardSearch")) el("ardSearch").onsubmit = search;
  }

  async function search(ev) {
    ev.preventDefault();
    const q = el("ardEmail").value.trim(), msg = el("ardMsg"), out = el("ardFound");
    msg.className = "msg"; msg.textContent = "لحظة…"; out.innerHTML = "";
    try {
      const r = (await rpc("darb_find_house", { p_email: q }) || [])[0];
      if (!r) { msg.textContent = "لم نجد بيتًا بهذا البريد. ربما لم يبدأ اللعب بعد، أو أخفى بيته عن البحث."; return; }
      msg.textContent = "";
      out.innerHTML = `<div class="found"><div>${house(r.parts)}</div><div><p class="big2">${esc(r.display_name)}</p>
        <p class="k"><b>${AR(r.parts)}</b> من ${AR(N)} أجزاء · ${r.parts >= N ? "بيت مكتمل" : "يبني الآن: " + PARTS[r.parts]}</p>
        ${r.country ? `<button class="chip" id="ardGoQ">${flag(r.country)} زر حيّ ${esc(NAME[r.country] || r.country)}</button>` : `<p class="k">لم يختر بلده بعد.</p>`}</div></div>`;
      if (el("ardGoQ")) el("ardGoQ").onclick = () => { loadQuarter(r.country); setTimeout(() => { const t = document.querySelector("#ard .street"); t && t.scrollIntoView({ behavior: "smooth", block: "start" }); }, 400); };
    } catch (e) { msg.className = "msg bad"; msg.textContent = "تعذّر البحث الآن. حاول بعد قليل."; }
  }

  function pickCountry(first) {
    if (el("ardPick")) return;
    const cur = S.my && S.my.country;
    const box = document.createElement("div"); box.id = "ardPick"; box.addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Escape") box.remove(); });
    box.innerHTML = `<div class="card" role="dialog" aria-modal="true" aria-labelledby="ardPickT"><h2 id="ardPickT">${first ? "من أي بلد أنت؟" : "غيّر حيّك"}</h2>
      <p>يُبنى بيتك في حيّ بلدك، بجوار طلبة العلم من بلدك.</p>
      <input type="search" id="ardPickQ" placeholder="ابحث عن بلد" autocomplete="off">
      <div class="list" id="ardPickL"></div><button class="x" id="ardPickX">${first ? "لاحقًا" : "إلغاء"}</button></div>`;
    document.body.appendChild(box);
    const draw = f => { el("ardPickL").innerHTML = COUNTRIES.filter(([c, n]) => !f || n.includes(f) || c.includes(f.toUpperCase())).map(([c, n]) => `<button data-c="${c}" class="${c === cur ? "on" : ""}">${flag(c)} ${n}</button>`).join(""); };
    draw("");
    if (matchMedia("(hover:hover)").matches) el("ardPickQ").focus();
    el("ardPickQ").oninput = e => draw(e.target.value.trim());
    el("ardPickX").onclick = () => box.remove();
    el("ardPickL").onclick = async e => {
      const b = e.target.closest("button"); if (!b) return;
      b.textContent = "لحظة…";
      try {
        await rpc("darb_set_country", { p_country: b.dataset.c });
        box.remove(); S.my.country = b.dataset.c;
        S.countries = await rpc("darb_land_countries") || S.countries;
        loadQuarter(b.dataset.c);
      } catch (_) { b.textContent = "تعذّر الحفظ، حاول مرة أخرى"; }
    };
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
    if (!me()) { if (!warned) { warned = true; toast(parts, "سجّل الدخول ليُحفظ بيتك", "أرض طلبة العلم"); } return; }
    if (S.my) S.my.parts = Math.max(S.my.parts, parts);
    toast(parts, parts >= N ? "اكتمل بيتك!" : "بنيت: " + PARTS[parts - 1], "أرض طلبة العلم · الجزء " + AR(parts) + " من " + AR(N));
  }
  function finish() { if (me() && sb()) rpc("darb_house_finish").then(n => { if (S.my) S.my.parts = n; }).catch(() => {}); }

  window.darbArd = { open, close, built, finish, house };
})();
