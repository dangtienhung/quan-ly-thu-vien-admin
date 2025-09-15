import { useBookStats } from '@/hooks/books/use-book-stats';
import { useBorrowStats } from '@/hooks/borrow-records/use-borrow-stats';
import { useFinesStats } from '@/hooks/fines/use-fines-stats';
import { useReservationStats } from '@/hooks/reservations/use-reservation-stats';
import { useUserStats } from '@/hooks/users/use-user-stats';
import type { BookStatisticsDto } from '@/types/book.type';
import type { BorrowRecordStatsDto } from '@/types/borrow-records.type';
import type { FinesStatsDto } from '@/types/fines.type';
import type { ReservationStatsDto } from '@/types/reservations.type';
import type { UserStatsDto } from '@/types/user.type';
import { useState } from 'react';

export const useDownloadStats = () => {
	const [isDownloading, setIsDownloading] = useState(false);
	const { data: userStats } = useUserStats();
	const { data: bookStats } = useBookStats();
	const { data: borrowStats } = useBorrowStats();
	const { data: reservationStats } = useReservationStats();
	const { data: finesStats } = useFinesStats();

	const downloadUserStatsPDF = async () => {
		if (!userStats) return;

		setIsDownloading(true);
		try {
			// Tạo nội dung HTML cho PDF
			const htmlContent = generateUserStatsHTML(userStats);

			// Tạo PDF từ HTML
			await generatePDF(htmlContent, 'thong-ke-nguoi-dung.pdf');
		} catch (error) {
			console.error('Error generating PDF:', error);
			alert('Có lỗi xảy ra khi tạo file PDF');
		} finally {
			setIsDownloading(false);
		}
	};

	const downloadBookStatsPDF = async () => {
		if (!bookStats) return;

		setIsDownloading(true);
		try {
			// Tạo nội dung HTML cho PDF
			const htmlContent = generateBookStatsHTML(
				bookStats as unknown as BookStatisticsDto
			);

			// Tạo PDF từ HTML
			await generatePDF(htmlContent, 'thong-ke-sach.pdf');
		} catch (error) {
			console.error('Error generating PDF:', error);
			alert('Có lỗi xảy ra khi tạo file PDF');
		} finally {
			setIsDownloading(false);
		}
	};

	const downloadAnalyticsPDF = async () => {
		if (!borrowStats || !reservationStats || !finesStats) return;

		setIsDownloading(true);
		try {
			// Tạo nội dung HTML cho PDF
			const htmlContent = generateAnalyticsHTML(
				borrowStats as unknown as BorrowRecordStatsDto,
				reservationStats as unknown as ReservationStatsDto,
				finesStats as unknown as FinesStatsDto
			);

			// Tạo PDF từ HTML
			await generatePDF(htmlContent, 'thong-ke-muon-tra.pdf');
		} catch (error) {
			console.error('Error generating PDF:', error);
			alert('Có lỗi xảy ra khi tạo file PDF');
		} finally {
			setIsDownloading(false);
		}
	};

	const downloadOverviewPDF = async () => {
		setIsDownloading(true);
		try {
			// Tạo nội dung HTML cho báo cáo tổng quan
			const htmlContent = generateOverviewHTML();

			// Tạo PDF từ HTML
			await generatePDF(htmlContent, 'bao-cao-tong-quan.pdf');
		} catch (error) {
			console.error('Error generating PDF:', error);
			alert('Có lỗi xảy ra khi tạo file PDF');
		} finally {
			setIsDownloading(false);
		}
	};

	const downloadStats = async (tabType: string) => {
		switch (tabType) {
			case 'users-stats':
				await downloadUserStatsPDF();
				break;
			case 'books-stats':
				await downloadBookStatsPDF();
				break;
			case 'analytics':
				await downloadAnalyticsPDF();
				break;
			case 'overview':
				await downloadOverviewPDF();
				break;
			default:
				console.warn('Unknown tab type for download:', tabType);
		}
	};

	return {
		isDownloading,
		downloadStats,
	};
};

// Helper function để format dữ liệu
const formatValue = (
	value: unknown,
	fallback: string = 'Chưa có dữ liệu'
): string => {
	if (value === null || value === undefined || value === '') {
		return fallback;
	}
	return value.toString();
};

// Helper function để tính tỷ lệ phần trăm
const calculatePercentage = (value: number, total: number): string => {
	if (!total || total === 0) {
		return '0%';
	}
	return `${((value / total) * 100).toFixed(1)}%`;
};

