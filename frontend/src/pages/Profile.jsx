import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name || "User";
  const initials = userName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-300 transition-all duration-200"
      >
        {initials}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 opacity-100 scale-100 transition-all duration-200">
          <div className="px-4 py-3 border-b">
            <p className="text-sm text-gray-500">Hi,</p>
            <p className="text-base font-semibold text-gray-800 truncate">{userName}</p>
          </div>
          <button
            onClick={() => navigate("/cart")}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            🛒 View Cart
          </button>
          <button
            onClick={() => navigate("/view-orders")}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            📦 My Orders
          </button>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;

