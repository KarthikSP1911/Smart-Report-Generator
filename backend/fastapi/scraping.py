import time
import json
import re
import os
import urllib3
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from bs4 import BeautifulSoup

# --- CONFIGURATION ---
BRAVE_PATH = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
JSON_STORAGE = "all_students_report.json"

def get_student_data(usn, day, month, year):
    """Scrapes the dashboard and returns the HTML source."""
    options = Options()
    options.binary_location = BRAVE_PATH
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    # Uncomment the line below once you are sure it works to run in background
    # options.add_argument("--headless") 

    driver = webdriver.Chrome(options=options)
    
    try:
        print(f"[*] Launching Brave for USN: {usn}...")
        driver.get("https://parents.msrit.edu/newparents/")
        
        # Fill Form
        driver.find_element(By.ID, "username").send_keys(usn)
        Select(driver.find_element(By.ID, "dd")).select_by_value(f"{day} ") 
        Select(driver.find_element(By.ID, "mm")).select_by_value(month)
        Select(driver.find_element(By.ID, "yyyy")).select_by_value(year)
        
        # Click Login
        login_btn = driver.find_element(By.CLASS_NAME, "cn-login-btn")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", login_btn)
        time.sleep(1)
        driver.execute_script("arguments[0].click();", login_btn)
        
        print("[*] Waiting for dashboard load...")
        time.sleep(8) 
        
        if "dashboard" in driver.current_url.lower() or "Logout" in driver.page_source:
            print("[+] Login Successful.")
            return driver.page_source
        else:
            print("[!] Login failed. Check credentials or site status.")
            return None

    except Exception as e:
        print(f"[X] Selenium Error: {e}")
        return None
    finally:
        driver.quit()

def parse_and_update_json(html_content):
    """Parses HTML and updates the local JSON database."""
    soup = BeautifulSoup(html_content, "html.parser")
    
    # 1. Header Info
    name = soup.find("h3").get_text(strip=True) if soup.find("h3") else "Unknown"
    usn = soup.find("h2").get_text(strip=True) if soup.find("h2") else "Unknown"
    class_info = soup.find("p").get_text(strip=True) if soup.find("p") else ""

    # 2. Subject Map
    subject_map = {}
    for row in soup.find_all("tr"):
        cols = row.find_all("td")
        if len(cols) >= 2:
            code = cols[0].get_text(strip=True)
            subj_name = cols[1].get_text(strip=True)
            if re.match(r"^[0-9A-Z]{5,8}$", code):
                subject_map[code] = subj_name

    # 3. CIE & Attendance (Regex from JS)
    cie_data, att_data = {}, {}
    pattern = r'\["([A-Z0-9]+)",\s*(\d+)\]'
    scripts = soup.find_all("script")
    for script in scripts:
        if script.string:
            if "#barPadding" in script.string:
                cie_data = {code: int(val) for code, val in re.findall(pattern, script.string)}
            if "#gaugeTypeMulti" in script.string:
                att_data = {code: int(val) for code, val in re.findall(pattern, script.string)}

    # 4. Build Record
    student_record = {
        "name": name,
        "class_details": class_info,
        "last_updated": time.strftime("%Y-%m-%d %H:%M:%S"),
        "subjects": [
            {
                "code": code,
                "name": s_name,
                "cie": cie_data.get(code, 0),
                "attendance": att_data.get(code, 0)
            } for code, s_name in subject_map.items()
        ]
    }

    # 5. Load and Save
    database = {}
    if os.path.exists(JSON_STORAGE):
        with open(JSON_STORAGE, "r") as f:
            try: database = json.load(f)
            except: pass

    database[usn] = student_record # Updates if USN exists, adds if new

    with open(JSON_STORAGE, "w") as f:
        json.dump(database, f, indent=4)
    
    print(f"[+] {JSON_STORAGE} updated for {name} ({usn})")

# --- EXECUTION ---
if __name__ == "__main__":
    # Input your credentials here
    USER_USN = "1MS23IS051"
    DD, MM, YYYY = "19", "11", "2004" # Month '10' for Oct

    html_result = get_student_data(USER_USN, DD, MM, YYYY)
    
    if html_result:
        parse_and_update_json(html_result)