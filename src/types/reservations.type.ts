export interface ReservationStatsDto {
	total: number;
	pending: number;
	fulfilled: number;
	cancelled: number;
	expired: number;
	byStatus: { status: string; count: number }[];
	byMonth: { month: string; count: number }[];
	expiringSoon: number;
}