// Helper function để tạo HTML cho thống kê người dùng
const generateUserStatsHTML = (stats: UserStatsDto): string => {
	const currentDate = new Date().toLocaleDateString('vi-VN');

	return `
		<!DOCTYPE html>
		<html lang="vi">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Thống kê người dùng</title>
			<style>
				body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
				.header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16ae5b; padding-bottom: 20px; }
				.school-logo { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin-bottom: 10px; }
				.school-name { font-size: 18px; font-weight: bold; color: #16ae5b; margin-bottom: 5px; }
				.title { font-size: 24px; font-weight: bold; color: #16ae5b; margin-bottom: 10px; }
				.subtitle { font-size: 14px; color: #6b7280; }
				.section { margin-bottom: 25px; }
				.section-title { font-size: 18px; font-weight: bold; color: #374151; margin-bottom: 15px; border-left: 4px solid #16ae5b; padding-left: 10px; }
				.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
				.stat-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; }
				.stat-title { font-size: 14px; color: #64748b; margin-bottom: 5px; }
				.stat-value { font-size: 24px; font-weight: bold; color: #16ae5b; }
				.table { width: 100%; border-collapse: collapse; margin-top: 15px; }
				.table th, .table td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
				.table th { background: #f0fdf4; font-weight: bold; color: #16ae5b; }
				.footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px; }
			</style>
		</head>
		<body>
			<div class="header">
				<img src="/logo.jpg" alt="Logo trường" class="school-logo" />
				<div class="school-name">Trường THPT Hoài Đức A</div>
				<div class="title">BÁO CÁO THỐNG KÊ NGƯỜI DÙNG</div>
				<div class="subtitle">Ngày tạo: ${currentDate}</div>
			</div>

			<div class="section">
				<div class="section-title">Tổng quan</div>
				<div class="stats-grid">
					<div class="stat-card">
						<div class="stat-title">Tổng người dùng</div>
						<div class="stat-value">${formatValue(stats.totalUsers)}</div>
					</div>
					<div class="stat-card">
						<div class="stat-title">Người dùng mới (30 ngày)</div>
						<div class="stat-value">${formatValue(stats.newUsersLast30Days)}</div>
					</div>
					<div class="stat-card">
						<div class="stat-title">Hoạt động gần đây (7 ngày)</div>
						<div class="stat-value">${formatValue(stats.activeUsersLast7Days)}</div>
					</div>
					<div class="stat-card">
						<div class="stat-title">Chưa đăng nhập</div>
						<div class="stat-value">${formatValue(stats.neverLoggedInUsers)}</div>
					</div>
				</div>
			</div>

			<div class="section">
				<div class="section-title">Phân bố theo vai trò</div>
				<table class="table">
					<tr>
						<th>Vai trò</th>
						<th>Số lượng</th>
						<th>Tỷ lệ</th>
					</tr>
					<tr>
						<td>Quản trị viên</td>
						<td>${formatValue(stats.usersByRole?.admin)}</td>
						<td>${calculatePercentage(
							stats.usersByRole?.admin || 0,
							stats.totalUsers || 0
						)}</td>
					</tr>
					<tr>
						<td>Độc giả</td>
						<td>${formatValue(stats.usersByRole?.reader)}</td>
						<td>${calculatePercentage(
							stats.usersByRole?.reader || 0,
							stats.totalUsers || 0
						)}</td>
					</tr>
				</table>
			</div>

			<div class="section">
				<div class="section-title">Phân bố theo trạng thái</div>
				<table class="table">
					<tr>
						<th>Trạng thái</th>
						<th>Số lượng</th>
						<th>Tỷ lệ</th>
					</tr>
					<tr>
						<td>Hoạt động</td>
						<td>${formatValue(stats.usersByStatus?.active)}</td>
						<td>${calculatePercentage(
							stats.usersByStatus?.active || 0,
							stats.totalUsers || 0
						)}</td>
					</tr>
					<tr>
						<td>Tạm khóa</td>
						<td>${formatValue(stats.usersByStatus?.suspended)}</td>
						<td>${calculatePercentage(
							stats.usersByStatus?.suspended || 0,
							stats.totalUsers || 0
						)}</td>
					</tr>
					<tr>
						<td>Bị cấm</td>
						<td>${formatValue(stats.usersByStatus?.banned)}</td>
						<td>${calculatePercentage(
							stats.usersByStatus?.banned || 0,
							stats.totalUsers || 0
						)}</td>
					</tr>
				</table>
			</div>

			<div class="section">
				<div class="section-title">Phân bố theo loại độc giả</div>
				<table class="table">
					<tr>
						<th>Loại độc giả</th>
						<th>Số lượng</th>
						<th>Tỷ lệ</th>
					</tr>
					<tr>
						<td>Học sinh</td>
						<td>${formatValue(stats.readersByType?.student)}</td>
						<td>${calculatePercentage(
							stats.readersByType?.student || 0,
							stats.usersByRole?.reader || 0
						)}</td>
					</tr>
					<tr>
						<td>Giáo viên</td>
						<td>${formatValue(stats.readersByType?.teacher)}</td>
						<td>${calculatePercentage(
							stats.readersByType?.teacher || 0,
							stats.usersByRole?.reader || 0
						)}</td>
					</tr>
					<tr>
						<td>Nhân viên</td>
						<td>${formatValue(stats.readersByType?.staff)}</td>
						<td>${calculatePercentage(
							stats.readersByType?.staff || 0,
							stats.usersByRole?.reader || 0
						)}</td>
					</tr>
					<tr>
						<td>Khách</td>
						<td>${formatValue(stats.readersByType?.guest)}</td>
						<td>${calculatePercentage(
							stats.readersByType?.guest || 0,
							stats.usersByRole?.reader || 0
						)}</td>
					</tr>
				</table>
			</div>

			<div class="section">
				<div class="section-title">Thống kê theo tháng</div>
				<table class="table">
					<tr>
						<th>Tháng</th>
						<th>Số người dùng mới</th>
					</tr>
					${
						stats.monthlyStats && stats.monthlyStats.length > 0
							? stats.monthlyStats
									.map(
										(month) => `
							<tr>
								<td>${new Date(month.month + '-01').toLocaleDateString('vi-VN', {
									month: 'long',
									year: 'numeric',
								})}</td>
								<td>${formatValue(month.count)}</td>
							</tr>
						`
									)
									.join('')
							: '<tr><td colspan="2" style="text-align: center; color: #6b7280;">Chưa có dữ liệu</td></tr>'
					}
				</table>
			</div>

			<div class="footer">
				<p>Báo cáo được tạo tự động bởi hệ thống quản lý thư viện</p>
				<p>Thời gian tạo: ${new Date().toLocaleString('vi-VN')}</p>
			</div>
		</body>
		</html>
	`;
};

