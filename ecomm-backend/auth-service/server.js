import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import generateKey from "./models/generateKey.js";
import axios from "axios";
import { getIPMetadata } from "./shared-utils/ipUtils.js";
import { generateDeviceFingerprint } from "./shared-utils/generateFingerprint.js";

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

//Login route
app.post("/login", async (req, res) => {
  try {
    const {
      email,
      password,
      deviceFingerprintParam,
      publicIP: clientReportedIP,
      timezone,
    } = req.body;

    // Validating
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Device Fingerprint
    // const deviceFingerprint = generateDeviceFingerprint(deviceFingerprintParam);
    // console.log("Device fingerprint:", deviceFingerprint);
    //token creation JWT
    const token = jwt.sign({ userId: user._id, email }, JWT_SECRET, {
      expiresIn: "1h",
    });    
    
    const symmetricKey = generateKey();
    console.log("Sym: ", symmetricKey);


    console.log("🧾 Public IP from client:", clientReportedIP);

    // session Context Creation
    const userAgent = req.headers["user-agent"] || "";
    const origin = req.headers["origin"] || req.headers["referer"] || "";
    const ipMetaData = await getIPMetadata(clientReportedIP);
    const privateIP =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

    const ipContext = {
      privateIP,
      publicIP: clientReportedIP,
      timezone,
      ip_meta: ipMetaData,
      origin
    };

    //sending session context to scone
    try {
      const sconeResponse = await axios.post("http://scone:5000/store", {
        userId: user._id.toString(),
        symmetricKey,
        deviceFingerprintParam,
        ipContext
      });

      console.log("SCONE response status:", sconeResponse.status);
      console.log("SCONE response data:", sconeResponse.data);
    } catch (err) {
      console.error("Error sending session context to SCONE:", err.message);
    }

    //sending respone to clinet with JWT token, private Key for session



    res.json({
      message: "Login successful",
      token,
      user: { name: user.name, email: user.email },
      symmetricKey
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

app.listen(3001, () => {
  console.log("🔐 Auth service running on port 3001");
});


/*

ip_history: [
        {
          ip: clientReportedIP,
          meta: ipMetaData,
          timestamp: new Date().toISOString(),
        },
      ],


{"key":"qRyi2sFG1LPOZXUg2kAdQ0Bp5qmArrLWLhsHA9ZQanw=","iv":"TxVPCVQNnwrZfnECNmocSg=="}




      */
