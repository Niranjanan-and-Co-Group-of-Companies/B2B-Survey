"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    ClipboardList,
    MapPin,
    Building2,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    BarChart3,
} from "lucide-react";

const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/surveys", label: "Surveys", icon: ClipboardList },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/locations", label: "Locations", icon: MapPin },
    { href: "/admin/industries", label: "Industries", icon: Building2 },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/admin/login");
    };

    // Don't show layout on login page
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-[var(--background)] flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[var(--primary-dark)] transform transition-transform lg:transform-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center">
                                <ClipboardList className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-white font-bold">B2B Survey</h1>
                                <p className="text-white/50 text-xs">Admin Panel</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? "bg-white/10 text-white"
                                        : "text-white/60 hover:bg-white/5 hover:text-white"
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User */}
                    <div className="p-4 border-t border-white/10">
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                    {user?.name?.charAt(0) || "A"}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                    {user?.name || "Admin"}
                                </p>
                                <p className="text-white/50 text-xs truncate">
                                    {user?.email || "admin@b2bsurvey.com"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full mt-2 flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-30 bg-[var(--surface)] border-b border-[var(--border)] px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-lg hover:bg-[var(--surface-hover)]"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="font-semibold">B2B Survey Admin</span>
                        <div className="w-10" />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        </div>
    );
}
