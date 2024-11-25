"use client"; 

import { useState } from "react";
import { parse } from "json2csv";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const downloadCSV = async () => {
    console.log("Request in progress...")
    setLoading(true);
  
    try {
      const allCompanies = [];
      let nextPage = "https://api.ycombinator.com/v0.1/companies";
  
      while (nextPage) {
        console.log("Getting " + nextPage)
        const response = await fetch(nextPage);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
  
        const data = await response.json();
        allCompanies.push(...data.companies);
        nextPage = data.nextPage; 
      }
  
      const flatData = allCompanies.map((company) => ({
        id: company.id,
        name: company.name,
        website: company.website,
        oneLiner: company.oneLiner,
        longDescription: company.longDescription,
        teamSize: company.teamSize,
        status: company.status,
        batch: company.batch,
        tags: company.tags.join(","),
        industries: company.industries.join(","),
        regions: company.regions.join(","),
        locations: company.locations.join(","),
      }));
  
      const csv = parse(flatData);
  
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "yc-companies.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading CSV:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        YC-backed Companies as CSV
      </h1>
      <button
        onClick={downloadCSV}
        disabled={loading}
        className={`px-6 py-3 text-lg font-medium text-white rounded-lg transition 
          ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {loading ? "Downloading..." : "Download CSV"}
      </button>
    </div>
  );
}
