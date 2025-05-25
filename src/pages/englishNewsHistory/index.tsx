import React, { useState, useEffect } from "react";
import { auth, firestore } from "../../../firebaseconfig";
import { collection, query, where, getDocs, orderBy, doc, getDoc, collectionGroup } from "firebase/firestore";
import Niv from "@/components/niv";
import { format } from "date-fns";

interface NewsHistory {
  inputText: string;
  aiResult: string;
  bbcResult: string;
  timestamp: any;
}

function History() {
  const [englishHistory, setEnglishHistory] = useState<NewsHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const userEmail = localStorage.getItem("user");
      if (!userEmail) return;

      try {
        // Fetch English News History
        const englishResultsRef = collection(firestore, "EnglishNews", userEmail, "Results");
        const englishQuery = query(englishResultsRef, orderBy("timestamp", "desc"));
        const englishSnapshot = await getDocs(englishQuery);
        
        const englishData = englishSnapshot.docs.map(doc => ({
          inputText: doc.data().inputText,
          aiResult: doc.data().aiResult,
          bbcResult: doc.data().bbcResult,
          timestamp: doc.data().timestamp?.toDate()
        })) as NewsHistory[];
        
        setEnglishHistory(englishData);
        console.log("English History:", englishData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching history:", error);
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (date: Date) => {
    return format(date, "MMM dd, yyyy HH:mm:ss");
  };

  return (
    <div>
      <Niv />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-orange-500 mb-8">English News Verification History</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
              <thead className="bg-orange-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Text</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">AI Result</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">BBC Result</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {englishHistory.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-normal max-w-md">{item.inputText}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        item.aiResult?.toLowerCase() === "fake" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}>
                        {item.aiResult || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        item.bbcResult?.toLowerCase() === "fake" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}>
                        {item.bbcResult || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.timestamp ? formatDate(item.timestamp) : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
