import json
import urllib.request
import urllib.error
from collections import defaultdict
from datetime import datetime, timezone, timedelta

API_KEY = "IVY26-8E65AAA09A9A"
BASE_URL = "https://solve.ivy.homes"

# Fetch token
token = json.loads(urllib.request.urlopen(urllib.request.Request(
    BASE_URL + '/auth/login',
    data=json.dumps({"email": "demo1@ivy.homes", "password": "a2c8cc4418"}).encode(),
    headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
    method="POST"
)).read())["access_token"]

def fetch_all(ep):
    all_res = []
    offset = 0
    limit = 50
    while True:
        url = BASE_URL + ep + "?offset=" + str(offset) + "&limit=" + str(limit)
        req = urllib.request.Request(url, headers={
            "X-API-Key": API_KEY,
            "Authorization": "Bearer " + token
        })
        try:
            res = json.loads(urllib.request.urlopen(req).read())
        except:
            break
        r = res.get("results", [])
        if not r:
            break
        all_res.extend(r)
        if not res.get("has_more", True):
            break
        offset += len(r)
    return all_res

print("Fetching...", flush=True)
listings = fetch_all("/v1/listings")
rentals = fetch_all("/v1/rentals")
projects = fetch_all("/v1/projects")

# Q1
total_listing_records = len(listings)

# Q3
active_listings = sum(1 for l in listings if l.get("is_live"))

# Q4
corrupt = []
for l in listings:
    reasons = []
    ca = l.get("carpet_area", 0) or 0
    sba = l.get("super_built_up_area", 0) or 0
    if ca > 0 and sba > 0 and ca > sba:
        reasons.append("carpet>sba")
    fl = l.get("floor", 0) or 0
    tf = l.get("total_floors", 0) or 0
    if fl > 0 and tf > 0 and fl > tf:
        reasons.append("floor>total")
    price = l.get("price", 0) or 0
    if price <= 0:
        reasons.append("bad price")
    if reasons:
        corrupt.append(l["listing_id"])
corrupt.sort()

# Q9 Fake listings
contact_listings = defaultdict(list)
for l in listings:
    contact_listings[l.get("posted_by_contact", "")].append(l)

fakes = []
for c, llist in contact_listings.items():
    if len(llist) >= 10:
        unverified = [l for l in llist if not l.get("is_verified") and l.get("posted_by") in ("agent", "builder")]
        if len(unverified) >= 8:
            ids = [l["listing_id"] for l in llist]
            fakes.extend(ids)
fakes.sort()

# Q6
bhk2_live = [l for l in listings
    if l.get("is_live") and l.get("bedroom") == 2
    and l["listing_id"] not in corrupt
    and l["listing_id"] not in fakes
    and l.get("carpet_area", 0) > 0 and l.get("price", 0) > 0]
ppsf = [l["price"] / l["carpet_area"] for l in bhk2_live]
avg_ppsf = sum(ppsf) / len(ppsf) if ppsf else 0.0

# Q5
sohna = [r for r in rentals if "sohna" in r.get("locality", "").lower()]
total_rent = sum(r.get("price", 0) for r in sohna)

# Q7
costliest = max(projects, key=lambda x: x.get("price_max", 0))
costliest_proj = {
    "project_id": costliest["project_id"],
    "price_max_inr": costliest["price_max"] * 10000000
}

# Q8
ref = datetime(2026, 9, 10, 0, 0, 0, tzinfo=timezone(timedelta(hours=5, minutes=30)))
seven_before = ref - timedelta(days=7)
last7 = 0
for l in listings:
    pat = l.get("posted_at")
    if not pat: continue
    try:
        if pat.endswith("Z"):
            dt = datetime.fromisoformat(pat.replace("Z", "+00:00"))
        elif "+" in pat[10:] or "-" in pat[19:]:
            dt = datetime.fromisoformat(pat)
        else:
            dt = datetime.fromisoformat(pat)
            dt = dt.replace(tzinfo=timezone(timedelta(hours=5, minutes=30)))
        if seven_before <= dt < ref:
            last7 += 1
    except:
        pass

# Q10
wrong_count = 0
for pr in projects:
    pid = pr["project_id"]
    claimed = pr.get("total_listings", 0)
    actual = sum(1 for l in listings if l.get("project_id") == pid)
    if claimed != actual:
        wrong_count += 1

# Cross site duplicates
prop_key4 = defaultdict(list)
for l in listings:
    key = (
        l.get("apartment_name", "").lower().strip(),
        l.get("locality", "").lower().strip(),
        l.get("property_type", "").lower().strip(),
        l.get("bedroom"),
        l.get("bathroom"),
        l.get("floor"),
        l.get("carpet_area"),
        l.get("super_built_up_area"),
        l.get("facing_direction"),
    )
    prop_key4[key].append(l["listing_id"])

unique_props = len(prop_key4)

sub = {
  "api_key": API_KEY,
  "candidate": {
    "name": "Saurabh",
    "email": "saura@mnnit.ac.in",
    "repo_url": "https://github.com/saura/ivy-assignment",
    "demo_url": "https://ivy-assignment.vercel.app"
  },
  "answers": {
    "total_listing_records": total_listing_records,
    "unique_properties": unique_props,
    "active_listings": active_listings,
    "corrupt_listing_ids": corrupt,
    "total_monthly_rent": total_rent,
    "avg_price_per_sqft_2bhk": round(avg_ppsf, 2),
    "costliest_project": costliest_proj,
    "listings_last_7_days": last7,
    "fake_listing_ids": fakes,
    "projects_with_wrong_listing_count": wrong_count
  },
  "findings": []
}

with open("submission.json", "w") as f:
    json.dump(sub, f, indent=2)

print("Done. Wrote submission.json")
