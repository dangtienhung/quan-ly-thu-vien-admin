import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePayFine } from '@/hooks/fines/use-pay-fine';
import type { FineWithBorrowDetails } from '@/types/fines';
import { toast } from 'sonner';

interface PayFineDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	fine: FineWithBorrowDetails | null;
	onSuccess: () => void;
}

export function PayFineDialog({
	open,
	onOpenChange,
	fine,
	onSuccess,
}: PayFineDialogProps) {
	const [formData, setFormData] = useState({
		payment_method: 'cash',
		amount: 0,
		librarian_notes: '',
	});

	// Tự động điền số tiền phạt khi fine thay đổi
	useEffect(() => {
		if (fine) {
			setFormData((prev) => ({
				...prev,
				amount: Number(fine.fine_amount),
			}));
		}
	}, [fine]);

	// Sử dụng TanStack Query hook
	const { payFine, isPaying } = usePayFine({
		onSuccess: (updatedFine) => {
			console.log('Payment successful, updated fine:', updatedFine);
			// Reset form sau khi thanh toán thành công
			setFormData({ payment_method: 'cash', amount: 0, librarian_notes: '' });
			onSuccess();
			onOpenChange(false);
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!fine) return;

		// Validation
		if (!formData.amount || formData.amount <= 0) {
			toast.error('Vui lòng nhập số tiền thanh toán hợp lệ');
			return;
		}

		if (formData.amount > fine.fine_amount) {
			toast.error('Số tiền thanh toán không được vượt quá số tiền phạt');
			return;
		}

		// Kiểm tra nếu đã thanh toán đầy đủ
		if (fine.status === 'paid') {
			toast.error('Phạt đã được thanh toán đầy đủ');
			return;
		}

		const paymentData = {
			amount: formData.amount,
			paymentMethod: formData.payment_method,
			librarian_notes: formData.librarian_notes,
		};

		console.log('Payment data:', paymentData);
		payFine({ id: fine.id, data: paymentData });
	};

	if (!fine) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Thanh toán phạt</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{/* Fine Information */}
					<div className="bg-gray-50 p-4 rounded-lg space-y-3">
						<h3 className="font-semibold">Thông tin phạt</h3>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="text-muted-foreground">Độc giả:</span>
								<div className="font-medium">
									{fine.borrowRecord?.reader?.fullName || 'Không có thông tin'}
								</div>
							</div>
							<div>
								<span className="text-muted-foreground">Sách:</span>
								<div className="font-medium">
									{fine.borrowRecord?.physicalCopy?.book?.title ||
										'Không có tên sách'}
								</div>
							</div>
							<div>
								<span className="text-muted-foreground">Số tiền phạt:</span>
								<div className="font-bold text-lg text-red-600">
									{Number(fine.fine_amount).toLocaleString()} VNĐ
								</div>
							</div>
							<div>
								<span className="text-muted-foreground">Lý do:</span>
								<div className="font-medium">
									{fine.reason === 'overdue'
										? 'Trả sách quá hạn'
										: fine.reason === 'damage'
										? 'Làm hỏng sách'
										: fine.reason === 'lost'
										? 'Làm mất sách'
										: fine.reason === 'administrative'
										? 'Lý do khác'
										: fine.reason}
								</div>
							</div>
							<div>
								<span className="text-muted-foreground">Trạng thái:</span>
								<div className="font-medium">
									{fine.status === 'paid'
										? 'Đã thanh toán'
										: fine.status === 'unpaid'
										? 'Chưa thanh toán'
										: fine.status === 'waived'
										? 'Đã miễn'
										: fine.status}
								</div>
							</div>
						</div>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="amount">Số tiền thanh toán</Label>
							<input
								type="number"
								id="amount"
								value={Number(formData.amount)}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										amount: Number(e.target.value),
									}))
								}
								placeholder="Nhập số tiền thanh toán"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								min="0"
								max={fine.fine_amount}
							/>
							<div className="text-sm text-muted-foreground">
								Số tiền phạt: {Number(fine.fine_amount).toLocaleString('vi-VN')}{' '}
								VNĐ
								{fine.paid_amount > 0 && (
									<span className="ml-2 text-green-600">
										(Đã thanh toán:{' '}
										{Number(fine.paid_amount).toLocaleString('vi-VN')} VNĐ)
									</span>
								)}
							</div>
							{fine.paid_amount > 0 && (
								<div className="text-sm text-orange-600">
									Còn lại:{' '}
									{Number(fine.fine_amount - fine.paid_amount).toLocaleString(
										'vi-VN'
									)}{' '}
									VNĐ
								</div>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="payment_method">Phương thức thanh toán</Label>
							<Select
								value={formData.payment_method}
								onValueChange={(value) =>
									setFormData((prev) => ({ ...prev, payment_method: value }))
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Chọn phương thức thanh toán" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="cash">Tiền mặt</SelectItem>
									<SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
									<SelectItem value="card">Thẻ tín dụng</SelectItem>
									<SelectItem value="online">Thanh toán online</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="librarian_notes">Ghi chú của thủ thư</Label>
							<Textarea
								id="librarian_notes"
								value={formData.librarian_notes}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										librarian_notes: e.target.value,
									}))
								}
								placeholder="Ghi chú về việc thanh toán (tùy chọn)"
								rows={3}
							/>
						</div>

						<div className="flex justify-end gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isPaying}
							>
								Hủy
							</Button>
							<Button
								type="submit"
								disabled={isPaying}
								className="bg-green-600 hover:bg-green-700"
							>
								{isPaying ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
