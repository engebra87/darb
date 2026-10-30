// «درب المعلومات الإسلامية» — اللغات.
// يختار اللغة (المحفوظة، ثم لغة الجهاز)، ويحمّل قاموسها، ويترجم نصوص الصفحة وهي تتغيّر.
// العربية هي الأصل: النصوص في الكود والأسئلة القادمة من الخادم عربية، وتُترجم عند العرض فقط،
// فيبقى الجواب المرسل للخادم بالعربية كما هو.
(function () {
  "use strict";
  var LANGS = [
    ["ar", "العربية", "rtl"], ["en", "English", "ltr"], ["fr", "Français", "ltr"], ["es", "Español", "ltr"],
    ["id", "Bahasa Indonesia", "ltr"], ["hi", "हिन्दी", "ltr"], ["ur", "اردو", "rtl"]
  ];
  var CODES = LANGS.map(function (x) { return x[0]; });
  var V = "3";

  function pick() {
    try { var s = localStorage.getItem("darb-lang"); if (CODES.indexOf(s) >= 0) return s; } catch (e) {}
    var ls = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "ar"];
    for (var i = 0; i < ls.length; i++) {
      var c = String(ls[i]).slice(0, 2).toLowerCase(); if (c === "in") c = "id";
      if (CODES.indexOf(c) >= 0) return c;
    }
    return "en";
  }
  var L = pick(), META = LANGS.filter(function (x) { return x[0] === L; })[0];
  window.__L = L; window.__dir = META[2];
  // خط اللافتات المرسومة في المشهد ثلاثي الأبعاد
  window.__canvasFont = { hi: "'Noto Sans Devanagari','Reem Kufi',sans-serif", ur: "'Noto Naskh Arabic',Tahoma,sans-serif" }[L] || "'Reem Kufi','IBM Plex Sans Arabic',Tahoma,sans-serif";
  window.__langName = function () { return META[1]; };
  var root = document.documentElement;
  root.lang = L; root.dir = META[2]; root.classList.add("lang-" + L);

  // خطوط اللغات التي لا يغطيها خط اللعبة
  var FONT = { hi: "Noto+Sans+Devanagari:wght@500;600;700", ur: "Noto+Naskh+Arabic:wght@500;600;700" }[L];
  if (FONT) document.write('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=' + FONT + '&display=swap">');
  var css = ""
    + "html[dir=ltr] .hud,html[dir=ltr] .banner,html[dir=ltr] .say,html[dir=ltr] .great,html[dir=ltr] .sheet,html[dir=ltr] .screen,html[dir=ltr] .loading,"
    + "html[dir=ltr] #ard,html[dir=ltr] .ardBuilt,html[dir=ltr] #ardDel,html[dir=ltr] #langPick,html[dir=ltr] #demoTag{direction:ltr}"
    + "html[dir=ltr] #ardX{transform:scaleX(-1)}html[dir=ltr] #ard .qs button{text-align:left}html[dir=ltr] .form{text-align:left}html[dir=ltr] .form input.ar{direction:ltr;text-align:left}"
    + "html.lang-hi{--f-ui:'Noto Sans Devanagari','IBM Plex Sans Arabic',sans-serif;--f-display:'Noto Sans Devanagari','Reem Kufi',sans-serif}"
    + "html.lang-ur{--f-ui:'Noto Naskh Arabic','IBM Plex Sans Arabic',Tahoma,sans-serif;--f-display:'Noto Naskh Arabic',Tahoma,serif}"
    + "#langPick{position:fixed;inset:0;z-index:40;background:rgba(8,5,10,.75);display:grid;place-items:center;padding:16px}"
    + "#langPick .box{width:min(380px,100%);background:#1f1622;border:2px solid #f0b44c;border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:8px}"
    + "#langPick button{background:rgba(255,255,255,.06);border:1.5px solid #5a4636;color:#f7f0e4;border-radius:12px;padding:12px;font:600 17px 'IBM Plex Sans Arabic','Noto Sans Devanagari',Tahoma,sans-serif;cursor:pointer}"
    + "#langPick button.on{border-color:#f0b44c;color:#f0b44c}#langPick button:focus-visible{outline:2px solid #f0b44c;outline-offset:2px}";
  document.write("<style>" + css + "</style>");
  if (L !== "ar") {
    if (window.__TALL) { window.__T = __TALL[L]; window.__TP = __TPALL[L]; }
    else document.write('<script src="lang/keys.js?v=' + V + '"><\/script><script src="lang/' + L + '.js?v=' + V + '"><\/script>');
  }

  // ——— القاموس ———
  var AD = "٠١٢٣٤٥٦٧٨٩";
  function latin(s) { return String(s).replace(/[٠-٩]/g, function (d) { return AD.indexOf(d); }); }
  function norm(s) { return latin(s).replace(/\s+/g, " ").trim(); }
  function fill(s, v) { return v ? String(s).replace(/\{(\w+)\}/g, function (m, k) { return k in v ? v[k] : m; }) : String(s); }
  var D = null, P = [];
  function build() {
    if (D || L === "ar" || !window.__K || !window.__T) return !!D;
    D = new Map();
    for (var i = 0; i < __K.length; i++) if (__T[i]) D.set(norm(__K[i]), __T[i]);
    P = (window.__KP || []).map(function (re, i) { return [new RegExp(re, "u"), (window.__TP || [])[i]]; }).filter(function (x) { return x[1]; });
    return true;
  }
  function exact(k) {
    if (D.has(k)) return D.get(k);
    for (var i = 0; i < P.length; i++) {
      var m = k.match(P[i][0]);
      if (m) return P[i][1].replace(/\{(t?)(\d)\}/g, function (x, tt, n) { var g = m[+n] || ""; if (!tt) return g; var r = exact(g); return r == null ? g : r; });
    }
    return null;
  }
  function look(s) {
    var k = norm(s); if (!k) return null;
    var r = exact(k); if (r != null) return r;
    var m = k.match(/^([^\p{L}\p{N}«]*)(.*?)([^\p{L}\p{N}»]*)$/u);         // رموز في الطرفين: 🏡 … ▾ ←
    if (m && (m[1] || m[3]) && m[2]) { r = exact(m[2]); if (r != null) return m[1] + r + m[3]; }
    if (k.indexOf(" · ") > 0) {                                              // أجزاء مفصولة بـ «·»
      var any = false, out = k.split(" · ").map(function (p) { var x = look(p); if (x != null) { any = true; return x; } return p; });
      if (any) return out.join(" · ");
    }
    return null;
  }
  window.__t = function (s, v) {
    if (L === "ar" || !build()) return fill(s, v);
    var r = look(s); return fill(r == null ? s : r, v);
  };

  // ——— ترجمة الصفحة وهي تتغيّر ———
  var HAS = /[؀-ۿ٠-٩]/;
  function tText(n) {
    var v = n.nodeValue; if (!v || !HAS.test(v)) return;
    var p = n.parentNode; if (p && (p.nodeName === "SCRIPT" || p.nodeName === "STYLE" || p.closest && p.closest("[data-noi18n]"))) return;
    var r = look(v), out = r == null ? v : (v.match(/^\s*/)[0] + r + v.match(/\s*$/)[0]);
    out = latin(out); if (out !== v) n.nodeValue = out;
  }
  var ATTRS = ["aria-label", "placeholder", "title", "alt"];
  function tEl(el) {
    if (el.nodeType === 3) return tText(el);
    if (el.nodeType !== 1 || el.nodeName === "SCRIPT" || el.nodeName === "STYLE") return;
    tAttrs(el);
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT), n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) tText(n); else tAttrs(n); }
  }
  function tAttrs(el) {
    ATTRS.forEach(function (a) {
      var v = el.getAttribute(a); if (!v || !HAS.test(v)) return;
      var r = look(v), out = latin(r == null ? v : r); if (out !== v) el.setAttribute(a, out);
    });
  }
  function start() {
    if (L === "ar" || !build()) return;
    var t = look(document.title); if (t) document.title = t;
    tEl(document.body);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        if (m.type === "characterData") tText(m.target);
        else if (m.type === "attributes") tAttrs(m.target);
        else m.addedNodes.forEach(tEl);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();

  // ——— اختيار اللغة ———
  window.__langPick = function () {
    if (document.getElementById("langPick")) return;
    var b = document.createElement("div"); b.id = "langPick"; b.setAttribute("role", "dialog"); b.setAttribute("aria-modal", "true");
    var box = document.createElement("div"); box.className = "box"; b.appendChild(box);
    LANGS.forEach(function (x) {
      var btn = document.createElement("button"); btn.type = "button"; btn.textContent = x[1]; btn.lang = x[0]; btn.dir = x[2];
      btn.setAttribute("data-noi18n", ""); if (x[0] === L) btn.className = "on";
      btn.onclick = function () { try { localStorage.setItem("darb-lang", x[0]); } catch (e) {} location.reload(); };
      box.appendChild(btn);
    });
    b.addEventListener("pointerdown", function (e) { if (e.target === b) b.remove(); });
    b.addEventListener("keydown", function (e) { e.stopPropagation(); if (e.key === "Escape") b.remove(); });
    document.body.appendChild(b); box.firstChild.focus();
  };
})();
