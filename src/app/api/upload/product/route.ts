import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken, getUserFromToken } from '@/lib/auth';

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

        // This endpoint expects image URL from external service (ImgBB, Imgur, etc)
        const body = await request.json();
        const { imageUrl } = body;

        if (!imageUrl) {
            return NextResponse.json(
                { message: 'URL gambar tidak ditemukan' },
                { status: 400 }
            );
        }

        // Return the URL directly
        return NextResponse.json({
            message: 'URL gambar berhasil disimpan',
            url: imageUrl,
        });
    } catch (error) {
        console.error('Upload product image error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
