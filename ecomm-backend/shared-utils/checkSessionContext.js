import axios from "axios";
import { decryptPayload } from "./decryptSignature.js";
import { generateDeviceFingerprint } from "./generateFingerprint.js";
import { getIPMetadata } from "./ipUtils.js";
import { fetchCVE } from "./fetchCVE.js";

export default async function checkSessionContext(req, res, next) {
  try {
    console.log("✅ checkSessionContext middleware file loaded");

    const { productId, publicIP, timezone, encryptedFingerprint } = req.body;
    const userId = req.user?.userId;
    const origin = req.headers.origin || req.headers.referer;
    const userAgent = req.headers["user-agent"];

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access. User ID is missing." });
    }

    console.log("🧠 Users info:", userId, productId, publicIP, timezone, encryptedFingerprint);

    // Load session from SCONE
    const { data: stored } = await axios.get(`http://scone:5000/fetch/${userId}`);
    const storedContext = stored.session;

    const symmetricKey = storedContext.symmetricKey;
    const selectedParams = storedContext.selectedParams;
    const storedFingerprintHash = storedContext.fingerPrint;
    const storedMeta = storedContext.ipContext?.ip_meta || {};
    const storedOrigin = storedContext.ipContext?.origin;
    const storedIP = storedContext.ipContext?.publicIP;

    const decryptedStr = decryptPayload(symmetricKey, encryptedFingerprint);
    const decrypted = JSON.parse(decryptedStr);

    console.log("🔓 Decrypted fingerprint:", decrypted);

    // ✅ Reconstruct fingerprint from selected parameters
    const reconstructed = {};
    for (const key of Object.keys(selectedParams)) {
      reconstructed[key] = decrypted[key];
    }
    const hash = generateDeviceFingerprint(reconstructed);

    if (storedFingerprintHash !== hash) {
      console.warn("❌ Fingerprint mismatch");
      const cves = await fetchCVE("browser fingerprint");
      const cve = cves[0] || null;
      return res.status(403).json({
        message: "Device fingerprint mismatch",
        ...(cve && { cve })
      });
    }

    // ✅ Validate Country
    const currentMeta = await getIPMetadata(publicIP);
    if (storedMeta.country !== currentMeta.country) {
      console.warn("❌ Country mismatch:", storedMeta.country, currentMeta.country);
      const cves = await fetchCVE("ip geolocation spoofing");
      const cve = cves[0] || null;
      return res.status(403).json({
        message: "Country mismatch",
        ...(cve && { cve })
      });
    }


    if (storedMeta.asn !== currentMeta.asn) {
      console.warn("⚠️ ASN mismatch:", storedMeta.asn, currentMeta.asn);
      const cves = await fetchCVE("Authentication Bypass Using an Alternate Path or Channel");
      const cve = cves[0] || null;
      if (cve) {
        console.warn(`📌 Related CVE: ${cve.id} | CWE: ${cve.cwe}`);
      }
    }
    if (storedIP && storedIP !== publicIP) {
      console.warn("⚠️ Public IP mismatch:", storedIP, publicIP);
      const cves = await fetchCVE("ip spoofing");
      const cve = cves[0] || null;
      if (cve) {
        console.warn(`📌 Related CVE: ${cve.id} | CWE: ${cve.cwe}`);
      }
    }

    // ✅ Validate Origin
    if (storedOrigin && origin && storedOrigin !== origin) {
      console.warn("❌ Origin mismatch:", storedOrigin, origin);
      const cves = await fetchCVE("origin validation");
      const cve = cves[0] || null;
      return res.status(403).json({
        message: "Origin mismatch",
        ...(cve && { cve })
      });
    }

    // ✅ Validate User-Agent
    if (storedContext.userAgent && storedContext.userAgent !== userAgent) {
      console.warn("❌ User-Agent mismatch:", storedContext.userAgent, userAgent);
      const cves = await fetchCVE("session hijacking user agent");
      const cve = cves[0] || null;
      return res.status(403).json({
        message: "User-Agent mismatch",
        ...(cve && { cve })
      });
    }

    // ⚠️ Timezone validation
    const normalizeTz = (tz) => tz?.toLowerCase().replace("calcutta", "kolkata");
    if (
      storedMeta.timezone &&
      timezone &&
      normalizeTz(storedMeta.timezone) !== normalizeTz(timezone)
    ) {
      console.warn("⚠️ Timezone mismatch:", storedMeta.timezone, timezone);
      const cves = await fetchCVE("time zone vulnerability");
      const cve = cves[0] || null;
      return res.status(403).json({
        message: "Timezone mismatch",
        ...(cve && { cve })
      });
    }

    console.log("✅ All session context checks passed.");
    next();
  } catch (error) {
    console.error("❌ Error in checkSessionContext middleware:", error.message);
    return res.status(500).json({ error: "Session validation failed" });
  }
}
