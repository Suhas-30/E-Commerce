import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Profile from './Profile'; // 🔗 Import the profile dropdown component
import base_api_url from '../baseapi/baseAPI'; // 🔗 Import base API URL
const Home = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  //http://localhost/product/products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${base_api_url}/product/products`);
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const isLoggedIn = !!localStorage.getItem("token");
  //http://localhost/order/cart
  const handleAddToCart = async (product) => {
    if (isLoggedIn) {
      try {
        await axios.post(
          `${base_api_url}/order/cart`,
          { productId: product._id },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        alert(`✅ ${product.name} added to cart successfully!`);
      } catch (error) {
        console.error("Add to cart failed", error);
        alert("⚠️ Failed to add to cart.");
      }
    } else {
      alert("🔒 Please log in to add products to cart.");
    }
  };

  return (
    <div className="bg-white min-h-screen px-4 py-6">
      <header className="flex justify-between items-center max-w-7xl mx-auto mb-10">
        <h1 className="text-2xl font-bold text-blue-600">Ecomm</h1>
        <div className="space-x-3 flex items-center">
          {isLoggedIn ? (
            <Profile /> // ✅ Show profile dropdown
          ) : (
            <>
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
            </>
          )}
        </div>
      </header>

      {/* Product Section */}
      <section className="max-w-7xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Products</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">No products available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="border rounded-lg p-4 shadow hover:shadow-md transition"
              >
                <img
                  src={product.image || "https://via.placeholder.com/150"}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                <p className="text-gray-600 mt-1 mb-2">{product.description}</p>
                <p className="text-blue-600 font-semibold text-sm">₹{product.price}</p>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
