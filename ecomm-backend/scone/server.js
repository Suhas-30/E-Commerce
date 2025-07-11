import express from "express";
import {
  storeUserContext,
  getUserSession,
} from "./shared-utils/redisService.js";
import { generateDeviceFingerprint } from "./shared-utils/generateFingerprint.js";

const app = express();
app.use(express.json());

//Storing user session context

app.post("/store", async (req, res) => {
  try {
    console.log("/store endpoint hit");

    const { userId, symmetricKey, deviceFingerprintParam, ipContext } =
      req.body;

    const keys = Object.keys(deviceFingerprintParam);

    for (let i = keys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [keys[i], keys[j]] = [keys[j], keys[i]];
    }

    const selectedKeys = keys.slice(0, 4); // Pick first 4 shuffled keys
    const selectedParams = {};

    for (const key of selectedKeys) {
      selectedParams[key] = deviceFingerprintParam[key];
    }

    const fingerPrint = generateDeviceFingerprint(selectedParams);

    const storing = {
      symmetricKey,
      selectedParams,
      fingerPrint,
      ipContext,
    };

    await storeUserContext(userId, storing);

    console.log("Stored context:", storing);

    return res
      .status(200)
      .json({ message: "Session context stored successfully" });
  } catch (error) {
    console.error("Error in storing session context of /store", error);
    res.status(500).json({ error: "Failed to store session context" });
  }
});

app.get("/fetch/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId parameter" });
    }

    const userSession = await getUserSession(userId);

    if (!userSession) {
      return res.status(404).json({ error: "User session not found" });
    }

    console.log(
      `Session of user ${userId} is fetched successfully`,
      userSession
    );

    return res.status(200).json({
      message: "User session featched successfully",
      session: userSession,
    });
  } catch (error) {
    console.error("Error in featchi");
    return res.status(500).json({
      error: "Failed to fetch user session check the end point /fetch",
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`[SCONE Validator] Running on port ${PORT}`);
});

// await storeUserContext(userId, <storing>);
