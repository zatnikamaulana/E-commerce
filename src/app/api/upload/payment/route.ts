import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthToken, getUserFromToken } from '@/lib/auth';

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

        const formData = await request.formData();
        const proofUrl = formData.get('proofUrl') as string;
        const orderId = formData.get('orderId') as string;

        if (!proofUrl) {
            return NextResponse.json(
                { message: 'URL bukti pembayaran tidak ditemukan' },
                { status: 400 }
            );
        }

        if (!orderId) {
            return NextResponse.json(
                { message: 'Order ID tidak ditemukan' },
                { status: 400 }
            );
        }

        // Verify order ownership
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true },
        });

        if (!order) {
            return NextResponse.json(
                { message: 'Order tidak ditemukan' },
                { status: 404 }
            );
        }

        if (order.userId !== payload.userId) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // Update payment with proof URL (from external service like ImgBB)
        await prisma.payment.update({
            where: { orderId },
            data: {
                proofUrl: proofUrl,
                status: 'MENUNGGU',
            },
        });

        return NextResponse.json({
            message: 'Bukti pembayaran berhasil disimpan',
            url: proofUrl,
        });
    } catch (error) {
        console.error('Upload payment proof error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
