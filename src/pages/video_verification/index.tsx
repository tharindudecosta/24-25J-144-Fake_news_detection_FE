import React, { useState } from "react";
import image3 from "../../../public/assets/img6.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Niv from "@/components/niv";
import Swal from "sweetalert2";
import { auth, firestore, storage } from "../../../firebaseconfig";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function Home() {
  const router = useRouter();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [aiResponse, setAIResponse] = useState("");

  const checkPremiumStatus = async (userEmail: string) => {
    const paymentRef = doc(firestore, "payment", userEmail);
    const paymentDoc = await getDoc(paymentRef);

    if (paymentDoc.exists()) {
      const data = paymentDoc.data();
      const expire = data.expire?.toDate();
      return expire && expire > new Date();
    }
    return false;
  };

  const checkDailyVerifications = async (userEmail: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userDocRef = collection(
      firestore,
      "VideoVerification",
      userEmail,
      "Results"
    );
    const q = query(userDocRef, where("timestamp", ">=", today));

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setVideoFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    const userEmail = localStorage.getItem("user");
    if (!userEmail) {
      Swal.fire("Error", "User email not found. Please log in.", "error");
      return;
    }

    if (!videoFile) {
      Swal.fire("Error", "Please select a video file to upload!", "error");
      return;
    }

    const isPremium = await checkPremiumStatus(userEmail);
    const verificationsToday = await checkDailyVerifications(userEmail);

    if (!isPremium && verificationsToday >= 3) {
      const result = await Swal.fire({
        title: "Daily Limit Reached",
        text: "You have reached your daily limit of 3 video verifications. Please upgrade to premium to continue.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Upgrade to Premium",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        router.push("/paymentGateWay");
      } else {
        window.location.reload();
      }
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      Swal.fire({
        title: "Uploading...",
        text: "Please wait while your video is being uploaded.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const storageRef = ref(
        storage,
        `VideoVerification/${userEmail}/Results/${Date.now()}_${videoFile.name}`
      );
      await uploadBytes(storageRef, videoFile);

      const videoUrl = await getDownloadURL(storageRef);

      const response = await fetch(
        "https://deepfake-766120731872.us-central1.run.app",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();

        if (result.result) {
          const apiresult = result.result;

          const userDocRef = collection(
            firestore,
            "VideoVerification",
            userEmail,
            "Results"
          );
          await addDoc(userDocRef, {
            result: apiresult,
            videoUrl: videoUrl,
            timestamp: new Date(),
          });

          setAIResponse(apiresult);
          Swal.fire(
            "Success",
            "Video uploaded and analyzed successfully!",
            "success"
          );
        } else {
          Swal.fire(
            "Error",
            "Invalid API response: Missing result field.",
            "error"
          );
        }
      } else {
        Swal.fire("Error", "Failed to upload video!", "error");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      Swal.fire("Error", "An error occurred during the upload!", "error");
    }
  };

  const handleClear = () => {
    setVideoFile(null);
    setAIResponse("");
    window.location.reload();
    Swal.fire("Cleared", "The text and AI result have been cleared.", "info");
  };

  return (
    <div>
      <Niv />
      <div className="flex p-4">
        <div className="flex flex-col lg:flex-row w-full max-w-8xl">
          <div className="w-1/2 flex flex-col justify-center px-8 py-12 mt-5">
            <h2 className="text-orange-500 text-3xl font-bold mb-8">
              Video Verification: Check Video Authenticity
            </h2>

            <b className="text-1.5xl me-5">
              Upload a video and let AI determine if it's real or fake
            </b>

            <div className="card w-96 flex-grow me-3 relative">
              <p>
                "Not sure if a video is authentic or manipulated? Upload your
                video, and our AI-powered verification system will analyze it
                for signs of manipulation, deepfakes, or alterations. Whether
                you're checking for fake news, doctored footage, or AI-generated
                content, our system provides quick and accurate results to help
                you identify real from fake content."
              </p>
            </div>
          </div>
          <div className="flex justify-center lg:w-1/2 w-full mb-8 lg:mb-0">
            <div>
              <div className="flex justify-end mb-4">
                <button
                  className="bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-700"
                  onClick={() => router.push('/fakevideoHistory')}
                >
                  View History
                </button>
              </div>
              <div className="card bg-neutral-600 rounded-box h-[300px] flex-grow me-3 relative">
                <Image
                  className="lg:w-[450px] mb-[50px]"
                  src={image3}
                  alt="Your Company"
                />
              </div>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="py-2 mt-4 mb-4 block w-full text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              <div className="flex gap-2 mt-5">
                <button
                  className="bg-blue-900 text-white w-full font-bold py-2 px-4 rounded"
                  onClick={handleUpload}
                >
                  Upload a Video
                </button>
                <button
                  className="bg-red-600 text-white w-full font-bold py-2 px-4 rounded"
                  onClick={handleClear}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border border-orange-500 bg-orange-100 border-[3px] rounded-box p-6 m-5">
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-bold text-orange-700 mb-4">
            AI Verification Result
          </h3>
          <div
            className={`text-center p-4 rounded-lg w-full ${
              aiResponse ? "bg-white shadow-md" : "bg-orange-50"
            }`}
          >
            {aiResponse ? (
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-800">
                  {aiResponse}
                </p>
                <p className="text-sm text-gray-600">
                  This result is based on our AI analysis of your video
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-pulse h-2 w-2 bg-orange-500 rounded-full"></div>
                <div className="animate-pulse h-2 w-2 bg-orange-500 rounded-full"></div>
                <div className="animate-pulse h-2 w-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">Awaiting analysis...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
