import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import { z } from 'zod';

const createOrderSchema = z.object({
    items: z.array(
        z.object({
            productId: z.string(),
            quantity: z.number().int().positive(),
        })
    ),
    paymentMethod: z.string(),
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
        const { items, paymentMethod } = createOrderSchema.parse(body);

        // Get user with address
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user) {
            return NextResponse.json(
                { message: 'User tidak ditemukan' },
                { status: 404 }
            );
        }

        // Validate address is complete
        if (
            !user.phone ||
            !user.province ||
            !user.city ||
            !user.district ||
            !user.postalCode ||
            !user.address
        ) {
            return NextResponse.json(
                { message: 'Lengkapi alamat Anda terlebih dahulu di halaman profil' },
                { status: 400 }
            );
        }

        // Validate products and calculate total
        let totalPrice = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product) {
                return NextResponse.json(
                    { message: `Produk ${item.productId} tidak ditemukan` },
                    { status: 404 }
                );
            }

            if (product.stock < item.quantity) {
                return NextResponse.json(
                    { message: `Stok ${product.name} tidak mencukupi` },
                    { status: 400 }
                );
            }

            totalPrice += product.price * item.quantity;
            orderItems.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
            });
        }

        // Create order with address from user profile
        const order = await prisma.order.create({
            data: {
                userId: payload.userId,
                totalPrice,
                paymentMethod,
                customerName: user.name,
                customerPhone: user.phone,
                customerAddress: `${user.address}, ${user.district}, ${user.city}, ${user.province} ${user.postalCode}`,
                items: {
                    create: orderItems,
                },
                payment: {
                    create: {
                        paymentMethod,
                        status: 'MENUNGGU',
                    },
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                payment: true,
            },
        });

        // Update product stock
        for (const item of items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                },
            });
        }

        // Clear cart
        const cart = await prisma.cart.findUnique({
            where: { userId: payload.userId },
        });

        if (cart) {
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
        }

        return NextResponse.json({
            message: 'Order berhasil dibuat',
            order,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Data tidak valid', errors: error.errors },
                { status: 400 }
            );
        }

        console.error('Create order error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
