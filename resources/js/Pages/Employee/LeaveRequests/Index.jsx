import EmployeeLayout from '@/Layouts/EmployeeLayout';
import { Head, Link } from '@inertiajs/react';
import LeaveRequestProgress from '@/Components/Employee/LeaveRequestProgress';

export default function Index({ leaveRequests }) {
    // --- Helper: Format days cleanly (no trailing zeros) ---
    const formatDays = (days) => {
        const num = Number(days);
        if (isNaN(num)) return '0';
        // If it's an integer, return as integer
        if (Number.isInteger(num)) return num.toString();
        // Otherwise, format to 2 decimals and remove trailing zeros
        const formatted = num.toFixed(2);
        // Remove trailing zeros after decimal
        const cleaned = parseFloat(formatted).toString();
        return cleaned;
    };

    // --- Status badge ---
    const getStatusBadge = (status, hasApprovedReschedule) => {
        if (hasApprovedReschedule) {
            return 'bg-green-200 text-green-800 border-green-300';
        }
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
            certified: 'bg-blue-100 text-blue-800',
            department_approved: 'bg-purple-100 text-purple-800',
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status, hasApprovedReschedule) => {
        if (hasApprovedReschedule) {
            return 'Reschedule Approved';
        }
        const labels = {
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected',
            cancelled: 'Cancelled',
            certified: 'Certified',
            department_approved: 'Department Approved',
        };
        return labels[status] || status;
    };

    // --- Reschedule badge ---
    const getRescheduleBadge = (reschedule) => {
        if (!reschedule) return null;
        if (reschedule.status === 'pending' || reschedule.status === 'certified') {
            const label = reschedule.status === 'pending' ? 'Reschedule Pending' : 'Reschedule Certified';
            const color = reschedule.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                : 'bg-blue-100 text-blue-800 border-blue-300';
            return {
                label,
                color,
                icon: (
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            };
        }
        if (reschedule.status === 'approved') {
            return {
                label: 'Reschedule Approved',
                color: 'bg-green-100 text-green-800 border-green-300',
                icon: (
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            };
        }
        return null;
    };

    // --- Special request badge ---
    const getSpecialRequestBadge = (req) => {
        if (req.request_type === 'monetization') {
            return {
                label: 'Monetization',
                color: 'bg-amber-100 text-amber-800 border-amber-300',
                icon: (
                    <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            };
        }
        if (req.request_type === 'terminal_leave') {
            return {
                label: 'Terminal Leave',
                color: 'bg-purple-100 text-purple-800 border-purple-300',
                icon: (
                    <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                ),
            };
        }
        return null;
    };

    // --- Days display helper (clean formatting) ---
    const getDaysDisplay = (req) => {
        let days = req.number_of_days;
        let cleanDays;
        if (req.request_type === 'monetization') {
            days = req.monetized_days || 0;
            cleanDays = formatDays(days);
            return `${cleanDays} day${days !== 1 ? 's' : ''} monetized`;
        }
        if (req.request_type === 'terminal_leave') {
            cleanDays = formatDays(days);
            return `${cleanDays} day${days !== 1 ? 's' : ''} (VL + SL)`;
        }
        cleanDays = formatDays(days);
        return `${cleanDays} day${days !== 1 ? 's' : ''}`;
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const total = leaveRequests.length;
    const pending = leaveRequests.filter(r => r.status === 'pending').length;
    const approved = leaveRequests.filter(r => r.status === 'approved').length;
    const rejected = leaveRequests.filter(r => r.status === 'rejected').length;

    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';
    const NAVY_DARK = '#081A33';

    return (
        <EmployeeLayout>
            <Head title="My Leave Requests" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 sm:size-12 items-center justify-center rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(255,191,0,0.15)', color: GOLD }}>
                            <svg className="size-5 sm:size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: NAVY }}>My Leave Requests</h2>
                            <p className="text-sm text-gray-500">View all your filed leave requests</p>
                        </div>
                    </div>
                    <Link
                        href={route('employee.leave-requests.create')}
                        className="inline-flex items-center justify-center px-4 py-2 text-white rounded-lg transition text-sm font-medium shadow-sm hover:shadow-md whitespace-nowrap"
                        style={{ backgroundColor: NAVY }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = NAVY_DARK}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = NAVY}
                    >
                        <svg className="size-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        File Leave
                    </Link>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl shadow-sm border p-3 text-center hover:shadow-md transition" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                        <p className="text-xl font-bold" style={{ color: NAVY }}>{total}</p>
                        <p className="text-xs text-gray-500">Total Requests</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-3 text-center hover:shadow-md transition" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                        <p className="text-xl font-bold" style={{ color: GOLD }}>{pending}</p>
                        <p className="text-xs text-gray-500">Pending</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-3 text-center hover:shadow-md transition" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                        <p className="text-xl font-bold text-green-600">{approved}</p>
                        <p className="text-xs text-gray-500">Approved</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-3 text-center hover:shadow-md transition" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                        <p className="text-xl font-bold text-red-600">{rejected}</p>
                        <p className="text-xs text-gray-500">Rejected</p>
                    </div>
                </div>

                {/* Requests List */}
                {leaveRequests.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border p-8 text-center" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                        <svg className="size-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500">You have not filed any leave requests yet.</p>
                        <Link
                            href={route('employee.leave-requests.create')}
                            className="inline-block mt-3 text-sm font-medium hover:underline"
                            style={{ color: GOLD }}
                        >
                            File your first leave request
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {leaveRequests.map((req) => {
                            const hasApprovedReschedule = !!req.approved_reschedule;
                            const hasActiveReschedule = !!req.active_reschedule;
                            const rescheduleBadge = getRescheduleBadge(req.active_reschedule) || getRescheduleBadge(req.approved_reschedule);
                            const showLeftBorder = hasActiveReschedule && !hasApprovedReschedule;
                            const approvedRescheduleClass = hasApprovedReschedule
                                ? 'opacity-70 bg-gray-50 border-gray-300'
                                : '';
                            const specialBadge = getSpecialRequestBadge(req);

                            return (
                                <div
                                    key={req.id}
                                    className={`bg-white rounded-xl shadow-sm border ${showLeftBorder ? 'border-l-4' : 'border-gray-200'} ${approvedRescheduleClass} p-4 hover:shadow-md transition-all duration-200 group relative`}
                                    style={showLeftBorder ? { borderColor: GOLD } : {}}
                                >
                                    {/* Top row: badges + status */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {rescheduleBadge && (
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${rescheduleBadge.color}`}>
                                                    {rescheduleBadge.icon}
                                                    {rescheduleBadge.label}
                                                </span>
                                            )}
                                            {specialBadge && (
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${specialBadge.color}`}>
                                                    {specialBadge.icon}
                                                    {specialBadge.label}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(req.status, hasApprovedReschedule)} self-start sm:self-center`}>
                                            {getStatusLabel(req.status, hasApprovedReschedule)}
                                        </span>
                                    </div>

                                    {/* Leave type & dates */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex size-10 items-center justify-center rounded-full transition-transform flex-shrink-0 group-hover:scale-110" style={{ backgroundColor: 'rgba(255,191,0,0.15)', color: GOLD }}>
                                                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {req.leave_type?.name || '—'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {req.start_date && req.end_date ? (
                                                        `${formatDate(req.start_date)} – ${formatDate(req.end_date)}`
                                                    ) : (
                                                        req.dates?.map(d => formatDate(d.leave_date)).join(', ') || '—'
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 self-start sm:self-center flex-shrink-0">
                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                {getDaysDisplay(req)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bottom row: Progress Stepper + Details link */}
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                                        <div className="w-full min-w-0 flex-1">
                                            <LeaveRequestProgress status={req.status} />
                                        </div>
                                        <div className="flex items-center gap-3 self-end sm:self-center">
                                            {hasActiveReschedule && (
                                                <Link
                                                    href={route('employee.reschedules.show', req.active_reschedule.id)}
                                                    className="text-xs font-medium flex items-center gap-1 hover:underline"
                                                    style={{ color: GOLD }}
                                                >
                                                    <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View Reschedule
                                                </Link>
                                            )}
                                            <Link
                                                href={route('employee.leave-requests.show', req.id)}
                                                className="text-xs font-medium flex items-center gap-1 hover:underline"
                                                style={{ color: GOLD }}
                                            >
                                                Details
                                                <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </EmployeeLayout>
    );
}
