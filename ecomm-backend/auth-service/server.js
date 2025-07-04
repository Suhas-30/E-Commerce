import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import path from "path";
import fs from 'fs';

const logFile = path.join(process.cwd(), 'logs', 'latency-metrics.csv');


import {
  storeDeviceFingerprintInfo,
  storeUserContext,
} from "./shared-utils/redisService.js";
import { getIPMetadata } from "./shared-utils/ipUtils.js";

const app = express();
app.use(express.json());
app.set("trust proxy", true);

mongoose
  .connect("mongodb://mongo:27017/authDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected (authDB)"))
  .catch((err) => console.error(err));

const JWT_SECRET = "vulnerable-secret";

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

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
    const {
      email,
      password,
      deviceFingerprint,
      publicIP: clientReportedIP,
      timezone,
    } = req.body;

    const jwtStart = Date.now();

    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const jwtSignTime = Date.now()-jwtStart;

    const forwardedFor = req.headers["x-forwarded-for"];
    const proxyIP = forwardedFor?.split(",")[0]?.trim() || null;
    const privateIP = req.socket.remoteAddress;

    console.log("🧾 Public IP from client:", clientReportedIP);
    console.log("🧾 IP from proxy headers:", proxyIP);

    const isPrivate = (ip) => {
      if (!ip) return true;
      if (ip === "127.0.0.1") return true;
      if (ip.startsWith("172.19.") || ip.startsWith("172.18.")) return false; // Accept WSL Docker dev
      return /^10\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip);
    };

    if (!clientReportedIP || isPrivate(proxyIP)) {
      console.warn("⚠️ Invalid or private IP detected:", proxyIP);
      return res.status(400).json({ message: "Public IP missing or invalid." });
    }

    const userAgent = req.headers["user-agent"] || "";
    const origin = req.headers["origin"] || req.headers["referer"] || "";
    const ipMetaData = await getIPMetadata(clientReportedIP);

    const contextStart = Date.now();

    const sessionContext = {
      userId: user._id.toString(),
      deviceFingerprint,
      privateIP,
      publicIP: clientReportedIP,
      timezone,
      ip_meta: ipMetaData,
      userAgent,
      origin,
      ip_history: [
        {
          ip: clientReportedIP,
          meta: ipMetaData,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await storeUserContext(user._id.toString(), sessionContext);

    await storeDeviceFingerprintInfo({
      userId: user._id.toString(),
      token,
      deviceFingerprint,
    });

    const contextStoreTime = Date.now()-contextStart;

    fs.appendFileSync(logFile, `${Date.now()}, ${jwtSignTime}, ${contextStoreTime},,\n`,
      'utf-8'
    )

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
  console.log("🔐 Auth service running on port 3001");
});
