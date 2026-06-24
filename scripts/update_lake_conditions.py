import json
import re
from datetime import datetime, timezone

import requests
from playwright.sync_api import sync_playwright

KRMS_URL = "https://www.krmsradio.com/watertemp/wx.html"
AMEREN_URL = "https://www.ameren.com/reliability/generation/hydro/reports/osage/headwatertailwater"


def get_water_temp():
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/137.0 Safari/537.36"
        )
    }

    try:
        response = requests.get(
            KRMS_URL,
            headers=headers,
            timeout=30
        )

        response.raise_for_status()

        html = response.text

        m = re.search(
            r"Water Temperature.*?<b>\s*([0-9.]+)",
            html,
            re.I | re.S,
        )

        if not m:
            raise Exception("Could not find water temperature")

        return round(float(m.group(1)))

    except Exception as e:
        print(f"WARNING: Water temperature lookup failed: {e}")
        return None


def get_ameren_data():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        page = browser.new_page()

        page.goto(AMEREN_URL, wait_until="networkidle")

        page.wait_for_selector(".water_level_report_grid", timeout=30000)

        first_row = page.locator(
            ".water_level_report_grid tbody tr"
        ).first

        cells = first_row.locator("td").all_text_contents()

        browser.close()

    lake_level = float(cells[2].strip())
    discharge = float(cells[4].replace(",", "").strip())

    return lake_level, round(discharge / 1000)


def calculate_trend(current_level):
    try:
        with open("lake_conditions.json", "r", encoding="utf-8") as f:
            previous = json.load(f)

        previous_level = float(previous["lakeLevel"])

        if current_level > previous_level + 0.05:
            return "up"

        if current_level < previous_level - 0.05:
            return "down"

        return "flat"

    except Exception:
        return "flat"


lake_level, discharge = get_ameren_data()
trend = calculate_trend(lake_level)

water_temp = get_water_temp()

if water_temp is None:
    try:
        with open("lake_conditions.json", "r", encoding="utf-8") as f:
            previous = json.load(f)

        water_temp = previous.get("waterTemp")
        print(f"Using previous water temperature: {water_temp}")

    except Exception:
        water_temp = "--"

data = {
    "updated": datetime.now(timezone.utc).isoformat(),
    "waterTemp": water_temp,
    "lakeLevel": round(lake_level, 2),
    "discharge": discharge,
    "trend": trend,
}

with open("lake_conditions.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print(json.dumps(data, indent=2))
