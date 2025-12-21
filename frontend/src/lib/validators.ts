import { z } from 'zod';

export const profileSchema = z.object({
	username: z.string().min(3).max(30).regex(/^[a-z0-9_-]+$/),
	displayName: z.string().min(1).max(50),
	bio: z.string().max(200).optional(),
	avatar: z.string().url().optional(),
	links: z.array(z.object({
		title: z.string().min(1).max(50),
		url: z.string().url(),
		icon: z.string().optional()
	})).max(20)
});

export const appearanceSchema = z.object({
	preset: z.string(),
	global: z.object({
		backgroundColor: z.string(),
		textColor: z.string(),
		primaryColor: z.string(),
		fontFamily: z.string(),
		borderRadius: z.number().min(0).max(50),
		spacing: z.number().min(0).max(100)
	}),
	sections: z.record(z.any()).optional()
});
