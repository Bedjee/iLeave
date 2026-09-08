import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import NotificationBell from '@/Components/NotificationBell'; // 👈 Import the bell

export default function HRMOLayout({ children }) {
    const { url, props } = usePage();
    const { auth } = props;
    const user = auth?.user || null;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isActive = (route) => url.startsWith(route);

    // Close sidebar on navigation
    useEffect(() => {
        const handleNavigationStart = () => {
            if (sidebarOpen) setSidebarOpen(false);
        };
        const removeStart = router.on('start', handleNavigationStart);
        return () => removeStart();
    }, [sidebarOpen]);

    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';
    const NAVY_LIGHT = '#f0f4f8';

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ===== SIDEBAR ===== */}
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
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">HRMO Portal</p>
                    </div>
                </div>

                <div className="border-b" style={{ borderColor: 'rgba(15,42,82,0.08)' }}></div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {/* Dashboard */}
                    <Link
                        href={route('hrmo.dashboard')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                            isActive('hrmo.dashboard')
                                ? 'font-medium'
                                : 'hover:bg-gray-50'
                        }`}
                        style={
                            isActive('hrmo.dashboard')
                                ? { backgroundColor: 'rgba(255,191,0,0.12)', color: GOLD }
                                : { color: NAVY }
                        }
                    >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={isActive('hrmo.dashboard') ? { color: GOLD } : { color: NAVY }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-sm">Dashboard</span>
                    </Link>

                    {/* Leave Requests */}
                    <Link
                        href={route('hrmo.leave-requests.index')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                            isActive('hrmo.leave-requests')
                                ? 'font-medium'
                                : 'hover:bg-gray-50'
                        }`}
                        style={
                            isActive('hrmo.leave-requests')
                                ? { backgroundColor: 'rgba(255,191,0,0.12)', color: GOLD }
                                : { color: NAVY }
                        }
                    >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={isActive('hrmo.leave-requests') ? { color: GOLD } : { color: NAVY }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span className="text-sm">Leave Requests</span>
                    </Link>

                    {/* Leave Recordings */}
                    <Link
                        href={route('hrmo.leave-recordings.index')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                            isActive('hrmo.leave-recordings')
                                ? 'font-medium'
                                : 'hover:bg-gray-50'
                        }`}
                        style={
                            isActive('hrmo.leave-recordings')
                                ? { backgroundColor: 'rgba(255,191,0,0.12)', color: GOLD }
                                : { color: NAVY }
                        }
                    >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={isActive('hrmo.leave-recordings') ? { color: GOLD } : { color: NAVY }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-sm">Leave Recordings</span>
                    </Link>

                    {/* Employees */}
                    <Link
                        href={route('hrmo.employees.index')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                            isActive('hrmo.employees')
                                ? 'font-medium'
                                : 'hover:bg-gray-50'
                        }`}
                        style={
                            isActive('hrmo.employees')
                                ? { backgroundColor: 'rgba(255,191,0,0.12)', color: GOLD }
                                : { color: NAVY }
                        }
                    >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={isActive('hrmo.employees') ? { color: GOLD } : { color: NAVY }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-sm">Employees</span>
                    </Link>

                    {/* Departments */}
                    <Link
                        href={route('hrmo.departments.index')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                            isActive('hrmo.departments')
                                ? 'font-medium'
                                : 'hover:bg-gray-50'
                        }`}
                        style={
                            isActive('hrmo.departments')
                                ? { backgroundColor: 'rgba(255,191,0,0.12)', color: GOLD }
                                : { color: NAVY }
                        }
                    >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={isActive('hrmo.departments') ? { color: GOLD } : { color: NAVY }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-sm">Departments</span>
                    </Link>

                    {/* Leave Types */}
                    <Link
                        href={route('hrmo.leave-types.index')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                            isActive('hrmo.leave-types')
                                ? 'font-medium'
                                : 'hover:bg-gray-50'
                        }`}
                        style={
                            isActive('hrmo.leave-types')
                                ? { backgroundColor: 'rgba(255,191,0,0.12)', color: GOLD }
                                : { color: NAVY }
                        }
                    >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={isActive('hrmo.leave-types') ? { color: GOLD } : { color: NAVY }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-sm">Leave Types</span>
                    </Link>

                    {/* Leave Balances */}
                    <Link
                        href={route('hrmo.leave-balances.index')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                            isActive('hrmo.leave-balances')
                                ? 'font-medium'
                                : 'hover:bg-gray-50'
                        }`}
                        style={
                            isActive('hrmo.leave-balances')
                                ? { backgroundColor: 'rgba(255,191,0,0.12)', color: GOLD }
                                : { color: NAVY }
                        }
                    >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={isActive('hrmo.leave-balances') ? { color: GOLD } : { color: NAVY }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span className="text-sm">Balances</span>
                    </Link>

                    {/* Reschedules */}
                    <Link
                        href={route('hrmo.reschedules.index')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                            isActive('hrmo.reschedules')
                                ? 'font-medium'
                                : 'hover:bg-gray-50'
                        }`}
                        style={
                            isActive('hrmo.reschedules')
                                ? { backgroundColor: 'rgba(255,191,0,0.12)', color: GOLD }
                                : { color: NAVY }
                        }
                    >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={isActive('hrmo.reschedules') ? { color: GOLD } : { color: NAVY }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">Reschedules</span>
                    </Link>

                    {/* Approved Leaves */}
                    <Link
                        href={route('hrmo.approved-leaves.index')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                            isActive('hrmo.approved-leaves')
                                ? 'font-medium'
                                : 'hover:bg-gray-50'
                        }`}
                        style={
                            isActive('hrmo.approved-leaves')
                                ? { backgroundColor: 'rgba(255,191,0,0.12)', color: GOLD }
                                : { color: NAVY }
                        }
                    >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={isActive('hrmo.approved-leaves') ? { color: GOLD } : { color: NAVY }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">Approved Leaves</span>
                    </Link>
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

            {/* ===== MAIN CONTENT (with top bar) ===== */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header
                    className="flex-shrink-0 z-30 border-b px-4 md:px-6 py-2.5 flex items-center justify-between bg-white"
                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
                            aria-label="Open menu"
                        >
                            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h2 className="text-sm font-semibold text-gray-700 hidden sm:block">
                            HRMO 
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* 🔔 Notification Bell */}
                        <NotificationBell />

                        {/* User info */}
                        <div className="flex items-center gap-2">
                            <div
                                className="flex items-center justify-center size-8 rounded-full text-sm font-medium text-white"
                                style={{ backgroundColor: GOLD }}
                            >
                                {user?.full_name?.charAt(0) || 'H'}
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                {user?.full_name || 'HRMO'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}