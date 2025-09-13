import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const SearchBar: React.FC = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

	// Update search query when URL changes
	useEffect(() => {
		setSearchQuery(searchParams.get('q') || '');
	}, [searchParams]);

	const handleSearch = () => {
		const currentParams = new URLSearchParams(searchParams);

		if (searchQuery.trim()) {
			currentParams.set('q', searchQuery.trim());
		} else {
			currentParams.delete('q');
		}

		// Reset to page 1 when searching
		currentParams.set('page', '1');

		navigate({
			pathname: '/borrow-records',
			search: currentParams.toString(),
		});
	};

	const handleClearSearch = () => {
		setSearchQuery('');
		const currentParams = new URLSearchParams(searchParams);
		currentParams.delete('q');
		currentParams.set('page', '1');

		navigate({
			pathname: '/borrow-records',
			search: currentParams.toString(),
		});
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	};

	return (
		<div className="flex gap-2">
			<div className="relative flex-1">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
				<Input
					placeholder="Tìm kiếm theo tên sách hoặc tên người dùng..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onKeyPress={handleKeyPress}
					className="pl-10 pr-10"
				/>
				{searchQuery && (
					<Button
						variant="ghost"
						size="sm"
						onClick={handleClearSearch}
						className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>
			<Button onClick={handleSearch} variant="default">
				<Search className="mr-2 h-4 w-4" />
				Tìm kiếm
			</Button>
		</div>
	);
};
