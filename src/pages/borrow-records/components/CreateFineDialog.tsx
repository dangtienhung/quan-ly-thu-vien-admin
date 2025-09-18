import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { BorrowRecord } from '@/types/borrow-records';

interface CreateFineDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	record: BorrowRecord | null;
	onConfirm: (data: {
		amount: number;
		reason: string;
		record: BorrowRecord;
	}) => void;
	isLoading: boolean;
}

export const CreateFineDialog: React.FC<CreateFineDialogProps> = ({
	open,
	onOpenChange,
	record,
	onConfirm,
	isLoading,
}) => {
	const calculateDaysOverdue = (dueDate: string) => {
		const due = new Date(dueDate);
		const today = new Date();
		const diffTime = today.getTime() - due.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays > 0 ? diffDays : 0;
	};

	const calculateFineAmount = (dueDate: string) => {
		const daysOverdue = calculateDaysOverdue(dueDate);
		return daysOverdue * 5000; // 500 VND mỗi ngày
	};

	const getDefaultReason = (record: BorrowRecord) => {
		const studentName = record.reader?.fullName || 'Không có tên';
		const studentId = record.reader?.cardNumber || 'Không có mã thẻ';
		return `Học sinh ${studentId} - ${studentName} nộp phạt`;
	};

	const [amount, setAmount] = useState<number>(0);
	const [reason, setReason] = useState<string>('');

	// Reset form khi dialog mở/đóng
	const handleOpenChange = (newOpen: boolean) => {
		onOpenChange(newOpen);
		if (!newOpen) {
			setAmount(0);
			setReason('');
		}
	};

	// Cập nhật form khi record thay đổi
	useEffect(() => {
		if (record) {
			const calculatedAmount = calculateFineAmount(record.due_date);
			const defaultReason = getDefaultReason(record);
			setAmount(calculatedAmount);
			setReason(defaultReason);
		}
	}, [record]);

	const handleSubmit = () => {
		if (!record) return;

		onConfirm({
			amount,
			reason,
			record,
		});
	};

	if (!record) return null;

	const daysOverdue = calculateDaysOverdue(record.due_date);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Receipt className="h-5 w-5 text-orange-600" />
						Tạo phiếu phạt
					</DialogTitle>
					<DialogDescription>
						Tạo phiếu phạt cho sách quá hạn và cập nhật trạng thái thành "Quá
						hạn"
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Thông tin sách và độc giả */}
					<div className="bg-gray-50 p-4 rounded-lg">
						<div className="flex gap-3">
							<img
								src={record.physicalCopy?.book?.cover_image}
								alt={record.physicalCopy?.book?.title}
								className="w-12 h-16 object-cover rounded-md"
							/>
							<div className="flex-1">
								<h4 className="font-medium text-gray-900">
									{record.physicalCopy?.book?.title || 'Không có tên sách'}
								</h4>
								<p className="text-sm text-gray-600">
									Độc giả: {record.reader?.fullName || 'Không có tên độc giả'}
								</p>
								<p className="text-sm text-gray-600">
									Mã thẻ: {record.reader?.cardNumber || 'Không có mã thẻ'}
								</p>
								<div className="flex items-center gap-2 mt-2">
									<AlertTriangle className="h-4 w-4 text-red-600" />
									<span className="text-sm font-medium text-red-600">
										Quá hạn {daysOverdue} ngày
									</span>
								</div>
								{/* <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
									<p className="text-sm text-orange-800">
										<strong>Số tiền phạt:</strong>{' '}
										{amount.toLocaleString('vi-VN')} VND
										<span className="text-xs text-orange-600 ml-1">
											({daysOverdue} ngày × 5000 VND/ngày)
										</span>
									</p>
								</div> */}
							</div>
						</div>
					</div>

					{/* Form tạo phiếu phạt */}
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="amount">Số tiền phạt (VND)</Label>
							<Input
								id="amount"
								type="number"
								value={amount}
								onChange={(e) => setAmount(Number(e.target.value))}
								placeholder="Nhập số tiền phạt"
								min="0"
								step="500"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="reason">Lý do phạt</Label>
							<Textarea
								id="reason"
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								placeholder="Nhập lý do phạt"
								rows={3}
							/>
						</div>
					</div>

					{/* Cảnh báo */}
					<div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
						<div className="flex items-start gap-2">
							<AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
							<div className="text-sm text-orange-800">
								<p className="font-medium">Lưu ý:</p>
								<p>Khi xác nhận, hệ thống sẽ:</p>
								<ul className="list-disc list-inside mt-1 space-y-1">
									<li>Tạo phiếu phạt cho độc giả</li>
									<li>Cập nhật trạng thái mượn sách thành "Quá hạn"</li>
								</ul>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter>
					{/* <Button
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={isLoading}
					>
						Hủy
					</Button> */}
					<Button
						onClick={handleSubmit}
						disabled={isLoading || !reason.trim()}
						className="bg-orange-600 hover:bg-orange-700"
					>
						{isLoading ? 'Đang xử lý...' : 'Tạo phiếu phạt'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
