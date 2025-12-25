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
    shadow?: string; // Hard shadow: "4px 4px 0px rgba(0,0,0,1)"
}

export type BlockStylePresetId = 'solid' | 'soft' | 'outline' | 'glass' | 'neon' | 'brutal';

// Recipe library - shared across all themes
export const BLOCK_STYLE_RECIPES: Record<BlockStylePresetId, BlockStyleRecipe> = {
    // Solid: Full color block with auto contrast text
    solid: {
        fill: 'blockBase',
        text: 'auto',
        border: 'none'
    },

    // Soft: Subtle tinted background with visible border
    soft: {
        fill: 'blockBase@0.14',
        border: 'blockBase@0.28',
        text: 'text'
    },

    // Outline: Transparent with colored border and text
    outline: {
        fill: 'transparent',
        border: 'blockBase',
        text: 'blockBase'
    },

    // Glass: Frosted glass effect with blur
    glass: {
        fill: 'surface@0.35',
        border: 'border@0.6',
        text: 'text',
        blur: 10
    },

    // Neon: Solid with glowing shadow
    neon: {
        fill: 'blockBase',
        text: 'auto',
        border: 'none',
        glow: 'blockBase@0.55'
    },

    // Brutal: Solid with hard shadow (brutalism/neomorphism style)
    brutal: {
        fill: 'blockBase',
        text: 'auto',
        border: '2px solid #000000',
        shadow: '4px 4px 0px rgba(0,0,0,1)'
    }
};

// Helper: Get recipe by ID
export function getBlockStyleRecipe(id: BlockStylePresetId): BlockStyleRecipe {
    return BLOCK_STYLE_RECIPES[id];
}

// Helper: Get all recipe IDs
export function getBlockStyleRecipeIds(): BlockStylePresetId[] {
    return Object.keys(BLOCK_STYLE_RECIPES) as BlockStylePresetId[];
}

// Helper: Get recipe display name
export function getBlockStyleRecipeName(id: BlockStylePresetId): string {
    const names: Record<BlockStylePresetId, string> = {
        solid: 'Solid',
        soft: 'Soft',
        outline: 'Outline',
        glass: 'Glass',
        neon: 'Neon',
        brutal: 'Brutal'
    };
    return names[id];
}

// Helper: Get recipe description
export function getBlockStyleRecipeDescription(id: BlockStylePresetId): string {
    const descriptions: Record<BlockStylePresetId, string> = {
        solid: 'Full color with contrast text',
        soft: 'Subtle tint with border',
        outline: 'Transparent with border',
        glass: 'Frosted glass effect',
        neon: 'Solid with glow',
        brutal: 'Hard shadow brutalism'
    };
    return descriptions[id];
}
