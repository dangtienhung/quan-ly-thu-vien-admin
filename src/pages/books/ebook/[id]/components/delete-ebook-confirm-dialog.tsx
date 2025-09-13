import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, FileText, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { EBook } from '@/types';

interface DeleteEBookConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	ebook: EBook | null;
	onConfirm: () => void;
	onCancel?: () => void;
	isLoading?: boolean;
}

export function DeleteEBookConfirmDialog({
	open,
	onOpenChange,
	ebook,
	onConfirm,
	onCancel,
	isLoading = false,
}: DeleteEBookConfirmDialogProps) {
	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center space-x-2">
						<AlertTriangle className="h-5 w-5 text-red-500" />
						<span>Xác nhận xóa ebook</span>
					</DialogTitle>
					<DialogDescription>
						Bạn có chắc chắn muốn xóa ebook này không? Hành động này không thể
						hoàn tác.
					</DialogDescription>
				</DialogHeader>

				{ebook && (
					<div className="space-y-4">
						<div className="bg-red-50 p-4 rounded-lg border border-red-200">
							<div className="flex items-center space-x-2 mb-2">
								<FileText className="h-4 w-4 text-red-500" />
								<span className="font-medium text-red-800">
									Thông tin ebook sẽ bị xóa:
								</span>
							</div>
							<div className="text-sm text-red-700 space-y-1">
								<p>
									<strong>Định dạng:</strong> {ebook.file_format}
								</p>
								<p>
									<strong>Kích thước:</strong> {formatFileSize(ebook.file_size)}
								</p>
								<p>
									<strong>Đường dẫn:</strong> {ebook.file_path}
								</p>
								<p>
									<strong>Lượt tải:</strong> {ebook.download_count}
								</p>
								<p>
									<strong>Ngày tạo:</strong>{' '}
									{new Date(ebook.created_at).toLocaleDateString('vi-VN')}
								</p>
							</div>
						</div>
					</div>
				)}

				<DialogFooter>
					<Button
						variant="outline"
						onClick={onCancel || (() => onOpenChange(false))}
						disabled={isLoading}
					>
						Hủy
					</Button>
					<Button
						variant="destructive"
						onClick={onConfirm}
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
								Đang xóa...
							</>
						) : (
							<>
								<Trash2 className="mr-2 h-4 w-4" />
								Xóa ebook
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