// Helper function để tạo HTML cho thống kê sách
const generateBookStatsHTML = (stats: BookStatisticsDto): string => {
	const currentDate = new Date().toLocaleDateString('vi-VN');

	return `
		<!DOCTYPE html>
		<html lang="vi">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Thống kê sách</title>
			<style>
				body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
				.header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16ae5b; padding-bottom: 20px; }
				.school-logo { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin-bottom: 10px; }
				.school-name { font-size: 18px; font-weight: bold; color: #16ae5b; margin-bottom: 5px; }
				.title { font-size: 24px; font-weight: bold; color: #16ae5b; margin-bottom: 10px; }
				.subtitle { font-size: 14px; color: #6b7280; }
				.section { margin-bottom: 25px; }
				.section-title { font-size: 18px; font-weight: bold; color: #374151; margin-bottom: 15px; border-left: 4px solid #16ae5b; padding-left: 10px; }
				.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
				.stat-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; }
				.stat-title { font-size: 14px; color: #64748b; margin-bottom: 5px; }
				.stat-value { font-size: 24px; font-weight: bold; color: #16ae5b; }
				.table { width: 100%; border-collapse: collapse; margin-top: 15px; }
				.table th, .table td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
				.table th { background: #f0fdf4; font-weight: bold; color: #16ae5b; }
				.footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px; }
			</style>
		</head>
		<body>
			<div class="header">
				<img src="/logo.jpg" alt="Logo trường" class="school-logo" />
				<div class="school-name">Trường THPT Hoài Đức A</div>
				<div class="title">BÁO CÁO THỐNG KÊ SÁCH</div>
				<div class="subtitle">Ngày tạo: ${currentDate}</div>
			</div>

			<div class="section">
				<div class="section-title">Tổng quan</div>
				<div class="stats-grid">
					<div class="stat-card">
						<div class="stat-title">Tổng số sách</div>
						<div class="stat-value">${formatValue(stats.totalBooks)}</div>
					</div>
					<div class="stat-card">
						<div class="stat-title">Sách vật lý</div>
						<div class="stat-value">${formatValue(stats.totalPhysicalBooks)}</div>
					</div>
					<div class="stat-card">
						<div class="stat-title">Sách điện tử</div>
						<div class="stat-value">${formatValue(stats.totalEbooks)}</div>
					</div>
					<div class="stat-card">
						<div class="stat-title">Tỷ lệ sách điện tử</div>
						<div class="stat-value">
							${
								stats.totalBooks > 0
									? `${((stats.totalEbooks / stats.totalBooks) * 100).toFixed(
											1
									  )}%`
									: '0%'
							}
						</div>
					</div>
				</div>
			</div>

			<div class="section">
				<div class="section-title">Phân bố theo loại sách</div>
				<table class="table">
					<tr>
						<th>Loại sách</th>
						<th>Số lượng</th>
						<th>Tỷ lệ</th>
					</tr>
					<tr>
						<td>Sách vật lý</td>
						<td>${formatValue(stats.byType?.physical)}</td>
						<td>${calculatePercentage(
							stats.byType?.physical || 0,
							stats.totalBooks || 0
						)}</td>
					</tr>
					<tr>
						<td>Sách điện tử</td>
						<td>${formatValue(stats.byType?.ebook)}</td>
						<td>${calculatePercentage(stats.byType?.ebook || 0, stats.totalBooks || 0)}</td>
					</tr>
				</table>
			</div>

			<div class="section">
				<div class="section-title">Thống kê theo thể loại (Phân cấp)</div>
				<table class="table">
					<tr>
						<th>Thể loại</th>
						<th>Tổng sách</th>
						<th>Sách trực tiếp</th>
						<th>Sách vật lý</th>
						<th>Sách điện tử</th>
						<th>Tỷ lệ</th>
					</tr>
					${
						stats.byHierarchicalCategory &&
						stats.byHierarchicalCategory.length > 0
							? stats.byHierarchicalCategory
									.map(
										(category) => `
							<tr>
								<td style="font-weight: bold; color: #16ae5b;">${category.categoryName}</td>
								<td>${formatValue(category.bookCount)}</td>
								<td>${formatValue(category.directBookCount)}</td>
								<td>${formatValue(category.physicalBookCount)}</td>
								<td>${formatValue(category.ebookCount)}</td>
								<td>${calculatePercentage(category.bookCount || 0, stats.totalBooks || 0)}</td>
							</tr>
							${
								category.children && category.children.length > 0
									? category.children
											.map(
												(child) => `
									<tr>
										<td style="padding-left: 20px; color: #6b7280;">└─ ${child.categoryName}</td>
										<td>${formatValue(child.bookCount)}</td>
										<td>${formatValue(child.directBookCount)}</td>
										<td>${formatValue(child.physicalBookCount)}</td>
										<td>${formatValue(child.ebookCount)}</td>
										<td>${calculatePercentage(child.bookCount || 0, stats.totalBooks || 0)}</td>
									</tr>
								`
											)
											.join('')
									: ''
							}
						`
									)
									.join('')
							: '<tr><td colspan="6" style="text-align: center; color: #6b7280;">Chưa có dữ liệu thể loại</td></tr>'
					}
				</table>
			</div>

			<div class="footer">
				<p>Báo cáo được tạo tự động bởi hệ thống quản lý thư viện</p>
				<p>Thời gian tạo: ${new Date().toLocaleString('vi-VN')}</p>
			</div>
		</body>
		</html>
	`;
};

