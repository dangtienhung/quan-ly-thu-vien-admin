import { BorrowRecordsAPI } from '@/apis/borrow-records';
import type { OverdueStatsDto } from '@/types/borrow-records.type';
import { useQuery } from '@tanstack/react-query';

export const useOverdueStats = () => {
	return useQuery<OverdueStatsDto>({
		queryKey: ['overdue-stats'],
		queryFn: async () => {
			const data = await BorrowRecordsAPI.getOverdueStats();
			return data as unknown as OverdueStatsDto;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};
