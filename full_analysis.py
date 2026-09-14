import urllib.request
import urllib.error
import json
import sys
from collections import defaultdict
from datetime import datetime, timezone, timedelta

API_KEY = "IVY26-8E65AAA09A9A"
BASE_URL = "https://solve.ivy.homes"

def p(msg):
    print(msg, flush=True)

p("=== LOGIN ===")
token = json.loads(urllib.request.urlopen(urllib.request.Request(
    BASE_URL + '/auth/login',
    data=json.dumps({"email": "demo1@ivy.homes", "password": "a2c8cc4418"}).encode(),
    headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
    method="POST"
)).read())["access_token"]
p("Got token")

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
        except urllib.error.HTTPError as e:
            p("Error " + str(e.code) + " at offset " + str(offset))
            break
        r = res.get("results", [])
        if not r:
            break
        all_res.extend(r)
        if not res.get("has_more", True):
            break
        offset += len(r)
    return all_res

p("\n=== FETCHING LISTINGS ===")
listings = fetch_all("/v1/listings")
p("Listings: " + str(len(listings)))

p("\n=== FETCHING RENTALS ===")
rentals = fetch_all("/v1/rentals")
p("Rentals: " + str(len(rentals)))

p("\n=== FETCHING PROJECTS ===")
projects = fetch_all("/v1/projects")
p("Projects: " + str(len(projects)))

# ─── Sample records ───
p("\n=== SAMPLE LISTING ===")
if listings:
    p(json.dumps(listings[0], indent=2))

p("\n=== SAMPLE RENTAL ===")
if rentals:
    p(json.dumps(rentals[0], indent=2))

p("\n=== SAMPLE PROJECT ===")
if projects:
    p(json.dumps(projects[0], indent=2))

# ─── Q1 ───
p("\n=== Q1: total_listing_records = " + str(len(listings)) + " ===")

# ─── Q2: unique_properties ───
p("\n=== Q2: UNIQUE PROPERTIES ===")
lid_counts = defaultdict(int)
for l in listings:
    lid_counts[l["listing_id"]] += 1
dups = {k: v for k, v in lid_counts.items() if v > 1}
p("Unique listing_ids: " + str(len(lid_counts)))
p("Duplicate listing_ids: " + str(dups))

# Group by physical property
prop_groups = defaultdict(list)
for l in listings:
    key = (
        l.get("apartment_name"),
        l.get("locality"),
        l.get("bedroom"),
        l.get("floor"),
        l.get("carpet_area"),
        l.get("facing_direction"),
        round(l.get("latitude", 0), 4),
        round(l.get("longitude", 0), 4)
    )
    prop_groups[key].append(l["listing_id"])
multi = {k: v for k, v in prop_groups.items() if len(v) > 1}
p("Physical property groups with >1 listing: " + str(len(multi)))
for k, v in list(multi.items())[:10]:
    p("  " + str(k) + " -> " + str(v))
p("Unique properties estimate: " + str(len(prop_groups)))

# ─── Q3 ───
active = sum(1 for l in listings if l.get("is_live", False))
p("\n=== Q3: active_listings = " + str(active) + " ===")

# ─── Q4: corrupt ───
p("\n=== Q4: CORRUPT LISTINGS ===")
corrupt = []
for l in listings:
    reasons = []
    ca = l.get("carpet_area", 0) or 0
    sba = l.get("super_built_up_area", 0) or 0
    if ca > 0 and sba > 0 and ca > sba:
        reasons.append("carpet>" + str(ca) + ">sba>" + str(sba))
    fl = l.get("floor", 0) or 0
    tf = l.get("total_floors", 0) or 0
    if fl > 0 and tf > 0 and fl > tf:
        reasons.append("floor>" + str(fl) + ">total>" + str(tf))
    price = l.get("price", 0) or 0
    if price <= 0:
        reasons.append("bad price " + str(price))
    bed = l.get("bedroom")
    if bed is not None and bed < 0:
        reasons.append("neg bed " + str(bed))
    bath = l.get("bathroom")
    if bath is not None and bath < 0:
        reasons.append("neg bath " + str(bath))
    if reasons:
        corrupt.append(l["listing_id"])
        p("  " + l["listing_id"] + ": " + str(reasons))
corrupt.sort()
p("Corrupt IDs: " + str(corrupt))

