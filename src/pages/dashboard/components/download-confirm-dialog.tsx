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
import { BookOpen, Download, FileText, Users } from 'lucide-react';

interface DownloadConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	tabType: string;
	isLoading?: boolean;
}

export const DownloadConfirmDialog = ({
	open,
	onOpenChange,
	onConfirm,
	tabType,
	isLoading = false,
}: DownloadConfirmDialogProps) => {
	const getTabInfo = () => {
		switch (tabType) {
			case 'users-stats':
				return {
					title: 'Xuất thống kê người dùng',
					description:
						'Bạn có muốn tải xuống báo cáo thống kê người dùng dưới dạng PDF?',
					icon: <Users className="h-6 w-6 text-blue-600" />,
					fileName: 'thong-ke-nguoi-dung.pdf',
				};
			case 'books-stats':
				return {
					title: 'Xuất thống kê sách',
					description:
						'Bạn có muốn tải xuống báo cáo thống kê sách dưới dạng PDF?',
					icon: <BookOpen className="h-6 w-6 text-green-600" />,
					fileName: 'thong-ke-sach.pdf',
				};
			case 'overview':
				return {
					title: 'Xuất báo cáo tổng quan',
					description: 'Bạn có muốn tải xuống báo cáo tổng quan dưới dạng PDF?',
					icon: <FileText className="h-6 w-6 text-purple-600" />,
					fileName: 'bao-cao-tong-quan.pdf',
				};
			default:
				return {
					title: 'Xuất báo cáo',
					description: 'Bạn có muốn tải xuống báo cáo dưới dạng PDF?',
					icon: <FileText className="h-6 w-6 text-gray-600" />,
					fileName: 'bao-cao.pdf',
				};
		}
	};

	const tabInfo = getTabInfo();

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2">
						{tabInfo.icon}
						{tabInfo.title}
					</AlertDialogTitle>
					<AlertDialogDescription className="space-y-2">
						<p>{tabInfo.description}</p>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Download className="h-4 w-4" />
							<span>Tên file: {tabInfo.fileName}</span>
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
