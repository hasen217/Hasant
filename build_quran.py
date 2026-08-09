import urllib.request
import json
import os

def fetch_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())

print("Fetching Arabic...")
arabic = fetch_json("https://api.alquran.cloud/v1/quran/quran-uthmani")
print("Fetching English...")
english = fetch_json("https://api.alquran.cloud/v1/quran/en.asad")
print("Fetching Urdu...")
urdu = fetch_json("https://api.alquran.cloud/v1/quran/ur.jalandhry")

print("Merging data...")
quran_data = {"surahs": []}

for i in range(114):
    surah_ar = arabic['data']['surahs'][i]
    surah_en = english['data']['surahs'][i]
    surah_ur = urdu['data']['surahs'][i]
    
    surah_obj = {
        "number": surah_ar['number'],
        "name": surah_en['englishName'],
        "arabicName": surah_ar['name'],
        "verses": []
    }
    
    for j in range(len(surah_ar['ayahs'])):
        ayah_ar = surah_ar['ayahs'][j]
        ayah_en = surah_en['ayahs'][j]
        ayah_ur = surah_ur['ayahs'][j]
        
        surah_obj['verses'].append({
            "number": ayah_ar['numberInSurah'],
            "arabic": ayah_ar['text'],
            "translations": {
                "english": ayah_en['text'],
                "urdu": ayah_ur['text']
            }
        })
        
    quran_data['surahs'].append(surah_obj)

os.makedirs('data', exist_ok=True)
with open('data/quran.json', 'w', encoding='utf-8') as f:
    json.dump(quran_data, f, ensure_ascii=False, indent=2)

print("quran.json created successfully!")
