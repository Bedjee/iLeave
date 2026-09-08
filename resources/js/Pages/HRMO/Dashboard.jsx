import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function Dashboard({
    stats,
    recentPending,
    statusDistribution,
    yearlyTrends,
    monthlyLeaveTypeBreakdown,
    departmentUsage,
}) {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';

    const formatNumber = (value) => {
        const num = Number(value);
        if (isNaN(num)) return '0';
        if (Number.isInteger(num)) return num.toString();
        return num.toFixed(2);
    };

    const getInitials = (name) => {
        if (!name) return 'E';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    // Chart data
    const statusChartData = {
        labels: statusDistribution.labels,
        datasets: [{
            data: statusDistribution.data,
            backgroundColor: ['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444', '#6B7280'],
            borderWidth: 0,
        }]
    };

    const yearlyChartData = {
        labels: yearlyTrends.labels,
        datasets: [{
            label: 'Leave Applications',
            data: yearlyTrends.data,
            backgroundColor: '#ffbf00',
            borderRadius: 6,
            borderSkipped: false,
        }]
    };

    const monthlyBreakdownData = {
        labels: monthlyLeaveTypeBreakdown.labels,
        datasets: monthlyLeaveTypeBreakdown.datasets.map((ds) => ({
            ...ds,
            borderRadius: 4,
            borderSkipped: false,
        })),
    };

    const departmentChartData = {
        labels: departmentUsage.labels,
        datasets: [{
            label: 'Approved Requests',
            data: departmentUsage.data,
            backgroundColor: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
            borderRadius: 6,
            borderSkipped: false,
        }]
    };

    const statCards = [
        {
            key: 'totalEmployees',
            label: 'Total Employees',
            value: stats.totalEmployees,
            icon: (
                <svg className="size-5 md:size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        },
        {
            key: 'pendingRequests',
            label: 'Pending Requests',
            value: stats.pendingRequests,
            icon: (
                <svg className="size-5 md:size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            key: 'leaveTypes',
            label: 'Leave Types',
            value: stats.leaveTypes,
            icon: (
                <svg className="size-5 md:size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
        },
        {
            key: 'totalLeaveDaysThisMonth',
            label: 'Leave Days This Month',
            value: stats.totalLeaveDaysThisMonth,
            icon: (
                <svg className="size-5 md:size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    ];

    return (
        <HRMOLayout>
            <Head title="HRMO Dashboard" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-full shadow-lg ring-1 flex-shrink-0" style={{ backgroundColor: 'rgba(255,191,0,0.15)', color: GOLD, ringColor: 'rgba(255,191,0,0.2)' }}>
                            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight" style={{ color: NAVY }}>
                                Welcome back, HRMO
                            </h1>
                            <p className="text-sm text-gray-500">Here's what's happening with leave management today.</p>
                        </div>
                    </div>
                    <div className="mt-1 sm:mt-0">
                        <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium border backdrop-blur-sm" style={{ backgroundColor: 'rgba(255,191,0,0.15)', color: NAVY, borderColor: 'rgba(255,191,0,0.3)' }}>
                            <svg className="size-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formattedDate}
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <div
                            key={card.key}
                            className="group relative overflow-hidden rounded-2xl bg-white p-5 border transition-all duration-300 hover:shadow-lg"
                            style={{ borderColor: 'rgba(15,42,82,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                        >
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">{card.label}</dt>
                                    <dd className="text-2xl font-bold mt-1 tracking-tight" style={{ color: NAVY }}>
                                        {formatNumber(card.value)}
                                    </dd>
                                </div>
                                <div className="flex size-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 shadow-inner" style={{ backgroundColor: 'rgba(255,191,0,0.1)', color: GOLD }}>
                                    {card.icon}
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, ${GOLD}, transparent)` }} />
                        </div>
                    ))}
                </div>

                {/* Charts Row 1: Status Distribution + Yearly Trends */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Status Distribution */}
                    <div className="rounded-2xl bg-white p-5 border transition-all duration-300 hover:shadow-md" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                        <h3 className="text-base font-semibold mb-4" style={{ color: NAVY }}>
                            Request Status Distribution
                        </h3>
                        <div className="flex justify-center">
                            <div className="w-full max-w-[280px]">
                                <Pie
                                    data={statusChartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                                labels: {
                                                    padding: 12,
                                                    usePointStyle: true,
                                                    pointStyle: 'circle',
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Yearly Trends */}
                    <div className="rounded-2xl bg-white p-5 border transition-all duration-300 hover:shadow-md" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                        <h3 className="text-base font-semibold mb-4" style={{ color: NAVY }}>
                            Monthly Leave Applications ({new Date().getFullYear()})
                        </h3>
                        <div className="h-64">
                            <Bar
                                data={yearlyChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: { stepSize: 1 },
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Charts Row 2: Monthly Leave Type Breakdown + Department Usage */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Monthly Leave Type Breakdown */}
                    <div className="rounded-2xl bg-white p-5 border transition-all duration-300 hover:shadow-md" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                        <h3 className="text-base font-semibold mb-4" style={{ color: NAVY }}>
                            Leave Type Breakdown by Month
                        </h3>
                        <div className="h-64">
                            <Bar
                                data={monthlyBreakdownData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: {
                                                padding: 12,
                                                usePointStyle: true,
                                                pointStyle: 'circle',
                                            }
                                        }
                                    },
                                    scales: {
                                        x: {
                                            stacked: true,
                                        },
                                        y: {
                                            stacked: true,
                                            beginAtZero: true,
                                            ticks: { stepSize: 1 },
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Department Usage */}
                    <div className="rounded-2xl bg-white p-5 border transition-all duration-300 hover:shadow-md" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                        <h3 className="text-base font-semibold mb-4" style={{ color: NAVY }}>
                            Leave Requests by Department
                        </h3>
                        {departmentUsage.labels.length > 0 ? (
                            <div className="h-64">
                                <Bar
                                    data={departmentChartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false },
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: { stepSize: 1 },
                                            }
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-6">No department data available.</div>
                        )}
                    </div>
                </div>

                {/* Pending Approvals & Quick Actions */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Pending List */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl bg-white p-5 border transition-all duration-300 hover:shadow-md" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: NAVY }}>
                                    <span className="size-2 rounded-full animate-pulse" style={{ backgroundColor: GOLD }} />
                                    Pending Leave Requests
                                </h3>
                                <Link
                                    href={route('hrmo.leave-requests.index')}
                                    className="text-sm font-medium hover:underline transition" style={{ color: NAVY }}
                                >
                                    View all
                                </Link>
                            </div>
                            <div className="flow-root">
                                {recentPending.length === 0 ? (
                                    <div className="text-center py-6 text-gray-500 text-sm">
                                        <svg className="size-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        No pending requests
                                    </div>
                                ) : (
                                    <ul role="list" className="divide-y divide-gray-100">
                                        {recentPending.map((req) => {
                                            const daysNum = Number(req.days);
                                            const formattedDays = formatNumber(daysNum);
                                            const dayLabel = daysNum === 1 ? 'day' : 'days';
                                            return (
                                                <li key={req.id} className="py-3 first:pt-0 last:pb-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="flex size-9 items-center justify-center rounded-full text-xs font-medium flex-shrink-0" style={{ backgroundColor: 'rgba(255,191,0,0.15)', color: NAVY }}>
                                                                {getInitials(req.employee)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">{req.employee}</p>
                                                                <p className="text-xs text-gray-500 truncate">
                                                                    {req.leave_type}
                                                                    {req.days && ` • ${formattedDays} ${dayLabel}`}
                                                                    {req.start && req.end && ` • ${req.start} – ${req.end}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium ring-1 self-start sm:self-center" style={{ backgroundColor: 'rgba(255,191,0,0.15)', color: NAVY, ringColor: 'rgba(255,191,0,0.3)' }}>
                                                            Pending
                                                        </span>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl bg-white p-5 border transition-all duration-300 h-full hover:shadow-md" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                            <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: NAVY }}>
                                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Quick Actions
                            </h3>
                            <div className="space-y-2.5">
                                <Link
                                    href={route('hrmo.leave-requests.index')}
                                    className="flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-medium text-gray-700 transition-all group hover:shadow-sm"
                                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="size-4 text-gray-400 group-hover:text-[#ffbf00] transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Review Requests
                                    </span>
                                    <svg className="size-4 text-gray-400 group-hover:text-[#ffbf00] transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                                <Link
                                    href={route('hrmo.employees.index')}
                                    className="flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-medium text-gray-700 transition-all group hover:shadow-sm"
                                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="size-4 text-gray-400 group-hover:text-[#ffbf00] transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Manage Employees
                                    </span>
                                    <svg className="size-4 text-gray-400 group-hover:text-[#ffbf00] transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                                <Link
                                    href={route('hrmo.leave-types.index')}
                                    className="flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-medium text-gray-700 transition-all group hover:shadow-sm"
                                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="size-4 text-gray-400 group-hover:text-[#ffbf00] transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                        Leave Types
                                    </span>
                                    <svg className="size-4 text-gray-400 group-hover:text-[#ffbf00] transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </HRMOLayout>
    );
}