import React, { useState, useEffect } from "react";
import Niv from "@/components/niv";
import {
  FaCrown,
  FaCheck,
  FaShieldAlt,
  FaHeadset,
  FaTimes,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { collection, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "../../../firebaseconfig";

function PaymentGateway() {
  const [showPayPal, setShowPayPal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [expireDate, setExpireDate] = useState<Date | null>(null);

  useEffect(() => {
    checkPremiumStatus();
    const interval = setInterval(checkPremiumStatus, 3600000);
    return () => clearInterval(interval);
  }, []);

  const checkPremiumStatus = async () => {
    const userEmail = localStorage.getItem("user");
    if (!userEmail) return;

    const paymentRef = doc(firestore, "payment", userEmail);
    const paymentDoc = await getDoc(paymentRef);

    if (paymentDoc.exists()) {
      const data = paymentDoc.data();
      const expire = data.expire?.toDate();

      if (expire && expire > new Date()) {
        setIsPremium(true);
        setExpireDate(expire);
      } else {
        await deleteDoc(paymentRef);
        setIsPremium(false);
        setExpireDate(null);
      }
    } else {
      setIsPremium(false);
      setExpireDate(null);
    }
  };

  const handleGetPremium = () => {
    Swal.fire({
      title: "Premium Subscription",
      text: "Are you sure you want to proceed with the premium subscription?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#FF6B00",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, subscribe!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setShowPayPal(true);
      }
    });
  };

  const handleCancelPremium = async () => {
    const result = await Swal.fire({
      title: "Cancel Premium",
      text: "Are you sure you want to cancel your premium subscription?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF6B00",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, cancel!",
      cancelButtonText: "Keep Premium",
    });

    if (result.isConfirmed) {
      const userEmail = localStorage.getItem("user");
      if (userEmail) {
        const paymentRef = doc(firestore, "payment", userEmail);
        await deleteDoc(paymentRef);
        setIsPremium(false);
        setExpireDate(null);
        Swal.fire({
          title: "Cancelled!",
          text: "Your premium subscription has been cancelled.",
          icon: "success",
          confirmButtonColor: "#FF6B00",
        });
      }
    }
  };

  const createPaymentDocument = async (userEmail: string) => {
    const today = new Date();
    const expireDate = new Date();
    expireDate.setMonth(expireDate.getMonth() + 1);

    const paymentRef = doc(collection(firestore, "payment"), userEmail);
    await setDoc(paymentRef, {
      payment_success: "yes",
      timestamp: today,
      expire: expireDate,
    });
    setIsPremium(true);
    setExpireDate(expireDate);
  };

  return (
    <PayPalScriptProvider
      options={{
        clientId:
          "AWOJXxq72xZnVNvMi2IzOAHNab_jSe1WvZW_prrQVIY_zAtQJdYGgmMNaYmyDvg53WB5nMJyuyHyj9qg",
      }}
    >
      <div className="min-h-screen bg-gray-50">
        <Niv />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {isPremium ? "Premium Active" : "Upgrade to Premium"}
            </h1>
            <p className="text-xl text-gray-600">
              {isPremium
                ? `Your premium plan expires on ${expireDate?.toLocaleDateString()}`
                : "Unlock unlimited video verifications and premium features"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-center mb-8">
                <FaCrown className="w-32 h-32 text-orange-500" />
              </div>
              <h2 className="text-3xl font-bold text-center text-orange-500 mb-6">
                Premium Features
              </h2>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <FaCheck className="w-6 h-6 text-green-500 mr-2" />
                  Unlimited video, image, and voice verifications
                </li>
                <li className="flex items-center">
                  <FaShieldAlt className="w-6 h-6 text-green-500 mr-2" />
                  Priority processing
                </li>
                <li className="flex items-center">
                  <FaHeadset className="w-6 h-6 text-green-500 mr-2" />
                  24/7 support
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Premium Plan
                </h3>
                <div className="text-4xl font-bold text-orange-500 mb-4">
                  $9.99<span className="text-lg text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 mb-6">
                  Billed monthly, cancel anytime
                </p>
              </div>

              {!isPremium ? (
                !showPayPal ? (
                  <button
                    onClick={handleGetPremium}
                    className="w-full bg-orange-500 text-white font-bold py-4 px-6 rounded-lg hover:bg-orange-600 transition duration-300 transform hover:scale-105"
                  >
                    Get Premium Now
                  </button>
                ) : (
                  <div className="mt-4">
                    <PayPalButtons
                      style={{ layout: "vertical" }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [
                            {
                              amount: {
                                currency_code: "USD",
                                value: "10.00",
                              },
                            },
                          ],
                        });
                      }}
                      onApprove={async (data, actions) => {
                        if (!actions?.order)
                          return Promise.reject("Order actions not available");
                        return actions.order.capture().then(async (details) => {
                          const payerName =
                            details.payer?.name?.given_name || "customer";
                          const userEmail = localStorage.getItem("user");

                          if (userEmail) {
                            await createPaymentDocument(userEmail);
                          }

                          Swal.fire({
                            title: "Success!",
                            text: `Transaction completed by ${payerName}`,
                            icon: "success",
                            confirmButtonColor: "#FF6B00",
                          });
                          setShowPayPal(false);
                        });
                      }}
                    />
                  </div>
                )
              ) : (
                <button
                  onClick={handleCancelPremium}
                  className="w-full bg-red-500 text-white font-bold py-4 px-6 rounded-lg hover:bg-red-600 transition duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  <FaTimes className="mr-2" />
                  Cancel Premium
                </button>
              )}

              <p className="text-center text-gray-500 mt-4 text-sm">
                Secure payment processing • 30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}

export default PaymentGateway;
