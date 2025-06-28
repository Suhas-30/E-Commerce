import { getDeviceFingerprintInfo } from './redisService.js';

export default async function checkFingerprint(req, res, next) {
  const userId = req.user?.userId;
  const fingerprint = req.body?.deviceFingerprint;

  if (!userId || !fingerprint) {
    console.log("❌ Missing userId or fingerprint", { userId, fingerprint });
    return res.status(400).json({ message: "Missing user ID or fingerprint" });
  }

  const stored = await getDeviceFingerprintInfo(userId);
  console.log("🔍 Stored fingerprint:", stored?.deviceFingerprint);
  console.log("📥 Incoming fingerprint:", fingerprint);

  if (!stored) {
    return res.status(401).json({ message: "No fingerprint stored in Redis" });
  }

  if (stored.deviceFingerprint !== fingerprint) {
    return res.status(401).json({ message: "Device fingerprint mismatch" });
  }

  console.log(`✅ Fingerprint verified for user ${userId}`);
  next();
}
