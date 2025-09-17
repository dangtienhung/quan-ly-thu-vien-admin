import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Fine, FineWithBorrowDetails } from '@/types/fines';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Search } from 'lucide-react';

import { FinesAPI } from '@/apis/fines';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { useExportFines } from '@/hooks/fines/use-export-fines';
import { useState } from 'react';
import { toast } from 'sonner';
import { columns } from './components/columns';
import { CreateFineDialog } from './components/create-fine-dialog';
import { ExportConfirmDialog } from './components/export-confirm-dialog';
import { FineStatisticsCards } from './components/fine-statistics-cards';
import { PayFineDialog } from './components/pay-fine-dialog';

export default function FinesPage() {
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>(
		'all'
	);
	const [selectedFine, setSelectedFine] =
		useState<FineWithBorrowDetails | null>(null);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showPayDialog, setShowPayDialog] = useState(false);
	const [showExportDialog, setShowExportDialog] = useState(false);

	const queryClient = useQueryClient();

	// Hook để export báo cáo
	const { isExporting, exportFinesPDF } = useExportFines();

	// Query để lấy danh sách fines
	const {
		data: finesResponse,
		isLoading: isLoadingFines,
		refetch: refetchFines,
	} = useQuery({
		queryKey: ['fines', statusFilter],
		queryFn: async () => {
			if (statusFilter === 'unpaid') {
				return await FinesAPI.getByStatus('unpaid');
			} else if (statusFilter === 'paid') {
				return await FinesAPI.getByStatus('paid');
			} else {
				return await FinesAPI.getAll();
			}
		},
	});
	console.log('🚀 ~ FinesPage ~ finesResponse:', finesResponse);

	// Query để lấy thống kê
	const { data: statistics } = useQuery({
		queryKey: ['fines-stats'],
		queryFn: async () => {
			return await FinesAPI.getStats();
		},
	});

	// Query để tìm kiếm
	const {
		data: searchResponse,
		isLoading: isSearching,
		refetch: searchFines,
	} = useQuery({
		queryKey: ['fines-search', searchQuery],
		queryFn: async () => {
			if (!searchQuery.trim()) {
				return await FinesAPI.getAll();
			}
			return await FinesAPI.search(searchQuery);
		},
		enabled: false, // Chỉ chạy khi gọi searchFines()
	});

	// Mutation để xuất báo cáo
	const exportMutation = useMutation({
		mutationFn: async () => {
			return await FinesAPI.exportReport();
		},
		onSuccess: (blob) => {
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `fines-report-${
				new Date().toISOString().split('T')[0]
			}.xlsx`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
			toast.success('Xuất báo cáo thành công!');
		},
		onError: (error) => {
			console.error('Error exporting fines:', error);
			toast.error('Có lỗi xảy ra khi xuất báo cáo');
		},
	});

	const handleSearch = () => {
		if (searchQuery.trim()) {
			searchFines();
		} else {
			refetchFines();
		}
	};

	const handlePayFine = (fine: Fine) => {
		setSelectedFine(fine as FineWithBorrowDetails);
		setShowPayDialog(true);
	};

	const handleFinePaid = () => {
		queryClient.invalidateQueries({ queryKey: ['fines'] });
		queryClient.invalidateQueries({ queryKey: ['fines-stats'] });
		setShowPayDialog(false);
	};

	const handleFineCreated = () => {
		queryClient.invalidateQueries({ queryKey: ['fines'] });
		queryClient.invalidateQueries({ queryKey: ['fines-stats'] });
		setShowCreateDialog(false);
	};

	const handleExport = () => {
		exportMutation.mutate();
	};

	// Function to handle export PDF
	const handleExportPDF = () => {
		if (!filteredFines || filteredFines.length === 0) {
			toast.error('Không có dữ liệu để xuất báo cáo');
			return;
		}
		setShowExportDialog(true);
	};

	// Function to confirm export
	const handleConfirmExport = async () => {
		try {
			await exportFinesPDF(filteredFines, statusFilter);
			toast.success('Xuất báo cáo PDF thành công!');
			setShowExportDialog(false);
		} catch (error) {
			console.error('Error exporting PDF:', error);
			toast.error('Có lỗi xảy ra khi xuất báo cáo PDF');
		}
	};

	// Sử dụng data từ search hoặc fines tùy theo trạng thái
	const fines = searchQuery.trim()
		? searchResponse?.data || []
		: finesResponse?.data || [];
	const loading = isLoadingFines || isSearching;

	// Filter fines theo status (nếu cần)
	const filteredFines = fines.filter((fine) => {
		if (statusFilter === 'unpaid') return fine.status === 'unpaid';
		if (statusFilter === 'paid') return fine.status === 'paid';
		return true;
	}) as FineWithBorrowDetails[];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Quản lý Phạt</h1>
					<p className="text-muted-foreground">
						Quản lý các khoản phạt trong thư viện
					</p>
				</div>
				<div className="flex items-center gap-2">
					{/* <Button
						variant="outline"
						onClick={handleExportPDF}
						disabled={!filteredFines || filteredFines.length === 0}
						title="Xuất báo cáo PDF"
					>
						<FileText className="h-4 w-4" />
					</Button> */}
					<Button
						variant="outline"
						onClick={handleExportPDF}
						disabled={!filteredFines || filteredFines.length === 0}
						className="flex items-center gap-2"
					>
						<FileText className="h-4 w-4" />
						Tải báo cáo
					</Button>
					{/* <Button
						variant="outline"
						onClick={handleExport}
						disabled={exportMutation.isPending}
						title="Xuất báo cáo Excel"
					>
						<FileSpreadsheet className="h-4 w-4" />
					</Button> */}
					<Button
						onClick={() => setShowCreateDialog(true)}
						title="Tạo phạt mới"
					>
						<Plus className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Statistics */}
			{statistics && <FineStatisticsCards statistics={statistics} />}

			{/* Search and Filters */}
			<Card>
				<CardHeader>
					<CardTitle>Tìm kiếm và lọc</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-4">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
								<Input
									placeholder="Tìm kiếm theo tên độc giả, tên sách..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
									className="pl-10"
								/>
							</div>
						</div>
						<Button
							onClick={handleSearch}
							disabled={isSearching}
							title="Tìm kiếm phạt"
						>
							<Search className="h-4 w-4" />
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Main Content */}
			<Tabs defaultValue="unpaid" className="space-y-4">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="unpaid" onClick={() => setStatusFilter('unpaid')}>
						Chưa thanh toán ({fines.filter((f) => f.status === 'unpaid').length}
						)
					</TabsTrigger>
					<TabsTrigger value="paid" onClick={() => setStatusFilter('paid')}>
						Đã thanh toán ({fines.filter((f) => f.status === 'paid').length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="unpaid" className="space-y-4">
					<DataTable
						columns={columns(handlePayFine)}
						data={filteredFines}
						loading={loading}
					/>
				</TabsContent>

				<TabsContent value="paid" className="space-y-4">
					<DataTable
						columns={columns(handlePayFine)}
						data={filteredFines}
						loading={loading}
					/>
				</TabsContent>
			</Tabs>

			{/* Dialogs */}
			<CreateFineDialog
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
				onSuccess={handleFineCreated}
			/>

			<PayFineDialog
				open={showPayDialog}
				onOpenChange={setShowPayDialog}
				fine={selectedFine}
				onSuccess={handleFinePaid}
			/>

			{/* Export Confirm Dialog */}
			<ExportConfirmDialog
				open={showExportDialog}
				onOpenChange={setShowExportDialog}
				onConfirm={handleConfirmExport}
				statusFilter={statusFilter}
				isLoading={isExporting}
				finesCount={filteredFines?.length || 0}
			/>
		</div>
	);
}
