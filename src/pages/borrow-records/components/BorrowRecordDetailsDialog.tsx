import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Barcode,
	BookOpen,
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	FileText,
	MapPin,
	User,
	UserCheck,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { BorrowRecord } from '@/types/borrow-records';

interface BorrowRecordDetailsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	record: BorrowRecord | null;
}

export const BorrowRecordDetailsDialog: React.FC<
	BorrowRecordDetailsDialogProps
> = ({ open, onOpenChange, record }) => {
	if (!record) return null;

	const formatDate = (dateString: string) => {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('vi-VN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const formatDateOnly = (dateString: string) => {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('vi-VN');
	};

	const getStatusColor = (status: string) => {
		const colors: Record<string, string> = {
			pending_approval: 'bg-yellow-100 text-yellow-800',
			borrowed: 'bg-green-100 text-green-800',
			returned: 'bg-blue-100 text-blue-800',
			overdue: 'bg-red-100 text-red-800',
			renewed: 'bg-purple-100 text-purple-800',
			cancelled: 'bg-gray-100 text-gray-800',
		};
		return colors[status] || 'bg-gray-100 text-gray-800';
	};

	const getStatusText = (status: string) => {
		const texts: Record<string, string> = {
			pending_approval: 'Chờ phê duyệt',
			borrowed: 'Đang mượn',
			returned: 'Đã trả',
			overdue: 'Quá hạn',
			renewed: 'Đã gia hạn',
			cancelled: 'Đã hủy',
		};
		return texts[status] || status;
	};

	const calculateDaysOverdue = (dueDate: string) => {
		const due = new Date(dueDate);
		const today = new Date();
		const diffTime = today.getTime() - due.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays > 0 ? diffDays : 0;
	};

	const isOverdue = record.due_date && new Date(record.due_date) < new Date();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="!max-w-[1200px] max-h-[90vh] overflow-y-auto w-full">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<BookOpen className="h-5 w-5" />
						Chi tiết giao dịch mượn sách
					</DialogTitle>
					<DialogDescription>
						Thông tin chi tiết về giao dịch mượn sách #{record.id.slice(-8)}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Thông tin cơ bản */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<FileText className="h-4 w-4" />
								Thông tin giao dịch
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="text-sm font-medium text-gray-600">
										ID giao dịch
									</label>
									<p className="text-sm font-mono bg-gray-50 p-2 rounded">
										{record.id}
									</p>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-gray-600">
										Trạng thái
									</label>
									<Badge className={getStatusColor(record.status)}>
										{getStatusText(record.status)}
									</Badge>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-gray-600">
										Ngày mượn
									</label>
									<p className="text-sm flex items-center gap-2">
										<Calendar className="h-4 w-4" />
										{formatDateOnly(record.borrow_date)}
									</p>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-gray-600">
										Hạn trả
									</label>
									<p
										className={`text-sm flex items-center gap-2 ${
											isOverdue ? 'text-red-600 font-medium' : ''
										}`}
									>
										<Clock className="h-4 w-4" />
										{formatDateOnly(record.due_date)}
										{isOverdue && (
											<span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
												Quá hạn {calculateDaysOverdue(record.due_date)} ngày
											</span>
										)}
									</p>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-gray-600">
										Ngày trả
									</label>
									<p className="text-sm flex items-center gap-2">
										<CheckCircle className="h-4 w-4" />
										{formatDateOnly(record.return_date || '')}
									</p>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-gray-600">
										Số lần gia hạn
									</label>
									<p className="text-sm">{record.renewal_count} lần</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Thông tin độc giả */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<User className="h-4 w-4" />
								Thông tin độc giả
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{record.reader ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Họ và tên
										</label>
										<p className="text-sm font-medium">
											{record.reader.fullName}
										</p>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Mã thẻ
										</label>
										<p className="text-sm font-mono bg-gray-50 p-2 rounded">
											{record.reader.cardNumber}
										</p>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Ngày sinh
										</label>
										<p className="text-sm">
											{formatDateOnly(record.reader.dob)}
										</p>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Giới tính
										</label>
										<p className="text-sm">
											{record.reader.gender === 'male' ? 'Nam' : 'Nữ'}
										</p>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Số điện thoại
										</label>
										<p className="text-sm">{record.reader.phone}</p>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Địa chỉ
										</label>
										<p className="text-sm">{record.reader.address}</p>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Ngày cấp thẻ
										</label>
										<p className="text-sm">
											{formatDateOnly(record.reader.cardIssueDate)}
										</p>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Ngày hết hạn thẻ
										</label>
										<p className="text-sm">
											{formatDateOnly(record.reader.cardExpiryDate)}
										</p>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Trạng thái thẻ
										</label>
										<Badge
											className={
												record.reader.isActive
													? 'bg-green-100 text-green-800'
													: 'bg-red-100 text-red-800'
											}
										>
											{record.reader.isActive ? 'Hoạt động' : 'Không hoạt động'}
										</Badge>
									</div>
									{record.reader.readerType && (
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-600">
												Loại độc giả
											</label>
											<p className="text-sm">
												{record.reader.readerType.typeName}
											</p>
										</div>
									)}
								</div>
							) : (
								<p className="text-sm text-gray-500">
									Không có thông tin độc giả
								</p>
							)}
						</CardContent>
					</Card>

					{/* Thông tin sách */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<BookOpen className="h-4 w-4" />
								Thông tin sách
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{record.physicalCopy?.book ? (
								<>
									<div className="flex gap-4">
										{record.physicalCopy.book.cover_image && (
											<img
												src={record.physicalCopy.book.cover_image}
												alt={record.physicalCopy.book.title}
												className="w-24 h-32 object-cover rounded-lg border"
											/>
										)}
										<div className="flex-1 space-y-3">
											<div>
												<label className="text-sm font-medium text-gray-600">
													Tên sách
												</label>
												<p className="text-sm font-medium">
													{record.physicalCopy.book.title}
												</p>
											</div>
											<div>
												<label className="text-sm font-medium text-gray-600">
													ISBN
												</label>
												<p className="text-sm font-mono bg-gray-50 p-2 rounded">
													{record.physicalCopy.book.isbn}
												</p>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div>
													<label className="text-sm font-medium text-gray-600">
														Năm xuất bản
													</label>
													<p className="text-sm">
														{record.physicalCopy.book.publish_year}
													</p>
												</div>
												<div>
													<label className="text-sm font-medium text-gray-600">
														Lần tái bản
													</label>
													<p className="text-sm">
														{record.physicalCopy.book.edition}
													</p>
												</div>
												<div>
													<label className="text-sm font-medium text-gray-600">
														Ngôn ngữ
													</label>
													<p className="text-sm">
														{record.physicalCopy.book.language}
													</p>
												</div>
												<div>
													<label className="text-sm font-medium text-gray-600">
														Số trang
													</label>
													<p className="text-sm">
														{record.physicalCopy.book.page_count} trang
													</p>
												</div>
											</div>
											{record.physicalCopy.book.description && (
												<div>
													<label className="text-sm font-medium text-gray-600">
														Mô tả
													</label>
													<p className="text-sm text-gray-700">
														{record.physicalCopy.book.description}
													</p>
												</div>
											)}
										</div>
									</div>
									<Separator />
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-600">
												Mã vạch
											</label>
											<p className="text-sm flex items-center gap-2">
												<Barcode className="h-4 w-4" />
												{record.physicalCopy.barcode}
											</p>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-600">
												Trạng thái bản sao
											</label>
											<Badge className="bg-blue-100 text-blue-800">
												{record.physicalCopy.status}
											</Badge>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-600">
												Tình trạng hiện tại
											</label>
											<p className="text-sm">
												{record.physicalCopy.current_condition}
											</p>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-600">
												Chi tiết tình trạng
											</label>
											<p className="text-sm">
												{record.physicalCopy.condition_details || '-'}
											</p>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-600">
												Ngày mua
											</label>
											<p className="text-sm">
												{formatDateOnly(record.physicalCopy.purchase_date)}
											</p>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-600">
												Giá mua
											</label>
											<p className="text-sm flex items-center gap-2">
												<DollarSign className="h-4 w-4" />
												{parseFloat(
													record.physicalCopy.purchase_price
												).toLocaleString('vi-VN')}{' '}
												VNĐ
											</p>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-600">
												Vị trí
											</label>
											<p className="text-sm flex items-center gap-2">
												<MapPin className="h-4 w-4" />
												{record.physicalCopy.location || '-'}
											</p>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-600">
												Ngày kiểm tra cuối
											</label>
											<p className="text-sm">
												{formatDateOnly(record.physicalCopy.last_checkup_date)}
											</p>
										</div>
									</div>
									{record.physicalCopy.notes && (
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-600">
												Ghi chú bản sao
											</label>
											<p className="text-sm bg-gray-50 p-3 rounded">
												{record.physicalCopy.notes}
											</p>
										</div>
									)}
								</>
							) : (
								<p className="text-sm text-gray-500">Không có thông tin sách</p>
							)}
						</CardContent>
					</Card>

					{/* Thông tin thủ thư */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<UserCheck className="h-4 w-4" />
								Thông tin thủ thư
							</CardTitle>
						</CardHeader>
						<CardContent>
							{record.librarian ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Mã thủ thư
										</label>
										<p className="text-sm font-mono bg-gray-50 p-2 rounded">
											{record.librarian.userCode}
										</p>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Tên đăng nhập
										</label>
										<p className="text-sm">{record.librarian.username}</p>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Email
										</label>
										<p className="text-sm">{record.librarian.email}</p>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Vai trò
										</label>
										<Badge className="bg-purple-100 text-purple-800">
											{record.librarian.role}
										</Badge>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Trạng thái tài khoản
										</label>
										<Badge
											className={
												record.librarian.accountStatus === 'active'
													? 'bg-green-100 text-green-800'
													: 'bg-red-100 text-red-800'
											}
										>
											{record.librarian.accountStatus === 'active'
												? 'Hoạt động'
												: 'Không hoạt động'}
										</Badge>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Lần đăng nhập cuối
										</label>
										<p className="text-sm">
											{formatDate(record.librarian.lastLogin)}
										</p>
									</div>
								</div>
							) : (
								<p className="text-sm text-gray-500">
									Không có thông tin thủ thư
								</p>
							)}
						</CardContent>
					</Card>

					{/* Ghi chú */}
					{(record.borrow_notes || record.return_notes) && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<FileText className="h-4 w-4" />
									Ghi chú
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{record.borrow_notes && (
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Ghi chú mượn
										</label>
										<p className="text-sm bg-blue-50 p-3 rounded border-l-4 border-blue-400">
											{record.borrow_notes}
										</p>
									</div>
								)}
								{record.return_notes && (
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-600">
											Ghi chú trả
										</label>
										<p className="text-sm bg-green-50 p-3 rounded border-l-4 border-green-400">
											{record.return_notes}
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{/* Thông tin hệ thống */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<Clock className="h-4 w-4" />
								Thông tin hệ thống
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="text-sm font-medium text-gray-600">
										Ngày tạo
									</label>
									<p className="text-sm">{formatDate(record.created_at)}</p>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-gray-600">
										Ngày cập nhật cuối
									</label>
									<p className="text-sm">{formatDate(record.updated_at)}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</DialogContent>
		</Dialog>
	);
};
