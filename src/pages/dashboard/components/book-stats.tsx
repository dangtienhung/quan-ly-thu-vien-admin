import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import type {
	BookStatisticsDto,
	HierarchicalCategoryStatisticsDto,
} from '@/types/book.type';
import {
	BookOpen,
	ChevronDown,
	ChevronRight,
	FileText,
	Library,
	TrendingUp,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
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

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookStats } from '@/hooks/books/use-book-stats';

export const BookStats = () => {
	const { data: stats, isLoading, error } = useBookStats();
	const bookStats = stats as BookStatisticsDto | undefined;

	// State for managing expanded categories
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
		new Set()
	);

	// Initialize all categories as expanded on first load
	useEffect(() => {
		if (bookStats?.byHierarchicalCategory) {
			const allCategoryIds = new Set<string>();
			const collectAllIds = (
				categories: HierarchicalCategoryStatisticsDto[]
			) => {
				categories.forEach((cat) => {
					allCategoryIds.add(cat.categoryId);
					if (cat.children) {
						collectAllIds(cat.children);
					}
				});
			};
			collectAllIds(bookStats.byHierarchicalCategory);
			setExpandedCategories(allCategoryIds);
		}
	}, [bookStats?.byHierarchicalCategory]);

	// Toggle expand/collapse for a category
	const toggleCategory = (categoryId: string) => {
		setExpandedCategories((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(categoryId)) {
				newSet.delete(categoryId);
			} else {
				newSet.add(categoryId);
			}
			return newSet;
		});
	};

	// Render hierarchical category rows
	const renderCategoryRow = (
		category: HierarchicalCategoryStatisticsDto,
		level: number = 0
	): React.ReactElement => {
		const isExpanded = expandedCategories.has(category.categoryId);
		const hasChildren = category.children && category.children.length > 0;

		return (
			<>
				<tr key={category.categoryId} className="border-b hover:bg-gray-50">
					<td
						className="p-2 font-medium"
						style={{ paddingLeft: `${level * 20 + 8}px` }}
					>
						<div className="flex items-center gap-2">
							{hasChildren ? (
								<Button
									variant="ghost"
									size="sm"
									className="h-6 w-6 p-0"
									onClick={() => toggleCategory(category.categoryId)}
								>
									{isExpanded ? (
										<ChevronDown className="h-4 w-4" />
									) : (
										<ChevronRight className="h-4 w-4" />
									)}
								</Button>
							) : (
								<div className="w-6" />
							)}
							<span className={level === 0 ? 'font-semibold' : 'font-normal'}>
								{category.categoryName}
								{level > 0 && (
									<span className="text-xs text-gray-500 ml-2">
										(Thể loại con)
									</span>
								)}
							</span>
						</div>
					</td>
					<td className="p-2 text-center">
						<div className="flex flex-col">
							<span className="font-medium">{category.bookCount}</span>
							{category.directBookCount > 0 && (
								<span className="text-xs text-gray-500">
									Trực tiếp: {category.directBookCount}
								</span>
							)}
						</div>
					</td>
					<td className="p-2 text-center">
						<div className="flex flex-col">
							<span className="font-medium">{category.physicalBookCount}</span>
							{category.directPhysicalBookCount > 0 && (
								<span className="text-xs text-gray-500">
									Trực tiếp: {category.directPhysicalBookCount}
								</span>
							)}
						</div>
					</td>
					<td className="p-2 text-center">
						<div className="flex flex-col">
							<span className="font-medium">{category.ebookCount}</span>
							{category.directEbookCount > 0 && (
								<span className="text-xs text-gray-500">
									Trực tiếp: {category.directEbookCount}
								</span>
							)}
						</div>
					</td>
					<td className="p-2 text-center">
						{bookStats?.totalBooks && bookStats.totalBooks > 0
							? `${category.percentage.toFixed(1)}%`
							: '0%'}
					</td>
				</tr>
				{/* Render children if expanded */}
				{isExpanded &&
					hasChildren &&
					category.children?.map((child: HierarchicalCategoryStatisticsDto) =>
						renderCategoryRow(child, level + 1)
					)}
			</>
		);
	};

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

	// Tạo data cho chart từ hierarchical data
	const categoryData =
		bookStats?.byHierarchicalCategory?.map((category) => ({
			id: category.categoryId,
			name: category.categoryName,
			books: category.bookCount,
			physical: category.physicalBookCount,
			ebook: category.ebookCount,
			directBooks: category.directBookCount,
			directPhysical: category.directPhysicalBookCount,
			directEbook: category.directEbookCount,
			level: category.level,
			isMainCategory: category.isMainCategory,
			hasChildren: category.children && category.children.length > 0,
			children:
				category.children?.map((child) => ({
					id: child.categoryId,
					name: child.categoryName,
					books: child.bookCount,
					physical: child.physicalBookCount,
					ebook: child.ebookCount,
					directBooks: child.directBookCount,
					directPhysical: child.directPhysicalBookCount,
					directEbook: child.directEbookCount,
					level: child.level,
					isMainCategory: child.isMainCategory,
				})) || [],
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
												`${name}: ${((percent || 0) * 100).toFixed(0)}%`
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

				{/* Books by Category - Hierarchical */}
				<Card>
					<CardHeader>
						<CardTitle>Phân bố theo thể loại (Phân cấp)</CardTitle>
						<CardDescription>
							Thống kê sách theo cấu trúc phân cấp thể loại. Click vào mũi tên
							để mở rộng/thu gọn các thể loại con.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{/* Hierarchical Chart */}
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
										<Tooltip
											formatter={(value, name) => {
												if (name === 'books')
													return [`${value} sách`, 'Tổng sách'];
												if (name === 'directBooks')
													return [`${value} sách`, 'Sách trực tiếp'];
												return [value, name];
											}}
											labelFormatter={(label) => `Thể loại: ${label}`}
										/>
										<Bar
											dataKey="books"
											fill="#16ae5b"
											radius={[4, 4, 0, 0]}
											name="Tổng sách"
										/>
										<Bar
											dataKey="directBooks"
											fill="#22c55e"
											radius={[4, 4, 0, 0]}
											name="Sách trực tiếp"
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>

							{/* Hierarchical List View */}
							<div className="space-y-2 hidden">
								<h4 className="text-sm font-medium text-gray-700">
									Chi tiết theo cấp độ:
								</h4>
								<div className="max-h-48 overflow-y-auto space-y-1">
									{categoryData.map((category, index) => (
										<div key={index} className="space-y-1">
											{/* Main Category */}
											<div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
												<div className="flex items-center gap-2">
													{category.hasChildren && (
														<Button
															variant="ghost"
															size="sm"
															className="h-6 w-6 p-0"
															onClick={() => toggleCategory(category.id)}
														>
															{expandedCategories.has(category.id) ? (
																<ChevronDown className="h-4 w-4" />
															) : (
																<ChevronRight className="h-4 w-4" />
															)}
														</Button>
													)}
													{!category.hasChildren && <div className="w-6" />}
													<span className="font-semibold text-sm">
														{category.name}
													</span>
												</div>
												<div className="flex items-center gap-4 text-sm">
													<div className="text-center">
														<div className="font-medium text-green-600">
															{category.books}
														</div>
														<div className="text-xs text-gray-500">Tổng</div>
													</div>
													{category.directBooks > 0 && (
														<div className="text-center">
															<div className="font-medium text-blue-600">
																{category.directBooks}
															</div>
															<div className="text-xs text-gray-500">
																Trực tiếp
															</div>
														</div>
													)}
												</div>
											</div>

											{/* Children Categories */}
											{expandedCategories.has(category.id) &&
												category.children && (
													<div className="ml-4 space-y-1">
														{category.children.map((child, childIndex) => (
															<div
																key={childIndex}
																className="flex items-center justify-between p-2 bg-white border rounded-md"
															>
																<div className="flex items-center gap-2">
																	<div className="w-6" />
																	<span className="text-sm text-gray-600">
																		{child.name}
																		<span className="text-xs text-gray-400 ml-1">
																			(Thể loại con)
																		</span>
																	</span>
																</div>
																<div className="flex items-center gap-4 text-sm">
																	<div className="text-center">
																		<div className="font-medium text-green-600">
																			{child.books}
																		</div>
																		<div className="text-xs text-gray-500">
																			Tổng
																		</div>
																	</div>
																	{child.directBooks > 0 && (
																		<div className="text-center">
																			<div className="font-medium text-blue-600">
																				{child.directBooks}
																			</div>
																			<div className="text-xs text-gray-500">
																				Trực tiếp
																			</div>
																		</div>
																	)}
																</div>
															</div>
														))}
													</div>
												)}
										</div>
									))}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Category Details Table */}
			<Card>
				<CardHeader>
					<CardTitle>Chi tiết theo thể loại (Phân cấp)</CardTitle>
					<CardDescription>
						Bảng chi tiết số lượng sách theo cấu trúc phân cấp thể loại. Click
						vào mũi tên để mở rộng/thu gọn các thể loại con.
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
								{bookStats.byHierarchicalCategory?.map((category) =>
									renderCategoryRow(category, 0)
								) || (
									<tr>
										<td colSpan={5} className="p-4 text-center text-gray-500">
											Chưa có dữ liệu thể loại phân cấp
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
