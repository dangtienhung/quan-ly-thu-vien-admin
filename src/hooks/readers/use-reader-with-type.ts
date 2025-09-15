import { ReaderTypesAPI } from '@/apis/reader-types';
import { ReadersAPI } from '@/apis/readers';
import type { ReaderTypeConfig } from '@/types/reader-types';
import type { Reader } from '@/types/readers';
import { useQuery } from '@tanstack/react-query';

interface ReaderWithType extends Reader {
	readerTypeDetails?: ReaderTypeConfig;
}

interface UseReaderWithTypeOptions {
	enabled?: boolean;
}

export const useReaderWithType = (
	readerId: string,
	options: UseReaderWithTypeOptions = {}
) => {
	const { enabled = true } = options;

	const readerQuery = useQuery({
		queryKey: ['reader', readerId],
		queryFn: () => ReadersAPI.getById(readerId),
		enabled: enabled && !!readerId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});

	const readerTypeQuery = useQuery({
		queryKey: ['reader-type', readerQuery.data?.readerTypeId],
		queryFn: () => ReaderTypesAPI.getById(readerQuery.data?.readerTypeId || ''),
		enabled: enabled && !!readerQuery.data?.readerTypeId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});

	const readerWithType: ReaderWithType | undefined = readerQuery.data
		? {
				...readerQuery.data,
				readerTypeDetails: readerTypeQuery.data,
		  }
		: undefined;

	return {
		reader: readerWithType,
		isLoading: readerQuery.isPending || readerTypeQuery.isPending,
		isError: readerQuery.isError || readerTypeQuery.isError,
		error: readerQuery.error || readerTypeQuery.error,
		refetch: () => {
			readerQuery.refetch();
			readerTypeQuery.refetch();
		},
	};
};
