import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [productId, setProductId] = useState('');
  const navigate = useNavigate();
  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost/product/products');
      if (Array.isArray(res.data)) {
        setProducts(res.data);
        console.log('✅ Products fetched:', res.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('❌ Failed to fetch products:', err);
      setError('Could not load products. Please try again later.');
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

 const handleAddToCart = (product) => {
  const id = product._id;
  setProductId(id); // This updates the state for later use
  // console.log("Correct ID:", id); // ✅ This prints immediately and correctly
  alert(`✅ "${id}" added to cart successfully!`);
  navigate(`/cart/${id}`)
};


  // Apply zzcategory filter
  let filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((product) => product.category === selectedCategory);

  // Apply search filter (by product name)
  filteredProducts = filteredProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply sorting
  if (sortOption === 'price-low') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price-high') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortOption === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">🛍️ Product Catalog</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-center gap-4 mb-6 items-center">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
        />

        {/* Category Dropdown */}
        <div>
          <label htmlFor="category" className="mr-2 font-medium text-gray-700">
            Category:
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All</option>
            <option value="Mobiles">Mobiles</option>
            <option value="Laptops">Laptops</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div>
          <label htmlFor="sort" className="mr-2 font-medium text-gray-700">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortOption}
            onChange={handleSortChange}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Popularity (Rating)</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-6 text-center">
          {error}
        </div>
      )}

      {/* No Products Message */}
      {filteredProducts.length === 0 && !error && (
        <p className="text-gray-500 text-center">No products found.</p>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={product.image || 'https://via.placeholder.com/300x200?text=No+Image'}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {product.description || 'No description provided.'}
              </p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-600 font-bold text-lg">₹{product.price}</span>
                <span className="text-sm text-gray-500">Stock: {product.stock || 0}</span>
              </div>
              <button
                onClick={() => handleAddToCart(product)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition duration-200"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;