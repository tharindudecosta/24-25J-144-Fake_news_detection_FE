import Swal from "sweetalert2";
import { auth, firestore, storage } from "../../firebaseconfig";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";

export const checkPremium = async (userEmail: string, router?: any) => {
  Swal.fire({
    title: "Checking for access...",
    didOpen: () => Swal.showLoading(),
  });
  const isPremium = await checkPremiumStatus(userEmail);
  const verificationsToday = await checkDailyVerifications(userEmail);

  if (!isPremium && verificationsToday >= 3) {
    const result = await Swal.fire({
      title: "Daily Limit Reached",
      text: "You have reached your daily limit of 3 video verifications. Please upgrade to premium to continue.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Upgrade to Premium",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      router.push("/paymentGateWay");
    }
    return false;
  } else {
    return true;
  }
};

const checkPremiumStatus = async (userEmail: string) => {
  const paymentRef = doc(firestore, "payment", userEmail);
  const paymentDoc = await getDoc(paymentRef);

  if (paymentDoc.exists()) {
    const data = paymentDoc.data();
    const expire = data.expire?.toDate();
    return expire && expire > new Date();
  }
  return false;
};

const checkDailyVerifications = async (userEmail: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const userDocRef = collection(
    firestore,
    "VideoVerification",
    userEmail,
    "Results"
  );
  const q = query(userDocRef, where("timestamp", ">=", today));

  const querySnapshot = await getDocs(q);
  return querySnapshot.size;
};
