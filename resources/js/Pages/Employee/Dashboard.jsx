import EmployeeLayout from '@/Layouts/EmployeeLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ employee, leaveCredits, pendingRequests, recentActivity }) {
    const credits = leaveCredits || { vacation_leave: 0, sick_leave: 0 };
    const totalVacation = Number(credits.vacation_leave) || 0;
    const totalSick = Number(credits.sick_leave) || 0;
    const pendingCount = pendingRequests?.length || 0;
    const activityCount = recentActivity?.length || 0;

    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';

    // Helper to clean number formatting
    const formatNumber = (value) => {
        const num = Number(value);
        if (isNaN(num)) return '0';
        if (Number.isInteger(num)) return num.toString();
        return num.toFixed(2);
    };

    // Colors
    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';
    const NAVY_LIGHT = '#f0f4f8';

    return (
        <EmployeeLayout>
            <Head title="Employee Dashboard" />

            {/* Hero Section – Modern & Engaging */}
            <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
                {/* Decorative accents */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffbf00]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#0F2A52]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="flex size-14 sm:size-16 items-center justify-center rounded-full flex-shrink-0 shadow-inner" style={{ backgroundColor: 'rgb(29, 27, 65)', color: GOLD }}>
                            <svg className="size-7 sm:size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: NAVY }}>
                                {greeting}, {employee?.first_name || employee?.name?.split(' ')[0] || 'Employee'}!
                            </h1>
                            <p className="text-gray-600 mt-0.5">
                                {employee?.position && employee?.department
                                    ? `${employee.position} · ${employee.department}`
                                    : 'Welcome to your leave management dashboard.'}
                            </p>
                        </div>
                    </div>

                    {/* Buttons – stacked on mobile, row on larger screens */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto self-start sm:self-center">
                        <Link
                            href={route('employee.leave-requests.create')}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all shadow-md hover:shadow-lg text-sm font-semibold"
                            style={{ backgroundColor: NAVY }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1a3a6a'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = NAVY}
                        >
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Request Leave
                        </Link>
                        <Link
                            href={route('employee.leave-balances')}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-gray-700 rounded-xl transition-all text-sm font-medium"
                            style={{ backgroundColor: '#f3f4f6' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        >
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            View Balances
                        </Link>
                    </div>
                </div>

                {/* Quick Stats Row */}
                <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                        <p className="text-2xl font-bold" style={{ color: NAVY }}>
                            {formatNumber(totalVacation + totalSick)}
                        </p>
                        <p className="text-xs text-gray-500">Total Credits</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold" style={{ color: GOLD }}>{pendingCount}</p>
                        <p className="text-xs text-gray-500">Pending Requests</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                            {recentActivity?.filter(a => a.status === 'approved').length || 0}
                        </p>
                        <p className="text-xs text-gray-500">Approved This Year</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-700">{activityCount}</p>
                        <p className="text-xs text-gray-500">Recent Activities</p>
                    </div>
                </div>
            </div>

            {/* Leave Balances – Enhanced Cards with Progress */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                {/* Vacation Leave */}
                <div className="bg-white rounded-2xl shadow-sm border p-5 hover:shadow-lg transition-all duration-300 group" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full" style={{ backgroundColor: GOLD }}></div>
                                <dt className="text-sm font-medium text-gray-500">Vacation Leave</dt>
                            </div>
                            <dd className="text-3xl font-bold mt-1" style={{ color: NAVY }}>{formatNumber(totalVacation)}</dd>
                            <p className="text-xs text-gray-400 mt-0.5">available days</p>
                        </div>
                        <div className="flex size-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110" style={{ backgroundColor: 'rgba(255,191,0,0.1)', color: GOLD }}>
                            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((totalVacation / 15) * 100, 100)}%`, backgroundColor: GOLD }}></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">Used: {Math.max(0, 15 - totalVacation)} of 15 days</p>
                </div>

                {/* Sick Leave */}
                <div className="bg-white rounded-2xl shadow-sm border p-5 hover:shadow-lg transition-all duration-300 group" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                                <dt className="text-sm font-medium text-gray-500">Sick Leave</dt>
                            </div>
                            <dd className="text-3xl font-bold mt-1" style={{ color: NAVY }}>{formatNumber(totalSick)}</dd>
                            <p className="text-xs text-gray-400 mt-0.5">available days</p>
                        </div>
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-green-50 text-green-600 transition-transform group-hover:scale-110">
                            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${Math.min((totalSick / 15) * 100, 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">Used: {Math.max(0, 15 - totalSick)} of 15 days</p>
                </div>
            </div>

            {/* Quick Actions – New Section */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <Link
                    href={route('employee.leave-requests.create')}
                    className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border hover:shadow-md transition-all group"
                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    <div className="flex size-12 items-center justify-center rounded-full transition-transform group-hover:scale-110" style={{ backgroundColor: 'rgba(255,191,0,0.15)', color: GOLD }}>
                        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-700 mt-2">Request Leave</span>
                </Link>
                <Link
                    href={route('employee.leave-balances')}
                    className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border hover:shadow-md transition-all group"
                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    <div className="flex size-12 items-center justify-center rounded-full transition-transform group-hover:scale-110" style={{ backgroundColor: 'rgba(255,191,0,0.15)', color: GOLD }}>
                        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-700 mt-2">View Balances</span>
                </Link>
                <Link
                    href={route('employee.profile.edit')}
                    className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border hover:shadow-md transition-all group"
                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    <div className="flex size-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 transition-transform group-hover:scale-110">
                        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-700 mt-2">My Profile</span>
                </Link>
                <Link
                    href={route('employee.leave-requests.index')}
                    className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border hover:shadow-md transition-all group"
                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    <div className="flex size-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-transform group-hover:scale-110">
                        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-700 mt-2">My Requests</span>
                </Link>
            </div>

            {/* Pending Requests & Recent Activity – Enhanced */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition-shadow duration-200" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: NAVY }}>
                            <span className="size-2.5 rounded-full" style={{ backgroundColor: GOLD }}></span>
                            Pending Requests
                        </h3>
                        {pendingCount > 0 && (
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: 'rgba(255, 191, 0, 0.93)', color: NAVY }}>
                                {pendingCount} pending
                            </span>
                        )}
                    </div>
                    {pendingRequests && pendingRequests.length > 0 ? (
                        <ul className="divide-y divide-gray-100 -my-1">
                            {pendingRequests.map((req) => (
                                <li key={req.id} className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{req.type}</p>
                                        <p className="text-xs text-gray-500 truncate">{req.start} – {req.end}</p>
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium self-start sm:self-center" style={{ backgroundColor: 'rgba(255, 191, 0, 0.89)', color: NAVY }}>
                                        Pending
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <svg className="size-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm">No pending requests</p>
                            <p className="text-xs text-gray-400 mt-1">All caught up!</p>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition-shadow duration-200" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: NAVY }}>
                            <span className="size-2.5 rounded-full bg-blue-500"></span>
                            Recent Activity
                        </h3>
                        {activityCount > 0 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                                {activityCount} items
                            </span>
                        )}
                    </div>
                    {recentActivity && recentActivity.length > 0 ? (
                        <ul className="divide-y divide-gray-100 -my-1">
                            {recentActivity.map((activity) => (
                                <li key={activity.id} className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{activity.description}</p>
                                        <p className="text-xs text-gray-500 truncate">{activity.date}</p>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium self-start sm:self-center ${
                                        activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        activity.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <svg className="size-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <p className="text-sm">No recent activity</p>
                            <p className="text-xs text-gray-400 mt-1">Start by requesting a leave.</p>
                        </div>
                    )}
                </div>
            </div>
        </EmployeeLayout>
    );
}
