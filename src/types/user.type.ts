import type { PaginationQuery } from './common';

export type UserRole = 'admin' | 'reader';

export type PaginationUserQuery = PaginationQuery & {
	type?: UserRole;
	search?: string;
};

export type User = {
	id: string;
	userCode: string;
	username: string;
	email: string;
	role: UserRole;
	accountStatus: 'active' | 'inactive' | 'banned';
	lastLogin?: string;
	createdAt: string;
	updatedAt: string;
};

export type CreateUserRequest = {
	userCode: string;
	username: string;
	password: string;
	email: string;
	role: UserRole;
	accountStatus: 'active' | 'inactive' | 'banned';
};

export type UpdateUserRequest = {
	userCode: string;
	username: string;
	email: string;
	role: UserRole;
	accountStatus: 'active' | 'inactive' | 'banned';
};

export type UserStatsDto = {
	totalUsers: number;
	usersByRole: {
		admin: number;
		reader: number;
	};
	usersByStatus: {
		active: number;
		suspended: number;
		banned: number;
	};
	newUsersLast30Days: number;
	activeUsersLast7Days?: number;
	neverLoggedInUsers: number;
	monthlyStats: {
		month: string;
		count: number;
	}[];
	generatedAt: string;
};
