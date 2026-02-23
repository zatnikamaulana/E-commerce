'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminNavbar from '@/components/AdminNavbar';
import Button from '@/components/Button';
import { useAuth } from '@/lib/AuthContext';
import { productsAPI, getAuthToken } from '@/lib/api';
import { categories } from '@/data/products';
import { Product, CategoryType } from '@/types';

export default function AdminNewPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'kalung' as CategoryType,
        price: '0',
        image: '',
        description: '',
        stock: '0'
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setIsLoading(true);
        setError(null);

        try {
            setIsOnline(true);
            const productsResponse = await productsAPI.getAll();
            if (productsResponse.success && productsResponse.data) {
                setProducts(productsResponse.data.products || []);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            setIsOnline(false);
            setError('Gagal memuat produk');
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'kalung',
            price: '0',
            image: '',
            description: '',
            stock: '0'
        });
        setSelectedFile(null);
        setSelectedFiles([]);
        setImageUrls([]);
        setCurrentImageUrl('');
        setUploadMode('url');
        setEditingProduct(null);
    };

    const openModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name || '',
                category: product.category || 'kalung',
                price: product.price ? product.price.toString() : '0',
                image: product.image || '',
                description: product.description || '',
                stock: product.stock ? product.stock.toString() : '0'
            });
            // Load existing images if available
            if (product.images && product.images.length > 0) {
                setImageUrls(product.images);
            }
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files);
            setSelectedFiles(filesArray);
        }
    };

    const handleAddImageUrl = () => {
        if (currentImageUrl.trim()) {
            setImageUrls([...imageUrls, currentImageUrl.trim()]);
            setCurrentImageUrl('');
        }
    };

    const handleRemoveImageUrl = (index: number) => {
        setImageUrls(imageUrls.filter((_, i) => i !== index));
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const uploadMultipleImages = async (): Promise<string[]> => {
        if (selectedFiles.length === 0) return [];

        setIsUploading(true);
        const uploadedUrls: string[] = [];

        try {
            for (const file of selectedFiles) {
                const formDataUpload = new FormData();
                formDataUpload.append('file', file);

                const token = getAuthToken();
                console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

                const response = await fetch('/api/upload/product', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formDataUpload
                });

                const data = await response.json();
                console.log('Upload response:', { status: response.status, data });

                if (response.ok && data.url) {
                    uploadedUrls.push(data.url);
                    console.log('Upload success:', data.url);
                } else {
                    const errorMsg = data.error || data.message || 'Upload gagal';
                    const errorDetails = data.details ? `\nDetails: ${data.details}` : '';
                    throw new Error(errorMsg + errorDetails);
                }
            }

            return uploadedUrls;
        } catch (error) {
            console.error('Upload error:', error);
            alert('Gagal upload gambar: ' + (error instanceof Error ? error.message : 'Unknown error'));
            return [];
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isOnline) {
            alert('Backend tidak terhubung');
            return;
        }

        let finalImages: string[] = [];

        // Validate images
        if (uploadMode === 'file') {
            if (selectedFiles.length === 0) {
                alert('Silakan pilih minimal 1 gambar untuk diupload');
                return;
            }
            // Upload files
            setIsUploading(true);
            const uploadedUrls = await uploadMultipleImages();
            setIsUploading(false);

            if (uploadedUrls.length === 0) {
                alert('Upload gambar gagal. Silakan coba lagi.');
                return;
            }
            finalImages = uploadedUrls;
        } else if (uploadMode === 'url') {
            if (imageUrls.length === 0) {
                // Allow empty images (optional)
                finalImages = [];
            } else {
                finalImages = imageUrls;
            }
        }

        const productData: any = {
            name: formData.name.trim(),
            category: formData.category,
            price: parseFloat(formData.price) || 0,
            description: formData.description.trim(),
            stock: parseInt(formData.stock) || 0
        };

        // Add images if available
        if (finalImages.length > 0) {
            productData.imageUrl = finalImages[0];
            productData.images = finalImages;
        }

        console.log('=== SUBMITTING PRODUCT ===');
        console.log('Product Data:', JSON.stringify(productData, null, 2));
        console.log('Images:', finalImages);

        try {
            let response;
            if (editingProduct) {
                console.log('Updating product:', editingProduct.id);
                response = await productsAPI.update(editingProduct.id, productData);
            } else {
                console.log('Creating new product');
                response = await productsAPI.create(productData);
            }

            console.log('API Response:', response);

            if (response.success) {
                alert(editingProduct ? 'Produk berhasil diupdate!' : 'Produk berhasil ditambahkan!');
                await loadProducts();
                closeModal();
            } else {
                const errorMsg = response.error || response.message || 'Gagal menyimpan produk';
                console.error('API Error:', errorMsg);
                alert('Error: ' + errorMsg + '\n\nCek console browser (F12) untuk detail.');
            }
        } catch (error) {
            console.error('=== CATCH ERROR ===');
            console.error('Error:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nCek console browser (F12) untuk detail.`);
        }
    };

    const handleDelete = async (productId: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

        try {
            const response = await productsAPI.delete(productId);
            if (response.success) {
                alert('Produk berhasil dihapus!');
                await loadProducts();
            } else {
                throw new Error(response.error || 'Gagal menghapus produk');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    if (isLoading) {
        return (
            <>
                <AdminNavbar />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat dashboard admin...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <AdminNavbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
                                <p className="text-gray-600 mt-2">Kelola produk toko Anda</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                    <span className="text-sm text-gray-600">
                                        {isOnline ? 'Terhubung' : 'Terputus'}
                                    </span>
                                </div>
                                <Button onClick={() => openModal()} disabled={!isOnline}>
                                    Tambah Produk
                                </Button>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                                <p className="text-sm text-gray-800">⚠️ {error}</p>
                            </div>
                        )}
                    </div>

                    {/* Products Table */}
                    {products.length > 0 ? (
                        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Daftar Produk ({products.length})</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {products.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-12 w-12">
                                                            {product.image && typeof product.image === 'string' && product.image.trim().length > 0 ? (
                                                                <Image
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    width={48}
                                                                    height={48}
                                                                    className="h-12 w-12 rounded-lg object-cover"
                                                                    unoptimized
                                                                />
                                                            ) : (
                                                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                                                    <span className="text-2xl">📷</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                            <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{formatPrice(product.price)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.stock > 10 ? 'bg-green-100 text-green-800' :
                                                        product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {product.stock} unit
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium space-x-2">
                                                    <button onClick={() => openModal(product)} className="text-gray-700 hover:text-gray-900">
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id)} className="text-gray-700 hover:text-gray-900">
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <p className="text-xl text-gray-500">Belum ada produk</p>
                            <p className="text-gray-400 mt-2">Klik tombol "Tambah Produk" untuk mulai</p>
                        </div>
                    )}
                </div>

                {/* MODAL POPUP */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                                    </h3>
                                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-3xl">
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nama Produk *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name || ''}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Contoh: Kalung Mutiara"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Kategori *
                                            </label>
                                            <select
                                                name="category"
                                                value={formData.category || 'kalung'}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Harga (IDR) *
                                            </label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price || '0'}
                                                onChange={handleInputChange}
                                                required
                                                min="0"
                                                placeholder="50000"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Stok *
                                            </label>
                                            <input
                                                type="number"
                                                name="stock"
                                                value={formData.stock || '0'}
                                                onChange={handleInputChange}
                                                required
                                                min="0"
                                                placeholder="10"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                                            />
                                        </div>
                                    </div>

                                    {/* UPLOAD MODE - MULTIPLE IMAGES */}
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Gambar Produk (Multiple Images)
                                            </label>
                                            {uploadMode === 'url' && imageUrls.length > 0 && (
                                                <span className="text-sm font-semibold text-green-600">
                                                    ✓ {imageUrls.length} gambar siap
                                                </span>
                                            )}
                                            {uploadMode === 'file' && selectedFiles.length > 0 && (
                                                <span className="text-sm font-semibold text-green-600">
                                                    ✓ {selectedFiles.length} file siap upload
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex space-x-4 mb-4">
                                            <button
                                                type="button"
                                                onClick={() => setUploadMode('url')}
                                                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${uploadMode === 'url'
                                                    ? 'bg-gray-900 text-white shadow-lg scale-105'
                                                    : 'bg-white text-gray-700 border-2 border-gray-300'
                                                    }`}
                                            >
                                                Link URL
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setUploadMode('file')}
                                                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${uploadMode === 'file'
                                                    ? 'bg-gray-900 text-white shadow-lg scale-105'
                                                    : 'bg-white text-gray-700 border-2 border-gray-300'
                                                    }`}
                                            >
                                                Upload File
                                            </button>
                                        </div>

                                        {uploadMode === 'url' ? (
                                            <div className="space-y-4">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="url"
                                                        value={currentImageUrl}
                                                        onChange={(e) => setCurrentImageUrl(e.target.value)}
                                                        placeholder="https://example.com/image.jpg"
                                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleAddImageUrl();
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleAddImageUrl}
                                                        className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold"
                                                    >
                                                        Tambah
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-600">Paste URL gambar dan klik Tambah (bisa multiple)</p>

                                                {/* Image URLs List */}
                                                {imageUrls.length > 0 && (
                                                    <div className="space-y-2 mt-4">
                                                        <p className="text-sm font-medium text-gray-700">Gambar yang ditambahkan ({imageUrls.length}):</p>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {imageUrls.map((url, index) => (
                                                                <div key={index} className="relative group">
                                                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                                                        <Image
                                                                            src={url}
                                                                            alt={`Preview ${index + 1}`}
                                                                            width={200}
                                                                            height={200}
                                                                            className="w-full h-full object-cover"
                                                                            unoptimized
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveImageUrl(index)}
                                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                    <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                                                                        {index + 1}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                                                    <p className="text-sm text-blue-800 font-medium">
                                                        💡 Tips: Pilih multiple files sekaligus dengan Ctrl+Click (Windows) atau Cmd+Click (Mac)
                                                    </p>
                                                </div>

                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleFileChange}
                                                    key={uploadMode}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white cursor-pointer hover:border-gray-400 transition-colors"
                                                />
                                                <p className="text-xs text-gray-600">
                                                    Format: JPG, PNG, WebP | Max: 5MB per file | Bisa pilih multiple files
                                                </p>

                                                {/* Selected Files List */}
                                                {selectedFiles.length > 0 && (
                                                    <div className="space-y-2 mt-4">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-medium text-gray-700">
                                                                File yang dipilih ({selectedFiles.length}):
                                                            </p>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedFiles([])}
                                                                className="text-xs text-red-600 hover:text-red-800 font-medium"
                                                            >
                                                                Hapus Semua
                                                            </button>
                                                        </div>
                                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                                            {selectedFiles.map((file, index) => (
                                                                <div key={index} className="flex items-center justify-between p-3 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold">
                                                                            {index + 1}
                                                                        </span>
                                                                        <div>
                                                                            <p className="text-sm text-green-800 font-medium">{file.name}</p>
                                                                            <p className="text-xs text-green-600">{(file.size / 1024).toFixed(2)} KB</p>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveFile(index)}
                                                                        className="text-red-600 hover:text-red-800 font-bold text-lg px-2"
                                                                        title="Hapus file ini"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedFiles.length === 0 && (
                                                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                                        <div className="text-4xl mb-2">📁</div>
                                                        <p className="text-sm text-gray-500">Belum ada file dipilih</p>
                                                        <p className="text-xs text-gray-400 mt-1">Klik input di atas untuk memilih gambar</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Deskripsi *
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description || ''}
                                            onChange={handleInputChange}
                                            required
                                            rows={4}
                                            placeholder="Deskripsi produk..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                                        />
                                    </div>

                                    <div className="flex space-x-4">
                                        <Button type="submit" className="flex-1" disabled={isUploading}>
                                            {isUploading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="animate-spin">⏳</span>
                                                    Uploading {selectedFiles.length} gambar...
                                                </span>
                                            ) : (
                                                editingProduct ? 'Update Produk' : 'Tambah Produk'
                                            )}
                                        </Button>
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            disabled={isUploading}
                                            className="flex-1 px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
