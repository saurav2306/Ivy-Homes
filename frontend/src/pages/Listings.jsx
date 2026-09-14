import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import { Filter, Search, MapPin, BedDouble } from "lucide-react";

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Server-side filters
  const [locality, setLocality] = useState("");
  const [bhk, setBhk] = useState("");

  // Client-side filters
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [furnishing, setFurnishing] = useState("");

  const limit = 50;

  const fetchListings = async (currentOffset = 0, append = false) => {
    if (!append) setLoading(true);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Properties for Sale</h1>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="btn bg-white text-black border border-gray-200 hover:bg-gray-50 flex items-center shadow-sm"
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-5 rounded-xl border shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 transition-all">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase">Locality (Server)</label>
            <select className="input-field" value={locality} onChange={e => setLocality(e.target.value)}>
              <option value="">All Localities</option>
              <option value="sohna road">Sohna Road</option>
              <option value="sector 65">Sector 65</option>
              <option value="golf course road">Golf Course Road</option>
              <option value="dlf phase 3">DLF Phase 3</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase">BHK (Server)</label>
            <select className="input-field" value={bhk} onChange={e => setBhk(e.target.value)}>
              <option value="">All BHK</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase">Min Price (₹)</label>
            <input type="number" className="input-field" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase">Max Price (₹)</label>
            <input type="number" className="input-field" placeholder="No Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase">Furnishing</label>
            <select className="input-field" value={furnishing} onChange={e => setFurnishing(e.target.value)}>
              <option value="">Any</option>
              <option value="unfurnished">Unfurnished</option>
              <option value="semi-furnished">Semi-Furnished</option>
              <option value="fully-furnished">Fully-Furnished</option>
            </select>
          </div>
        </div>
      )}

      {loading && listings.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="card h-72 animate-pulse flex flex-col">
              <div className="h-40 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map(l => (
              <Link to={`/listings/${l.listing_id}`} key={l.listing_id} className="card group hover:ring-2 hover:ring-black/5">
                <div className="h-40 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                  <span className="text-gray-400 font-medium">No Image</span>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold shadow-sm">
                    {l.property_type.toUpperCase()}
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-lg truncate text-gray-900 group-hover:text-blue-600 transition-colors">
                    {l.apartment_name || "Independent Property"}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 mr-1 shrink-0" />
                    <span className="truncate capitalize">{l.locality}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <BedDouble className="w-4 h-4 mr-1 shrink-0" />
                    <span>{l.bedroom} BHK • {l.furnishing}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-500">Asking Price</p>
                      <p className="font-bold text-xl text-gray-900">₹{l.price?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {filteredListings.length === 0 && !loading && (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your filters.</p>
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button onClick={loadMore} disabled={loading} className="btn bg-white text-black border shadow-sm hover:bg-gray-50 w-full sm:w-auto px-8">
                {loading ? "Loading..." : "Load More Properties"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
