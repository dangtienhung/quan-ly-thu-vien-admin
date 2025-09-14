import axios from 'axios';

const instance = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8002/api',
	// timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor
instance.interceptors.request.use(
	(config) => {
		// Thêm token vào header nếu cần
		const token = localStorage.getItem('accessToken');
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(new Error(error?.message || 'Request error'))
);

// Response interceptor
instance.interceptors.response.use(
	(response) => response,
	(error) => {
		// Xử lý lỗi toàn cục (ví dụ: thông báo, redirect, ...)
		if (error.response && error.response.status === 401) {
			// Ví dụ: logout hoặc chuyển hướng
			localStorage.removeItem('accessToken');
			window.location.href = '/login';
		}

		// Tạo error object với thông tin chi tiết từ backend
		const errorResponse = error.response?.data;
		const errorMessage =
			errorResponse?.message || error?.message || 'Response error';

		// Tạo error object mới với thông tin đầy đủ
		const customError = new Error(errorMessage) as Error & {
			response?: unknown;
			statusCode?: number;
			error?: string;
		};
		customError.response = error.response;
		customError.statusCode =
			errorResponse?.statusCode || error.response?.status;
		customError.error = errorResponse?.error || 'Unknown Error';

		return Promise.reject(customError);
	}
);

export default instance;
