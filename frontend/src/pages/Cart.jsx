import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import base_api_url from '../baseapi/baseAPI';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${base_api_url}/order/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      if (data && Array.isArray(data.items)) {
        setCartItems(data.items);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setErrorMsg('Failed to load cart.');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🛒 Your Cart
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading your cart...</p>
      ) : errorMsg ? (
        <p className="text-center text-red-600">{errorMsg}</p>
      ) : cartItems.length === 0 ? (
        <div className="text-center mt-10 text-gray-500">
          <p className="text-2xl">🛍️ Your cart is empty</p>
          <p className="mt-2 text-sm">Start adding some amazing products!</p>
        </div>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {cartItems.map((item, index) => (
              <li
                key={index}
                className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{item.productname}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-600 font-bold">₹{item.price}</p>
                  </div>
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
            onClick={() =>
              navigate('/buy', { state: { items: cartItems, totalAmount } })
            }
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
          >
            🛍️ Buy All
          </button>
        </>
      )}
    </div>
  );
};

export default CartPage;
