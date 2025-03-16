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


    </div>
  );
}

export default Home;
