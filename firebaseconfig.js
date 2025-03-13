import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA0YHbfC_t21isTnwA-6aZ7e2FYrcMT_Sg",
  authDomain: "blood-donation-ac142.firebaseapp.com",
  databaseURL: "https://blood-donation-ac142-default-rtdb.firebaseio.com",
  projectId: "blood-donation-ac142",
  storageBucket: "blood-donation-ac142.appspot.com",
  messagingSenderId: "385846849363",
  appId: "1:385846849363:web:3e1863ff8404f389f9fba6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, firestore, storage };
