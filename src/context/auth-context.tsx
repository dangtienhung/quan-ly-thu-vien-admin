import type { LoginRequest, User } from '@/types/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { UsersAPI } from '@/apis/users';
import { useLogin } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (credentials: LoginRequest) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const queryClient = useQueryClient();
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [hasJustLoggedIn, setHasJustLoggedIn] = useState(false);
	const navigate = useNavigate();

	const isAuthenticated = !!localStorage.getItem('accessToken');

	const { data: currentUser } = useQuery({
		queryKey: ['currentUser'],
		queryFn: () => UsersAPI.getProfile(),
		enabled: !!isAuthenticated,
	});

	// Use the existing login hook
	const loginMutation = useLogin({
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
		},
		onError: (error) => {
			console.error('Đăng nhập thất bại:', error);
		},
	});

	useEffect(() => {
		// Only check role if we have user data and user is not admin
		if (currentUser && currentUser.role !== 'admin') {
			console.log(
				'Người dùng không phải admin, chuyển hướng đến trang đăng nhập'
			);
			navigate('/login');
			toast.error('Bạn không có quyền truy cập vào trang quản trị');
			localStorage.removeItem('accessToken');
		} else if (currentUser && currentUser.role === 'admin') {
			setUser(currentUser);
			// Only show success toast on login, not on page refresh
			if (hasJustLoggedIn) {
				toast.success('Đăng nhập thành công!');
				setHasJustLoggedIn(false);
			}
		}
	}, [currentUser, navigate, hasJustLoggedIn]);

	const login = async (credentials: LoginRequest): Promise<void> => {
		try {
			setIsLoading(true);
			// Use the login mutation from the hook
			await loginMutation.loginAsync(credentials);
			// Set flag to show success toast
			setHasJustLoggedIn(true);
		} catch (error) {
			console.error('Đăng nhập thất bại:', error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = () => {
		// Clear user state
		setUser(null);
		setHasJustLoggedIn(false);

		// Clear all data from localStorage
		localStorage.clear();

		// Navigate to login page
		navigate('/login');
	};

	const value: AuthContextType = {
		user,
		isAuthenticated,
		isLoading: isLoading || loginMutation.isLoading,
		login,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
