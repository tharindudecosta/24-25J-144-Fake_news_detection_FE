import React, { useState, useRef } from "react";
import image3 from "../../../public/assets/image10.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Niv from "@/components/niv";
import Swal from "sweetalert2";
import SpeechToText from "../../components/SpeechToText";
import { auth, firestore } from "../../../firebaseconfig";
import { collection, addDoc, doc } from "firebase/firestore";
import axios from "axios";

function Home() {
  const router = useRouter();
  const [textAreaContent, setTextAreaContent] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [aiResponse, setAIResponse] = useState("");
  const [bbcResponse, setBBCResponse] = useState("");
  const speechToTextRef = useRef(null);
  const [voiceResponse, setVoiceResponse] = useState("");

  const handleTranscript = (text) => {
    if (!textAreaContent.trim()) {
      setTextAreaContent(text);
    }
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
      const userDocRef = collection(firestore, "EnglishNews");
      const docRef = doc(userDocRef, userEmail);
      const resultsCollection = collection(docRef, "Results");

      try {
        const crawlResponse = await axios.post(
          "https://englishwebscraping-766120731872.europe-west1.run.app",
          { text: textAreaContent }
        );

        const { status } = crawlResponse.data;
        setBBCResponse(status === "found" ? "FOUND" : "NOT FOUND");

        await addDoc(resultsCollection, {
          inputText: textAreaContent,
          aiResult: apiResult,
          bbcResult: status === "found" ? "FOUND" : "NOT FOUND",
          timestamp: new Date(),
        });
        setAIResponse(apiResult);

        Swal.fire(
          status === "found" ? "Content Verified" : "Content Not Found",
          status === "found"
            ? "This content exists on BBC!"
            : "This content doesn't match BBC articles.",
          status === "found" ? "success" : "warning"
        );
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
    Swal.fire("Cleared", "The text and AI result have been cleared.", "info");
  };

  const handleViewHistory = () => {
    router.push("/englishNewsHistory");
  };

  const getColorClass = (text, type) => {
    if (!text) return "bg-yellow-400 text-black";
    if (type === "bbc") {
      return text === "FOUND"
        ? "bg-green-500 text-white"
        : "bg-red-500 text-white";
    }
    if (text.toLowerCase().includes("real")) return "bg-green-500 text-white";
    if (
      text.toLowerCase().includes("fake") ||
      text.toLowerCase().includes("ai")
    )
      return "bg-red-500 text-white";
    return "bg-yellow-400 text-black";
  };

  // Warning text logic
  const showWarning =
    aiResponse &&
    bbcResponse &&
    bbcResponse !== "Awaiting BBC check..." &&
    aiResponse !== "Awaiting response...";

  let warningText = "";
  if (showWarning) {
    if (bbcResponse === "FOUND" && aiResponse.toLowerCase().includes("real")) {
      warningText =
        "The System determined this news is contextually real, and it was also found on BBC. This strongly supports that the news is authentic and trustworthy.";
    } else if (
      bbcResponse === "FOUND" &&
      (aiResponse.toLowerCase().includes("fake") ||
        aiResponse.toLowerCase().includes("ai"))
    ) {
      warningText =
        "Although the System determined this news is contextually fake, But the news is found on BBC. It is considered real and trustworthy.";
    } else if (
      bbcResponse !== "FOUND" &&
      (aiResponse.toLowerCase().includes("fake") ||
        aiResponse.toLowerCase().includes("ai"))
    ) {
      warningText =
        "The System determined this news is contextually fake, also wasn't found on BBC. This increases the chances that it's fake news.";
    } else if (
      bbcResponse !== "FOUND" &&
      aiResponse.toLowerCase().includes("real")
    ) {
      warningText =
        "The System determined this news is contextually real, but it wasn't found on BBC. It may be fake news or older than 48 hours.";
    }
  }

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
                Not sure if the English text or voice recording you're checking
                is real or fake? Upload your content, and our AI-powered system
                will analyze it for signs of manipulation or fabrication.
                Whether it’s a suspicious statement, an article, or a voice
                clip, we’ll help you verify its authenticity detecting
                AI-generated speech and fake news to give you the truth without
                the tricks.
              </p>
            </div>
            <div className="w-[80%] font-semibold text-red-500 mt-3">
              <p>
                * Our fact analysis combines advanced text evaluation and
                real-time web verification, ensuring maximum accuracy for news
                published in the last 48 hours.
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
                placeholder="Speak or type text here..."
                style={{ resize: "vertical" }}
              ></textarea>

              <div className="flex items-center space-x-3 mt-4">
                <SpeechToText
                  ref={speechToTextRef}
                  onTranscript={handleTranscript}
                  onStopListening={handleStopListening}
                  onVoiceResponse={setVoiceResponse}
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
        <div className="flex items-center justify-center gap-4">
          <b className="text-1.5xl">Results:</b>
          {showWarning && (
            <p className="text-red-600 font-semibold">{warningText}</p>
          )}
        </div>

        <div className="flex justify-between mt-3 gap-4">
          <div className="w-1/3 text-center">
            <b>Audio Response:</b>
            <button
              disabled
              className={`${getColorClass(
                voiceResponse
              )} font-semibold py-2 px-4 rounded mt-2 w-full cursor-default`}
            >
              {voiceResponse || "Awaiting voice analysis..."}
            </button>
          </div>
          <div className="w-1/3 text-center">
            <b>Context Response:</b>
            <button
              disabled
              className={`${getColorClass(
                aiResponse
              )} font-semibold py-2 px-4 rounded mt-2 w-full cursor-default`}
            >
              {aiResponse || "Awaiting response..."}
            </button>
          </div>
          <div className="w-1/3 text-center">
            <b>BBC Check Result:</b>
            <button
              disabled
              className={`${getColorClass(
                bbcResponse,
                "bbc"
              )} font-semibold py-2 px-4 rounded mt-2 w-full cursor-default`}
            >
              {bbcResponse || "Awaiting BBC check..."}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
