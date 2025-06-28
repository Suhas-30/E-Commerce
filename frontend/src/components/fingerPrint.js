import sha256 from 'crypto-js/sha256';

function getCanvasHash() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'alphabetic';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('canvas-fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('canvas-fingerprint', 4, 17);
    return canvas.toDataURL();
  } catch {
    return 'unsupported';
  }
}

function getWebGLInfo() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'WebGL not supported';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unavailable';
  } catch {
    return 'WebGL error';
  }
}

function getWebGLVendor() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
    return debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unavailable';
  } catch {
    return 'WebGL error';
  }
}

export async function generateDeviceFingerprint() {
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory || 'N/A',
    touchSupport: 'ontouchstart' in window,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    doNotTrack: navigator.doNotTrack || 'unspecified',
    plugins: Array.from(navigator.plugins, p => p.name),
    webGLGPU: getWebGLInfo(),
    webGLVendor: getWebGLVendor(),
    canvasHash: getCanvasHash(),
    connectionType: navigator.connection?.type || 'unknown',
    downlink: navigator.connection?.downlink || 'N/A',
  };

  const hash = sha256(JSON.stringify(fingerprint)).toString();

  console.log("✅ Device Fingerprint:", fingerprint);
  console.log("🔑 Fingerprint Hash (SHA-256):", hash);
  return hash;
}
