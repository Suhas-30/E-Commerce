import axios from "axios";
import base_api_ur from "../baseapi/baseAPI";

const axiosInstance = axios.create(
  {
    baseURL: base_api_ur,    
});

axiosInstance.interceptors.response.use(
  (response) => response, 
  (error)=>{
    if(error.response && error.response.status === 401){
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "/login"; 
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }

)
export default axiosInstance;

