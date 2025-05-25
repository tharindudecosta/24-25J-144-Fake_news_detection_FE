import React, { useState, useEffect } from "react";
import { auth, firestore } from "../../../firebaseconfig";
import { collection, query, where, getDocs, orderBy, doc, getDoc, collectionGroup } from "firebase/firestore";
import Niv from "@/components/niv";
import { format } from "date-fns";

interface FakeImageHistory {
  analyzedImageUrl: string;
  originalImageUrl: string;
  result: string;
  timestamp: any;
}

function History() {
  const [fakeImageHistory, setFakeImageHistory] = useState<FakeImageHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const userEmail = localStorage.getItem("user");
      if (!userEmail) return;

      try {
        // Fetch Fake Images History
        const fakeImagesRef = collection(firestore, "fakeimages", userEmail, "Results");
        const fakeImagesQuery = query(fakeImagesRef, orderBy("timestamp", "desc"));
        const fakeImagesSnapshot = await getDocs(fakeImagesQuery);
        
        const fakeImagesData = fakeImagesSnapshot.docs.map(doc => ({
          analyzedImageUrl: doc.data().analyzedImageUrl,
          originalImageUrl: doc.data().originalImageUrl,
          result: doc.data().result,
          timestamp: doc.data().timestamp?.toDate()
        })) as FakeImageHistory[];
        
        setFakeImageHistory(fakeImagesData);
        console.log("Fake Images History:", fakeImagesData);

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
        <h1 className="text-3xl font-bold text-orange-500 mb-8">Fake Images Verification History</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
              <thead className="bg-orange-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Original Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Analyzed Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Result</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fakeImageHistory.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <img 
                        src={item.originalImageUrl} 
                        alt="Original" 
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <img 
                        src={item.analyzedImageUrl} 
                        alt="Analyzed" 
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        {item.result || "N/A"}
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
