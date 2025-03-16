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
  const [aiResponse, setAIResponse] = useState("");

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

  const handleClear = () => {
    setTextAreaContent("");
    setAIResponse("");
    Swal.fire("Cleared", "The text and AI result have been cleared.", "info");
  };

  return (
    <div>
      <div className="flex  p-4">
        <div className="flex flex-col lg:flex-row w-full max-w-8xl  ">
          <div className="w-1/2 flex flex-col justify-center px-8 py-12 mt-5 ">
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

      <div className="card border border-orange-500 bg-orange-100 border-[3px] rounded-box h-[150px] flex-grow  m-5">
        <b className="text-1.5xl m-5">"AI verifies Result:"</b>
        <div className="text-center">
          {aiResponse || "Awaiting analysis..."}
        </div>
      </div>
    </div>
  );
}

export default Home;
