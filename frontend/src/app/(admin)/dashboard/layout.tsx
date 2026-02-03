'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    Boxes,
    Tag,
    MessageSquare,
    Activity,
    ShieldCheck,
    BarChart3,
    ArrowLeft,
    MonitorIcon,
    Star,
    Wallet
} from 'lucide-react';

const storeNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/dashboard/products', icon: Package },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Inventory', href: '/dashboard/inventory', icon: Boxes },
    { name: 'Categories', href: '/dashboard/categories', icon: MonitorIcon },
];

const operationsNav = [
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Support', href: '/dashboard/support', icon: MessageSquare },
    { name: 'Promotions', href: '/dashboard/promotions', icon: Tag },
    { name: 'Reviews', href: '/dashboard/moderation', icon: Star },
];

const systemNav = [
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Admins', href: '/dashboard/admins', icon: ShieldCheck },
    { name: 'Activity', href: '/dashboard/activity', icon: Activity },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { logout } = useAdminAuth();

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-white/10 z-50">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-white/10">
                        <Link href="/dashboard" className="block">
                            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                                Plug<span className="text-blue-500">NG</span>
                            </h1>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                                Admin Dashboard
                            </p>
                        </Link>
                    </div>

                    {/* Groups */}
                    <nav className="flex-1 p-4 space-y-8 overflow-y-auto no-scrollbar">
                        <div>
                            <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Store</p>
                            <div className="space-y-1">
                                {storeNav.map((item) => (
                                    <NavItem key={item.name} item={item} pathname={pathname} />
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Operations</p>
                            <div className="space-y-1">
                                {operationsNav.map((item) => (
                                    <NavItem key={item.name} item={item} pathname={pathname} />
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Management</p>
                            <div className="space-y-1">
                                {systemNav.map((item) => (
                                    <NavItem key={item.name} item={item} pathname={pathname} />
                                ))}
                            </div>
                        </div>
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-white/10">
                        <button
                            onClick={() => logout()}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 min-h-screen">
                <AdminHeader />
                <div className="min-h-[calc(100vh-80px)]">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ item, pathname }: any) {
    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
    return (
        <Link
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold'
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                }`}
        >
            <item.icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="text-sm tracking-tight">{item.name}</span>
            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
        </Link>
    );
}
