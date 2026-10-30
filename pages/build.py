# يبني صفحات الخصوصية و«عن اللعبة» وحذف الحساب بكل اللغات من pages/<lang>.html
# العربية: privacy.html … ، وبقية اللغات: privacy.en.html …
import os, re
here = os.path.dirname(os.path.abspath(__file__)); out = os.path.dirname(here)
LANGS = [("ar", "العربية", "rtl"), ("en", "English", "ltr"), ("fr", "Français", "ltr"), ("es", "Español", "ltr"),
         ("id", "Bahasa Indonesia", "ltr"), ("hi", "हिन्दी", "ltr"), ("ur", "اردو", "rtl")]
FONTS = {"hi": "&family=Noto+Sans+Devanagari:wght@400;600;700", "ur": "&family=Noto+Naskh+Arabic:wght@400;600;700"}
FAM = {"hi": "'Noto Sans Devanagari','IBM Plex Sans Arabic',sans-serif", "ur": "'Noto Naskh Arabic','IBM Plex Sans Arabic',Tahoma,sans-serif"}
fname = lambda page, code: f"{page}.html" if code == "ar" else f"{page}.{code}.html"

for code, name, d in LANGS:
    src = open(os.path.join(here, code + ".html"), encoding="utf-8").read()
    for part in re.split(r"<!--page:", src)[1:]:
        page, _, body = part.partition("-->")
        title = re.search(r"<title>(.*?)</title>", body).group(1)
        body = re.sub(r"<title>.*?</title>\n?", "", body).strip().replace("{delete}", fname("delete-account", code))
        nav = " · ".join(f'<a href="{fname(page, c)}" lang="{c}"' + (' aria-current="page"' if c == code else "") + f">{n}</a>" for c, n, _ in LANGS)
        extra = ""
        if code in FAM: extra = f"html,body,h1,h2{{font-family:{FAM[code]}}}"
        html = f"""<!doctype html>
<html lang="{code}" dir="{d}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<link rel="icon" href="icons/favicon-64.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600&family=Reem+Kufi:wght@600{FONTS.get(code, "")}&display=swap">
<link rel="stylesheet" href="page.css">
<style>.langs{{display:flex;flex-wrap:wrap;gap:4px 8px;font-size:13px;color:var(--muted);margin-bottom:18px}}.langs a{{color:var(--muted);text-decoration:none}}.langs a[aria-current]{{color:var(--lamp);font-weight:600}}{extra}</style>
</head>
<body>
<main>
<nav class="langs" aria-label="Language">{nav}</nav>
{body}
</main>
</body>
</html>
"""
        open(os.path.join(out, fname(page, code)), "w", encoding="utf-8").write(html)
        print("wrote", fname(page, code))
