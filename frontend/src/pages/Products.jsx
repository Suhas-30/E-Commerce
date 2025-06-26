import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import base_api_url from "../baseapi/baseAPI";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${base_api_url}/product/products`);
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to fetch products:", err);
      setError("Could not load products. Please try again later.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("🔒 Please log in to add products to cart.");
      return;
    }

    try {
      await axios.post(
        `${base_api_url}/order/cart`,
        { productId: product._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(`✅ "${product.name}" added to cart!`);
    } catch (error) {
      console.error("❌ Add to cart failed:", error);
      alert("Failed to add to cart.");
    }
  };

  let filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  filteredProducts = filteredProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (sortOption === "price-low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOption === "price-high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortOption === "rating") {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">🛍️ Product Catalog</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-center gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        />
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="All">All</option>
          <option value="Mobiles">Mobiles</option>
          <option value="Laptops">Laptops</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
        </select>
        <select
          value={sortOption}
          onChange={handleSortChange}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="default">Default</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      {/* Product Grid */}
      {error && <p className="text-red-600 text-center">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="border rounded-lg p-4 shadow hover:shadow-md">
            <img
              src={product.image || "https://via.placeholder.com/300x200"}
              alt={product.name}
              className="w-full h-48 object-cover mb-4 rounded"
            />
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.description}</p>
            <p className="font-bold text-blue-600 mt-2">₹{product.price}</p>
            <button
              onClick={() => handleAddToCart(product)}
              className="mt-3 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
