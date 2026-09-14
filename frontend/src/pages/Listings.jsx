import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Server-side filters
  const [locality, setLocality] = useState("");
  const [bhk, setBhk] = useState("");

  // Client-side filters
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [furnishing, setFurnishing] = useState("");

  const limit = 50;

  const fetchListings = async (currentOffset = 0, append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ offset: currentOffset, limit });
      if (locality) params.append("locality", locality);
      if (bhk) params.append("bhk", bhk);

      const data = await apiRequest(`/v1/listings?${params.toString()}`);
      if (data) {
        setListings(prev => append ? [...prev, ...data.results] : data.results);
        setHasMore(data.has_more);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    fetchListings(0, false);
  }, [locality, bhk]);

  const loadMore = () => {
    const nextOffset = offset + limit;
    setOffset(nextOffset);
    fetchListings(nextOffset, true);
  };

  // Apply client-side filters
  const filteredListings = listings.filter(l => {
    if (minPrice && l.price < Number(minPrice)) return false;
    if (maxPrice && l.price > Number(maxPrice)) return false;
    if (furnishing && l.furnishing !== furnishing) return false;
    return true;
  });

  return (
    <div>
      <h2>Listings</h2>
      
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        {/* Server-side filters */}
        <select value={locality} onChange={e => setLocality(e.target.value)}>
          <option value="">All Localities</option>
          <option value="sohna road">Sohna Road</option>
          <option value="sector 65">Sector 65</option>
          <option value="golf course road">Golf Course Road</option>
          <option value="dlf phase 3">DLF Phase 3</option>
        </select>
        
        <select value={bhk} onChange={e => setBhk(e.target.value)}>
          <option value="">All BHK</option>
          <option value="1">1 BHK</option>
          <option value="2">2 BHK</option>
          <option value="3">3 BHK</option>
          <option value="4">4 BHK</option>
        </select>

        {/* Client-side filters */}
        <input 
          type="number" 
          placeholder="Min Price (₹)" 
          value={minPrice} 
          onChange={e => setMinPrice(e.target.value)} 
        />
        <input 
          type="number" 
          placeholder="Max Price (₹)" 
          value={maxPrice} 
          onChange={e => setMaxPrice(e.target.value)} 
        />
        
        <select value={furnishing} onChange={e => setFurnishing(e.target.value)}>
          <option value="">All Furnishing</option>
          <option value="unfurnished">Unfurnished</option>
          <option value="semi-furnished">Semi-Furnished</option>
          <option value="fully-furnished">Fully-Furnished</option>
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
        {filteredListings.map(l => (
          <div key={l.listing_id} style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}>
            <h3><Link to={`/listings/${l.listing_id}`}>{l.apartment_name || "Plot/House"}</Link></h3>
            <p>{l.locality} • {l.bedroom} BHK</p>
            <p><strong>₹{l.price?.toLocaleString()}</strong></p>
            <p style={{ fontSize: "0.85em", color: "#666" }}>
              {l.property_type} • {l.furnishing}
            </p>
          </div>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      
      {!loading && hasMore && (
        <button onClick={loadMore} style={{ marginTop: "20px", padding: "10px 20px" }}>
          Load More
        </button>
      )}
    </div>
  );
}
