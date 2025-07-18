import axios from "axios";

const Axios = axios.create({
  baseURL: process.env.REACT_APP_AMADEUS_API_BASE_URL,
});

Axios.interceptors.request.use(
  (config) => {
    config.headers["Authorization"] = `Bearer ${localStorage.getItem(
      "access_token"
    )}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

Axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 401) {
      console.error("Unauthorized access - redirecting to login");
    }
    return Promise.reject(error);
  }
);
export default Axios;
