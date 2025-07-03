export async function getPublicIP() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip; // returns something like "27.61.42.140"
  } catch (error) {
    console.error("❌ Failed to fetch public IP:", error.message);
    return null;
  }
}
