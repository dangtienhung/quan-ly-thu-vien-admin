export interface MainCategoryStatisticsDto {
	mainCategoryId: string;
	mainCategoryName: string;
	bookCount: number;
	physicalBookCount: number;
	ebookCount: number;
	percentage: number;
}

export interface BookStatisticsDto {
	totalBooks: number;
	totalPhysicalBooks: number;
	totalEbooks: number;
	byMainCategory: MainCategoryStatisticsDto[];
	byType: {
		physical: number;
		ebook: number;
	};
}
