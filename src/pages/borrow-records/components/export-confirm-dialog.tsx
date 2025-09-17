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
import { Download, FileText } from 'lucide-react';

interface ExportConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	status: string;
	isLoading?: boolean;
	recordsCount?: number;
}

export const ExportConfirmDialog = ({
	open,
	onOpenChange,
	onConfirm,
	status,
	isLoading = false,
	recordsCount = 0,
}: ExportConfirmDialogProps) => {
	const getStatusDisplayName = (status: string) => {
		const statusMap: Record<string, string> = {
			pending_approval: 'Chờ duyệt',
			borrowed: 'Đang mượn',
			returned: 'Đã trả',
			overdue: 'Quá hạn',
			renewed: 'Đã gia hạn',
			cancelled: 'Đã hủy',
			rejected: 'Bị từ chối',
			all: 'Tất cả',
		};
		return statusMap[status] || status;
	};

	const getFileName = (status: string) => {
		const statusFileName = status === 'all' ? 'tat-ca' : status;
		return `bao-cao-muon-tra-${statusFileName}.pdf`;
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2">
						<FileText className="h-6 w-6 text-blue-600" />
						Xuất báo cáo mượn trả
					</AlertDialogTitle>
					<AlertDialogDescription className="space-y-2">
						<p>Bạn có muốn tải xuống báo cáo mượn trả sách dưới dạng PDF?</p>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<span>
								Trạng thái: <strong>{getStatusDisplayName(status)}</strong>
							</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<span>
								Số bản ghi: <strong>{recordsCount}</strong>
							</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Download className="h-4 w-4" />
							<span>Tên file: {getFileName(status)}</span>
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
