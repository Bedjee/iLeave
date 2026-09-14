import { Link, usePage } from '@inertiajs/react';
import FlashMessage from '@/Components/FlashMessage';
import { useEffect, useState } from 'react';

export default function DepartmentHeadLayout({ children }) {
    const { url, props } = usePage();
    const { flash } = props;
    const auth = props.auth || {};
    const user = auth.user || null;

    // ✅ Destructure both pending counts from props
    const pendingLeaveRequestsCount = props.pendingLeaveRequestsCount || 0;
    const pendingReschedulesCount = props.pendingReschedulesCount || 0;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const isActive = (path) => url.startsWith(path);

    // Close modal on Escape + lock body scroll while open
    useEffect(() => {
        if (!showLogoutModal) return;

        const onKeyDown = (e) => {
            if (e.key === 'Escape') setShowLogoutModal(false);
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [showLogoutModal]);

    // Navigation items with badges
    const navItems = [
        { route: 'department-head.dashboard', label: 'Dashboard', icon: 'dashboard' },
        { route: 'department-head.team', label: 'Team', icon: 'users' },
        {
            route: 'department-head.leave-requests.index',
            label: 'Approvals',
            icon: 'clipboard-check',
            badge: pendingLeaveRequestsCount
        },
        {
            route: 'department-head.reschedules.index',
            label: 'Reschedules',
            icon: 'refresh',
            badge: pendingReschedulesCount
        },
        { route: 'department-head.my-leave-requests.index', label: 'My Leave Requests', icon: 'file-text' },
    ];

    // Icon map
    const iconMap = {
        dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
        users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
        'clipboard-check': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
        refresh: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
        'file-text': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    };

    const renderIcon = (name) => (
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {iconMap[name] || iconMap.dashboard}
        </svg>
    );

    // Color palette
    const NAVY = '#0F2A52';
    const NAVY_DARK = '#081A33';
    const GOLD = '#ffbf00';
    const GOLD_LIGHT = 'rgba(255,191,0,0.2)';

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* ===== SIDEBAR ===== */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col border-r overflow-y-auto ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                style={{ borderColor: 'rgba(15,42,82,0.08)' }}
            >
                {/* Brand Area */}
                <div className="flex items-center gap-3 px-4 py-5">
                    <img
                        src="/images/opol.png"
                        alt="Municipality of Opol"
                        className="h-10 w-auto object-contain flex-shrink-0"
                    />
                    <div>
                        <span className="text-xl font-extrabold tracking-tight" style={{ color: NAVY }}>
                            i<span style={{ color: GOLD }}>Leave</span>
                        </span>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Department Head</p>
                    </div>
                </div>

                <div className="border-b" style={{ borderColor: 'rgba(15,42,82,0.08)' }}></div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-3 py-4">
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const active = isActive(item.route.replace('department-head.', ''));
                            return (
                                <Link
                                    key={item.route}
                                    href={route(item.route)}
                                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition ${
                                        active
                                            ? 'font-medium'
                                            : 'hover:bg-gray-50'
                                    }`}
                                    style={
                                        active
                                            ? { backgroundColor: GOLD_LIGHT, color: GOLD }
                                            : { color: NAVY }
                                    }
                                >
                                    <span className="flex items-center gap-3">
                                        {renderIcon(item.icon)}
                                        <span className="text-sm font-medium">{item.label}</span>
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
                </div>

                {/* Logout */}
                <div className="border-t px-3 py-4" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    <button
                        type="button"
                        onClick={() => setShowLogoutModal(true)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition hover:bg-gray-50 text-sm"
                        style={{ color: NAVY }}
                    >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: NAVY }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ===== MAIN CONTENT AREA ===== */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* ===== TOP BAR ===== */}
                <header
                    className="flex-shrink-0 z-30 border-b px-4 md:px-6 h-14 flex items-center justify-between"
                    style={{ backgroundColor: NAVY, borderColor: 'rgba(255,255,255,0.08)' }}
                >
                    {/* Left: hamburger (mobile only) */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition"
                            aria-label="Open menu"
                        >
                            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Right: user info */}
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition">
                                <div className="flex size-8 items-center justify-center rounded-full text-sm font-semibold" style={{ backgroundColor: GOLD_LIGHT, color: GOLD }}>
                                    {user?.full_name?.charAt(0) || 'D'}
                                </div>
                                <span className="hidden sm:inline text-sm font-medium text-white/80">
                                    {user?.full_name || 'Dept. Head'}
                                </span>
                                <svg className="hidden sm:block size-4 text-white/40 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 hidden group-hover:block" style={{ backgroundColor: NAVY_DARK, borderColor: 'rgba(255,255,255,0.1)' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowLogoutModal(true)}
                                    className="block w-full text-left px-4 py-2 text-sm transition"
                                    style={{ color: GOLD }}
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign Out
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ===== MAIN CONTENT ===== */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-white text-gray-900">
                    {flash?.success && <FlashMessage message={flash.success} type="success" />}
                    {flash?.error && <FlashMessage message={flash.error} type="error" />}
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setShowLogoutModal(false)}
                        aria-hidden="true"
                    />

                    {/* Panel */}
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="logout-modal-title"
                        aria-describedby="logout-modal-description"
                        className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
                    >
                        <div className="flex items-start gap-4">
                            <div
                                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
                                style={{ backgroundColor: 'rgba(255,191,0,0.15)' }}
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{ color: GOLD }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                </svg>
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2
                                    id="logout-modal-title"
                                    className="text-base font-semibold"
                                    style={{ color: NAVY }}
                                >
                                    Sign out?
                                </h2>
                                <p
                                    id="logout-modal-description"
                                    className="mt-1 text-sm leading-relaxed text-gray-500"
                                >
                                    You&apos;ll be signed out of the Department Head Portal. You can sign back in anytime.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                className="w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50 sm:w-auto"
                                style={{ borderColor: 'rgba(15,42,82,0.15)', color: NAVY }}
                            >
                                Cancel
                            </button>

                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto"
                                style={{ backgroundColor: NAVY }}
                            >
                                Yes, sign out
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}