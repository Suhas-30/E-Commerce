import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch cart for authenticated user
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost/order/cart', {
        headers: {
          Authorization: `Bearer ${token}`
        }
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
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Your Cart</h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : errorMsg ? (
        <p className="text-red-600">{errorMsg}</p>
      ) : cartItems.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {cartItems.map((item, index) => (
              <li
                key={index}
                className="p-4 border rounded-lg shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="text-lg font-medium">{item.productname}</p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity} — ₹{item.price}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-center">
            <p className="text-xl font-semibold">
              Total: ₹{totalAmount.toLocaleString()}
            </p>
            <button
              onClick={() =>
                navigate('/buy', { state: { items: cartItems, totalAmount } })
              }
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Buy All
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
