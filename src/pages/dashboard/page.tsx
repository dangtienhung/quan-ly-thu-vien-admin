import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Button } from '@/components/ui/button';
import { useDashboardTabs } from '@/hooks/dashboard/use-dashboard-tabs';
import { useDownloadStats } from '@/hooks/dashboard/use-download-stats';
import { useState } from 'react';
import { BookStats } from './components/book-stats';
import { BorrowAnalytics } from './components/borrow-analytics';
import { DownloadConfirmDialog } from './components/download-confirm-dialog';
import { UserStats } from './components/user-stats';

export default function Dashboard() {
	const { activeTab, handleTabChange } = useDashboardTabs();
	const { isDownloading, downloadStats } = useDownloadStats();
	const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);

	const handleDownloadClick = () => {
		setIsDownloadDialogOpen(true);
	};

	const handleConfirmDownload = async () => {
		await downloadStats(activeTab);
		setIsDownloadDialogOpen(false);
	};

	return (
		<>
			{/* ===== Main ===== */}
			<div className="mb-2 flex items-center justify-between space-y-2">
				<h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
				<div className="flex items-center space-x-2">
					<Button onClick={handleDownloadClick} disabled={isDownloading}>
						{isDownloading ? 'Đang tạo file...' : 'Tải báo cáo'}
					</Button>
				</div>
			</div>
			<Tabs
				orientation="vertical"
				value={activeTab}
				onValueChange={handleTabChange}
				className="space-y-4"
			>
				<div className="w-full overflow-x-auto pb-2">
					<TabsList>
						<TabsTrigger value="analytics">Thống kê mượn trả</TabsTrigger>
						<TabsTrigger value="books-stats">Thống kê sách</TabsTrigger>
						<TabsTrigger value="users-stats">Người dùng</TabsTrigger>
					</TabsList>
				</div>
				<TabsContent value="analytics" className="space-y-4">
					<BorrowAnalytics />
				</TabsContent>
				<TabsContent value="books-stats" className="space-y-4">
					<BookStats />
				</TabsContent>
				<TabsContent value="users-stats" className="space-y-4">
					<UserStats />
				</TabsContent>
			</Tabs>

			<DownloadConfirmDialog
				open={isDownloadDialogOpen}
				onOpenChange={setIsDownloadDialogOpen}
				onConfirm={handleConfirmDownload}
				tabType={activeTab}
				isLoading={isDownloading}
			/>
		</>
	);
}
