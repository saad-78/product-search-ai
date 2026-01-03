<div align="center">

# 🔍 Product Search AI

### AI-Powered Semantic Search Engine for Products

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

**Search naturally. Find instantly.**

 · [Report Bug](https://github.com/saad-78/product-search-ai/issues) · [Request Feature](https://github.com/saad-78/product-search-ai/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#️-architecture)
- [Tech Stack](#️-tech-stack)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [How It Works](#-how-it-works)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

An AI-powered semantic product search engine that understands natural language queries and delivers highly relevant results using **vector embeddings**, **hybrid ranking**, and **structured filters**.

### Why This Project?

Traditional keyword search fails to understand user intent. This project leverages modern AI to:
- Understand what users *mean*, not just what they *type*
- Extract structured filters from natural language
- Rank results using multiple signals for better relevance

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🤖 **Natural Language Search**
Search like you speak:
"red jacket under 3000"

text

</td>
<td width="50%">

### 🧠 **Semantic Understanding**
AI understands intent, not just keywords

</td>
</tr>
<tr>
<td width="50%">

### 🎯 **Automatic Smart Filters**
Extracts price, size, category automatically

</td>
<td width="50%">

### ⚡ **Vector Search**
768-dimensional embeddings with pgvector

</td>
</tr>
<tr>
<td width="50%">

### 🔄 **Hybrid Ranking**
Combines semantic + price + keyword signals

</td>
<td width="50%">

### 🚀 **Ultra-Fast**
Powered by Groq AI (LLaMA 3.3 70B)

</td>
</tr>
</table>


---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| ![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js) | React framework with App Router |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript) | Type safety |
| ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss) | Utility-first styling |
| ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-Components-black) | Beautiful UI components |

