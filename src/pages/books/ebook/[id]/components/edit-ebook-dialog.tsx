import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { EBook, Upload } from '@/types';
import { Download, FileText, Upload as UploadIcon, X } from 'lucide-react';
import React, { useState } from 'react';

import { UploadsAPI } from '@/apis/uploads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface EditEBookDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	ebook: EBook | null;
	onSubmit: (data: any) => void;
	onPreview: (ebook: EBook) => void;
	isLoading?: boolean;
}

export function EditEBookDialog({
	open,
	onOpenChange,
	ebook,
	onSubmit,
	onPreview,
	isLoading = false,
}: EditEBookDialogProps) {
	const [formData, setFormData] = useState({
		file_path: ebook?.file_path || '',
		file_size: ebook?.file_size || 0,
		file_format: ebook?.file_format || 'PDF',
	});
	const [uploadedFile, setUploadedFile] = useState<Upload | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	// Reset form when ebook changes
	React.useEffect(() => {
		if (ebook) {
			setFormData({
				file_path: ebook.file_path,
				file_size: ebook.file_size,
				file_format: ebook.file_format,
			});
			setUploadedFile(null);
			setSelectedFile(null);
		}
	}, [ebook]);

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			// Auto-detect format from file extension
			const extension = file.name.split('.').pop()?.toUpperCase();
			if (extension) {
				setFormData((prev) => ({
					...prev,
					file_format:
						extension === 'PDF'
							? 'PDF'
							: extension === 'EPUB'
							? 'EPUB'
							: extension === 'MOBI'
							? 'MOBI'
							: extension === 'AZW'
							? 'AZW'
							: extension === 'TXT'
							? 'TXT'
							: extension === 'DOCX'
							? 'DOCX'
							: 'PDF',
				}));
			}
		}
	};

	const handleUpload = async () => {
		if (!selectedFile) {
			toast.error('Vui lòng chọn file để upload');
			return;
		}

		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append('file', selectedFile);

			const uploadResult = await UploadsAPI.upload(formData);
			setUploadedFile(uploadResult);

			// Update form data with uploaded file info
			setFormData((prev) => ({
				...prev,
				file_path: uploadResult.filePath,
				file_size: uploadResult.fileSize,
			}));

			toast.success('Upload file thành công!');
		} catch (error: any) {
			toast.error(error.message || 'Có lỗi xảy ra khi upload file');
		} finally {
			setIsUploading(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// If no new file uploaded, use existing file data
		const submitData = uploadedFile
			? {
					...formData,
			  }
			: {
					file_format: formData.file_format,
			  };

		onSubmit(submitData);
	};

	const handleInputChange = (field: string, value: string | number) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handlePreview = () => {
		if (ebook) {
			onPreview(ebook);
		}
	};

	const resetForm = () => {
		if (ebook) {
			setFormData({
				file_path: ebook.file_path,
				file_size: ebook.file_size,
				file_format: ebook.file_format,
			});
		}
		setUploadedFile(null);
		setSelectedFile(null);
	};

	const handleCancel = () => {
		resetForm();
		onOpenChange(false);
	};

	const removeSelectedFile = () => {
		setSelectedFile(null);
		setUploadedFile(null);
		setFormData((prev) => ({
			...prev,
			file_path: ebook?.file_path || '',
			file_size: ebook?.file_size || 0,
		}));
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Chỉnh sửa EBook</DialogTitle>
					<DialogDescription>
						Cập nhật thông tin ebook. Bạn có thể upload file mới hoặc giữ nguyên
						file hiện tại.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Current File Info */}
					{ebook && (
						<div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<FileText className="h-4 w-4 text-blue-500" />
									<span className="font-medium text-blue-700">
										File hiện tại
									</span>
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handlePreview}
									disabled={isLoading}
								>
									<Download className="mr-1 h-3 w-3" />
									Preview
								</Button>
							</div>
							<div className="text-sm text-blue-600 mt-1 space-y-1">
								<p>Đường dẫn: {ebook.file_path}</p>
								<p>Kích thước: {formatFileSize(ebook.file_size)}</p>
								<p>Định dạng: {ebook.file_format}</p>
							</div>
						</div>
					)}

					{/* File Upload Section */}
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="file_upload">Upload file mới (tùy chọn)</Label>
							<div className="flex items-center space-x-2">
								<Input
									id="file_upload"
									type="file"
									accept=".pdf,.epub,.mobi,.azw,.txt,.docx"
									onChange={handleFileSelect}
									disabled={isUploading || isLoading}
								/>
								{selectedFile && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={removeSelectedFile}
										disabled={isUploading || isLoading}
									>
										<X className="h-4 w-4" />
									</Button>
								)}
							</div>
						</div>

						{/* Selected File Info */}
						{selectedFile && (
							<div className="p-3 border rounded-lg bg-gray-50">
								<div className="flex items-center space-x-2">
									<FileText className="h-4 w-4 text-blue-500" />
									<span className="font-medium">{selectedFile.name}</span>
								</div>
								<p className="text-sm text-gray-600 mt-1">
									Kích thước: {formatFileSize(selectedFile.size)}
								</p>
								{!uploadedFile && (
									<Button
										type="button"
										onClick={handleUpload}
										disabled={isUploading || isLoading}
										className="mt-2"
									>
										{isUploading ? (
											<>Đang upload...</>
										) : (
											<>
												<UploadIcon className="mr-2 h-4 w-4" />
												Upload File
											</>
										)}
									</Button>
								)}
							</div>
						)}

						{/* Uploaded File Info */}
						{uploadedFile && (
							<div className="p-3 border rounded-lg bg-green-50 border-green-200">
								<div className="flex items-center space-x-2">
									<FileText className="h-4 w-4 text-green-500" />
									<span className="font-medium text-green-700">
										✓ File mới đã upload thành công
									</span>
								</div>
								<div className="text-sm text-green-600 mt-1 space-y-1">
									<p>Tên file: {uploadedFile.originalName}</p>
									<p>Đường dẫn: {uploadedFile.filePath}</p>
									<p>Kích thước: {formatFileSize(uploadedFile.fileSize)}</p>
									<p>Định dạng: {uploadedFile.mimeType}</p>
								</div>
							</div>
						)}
					</div>

					{/* Format Selection */}
					<div className="space-y-2">
						<Label htmlFor="file_format">Định dạng</Label>
						<Select
							value={formData.file_format}
							onValueChange={(value) => handleInputChange('file_format', value)}
							disabled={isUploading || isLoading}
						>
							<SelectTrigger>
								<SelectValue placeholder="Chọn định dạng" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="PDF">PDF</SelectItem>
								<SelectItem value="EPUB">EPUB</SelectItem>
								<SelectItem value="MOBI">MOBI</SelectItem>
								<SelectItem value="AZW">AZW</SelectItem>
								<SelectItem value="TXT">TXT</SelectItem>
								<SelectItem value="DOCX">DOCX</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex justify-end space-x-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={handleCancel}
							disabled={isUploading || isLoading}
						>
							Hủy
						</Button>
						<Button type="submit" disabled={isUploading || isLoading}>
							{isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
