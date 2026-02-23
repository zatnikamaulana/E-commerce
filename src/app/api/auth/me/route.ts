import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthToken, getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const token = getAuthToken(request);

        if (!token) {
            return NextResponse.json(
                { message: 'Token tidak ditemukan' },
                { status: 401 }
            );
        }

        const payload = getUserFromToken(token);

        if (!payload) {
            return NextResponse.json(
                { message: 'Token tidak valid' },
                { status: 401 }
            );
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                province: true,
                city: true,
                district: true,
                postalCode: true,
                address: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { message: 'User tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
