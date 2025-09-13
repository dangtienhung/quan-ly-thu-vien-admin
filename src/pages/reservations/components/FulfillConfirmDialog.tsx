import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import type { Reservation } from '@/types/reservations';

interface FulfillConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	reservation: Reservation | null;
	onConfirm: () => void;
	onCancel?: () => void;
	isLoading?: boolean;
}

export const FulfillConfirmDialog: React.FC<FulfillConfirmDialogProps> = ({
	open,
	onOpenChange,
	reservation,
	onConfirm,
	onCancel,
	isLoading = false,
}) => {
	if (!reservation) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Xác nhận thực hiện đặt trước</DialogTitle>
					<DialogDescription>
						Bạn có chắc chắn muốn thực hiện đặt trước này không?
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
									Độc giả:{' '}
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

					{/* Cảnh báo */}
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
						<div className="flex items-start gap-2">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-blue-600 mt-0.5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div className="text-sm text-blue-800">
								<p className="font-medium">Lưu ý:</p>
								<p>Khi thực hiện đặt trước, hệ thống sẽ:</p>
								<ul className="mt-1 space-y-1 text-xs">
									<li>• Phê duyệt yêu cầu mượn sách tương ứng</li>
									<li>• Cập nhật trạng thái đặt trước thành "Đã thực hiện"</li>
									<li>• Gửi thông báo đến độc giả</li>
								</ul>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter className="gap-2">
					<Button
						variant="outline"
						onClick={onCancel || (() => onOpenChange(false))}
						disabled={isLoading}
					>
						Hủy
					</Button>
					<Button
						onClick={onConfirm}
						disabled={isLoading}
						className="bg-green-600 hover:bg-green-700"
					>
						{isLoading ? 'Đang xử lý...' : 'Xác nhận thực hiện'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
