import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PlaceOrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, total } = location.state || {};

  const [address, setAddress] = useState('');

  const handleSubmit = async () => {
    const userId = user001;
    if (!userId || !cartItems?.length || !address) {
      alert('Missing information');
      return;
    }

    try {
      const response = await fetch('http://localhost:3003/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          items: cartItems,
          totalAmount: total,
          address
        })
      });

      if (response.ok) {
        alert('Order placed successfully!');
        navigate('/orders');
      } else {
        alert('Failed to place order');
      }
    } catch (error) {
      console.error('Order error:', error);
    }
  };

  if (!cartItems) return <div>No cart data available.</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Enter Delivery Address</h2>
      <textarea
        className="w-full p-2 border mb-4"
        rows={4}
        placeholder="Enter your address..."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Confirm and Place Order
      </button>
    </div>
  );
};

export default PlaceOrderPage;
