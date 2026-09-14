import urllib.request
import urllib.error
import json

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

def api_get(path):
    try:
        req = urllib.request.Request(BASE_URL + path, headers={
            "X-API-Key": API_KEY, "Authorization": "Bearer " + token
        })
        return json.loads(urllib.request.urlopen(req).read())
    except urllib.error.HTTPError as e:
        return {"error": e.code, "detail": e.read().decode()}

# =============================================
# TEST FILTER PARAMETERS ON /v1/listings
# =============================================
p("\n" + "="*60)
p("FILTER PARAMETER TESTS - LISTINGS")
p("="*60)

# Baseline
base = api_get("/v1/listings?offset=0&limit=5")
p("Baseline total: " + str(base.get("total")))

# Test locality filter
p("\n--- locality filter ---")
for loc in ["sohna road", "sector 82", "golf course road"]:
    r = api_get("/v1/listings?offset=0&limit=5&locality=" + loc.replace(" ", "%20"))
    p("locality=" + loc + ": total=" + str(r.get("total", r.get("error"))))

# Test bhk filter (doc says 'bhk')
p("\n--- bhk filter ---")
for b in [1, 2, 3, 4]:
    r = api_get("/v1/listings?offset=0&limit=5&bhk=" + str(b))
    p("bhk=" + str(b) + ": total=" + str(r.get("total", r.get("error"))))

# Maybe it's 'bedroom' not 'bhk'?
p("\n--- bedroom filter ---")
for b in [1, 2, 3, 4]:
    r = api_get("/v1/listings?offset=0&limit=5&bedroom=" + str(b))
    p("bedroom=" + str(b) + ": total=" + str(r.get("total", r.get("error"))))

# Test min_price / max_price
p("\n--- price filters ---")
r = api_get("/v1/listings?offset=0&limit=5&min_price=10000000")
p("min_price=10000000: total=" + str(r.get("total", r.get("error"))))
r = api_get("/v1/listings?offset=0&limit=5&max_price=10000000")
p("max_price=10000000: total=" + str(r.get("total", r.get("error"))))
r = api_get("/v1/listings?offset=0&limit=5&min_price=10000000&max_price=20000000")
p("price 10M-20M: total=" + str(r.get("total", r.get("error"))))

# Test property_type filter
p("\n--- property_type filter ---")
for pt in ["apartment", "villa", "independent house", "plot", "builder floor"]:
    r = api_get("/v1/listings?offset=0&limit=5&property_type=" + pt.replace(" ", "%20"))
    p("property_type=" + pt + ": total=" + str(r.get("total", r.get("error"))))

# Test furnishing filter
p("\n--- furnishing filter ---")
for f in ["unfurnished", "semi-furnished", "fully-furnished"]:
    r = api_get("/v1/listings?offset=0&limit=5&furnishing=" + f)
    p("furnishing=" + f + ": total=" + str(r.get("total", r.get("error"))))

# Test sort_by
p("\n--- sort_by tests ---")
for sb in ["price", "carpet_area", "posted_at", "bedroom"]:
    r = api_get("/v1/listings?offset=0&limit=5&sort_by=" + sb)
    if "results" in r:
        vals = [str(item.get(sb)) for item in r["results"]]
        p("sort_by=" + sb + " (asc): " + str(vals))

for sb in ["price", "carpet_area", "posted_at"]:
    r = api_get("/v1/listings?offset=0&limit=5&sort_by=" + sb + "&order=desc")
    if "results" in r:
        vals = [str(item.get(sb)) for item in r["results"]]
        p("sort_by=" + sb + " (desc): " + str(vals))

# =============================================
# TEST FILTER PARAMETERS ON /v1/rentals
# =============================================
p("\n" + "="*60)
p("FILTER PARAMETER TESTS - RENTALS")
p("="*60)

base_r = api_get("/v1/rentals?offset=0&limit=5")
p("Rentals baseline total: " + str(base_r.get("total")))

p("\n--- locality filter ---")
r = api_get("/v1/rentals?offset=0&limit=5&locality=sohna%20road")
p("locality=sohna road: total=" + str(r.get("total", r.get("error"))))

p("\n--- bhk filter ---")
r = api_get("/v1/rentals?offset=0&limit=5&bhk=2")
p("bhk=2: total=" + str(r.get("total", r.get("error"))))

p("\n--- furnishing filter ---")
r = api_get("/v1/rentals?offset=0&limit=5&furnishing=fully-furnished")
p("furnishing=fully-furnished: total=" + str(r.get("total", r.get("error"))))

# =============================================
# TEST FILTER PARAMETERS ON /v1/projects
# =============================================
p("\n" + "="*60)
p("FILTER PARAMETER TESTS - PROJECTS")
p("="*60)

base_p = api_get("/v1/projects?offset=0&limit=5")
p("Projects baseline total: " + str(base_p.get("total")))

