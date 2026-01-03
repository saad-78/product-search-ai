Product Search AI

An AI-powered semantic product search engine that understands natural language queries and delivers highly relevant results using vector embeddings, hybrid ranking, and structured filters.




Features

🤖 Natural Language Search
Search like you speak:
“red jacket under 3000”

🧠 Semantic Understanding
AI understands intent, not just keywords.

🎯 Automatic Smart Filters
Extracts price, size, category, and keywords from queries.

⚡ Vector Search (pgvector)
768-dimensional embeddings with cosine similarity.

🔄 Hybrid Ranking Algorithm
Combines semantic similarity, price relevance, and keyword match.

📱 Responsive UI
Optimized for desktop and mobile devices.

🚀 Ultra-Fast Query Parsing
Powered by Groq AI (LLaMA 3.3 70B).

🏗️ System Architecture
User Query
"red jacket under 3000"
        │
        ▼
┌───────────────────────────┐
│ Query Processing          │
│                           │
│ Groq AI → Extract Filters │
│ Gemini AI → Embeddings    │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ PostgreSQL + pgvector     │
│ Vector Similarity Search  │
│ + SQL Filters             │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Hybrid Ranking Engine     │
│ 0.6 Semantic              │
│ 0.2 Price                 │
│ 0.2 Keyword               │
└─────────────┬─────────────┘
              │
              ▼
       Search Results

🛠️ Tech Stack
Frontend

Next.js 15 (App Router)

TypeScript

Tailwind CSS

shadcn/ui

Lucide Icons

Backend

Next.js API Routes

Prisma ORM

PostgreSQL 16

pgvector

AI / ML

Groq AI – Query parsing

Gemini AI – 768-dim embeddings

Cosine Similarity Search

Infrastructure

Neon – Serverless PostgreSQL

Cloudinary – Image storage

Vercel – Deployment (optional)

🚀 Quick Start
Prerequisites

Node.js 18+

PostgreSQL 16+ with pgvector

Groq API Key

Gemini API Key

Installation
1️⃣ Clone the repository
git clone https://github.com/saad-78/product-search-ai.git
cd product-search-ai

2️⃣ Install dependencies
npm install

3️⃣ Environment variables
cp .env.example .env

# Database
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.neon.tech/db?sslmode=require"

# AI APIs
GROQ_API_KEY="gsk_..."
GEMINI_API_KEY="AIza..."

# Optional
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

4️⃣ Setup database
npx prisma db push
npx prisma generate

5️⃣ Run development server
npm run dev


Open http://localhost:3000
 🎉

📊 Database Schema
model Product {
  id          String   @id @default(cuid())
  title       String
  description String
  price       Float
  size        String?
  category    String
  tags        String[]
  embedding   Unsupported("vector(768)")?
  images      Image[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Image {
  id         String   @id @default(cuid())
  url        String
  storageKey String
  productId  String
  product    Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
}

🔌 API Endpoints
🔍 Search Products

POST /api/search

{
  "query": "red jacket under 3000",
  "limit": 10
}


Response

{
  "success": true,
  "data": [
    {
      "id": "cm5...",
      "title": "Red Denim Jacket",
      "price": 2499,
      "similarity": 0.87,
      "score": 0.92
    }
  ],
  "metadata": {
    "searchType": "hybrid",
    "filters": {
      "priceMax": 3000,
      "keywords": ["red", "jacket"]
    }
  }
}

📦 Products API
Create Product

POST /api/products

{
  "title": "Blue Denim Jacket",
  "description": "Classic blue denim jacket",
  "price": 2499,
  "category": "Clothing",
  "tags": ["denim", "jacket", "casual"]
}

Get Product

GET /api/products/{id}

List Products

GET /api/products?limit=10&offset=0

🎯 How It Works
1️⃣ Query Parsing (Groq AI)
{
  "keywords": ["red", "jacket"],
  "priceMax": 3000,
  "category": "Clothing"
}

2️⃣ Vector Embedding (Gemini)
const embedding = await generateQueryEmbedding("red jacket under 3000");
// 768-dimensional vector

3️⃣ Vector Search (pgvector)
SELECT *,
  1 - (embedding <=> $1::vector) AS similarity
FROM products
WHERE price <= 3000
ORDER BY similarity DESC;

4️⃣ Hybrid Ranking
finalScore =
  semanticScore * 0.6 +
  priceScore * 0.2 +
  keywordScore * 0.2;

📁 Project Structure
product-search-ai/
├── app/
│   ├── api/
│   ├── products/
│   ├── search/
│   └── admin/
├── components/
├── lib/
│   └── ai/
├── prisma/
├── public/
├── .env
└── package.json

🔧 Configuration
Adjust Ranking Weights
semanticScore * 0.6
priceScore    * 0.2
keywordScore  * 0.2

Similarity Threshold
WHERE similarity > 0.5

Embedding Model
model: "embedding-004" // 768 dimensions

🧪 Testing
Test Search API
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"jacket under 3000","limit":5}'

Test Product Creation
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Test Product",
    "description":"Testing the API",
    "price":999,
    "category":"Other",
    "tags":["test"]
  }'
