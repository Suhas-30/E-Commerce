import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Profile from './Profile';
import base_api_url from '../baseapi/baseAPI';
import { generateDeviceFingerprint } from '../components/fingerPrint';
import { Search } from 'lucide-react'; // Optional icon

const Home = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${base_api_url}/product/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    }
  };

  const handleAddToCart = async (product) => {
    if (!isLoggedIn) {
      alert('🔒 Please log in to add products to your cart.');
      return;
    }

    try {
      const fingerprint = await generateDeviceFingerprint();
      await axios.post(
        `${base_api_url}/order/cart`,
        {
          productId: product._id,
          deviceFingerprint: fingerprint,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );
      alert(`✅ ${product.name} added to cart!`);
    } catch (error) {
      console.error('❌ Failed to add product to cart:', error);
      alert('⚠️ Something went wrong. Please try again.');
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchProducts();
      await generateDeviceFingerprint();
    };
    init();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen px-4 py-6">
      {/* Header */}
      <header className="flex justify-between items-center max-w-7xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">🛒 Ecomm</h1>
        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <Profile />
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

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='"Find what you love, love what you find..."'
            className="w-full pl-12 pr-4 py-3 text-gray-700 border border-gray-200 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute top-3.5 left-4 text-gray-400" size={20} />
        </div>
      </div>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          🌟 Explore Our Latest Products
        </h2>

        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500">No products found for your search.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-2 sm:px-0">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col"
              >
                <img
                  src={product.image || 'https://via.placeholder.com/300x200'}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>

                  <div className="mt-auto flex justify-between items-center">
                    <span className="text-blue-600 font-bold text-base">₹{product.price}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
