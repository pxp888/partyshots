/**
 * Authentication utility functions for JWT token management
 */

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user_data";

/**
 * Store JWT tokens in localStorage
 */
export const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Remove all tokens from localStorage
 */
export const removeTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

/**
 * Check if user is authenticated (has access token)
 */
export const isAuthenticated = () => {
    return !!getAccessToken();
};

/**
 * Store user data in localStorage
 */
export const setUserData = (userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
};

/**
 * Get user data from localStorage
 */
export const getUserData = () => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
};

/**
 * Refresh the access token using the refresh token
 */
export const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        throw new Error("No refresh token available");
    }

    try {
        const response = await fetch("/api/token/refresh/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem(ACCESS_TOKEN_KEY, data.access);

            // If a new refresh token is provided (token rotation)
            if (data.refresh) {
                localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
            }

            return data.access;
        } else {
            // Refresh token is invalid or expired
            removeTokens();
            throw new Error("Failed to refresh token");
        }
    } catch (error) {
        removeTokens();
        throw error;
    }
};
