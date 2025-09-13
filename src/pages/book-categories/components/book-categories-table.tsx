import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	IconChevronDown,
	IconChevronRight,
	IconEdit,
	IconTrash,
} from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { BookCategory } from '@/types/book-categories';

interface BookCategoriesTableProps {
	categories: BookCategory[];
	onEdit: (category: BookCategory) => void;
	onDelete: (category: BookCategory) => void;
	searchQuery?: string;
}

export default function BookCategoriesTable({
	categories,
	onEdit,
	onDelete,
}: BookCategoriesTableProps) {
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
		new Set(categories.map((category) => category.id))
	);

	// Luôn expand tất cả categories khi data thay đổi
	useEffect(() => {
		setExpandedCategories(new Set(categories.map((category) => category.id)));
	}, [categories]);

	// Tách categories thành parent và children
	const parentCategories = categories.filter((category) => !category.parent);
	const childCategories = categories.filter((category) => category.parent);

	// Tạo map để tìm children của mỗi parent
	const childrenMap = new Map<string, BookCategory[]>();
	childCategories.forEach((child) => {
		if (child.parent) {
			const parentId = child.parent.id;
			if (!childrenMap.has(parentId)) {
				childrenMap.set(parentId, []);
			}
			childrenMap.get(parentId)!.push(child);
		}
	});

	const toggleExpanded = (categoryId: string) => {
		setExpandedCategories((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(categoryId)) {
				newSet.delete(categoryId);
			} else {
				newSet.add(categoryId);
			}
			return newSet;
		});
	};

	const renderCategoryRow = (
		category: BookCategory,
		level: number = 0
	): React.JSX.Element => {
		const isExpanded = expandedCategories.has(category.id);
		const hasChildren = childrenMap.has(category.id);
		const children = childrenMap.get(category.id) || [];

		return (
			<>
				<TableRow key={category.id}>
					<TableCell className="font-medium">
						<div
							className="flex items-center gap-2"
							style={{ paddingLeft: `${level * 20}px` }}
						>
							{hasChildren && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => toggleExpanded(category.id)}
									className="h-6 w-6 p-0"
								>
									{isExpanded ? (
										<IconChevronDown size={16} />
									) : (
										<IconChevronRight size={16} />
									)}
								</Button>
							)}
							{!hasChildren && <div className="w-6" />}
							<span>{category.name}</span>
						</div>
					</TableCell>
					<TableCell>
						{level === 0 ? 'Thể loại gốc' : category.parent?.name || '-'}
					</TableCell>
					<TableCell>
						<div className="flex gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onEdit(category)}
							>
								<IconEdit size={16} />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onDelete(category)}
							>
								<IconTrash size={16} />
							</Button>
						</div>
					</TableCell>
				</TableRow>
				{isExpanded &&
					children.map(
						(child): React.JSX.Element => renderCategoryRow(child, level + 1)
					)}
			</>
		);
	};

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Tên thể loại</TableHead>
					<TableHead>Thể loại cha</TableHead>
					<TableHead className="w-[140px]">Hành động</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{parentCategories.map(
					(category): React.JSX.Element => renderCategoryRow(category)
				)}
			</TableBody>
		</Table>
	);
}
