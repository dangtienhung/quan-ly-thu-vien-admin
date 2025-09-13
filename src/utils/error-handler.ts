/**
 * Utility functions for handling API errors
 */

export interface ApiError {
	message: string;
	statusCode?: number;
	error?: string;
	response?: any;
}

/**
 * Extract error message from API error response
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		const apiError = error as ApiError;
		const statusCode = apiError.statusCode;
		const message = apiError.message;

		// Handle specific error types
		if (statusCode === 409) {
			// Conflict - Resource already exists
			if (message.includes('email')) {
				return 'Email này đã được sử dụng. Vui lòng chọn email khác.';
			} else if (message.includes('username')) {
				return 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên đăng nhập khác.';
			} else if (message.includes('userCode')) {
				return 'Mã người dùng này đã được sử dụng. Vui lòng chọn mã khác.';
			} else if (message.includes('cardNumber')) {
				return 'Số thẻ này đã được sử dụng. Vui lòng chọn số thẻ khác.';
			} else {
				return 'Thông tin này đã tồn tại trong hệ thống. Vui lòng kiểm tra lại.';
			}
		} else if (statusCode === 400) {
			// Bad Request - Validation error
			return `Dữ liệu không hợp lệ: ${message}`;
		} else if (statusCode === 401) {
			// Unauthorized
			return 'Bạn không có quyền thực hiện hành động này.';
		} else if (statusCode === 403) {
			// Forbidden
			return 'Bạn không có quyền truy cập tài nguyên này.';
		} else if (statusCode === 404) {
			// Not Found
			return 'Không tìm thấy tài nguyên được yêu cầu.';
		} else if (statusCode === 500) {
			// Internal Server Error
			return 'Lỗi hệ thống. Vui lòng thử lại sau.';
		} else {
			// Other errors
			return message || 'Đã xảy ra lỗi không xác định.';
		}
	}

	return 'Đã xảy ra lỗi không xác định.';
}

/**
 * Get user-friendly error message for specific context
 */
export function getContextualErrorMessage(
	error: unknown,
	context: 'user' | 'reader' | 'general' = 'general'
): string {
	const baseMessage = getErrorMessage(error);

	if (context === 'user') {
		return `Tạo user thất bại: ${baseMessage}`;
	} else if (context === 'reader') {
		return `Tạo reader thất bại: ${baseMessage}`;
	}

	return baseMessage;
}

/**
 * Check if error is a specific type
 */
export function isApiError(error: unknown): error is ApiError {
	return error instanceof Error && 'statusCode' in error;
}

/**
 * Get status code from error
 */
export function getErrorStatusCode(error: unknown): number | undefined {
	if (isApiError(error)) {
		return error.statusCode;
	}
	return undefined;
}
