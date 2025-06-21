import json

with open("src/constants/telangana_structure.json", "r", encoding="utf8") as f:
    data = json.load(f)

converted = []
for district in data["Telangana"]:
    mandals = [{"mandal": m, "villages": []} for m in district["mandals"]]
    converted.append({"district": district["district"], "mandals": mandals})

with open("src/constants/telangana_structure.json", "w", encoding="utf8") as f:
    json.dump(converted, f, ensure_ascii=False, indent=2) 