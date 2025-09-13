import * as React from 'react';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { UpdateUserRequest, User } from '@/types/user.type';

import { UsersAPI } from '@/apis';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReaderTypesDropdown } from '@/hooks/readers/use-reader-types-dropdown';
import type { Reader } from '@/types';
import { getContextualErrorMessage } from '@/utils/error-handler';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const updateUserSchema = z.object({
	userCode: z.string().min(1, 'Mã người dùng là bắt buộc'),
	username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
	email: z.string().email('Email không hợp lệ'),
	role: z.enum(['admin', 'reader'] as const),
	accountStatus: z.enum(['active', 'inactive', 'banned'] as const),
	// Reader fields
	fullName: z.string().min(1, 'Họ tên là bắt buộc'),
	dob: z.string().optional(),
	gender: z.enum(['male', 'female', 'other'] as const).optional(),
	address: z.string().optional(),
	phone: z.string().optional(),
	readerTypeId: z.string().min(1, 'Loại độc giả là bắt buộc'),
	cardNumber: z.string().optional(),
	cardIssueDate: z.string().optional(),
	cardExpiryDate: z.string().optional(),
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface EditUserFormProps {
	user: User | Reader;
	onCancel: () => void;
	isLoading?: boolean;
}

const EditUserForm = ({
	user,
	onCancel,
	isLoading = false,
}: EditUserFormProps) => {
	const queryClient = useQueryClient();

	// Get reader types for dropdown
	const { readerTypes, isLoading: isLoadingReaderTypes } =
		useReaderTypesDropdown();

	// Function to get Vietnamese label for reader type
	const getTypeNameLabel = (typeName: string) => {
		switch (typeName) {
			case 'student':
				return 'Học Sinh';
			case 'teacher':
				return 'Giáo viên';
			case 'staff':
				return 'Cán bộ';
			default:
				return typeName;
		}
	};

	// Determine if this is a User or Reader type
	const isReader = 'fullName' in user && 'cardNumber' in user;

	// Get user data - either from user object or from reader.user
	const userData = isReader ? (user as Reader).user : (user as User);
	const readerData = isReader ? (user as Reader) : null;

	const form = useForm<UpdateUserFormData>({
		resolver: zodResolver(updateUserSchema),
		defaultValues: {
			userCode: userData?.userCode || readerData?.cardNumber || '',
			username: userData?.username || '',
			email: userData?.email || '',
			role: (userData as User)?.role || 'reader',
			accountStatus: (userData as User)?.accountStatus || 'active',
			// Reader fields
			fullName: readerData?.fullName || userData?.username || '',
			dob: readerData?.dob || '',
			gender: readerData?.gender || 'male',
			address: readerData?.address || '',
			phone: readerData?.phone || '',
			readerTypeId: readerData?.readerType?.id || '',
			cardNumber: readerData?.cardNumber || '',
			cardIssueDate: readerData?.cardIssueDate || '',
			cardExpiryDate: readerData?.cardExpiryDate || '',
		},
	});

	// Watch role changes
	const watchRole = form.watch('role');

	// Auto-update readerTypeId when role changes
	React.useEffect(() => {
		if (watchRole === 'admin') {
			// Find staff reader type
			const staffType = readerTypes.find((rt) => rt.typeName === 'staff');
			if (staffType) {
				form.setValue('readerTypeId', staffType.id);
			}
		}
	}, [watchRole, form, readerTypes]);

	// Auto-update fullName when username changes
	const watchUsername = form.watch('username');
	React.useEffect(() => {
		if (watchUsername) {
			form.setValue('fullName', watchUsername);
		}
	}, [watchUsername, form]);

	// Update expiry date when issue date changes
	const watchCardIssueDate = form.watch('cardIssueDate');
	React.useEffect(() => {
		if (watchCardIssueDate) {
			const issueDate = new Date(watchCardIssueDate);
			const expiryDate = new Date(issueDate);
			expiryDate.setFullYear(expiryDate.getFullYear() + 3);
			form.setValue('cardExpiryDate', expiryDate.toISOString().split('T')[0]);
		}
	}, [watchCardIssueDate, form]);

	const handleSubmit = async (data: UpdateUserFormData) => {
		console.log('🚀 ~ handleSubmit ~ data:', data);
		try {
			// Update user first
			const userUpdateData: UpdateUserRequest = {
				userCode: data.userCode,
				username: data.username,
				email: data.email,
				role: data.role,
				accountStatus: data.accountStatus,
			};
			console.log('🚀 ~ handleSubmit ~ userUpdateData:', userUpdateData);

			// Call API to update user
			const updatedUser = await UsersAPI.update(
				userData?.id || '',
				userUpdateData
			);
			console.log('🚀 ~ handleSubmit ~ updatedUser:', updatedUser);

			// If this is a reader or has reader data, update reader information
			if (isReader && readerData) {
				try {
					const readerUpdateData = {
						fullName: data.fullName,
						dob: data.dob ? new Date(data.dob + 'T00:00:00') : null,
						gender: data.gender || null,
						address: data.address || null,
						phone: data.phone || null,
						cardNumber: data.cardNumber || null,
						cardIssueDate: data.cardIssueDate
							? new Date(data.cardIssueDate + 'T00:00:00')
							: null,
						cardExpiryDate: data.cardExpiryDate
							? new Date(data.cardExpiryDate + 'T00:00:00')
							: null,
						readerTypeId: data.readerTypeId,
					};

					// Call API to update reader
					await UsersAPI.updateReader(readerData.id, readerUpdateData);
				} catch (error) {
					console.error('Error updating reader:', error);
					const errorMessage = getContextualErrorMessage(error, 'reader');
					toast.error(errorMessage);
				}
			}

			toast.success('Cập nhật thành công!');
			queryClient.invalidateQueries({ queryKey: ['users'] });
		} catch (error: unknown) {
			console.error('Error updating:', error);
			const errorMessage = getContextualErrorMessage(error, 'user');
			toast.error(errorMessage);
		}
	};

	return (
		<div className="h-full flex flex-col max-h-screen">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(handleSubmit)}
					className="flex-1 flex flex-col min-h-0"
					autoComplete="off"
				>
					{/* Scrollable content area */}
					<ScrollArea className="flex-1 px-1 max-h-[calc(100vh-120px)]">
						<div className="space-y-4 pb-4">
							{/* User Information Section */}
							<div className="space-y-4">
								<FormField
									control={form.control}
									name="userCode"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Mã người dùng</FormLabel>
											<FormControl>
												<Input
													placeholder="Nhập mã người dùng"
													disabled
													{...field}
													className="font-mono"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="username"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Tên đăng nhập</FormLabel>
											<FormControl>
												<Input placeholder="Nhập tên đăng nhập" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													type="email"
													placeholder="Nhập email"
													{...field}
													disabled
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="role"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Vai trò</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Chọn vai trò" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="reader">Người dùng</SelectItem>
													<SelectItem value="admin">Nhân viên</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="accountStatus"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Trạng thái tài khoản</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Chọn trạng thái" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="active">Hoạt động</SelectItem>
													<SelectItem value="inactive">
														Không hoạt động
													</SelectItem>
													<SelectItem value="banned">Bị cấm</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Reader Information Section - Only show if this is a reader or role is reader */}
							{(isReader || watchRole === 'reader') && (
								<div className="space-y-4">
									<FormField
										control={form.control}
										name="dob"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Ngày sinh</FormLabel>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="gender"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Giới tính</FormLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Chọn giới tính" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="male">Nam</SelectItem>
														<SelectItem value="female">Nữ</SelectItem>
														<SelectItem value="other">Khác</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="address"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Địa chỉ</FormLabel>
												<FormControl>
													<Input placeholder="Nhập địa chỉ" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="phone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Số điện thoại</FormLabel>
												<FormControl>
													<Input placeholder="Nhập số điện thoại" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="readerTypeId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Loại độc giả</FormLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
													disabled={isLoadingReaderTypes}
												>
													<FormControl>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Chọn loại độc giả" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{readerTypes.map((readerType) => (
															<SelectItem
																key={readerType.id}
																value={readerType.id}
															>
																{getTypeNameLabel(readerType.typeName)}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							)}

							{/* Card Information Section - Only show for reader role or if this is a reader */}
							{(isReader || watchRole === 'reader') && (
								<div className="space-y-4">
									<FormField
										control={form.control}
										name="cardIssueDate"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Ngày cấp thẻ</FormLabel>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="cardExpiryDate"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Ngày hết hạn</FormLabel>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							)}
						</div>
					</ScrollArea>

					{/* Fixed bottom buttons */}
					<div className="flex-shrink-0 bg-background border-t py-4 px-4">
						<div className="flex justify-end space-x-2">
							<Button type="button" variant="outline" onClick={onCancel}>
								Hủy
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
							</Button>
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
};

export default EditUserForm;
