import { CardDescription, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
	Reservation,
	ReservationExpiringSoonItem,
} from '@/types/reservations';
import { createSearchParams, useNavigate } from 'react-router-dom';

import { useReservationStatsByStatus } from '@/hooks/reservations';
import { useQueryParams } from '@/hooks/useQueryParam';
import { ReservationFilters } from './ReservationFilters';
import { ReservationTable } from './ReservationTable';

interface ReservationTabsProps {
	activeTab: string;
	onTabChange: (value: string) => void;
	searchQuery: string;
	selectedStatus: string;
	onSearchChange: (value: string) => void;
	onStatusChange: (status: string) => void;
	reservations: Reservation[];
	expiringSoonReservations: ReservationExpiringSoonItem[];
	isLoadingReservations: boolean;
	isFulfillPending: boolean;
	isCancelPending: boolean;
	isDeletePending: boolean;
	isApproving: boolean;
	onExpire: (reservationId: string) => void;
	onFulfill: (id: string, notes?: string) => void;
	onCancel: (data: {
		id: string;
		librarianId: string;
		reason?: string;
	}) => void;
	onDelete: (reservation: Reservation) => void;
	onViewDetails: (reservation: Reservation) => void;
	onViewDetailsExpiring: (reservation: ReservationExpiringSoonItem) => void;
	isBlockedByExpiredReservations: boolean;
}

export const ReservationTabs: React.FC<ReservationTabsProps> = ({
	activeTab,
	onTabChange,
	searchQuery,
	selectedStatus,
	onSearchChange,
	onStatusChange,
	reservations,
	expiringSoonReservations,
	isLoadingReservations,
	isFulfillPending,
	isCancelPending,
	isDeletePending,
	isApproving,
	onFulfill,
	onExpire,
	onCancel,
	onDelete,
	onViewDetails,
	onViewDetailsExpiring,
	isBlockedByExpiredReservations,
}) => {
	const queryParams = useQueryParams();

	const navigate = useNavigate();

	// Filter reservations based on selected status
	const filteredReservations = reservations.filter((reservation) => {
		return reservation.status === selectedStatus;
	});

	// Sử dụng hook để lấy thống kê theo status
	const { stats: statusStats } = useReservationStatsByStatus();

	// Get status counts for tabs từ API
	const statusCounts = {
		pending: statusStats?.pending || 0,
		fulfilled: statusStats?.fulfilled || 0,
		cancelled: statusStats?.cancelled || 0,
		expired: statusStats?.expired || 0,
	};

	const handleTabChange = (value: string) => {
		// Cập nhật state trong component cha
		onStatusChange(value);

		// Cập nhật URL
		navigate({
			pathname: '/reservations',
			search: createSearchParams({
				...queryParams,
				status: value,
				page: '1',
			}).toString(),
		});
	};

	return (
		<Tabs
			value={queryParams.status || 'pending'}
			onValueChange={handleTabChange}
			className="space-y-4"
		>
			<TabsList className="grid w-full grid-cols-4 h-full">
				<TabsTrigger value="pending" className="flex items-center gap-2">
					Đang chờ
					<span className="ml-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-600">
						{statusCounts.pending}
					</span>
				</TabsTrigger>
				<TabsTrigger value="fulfilled" className="flex items-center gap-2">
					Đã thực hiện
					<span className="ml-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600">
						{statusCounts.fulfilled}
					</span>
				</TabsTrigger>
				<TabsTrigger value="cancelled" className="flex items-center gap-2">
					Đã hủy
					<span className="ml-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
						{statusCounts.cancelled}
					</span>
				</TabsTrigger>
				<TabsTrigger value="expired" className="flex items-center gap-2">
					Hết hạn
					<span className="ml-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
						{statusCounts.expired}
					</span>
				</TabsTrigger>
			</TabsList>

			{/* Search and Filter */}
			<ReservationFilters
				searchQuery={searchQuery}
				selectedStatus={selectedStatus}
				onSearchChange={onSearchChange}
				onStatusChange={onStatusChange}
			/>

			{/* Tab Content */}

			{/* Đang chờ */}
			<TabsContent value="pending" className="space-y-4">
				<div>
					<div>
						<CardTitle>Đặt Trước Đang Chờ</CardTitle>
						<CardDescription>Những đặt trước đang chờ xử lý</CardDescription>
					</div>
					<div>
						<ReservationTable
							reservations={filteredReservations}
							isLoading={isLoadingReservations}
							onFulfill={onFulfill}
							onCancel={onCancel}
							onDelete={onDelete}
							onViewDetails={onViewDetails}
							onExpire={onExpire}
							isFulfillPending={isFulfillPending}
							isCancelPending={isCancelPending}
							isDeletePending={isDeletePending}
							isBlockedByExpiredReservations={isBlockedByExpiredReservations}
						/>
					</div>
				</div>
			</TabsContent>

			{/* Đã thực hiện */}
			<TabsContent value="fulfilled" className="space-y-4">
				<div>
					<div>
						<CardTitle>Đặt Trước Đã Thực Hiện</CardTitle>
						<CardDescription>
							Những đặt trước đã được thực hiện thành công
						</CardDescription>
					</div>
					<div>
						<ReservationTable
							reservations={filteredReservations}
							isLoading={isLoadingReservations}
							onFulfill={onFulfill}
							onCancel={onCancel}
							onDelete={onDelete}
							onViewDetails={onViewDetails}
							onExpire={onExpire}
							isFulfillPending={isFulfillPending || isApproving}
							isCancelPending={isCancelPending}
							isDeletePending={isDeletePending}
							isBlockedByExpiredReservations={isBlockedByExpiredReservations}
						/>
					</div>
				</div>
			</TabsContent>

			{/* Đã hủy */}
			<TabsContent value="cancelled" className="space-y-4">
				<div>
					<div>
						<CardTitle>Đặt Trước Đã Hủy</CardTitle>
						<CardDescription>Những đặt trước đã bị hủy</CardDescription>
					</div>
					<div>
						<ReservationTable
							reservations={filteredReservations}
							isLoading={isLoadingReservations}
							onFulfill={onFulfill}
							onCancel={onCancel}
							onDelete={onDelete}
							onViewDetails={onViewDetails}
							onExpire={onExpire}
							isFulfillPending={isFulfillPending || isApproving}
							isCancelPending={isCancelPending}
							isDeletePending={isDeletePending}
							isBlockedByExpiredReservations={isBlockedByExpiredReservations}
						/>
					</div>
				</div>
			</TabsContent>

			{/* Hết hạn */}
			<TabsContent value="expired" className="space-y-4">
				<div>
					<div>
						<CardTitle>Đặt Trước Hết Hạn</CardTitle>
						<CardDescription>Những đặt trước đã hết hạn</CardDescription>
					</div>
					<div>
						<ReservationTable
							reservations={filteredReservations}
							isLoading={isLoadingReservations}
							onFulfill={onFulfill}
							onCancel={onCancel}
							onDelete={onDelete}
							onViewDetails={onViewDetails}
							onExpire={onExpire}
							isFulfillPending={isFulfillPending || isApproving}
							isCancelPending={isCancelPending}
							isDeletePending={isDeletePending}
							isBlockedByExpiredReservations={isBlockedByExpiredReservations}
						/>
					</div>
				</div>
			</TabsContent>
		</Tabs>
	);
};
