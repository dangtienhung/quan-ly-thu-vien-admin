import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const useDashboardTabs = () => {
	const [queryParams] = useSearchParams();
	const navigate = useNavigate();

	const tab = queryParams.get('tab');

	// State cho tab
	const [activeTab, setActiveTab] = useState(tab || 'overview');
	const [isInitialLoad, setIsInitialLoad] = useState(true);

	// Đồng bộ activeTab với URL params khi component mount
	useEffect(() => {
		setActiveTab(tab || 'overview');
		setIsInitialLoad(false);
	}, [tab]);

	// Cập nhật URL khi activeTab thay đổi
	useEffect(() => {
		if (!isInitialLoad) {
			const searchParams = new URLSearchParams();
			searchParams.set('tab', activeTab);
			navigate(`?${searchParams.toString()}`, { replace: true });
		}
	}, [activeTab, navigate, isInitialLoad]);

	// Hàm xử lý khi tab thay đổi
	const handleTabChange = (value: string) => {
		setActiveTab(value);
	};

	return {
		// State
		activeTab,

		// Handlers
		handleTabChange,
	};
};
