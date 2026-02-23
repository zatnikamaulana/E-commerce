import Link from 'next/link';
import { Instagram, Facebook, MessageCircle, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        shop: [
            { name: 'Semua Produk', href: '/products' },
            { name: 'Kalung', href: '/products?category=kalung' },
            { name: 'Gelang', href: '/products?category=gelang' },
            { name: 'Cincin', href: '/products?category=cincin' },
            { name: 'KacaMata', href: '/products?category=kacamata' },
        ],
        support: [
            { name: 'Tentang Kami', href: '#' },
            { name: 'Kontak', href: '#' },
            { name: 'FAQ', href: '#' },
            { name: 'Kebijakan Privasi', href: '#' },
        ],
    };

    const socialLinks = [
        {
            name: 'Instagram',
            href: 'https://www.instagram.com/_1998accs/',
            icon: Instagram,
            color: 'hover:text-pink-400',
            bgColor: 'hover:bg-pink-400/10'
        },
        {
            name: 'Facebook',
            href: 'https://facebook.com/1998accessories',
            icon: Facebook,
            color: 'hover:text-blue-400',
            bgColor: 'hover:bg-blue-400/10'
        },
        {
            name: 'WhatsApp',
            href: 'https://wa.me/6281234567890',
            icon: MessageCircle,
            color: 'hover:text-green-400',
            bgColor: 'hover:bg-green-400/10'
        },
    ];

    const contactInfo = [
        {
            icon: MapPin,
            text: 'JLN.BAHAGIA NO 28AJl. Bahagia No.28Bonggoeya, Kec. Wua-Wua, Kota Kendari, Sulawesi Tenggara 93117'
        },
        {
            icon: Phone,
            text: '+62 812-3456-7890'
        },
        {
            icon: Mail,
            text: 'akundemo@1998accessories.com'
        },
    ];

    return (
        <footer className="bg-gray-900 text-white relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="md:col-span-1 fade-in-up">
                        <h3 className="text-2xl font-bold mb-4 hover-scale cursor-default">
                            1998ACCESSORIES
                        </h3>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Aksesoris fashion berkualitas untuk melengkapi gaya hidupmu.
                        </p>

                        {/* Social Media Icons */}
                        <div className="flex gap-3 mb-6">
                            {socialLinks.map((social, index) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`group p-3 bg-gray-800 rounded-lg transition-all duration-300 hover:scale-110 hover:-translate-y-1 ${social.bgColor} fade-in-up stagger-${index + 1}`}
                                        title={social.name}
                                    >
                                        <Icon
                                            className={`w-5 h-5 text-gray-400 transition-colors duration-300 ${social.color}`}
                                            strokeWidth={1.5}
                                        />
                                    </a>
                                );
                            })}
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            {contactInfo.map((contact, index) => {
                                const Icon = contact.icon;
                                return (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-3 text-gray-400 text-sm fade-in-up stagger-${index + 4}`}
                                    >
                                        <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                                        <span>{contact.text}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div className="fade-in-up stagger-1">
                        <h4 className="text-lg font-semibold mb-4">Belanja</h4>
                        <ul className="space-y-3">
                            {footerLinks.shop.map((link, index) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className={`text-gray-400 hover:text-white transition-all duration-300 underline-animate inline-block fade-in-up stagger-${index + 2
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div className="fade-in-up stagger-2">
                        <h4 className="text-lg font-semibold mb-4">Bantuan</h4>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link, index) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className={`text-gray-400 hover:text-white transition-all duration-300 underline-animate inline-block fade-in-up stagger-${index + 2
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="fade-in-up stagger-3">
                        <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
                        <p className="text-gray-400 mb-4 text-sm">
                            Dapatkan update produk terbaru dan promo spesial
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Email kamu"
                                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-300 text-sm"
                            />
                            <button className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-300 font-medium text-sm button-ripple hover-lift">
                                Kirim
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-800 fade-in-up stagger-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            © {currentYear} 1998ACCESSORIES. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <Link
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors underline-animate"
                            >
                                Syarat & Ketentuan
                            </Link>
                            <Link
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors underline-animate"
                            >
                                Kebijakan Privasi
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
