import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

print("File length:", len(content))

# Search for common data structure patterns
patterns = [
    'surahs', 'surahData', 'quranData', 'quran', 'ayahs', 'verses',
    'Al-Anfal', 'Anfal', 'الأنفال', 'الانفال', 'أنفال',
    'number:', 'surahNumber', 'surah_number', 'id: 8',
    'fetchQuran', 'loadQuran', 'QURAN_DATA', 'quranVerses'
]

for p in patterns:
    idx = content.find(p)
    if idx != -1:
        print(f"\nFound '{p}' at index {idx}")
        print("Context:", content[max(0,idx-100):idx+200].replace('\n', ' '))