import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Download, Receipt } from 'lucide-react';

interface ExportConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	statusFilter: string;
	isLoading?: boolean;
	finesCount?: number;
}

export const ExportConfirmDialog = ({
	open,
	onOpenChange,
	onConfirm,
	statusFilter,
	isLoading = false,
	finesCount = 0,
}: ExportConfirmDialogProps) => {
	const getStatusDisplayName = (status: string) => {
		const statusMap: Record<string, string> = {
			all: 'Tất cả',
			unpaid: 'Chưa thanh toán',
			paid: 'Đã thanh toán',
		};
		return statusMap[status] || status;
	};

	const getFileName = (status: string) => {
		const statusFileName = status === 'all' ? 'tat-ca' : status;
		return `bao-cao-phat-${statusFileName}.pdf`;
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2">
						<Receipt className="h-6 w-6 text-red-600" />
						Xuất báo cáo phạt
					</AlertDialogTitle>
					<AlertDialogDescription className="space-y-2">
						<p>Bạn có muốn tải xuống báo cáo quản lý phạt dưới dạng PDF?</p>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<span>
								Trạng thái:{' '}
								<strong>{getStatusDisplayName(statusFilter)}</strong>
							</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<span>
								Số phạt: <strong>{finesCount}</strong>
							</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Download className="h-4 w-4" />
							<span>Tên file: {getFileName(statusFilter)}</span>
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={isLoading}
						className="bg-primary hover:bg-primary/90"
					>
						{isLoading ? (
							<>
								<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
								Đang tạo file...
							</>
						) : (
							<>
								<Download className="mr-2 h-4 w-4" />
								Tải xuống
							</>
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
