export interface FinesStatsDto {
	total: number;
	unpaid: number;
	paid: number;
	partially_paid: number;
	waived: number;
	totalAmount: number;
	totalPaid: number;
	totalUnpaid: number;
	byType: { type: string; count: number; amount: number }[];
	byMonth: { month: string; count: number; amount: number }[];
}
