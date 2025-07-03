const API_TOKEN = "d1a7a776ac72c9";
import axios from "axios";

export async function getIPMetadata(ip) {
  try {
    const response = await axios.get(`https://ipinfo.io/${ip}/json?token=${API_TOKEN}`);
    return {
      country: response.data.country || null,
      city: response.data.city || null,
      asn: response.data.org?.split(" ")[0] || null,
      org: response.data.org || null,
      timezone: response.data.timezone || null,
    };
  } catch (error) {
    console.error("❌ Error in getIPMetadata:", error.message);
    return null;
  }
}
