import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { ImageLoader } from "next/image";


const options: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: true,
};

export const generatePdfReport = async (
  aiResponse: any,
  aiLightingResponse: any,
  aiVerificationImages: any,
  videoName: String,
  userEmail: String
) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Video Analysis Report", 20, 20);

  doc.setFontSize(12);
  doc.text(`Video Name: ${videoName}`, 20, 30);

  doc.text(`User Email: ${userEmail}`, 20, 40);
  const now = new Date();
  const userFriendlyTimestamp = new Intl.DateTimeFormat('en-US', options).format(now).replace(/,/g, "").replace(/\//g, ", ").replace(/ /g, " ");
  const timestamp = now.toLocaleString().replace(/[/,: ]/g, "_");
  
  doc.text(`Report Generated at: ${userFriendlyTimestamp}`, 20, 50);

  // Deepfake Detection Results
  if (aiResponse) {
    doc.setFontSize(12);
    doc.text("Deepfake Detection Results:", 20, 70);
    autoTable(doc, {
      startY: 75,
      head: [
        [
          "Fake Frame Count",
          "Real Frame Count",
          "Total Frame Count",
          "Final Prediction",
          "Time Elapsed",
        ],
      ],
      body: [
        [
          aiResponse.fake_count,
          aiResponse.real_count,
          aiResponse.total_count,
          aiResponse.prediction,
          `${aiResponse.total_time} seconds`,
        ],
      ],
    });
  } else {
    doc.setFontSize(12);
    doc.text("Deepfake Detection Results:", 20, 70);
    doc.text("[Deepfake Detection Results To Be Generated]", 20, 75);
  }

  // Lighting Analysis Results
  if (aiLightingResponse) {
    doc.setFontSize(12);
    doc.text("Lighting Analysis Results:", 20, 100);
    autoTable(doc, {
      startY: 105,
      head: [
        [
          "Fake Frame Count",
          "Real Frame Count",
          "Total Frame Count",
          "Final Prediction",
          "Time Elapsed",
        ],
      ],
      body: [
        [
          aiLightingResponse.fake_count,
          aiLightingResponse.real_count,
          aiLightingResponse.total_count,
          aiLightingResponse.prediction,
          `${aiLightingResponse.total_time} seconds`,
        ],
      ],
    });
  } else{
    doc.setFontSize(12);
    doc.text("Lighting Analysis Results:", 20, 100);
    doc.text("[Lighting Analysis Results To Be Generated]", 20, 105);
  }

  // CAM Images
  if (aiVerificationImages.length > 0) {
    doc.setFontSize(12);
    doc.text("Analzyed Frames:", 20, 120);

    const firebaseBasePath =
      "https://storage.googleapis.com/blood-donation-ac142.appspot.com/VideoVerification/";

    aiVerificationImages.forEach((imageUrl: string, index: number) => {
      const relativePath = imageUrl
        .replace(firebaseBasePath, "")
        .split("/")
        .slice(2)
        .join("/");

      const y = 130 + index * 10;

      doc.textWithLink(`Frame ${index + 1}: ${relativePath}`, 20, y, {
        url: imageUrl,
      });
    });
  } else {
    doc.setFontSize(12);
    doc.text("Analzyed Frames:", 20, 120);
    doc.text("[Analzyed Frames To Be Generated]", 20, 125);
  }


  doc.save(`video_analysis_report_${timestamp}.pdf`);
};