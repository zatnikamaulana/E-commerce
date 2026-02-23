// API Configuration - Now using Next.js API Routes
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Types
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface ProductRequest {
    name: string;
    description: string;
    category: string;
    price: number;
    stock: number;
    imageUrl?: string;
    images?: string[];
}

// Auth utilities
export const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
};

export const setAuthToken = (token: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
    }
};

export const removeAuthToken = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
    }
};

// API request helper
const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> => {
    const token = getAuthToken();

    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    try {
        console.log('API Request:', {
            url: `${API_BASE_URL}${endpoint}`,
            method: options.method || 'GET',
            body: options.body
        });

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        console.log('API Response:', {
            status: response.status,
            ok: response.ok,
            data
        });

        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        // Wrap response in ApiResponse format
        return {
            success: true,
            data: data,
            message: data.message
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

// Authentication API
export const authAPI = {
    login: async (credentials: LoginRequest) => {
        const response = await apiRequest<{ user: any; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        if (response.success && response.data?.token) {
            setAuthToken(response.data.token);
        }

        return response;
    },

    register: async (userData: RegisterRequest) => {
        return apiRequest<{ user: any; token: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    getMe: async () => {
        return apiRequest<{ user: any }>('/auth/me');
    },

    updateProfile: async (profileData: {
        name?: string;
        phone?: string;
        province?: string;
        city?: string;
        district?: string;
        postalCode?: string;
        address?: string;
    }) => {
        return apiRequest<{ user: any }>('/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    },

    logout: () => {
        removeAuthToken();
    },
};

// Products API
export const productsAPI = {
    getAll: async (params?: { category?: string; search?: string }) => {
        const searchParams = new URLSearchParams();
        if (params?.category) searchParams.append('category', params.category);
        if (params?.search) searchParams.append('search', params.search);

        const query = searchParams.toString();
        return apiRequest<{ products: any[] }>(`/products${query ? `?${query}` : ''}`);
    },

    getById: async (id: string) => {
        return apiRequest<{ product: any }>(`/products/${id}`);
    },

    create: async (productData: ProductRequest) => {
        return apiRequest<{ product: any }>('/admin/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
    },

    update: async (id: string, productData: Partial<ProductRequest>) => {
        return apiRequest<{ product: any }>(`/admin/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
        });
    },

    delete: async (id: string) => {
        return apiRequest<{}>(`/admin/products/${id}`, {
            method: 'DELETE',
        });
    },
};

// Admin API
export const adminAPI = {
    getProducts: async () => {
        return apiRequest<{ products: any[] }>('/products');
    },

    getOrders: async () => {
        return apiRequest<{ orders: any[] }>('/admin/orders');
    },

    getUsers: async () => {
        return apiRequest<{ users: any[] }>('/admin/users');
    },
};

// Payments API
export const paymentsAPI = {
    getAll: async (params?: { search?: string; status?: string }) => {
        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.append('search', params.search);
        if (params?.status) searchParams.append('status', params.status);

        const query = searchParams.toString();
        return apiRequest<{ payments: any[] }>(`/admin/payments${query ? `?${query}` : ''}`);
    },

    getById: async (id: string) => {
        return apiRequest<{ payment: any }>(`/admin/payments/${id}`);
    },

    updateStatus: async (id: string, data: { status: string }) => {
        return apiRequest<{ payment: any }>(`/admin/payments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // User endpoints
    getByOrderId: async (orderId: string) => {
        return apiRequest<{ payment: any }>(`/payments/order/${orderId}`);
    },

    uploadProof: async (orderId: string, proofImage: File) => {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append('orderId', orderId);
        formData.append('file', proofImage);

        try {
            const response = await fetch(`${API_BASE_URL}/upload/payment`, {
                method: 'POST',
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error('Upload proof error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    },
};

// Users API
export const usersAPI = {
    getAll: async (params?: { search?: string }) => {
        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.append('search', params.search);

        const query = searchParams.toString();
        return apiRequest<{ users: any[] }>(`/admin/users${query ? `?${query}` : ''}`);
    },

    getById: async (id: string) => {
        return apiRequest<{ user: any }>(`/admin/users/${id}`);
    },
};

// Cart API
export const cartAPI = {
    get: async () => {
        return apiRequest<{ cart: any }>('/cart');
    },

    add: async (productId: string, quantity: number) => {
        return apiRequest<{ cart: any }>('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity }),
        });
    },

    update: async (itemId: string, quantity: number) => {
        return apiRequest<{ cart: any }>('/cart/update', {
            method: 'PUT',
            body: JSON.stringify({ itemId, quantity }),
        });
    },

    remove: async (itemId: string) => {
        return apiRequest<{ cart: any }>('/cart/remove', {
            method: 'DELETE',
            body: JSON.stringify({ itemId }),
        });
    },
};

// Orders API
export const ordersAPI = {
    create: async (orderData: {
        paymentMethod: string;
        items: any[];
    }) => {
        return apiRequest<{ order: any }>('/orders/create', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    },

    getUserOrders: async () => {
        return apiRequest<{ orders: any[] }>('/orders');
    },

    getAll: async () => {
        return apiRequest<{ orders: any[] }>('/orders');
    },

    getById: async (id: string) => {
        return apiRequest<{ order: any }>(`/orders/${id}`);
    },

    // Admin endpoints
    admin: {
        getAll: async (params?: { search?: string; status?: string }) => {
            const searchParams = new URLSearchParams();
            if (params?.search) searchParams.append('search', params.search);
            if (params?.status) searchParams.append('status', params.status);

            const query = searchParams.toString();
            return apiRequest<{ orders: any[] }>(`/admin/orders${query ? `?${query}` : ''}`);
        },

        getById: async (id: string) => {
            return apiRequest<{ order: any }>(`/admin/orders/${id}`);
        },

        updateStatus: async (id: string, data: { status: string; trackingNumber?: string }) => {
            return apiRequest<{ order: any }>(`/admin/orders/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
        },
    },
};

// Health check (removed - not needed for Next.js API Routes)

// Dashboard API
export const dashboardAPI = {
    getStats: async () => {
        return apiRequest<{
            stats: {
                totalProducts: number;
                totalOrders: number;
                totalUsers: number;
                totalRevenue: number;
                pendingPayments: number;
                lowStockProducts: number;
            };
            recentOrders: any[];
            ordersByStatus: any[];
        }>('/admin/dashboard/stats');
    }
};
