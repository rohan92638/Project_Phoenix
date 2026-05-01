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

        if (response.status === 204) return { success: true };

        const result = await response.json();

        if (!response.ok) {
            console.log("API Error Response:", result);

            // Auto-redirect to login on Session Expiry (401)
            if (response.status === 401) {
                localStorage.removeItem("accessToken");
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
            }

            const errorMsg = result.error || result.detail || JSON.stringify(result);
            throw new Error(errorMsg || "Something went wrong");
        }

        return result;

    } catch (error) {
        throw error;
    }
};

// LOGIN API
export const loginUser = (data) => { return apiRequest("/auth/login/", "POST", data); };

// REGISTER API
export const registerUser = (data) => { return apiRequest("/auth/register/", "POST", data); };

// ================= DAILY TRACKER APIs =================
export const getTasks = () => { return apiRequest("/daily/"); };
export const createTask = (data) => { return apiRequest("/daily/", "POST", data); };
export const updateTask = (id, data) => { return apiRequest(`/daily/${id}/`, "PATCH", data); };
export const deleteTask = (id) => { return apiRequest(`/daily/${id}/`, "DELETE"); };

// ================= STUDY TRACKER APIs =================
export const getStudyCategories = () => { return apiRequest("/study/categories/"); };
export const createStudyCategory = (data) => { return apiRequest("/study/categories/create/", "POST", data); };
export const getAllStudyLogs = () => { return apiRequest("/study/logs/"); };
export const getStudyLogsByCategory = (categoryId) => { return apiRequest(`/study/logs/${categoryId}/`); };
export const createStudyLog = (data) => { return apiRequest("/study/logs/create/", "POST", data); };
export const updateStudyLog = (id, data) => { return apiRequest(`/study/logs/${id}/update/`, "PATCH", data); };

// ================= JOURNAL APIs =================
export const getJournalEntries = () => { return apiRequest("/api/journal/"); };
export const createJournalEntry = (data) => { return apiRequest("/api/journal/", "POST", data); };
export const updateJournalEntry = (id, data) => { return apiRequest(`/api/journal/${id}/`, "PATCH", data); };
export const deleteJournalEntry = (id) => { return apiRequest(`/api/journal/${id}/`, "DELETE"); };
export const getJournalFeatured = () => { return apiRequest("/api/journal/featured/"); };
export const getJournalStats = () => { return apiRequest("/api/journal/stats/"); };

// ================= FINANCE APIs =================
export const getTransactions = (page = 1, type = '', pageSize = 10) => {
    let url = `/api/finance/transactions/?page=${page}&page_size=${pageSize}`;
    if (type && type !== 'all') {
        url += `&transaction_type=${type}`;
    }
    return apiRequest(url);
};
export const getFinanceSummary = () => {
    return apiRequest("/api/finance/transactions/summary/");
};
export const createTransaction = (data) => {
    return apiRequest("/api/finance/transactions/", "POST", data);
};
export const deleteTransactionAPI = (id) => {
    return apiRequest(`/api/finance/transactions/${id}/`, "DELETE");
};
export const predictTransactionCategory = (desc) => {
    return apiRequest(`/api/finance/predict-category/?desc=${encodeURIComponent(desc)}`);
};
export const getSpendingInsight = () => {
    return apiRequest("/api/finance/insight/");
};
export const getBudgetPrediction = (budget) => {
    return apiRequest(`/api/finance/budget-predict/?budget=${budget}`);
};

export const parseVoiceTransaction = (text) => {
    return apiRequest("/api/finance/parse-voice/", "POST", { text });
};

export const getSpendingPersona = () => {
    return apiRequest("/api/finance/persona/");
};

// ================= CHATBOT API =================

export const sendChatMessage = (message, session_id, voice_output = false) => {
    return apiRequest("/api/finance/chat/", "POST", { 
        message, 
        session_id,
        voice_output 
    });
};

export const sendVoiceMessage = async (audioBlob, session_id) => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error("No token found");

    const formData = new FormData();
    formData.append("audio", audioBlob, "voice_recording.webm");
    formData.append("session_id", session_id);

    const response = await fetch("http://127.0.0.1:8000/api/finance/voice-chat/", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error("Voice chat request failed");
    }

    return response.json();
};
