"""Inline learning components into both offline-capable HTML editions.

The source modules are bilingual: every user-facing string exists as a
Hungarian/English pair. Each edition only needs one language, so the build
blanks the other half of every pair (the call structure stays intact, and
the runtime picks the remaining value exactly as before). This keeps the
English edition free of Hungarian text and the Hungarian one free of English.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
MODULES = ['labs-core.js', 'labs-foundations.js', 'labs-advanced.js', 'learning-path.js']

# Bilingual helpers: name -> (index of the hu argument, index of the en
# argument, exact argument count). The count guards against same-named
# functions with a different meaning.
PAIR_CALLS = {'L': (0, 1, 2), 'bi': (0, 1, 2), 't': (0, 1, 2),
              'range': (1, 2, 7), 'check': (1, 2, 4), 'link': (1, 2, 3)}
# learning-path.js keeps its texts as ['hu', 'en'] array pairs.
PAIR_ARRAY_MODULES = {'learning-path.js'}
STRING_ONLY = re.compile(r"\s*(?:'(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\")\s*$", re.S)
IDENT = re.compile(r'[A-Za-z0-9_$]')
REGEX_BEFORE = set('(,=:[!&|?{};+-*%<>~^')


def _skip_string(src, i):
    q = src[i]
    i += 1
    while src[i] != q:
        i += 2 if src[i] == '\\' else 1
    return i + 1


def _skip_template(src, i, edits=None, keep=None, arrays=False):
    i += 1
    while src[i] != '`':
        if src[i] == '\\':
            i += 2
        elif src.startswith('${', i):
            i = _scan(src, i + 2, '}', edits, keep, arrays)[0] + 1
        else:
            i += 1
    return i + 1


def _skip_regex(src, i):
    i += 1
    in_class = False
    while True:
        c = src[i]
        if c == '\\':
            i += 2
            continue
        if c == '[':
            in_class = True
        elif c == ']':
            in_class = False
        elif c == '/' and not in_class:
            i += 1
            break
        i += 1
    while i < len(src) and src[i].isalpha():
        i += 1
    return i


def _prev_sig(src, i):
    j = i - 1
    while j >= 0 and src[j].isspace():
        j -= 1
    return src[j] if j >= 0 else ''


def _scan(src, i, close, edits=None, keep=None, arrays=False):
    """Scan code from i until the unmatched `close` character.

    Returns (index of close, list of top-level (start, end) comma-separated
    segments). When `edits` is given, collects blanking edits on the way."""
    seg_start, segments = i, []
    while True:
        c = src[i]
        if c in '\'"':
            i = _skip_string(src, i)
            continue
        if c == '`':
            i = _skip_template(src, i, edits, keep, arrays)
            continue
        if src.startswith('//', i):
            i = src.index('\n', i)
            continue
        if src.startswith('/*', i):
            i = src.index('*/', i) + 2
            continue
        if c == '/' and _prev_sig(src, i) in REGEX_BEFORE:
            i = _skip_regex(src, i)
            continue
        if c == close:
            segments.append((seg_start, i))
            return i, segments
        if c == ',':
            segments.append((seg_start, i))
            seg_start = i + 1
            i += 1
            continue
        if c in '([{':
            opener = c
            j, inner = _scan(src, i + 1, {'(': ')', '[': ']', '{': '}'}[c], edits, keep, arrays)
            if edits is not None:
                if opener == '(':
                    name_end = i
                    k = name_end - 1
                    while k >= 0 and IDENT.match(src[k]):
                        k -= 1
                    name = src[k + 1:name_end]
                    before = src[k] if k >= 0 else ''
                    declared = re.search(r'\bfunction\s*$', src[max(0, k - 12):k + 1])
                    spec = PAIR_CALLS.get(name)
                    if spec and before != '.' and not declared and len(inner) == spec[2]:
                        edits.append(inner[spec[1]] if keep == 'hu' else inner[spec[0]])
                elif opener == '{':
                    props = {}
                    for s, e in inner:
                        m = re.match(r'\s*(hu|en)\s*:', src[s:e])
                        if m:
                            props[m.group(1)] = (s + m.end(), e)
                    if 'hu' in props and 'en' in props:
                        edits.append(props['en' if keep == 'hu' else 'hu'])
                elif opener == '[' and arrays and len(inner) == 2 \
                        and all(STRING_ONLY.match(src[a:b]) for a, b in inner):
                    edits.append(inner[1] if keep == 'hu' else inner[0])
            i = j + 1
            continue
        i += 1


def single_language(js, keep, arrays=False):
    """Blank the other language in every bilingual pair of `js`."""
    edits = []
    _scan(js + '\x00', 0, '\x00', edits, keep, arrays)
    for s, e in sorted(set(edits), reverse=True):
        seg = js[s:e]
        if not seg.strip():
            continue
        lead = seg[:len(seg) - len(seg.lstrip())]
        trail = seg[len(seg.rstrip()):]
        js = js[:s] + lead + "''" + trail + js[e:]
    return js


def build(check=False):
    """Write both editions, or with check=True only report the stale ones."""
    stale = []
    css = (ROOT / 'src/learning.css').read_text(encoding='utf-8')
    sources = [(name, (ROOT / 'src' / name).read_text(encoding='utf-8')) for name in MODULES]
    assert all('</script' not in text.lower() for _, text in sources), 'Source must not close its inline script'
    for name, lang in [('index.html', 'hu'), ('en/index.html', 'en')]:
        path = ROOT / name
        html = original = path.read_text(encoding='utf-8')
        html = re.sub(r'\n?<!-- LEARNING-CSS:START -->.*?<!-- LEARNING-CSS:END -->\n?', '', html, flags=re.S)
        html = re.sub(r'\n?<!-- LEARNING-JS:START -->.*?<!-- LEARNING-JS:END -->\n?', '', html, flags=re.S)
        bundle = '\n'.join(single_language(text, lang, name in PAIR_ARRAY_MODULES) for name, text in sources)
        bundle += '\nwindow.KatedraLabs.boot();\n'
        html = html.replace('</head>', '\n<!-- LEARNING-CSS:START -->\n<style>\n' + css + '\n</style>\n<!-- LEARNING-CSS:END -->\n</head>')
        html = html.replace('</body>', '\n<!-- LEARNING-JS:START -->\n<script>\n' + bundle + '\n</script>\n<!-- LEARNING-JS:END -->\n</body>')
        if check:
            if html != original:
                stale.append(name)
            continue
        path.write_text(html, encoding='utf-8', newline='\n')
        print(f'{name}: {len(html.encode()):,} bytes; 14 interactive labs bundled ({lang} only)')
    return stale


if __name__ == '__main__':
    import sys
    if '--check' in sys.argv:
        stale = build(check=True)
        print('stale: ' + ', '.join(stale) if stale else 'up to date')
        sys.exit(1 if stale else 0)
    build()
