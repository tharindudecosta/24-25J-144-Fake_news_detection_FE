import React, { useState } from "react";
import image3 from "../../../public/assets/image10.png";
import Image from "next/image";
import Niv from "@/components/niv";
import Swal from "sweetalert2";
import axios from "axios";
import { useRouter } from "next/navigation";
import { auth, firestore, storage } from "../../../firebaseconfig";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface ResultItem {
  label: string;
  confidence: string;
  color: string;
}

function Home() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [input, setInput] = useState<ResultItem[]>([]);
  const [outputImage, setOutputImage] = useState<string>("");

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
      "fakeimages",
      userEmail,
      "Results"
    );
    const q = query(userDocRef, where("timestamp", ">=", today));

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  };

  const formatResult = (result: string): ResultItem[] => {
    try {
      const parts = result.split(",");
      const formattedResults = parts.map((part) => {
        const trimmedPart = part.trim();
        const lastSpaceIndex = trimmedPart.lastIndexOf(" ");
        const label = trimmedPart.substring(0, lastSpaceIndex).trim();
        const value = trimmedPart.substring(lastSpaceIndex + 1).trim();
        const numValue = parseFloat(value);
        const percentage = isNaN(numValue)
          ? "0%"
          : (numValue * 100).toFixed(0) + "%";
        return {
          label,
          confidence: percentage,
          color: "gray",
        };
      });

      return formattedResults;
    } catch (error) {
      return [
        {
          label: "Error",
          confidence: "Unable to process results",
          color: "gray",
        },
      ];
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      Swal.fire("Error", "Please select an image file to upload!", "error");
      return;
    }

    const userEmail = localStorage.getItem("user");
    if (!userEmail) {
      Swal.fire("Error", "User email not found. Please log in.", "error");
      return;
    }

    const isPremium = await checkPremiumStatus(userEmail);
    const verificationsToday = await checkDailyVerifications(userEmail);

    if (!isPremium && verificationsToday >= 3) {
      const result = await Swal.fire({
        title: "Daily Limit Reached",
        text: "You have reached your daily limit of 3 image verifications. Please upgrade to premium to continue.",
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
    formData.append("file", file);

    Swal.fire({
      title: "Processing...",
      html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
      allowOutsideClick: false,
      showCancelButton: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const originalImageRef = ref(
        storage,
        `fakeimages/${userEmail}/original/${Date.now()}_${file.name}`
      );
      await uploadBytes(originalImageRef, file);
      const originalImageUrl = await getDownloadURL(originalImageRef);

      const response = await axios.post(
        "https://deepfakedetectorservice-766120731872.us-central1.run.app/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        const formattedResults = formatResult(response.data.result);
        setInput(formattedResults);
        setOutputImage(response.data.output_image);

        const userDocRef = collection(
          firestore,
          "fakeimages",
          userEmail,
          "Results"
        );
        await addDoc(userDocRef, {
          result: response.data.result,
          originalImageUrl: originalImageUrl,
          analyzedImageUrl: response.data.output_image,
          timestamp: new Date(),
        });

        Swal.fire({
          title: "Uploaded Successfully!",
          text: "Your file has been uploaded and processed.",
          icon: "success",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);

      Swal.fire({
        title: "Upload Failed!",
        text: "Something went wrong while uploading the file.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
    }
  };

  const handleClear = () => {
    setFile(null);
    setInput([]);
    setOutputImage("");
    window.location.reload();
  };

  return (
    <div>
      <Niv />
      <div className="flex p-4">
        <div className="flex flex-col lg:flex-row w-full max-w-8xl">
          <div className="w-1/2 flex flex-col justify-center px-8 py-12 mt-5">
            <h2 className="text-orange-500 text-3xl font-bold mb-8">
              Image Verification: Check Authenticity
            </h2>

            <b className="text-1.5xl me-5">
              "Upload an image and let AI verify its origin."
            </b>

            <div className="card w-96 flex-grow me-3 relative">
              <p>
                "Wondering if an image is real or generated by AI? Simply upload
                the image, and our advanced AI algorithms will analyze its
                features to determine its authenticity. Whether you're dealing
                with altered photos, AI-generated visuals, or genuine content,
                our system provides quick, reliable results, helping you stay
                informed and avoid misinformation."
              </p>
            </div>
          </div>
          <div className="flex justify-center lg:w-1/2 w-full mb-8 lg:mb-0">
            <div className="relative w-full">
              <div className="absolute top-0 right-0 z-10">
                <button
                  className="bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-700"
                  onClick={() => router.push('/fakeImagesHistory')}
                >
                  View History
                </button>
              </div>
              <div>
                <div className="card bg-neutral-600 rounded-box h-[300px] flex-grow me-3 relative mt-[50px]">
                  {
                    <Image
                      className="lg:w-[500px] p-5"
                      src={image3}
                      alt="Your Company"
                    />
                  }
                </div>
                <input
                  type="file"
                  className="file-input file-input-bordered bg-blue-900 text-white w-full rounded mt-5"
                  onChange={handleFileChange}
                />
                <div className="flex gap-2 mt-5">
                  {file && (
                    <button
                      className="bg-blue-900 text-white w-full font-bold py-2 px-4 rounded"
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>
                  )}
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
      </div>
      <div className="card border border-orange-500 bg-orange-100 border-[3px] rounded-box min-h-[200px] flex-grow m-5 p-4">
        <h3 className="text-2xl font-bold mb-6 text-orange-700 text-center">
          AI Analysis Results
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h4 className="text-lg font-semibold mb-2 text-center">
              Original Image
            </h4>
            {file ? (
              <Image
                src={URL.createObjectURL(file)}
                alt="Original Image"
                width={300}
                height={200}
                className="mx-auto"
              />
            ) : (
              <div className="text-center text-gray-500">No image uploaded</div>
            )}
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h4 className="text-lg font-semibold mb-2 text-center">
              Analyzed Image
            </h4>
            {outputImage ? (
              <Image
                src={outputImage}
                alt="Analyzed Image"
                width={300}
                height={200}
                className="mx-auto"
              />
            ) : (
              <div className="text-center text-gray-500">
                No analysis available
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {input.map((result, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 shadow-md transform transition-all hover:scale-105 border-l-4 border-gray-500"
            >
              <div className="text-lg font-semibold mb-2">{result.label}</div>
              <div className="text-sm text-gray-600">{result.confidence}</div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-gray-500"
                    style={{ width: result.confidence }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
