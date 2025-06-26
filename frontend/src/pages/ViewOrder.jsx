import React, { useEffect, useState } from "react";
import axios from "axios";
import base_api_url from "../baseapi/baseAPI";

const ViewOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${base_api_url}/order/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Error in fetching orders:", error);
      setErrorMsg("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">My Orders</h2>

      {loading ? (
        <p className="text-gray-600 text-center">Loading orders...</p>
      ) : errorMsg ? (
        <p className="text-red-600 text-center">{errorMsg}</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-center">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div
              key={index}
              className="border rounded-lg p-5 shadow-sm hover:shadow-md transition bg-white"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Order #{order._id?.slice(-6)}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <ul className="text-sm text-gray-700 mb-3 space-y-1">
                {order.items?.map((item, i) => (
                  <li key={i} className="border-b pb-1">
                    {item.productname} — <span className="font-medium">Qty: {item.quantity}</span>
                  </li>
                ))}
              </ul>

              <div className="text-right text-base font-semibold text-blue-600">
                Total: ₹{order.totalAmount}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewOrder;
