import { generatePatternColors, getContrastRatio } from './patternColors';

// Test cases với các màu khác nhau
const testColors = [
	{ name: 'White', hex: '#ffffff' },
	{ name: 'Light Gray', hex: '#f3f4f6' },
	{ name: 'Dark Gray', hex: '#1f2937' },
	{ name: 'Black', hex: '#000000' },
	{ name: 'Blue', hex: '#3b82f6' },
	{ name: 'Brown (like image)', hex: '#C8A882' },
	{ name: 'Purple', hex: '#8b5cf6' },
	{ name: 'Pink', hex: '#ec4899' },
	{ name: 'Green', hex: '#10b981' },
	{ name: 'Pastel Pink', hex: '#ffc0cb' },
	{ name: 'Navy', hex: '#001f3f' }
];

console.log('=== Pattern Colors Test ===\n');

testColors.forEach(({ name, hex }) => {
	const result = generatePatternColors(hex, 'grid');
	const contrast = getContrastRatio(result.bgColor, result.inkColor);
	
	console.log(`${name} (${hex}):`);
	console.log(`  → Ink Color: ${result.inkColor}`);
	console.log(`  → Opacity: ${result.opacity.toFixed(3)}`);
	console.log(`  → Contrast Ratio: ${contrast.toFixed(2)}:1`);
	console.log('');
});

console.log('=== Test Complete ===');
