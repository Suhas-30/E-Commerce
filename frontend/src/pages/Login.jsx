import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import base_api_url from "../baseapi/baseAPI";
import { generateDeviceFingerprint } from "../components/fingerPrint";
import { getPublicIP } from "../components/getPublicIP";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    deviceFingerprint: "",
    publicIP: "",
    timezone: ""
  });

  const [ready, setReady] = useState(false); // ✅ block form until fingerprint/IP fetched
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const fingerprint = await generateDeviceFingerprint();
      const ip = await getPublicIP();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      setFormData((prev) => ({
        ...prev,
        deviceFingerprint: fingerprint,
        publicIP: ip,
        timezone,
      }));

      setReady(true); // ✅ allow login
    };

    init();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🚀 Login payload:", formData); // ✅ debug what gets sent

    try {
      const res = await axios.post(`${base_api_url}/auth/login`, formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("✅ Login successful!");
      navigate("/");
    } catch (err) {
      console.error("Login Failed:", err.response?.data || err.message);
      alert("❌ Invalid email or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Login to Your Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={!ready}
            className={`w-full py-2 rounded-lg font-semibold transition ${
              ready
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {ready ? "Login" : "Loading..."}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
