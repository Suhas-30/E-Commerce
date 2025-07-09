import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import base_api_url from "../baseapi/baseAPI";
import { generateDeviceFingerprint } from "../components/fingerPrint";
import { getPublicIP } from "../components/getPublicIP";
import { encryptFingerprint } from "../components/signPayload.js";
import { Search } from "lucide-react";
import axiosConfig from "../components/axiosConfig";
import Profile from "./Profile";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingProductId, setLoadingProductId] = useState(null);

  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${base_api_url}/product/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    }
  };

  const handleAddToCart = async (product) => {
    if (!isLoggedIn) {
      alert("🔒 Please log in to add products to your cart.");
      return;
    }

    setLoadingProductId(product._id);

    try {
      const [fingerprint, publicIP] = await Promise.all([
        generateDeviceFingerprint(),
        getPublicIP(),
      ]);
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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

      const encryptedFingerprint = await encryptFingerprint(fingerprint, keyObj);

      await axiosConfig.post(
        `/order/cart`,
        {
          productId: product._id,
          publicIP,
          timezone,
          encryptedFingerprint,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert(`✅ ${product.name} added to cart!`);
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      alert("❌ Failed to add product to cart.\n" + msg);
    } finally {
      setLoadingProductId(null);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen px-4 py-6">
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

      <section className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          🌟 Explore Our Latest Products
        </h2>

        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-2 sm:px-0">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col"
              >
                <img
                  src={product.image || "https://via.placeholder.com/300x200"}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="mt-auto flex justify-between items-center">
                    <span className="text-blue-600 font-bold text-base">
                      ₹{product.price}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={loadingProductId === product._id}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                        loadingProductId === product._id
                          ? "bg-gray-400 cursor-not-allowed text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {loadingProductId === product._id
                        ? "Adding..."
                        : "Add to Cart"}
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
