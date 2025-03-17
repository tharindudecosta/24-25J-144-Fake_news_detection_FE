import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { firestore } from "../../firebaseconfig";
import firebase from "firebase/compat/app";
import Swal from "sweetalert2";
import Image from "next/image";
import header3 from "../../public/assets/Screenshot 2024-07-03 225512.png";

interface Booking {
  cid: string;
  rating: number;
  timestamp: any;
}

function Footer() {
  const [selectedRating, setSelectedRating] = useState(1);
  const [id, setId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = sessionStorage.getItem("user");
        const dataCollection = collection(firestore, "feedback");
        const q = query(
          dataCollection,
          where("user", "==", email),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        const firebaseData: any = querySnapshot.docs.map((doc) => {
          const data = doc.data() as Booking;
          return {
            ...data,
            cid: doc.id,
          };
        });
        await setSelectedRating(firebaseData[0].rating);
        // await setId(firebaseData[0].cid);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  const handleRatingChange = async (event: any) => {
    try {
      const result = await Swal.fire({
        icon: "question",
        title: "Do you want to make this change? ",
        // text: "You cannot change the status after this ",
        showCancelButton: true,
        confirmButtonColor: "#04d43c",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes ",
      });

      if (result.isConfirmed) {
        const ratingIndex: any = parseInt(event.target.value);
        setSelectedRating(ratingIndex);
        const email = sessionStorage.getItem("user");
        await addDoc(collection(firestore, "feedback"), {
          user: email,
          rating: ratingIndex,
          timestamp: new Date(),
        });
      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <footer className="footer p-20 bg-neutral text-neutral-content flex ">
      <aside>
        <Image
          src={header3}
          width={150}
          height={150}
          alt="Picture of the author"
          style={{ borderRadius: 70 }}
        />
        <p>
          MindfUlness
          <br />
        </p>
      </aside>
      <nav>
        <h6 className="footer-title">Social</h6>
        <div className="grid grid-flow-col gap-4">
          <a>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
            </svg>
          </a>
          <a>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
            </svg>
          </a>
          <a>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
            </svg>
          </a>
        </div>
        <div>
          <p>Rate Us</p>
          <div className="rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <input
                key={value}
                type="radio"
                name="rating-2"
                value={value}
                className="mask mask-star-2 bg-orange-400"
                checked={value === selectedRating}
                onChange={handleRatingChange}
              />
            ))}
          </div>
        </div>
      </nav>
    </footer>
  );
}

export default Footer;
