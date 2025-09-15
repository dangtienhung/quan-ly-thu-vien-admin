import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Activity, Clock, UserPlus, Users } from 'lucide-react';
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
import { useUserStats } from '@/hooks/users/use-user-stats';
import type { UserStatsDto } from '@/types/user.type';

export const UserStats = () => {
	const { data: stats, isLoading, error } = useUserStats();
	const userStats = stats as UserStatsDto | undefined;

	// Data for charts
	const roleData = [
		{
			name: 'Quản trị viên',
			value: userStats?.usersByRole.admin || 0,
			color: '#3b82f6',
		},
		{
			name: 'Độc giả',
			value: userStats?.usersByRole.reader || 0,
			color: '#10b981',
		},
	];

	const statusData = [
		{
			name: 'Hoạt động',
			value: userStats?.usersByStatus.active || 0,
			color: '#10b981',
		},
		{
			name: 'Tạm khóa',
			value: userStats?.usersByStatus.suspended || 0,
			color: '#f59e0b',
		},
		{
			name: 'Bị cấm',
			value: userStats?.usersByStatus.banned || 0,
			color: '#ef4444',
		},
	];

	const monthlyChartData =
		userStats?.monthlyStats.map((item) => ({
			month: new Date(item.month + '-01').toLocaleDateString('vi-VN', {
				month: 'short',
				year: '2-digit',
			}),
			users: item.count,
		})) || [];

	// Data for reader type chart
	const readerTypeData = [
		{
			name: 'Học sinh',
			value: userStats?.readersByType.student || 0,
			color: '#3b82f6',
		},
		{
			name: 'Giáo viên',
			value: userStats?.readersByType.teacher || 0,
			color: '#10b981',
		},
		{
			name: 'Nhân viên',
			value: userStats?.readersByType.staff || 0,
			color: '#f59e0b',
		},
		{
			name: 'Khách',
			value: userStats?.readersByType.guest || 0,
			color: '#8b5cf6',
		},
	];

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{[...Array(4)].map((_, i) => (
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

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<p className="text-red-500 mb-2">Lỗi khi tải thống kê người dùng</p>
					<p className="text-sm text-gray-500">Vui lòng thử lại sau</p>
				</div>
			</div>
		);
	}

	if (!userStats) {
		return (
			<div className="flex items-center justify-center h-64">
				<p className="text-gray-500">Không có dữ liệu thống kê</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Overview Cards */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Tổng người dùng
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{userStats.totalUsers}</div>
						<p className="text-muted-foreground text-xs">
							Tất cả người dùng trong hệ thống
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Người dùng mới
						</CardTitle>
						<UserPlus className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{userStats.newUsersLast30Days}
						</div>
						<p className="text-muted-foreground text-xs">Trong 30 ngày qua</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Hoạt động gần đây
						</CardTitle>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{userStats.activeUsersLast7Days || 0}
						</div>
						<p className="text-muted-foreground text-xs">Trong 7 ngày qua</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Chưa đăng nhập
						</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{userStats.neverLoggedInUsers}
						</div>
						<p className="text-muted-foreground text-xs">Chưa từng đăng nhập</p>
					</CardContent>
				</Card>
			</div>

			{/* Detailed Stats */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{/* Users by Role */}
				<Card>
					<CardHeader>
						<CardTitle>Phân bố theo vai trò</CardTitle>
						<CardDescription>
							Thống kê người dùng theo vai trò trong hệ thống
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{/* Chart */}
							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={roleData}
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
											{roleData.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Pie>
										<Tooltip />
									</PieChart>
								</ResponsiveContainer>
							</div>

							{/* Legend */}
							<div className="space-y-4">
								{roleData.map((item, index) => (
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

				{/* Users by Status */}
				<Card>
					<CardHeader>
						<CardTitle>Phân bố theo trạng thái</CardTitle>
						<CardDescription>
							Thống kê người dùng theo trạng thái tài khoản
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{/* Chart */}
							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={statusData}>
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
										<Bar dataKey="value" radius={[4, 4, 0, 0]}>
											{statusData.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							</div>

							{/* Legend */}
							<div className="space-y-4">
								{statusData.map((item, index) => (
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

			{/* Reader Type Stats */}
			<Card>
				<CardHeader>
					<CardTitle>Phân bố theo loại độc giả</CardTitle>
					<CardDescription>
						Thống kê độc giả theo loại người dùng
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{/* Chart */}
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={readerTypeData}
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
										{readerTypeData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
						</div>

						{/* Legend */}
						<div className="space-y-4">
							{readerTypeData.map((item, index) => (
								<div key={index} className="flex items-center justify-between">
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

			{/* Monthly Stats */}
			<Card>
				<CardHeader>
					<CardTitle>Thống kê theo tháng</CardTitle>
					<CardDescription>
						Số lượng người dùng mới đăng ký theo từng tháng
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						{/* Chart */}
						<div className="h-80">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={monthlyChartData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis
										dataKey="month"
										tick={{ fontSize: 12 }}
										angle={-45}
										textAnchor="end"
										height={60}
									/>
									<YAxis />
									<Tooltip
										formatter={(value: number) => [
											`${value} người dùng`,
											'Số lượng',
										]}
										labelFormatter={(label) => `Tháng: ${label}`}
									/>
									<Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>

						{/* Table */}
						<div className="space-y-2">
							{userStats.monthlyStats.map(
								(
									monthData: { month: string; count: number },
									index: number
								) => (
									<div
										key={index}
										className="flex items-center justify-between"
									>
										<span className="text-sm font-medium">
											{new Date(monthData.month + '-01').toLocaleDateString(
												'vi-VN',
												{
													month: 'long',
													year: 'numeric',
												}
											)}
										</span>
										<span className="text-lg font-bold">
											{monthData.count} người dùng
										</span>
									</div>
								)
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
