import { AuthAPI } from '@/apis/auth';
import type { ResetPasswordRequest } from '@/types/auth';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface UseResetPasswordOptions {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}

export const useResetPassword = (options: UseResetPasswordOptions = {}) => {
	const navigate = useNavigate();

	const mutation = useMutation({
		mutationFn: (data: ResetPasswordRequest) => AuthAPI.resetPassword(data),
		onSuccess: () => {
			// Show success notification
			toast.success('Đặt lại mật khẩu thành công!');

			// Call custom onSuccess callback if provided
			options.onSuccess?.();

			// Navigate to login page
			navigate('/login');
		},
		onError: (error: Error) => {
			// Show error notification
			toast.error(error.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');

			// Call custom onError callback if provided
			options.onError?.(error);
		},
	});

	return {
		resetPassword: mutation.mutate,
		resetPasswordAsync: mutation.mutateAsync,
		isLoading: mutation.isPending,
		isError: mutation.isError,
		error: mutation.error,
		reset: mutation.reset,
	};
};
