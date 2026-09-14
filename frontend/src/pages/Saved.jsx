import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import { Bookmark, MapPin, BedDouble } from "lucide-react";

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

  if (loading) return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Saved Properties</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="card h-64 animate-pulse">
            <div className="h-32 bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Saved Properties</h1>
      
      {saved.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900">No saved properties yet</h3>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            When you find a property you like, click the "Save" button on its detail page to keep track of it here.
          </p>
          <Link to="/listings" className="btn mt-6">
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {saved.map(l => (
            <Link to={`/listings/${l.listing_id}`} key={l.listing_id} className="card group hover:ring-2 hover:ring-black/5">
              <div className="h-36 bg-gray-100 flex items-center justify-center relative">
                <span className="text-gray-400 font-medium">No Image</span>
                <div className="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow-sm text-black">
                  <Bookmark className="w-4 h-4 fill-current" />
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-bold text-lg truncate text-gray-900 group-hover:text-blue-600 transition-colors">
                  {l.apartment_name || "Property"}
                </h3>
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin className="w-4 h-4 mr-1 shrink-0" />
                  <span className="truncate capitalize">{l.locality}</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <BedDouble className="w-4 h-4 mr-1 shrink-0" />
                  <span>{l.bedroom} BHK</span>
                </div>
                <div className="pt-3 mt-3 border-t">
                  <p className="font-bold text-xl text-gray-900">₹{l.price?.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
