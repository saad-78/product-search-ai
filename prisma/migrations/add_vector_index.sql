-- Create HNSW index for fast vector similarity search
-- This reduces query time from ~650ms to ~1.5ms on large datasets

CREATE INDEX IF NOT EXISTS products_embedding_idx 
ON products 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Create indexes for filtering (used in hybrid search)
CREATE INDEX IF NOT EXISTS products_price_idx ON products (price);
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products ("createdAt" DESC);

-- Create GIN index for tags array (for keyword matching)
CREATE INDEX IF NOT EXISTS products_tags_idx ON products USING GIN (tags);
