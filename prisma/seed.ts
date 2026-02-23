import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...\n');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@tokoaksesoris.com' },
        update: {},
        create: {
            name: 'Admin 1998ACCESSORIES',
            email: 'admin@tokoaksesoris.com',
            password: adminPassword,
            role: 'ADMIN',
            phone: '081234567890',
            province: 'DKI Jakarta',
            city: 'Jakarta Selatan',
            district: 'Kebayoran Baru',
            postalCode: '12180',
            address: 'Jl. Senopati No. 123',
        },
    });
    console.log('✅ Admin user created:', admin.email);

    // Create test user
    const userPassword = await bcrypt.hash('user123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'user@test.com' },
        update: {},
        create: {
            name: 'Test User',
            email: 'user@test.com',
            password: userPassword,
            role: 'USER',
            phone: '081234567891',
            province: 'DKI Jakarta',
            city: 'Jakarta Pusat',
            district: 'Menteng',
            postalCode: '10310',
            address: 'Jl. Sudirman No. 456',
        },
    });
    console.log('✅ Test user created:', user.email);

    // Create products
    const products = [
        // Kalung
        {
            name: 'Kalung Rantai Emas',
            description: 'Kalung rantai emas 18k dengan desain elegan dan modern',
            category: 'kalung',
            price: 250000,
            stock: 15,
            imageUrl: 'https://via.placeholder.com/400x400?text=Kalung+Rantai+Emas',
            images: [
                'https://via.placeholder.com/400x400?text=Kalung+1',
                'https://via.placeholder.com/400x400?text=Kalung+2',
            ],
        },
        {
            name: 'Kalung Liontin Hati',
            description: 'Kalung dengan liontin berbentuk hati, cocok untuk hadiah',
            category: 'kalung',
            price: 180000,
            stock: 20,
            imageUrl: 'https://via.placeholder.com/400x400?text=Kalung+Liontin',
            images: ['https://via.placeholder.com/400x400?text=Liontin+Hati'],
        },
        // Gelang
        {
            name: 'Gelang Charm Silver',
            description: 'Gelang silver dengan charm cantik dan berkualitas',
            category: 'gelang',
            price: 150000,
            stock: 25,
            imageUrl: 'https://via.placeholder.com/400x400?text=Gelang+Charm',
            images: ['https://via.placeholder.com/400x400?text=Gelang+Silver'],
        },
        {
            name: 'Gelang Kulit Premium',
            description: 'Gelang kulit asli dengan desain minimalis',
            category: 'gelang',
            price: 120000,
            stock: 30,
            imageUrl: 'https://via.placeholder.com/400x400?text=Gelang+Kulit',
            images: ['https://via.placeholder.com/400x400?text=Leather+Bracelet'],
        },
        // Cincin
        {
            name: 'Cincin Berlian',
            description: 'Cincin berlian asli dengan setting platinum',
            category: 'cincin',
            price: 500000,
            stock: 10,
            imageUrl: 'https://via.placeholder.com/400x400?text=Cincin+Berlian',
            images: ['https://via.placeholder.com/400x400?text=Diamond+Ring'],
        },
        {
            name: 'Cincin Couple',
            description: 'Cincin couple titanium untuk pasangan',
            category: 'cincin',
            price: 200000,
            stock: 15,
            imageUrl: 'https://via.placeholder.com/400x400?text=Cincin+Couple',
            images: ['https://via.placeholder.com/400x400?text=Couple+Ring'],
        },
        // Anting
        {
            name: 'Anting Mutiara',
            description: 'Anting mutiara air tawar dengan kualitas premium',
            category: 'anting',
            price: 180000,
            stock: 20,
            imageUrl: 'https://via.placeholder.com/400x400?text=Anting+Mutiara',
            images: ['https://via.placeholder.com/400x400?text=Pearl+Earrings'],
        },
        {
            name: 'Anting Hoop Gold',
            description: 'Anting hoop emas dengan desain modern',
            category: 'anting',
            price: 150000,
            stock: 25,
            imageUrl: 'https://via.placeholder.com/400x400?text=Anting+Hoop',
            images: ['https://via.placeholder.com/400x400?text=Hoop+Earrings'],
        },
        // Kacamata
        {
            name: 'Kacamata Hitam Aviator',
            description: 'Kacamata hitam aviator dengan UV protection',
            category: 'kacamata',
            price: 200000,
            stock: 30,
            imageUrl: 'https://via.placeholder.com/400x400?text=Kacamata+Aviator',
            images: ['https://via.placeholder.com/400x400?text=Aviator+Sunglasses'],
        },
        {
            name: 'Kacamata Baca Vintage',
            description: 'Kacamata baca dengan frame vintage',
            category: 'kacamata',
            price: 150000,
            stock: 20,
            imageUrl: 'https://via.placeholder.com/400x400?text=Kacamata+Vintage',
            images: ['https://via.placeholder.com/400x400?text=Reading+Glasses'],
        },
        // Jam Tangan
        {
            name: 'Jam Tangan Automatic',
            description: 'Jam tangan automatic dengan mesin Swiss',
            category: 'jam_tangan',
            price: 800000,
            stock: 10,
            imageUrl: 'https://via.placeholder.com/400x400?text=Jam+Automatic',
            images: ['https://via.placeholder.com/400x400?text=Automatic+Watch'],
        },
        {
            name: 'Jam Tangan Digital Sport',
            description: 'Jam tangan digital untuk olahraga',
            category: 'jam_tangan',
            price: 300000,
            stock: 25,
            imageUrl: 'https://via.placeholder.com/400x400?text=Jam+Digital',
            images: ['https://via.placeholder.com/400x400?text=Sport+Watch'],
        },
        // Kaos Kaki
        {
            name: 'Kaos Kaki Premium Cotton',
            description: 'Kaos kaki cotton premium, nyaman dan breathable',
            category: 'kaos_kaki',
            price: 50000,
            stock: 50,
            imageUrl: 'https://via.placeholder.com/400x400?text=Kaos+Kaki',
            images: ['https://via.placeholder.com/400x400?text=Cotton+Socks'],
        },
        {
            name: 'Kaos Kaki Ankle Sport',
            description: 'Kaos kaki ankle untuk olahraga',
            category: 'kaos_kaki',
            price: 40000,
            stock: 60,
            imageUrl: 'https://via.placeholder.com/400x400?text=Kaos+Kaki+Sport',
            images: ['https://via.placeholder.com/400x400?text=Sport+Socks'],
        },
        // Bandana
        {
            name: 'Bandana Motif Paisley',
            description: 'Bandana dengan motif paisley klasik',
            category: 'bandana',
            price: 35000,
            stock: 40,
            imageUrl: 'https://via.placeholder.com/400x400?text=Bandana+Paisley',
            images: ['https://via.placeholder.com/400x400?text=Paisley+Bandana'],
        },
        {
            name: 'Bandana Polos Hitam',
            description: 'Bandana polos warna hitam, serbaguna',
            category: 'bandana',
            price: 30000,
            stock: 50,
            imageUrl: 'https://via.placeholder.com/400x400?text=Bandana+Hitam',
            images: ['https://via.placeholder.com/400x400?text=Black+Bandana'],
        },
    ];

    for (const product of products) {
        const created = await prisma.product.create({
            data: product,
        });
        console.log(`✅ Product created: ${created.name}`);
    }

    console.log('\n🎉 Seeding completed!');
    console.log('\n📊 Summary:');
    console.log(`- Users: 2 (1 admin, 1 user)`);
    console.log(`- Products: ${products.length}`);
    console.log('\n🔑 Login credentials:');
    console.log('Admin: admin@tokoaksesoris.com / admin123');
    console.log('User: user@test.com / user123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
