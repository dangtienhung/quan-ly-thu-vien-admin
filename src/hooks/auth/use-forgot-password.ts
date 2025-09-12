import { AuthAPI } from '@/apis/auth';
import type { ForgotPasswordRequest } from '@/types/auth';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UseForgotPasswordOptions {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}

export const useForgotPassword = (options: UseForgotPasswordOptions = {}) => {
	const mutation = useMutation({
		mutationFn: (data: ForgotPasswordRequest) => AuthAPI.forgotPassword(data),
		onSuccess: () => {
			// Show success notification
			toast.success('Email đặt lại mật khẩu đã được gửi!');

			// Call custom onSuccess callback if provided
			options.onSuccess?.();
		},
		onError: (error: Error) => {
			// Show error notification
			toast.error(
				error.message || 'Có lỗi xảy ra khi gửi email đặt lại mật khẩu'
			);

			// Call custom onError callback if provided
			options.onError?.(error);
		},
	});

	return {
		forgotPassword: mutation.mutate,
		forgotPasswordAsync: mutation.mutateAsync,
		isLoading: mutation.isPending,
		isError: mutation.isError,
		error: mutation.error,
		reset: mutation.reset,
	};
};
