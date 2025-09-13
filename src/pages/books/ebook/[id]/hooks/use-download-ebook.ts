import { useMutation, useQueryClient } from '@tanstack/react-query';

import { EBooksAPI } from '@/apis/ebooks';
import { UploadsAPI } from '@/apis/uploads';
import type { EBook } from '@/types';
import { toast } from 'sonner';

interface UseDownloadEBookProps {
	bookId: string;
}

export function useDownloadEBook({ bookId }: UseDownloadEBookProps) {
	const queryClient = useQueryClient();

	// Increment download mutation
	const incrementDownloadMutation = useMutation({
		mutationFn: (ebookId: string) => EBooksAPI.incrementDownloads(ebookId),
		onSuccess: () => {
			toast.success('Đã ghi nhận lượt tải!');
			queryClient.invalidateQueries({ queryKey: ['ebooks-book', bookId] });
		},
		onError: (error: any) => {
			toast.error(error.message || 'Có lỗi xảy ra');
		},
	});

	const downloadEBook = async (ebook: EBook) => {
		try {
			// Step 1: Extract slug from file_path
			const slug = ebook.file_path
				.replace('files/', '')
				.split('.')
				.slice(0, -1)
				.join('.');

			// Step 2: Call API to get upload info by slug
			const uploadInfo = await UploadsAPI.getBySlug(slug);

			// Step 3: Download file using the ID
			const blob = await UploadsAPI.downloadById(uploadInfo.id);

			// Step 4: Create download link and trigger download
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download =
				uploadInfo.originalName || `ebook.${ebook.file_format.toLowerCase()}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			// Step 5: Update download count
			incrementDownloadMutation.mutate(ebook.id);

			toast.success('Tải xuống thành công!');
		} catch (error: any) {
			console.error('Download error:', error);
			toast.error(error.message || 'Có lỗi xảy ra khi tải xuống file');
		}
	};

	return {
		downloadEBook,
		isDownloading: incrementDownloadMutation.isPending,
	};
}
