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


export async function storeUserContext(userId, payload) {
  try {
    await user.setEx(`context:${userId}`, 3600, JSON.stringify(payload));
  } catch (err) {
    console.error(`[Redis] Error storing context for user ${userId}:`, err);
  }
}


export async function getUserSession(userId){

  try{

    const key = `context:${userId}`;
    const value = await user.get(key);

    if(!value) {
      console.warn(`No session found for user ${user}`)
    }

    const sessionobj = JSON.parse(value);
    console.log(`Session is featched for user ${userId}`, value);

    return sessionobj;

  }catch(error){
    console.error(`[Redis] featching user session error ${error}`)
    return null;
  }
  
}





// export async function addIPToHistory(userId, ip, meta) {
//   try {
//     const context = await getUserContext(userId);
//     if (!context) return;

//     if (!context.ip_history) {
//       context.ip_history = [];
//     }

//     context.ip_history.push({
//       ip,
//       meta,
//       timestamp: Date.now()
//     });

//     await storeUserContext(userId, context);
//     console.log(`[Redis] Added IP ${ip} to history for user ${userId}`);

//   } catch (err) {
//     console.error(`[Redis] Error updating IP history for user ${userId}:`, err);
//   }
// }

