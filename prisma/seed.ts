import { PrismaClient } from '@prisma/client';
import { generateTextEmbedding } from '@/lib/ai/embeddings';

const prisma = new PrismaClient();

const products = [
  {
    title: 'Blue Denim Jacket',
    description: 'Classic blue denim jacket perfect for casual daily wear. Features button closure, chest pockets, and durable cotton fabric.',
    price: 2499,
    size: 'M',
    category: 'Clothing',
    tags: ['denim', 'jacket', 'casual', 'blue', 'cotton'],
  },
  {
    title: 'Red Cotton T-Shirt',
    description: 'Comfortable red cotton t-shirt with round neck. Soft fabric, perfect for everyday wear.',
    price: 499,
    size: 'L',
    category: 'Clothing',
    tags: ['tshirt', 'red', 'cotton', 'casual'],
  },
  {
    title: 'Black Leather Shoes',
    description: 'Formal black leather shoes with cushioned insole. Ideal for office and formal occasions.',
    price: 3999,
    size: '42',
    category: 'Footwear',
    tags: ['shoes', 'leather', 'formal', 'black'],
  },
  {
    title: 'Wireless Bluetooth Headphones',
    description: 'Premium wireless headphones with noise cancellation, 20-hour battery life, and superior sound quality.',
    price: 1999,
    category: 'Electronics',
    tags: ['headphones', 'wireless', 'bluetooth', 'audio'],
  },
  {
    title: 'Gray Wool Winter Jacket',
    description: 'Warm wool blend jacket for winter. Features hooded design and inner lining for extra warmth.',
    price: 4999,
    size: 'L',
    category: 'Clothing',
    tags: ['jacket', 'winter', 'wool', 'warm', 'gray'],
  },
  {
    title: 'White Canvas Sneakers',
    description: 'Trendy white canvas sneakers with rubber sole. Comfortable for all-day wear.',
    price: 1499,
    size: '40',
    category: 'Footwear',
    tags: ['sneakers', 'canvas', 'white', 'casual', 'comfortable'],
  },
  {
    title: 'Smart Fitness Watch',
    description: 'Advanced fitness tracker with heart rate monitor, step counter, sleep tracking, and 7-day battery life.',
    price: 2999,
    category: 'Electronics',
    tags: ['watch', 'fitness', 'smart', 'health', 'tracker'],
  },
  {
    title: 'Black Leather Wallet',
    description: 'Genuine leather wallet with multiple card slots and bill compartment. Slim design fits comfortably in pocket.',
    price: 799,
    category: 'Accessories',
    tags: ['wallet', 'leather', 'black', 'accessory'],
  },
  {
    title: 'Green Polo Shirt',
    description: 'Classic polo shirt in olive green. Cotton-polyester blend with collar and button placket.',
    price: 899,
    size: 'M',
    category: 'Clothing',
    tags: ['polo', 'shirt', 'green', 'casual', 'collared'],
  },
  {
    title: 'Sports Running Shoes',
    description: 'Lightweight running shoes with breathable mesh upper and cushioned midsole for maximum comfort during workouts.',
    price: 2799,
    size: '43',
    category: 'Footwear',
    tags: ['running', 'shoes', 'sports', 'athletic', 'comfortable'],
  },
  {
    title: 'Brown Leather Belt',
    description: 'Premium brown leather belt with metal buckle. Adjustable size up to 40 inches.',
    price: 599,
    category: 'Accessories',
    tags: ['belt', 'leather', 'brown', 'formal', 'accessory'],
  },
  {
    title: 'Portable Power Bank 20000mAh',
    description: 'High-capacity power bank with dual USB ports and fast charging support. Perfect for travel.',
    price: 1299,
    category: 'Electronics',
    tags: ['powerbank', 'charger', 'portable', 'battery', 'usb'],
  },
  {
    title: 'Navy Blue Formal Trousers',
    description: 'Slim-fit formal trousers in navy blue. Wrinkle-resistant fabric suitable for office wear.',
    price: 1799,
    size: '32',
    category: 'Clothing',
    tags: ['trousers', 'formal', 'navy', 'office', 'pants'],
  },
  {
    title: 'Silver Stainless Steel Watch',
    description: 'Classic analog watch with stainless steel strap and water-resistant casing. Japanese quartz movement.',
    price: 3499,
    category: 'Accessories',
    tags: ['watch', 'silver', 'formal', 'analog', 'steel'],
  },
  {
    title: 'Lightweight Backpack',
    description: 'Durable backpack with laptop compartment and multiple pockets. Water-resistant material.',
    price: 1899,
    category: 'Accessories',
    tags: ['backpack', 'bag', 'laptop', 'travel', 'waterproof'],
  },
];

async function main() {
  console.log('Starting database seed...\n');

  for (const [index, product] of products.entries()) {
    try {
      console.log(`[${index + 1}/${products.length}] Creating: ${product.title}`);

      // Generate embedding
      const textForEmbedding = [
        product.title,
        product.description,
        ...product.tags,
      ].join(' ');

      console.log('  → Generating embedding...');
      const embedding = await generateTextEmbedding(textForEmbedding);

      // Insert with raw SQL to handle pgvector
      await prisma.$executeRaw`
        INSERT INTO products (id, title, description, price, size, category, tags, embedding, "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid()::text,
          ${product.title},
          ${product.description},
          ${product.price},
          ${product.size || null},
          ${product.category},
          ${product.tags}::text[],
          ${`[${embedding.join(',')}]`}::vector(768),
          NOW(),
          NOW()
        )
      `;

      console.log('  ✓ Created successfully\n');

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  ✗ Failed to create ${product.title}:`, error);
    }
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
