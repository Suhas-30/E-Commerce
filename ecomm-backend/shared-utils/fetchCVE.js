import axios from "axios";

const NVD_API_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0";
const API_KEY = "3feed38d-a417-4cc5-8c76-ef6582cbf882";

export async function fetchCVE(keyword, results = 1) {
  try {
    const res = await axios.get(NVD_API_URL, {
      headers: { apiKey: API_KEY },
      params: {
        keywordSearch: keyword,
        resultsPerPage: 1
      }
    });

    const vulns = res.data?.vulnerabilities || [];

    return vulns.map((v) => {
      const cwe =
        v.cve.weaknesses?.[0]?.description?.[0]?.value || "N/A";

      return {
        id: v.cve.id,
        cwe,
        // description: v.cve.descriptions[0]?.value,
        published: v.cve.published
      };
    });
  } catch (err) {
    console.error("CVE fetch error:", err.message);
    return [];
  }
}