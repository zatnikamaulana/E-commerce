import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return NextResponse.json(
                { message: 'Produk tidak ditemukan' },
                { status: 404 }
            );
        }

        // Map imageUrl to image for frontend compatibility
        const mappedProduct = {
            ...product,
            image: product.imageUrl || '',
        };

        return NextResponse.json({ product: mappedProduct });
    } catch (error) {
        console.error('Get product error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
