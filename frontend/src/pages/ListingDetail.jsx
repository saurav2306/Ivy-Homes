import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../api";

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const data = await apiRequest(`/v1/listings/${id}`);
        setListing(data);
        // Check if saved
        const savedData = await apiRequest("/v1/saved");
        if (savedData && savedData.results.some(s => s.listing_id === id)) {
          setIsSaved(true);
        }
      } catch (e) {
        setError("Failed to load listing");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const toggleSave = async () => {
    try {
      if (isSaved) {
        await apiRequest(`/v1/saved/${id}`, { method: "DELETE" });
        setIsSaved(false);
      } else {
        await apiRequest(`/v1/saved`, { 
          method: "POST", 
          body: JSON.stringify({ listing_id: id }) 
        });
        setIsSaved(true);
      }
    } catch (e) {
      alert("Failed to update saved status");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!listing) return <p>Not found</p>;

  return (
    <div>
      <h2>{listing.apartment_name || "Property Detail"}</h2>
      <button onClick={toggleSave} style={{ background: isSaved ? "#ff4444" : "#ddd", color: isSaved ? "white" : "black" }}>
        {isSaved ? "♥ Saved" : "♡ Save"}
      </button>
      
      <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          <h3>Overview</h3>
          <p><strong>Price:</strong> ₹{listing.price?.toLocaleString()}</p>
          <p><strong>Locality:</strong> {listing.locality}</p>
          <p><strong>BHK:</strong> {listing.bedroom} Bed / {listing.bathroom} Bath</p>
          <p><strong>Area:</strong> {listing.carpet_area} sqft (Carpet) / {listing.super_built_up_area} sqft (SBA)</p>
          <p><strong>Furnishing:</strong> {listing.furnishing}</p>
          <p><strong>Property Type:</strong> {listing.property_type}</p>
        </div>
        
        <div>
          <h3>Contact</h3>
          <p><strong>Posted By:</strong> {listing.posted_by_name} ({listing.posted_by})</p>
          <p><strong>Contact:</strong> {listing.posted_by_contact}</p>
          <p><strong>Verified:</strong> {listing.is_verified ? "Yes" : "No"}</p>
          <p><strong>Status:</strong> {listing.is_live ? "Live" : "Inactive"}</p>
        </div>
      </div>
      
      <div style={{ marginTop: "20px" }}>
        <h3>Description</h3>
        <p style={{ whiteSpace: "pre-wrap" }}>{listing.description}</p>
      </div>
    </div>
  );
}
