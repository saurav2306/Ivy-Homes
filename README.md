# Ivy Homes Frontend & API Analysis

## How to run it

1. Navigate to the `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open the browser at the specified local port (e.g., `http://localhost:5173/`).

The application is built using React and Vite.

## LLM Usage

I used an LLM (Gemini/Claude) in antigravity CLI to help explore the API, write the Python analysis scripts to crunch the dataset, and help build the React frontend.

## How I worked out which parts of the documentation to distrust

The assignment explicitly stated that the API itself is "honest and healthy" but the documentation contains lies. Knowing this, my primary strategy was to **trust nothing in the documentation until verified by the API responses**.

1. **Initial API Exploration**: When I first attempted to hit `/auth/login` and `/v1/listings`, I immediately hit roadblocks. The docs said to pass `?api_key=` as a query parameter, but it returned an unauthorized error. I hypothesized it might require a header, tested `X-API-Key`, and it worked. 
2. **Reading the Data**: I wrote a Python script to fetch the entire dataset (all listings, rentals, and projects) into memory. Instead of blindly trusting the `total` field from the pagination response (which capped prematurely), I looped using the `has_more` flag and `offset` (as `page` was completely ignored) until exhaustion. I fetched 3500 listings, while the API's `total` field only claimed 3323.
3. **Cross-Referencing Assumptions**: The documentation claimed that listing prices were in integer rupees everywhere. However, when I looked at the `/v1/projects` endpoint, `price_min` and `price_max` were floats like `1.66` and `98.9`. A quick math check comparing these against listing prices in those projects confirmed they were in Crores, not Rupees.
4. **Data Integrity Checks**: Since sellers can write anything, I wrote anomaly detection loops for impossible scenarios: negative prices, `floor` > `total_floors`, and `carpet_area` > `super_built_up_area`. I also aggregated listings by `posted_by_contact` and discovered massive lead-gen operations (fake listings spanning dozens of apartments and localities under one phone number).

## What I checked that turned out to be fine

Some of my hypotheses about API breakage didn't pan out. Here is what worked perfectly:

- **The `bhk` Filter**: While the `bedroom` query parameter failed to filter results, the `bhk` filter on `/v1/listings` worked exactly as intended on the server side.
- **The `locality` Filter**: Applying locality in the query string correctly narrowed results on the server, which was a relief.
- **Sorting Direction**: The `order=asc` and `order=desc` parameters functioned as expected for the fields that actually supported sorting.
- **Rental Data Integrity**: I hypothesized that rentals might also suffer from massive impossible values (negative rents, absurd deposits), but they largely adhered to expectations without the extreme anomalies found in listings.
- **Single Item Retrieval**: Calling `/v1/listings/{id}` and `/v1/projects/{id}` functioned identically to the documentation's single-item endpoint promises (though the listing endpoint had to be pluralized).

## What I would do with another two days

- **State Management & Caching**: Replace standard React State and fetch calls with React Query (TanStack Query) to handle caching and the 15-minute token refresh flow more gracefully.
- **Visual Polish**: Use a component library like Tailwind CSS, shadcn/ui, or Material-UI to build a highly responsive and polished grid layout, sophisticated filter drawers, and better skeleton loaders.
