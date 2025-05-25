import Link from "next/link";
import Router from "next/router";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
export default function Niv() {
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const email: any = sessionStorage.getItem("user");
    if (email) {
      setEmail(email);
    }
  }, []);

  const handleLogout = async () => {
    if (email) {
      const result = await Swal.fire({
        title: "Are you sure?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Log out",
      });
      if (result.isConfirmed) {
        try {
          await sessionStorage.removeItem("user");
          Router.push("/");
        } catch (error) {
          console.error("Error during handleUpload: ", error);
          alert(
            "An error occurred during file upload. Please try again later."
          );
        }
      }
    } else {
      await sessionStorage.removeItem("user");
      Router.push("/");
    }
  };

  return (
    <div className="navbar bg-blue-900 text-white">
      <div className="navbar-start">
        <div className="dropdown">
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-300  rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link href={"/emotion-detection"}>
                <b> Emotion Detection</b>
              </Link>
            </li>
            <li>
              <Link href={"/facebook"}>
                <b> Facebook</b>
              </Link>
            </li>
            <li>
              <Link href={"/chat"}>
                <b> Chat</b>
              </Link>
            </li>
          </ul>
        </div>
        <Link href={"/home"}>
          <b className="btn btn-ghost text-xl text-orange-500">FactChecker</b>
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href={"/home"}>
              <b> Home</b>
            </Link>
          </li>
          <li>
            <Link href={"/image_verification"}>
              <b>Fake Image</b>
            </Link>
          </li>
          <li>
            <Link href={"/video_verification"}>
              <b> Fake Video</b>
            </Link>
          </li>
          <li>
            <Link href={"/sinhala_text"}>
              <b>Sinhala News</b>
            </Link>
          </li>
          <li>
            <Link href={"/english_text"}>
              <b> English News</b>
            </Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <a
          className="btn bg-orange-500 border-orange-500 text-white"
          onClick={handleLogout}
        >
          {email ? "Log out" : "Log in"}
        </a>
      </div>
    </div>
  );
}
