import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import { z } from 'zod';

const updateProductSchema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    category: z
        .enum([
            'kalung',
            'gelang',
            'cincin',
            'anting',
            'kacamata',
            'jam_tangan',
            'kaos_kaki',
            'bandana',
        ])
        .optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().nonnegative().optional(),
    imageUrl: z.string().optional(),
    images: z.array(z.string()).optional(),
});

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const token = getAuthToken(request);
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const payload = getUserFromToken(token);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const data = updateProductSchema.parse(body);

        const product = await prisma.product.update({
            where: { id },
            data,
        });

        return NextResponse.json({
            message: 'Produk berhasil diperbarui',
            product,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Data tidak valid', errors: error.errors },
                { status: 400 }
            );
        }

        console.error('Update product error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const token = getAuthToken(request);
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const payload = getUserFromToken(token);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({
            message: 'Produk berhasil dihapus',
        });
    } catch (error) {
        console.error('Delete product error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
