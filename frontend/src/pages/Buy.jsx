import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import base_api_url from "../baseapi/baseAPI";
import { generateDeviceFingerprint } from "../components/fingerPrint";  
const Buy = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items = [], totalAmount = 0 } = location.state || {};

  const placeOrder = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${base_api_url}/order/place`,
        {
          items,
          totalAmount,
          deviceFingerprint: await generateDeviceFingerprint(),
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
      console.error("❌ Error placing order:", err);
      alert("Failed to place order.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Order Summary</h1>

      {items.length === 0 ? (
        <p className="text-gray-600">No items in the order.</p>
      ) : (
        <>
          <ul className="space-y-4 mb-4">
            {items.map((item, index) => (
              <li key={index} className="p-4 border rounded shadow-sm">
                <p className="font-medium">{item.productname}</p>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity}
                </p>
              </li>
            ))}
          </ul>

          <div className="text-xl font-semibold mb-4">
            Total Amount: ₹{totalAmount}
          </div>

          <button
            onClick={placeOrder}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Confirm & Place Order
          </button>
        </>
      )}
    </div>
  );
};

export default Buy;
