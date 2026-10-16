import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' }
});

axiosClient.interceptors.request.use(function (config) {
    const token = localStorage.getItem('hostelhub_token');
    if (token) config.headers.Authorization = 'Bearer ' + token;
    return config;
});

axiosClient.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (error.response?.status === 401) {
        localStorage.removeItem('hostelhub_token');
        localStorage.removeItem('hostelhub_user');
        if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
});

export default axiosClient;
