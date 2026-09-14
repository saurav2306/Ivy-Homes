import { useState, useEffect } from "react";
import { apiRequest } from "../api";
import { Building2, MapPin, Maximize2 } from "lucide-react";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 50;

  const fetchProjects = async (currentOffset = 0, append = false) => {
    if (!append) setLoading(true);
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
    return `₹${(inr / 100000).toFixed(2)}L - ₹${(inr / 10000000).toFixed(2)}Cr`;
  };

  return (
    <div className="space-y-6 pb-10">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">New Projects</h1>
      
      {loading && projects.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card p-6 h-48 animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map(p => (
              <div key={p.project_id} className="card p-6 flex flex-col hover:border-black/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">{p.apartment_name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{p.developer_name}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 capitalize border border-blue-100">
                    {p.project_status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="capitalize">{p.locality}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Maximize2 className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{p.min_area_sqft} - {p.max_area_sqft} sqft</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Expected Price</p>
                  <p className="font-bold text-lg text-gray-900">{formatPrice(p.price_min)} to {formatPrice(p.price_max)}</p>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button onClick={loadMore} disabled={loading} className="btn bg-white text-black border shadow-sm hover:bg-gray-50 px-8">
                {loading ? "Loading..." : "Load More Projects"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
