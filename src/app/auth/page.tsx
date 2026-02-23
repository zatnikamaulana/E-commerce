'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { useAuth } from '@/lib/AuthContext';

interface LoginForm {
    email: string;
    password: string;
}

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export default function AuthPage() {
    const router = useRouter();
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loginForm, setLoginForm] = useState<LoginForm>({
        email: '',
        password: ''
    });
    const [registerForm, setRegisterForm] = useState<RegisterForm>({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginForm(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRegisterForm(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const result = await login(loginForm.email, loginForm.password);

            if (result.success) {
                // Login berhasil - redirect ke admin jika admin, atau home jika user
                // Cek role dari email (admin email mengandung 'admin')
                if (loginForm.email.includes('admin')) {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            } else {
                setError(result.message || 'Login gagal. Periksa email dan password Anda.');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Pastikan backend berjalan di http://localhost:5000');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (registerForm.password !== registerForm.confirmPassword) {
            setError('Password tidak cocok!');
            return;
        }

        if (registerForm.password.length < 6) {
            setError('Password minimal 6 karakter!');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await register(
                registerForm.name,
                registerForm.email,
                registerForm.password
            );

            if (result.success) {
                // Register berhasil - redirect ke home
                router.push('/');
            } else {
                setError(result.message || 'Registrasi gagal. Email mungkin sudah terdaftar.');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Pastikan backend berjalan di http://localhost:5000');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">1998ACCESSORIES</h1>
                    <h2 className="mt-6 text-2xl font-semibold text-gray-700">
                        {isLogin ? 'Masuk ke Akun Anda' : 'Buat Akun Baru'}
                    </h2>
                    <p className="mt-2 text-gray-600">
                        {isLogin
                            ? 'Belum punya akun?'
                            : 'Sudah punya akun?'
                        }
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            className="ml-1 font-medium text-gray-900 hover:text-gray-700"
                        >
                            {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
                        </button>
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded-md">
                            <p className="text-sm text-gray-800">{error}</p>
                        </div>
                    )}

                    {/* Info untuk Admin */}
                    {isLogin && (
                        <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded-md">
                            <p className="text-xs text-gray-800 font-medium mb-1">Akun Admin:</p>
                            <p className="text-xs text-gray-700">Email: admin@tokoaksesoris.com</p>
                            <p className="text-xs text-gray-700">Password: admin123</p>
                        </div>
                    )}

                    {isLogin ? (
                        /* Login Form */
                        <form onSubmit={handleLoginSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={loginForm.email}
                                    onChange={handleLoginChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    placeholder="nama@email.com"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    required
                                    value={loginForm.password}
                                    onChange={handleLoginChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    placeholder="Masukkan password"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                        Ingat saya
                                    </label>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </span>
                                ) : 'Masuk'}
                            </Button>
                        </form>
                    ) : (
                        /* Register Form */
                        <form onSubmit={handleRegisterSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={registerForm.name}
                                    onChange={handleRegisterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    placeholder="Nama lengkap"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="reg-email"
                                    name="email"
                                    required
                                    value={registerForm.email}
                                    onChange={handleRegisterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    placeholder="nama@email.com"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="reg-password"
                                    name="password"
                                    required
                                    value={registerForm.password}
                                    onChange={handleRegisterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    placeholder="Minimal 6 karakter"
                                    minLength={6}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Konfirmasi Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    required
                                    value={registerForm.confirmPassword}
                                    onChange={handleRegisterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    placeholder="Ulangi password"
                                    minLength={6}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="agree-terms"
                                    name="agree-terms"
                                    type="checkbox"
                                    required
                                    className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded"
                                />
                                <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700">
                                    Saya setuju dengan syarat dan ketentuan
                                </label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </span>
                                ) : 'Daftar'}
                            </Button>
                        </form>
                    )}
                </div>

                {/* Info Backend */}
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        Pastikan backend berjalan di http://localhost:5000
                    </p>
                </div>
            </div>
        </div>
    );
}
