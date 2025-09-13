import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { PhysicalCopy } from '@/types';

interface DeleteConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	physicalCopy: PhysicalCopy | null;
	onConfirm: () => void;
	isLoading?: boolean;
}

export function DeleteConfirmDialog({
	open,
	onOpenChange,
	physicalCopy,
	onConfirm,
	isLoading = false,
}: DeleteConfirmDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center space-x-2">
						<AlertTriangle className="h-5 w-5 text-red-500" />
						<span>Xác nhận xóa bản sao</span>
					</DialogTitle>
					<DialogDescription>
						Bạn có chắc chắn muốn xóa bản sao này không? Hành động này không thể
						hoàn tác.
					</DialogDescription>
				</DialogHeader>

				{physicalCopy && (
					<div className="space-y-4">
						<div className="bg-red-50 p-4 rounded-lg border border-red-200">
							<div className="flex items-center space-x-2 mb-2">
								<Trash2 className="h-4 w-4 text-red-500" />
								<span className="font-medium text-red-800">
									Thông tin bản sao sẽ bị xóa:
								</span>
							</div>
							<div className="text-sm text-red-700 space-y-1">
								<p>
									<strong>Barcode:</strong> {physicalCopy.barcode}
								</p>
								<p>
									<strong>Trạng thái:</strong>{' '}
									{(physicalCopy.status === 'available' && 'Sẵn sàng') ||
										(physicalCopy.status === 'borrowed' && 'Đang mượn') ||
										(physicalCopy.status === 'reserved' && 'Đã đặt trước') ||
										(physicalCopy.status === 'damaged' && 'Hư hỏng') ||
										(physicalCopy.status === 'lost' && 'Mất') ||
										(physicalCopy.status === 'maintenance' && 'Bảo trì') ||
										physicalCopy.status}
								</p>
								<p>
									<strong>Tình trạng:</strong>{' '}
									{(physicalCopy.current_condition === 'new' && 'Mới') ||
										(physicalCopy.current_condition === 'good' && 'Tốt') ||
										(physicalCopy.current_condition === 'worn' && 'Cũ') ||
										(physicalCopy.current_condition === 'damaged' &&
											'Hư hỏng') ||
										physicalCopy.current_condition}
								</p>
								<p>
									<strong>Vị trí:</strong>{' '}
									{physicalCopy.location?.name || 'Chưa xác định'}
								</p>
								<p>
									<strong>Giá mua:</strong>{' '}
									{new Intl.NumberFormat('vi-VN', {
										style: 'currency',
										currency: 'VND',
									}).format(physicalCopy.purchase_price)}
								</p>
							</div>
						</div>
					</div>
				)}

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
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
								Xóa bản sao
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
