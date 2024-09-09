import type { FieldMetadata } from '@conform-to/react';
import { getInputProps } from '@conform-to/react';
import { Input } from '../ui/input';
import PasswordInput from '../ui/password-input';
import type { ComponentProps } from 'react';

export const InputConform = ({
	meta,
	type,
	...props
}: {
	meta: FieldMetadata<string>;
	type: Parameters<typeof getInputProps>[1]['type'];
} & ComponentProps<typeof Input>) => {
	return type === 'password' ? (
		<PasswordInput
			{...getInputProps(meta, { type, ariaAttributes: true })}
			{...props}
		/>
	) : (
		<Input
			{...getInputProps(meta, { type, ariaAttributes: true })}
			{...props}
		/>
	);
};
