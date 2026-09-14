import urllib.request
import urllib.error
import json
import os

API_KEY = "IVY26-8E65AAA09A9A"
BASE_URL = "https://solve.ivy.homes"
EMAIL = "demo1@ivy.homes"
PASSWORD = "a2c8cc4418"
OUT_DIR = r"D:\IvyHomes"

def make_request(method, endpoint, data=None, token=None):
    url = BASE_URL + endpoint
    headers = {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
    }
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    body = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"Error {e.code} on {method} {endpoint}: {e.read().decode('utf-8')}")
        return None

print("Logging in...")
login_res = make_request('POST', '/auth/login', {'email': EMAIL, 'password': PASSWORD})
if not login_res:
    exit(1)

token = login_res['access_token']
print("Got token")

def fetch_all(endpoint):
    all_results = []
    page = 1
    while True:
        res = make_request('GET', f"{endpoint}?page={page}&limit=100", token=token)
        if not res:
            break
        
        # print keys for debugging
        print(f"Page {page} keys: {list(res.keys())}")
        
        if 'results' in res:
            results = res['results']
        elif 'data' in res:
            results = res['data']
        else:
            print(f"No results or data key in {endpoint} page {page}")
            break
            
        if not results:
            break
            
        all_results.extend(results)
        
        if 'has_more' in res and not res['has_more']:
            break
            
        page += 1
        
    return all_results

for name, ep in [('listings', '/v1/listings'), ('rentals', '/v1/rentals'), ('projects', '/v1/projects')]:
    print(f"Fetching {name}...")
    data = fetch_all(ep)
    out_path = os.path.join(OUT_DIR, f"{name}.json")
    try:
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"Saved {len(data)} to {out_path}")
    except Exception as e:
        print(f"Failed to save {name}: {e}")

print("Done")
