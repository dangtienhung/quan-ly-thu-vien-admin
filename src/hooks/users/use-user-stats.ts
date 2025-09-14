import { UsersAPI } from '@/apis/users';
import type { UserStatsDto } from '@/types/user.type';
import { useQuery } from '@tanstack/react-query';

export const useUserStats = () => {
	return useQuery<UserStatsDto>({
		queryKey: ['user-stats'],
		queryFn: () => UsersAPI.getUserStats(),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};
