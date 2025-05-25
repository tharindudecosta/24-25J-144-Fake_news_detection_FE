import React, { useState } from "react";
import image3 from "../../../public/assets/image10.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Niv from "@/components/niv";
import Swal from "sweetalert2";
import { auth, firestore } from "../../../firebaseconfig";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import axios from "axios";

function Home() {
  const router = useRouter();
  const [textAreaContent, setTextAreaContent] = useState("");
  const [fakeNewsResult, setFakeNewsResult] = useState("");
  const [fakeNewsDailyMirrorResult, setFakeNewsDailyMirrorResult] =
    useState("");
  const [politicalBiasResult, setPoliticalBiasResult] = useState("");
  const [politicalBiasDailyMirrorResult, setPoliticalBiasDailyMirrorResult] =
    useState("");
  const [politicalBiasDetails, setPoliticalBiasDetails] = useState<any>(null);

  const handleTranscript = (text: string) => {
    setTextAreaContent(text);
  };

  const handleSubmit = async () => {
    if (!textAreaContent.trim()) {
      Swal.fire(
        "Error",
        "Please enter or speak some text before submitting.",
        "error"
      );
      return;
    }

    const userEmail = localStorage.getItem("user");
    if (!userEmail) {
      Swal.fire("Error", "User email not found. Please log in.", "error");
      return;
    }

    Swal.fire({
      title: "Processing...",
      text: "Please wait while we analyze the text.",
      showConfirmButton: false,
      allowOutsideClick: false,
    });

    try {
      const response = await axios.post(
        "https://fakenewssinhala-766120731872.us-central1.run.app",
        { text: textAreaContent }
      );

      const apiResult = response.data.prediction;
      console.log("API Result:", apiResult);
      setFakeNewsResult(apiResult);

      try {
        const crawlResponse = await axios.post(
          "https://webscrapingsinhala-766120731872.europe-west1.run.app/generate-and-check",
          {
            text: textAreaContent,
          }
        );

        console.log("Crawl Response:", crawlResponse.data);
        const status = crawlResponse.data.found_on_adaderana;
        setFakeNewsDailyMirrorResult(
          status === "found"
            ? "Found on Ada Derana"
            : "Not found on Ada Derana"
        );

        const userDocRef = collection(firestore, "SinhalaNews");
        const docRef = doc(userDocRef, userEmail);
        const resultsCollection = collection(docRef, "Results");
        const newResultDoc = doc(resultsCollection);

        await setDoc(newResultDoc, {
          inputText: textAreaContent,
          apiResult: apiResult,
          adaderanaResult: status,
          timestamp: new Date(),
        });

        if (status === "found") {
          Swal.fire(
            "Content Verified",
            "This content exists on Ada Derana!",
            "success"
          );
        } else {
          Swal.fire(
            "Content Not Found",
            "This content doesn't match Ada Derana articles.",
            "warning"
          );
        }
      } catch (crawlErr) {
        console.error("Web scraping error:", crawlErr);
        setFakeNewsDailyMirrorResult("Ada Derana check failed");
        Swal.fire("Error", "Ada Derana scraping failed. Try again.", "error");
      }

      Swal.fire("Success", "The text was processed successfully!", "success");
    } catch (error) {
      console.error("Error submitting text:", error);
      Swal.fire(
        "Error",
        "Failed to process the text. Please try again.",
        "error"
      );
    }
  };

  const handleSubmit1 = async () => {
    if (!textAreaContent.trim()) {
      Swal.fire(
        "Error",
        "Please enter or speak some text before submitting.",
        "error"
      );
      return;
    }

    const userEmail = localStorage.getItem("user");
    if (!userEmail) {
      Swal.fire("Error", "User email not found. Please log in.", "error");
      return;
    }

    Swal.fire({
      title: "Processing...",
      text: "Please wait while we analyze the text.",
      showConfirmButton: false,
      allowOutsideClick: false,
    });

    try {
      const response = await axios.post(
        "https://polotical-766120731872.us-central1.run.app",
        { text: textAreaContent }
      );
      console.log("API Response:", response.data);
      setPoliticalBiasDetails(response.data);
      setPoliticalBiasResult(response.data.prediction_fake);

      try {
        const crawlResponse = await axios.post(
          "https://webscrapingsinhala-766120731872.europe-west1.run.app/generate-and-check",
          {
            text: textAreaContent,
          }
        );

        console.log("Crawl Response:", crawlResponse.data);
        const status = crawlResponse.data.found_on_adaderana;
        console.log(status);
        setPoliticalBiasDailyMirrorResult(
          status === "found"
            ? "Found on Ada Derana"
            : "Not found on Ada Derana"
        );

        const userDocRef = collection(firestore, "politicalbias");
        const docRef = doc(userDocRef, userEmail);
        const resultsCollection = collection(docRef, "Results");
        const newResultDoc = doc(resultsCollection);

        await setDoc(newResultDoc, {
          inputText: textAreaContent,
          apiResult: response.data.prediction_fake,
          adaderanaResult: status,
          timestamp: new Date(),
        });

        if (status === "found") {
          Swal.fire(
            "Content Verified",
            "This content exists on Ada Derana!",
            "success"
          );
        } else {
          Swal.fire(
            "Content Not Found",
            "This content doesn't match Ada Derana articles.",
            "warning"
          );
        }
      } catch (crawlErr) {
        console.error("Web scraping error:", crawlErr);
        setPoliticalBiasDailyMirrorResult("Ada Derana check failed");
        Swal.fire("Error", "Ada Derana scraping failed. Try again.", "error");
      }

      Swal.fire("Success", "The text was processed successfully!", "success");
    } catch (error) {
      console.error("Error submitting text:", error);
      Swal.fire(
        "Error",
        "Failed to process the text. Please try again.",
        "error"
      );
    }
  };

  const handleClear = () => {
    setTextAreaContent("");
    setFakeNewsResult("");
    setFakeNewsDailyMirrorResult("");
    setPoliticalBiasResult("");
    setPoliticalBiasDailyMirrorResult("");
    setPoliticalBiasDetails(null);
    Swal.fire("Cleared", "The text and AI results have been cleared.", "info");
  };

  return (
    <div>
      <Niv />
      <div className="flex p-4">
        <div className="flex flex-col lg:flex-row w-full max-w-8xl">
          <div className="w-1/2 flex flex-col justify-center px-8 py-12 mt-5">
            <h2 className="text-orange-500 text-3xl font-bold mb-8">
              Sinhala Text Verification
            </h2>

            <b className="text-1.5xl me-5">
              Verify the authenticity of Sinhala news content
            </b>

            <div className="card w-96 flex-grow me-3 relative">
              <p>
                "Unsure if the Sinhala news you're reading is real or fake?
                Upload the text, and our AI-based tool will analyze it for signs
                of misinformation. Whether it's a suspicious headline or a news
                article, our system helps you verify the authenticity of Sinhala
                content, ensuring you get the facts without the fiction."
              </p>
            </div>
          </div>
          <div className="flex justify-center lg:w-1/2 w-full mb-8 lg:mb-0">
            <div>
            <div className="flex justify-end mb-4">
            <button
                  className="bg-gray-600 text-white font-bold py-2 px-4 rounded"
                  onClick={() => router.push('/sinhalaNewsHistory')}
                >
                  View History
                </button>
              </div>
              <textarea
                className="textarea border-orange-500 bg-orange-100 border-[3px] mt-5 h-[300px] w-[100vh]"
                value={textAreaContent}
                onChange={(e) => setTextAreaContent(e.target.value)}
                placeholder="Type text here..."
              ></textarea>
              <div className="flex justify-end mt-3 space-x-4">
                <button
                  className="bg-blue-900 text-white font-bold py-2 px-4 rounded"
                  onClick={handleSubmit1}
                >
                  Upload political bias Text
                </button>
                <button
                  className="bg-blue-900 text-white font-bold py-2 px-4 rounded"
                  onClick={handleSubmit}
                >
                  Upload Sinhala Text
                </button>
                
                <button
                  className="bg-red-600 text-white font-bold py-2 px-4 rounded"
                  onClick={handleClear}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-center space-x-8 m-5">
        <div className="card border border-orange-500 bg-orange-100 border-[3px] rounded-box w-1/2 p-4 shadow-lg">
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-orange-700">
                Fake News Verification
              </h3>
            </div>
            <div className="flex flex-col space-y-4">
              <div className="flex-grow flex items-center justify-center bg-white rounded-lg p-4">
                <p className="text-lg text-center">
                  API Result: {fakeNewsResult || "Awaiting analysis..."}
                </p>
              </div>
              <div className="flex-grow flex items-center justify-center bg-white rounded-lg p-4">
                <p className="text-lg text-center">
                  Ada Derana:{" "}
                  {fakeNewsDailyMirrorResult || "Awaiting analysis..."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card border border-orange-500 bg-orange-100 border-[3px] rounded-box w-1/2 p-4 shadow-lg">
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-orange-700">
                Political Bias Analysis
              </h3>
            </div>
            <div className="flex flex-col space-y-4">
              <div className="flex-grow flex items-center justify-center bg-white rounded-lg p-4">
                <div className="text-lg text-center w-full">
                  <div className="mb-4">
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">
                      Content Analysis Results
                    </h4>
                    <div
                      className={`inline-block px-4 py-2 rounded-full text-white font-medium ${
                        politicalBiasResult === "fake"
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                    >
                      {politicalBiasResult
                        ? `${politicalBiasResult.toUpperCase()} Content`
                        : "Awaiting analysis..."}
                    </div>
                  </div>

                  {politicalBiasDetails && (
                    <div className="mt-4 space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="text-lg font-semibold text-gray-700 mb-3">
                          Bias Analysis
                        </h5>
                        <div
                          className={`inline-block px-4 py-2 rounded-full text-white font-medium mb-3 ${
                            politicalBiasDetails.prediction_bias === "biased"
                              ? "bg-orange-500"
                              : politicalBiasDetails.prediction_bias ===
                                "neutral"
                              ? "bg-blue-500"
                              : "bg-green-500"
                          }`}
                        >
                          {politicalBiasDetails.prediction_bias.toUpperCase()}
                        </div>

                        <div className="mt-3">
                          <h6 className="text-sm font-medium text-gray-600 mb-2">
                            Bias Confidence Levels:
                          </h6>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <span className="w-24 text-sm">Biased:</span>
                              <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-orange-500 rounded-full"
                                  style={{
                                    width: `${
                                      parseFloat(
                                        politicalBiasDetails.probabilities_bias
                                          .biased
                                      ) * 100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm w-16 text-right">
                                {(
                                  parseFloat(
                                    politicalBiasDetails.probabilities_bias
                                      .biased
                                  ) * 100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-24 text-sm">Neutral:</span>
                              <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{
                                    width: `${
                                      parseFloat(
                                        politicalBiasDetails.probabilities_bias
                                          .neutral
                                      ) * 100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm w-16 text-right">
                                {(
                                  parseFloat(
                                    politicalBiasDetails.probabilities_bias
                                      .neutral
                                  ) * 100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-24 text-sm">Unbiased:</span>
                              <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{
                                    width: `${
                                      parseFloat(
                                        politicalBiasDetails.probabilities_bias
                                          .unbiased
                                      ) * 100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm w-16 text-right">
                                {(
                                  parseFloat(
                                    politicalBiasDetails.probabilities_bias
                                      .unbiased
                                  ) * 100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="text-lg font-semibold text-gray-700 mb-3">
                          Authenticity Analysis
                        </h5>
                        <div className="mt-3">
                          <h6 className="text-sm font-medium text-gray-600 mb-2">
                            Authenticity Confidence Levels:
                          </h6>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <span className="w-24 text-sm">Fake:</span>
                              <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-red-500 rounded-full"
                                  style={{
                                    width: `${
                                      parseFloat(
                                        politicalBiasDetails.probabilities_fake
                                          .fake
                                      ) * 100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm w-16 text-right">
                                {(
                                  parseFloat(
                                    politicalBiasDetails.probabilities_fake.fake
                                  ) * 100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-24 text-sm">Real:</span>
                              <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{
                                    width: `${
                                      parseFloat(
                                        politicalBiasDetails.probabilities_fake
                                          .real
                                      ) * 100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm w-16 text-right">
                                {(
                                  parseFloat(
                                    politicalBiasDetails.probabilities_fake.real
                                  ) * 100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center bg-white rounded-lg p-4">
                <p className="text-lg text-center">
                  Ada Derana:{" "}
                  {politicalBiasDailyMirrorResult || "Awaiting analysis..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
