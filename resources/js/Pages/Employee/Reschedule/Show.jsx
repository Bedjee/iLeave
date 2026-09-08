import EmployeeLayout from '@/Layouts/EmployeeLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ reschedule }) {
    const r = reschedule;

    // --- Helpers ---
    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateShort = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatDateTime = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Clean day formatting: remove trailing zeros
    const formatDays = (days) => {
        const num = Number(days);
        if (isNaN(num)) return '0';
        if (Number.isInteger(num)) return num.toString();
        return num.toFixed(2);
    };

    // Group dates by month for box display
    const groupDatesByMonth = (dateArray) => {
        if (!dateArray || dateArray.length === 0) return [];
        const groups = {};
        dateArray.forEach((dateStr) => {
            if (!dateStr) return;
            const d = new Date(dateStr);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            const monthName = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            if (!groups[key]) {
                groups[key] = { monthName, days: [] };
            }
            groups[key].days.push(d.getDate());
        });
        return Object.keys(groups)
            .sort((a, b) => a.localeCompare(b))
            .map((key) => groups[key]);
    };

    // Render dates as grouped month boxes
    const renderDateGroup = (datesArray) => {
        if (!datesArray || datesArray.length === 0) return <span className="text-sm text-gray-500">—</span>;
        const grouped = groupDatesByMonth(datesArray);
        if (grouped.length === 0) return <span className="text-sm text-gray-500">—</span>;

        return grouped.map((group) => (
            <div key={group.monthName} className="mb-3 last:mb-0">
                <span className="text-sm font-medium text-gray-700">{group.monthName}</span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                    {group.days.sort((a, b) => a - b).map((day) => (
                        <div
                            key={day}
                            className="flex items-center justify-center min-w-[44px] h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 transition"
                        >
                            {day}
                        </div>
                    ))}
                </div>
            </div>
        ));
    };

    // --- Status helpers ---
    const getStatusInfo = (status) => {
        const map = {
            pending: {
                label: 'Pending Review',
                color: 'bg-yellow-500',
                text: 'text-yellow-700',
                bg: 'bg-yellow-50',
                border: 'border-yellow-200',
                icon: (
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            },
            certified: {
                label: 'Certified',
                color: 'bg-blue-500',
                text: 'text-blue-700',
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                icon: (
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            },
            approved: {
                label: 'Approved',
                color: 'bg-green-500',
                text: 'text-green-700',
                bg: 'bg-green-50',
                border: 'border-green-200',
                icon: (
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            },
            rejected: {
                label: 'Rejected',
                color: 'bg-red-500',
                text: 'text-red-700',
                bg: 'bg-red-50',
                border: 'border-red-200',
                icon: (
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            },
        };
        return map[status] || map.pending;
    };

    const statusInfo = getStatusInfo(r.status);

    // Build timeline events
    const events = [];
    if (r.created_at) {
        events.push({ label: 'Submitted', date: r.created_at, icon: 'submitted' });
    }
    if (r.certified_at) {
        events.push({ label: 'Certified by HRMO', date: r.certified_at, icon: 'certified' });
    }
    if (r.approved_at) {
        events.push({ label: 'Approved by Department Head', date: r.approved_at, icon: 'approved' });
    }
    if (r.rejected_at) {
        events.push({ label: 'Rejected', date: r.rejected_at, icon: 'rejected', reason: r.rejection_reason });
    }

    const timelineIcons = {
        submitted: (
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
        ),
        certified: (
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        approved: (
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        rejected: (
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    const getTimelineColor = (label) => {
        const map = {
            Submitted: 'bg-gray-400',
            'Certified by HRMO': 'bg-blue-500',
            'Approved by Department Head': 'bg-green-500',
            Rejected: 'bg-red-500',
        };
        return map[label] || 'bg-gray-300';
    };

    // Get status description
    const getStatusDescription = (status) => {
        const map = {
            pending: 'Your reschedule request is awaiting review by HRMO and Department Head.',
            certified: 'Your reschedule request has been certified by HRMO and is awaiting Department Head approval.',
            approved: 'Your reschedule request has been approved. The leave dates have been updated.',
            rejected: 'Your reschedule request has been rejected.',
        };
        return map[status] || '';
    };

    return (
        <EmployeeLayout>
            <Head title="Reschedule Request" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

                {/* Back button */}
                <Link
                    href={route('employee.leave-requests.show', r.leave_request_id)}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-4"
                >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Leave Request
                </Link>

                {/* Status Banner */}
                <div className={`rounded-xl border ${statusInfo.border} ${statusInfo.bg} p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
                    <div className="flex items-center gap-3">
                        <div className={`size-10 rounded-full ${statusInfo.color} flex items-center justify-center text-white flex-shrink-0`}>
                            {statusInfo.icon}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                            <p className={`text-base sm:text-lg font-bold ${statusInfo.text}`}>{statusInfo.label}</p>
                        </div>
                    </div>
                    <div className="text-xs text-gray-600">
                        <span className="font-medium">Request ID:</span> #{r.id}
                        <span className="mx-2">·</span>
                        <span className="font-medium">Filed:</span> {formatDateShort(r.created_at)}
                    </div>
                </div>

                {/* Status Description */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6 text-sm text-gray-600">
                    {getStatusDescription(r.status)}
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-6">

                    {/* Leave Type & Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Leave Type</p>
                            <p className="text-base font-semibold text-gray-800">{r.leaveRequest?.leave_type?.name || '—'}</p>
                            <p className="text-sm text-gray-500">Requested on {formatDateTime(r.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Related Leave Request</p>
                            <Link
                                href={route('employee.leave-requests.show', r.leave_request_id)}
                                className="text-[#FF2D20] hover:underline font-medium"
                            >
                                #{r.leave_request_id}
                            </Link>
                        </div>
                    </div>

                    {/* Day Difference Summary (fixed formatting) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div>
                            <p className="text-xs text-gray-500">Original Days</p>
                            <p className="text-lg font-bold text-gray-800">{formatDays(r.old_number_of_days)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">New Days</p>
                            <p className="text-lg font-bold text-gray-800">{formatDays(r.new_number_of_days)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Difference</p>
                            <p className={`text-lg font-bold ${r.day_difference > 0 ? 'text-green-600' : r.day_difference < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                                {r.day_difference > 0 ? '+' : ''}{formatDays(r.day_difference)}
                                <span className="text-sm font-normal ml-1">
                                    {r.day_difference > 0 ? '(refund)' : r.day_difference < 0 ? '(extra deduction)' : '(no change)'}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Date Change – GROUPED MONTH BOXES */}
                    <div>
                        <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Date Change</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-gray-400 mb-2">Original Dates</p>
                                {r.old_dates && r.old_dates.length > 0 ? (
                                    renderDateGroup(r.old_dates)
                                ) : r.old_start_date && r.old_end_date ? (
                                    <span className="text-sm text-gray-700">
                                        {formatDate(r.old_start_date)} – {formatDate(r.old_end_date)}
                                    </span>
                                ) : (
                                    <span className="text-sm text-gray-500">—</span>
                                )}
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-gray-400 mb-2">New Dates</p>
                                {r.new_dates && r.new_dates.length > 0 ? (
                                    renderDateGroup(r.new_dates)
                                ) : r.new_start_date && r.new_end_date ? (
                                    <span className="text-sm text-gray-700">
                                        {formatDate(r.new_start_date)} – {formatDate(r.new_end_date)}
                                    </span>
                                ) : (
                                    <span className="text-sm text-gray-500">—</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    {r.reason && (
                        <div>
                            <h3 className="text-xs text-gray-500 uppercase tracking-wider">Reason for Reschedule</h3>
                            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{r.reason}</p>
                        </div>
                    )}

                    {/* Attachment */}
                    {r.attachment && (
                        <div>
                            <h3 className="text-xs text-gray-500 uppercase tracking-wider">Attachment</h3>
                            <a
                                href={r.attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 mt-1 text-sm text-[#FF2D20] hover:underline font-medium"
                            >
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                View Attachment
                            </a>
                        </div>
                    )}
                </div>

                {/* Workflow Timeline */}
                {events.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 mt-6">
                        <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Workflow Timeline</h3>
                        <div className="space-y-4">
                            {events.map((event, index) => (
                                <div key={index} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className={`size-6 rounded-full ${getTimelineColor(event.label)} flex items-center justify-center text-white flex-shrink-0`}>
                                            {timelineIcons[event.icon] || timelineIcons.submitted}
                                        </div>
                                        {index < events.length - 1 && (
                                            <div className="w-0.5 h-6 bg-gray-200"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-700">{event.label}</p>
                                        <p className="text-xs text-gray-500">{formatDateTime(event.date)}</p>
                                        {event.reason && (
                                            <p className="text-xs text-gray-600 mt-0.5 break-words">Reason: {event.reason}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </EmployeeLayout>
    );
}
