// Background type options
export const bgTypes = [
	{ id: 'solid', name: 'Solid Color', description: 'Single color' },
	{ id: 'gradient', name: 'Gradient', description: 'Color blend' },
	{ id: 'image', name: 'Image', description: 'Custom photo' },
	{ id: 'video', name: 'Video', description: 'Animated background' },
	{ id: 'pattern', name: 'Pattern', description: 'Repeating design' }
];

// Solid color presets
export const solidColors = [
	{ name: 'White', color: '#ffffff' },
	{ name: 'Light Gray', color: '#f3f4f6' },
	{ name: 'Dark Gray', color: '#1f2937' },
	{ name: 'Black', color: '#000000' },
	{ name: 'Blue', color: '#3b82f6' },
	{ name: 'Purple', color: '#8b5cf6' },
	{ name: 'Pink', color: '#ec4899' },
	{ name: 'Green', color: '#10b981' }
];

// Gradient presets
export const gradients = [
	{ name: 'Sunset', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', from: '#667eea', to: '#764ba2', direction: '135deg' },
	{ name: 'Ocean', gradient: 'linear-gradient(135deg, #667eea 0%, #00d4ff 100%)', from: '#667eea', to: '#00d4ff', direction: '135deg' },
	{ name: 'Forest', gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)', from: '#0ba360', to: '#3cba92', direction: '135deg' },
	{ name: 'Fire', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', from: '#f093fb', to: '#f5576c', direction: '135deg' },
	{ name: 'Peach', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', from: '#fa709a', to: '#fee140', direction: '135deg' },
	{ name: 'Night', gradient: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)', from: '#2c3e50', to: '#000000', direction: '135deg' },
	{ name: 'Aurora', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', from: '#a8edea', to: '#fed6e3', direction: '135deg' }
];

// Pattern presets
export const patterns = [
	{ 
		id: 'dots', 
		name: 'Dots',
		css: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
		size: '20px 20px'
	},
	{ 
		id: 'grid', 
		name: 'Grid',
		css: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
		size: '30px 30px'
	},
	{ 
		id: 'diagonal', 
		name: 'Diagonal',
		css: 'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)',
		size: 'auto'
	},
	{ 
		id: 'cross', 
		name: 'Circuit',
		svg: `<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.25"><circle cx="10" cy="10" r="3"/><circle cx="70" cy="10" r="3"/><circle cx="10" cy="70" r="3"/><circle cx="70" cy="70" r="3"/><circle cx="40" cy="40" r="4"/><line x1="13" y1="10" x2="37" y2="40"/><line x1="67" y1="10" x2="43" y2="40"/><line x1="13" y1="70" x2="37" y2="43"/><line x1="67" y1="70" x2="43" y2="43"/><rect x="38" y="8" width="4" height="4"/><rect x="38" y="68" width="4" height="4"/><rect x="8" y="38" width="4" height="4"/><rect x="68" y="38" width="4" height="4"/></g></svg>`
	},
	{ 
		id: 'zigzag', 
		name: 'Hexagon',
		svg: `<svg width="56" height="100" xmlns="http://www.w3.org/2000/svg"><path d="M28 0L0 16v32l28 16 28-16V16L28 0zm0 6l22 12.5v25L28 56 6 43.5v-25L28 6z" fill="currentColor" opacity="0.15"/><path d="M28 50L0 66v32l28 16 28-16V66L28 50zm0 6l22 12.5v25L28 106 6 93.5v-25L28 56z" fill="currentColor" opacity="0.15"/></svg>`
	},
	{ 
		id: 'organic', 
		name: 'Organic',
		svg: `<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><path d="M30 10c-8 0-12 8-12 12s4 8 8 12c4-4 12-8 12-12s-4-12-8-12z" fill="currentColor" opacity="0.3"/></svg>`
	},
	{ 
		id: 'noise', 
		name: 'Topography',
		svg: `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><path d="M20 10c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zm0 3c4 0 7 3 7 7s-3 7-7 7-7-3-7-7 3-7 7-7z" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/><path d="M60 15c-8 0-15 7-15 15s7 15 15 15 15-7 15-15-7-15-15-15zm0 4c6 0 11 5 11 11s-5 11-11 11-11-5-11-11 5-11 11-11z" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/><path d="M30 60c-6 0-12 6-12 12s6 12 12 12 12-6 12-12-6-12-12-12zm0 3c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9z" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/><path d="M75 65c-7 0-13 6-13 13s6 13 13 13 13-6 13-13-6-13-13-13zm0 3c6 0 10 4 10 10s-4 10-10 10-10-4-10-10 4-10 10-10z" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/></svg>`
	},
	{ 
		id: 'waves', 
		name: 'Waves',
		svg: `<svg width="100" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M0 10 Q 25 0, 50 10 T 100 10" stroke="currentColor" fill="none" stroke-width="2" opacity="0.3"/></svg>`
	}
];

// Default backgrounds
export const DEFAULT_IMAGE_BG = '/presets/images/preset-img.jpg';
export const DEFAULT_VIDEO_BG = '/presets/videos/14950008_1080_1920_60fps.mp4';
