import React, { useState } from "react";
import image3 from "../../../public/assets/img6.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Niv from "@/components/niv";
import Swal from "sweetalert2";
import { ImageLoader } from "next/image";
import { sendVideoToAPI, analyzeLighting, generateCAM } from "./apiFunctions";
import { generatePdfReport } from "./generatePdfReport"
import { LuScanFace } from "react-icons/lu";
import { MdLightMode } from "react-icons/md";
import { IoImagesSharp } from "react-icons/io5";
import { MdClear } from "react-icons/md";
import { FaFilePdf } from "react-icons/fa6";

function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoName, setVideoName] = useState<string>("");
  const [videoURL, setVideoURL] = useState<string>("");
  const [aiResponse, setAIResponse] = useState<any>(null);
  const [aiLightingResponse, setAILightingResponse] = useState<any>(null);
  const [aiVerficationImages, setAiVerficationImages] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setVideoFile(e.target.files[0]);
      setVideoName(e.target.files[0].name)
    }
  };

  const runDeepfakeDetection = async () => {
    const userEmail = localStorage.getItem("user");
    if (!userEmail) {
      Swal.fire("Error", "User email not found. Please log in.", "error");
      return;
    }
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
      Swal.fire("Result", `Deepfake: ${result.prediction}`, "info");
    } else {
      Swal.fire("Error", "Invalid response from deepfake API", "error");
    }
  };

  const runLightingAnalysis = async () => {
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

    const result = await analyzeLighting(videoFile, userEmail);
    if (result) {
      setAILightingResponse(result);
      Swal.fire("Lighting Prediction", result.prediction, "info");
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
      title: "Generating CAM images...",
      didOpen: () => Swal.showLoading(),
    });

    const result = await generateCAM(videoFile, userEmail);
    if (result?.processed_images) {
      setAiVerficationImages(result.processed_images);
      Swal.fire("Success", "Images generated", "success");
    } else {
      Swal.fire("Error", "CAM generation failed", "error");
    }
  };

  const handleClear = () => {
    setVideoFile(null);
    setVideoURL("");
    setAIResponse("");
    setAILightingResponse("");
    setAiVerficationImages([]);
    Swal.fire("Cleared", "All data reset", "info");
  };

  const getPdf = async () => {
    const userEmail = localStorage.getItem("user");
    if (!userEmail) {
      Swal.fire("Error", "User email not found. Please log in.", "error");
      return;
    }
    const result = await generatePdfReport(aiResponse, aiLightingResponse,aiVerficationImages,videoName,userEmail);
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
              onChange={handleFileChange}
              className="py-2 mt-4 mb-4 block w-full text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

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
              video, and our Deep learning verification system will analyze it
              for signs of manipulation, deepfakes, or alterations. Whether
              you're checking for fake news, doctored footage, our system
              provides quick and accurate results to help you identify real from
              fake content."
            </p>
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
            <button
              className="bg-yellow-600 text-white p-2 rounded hover:bg-yellow-500"
              onClick={runLightingAnalysis}
            >
              <MdLightMode size={70} />
              Analyze Lighting
            </button>
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
        <b className="text-xl">Vider Analysis Response:</b>
        {aiResponse ? (
          <table className="table-auto border-collapse border border-gray-400 mt-4 w-full">
            <thead>
              <tr className="bg-blue-200">
                <th className="border border-gray-400 px-4 py-2">Fake Frame Count</th>
                <th className="border border-gray-400 px-4 py-2">Real Frame Count</th>
                <th className="border border-gray-400 px-4 py-2">Total Frame Count</th>
                <th className="border border-gray-400 px-4 py-2">Final Prediction</th>
                <th className="border border-gray-400 px-4 py-2">Time Elapsed</th>
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
                  {aiResponse.total_time}
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p>No analysis result yet</p>
        )}
      </div>

      <div className="card border border-orange-500 bg-orange-100 m-5 p-4">
        <b className="text-xl">Lighting Response:</b>
        {aiLightingResponse ? (
          <table className="table-auto border-collapse border border-gray-400 mt-4 w-full">
            <thead>
              <tr className="bg-blue-200">
                <th className="border border-gray-400 px-4 py-2">Fake Frame Count</th>
                <th className="border border-gray-400 px-4 py-2">Real Frame Count</th>
                <th className="border border-gray-400 px-4 py-2">Total Frame Count</th>
                <th className="border border-gray-400 px-4 py-2">Final Prediction</th>
                <th className="border border-gray-400 px-4 py-2">Time Elapsed</th>
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
        ) : (
          <p>No analysis result yet</p>
        )}
      </div>

      {/* CAM Images */}
      <div className="card border border-orange-500 bg-orange-100 m-5 p-4">
        <b className="text-xl">Analyzed Images:</b>
        <div className="flex flex-wrap gap-4 mt-4">
          {aiVerficationImages.length === 0 ? (
            <p>No images yet</p>
          ) : (
            aiVerficationImages.map((src, index) => (
              <Image
                key={index}
                loader={myLoader}
                src={src}
                alt={`Image ${index + 1}`}
                width={200}
                height={200}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
