import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import Swal from "sweetalert2";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface SpeechToTextProps {
  onTranscript: (transcript: string) => void;
  onStopListening: () => void;
  onVoiceResponse: (response: string) => void;
  onListeningChange?: (isListening: boolean) => void; // New Prop
}

const SpeechToText = forwardRef<any, SpeechToTextProps>(
  (
    { onTranscript, onStopListening, onVoiceResponse, onListeningChange },
    ref
  ) => {
    const [transcript, setTranscript] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isModalOpen1, setIsModalOpen1] = useState(false);
    const [selectedFile1, setSelectedFile1] = useState<File | null>(null);

    useImperativeHandle(ref, () => ({
      stopListening() {
        if (isListening && recognitionRef.current) {
          stopRecognition();
        }
      },
      clearTranscript() {
        setTranscript("");
      },
    }));

    useEffect(() => {
      if (isListening) {
        startRecognition();
      } else {
        stopRecognition();
      }

      return () => {
        stopRecognition();
      };
    }, [isListening]);

    useEffect(() => {
      onTranscript(transcript);
    }, [transcript, onTranscript]);

    const startRecognition = () => {
      if (!recognitionRef.current) {
        recognitionRef.current = new window.webkitSpeechRecognition();
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-IN";
        recognitionRef.current.continuous = true;

        recognitionRef.current.onresult = (event: any) => {
          let text = "";
          for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
          }
          setTranscript(text);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Recognition error:", event.error);
          setIsListening(false);
          stopRecognition();
        };

        recognitionRef.current.onend = () => {
          console.log("Recognition ended");
          onStopListening();
        };
      }

      recognitionRef.current.start();
      console.log("Recognition started");
    };

    const stopRecognition = () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
        console.log("Recognition stopped");
        setIsListening(false);
        onStopListening();
      }
    };

    const toggleRecognition = () => {
      setIsListening((prevIsListening) => {
        const newIsListening = !prevIsListening;
        onListeningChange?.(newIsListening); // Notify parent about state change
        return newIsListening;
      });
    };

    const startRecording = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mp3",
        });
        await uploadAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    };

    const stopRecording = () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type === "audio/mpeg") {
        setSelectedFile(file);
      } else {
        alert("Please upload a valid .mp3 file.");
      }
    };

    const handleFileUpload1 = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type === "audio/mpeg") {
        setSelectedFile1(file);
      } else {
        alert("Please upload a valid .mp3 file.");
      }
    };

    const sendUploadedFile = async () => {
      if (!selectedFile) return;
      await uploadAudio(selectedFile);
    };

    const uploadAudio = async (audioBlob: Blob | File) => {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.mp3");

      try {
        Swal.fire({
          title: "Processing",
          text: "Please wait while we analyze the audio...",
          icon: "info",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        const response = await fetch(
          "https://us-central1-regal-campus-448011-c9.cloudfunctions.net/pretrainmodel",
          { method: "POST", body: formData }
        );
        console.log("Response:", response);
        const result = await response.json();
        let responseMessage = "Failed to process audio.";

        if (result.message === "The input audio is classified as fake.") {
          responseMessage = "Audio is AI-generated";
        } else if (
          result.message === "The input audio is classified as real."
        ) {
          responseMessage = "Audio is real";
        }

        Swal.fire("Success", responseMessage, "success");
        onVoiceResponse(responseMessage);
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error uploading audio:", error);
        onVoiceResponse("Error processing voice data.");
      }
    };

    const sendUploadedFile1 = async (audioBlob: Blob | File) => {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.mp3");

      try {
        Swal.fire({
          title: "Processing",
          text: "Please wait while we analyze the audio...",
          icon: "info",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await fetch(
          "https://voicetotext-830359766867.us-central1.run.app",
          {
            method: "POST",
            body: formData,
          }
        );
        console.log(response);

        const result = await response.json();
        console.log(result);

        if (result.transcription) {
          Swal.fire("Success", "Transcription complete!", "success");
          setTranscript(result.transcription);
          setIsModalOpen1(false);
        } else {
          Swal.fire("Error", "Failed to transcribe audio.", "error");
        }
      } catch (error) {
        console.error("Error uploading audio:", error);
        Swal.fire("Error", "Something went wrong. Try again!", "error");
      }
    };

    return (
      <div className="container-fluid">
        <button
          className="w-50 py-2 px-4 rounded font-bold bg-green-600 text-white"
          onClick={() => setIsModalOpen(true)}
        >
          Voice Analysis
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 relative">
              <button
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-2xl font-bold transition"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedFile(null);
                }}
              >
                &times;
              </button>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                Select an Option
              </h2>

              <button
                className={`w-full py-3 px-4 rounded-lg font-bold mb-3 transition duration-300 ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white shadow-md`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? "Stop Recording" : "Record Now"}
              </button>

              <label className="block w-full cursor-pointer text-center border-2 border-dashed border-gray-400 p-3 rounded-lg hover:border-gray-600 transition mb-3">
                <input type="file" accept=".mp3" onChange={handleFileUpload} />
                <span className="text-gray-600 font-medium">
                  Click to Upload MP3 File
                </span>
              </label>

              {selectedFile && (
                <button
                  className="w-full py-3 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold shadow-md transition duration-300"
                  onClick={sendUploadedFile}
                >
                  Send Uploaded File
                </button>
              )}
            </div>
          </div>
        )}

        <button
          className={`ml-2 w-50 py-2 px-4 rounded font-bold ${
            isListening ? "bg-red-600 text-white" : "bg-blue-900 text-white"
          }`}
          onClick={toggleRecognition}
        >
          {isListening ? "Stop Listening" : "Speak"}
        </button>
        <button
          className="ml-2 w-50 py-2 px-4 rounded font-bold bg-gray-700 text-white"
          onClick={() => setIsModalOpen1(true)}
        >
          Audio Context Analysis
        </button>
        {isModalOpen1 && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-lg font-bold mb-4">Upload MP3 File</h2>
              <label className="block w-full cursor-pointer text-center border-2 border-dashed border-gray-400 p-2 rounded-md hover:border-gray-600 transition mb-2">
                <input type="file" accept=".mp3" onChange={handleFileUpload1} />
                <span className="text-gray-600 text-sm font-medium">
                  Click to Upload MP3 File
                </span>
              </label>

              {selectedFile1 && (
                <button
                  className="w-full py-2 px-3 rounded-md bg-green-600 hover:bg-green-700 text-white font-bold shadow-md transition duration-300"
                  onClick={() => sendUploadedFile1(selectedFile1)}
                >
                  Send File
                </button>
              )}

              <button
                className="mt-4 w-full py-2 px-3 rounded-md bg-red-500 hover:bg-red-600 text-white font-bold shadow-md transition duration-300"
                onClick={() => setIsModalOpen1(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default SpeechToText;
