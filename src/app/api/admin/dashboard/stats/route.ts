import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthToken, getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const token = getAuthToken(request);
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const payload = getUserFromToken(token);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // Get stats
        const [
            totalProducts,
            totalOrders,
            totalUsers,
            pendingPayments,
            lowStockProducts,
            orders,
        ] = await Promise.all([
            prisma.product.count(),
            prisma.order.count(),
            prisma.user.count(),
            prisma.payment.count({ where: { status: 'MENUNGGU' } }),
            prisma.product.count({ where: { stock: { lte: 10 } } }),
            prisma.order.findMany({
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                    payment: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
        ]);

        // Calculate total revenue
        const paidOrders = await prisma.order.findMany({
            where: { status: 'PAID' },
            select: { totalPrice: true },
        });
        const totalRevenue = paidOrders.reduce(
            (sum, order) => sum + order.totalPrice,
            0
        );

        // Get orders by status
        const ordersByStatus = await prisma.order.groupBy({
            by: ['status'],
            _count: {
                status: true,
            },
        });

        return NextResponse.json({
            stats: {
                totalProducts,
                totalOrders,
                totalUsers,
                totalRevenue,
                pendingPayments,
                lowStockProducts,
            },
            recentOrders: orders,
            ordersByStatus: ordersByStatus.map((item) => ({
                status: item.status,
                count: item._count.status,
            })),
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
