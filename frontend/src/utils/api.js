/**
 * Axios instance configured with JWT authentication interceptors
 */

import axios from "axios";
import {
    getAccessToken,
    refreshAccessToken,
    removeTokens,
} from "./auth";

// Create axios instance with base configuration
const api = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh on 401 errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the access token
                const newAccessToken = await refreshAccessToken();

                // Update the authorization header with new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login
                removeTokens();
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
