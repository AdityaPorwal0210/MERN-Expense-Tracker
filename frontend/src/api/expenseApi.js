import axios from 'axios';
import { APIUrl } from '../utils';

const API = axios.create({
    baseURL: `${APIUrl}`,
    withCredentials: true
});

// Add token to requests
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// Expense APIs
export const getExpenses = (filters) => API.get('/expenses', { params: filters });
export const getExpenseStats = () => API.get('/expenses/stats');
export const addExpense = (data) => API.post('/expenses', data);
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

// Budget APIs
export const getBudgets = () => API.get('/budgets');
export const createBudget = (data) => API.post('/budgets', data);
export const updateBudget = (id, data) => API.put(`/budgets/${id}`, data);
export const deleteBudget = (id) => API.delete(`/budgets/${id}`);
