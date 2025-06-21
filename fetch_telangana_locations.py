import requests
from bs4 import BeautifulSoup
import json
import time

BASE_URL = "https://fmis.telangana.gov.in/MDM/Reports/DistManVillage.aspx"

def get_districts(session):
    r = session.get(BASE_URL)
    soup = BeautifulSoup(r.text, "html.parser")
    opts = soup.select("select#ddlDistrict option")[1:]  # skip default
    return [(opt["value"], opt.text.strip()) for opt in opts]

def get_mandals_and_villages(session, district_id):
    payload = {
        "__EVENTTARGET": "ddlDistrict",
        "__EVENTARGUMENT": "",
        "ddlDistrict": district_id,
        # You may need to add VIEWSTATE and other hidden fields here for the POST to work
    }
    r = session.post(BASE_URL, data=payload)
    soup = BeautifulSoup(r.text, "html.parser")
    mandals = []
    for opt in soup.select("#ddlMandal option")[1:]:
        m_id, m_name = opt["value"], opt.text.strip()
        # You may need to add another POST here to get villages for each mandal
        mandals.append({"id": m_id, "name": m_name, "villages": []})
    return mandals

def main():
    session = requests.Session()
    districts = get_districts(session)
    data = []
    for d_id, d_name in districts:
        print(f"Fetching {d_name}...")
        mandals = get_mandals_and_villages(session, d_id)
        data.append({"district": d_name, "mandals": mandals})
        time.sleep(1)  # polite
    with open("telangana_structure.json","w", encoding="utf8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
