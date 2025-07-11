import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import base_api_url from "../baseapi/baseAPI";
import { generateDeviceFingerprint } from "../components/fingerPrint";
import { getPublicIP } from "../components/getPublicIP";
import { encryptFingerprint } from "../components/signPayload.js";

const Buy = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items = [], totalAmount = 0 } = location.state || {};

  const [deviceFingerprint, setDeviceFingerprint] = useState("");
  const [publicIP, setPublicIP] = useState("");
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    const init = async () => {
      const fingerprint = await generateDeviceFingerprint();
      const ip = await getPublicIP();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

      setDeviceFingerprint(fingerprint);
      setPublicIP(ip);
      setTimezone(tz);
    };
    init();
  }, []);

  const placeOrder = async () => {
    try {
      const token = localStorage.getItem("token");

      // 🔐 Load symmetric key from sessionStorage or prompt
      let keyObj;
      const cachedKey = sessionStorage.getItem("symmetricKey");

      if (cachedKey) {
        try {
          keyObj = JSON.parse(cachedKey);
        } catch (err) {
          console.warn("⚠️ Invalid symmetric key in sessionStorage. Clearing...");
          sessionStorage.removeItem("symmetricKey");
        }
      }

      if (!keyObj) {
        const keyInput = prompt("🔐 Paste your symmetric key (JSON with 'key' and 'iv'):");
        if (!keyInput) {
          alert("❌ Symmetric key is required.");
          return;
        }

        try {
          const cleaned = keyInput.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"');
          keyObj = JSON.parse(cleaned);
          if (!keyObj.key || !keyObj.iv) {
            alert("❌ Key or IV missing in the input.");
            return;
          }
          sessionStorage.setItem("symmetricKey", JSON.stringify(keyObj));
        } catch (err) {
          alert("❌ Invalid JSON format for symmetric key.");
          console.error("Key parsing error:", err);
          return;
        }
      }

      const encryptedFingerprint = await encryptFingerprint(deviceFingerprint, keyObj);

      const response = await axios.post(
        `${base_api_url}/order/place`,
        {
          items,
          totalAmount,
          encryptedFingerprint,
          publicIP,
          timezone,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ Order placed successfully!");
      console.log("Order response:", response.data);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error("❌ Error placing order:", msg);
      alert("❌ Failed to place order.\n" + msg);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🧾 Order Summary
      </h1>

      {items.length === 0 ? (
        <p className="text-center text-gray-500">No items in the order.</p>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {items.map((item, index) => (
              <li
                key={index}
                className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-800">{item.productname}</p>
                  <span className="text-sm text-gray-600">
                    Qty: {item.quantity}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mb-6 text-right">
            <p className="text-lg text-gray-700 font-medium">
              Total:
              <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                ₹{totalAmount.toLocaleString()}
              </span>
            </p>
          </div>

          <button
            onClick={placeOrder}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
          >
            ✅ Confirm & Place Order
          </button>
        </>
      )}
    </div>
  );
};

export default Buy;
