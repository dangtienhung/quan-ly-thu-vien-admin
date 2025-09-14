import { BorrowRecordsAPI } from '@/apis/borrow-records';
import type { BorrowRecordStatsDto } from '@/types/borrow-records.type';
import { useQuery } from '@tanstack/react-query';

export const useBorrowStats = () => {
	return useQuery<BorrowRecordStatsDto>({
		queryKey: ['borrow-stats'],
		queryFn: async () => {
			const data = await BorrowRecordsAPI.getStats();
			return data as unknown as BorrowRecordStatsDto;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};