// Helper function để tạo HTML cho thống kê mượn trả
const generateAnalyticsHTML = (
	borrowStats: BorrowRecordStatsDto,
	reservationStats: ReservationStatsDto,
	finesStats: FinesStatsDto
): string => {
	const currentDate = new Date().toLocaleDateString('vi-VN');

	return `
		<!DOCTYPE html>
		<html lang="vi">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Thống kê mượn trả</title>
			<style>
				body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
				.header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16ae5b; padding-bottom: 20px; }
				.school-logo { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin-bottom: 10px; }
				.school-name { font-size: 18px; font-weight: bold; color: #16ae5b; margin-bottom: 5px; }
				.title { font-size: 24px; font-weight: bold; color: #16ae5b; margin-bottom: 10px; }
				.subtitle { font-size: 14px; color: #6b7280; }
				.section { margin-bottom: 25px; }
				.section-title { font-size: 18px; font-weight: bold; color: #374151; margin-bottom: 15px; border-left: 4px solid #16ae5b; padding-left: 10px; }
				.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
				.stat-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; }
				.stat-title { font-size: 14px; color: #64748b; margin-bottom: 5px; }
				.stat-value { font-size: 24px; font-weight: bold; color: #16ae5b; }
				.table { width: 100%; border-collapse: collapse; margin-top: 15px; }
				.table th, .table td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
				.table th { background: #f0fdf4; font-weight: bold; color: #16ae5b; }
				.footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px; }
			</style>
		</head>
		<body>
			<div class="header">
				<img src="/logo.jpg" alt="Logo trường" class="school-logo" />
				<div class="school-name">Trường THPT Hoài Đức A</div>
				<div class="title">BÁO CÁO THỐNG KÊ MƯỢN TRẢ</div>
				<div class="subtitle">Ngày tạo: ${currentDate}</div>
			</div>

			<div class="section">
				<div class="section-title">Tổng quan mượn sách</div>
				<div class="stats-grid">
					<div class="stat-card">
						<div class="stat-title">Tổng mượn sách</div>
						<div class="stat-value">${formatValue(borrowStats.total)}</div>
					</div>
					<div class="stat-card">
						<div class="stat-title">Đang mượn</div>
						<div class="stat-value">${formatValue(borrowStats.activeLoans)}</div>
					</div>
					<div class="stat-card">
						<div class="stat-title">Quá hạn</div>
						<div class="stat-value">${formatValue(borrowStats.overdueLoans)}</div>
					</div>
				</div>
			</div>

			<div class="section">
				<div class="section-title">Tổng quan đặt trước</div>
				<div class="stats-grid">
					<div class="stat-card">
						<div class="stat-title">Tổng đặt trước</div>
						<div class="stat-value">${formatValue(reservationStats.total)}</div>
					</div>
					<div class="stat-card">
						<div class="stat-title">Chờ xử lý</div>
						<div class="stat-value">${formatValue(reservationStats.pending)}</div>
					</div>
					<div class="stat-card">
						<div class="stat-title">Đã thực hiện</div>
						<div class="stat-value">${formatValue(reservationStats.fulfilled)}</div>
					</div>
					<div class="stat-card">
						<div class="stat-title">Sắp hết hạn</div>
						<div class="stat-value">${formatValue(reservationStats.expiringSoon)}</div>
					</div>
				</div>
			</div>

			<div class="section">
				<div class="section-title">Tổng quan phạt</div>
				<div class="stats-grid">
					<div class="stat-card">
						<div class="stat-title">Tổng tiền phạt</div>
						<div class="stat-value">${
							finesStats.totalAmount
								? `${finesStats.totalAmount.toLocaleString('vi-VN')} VNĐ`
								: '0 VNĐ'
						}</div>
					</div>
					<div class="stat-card">
						<div class="stat-title">Chưa thanh toán</div>
						<div class="stat-value">${formatValue(finesStats.unpaid)}</div>
					</div>
					<div class="stat-card">
						<div class="stat-title">Đã thanh toán</div>
						<div class="stat-value">${formatValue(finesStats.paid)}</div>
					</div>
					<div class="stat-card">
						<div class="stat-title">Được miễn</div>
						<div class="stat-value">${formatValue(finesStats.waived)}</div>
					</div>
				</div>
			</div>

			<div class="section">
				<div class="section-title">Phân bố trạng thái mượn sách</div>
				<table class="table">
					<tr>
						<th>Trạng thái</th>
						<th>Số lượng</th>
						<th>Tỷ lệ</th>
					</tr>
					${
						borrowStats.byStatus && borrowStats.byStatus.length > 0
							? borrowStats.byStatus
									.map(
										(status) => `
							<tr>
								<td>${
									status.status === 'borrowed'
										? 'Đang mượn'
										: status.status === 'returned'
										? 'Đã trả'
										: status.status === 'overdue'
										? 'Quá hạn'
										: status.status === 'renewed'
										? 'Gia hạn'
										: status.status === 'pending_approval'
										? 'Chờ phê duyệt'
										: status.status
								}</td>
								<td>${formatValue(status.count)}</td>
								<td>${calculatePercentage(status.count || 0, borrowStats.total || 0)}</td>
							</tr>
						`
									)
									.join('')
							: '<tr><td colspan="3" style="text-align: center; color: #6b7280;">Chưa có dữ liệu</td></tr>'
					}
				</table>
			</div>

			<div class="section">
				<div class="section-title">Phân bố trạng thái đặt trước</div>
				<table class="table">
					<tr>
						<th>Trạng thái</th>
						<th>Số lượng</th>
						<th>Tỷ lệ</th>
					</tr>
					${
						reservationStats.byStatus && reservationStats.byStatus.length > 0
							? reservationStats.byStatus
									.map(
										(status) => `
							<tr>
								<td>${
									status.status === 'pending'
										? 'Chờ xử lý'
										: status.status === 'fulfilled'
										? 'Đã thực hiện'
										: status.status === 'cancelled'
										? 'Đã hủy'
										: status.status === 'expired'
										? 'Hết hạn'
										: status.status
								}</td>
								<td>${formatValue(status.count)}</td>
								<td>${calculatePercentage(status.count || 0, reservationStats.total || 0)}</td>
							</tr>
						`
									)
									.join('')
							: '<tr><td colspan="3" style="text-align: center; color: #6b7280;">Chưa có dữ liệu</td></tr>'
					}
				</table>
			</div>

			<div class="footer">
				<p>Báo cáo được tạo tự động bởi hệ thống quản lý thư viện</p>
				<p>Thời gian tạo: ${new Date().toLocaleString('vi-VN')}</p>
			</div>
		</body>
		</html>
	`;
};

