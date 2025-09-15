import type { ReaderTypeConfig } from '@/types/reader-types';

/**
 * Tính ngày trả dựa trên ngày mượn và reader type
 * @param borrowDate - Ngày mượn (YYYY-MM-DD format)
 * @param readerType - Thông tin reader type chứa borrowDurationDays
 * @returns Ngày trả dự kiến (YYYY-MM-DD format)
 */
export const calculateDueDate = (
	borrowDate: string,
	readerType: ReaderTypeConfig
): string => {
	const borrow = new Date(borrowDate);
	const dueDate = new Date(borrow);

	// Cộng thêm số ngày mượn theo reader type
	dueDate.setDate(dueDate.getDate() + readerType.borrowDurationDays);

	// Format về YYYY-MM-DD
	return dueDate.toISOString().split('T')[0];
};

/**
 * Lấy ngày hôm nay theo format YYYY-MM-DD
 * @returns Ngày hôm nay (YYYY-MM-DD format)
 */
export const getTodayDate = (): string => {
	const today = new Date();
	return today.toISOString().split('T')[0];
};

/**
 * Tính số ngày mượn dựa trên reader type
 * @param readerType - Thông tin reader type
 * @returns Số ngày mượn
 */
export const getBorrowDurationDays = (readerType: ReaderTypeConfig): number => {
	return readerType.borrowDurationDays;
};

/**
 * Kiểm tra xem một ngày có quá hạn hay không (chỉ so sánh đến cuối ngày).
 * @param {string} expiryDate - Ngày hết hạn (ISO string hoặc YYYY-MM-DD).
 * @returns {boolean} True nếu đã quá hạn (sang ngày mới), false nếu còn trong ngày hết hạn.
 */
export const isExpiredByEndOfDay = (expiryDate: string): boolean => {
	const expiry = new Date(expiryDate);
	const today = new Date();

	// Set time to end of day for expiry date (23:59:59.999)
	expiry.setHours(23, 59, 59, 999);

	// Set time to start of day for today (00:00:00.000)
	today.setHours(0, 0, 0, 0);

	// So sánh: nếu hôm nay > ngày hết hạn (cuối ngày) thì đã quá hạn
	return today > expiry;
};

/**
 * Kiểm tra xem một ngày có sắp hết hạn trong X ngày tới hay không.
 * @param {string} expiryDate - Ngày hết hạn (ISO string hoặc YYYY-MM-DD).
 * @param {number} daysThreshold - Số ngày threshold (mặc định 3).
 * @returns {boolean} True nếu sắp hết hạn trong X ngày tới.
 */
export const isExpiringSoon = (
	expiryDate: string,
	daysThreshold: number = 3
): boolean => {
	const expiry = new Date(expiryDate);
	const today = new Date();

	// Set time to end of day for expiry date
	expiry.setHours(23, 59, 59, 999);

	// Set time to start of day for today
	today.setHours(0, 0, 0, 0);

	// Tính số ngày còn lại
	const timeDiff = expiry.getTime() - today.getTime();
	const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

	// Sắp hết hạn nếu còn <= daysThreshold ngày và chưa quá hạn
	return daysRemaining <= daysThreshold && daysRemaining >= 0;
};
