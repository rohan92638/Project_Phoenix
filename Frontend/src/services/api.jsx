// src/services/api.js

const BASE_URL = "http://127.0.0.1:8000";

// 🔹 Common API function
export const apiRequest = async (endpoint, method = "GET", data = null) => {
    try {
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : ""
            },
            body: data ? JSON.stringify(data) : null
        });

        const result = await response.json();

        if (!response.ok) {
            console.log(result); 
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

// ================= DAILY TRACKER APIs =================

// 🔹 GET all tasks (today)
export const getTasks = () => {
    return apiRequest("/daily/");
};

// 🔹 CREATE task
export const createTask = (data) => {
    return apiRequest("/daily/", "POST", data);
};

// 🔹 UPDATE task
export const updateTask = (id, data) => {
    return apiRequest(`/daily/${id}/`, "PATCH", data);
};

// 🔹 DELETE task
export const deleteTask = (id) => {
    return apiRequest(`/daily/${id}/`, "DELETE");
};