import { Product } from '@/types';

// TIDAK ADA DATA DUMMY
// Semua produk harus ditambahkan melalui Admin Dashboard
export const products: Product[] = [];

// Categories untuk dropdown dan filter
export const categories = ['kalung', 'gelang', 'cincin', 'anting', 'kacamata', 'jam_tangan', 'kaos_kaki', 'bandana'] as const;

export type CategoryType = typeof categories[number];