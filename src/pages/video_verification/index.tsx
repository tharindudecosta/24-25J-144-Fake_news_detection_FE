import React, { useState } from "react";
import image3 from "../../../public/assets/img6.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Niv from "@/components/niv";
import Swal from "sweetalert2";
import { auth, firestore, storage } from "../../../firebaseconfig";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ImageLoader } from "next/image";

function Home() {
  const router = useRouter();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [aiResponse, setAIResponse] = useState("");

  const images: string[] = [];
  const [aiVerficationImages, setAiVerficationImages] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setVideoFile(event.target.files[0]);
    }
  };
  // Define the loader function with explicit typing
  const myLoader: ImageLoader = ({ src }: { src: string }) => {
    return `${src}`;
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
        "https://us-central1-regal-campus-448011-c9.cloudfunctions.net/deepfake",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();

        if (result.result) {
          const apiresult = result.result;
          console.log("Cheking Deepfake");
          setAIResponse(apiresult);

          if (apiresult === "1") {
            setAIResponse(apiresult);
            console.log("Cheking lighting");

            const response_new = await fetch(
              "http://127.0.0.1:5000/predictLightning",
              {
                method: "POST",
                body: formData,
              }
            );

            if (response_new.ok) {
              const result_new = await response_new.json();

              // if (result_new.re)
              const apiresult_new = result_new.prediction;

              console.log("API resutl new " + apiresult_new);

              setAIResponse(apiresult_new);
            } else {
              setAIResponse(apiresult);
            }
          }

          const response_cam = await fetch(
            "http://127.0.0.1:5000/generateCAM",
            {
              method: "POST",
              body: formData,
            }
          );
          if (response_cam.ok) {
            const result_cam = await response_cam.json();
            console.log("result_cam " + result_cam.processed_images);

            // if (result_new.re)
            const apiresult_new = result_cam.processed_images;

            setAiVerficationImages(apiresult_new);
          } else {
            setAiVerficationImages([]);
          }

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
              <div className="card bg-neutral-600 rounded-box h-[300px] flex-grow me-3 relative mt-[50px]">
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

      <div className="card border border-orange-500 bg-orange-100 border-[3px] rounded-box h-[150px] flex-grow  m-5">
        <b className="text-1.5xl m-5">"AI verifies Result:"</b>
        <div className="text-center">
          {aiResponse || "Awaiting analysis..."}
        </div>
      </div>

      <div className="card border border-orange-500 bg-orange-100 border-[3px] rounded-box h-[150px] flex-grow  m-5">
        <b className="text-1.5xl m-5">"AI verifies Images:"</b>
        <div className="text-center">
          {aiVerficationImages.length === 0
            ? "Awaiting images..."
            : aiVerficationImages.map((src, index) => (
                <div key={index} className="mb-4">
                  <Image
                    loader={myLoader}
                    src={src}
                    alt={`Image ${index + 1}`}
                    width={200}
                    height={200}
                    quality={100}
                    priority
                  />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
