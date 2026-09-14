import { useState, useEffect } from "react";
import { apiRequest } from "../api";
import { MapPin, BedDouble } from "lucide-react";

export default function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 50;

  const fetchRentals = async (currentOffset = 0, append = false) => {
    if (!append) setLoading(true);
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
    <div className="space-y-6 pb-10">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Properties for Rent</h1>
      
      {loading && rentals.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card h-64 animate-pulse">
              <div className="h-32 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rentals.map(r => (
              <div key={r.listing_id} className="card group cursor-pointer hover:ring-2 hover:ring-black/5">
                <div className="h-36 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 font-medium">Rental Property</span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-lg truncate text-gray-900 group-hover:text-blue-600 transition-colors">
                    {r.title || r.apartment_name || "Rental"}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 mr-1 shrink-0" />
                    <span className="truncate capitalize">{r.locality}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <BedDouble className="w-4 h-4 mr-1 shrink-0" />
                    <span>{r.bedroom} BHK • {r.furnishing}</span>
                  </div>
                  <div className="pt-3 mt-3 border-t">
                    <p className="text-xs text-gray-500">Monthly Rent</p>
                    <p className="font-bold text-xl text-gray-900">₹{r.price?.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button onClick={loadMore} disabled={loading} className="btn bg-white text-black border shadow-sm hover:bg-gray-50 px-8">
                {loading ? "Loading..." : "Load More Rentals"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
