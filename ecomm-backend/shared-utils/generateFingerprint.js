import crypto from "crypto";

export function generateDeviceFingerprint(fingerprintObj) {
  try {
    const fingerprintString = JSON.stringify(fingerprintObj);
    const hash = crypto
      .createHash("sha256")
      .update(fingerprintString)
      .digest("hex");
    return hash;
  } catch (err) {
    console.error("❌ Error generating fingerprint hash:", err);
    return "invalid-fingerprint";
  }
}
