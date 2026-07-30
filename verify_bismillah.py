import re

BISMILLAH_ARABIC = "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"

FILE_PATH = r'c:\xampp\htdocs\quize\index.html'
BAK_PATH = r'c:\xampp\htdocs\quize\index.html.bak'

with open(FILE_PATH, 'r', encoding='utf-8') as f:
    new_lines = f.readlines()

with open(BAK_PATH, 'r', encoding='utf-8') as f:
    old_lines = f.readlines()

print(f"Old file: {len(old_lines)} lines")
print(f"New file: {len(new_lines)} lines")
print(f"Difference: {len(new_lines) - len(old_lines)} lines added")

# Count Bismillah entries in new file
bismillah_count = 0
bismillah_lines = []
for i, line in enumerate(new_lines):
    if BISMILLAH_ARABIC in line:
        bismillah_count += 1
        bismillah_lines.append(i + 1)

print(f"\nBismillah entries in new file: {bismillah_count}")

# Count Bismillah entries in old file
old_bismillah_count = sum(1 for line in old_lines if BISMILLAH_ARABIC in line)
print(f"Bismillah entries in old file: {old_bismillah_count}")

# Find all surah keys in new file and check which have Bismillah as first verse
surah_status = []
for i, line in enumerate(new_lines):
    m = re.match(r'\s*(\d+):\s*\[', line)
    if m:
        num = int(m.group(1))
        # Check if next line has Bismillah
        if i + 1 < len(new_lines) and BISMILLAH_ARABIC in new_lines[i + 1]:
            surah_status.append((num, True, i + 1))
        else:
            surah_status.append((num, False, i + 1))

print(f"\nTotal surah entries found: {len(surah_status)}")
with_bismillah = [s for s in surah_status if s[1]]
without_bismillah = [s for s in surah_status if not s[1]]

print(f"Surahs WITH Bismillah: {len(with_bismillah)}")
print(f"Surahs WITHOUT Bismillah: {len(without_bismillah)}")
print(f"Surahs without Bismillah: {[s[0] for s in without_bismillah]}")

# Verify that the only difference between old and new is the added Bismillah lines
# Compare line by line, skipping the inserted lines
print("\n--- Verifying no other content was changed ---")
old_idx = 0
new_idx = 0
mismatches = 0
max_mismatches_to_show = 10

while old_idx < len(old_lines) and new_idx < len(new_lines):
    old_line = old_lines[old_idx].rstrip('\r\n')
    new_line = new_lines[new_idx].rstrip('\r\n')
    
    if old_line == new_line:
        old_idx += 1
        new_idx += 1
    elif BISMILLAH_ARABIC in new_line:
        # This is an inserted Bismillah line, skip it in new
        new_idx += 1
    else:
        # Mismatch - something else was changed
        mismatches += 1
        if mismatches <= max_mismatches_to_show:
            print(f"  MISMATCH at old_line {old_idx+1}, new_line {new_idx+1}:")
            print(f"    OLD: {old_line[:120]}")
            print(f"    NEW: {new_line[:120]}")
        old_idx += 1
        new_idx += 1

if mismatches == 0:
    print("  SUCCESS: No unrelated content was changed!")
else:
    print(f"  WARNING: {mismatches} mismatches found (unrelated changes detected)")

print(f"\n--- Summary ---")
print(f"Lines added: {len(new_lines) - len(old_lines)}")
print(f"Bismillah entries added: {bismillah_count - old_bismillah_count}")
print(f"Surah 9 skipped: {9 in [s[0] for s in without_bismillah]}")