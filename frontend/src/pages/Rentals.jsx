import { useState, useEffect } from "react";
import { apiRequest } from "../api";

export default function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 50;

  const fetchRentals = async (currentOffset = 0, append = false) => {
    setLoading(true);
    try {
      const data = await apiRequest(`/v1/rentals?offset=${currentOffset}&limit=${limit}`);
      if (data) {
        setRentals(prev => append ? [...prev, ...data.results] : data.results);
        setHasMore(data.has_more);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals(0, false);
  }, []);

  const loadMore = () => {
    const nextOffset = offset + limit;
    setOffset(nextOffset);
    fetchRentals(nextOffset, true);
  };

  return (
    <div>
      <h2>Rentals</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
        {rentals.map(r => (
          <div key={r.listing_id} style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}>
            <h3>{r.title || r.apartment_name}</h3>
            <p>{r.locality} • {r.bedroom} BHK</p>
            <p><strong>Rent: ₹{r.price?.toLocaleString()}</strong></p>
            <p style={{ fontSize: "0.85em", color: "#666" }}>
              Furnishing: {r.furnishing} <br/>
              Area: {r.carpet_area} sqft (Carpet)
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
