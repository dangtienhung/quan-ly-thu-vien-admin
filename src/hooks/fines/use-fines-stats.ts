import { FinesAPI } from '@/apis/fines';
import type { FinesStatsDto } from '@/types/fines.type';
import { useQuery } from '@tanstack/react-query';

export const useFinesStats = () => {
	return useQuery<FinesStatsDto>({
		queryKey: ['fines-stats'],
		queryFn: async () => {
			const data = await FinesAPI.getStats();
			return data as unknown as FinesStatsDto;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};
