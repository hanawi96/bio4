import { API_BASE_URL } from './constants';
import type { EditorData, ThemePreset, BioPage, LinkGroup, Link, Block } from './types';

class ApiClient {
	private baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	// Retry helper for development (handles API restart)
	private async fetchWithRetry(
		url: string,
		options?: RequestInit,
		retries = 3,
		delay = 1000
	): Promise<Response> {
		for (let i = 0; i < retries; i++) {
			try {
				const res = await fetch(url, options);
				return res;
			} catch (error) {
				// If it's the last retry, throw the error
				if (i === retries - 1) throw error;

				// Wait before retrying
				console.log(`API request failed, retrying in ${delay}ms... (${i + 1}/${retries})`);
				await new Promise(resolve => setTimeout(resolve, delay));
			}
		}
		throw new Error('Max retries reached');
	}

	// ============ BIO (Public) ============

	async getPublicBio(username: string): Promise<EditorData> {
		const res = await this.fetchWithRetry(`${this.baseUrl}/bio/${username}`);
		if (!res.ok) throw new Error('Profile not found');
		return res.json();
	}

	// ============ EDITOR ============

	async getEditorData(username: string): Promise<EditorData> {
		const res = await this.fetchWithRetry(`${this.baseUrl}/editor/${username}`);
		if (!res.ok) throw new Error('Failed to load editor data');
		return res.json();
	}

	async updatePage(username: string, data: Partial<BioPage>): Promise<{ success: boolean }> {
		const res = await this.fetchWithRetry(`${this.baseUrl}/editor/${username}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		if (!res.ok) throw new Error('Failed to update page');
		return res.json();
	}

	async saveDraft(username: string, data: any): Promise<{ success: boolean }> {
		const res = await this.fetchWithRetry(`${this.baseUrl}/editor/${username}/draft`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		if (!res.ok) throw new Error('Failed to save draft');
		return res.json();
	}

	async publishPage(username: string): Promise<{ success: boolean }> {
		const res = await this.fetchWithRetry(`${this.baseUrl}/editor/${username}/publish`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }
		});
		if (!res.ok) throw new Error('Failed to publish');
		return res.json();
	}

	// ============ LINKS ============

	async getGroups(username: string): Promise<{ groups: LinkGroup[] }> {
		const res = await this.fetchWithRetry(`${this.baseUrl}/links/groups/${username}`);
		if (!res.ok) throw new Error('Failed to load groups');
		return res.json();
	}

	async createGroup(username: string, data: { title?: string; layout_type?: string; sort_order?: number }): Promise<{ id: number }> {
		const res = await this.fetchWithRetry(`${this.baseUrl}/links/groups/${username}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		if (!res.ok) throw new Error('Failed to create group');
		return res.json();
	}

	async updateGroup(groupId: number, data: Partial<LinkGroup>): Promise<{ success: boolean }> {
		const res = await this.fetchWithRetry(`${this.baseUrl}/links/groups/${groupId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		if (!res.ok) throw new Error('Failed to update group');
		return res.json();
	}

	async deleteGroup(groupId: number): Promise<{ success: boolean }> {
		const res = await this.fetchWithRetry(`${this.baseUrl}/links/groups/${groupId}`, {
			method: 'DELETE'
		});
		if (!res.ok) throw new Error('Failed to delete group');
		return res.json();
	}

	async createLink(groupId: number, data: { title: string; url: string; icon_url?: string; sort_order?: number }): Promise<{ id: number }> {
		const res = await this.fetchWithRetry(`${this.baseUrl}/links/${groupId}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		if (!res.ok) throw new Error('Failed to create link');
		return res.json();
	}

	async updateLink(linkId: number, data: Partial<Link>): Promise<{ success: boolean }> {
		const res = await this.fetchWithRetry(`${this.baseUrl}/links/${linkId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		if (!res.ok) throw new Error('Failed to update link');
		return res.json();
	}

	async deleteLink(linkId: number): Promise<{ success: boolean }> {
		const res = await this.fetchWithRetry(`${this.baseUrl}/links/${linkId}`, {
			method: 'DELETE'
		});
		if (!res.ok) throw new Error('Failed to delete link');
		return res.json();
	}

	// ============ BLOCKS ============

	async getBlocks(username: string): Promise<{ blocks: Block[] }> {
		const res = await this.fetchWithRetry(`${this.baseUrl}/blocks/${username}`);
		if (!res.ok) throw new Error('Failed to load blocks');
		return res.json();
	}

	async createBlock(username: string, data: { type: string; content?: object; sort_order?: number }): Promise<{ id: number }> {
		const res = await this.fetchWithRetry(`${this.baseUrl}/blocks/${username}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		if (!res.ok) throw new Error('Failed to create block');
		return res.json();
	}

	async updateBlock(blockId: number, data: Partial<Block>): Promise<{ success: boolean }> {
		const res = await this.fetchWithRetry(`${this.baseUrl}/blocks/${blockId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		if (!res.ok) throw new Error('Failed to update block');
		return res.json();
	}

	async deleteBlock(blockId: number): Promise<{ success: boolean }> {
		const res = await this.fetchWithRetry(`${this.baseUrl}/blocks/${blockId}`, {
			method: 'DELETE'
		});
		if (!res.ok) throw new Error('Failed to delete block');
		return res.json();
	}

	// ============ THEMES ============

	async getThemes(): Promise<{ themes: ThemePreset[] }> {
		const res = await this.fetchWithRetry(`${this.baseUrl}/themes`);
		if (!res.ok) throw new Error('Failed to load themes');
		return res.json();
	}

	async getTheme(key: string): Promise<{ theme: any }> {
		const res = await this.fetchWithRetry(`${this.baseUrl}/themes/${key}`);
		if (!res.ok) throw new Error('Theme not found');
		return res.json();
	}

	// ============ UPLOAD ============

	async uploadImage(file: File, userId?: number): Promise<{ url: string; storage_key: string }> {
		const formData = new FormData();
		formData.append('file', file);
		if (userId) formData.append('user_id', userId.toString());

		const res = await fetch(`${this.baseUrl}/upload`, {
			method: 'POST',
			body: formData
		});
		if (!res.ok) throw new Error('Failed to upload image');
		return res.json();
	}

	async deleteImage(storageKey: string): Promise<{ success: boolean }> {
		const res = await fetch(`${this.baseUrl}/upload/${storageKey}`, {
			method: 'DELETE'
		});
		if (!res.ok) throw new Error('Failed to delete image');
		return res.json();
	}

	// ============ AVATAR ============

	async uploadAvatar(username: string, file: File): Promise<{ url: string; storage_key: string }> {
		const formData = new FormData();
		formData.append('file', file);

		const res = await fetch(`${this.baseUrl}/upload/avatar/${username}`, {
			method: 'POST',
			body: formData
		});
		if (!res.ok) {
			const error = await res.json();
			throw new Error(error.error || 'Failed to upload avatar');
		}
		return res.json();
	}

	async removeAvatar(username: string): Promise<{ success: boolean }> {
		const res = await fetch(`${this.baseUrl}/upload/avatar/${username}`, {
			method: 'DELETE'
		});
		if (!res.ok) throw new Error('Failed to remove avatar');
		return res.json();
	}
}

export const api = new ApiClient(API_BASE_URL);
