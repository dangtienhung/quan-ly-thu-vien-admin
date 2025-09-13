import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import type { EBook } from '@/types';
import { Download } from 'lucide-react';

interface DownloadConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	ebook: EBook | null;
	bookTitle?: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export function DownloadConfirmDialog({
	open,
	onOpenChange,
	ebook,
	bookTitle,
	onConfirm,
	onCancel,
}: DownloadConfirmDialogProps) {
	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Xác nhận tải xuống</DialogTitle>
					<DialogDescription>
						Bạn có chắc chắn muốn tải xuống ebook này không?
					</DialogDescription>
				</DialogHeader>
				{ebook && (
					<div className="space-y-4">
						<div className="bg-gray-50 p-4 rounded-lg">
							<h4 className="font-semibold text-lg">{bookTitle}</h4>
							<div className="grid grid-cols-2 gap-4 mt-2 text-sm">
								<div>
									<span className="text-gray-600">Định dạng:</span>
									<span className="ml-2 font-medium">{ebook.file_format}</span>
								</div>
								<div>
									<span className="text-gray-600">Kích thước:</span>
									<span className="ml-2 font-medium">
										{formatFileSize(ebook.file_size)}
									</span>
								</div>
								<div>
									<span className="text-gray-600">Đường dẫn:</span>
									<span className="ml-2 font-medium text-xs">
										{ebook.file_path}
									</span>
								</div>
								<div>
									<span className="text-gray-600">Lượt tải:</span>
									<span className="ml-2 font-medium">
										{ebook.download_count}
									</span>
								</div>
							</div>
						</div>
					</div>
				)}
				<DialogFooter>
					<Button variant="outline" onClick={onCancel}>
						Hủy
					</Button>
					<Button onClick={onConfirm}>
						<Download className="mr-2 h-4 w-4" />
						Tải xuống
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
