import crypto from "crypto";

export function decryptPayload(symmetricKey, encryptedBase64) {
  try {
    if (!symmetricKey || !symmetricKey.key || !symmetricKey.iv) {
      throw new Error("Missing symmetricKey, key, or iv.");
    }

    const keyBuffer = Buffer.from(symmetricKey.key, "base64");
    const ivBuffer = Buffer.from(symmetricKey.iv, "base64");
    const encryptedBuffer = Buffer.from(encryptedBase64, "base64");

    const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuffer, ivBuffer);

    const authTag = encryptedBuffer.slice(-16);
    const ciphertext = encryptedBuffer.slice(0, -16);

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch (err) {
    console.error("❌ Decryption failed:", err.message);
    throw new Error("Decryption failed");
  }
}
