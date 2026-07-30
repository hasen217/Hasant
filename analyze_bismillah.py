import re

with open(r'c:\xampp\htdocs\quize\index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find all surah keys and check the format of the first verse
for i, line in enumerate(lines):
    m = re.match(r'\s*(\d+):\s*\[', line)
    if m:
        num = int(m.group(1))
        # Get the next non-empty, non-comment line (first verse)
        for j in range(i+1, min(i+5, len(lines))):
            vline = lines[j].strip()
            if vline and not vline.startswith('//'):
                # Check format: quoted keys or unquoted keys
                has_quoted = '"arabic"' in vline
                has_unquoted = re.search(r'\{ arabic:', vline) is not None
                fmt = 'quoted' if has_quoted else ('unquoted' if has_unquoted else 'unknown')
                print(f'Surah {num}: format={fmt}, line={vline[:80]}')
                break