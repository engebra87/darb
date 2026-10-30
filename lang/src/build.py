# يبني lang/keys.js (النصوص العربية) و lang/<code>.js (الترجمات) من ملفات المصدر.
# المصدر: keys.txt (سطر لكل نص عربي) و <code>.txt (سطر لكل ترجمة، بنفس الترتيب، "رقم|ترجمة").
# الأنماط: patterns.txt (تعبير عربي) و <code>.pat.txt (قالب الترجمة).
import json, os, re, sys
here = os.path.dirname(os.path.abspath(__file__))
out = os.path.dirname(here)

def lines(name):
    with open(os.path.join(here, name), encoding="utf-8") as f:
        return [l.rstrip("\n") for l in f if l.strip() and not l.startswith("#")]

keys = lines("keys.txt")
pats = lines("patterns.txt")
assert len(set(keys)) == len(keys), [k for k in keys if keys.count(k) > 1][:5]
with open(os.path.join(out, "keys.js"), "w", encoding="utf-8") as f:
    f.write("window.__K=" + json.dumps(keys, ensure_ascii=False) + ";\nwindow.__KP=" + json.dumps(pats, ensure_ascii=False) + ";\n")

ok = True
for code in sys.argv[1:]:
    tr = [""] * len(keys)
    for l in lines(code + ".txt"):
        n, _, t = l.partition("|")
        i = int(n)
        assert 0 <= i < len(keys), (code, n)
        tr[i] = t.strip()
    missing = [i for i, t in enumerate(tr) if not t]
    pt = lines(code + ".pat.txt") if os.path.exists(os.path.join(here, code + ".pat.txt")) else []
    assert len(pt) == len(pats), (code, "patterns", len(pt), len(pats))
    # كل متغيّر {x} في النص العربي يجب أن يبقى في الترجمة
    for i, (k, t) in enumerate(zip(keys, tr)):
        if t and sorted(re.findall(r"\{\w+\}", k)) != sorted(re.findall(r"\{\w+\}", t)):
            print(code, "placeholder mismatch", i, k, "=>", t); ok = False
        if t and k.count("<") != t.count("<"):
            print(code, "markup mismatch", i, k, "=>", t); ok = False
    with open(os.path.join(out, code + ".js"), "w", encoding="utf-8") as f:
        f.write("window.__T=" + json.dumps(tr, ensure_ascii=False) + ";\nwindow.__TP=" + json.dumps(pt, ensure_ascii=False) + ";\n")
    print(code, "translated", len(keys) - len(missing), "/", len(keys), "missing:", missing[:20])
sys.exit(0 if ok else 1)
