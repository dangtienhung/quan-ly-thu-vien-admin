import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';

import type { Reader } from '@/types';
import type { User } from '@/types/user.type';
import { memo } from 'react';
import EditUserForm from './edit-user-form';

interface EditUserSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userToEdit: User | Reader | null;
	onCancel: () => void;
	isLoading: boolean;
}

export const EditUserSheet = memo<EditUserSheetProps>(
	({ open, onOpenChange, userToEdit, onCancel, isLoading }) => {
		console.log('🚀 ~ userToEdit:', userToEdit);
		return (
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent side="right" className="w-[400px] sm:w-[540px]">
					<SheetHeader>
						<SheetTitle>
							Chỉnh sửa người dùng{' '}
							{userToEdit && 'userCode' in userToEdit
								? userToEdit.userCode
								: userToEdit?.user?.userCode}
						</SheetTitle>
					</SheetHeader>
					<div className="px-4">
						{userToEdit && (
							<EditUserForm
								user={userToEdit}
								onCancel={onCancel}
								isLoading={isLoading}
							/>
						)}
					</div>
				</SheetContent>
			</Sheet>
		);
	}
);

EditUserSheet.displayName = 'EditUserSheet';
