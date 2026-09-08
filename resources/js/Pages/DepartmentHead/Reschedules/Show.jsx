import DepartmentHeadLayout from '@/Layouts/DepartmentHeadLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ reschedule }) {
    const [processing, setProcessing] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

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

    const formatDays = (days) => {
        const num = Number(days);
        if (isNaN(num)) return '0';
        if (Number.isInteger(num)) return num.toString();
        return num.toFixed(2);
    };

    // --- Group dates by month for box display ---
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
                label: 'Certified by HRMO',
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

    // --- Timeline events ---
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

    // --- Status description ---
    const getStatusDescription = (status) => {
        const map = {
            pending: 'This reschedule request is awaiting review by HRMO. No action has been taken yet.',
            certified: 'This reschedule has been certified by HRMO and is now pending your approval.',
            approved: 'This reschedule request has been approved. The leave dates have been updated.',
            rejected: 'This reschedule request has been rejected.',
        };
        return map[status] || '';
    };

    // --- Safely get data ---
    const leaveRequest = r.leave_request || {};
    const employee = leaveRequest.employee || {};
    const leaveType = leaveRequest.leave_type || {};

    const employeeName = employee.full_name || employee.name || '—';
    const employeePosition = employee.position || '—';
    const employeeDepartment = employee.department?.department_name || '—';

    // --- Determine date displays ---
    const oldDates = r.old_dates && r.old_dates.length > 0
        ? renderDateGroup(r.old_dates)
        : r.old_start_date && r.old_end_date
            ? <span className="text-sm text-gray-700">{formatDate(r.old_start_date)} – {formatDate(r.old_end_date)}</span>
            : <span className="text-sm text-gray-500">—</span>;

    const newDates = r.new_dates && r.new_dates.length > 0
        ? renderDateGroup(r.new_dates)
        : r.new_start_date && r.new_end_date
            ? <span className="text-sm text-gray-700">{formatDate(r.new_start_date)} – {formatDate(r.new_end_date)}</span>
            : <span className="text-sm text-gray-500">—</span>;

    // --- Action handlers ---
    const canAct = r.status === 'certified';

    const handleApprove = () => {
        if (!confirm('Are you sure you want to approve this reschedule request?')) return;
        setProcessing(true);
        router.post(route('department-head.reschedules.approve', r.id), {}, {
            onSuccess: () => setProcessing(false),
            onError: () => { setProcessing(false); alert('Approval failed.'); },
        });
    };

    const handleReject = () => setShowRejectModal(true);

    const confirmReject = () => {
        if (!rejectReason.trim()) return;
        setProcessing(true);
        router.post(route('department-head.reschedules.reject', r.id), { reason: rejectReason }, {
            onSuccess: () => {
                setShowRejectModal(false);
                setRejectReason('');
                setProcessing(false);
            },
            onError: () => { setProcessing(false); alert('Rejection failed.'); },
        });
    };

    return (
        <DepartmentHeadLayout>
            <Head title={`Reschedule #${r.id}`} />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

                {/* Back button */}
                <Link
                    href={route('department-head.reschedules.index')}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-4"
                >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Reschedules
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
                        <span className="font-medium">Filed:</span> {formatDateTime(r.created_at)}
                    </div>
                </div>

                {/* Status Description */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6 text-sm text-gray-600">
                    {getStatusDescription(r.status)}
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-6">

                    {/* Employee & Leave Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Employee</p>
                            <p className="text-base font-semibold text-gray-800">{employeeName}</p>
                            <p className="text-sm text-gray-600">{employeePosition}</p>
                            <p className="text-sm text-gray-600">{employeeDepartment}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Leave Type</p>
                            <p className="text-base font-semibold text-gray-800">{leaveType.name || '—'}</p>
                            <p className="text-sm text-gray-600">Original Request #{leaveRequest.id || '—'}</p>
                        </div>
                    </div>

                    {/* Day Summary */}
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

                    {/* Date Change */}
                    <div>
                        <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Date Change</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-gray-400 mb-2">Original Dates</p>
                                {oldDates}
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-gray-400 mb-2">New Dates</p>
                                {newDates}
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    {r.reason && (
                        <div>
                            <h3 className="text-xs text-gray-500 uppercase tracking-wider">Reason</h3>
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

                {/* Timeline */}
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

                {/* Actions */}
                {canAct && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mt-6">
                        <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Actions</h3>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleApprove}
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium disabled:opacity-50"
                            >
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Approve
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium disabled:opacity-50"
                            >
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Reject
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                            Approve to finalize the reschedule, or reject to decline the request.
                        </p>
                    </div>
                )}

                {!canAct && (
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mt-6 text-sm text-gray-500">
                        This reschedule has been <span className="font-medium text-gray-700">{r.status}</span>. No further actions available.
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Reject Reschedule</h3>
                        <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejecting this reschedule request.</p>
                        <div className="mb-4">
                            <label className="block text-sm text-gray-700 mb-1">Reason *</label>
                            <textarea
                                rows="3"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF2D20] focus:ring-[#FF2D20] transition px-3 py-2"
                                placeholder="Enter rejection reason..."
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReject}
                                disabled={processing || !rejectReason.trim()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DepartmentHeadLayout>
    );
}