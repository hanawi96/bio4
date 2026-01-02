// ============================================
// BLOCK STYLE RECIPES LIBRARY
// ============================================
// Recipes define HOW to render block styles using theme tokens
// Each recipe is a "formula" that gets resolved with actual colors from theme

export interface BlockStyleRecipe {
    fill: string; // Token reference: "blockBase" | "blockBase@0.14" | "transparent"
    text: string; // Text color: "auto" | "text" | "blockBase" | token reference
    border?: string; // Border: "none" | "blockBase" | "blockBase@0.28"
    glow?: string; // Glow effect: "blockBase@0.55"
    blur?: number; // Blur amount in px (for glass effect)
}

export type BlockStylePresetId = 'solid' | 'outline' | 'glass' | 'neon' | 'brutal' | 'gradient';

// Shadow style presets (independent from block styles)
export type ShadowStylePreset = 'none' | 'soft' | 'medium' | 'hard' | 'brutal' | 'custom';

export interface ShadowRecipe {
    value: string; // CSS box-shadow value or token reference
    description: string;
}

// Shadow recipes - can be combined with any block style
export const SHADOW_RECIPES: Record<ShadowStylePreset, ShadowRecipe> = {
    none: {
        value: 'none',
        description: 'No shadow'
    },
    soft: {
        value: '0 2px 8px shadowColor@0.15',
        description: 'Subtle soft shadow'
    },
    medium: {
        value: '0 4px 12px shadowColor@0.2',
        description: 'Medium depth shadow'
    },
    hard: {
        value: '0 6px 16px shadowColor@0.3',
        description: 'Strong shadow'
    },
    brutal: {
        value: '4px 4px 0px shadowColor',
        description: 'Hard brutalist shadow'
    }
};

// Recipe library - shared across all themes
export const BLOCK_STYLE_RECIPES: Record<BlockStylePresetId, BlockStyleRecipe> = {
    // Solid: Full color block with blockText
    solid: {
        fill: 'blockBase',
        text: 'blockText',
        border: 'none'
    },

    // Outline: Transparent with blockText
    outline: {
        fill: 'transparent',
        border: 'border',
        text: 'blockText'
    },

    // Glass: Frosted glass effect with blockText
    glass: {
        fill: 'surface',
        border: 'border@0.6',
        text: 'blockText',
        blur: 10
    },

    // Neon: Solid with glowing shadow and blockText
    neon: {
        fill: 'blockBase',
        text: 'blockText',
        border: 'none',
        glow: 'blockBase@0.55'
    },

    // Brutal: Solid with border and blockText
    brutal: {
        fill: 'blockBase',
        text: 'blockText',
        border: 'border'
    },

    // Gradient: Trendy gradient fill
    gradient: {
        fill: 'gradient:blockBase',
        text: 'blockText',
        border: 'none'
    }
};

// Helper: Get recipe by ID
export function getBlockStyleRecipe(id: BlockStylePresetId): BlockStyleRecipe {
    return BLOCK_STYLE_RECIPES[id];
}

// Helper: Get shadow recipe by ID
export function getShadowRecipe(id: ShadowStylePreset): ShadowRecipe {
    return SHADOW_RECIPES[id];
}

// Helper: Get all recipe IDs
export function getBlockStyleRecipeIds(): BlockStylePresetId[] {
    return Object.keys(BLOCK_STYLE_RECIPES) as BlockStylePresetId[];
}

// Helper: Get all shadow style IDs
export function getShadowStyleIds(): ShadowStylePreset[] {
    return Object.keys(SHADOW_RECIPES) as ShadowStylePreset[];
}

// Helper: Get recipe display name
export function getBlockStyleRecipeName(id: BlockStylePresetId): string {
    const names: Record<BlockStylePresetId, string> = {
        solid: 'Solid',
        outline: 'Outline',
        glass: 'Glass',
        neon: 'Neon',
        brutal: 'Brutal',
        gradient: 'Gradient'
    };
    return names[id];
}

// Helper: Get shadow style display name
export function getShadowStyleName(id: ShadowStylePreset): string {
    const names: Record<ShadowStylePreset, string> = {
        none: 'None',
        soft: 'Soft',
        medium: 'Medium',
        hard: 'Hard',
        brutal: 'Brutal'
    };
    return names[id];
}

// Helper: Get recipe description
export function getBlockStyleRecipeDescription(id: BlockStylePresetId): string {
    const descriptions: Record<BlockStylePresetId, string> = {
        solid: 'Full color with contrast text',
        outline: 'Transparent with border',
        glass: 'Frosted glass effect',
        neon: 'Solid with glow',
        brutal: 'Hard edge brutalism',
        gradient: 'Trendy gradient fill'
    };
    return descriptions[id];
}
