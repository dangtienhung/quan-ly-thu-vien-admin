import { ReservationsAPI } from '@/apis/reservations';
import type { ReservationStatsDto } from '@/types/reservations.type';
import { useQuery } from '@tanstack/react-query';

export const useReservationStats = () => {
	return useQuery<ReservationStatsDto>({
		queryKey: ['reservation-stats'],
		queryFn: async () => {
			const data = await ReservationsAPI.getStats();
			return data as unknown as ReservationStatsDto;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};
