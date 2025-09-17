import type { FineWithBorrowDetails } from '@/types/fines';
import { useState } from 'react';

export const useExportFines = () => {
	const [isExporting, setIsExporting] = useState(false);

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

	// Helper function để format tiền tệ VNĐ
	const formatCurrency = (amount: number): string => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	// Helper function để lấy tên trạng thái hiển thị
	const getStatusDisplayName = (status: string) => {
		const statusMap: Record<string, string> = {
			unpaid: 'Chưa thanh toán',
			paid: 'Đã thanh toán',
			waived: 'Được miễn',
		};
		return statusMap[status] || status;
	};

	// Helper function để lấy màu sắc trạng thái
	const getStatusColor = (status: string) => {
		const colorMap: Record<string, string> = {
			unpaid: '#ef4444',
			paid: '#10b981',
			waived: '#6b7280',
		};
		return colorMap[status] || '#6b7280';
	};

	// Helper function để tạo HTML cho báo cáo phạt
	const generateFinesHTML = (
		fines: FineWithBorrowDetails[],
		statusFilter: string
	): string => {
		const currentDate = new Date().toLocaleDateString('vi-VN');

		// Tính toán thống kê
		const totalFines = fines.length;

		// Debug: Log dữ liệu để kiểm tra
		console.log('Fines data for export:', fines);
		console.log(
			'Sample fine amounts:',
			fines.slice(0, 3).map((f) => ({
				fine_amount: f.fine_amount,
				paid_amount: f.paid_amount,
				fine_amount_type: typeof f.fine_amount,
				paid_amount_type: typeof f.paid_amount,
			}))
		);

		// Helper function để chuyển đổi thành số an toàn
		const safeParseNumber = (value: any): number => {
			if (typeof value === 'number' && !isNaN(value)) {
				return value;
			}
			if (typeof value === 'string') {
				const parsed = parseFloat(value);
				return isNaN(parsed) ? 0 : parsed;
			}
			return 0;
		};

		const totalAmount = fines.reduce(
			(sum, fine) => sum + safeParseNumber(fine.fine_amount),
			0
		);
		const paidAmount = fines
			.filter((fine) => fine.status === 'paid')
			.reduce((sum, fine) => sum + safeParseNumber(fine.paid_amount), 0);
		const unpaidAmount = totalAmount - paidAmount;

		// Debug: Log kết quả tính toán
		console.log('Calculated amounts:', {
			totalAmount,
			paidAmount,
			unpaidAmount,
			totalFines,
		});

		return `
			<!DOCTYPE html>
			<html lang="vi">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Báo cáo quản lý phạt</title>
				<style>
					body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
					.header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16ae5b; padding-bottom: 20px; }
					.school-logo { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin-bottom: 10px; }
					.school-name { font-size: 18px; font-weight: bold; color: #16ae5b; margin-bottom: 5px; }
					.title { font-size: 24px; font-weight: bold; color: #16ae5b; margin-bottom: 10px; }
					.subtitle { font-size: 14px; color: #6b7280; }
					.section { margin-bottom: 25px; }
					.section-title { font-size: 18px; font-weight: bold; color: #374151; margin-bottom: 15px; border-left: 4px solid #16ae5b; padding-left: 10px; }
					.table { width: 100%; border-collapse: collapse; margin-top: 15px; }
					.table th, .table td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
					.table th { background: #f0fdf4; font-weight: bold; color: #16ae5b; }
					.table tr:nth-child(even) { background-color: #f9f9f9; }
					.status-unpaid { color: #ef4444; font-weight: bold; }
					.status-paid { color: #10b981; font-weight: bold; }
					.status-waived { color: #6b7280; font-weight: bold; }
					.footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px; }
					.summary { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
					.summary-title { font-size: 16px; font-weight: bold; color: #16ae5b; margin-bottom: 10px; }
					.summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
					.summary-item { text-align: center; }
					.summary-label { font-size: 12px; color: #64748b; margin-bottom: 5px; }
					.summary-value { font-size: 18px; font-weight: bold; color: #16ae5b; }
					.currency { font-weight: bold; }
				</style>
			</head>
			<body>
				<div class="header">
					<img src="/logo.jpg" alt="Logo trường" class="school-logo" />
					<div class="school-name">Trường THPT Hoài Đức A</div>
					<div class="title">BÁO CÁO QUẢN LÝ PHẠT</div>
					<div class="subtitle">Ngày tạo: ${currentDate}</div>
				</div>

				<div class="summary">
					<div class="summary-title">Tóm tắt báo cáo</div>
					<div class="summary-grid">
						<div class="summary-item">
							<div class="summary-label">Trạng thái</div>
							<div class="summary-value">${getStatusDisplayName(statusFilter)}</div>
						</div>
						<div class="summary-item">
							<div class="summary-label">Tổng số phạt</div>
							<div class="summary-value">${totalFines}</div>
						</div>
						<div class="summary-item">
							<div class="summary-label">Tổng tiền phạt</div>
							<div class="summary-value">${formatCurrency(totalAmount)}</div>
						</div>
						<div class="summary-item">
							<div class="summary-label">Đã thu</div>
							<div class="summary-value">${formatCurrency(paidAmount)}</div>
						</div>
					</div>
				</div>

				<div class="section">
					<div class="section-title">Chi tiết các khoản phạt</div>
					<table class="table">
						<thead>
							<tr>
								<th>STT</th>
								<th>Mã phạt</th>
								<th>Tên độc giả</th>
								<th>Tên sách</th>
								<th>Lý do phạt</th>
								<th>Số tiền phạt</th>
								<th>Đã thanh toán</th>
								<th>Trạng thái</th>
								<th>Ngày tạo</th>
								<th>Ghi chú</th>
							</tr>
						</thead>
						<tbody>
							${
								fines && fines.length > 0
									? fines
											.map(
												(fine, index) => `
								<tr>
									<td>${index + 1}</td>
									<td>${formatValue(fine.id)}</td>
									<td>${formatValue(fine.borrowRecord?.reader?.fullName)}</td>
									<td>${formatValue(fine.borrowRecord?.physicalCopy?.book?.title)}</td>
									<td>${formatValue(fine.description)}</td>
									<td class="currency">${formatCurrency(safeParseNumber(fine.fine_amount))}</td>
									<td class="currency">${formatCurrency(safeParseNumber(fine.paid_amount))}</td>
									<td class="status-${fine.status}">${getStatusDisplayName(fine.status)}</td>
									<td>${new Date(fine.fine_date).toLocaleDateString('vi-VN')}</td>
									<td>${formatValue(fine.librarian_notes)}</td>
								</tr>
							`
											)
											.join('')
									: '<tr><td colspan="10" style="text-align: center; color: #6b7280;">Không có dữ liệu</td></tr>'
							}
						</tbody>
					</table>
				</div>

				<div class="section">
					<div class="section-title">Thống kê tổng quan</div>
					<table class="table">
						<tr>
							<td><strong>Tổng số phạt</strong></td>
							<td>${totalFines}</td>
						</tr>
						<tr>
							<td><strong>Tổng tiền phạt</strong></td>
							<td class="currency">${formatCurrency(totalAmount)}</td>
						</tr>
						<tr>
							<td><strong>Đã thu</strong></td>
							<td class="currency">${formatCurrency(paidAmount)}</td>
						</tr>
						<tr>
							<td><strong>Chưa thu</strong></td>
							<td class="currency">${formatCurrency(unpaidAmount)}</td>
						</tr>
						<tr>
							<td><strong>Tỷ lệ thu</strong></td>
							<td>${
								totalAmount > 0
									? `${((paidAmount / totalAmount) * 100).toFixed(1)}%`
									: '0%'
							}</td>
						</tr>
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

	// Helper function để tạo PDF từ HTML
	const generatePDF = async (
		htmlContent: string,
		fileName: string
	): Promise<void> => {
		// Tạo một window mới để render HTML
		const printWindow = window.open(
			'',
			'_blank',
			'width=800,height=600,scrollbars=yes,resizable=yes'
		);
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

	// Function để export báo cáo phạt
	const exportFinesPDF = async (
		fines: FineWithBorrowDetails[],
		statusFilter: string
	) => {
		if (!fines || fines.length === 0) {
			throw new Error('Không có dữ liệu để xuất báo cáo');
		}

		setIsExporting(true);
		try {
			// Tạo nội dung HTML cho PDF
			const htmlContent = generateFinesHTML(fines, statusFilter);

			// Tạo tên file dựa trên status filter
			const statusFileName = statusFilter === 'all' ? 'tat-ca' : statusFilter;
			const fileName = `bao-cao-phat-${statusFileName}.pdf`;

			// Tạo PDF từ HTML
			await generatePDF(htmlContent, fileName);
		} catch (error) {
			console.error('Error generating PDF:', error);
			throw error;
		} finally {
			setIsExporting(false);
		}
	};

	return {
		isExporting,
		exportFinesPDF,
	};
};
