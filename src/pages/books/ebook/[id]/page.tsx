import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	BookInfoCard,
	CreateEBookDialog,
	DeleteEBookConfirmDialog,
	DownloadConfirmDialog,
	EBookDetailHeader,
	EBookListCard,
	EditEBookDialog,
} from '@/pages/books/ebook/[id]/components';
import type { CreateEBookRequest, EBook } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { BooksAPI } from '@/apis/books';
import { EBooksAPI } from '@/apis/ebooks';
import { Skeleton } from '@/components/ui/skeleton';
import { useDownloadEBook } from '@/pages/books/ebook/[id]/hooks/use-download-ebook';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

const EBookDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const queryClient = useQueryClient();
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedEbook, setSelectedEbook] = useState<EBook | null>(null);

	// Custom hook for download functionality
	const { downloadEBook } = useDownloadEBook({ bookId: id! });

	// Fetch book details
	const {
		data: book,
		isLoading: isLoadingBook,
		error: bookError,
	} = useQuery({
		queryKey: ['book', id],
		queryFn: () => BooksAPI.getById(id!),
		enabled: !!id,
	});

	// Fetch ebooks for this book
	const {
		data: ebooksData,
		isLoading: isLoadingEbooks,
		error: ebooksError,
	} = useQuery({
		queryKey: ['ebooks-book', id],
		queryFn: () => EBooksAPI.getByBook(id!),
		enabled: !!id,
	});

	// Create ebook mutation
	const createEBookMutation = useMutation({
		mutationFn: (data: CreateEBookRequest) => EBooksAPI.create(data),
		onSuccess: () => {
			toast.success('Tạo ebook thành công!');
			queryClient.invalidateQueries({ queryKey: ['ebooks-book', id] });
			setShowCreateDialog(false);
		},
		onError: (error: any) => {
			toast.error(error.message || 'Có lỗi xảy ra khi tạo ebook');
		},
	});

	// Update ebook mutation
	const updateEBookMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: any }) =>
			EBooksAPI.update(id, data),
		onSuccess: () => {
			toast.success('Cập nhật ebook thành công!');
			queryClient.invalidateQueries({ queryKey: ['ebooks-book', id] });
			setEditDialogOpen(false);
			setSelectedEbook(null);
		},
		onError: (error: any) => {
			toast.error(error.message || 'Có lỗi xảy ra khi cập nhật ebook');
		},
	});

	// Delete ebook mutation
	const deleteEBookMutation = useMutation({
		mutationFn: (ebookId: string) => EBooksAPI.delete(ebookId),
		onSuccess: () => {
			toast.success('Xóa ebook thành công!');
			queryClient.invalidateQueries({ queryKey: ['ebooks-book', id] });
			setDeleteDialogOpen(false);
			setSelectedEbook(null);
		},
		onError: (error: any) => {
			toast.error(error.message || 'Có lỗi xảy ra khi xóa ebook');
		},
	});

	const handleCreateEBook = async (data: CreateEBookRequest) => {
		createEBookMutation.mutate(data);
	};

	const handleEditEBook = (ebook: EBook) => {
		setSelectedEbook(ebook);
		setEditDialogOpen(true);
	};

	const handleUpdateEBook = async (data: any) => {
		if (selectedEbook) {
			updateEBookMutation.mutate({ id: selectedEbook.id, data });
		}
	};

	const handlePreviewEBook = async (ebook: EBook) => {
		try {
			await downloadEBook(ebook);
		} catch (error) {
			// Error handling is done in the downloadEBook function
		}
	};

	const handleDeleteEBook = (ebook: EBook) => {
		setSelectedEbook(ebook);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDeleteEBook = () => {
		if (selectedEbook) {
			deleteEBookMutation.mutate(selectedEbook.id);
		}
	};

	const handleCancelDeleteEBook = () => {
		setDeleteDialogOpen(false);
		setSelectedEbook(null);
	};

	const handleDownloadClick = (ebook: EBook) => {
		setSelectedEbook(ebook);
		setDownloadDialogOpen(true);
	};

	const handleConfirmDownload = async () => {
		if (selectedEbook) {
			await downloadEBook(selectedEbook);
		}
		setDownloadDialogOpen(false);
		setSelectedEbook(null);
	};

	const handleCancelDownload = () => {
		setDownloadDialogOpen(false);
		setSelectedEbook(null);
	};

	const handleCreateNew = () => {
		setShowCreateDialog(true);
	};

	if (isLoadingBook || isLoadingEbooks) {
		return (
			<div className="container mx-auto p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (bookError || ebooksError) {
		return (
			<div className="container mx-auto p-6">
				<Alert variant="destructive">
					<AlertDescription>
						{(bookError || ebooksError)?.message ||
							'Có lỗi xảy ra khi tải dữ liệu'}
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	const ebooks = ebooksData?.data || [];

	return (
		<div className="space-y-6">
			{/* Header */}
			<EBookDetailHeader />

			{/* Book Information */}
			<BookInfoCard book={book} />

			{/* EBooks Section */}
			<EBookListCard
				ebooks={ebooks}
				onCreateNew={handleCreateNew}
				onDownload={handleDownloadClick}
				onEdit={handleEditEBook}
				onDelete={handleDeleteEBook}
			/>

			{/* Create EBook Dialog */}
			<CreateEBookDialog
				open={showCreateDialog}
				onOpenChange={setShowCreateDialog}
				bookId={id!}
				bookTitle={book?.title}
				onSubmit={handleCreateEBook}
				isLoading={createEBookMutation.isPending}
			/>

			{/* Download Confirmation Dialog */}
			<DownloadConfirmDialog
				open={downloadDialogOpen}
				onOpenChange={setDownloadDialogOpen}
				ebook={selectedEbook}
				bookTitle={book?.title}
				onConfirm={handleConfirmDownload}
				onCancel={handleCancelDownload}
			/>

			{/* Edit EBook Dialog */}
			<EditEBookDialog
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				ebook={selectedEbook}
				onSubmit={handleUpdateEBook}
				onPreview={handlePreviewEBook}
				isLoading={updateEBookMutation.isPending}
			/>

			{/* Delete EBook Confirm Dialog */}
			<DeleteEBookConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				ebook={selectedEbook}
				onConfirm={handleConfirmDeleteEBook}
				onCancel={handleCancelDeleteEBook}
				isLoading={deleteEBookMutation.isPending}
			/>
		</div>
	);
};

export default EBookDetailPage;
