function getCanvasHash() {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "alphabetic";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("canvas-fingerprint", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("canvas-fingerprint", 4, 17);
    const dataURL = canvas.toDataURL();

    // Convert to SHA-256 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(dataURL);
    return crypto.subtle.digest("SHA-256", data).then((hashBuffer) => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, "0")).join(""); // hex string
    });
  } catch {
    return Promise.resolve("unsupported");
  }
}

function getWebGLInfo() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    const debugInfo = gl?.getExtension("WEBGL_debug_renderer_info");
    return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "Unavailable";
  } catch {
    return "WebGL error";
  }
}

function getWebGLVendor() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    const debugInfo = gl?.getExtension("WEBGL_debug_renderer_info");
    return debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : "Unavailable";
  } catch {
    return "WebGL error";
  }
}

export async function generateDeviceFingerprint() {
  const canvasHash = await getCanvasHash();

  const fingerprint = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hardwareConcurrency: navigator.hardwareConcurrency,
    webGLGPU: getWebGLInfo(),
    webGLVendor: getWebGLVendor(),
    canvasHash: canvasHash,
  };

  console.log("✅ Slim Device Fingerprint:", fingerprint);
  return fingerprint;
}
