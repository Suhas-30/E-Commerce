import React from 'react';
import Navbar from '../components/Navbar';

const Cart = ({ cartItems = [], onUpdateQuantity, onRemoveItem }) => {
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartItems={cartItems} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-xl text-gray-600">Your cart is empty</p>
            <button className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center p-6 border-b last:border-b-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <div className="flex-1 ml-6">
                      <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{item.brand}</p>
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="text-gray-500 hover:text-primary"
                          disabled={item.quantity <= 1}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <span className="mx-4 text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-500 hover:text-primary"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-secondary">${(item.price * item.quantity).toFixed(2)}</p>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-600 mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold text-gray-800">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  <button className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90 transition-colors">
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 