-- Seed data: Theme presets
INSERT INTO theme_presets (key, name, config) VALUES 
('minimal', 'Minimal', '{"backgroundColor":"#ffffff","textColor":"#000000","primaryColor":"#3b82f6","fontFamily":"Inter","borderRadius":8,"spacing":16}'),
('dark', 'Dark', '{"backgroundColor":"#1a1a1a","textColor":"#ffffff","primaryColor":"#60a5fa","fontFamily":"Inter","borderRadius":12,"spacing":20}'),
('gradient', 'Gradient', '{"backgroundColor":"linear-gradient(135deg, #667eea 0%, #764ba2 100%)","textColor":"#ffffff","primaryColor":"#ffffff","fontFamily":"Poppins","borderRadius":16,"spacing":24}');

-- Demo user
INSERT INTO users (email, password_hash, display_name) VALUES 
('demo@example.com', '$2a$10$dummyhash', 'Demo User');

-- Demo page
INSERT INTO bio_pages (user_id, username, title, bio, theme_preset_key) VALUES 
(1, 'demo', 'Demo User', 'This is a demo bio link', 'minimal');

-- Demo link group
INSERT INTO link_groups (page_id, title, layout_type, sort_order) VALUES 
(1, 'My Links', 'list', 0);

-- Demo links
INSERT INTO links (group_id, title, url, sort_order) VALUES 
(1, 'Website', 'https://example.com', 0),
(1, 'Twitter', 'https://twitter.com/demo', 1),
(1, 'GitHub', 'https://github.com/demo', 2);
