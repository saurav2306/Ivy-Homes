import urllib.request
import urllib.error
import json
from collections import defaultdict
from datetime import datetime, timezone, timedelta

API_KEY = "IVY26-8E65AAA09A9A"
BASE_URL = "https://solve.ivy.homes"
EMAIL = "demo1@ivy.homes"
PASSWORD = "a2c8cc4418"

print("Logging in...")
req = urllib.request.Request(BASE_URL + '/auth/login', data=json.dumps({'email': EMAIL, 'password': PASSWORD}).encode(), headers={'X-API-Key': API_KEY, 'Content-Type': 'application/json'}, method='POST')
token = json.loads(urllib.request.urlopen(req).read())['access_token']

def fetch(ep):
    all_res = []
    page = 1
    while True:
        url = f'{BASE_URL}{ep}?page={page}&limit=100'
        req = urllib.request.Request(url, headers={'X-API-Key': API_KEY, 'Authorization': f'Bearer {token}'})
        try:
            res = json.loads(urllib.request.urlopen(req).read())
            r = res.get('results', [])
            if not r: break
            all_res.extend(r)
            page += 1
        except Exception as e:
            break
    return all_res

print("Fetching data...")
listings = fetch('/v1/listings')
rentals = fetch('/v1/rentals')
projects = fetch('/v1/projects')

# Investigate Q9: Fake listings
contacts = defaultdict(list)
for l in listings:
    contacts[l.get('posted_by_contact')].append(l['listing_id'])

print("Top contacts:")
for c, lids in sorted(contacts.items(), key=lambda x: len(x[1]), reverse=True)[:10]:
    print(f"{c}: {len(lids)}")

# Investigate Q10: projects with wrong listing count
wrong_count = 0
for p in projects:
    pid = p['project_id']
    claimed = p.get('total_listings', 0)
    actual = sum(1 for l in listings if l.get('project_id') == pid)
    if claimed != actual:
        wrong_count += 1
print(f"Projects with wrong listing count: {wrong_count}")

# Q8: listings last 7 days
# REFERENCE = 2026-09-10T00:00:00+05:30
ref_time = datetime.fromisoformat('2026-09-10T00:00:00+05:30')
seven_days_ago = ref_time - timedelta(days=7)
last_7_count = 0
for l in listings:
    try:
        # posted_at might be in UTC (Z) or without timezone.
        # Let's assume it's UTC and convert to IST if it's Z.
        pat = l.get('posted_at')
        if not pat: continue
        if pat.endswith('Z'):
            pat = pat[:-1] + '+00:00'
        # if it doesn't have timezone, assume it's already local? Let's check format
        # Document says Z suffix everywhere.
        dt = datetime.fromisoformat(pat)
        if seven_days_ago <= dt < ref_time:
            last_7_count += 1
    except Exception as e:
        pass
print(f"Listings in last 7 days: {last_7_count}")

