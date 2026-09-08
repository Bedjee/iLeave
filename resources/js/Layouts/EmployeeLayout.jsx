import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function EmployeeLayout({ children }) {
    const { url } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isActive = (route) => url.startsWith(route);

    // Close sidebar automatically on navigation start
    useEffect(() => {
        const handleNavigationStart = () => {
            if (sidebarOpen) setSidebarOpen(false);
        };

        const removeStart = router.on('start', handleNavigationStart);

        return () => {
            removeStart();
        };
    }, [sidebarOpen]);

    // Color palette
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

            {/* Sidebar – White background, navy text, gold accents */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } flex flex-col border-r overflow-y-auto`}
                style={{ borderColor: 'rgba(15,42,82,0.08)' }}
            >
                {/* Brand / Logo Area */}
                <div className="flex items-center gap-3 px-4 py-5">
                   <img
    src="/images/opol.png" // User needs to replace 'logo.png' with their actual filename
    alt="iLeave Logo"
    className="h-10 w-auto object-contain flex-shrink-0"
/>
                    <div>
                        <span className="text-xl font-extrabold tracking-tight" style={{ color: NAVY }}>
                            i<span style={{ color: GOLD }}>Leave</span>
                        </span>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Employee Portal</p>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-b" style={{ borderColor: 'rgba(15,42,82,0.08)' }}></div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    <Link
                        href={route('employee.dashboard')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                            isActive('employee.dashboard')
                                ? 'font-medium'
                                : 'hover:bg-gray-50'
                        }`}
                        style={
                            isActive('employee.dashboard')
                                ? { backgroundColor: 'rgba(255,191,0,0.12)', color: GOLD }
                                : { color: NAVY }
                        }
                    >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={isActive('employee.dashboard') ? { color: GOLD } : { color: NAVY }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-sm">Dashboard</span>
                    </Link>

                    <Link
                        href={route('employee.leave-requests.index')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                            isActive('employee.leave-requests')
                                ? 'font-medium'
                                : 'hover:bg-gray-50'
                        }`}
                        style={
                            isActive('employee.leave-requests')
                                ? { backgroundColor: 'rgba(255,191,0,0.12)', color: GOLD }
                                : { color: NAVY }
                        }
                    >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={isActive('employee.leave-requests') ? { color: GOLD } : { color: NAVY }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span className="text-sm">Request Leave</span>
                    </Link>

                    <Link
                        href={route('employee.leave-balances')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                            isActive('employee.leave-balances')
                                ? 'font-medium'
                                : 'hover:bg-gray-50'
                        }`}
                        style={
                            isActive('employee.leave-balances')
                                ? { backgroundColor: 'rgba(255,191,0,0.12)', color: GOLD }
                                : { color: NAVY }
                        }
                    >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={isActive('employee.leave-balances') ? { color: GOLD } : { color: NAVY }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-sm">Leave Balances</span>
                    </Link>

                    <Link
                        href={route('employee.profile.edit')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                            isActive('employee.profile')
                                ? 'font-medium'
                                : 'hover:bg-gray-50'
                        }`}
                        style={
                            isActive('employee.profile')
                                ? { backgroundColor: 'rgba(255,191,0,0.12)', color: GOLD }
                                : { color: NAVY }
                        }
                    >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={isActive('employee.profile') ? { color: GOLD } : { color: NAVY }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm">Profile</span>
                    </Link>
                </nav>

                {/* Logout – at bottom, subtle */}
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
                {/* Mobile header with hamburger */}
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
                    <div className="w-8" /> {/* spacer */}
                </div>

                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
