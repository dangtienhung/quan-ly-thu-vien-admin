/**
 * Test file for error handler utility
 * This file demonstrates how the error handler works with different error types
 */

import { getContextualErrorMessage, getErrorMessage } from './error-handler';

// Mock error objects that simulate backend responses
const mockErrors = {
	conflictEmail: {
		message: 'Resource already exists with this unique field: email',
		statusCode: 409,
		error: 'ConflictError',
	},
	conflictUsername: {
		message: 'Resource already exists with this unique field: username',
		statusCode: 409,
		error: 'ConflictError',
	},
	conflictUserCode: {
		message: 'Resource already exists with this unique field: userCode',
		statusCode: 409,
		error: 'ConflictError',
	},
	conflictCardNumber: {
		message: 'Resource already exists with this unique field: cardNumber',
		statusCode: 409,
		error: 'ConflictError',
	},
	validationError: {
		message: 'Validation failed: email must be a valid email address',
		statusCode: 400,
		error: 'BadRequestException',
	},
	unauthorized: {
		message: 'Unauthorized access',
		statusCode: 401,
		error: 'UnauthorizedException',
	},
	forbidden: {
		message: 'Access denied',
		statusCode: 403,
		error: 'ForbiddenException',
	},
	notFound: {
		message: 'User not found',
		statusCode: 404,
		error: 'NotFoundException',
	},
	serverError: {
		message: 'Internal server error',
		statusCode: 500,
		error: 'InternalServerErrorException',
	},
	unknownError: {
		message: 'Something went wrong',
		statusCode: 999,
		error: 'UnknownError',
	},
};

// Test function to demonstrate error handling
export function testErrorHandling() {
	console.log('=== Testing Error Handler ===\n');

	Object.entries(mockErrors).forEach(([key, errorData]) => {
		const error = new Error(errorData.message) as any;
		error.statusCode = errorData.statusCode;
		error.error = errorData.error;

		console.log(`Test Case: ${key}`);
		console.log(`Input: ${JSON.stringify(errorData, null, 2)}`);
		console.log(`General Error Message: ${getErrorMessage(error)}`);
		console.log(`User Context: ${getContextualErrorMessage(error, 'user')}`);
		console.log(
			`Reader Context: ${getContextualErrorMessage(error, 'reader')}`
		);
		console.log('---\n');
	});
}

// Example usage in a component
export function exampleUsage() {
	// Simulate API call that might fail
	const simulateApiCall = async () => {
		try {
			// This would be your actual API call
			throw new Error('Resource already exists with this unique field: email');
		} catch (error) {
			// Use the error handler to get user-friendly message
			const userMessage = getContextualErrorMessage(error, 'user');
			console.log('User sees:', userMessage);
			// Output: "Tạo user thất bại: Email này đã được sử dụng. Vui lòng chọn email khác."
		}
	};

	simulateApiCall();
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
	testErrorHandling();
	exampleUsage();
}
