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

def fetch_all(ep):
    all_res = []
    offset = 0
    while True:
        url = BASE_URL + ep + "?offset=" + str(offset) + "&limit=50"
        req = urllib.request.Request(url, headers={
            "X-API-Key": API_KEY, "Authorization": "Bearer " + token
        })
        try:
            res = json.loads(urllib.request.urlopen(req).read())
        except urllib.error.HTTPError:
            break
        r = res.get("results", [])
        if not r:
            break
        all_res.extend(r)
        if not res.get("has_more", True):
            break
        offset += len(r)
    return all_res

p("Fetching listings...")
listings = fetch_all("/v1/listings")
p("Listings: " + str(len(listings)))

p("Fetching rentals...")
rentals = fetch_all("/v1/rentals")
p("Rentals: " + str(len(rentals)))

p("Fetching projects...")
projects = fetch_all("/v1/projects")
p("Projects: " + str(len(projects)))

# =============================================
# Q2: UNIQUE PROPERTIES (cross-site duplicates)
# =============================================
p("\n" + "="*60)
p("Q2: UNIQUE PROPERTIES - CROSS-SITE DUPLICATE ANALYSIS")
p("="*60)

# Website prefixes
websites = defaultdict(int)
for l in listings:
    prefix = l["listing_id"].split("-")[0] if "-" in l["listing_id"] else l["listing_id"][:3]
    websites[prefix] += 1
p("Listing prefixes: " + str(dict(websites)))

# Method 1: Group by (apartment_name, locality, bedroom, floor, carpet_area)
prop_key1 = defaultdict(list)
for l in listings:
    key = (
        l.get("apartment_name", "").lower().strip(),
        l.get("locality", "").lower().strip(),
        l.get("bedroom"),
        l.get("floor"),
        l.get("carpet_area"),
    )
    prop_key1[key].append(l["listing_id"])

multi1 = {k: v for k, v in prop_key1.items() if len(v) > 1}
p("\nMethod 1 (name+locality+bed+floor+carpet): " + str(len(multi1)) + " groups with >1 listing")
for k, v in list(multi1.items())[:15]:
    p("  " + str(k) + " -> " + str(v))

# Method 2: Group by (apartment_name, locality, bedroom, carpet_area) - ignore floor
prop_key2 = defaultdict(list)
for l in listings:
    key = (
        l.get("apartment_name", "").lower().strip(),
        l.get("locality", "").lower().strip(),
        l.get("bedroom"),
        l.get("carpet_area"),
    )
    prop_key2[key].append(l["listing_id"])

multi2 = {k: v for k, v in prop_key2.items() if len(v) > 1}
p("\nMethod 2 (name+locality+bed+carpet): " + str(len(multi2)) + " groups with >1 listing")

# Method 3: Exact lat/lon match
latlon_key = defaultdict(list)
for l in listings:
    key = (l.get("latitude"), l.get("longitude"))
    latlon_key[key].append(l["listing_id"])

multi_ll = {k: v for k, v in latlon_key.items() if len(v) > 1}
p("\nMethod 3 (exact lat/lon): " + str(len(multi_ll)) + " groups with >1 listing")
for k, v in list(multi_ll.items())[:10]:
    p("  " + str(k) + " -> " + str(v))

# Method 4: Full property match (name+locality+bed+floor+carpet+bathroom+facing)
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

multi4 = {k: v for k, v in prop_key4.items() if len(v) > 1}
p("\nMethod 4 (full match): " + str(len(multi4)) + " groups with >1 listing")
for k, v in list(multi4.items())[:15]:
    p("  " + str(v))

# Count unique properties per method
p("\nUnique properties by method:")
p("  Method 1 (name+loc+bed+floor+carpet): " + str(len(prop_key1)))
p("  Method 2 (name+loc+bed+carpet): " + str(len(prop_key2)))
p("  Method 3 (exact lat/lon): " + str(len(latlon_key)))
p("  Method 4 (full match): " + str(len(prop_key4)))

# Check if cross-site duplicates share same websites
if multi4:
    p("\nCross-site duplicate verification:")
    for k, v in list(multi4.items())[:10]:
        sites = [lid.split("-")[0] for lid in v]
        p("  " + str(v) + " sites=" + str(sites))

# =============================================
# Q9: FAKE LISTING DETECTION
# =============================================
p("\n" + "="*60)
p("Q9: FAKE LISTING DETECTION")
p("="*60)

# Analysis 1: Contact frequency
contact_listings = defaultdict(list)
for l in listings:
    contact_listings[l.get("posted_by_contact", "")].append(l)

