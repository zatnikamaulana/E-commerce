import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import { z } from 'zod';

const updateCartSchema = z.object({
    itemId: z.string(),
    quantity: z.number().int().positive(),
});

export async function PUT(request: NextRequest) {
    try {
        const token = getAuthToken(request);
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const payload = getUserFromToken(token);
        if (!payload) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        const { itemId, quantity } = updateCartSchema.parse(body);

        // Get cart item
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: itemId },
            include: {
                cart: true,
                product: true,
            },
        });

        if (!cartItem) {
            return NextResponse.json(
                { message: 'Item tidak ditemukan' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (cartItem.cart.userId !== payload.userId) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // Check stock
        if (cartItem.product.stock < quantity) {
            return NextResponse.json(
                { message: 'Stok tidak mencukupi' },
                { status: 400 }
            );
        }

        // Update quantity
        await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
        });

        // Get updated cart
        const updatedCart = await prisma.cart.findUnique({
            where: { id: cartItem.cartId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: 'Keranjang diperbarui',
            cart: updatedCart,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Data tidak valid', errors: error.errors },
                { status: 400 }
            );
        }

        console.error('Update cart error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
