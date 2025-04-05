import React, { useState } from "react";
import image3 from "../../../public/assets/image10.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Niv from "@/components/niv";
import Swal from "sweetalert2";
import { auth, firestore } from "../../../firebaseconfig";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import axios from "axios";

interface Probabilities {
  biased: string;
  neutral: string;
  unbiased: string;
}

interface ProbabilitiesFake {
  fake: string;
  real: string;
}

interface NewsResult {
  prediction_bias: string;
  prediction_fake: string;
  probabilities_bias: Probabilities;
  probabilities_fake: ProbabilitiesFake;
  prediction: string;
}

function Home() {
  const router = useRouter();
  const [textAreaContent, setTextAreaContent] = useState("");
  const [aiResponse, setAIResponse] = useState("");
  const [newsResult, setNewsResult] = useState<NewsResult | null>(null);

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
        "https://us-central1-regal-campus-448011-c9.cloudfunctions.net/fakenewssinhala",
        { text: textAreaContent }
      );

      const apiResult = response.data.prediction;
      console.log(response.data);
      setNewsResult(response.data);
      const userDocRef = collection(
        firestore,
        "SinhalaNews",
        userEmail,
        "Results"
      );

      await addDoc(userDocRef, {
        inputText: textAreaContent,
        result: apiResult,
        timestamp: new Date(),
      });

      setAIResponse(apiResult);
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
        "https://polotical-830359766867.asia-south1.run.app",
        { text: textAreaContent }
      );
      console.log("sd", response.data);
      setNewsResult(response.data);
      const data = `prediction_bias : ${response.data.prediction_bias} ,prediction_fake : ${response.data.prediction_fake} probabilities_bias biased: ${response.data.probabilities_bias.biased} neutral: ${response.data.probabilities_bias.neutral} unbieased: ${response.data.probabilities_bias.neutral}`;
      const apiResult = response.data.prediction_fake;
      const userDocRef = collection(
        firestore,
        "politicalbias",
        userEmail,
        "Results"
      );

      await addDoc(userDocRef, {
        inputText: textAreaContent,
        result: apiResult,
        timestamp: new Date(),
      });

      setAIResponse(data);
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
    setAIResponse("");
    setNewsResult(null);
    Swal.fire("Cleared", "The text and AI result have been cleared.", "info");
  };

  return (
    <div>
      <Niv />
      <div className="flex  p-4">
        <div className="flex flex-col lg:flex-row w-full max-w-8xl  ">
          <div className="w-1/2 flex flex-col justify-center px-8 py-12 mt-5 ">
            <h2 className="text-orange-500 text-3xl font-bold mb-8">
              Sinhala News Verification
            </h2>

            <b className="text-1.5xl me-5">
              Check if a Sinhala news article is real or fake and detect
              political bias instantly.
            </b>

            <div className="card w-96 flex-grow me-3 relative">
              <p>
                Unsure if the Sinhala news you're reading is real or fake?
                Upload the text, and our system will analyze it for signs of
                misinformation. Whether it's a suspicious a news article, our
                system helps you verify the authenticity of Sinhala content,
                ensuring you get the facts without the fiction.
              </p>
            </div>
          </div>
          <div className="flex justify-center  lg:w-1/2 w-full mb-8 lg:mb-0">
            <div>
              <textarea
                className="textarea border-orange-500 bg-orange-100 border-[3px] mt-5 h-[300px] w-[100vh]"
                value={textAreaContent}
                onChange={(e) => setTextAreaContent(e.target.value)}
                placeholder="Type text here..."
              ></textarea>
              <div className="flex justify-end mt-3 space-x-4">
                {" "}
                <button
                  className="bg-blue-900 text-white font-bold py-2 px-4 rounded"
                  onClick={handleSubmit1}
                >
                  Check Sinhala News
                </button>
                {/* <button
                  className="bg-blue-900 text-white font-bold py-2 px-4 rounded"
                  onClick={handleSubmit}
                >
                  Check Sinhala News
                </button> */}
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

      <div className="card border border-orange-500 bg-orange-100 border-[3px] rounded-box min-h-[150px] flex-grow m-5 p-5">
        <b className="text-1.5xl">System verifies Result:</b>
        <div className="text-left mt-5">
          {newsResult ? (
            <div className="text-gray-800 text-1.5xl">
              {newsResult.prediction_fake && (
                <p>
                  <b>News Prediction:</b>{" "}
                  {newsResult.prediction_fake.toUpperCase()}
                </p>
              )}
              {newsResult.prediction_bias && (
                <p>
                  <b>Political Bias Prediction:</b>{" "}
                  {newsResult.prediction_bias.toUpperCase()}
                </p>
              )}
              {newsResult.probabilities_fake && (
                <p>
                  <b>Fake News Probability:</b> Fake:{" "}
                  {newsResult.probabilities_fake.fake}, Real:{" "}
                  {newsResult.probabilities_fake.real}
                </p>
              )}
              {newsResult.probabilities_bias && (
                <p>
                  <b>Political Bias Probability:</b> Biased:{" "}
                  {newsResult.probabilities_bias.biased}, Neutral:{" "}
                  {newsResult.probabilities_bias.neutral}, Unbiased:{" "}
                  {newsResult.probabilities_bias.unbiased}
                </p>
              )}
              {newsResult.prediction && (
                <p>
                  <b>News Prediction:</b> {newsResult.prediction.toUpperCase()}
                </p>
              )}
            </div>
          ) : (
            "Awaiting analysis..."
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
