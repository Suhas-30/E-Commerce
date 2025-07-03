const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = 3100;

app.use(cors());
app.use(express.json());

app.use(async (req, res) => {
  try {
    const isJson = req.headers["content-type"]?.includes("application/json");
    const isPost = req.method === "POST";

    if (isPost && isJson) {
      const mlResponse = await axios.post("http://ml-service:8000/predict", {
        payload: req.body,
      });

      const prediction = mlResponse.data.prediction;
      console.log("🧠 ML Prediction:", prediction);

      if (prediction === "malicious") {
        return res
          .status(403)
          .json({ error: "Blocked: malicious request detected" });
      }
    }

    // Forward request to actual API Gateway
    const gatewayUrl = `http://api-gateway${req.originalUrl}`;

    const forwarded = await axios({
      method: req.method,
      url: gatewayUrl,
      headers: {
        ...req.headers,
        host: "api-gateway",
      },
      data: req.body,
      validateStatus: (status) => status >= 200 && status < 400, // ✅ Accept 304 as valid
    });

    res.status(forwarded.status).json(forwarded.data);
  } catch (err) {
    // ✅ Only log real errors
    if (err.response?.status === 304) {
      return res.status(304).end();
    }

    console.error("Error in forwarding:", err.message);

    if (err.response) {
      return res
        .status(err.response.status)
        .json(err.response.data || { error: "Request failed" });
    }

    res.status(500).json({ error: "Proxy failed" });
  }
});

app.listen(port, () => {
  console.log(`✅ ML Filter Proxy running on http://localhost:${port}`);
});
