export async function encryptFingerprint(fingerprintObj, keyObj) {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(fingerprintObj));

  // ✅ Check and clean key/iv
  if (!keyObj?.key || !keyObj?.iv) {
    throw new Error("Key or IV is missing from the input object.");
  }

  const cleanedKey = keyObj.key.trim();
  const cleanedIv = keyObj.iv.trim();

  // Convert base64 to Uint8Array
  const rawKey = Uint8Array.from(atob(cleanedKey), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(cleanedIv), c => c.charCodeAt(0));

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    cryptoKey,
    data
  );

  const encryptedBytes = new Uint8Array(encryptedBuffer);
  const encryptedBase64 = btoa(
    encryptedBytes.reduce((str, byte) => str + String.fromCharCode(byte), "")
  );

  return encryptedBase64;
}
