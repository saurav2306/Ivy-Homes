import { Lightbulb, AlertTriangle, Search, Activity, ShieldAlert, BadgeCheck, FileWarning, TrendingUp, HelpCircle } from "lucide-react";

export default function Insights() {
  const insightsData = [
    { id: 1, icon: <Activity className="w-5 h-5 text-blue-500" />, q: "Total Listing Records", a: "3,500", desc: "Fetched via exhaustive offset pagination, despite API claiming 3323." },
    { id: 2, icon: <BadgeCheck className="w-5 h-5 text-green-500" />, q: "Unique Properties", a: "~3,497", desc: "Identified 3 cross-site duplicate pairs using precise attribute matching." },
    { id: 3, icon: <Activity className="w-5 h-5 text-blue-500" />, q: "Active Listings", a: "2,792", desc: "Listings where is_live == true." },
    { id: 4, icon: <AlertTriangle className="w-5 h-5 text-red-500" />, q: "Corrupt Listing IDs", a: "18 IDs found", desc: "E.g., 100-6001461, 100-6000323. Impossible data like negative prices or floor > total_floors." },
    { id: 5, icon: <TrendingUp className="w-5 h-5 text-purple-500" />, q: "Total Monthly Rent (Sohna Road)", a: "₹3,733,800", desc: "Sum of all rental prices strictly in the Sohna Road locality." },
    { id: 6, icon: <TrendingUp className="w-5 h-5 text-purple-500" />, q: "Avg Price per Sqft (2BHK)", a: "₹26,803.34", desc: "Mean price/sqft for live 2BHK listings, excluding identified fake & corrupt IDs." },
    { id: 7, icon: <TrendingUp className="w-5 h-5 text-purple-500" />, q: "Costliest Project", a: "P60090", desc: "Max price is 98.9 Crores (₹98,90,00,000). Prices are natively stored as floats in crores." },
    { id: 8, icon: <Activity className="w-5 h-5 text-blue-500" />, q: "Listings in Last 7 Days", a: "129", desc: "Filtered against the fixed reference moment of Sep 10, 2026 IST." },
    { id: 9, icon: <ShieldAlert className="w-5 h-5 text-orange-500" />, q: "Fake Listing IDs", a: "135 IDs", desc: "Uncovered mass lead-gen operations where single agents listed across 30+ separate apartments." },
    { id: 10, icon: <FileWarning className="w-5 h-5 text-yellow-500" />, q: "Projects with Wrong Listing Count", a: "295 out of 400", desc: "The API's claimed total_listings on projects rarely matches the actual listings array." },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center">
          <Lightbulb className="w-8 h-8 mr-3 text-yellow-500" />
          Data Insights & Findings
        </h1>
        <p className="mt-2 text-gray-500 max-w-3xl">
          We analyzed the entire Ivy Homes property dataset to uncover truth behind the broken documentation. Here are the precise answers to the 10 data questions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insightsData.map(item => (
          <div key={item.id} className="card p-6 flex items-start space-x-4 border-l-4" style={{ borderLeftColor: item.icon.props.className.match(/text-(\w+)-500/)[1] === 'blue' ? '#3b82f6' : item.icon.props.className.match(/text-(\w+)-500/)[1] === 'green' ? '#22c55e' : item.icon.props.className.match(/text-(\w+)-500/)[1] === 'red' ? '#ef4444' : item.icon.props.className.match(/text-(\w+)-500/)[1] === 'yellow' ? '#eab308' : item.icon.props.className.match(/text-(\w+)-500/)[1] === 'orange' ? '#f97316' : '#a855f7' }}>
            <div className="mt-1 bg-gray-50 p-2 rounded-lg shrink-0">
              {item.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{item.id}. {item.q}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{item.a}</p>
              <p className="text-sm text-gray-600 mt-2">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 bg-blue-50 border border-blue-100 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 flex items-center mb-2">
          <Search className="w-5 h-5 mr-2" />
          Methodology Note
        </h3>
        <p className="text-blue-800 text-sm">
          All calculations were performed programmatically in Python by pulling the full ~3,500 property dataset, running anomaly detection for corrupt rows, tracking geographic footprint for fake agents, and standardizing missing API timezones to IST bounds.
        </p>
      </div>
    </div>
  );
}
