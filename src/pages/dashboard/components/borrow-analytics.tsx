import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	AlertTriangle,
	BookOpen,
	Clock,
	DollarSign,
	FileText,
	Library,
} from 'lucide-react';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

import { Skeleton } from '@/components/ui/skeleton';
import { useBorrowStats } from '@/hooks/borrow-records/use-borrow-stats';
import { useOverdueStats } from '@/hooks/borrow-records/use-overdue-stats';
import { useFinesStats } from '@/hooks/fines/use-fines-stats';
import { useReservationStats } from '@/hooks/reservations/use-reservation-stats';

export const BorrowAnalytics = () => {
	const {
		data: borrowStats,
		isLoading: borrowLoading,
		error: borrowError,
	} = useBorrowStats();
	const { isLoading: overdueLoading, error: overdueError } = useOverdueStats();
	const {
		data: reservationStats,
		isLoading: reservationLoading,
		error: reservationError,
	} = useReservationStats();
	const {
		data: finesStats,
		isLoading: finesLoading,
		error: finesError,
	} = useFinesStats();

	const isLoading =
		borrowLoading || overdueLoading || reservationLoading || finesLoading;
	const hasError =
		borrowError || overdueError || reservationError || finesError;

	// Data for charts
	const borrowStatusData =
		borrowStats?.byStatus?.map((item) => ({
			name:
				item.status === 'borrowed'
					? 'Đang mượn'
					: item.status === 'returned'
					? 'Đã trả'
					: item.status === 'overdue'
					? 'Quá hạn'
					: item.status === 'renewed'
					? 'Gia hạn'
					: item.status === 'pending_approval'
					? 'Chờ phê duyệt'
					: item.status,
			value: item.count,
			color:
				item.status === 'borrowed'
					? '#16ae5b'
					: item.status === 'returned'
					? '#3b82f6'
					: item.status === 'overdue'
					? '#ef4444'
					: item.status === 'renewed'
					? '#f59e0b'
					: '#6b7280',
		})) || [];

	const reservationStatusData =
		reservationStats?.byStatus?.map((item) => ({
			name:
				item.status === 'pending'
					? 'Chờ xử lý'
					: item.status === 'fulfilled'
					? 'Đã thực hiện'
					: item.status === 'cancelled'
					? 'Đã hủy'
					: item.status === 'expired'
					? 'Hết hạn'
					: item.status,
			value: item.count,
			color:
				item.status === 'pending'
					? '#f59e0b'
					: item.status === 'fulfilled'
					? '#16ae5b'
					: item.status === 'cancelled'
					? '#6b7280'
					: item.status === 'expired'
					? '#ef4444'
					: '#6b7280',
		})) || [];

	const monthlyBorrowData =
		borrowStats?.byMonth?.map((item) => {
			const date = new Date(item.month);
			return {
				month: isNaN(date.getTime())
					? item.month
					: date.toLocaleDateString('vi-VN', {
							month: 'short',
							year: '2-digit',
					  }),
				count: item.count,
			};
		}) || [];

	const readerTypeData =
		borrowStats?.byReaderType?.map((item) => ({
			name: item.readerType,
			value: item.count,
		})) || [];

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{[...Array(8)].map((_, i) => (
						<Card key={i}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-4" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-8 w-16 mb-2" />
								<Skeleton className="h-3 w-32" />
							</CardContent>
						</Card>
					))}
				</div>
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-64 w-full" />
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-64 w-full" />
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (hasError) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<p className="text-red-500 mb-2">Lỗi khi tải thống kê mượn trả</p>
					<p className="text-sm text-gray-500">Vui lòng thử lại sau</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Overview Cards */}
			<div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
				{/* Borrow Records Stats */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Tổng mượn sách
						</CardTitle>
						<BookOpen className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{borrowStats?.total || 0}</div>
						<p className="text-muted-foreground text-xs">Tất cả bản ghi mượn</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Đang mượn</CardTitle>
						<Library className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{borrowStats?.activeLoans || 0}
						</div>
						<p className="text-muted-foreground text-xs">Sách đang được mượn</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Quá hạn</CardTitle>
						<AlertTriangle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{borrowStats?.overdueLoans || 0}
						</div>
						<p className="text-muted-foreground text-xs">Sách quá hạn</p>
					</CardContent>
				</Card>

				{/* Reservations Stats */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Tổng đặt trước
						</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{reservationStats?.total || 0}
						</div>
						<p className="text-muted-foreground text-xs">Tất cả đặt trước</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{reservationStats?.pending || 0}
						</div>
						<p className="text-muted-foreground text-xs">Đặt trước chờ xử lý</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Tổng tiền phạt
						</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{finesStats?.totalAmount
								? `${finesStats.totalAmount.toLocaleString('vi-VN')} VNĐ`
								: '0 VNĐ'}
						</div>
						<p className="text-muted-foreground text-xs">Tổng số tiền phạt</p>
					</CardContent>
				</Card>
			</div>

			{/* Detailed Stats */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{/* Borrow Status Chart */}
				<Card>
					<CardHeader>
						<CardTitle>Phân bố trạng thái mượn sách</CardTitle>
						<CardDescription>
							Thống kê theo trạng thái mượn sách
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{/* Chart */}
							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={borrowStatusData}
											cx="50%"
											cy="50%"
											labelLine={false}
											label={({ name, percent }) =>
												`${name}: ${((percent || 0) * 100).toFixed(0)}%`
											}
											outerRadius={80}
											fill="#8884d8"
											dataKey="value"
										>
											{borrowStatusData.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Pie>
										<Tooltip />
									</PieChart>
								</ResponsiveContainer>
							</div>

							{/* Legend */}
							<div className="space-y-4">
								{borrowStatusData.map((item, index) => (
									<div
										key={index}
										className="flex items-center justify-between"
									>
										<div className="flex items-center space-x-2">
											<div
												className="w-3 h-3 rounded-full"
												style={{ backgroundColor: item.color }}
											></div>
											<span className="text-sm font-medium">{item.name}</span>
										</div>
										<span
											className="text-2xl font-bold"
											style={{ color: item.color }}
										>
											{item.value}
										</span>
									</div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Monthly Borrow Chart */}
				<Card>
					<CardHeader>
						<CardTitle>Thống kê theo tháng</CardTitle>
						<CardDescription>Số lượng mượn sách theo tháng</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={monthlyBorrowData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis
										dataKey="month"
										tick={{ fontSize: 12 }}
										angle={-45}
										textAnchor="end"
										height={60}
									/>
									<YAxis />
									<Tooltip />
									<Bar dataKey="count" fill="#16ae5b" radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Reader Type and Reservations */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{/* Reader Type Chart */}
				<Card>
					<CardHeader>
						<CardTitle>Phân bố theo loại độc giả</CardTitle>
						<CardDescription>
							Thống kê mượn sách theo loại độc giả
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={readerTypeData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis
										dataKey="name"
										tick={{ fontSize: 12 }}
										angle={-45}
										textAnchor="end"
										height={60}
									/>
									<YAxis />
									<Tooltip />
									<Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				{/* Reservation Status Chart */}
				<Card>
					<CardHeader>
						<CardTitle>Phân bố trạng thái đặt trước</CardTitle>
						<CardDescription>
							Thống kê theo trạng thái đặt trước
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{/* Chart */}
							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={reservationStatusData}
											cx="50%"
											cy="50%"
											labelLine={false}
											label={({ name, percent }) =>
												`${name}: ${((percent || 0) * 100).toFixed(0)}%`
											}
											outerRadius={80}
											fill="#8884d8"
											dataKey="value"
										>
											{reservationStatusData.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Pie>
										<Tooltip />
									</PieChart>
								</ResponsiveContainer>
							</div>

							{/* Legend */}
							<div className="space-y-4">
								{reservationStatusData.map((item, index) => (
									<div
										key={index}
										className="flex items-center justify-between"
									>
										<div className="flex items-center space-x-2">
											<div
												className="w-3 h-3 rounded-full"
												style={{ backgroundColor: item.color }}
											></div>
											<span className="text-sm font-medium">{item.name}</span>
										</div>
										<span
											className="text-2xl font-bold"
											style={{ color: item.color }}
										>
											{item.value}
										</span>
									</div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
