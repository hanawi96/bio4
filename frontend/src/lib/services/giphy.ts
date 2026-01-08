// Giphy API Service
// Get your free API key at: https://developers.giphy.com/
// Free tier: 42 requests/hour

const GIPHY_API_KEY = '7XESVGvW5CELDTnzuddGJhITeIgPyABD';

export interface GiphyGif {
	id: string;
	title: string;
	images: {
		fixed_width_small: {
			url: string;
			width: string;
			height: string;
		};
		fixed_width: {
			url: string;
			width: string;
			height: string;
		};
		downsized: {
			url: string;
			width: string;
			height: string;
		};
	};
}

export async function searchGifs(query: string, limit = 20): Promise<GiphyGif[]> {
	try {
		const response = await fetch(
			`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=${limit}&rating=g`
		);
		const data = await response.json();
		return data.data || [];
	} catch (error) {
		console.error('Failed to search GIFs:', error);
		return [];
	}
}

export async function getTrendingGifs(limit = 20): Promise<GiphyGif[]> {
	try {
		const response = await fetch(
			`https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&rating=g`
		);
		const data = await response.json();
		return data.data || [];
	} catch (error) {
		console.error('Failed to get trending GIFs:', error);
		return [];
	}
}
