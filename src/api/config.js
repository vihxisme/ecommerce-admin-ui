import axios from 'axios';

const endpoints = ["/api/identity/auth/login"];

const apiClient = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000
});

// Interceptor để xử lý token và content type
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        const isEndpointExcluded = endpoints.some(endpoint => config.url.includes(endpoint));

        if (!isEndpointExcluded && token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    }
);

// Interceptor để xử lý response
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("HTTP: API Error:", error.response);
        return Promise.reject(error);
    }
);


// apiClient.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         // const authStore = useAuthStore();

//         // if (error.response && error.response.status === 401) {
//         //     console.warn("Token hết hạn hoặc không hợp lệ.");

//         //     const isStillValid = await authStore.checkAuth();
//         //     if (!isStillValid) {
//         //         authStore.clearAuth();
//         //         router.push('/login');
//         //     }

//         //     // Nếu không dùng refresh token thì logout luôn
//         //     // authStore.clearAuth();
//         //     // router.push({
//         //     //   path: '/login',
//         //     //   query: { redirect: router.currentRoute.value.fullPath }
//         //     // });
//         // }

//         return Promise.reject(error);
//     }
// );

export default apiClient;