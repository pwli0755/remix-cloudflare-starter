import * as React from 'react';
import { Input } from './input';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '~/lib/utils';

export interface PasswordInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
	({ className, type, ...props }, ref) => {
		const [showPassword, setShowPassword] = React.useState(false);
		return (
			<div className="relative">
				<Input
					type={showPassword ? 'text' : 'password'}
					{...props}
					ref={ref}
					className={cn('pr-10', className)}
				/>
				<span className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer select-none">
					{showPassword ? (
						<Eye onClick={() => setShowPassword(false)} />
					) : (
						<EyeOff onClick={() => setShowPassword(true)} />
					)}
				</span>
			</div>
		);
	},
);
PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
