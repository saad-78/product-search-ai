import { z } from 'zod';

/**
 * Zod schemas for request validation
 * Provides type safety and runtime validation
 */

export const CreateProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  price: z.number().positive('Price must be positive'),
  size: z.string().optional(),
  category: z.enum(['Clothing', 'Footwear', 'Electronics', 'Accessories', 'Home', 'Sports', 'Other']),
  tags: z.array(z.string()).default([]),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const SearchQuerySchema = z.object({
  query: z.string().min(1, 'Query cannot be empty').max(500),
  limit: z.number().int().positive().max(50).default(10),
});

// Type inference from schemas
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type SearchQueryInput = z.infer<typeof SearchQuerySchema>;
