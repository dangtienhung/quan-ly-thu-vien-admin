export interface BorrowRecordStatsDto {
	total: number;
	byStatus: { status: string; count: number }[];
	borrowed: number;
	returned: number;
	overdue: number;
	renewed: number;
	activeLoans: number;
	overdueLoans: number;
	byMonth: { month: string; count: number }[];
	byReaderType: { readerType: string; count: number }[];
	byBookCategory: { category: string; count: number }[];
}

export interface OverdueStatsDto {
	totalOverdue: number;
	byStatus: { status: string; count: number }[];
	byDaysOverdue: { daysOverdue: number; count: number }[];
	byReaderType: { readerType: string; count: number }[];
}
