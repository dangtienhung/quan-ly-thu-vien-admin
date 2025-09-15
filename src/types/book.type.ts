export interface MainCategoryStatisticsDto {
	mainCategoryId: string;
	mainCategoryName: string;
	bookCount: number;
	physicalBookCount: number;
	ebookCount: number;
	percentage: number;
}

export interface HierarchicalCategoryStatisticsDto {
	categoryId: string;
	categoryName: string;
	slug: string;
	description?: string;
	parentId?: string | null;
	parentName?: string | null;
	bookCount: number;
	physicalBookCount: number;
	ebookCount: number;
	percentage: number;
	expandable: boolean;
	expanded: boolean;
	children?: HierarchicalCategoryStatisticsDto[];
	level: number;
	isMainCategory: boolean;
	directBookCount: number;
	directPhysicalBookCount: number;
	directEbookCount: number;
}

export interface BookStatisticsDto {
	totalBooks: number;
	totalPhysicalBooks: number;
	totalEbooks: number;
	byMainCategory: MainCategoryStatisticsDto[];
	byHierarchicalCategory?: HierarchicalCategoryStatisticsDto[];
	byType: {
		physical: number;
		ebook: number;
	};
	totalMainCategories?: number;
	totalSubCategories?: number;
}
