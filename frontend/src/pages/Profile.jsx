import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Safe parsing of user object
  let user = null;
  const userStr = localStorage.getItem('user');

  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    console.error("❌ Failed to parse user from localStorage:", err);
    user = null;
  }

  const userName = user?.name || 'Guest';
  const email = user?.email || 'user@example.com';
  const initials = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white font-bold flex items-center justify-center hover:scale-105 transition"
        title="Profile"
      >
        {initials}
      </button>

      {/* Dropdown Panel with Animation */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 animate-fade-scale">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xl font-bold">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{email}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition"
            >
              🛒 View Cart
            </button>
            <button
              onClick={() => navigate('/view-orders')}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition"
            >
              📦 My Orders
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
