import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { Reservation, ReservationStatus } from '@/types/reservations';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CancelConfirmDialog } from './CancelConfirmDialog';
import { ExpireConfirmDialog } from './ExpireConfirmDialog';
import { FulfillConfirmDialog } from './FulfillConfirmDialog';
import { isExpiredByEndOfDay } from '@/utils/borrow-utils';
import { useState } from 'react';

interface ReservationTableProps {
	reservations: Reservation[];
	isLoading: boolean;
	onFulfill: (id: string, notes?: string) => void;
	onCancel: (data: {
		id: string;
		librarianId: string;
		reason?: string;
	}) => void;
	onDelete: (reservation: Reservation) => void;
	onViewDetails?: (reservation: Reservation) => void;
	onExpire: (reservationId: string) => void;
	isFulfillPending: boolean;
	isCancelPending: boolean;
	isDeletePending: boolean;
	isBlockedByExpiredReservations?: boolean;
}

export const ReservationTable: React.FC<ReservationTableProps> = ({
	reservations,
	isLoading,
	onFulfill,
	onCancel,
	onDelete,
	onViewDetails,
	onExpire,
	isFulfillPending,
	isCancelPending,
	isDeletePending,
	isBlockedByExpiredReservations = false,
}) => {
	// State for confirm dialogs
	const [fulfillDialogOpen, setFulfillDialogOpen] = useState(false);
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [expireDialogOpen, setExpireDialogOpen] = useState(false);
	const [selectedReservation, setSelectedReservation] =
		useState<Reservation | null>(null);
	const getStatusColor = (status: ReservationStatus) => {
		const colors: Record<ReservationStatus, string> = {
			pending: 'bg-yellow-100 text-yellow-800',
			fulfilled: 'bg-green-100 text-green-800',
			cancelled: 'bg-red-100 text-red-800',
			expired: 'bg-gray-100 text-gray-800',
		};
		return colors[status];
	};

	const getStatusIcon = (status: ReservationStatus) => {
		switch (status) {
			case 'pending':
				return <Clock className="h-4 w-4 text-yellow-600" />;
			case 'fulfilled':
				return <CheckCircle className="h-4 w-4 text-green-600" />;
			case 'cancelled':
				return <XCircle className="h-4 w-4 text-red-600" />;
			case 'expired':
				return <Calendar className="h-4 w-4 text-gray-600" />;
			default:
				return null;
		}
	};

	const getStatusText = (status: ReservationStatus) => {
		switch (status) {
			case 'pending':
				return 'Đang chờ';
			case 'fulfilled':
				return 'Đã thực hiện';
			case 'cancelled':
				return 'Đã hủy';
			case 'expired':
				return 'Hết hạn';
			default:
				return status;
		}
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('vi-VN');
	};

	const calculateDaysUntilExpiry = (expiryDate: string) => {
		const expiry = new Date(expiryDate);
		// const today = new Date();
		const today = new Date(new Date().setDate(new Date().getDate() + 2)); // fake today
		const diffTime = expiry.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays > 0 ? diffDays : 0;
	};

	const isExpiringSoon = (expiryDate: string) => {
		// Cảnh báo khi còn 1 ngày hoặc ít hơn (phù hợp với thời gian hết hạn 2 ngày)
		return calculateDaysUntilExpiry(expiryDate) <= 1;
	};

	// Handler functions for dialogs
	const handleFulfillClick = (reservation: Reservation) => {
		setSelectedReservation(reservation);
		setFulfillDialogOpen(true);
	};

	const handleCancelClick = (reservation: Reservation) => {
		setSelectedReservation(reservation);
		setCancelDialogOpen(true);
	};

	const handleExpireClick = (reservation: Reservation) => {
		setSelectedReservation(reservation);
		setExpireDialogOpen(true);
	};

	const handleConfirmFulfill = (notes?: string) => {
		if (selectedReservation) {
			onFulfill(selectedReservation.id, notes);
			setFulfillDialogOpen(false);
			setSelectedReservation(null);
		}
	};

	const handleConfirmCancel = (reason: string) => {
		if (selectedReservation) {
			onCancel({
				id: selectedReservation.id,
				librarianId: '', // Sẽ được override bởi parent component
				reason,
			});
			setCancelDialogOpen(false);
			setSelectedReservation(null);
		}
	};

	const handleConfirmExpire = (reason: string) => {
		if (selectedReservation) {
			onExpire(selectedReservation.id);
			setExpireDialogOpen(false);
			setSelectedReservation(null);
		}
	};

	const handleCancelDialog = () => {
		setFulfillDialogOpen(false);
		setCancelDialogOpen(false);
		setExpireDialogOpen(false);
		setSelectedReservation(null);
	};

	if (isLoading) {
		return <div className="text-center py-8">Đang tải...</div>;
	}

	if (reservations.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				Không có đặt trước nào
			</div>
		);
	}

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Sách</TableHead>
						<TableHead>Độc giả</TableHead>
						<TableHead>Ngày đặt</TableHead>
						<TableHead>Hạn hết</TableHead>
						<TableHead>Trạng thái</TableHead>
						<TableHead>Ghi chú</TableHead>
						<TableHead className="text-right">Thao tác</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{reservations.map((reservation: Reservation) => (
						<TableRow key={reservation.id}>
							<TableCell className="font-medium">
								<div className="gap-2 items-center w-full flex">
									<img
										src={reservation.book?.cover_image}
										alt={reservation.book?.title}
										className="w-10 h-14 object-cover rounded-md"
									/>
									<div className="gap-2">
										{reservation.book?.title || 'Không có tên sách'}
										<div className="text-xs text-gray-500">
											ISBN: {reservation.book?.isbn || 'Không có ISBN'}
										</div>
									</div>
								</div>
							</TableCell>
							<TableCell>
								<div className="gap-2 items-center w-full flex">
									{reservation.reader?.fullName || 'Không có tên độc giả'}
								</div>
								<p className="text-xs text-gray-500">
									{reservation.reader?.cardNumber || 'Không có mã thẻ'}
								</p>
							</TableCell>
							<TableCell>{formatDate(reservation.reservation_date)}</TableCell>
							<TableCell>
								<div className="flex flex-col">
									<span
										className={
											isExpiringSoon(reservation.expiry_date)
												? 'text-yellow-600 font-semibold'
												: ''
										}
									>
										{formatDate(reservation.expiry_date)}
									</span>
									{reservation.status === 'pending' &&
										isExpiringSoon(reservation.expiry_date) && (
											<span className="text-xs text-yellow-600">
												Còn {calculateDaysUntilExpiry(reservation.expiry_date)}{' '}
												ngày
											</span>
										)}
								</div>
							</TableCell>
							<TableCell>
								<Badge className={getStatusColor(reservation.status)}>
									{getStatusIcon(reservation.status)}
									<span className="ml-1">
										{getStatusText(reservation.status)}
									</span>
								</Badge>
							</TableCell>
							<TableCell>
								<div className="max-w-[200px] truncate">
									{reservation.reader_notes || '-'}
								</div>
							</TableCell>
							<TableCell className="text-right">
								<div className="flex gap-2 justify-end">
									{/* Hiển thị button dựa trên status */}
									{reservation.status === 'pending' && (
										<>
											{/* Kiểm tra xem đặt trước có quá hạn không */}
											{isExpiredByEndOfDay(reservation.expiry_date) ? (
												// Đặt trước quá hạn - chỉ hiển thị button Hủy
												<Button
													variant="destructive"
													size="sm"
													onClick={() => handleExpireClick(reservation)}
													disabled={isCancelPending}
												>
													Hủy (Quá hạn)
												</Button>
											) : (
												// Đặt trước còn hạn - hiển thị đầy đủ button
												<>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleFulfillClick(reservation)}
														disabled={
															isFulfillPending || isBlockedByExpiredReservations
														}
														title={
															isBlockedByExpiredReservations
																? 'Bạn phải hủy hết đặt trước quá hạn trước'
																: ''
														}
													>
														<CheckCircle className="h-4 w-4 text-green-600" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleCancelClick(reservation)}
														disabled={isCancelPending}
													>
														<XCircle className="h-4 w-4 text-red-600" />
													</Button>
												</>
											)}
										</>
									)}

									{/* Hiển thị button "Xem chi tiết" cho status fulfilled */}
									{reservation.status === 'fulfilled' && onViewDetails && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => onViewDetails(reservation)}
										>
											Xem chi tiết
										</Button>
									)}

									{/* Hiển thị thông báo "Đã hoàn thành" nếu không có onViewDetails */}
									{reservation.status === 'fulfilled' && !onViewDetails && (
										<span className="text-sm text-green-600 font-medium">
											✓ Đã hoàn thành
										</span>
									)}

									{/* Button xóa luôn hiển thị (trừ khi status là fulfilled) */}
									{/* {reservation.status !== 'fulfilled' && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => onDelete(reservation)}
										disabled={isDeletePending}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								)} */}

									{/* Hiển thị thông báo cho các status khác */}
									{reservation.status === 'cancelled' && (
										<span className="text-sm text-red-600 font-medium">
											Đã hủy
										</span>
									)}
									{reservation.status === 'expired' && (
										<span className="text-sm text-gray-600 font-medium">
											Hết hạn
										</span>
									)}
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{/* Confirm Dialogs */}
			<FulfillConfirmDialog
				open={fulfillDialogOpen}
				onOpenChange={setFulfillDialogOpen}
				reservation={selectedReservation}
				onConfirm={handleConfirmFulfill}
				onCancel={handleCancelDialog}
				isLoading={isFulfillPending}
			/>

			<CancelConfirmDialog
				open={cancelDialogOpen}
				onOpenChange={setCancelDialogOpen}
				reservation={selectedReservation}
				onConfirm={handleConfirmCancel}
				onCancel={handleCancelDialog}
				isLoading={isCancelPending}
			/>

			<ExpireConfirmDialog
				open={expireDialogOpen}
				onOpenChange={setExpireDialogOpen}
				reservation={selectedReservation}
				onConfirm={handleConfirmExpire}
				onCancel={handleCancelDialog}
				isLoading={isCancelPending}
			/>
		</>
	);
};