// Helper function để tạo HTML cho báo cáo tổng quan
const generateOverviewHTML = (): string => {
	const currentDate = new Date().toLocaleDateString('vi-VN');

	return `
		<!DOCTYPE html>
		<html lang="vi">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Báo cáo tổng quan</title>
			<style>
				body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
				.header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16ae5b; padding-bottom: 20px; }
				.school-logo { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin-bottom: 10px; }
				.school-name { font-size: 18px; font-weight: bold; color: #16ae5b; margin-bottom: 5px; }
				.title { font-size: 24px; font-weight: bold; color: #16ae5b; margin-bottom: 10px; }
				.subtitle { font-size: 14px; color: #6b7280; }
				.section { margin-bottom: 25px; }
				.section-title { font-size: 18px; font-weight: bold; color: #374151; margin-bottom: 15px; border-left: 4px solid #16ae5b; padding-left: 10px; }
				.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
				.stat-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; }
				.stat-title { font-size: 14px; color: #64748b; margin-bottom: 5px; }
				.stat-value { font-size: 24px; font-weight: bold; color: #16ae5b; }
				.footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px; }
			</style>
		</head>
		<body>
			<div class="header">
				<img src="/logo.jpg" alt="Logo trường" class="school-logo" />
				<div class="school-name">Trường THPT Hoài Đức A</div>
				<div class="title">BÁO CÁO TỔNG QUAN HỆ THỐNG</div>
				<div class="subtitle">Ngày tạo: ${currentDate}</div>
			</div>

			<div class="section">
				<div class="section-title">Thống kê chung</div>
				<div class="stats-grid">
					<div class="stat-card">
						<div class="stat-title">Tổng doanh thu</div>
						<div class="stat-value">$45,231.89</div>
					</div>
					<div class="stat-card">
						<div class="stat-title">Subscriptions</div>
						<div class="stat-value">+2,350</div>
					</div>
					<div class="stat-card">
						<div class="stat-title">Sales</div>
						<div class="stat-value">+12,234</div>
					</div>
					<div class="stat-card">
						<div class="stat-title">Active Now</div>
						<div class="stat-value">+573</div>
					</div>
				</div>
			</div>

			<div class="footer">
				<p>Báo cáo được tạo tự động bởi hệ thống quản lý thư viện</p>
				<p>Thời gian tạo: ${new Date().toLocaleString('vi-VN')}</p>
			</div>
		</body>
		</html>
	`;
};

// Helper function để tạo PDF từ HTML
const generatePDF = async (
	htmlContent: string,
	fileName: string
): Promise<void> => {
	// Tạo một window mới để render HTML
	const printWindow = window.open('', '_blank');
	if (!printWindow) {
		throw new Error('Không thể mở cửa sổ in');
	}

	printWindow.document.write(htmlContent);
	printWindow.document.close();

	// Đợi content load xong
	printWindow.onload = () => {
		// Trigger print dialog
		printWindow.print();

		// Đóng window sau khi in
		setTimeout(() => {
			printWindow.close();
		}, 1000);
	};

	// Log filename for debugging
	console.log(`Generating PDF: ${fileName}`);
};
