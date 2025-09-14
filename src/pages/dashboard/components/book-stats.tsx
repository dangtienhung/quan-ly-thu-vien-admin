import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { BookOpen, FileText, Library, TrendingUp } from 'lucide-react';
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
import { useBookStats } from '@/hooks/books/use-book-stats';
import type { BookStatisticsDto } from '@/types/book.type';

export const BookStats = () => {
	const { data: stats, isLoading, error } = useBookStats();
	const bookStats = stats as BookStatisticsDto | undefined;

	// Data for charts
	const typeData = [
		{
			name: 'Sách vật lý',
			value: bookStats?.byType?.physical || 0,
			color: '#16ae5b',
		},
		{
			name: 'Sách điện tử',
			value: bookStats?.byType?.ebook || 0,
			color: '#3b82f6',
		},
	];

	const categoryData =
		bookStats?.byMainCategory?.map((category) => ({
			name: category.mainCategoryName,
			books: category.bookCount,
			physical: category.physicalBookCount,
			ebook: category.ebookCount,
		})) || [];

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
					<p className="text-red-500 mb-2">Lỗi khi tải thống kê sách</p>
					<p className="text-sm text-gray-500">Vui lòng thử lại sau</p>
				</div>
			</div>
		);
	}

	if (!bookStats) {
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
						<CardTitle className="text-sm font-medium">Tổng số sách</CardTitle>
						<Library className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{bookStats.totalBooks}</div>
						<p className="text-muted-foreground text-xs">
							Tất cả sách trong thư viện
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Sách vật lý</CardTitle>
						<BookOpen className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{bookStats.totalPhysicalBooks}
						</div>
						<p className="text-muted-foreground text-xs">Sách in, bản cứng</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Sách điện tử</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{bookStats.totalEbooks}</div>
						<p className="text-muted-foreground text-xs">Ebook, PDF</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Tỷ lệ sách điện tử
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{bookStats.totalBooks > 0
								? `${(
										(bookStats.totalEbooks / bookStats.totalBooks) *
										100
								  ).toFixed(1)}%`
								: '0%'}
						</div>
						<p className="text-muted-foreground text-xs">So với tổng số sách</p>
					</CardContent>
				</Card>
			</div>

			{/* Detailed Stats */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{/* Books by Type */}
				<Card>
					<CardHeader>
						<CardTitle>Phân bố theo loại sách</CardTitle>
						<CardDescription>
							Thống kê sách theo loại vật lý và điện tử
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{/* Chart */}
							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={typeData}
											cx="50%"
											cy="50%"
											labelLine={false}
											label={({ name, percent }) =>
												`${name}: ${(percent || 0 * 100).toFixed(0)}%`
											}
											outerRadius={80}
											fill="#8884d8"
											dataKey="value"
										>
											{typeData.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Pie>
										<Tooltip />
									</PieChart>
								</ResponsiveContainer>
							</div>

							{/* Legend */}
							<div className="space-y-4">
								{typeData.map((item, index) => (
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

				{/* Books by Category */}
				<Card>
					<CardHeader>
						<CardTitle>Phân bố theo thể loại</CardTitle>
						<CardDescription>Thống kê sách theo thể loại chính</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={categoryData}>
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
									<Bar dataKey="books" fill="#16ae5b" radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Category Details Table */}
			<Card>
				<CardHeader>
					<CardTitle>Chi tiết theo thể loại</CardTitle>
					<CardDescription>
						Bảng chi tiết số lượng sách theo từng thể loại
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full border-collapse">
							<thead>
								<tr className="border-b">
									<th className="text-left p-2 font-medium">Thể loại</th>
									<th className="text-center p-2 font-medium">Tổng sách</th>
									<th className="text-center p-2 font-medium">Sách vật lý</th>
									<th className="text-center p-2 font-medium">Sách điện tử</th>
									<th className="text-center p-2 font-medium">Tỷ lệ</th>
								</tr>
							</thead>
							<tbody>
								{bookStats.byMainCategory?.map((category, index) => (
									<tr key={index} className="border-b hover:bg-gray-50">
										<td className="p-2 font-medium">
											{category.mainCategoryName}
										</td>
										<td className="p-2 text-center">{category.bookCount}</td>
										<td className="p-2 text-center">
											{category.physicalBookCount}
										</td>
										<td className="p-2 text-center">{category.ebookCount}</td>
										<td className="p-2 text-center">
											{bookStats.totalBooks > 0
												? `${(
														(category.bookCount / bookStats.totalBooks) *
														100
												  ).toFixed(1)}%`
												: '0%'}
										</td>
									</tr>
								)) || (
									<tr>
										<td colSpan={5} className="p-4 text-center text-gray-500">
											Chưa có dữ liệu thể loại
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
