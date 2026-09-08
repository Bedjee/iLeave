import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ stats, recentActivity }) {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';

    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';

    // Default stats if not provided
    const {
        totalEmployees = 0,
        pendingAdminApprovals = 0,
        departments = 0,
        totalLeaves = 0,
    } = stats || {};

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            {/* ===== GREETING BANNER ===== */}
            <div className="relative overflow-hidden rounded-2xl shadow-md mb-6 p-6 md:p-8" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a3a6a 100%)` }}>
                <div className="absolute top-0 right-0 opacity-10">
                    <svg className="size-48 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white">
                            {greeting}, Admin 
                        </h2>
                        <p className="text-blue-100 mt-1 text-sm md:text-base max-w-2xl">
                            You are overseeing <span className="font-semibold text-[#ffbf00]">{totalEmployees}</span> employees across <span className="font-semibold text-white">{departments}</span> departments.
                            There are <span className="font-semibold text-[#ffbf00]">{pendingAdminApprovals}</span> requests awaiting your final approval.
                        </p>
                    </div>
                    <Link
                        href={route('admin.leave-requests.index')}
                        className="inline-flex items-center px-4 py-2 bg-[#ffbf00] text-[#0F2A52] text-sm font-medium rounded-lg hover:bg-[#e6ac00] transition shadow-sm whitespace-nowrap"
                    >
                        View Pending
                        <svg className="size-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* ===== STATS CARDS ===== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Employees', value: totalEmployees, icon: 'users', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Pending Approvals', value: pendingAdminApprovals, icon: 'clock', color: 'text-[#ffbf00]', bg: 'bg-yellow-50' },
                    { label: 'Departments', value: departments, icon: 'building', color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Leave Days Used', value: totalLeaves, icon: 'calendar', color: 'text-green-600', bg: 'bg-green-50' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <svg className={`size-5 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {stat.icon === 'users' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
                                    {stat.icon === 'clock' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                                    {stat.icon === 'building' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
                                    {stat.icon === 'calendar' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                                </svg>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</dt>
                                <dd className="text-2xl font-bold" style={{ color: NAVY }}>{stat.value}</dd>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ===== RECENT ACTIVITY & QUICK ACTIONS ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold" style={{ color: NAVY }}>Recent Activity</h3>
                            <Link href="#" className="text-sm font-medium hover:underline" style={{ color: GOLD }}>
                                View all
                            </Link>
                        </div>
                        <div className="flow-root">
                            {recentActivity && recentActivity.length > 0 ? (
                                <ul role="list" className="divide-y divide-gray-100">
                                    {recentActivity.map((item) => (
                                        <li key={item.id} className="py-3 flex items-center justify-between">
                                            <p className="text-sm text-gray-700">{item.action}</p>
                                            <span className="text-xs text-gray-400">{item.time}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <svg className="size-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <h3 className="text-lg font-semibold mb-4" style={{ color: NAVY }}>Quick Actions</h3>
                        <div className="space-y-2">
                            <Link
                                href={route('admin.leave-requests.index')}
                                className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-[#ffbf00]/10 hover:text-[#ffbf00] transition"
                            >
                                <span className="flex items-center gap-3">
                                    <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    Pending Requests
                                </span>
                                <svg className="size-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                            <Link
                                href={route('admin.delegations.index')}
                                className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-[#ffbf00]/10 hover:text-[#ffbf00] transition"
                            >
                                <span className="flex items-center gap-3">
                                    <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Delegations
                                </span>
                                <svg className="size-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                            <Link
                                href={route('admin.my-leave-requests.index')}
                                className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-[#ffbf00]/10 hover:text-[#ffbf00] transition"
                            >
                                <span className="flex items-center gap-3">
                                    <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    My Leave Requests
                                </span>
                                <svg className="size-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                            <Link
                                href={route('admin.profile.edit')}
                                className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-[#ffbf00]/10 hover:text-[#ffbf00] transition"
                            >
                                <span className="flex items-center gap-3">
                                    <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Profile Settings
                                </span>
                                <svg className="size-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <h4 className="text-sm font-semibold mb-3" style={{ color: NAVY }}>System Status</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                                <span className="text-gray-500">Server</span>
                                <span className="font-medium text-green-600">● Online</span>
                            </div>
                            <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                                <span className="text-gray-500">Database</span>
                                <span className="font-medium text-green-600">● Connected</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-500">Last backup</span>
                                <span className="font-medium" style={{ color: NAVY }}>2 hours ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}