# ─── Q5: total monthly rent for Sohna Road ───
p("\n=== Q5: SOHNA ROAD RENTALS ===")
rental_localities = sorted(set(r.get("locality", "").lower() for r in rentals))
p("Rental localities: " + str(rental_localities))
sohna = [r for r in rentals if "sohna" in r.get("locality", "").lower()]
p("Sohna Road matches: " + str(len(sohna)))
if sohna:
    p("Sample locality value: " + sohna[0].get("locality", ""))
total_rent = sum(r.get("price", 0) for r in sohna)
p("Total monthly rent: " + str(total_rent))

# ─── Q7: costliest project ───
p("\n=== Q7: COSTLIEST PROJECT ===")
costliest = max(projects, key=lambda x: x.get("price_max", 0))
p("project_id: " + costliest["project_id"] + " price_max: " + str(costliest.get("price_max")))

# ─── Q8: listings last 7 days ───
p("\n=== Q8: LISTINGS LAST 7 DAYS ===")
ref = datetime(2026, 9, 10, 0, 0, 0, tzinfo=timezone(timedelta(hours=5, minutes=30)))
seven_before = ref - timedelta(days=7)
p("Sample posted_at values:")
for l in listings[:5]:
    p("  " + l["listing_id"] + ": " + str(l.get("posted_at")))

last7 = 0
for l in listings:
    pat = l.get("posted_at")
    if not pat:
        continue
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
p("Listings last 7 days: " + str(last7))

# ─── Q9: fake listings ───
p("\n=== Q9: FAKE LISTINGS ANALYSIS ===")
contact_counts = defaultdict(list)
for l in listings:
    contact_counts[l.get("posted_by_contact", "")].append(l["listing_id"])
p("Top 15 contacts by count:")
for c, lids in sorted(contact_counts.items(), key=lambda x: len(x[1]), reverse=True)[:15]:
    p("  " + str(c) + ": " + str(len(lids)) + " listings")

# Check verified vs not
verified_counts = defaultdict(int)
for l in listings:
    verified_counts[l.get("is_verified", "N/A")] += 1
p("Verified distribution: " + str(dict(verified_counts)))

# Check posted_by distribution
posted_by_counts = defaultdict(int)
for l in listings:
    posted_by_counts[l.get("posted_by", "N/A")] += 1
p("Posted_by distribution: " + str(dict(posted_by_counts)))

# ─── Q10: projects with wrong listing count ───
p("\n=== Q10: PROJECTS WITH WRONG LISTING COUNT ===")
wrong = 0
wrong_examples = []
for proj in projects:
    pid = proj["project_id"]
    claimed = proj.get("total_listings", 0)
    actual = sum(1 for l in listings if l.get("project_id") == pid)
    if claimed != actual:
        wrong += 1
        if wrong <= 10:
            wrong_examples.append(pid + " claimed=" + str(claimed) + " actual=" + str(actual))
for ex in wrong_examples:
    p("  " + ex)
p("Total wrong: " + str(wrong))

# ─── Check analytics endpoint ───
p("\n=== ANALYTICS ENDPOINT ===")
try:
    req = urllib.request.Request(
        BASE_URL + "/v1/analytics/summary",
        headers={"X-API-Key": API_KEY, "Authorization": "Bearer " + token}
    )
    res = json.loads(urllib.request.urlopen(req).read())
    p(json.dumps(res, indent=2))
except urllib.error.HTTPError as e:
    p("Error " + str(e.code) + ": " + e.read().decode())

# ─── Check endpoint paths ───
p("\n=== ENDPOINT PATH CHECKS ===")
lid = listings[0]["listing_id"] if listings else "100-6000047"
rid = rentals[0]["listing_id"] if rentals else "R6000001"
pid = projects[0]["project_id"] if projects else "P60001"

test_eps = [
    ("GET", "/v1/listing/" + lid),
    ("GET", "/v1/listings/" + lid),
    ("GET", "/v1/listings/" + lid + "/similar"),
    ("GET", "/v1/rentals/" + rid),
    ("GET", "/v1/projects/" + pid),
    ("POST", "/auth/logout"),
]
for method, ep in test_eps:
    try:
        req = urllib.request.Request(BASE_URL + ep, headers={
            "X-API-Key": API_KEY,
            "Authorization": "Bearer " + token
        }, method=method)
        res = urllib.request.urlopen(req)
        p("  " + method + " " + ep + ": " + str(res.status))
    except urllib.error.HTTPError as e:
        p("  " + method + " " + ep + ": " + str(e.code) + " - " + e.read().decode())

p("\n=== DONE ===")
