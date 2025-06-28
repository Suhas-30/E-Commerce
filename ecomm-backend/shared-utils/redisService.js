import user from './redisCon.js';

export async function storeDeviceFingerprintInfo(deviceFingerprintInfo) {
  const { userId, token, deviceFingerprint } = deviceFingerprintInfo;
  const data = { userId, token, deviceFingerprint };

  try {
    await user.setEx(`fingerprint:${userId}`, 86400, JSON.stringify(data));
    console.log(`[Redis] Stored fingerprint for user ${userId}:`, data);
  } catch (err) {
    console.error(`[Redis] Error storing fingerprint for user ${userId}:`, err);
  }
}

export async function getDeviceFingerprintInfo(userId) {
  try {
    const data = await user.get(`fingerprint:${userId}`);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`[Redis] Error fetching fingerprint for user ${userId}:`, err);
    return null;
  }
}

export async function deleteDeviceFingerprintInfo(userId) {
  try {
    await user.del(`fingerprint:${userId}`);
    console.log(`[Redis] Deleted fingerprint for user ${userId}`);
  } catch (err) {
    console.error(`[Redis] Error deleting fingerprint for user ${userId}:`, err);
  }
}