### Backend
| Technology | Purpose |
|-----------|---------|
| ![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma) | Type-safe database client |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql) | Primary database |
| ![pgvector](https://img.shields.io/badge/pgvector-Extension-purple) | Vector similarity search |

### AI/ML
| Technology | Purpose |
|-----------|---------|
| ![Groq](https://img.shields.io/badge/Groq-AI-orange) | Ultra-fast query parsing |
| ![Gemini](https://img.shields.io/badge/Gemini-AI-blue) | 768-dim text embeddings |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| ![Neon](https://img.shields.io/badge/Neon-Database-green) | Serverless PostgreSQL |
| ![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-3448C5) | Image storage |

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** and npm
- ✅ **PostgreSQL 16+** with pgvector extension
- ✅ **Groq API Key** ([Get one free](https://console.groq.com))
- ✅ **Gemini API Key** ([Get one free](https://aistudio.google.com/apikey))

### Installation

#### 1️⃣ Clone the repository

```
git clone https://github.com/saad-78/product-search-ai.git
cd product-search-ai
2️⃣ Install dependencies
bash
npm install
3️⃣ Configure environment variables
bash
cp .env.example .env
Edit .env with your credentials:

text
# Database (use Neon's POOLED connection string)
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.neon.tech/db?sslmode=require"

# AI API Keys (required)
GROQ_API_KEY="gsk_..."
GEMINI_API_KEY="AIza..."

# Image Storage (optional)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
4️⃣ Setup database
bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate
5️⃣ Run development server
bash
npm run dev
🎉 Open http://localhost:3000

📊 Database Schema
text
model Product {
  id          String                      @id @default(cuid())
  title       String
  description String
  price       Float
  size        String?
  category    String
  tags        String[]
  embedding   Unsupported("vector(768)")? // pgvector column
  images      Image[]
  createdAt   DateTime                    @default(now())
  updatedAt   DateTime                    @updatedAt

  @@index([category])
  @@index([price])
}

model Image {
  id         String   @id @default(cuid())
  url        String
  storageKey String   @unique
  productId  String
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())

  @@index([productId])
}
🔌 API Documentation
🔍 Search Products
Endpoint: POST /api/search

Request:

json
{
  "query": "red jacket under 3000",
  "limit": 10
}
Response:

json
{
  "success": true,
  "data": [
    {
      "id": "cm5abc123",
      "title": "Red Denim Jacket",
      "description": "Classic red denim jacket",
      "price": 2499,
      "category": "Clothing",
      "tags": ["red", "denim", "jacket"],
      "similarity": 0.87,
      "score": 0.92,
      "images": [...]
    }
  ],
  "metadata": {
    "timestamp": "2026-01-04T02:30:00Z",
    "searchMetadata": {
      "query": "red jacket under 3000",
      "filters": {
        "priceMax": 3000,
        "keywords": ["red", "jacket"]
      },
      "resultsCount": 5,
      "searchType": "hybrid"
    }
  }
}
📦 Product Management
Create Product
Endpoint: POST /api/products

json
{
  "title": "Blue Denim Jacket",
  "description": "Classic blue denim jacket perfect for casual wear",
  "price": 2499,
  "size": "M",
  "category": "Clothing",
  "tags": ["denim", "jacket", "casual", "blue"]
}
Get Product
Endpoint: GET /api/products/{id}

List Products
Endpoint: GET /api/products?limit=10&offset=0

Update Product
Endpoint: PUT /api/products/{id}

Delete Product
Endpoint: DELETE /api/products/{id}

🎯 How It Works
Step 1: Query Parsing (Groq AI)
Input: "red jacket under 3000"

Output:

json
{
  "keywords": ["red", "jacket"],
  "priceMax": 3000,
  "priceMin": null,
  "size": null,
  "category": "Clothing"
}
Step 2: Vector Embedding (Gemini AI)
typescript
const embedding = await generateQueryEmbedding("red jacket under 3000");
// Returns: Float32Array(768) [0.234, -0.567, 0.123, ..., 0.892]
Step 3: Vector Search (pgvector)
sql
SELECT 
  p.*,
  1 - (p.embedding <=> '[0.234,-0.567,...]'::vector(768)) as similarity
FROM products p
WHERE 
  p.embedding IS NOT NULL
  AND (1 - (p.embedding <=> '[...]'::vector(768))) > 0.5
  AND p.price <= 3000
ORDER BY similarity DESC
LIMIT 10;
Step 4: Hybrid Ranking
typescript
const semanticScore = similarity; // 0.87
const priceScore = 1 - (price / priceMax); // 0.83
const keywordScore = hasKeywords ? 1 : 0; // 1

const finalScore = 
  (semanticScore * 0.6) +  // 0.522
  (priceScore * 0.2) +     // 0.166
  (keywordScore * 0.2);    // 0.200
  
// Final Score: 0.888
📁 Project Structure
text
product-search-ai/
├── 📁 app/
│   ├── 📁 api/
│   │   ├── 📁 products/
│   │   │   ├── route.ts              # Create/List products
│   │   │   └── 📁 [id]/
│   │   │       └── route.ts          # Get/Update/Delete product
│   │   └── 📁 search/
│   │       └── route.ts              # Search endpoint
│   ├── 📁 products/[id]/
│   │   └── page.tsx                  # Product detail page
│   ├── 📁 search/
│   │   └── page.tsx                  # Search results page
│   ├── 📁 admin/
│   │   └── page.tsx                  # Admin panel
│   └── page.tsx                      # Homepage
├── 📁 components/
│   ├── Header.tsx                    # Navigation header
│   ├── SearchBar.tsx                 # Search input component
│   ├── ProductCard.tsx               # Product card component
│   └── 📁 ui/                        # shadcn/ui components
├── 📁 lib/
│   ├── 📁 ai/
│   │   ├── groq.ts                   # Groq query parsing
│   │   ├── embeddings.ts             # Gemini embeddings
│   │   └── gemini.ts                 # Legacy Gemini functions
│   ├── db.ts                         # Prisma client instance
│   └── 📁 utils/
│       ├── validators.ts             # Zod validation schemas
│       └── errors.ts                 # Error handling utilities
├── 📁 prisma/
│   └── schema.prisma                 # Database schema
├── 📁 public/                        # Static assets
├── .env                              # Environment variables
├── .env.example                      # Environment template
├── package.json                      # Dependencies
└── README.md                         # This file
🔧 Configuration
Adjust Search Ranking Weights
Edit app/api/search/route.ts:

typescript
const finalScore = 
  (semanticScore * 0.6) +    // Semantic similarity weight
  (priceScore * 0.2) +       // Price relevance weight
  (keywordScore * 0.2);      // Keyword match weight
Recommended ranges:

Semantic: 0.5 - 0.7

Price: 0.1 - 0.3

Keyword: 0.1 - 0.3

Change Similarity Threshold
sql
WHERE similarity > 0.5  -- Adjust between 0.0 - 1.0
Guidelines:

0.7+ = Very strict (fewer, more relevant results)

0.5-0.7 = Balanced (recommended)

<0.5 = Loose (more results, less relevant)

Switch Embedding Model
Edit lib/ai/embeddings.ts:

typescript
const model = genAI.getGenerativeModel({ 
  model: 'text-embedding-004'  // Current: 768 dimensions
  // Alternative: 'text-embedding-preview-0815'
});
🧪 Testing
Test Search API
bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "jacket under 3000",
    "limit": 5
  }'
Test Product Creation
bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Product",
    "description": "Testing the API endpoint",
    "price": 999,
    "category": "Other",
    "tags": ["test", "demo"]
  }'
Run Type Checks
bash
npm run type-check
# or
npx tsc --noEmit
