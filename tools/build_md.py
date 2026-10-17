#!/usr/bin/env python3
"""Generate slides/NN-*.md from index.html (single source of truth).

Usage: python3 tools/build_md.py
"""
import re
import textwrap
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "index.html"
OUT = ROOT / "slides"
SITE = "https://ftonita.github.io/ansible-linux-practice/"

SLUGS = [
    "title", "why", "declarative", "module", "idempotency", "catalog",
    "example-os-firewall", "example-users-ssh", "example-nginx", "handlers", "example-postgresql",
    "example-docker", "roles", "collections", "iac", "summary",
]
LANG = {"yaml": "yaml", "bash": "bash", "conf": "nginx", "tree": "text", "text": "text"}


def inline(el):
    """Element -> inline markdown (bold, code, emphasis)."""
    if isinstance(el, NavigableString):
        return str(el)
    if not isinstance(el, Tag):
        return ""
    if el.name == "code":
        return "`" + el.get_text() + "`"
    if el.name == "br":
        return " "
    inner = "".join(inline(c) for c in el.children)
    if el.name in ("b", "strong"):
        return "**" + inner.strip() + "**" if inner.strip() else inner
    if el.name in ("i", "em"):
        return "*" + inner.strip() + "*" if inner.strip() else inner
    if el.name == "a":
        return f"[{inner.strip()}]({el.get('href')})"
    return inner


def text(el):
    return re.sub(r"\s+", " ", inline(el)).strip()


def code_block(sc):
    lines = textwrap.dedent(sc.string or "").strip("\n").split("\n")
    lines = [l for l in lines if not re.match(r"^\s*#@\S+\s*$", l)]
    body = textwrap.dedent("\n".join(lines)).strip("\n")
    title = sc.get("data-title", "")
    lang = LANG.get(sc.get("data-lang", "yaml"), "")
    head = f"**`{title}`**\n\n" if title else ""
    return f"{head}```{lang}\n{body}\n```"


