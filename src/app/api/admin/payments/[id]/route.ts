import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import { z } from 'zod';

const updatePaymentSchema = z.object({
    status: z.enum(['MENUNGGU', 'DITERIMA', 'DITOLAK']),
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
        const { status } = updatePaymentSchema.parse(body);

        const payment = await prisma.payment.update({
            where: { id },
            data: { status },
            include: {
                order: true,
            },
        });

        // Update order status based on payment status
        if (status === 'DITERIMA') {
            await prisma.order.update({
                where: { id: payment.orderId },
                data: { status: 'PAID' },
            });
        } else if (status === 'DITOLAK') {
            await prisma.order.update({
                where: { id: payment.orderId },
                data: { status: 'CANCELLED' },
            });
        }

        return NextResponse.json({
            message: 'Status pembayaran berhasil diperbarui',
            payment,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Data tidak valid', errors: error.errors },
                { status: 400 }
            );
        }

        console.error('Update payment error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
