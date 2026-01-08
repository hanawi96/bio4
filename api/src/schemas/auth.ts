import { z } from 'zod';

export const registerSchema = z.object({
	email: z.string().email('Email không hợp lệ'),
	password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
	username: z.string()
		.min(3, 'Username phải có ít nhất 3 ký tự')
		.max(30, 'Username không được quá 30 ký tự')
		.regex(/^[a-zA-Z0-9_-]+$/, 'Username chỉ được chứa chữ cái, số, gạch dưới và gạch ngang'),
	display_name: z.string().optional()
});

export const loginSchema = z.object({
	email: z.string().email('Email không hợp lệ'),
	password: z.string().min(1, 'Mật khẩu không được để trống')
});
