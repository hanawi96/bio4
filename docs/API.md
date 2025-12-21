# API Documentation

Base URL: `https://api.your-domain.com`

## Endpoints

### Public Bio

#### GET /bio/:username
Get public bio page data (only published pages)

**Response:**
```json
{
  "page": {
    "id": 1,
    "username": "demo",
    "title": "Demo User",
    "bio": "This is my bio",
    "avatar_url": "https://...",
    "theme_preset_key": "minimal",
    "theme_mode": "light"
  },
  "groups": [
    {
      "id": 1,
      "title": "My Links",
      "layout_type": "list",
      "links": [
        { "id": 1, "title": "Website", "url": "https://..." }
      ]
    }
  ],
  "blocks": [],
  "theme": { "backgroundColor": "#fff", ... }
}
```

### Editor

#### GET /editor/:username
Get full editor data (all page data)

#### PUT /editor/:username
Update page settings

**Request:**
```json
{
  "title": "My Name",
  "bio": "My bio text",
  "avatar_url": "https://...",
  "theme_preset_key": "dark",
  "theme_mode": "dark",
  "status": "published"
}
```

### Links

#### GET /links/groups/:username
Get all link groups with links

#### POST /links/groups/:username
Create new link group

**Request:**
```json
{
  "title": "Social Links",
  "layout_type": "list",
  "sort_order": 0
}
```

#### PUT /links/groups/:groupId
Update link group

#### DELETE /links/groups/:groupId
Delete link group (cascades to links)

#### POST /links/:groupId
Create new link in group

**Request:**
```json
{
  "title": "Twitter",
  "url": "https://twitter.com/username",
  "icon_url": "https://...",
  "sort_order": 0
}
```

#### PUT /links/:linkId
Update link

#### DELETE /links/:linkId
Delete link

### Blocks

#### GET /blocks/:username
Get all blocks for a page

#### POST /blocks/:username
Create new block

**Request:**
```json
{
  "type": "text",
  "content": { "text": "Hello world" },
  "sort_order": 0
}
```

#### PUT /blocks/:blockId
Update block

#### DELETE /blocks/:blockId
Delete block

### Themes

#### GET /themes
Get all theme presets

#### GET /themes/:key
Get single theme preset

### Upload

#### POST /upload
Upload image to R2

**Request:** multipart/form-data
- `file`: Image file (jpg, png, webp, gif)
- `user_id`: Optional user ID

**Response:**
```json
{
  "url": "https://r2.domain.com/abc123.jpg",
  "storage_key": "abc123.jpg"
}
```

#### DELETE /upload/:storageKey
Delete image from R2

## Error Responses

```json
{ "error": "Error message" }
```

Status codes:
- 400: Bad request / validation error
- 404: Not found
- 500: Server error
