import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import type {
	Reservation,
	ReservationExpiringSoonItem,
} from '@/types/reservations';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface CancelConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	reservation: Reservation | ReservationExpiringSoonItem | null;
	onConfirm: (reason: string) => void;
	onCancel?: () => void;
	isLoading?: boolean;
}

export const CancelConfirmDialog: React.FC<CancelConfirmDialogProps> = ({
	open,
	onOpenChange,
	reservation,
	onConfirm,
	onCancel,
	isLoading = false,
}) => {
	const [reason, setReason] = useState('');

	if (!reservation) return null;

	const handleConfirm = () => {
		onConfirm(reason || 'Hủy bởi thủ thư');
		setReason(''); // Reset reason after confirm
	};

	const handleCancel = () => {
		setReason(''); // Reset reason when cancel
		if (onCancel) {
			onCancel();
		} else {
			onOpenChange(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Xác nhận hủy đặt trước</DialogTitle>
					<DialogDescription>
						Bạn có chắc chắn muốn hủy đặt trước này không?
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Thông tin đặt trước */}
					<div className="bg-gray-50 rounded-lg p-4 space-y-2">
						<div className="flex items-center gap-3">
							<img
								src={reservation.book?.cover_image}
								alt={reservation.book?.title}
								className="w-12 h-16 object-cover rounded-md"
							/>
							<div className="flex-1">
								<h4 className="font-medium text-sm">
									{reservation.book?.title || 'Không có tên sách'}
								</h4>
								<p className="text-sm text-gray-600">
									Độc giả: {reservation.reader?.cardNumber || ''} -{' '}
									{reservation.reader?.fullName || 'Không có tên độc giả'}
								</p>
								<p className="text-sm text-gray-600">
									Ngày đặt:{' '}
									{new Date(reservation.reservation_date).toLocaleDateString(
										'vi-VN'
									)}
								</p>
								<p className="text-sm text-gray-600">
									Hạn hết:{' '}
									{new Date(reservation.expiry_date).toLocaleDateString(
										'vi-VN'
									)}
								</p>
							</div>
						</div>
					</div>

					{/* Lý do hủy */}
					<div className="space-y-2">
						<Label htmlFor="reason">Lý do hủy (tùy chọn)</Label>
						<Textarea
							id="reason"
							placeholder="Nhập lý do hủy đặt trước..."
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							className="min-h-[80px]"
						/>
					</div>

					{/* Cảnh báo */}
					<div className="bg-red-50 border border-red-200 rounded-lg p-3">
						<div className="flex items-start gap-2">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-red-600 mt-0.5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
									/>
								</svg>
							</div>
							<div className="text-sm text-red-800">
								<p className="font-medium">Cảnh báo:</p>
								<p>
									Hành động này sẽ hủy đặt trước và không thể hoàn tác. Hệ thống
									sẽ:
								</p>
								<ul className="mt-1 space-y-1 text-xs">
									<li>• Cập nhật trạng thái đặt trước thành "Đã hủy"</li>
									<li>• Cập nhật yêu cầu mượn sách tương ứng thành "Đã hủy"</li>
									<li>• Trả sách về trạng thái sẵn sàng</li>
								</ul>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={handleCancel} disabled={isLoading}>
						Hủy
					</Button>
					<Button
						variant="destructive"
						onClick={handleConfirm}
						disabled={isLoading}
					>
						{isLoading ? 'Đang xử lý...' : 'Xác nhận hủy'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
