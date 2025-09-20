import {
	BorrowRecordsTabs,
	ExportConfirmDialog,
	PageHeader,
	RecordDetailsDialog,
	SearchBar,
} from './components';
import type { CreateFineRequest, FineType } from '@/types/fines';
import {
	createSearchParams,
	useNavigate,
	useSearchParams,
} from 'react-router-dom';
import {
	useApproveBorrowRecord,
	useBorrowRecordsByStatus,
	useBorrowRecordsStats,
	useCreateBorrowRecord,
	useDeleteBorrowRecord,
	useRejectBorrowRecord,
	useRenewBook,
	useReturnBook,
	useSendReminders,
} from '@/hooks/borrow-records';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApproveRejectDialog } from './components/approve-reject-dialog';
import { BorrowRecordsAPI } from '@/apis/borrow-records';
import type { BorrowStatus } from '@/types/borrow-records';
import { Button } from '@/components/ui/button';
import { CreateBorrowRecordDialog } from './components/create-borrow-record-dialog';
import { DeleteConfirmDialog } from './components/delete-confirm-dialog';
import { FileText } from 'lucide-react';
import { PhysicalCopiesAPI } from '@/apis/physical-copies';
import { RenewBookDialog } from './components/renew-book-dialog';
import { ReturnBookDialog } from './components/return-book-dialog';
import { StatisticsCards } from './components/statistics-cards';
import { toast } from 'sonner';
import { useCreateFine } from '@/hooks/fines/use-create-fine';
import { useExportBorrowRecords } from '@/hooks/borrow-records/use-export-borrow-records';
import { useUpdatePhysicalCopyStatus } from '@/hooks/physical-copies';

