import { getUserContext, getDeviceFingerprintInfo } from "./redisService.js";
import { getIPMetadata } from "./ipUtils.js";
import { fetchCVE } from "./fetchCVE.js"; 

export default async function checkSessionContext(req, res, next) {
  console.log("🛡️ [Middleware] Entered checkSessionContext");

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
      console.warn("❌ Country Mismatch");
  const cves = await fetchCVE("ip geolocation spoofing");
  const cve = cves[0] || null;

  if (cve) {
    console.warn(`📌 Related CVE found: ${cve.id} `);
    console.warn(`📌 Associated CWE: ${cve.cwe}`);
  }

  return res.status(403).json({
    message: "Country mismatch",
    ...(cve && { cve })
  });     
    }



if (!storedFingerprint || storedFingerprint !== fingerprint) {
  console.warn("❌ Fingerprint mismatch");

  const cves = await fetchCVE("browser fingerprint");
  const cve = cves[0] || null;

  if (cve) {
    console.warn(`📌 Related CVE found: ${cve.id} `);
    console.warn(`📌 Associated CWE: ${cve.cwe}`);
  }

  return res.status(403).json({
    message: "Device fingerprint mismatch",
    ...(cve && { cve })
  });
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
      const cves = await fetchCVE("time zone vulnerability");
      const cve = cves[0] || null;
      if (cve) {
      console.warn(`📌 Related CVE found: ${cve.id}`);
      console.warn(`📌 Associated CWE: ${cve.cwe}`);
       }
       return res.status(403).json({
        message: "Timezone mismatch",
           ...(cve && { cve })
       });
    }

    // ⚠️ Optional warnings
    if (storedMeta.asn !== currentMeta.asn) {
      console.warn("⚠️ ASN mismatch:", storedMeta.asn, currentMeta.asn);
      const cves = await fetchCVE("Authentication Bypass Using an Alternate Path or Channel");
      const cve = cves[0] || null;
      if (cve) {
      console.warn(`📌 Related CVE found: ${cve.id}`);
      console.warn(`📌 Associated CWE: ${cve.cwe}`);
       }
       return res.status(403).json({
        message: "ASN mismatch",
           ...(cve && { cve })
       });
    }

    if (context.origin && context.origin !== origin) {
      console.warn("⚠️ Origin mismatch:", context.origin, origin);
      const cves = await fetchCVE("origin validation");
      const cve = cves[2] || null;
      if (cve) {
      console.warn(`📌 Related CVE found: ${cve.id}`);
      console.warn(`📌 Associated CWE: ${cve.cwe}`);
       }
       return res.status(403).json({
        message: "Origin mismatch",
           ...(cve && { cve })
       });
    }

    if (context.userAgent && context.userAgent !== userAgent) {
      console.warn("⚠️ User-Agent mismatch:", context.userAgent, userAgent);
      const cves = await fetchCVE("session hijacking user agent");
      const cve = cves[0] || null;
      if (cve) {
      console.warn(`📌 Related CVE found: ${cve.id}`);
      console.warn(`📌 Associated CWE: ${cve.cwe}`);
       }
       return res.status(403).json({
        message: "User-Agent Mismatch",
           ...(cve && { cve })
       });     
    }

    next();
  } catch (err) {
    console.error("❌ Error in checkSessionContext middleware:", err.message);
    res.status(500).json({ message: "Session validation failed" });
  }
}