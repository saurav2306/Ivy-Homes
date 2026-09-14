import json
from collections import defaultdict
from datetime import datetime, timezone, timedelta

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

listings = load_json('D:/IvyHomes/listings_data.json')
rentals = load_json('D:/IvyHomes/rentals_data.json')
projects = load_json('D:/IvyHomes/projects_data.json')

answers = {}

# Q1
answers['total_listing_records'] = len(listings)

# Q2
unique_props = set()
for l in listings:
    # A property is uniquely identified by its physical characteristics
    sig = (
        l.get('project_id'),
        l.get('apartment_name'),
        l.get('locality'),
        l.get('property_type'),
        l.get('bedroom'),
        l.get('bathroom'),
        l.get('floor'),
        l.get('total_floors'),
        l.get('carpet_area'),
        l.get('facing_direction'),
        round(l.get('latitude', 0), 4),
        round(l.get('longitude', 0), 4)
    )
    unique_props.add(sig)
answers['unique_properties'] = len(unique_props)
print(f"Total listings: {len(listings)}, Unique properties: {len(unique_props)}")

# Q3
answers['active_listings'] = sum(1 for l in listings if l.get('is_live', False))

# Q4
# Corrupt listings: describing something that cannot exist.
corrupt = []
for l in listings:
    c = False
    if l.get('carpet_area', 0) > l.get('super_built_up_area', 9999999): c = True
    if l.get('floor', 0) > l.get('total_floors', 999): c = True
    if l.get('bedroom', 0) < 0 or l.get('bathroom', 0) < 0: c = True
    if l.get('price', 0) < 0: c = True
    if l.get('floor') == 0 and l.get('property_type') == 'apartment': pass
    
    if c:
        corrupt.append(l['listing_id'])
corrupt.sort()
answers['corrupt_listing_ids'] = corrupt
print(f"Corrupt count: {len(corrupt)}")

# Q5
rent_locality = sum(r.get('price', 0) for r in rentals if r.get('locality', '').lower() == 'sohna road')
answers['total_monthly_rent'] = rent_locality

# We need fake ones for Q6 and Q9.
# Let's find fake listings. Fake listings exist to generate enquiries. 
# Maybe they have the same contact number? Or suspiciously low prices?
# Let's count contact numbers.
contacts = defaultdict(list)
for l in listings:
    contacts[l.get('posted_by_contact')].append(l['listing_id'])

# Print top contacts to see if any are suspicious
print("Top contacts by listing count:")
for c, lids in sorted(contacts.items(), key=lambda x: len(x[1]), reverse=True)[:5]:
    print(f"{c}: {len(lids)}")

# Let's print answers so far
print(json.dumps(answers, indent=2))
