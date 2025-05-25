import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Niv from "@/components/niv";
import Swal from "sweetalert2";
import { auth, firestore } from "../../../firebaseconfig";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import axios from "axios";

function Home() {
  const router = useRouter();
  const [textAreaContent, setTextAreaContent] = useState("");
  const [politicalBiasResult, setPoliticalBiasResult] = useState("");
  const [politicalBiasDailyMirrorResult, setPoliticalBiasDailyMirrorResult] =
    useState("");
  const [politicalBiasDetails, setPoliticalBiasDetails] = useState<any>(null);

  const handleSubmit1 = async () => {
    if (!textAreaContent.trim()) {
      Swal.fire(
        "Warning",
        "Please enter news content before submitting for analysis.",
        "warning"
      );
      return;
    }

    const userEmail = localStorage.getItem("user");
    if (!userEmail) {
      Swal.fire(
        "Authentication Required",
        "User email not found. Please log in to continue.",
        "error"
      );
      return;
    }

    Swal.fire({
      title: "Analyzing news...",
      text: "We're currently processing the news. Please wait a moment.",
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
        setPoliticalBiasDailyMirrorResult(status);
        // evaluateFinalAuthenticityResult();

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
            "Verified Source",
            "This content was found on Ada Derana!",
            "success"
          );
        } else {
          Swal.fire(
            "Content Not Found",
            "No matching content was found",
            "warning"
          );
        }
      } catch (crawlErr) {
        console.error("Web scraping error:", crawlErr);
        setPoliticalBiasDailyMirrorResult("Ada Derana check failed");
        Swal.fire(
          "Verification Error",
          "Unable to verify content on Ada Derana at this time. Please try again later.",
          "error"
        );
      }

      Swal.fire("Success", "The News was processed successfully!", "success");
    } catch (error) {
      console.error("Error submitting text:", error);
      Swal.fire(
        "Analysis Failed",
        "We couldn't process the text due to a server error. Please try again later.",
        "error"
      );
    }
  };

  const handleClear = () => {
    setTextAreaContent("");
    setPoliticalBiasResult("");
    setPoliticalBiasDailyMirrorResult("");
    setPoliticalBiasDetails(null);
    Swal.fire(
      "Reset Complete",
      "Input and results have been cleared. You can now start a new analysis.",
      "info"
    );
  };

  return (
    <div>
      <Niv />
      <div className="flex p-4">
        <div className="flex flex-col lg:flex-row w-full max-w-8xl">
          <div className="w-1/2 flex flex-col justify-center px-8 py-12 mt-5">
            <h2 className="text-orange-500 text-3xl font-bold mb-8">
              Sinhala News Verification
            </h2>

            <b className="text-1.5xl me-5">
              Instantly verify whether a Sinhala news article is real or fake,
              and detect any political bias.
            </b>

            <div className="card w-96 flex-grow me-3 relative">
              <p>
                Not sure if the Sinhala news you're reading is real or fake?
                Paste the text here, and our system will analyze it for
                potential misinformation. Whether it's a suspicious headline or
                a full article, we'll help you verify its authenticity and
                detect political bias — giving you the facts without the
                fiction.
              </p>
            </div>

            <div className="w-[80%] font-semibold text-red-500 mt-3">
              <p>* Our fact analysis combines advanced text evaluation and real-time web verification, ensuring maximum accuracy for news published in the last 48 hours.</p>
            </div>
          </div>
          <div className="flex justify-center lg:w-1/2 w-full mb-8 lg:mb-0">
            <div>
              <div className="flex justify-end mb-4">
                <button
                  className="bg-gray-600 text-white font-bold py-2 px-4 rounded"
                  onClick={() => router.push("/sinhalaNewsHistory")}
                >
                  View History
                </button>
              </div>
              <textarea
                className="textarea border-orange-500 bg-orange-100 border-[3px] mt-5 h-[300px] w-[100vh]"
                value={textAreaContent}
                onChange={(e) => setTextAreaContent(e.target.value)}
                placeholder="Type News here..."
              ></textarea>
              <div className="flex justify-end mt-3 space-x-4">
                <button
                  className="bg-blue-900 text-white font-bold py-2 px-4 rounded"
                  onClick={handleSubmit1}
                >
                  Verify Sinhala News
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

      <div className="card  border-orange-500 bg-orange-100 border-[3px] rounded-box m-5">
        <div className="flex flex-row justify-left space-x-8  ">
          <div className=" w-1/2 p-4 ">
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
                  Authenticity Analysis
                </h3>
              </div>
              <div className="flex flex-col space-y-4">
                <div className="flex-grow flex items-center justify-center bg-white rounded-lg p-4">
                  <div className="text-lg  w-full">
                    {politicalBiasDetails && (
                      <div className=" space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="mb-4 flex justify-between">
                            <div>
                              <h5 className="text-lg font-semibold text-gray-700 mb-3">
                                Results in Context
                              </h5>
                              <div
                                className={`inline-block px-4 py-2 rounded-full text-white font-medium ${
                                  politicalBiasResult === "fake"
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                }`}
                              >
                                {politicalBiasResult
                                  ? `${politicalBiasResult.toUpperCase()}`
                                  : "Awaiting analysis..."}
                              </div>
                            </div>
                            <div>
                              <h5 className="text-[15px] font-medium text-gray-700 mb-3 bg-white p-1 rounded-full px-3">
                                {politicalBiasDailyMirrorResult == "found"
                                  ? "Found on AdaDerana.lk"
                                  : "Not found on AdaDerana.lk"}
                              </h5>
                            </div>
                          </div>
                          <div className="mt-3">
                            <h6 className="text-sm font-medium text-gray-600 mb-2">
                              {politicalBiasResult == "real" &&
                                politicalBiasDailyMirrorResult == "found" && (
                                  <><span className="text-[16px] font-semibold">Final Result : </span>
                                    The System determined this news is
                                    contextually real, and it was also found on
                                    Ada Derana. This strongly supports that the
                                    news is authentic and trustworthy.
                                  </>
                                )}
                              {politicalBiasResult == "real" &&
                                politicalBiasDailyMirrorResult ==
                                  "not found" && (
                                  <><span className="text-[16px] font-semibold">Final Result : </span>
                                    The System determined this news is
                                    contextually real, but it wasn't found on
                                    Ada Derana. It may be fake news or older
                                    than 48 hours.
                                  </>
                                )}
                              {politicalBiasResult == "fake" &&
                                politicalBiasDailyMirrorResult ==
                                  "not found" && (
                                  <><span className="text-[16px] font-semibold">Final Result : </span>
                                    The System determined this news is
                                    contextually fake, also wasn't found on Ada
                                    Derana. This increases the chances that it's
                                    fake news.
                                  </>
                                )}
                              {politicalBiasResult == "fake" &&
                                politicalBiasDailyMirrorResult == "found" && (
                                  <><span className="text-[16px] font-semibold">Final Result : </span>
                                    Although the System determined this news is
                                    contextually fake, But the news is found on
                                    Ada Derana. It is considered real and
                                    trustworthy.
                                  </>
                                )}
                              {politicalBiasResult == "" &&
                                politicalBiasDailyMirrorResult == "" && <>-</>}
                            </h6>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className=" w-1/2 p-4">
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
              <div className="flex flex-col">
                <div className="flex-grow flex items-center justify-center bg-white rounded-lg p-4">
                  <div className="text-lg text-center w-full">
                    {politicalBiasDetails && (
                      <div className=" space-y-4">
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
                                          politicalBiasDetails
                                            .probabilities_bias.biased
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
                                          politicalBiasDetails
                                            .probabilities_bias.neutral
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
                                          politicalBiasDetails
                                            .probabilities_bias.unbiased
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
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
