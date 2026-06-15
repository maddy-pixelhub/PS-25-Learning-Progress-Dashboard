import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8000"
});

const SPRING_API = axios.create({
    baseURL: "http://localhost:8080"
});

const springPathMap = {
    "/register": "/api/users/register",
    "/login": "/api/users/login",
    "/courses": "/api/courses",
    "/progress": "/api/progress",
    "/progress/summary": "/api/progress/summary"
};

function toSpringPath(url = "") {
    if (url.startsWith("/courses/") || url.startsWith("/progress/")) {
        return `/api${url}`;
    }

    return springPathMap[url] || url;
}

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const gatewayUnavailable = !error.response;
        const originalRequest = error.config;

        if (!gatewayUnavailable || originalRequest._springFallback || originalRequest.url?.startsWith("/learning-search")) {
            return Promise.reject(error);
        }

        originalRequest._springFallback = true;

        return SPRING_API.request({
            ...originalRequest,
            baseURL: "http://localhost:8080",
            url: toSpringPath(originalRequest.url)
        });
    }
);

export default API;
