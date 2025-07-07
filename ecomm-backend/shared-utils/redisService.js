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


export async function storeUserContext(userId, context) {
  try {
    await user.setEx(`context:${userId}`, 86400, JSON.stringify(context));

    console.log(`✅ [Redis] Session context stored for user ${userId}`);
    console.log(`   ├─ IP: ${context.publicIP}`);
    console.log(`   ├─ Country: ${context.ip_meta?.country}`);
    console.log(`   ├─ City: ${context.ip_meta?.city}`);
    console.log(`   ├─ ASN: ${context.ip_meta?.asn}`);
    console.log(`   ├─ Timezone: ${context.ip_meta?.timezone}`);
    console.log(`   ├─ Origin: ${context.origin}`);
    console.log(`   ├─ User-Agent: ${context.userAgent}`);
    console.log(`   └─ Fingerprint: ${context.deviceFingerprint}`);
  } catch (err) {
    console.error(`[Redis] Error storing context for user ${userId}:`, err);
  }
}




export async function getUserContext(userId) {
  try {
    const data = await user.get(`context:${userId}`);
    const parsed = data ? JSON.parse(data) : null;

    if (parsed) {
      console.log(`📦 [Redis] Session context loaded for user ${userId}`);
      console.log(`   ├─ Stored IP: ${parsed.publicIP}`);
      console.log(`   ├─ Country: ${parsed.ip_meta?.country}`);
      console.log(`   ├─ ASN: ${parsed.ip_meta?.asn}`);
      console.log(`   └─ Fingerprint: ${parsed.deviceFingerprint}`);
      console.log(`   └─ City: ${parsed.ip_meta?.city}`);
    } else {
      console.warn(`⚠️ [Redis] No session context found for user ${userId}`);
    }

    return parsed;
  } catch (err) {
    console.error(`[Redis] Error fetching context for user ${userId}:`, err);
    return null;
  }
}


export async function addIPToHistory(userId, ip, meta) {
  try {
    const context = await getUserContext(userId);
    if (!context) return;

    if (!context.ip_history) {
      context.ip_history = [];
    }

    context.ip_history.push({
      ip,
      meta,
      timestamp: Date.now()
    });

    await storeUserContext(userId, context);
    console.log(`[Redis] Added IP ${ip} to history for user ${userId}`);

  } catch (err) {
    console.error(`[Redis] Error updating IP history for user ${userId}:`, err);
  }
}

