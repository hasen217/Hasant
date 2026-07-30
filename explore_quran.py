import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

print("File length:", len(content))
print("\n=== First 3000 chars ===")
print(content[:3000])