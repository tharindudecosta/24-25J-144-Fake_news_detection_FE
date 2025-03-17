import React, { useState } from "react";
import image3 from "../../../public/assets/loginimg.jpeg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth, firestore } from "../../../firebaseconfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import Swal from "sweetalert2";
import { collection, doc, setDoc } from "firebase/firestore";

function Login() {
  const router = useRouter();
  const [type, setType] = useState(true);
  const [email, setEmail] = useState<any>();
  const [password, setPassword] = useState<any>();
  const [cpassword, setCpassword] = useState<string>();
  const [name, setName] = useState<string>();

  const chechpassword = (value: any) => {
    setCpassword(value);
    if (password != value) {
      setType(false);
    } else {
      setType(true);
    }
  };

  const handlesingup = async () => {
    if (type) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        const values = {
          email: email,
          name: name,
          type: "user",
        };

        const userRef = doc(firestore, "user", user.uid);
        await setDoc(userRef, values);

        Swal.fire("Success", "Account created successfully!", "success");
        router.push("/");
      } catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
          Swal.fire(
            "Error",
            "This email is already registered. Please log in.",
            "error"
          );
        } else {
          Swal.fire("Error", "Something went wrong. Try again later.", "error");
        }
        console.error("Error signing up:", error);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl">
        <div className="flex justify-center items-center lg:w-1/2 w-full mb-8 lg:mb-0">
          <Image
            className="w-full h-auto lg:h-[600px] lg:w-[700px] rounded-[70px]"
            src={image3}
            alt="Your Company"
          />
        </div>

        <div className="w-1/2 flex flex-col justify-center px-8 py-12">
          <h2 className="text-center text-orange-500 text-3xl font-bold mb-8">
            Create Your FactChecker Account
          </h2>
          <h3 className="text-center text-1xl font-bold mb-8">
            "Join the fight against fake news"
          </h3>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Full Name
            </label>

            <input
              id="text"
              name="text"
              type="text"
              required
              onChange={(e) => setName(e.target.value)}
              className="mt-2 block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="mt-6">
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-600"
            />
          </div>
          <div className="mt-6">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-600"
            />
          </div>
          <div className="mt-6">
            <label htmlFor="password" className="block text-sm font-medium">
              Confirm Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              onChange={(e) => chechpassword(e.target.value)}
              className="mt-2 block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-600"
            />
          </div>
          <div id="form-text" hidden={type} className="text-red-500">
            password is not match.
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="w-full btn btn-primary bg-blue-700 text-white py-2 rounded-md hover:bg-primary"
              onClick={handlesingup}
            >
              Create Account
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already a member?
            <a
              href="/"
              className="ml-2 text-orange-500  hover:text-primary-content"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
