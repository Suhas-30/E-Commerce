const express = require('express');
const axios = require('axios');
const {createProxyMiddleware} = require('http-proxy-middleware');

const app = express();
app.use(express.json());

const ML_SERVICE_URL = "http://ml-service:8000/predict";
const NGINX_URL = "http://api-gateway";

app.use( async (req, res, next)=>{
    if(["POST", "PUT"].includes(req.method)){
        try {
            const respose = await axios.post(ML_SERVICE_URL, {payload: req.body});
            if(response.data.prediction === "malicious"){
                res.status(403).json({error: "Blocked by ML filter"});  
            } 
        }catch (err){
            console.error("Error in ML filter:", err.message);
            res.status(500).json({error: "ML service error"});
        }
    }
    next();
});

app.use("/", createProxyMiddleware({target: NGINX_URL, changeOrigin: true}));

app.listen(3100, ()=>{
    console.log("ML Filter Gateway is running on port 3100");
})