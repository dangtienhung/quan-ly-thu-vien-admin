import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { FineStatus, FineType } from '@/types/fines';
import { Check, ChevronsUpDown } from 'lucide-react';
import React, { useState } from 'react';

import { BorrowRecordsAPI } from '@/apis/borrow-records';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateFine } from '@/hooks/fines/use-create-fine';
import { useReaders } from '@/hooks/readers/use-readers';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface CreateFineDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

export function CreateFineDialog({
	open,
	onOpenChange,
	onSuccess,
}: CreateFineDialogProps) {
	const [formData, setFormData] = useState({
		borrow_id: '',
		fine_amount: '',
		reason: '',
		description: '',
		reader_id: '',
	});

	const [readerSearchOpen, setReaderSearchOpen] = useState(false);
	const [selectedReader, setSelectedReader] = useState<{
		id: string;
		fullName: string;
	} | null>(null);

	const [borrowRecordSearchOpen, setBorrowRecordSearchOpen] = useState(false);
	const [selectedBorrowRecord, setSelectedBorrowRecord] = useState<{
		id: string;
		bookTitle: string;
		dueDate: string;
	} | null>(null);

	// Fetch readers data
	const { readers, isLoading: isLoadingReaders } = useReaders({
		params: { limit: 100 }, // Lấy nhiều readers để search
		enabled: open, // Chỉ fetch khi dialog mở
	});

	// Fetch borrow records with overdue status
	const { data: borrowRecordsData, isLoading: isLoadingBorrowRecords } =
		useQuery({
			queryKey: ['borrow-records', 'by-status', 'overdue'],
			queryFn: () =>
				BorrowRecordsAPI.getByStatus({
					status: 'overdue',
					limit: 100,
				}),
			enabled: open,
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes
		});

	// Filter borrow records by selected reader
	const overdueBorrowRecords =
		borrowRecordsData?.data?.filter((record) =>
			selectedReader ? record.reader_id === selectedReader.id : true
		) || [];

	// Sử dụng TanStack Query hook
	const { createFine, isCreating } = useCreateFine({
		onSuccess: () => {
			// Reset form sau khi tạo thành công
			setFormData({
				borrow_id: '',
				fine_amount: '',
				reason: '',
				description: '',
				reader_id: '',
			});
			setSelectedReader(null);
			setSelectedBorrowRecord(null);
			onSuccess();
			onOpenChange(false);
		},
	});

	// Handler cho việc chọn reader
	const handleReaderSelect = (reader: { id: string; fullName: string }) => {
		setSelectedReader(reader);
		setFormData((prev) => ({ ...prev, reader_id: reader.id }));
		setSelectedBorrowRecord(null); // Reset borrow record khi chọn reader mới
		setFormData((prev) => ({ ...prev, borrow_id: '' })); // Reset borrow_id
		setReaderSearchOpen(false);
	};

	// Handler cho việc chọn borrow record
	const handleBorrowRecordSelect = (borrowRecord: {
		id: string;
		bookTitle: string;
		dueDate: string;
	}) => {
		setSelectedBorrowRecord(borrowRecord);
		setFormData((prev) => ({ ...prev, borrow_id: borrowRecord.id }));
		setBorrowRecordSearchOpen(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (
			!formData.reader_id ||
			!formData.borrow_id ||
			!formData.fine_amount ||
			!formData.reason
		) {
			return; // Validation sẽ được xử lý bởi hook
		}

		// Map reason từ UI sang FineType enum
		const getFineType = (reason: string): FineType => {
			switch (reason) {
				case 'Trả sách muộn':
					return FineType.OVERDUE;
				case 'Sách bị hư hỏng':
					return FineType.DAMAGE;
				case 'Sách bị mất':
					return FineType.LOST;
				case 'Vi phạm quy định':
				case 'Khác':
					return FineType.ADMINISTRATIVE;
				default:
					return FineType.OVERDUE;
			}
		};

		const fineData = {
			reader_id: formData.reader_id,
			borrow_id: formData.borrow_id,
			fine_amount: parseFloat(formData.fine_amount),
			fine_date: new Date().toISOString(),
			reason: getFineType(formData.reason),
			description: formData.description || formData.reason,
			status: FineStatus.UNPAID,
		};

		createFine(fineData);
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Tạo phạt mới</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="reader">Độc giả</Label>
						<Popover open={readerSearchOpen} onOpenChange={setReaderSearchOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={readerSearchOpen}
									className="w-full justify-between"
									disabled={isLoadingReaders}
								>
									{selectedReader ? selectedReader.fullName : 'Chọn độc giả...'}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-full p-0" align="start">
								<Command>
									<CommandInput placeholder="Tìm kiếm độc giả..." />
									<CommandList>
										<CommandEmpty>Không tìm thấy độc giả.</CommandEmpty>
										<CommandGroup>
											{readers?.map((reader) => (
												<CommandItem
													key={reader.id}
													value={reader.fullName}
													onSelect={() =>
														handleReaderSelect({
															id: reader.id,
															fullName: reader.fullName,
														})
													}
												>
													<Check
														className={cn(
															'mr-2 h-4 w-4',
															selectedReader?.id === reader.id
																? 'opacity-100'
																: 'opacity-0'
														)}
													/>
													{reader.fullName}
													{reader.phone && (
														<span className="ml-2 text-sm text-muted-foreground">
															({reader.phone})
														</span>
													)}
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					</div>

					<div className="space-y-2">
						<Label htmlFor="borrow_record">Lần mượn quá hạn</Label>
						<Popover
							open={borrowRecordSearchOpen}
							onOpenChange={setBorrowRecordSearchOpen}
						>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={borrowRecordSearchOpen}
									className="w-full justify-between"
									disabled={!selectedReader || isLoadingBorrowRecords}
								>
									{selectedBorrowRecord
										? `${selectedBorrowRecord.bookTitle} (Hạn: ${new Date(
												selectedBorrowRecord.dueDate
										  ).toLocaleDateString('vi-VN')})`
										: selectedReader
										? 'Chọn lần mượn quá hạn...'
										: 'Vui lòng chọn độc giả trước'}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-full p-0" align="start">
								<Command>
									<CommandInput placeholder="Tìm kiếm lần mượn..." />
									<CommandList>
										<CommandEmpty>
											{!selectedReader
												? 'Vui lòng chọn độc giả trước'
												: isLoadingBorrowRecords
												? 'Đang tải...'
												: 'Không có lần mượn quá hạn nào.'}
										</CommandEmpty>
										<CommandGroup>
											{overdueBorrowRecords?.map((record) => (
												<CommandItem
													key={record.id}
													value={`${
														record.physicalCopy?.book?.title ||
														'Không có tiêu đề'
													} - ${record.due_date}`}
													onSelect={() =>
														handleBorrowRecordSelect({
															id: record.id,
															bookTitle:
																record.physicalCopy?.book?.title ||
																'Không có tiêu đề',
															dueDate: record.due_date,
														})
													}
												>
													<Check
														className={cn(
															'mr-2 h-4 w-4',
															selectedBorrowRecord?.id === record.id
																? 'opacity-100'
																: 'opacity-0'
														)}
													/>
													<div className="flex flex-col">
														<span className="font-medium">
															{record.physicalCopy?.book?.title ||
																'Không có tiêu đề'}
														</span>
														<span className="text-sm text-muted-foreground">
															Hạn trả:{' '}
															{new Date(record.due_date).toLocaleDateString(
																'vi-VN'
															)}
														</span>
														<span className="text-xs text-red-600">
															Quá hạn{' '}
															{Math.ceil(
																(new Date().getTime() -
																	new Date(record.due_date).getTime()) /
																	(1000 * 60 * 60 * 24)
															)}{' '}
															ngày
														</span>
													</div>
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					</div>

					<div className="space-y-2">
						<Label htmlFor="fine_amount">Số tiền phạt (VNĐ)</Label>
						<Input
							id="fine_amount"
							type="number"
							value={formData.fine_amount}
							onChange={(e) => handleInputChange('fine_amount', e.target.value)}
							placeholder="Nhập số tiền phạt"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="reason">Lý do phạt</Label>
						<Select
							value={formData.reason}
							onValueChange={(value) => handleInputChange('reason', value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Chọn lý do phạt" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Trả sách muộn">Trả sách muộn</SelectItem>
								<SelectItem value="Sách bị hư hỏng">Sách bị hư hỏng</SelectItem>
								<SelectItem value="Sách bị mất">Sách bị mất</SelectItem>
								<SelectItem value="Vi phạm quy định">
									Vi phạm quy định
								</SelectItem>
								<SelectItem value="Khác">Khác</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{formData.reason === 'Khác' && (
						<div className="space-y-2">
							<Label htmlFor="custom_reason">Lý do khác</Label>
							<Textarea
								id="custom_reason"
								value={formData.description}
								onChange={(e) =>
									handleInputChange('description', e.target.value)
								}
								placeholder="Nhập lý do phạt"
								required
							/>
						</div>
					)}

					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isCreating}
						>
							Hủy
						</Button>
						<Button type="submit" disabled={isCreating}>
							{isCreating ? 'Đang tạo...' : 'Tạo phạt'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
