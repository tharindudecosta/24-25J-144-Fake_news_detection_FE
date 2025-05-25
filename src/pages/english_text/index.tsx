import React, { useState, useRef } from "react";
import image3 from "../../../public/assets/image10.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Niv from "@/components/niv";
import Swal from "sweetalert2";
import SpeechToText from "../../components/SpeechToText";
import { auth, firestore } from "../../../firebaseconfig";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import axios from "axios";

function Home() {
  const router = useRouter();
  const [textAreaContent, setTextAreaContent] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [aiResponse, setAIResponse] = useState("");
  const [bbcResponse, setBBCResponse] = useState("");
  const speechToTextRef = useRef<any>(null);
  const [voiceResponse, setVoiceResponse] = useState("");

  const handleTranscript = (text: string) => {
    setTextAreaContent(text);
  };

  const handleStopListening = () => {
    Swal.fire(
      "Speech Recognition Stopped",
      "You can now review your text.",
      "info"
    );
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

    try {
      Swal.fire({
        title: "Uploading...",
        text: "Please wait while we upload your file.",
        icon: "info",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const response = await axios.post(
        "https://fakenewsenglish-766120731872.us-central1.run.app",
        { text: textAreaContent }
      );

      const apiResult = response.data.result;
      console.log("API Result:", apiResult);

      const userDocRef = collection(firestore, "EnglishNews");
      const docRef = doc(userDocRef, userEmail);
      const resultsCollection = collection(docRef, "Results");

      try {
        const crawlResponse = await axios.post(
          "https://englishwebscraping-766120731872.europe-west1.run.app",
          {
            text: textAreaContent,
          }
        );

        console.log("Crawl Response:", crawlResponse.data);
        console.log("Crawl Response status:", crawlResponse.data.status);

        const { status } = crawlResponse.data;
        setBBCResponse(status === "found" ? "REAL" : "FAKE");

        if (status === "found") {
          await addDoc(resultsCollection, {
            inputText: textAreaContent,
            aiResult: apiResult,
            bbcResult: "REAL",
            timestamp: new Date(),
          });
          setAIResponse(apiResult);
          Swal.fire(
            "Content Verified",
            "This content exists on BBC!",
            "success"
          );
        } else {
          await addDoc(resultsCollection, {
            inputText: textAreaContent,
            aiResult: apiResult,
            bbcResult: "FAKE",
            timestamp: new Date(),
          });
          setAIResponse(apiResult);
          Swal.fire(
            "Content Not Found",
            "This content doesn't match BBC articles.",
            "warning"
          );
        }
      } catch (crawlErr) {
        console.error("Web scraping error:", crawlErr);
        Swal.fire("Error", "BBC scraping failed. Try again.", "error");
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
    setAIResponse("");
    setBBCResponse("");
    setVoiceResponse("");
    if (speechToTextRef.current) {
      speechToTextRef.current.clearTranscript();
    }
    window.location.reload();
    console.log("Clearing data...");
    Swal.fire("Cleared", "The text and AI result have been cleared.", "info");
  };

  const handleViewHistory = () => {
    router.push('/englishNewsHistory');
  };

  return (
    <div>
      <Niv />
      <div className="flex p-4">
        <div className="flex flex-col lg:flex-row w-full max-w-8xl">
          <div className="w-1/2 flex flex-col justify-center px-8 py-12 mt-5">
            <h2 className="text-orange-500 text-3xl font-bold mb-8">
              English Text and Voice Verification: Detect Authenticity
            </h2>

            <b className="text-1.5xl me-5">
              Upload text or voice to verify if it's real or fabricated
            </b>

            <div className="card w-96 flex-grow me-3 relative">
              <p>
                "Uncertain whether an English text or voice recording is
                authentic? Upload your content, and our AI-powered system will
                analyze it for any signs of manipulation or fabrication. Using
                advanced natural language processing and voice recognition
                technology, we'll determine if the text is genuine or fake and
                whether the voice recording has been altered or generated by AI.
                Ensure that the information you receive or share is reliable and
                accurate."
              </p>
            </div>
          </div>
          <div className="flex justify-center lg:w-1/2 w-full mb-8 lg:mb-0">
            <div>
              <div className="flex justify-end mb-4">
                <button
                  className="bg-gray-600 text-white font-bold py-2 px-4 rounded"
                  onClick={handleViewHistory}
                >
                  View History
                </button>
              </div>
              <textarea
                className="textarea border-orange-500 bg-orange-100 border-[3px] mt-5 h-[300px] w-[100vh]"
                value={textAreaContent}
                onChange={(e) => setTextAreaContent(e.target.value)}
                onInput={(e) => setTextAreaContent(e.currentTarget.value)}
                placeholder="Speak or type text here..."
                style={{ resize: 'vertical' }}
                readOnly={false}
                disabled={false}
              ></textarea>

              <div className="flex items-center space-x-3 mt-4">
                <SpeechToText
                  ref={speechToTextRef}
                  onTranscript={handleTranscript}
                  onStopListening={handleStopListening}
                  onVoiceResponse={(response) => setVoiceResponse(response)}
                  onListeningChange={setIsListening}
                />

                <button
                  className="bg-blue-900 text-white font-bold py-2 px-4 rounded"
                  onClick={handleSubmit}
                >
                  Upload Text
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

      <div className="card border border-orange-500 bg-orange-100 border-[3px] rounded-box h-[150px] flex-grow m-5 p-5">
        <b className="text-1.5xl">"AI Verifies Results:"</b>
        <div className="flex justify-between mt-3 gap-4">
          <div className="border border-gray-400 bg-white rounded-md p-2 w-1/3 text-center">
            <b>Voice AI Response:</b>
            <div>{voiceResponse || "Awaiting voice analysis..."}</div>
          </div>
          <div className="border border-gray-400 bg-white rounded-md p-2 w-1/3 text-center">
            <b>AI Model Response:</b>
            <div>{aiResponse || "Awaiting response..."}</div>
          </div>
          <div className="border border-gray-400 bg-white rounded-md p-2 w-1/3 text-center">
            <b>BBC Check Result:</b>
            <div>{bbcResponse || "Awaiting BBC check..."}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
