import React, { useState, useEffect } from "react";
import { auth, firestore } from "../../../firebaseconfig";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
  collectionGroup,
} from "firebase/firestore";
import Niv from "@/components/niv";
import { format } from "date-fns";

interface VideoVerificationHistory {
  videoUrl: string;
  result: string;
  timestamp: any;
  fake_count: string;
  real_count: string;
  total_count: string;
  total_time: string;
  title: string;
}

// fake_count: result.fake_count,
// real_count: result.real_count,
// total_count: result.total_count,

function History() {
  const [videoHistory, setVideoHistory] = useState<VideoVerificationHistory[]>(
    []
  );

  const [videoLightingHistory, setVideoLightingHistory] = useState<
    VideoVerificationHistory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [historyTwo, setHistoryTwo] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      const userEmail = localStorage.getItem("user");
      if (!userEmail) return;

      try {
        // Fetch Video Verification History
        const videoRef = collection(
          firestore,
          "VideoVerification",
          userEmail,
          "Results"
        );
        const videoQuery = query(videoRef, orderBy("timestamp", "desc"));
        const videoSnapshot = await getDocs(videoQuery);

        const videoData = videoSnapshot.docs.map((doc) => ({
          videoUrl: doc.data().videoUrl,
          result: doc.data().result,
          timestamp: doc.data().timestamp?.toDate(),
          fake_count: doc.data().fake_count,
          real_count: doc.data().real_count,
          total_count: doc.data().total_count,
          total_time: doc.data().total_time,
          title: doc.data().title,
        })) as VideoVerificationHistory[];

        setVideoHistory(videoData);

        const videoLRef = collection(
          firestore,
          "VideoVerificationLighting",
          userEmail,
          "Results"
        );
        const videoLQuery = query(videoLRef, orderBy("timestamp", "desc"));
        const videoLSnapshot = await getDocs(videoLQuery);

        const videoLData = videoLSnapshot.docs.map((doc) => ({
          videoUrl: doc.data().videoUrl,
          result: doc.data().result,
          timestamp: doc.data().timestamp?.toDate(),
          fake_count: doc.data().fake_count,
          real_count: doc.data().real_count,
          total_count: doc.data().total_count,
          total_time: doc.data().total_time,
          title: doc.data().title,
        })) as VideoVerificationHistory[];

        setVideoLightingHistory(videoLData);

        console.log("Video L Verification History:", videoLData);

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
        <h1 className="text-3xl font-bold text-orange-500 mb-8">
          Video Verification History
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex justify-end mb-4">
              <button
                className="bg-orange-500 text-white font-semibold py-2 px-4 rounded hover:bg-orange-600"
                onClick={() => setHistoryTwo(!historyTwo)}
              >
                {historyTwo ? "Show Regular History" : "Show Lighting History"}
              </button>
            </div>
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
              <thead className="bg-orange-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Fake frame count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Real frame count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Total frame count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Total Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    title
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(historyTwo ? videoLightingHistory : videoHistory).map(
                  (item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <video
                          controls
                          className="w-64 h-48 object-cover rounded-lg"
                        >
                          <source src={item.videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            item.result === "Fake"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.result || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.timestamp ? formatDate(item.timestamp) : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.fake_count || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.real_count || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.total_count || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.total_time || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.title || "N/A"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
