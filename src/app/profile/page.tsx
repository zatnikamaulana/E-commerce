'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { authAPI, ordersAPI } from '@/lib/api';
import { User, MapPin, Phone, Mail, Package } from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const { user: authUser, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        postalCode: '',
        address: ''
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth');
            return;
        }
        loadUserData();
        loadOrders();
    }, [isAuthenticated, router]);

    const loadUserData = async () => {
        try {
            const response = await authAPI.getMe();
            if (response.success && response.data) {
                const userData = response.data.user;
                setUser(userData);
                setFormData({
                    name: userData.name || '',
                    phone: userData.phone || '',
                    province: userData.province || '',
                    city: userData.city || '',
                    district: userData.district || '',
                    postalCode: userData.postalCode || '',
                    address: userData.address || ''
                });
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadOrders = async () => {
        try {
            const response = await ordersAPI.getUserOrders();
            if (response.success && response.data) {
                setOrders(response.data.orders || []);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const response = await authAPI.updateProfile(formData);
            if (response.success) {
                alert('Profil berhasil diperbarui!');
                await loadUserData();
            } else {
                alert('Gagal memperbarui profil: ' + response.error);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Terjadi kesalahan saat memperbarui profil');
        } finally {
            setIsSaving(false);
        }
    };

    const isAddressComplete = () => {
        return formData.phone && formData.province && formData.city &&
            formData.district && formData.postalCode && formData.address;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
                    <p className="text-gray-600 mt-2">Kelola informasi profil dan alamat pengiriman Anda</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'profile'
                                        ? 'border-b-2 border-gray-900 text-gray-900'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <User className="w-5 h-5 inline-block mr-2" strokeWidth={1.5} />
                                Informasi Profil
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'orders'
                                        ? 'border-b-2 border-gray-900 text-gray-900'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Package className="w-5 h-5 inline-block mr-2" strokeWidth={1.5} />
                                Riwayat Pesanan
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {activeTab === 'profile' ? (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        {/* Address Status Alert */}
                        {!isAddressComplete() && (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start">
                                    <MapPin className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                                    <div>
                                        <h3 className="font-semibold text-yellow-900">Alamat Belum Lengkap</h3>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Lengkapi alamat pengiriman Anda untuk mempermudah proses checkout.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nama Lengkap *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alamat Pengiriman</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            No HP / WhatsApp *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="08123456789"
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Provinsi *
                                            </label>
                                            <input
                                                type="text"
                                                name="province"
                                                value={formData.province}
                                                onChange={handleInputChange}
                                                placeholder="Contoh: DKI Jakarta"
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Kota / Kabupaten *
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                placeholder="Contoh: Jakarta Selatan"
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Kecamatan *
                                            </label>
                                            <input
                                                type="text"
                                                name="district"
                                                value={formData.district}
                                                onChange={handleInputChange}
                                                placeholder="Contoh: Kebayoran Baru"
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Kode Pos *
                                            </label>
                                            <input
                                                type="text"
                                                name="postalCode"
                                                value={formData.postalCode}
                                                onChange={handleInputChange}
                                                placeholder="12345"
                                                required
                                                maxLength={5}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Detail Alamat Lengkap *
                                        </label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="Nama jalan, nomor rumah, RT/RW, patokan, dll"
                                            required
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Contoh: Jl. Sudirman No. 123, RT 001/RW 002, dekat Indomaret
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        {orders.length > 0 ? (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => router.push(`/orders/${order.id}`)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    Order #{order.id.slice(0, 8)}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'PAID' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {order.items?.length || 0} item
                                        </p>
                                        <p className="font-semibold text-gray-900">
                                            {formatPrice(order.totalPrice)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">Belum ada pesanan</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
