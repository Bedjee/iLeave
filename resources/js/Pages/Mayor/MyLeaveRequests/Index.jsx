import MayorLayout from '@/Layouts/MayorLayout';
import { Head, Link } from '@inertiajs/react';
import LeaveRequestProgress from '@/Components/Employee/LeaveRequestProgress';

export default function Index({ leaveRequests }) {
    const NAVY = '#0F2A52';
    const RED = '#B91C1C';
    const RED_LIGHT = 'rgba(185, 28, 28, 0.08)';

    // --- Helper to format days nicely ---
    const formatDays = (days) => {
        if (days === null || days === undefined || isNaN(days)) return '0';
        const num = Number(days);
        if (Number.isInteger(num)) return num.toString();
        // Round to 2 decimals and strip trailing zeros
        return parseFloat(num.toFixed(2)).toString();
    };

    const getStatusBadge = (status, hasApprovedReschedule) => {
        if (hasApprovedReschedule) return 'bg-green-200 text-green-800 border-green-300';
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            certified: 'bg-blue-100 text-blue-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
            department_approved: 'bg-purple-100 text-purple-800',
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status, hasApprovedReschedule) => {
        if (hasApprovedReschedule) return 'Reschedule Approved';
        const labels = {
            pending: 'Pending',
            certified: 'Certified',
            approved: 'Approved',
            rejected: 'Rejected',
            cancelled: 'Cancelled',
            department_approved: 'Department Approved',
        };
        return labels[status] || status;
    };

    const getRescheduleBadge = (reschedule) => {
        if (!reschedule) return null;
        if (reschedule.status === 'pending' || reschedule.status === 'certified') {
            const label = reschedule.status === 'pending' ? 'Reschedule Pending' : 'Reschedule Certified';
            const color = reschedule.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                : 'bg-blue-100 text-blue-800 border-blue-300';
            return { label, color, icon: <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> };
        }
        if (reschedule.status === 'approved') {
            return { label: 'Reschedule Approved', color: 'bg-green-100 text-green-800 border-green-300', icon: <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> };
        }
        return null;
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatDateDisplay = (req) => {
        if (req.start_date && req.end_date) {
            return `${formatDate(req.start_date)} – ${formatDate(req.end_date)}`;
        }
        if (req.dates && req.dates.length > 0) {
            return req.dates.map(d => formatDate(d.leave_date)).join(', ');
        }
        return '—';
    };

    return (
        <MayorLayout>
            <Head title="My Leave Requests" />
            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 sm:size-12 items-center justify-center rounded-full flex-shrink-0" style={{ backgroundColor: RED_LIGHT, color: RED }}>
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
                        href={route('mayor.my-leave-requests.create')}
                        className="inline-flex items-center justify-center px-4 py-2 text-white rounded-lg transition text-sm font-medium shadow-sm hover:shadow-md whitespace-nowrap"
                        style={{ backgroundColor: RED }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#7F1D1D'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = RED}
                    >
                        <svg className="size-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        File Leave
                    </Link>
                </div>

                {/* Requests List */}
                {leaveRequests.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border p-8 text-center" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                        <svg className="size-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p className="text-gray-500">You have not filed any leave requests yet.</p>
                        <Link href={route('mayor.my-leave-requests.create')} className="inline-block mt-3 text-sm font-medium hover:underline" style={{ color: RED }}>File your first leave request</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {leaveRequests.map((req) => {
                            const hasApprovedReschedule = !!req.approved_reschedule;
                            const hasActiveReschedule = !!req.active_reschedule;
                            const rescheduleBadge = getRescheduleBadge(req.active_reschedule) || getRescheduleBadge(req.approved_reschedule);
                            const showLeftBorder = hasActiveReschedule && !hasApprovedReschedule;
                            const approvedRescheduleClass = hasApprovedReschedule ? 'opacity-70 bg-gray-50 border-gray-300' : '';

                            const days = req.number_of_days || 0;
                            const daysFormatted = formatDays(days);
                            const daysDisplay = days > 0 ? `${daysFormatted} day${days !== 1 ? 's' : ''}` : null;

                            return (
                                <div
                                    key={req.id}
                                    className={`bg-white rounded-xl shadow-sm border ${showLeftBorder ? 'border-l-4' : 'border-gray-200'} ${approvedRescheduleClass} p-4 hover:shadow-md transition-all duration-200 group relative`}
                                    style={showLeftBorder ? { borderColor: RED } : {}}
                                >
                                    {/* Top row: badges */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {rescheduleBadge && (
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${rescheduleBadge.color}`}>
                                                    {rescheduleBadge.icon}
                                                    {rescheduleBadge.label}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(req.status, hasApprovedReschedule)}`}>
                                            {getStatusLabel(req.status, hasApprovedReschedule)}
                                        </span>
                                    </div>

                                    {/* Leave info */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex size-10 items-center justify-center rounded-full transition-transform flex-shrink-0 group-hover:scale-110" style={{ backgroundColor: RED_LIGHT, color: RED }}>
                                                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{req.leave_type?.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{formatDateDisplay(req)}</p>
                                            </div>
                                        </div>
                                        {daysDisplay && (
                                            <span className="text-xs text-gray-400 whitespace-nowrap self-start sm:self-center">
                                                {daysDisplay}
                                            </span>
                                        )}
                                    </div>

                                    {/* Progress and actions */}
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                                        <div className="w-full min-w-0 flex-1">
                                            <LeaveRequestProgress status={req.status} workflow="mayor" />
                                        </div>
                                        <div className="flex items-center gap-3 self-end sm:self-center">
                                            {hasActiveReschedule && (
                                                <Link href={route('employee.reschedules.show', req.active_reschedule.id)} className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: RED }}>
                                                    View Reschedule
                                                </Link>
                                            )}
                                            <Link href={route('mayor.my-leave-requests.show', req.id)} className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: RED }}>
                                                Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </MayorLayout>
    );
}