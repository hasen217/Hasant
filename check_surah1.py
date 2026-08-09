import json

with open('data/quran.json', encoding='utf-8') as f:
    data = json.load(f)

print("Surah 1:")
for verse in data['surahs'][0]['verses']:
    print(f"Ayah {verse['number']}: {verse['arabic'].encode('unicode_escape').decode()}")
