import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminLayout({ children }) {
    const { url, props } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ✅ Get pending count from props
    const adminPendingCount = props.adminPendingCount || 0;

    const isActive = (route) => url.startsWith(route);

    // Color palette
    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';

    // Navigation items with badge
    const navItems = [
        { route: 'admin.dashboard', label: 'Dashboard', icon: 'dashboard' },
        { 
            route: 'admin.leave-requests.index', 
            label: 'Leave Requests', 
            icon: 'clipboard-check',
            badge: adminPendingCount  // 👈 shows pending count
        },
        { route: 'admin.delegations.index', label: 'Delegations', icon: 'users' },
        { route: 'admin.my-leave-requests.index', label: 'My Leave Requests', icon: 'file-text' },
        { route: 'admin.profile.edit', label: 'Profile', icon: 'user' },
    ];

    const iconMap = {
        dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
        'clipboard-check': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
        users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
        'file-text': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
        user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    };

    const renderIcon = (name) => (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {iconMap[name] || iconMap.dashboard}
        </svg>
    );

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } flex flex-col border-r overflow-y-auto`}
                style={{ borderColor: 'rgba(15,42,82,0.08)' }}
            >
                {/* Brand */}
                <div className="flex items-center gap-3 px-4 py-5">
                    <img
                        src="/images/opol.png"
                        alt="iLeave Logo"
                        className="h-10 w-auto object-contain flex-shrink-0"
                    />
                    <div>
                        <span className="text-xl font-extrabold tracking-tight" style={{ color: NAVY }}>
                            i<span style={{ color: GOLD }}>Leave</span>
                        </span>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Admin Portal</p>
                    </div>
                </div>

                <div className="border-b" style={{ borderColor: 'rgba(15,42,82,0.08)' }}></div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.route.replace('admin.', ''));
                        return (
                            <Link
                                key={item.route}
                                href={route(item.route)}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition ${
                                    active
                                        ? 'font-medium'
                                        : 'hover:bg-gray-50'
                                }`}
                                style={
                                    active
                                        ? { backgroundColor: 'rgba(255,191,0,0.12)', color: GOLD }
                                        : { color: NAVY }
                                }
                            >
                                <span className="flex items-center gap-3">
                                    {renderIcon(item.icon)}
                                    <span className="text-sm">{item.label}</span>
                                </span>
                                {item.badge > 0 && (
                                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium text-white rounded-full" style={{ backgroundColor: GOLD }}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="border-t px-3 py-4" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-gray-50 text-sm"
                        style={{ color: NAVY }}
                    >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: NAVY }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-white text-gray-900">
                <div className="lg:hidden flex items-center justify-between mb-4">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                        aria-label="Open menu"
                    >
                        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="text-xl font-extrabold text-gray-800">
                        i<span style={{ color: '#ffbf00' }}>Leave</span>
                    </span>
                    <div className="w-8" />
                </div>

                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}