import { auth, firestore, storage } from "../../firebaseconfig";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Swal from "sweetalert2";

export const uploadVideoToFirebase = async (
  videoFile: File,
  userEmail: string,
  rootFolder: string
) => {
  if (!videoFile || !userEmail) {
    throw new Error("Missing video or user email");
  }

  const storageRef = ref(
    storage,
    `${rootFolder}/${userEmail}/Results/${Date.now()}_${videoFile.name}`
  );

  console.log(storageRef);
  await uploadBytes(storageRef, videoFile);
  const videoUrl = await getDownloadURL(storageRef);

  return videoUrl;
};

export const sendVideoToAPI = async (videoFile: File, userEmail: string) => {
  try {
    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("email", userEmail);

    Swal.fire({
      title: "Uploading...",
      text: "Please wait while your video is being uploaded.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const videoUrl = await uploadVideoToFirebase(
      videoFile,
      userEmail,
      "VideoVerification"
    );

    const res = await fetch("http://3.25.131.148/api/analyzeVideo", {
      method: "POST",
      body: formData,
      mode: "cors",
    });

    if (res.ok) {
      const result = await res.json();

      if (result?.prediction) {
        const userDocRef = collection(
          firestore,
          "VideoVerification",
          userEmail,
          "Results"
        );

        await addDoc(userDocRef, {
          result: result.prediction,
          fake_count: result.fake_count,
          real_count: result.real_count,
          total_count: result.total_count,
          total_time: result.total_time,
          title: "VideoVerification",
          videoUrl,
          timestamp: new Date(),
        });

        Swal.fire(
          "Success",
          "Video uploaded and analyzed successfully!",
          "success"
        );
      } else {
        Swal.fire(
          "Error",
          "Invalid API response: Missing result field.",
          "error"
        );
      }
      return result;
    } else {
      Swal.fire("Error", "Failed to upload video!", "error");
      return null;
    }
  } catch (err) {
    console.error("Deepfake API error:", err);
    Swal.fire("Error", "Something went wrong", "error");
    return null;
  }
};

export const analyzeLighting = async (
  videoFile: File,
  userEmail: string,
  aiResponseResult?: any
) => {
  try {
    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("email", userEmail);
    formData.append("frame_rate", "5");

    Swal.fire({
      title: "Uploading...",
      text: "Please wait while your video is being uploaded.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const videoUrl = await uploadVideoToFirebase(
      videoFile,
      userEmail,
      "VideoVerificationLighting"
    );

    const res = await fetch("http://3.25.131.148/api/predictLightning", {
      method: "POST",
      body: formData,
      mode: "cors",
    });

    if (res.ok) {
      const result = await res.json();
      let fe_tot_frame = aiResponseResult.total_count;
      let fe_real_frame = aiResponseResult.total_count - result.fake_count;
      if (result?.prediction) {
        const userDocRef = collection(
          firestore,
          "VideoVerificationLighting",
          userEmail,
          "Results"
        );

        await addDoc(userDocRef, {
          result: result.prediction,
          fake_count: result.fake_count,
          real_count: fe_real_frame,
          total_count: fe_tot_frame,
          total_time: result.total_time,
          title: "Lighting",
          videoUrl,
          timestamp: new Date(),
        });

        const {
          prediction,
          video,
          fake_count,
          real_count,
          total_count,
          total_time,
        } = result;

        Swal.fire(
          "Success",
          "Video uploaded and analyzed successfully!",
          "success"
        );
      } else {
        Swal.fire(
          "Error",
          "Invalid API response: Missing result field.",
          "error"
        );
      }

      return {
        prediction: result.prediction,
        video: result.video,
        fake_count: result.fake_count,
        real_count: fe_real_frame,
        total_count: fe_tot_frame,
        total_time: result.total_time,
      };
    } else {
      Swal.fire("Error", "Failed to upload video!", "error");
      return null;
    }
  } catch (err) {
    console.error("Lighting API error:", err);
    Swal.fire("Error", "Something went wrong", "error");
    return null;
  }
};

export const generateCAM = async (videoFile: File, userEmail: string) => {
  const formData = new FormData();
  formData.append("video", videoFile);
  formData.append("email", userEmail);
  formData.append("num_frames", "5");

  try {
    const res = await fetch("http://3.25.131.148/api/generateCAM", {
      method: "POST",
      body: formData,
    });
    return await res.json();
  } catch (err) {
    console.error("CAM API error:", err);
    return null;
  }
};
