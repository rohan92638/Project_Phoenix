// src/services/api.js

const BASE_URL = "http://127.0.0.1:8000";

// 🔹 Common API function
export const apiRequest = async (endpoint, method = "GET", data = null) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: data ? JSON.stringify(data) : null
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Something went wrong");
        }

        return result;

    } catch (error) {
        throw error;
    }
};


// 🔹 LOGIN API
export const loginUser = (data) => {
    return apiRequest("/auth/login/", "POST", data);
};


// 🔹 REGISTER API
export const registerUser = (data) => {
    return apiRequest("/auth/register/", "POST", data);
};