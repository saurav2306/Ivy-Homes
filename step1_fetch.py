import urllib.request
import urllib.error
import json
import sys

API_KEY = "IVY26-8E65AAA09A9A"
BASE_URL = "https://solve.ivy.homes"
EMAIL = "demo1@ivy.homes"
PASSWORD = "a2c8cc4418"

def p(msg):
    print(msg, flush=True)

# ─── Login ───
p("=== LOGGING IN ===")
req = urllib.request.Request(
    BASE_URL + '/auth/login',
    data=json.dumps({'email': EMAIL, 'password': PASSWORD}).encode(),
    headers={'X-API-Key': API_KEY, 'Content-Type': 'application/json'},
    method='POST'
)
login_res = json.loads(urllib.request.urlopen(req).read())
token = login_res['access_token']
p(f"Login keys: {list(login_res.keys())}, expires_in: {login_res.get('expires_in')}")

# ─── Fetch all pages ───
def fetch_all(ep):
    all_res = []
    page = 1
    while True:
        url = f'{BASE_URL}{ep}?page={page}&limit=100'
        req = urllib.request.Request(url, headers={
            'X-API-Key': API_KEY,
            'Authorization': f'Bearer {token}'
        })
        try:
            res = json.loads(urllib.request.urlopen(req).read())
            r = res.get('results', [])
            if not r:
                break
            all_res.extend(r)
            if page == 1:
                p(f"  Page shape: {list(res.keys())}, total={res.get('total')}")
            if not res.get('has_more', True):
                break
            page += 1
        except urllib.error.HTTPError:
            break
    return all_res

p("\n=== FETCHING LISTINGS ===")
listings = fetch_all('/v1/listings')
p(f"Listings fetched: {len(listings)}")

p("\n=== FETCHING RENTALS ===")
rentals = fetch_all('/v1/rentals')
p(f"Rentals fetched: {len(rentals)}")

p("\n=== FETCHING PROJECTS ===")
projects = fetch_all('/v1/projects')
p(f"Projects fetched: {len(projects)}")

# ─── Sample records ───
p("\n=== SAMPLE LISTING KEYS ===")
if listings:
    p(json.dumps(listings[0], indent=2))

p("\n=== SAMPLE RENTAL KEYS ===")
if rentals:
    p(json.dumps(rentals[0], indent=2))

p("\n=== SAMPLE PROJECT KEYS ===")
if projects:
    p(json.dumps(projects[0], indent=2))

p("\n=== DONE FETCHING ===")
