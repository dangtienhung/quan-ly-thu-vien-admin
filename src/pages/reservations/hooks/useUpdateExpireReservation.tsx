import { NotificationsAPI, PhysicalCopiesAPI } from '@/apis';

import { useReservations } from '@/hooks';
import { useExpireReservation } from '@/hooks/reservations/use-exprice-revations';
import { useGetProfile } from '@/hooks/users/use-get-profile';
import type { Reservation } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useUpdateExpireReservation = (
	reservationsData?: Reservation[]
) => {
	const queryClient = useQueryClient();
	const { data: user } = useGetProfile();

	const expireReservationMutation = useExpireReservation();

	// Fetch reservations data
	const { reservations: reservationsResult, isLoading: isLoadingReservations } =
		useReservations({
			page: 1,
			limit: 20,
		});

	const reservations = reservationsData || reservationsResult;

	const handleExpireReservation = (reservationId: string) => {
		// Hiển thị thông báo bắt đầu xử lý
		const mainLoadingToast = toast.loading(
			'Đang đánh dấu đặt trước hết hạn...'
		);

		expireReservationMutation.mutate(
			{
				id: reservationId,
				librarianId: user?.id || '',
				reason: `Đánh dấu hết hạn bởi thủ thư ${user?.username}`,
			},
			{
				onSuccess: async () => {
					toast.success('Đánh dấu đặt trước hết hạn thành công!');

					// Tìm reservation đã bị expire để lấy thông tin
					const expiredReservation = reservations.find(
						(r) => r.id === reservationId
					);
					if (!expiredReservation) {
						console.error('Không tìm thấy reservation đã expire');
						toast.dismiss(mainLoadingToast);
						return;
					}

					try {
						// 3. Update physical copy status thành 'available' nếu có
						if (expiredReservation.physical_copy_id) {
							await PhysicalCopiesAPI.updateStatus(
								expiredReservation.physical_copy_id,
								{
									status: 'available',
									notes: `Đặt trước đã hết hạn - Trả về trạng thái sẵn sàng`,
								}
							);
						}

						// 4. Gửi thông báo cho độc giả về việc đặt trước đã hết hạn
						try {
							NotificationsAPI.sendReminders({
								readerId: expiredReservation.reader_id,
								customMessage: `Xin chào! Đặt trước sách "${expiredReservation.book?.title}" của bạn đã hết hạn. Sách sẽ được trả về kho và có thể được đặt trước lại nếu cần thiết.`,
							});
						} catch (error) {
							console.error('Lỗi gửi thông báo:', error);
							toast.warning(
								'Đã đánh dấu hết hạn nhưng không thể gửi thông báo đến độc giả.'
							);
						}

						// 5. Invalidate queries để refresh data
						queryClient.invalidateQueries({ queryKey: ['reservations'] });
						queryClient.invalidateQueries({ queryKey: ['borrow-records'] });
						queryClient.invalidateQueries({ queryKey: ['physical-copies'] });
						queryClient.invalidateQueries({
							queryKey: [
								'borrow-records-by-status',
								{
									status: 'pending_approval',
									page: 1,
									limit: 1000,
								},
							],
						});

						// Dismiss main loading toast
						toast.dismiss(mainLoadingToast);

						// Hiển thị thông báo thành công với thông tin chi tiết
						toast.success(`Đã đánh dấu hết hạn đặt trước thành công!`, {
							duration: 5000,
							description: (
								<div className="mt-2 space-y-1 text-sm">
									<div>
										<strong>Độc giả:</strong>{' '}
										{expiredReservation.reader?.fullName || 'N/A'}
									</div>
									<div>
										<strong>Sách:</strong>{' '}
										{expiredReservation.book?.title || 'N/A'}
									</div>
									<div className="text-green-600">
										✓ Đã cập nhật trạng thái borrow record
									</div>
									<div className="text-green-600">
										✓ Đã cập nhật trạng thái physical copy
									</div>
									<div className="text-green-600">
										✓ Đã gửi thông báo đến độc giả
									</div>
								</div>
							),
						});
					} catch (error) {
						console.error('Lỗi khi cập nhật trạng thái:', error);
						toast.dismiss(mainLoadingToast);
						toast.error(
							'Đã đánh dấu hết hạn nhưng có lỗi khi cập nhật trạng thái!'
						);
					}
				},
				onError: (error) => {
					console.error('Lỗi khi đánh dấu hết hạn đặt trước:', error);
					toast.dismiss(mainLoadingToast);
					toast.error('Có lỗi xảy ra khi đánh dấu hết hạn đặt trước!');
				},
			}
		);
	};

	return {
		handleExpireReservation,
		isLoading: isLoadingReservations,
	};
};
