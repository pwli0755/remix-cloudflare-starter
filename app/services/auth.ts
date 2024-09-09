import { z } from 'zod';

export const LoginSchema = z.object({
	username: z
		.string({ required_error: 'Name is required' })
		.min(3, { message: 'Name must be at least 3 characters long' }),
	password: z.string({ required_error: 'Password is required' }).min(6),
});
