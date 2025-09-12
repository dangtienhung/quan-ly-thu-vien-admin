import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForgotPassword } from '@/hooks';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPasswordPage() {
	const navigate = useNavigate();
	const { forgotPasswordAsync, isLoading } = useForgotPassword();

	const [email, setEmail] = useState('');
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email.trim()) {
			setError('Vui lòng nhập địa chỉ email');
			return;
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setError('Vui lòng nhập địa chỉ email hợp lệ');
			return;
		}

		setError(null);

		try {
			await forgotPasswordAsync({ email });
			setIsSuccess(true);
		} catch (err: any) {
			setError(
				err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại'
			);
		}
	};

	const handleBackToLogin = () => {
		navigate('/login');
	};

	if (isSuccess) {
		return (
			<div
				className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative"
				style={{
					backgroundImage: `url('/background.jpg')`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
				}}
			>
				<div className="absolute inset-0 bg-black opacity-60"></div>
				<div className="w-full max-w-md z-10">
					<div className="bg-white rounded-lg shadow-xl p-8">
						<div className="text-center mb-8">
							<div className="flex justify-center mb-4">
								<CheckCircle className="h-16 w-16 text-green-500" />
							</div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								Email đã được gửi!
							</h1>
							<p className="text-gray-600">
								Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn
							</p>
						</div>

						<div className="space-y-6">
							<Alert>
								<Mail className="h-4 w-4" />
								<AlertDescription>
									Vui lòng kiểm tra hộp thư đến của <strong>{email}</strong> và
									làm theo hướng dẫn trong email.
								</AlertDescription>
							</Alert>

							<div className="text-sm text-gray-600 space-y-2">
								<p>
									<strong>Lưu ý:</strong>
								</p>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>Link đặt lại mật khẩu có hiệu lực trong 15 phút</li>
									<li>Nếu không thấy email, vui lòng kiểm tra thư mục spam</li>
									<li>Liên hệ quản trị viên nếu bạn cần hỗ trợ</li>
								</ul>
							</div>

							<div className="flex flex-col space-y-3">
								<Button
									onClick={handleBackToLogin}
									className="w-full bg-green-600 hover:bg-green-700 rounded h-12"
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									Quay lại đăng nhập
								</Button>

								<Button
									variant="outline"
									onClick={() => {
										setIsSuccess(false);
										setEmail('');
									}}
									className="w-full rounded h-12"
								>
									Gửi lại email
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative"
			style={{
				backgroundImage: `url('/background.jpg')`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
			}}
		>
			<div className="absolute inset-0 bg-black opacity-60"></div>
			<div className="w-full max-w-md z-10">
				<div className="bg-white rounded-lg shadow-xl p-8">
					<div className="text-center mb-8">
						<div className="flex justify-center mb-4">
							<img
								src="/logo.jpg"
								alt="Logo trường THPT Hoài Đức A"
								width={80}
								height={80}
								className="rounded-full object-cover"
							/>
						</div>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Quên mật khẩu?
						</h1>
						<p className="text-gray-600">
							Nhập địa chỉ email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại
							mật khẩu
						</p>
					</div>

					<form
						onSubmit={handleSubmit}
						className="space-y-6"
						autoComplete="off"
					>
						{error && (
							<div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
								{error}
							</div>
						)}

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Địa chỉ email
							</label>
							<Input
								id="email"
								type="email"
								placeholder="Nhập địa chỉ email của bạn"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={isLoading}
								required
								className="h-12 rounded"
							/>
						</div>

						<Button
							type="submit"
							disabled={isLoading}
							className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 rounded h-12"
						>
							{isLoading ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
									Đang gửi...
								</>
							) : (
								<>
									<Mail className="mr-2 h-4 w-4" />
									Gửi email đặt lại mật khẩu
								</>
							)}
						</Button>
					</form>

					<div className="text-center mt-4">
						<button
							onClick={handleBackToLogin}
							className="text-sm text-blue-600 hover:text-blue-800 underline"
						>
							Quay lại đăng nhập
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
