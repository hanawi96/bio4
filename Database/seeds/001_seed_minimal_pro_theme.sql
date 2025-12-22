-- Seed: Add Minimal Pro Theme (V2)
-- Date: 2024-12-22

INSERT INTO theme_presets (key, name, config, config_v2) 
VALUES (
  'minimal-pro',
  'Minimal Pro',
  '{"backgroundColor":"#ffffff","textColor":"#0A0A0A","primaryColor":"#2563EB","fontFamily":"Inter","borderRadius":12,"spacing":20}',
  '{
    "meta": {
      "id": "preset.minimal-pro",
      "name": "Minimal Pro",
      "version": "1.0.0",
      "schemaVersion": 1,
      "author": "system",
      "description": "Clean professional layout, center-aligned",
      "supports": {
        "modes": ["light", "dark"],
        "animation": true
      },
      "tier": "free",
      "visibility": "public",
      "contract": {
        "controls": [
          {"keyPath": "page.layout.textAlign", "type": "select", "options": ["left", "center", "right"], "label": "Text align (page)"},
          {"keyPath": "page.layout.baseFontSize", "type": "select", "options": ["S", "M", "L", "XL"], "label": "Font size (page)"},
          {"keyPath": "page.layout.pagePadding", "type": "slider", "min": 0, "max": 32, "step": 1, "label": "Page padding"},
          {"keyPath": "page.layout.blockGap", "type": "slider", "min": 0, "max": 32, "step": 1, "label": "Block spacing"},
          {"keyPath": "page.mode", "type": "select", "options": ["light", "dark"], "label": "Mode (page)"},
          {"keyPath": "page.defaults.linkGroup.textAlign", "type": "select", "options": ["left", "center", "right"], "label": "Link group text align"},
          {"keyPath": "page.defaults.linkGroup.fontSize", "type": "select", "options": ["S", "M", "L", "XL"], "label": "Link group font size"},
          {"keyPath": "background.effects.blur", "type": "slider", "min": 0, "max": 12, "step": 1, "label": "Background blur"},
          {"keyPath": "background.effects.dim", "type": "slider", "min": 0, "max": 0.8, "step": 0.05, "label": "Background dim"}
        ],
        "constraints": {
          "background.effects.dim": {"min": 0, "max": 0.8},
          "background.effects.blur": {"min": 0, "max": 12}
        }
      }
    },
    "tokens": {
      "color": {
        "gray": {"50": "#FAFAFA", "100": "#F5F5F5", "200": "#E5E5E5", "300": "#D4D4D4", "400": "#A3A3A3", "500": "#737373", "600": "#525252", "700": "#404040", "800": "#262626", "900": "#0A0A0A"},
        "blue": {"500": "#3B82F6", "600": "#2563EB"},
        "white": "#FFFFFF",
        "black": "#000000"
      },
      "typography": {
        "fontFamily": {"sans": "Inter, system-ui, -apple-system, sans-serif"},
        "fontSize": {"xs": "12px", "sm": "14px", "base": "16px", "lg": "18px", "xl": "20px", "2xl": "24px", "3xl": "30px"},
        "fontWeight": {"normal": 400, "medium": 500, "semibold": 600, "bold": 700},
        "lineHeight": {"tight": 1.25, "normal": 1.5, "relaxed": 1.75}
      },
      "space": {"1": 4, "2": 8, "3": 12, "4": 16, "5": 20, "6": 24, "8": 32, "10": 40, "12": 48},
      "radius": {"sm": 4, "md": 8, "lg": 12, "xl": 16, "2xl": 20, "full": 9999},
      "elevation": {"none": "none", "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)", "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)", "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)"}
    },
    "semantic": {
      "color": {
        "primary": "#0A0A0A",
        "secondary": "#525252",
        "accent": "#2563EB",
        "text": {"default": "#0A0A0A", "muted": "#737373", "invert": "#FFFFFF"},
        "border": {"default": "#E5E5E5"},
        "divider": "#F5F5F5",
        "surface": {"page": "#FFFFFF", "card": "#FAFAFA", "overlay": "#FFFFFF"}
      },
      "typography": {
        "heading": {"fontFamily": "Inter, system-ui, -apple-system, sans-serif", "fontSize": "24px", "fontWeight": 600, "lineHeight": 1.25},
        "body": {"fontFamily": "Inter, system-ui, -apple-system, sans-serif", "fontSize": "16px", "fontWeight": 400, "lineHeight": 1.5},
        "caption": {"fontFamily": "Inter, system-ui, -apple-system, sans-serif", "fontSize": "14px", "fontWeight": 400, "lineHeight": 1.5},
        "button": {"fontFamily": "Inter, system-ui, -apple-system, sans-serif", "fontSize": "16px", "fontWeight": 500, "lineHeight": 1.5}
      }
    },
    "recipes": {
      "header": {
        "base": {"hasCover": false, "avatarSize": "lg", "avatarShape": "circle", "avatarPosition": "center", "contentAlign": "center", "showBio": true, "bioMaxLines": 3, "spacing": "comfortable"}
      },
      "linkItem": {
        "base": {"shape": "rounded", "fill": "solid", "size": "md", "radius": "12px", "padding": "16px 20px", "shadow": "0 1px 2px 0 rgba(0, 0, 0, 0.05)", "iconPosition": "left", "hoverEffect": "lift"}
      },
      "linkGroup": {
        "base": {"gap": "12px"},
        "variants": {"layout": {"list": {"columns": 1}, "cards": {"columns": 1, "cardStyle": "elevated"}, "grid": {"columns": 2}}}
      }
    },
    "page": {
      "layout": {"maxWidth": 480, "pagePadding": 20, "blockGap": 16, "textAlign": "center", "baseFontSize": "M"},
      "defaults": {"linkGroup": {"textAlign": "center", "fontSize": "M", "radius": "12px", "padding": "16px", "shadow": "0 1px 2px 0 rgba(0, 0, 0, 0.05)", "spacing": "comfortable"}},
      "mode": "light"
    },
    "background": {
      "wallpaper": {"kind": "preset", "assetId": 0},
      "effects": {"blur": 0, "dim": 0, "overlayColor": "rgba(0,0,0,0)"}
    },
    "modes": {
      "dark": {
        "semantic": {
          "color": {
            "primary": "#FFFFFF",
            "secondary": "#A3A3A3",
            "text": {"default": "#FFFFFF", "muted": "#A3A3A3", "invert": "#0A0A0A"},
            "border": {"default": "#404040"},
            "divider": "#262626",
            "surface": {"page": "#0A0A0A", "card": "#171717", "overlay": "#262626"}
          }
        }
      }
    }
  }'
)
ON CONFLICT(key) DO UPDATE SET
  config_v2 = excluded.config_v2,
  name = excluded.name;