p("\nTop 20 contacts by listing count:")
top_contacts = sorted(contact_listings.items(), key=lambda x: len(x[1]), reverse=True)[:20]
for c, llist in top_contacts:
    localities = set(l["locality"] for l in llist)
    apt_names = set(l["apartment_name"] for l in llist)
    live_count = sum(1 for l in llist if l.get("is_live"))
    p("  " + c + ": " + str(len(llist)) + " listings, " + str(len(localities)) + " localities, " + str(len(apt_names)) + " apartments, " + str(live_count) + " live")

# Analysis 2: Same contact in too many different apartments/localities
p("\nContacts spanning 5+ different apartments (suspicious):")
suspicious_contacts = []
for c, llist in contact_listings.items():
    apt_names = set(l["apartment_name"] for l in llist)
    localities = set(l["locality"] for l in llist)
    if len(apt_names) >= 5 and len(llist) >= 10:
        suspicious_contacts.append((c, llist))
        ids = [l["listing_id"] for l in llist]
        p("  " + c + ": " + str(len(llist)) + " listings, " + str(len(apt_names)) + " apts, " + str(len(localities)) + " locs")

# Analysis 3: Duplicate descriptions
desc_groups = defaultdict(list)
for l in listings:
    desc = l.get("description", "").strip()
    if desc:
        desc_groups[desc].append(l["listing_id"])
dup_descs = {k: v for k, v in desc_groups.items() if len(v) > 1}
p("\nDuplicate descriptions: " + str(len(dup_descs)))
for d, v in list(dup_descs.items())[:5]:
    p("  " + d[:80] + "... -> " + str(v))

# Analysis 4: Phone numbers that appear in both listings and rentals
rental_contacts = set(r.get("posted_by_contact") for r in rentals)
listing_contacts = set(l.get("posted_by_contact") for l in listings)
p("\nContacts in both listings and rentals: " + str(len(rental_contacts & listing_contacts)))

# Analysis 5: Listings with same price in same apartment (copy-paste listings)
apt_price = defaultdict(list)
for l in listings:
    key = (l.get("apartment_name"), l.get("price"))
    apt_price[key].append(l["listing_id"])
dup_apt_price = {k: v for k, v in apt_price.items() if len(v) > 2}
p("\nSame apartment+price groups with >2 listings: " + str(len(dup_apt_price)))

# Analysis 6: posted_by_name appearing too many times with different contacts
name_contacts = defaultdict(set)
name_listings = defaultdict(list)
for l in listings:
    name = l.get("posted_by_name", "")
    name_contacts[name].add(l.get("posted_by_contact"))
    name_listings[name].append(l["listing_id"])

p("\nPosted_by_name with multiple phone numbers:")
for name, contacts in sorted(name_contacts.items(), key=lambda x: len(x[1]), reverse=True)[:10]:
    p("  " + name + ": " + str(len(contacts)) + " phones, " + str(len(name_listings[name])) + " listings")

# Analysis 7: Look at listings that are NOT verified AND posted by agent/builder with many listings
p("\nUnverified agent/builder listings with high-volume contacts:")
fake_candidates = []
for c, llist in contact_listings.items():
    if len(llist) >= 10:
        unverified = [l for l in llist if not l.get("is_verified") and l.get("posted_by") in ("agent", "builder")]
        if len(unverified) >= 8:
            ids = sorted([l["listing_id"] for l in llist])
            p("  " + c + ": total=" + str(len(llist)) + " unverified_agent=" + str(len(unverified)))
            fake_candidates.extend(ids)

p("\nTotal fake candidates from high-volume unverified agents: " + str(len(fake_candidates)))

# =============================================
# Q6: AVG PRICE PER SQFT 2BHK
# =============================================
p("\n" + "="*60)
p("Q6: AVG PRICE PER SQFT 2BHK")
p("="*60)

corrupt_ids = set(['100-6000323', '100-6000338', '100-6001461', '100-6001968', '100-6002071',
    'DWE-6000010', 'DWE-6001015', 'DWE-6002663', 'DWE-6002846', 'MAG-6000453',
    'MAG-6000527', 'MAG-6000631', 'MAG-6001135', 'MAG-6002834', 'SQU-6001477',
    'SQU-6003044', 'ZER-6000468', 'ZER-6000669'])

# For now compute without excluding fakes (we'll update later)
bhk2_live = [l for l in listings
    if l.get("is_live") and l.get("bedroom") == 2
    and l["listing_id"] not in corrupt_ids
    and l.get("carpet_area", 0) > 0 and l.get("price", 0) > 0]

p("2BHK live listings (excluding corrupt): " + str(len(bhk2_live)))

