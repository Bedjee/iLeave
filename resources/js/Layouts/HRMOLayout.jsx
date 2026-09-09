import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import NotificationBell from '@/Components/NotificationBell';

export default function HRMOLayout({ children }) {
    const { url, props } = usePage();
    const { auth } = props;
    const user = auth?.user || null;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isActive = (route) => url.startsWith(route);

    useEffect(() => {
        const handleNavigationStart = () => {
            if (sidebarOpen) setSidebarOpen(false);
        };
        const removeStart = router.on('start', handleNavigationStart);
        return () => removeStart();
    }, [sidebarOpen]);

    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';

    const NavLink = ({ route: routeName, label, icon }) => {
        const active = isActive(routeName);
        return (
            <Link
                href={route(routeName)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    active ? 'font-medium' : 'hover:bg-gray-50'
                }`}
                style={
                    active
                        ? { backgroundColor: 'rgba(255,191,0,0.12)', color: GOLD }
                        : { color: NAVY }
                }
            >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={active ? { color: GOLD } : { color: NAVY }}>
                    {icon}
                </svg>
                <span className="text-xs">{label}</span>
            </Link>
        );
    };

    const SectionHeading = ({ label }) => (
        <div className="px-3 pt-2 pb-1">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                {label}
            </span>
        </div>
    );

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-56 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } flex flex-col border-r overflow-hidden`}
                style={{ borderColor: 'rgba(15,42,82,0.08)' }}
            >
                {/* Brand - Compact */}
                <div className="flex items-center gap-2 px-3 py-2.5">
                    <img
                        src="/images/opol.png"
                        alt="iLeave Logo"
                        className="h-8 w-auto object-contain flex-shrink-0"
                    />
                    <div>
                        <span className="text-lg font-extrabold tracking-tight" style={{ color: NAVY }}>
                            i<span style={{ color: GOLD }}>Leave</span>
                        </span>
                        <p className="text-[8px] font-medium text-gray-400 uppercase tracking-wider leading-tight">HRMO Portal</p>
                    </div>
                </div>

                <div className="border-b" style={{ borderColor: 'rgba(15,42,82,0.08)' }}></div>

                {/* Navigation - Compact */}
                <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
                    <SectionHeading label="Overview" />
                    <NavLink
                        route="hrmo.dashboard"
                        label="Dashboard"
                        icon={
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        }
                    />

                    <SectionHeading label="Leave Management" />
                    <NavLink
                        route="hrmo.leave-requests.index"
                        label="Leave Requests"
                        icon={
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        }
                    />
                    <NavLink
                        route="hrmo.leave-recordings.index"
                        label="Leave Recordings"
                        icon={
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        }
                    />
                    <NavLink
                        route="hrmo.reschedules.index"
                        label="Reschedules"
                        icon={
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        }
                    />
                    <NavLink
                        route="hrmo.approved-leaves.index"
                        label="Approved Leaves"
                        icon={
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        }
                    />

                    <SectionHeading label="Master Data" />
                    <NavLink
                        route="hrmo.employees.index"
                        label="Employees"
                        icon={
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        }
                    />
                    <NavLink
                        route="hrmo.departments.index"
                        label="Departments"
                        icon={
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        }
                    />
                    <NavLink
                        route="hrmo.leave-types.index"
                        label="Leave Types"
                        icon={
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        }
                    />
                    <NavLink
                        route="hrmo.leave-balances.index"
                        label="Balances"
                        icon={
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        }
                    />

                    <SectionHeading label="Monitoring" />
                    <NavLink
                        route="hrmo.accruals.index"
                        label="Accruals"
                        icon={
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        }
                    />
                </nav>

                {/* Logout - Compact */}
                <div className="border-t px-2 py-2" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-2 px-3 py-1.5 rounded-lg transition hover:bg-gray-50 text-xs"
                        style={{ color: NAVY }}
                    >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: NAVY }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
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
                        <h2 className="text-sm font-semibold text-gray-700 hidden sm:block">HRMO</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationBell />
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center size-8 rounded-full text-sm font-medium text-white" style={{ backgroundColor: GOLD }}>
                                {user?.full_name?.charAt(0) || 'H'}
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                {user?.full_name || 'HRMO'}
                            </span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
}