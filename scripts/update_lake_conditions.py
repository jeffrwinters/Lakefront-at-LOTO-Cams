import json
import re
from datetime import datetime, timezone

import requests

KRMS_URL = "https://www.krmsradio.com/watertemp/wx.html"
NOAA_STAGEFLOW_URL = "https://api.water.noaa.gov/nwps/v1/gauges/LKSM7/stageflow/observed"
USGS_LATEST_URL = "https://api.waterdata.usgs.gov/ogcapi/v0/collections/latest-continuous/items"

HEADERS = {
    "User-Agent": (
        "Lakefront-at-LOTO/1.0 "
        "(https://lakefrontatloto.com; lake conditions updater)"
    ),
    "Accept": "application/json,text/html;q=0.9,*/*;q=0.8",
}


def load_previous():
    try:
        with open("lake_conditions.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"WARNING: Could not load previous lake conditions: {e}")
        return {}


def request(url, *, params=None, timeout=20):
    last_error = None

    for attempt in range(1, 4):
        try:
            response = requests.get(
                url,
                params=params,
                headers=HEADERS,
                timeout=timeout,
            )
            response.raise_for_status()
            return response
        except requests.RequestException as e:
            last_error = e
            print(f"WARNING: Request attempt {attempt}/3 failed for {url}: {e}")

    raise last_error


def get_water_temp():
    try:
        response = request(KRMS_URL)
        html = response.text

        match = re.search(
            r"Water Temperature.*?<b>\s*([0-9.]+)",
            html,
            re.I | re.S,
        )

        if not match:
            raise ValueError("Could not find water temperature in KRMS response")

        return round(float(match.group(1)))
    except Exception as e:
        print(f"WARNING: Water temperature lookup failed: {e}")
        return None


def find_pool_observation(value):
    """Find the NWPS observed block whose primary value is lake pool elevation."""
    if isinstance(value, dict):
        primary_name = str(value.get("primaryName", "")).lower()
        primary_units = str(value.get("primaryUnits", "")).lower()
        data = value.get("data")

        if (
            isinstance(data, list)
            and data
            and ("pool" in primary_name or "elevation" in primary_name)
            and primary_units in {"ft", "feet"}
        ):
            return value

        for child in value.values():
            found = find_pool_observation(child)
            if found:
                return found

    elif isinstance(value, list):
        for child in value:
            found = find_pool_observation(child)
            if found:
                return found

    return None


def get_lake_level():
    try:
        response = request(NOAA_STAGEFLOW_URL)
        payload = response.json()
        observation = find_pool_observation(payload)

        if not observation:
            raise ValueError("NWPS response did not include a Pool observation in feet")

        valid_points = [
            point
            for point in observation.get("data", [])
            if point.get("primary") not in (None, "", -999, -999.0)
        ]

        if not valid_points:
            raise ValueError("NWPS Pool observation contained no usable values")

        latest = max(
            valid_points,
            key=lambda point: point.get("validTime", ""),
        )

        return round(float(latest["primary"]), 2)
    except Exception as e:
        print(f"WARNING: Lake level lookup failed: {e}")
        return None


def get_discharge():
    try:
        response = request(
            USGS_LATEST_URL,
            params={
                "f": "json",
                "monitoring_location_id": "USGS-06926000",
                "parameter_code": "00060",
                "limit": 20,
            },
        )
        payload = response.json()
        candidates = []

        for feature in payload.get("features", []):
            properties = feature.get("properties", {})

            if properties.get("parameter_code") != "00060":
                continue

            unit = str(properties.get("unit_of_measure", "")).lower()
            if unit not in {"ft^3/s", "ft3/s", "cfs"}:
                continue

            try:
                value = float(properties["value"])
            except (KeyError, TypeError, ValueError):
                continue

            candidates.append((properties.get("time", ""), value))

        if not candidates:
            raise ValueError("USGS response contained no usable discharge value")

        _, discharge_cfs = max(candidates, key=lambda item: item[0])

        return round(discharge_cfs / 1000)
    except Exception as e:
        print(f"WARNING: Discharge lookup failed: {e}")
        return None


def calculate_trend(current_level, previous):
    try:
        previous_level = float(previous["lakeLevel"])

        if current_level > previous_level + 0.05:
            return "up"

        if current_level < previous_level - 0.05:
            return "down"

        return "flat"
    except Exception:
        return "flat"


def cached_value(previous, key, label):
    value = previous.get(key)

    if value is not None:
        print(f"Using previous {label}: {value}")
        return value

    print(f"WARNING: No previous {label} is available")
    return None


previous = load_previous()

lake_level = get_lake_level()
lake_level_fresh = lake_level is not None
if not lake_level_fresh:
    lake_level = cached_value(previous, "lakeLevel", "lake level")

discharge = get_discharge()
discharge_fresh = discharge is not None
if not discharge_fresh:
    discharge = cached_value(previous, "discharge", "discharge")

water_temp = get_water_temp()
water_temp_fresh = water_temp is not None
if not water_temp_fresh:
    water_temp = cached_value(previous, "waterTemp", "water temperature")

if lake_level is None and discharge is None and water_temp is None:
    raise RuntimeError("All lake-condition sources failed and no cached data exists")

if not any((lake_level_fresh, discharge_fresh, water_temp_fresh)):
    raise RuntimeError(
        "All lake-condition sources failed; preserving the existing JSON rather than "
        "marking cached values as newly updated"
    )

if lake_level_fresh:
    trend = calculate_trend(lake_level, previous)
else:
    trend = previous.get("trend", "flat")

data = {
    "updated": datetime.now(timezone.utc).isoformat(),
    "waterTemp": water_temp,
    "lakeLevel": lake_level,
    "discharge": discharge,
    "trend": trend,
    "sources": {
        "waterTemp": "krms" if water_temp_fresh else "cached",
        "lakeLevel": "noaa-nwps" if lake_level_fresh else "cached",
        "discharge": "usgs" if discharge_fresh else "cached",
    },
}

with open("lake_conditions.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print(json.dumps(data, indent=2))
