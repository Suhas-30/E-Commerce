import crypto from "crypto";

export default function generateKey() {
  const symmetricKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  const keyBase64 = symmetricKey.toString("base64");
  const ivBase64 = iv.toString("base64");

  const userEncryptionData = {
    key: keyBase64,
    iv: ivBase64,
  };

  return userEncryptionData
}
