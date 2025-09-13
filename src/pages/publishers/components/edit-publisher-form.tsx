import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import type { Publisher, UpdatePublisherRequest } from '@/types/publishers';

import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { countries } from '@/data/countries';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const updatePublisherSchema = z.object({
	publisherName: z
		.string()
		.min(1, 'Tên nhà xuất bản là bắt buộc')
		.max(255, 'Tên nhà xuất bản tối đa 255 ký tự'),
	address: z
		.string()
		.max(1000, 'Địa chỉ tối đa 1000 ký tự')
		.optional()
		.or(z.literal('')),
	phone: z
		.string()
		.regex(/^[0-9+\-\s\(\)]{10,20}$/, 'Số điện thoại không hợp lệ')
		.max(20, 'Số điện thoại tối đa 20 ký tự')
		.optional()
		.or(z.literal('')),
	email: z
		.string()
		.min(1, 'Email là bắt buộc')
		.email('Email không hợp lệ')
		.max(255, 'Email tối đa 255 ký tự'),
	website: z
		.string()
		.url('Website không hợp lệ')
		.max(255, 'Website tối đa 255 ký tự')
		.optional()
		.or(z.literal('')),
	description: z
		.string()
		.max(1000, 'Mô tả tối đa 1000 ký tự')
		.optional()
		.or(z.literal('')),
	country: z.string().optional(),
	establishedDate: z.string().optional(),
	isActive: z.boolean().optional(),
});

type UpdatePublisherFormData = z.infer<typeof updatePublisherSchema>;

interface EditPublisherFormProps {
	publisher: Publisher;
	onSubmit: (data: UpdatePublisherRequest) => void;
	onCancel: () => void;
	isLoading?: boolean;
}

const EditPublisherForm = ({
	publisher,
	onSubmit,
	onCancel,
	isLoading = false,
}: EditPublisherFormProps) => {
	// Find country code from country name
	const getCountryCode = (countryName: string) => {
		const country = countries.find((c) => c.label === countryName);
		return country ? country.value : '';
	};

	const form = useForm<UpdatePublisherFormData>({
		resolver: zodResolver(updatePublisherSchema),
		defaultValues: {
			publisherName: publisher.publisherName || '',
			address: publisher.address || '',
			phone: publisher.phone || '',
			email: publisher.email,
			website: publisher.website || '',
			description: publisher.description || '',
			country: getCountryCode(publisher.country || ''),
			establishedDate: publisher.establishedDate || '',
			isActive: publisher.isActive ?? true,
		},
	});

	const handleSubmit = (data: UpdatePublisherFormData) => {
		// Convert country code to country name
		const selectedCountry = countries.find(
			(country) => country.value === data.country
		);
		const countryName = selectedCountry ? selectedCountry.label : data.country;

		onSubmit({
			...data,
			address: data.address || undefined,
			phone: data.phone || undefined,
			website: data.website || undefined,
			description: data.description || undefined,
			country: countryName || undefined,
			establishedDate: data.establishedDate || undefined,
			isActive: data.isActive ?? true, // Default to true if not provided
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="publisherName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tên nhà xuất bản *</FormLabel>
							<FormControl>
								<Input placeholder="Nhập tên nhà xuất bản" {...field} />
							</FormControl>
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
								<Input placeholder="Nhập địa chỉ (tùy chọn)" {...field} />
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
								<Input placeholder="Nhập số điện thoại (tùy chọn)" {...field} />
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
							<FormLabel>Email *</FormLabel>
							<FormControl>
								<Input type="email" placeholder="Nhập email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="website"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Website</FormLabel>
							<FormControl>
								<Input
									type="url"
									placeholder="https://example.com (tùy chọn)"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="country"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Quốc gia</FormLabel>
							<FormControl>
								<Combobox
									options={countries}
									value={field.value}
									onValueChange={field.onChange}
									placeholder="Chọn quốc gia... (tùy chọn)"
									searchPlaceholder="Tìm kiếm quốc gia..."
									emptyText="Không tìm thấy quốc gia nào"
									disabled={isLoading}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="establishedDate"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Ngày thành lập</FormLabel>
							<FormControl>
								<Input
									type="date"
									placeholder="Chọn ngày thành lập (tùy chọn)"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Mô tả</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Nhập mô tả về nhà xuất bản (tùy chọn)"
									className="resize-none"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="isActive"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
							<div className="space-y-0.5">
								<FormLabel className="text-base">
									Trạng thái hoạt động
								</FormLabel>
								<div className="text-sm text-muted-foreground">
									Nhà xuất bản này có đang hoạt động không (mặc định: có)
								</div>
							</div>
							<FormControl>
								<Switch
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				<div className="flex justify-end space-x-2 pt-4">
					<Button type="button" variant="outline" onClick={onCancel}>
						Hủy
					</Button>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default EditPublisherForm;
