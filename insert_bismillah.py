import re

BISMILLAH_ARABIC = "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"
BISMILLAH_TRANSLATION = "In the Name of Allah—the Most Compassionate, Most Merciful."

FILE_PATH = r'c:\xampp\htdocs\quize\index.html'

with open(FILE_PATH, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Detect line ending style
crlf = '\r\n' in lines[0]
eol = '\r\n' if crlf else '\n'

# Find all surah keys in QURAN_VERSES and record their line index and first verse line index
surah_entries = []  # list of (surah_number, key_line_index, first_verse_line_index, format_type, indent)

for i, line in enumerate(lines):
    m = re.match(r'(\s*)(\d+):\s*\[', line)
    if m:
        num = int(m.group(2))
        # Find the next non-empty, non-comment line (first verse)
        for j in range(i + 1, min(i + 5, len(lines))):
            vline = lines[j]
            stripped = vline.strip()
            if stripped and not stripped.startswith('//'):
                # Determine format
                has_quoted = '"arabic"' in stripped
                has_unquoted = re.search(r'\{ arabic:', stripped) is not None
                if has_quoted:
                    fmt = 'quoted'
                elif has_unquoted:
                    fmt = 'unquoted'
                else:
                    fmt = 'unknown'
                # Extract indentation of the first verse line
                indent = vline[:len(vline) - len(vline.lstrip())]
                surah_entries.append((num, i, j, fmt, indent))
                break

print(f"Found {len(surah_entries)} surah entries")
for entry in surah_entries:
    print(f"  Surah {entry[0]}: key_line={entry[1]+1}, first_verse_line={entry[2]+1}, format={entry[3]}, indent='{entry[4]}'")

# Build insertion lines (process in reverse order so line indices don't shift)
insertions = []  # list of (insert_after_line_index, new_line_content)

for num, key_idx, verse_idx, fmt, indent in surah_entries:
    # Skip Surah 9 (At-Tawbah)
    if num == 9:
        print(f"  Skipping Surah {num} (At-Tawbah)")
        continue

    # Build the Bismillah verse line in the matching format
    if fmt == 'quoted':
        bismillah_line = f'{indent}{{ "arabic": "{BISMILLAH_ARABIC}", "translation": "{BISMILLAH_TRANSLATION}" }},'
    elif fmt == 'unquoted':
        bismillah_line = f'{indent}{{ arabic: "{BISMILLAH_ARABIC}", translation: "{BISMILLAH_TRANSLATION}" }},'
    else:
        print(f"  WARNING: Unknown format for Surah {num}, skipping")
        continue

    # Insert after the key line (the `N: [` line), before the first verse
    insertions.append((key_idx, bismillah_line))

# Sort insertions in reverse order of line index to avoid shifting
insertions.sort(key=lambda x: x[0], reverse=True)

print(f"\nInserting {len(insertions)} Bismillah entries...")
for insert_idx, new_line in insertions:
    # Insert the new line after the key line
    lines.insert(insert_idx + 1, new_line + eol)

# Write back
with open(FILE_PATH, 'w', encoding='utf-8', newline='') as f:
    f.writelines(lines)

print("Done! Bismillah entries inserted successfully.")