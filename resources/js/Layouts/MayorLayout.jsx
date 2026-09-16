import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { LayoutDashboard, BarChart3, Building2, LogOut, User, Calendar, CheckSquare, Wallet } from 'lucide-react';

export default function MayorLayout({ children }) {
    const { url } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const isActive = (route) => url.startsWith(route);

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

    // Color palette (mayor theme)
    const RED = '#B91C1C';
    const RED_DARK = '#7F1D1D';

    return (
        <div className="h-screen bg-[#F8FAFC] flex overflow-hidden">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-[230px] bg-gradient-to-b from-[#B91C1C] to-[#7F1D1D] text-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } flex flex-col overflow-y-auto`}
            >
                {/* Branding */}
                <div className="flex flex-col items-center px-4 pt-5 pb-3 border-b border-white/10">
                    {/* Official Logo */}
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-2 overflow-hidden">
                        <img
                            src="/images/opol.png"
                            alt="Municipality of Opol"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="text-center leading-tight">
                        <div className="text-[10px] font-medium tracking-wider uppercase opacity-80">Municipality of</div>
                        <div className="text-base font-bold tracking-tight">OPOL</div>
                        <div className="text-[9px] font-medium tracking-widest uppercase opacity-70">Misamis Oriental</div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 py-4 space-y-4 overflow-y-auto">

                    {/* ============================================================
                        GROUP 1 — Overview
                        ============================================================ */}
                    <div>
                        <div className="px-3 mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-white/50">
                            Overview
                        </div>
                        <div className="space-y-0.5">
                            <Link
                                href={route('mayor.dashboard')}
                                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition text-sm ${
                                    isActive('mayor.dashboard')
                                        ? 'bg-white text-[#B91C1C] shadow-lg'
                                        : 'hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span className="font-medium">Dashboard</span>
                            </Link>

                            <Link
                                href={route('mayor.department-overview.index')}
                                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition text-sm ${
                                    isActive('mayor.department-overview')
                                        ? 'bg-white text-[#B91C1C] shadow-lg'
                                        : 'hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Building2 className="w-4 h-4" />
                                <span className="font-medium">Department Overview</span>
                            </Link>
                        </div>
                    </div>

                    {/* ============================================================
                        GROUP 2 — Approvals
                        ============================================================ */}
                    <div>
                        <div className="px-3 mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-white/50">
                            Approvals
                        </div>
                        <div className="space-y-0.5">
                            <Link
                                href={route('mayor.delegated-approvals.index')}
                                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition text-sm ${
                                    isActive('mayor.delegated-approvals')
                                        ? 'bg-white text-[#B91C1C] shadow-lg'
                                        : 'hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <CheckSquare className="w-4 h-4" />
                                <span className="font-medium">Delegated Approvals</span>
                            </Link>

                            <Link
                                href={route('mayor.admin-leave-requests.index')}
                                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition text-sm ${
                                    isActive('mayor.admin-leave-requests')
                                        ? 'bg-white text-[#B91C1C] shadow-lg'
                                        : 'hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span className="font-medium">Admin Leave Requests</span>
                            </Link>
                        </div>
                    </div>

                    {/* ============================================================
                        GROUP 3 — My Leave
                        ============================================================ */}
                    <div>
                        <div className="px-3 mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-white/50">
                            My Leave
                        </div>
                        <div className="space-y-0.5">
                            <Link
                                href={route('mayor.my-leave-requests.index')}
                                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition text-sm ${
                                    isActive('mayor.my-leave-requests')
                                        ? 'bg-white text-[#B91C1C] shadow-lg'
                                        : 'hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                    />
                                </svg>
                                <span className="font-medium">My Leave Requests</span>
                            </Link>

                            <Link
    href={route('mayor.my-leave-balances.index')}
    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition text-sm ${
        isActive('mayor.my-leave-balances')
            ? 'bg-white text-[#B91C1C] shadow-lg'
            : 'hover:bg-white/10 hover:text-white'
    }`}
>
    <Wallet className="w-4 h-4" />
    <span className="font-medium">My Leave Balances</span>
</Link>
                        </div>
                    </div>

                </nav>

                {/* Footer */}
                <div className="px-2 py-3 border-t border-white/10">
                    <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-white/5 mb-1.5">
                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
                            <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="leading-tight">
                            <div className="text-xs font-semibold">MAYOR</div>
                            <div className="text-[10px] opacity-70">Municipality of Opol</div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowLogoutModal(true)}
                        className="flex w-full items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                {/* Mobile hamburger */}
                <div className="lg:hidden flex items-center justify-between mb-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-1.5 rounded-lg text-gray-700 hover:bg-gray-200 transition"
                        aria-label="Open menu"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="text-lg font-extrabold text-gray-800">LeaveManager</span>
                    <div className="w-6" />
                </div>

                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setShowLogoutModal(false)}
                        aria-hidden="true"
                    />

                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="logout-modal-title"
                        aria-describedby="logout-modal-description"
                        className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
                    >
                        <div className="flex items-start gap-4">
                            <div
                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                                style={{ backgroundColor: 'rgba(185,28,28,0.1)' }}
                            >
                                <LogOut className="h-4.5 w-4.5" style={{ color: RED }} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2
                                    id="logout-modal-title"
                                    className="text-sm font-semibold"
                                    style={{ color: RED_DARK }}
                                >
                                    Sign out?
                                </h2>
                                <p
                                    id="logout-modal-description"
                                    className="mt-1 text-xs leading-relaxed text-gray-500"
                                >
                                    You&apos;ll be signed out of the Mayor Portal. You can sign back in anytime.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                className="w-full rounded-lg border px-3.5 py-2 text-xs font-medium transition hover:bg-gray-50 sm:w-auto"
                                style={{ borderColor: 'rgba(185,28,28,0.2)', color: RED_DARK }}
                            >
                                Cancel
                            </button>

                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                className="w-full rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90 sm:w-auto"
                                style={{ backgroundColor: RED }}
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