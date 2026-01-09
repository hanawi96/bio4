-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(page_id, email),
  FOREIGN KEY (page_id) REFERENCES bio_pages(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscribers_page_id ON subscribers(page_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
