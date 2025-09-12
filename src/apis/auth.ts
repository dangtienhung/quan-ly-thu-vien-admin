import type {
	AuthResponse,
	ChangePasswordRequest,
	ForgotPasswordRequest,
	LoginRequest,
	ResetPasswordRequest,
} from '../types';

import { omit } from 'lodash';
import instance from '../configs/instances';

export const AuthAPI = {
	// Login user
	login: async (data: LoginRequest): Promise<AuthResponse> => {
		const res = await instance.post('/api/auth/login', data);
		return res.data;
	},

	// Change password
	changePassword: async (data: ChangePasswordRequest): Promise<void> => {
		await instance.post('/api/auth/change-password', data);
	},

	// Forgot password
	forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
		await instance.post('/api/auth/forgot-password', data);
	},

	// Reset password
	resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
		console.log('🚀 ~ data:', data);

		await instance.post('/api/auth/reset-password', {
			...omit(data, ['confirmNewPassword', 'token']),
			resetToken: data.token,
		});
	},

	// Logout (client-side)
	logout: async (): Promise<void> => {
		localStorage.removeItem('accessToken');
	},

	// Check if user is authenticated
	isAuthenticated: (): boolean => {
		const token = localStorage.getItem('accessToken');
		return !!token;
	},

	// Get current user from localStorage
	getCurrentUser: () => {
		// Since the login response doesn't include user data,
		// you may need to make a separate API call to get user info
		// For now, return null as user data is not stored
		return null;
	},

	// Save auth data to localStorage
	saveAuthData: (authResponse: AuthResponse): void => {
		localStorage.setItem('accessToken', authResponse.access_token);
	},
};
