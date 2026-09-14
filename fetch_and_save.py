import urllib.request
import urllib.error
import json
import os
import time

API_KEY = "IVY26-8E65AAA09A9A"
BASE_URL = "https://solve.ivy.homes"
EMAIL = "demo1@ivy.homes"
PASSWORD = "a2c8cc4418"

print("Logging in...")
req = urllib.request.Request(BASE_URL + '/auth/login', data=json.dumps({'email': EMAIL, 'password': PASSWORD}).encode(), headers={'X-API-Key': API_KEY, 'Content-Type': 'application/json'}, method='POST')
token = json.loads(urllib.request.urlopen(req).read())['access_token']
print("Got token")

def fetch(ep):
    all_res = []
    page = 1
    while True:
        url = f'{BASE_URL}{ep}?page={page}&limit=100'
        req = urllib.request.Request(url, headers={'X-API-Key': API_KEY, 'Authorization': f'Bearer {token}'})
        try:
            raw = urllib.request.urlopen(req).read()
            res = json.loads(raw)
            if 'results' not in res:
                print(f"No results in {ep} page {page}: {res}")
                break
            r = res['results']
            if not r:
                break
            all_res.extend(r)
            if 'has_more' in res and not res['has_more']:
                break
            page += 1
            time.sleep(0.1) # Be nice
        except urllib.error.HTTPError as e:
            print(f"Error {e.code} on {ep} page {page}: {e.read().decode()}")
            break
        except Exception as e:
            print(f"Exception on {ep} page {page}: {e}")
            break
    return all_res

for name, ep in [('listings', '/v1/listings'), ('rentals', '/v1/rentals'), ('projects', '/v1/projects')]:
    print(f"Fetching {name}...")
    data = fetch(ep)
    print(f"Fetched {len(data)} items for {name}")
    with open(f'{name}_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

print("Done")
