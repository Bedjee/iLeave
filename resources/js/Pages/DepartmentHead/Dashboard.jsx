import DepartmentHeadLayout from '@/Layouts/DepartmentHeadLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard({ stats, pendingApprovals, employee, department }) {
    const [processing, setProcessing] = useState(null);

    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';

    const handleAction = (id, action) => {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;
        setProcessing(id);
        const routeName = action === 'approve' ? 'department-head.leave-requests.approve' : 'department-head.leave-requests.reject';
        router.post(route(routeName, id), {}, {
            onSuccess: () => setProcessing(null),
            onError: () => { setProcessing(null); alert('Action failed.'); },
        });
    };

    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';
    const NAVY_LIGHT = '#f0f4f8';

    return (
        <DepartmentHeadLayout>
            <Head title="Department Head Dashboard" />

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
                            {greeting}, {employee?.name?.split(' ')[0] || 'Department Head'} 
                        </h2>
                        <p className="text-blue-100 mt-1 text-sm md:text-base max-w-2xl">
                            You have <span className="font-semibold text-[#ffbf00]">{stats.pendingRequests}</span> pending leave request{stats.pendingRequests > 1 ? 's' : ''} to review.
                            {stats.approvedThisMonth > 0 && (
                                <> Your department has had <span className="font-semibold text-green-300">{stats.approvedThisMonth}</span> approved leaves this month.</>
                            )}
                        </p>
                    </div>
                    <Link
                        href={route('department-head.leave-requests.index')}
                        className="inline-flex items-center px-4 py-2 bg-[#ffbf00] text-[#0F2A52] text-sm font-medium rounded-lg hover:bg-[#e6ac00] transition shadow-sm whitespace-nowrap"
                    >
                        Review Requests
                        <svg className="size-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* ===== STATS CARDS ===== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Team Members', value: stats.teamMembers, icon: 'users', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Pending Requests', value: stats.pendingRequests, icon: 'clock', color: 'text-[#ffbf00]', bg: 'bg-yellow-50' },
                    { label: 'Approved This Month', value: stats.approvedThisMonth, icon: 'check', color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Total Requests', value: stats.totalRequests, icon: 'clipboard', color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <svg className={`size-5 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {stat.icon === 'users' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
                                    {stat.icon === 'clock' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                                    {stat.icon === 'check' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                                    {stat.icon === 'clipboard' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}
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

            {/* ===== MAIN CONTENT ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ===== PENDING APPROVALS ===== */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold" style={{ color: NAVY }}>Pending Approvals</h3>
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{pendingApprovals.length}</span>
                        </div>

                        {pendingApprovals.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <svg className="size-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>No pending approvals</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium">Employee</th>
                                                <th className="px-4 py-3 text-left font-medium">Leave Type</th>
                                                <th className="px-4 py-3 text-left font-medium">Dates</th>
                                                <th className="px-4 py-3 text-center font-medium">Days</th>
                                                <th className="px-4 py-3 text-center font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {pendingApprovals.map((req) => (
                                                <tr key={req.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-4 py-3 font-medium" style={{ color: NAVY }}>{req.employee}</td>
                                                    <td className="px-4 py-3 text-gray-700">{req.type}</td>
                                                    <td className="px-4 py-3 text-gray-500">
                                                        {req.start && req.end ? `${req.start} – ${req.end}` : '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-medium">{req.days}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleAction(req.id, 'approve')}
                                                                disabled={processing === req.id}
                                                                className="px-3 py-1 text-xs font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition disabled:opacity-50"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction(req.id, 'reject')}
                                                                disabled={processing === req.id}
                                                                className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition disabled:opacity-50"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="md:hidden space-y-3">
                                    {pendingApprovals.map((req) => (
                                        <div key={req.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold" style={{ color: NAVY }}>{req.employee}</p>
                                                    <p className="text-sm text-gray-600">{req.type}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {req.start && req.end ? `${req.start} – ${req.end}` : '—'} · {req.days} days
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAction(req.id, 'approve')}
                                                        disabled={processing === req.id}
                                                        className="px-3 py-1 text-xs font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition disabled:opacity-50"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(req.id, 'reject')}
                                                        disabled={processing === req.id}
                                                        className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ===== SIDEBAR ===== */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <h3 className="text-lg font-semibold mb-4" style={{ color: NAVY }}>Quick Actions</h3>
                        <div className="space-y-2">
                            {[
                                { label: 'View All Requests', icon: 'clipboard-list', route: 'department-head.leave-requests.index' },
                                // { label: 'Team Leave Report', icon: 'chart-bar', route: '#' },
                                // { label: 'Manage Team', icon: 'users-cog', route: '#' },
                            ].map((item, idx) => (
                                <Link
                                    key={idx}
                                    href={route(item.route)}
                                    className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                                >
                                    <span className="flex items-center gap-3">
                                        <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {item.icon === 'clipboard-list' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />}
                                            {item.icon === 'chart-bar' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                                            {item.icon === 'users-cog' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
                                        </svg>
                                        {item.label}
                                    </span>
                                    <svg className="size-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Department Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <h4 className="text-sm font-semibold mb-3" style={{ color: NAVY }}>Department Summary</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                                <span className="text-gray-500">Department</span>
                                <span className="font-medium" style={{ color: NAVY }}>{department || '—'}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                                <span className="text-gray-500">Active Members</span>
                                <span className="font-medium" style={{ color: NAVY }}>{stats.teamMembers}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-500">Pending Reviews</span>
                                <span className="font-medium text-[#ffbf00]">{stats.pendingRequests}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DepartmentHeadLayout>
    );
}