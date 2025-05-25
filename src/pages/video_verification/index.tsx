import React, { useState, useRef } from "react";
import image3 from "../../../public/assets/img6.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Niv from "@/components/niv";
import Swal from "sweetalert2";
import { ImageLoader } from "next/image";
import { sendVideoToAPI, analyzeLighting, generateCAM } from "./apiFunctions";
import { generatePdfReport } from "./generatePdfReport";
import { LuScanFace } from "react-icons/lu";
import { MdLightMode } from "react-icons/md";
import { IoImagesSharp } from "react-icons/io5";
import { MdClear } from "react-icons/md";
import { FaFilePdf } from "react-icons/fa6";
import ContentBar from "./contentBar";
import { checkPremium } from "./checkPremiumVideo";

function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoName, setVideoName] = useState<string>("");
  const [videoURL, setVideoURL] = useState<string>("");
  const [aiResponse, setAIResponse] = useState<any>(null);
  const [aiLightingResponse, setAILightingResponse] = useState<any>(null);
  const [aiVerficationImages, setAiVerficationImages] = useState<string[]>([]);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setVideoFile(e.target.files[0]);
      setVideoName(e.target.files[0].name);
    }
  };
  const router = useRouter();
  const runDeepfakeDetection = async () => {
    const userEmail = localStorage.getItem("user");
    if (!userEmail) {
      Swal.fire("Error", "User email not found. Please log in.", "error");
      return;
    }
    const hasPremium = await checkPremium(userEmail, router);
    if (!hasPremium) return;
    if (!videoFile)
      return Swal.fire("No video", "Upload a video first", "warning");
    const formData = new FormData();
    formData.append("video", videoFile);

    Swal.fire({
      title: "Analyzing deepfake...",
      didOpen: () => Swal.showLoading(),
    });

    const result = await sendVideoToAPI(videoFile, userEmail);
    if (result) {
      setAIResponse(result);
      console.log(result);

      if (result.prediction === "Real") {
        // Ask user if they want to run lighting analysis
        const confirmation = await Swal.fire({
          title: "Deepfake Result: Real",
          text: "Do you want to run lighting analysis?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes, run it",
          cancelButtonText: "No, skip",
        });

        if (confirmation.isConfirmed) {
          runLightingAnalysis(result);
        }
      }
      // Swal.fire("Result", `Deepfake: ${result.prediction}`, "info");
    } else {
      Swal.fire("Error", "Invalid response from deepfake API", "error");
    }
  };

  const runLightingAnalysis = async (aiResponseResult?: any) => {
    const userEmail = localStorage.getItem("user");
    if (!userEmail) {
      Swal.fire("Error", "User email not found. Please log in.", "error");
      return;
    }
    if (!videoFile)
      return Swal.fire("No video", "Upload a video first", "warning");

    Swal.fire({
      title: "Analyzing lighting...",
      didOpen: () => Swal.showLoading(),
    });

    const result2 = await analyzeLighting(
      videoFile,
      userEmail,
      aiResponseResult
    );
    if (result2) {
      setAILightingResponse(result2);
      Swal.fire("Result", `Deepfake results recieved`, "info");
      // Swal.fire("Lighting Prediction", result.prediction, "info");
    } else {
      Swal.fire("Error", "Lighting analysis failed", "error");
    }
  };

  const runGenerateCAM = async () => {
    const userEmail = localStorage.getItem("user");
    if (!userEmail) {
      Swal.fire("Error", "User email not found. Please log in.", "error");
      return;
    }

    if (!videoFile)
      return Swal.fire("No video", "Upload a video first", "warning");

    Swal.fire({
      title: "Generating Analysis images...",
      didOpen: () => Swal.showLoading(),
    });

    const result = await generateCAM(videoFile, userEmail);
    if (result?.processed_images) {
      setAiVerficationImages(result.processed_images);
      Swal.fire("Success", "Images generated", "success");
    } else {
      Swal.fire("Error", "Analysis image generation failed", "error");
    }
  };

  const handleClear = () => {
    setVideoFile(null);
    setVideoURL("");
    setAIResponse("");
    setAILightingResponse("");
    setAiVerficationImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    Swal.fire("Cleared", "All data reset", "info");
  };

  const getPdf = async () => {
    const userEmail = localStorage.getItem("user");
    if (!userEmail) {
      Swal.fire("Error", "User email not found. Please log in.", "error");
      return;
    }

    if (!aiResponse && !aiLightingResponse && aiVerficationImages.length === 0)
      return Swal.fire("Start analysis", "Upload a video first", "warning");

    const result = await generatePdfReport(
      aiResponse,
      aiLightingResponse,
      aiVerficationImages,
      videoName,
      userEmail
    );
  };

  // const myLoader = ({ src }: { src: string }) => `${src}`;
  const myLoader: ImageLoader = ({ src }: { src: string }) => {
    return `${src}`;
  };

  return (
    <div>
      <Niv />
      <div className="flex flex-col lg:flex-row w-full max-w-8xl">
        <div className="flex justify-center lg:w-1/2 w-full mb-8 lg:mb-0 p-4">
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
              ref={fileInputRef}
              onChange={handleFileChange}
              className="py-2 mt-4 mb-4 block w-full text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <div className="w-full flex flex-col px-8 py-12 mt-5">
            <div className="flex justify-end mb-4">
              <button
                className="bg-gray-600 text-white font-bold py-2 px-4 rounded"
                onClick={() => router.push("/fakevideoHistory")}
              >
                View History
              </button>
              
            </div>
            <h2 className="text-orange-500 text-3xl font-bold mb-8">
              Video Verification: Check Video Authenticity
            </h2>

            <b className="text-1.5xl me-5">
              Upload a video and let AI determine if it's real or fake
            </b>

            <div className="card w-96 flex-grow me-3 relative">
              <p>
                "Not sure if a video is authentic or manipulated? Upload your
                video, and our Deep learning verification system will analyze it
                for signs of manipulation, deepfakes, or alterations. Whether
                you're checking for fake news, doctored footage, our system
                provides quick and accurate results to help you identify real
                from fake content."
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Upload Section */}
      <div className="flex flex-col lg:flex-row gap-6 p-4">
        <div className="flex-1">
          {/* <input type="file" accept="video/*" onChange={handleFileChange} /> */}
          <div className="flex gap-2 mt-4">
            <button
              className="bg-blue-700 text-white p-2 rounded hover:bg-blue-500"
              onClick={runDeepfakeDetection}
            >
              <LuScanFace size={70} />
              Deepfake Detection
            </button>
            {/* <button
              className="bg-yellow-600 text-white p-2 rounded hover:bg-yellow-500"
              onClick={runLightingAnalysis}
            >
              <MdLightMode size={70} />
              Analyze Lighting
            </button> */}
            <button
              className="bg-purple-700 text-white p-2 rounded hover:bg-purple-500"
              onClick={runGenerateCAM}
            >
              <IoImagesSharp size={70} />
              Generate Analyzed frames
            </button>
            <button
              className="bg-red-600 text-white p-2 rounded hover:bg-red-500"
              onClick={handleClear}
            >
              <MdClear size={70} />
              Clear All
            </button>
            <button
              className="bg-green-700 text-white p-2 rounded hover:bg-green-500"
              onClick={getPdf}
            >
              <FaFilePdf size={70} />
              Report
            </button>
          </div>
        </div>
      </div>

      {/* AI Response */}
      <div className="card border border-orange-500 bg-orange-100 m-5 p-4">
        <b className="text-xl flex items-center gap-2">
          Video Analysis Response:
          <div className="relative group">
            <span className="text-white bg-gray-600 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer text-sm">
              ?
            </span>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 text-xs text-white bg-black p-2 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
              This shows the results of the frame level anlysis of the physical
              aspects of the face in the video using a YOLO-V8n based model
            </div>
          </div>
        </b>
        <div
          className={`text-center p-4 rounded-lg w-full ${
            aiResponse ? "bg-white shadow-md" : "bg-orange-50"
          }`}
        >
          {aiResponse ? (
            <div>
              <ContentBar
                fakeCount={aiResponse.fake_count}
                totalCount={aiResponse.total_count}
              />

              <table className="table-auto border-collapse border border-gray-400 mt-4 w-full">
                <thead>
                  <tr className="bg-blue-200">
                    <th className="border border-gray-400 px-4 py-2">
                      Fake Frame Count
                    </th>
                    <th className="border border-gray-400 px-4 py-2">
                      Real Frame Count
                    </th>
                    <th className="border border-gray-400 px-4 py-2">
                      Total Frame Count
                    </th>
                    <th className="border border-gray-400 px-4 py-2">
                      Final Prediction
                    </th>
                    <th className="border border-gray-400 px-4 py-2">
                      Time Elapsed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border border-gray-400 px-4 py-2">
                      {aiResponse.fake_count}
                    </td>
                    <td className="border border-gray-400 px-4 py-2">
                      {aiResponse.real_count}
                    </td>
                    <td className="border border-gray-400 px-4 py-2">
                      {aiResponse.total_count}
                    </td>
                    <td className="border border-gray-400 px-4 py-2">
                      {aiResponse.prediction}
                    </td>
                    <td className="border border-gray-400 px-4 py-2">
                      {aiResponse.total_time} Seconds
                    </td>
                  </tr>
                </tbody>
              </table>
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

      {aiLightingResponse ? (
        <div className="card border border-orange-500 bg-orange-100 m-5 p-4">
          <b className="text-xl flex items-center gap-2">
            Lighting Analysis Response:
            <div className="relative group">
              <span className="text-white bg-gray-600 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer text-sm">
                ?
              </span>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 text-xs text-white bg-black p-2 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
                This shows the results of the frame level anlysis of the
                lighting aspect of the video using a Resnet-50 based model
              </div>
            </div>
          </b>
          <div
            className={`text-center p-4 rounded-lg w-full ${
              aiLightingResponse ? "bg-white shadow-md" : "bg-orange-50"
            }`}
          >
            {aiLightingResponse ? (
              <div>
                <ContentBar
                  fakeCount={aiLightingResponse.fake_count}
                  totalCount={aiLightingResponse.total_count}
                />

                <table className="table-auto border-collapse border border-gray-400 mt-4 w-full">
                  <thead>
                    <tr className="bg-blue-200">
                      <th className="border border-gray-400 px-4 py-2">
                        Fake Frame Count
                      </th>
                      <th className="border border-gray-400 px-4 py-2">
                        Real Frame Count
                      </th>
                      <th className="border border-gray-400 px-4 py-2">
                        Total Frame Count
                      </th>
                      <th className="border border-gray-400 px-4 py-2">
                        Final Prediction
                      </th>
                      <th className="border border-gray-400 px-4 py-2">
                        Time Elapsed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="border border-gray-400 px-4 py-2">
                        {aiLightingResponse.fake_count}
                      </td>
                      <td className="border border-gray-400 px-4 py-2">
                        {aiLightingResponse.real_count}
                      </td>
                      <td className="border border-gray-400 px-4 py-2">
                        {aiLightingResponse.total_count}
                      </td>
                      <td className="border border-gray-400 px-4 py-2">
                        {aiLightingResponse.prediction}
                      </td>
                      <td className="border border-gray-400 px-4 py-2">
                        {aiLightingResponse.total_time} Seconds
                      </td>
                    </tr>
                  </tbody>
                </table>
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
      ) : (
        ""
      )}
      {/* CAM Images */}
      <div className="card border border-orange-500 bg-orange-100 m-5 p-4">
        <b className="text-xl flex items-center gap-2">
          Analyzed Images:
          <div className="relative group">
            <span className="text-white bg-gray-600 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer text-sm">
              ?
            </span>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 text-xs text-white bg-black p-2 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
              These are Class Activation Map (CAM) images showing which areas
              influenced the AI's decision.
            </div>
          </div>
        </b>{" "}
        <div
          className={`text-center p-4 rounded-lg w-full ${
            aiVerficationImages.length > 0
              ? "bg-white shadow-md"
              : "bg-orange-50"
          }`}
        >
          {aiVerficationImages.length > 0 ? (
            // ✅ Wrap all images in one flex container
            <div className="flex flex-wrap justify-center gap-4">
              {aiVerficationImages.map((src, index) => (
                <Image
                  key={index}
                  loader={myLoader}
                  src={src}
                  alt={`Image ${index + 1}`}
                  width={200}
                  height={200}
                  className="rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
                  onClick={() => setEnlargedImage(src)}
                />
              ))}
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

      {enlargedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setEnlargedImage(null)} // close on background click
        >
          <div className="relative">
            <Image
              loader={myLoader}
              src={enlargedImage}
              alt="Enlarged"
              width={800}
              height={600}
              className="rounded-lg shadow-lg max-w-full max-h-[90vh]"
            />
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute top-2 right-2 text-white text-3xl font-bold"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
