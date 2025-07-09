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
    deviceFingerprintParam: "",
    publicIP: "",
    timezone: "",
  });

  const [encryptionKeyObj, setEncryptionKeyObj] = useState(null); // will store { key, iv }
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const fingerprint = await generateDeviceFingerprint();
      const ip = await getPublicIP();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      setFormData((prev) => ({
        ...prev,
        deviceFingerprintParam: fingerprint,
        publicIP: ip,
        timezone,
      }));

      setReady(true);
    };

    init();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${base_api_url}/auth/login`, formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.symmetricKey) {
        setEncryptionKeyObj(res.data.symmetricKey); // object with { key, iv }
      }

      setLoginSuccess(true);
    } catch (err) {
      console.error("Login Failed:", err.response?.data || err.message);
      alert("❌ Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!encryptionKeyObj) {
      alert("No key to copy.");
      return;
    }

    try {
      const keyString = JSON.stringify(encryptionKeyObj); // make it copyable
      await navigator.clipboard.writeText(keyString);
      alert("🔑 Symmetric key copied to clipboard!");
    } catch (err) {
      console.error("Copy failed:", err);
      alert("❌ Failed to copy key");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Login to Your Account
        </h2>

        {!loginSuccess ? (
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
              disabled={!ready || loading}
              className={`w-full py-2 rounded-lg font-semibold transition ${
                ready && !loading
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? "🔄 Logging in..." : ready ? "Login" : "Loading..."}
            </button>
          </form>
        ) : (
          <div className="mt-6 text-center">
            <h3 className="text-lg font-semibold text-green-600 mb-4">
              ✅ Login Successful
            </h3>
            <p className="text-sm mb-2 text-gray-700">
              Click below to copy your symmetric key securely.
            </p>

            <button
              onClick={handleCopy}
              className="w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              📋 Copy Symmetric Key
            </button>

            <p className="text-xs text-gray-500 mt-2">
              Store it safely. It won't be shown again.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-4 text-sm text-blue-600 underline"
            >
              Continue to App →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

