import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import { z } from 'zod';

const createProductSchema = z.object({
    name: z.string().min(2),
    description: z.string(),
    category: z.enum([
        'kalung',
        'gelang',
        'cincin',
        'anting',
        'kacamata',
        'jam_tangan',
        'kaos_kaki',
        'bandana',
    ]),
    price: z.number().positive(),
    stock: z.number().int().nonnegative(),
    imageUrl: z.string().optional(),
    images: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const token = getAuthToken(request);
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const payload = getUserFromToken(token);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const data = createProductSchema.parse(body);

        const product = await prisma.product.create({
            data: {
                ...data,
                images: data.images || [],
            },
        });

        return NextResponse.json({
            message: 'Produk berhasil ditambahkan',
            product,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Data tidak valid', errors: error.errors },
                { status: 400 }
            );
        }

        console.error('Create product error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
