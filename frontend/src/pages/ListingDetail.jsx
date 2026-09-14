import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { ArrowLeft, Bookmark, MapPin, CheckCircle, XCircle, User, Phone, Home, Layers } from "lucide-react";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const data = await apiRequest(`/v1/listings/${id}`);
        setListing(data);
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
    setSaveLoading(true);
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
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-40 bg-gray-200 rounded-xl"></div>
          <div className="h-40 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !listing) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-900">Property not found</h2>
      <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">Go back</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-black mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{listing.apartment_name || "Independent Property"}</h1>
          <div className="flex items-center text-gray-500 mt-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="capitalize">{listing.locality}</span>
            <span className="mx-2">•</span>
            <span className="capitalize">{listing.property_type}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end shrink-0">
          <p className="text-3xl font-bold text-gray-900">₹{listing.price?.toLocaleString('en-IN')}</p>
          <button 
            onClick={toggleSave} 
            disabled={saveLoading}
            className={`mt-3 btn shadow-sm ${isSaved ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-white text-black border hover:bg-gray-50'}`}
          >
            <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
            {saveLoading ? "Saving..." : (isSaved ? "Saved to Favourites" : "Save Property")}
          </button>
        </div>
      </div>
      
      <div className="h-64 sm:h-96 w-full bg-gray-100 rounded-2xl flex items-center justify-center border border-dashed border-gray-300">
        <span className="text-gray-400 font-medium">No Image Available</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center"><Home className="w-5 h-5 mr-2" /> Property Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4">
              <div>
                <p className="text-sm text-gray-500">Bedrooms</p>
                <p className="font-semibold text-lg">{listing.bedroom} BHK</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bathrooms</p>
                <p className="font-semibold text-lg">{listing.bathroom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Furnishing</p>
                <p className="font-semibold text-lg capitalize">{listing.furnishing}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Carpet Area</p>
                <p className="font-semibold text-lg">{listing.carpet_area} sqft</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Super Built-up</p>
                <p className="font-semibold text-lg">{listing.super_built_up_area} sqft</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Floor</p>
                <p className="font-semibold text-lg">{listing.floor} of {listing.total_floors}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center"><Layers className="w-5 h-5 mr-2" /> Description</h2>
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {listing.description || "No description provided by the seller."}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4">Contact Detail</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{listing.posted_by_name || "Unknown"}</p>
                  <p className="text-xs text-gray-500 capitalize">{listing.posted_by}</p>
                </div>
              </div>
              
              <div className="flex items-center pt-2">
                <Phone className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <p className="font-medium">{listing.posted_by_contact}</p>
              </div>
              
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center text-sm">
                  {listing.is_verified ? (
                    <><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> <span className="text-gray-700">Verified Contact</span></>
                  ) : (
                    <><XCircle className="w-4 h-4 text-gray-400 mr-2" /> <span className="text-gray-500">Unverified Contact</span></>
                  )}
                </div>
                <div className="flex items-center text-sm">
                  {listing.is_live ? (
                    <><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> <span className="text-gray-700">Currently Live</span></>
                  ) : (
                    <><XCircle className="w-4 h-4 text-red-400 mr-2" /> <span className="text-gray-500">Inactive Listing</span></>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
