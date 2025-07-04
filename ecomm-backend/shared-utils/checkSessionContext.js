import { getUserContext, getDeviceFingerprintInfo } from "./redisService.js";
import { getIPMetadata } from "./ipUtils.js";
import path from  "path";
import fs from "fs";

const logFile = path.join(process.cwd(), 'logs', 'latency-metrics.csv');

export default async function checkSessionContext(req, res, next) {
  console.log("🛡️ [Middleware] Entered checkSessionContext");

  const startTime = Date.now();

  try {
    const authHeader = req.headers.authorization;
    const fingerprint =
      req.headers["devicefingerprint"] || req.body?.deviceFingerprint;
    const publicIPFromClient = req.body?.publicIP; // ✅ NEW: Public IP sent from frontend
    const fallbackIP =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress;
    const ip = publicIPFromClient || fallbackIP; // ✅ Use real client IP first
    const userAgent = req.headers["user-agent"];
    const origin = req.headers["origin"] || req.headers["referer"];
    const clientTimezone = req.body?.timezone;

    if (!authHeader || !fingerprint) {
      console.warn("❌ Missing auth or fingerprint header");
      return res.status(401).json({ message: "Missing auth or fingerprint" });
    }

    const token = authHeader.split(" ")[1];
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    const userId = payload.userId;

    // Load session context from Redis
    const context = await getUserContext(userId);
    if (!context) {
      return res.status(401).json({ message: "Session context not found" });
    }

    // Load fingerprint data from Redis
    const storedFingerprintData = await getDeviceFingerprintInfo(userId);
    const storedFingerprint = storedFingerprintData?.deviceFingerprint;

    const storedMeta = context.ip_meta;
    const currentMeta = await getIPMetadata(ip);

    if (!currentMeta || !storedMeta) {
      console.warn("⚠️ IP metadata missing. Skipping context check.");
      return next();
    }

    // 🧠 Print full comparison logs
    console.log("🔐 Validating session context:");
    console.log(`   ├─ IP: ${ip}`);
    console.log(
      `   ├─ Country: stored = ${storedMeta.country}, current = ${currentMeta.country}`
    );
    console.log(
      `   ├─ ASN: stored = ${storedMeta.asn}, current = ${currentMeta.asn}`
    );
    console.log(
      `   ├─ City: stored = ${storedMeta.city}, current = ${currentMeta.city}`
    );
    console.log(
      `   ├─ Timezone: stored = ${storedMeta.timezone}, current (client) = ${clientTimezone}`
    );
    console.log(`   ├─ Fingerprint (stored) = ${storedFingerprint}`);
    console.log(`   ├─ Fingerprint (incoming) = ${fingerprint}`);
    console.log(
      `   ├─ Origin: stored = ${context.origin}, incoming = ${origin}`
    );
    console.log(
      `   └─ User-Agent: stored = ${context.userAgent}, incoming = ${userAgent}`
    );

    // ✅ Enforce country match
    if (storedMeta.country !== currentMeta.country) {
      console.warn("❌ Country mismatch");
      return res.status(403).json({ message: "Country mismatch" });
    }

    // ✅ Enforce fingerprint match
    if (!storedFingerprint || storedFingerprint !== fingerprint) {
      console.warn("❌ Fingerprint mismatch");
      return res.status(403).json({ message: "Device fingerprint mismatch" });
    }

    // ⚠️ Optional timezone warning
    const normalizeTz = (tz) =>
      tz?.toLowerCase().replace("calcutta", "kolkata");

    if (
      storedMeta.timezone &&
      clientTimezone &&
      normalizeTz(storedMeta.timezone) !== normalizeTz(clientTimezone)
    ) {
      console.warn(
        "⚠️ Timezone mismatch:",
        storedMeta.timezone,
        clientTimezone
      );
    }

    // ⚠️ Optional warnings
    if (storedMeta.asn !== currentMeta.asn) {
      console.warn("⚠️ ASN mismatch:", storedMeta.asn, currentMeta.asn);
    }

    if (context.origin && context.origin !== origin) {
      console.warn("⚠️ Origin mismatch:", context.origin, origin);
    }

    if (context.userAgent && context.userAgent !== userAgent) {
      console.warn("⚠️ User-Agent mismatch:", context.userAgent, userAgent);
    }

    const contextVerifyTime = Date.now() - startTime;

    fs.appendFileSync(
      logFile,
      `${Date.now()},,,,${contextVerifyTime}\n`, // Only fills contextVerify column
      'utf-8'
    );

    next();
  } catch (err) {
    console.error("❌ Error in checkSessionContext middleware:", err.message);
    res.status(500).json({ message: "Session validation failed" });
  }
}
