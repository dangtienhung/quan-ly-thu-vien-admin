import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResetPassword } from '@/hooks';

export default function ResetPasswordPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { resetPasswordAsync, isLoading } = useResetPassword();

	const [token, setToken] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const tokenFromUrl = searchParams.get('token');
		if (tokenFromUrl) {
			setToken(tokenFromUrl);
		} else {
			setError('Token không hợp lệ hoặc đã hết hạn');
		}
	}, [searchParams]);

	const validatePassword = (password: string) => {
		if (password.length < 6) {
			return 'Mật khẩu phải có ít nhất 6 ký tự';
		}
		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!token) {
			setError('Token không hợp lệ');
			return;
		}

		if (!newPassword.trim()) {
			setError('Vui lòng nhập mật khẩu mới');
			return;
		}

		if (!confirmPassword.trim()) {
			setError('Vui lòng xác nhận mật khẩu mới');
			return;
		}

		const passwordError = validatePassword(newPassword);
		if (passwordError) {
			setError(passwordError);
			return;
		}

		if (newPassword !== confirmPassword) {
			setError('Mật khẩu xác nhận không khớp');
			return;
		}

		setError(null);

		try {
			await resetPasswordAsync({
				token,
				newPassword,
				confirmNewPassword: confirmPassword,
			});
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
								Đặt lại mật khẩu thành công!
							</h1>
							<p className="text-gray-600">
								Mật khẩu của bạn đã được cập nhật thành công
							</p>
						</div>

						<div className="space-y-6">
							<Alert>
								<CheckCircle className="h-4 w-4" />
								<AlertDescription>
									Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.
								</AlertDescription>
							</Alert>

							<Button
								onClick={handleBackToLogin}
								className="w-full bg-green-600 hover:bg-green-700 rounded h-12"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Đăng nhập ngay
							</Button>
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
							Đặt lại mật khẩu
						</h1>
						<p className="text-gray-600">
							Nhập mật khẩu mới cho tài khoản của bạn
						</p>
					</div>

					{error && (
						<div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200 mb-6">
							{error}
						</div>
					)}

					<form
						onSubmit={handleSubmit}
						className="space-y-6"
						autoComplete="off"
					>
						<div>
							<label
								htmlFor="newPassword"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Mật khẩu mới
							</label>
							<div className="relative">
								<Input
									id="newPassword"
									type={showPassword ? 'text' : 'password'}
									placeholder="Nhập mật khẩu mới"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									disabled={isLoading}
									required
									className="h-12 rounded pr-10"
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
								>
									{showPassword ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</Button>
							</div>
							<p className="text-xs text-gray-500 mt-1">
								Mật khẩu phải có ít nhất 6 ký tự
							</p>
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Xác nhận mật khẩu mới
							</label>
							<div className="relative">
								<Input
									id="confirmPassword"
									type={showConfirmPassword ? 'text' : 'password'}
									placeholder="Nhập lại mật khẩu mới"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									disabled={isLoading}
									required
									className="h-12 rounded pr-10"
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
								>
									{showConfirmPassword ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</Button>
							</div>
						</div>

						<Button
							type="submit"
							disabled={isLoading || !token}
							className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 rounded h-12"
						>
							{isLoading ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
									Đang cập nhật...
								</>
							) : (
								<>
									<Lock className="mr-2 h-4 w-4" />
									Đặt lại mật khẩu
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
