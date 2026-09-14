import urllib.request
import json
import sys

API_KEY = "IVY26-8E65AAA09A9A"
BASE_URL = "https://solve.ivy.homes"

token = json.loads(urllib.request.urlopen(urllib.request.Request(
    BASE_URL + '/auth/login',
    data=json.dumps({"email": "demo1@ivy.homes", "password": "a2c8cc4418"}).encode(),
    headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
    method="POST"
)).read())["access_token"]

# Test offset-based pagination
for offset in [0, 100, 200]:
    req = urllib.request.Request(
        BASE_URL + "/v1/listings?offset=" + str(offset) + "&limit=100",
        headers={"X-API-Key": API_KEY, "Authorization": "Bearer " + token}
    )
    res = json.loads(urllib.request.urlopen(req).read())
    print("offset=" + str(offset) + " count=" + str(res["count"]) + " total=" + str(res["total"]) + " has_more=" + str(res["has_more"]) + " limit=" + str(res["limit"]) + " resp_offset=" + str(res["offset"]), flush=True)
