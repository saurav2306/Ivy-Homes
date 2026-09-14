export default function Insights() {
  return (
    <div>
      <h2>Data Insights</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Question</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Answer</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>1. Total Listing Records</td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>3500</td>
          </tr>
          <tr>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>2. Unique Properties</td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>~3497 (Identified 3 cross-site duplicate pairs)</td>
          </tr>
          <tr>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>3. Active Listings</td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>2792</td>
          </tr>
          <tr>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>4. Corrupt Listing IDs</td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>
              18 IDs found: e.g. 100-6001461, 100-6000323, 100-6000338. (Negative price, floor &gt; total floors, carpet &gt; SBA)
            </td>
          </tr>
          <tr>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>5. Total Monthly Rent (Sohna Road)</td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>₹3,733,800</td>
          </tr>
          <tr>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>6. Avg Price per Sqft (2BHK)</td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>~₹26,803 (Needs fake listings excluded)</td>
          </tr>
          <tr>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>7. Costliest Project</td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>P60090 (₹98.9 Crores)</td>
          </tr>
          <tr>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>8. Listings in Last 7 Days</td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>129</td>
          </tr>
          <tr>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>9. Fake Listing IDs</td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>Identified multiple lead-gen accounts (e.g. +912009782693 with 35 listings in 34 apartments)</td>
          </tr>
          <tr>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>10. Projects with Wrong Listing Count</td>
            <td style={{ padding: "10px", border: "1px solid #ddd" }}>295 out of 400</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
