import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-white min-h-screen px-4 py-6">
      {/* Header with Login/Register */}
      <header className="flex justify-between items-center max-w-7xl mx-auto mb-10">
        <h1 className="text-2xl font-bold text-blue-600">Ecomm</h1>
        <div className="space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          Welcome to Ecomm
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Your one-stop shop for the latest and greatest products.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition">
            Shop Now
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-lg shadow transition">
            Learn More
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {[1, 2, 3, 4, 5, 6].map((id) => (
          <div key={id} className="bg-white p-4 border rounded-xl shadow hover:shadow-lg transition">
            <div className="h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">
              Image {id}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Product {id}</h3>
            <p className="text-gray-500">$49.99</p>
            <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
