import type { BorrowRecord } from '@/types/borrow-records';
import { useState } from 'react';

export const useExportBorrowRecords = () => {
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

	// Helper function để lấy tên trạng thái hiển thị
	const getStatusDisplayName = (status: string) => {
		const statusMap: Record<string, string> = {
			pending_approval: 'Chờ duyệt',
			borrowed: 'Đang mượn',
			returned: 'Đã trả',
			overdue: 'Quá hạn',
			renewed: 'Đã gia hạn',
			cancelled: 'Đã hủy',
			rejected: 'Bị từ chối',
		};
		return statusMap[status] || status;
	};

	// Helper function để tạo HTML cho báo cáo mượn trả
	const generateBorrowRecordsHTML = (
		records: BorrowRecord[],
		status: string
	): string => {
		const currentDate = new Date().toLocaleDateString('vi-VN');

		return `
			<!DOCTYPE html>
			<html lang="vi">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Báo cáo mượn trả sách</title>
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
					.status-pending_approval { color: #f59e0b; font-weight: bold; }
					.status-borrowed { color: #3b82f6; font-weight: bold; }
					.status-returned { color: #10b981; font-weight: bold; }
					.status-overdue { color: #ef4444; font-weight: bold; }
					.status-renewed { color: #8b5cf6; font-weight: bold; }
					.status-cancelled { color: #6b7280; font-weight: bold; }
					.status-rejected { color: #dc2626; font-weight: bold; }
					.footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px; }
					.summary { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
					.summary-title { font-size: 16px; font-weight: bold; color: #16ae5b; margin-bottom: 10px; }
					.summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
					.summary-item { text-align: center; }
					.summary-label { font-size: 12px; color: #64748b; margin-bottom: 5px; }
					.summary-value { font-size: 18px; font-weight: bold; color: #16ae5b; }
				</style>
			</head>
			<body>
				<div class="header">
					<img src="/logo.jpg" alt="Logo trường" class="school-logo" />
					<div class="school-name">Trường THPT Hoài Đức A</div>
					<div class="title">BÁO CÁO MƯỢN TRẢ SÁCH</div>
					<div class="subtitle">Ngày tạo: ${currentDate}</div>
				</div>

				<div class="summary">
					<div class="summary-title">Tóm tắt báo cáo</div>
					<div class="summary-grid">
						<div class="summary-item">
							<div class="summary-label">Trạng thái</div>
							<div class="summary-value">${getStatusDisplayName(status)}</div>
						</div>
						<div class="summary-item">
							<div class="summary-label">Tổng số bản ghi</div>
							<div class="summary-value">${records.length}</div>
						</div>
						<div class="summary-item">
							<div class="summary-label">Ngày xuất báo cáo</div>
							<div class="summary-value">${currentDate}</div>
						</div>
					</div>
				</div>

				<div class="section">
					<div class="section-title">Chi tiết bản ghi mượn trả</div>
					<table class="table">
						<thead>
							<tr>
								<th>STT</th>
								<th>Tên sách</th>
								<th>ISBN</th>
								<th>Tên độc giả</th>
								<th>Mã thẻ</th>
								<th>Ngày mượn</th>
								<th>Ngày hẹn trả</th>
								<th>Ngày trả thực tế</th>
								<th>Trạng thái</th>
								<th>Ghi chú</th>
							</tr>
						</thead>
						<tbody>
							${
								records && records.length > 0
									? records
											.map(
												(record, index) => `
								<tr>
									<td>${index + 1}</td>
									<td>${formatValue(record.physicalCopy?.book?.title)}</td>
									<td>${formatValue(record.physicalCopy?.book?.isbn)}</td>
									<td>${formatValue(record.reader?.fullName)}</td>
									<td>${formatValue(record.reader?.cardNumber)}</td>
									<td>${new Date(record.borrow_date).toLocaleDateString('vi-VN')}</td>
									<td>${new Date(record.due_date).toLocaleDateString('vi-VN')}</td>
									<td>${
										record.return_date
											? new Date(record.return_date).toLocaleDateString('vi-VN')
											: 'Chưa trả'
									}</td>
									<td class="status-${record.status}">${getStatusDisplayName(record.status)}</td>
									<td>${formatValue(record.return_notes)}</td>
								</tr>
							`
											)
											.join('')
									: '<tr><td colspan="10" style="text-align: center; color: #6b7280;">Không có dữ liệu</td></tr>'
							}
						</tbody>
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

	// Function để export báo cáo mượn trả
	const exportBorrowRecordsPDF = async (
		records: BorrowRecord[],
		status: string
	) => {
		if (!records || records.length === 0) {
			throw new Error('Không có dữ liệu để xuất báo cáo');
		}

		setIsExporting(true);
		try {
			// Tạo nội dung HTML cho PDF
			const htmlContent = generateBorrowRecordsHTML(records, status);

			// Tạo tên file dựa trên status
			const statusFileName = status === 'all' ? 'tat-ca' : status;
			const fileName = `bao-cao-muon-tra-${statusFileName}.pdf`;

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
		exportBorrowRecordsPDF,
	};
};
