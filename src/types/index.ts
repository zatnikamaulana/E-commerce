export interface Product {
    id: string;
    name: string;
    category: 'kalung' | 'gelang' | 'cincin' | 'anting' | 'kacamata' | 'jam_tangan' | 'kaos_kaki' | 'bandana';
    price: number;
    image: string;
    images?: string[]; // Array of image URLs for slider
    description: string;
    stock: number;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Order {
    id: string;
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    items: CartItem[];
    total: number;
    paymentMethod: 'cod' | 'transfer';
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
    createdAt: Date;
}

export type CategoryType = 'kalung' | 'gelang' | 'cincin' | 'anting' | 'kacamata' | 'jam_tangan' | 'kaos_kaki' | 'bandana';