p("\n--- locality filter ---")
r = api_get("/v1/projects?offset=0&limit=5&locality=golf%20course%20road")
p("locality=golf course road: total=" + str(r.get("total", r.get("error"))))

p("\n--- project_status filter ---")
for s in ["ready to move", "under construction", "completed", "new launch"]:
    r = api_get("/v1/projects?offset=0&limit=5&project_status=" + s.replace(" ", "%20"))
    p("project_status=" + s + ": total=" + str(r.get("total", r.get("error"))))

p("\n--- sort_by tests ---")
for sb in ["price_min", "price_max", "launch_date", "total_units"]:
    r = api_get("/v1/projects?offset=0&limit=5&sort_by=" + sb)
    if "results" in r:
        vals = [str(item.get(sb)) for item in r["results"]]
        p("sort_by=" + sb + ": " + str(vals))

# =============================================
# TEST FAVOURITES ENDPOINTS
# =============================================
p("\n" + "="*60)
p("FAVOURITES ENDPOINT TESTS")
p("="*60)

# GET favourites
r = api_get("/v1/favourites")
p("GET /v1/favourites: " + json.dumps(r))

# POST favourite
try:
    req = urllib.request.Request(
        BASE_URL + "/v1/favourites",
        data=json.dumps({"id": "100-6000047"}).encode(),
        headers={"X-API-Key": API_KEY, "Authorization": "Bearer " + token, "Content-Type": "application/json"},
        method="POST"
    )
    res = json.loads(urllib.request.urlopen(req).read())
    p("POST /v1/favourites {id: 100-6000047}: " + json.dumps(res))
except urllib.error.HTTPError as e:
    p("POST /v1/favourites error: " + str(e.code) + " " + e.read().decode())

# Try with listing_id instead
try:
    req = urllib.request.Request(
        BASE_URL + "/v1/favourites",
        data=json.dumps({"listing_id": "100-6000047"}).encode(),
        headers={"X-API-Key": API_KEY, "Authorization": "Bearer " + token, "Content-Type": "application/json"},
        method="POST"
    )
    res = json.loads(urllib.request.urlopen(req).read())
    p("POST /v1/favourites {listing_id: 100-6000047}: " + json.dumps(res))
except urllib.error.HTTPError as e:
    p("POST /v1/favourites {listing_id} error: " + str(e.code) + " " + e.read().decode())

# GET favourites again
r = api_get("/v1/favourites")
p("GET /v1/favourites after add: " + json.dumps(r)[:500])

# DELETE favourite
try:
    req = urllib.request.Request(
        BASE_URL + "/v1/favourites/100-6000047",
        headers={"X-API-Key": API_KEY, "Authorization": "Bearer " + token},
        method="DELETE"
    )
    res = urllib.request.urlopen(req)
    p("DELETE /v1/favourites/100-6000047: " + str(res.status))
except urllib.error.HTTPError as e:
    p("DELETE error: " + str(e.code) + " " + e.read().decode())

# =============================================
# TEST OTHER ENDPOINTS
# =============================================
p("\n" + "="*60)
p("OTHER ENDPOINT TESTS")
p("="*60)

# Check if page param works at all (it did earlier but gave fewer results)
r = api_get("/v1/listings?page=1&limit=50")
p("page=1&limit=50: total=" + str(r.get("total")) + " count=" + str(r.get("count")) + " offset=" + str(r.get("offset")))

r = api_get("/v1/listings?page=2&limit=50")
p("page=2&limit=50: total=" + str(r.get("total")) + " count=" + str(r.get("count")) + " offset=" + str(r.get("offset")))

# Check if there are undocumented endpoints
for ep in ["/v1/cities", "/v1/localities", "/v1/search", "/v1/users/me", "/v1/enquiries", "/api/v1/listings"]:
    r = api_get(ep)
    p(ep + ": " + str(r.get("error", "200 OK"))[:100])

# Test auth/refresh
p("\n--- auth/refresh ---")
try:
    login_res = json.loads(urllib.request.urlopen(urllib.request.Request(
        BASE_URL + '/auth/login',
        data=json.dumps({"email": "demo1@ivy.homes", "password": "a2c8cc4418"}).encode(),
        headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
        method="POST"
    )).read())
    refresh_token = login_res.get("refresh_token")
    p("refresh_token present: " + str(bool(refresh_token)))
    p("refresh_url: " + str(login_res.get("refresh_url")))
    
    req = urllib.request.Request(
        BASE_URL + "/auth/refresh",
        data=json.dumps({"refresh_token": refresh_token}).encode(),
        headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
        method="POST"
    )
    res = json.loads(urllib.request.urlopen(req).read())
    p("POST /auth/refresh: " + json.dumps(res)[:200])
except urllib.error.HTTPError as e:
    p("Refresh error: " + str(e.code) + " " + e.read().decode())

p("\n=== API TESTS COMPLETE ===")