class Walker:
    def __init__(self):
        self.out, self.ents = [], []

    def flush(self):
        if self.ents:
            rows = "\n".join(f"| {a} | {b} |" for a, b in self.ents)
            self.out.append("| Сущность | Что это и зачем |\n|---|---|\n" + rows)
            self.ents = []

    def emit(self, s):
        self.flush()
        if s.strip():
            self.out.append(s)

    def walk(self, node):
        for el in node.children:
            if not isinstance(el, Tag):
                continue
            cls = el.get("class", [])
            if el.name == "aside" or "hint" in cls or "sh" in cls:
                continue
            if el.name == "script" and el.get("type") == "text/x-code":
                self.emit(code_block(el))
            elif "ent" in cls:
                t = el.select_one(".et")
                d = el.select_one(".ed")
                if t:
                    self.ents.append((text(t), text(d) if d else ""))
            elif "analogy" in cls:
                body = el.find("div")
                lab = body.select_one(".al")
                if lab:
                    lab.extract()
                self.emit(f"> 💡 **Аналогия.** {text(body)}")
            elif "callout" in cls:
                if not text(el):
                    continue
                self.emit(f"> [!NOTE]\n> {text(el)}")
            elif "md-p" in cls or "punch" in cls or "thanks" in cls:
                self.emit(text(el))
            elif "agenda" in cls:
                self.emit("\n".join(f"{i}. {c.get_text().replace(c.find('b').get_text(), '', 1).strip()}"
                                    for i, c in enumerate(el.find_all('span', recursive=False), 1)))
            elif "anal3" in cls:
                self.emit("\n".join(f"- **{' '.join(x.get_text() for x in a.select('.ah span'))}** — {text(a.find('p'))}"
                                    for a in el.select(".acard")))
            elif "lh" in cls:
                self.emit(f"#### {el.find('b').get_text()}")
            elif "md-list" in cls:
                items = [c for c in el.children if isinstance(c, Tag)]
                lines = []
                for c in items:
                    if c.get("class") and "ent" in c.get("class"):
                        lines.append(f"- **{text(c.select_one('.et'))}** — {text(c.select_one('.ed'))}")
                    elif c.name == "li":
                        lines.append("- " + text(c))
                    else:
                        ic = c.select_one(".pi, .ri, .ei")
                        bt = c.find("b")
                        sp = [x for x in c.find_all("span") if not x.find("b")]
                        desc = " ".join(text(x) for x in sp if x is not ic)
                        lines.append("- " + (text(ic) + " " if ic else "") + (f"**{bt.get_text().strip()}**" if bt else "") +
                                     (" — " + desc if desc else ""))
                self.emit("\n".join(lines))
            elif "vcard" in cls:
                h = el.select_one("h3")
                sm = el.select_one("small")
                big = el.select_one(".big")
                self.emit(f"### {text(big)} {text(h)}\n*{text(sm)}*")
                self.walk(el)
            elif "mode" in cls:
                self.emit(f"#### {text(el.select_one('.mi'))} {text(el.select_one('b'))}\n{text(el.select_one('span'))}")
            elif "fqcn" in cls:
                parts = el.select(".part")
                self.emit("`" + ".".join(text(p.find("code")).strip("`") for p in parts) + "`\n\n" +
                          "| Часть | Смысл |\n|---|---|\n" +
                          "\n".join(f"| `{text(p.find('code')).strip('`')}` | {text(p.find('small'))} |" for p in parts))
            elif "cats" in cls:
                self.emit("\n".join(f"- **{text(c.select_one('.ch'))}**: " + ", ".join(text(x) for x in c.select('.chips code')) for c in el.select(".cat")))
            elif "rhouse" in cls:
                self.emit("\n".join(f"- `{r.find('b').get_text()}` — {text(r.find('span'))}" for r in el.select(".rb")))
            elif "qa" in cls:
                self.emit("\n\n".join(f"<details><summary><b>{text(f.select_one('.q'))}</b></summary>\n\n{text(f.select_one('.a'))}\n\n</details>" for f in el.select(".flip")))
            elif "flabel" in cls:
                sm = el.find("small")
                if sm:
                    sm = sm.extract()
                    self.ents.append((text(el), text(sm)))
                else:
                    self.emit(f"**{text(el)}**")
            elif any(k in cls for k in ("ctl", "file", "bulb-row", "seg", "hstate", "track", "card", "outs", "arrow-d", "house", "link", "big-num")) and "md-list" not in cls:
                if "big-num" in cls:
                    self.walk(el)
                if "outs" in cls:
                    self.emit("Результат: " + " · ".join(f"`{text(s)}`" for s in el.select(".status")))
                continue
            elif "box-mod" in cls:
                self.emit(f"**Внутри модуля `{text(el.select_one('.bl'))}`:**\n" +
                          "\n".join(f"{i}. **{d.find('b').get_text()}** {d.get_text().split(d.find('b').get_text(), 1)[-1].strip()}"
                                    for i, d in enumerate(el.select('.steps3 > div'), 1)))
            elif "gate-wrap" in cls:
                self.emit(f"**{text(el.select_one('.flabel'))}**: открыто " +
                          ", ".join(text(g.find('b')) + " (" + text(g).replace(text(g.find('b')), '').strip() + ")" for g in el.select('.gate.open')) +
                          "; остальное закрыто. " + text(el.select_one('.ed')))
            elif "tpl-flow" in cls:
                for m in el.select(".mini"):
                    self.emit(f"**`{text(m.select_one('.mh'))}`**\n\n```nginx\n{m.find('pre').get_text()}\n```")
            elif el.name == "h3":
                self.emit("### " + text(el))
            else:
                self.walk(el)
        return self


def main():
    soup = BeautifulSoup(SRC.read_text(encoding="utf-8"), "html.parser")
    sections = soup.select("main#deck > section")
    for old in OUT.glob("*.md"):
        old.unlink()
    OUT.mkdir(exist_ok=True)
    names = [f"{i:02d}-{SLUGS[i-1]}.md" for i in range(1, len(sections) + 1)]
    for i, sec in enumerate(sections, 1):
        kick = sec.select_one(".kicker")
        for n in kick.select(".n"):
            n.extract()
        title_el = sec.select_one("h1, h2")
        lede = sec.select_one(".sh .lede")
        md = [f"<sub>{text(kick).upper()} · слайд {i} из {len(sections)}</sub>",
              f"# {text(title_el) if title_el else sec['data-title']}"]
        if lede:
            md.append(text(lede))
        w = Walker(); w.walk(sec); w.flush()
        md += w.out
        notes = sec.select_one("aside.notes")
        if notes:
            md.append("<details><summary>🎤 Заметки лектора</summary>\n\n" +
                      "\n\n".join(text(p) for p in notes.find_all("p")) + "\n\n</details>")
        prev = f"[⬅️ Назад]({names[i-2]})" if i > 1 else ""
        nxt = f"[Далее ➡️]({names[i]})" if i < len(sections) else "[🏠 К началу](01-title.md)"
        nav = " · ".join(x for x in (prev, f"[▶️ Интерактивная версия]({SITE}#{i})", nxt) if x)
        md.append(f"---\n\n<div align=\"center\">\n\n{nav}\n\n</div>")
        (OUT / names[i - 1]).write_text("\n\n".join(md).rstrip() + "\n", encoding="utf-8")
    print(f"wrote {len(sections)} slides to {OUT}")


if __name__ == "__main__":
    main()
