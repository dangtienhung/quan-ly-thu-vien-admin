import { Calendar, CreditCard } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { FineWithBorrowDetails } from '@/types';

export const columns = (onPayFine: (fine: FineWithBorrowDetails) => void) => [
	{
		key: 'book',
		header: 'Sách',
		render: (fine: FineWithBorrowDetails) => (
			<div className="gap-2 items-center w-full flex">
				<img
					src={fine.borrowRecord?.physicalCopy?.book?.cover_image}
					alt={fine.borrowRecord?.physicalCopy?.book?.title}
					className="w-10 h-14 object-cover rounded-md"
				/>
				<div className="gap-2">
					{fine.borrowRecord?.physicalCopy?.book?.title || 'Không có tên sách'}
					<div className="text-xs text-gray-500">
						ISBN:{' '}
						{fine.borrowRecord?.physicalCopy?.book?.isbn || 'Không có ISBN'}
					</div>
				</div>
			</div>
		),
	},
	{
		key: 'reader',
		header: 'Độc giả',
		render: (fine: FineWithBorrowDetails) => {
			return (
				<div className="flex items-center gap-2">
					<div>
						<div className="font-medium">
							{fine.borrowRecord?.reader?.fullName || 'Không có thông tin'}
						</div>
						<div className="text-sm text-muted-foreground">
							{fine.borrowRecord?.reader?.cardNumber || 'Không có mã thẻ'}
						</div>
					</div>
				</div>
			);
		},
	},
	{
		key: 'fine_amount',
		header: 'Số tiền phạt',
		render: (fine: FineWithBorrowDetails) => (
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium text-red-600">
					{Number(fine.fine_amount).toLocaleString('vi-VN')} VNĐ
				</span>
			</div>
		),
	},
	{
		key: 'reason',
		header: 'Lý do',
		render: (fine: FineWithBorrowDetails) => {
			const getReasonText = (reason: string) => {
				const reasonMap: Record<string, string> = {
					overdue: 'Trả sách quá hạn',
					damage: 'Làm hỏng sách',
					lost: 'Làm mất sách',
					administrative: 'Lý do khác',
				};
				return reasonMap[reason] || reason;
			};

			return (
				<div className="max-w-xs">
					<span className="text-sm">{getReasonText(fine.reason)}</span>
				</div>
			);
		},
	},
	{
		key: 'fine_date',
		header: 'Ngày phạt',
		render: (fine: FineWithBorrowDetails) => (
			<div className="flex items-center gap-2">
				<Calendar className="h-4 w-4 text-muted-foreground" />
				<span className="text-sm">
					{new Date(fine.fine_date).toLocaleDateString('vi-VN')}
				</span>
			</div>
		),
	},
	{
		key: 'status',
		header: 'Trạng thái',
		render: (fine: FineWithBorrowDetails) => {
			const getStatusBadge = (status: string) => {
				switch (status) {
					case 'paid':
						return (
							<Badge
								variant="default"
								className="bg-green-100 text-green-800 hover:bg-green-100"
							>
								Đã thanh toán
							</Badge>
						);
					case 'unpaid':
						return (
							<Badge
								variant="destructive"
								className="bg-red-100 text-red-800 hover:bg-red-100"
							>
								Chưa thanh toán
							</Badge>
						);
					case 'waived':
						return (
							<Badge
								variant="outline"
								className="bg-gray-100 text-gray-800 hover:bg-gray-100"
							>
								Đã miễn
							</Badge>
						);
					default:
						return <Badge variant="outline">{status}</Badge>;
				}
			};

			return getStatusBadge(fine.status);
		},
	},
	{
		key: 'payment_date',
		header: 'Ngày thanh toán',
		render: (fine: FineWithBorrowDetails) => (
			<div className="flex items-center gap-2">
				<Calendar className="h-4 w-4 text-muted-foreground" />
				<span className="text-sm">
					{fine.payment_date
						? new Date(fine.payment_date).toLocaleDateString('vi-VN')
						: 'Chưa thanh toán'}
				</span>
			</div>
		),
	},
	{
		key: 'actions',
		header: 'Thao tác',
		render: (fine: FineWithBorrowDetails) => (
			<div className="flex items-center gap-2">
				{fine.status === 'unpaid' && (
					<Button
						size="sm"
						variant="outline"
						onClick={() => onPayFine(fine)}
						className="text-green-600 hover:text-green-700 hover:bg-green-50"
						title="Thanh toán phạt"
					>
						<CreditCard className="h-4 w-4" />
					</Button>
				)}
			</div>
		),
	},
];
