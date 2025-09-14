import { BooksAPI } from '@/apis/books';
import type { BookStatisticsDto } from '@/types/book.type';
import { useQuery } from '@tanstack/react-query';

export const useBookStats = () => {
	return useQuery<BookStatisticsDto>({
		queryKey: ['book-stats'],
		queryFn: () => BooksAPI.getStatistics(),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};
