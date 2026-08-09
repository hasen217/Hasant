import json
with open('data/quran.json', encoding='utf-8') as f:
    data = json.load(f)

for surah in data['surahs']:
    if surah['number'] not in [1, 9]:
        ayah_text = surah['verses'][0]['arabic']
        if 'بِسْمِ' in ayah_text or '\u0628\u0650\u0633\u0652\u0645\u0650' in ayah_text:
            print(f"Surah {surah['number']} Ayah 1 still has Bismillah: {ayah_text.encode('unicode_escape').decode()[:100]}")
