import json

findings = [
    {
      "endpoint": "/auth/login",
      "category": "auth",
      "documented": "Returns a token in 'token' field, valid for 24h, without refresh flow.",
      "actual": "Returns 'access_token', 'refresh_token', 'refresh_url' with expires_in of 900 seconds (15 minutes).",
      "how_found": "Observed the login response keys and token expiration during initial setup.",
      "impact": "Requires implementing token refresh mechanism and adjusting token keys in frontend.",
      "evidence": []
    },
    {
      "endpoint": "*",
      "category": "auth",
      "documented": "API key is sent as query parameter ?api_key=...",
      "actual": "API key must be sent as 'X-API-Key' header.",
      "how_found": "Query parameter approach failed with unauthorized error. Header approach succeeded.",
      "impact": "All API requests must be updated to use headers instead of query parameters.",
      "evidence": []
    },
    {
      "endpoint": "/v1/listings",
      "category": "pagination",
      "documented": "Uses 'page' (1-indexed) and max limit is 200. Total is accurate.",
      "actual": "Uses 'offset' (0-indexed). Max limit is 50. 'page' is ignored. The 'total' field is inaccurate.",
      "how_found": "Tested pagination limits and observed total count mismatch with actual fetched records.",
      "impact": "Frontend must use offset logic and not rely on 'total' for page counts.",
      "evidence": []
    },
    {
      "endpoint": "/v1/listings",
      "category": "completeness",
      "documented": "Returns only active listings.",
      "actual": "Returns all listings, including those where 'is_live' is false.",
      "how_found": "Checked 'is_live' attribute across fetched listings and found many false values.",
      "impact": "Need to manually filter out inactive listings in the frontend or analytics.",
      "evidence": []
    },
    {
      "endpoint": "/v1/projects",
      "category": "units",
      "documented": "Prices are in Indian rupees, integer format.",
      "actual": "Project prices (price_min, price_max) are floats in Crores.",
      "how_found": "Checked values which were very low (e.g. 1.66) compared to listings.",
      "impact": "Prices must be multiplied by 10,000,000 for accurate UI display.",
      "evidence": []
    },
    {
      "endpoint": "/v1/analytics/summary",
      "category": "missing_endpoint",
      "documented": "Returns analytics summary.",
      "actual": "Returns 404 Not Found.",
      "how_found": "Attempted to hit the endpoint during discovery.",
      "impact": "Must manually calculate all analytics instead of relying on API.",
      "evidence": []
    },
    {
      "endpoint": "/v1/listing/{id}",
      "category": "missing_endpoint",
      "documented": "Returns detailed listing information.",
      "actual": "Returns 404 Not Found. The correct path is plural /v1/listings/{id}.",
      "how_found": "Tested endpoint paths and verified the working alternative.",
      "impact": "Changed all frontend API calls to use the pluralized endpoint.",
      "evidence": []
    },
    {
      "endpoint": "/v1/listings",
      "category": "filters",
      "documented": "Supports min_price, max_price, and furnishing filters.",
      "actual": "These query parameters are ignored by the server.",
      "how_found": "Tested endpoint with these parameters and received the same total count and results.",
      "impact": "Must perform client-side filtering for these properties.",
      "evidence": []
    },
    {
      "endpoint": "/v1/favourites",
      "category": "missing_endpoint",
      "documented": "Used to fetch and post favourites with body {'id'}.",
      "actual": "Endpoint is 404. Correct endpoint is /v1/saved and requires {'listing_id'}.",
      "how_found": "Tested paths and payload configurations for saving listings.",
      "impact": "Adjusted API routing and payload format in frontend.",
      "evidence": []
    },
    {
      "endpoint": "/v1/listings",
      "category": "data_quality",
      "documented": "Listings are valid and well-formed.",
      "actual": "Several listings have impossible values (negative price, floor > total_floors, carpet_area > super_built_up_area).",
      "how_found": "Ran validation checks during full dataset sweep.",
      "impact": "These listings must be excluded from calculations.",
      "evidence": ["100-6001461", "100-6000323", "100-6000338", "DWE-6001015"]
    },
    {
      "endpoint": "/v1/projects",
      "category": "consistency",
      "documented": "Project listing count aligns with available listings.",
      "actual": "total_listings for 295 out of 400 projects differs from the actual listings array associated with them.",
      "how_found": "Counted listings associated with each project_id and compared with total_listings field.",
      "impact": "Cannot rely on the project summary field for listing counts.",
      "evidence": ["P60001", "P60002", "P60004", "P60005"]
    },
    {
      "endpoint": "/v1/listings",
      "category": "timestamps",
      "documented": "Timestamps use ISO 8601, UTC, Z suffix everywhere.",
      "actual": "Listing posted_at values do not include a Z suffix or timezone offset, while rentals do.",
      "how_found": "Observed inconsistencies when parsing dates for the 7-day filter.",
      "impact": "Requires custom fallback date parsing to handle missing timezones.",
      "evidence": []
    }
]

try:
    with open("submission.json", "r") as f:
        data = json.load(f)
    
    data["findings"] = findings
    
    with open("submission.json", "w") as f:
        json.dump(data, f, indent=2)
    print("Injected findings successfully.")
except Exception as e:
    print(f"Error: {e}")
