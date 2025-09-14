import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Calendar, Download, Edit, FileText, Plus, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { EBook } from '@/types';

interface EBookListCardProps {
	ebooks: EBook[];
	onCreateNew: () => void;
	onDownload: (ebook: EBook) => void;
	onEdit: (ebook: EBook) => void;
	onDelete: (ebook: EBook) => void;
}

export function EBookListCard({
	ebooks,
	onCreateNew,
	onDownload,
	onEdit,
	onDelete,
}: EBookListCardProps) {
	const hasEbooks = ebooks.length > 0;

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const getFormatColor = (format: string) => {
		const colors: Record<string, string> = {
			PDF: 'bg-red-100 text-red-800',
			EPUB: 'bg-blue-100 text-blue-800',
			MOBI: 'bg-green-100 text-green-800',
			AZW: 'bg-purple-100 text-purple-800',
			TXT: 'bg-gray-100 text-gray-800',
			DOCX: 'bg-orange-100 text-orange-800',
		};
		return colors[format] || 'bg-gray-100 text-gray-800';
	};

	// Handle download click - now just calls the parent callback
	const handleDownload = (ebook: EBook) => {
		onDownload(ebook);
	};

	// Handle edit click
	const handleEdit = (ebook: EBook) => {
		onEdit(ebook);
	};

	// Handle delete click
	const handleDelete = (ebook: EBook) => {
		onDelete(ebook);
	};

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<Download className="h-5 w-5" />
							<span>Danh sách EBook ({ebooks.length})</span>
						</div>
						{/* <Button onClick={onCreateNew}>
							<Plus className="mr-2 h-4 w-4" />
							Tạo EBook mới
						</Button> */}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{!hasEbooks ? (
						<div className="text-center py-8">
							<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">Chưa có ebook nào</h3>
							<p className="text-muted-foreground mb-4">
								Sách này chưa có phiên bản ebook. Hãy tạo ebook đầu tiên.
							</p>
							<Button onClick={onCreateNew}>
								<Plus className="mr-2 h-4 w-4" />
								Tạo EBook mới
							</Button>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Định dạng</TableHead>
									<TableHead>Kích thước</TableHead>
									<TableHead>Lượt tải</TableHead>
									<TableHead>Ngày tạo</TableHead>
									<TableHead className="w-[140px]">Hành động</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{ebooks.map((ebook) => (
									<TableRow key={ebook.id}>
										<TableCell>
											<Badge className={getFormatColor(ebook.file_format)}>
												{ebook.file_format}
											</Badge>
										</TableCell>
										<TableCell className="font-medium">
											{formatFileSize(ebook.file_size)}
										</TableCell>
										<TableCell>
											<div className="flex items-center">
												<Download className="mr-1 h-3 w-3" />
												{ebook.download_count}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center">
												<Calendar className="mr-1 h-3 w-3" />
												{new Date(ebook.created_at).toLocaleDateString('vi-VN')}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center space-x-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleEdit(ebook)}
													title="Chỉnh sửa ebook"
												>
													<Edit className="mr-1 h-3 w-3" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDownload(ebook)}
													title="Tải xuống ebook"
												>
													<Download className="mr-1 h-3 w-3" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDelete(ebook)}
													title="Xóa ebook"
													className="text-red-600 hover:text-red-700 hover:bg-red-50"
												>
													<Trash2 className="mr-1 h-3 w-3" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</>
	);
}
