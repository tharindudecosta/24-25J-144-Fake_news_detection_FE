import React, { useState } from "react";
import image3 from "../../public/assets/loginimg.jpeg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth } from "../../firebaseconfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import Swal from "sweetalert2";

function Login() {
  const router = useRouter();
  const [email, setEmail] = useState<any>();
  const [password, setPassword] = useState<any>();

  const handlelogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user: any = userCredential.user;

      if (user) {
        sessionStorage.setItem("user", user.email);
        localStorage.setItem("user", user.email);
        router.push("/home");
      }
    } catch (error) {
      console.error("Error signing in:", error);
      Swal.fire("Error", "login error", "error");
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
            Login to FactChecker
          </h2>
          <h3 className="text-center text-1xl font-bold mb-8">
            "Stay informed. Authenticate news"
          </h3>

          <div>
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
            <button
              type="submit"
              className="w-full btn bg-blue-700 text-white py-2 rounded-md hover:bg-primary"
              onClick={handlelogin}
            >
              Log In
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-400">
            Don’t you have account?
            <a
              href="/signup"
              className="ml-2 text-orange-500 hover:text-primary-content"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
