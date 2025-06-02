"use client";

import { useState } from "react";

// @ts-expect-error
import { parse } from "json2csv";

import { Download } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [numRecords, setNumRecords] = useState(0);
  const totalNumRecords = 6000;

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
        setNumRecords(prev => prev + data.companies.length);
        console.log(numRecords);
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
    <div className="flex flex-col w-screen h-screen items-center justify-center bg-gray-200 p-8">
      <div className="flex flex-col bg-gray-50 rounded-2xl shadow-lg w-5/6 lg: 3/4 xl:w-1/2 p-6 space-y-8 items-center justify-center">
        <div className="flex flex-col w-3/4">
        <p className="text-xl font-semibold text-gray-600 text-balance text-center">
          YC- backed companies list
        </p>
        <p className="text-lg text-gray-400 text-balance text-center">
          Click below to download a list of companies that Y Combinator has backed. This will take a moment.
        </p>
        </div>
        <button
          onClick={downloadCSV}
          disabled={loading}
          className={`flex px-4 py-4 text-lg font-bold text-gray-800 rounded-2xl transition tracking-wide 
          ${loading ? "text-gray-400 cursor-not-allowed" : "border-2 border shadow-xl hover:bg-gray-100"}`}
        >
          {loading ? "Downloading..." : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download-icon lucide-download"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>}
        </button>
        <div className="flex w-full items-center justify-center text-center">
          <pre className="flex w-full text-black items-center justify-center text-center">
            {loading ? Math.round((numRecords / totalNumRecords) * 100) + "%": "--"}
          </pre>
        </div>
      </div>
    </div>
  );
}
