import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import { z } from 'zod';

const addToCartSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
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
        const { productId, quantity } = addToCartSchema.parse(body);

        // Check if product exists and has enough stock
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json(
                { message: 'Produk tidak ditemukan' },
                { status: 404 }
            );
        }

        if (product.stock < quantity) {
            return NextResponse.json(
                { message: 'Stok tidak mencukupi' },
                { status: 400 }
            );
        }

        // Get or create cart
        let cart = await prisma.cart.findUnique({
            where: { userId: payload.userId },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: payload.userId },
            });
        }

        // Check if item already in cart
        const existingItem = await prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId,
                },
            },
        });

        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;

            if (product.stock < newQuantity) {
                return NextResponse.json(
                    { message: 'Stok tidak mencukupi' },
                    { status: 400 }
                );
            }

            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
            });
        } else {
            // Add new item
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                },
            });
        }

        // Get updated cart
        const updatedCart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: 'Produk ditambahkan ke keranjang',
            cart: updatedCart,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Data tidak valid', errors: error.errors },
                { status: 400 }
            );
        }

        console.error('Add to cart error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
