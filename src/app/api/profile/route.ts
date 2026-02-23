import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import { z } from 'zod';

const updateProfileSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    province: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    postalCode: z.string().optional(),
    address: z.string().optional(),
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
        const data = updateProfileSchema.parse(body);

        const user = await prisma.user.update({
            where: { id: payload.userId },
            data,
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
            },
        });

        return NextResponse.json({
            message: 'Profil berhasil diperbarui',
            user,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Data tidak valid', errors: error.errors },
                { status: 400 }
            );
        }

        console.error('Update profile error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
