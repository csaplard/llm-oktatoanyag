"""Inline learning components into both offline-capable HTML editions."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
MODULES = ['labs-core.js', 'labs-foundations.js', 'labs-advanced.js', 'learning-path.js']

def build():
    css = (ROOT / 'src/learning.css').read_text()
    js = '\n'.join((ROOT / 'src' / name).read_text() for name in MODULES)
    js += '\nwindow.KatedraLabs.boot();\n'
    assert '</script' not in js.lower(), 'Source must not close its inline script'
    for name in ['index.html', 'en/index.html']:
        path = ROOT / name
        html = path.read_text()
        html = re.sub(r'\n?<!-- LEARNING-CSS:START -->.*?<!-- LEARNING-CSS:END -->\n?', '', html, flags=re.S)
        html = re.sub(r'\n?<!-- LEARNING-JS:START -->.*?<!-- LEARNING-JS:END -->\n?', '', html, flags=re.S)
        html = html.replace('</head>', '\n<!-- LEARNING-CSS:START -->\n<style>\n' + css + '\n</style>\n<!-- LEARNING-CSS:END -->\n</head>')
        html = html.replace('</body>', '\n<!-- LEARNING-JS:START -->\n<script>\n' + js + '\n</script>\n<!-- LEARNING-JS:END -->\n</body>')
        path.write_text(html)
        print(f'{name}: {len(html.encode()):,} bytes; 14 interactive labs bundled')

if __name__ == '__main__':
    build()
