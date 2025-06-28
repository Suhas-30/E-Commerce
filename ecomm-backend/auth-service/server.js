import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import { storeDeviceFingerprintInfo } from "./shared-utils/redisService.js";

const app = express();
app.use(express.json());

mongoose
  .connect("mongodb://mongo:27017/authDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const JWT_SECRET = "vulnerable-secret";

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password, deviceFingerprint } = req.body;
    console.log(`Hash received: ${deviceFingerprint}`);
    console.log("Login attempt:", { email, password });

    const user = await User.findOne({ email, password });
    console.log("User found:", user);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const deviceFingerprintInfo = {
      userId: user._id,
      token,
      deviceFingerprint,
    };

    console.log("Device fingerprint info:", deviceFingerprintInfo);

    await storeDeviceFingerprintInfo(deviceFingerprintInfo);

    res.json({
      message: "Login successful",
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

app.listen(3001, () => {
  console.log("Auth service running on port 3001");
});
