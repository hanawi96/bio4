import { z } from 'zod';

// Page update validation
export const pageUpdateSchema = z.object({
	title: z.string().max(100).optional(),
	bio: z.string().max(500).optional(),
	avatar_url: z.string().url().optional().nullable(),
	theme_preset_key: z.string().optional(),
	theme_mode: z.enum(['light', 'dark', 'compact']).optional(),
	settings: z.record(z.any()).optional(),
	status: z.enum(['draft', 'published']).optional()
});

// Link validation
export const linkSchema = z.object({
	title: z.string().min(1).max(100),
	url: z.string().url(),
	icon_url: z.string().url().optional().nullable(),
	sort_order: z.number().int().min(0).optional()
});

// Link group validation
export const groupSchema = z.object({
	title: z.string().max(100).optional().nullable(),
	layout_type: z.enum(['list', 'carousel', 'grid', 'cards']).optional(),
	layout_config: z.string().optional().nullable(),
	sort_order: z.number().int().min(0).optional()
});

// Block validation
export const blockSchema = z.object({
	type: z.string().min(1),
	content: z.record(z.any()).optional(),
	sort_order: z.number().int().min(0).optional(),
	is_visible: z.number().int().min(0).max(1).optional()
});

// Validation helper
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
	try {
		const result = schema.parse(data);
		return { success: true, data: result };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return { success: false, error: error.errors.map(e => e.message).join(', ') };
		}
		return { success: false, error: 'Validation failed' };
	}
}
