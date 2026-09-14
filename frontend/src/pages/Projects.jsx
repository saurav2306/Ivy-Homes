import { useState, useEffect } from "react";
import { apiRequest } from "../api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 50;

  const fetchProjects = async (currentOffset = 0, append = false) => {
    setLoading(true);
    try {
      const data = await apiRequest(`/v1/projects?offset=${currentOffset}&limit=${limit}`);
      if (data) {
        setProjects(prev => append ? [...prev, ...data.results] : data.results);
        setHasMore(data.has_more);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(0, false);
  }, []);

  const loadMore = () => {
    const nextOffset = offset + limit;
    setOffset(nextOffset);
    fetchProjects(nextOffset, true);
  };

  const formatPrice = (priceInCrores) => {
    if (!priceInCrores) return "N/A";
    const inr = priceInCrores * 10000000;
    return `₹${(inr / 100000).toFixed(2)} Lacs - ₹${(inr / 10000000).toFixed(2)} Cr`;
  };

  return (
    <div>
      <h2>Projects</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {projects.map(p => (
          <div key={p.project_id} style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}>
            <h3>{p.apartment_name}</h3>
            <p><strong>Developer:</strong> {p.developer_name}</p>
            <p><strong>Locality:</strong> {p.locality}</p>
            <p><strong>Status:</strong> {p.project_status}</p>
            <p><strong>Price Range:</strong> {formatPrice(p.price_min)} to {formatPrice(p.price_max)}</p>
            <p><strong>Area:</strong> {p.min_area_sqft} - {p.max_area_sqft} sqft</p>
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
