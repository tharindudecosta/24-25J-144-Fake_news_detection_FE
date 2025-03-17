import React, { useState } from "react";
import image3 from "../../../public/assets/e2b686caaf1dfbd2b7aa9fc1ca3f6e3f.png";
import image1 from "../../../public/assets/img1.png";
import image2 from "../../../public/assets/img2.png";
import image4 from "../../../public/assets/img3.png";
import image5 from "../../../public/assets/img4.png";
import image6 from "../../../public/assets/img5.png";
import image7 from "../../../public/assets/img6.png";
import image8 from "../../../public/assets/img8.png";
import image9 from "../../../public/assets/img9.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Niv from "@/components/niv";
import Swal from "sweetalert2";

function Home() {
  const router = useRouter();
  const [email, setEmail] = useState<any>();
  const [password, setPassword] = useState<any>();

  return (
    <div>
      <Niv />
      <div className="flex min-h-screen  px-4">
        <div className="flex flex-col lg:flex-row w-full max-w-8xl  ">
          <div className="flex justify-center  lg:w-1/2 w-full mb-8 lg:mb-0">
            <Image
              className="  lg:h-[600px] lg:w-[1500px] rounded-[70px]"
              src={image3}
              alt="Your Company"
            />
          </div>

          <div className="w-1/2 flex flex-col justify-center px-8 py-12 mt-5 ">
            <h2 className="text-center text-orange-500 text-3xl font-bold mb-8">
              FactChecker: Verifying the Truth
            </h2>

            <div className="flex flex-col lg:flex-row w-full max-w-6xl">
              <div className="flex justify-center  lg:w-1/2 w-full mb-8 lg:mb-0">
                <Image
                  className="  lg:h-[200px] lg:w-[200px] "
                  src={image1}
                  alt="Your Company"
                />
              </div>

              <div className="w-1/2 flex flex-col justify-center px-8 py-12">
                <Image
                  className="  lg:h-[200px] lg:w-[200px] "
                  src={image2}
                  alt="Your Company"
                />
              </div>
            </div>

            <b className="text-1.5xl text-center ms-5 me-5">
              "Use AI to detect the authenticity of images, videos, news, and
              voice."
            </b>
            <div className="flex flex-col lg:flex-row w-full max-w-6xl">
              <div className="flex justify-center  lg:w-1/2 w-full mb-8 lg:mb-0">
                <Image
                  className="  lg:h-[200px] lg:w-[200px] "
                  src={image4}
                  alt="Your Company"
                />
              </div>

              <div className="w-1/2 flex flex-col justify-center px-8 py-12">
                <Image
                  className="  lg:h-[200px] lg:w-[200px] "
                  src={image5}
                  alt="Your Company"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row m-5">
        <div
          className="card border border-orange-500 border-[3px] rounded-box h-96 flex-grow me-3 "
          style={{
            backgroundImage: `url(${image6.src})`,
            backgroundSize: "",
            backgroundPosition: "Left",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute top-4 right-2  font-bold ">
            <div className=" text-3xl ">Image Verification</div>
            <div className="mt-5">
              {" "}
              "AI identifies if it's real or AI-generated"
            </div>
          </div>

          <div className="absolute bottom-3 p-3 w-full flex justify-end">
            <button className="bg-blue-900 text-white font-bold py-2 px-4 rounded">
              Upload an image
            </button>
          </div>
        </div>

        <div
          className="card border border-orange-500 bg-orange-100 border-[3px] rounded-box h-96 flex-grow me-3 relative"
          style={{
            backgroundImage: `url(${image7.src})`,
            backgroundSize: "",
            backgroundPosition: "Left",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute top-4 right-2  font-bold ">
            <div className=" text-3xl ">Video Verification </div>
            <div className="mt-5"> "AI checks if it's real or fake"</div>
          </div>

          <div className="absolute bottom-3 p-3 w-full flex justify-end">
            <button className="bg-blue-900 text-white font-bold py-2 px-4 rounded">
              Upload a video
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row m-5">
        <div
          className="card border border-orange-500 bg-orange-100 border-[3px] rounded-box h-96 flex-grow me-3 relative"
          style={{
            backgroundImage: `url(${image8.src})`,
            backgroundSize: "",
            backgroundPosition: "Left",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute top-4 right-2  font-bold ">
            <div className=" text-3xl ">Sinhala Text Verification </div>
            <div className="mt-5"> "AI detects real or fake news"</div>
          </div>

          <div className="absolute bottom-3 p-3 w-full flex justify-end">
            <button className="bg-blue-900 text-white font-bold py-2 px-4 rounded">
              Upload Sinhala text
            </button>
          </div>
        </div>
        <div
          className="card border border-orange-500 border-[3px] rounded-box h-96 flex-grow me-3 relative"
          style={{
            backgroundImage: `url(${image9.src})`,
            backgroundSize: "",
            backgroundPosition: "Left",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute top-4 right-2  font-bold ">
            <div className=" text-3xl ">
              English Text and <br />
              Voice Verification
            </div>
            <div className="mt-5"> "AI analyzes its authenticity"</div>
          </div>

          <div className="absolute bottom-3 p-3 w-full flex justify-end">
            <button className="bg-blue-900 text-white font-bold py-2 px-4 rounded">
              Upload English text or voice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
