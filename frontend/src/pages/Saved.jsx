import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";

export default function Saved() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSaved() {
      try {
        const data = await apiRequest("/v1/saved");
        if (data) setSaved(data.results);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchSaved();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Saved Properties</h2>
      {saved.length === 0 ? <p>No saved properties.</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
          {saved.map(l => (
            <div key={l.listing_id} style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}>
              <h3><Link to={`/listings/${l.listing_id}`}>{l.apartment_name || "Property"}</Link></h3>
              <p>{l.locality} • {l.bedroom} BHK</p>
              <p><strong>₹{l.price?.toLocaleString()}</strong></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
