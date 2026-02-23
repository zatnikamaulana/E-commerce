import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
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
        const file = formData.get('file') as File;
        const orderId = formData.get('orderId') as string;

        if (!file) {
            return NextResponse.json(
                { message: 'File tidak ditemukan' },
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

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${orderId}-${Date.now()}.${fileExt}`;
        const filePath = `payment-proofs/${fileName}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json(
                { message: 'Gagal upload file' },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(filePath);

        // Update payment with proof URL
        await prisma.payment.update({
            where: { orderId },
            data: {
                proofUrl: urlData.publicUrl,
                status: 'MENUNGGU',
            },
        });

        return NextResponse.json({
            message: 'Bukti pembayaran berhasil diupload',
            url: urlData.publicUrl,
        });
    } catch (error) {
        console.error('Upload payment proof error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
