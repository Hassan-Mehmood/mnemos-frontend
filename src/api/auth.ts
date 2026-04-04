import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const authInstance = axios.create({
    baseURL: API_BASE_URL,
});

export const login = async (data: { email: string; password: string }) => {
    const response = await authInstance.post('/auth/login', data);
    return response.data;
};

export const register = async (data: { name: string; email: string; password: string }) => {
    const response = await authInstance.post('/auth/register', data);
    return response.data;
};