export default function BorrowRecordsPage() {
	const navigate = useNavigate();

	const [params] = useSearchParams();
	const status = params.get('status') || 'borrowed';
	// const status = params.get('status') || 'pending_approval';
	const page = params.get('page') || '1';
	const limit = params.get('limit') || '20';
	const searchQuery = params.get('q') || '';

	const queryClient = useQueryClient();

	const borrowRecordStatus = {
		status: status as BorrowStatus,
		page: Number(page),
		limit: Number(limit),
		q: searchQuery,
	};

	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showReturnDialog, setShowReturnDialog] = useState(false);
	const [showRenewDialog, setShowRenewDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showApproveRejectDialog, setShowApproveRejectDialog] = useState(false);
	const [selectedRecord, setSelectedRecord] = useState<any>(null);
	const [recordToDelete, setRecordToDelete] = useState<any>(null);
	const [recordToReturn, setRecordToReturn] = useState<any>(null);
	const [recordToRenew, setRecordToRenew] = useState<any>(null);
	const [recordToApproveReject, setRecordToApproveReject] = useState<any>(null);
	const [approveRejectAction, setApproveRejectAction] = useState<
		'approve' | 'reject'
	>('approve');
	const [approvedBooks, setApprovedBooks] = useState<Record<string, boolean>>(
		{}
	);
	const [showExportDialog, setShowExportDialog] = useState(false);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	// Hooks for different data sources
	const { stats } = useBorrowRecordsStats();

	// Hook cho filter theo status
	const { borrowRecords: statusRecords, isLoading: isLoadingStatus } =
		useBorrowRecordsByStatus({
			params: borrowRecordStatus,
			enabled: true, // Luôn enable để phản ứng với thay đổi params
		});

	// Hook để lấy dữ liệu "renewed" khi đang ở tab "borrowed"
	const { borrowRecords: renewedRecords, isLoading: isLoadingRenewed } =
		useBorrowRecordsByStatus({
			params: {
				status: 'renewed' as BorrowStatus,
				page: Number(page),
				limit: Number(limit),
				q: searchQuery,
			},
			enabled: status === 'borrowed', // Chỉ fetch khi đang ở tab "borrowed"
		});

	// Mutation hooks
	const { createBorrowRecord, isCreating } = useCreateBorrowRecord();
	const { returnBook, isReturning } = useReturnBook();
	const { renewBook, isRenewing } = useRenewBook();
	const { deleteBorrowRecord, isDeleting } = useDeleteBorrowRecord();
	const { approveBorrowRecord, isApproving } = useApproveBorrowRecord();
	const { rejectBorrowRecord, isRejecting } = useRejectBorrowRecord();

	// Hook để cập nhật trạng thái quá hạn
	const updateOverdueMutation = useMutation({
		mutationFn: async (record: any) => {
			return await BorrowRecordsAPI.update(record.id, {
				status: 'overdue',
				return_notes: `Cập nhật trạng thái quá hạn - ${new Date().toLocaleDateString(
					'vi-VN'
				)}`,
			});
		},
		onSuccess: () => {
			toast.success('Đã cập nhật trạng thái thành quá hạn!');
			invalidateAllQueries();
		},
		onError: (error: Error) => {
			toast.error('Có lỗi xảy ra khi cập nhật trạng thái quá hạn!');
			console.error('Error updating overdue status:', error);
		},
	});

	// Hook để tạo phiếu phạt
	const { createFine, isCreating: isCreatingFine } = useCreateFine();

	// Hook để export báo cáo
	const { isExporting, exportBorrowRecordsPDF } = useExportBorrowRecords();

	// New hooks for reservation and physical copy management
	const updatePhysicalCopyStatusMutation = useUpdatePhysicalCopyStatus();
	const { mutate: sendReminders, isPending: isSendingReminders } =
		useSendReminders();

	// Helper function to get current data based on active tab and filters (memoized)
	const { records, isLoading } = useMemo(() => {
		if (status === 'borrowed') {
			const combinedRecords = [
				...(statusRecords || []),
				...(renewedRecords || []),
			];
			return {
				records: combinedRecords,
				isLoading: isLoadingStatus || isLoadingRenewed,
			};
		}
		return {
			records: statusRecords,
			isLoading: isLoadingStatus,
		};
	}, [
		status,
		statusRecords,
		renewedRecords,
		isLoadingStatus,
		isLoadingRenewed,
	]);

	// Auto-update overdue status based on due_date without showing fine dialog
	const updatedOverdueRef = useRef<Set<string>>(new Set());
	useEffect(() => {
		if (!records || records.length === 0) return;
		const now = new Date().getTime();
		records.forEach((r: any) => {
			const id = r?.id;
			if (!id) return;
			// Skip if already overdue/returned/cancelled or already updated in this session
			if (
				r?.status === 'overdue' ||
				r?.status === 'returned' ||
				r?.status === 'cancelled' ||
				updatedOverdueRef.current.has(id)
			) {
				return;
			}
			const due = r?.due_date ? new Date(r.due_date).getTime() : NaN;
			if (!Number.isNaN(due) && due < now) {
				updatedOverdueRef.current.add(id);
				updateOverdueMutation.mutate(r);
			}
		});
	}, [records, updateOverdueMutation]);

	// Helper function to invalidate all relevant queries (stable)
	const invalidateAllQueries = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ['borrow-records'] });
		queryClient.invalidateQueries({ queryKey: ['borrow-records-stats'] });
		queryClient.invalidateQueries({
			queryKey: ['borrow-records-by-status', borrowRecordStatus],
		});
		// Also invalidate renewed records if we're on borrowed tab
		if (status === 'borrowed') {
			queryClient.invalidateQueries({
				queryKey: [
					'borrow-records-by-status',
					{
						status: 'renewed' as BorrowStatus,
						page: Number(page),
						limit: Number(limit),
						q: searchQuery,
					},
				],
			});
		}
	}, [queryClient, borrowRecordStatus, status, page, limit, searchQuery]);

	// Function to handle update overdue status
	const handleUpdateOverdue = (record: any) => {
		updateOverdueMutation.mutate(record);
	};

	// Utility: calculate overdue days (stable)
	const calculateDaysOverdue = useCallback((dueDate: string) => {
		const due = new Date(dueDate);
		const today = new Date();
		const diffTime = today.getTime() - due.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays > 0 ? diffDays : 0;
	}, []);

	// Function to handle create fine
	const handleCreateFine = (record: any) => {
		const daysOverdue = calculateDaysOverdue(record.due_date);
		const dailyRate = 500; // 500 VND mỗi ngày
		const fineAmount = daysOverdue * dailyRate;

		const fineData: CreateFineRequest = {
			borrow_id: record.id,
			fine_amount: fineAmount,
			fine_date: new Date().toISOString(),
			reason: 'overdue' as FineType,
			description: `Phạt trả sách muộn ${daysOverdue} ngày`,
			overdue_days: daysOverdue,
			daily_rate: dailyRate,
			librarian_notes: `Tạo phiếu phạt tự động cho sách "${record.physicalCopy?.book?.title}"`,
		};

		createFine(fineData, {
			onSuccess: () => {
				// Invalidate queries để refresh data
				queryClient.invalidateQueries({ queryKey: ['fines'] });
				invalidateAllQueries();
			},
		});
	};

	// Function to handle create fine and update overdue status
	const handleCreateFineAndUpdateOverdue = async (data: {
		amount: number;
		reason: string;
		record: any;
		copyStatus?: string;
	}) => {
		const daysOverdue = calculateDaysOverdue(data.record.due_date);

		const fineData: CreateFineRequest = {
			borrow_id: data.record.id,
			fine_amount: data.amount,
			fine_date: new Date().toISOString(),
			reason: 'overdue' as FineType,
			description: data.reason || `Phạt trả sách muộn ${daysOverdue} ngày`,
			overdue_days: daysOverdue,
			daily_rate: Math.floor(data.amount / daysOverdue) || 500,
			librarian_notes: `Tạo phiếu phạt cho sách "${data.record.physicalCopy?.book?.title}"`,
		};

		// Tạo phiếu phạt trước
		createFine(fineData, {
			onSuccess: async () => {
				// Nếu ở tab "returned" và có copyStatus, cập nhật trạng thái sách
				if (status === 'returned' && data.copyStatus) {
					const physicalCopyId = data.record.physicalCopy?.id;
					if (physicalCopyId) {
						try {
							await PhysicalCopiesAPI.updateStatus(physicalCopyId, {
								status: data.copyStatus as any,
								notes: `Cập nhật trạng thái khi tạo phiếu phạt - ${data.reason}`,
							});
						} catch (error) {
							console.error('Error updating physical copy status:', error);
							toast.error('Có lỗi khi cập nhật trạng thái sách');
						}
					}
				} else {
					// Logic cũ cho các tab khác: cập nhật trạng thái thành "đã trả"
					returnBook(
						{
							id: data.record.id,
							data: {
								returnNotes: `Trả sách sau khi tạo phiếu phạt - ${data.reason}`,
							},
						},
						{
							onSuccess: async () => {
								// Cập nhật trạng thái sách về "available"
								const physicalCopyId = data.record.physicalCopy?.id;
								if (physicalCopyId) {
									try {
										await updatePhysicalCopyStatusMutation.mutateAsync({
											id: physicalCopyId,
											data: {
												status: 'available',
												notes: 'Sách đã được trả và sẵn sàng cho mượn',
											},
										});
									} catch (error) {
										console.error(
											'Error updating physical copy status:',
											error
										);
									}
								}
								// Invalidate queries để refresh data
								queryClient.invalidateQueries({ queryKey: ['fines'] });
								invalidateAllQueries();
								toast.success('Tạo phiếu phạt và trả sách thành công!');
							},
							onError: (error) => {
								toast.error('Có lỗi khi cập nhật trạng thái trả sách');
								console.error('Error updating return status:', error);
							},
						}
					);
					return; // Thoát khỏi function để không chạy code bên dưới
				}

				// Invalidate queries để refresh data
				queryClient.invalidateQueries({ queryKey: ['fines'] });
				queryClient.invalidateQueries({ queryKey: ['physical-copies'] });
				invalidateAllQueries();
				toast.success('Tạo phiếu phạt thành công!');
			},
			onError: (error) => {
				toast.error('Có lỗi khi tạo phiếu phạt');
				console.error('Error creating fine:', error);
			},
		});
	};

	const handleCreateBorrowRecord = (data: any) => {
		createBorrowRecord(data, {
			onSuccess: () => {
				setShowCreateDialog(false);
				invalidateAllQueries();
			},
		});
	};

	const handleReturnBook = async (data: any) => {
		if (recordToReturn) {
			try {
				// First, return the borrow record
				await returnBook(
					{ id: recordToReturn.id, data },
					{
						onSuccess: () => {
							setShowReturnDialog(false);
							setRecordToReturn(null);
							invalidateAllQueries();
						},
					}
				);

				// Then, update physical copy status to 'available'
				const physicalCopyId = recordToReturn.physicalCopy?.id;
				if (physicalCopyId) {
					await updatePhysicalCopyStatusMutation.mutateAsync({
						id: physicalCopyId,
						data: {
							status: 'available',
							notes: 'Sách đã được trả và sẵn sàng cho mượn',
						},
					});
				}
			} catch (error) {
				console.error('Error during return process:', error);
				// Still try to return the borrow record even if physical copy update fails
				returnBook(
					{ id: recordToReturn.id, data },
					{
						onSuccess: () => {
							setShowReturnDialog(false);
							setRecordToReturn(null);
						},
					}
				);
			}
		}
	};

	const handleRenewBook = async (data: any) => {
		if (recordToRenew) {
			try {
				// Renew the borrow record
				await renewBook(
					{ id: recordToRenew.id, data },
					{
						onSuccess: () => {
							setShowRenewDialog(false);
							setRecordToRenew(null);
							invalidateAllQueries();
						},
					}
				);

				// Update physical copy status to 'borrowed' (still borrowed but renewed)
				const physicalCopyId = recordToRenew.physicalCopy?.id;
				if (physicalCopyId) {
					await updatePhysicalCopyStatusMutation.mutateAsync({
						id: physicalCopyId,
						data: {
							status: 'borrowed',
							notes: 'Sách đã được gia hạn thời gian mượn',
						},
					});
				}
			} catch (error) {
				console.error('Error during renew process:', error);
				// Still try to renew the borrow record even if physical copy update fails
				renewBook(
					{ id: recordToRenew.id, data },
					{
						onSuccess: () => {
							setShowRenewDialog(false);
							setRecordToRenew(null);
						},
					}
				);
			}
		}
	};

	// keep for potential future UI triggers (unused locally)
	const handleDeleteRecord = (_record: unknown) => {};

	const confirmDelete = () => {
		if (recordToDelete) {
			deleteBorrowRecord(recordToDelete.id, {
				onSuccess: () => {
					setShowDeleteDialog(false);
					setRecordToDelete(null);
					invalidateAllQueries();
				},
			});
		}
	};

	const handleApproveRecord = (record: any) => {
		setRecordToApproveReject(record);
		setApproveRejectAction('approve');
		setShowApproveRejectDialog(true);
	};

	// keep for potential future UI triggers (unused locally)
	const handleRejectRecord = (_record: unknown) => {};

	const handleApproveRejectSubmit = async (data: any) => {
		if (approveRejectAction === 'approve') {
			try {
				const bookId = recordToApproveReject.physicalCopy?.book?.id;

				// Approve the borrow record
				approveBorrowRecord(
					{
						id: recordToApproveReject.id,
						data,
					},
					{
						onSuccess: async () => {
							if (bookId) {
								setApprovedBooks((prev) => ({ ...prev, [bookId]: true }));
							}
							setShowApproveRejectDialog(false);
							setRecordToApproveReject(null);
							invalidateAllQueries();
						},
					}
				);

				// Update physical copy status to 'borrowed'
				const physicalCopyId = recordToApproveReject.physicalCopy?.id;
				if (physicalCopyId) {
					await updatePhysicalCopyStatusMutation.mutateAsync({
						id: physicalCopyId,
						data: {
							status: 'borrowed',
							notes: 'Đang được mượn bởi độc giả',
						},
					});
				}
			} catch (error) {
				console.error('Error during approval process:', error);
				// Still try to approve the borrow record even if other operations fail
				approveBorrowRecord(
					{
						id: recordToApproveReject.id,
						data,
					},
					{
						onSuccess: () => {
							setShowApproveRejectDialog(false);
							setRecordToApproveReject(null);
						},
					}
				);
			}
		} else {
			rejectBorrowRecord(
				{
					id: recordToApproveReject.id,
					data,
				},
				{
					onSuccess: () => {
						setShowApproveRejectDialog(false);
						setRecordToApproveReject(null);
						invalidateAllQueries();
					},
				}
			);
		}
	};

	const handleApproveRejectDialogClose = (open: boolean) => {
		setShowApproveRejectDialog(open);
		if (!open) {
			setRecordToApproveReject(null);
			// Reset approved books state when dialog closes
			setApprovedBooks({});
		}
	};

	const openReturnDialog = (record: any) => {
		setRecordToReturn(record);
		setShowReturnDialog(true);
	};

	const openRenewDialog = (record: any) => {
		setRecordToRenew(record);
		setShowRenewDialog(true);
	};

	const handleReturnDialogClose = (open: boolean) => {
		setShowReturnDialog(open);
		if (!open) {
			setRecordToReturn(null);
		}
	};

	const handleRenewDialogClose = (open: boolean) => {
		setShowRenewDialog(open);
		if (!open) {
			setRecordToRenew(null);
		}
	};

	// Function to handle send notification
	const handleSendNotification = (record: any) => {
		const calculateDaysUntilDue = (dueDate: string) => {
			const due = new Date(dueDate);
			const today = new Date();
			const diffTime = due.getTime() - today.getTime();
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			return diffDays > 0 ? diffDays : 0;
		};

		const daysUntilDue = calculateDaysUntilDue(record.due_date);
		const reminderData = {
			daysBeforeDue: record.status === 'overdue' ? 0 : daysUntilDue,
			customMessage:
				record.status === 'overdue'
					? 'Sách đã quá hạn trả, vui lòng trả sách sớm nhất có thể.'
					: `Sách sắp đến hạn trả (còn ${daysUntilDue} ngày), vui lòng trả sách đúng hạn.`,
			readerId: record.reader?.id || '',
		};

		sendReminders(reminderData);
	};

	// Check if a record should have approve button disabled
	const shouldDisableApproveButton = (record: any) => {
		const bookId = record.physicalCopy?.book?.id;
		if (!bookId) return false;

		// Disable if this book has been approved by someone else
		// But don't disable for the current record being processed
		const isCurrentRecord = record.id === recordToApproveReject?.id;
		return approvedBooks[bookId] && !isCurrentRecord;
	};

	const handleSelectedTab = (value: string) => {
		navigate({
			pathname: '/borrow-records',
			search: createSearchParams({
				status: value,
			}).toString(),
		});
	};

	// Function to handle export PDF
	const handleExportPDF = () => {
		if (!records || records.length === 0) {
			toast.error('Không có dữ liệu để xuất báo cáo');
			return;
		}
		setShowExportDialog(true);
	};

	// Function to confirm export
	const handleConfirmExport = async () => {
		try {
			await exportBorrowRecordsPDF(records, status);
			toast.success('Xuất báo cáo PDF thành công!');
			setShowExportDialog(false);
		} catch (error) {
			console.error('Error exporting PDF:', error);
			toast.error('Có lỗi xảy ra khi xuất báo cáo PDF');
		}
	};

	// Selection handlers
	const handleToggleRow = (id: string, checked: boolean) => {
		setSelectedIds((prev) => {
			const set = new Set(prev);
			if (checked) set.add(id);
			else set.delete(id);
			return Array.from(set);
		});
	};

	const handleToggleAll = (checked: boolean) => {
		if (checked) {
			setSelectedIds((records || []).map((r) => r.id));
		} else {
			setSelectedIds([]);
		}
	};

	// Export selected borrow slips as PDF (each slip new page)
	const handleExportSelectedSlips = async () => {
		const selectedRecords = (records || []).filter((r) =>
			selectedIds.includes(r.id)
		);
		if (selectedRecords.length === 0) {
			toast.error('Vui lòng chọn ít nhất một bản ghi để in phiếu mượn');
			return;
		}

		const buildSlipHTML = (r: any, idx: number) => `
			<div class="borrow-slip">
				<div class="header">
					<img src="/logo.jpg" alt="Logo trường" class="logo" />
					<div class="school">Trường THPT Hoài Đức A</div>
					<div class="title">PHIẾU MƯỢN SÁCH</div>
					<div class="meta">Mã phiếu: ${r.id}</div>
				</div>
				<table class="table">
					<tr><th>Độc giả</th><td>${r.reader?.fullName || ''} (${
			r.reader?.cardNumber || ''
		})</td></tr>
					<tr><th>Điện thoại</th><td>${r.reader?.phone || ''}</td></tr>
					<tr><th>Địa chỉ</th><td>${r.reader?.address || ''}</td></tr>
					<tr><th>Tên sách</th><td>${r.physicalCopy?.book?.title || ''}</td></tr>
					<tr><th>ISBN</th><td>${r.physicalCopy?.book?.isbn || ''}</td></tr>
					<tr><th>Mã vạch</th><td>${r.physicalCopy?.barcode || ''}</td></tr>
					<tr><th>Ngày mượn</th><td>${new Date(r.borrow_date).toLocaleDateString(
						'vi-VN'
					)}</td></tr>
					<tr><th>Hạn trả</th><td>${new Date(r.due_date).toLocaleDateString(
						'vi-VN'
					)}</td></tr>
					<tr><th>Thủ thư</th><td>${r.librarian?.username || ''}</td></tr>
					<tr><th>Ghi chú</th><td>${r.borrow_notes || ''}</td></tr>
				</table>
				<div class="footer">Ngày in: ${new Date().toLocaleDateString('vi-VN')}</div>
			</div>
			${idx < selectedRecords.length - 1 ? '<div class="page-break"></div>' : ''}
		`;

		const html = `
			<!DOCTYPE html>
			<html lang="vi">
			<head>
				<meta charset="UTF-8">
				<title>Phiếu mượn sách</title>
				<style>
					body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
					.header { text-align: center; margin-bottom: 16px; }
					.logo { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin-bottom: 8px; }
					.school { font-weight: 700; color: #16ae5b; }
					.title { font-size: 20px; font-weight: bold; margin-top: 4px; }
					.meta { font-size: 12px; color: #6b7280; }
					.table { width: 100%; border-collapse: collapse; margin-top: 8px; }
					.table th, .table td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
					.table th { background: #f8fafc; width: 180px; }
					.footer { margin-top: 8px; text-align: right; font-size: 12px; color: #6b7280; }
					.page-break { page-break-after: always; }
					.borrow-slip { page-break-inside: avoid; }
				</style>
			</head>
			<body>
				${selectedRecords.map((r, idx) => buildSlipHTML(r, idx)).join('')}
			</body>
			</html>
		`;

		const w = window.open(
			'',
			'_blank',
			'width=800,height=600,scrollbars=yes,resizable=yes'
		);
		if (!w) {
			toast.error(
				'Không thể mở cửa sổ in. Vui lòng cho phép popup và thử lại.'
			);
			return;
		}
		w.document.write(html);
		w.document.close();
		setTimeout(() => {
			w.focus();
			w.print();
			w.onafterprint = () => w.close();
		}, 300);
	};

	// Helper function to get status display name
	// reserved helper (not used in this component)
	const getStatusDisplayName = (_status: string) => _status;

	return (
		<div className="space-y-6">
			{/* Header */}
			<PageHeader onCreateClick={() => setShowCreateDialog(true)} />

			{/* Statistics Cards */}
			<StatisticsCards stats={stats || null} isLoading={false} />

			{/* Search Bar */}
			<div className="flex items-center justify-between gap-4">
				<SearchBar />

				<div className="flex items-center gap-2">
					{/* Export PDF Button */}
					<Button
						variant="outline"
						onClick={handleExportPDF}
						disabled={!records || records.length === 0}
						className="flex items-center gap-2"
					>
						<FileText className="w-4 h-4" />
						Tải báo cáo
					</Button>

					{/* Print borrow slips for selected */}
					{selectedIds.length > 0 && (
						<Button
							onClick={handleExportSelectedSlips}
							className="flex items-center gap-2"
							title={`In phiếu mượn cho ${selectedIds.length} bản ghi đã chọn`}
						>
							<FileText className="w-4 h-4" />
							In phiếu mượn ({selectedIds.length})
						</Button>
					)}
				</div>
			</div>

			{/* Search Indicator */}
			{searchQuery && (
				<div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<span className="text-sm text-blue-700">
								Đang tìm kiếm: <strong>"{searchQuery}"</strong>
							</span>
							<span className="text-xs text-blue-600">
								({statusRecords?.length || 0} kết quả)
							</span>
						</div>
						<button
							onClick={() => {
								const currentParams = new URLSearchParams(params);
								currentParams.delete('q');
								currentParams.set('page', '1');
								navigate({
									pathname: '/borrow-records',
									search: currentParams.toString(),
								});
							}}
							className="text-sm text-blue-600 underline hover:text-blue-800"
						>
							Xóa tìm kiếm
						</button>
					</div>
				</div>
			)}

			{/* Main Content */}
			<BorrowRecordsTabs
				status={status}
				onTabChange={handleSelectedTab}
				records={records}
				isLoading={isLoading}
				selectedIds={selectedIds}
				onToggleRow={handleToggleRow}
				onToggleAll={handleToggleAll}
				onApprove={handleApproveRecord}
				onReturn={openReturnDialog}
				onRenew={openRenewDialog}
				onSendNotification={handleSendNotification}
				onUpdateOverdue={handleUpdateOverdue}
				onCreateFine={handleCreateFine}
				onCreateFineAndUpdateOverdue={handleCreateFineAndUpdateOverdue}
				isApproving={isApproving}
				isReturning={isReturning}
				isRenewing={isRenewing}
				isSendingReminders={isSendingReminders}
				isUpdatingOverdue={updateOverdueMutation.isPending}
				isCreatingFine={isCreatingFine}
				shouldDisableApproveButton={shouldDisableApproveButton}
				approvedBooks={approvedBooks}
			/>

			{/* Create Borrow Record Dialog */}
			<CreateBorrowRecordDialog
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
				onSubmit={handleCreateBorrowRecord}
				isLoading={isCreating}
			/>

			{/* Return Book Dialog */}
			<ReturnBookDialog
				open={showReturnDialog}
				onOpenChange={handleReturnDialogClose}
				bookTitle={recordToReturn?.physicalCopy?.book?.title}
				readerName={recordToReturn?.reader?.fullName}
				onSubmit={handleReturnBook}
				isLoading={isReturning}
			/>

			{/* Renew Book Dialog */}
			<RenewBookDialog
				open={showRenewDialog}
				onOpenChange={handleRenewDialogClose}
				bookTitle={recordToRenew?.physicalCopy?.book?.title}
				readerName={recordToRenew?.reader?.fullName}
				currentDueDate={recordToRenew?.due_date}
				onSubmit={handleRenewBook}
				isLoading={isRenewing}
			/>

			{/* Delete Confirm Dialog */}
			<DeleteConfirmDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				onConfirm={confirmDelete}
				isLoading={isDeleting}
				recordTitle={recordToDelete?.physicalCopy?.book?.title}
				readerName={recordToDelete?.reader?.fullName}
			/>

			{/* Approve/Reject Dialog */}
			<ApproveRejectDialog
				open={showApproveRejectDialog}
				onOpenChange={handleApproveRejectDialogClose}
				bookTitle={recordToApproveReject?.physicalCopy?.book?.title}
				readerName={recordToApproveReject?.reader?.fullName}
				action={approveRejectAction}
				onSubmit={handleApproveRejectSubmit}
				isLoading={isApproving || isRejecting}
			/>

			{/* Record Details Dialog */}
			{selectedRecord && (
				<RecordDetailsDialog
					record={selectedRecord}
					onClose={() => setSelectedRecord(null)}
				/>
			)}

			{/* Export Confirm Dialog */}
			<ExportConfirmDialog
				open={showExportDialog}
				onOpenChange={setShowExportDialog}
				onConfirm={handleConfirmExport}
				status={status}
				isLoading={isExporting}
				recordsCount={records?.length || 0}
			/>
		</div>
	);
}