ppsf_values = [l["price"] / l["carpet_area"] for l in bhk2_live]
if ppsf_values:
    avg_ppsf = sum(ppsf_values) / len(ppsf_values)
    p("Avg price per sqft (excluding corrupt only): " + str(round(avg_ppsf, 2)))
    
    # Distribution
    ppsf_sorted = sorted(ppsf_values)
    p("Min: " + str(round(ppsf_sorted[0], 2)))
    p("Max: " + str(round(ppsf_sorted[-1], 2)))
    p("Median: " + str(round(ppsf_sorted[len(ppsf_sorted)//2], 2)))

# =============================================
# RENTAL ANALYSIS
# =============================================
p("\n" + "="*60)
p("RENTAL ANALYSIS")
p("="*60)

# Check rental field names
if rentals:
    p("Rental fields: " + str(sorted(rentals[0].keys())))
    
    # Check area units - if areas are in sq meters, they'd be ~10x smaller than sqft
    areas = [r.get("carpet_area", 0) for r in rentals if r.get("carpet_area", 0) > 0]
    if areas:
        p("Rental carpet_area range: " + str(min(areas)) + " - " + str(max(areas)))
        p("Avg rental carpet_area: " + str(round(sum(areas)/len(areas), 2)))
    
    sba = [r.get("super_builtup_area", 0) for r in rentals if r.get("super_builtup_area", 0) > 0]
    if sba:
        p("Rental super_builtup_area range: " + str(min(sba)) + " - " + str(max(sba)))
    
    # Check is_live in rentals
    rental_live = sum(1 for r in rentals if r.get("is_live"))
    p("Rentals with is_live=true: " + str(rental_live) + "/" + str(len(rentals)))

# =============================================
# PROJECT ANALYSIS
# =============================================
p("\n" + "="*60)
p("PROJECT ANALYSIS")
p("="*60)

if projects:
    p("Project fields: " + str(sorted(projects[0].keys())))
    
    # Price analysis
    prices_min = [pr.get("price_min", 0) for pr in projects if pr.get("price_min")]
    prices_max = [pr.get("price_max", 0) for pr in projects if pr.get("price_max")]
    p("price_min range: " + str(min(prices_min)) + " - " + str(max(prices_min)))
    p("price_max range: " + str(min(prices_max)) + " - " + str(max(prices_max)))
    
    # Area analysis
    areas_min = [pr.get("min_area_sqft", 0) for pr in projects if pr.get("min_area_sqft")]
    areas_max = [pr.get("max_area_sqft", 0) for pr in projects if pr.get("max_area_sqft")]
    if areas_min:
        p("min_area_sqft range: " + str(min(areas_min)) + " - " + str(max(areas_min)))
    if areas_max:
        p("max_area_sqft range: " + str(min(areas_max)) + " - " + str(max(areas_max)))

    # Listing count analysis for Q10
    p("\nQ10 detailed: Projects with total_listings=0 but actual>0:")
    zero_claimed = 0
    for pr in projects:
        pid = pr["project_id"]
        claimed = pr.get("total_listings", 0)
        actual = sum(1 for l in listings if l.get("project_id") == pid)
        if claimed == 0 and actual > 0:
            zero_claimed += 1
    p("  Projects claiming 0 but having listings: " + str(zero_claimed))

# =============================================
# LISTING FIELD ANALYSIS
# =============================================
p("\n" + "="*60)
p("LISTING FIELD ANALYSIS")
p("="*60)

if listings:
    p("Listing fields: " + str(sorted(listings[0].keys())))
    
    # Property types
    ptypes = defaultdict(int)
    for l in listings:
        ptypes[l.get("property_type")] += 1
    p("Property types: " + str(dict(ptypes)))
    
    # Furnishing values
    furn = defaultdict(int)
    for l in listings:
        furn[l.get("furnishing")] += 1
    p("Furnishing: " + str(dict(furn)))
    
    # Localities
    locs = defaultdict(int)
    for l in listings:
        locs[l.get("locality")] += 1
    p("Localities: " + str(dict(sorted(locs.items()))))
    
    # Website distribution
    webs = defaultdict(int)
    for l in listings:
        webs[l.get("website")] += 1
    p("Websites: " + str(dict(webs)))
    
    # Area unit check - ratio of carpet to SBA
    ratios = []
    for l in listings:
        ca = l.get("carpet_area", 0)
        sba = l.get("super_built_up_area", 0)
        if ca > 0 and sba > 0:
            ratios.append(ca/sba)
    if ratios:
        avg_ratio = sum(ratios)/len(ratios)
        p("Avg carpet/SBA ratio: " + str(round(avg_ratio, 3)))
        p("  (typical ratio for sqft: 0.7-0.85; for sqm would be similar)")

p("\n=== DEEP ANALYSIS COMPLETE ===")
