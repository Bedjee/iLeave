import MayorLayout from '@/Layouts/MayorLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ leaveRequest, balance, isDelegate = false }) {
    const lr = leaveRequest;
    const [processing, setProcessing] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

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

    const groupDatesByMonth = (dateArray) => {
        if (!dateArray || dateArray.length === 0) return [];
        const groups = {};
        dateArray.forEach((item) => {
            const dateStr = item.leave_date || item;
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

    const getStatusInfo = (status) => {
        const map = {
            department_approved: {
                label: 'Pending Final Approval',
                color: 'bg-yellow-500',
                text: 'text-yellow-700',
                bg: 'bg-yellow-50',
                border: 'border-yellow-200',
                icon: (
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            },
            approved: {
                label: 'Approved (Delegated)',
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
            cancelled: {
                label: 'Recalled',
                color: 'bg-gray-500',
                text: 'text-gray-700',
                bg: 'bg-gray-50',
                border: 'border-gray-300',
                icon: (
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                ),
            },
        };
        return map[status] || map.department_approved;
    };

    const statusInfo = getStatusInfo(lr.status);

    const events = [];
    if (lr.submitted_at || lr.created_at) {
        events.push({ label: 'Submitted', date: lr.submitted_at || lr.created_at, icon: 'submitted' });
    }
    if (lr.certified_at) {
        events.push({ label: 'Certified by HRMO', date: lr.certified_at, icon: 'certified' });
    }
    if (lr.approved_at) {
        events.push({ label: 'Approved by Department Head', date: lr.approved_at, icon: 'department_approved' });
    }
    if (lr.final_approved_at) {
        events.push({ label: 'Final Approved (Delegated)', date: lr.final_approved_at, icon: 'approved' });
    }
    if (lr.rejected_at) {
        events.push({ label: 'Rejected', date: lr.rejected_at, reason: lr.rejection_reason, icon: 'rejected' });
    }
    if (lr.cancelled_at) {
        events.push({ label: 'Recalled', date: lr.cancelled_at, reason: lr.cancellation_reason || 'Recalled by Mayor', icon: 'cancelled' });
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
        department_approved: (
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
        cancelled: (
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
        ),
    };

    const getTimelineColor = (label) => {
        const map = {
            Submitted: 'bg-gray-400',
            'Certified by HRMO': 'bg-blue-500',
            'Approved by Department Head': 'bg-yellow-500',
            'Final Approved (Delegated)': 'bg-green-500',
            Rejected: 'bg-red-500',
            Recalled: 'bg-gray-500',
        };
        return map[label] || 'bg-gray-300';
    };

    const renderDateDisplay = () => {
        if (lr.dates && lr.dates.length > 0) {
            const grouped = groupDatesByMonth(lr.dates);
            if (grouped.length === 0) return <span className="text-sm text-gray-500">—</span>;
            return grouped.map((group) => (
                <div key={group.monthName} className="mb-3 last:mb-0">
                    <span className="text-sm font-medium text-gray-700">{group.monthName}</span>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                        {group.days.sort((a, b) => a - b).map((day) => (
                            <div
                                key={day}
                                className="flex items-center justify-center min-w-[44px] h-10 px-3 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-200 transition"
                            >
                                {day}
                            </div>
                        ))}
                    </div>
                </div>
            ));
        } else if (lr.start_date && lr.end_date) {
            return (
                <span className="text-sm text-gray-700">
                    {formatDate(lr.start_date)} – {formatDate(lr.end_date)}
                </span>
            );
        } else {
            return <span className="text-sm text-gray-500">—</span>;
        }
    };

    // --- Additional details ---
    const additionalDetails = [];
    if (lr.detail) {
        const fields = [
            { key: 'location_type', label: 'Location Type' },
            { key: 'location', label: 'Location' },
            { key: 'sick_leave_type', label: 'Sick Leave Type' },
            { key: 'illness', label: 'Illness' },
            { key: 'study_purpose', label: 'Study Purpose' },
            { key: 'other_purpose', label: 'Other Purpose' },
            { key: 'slbw_days', label: 'SLBW Days' },
            { key: 'rehab_duration_months', label: 'Rehab Duration (months)' },
            { key: 'expected_delivery_date', label: 'Expected Delivery Date' },
            { key: 'prenatal_checkups', label: 'Prenatal Checkups' },
            { key: 'adoption_info', label: 'Adoption Info' },
            { key: 'additional_info', label: 'Additional Info' },
        ];
        fields.forEach(({ key, label }) => {
            const value = lr.detail[key];
            if (value) {
                let display = value;
                if (key === 'expected_delivery_date') display = formatDate(value);
                additionalDetails.push({ label, value: display });
            }
        });
    }

    // --- Actions ---
    const handleApprove = () => {
        if (!isDelegate) return;
        if (!confirm('Are you sure you want to approve this leave request as delegate?')) return;
        setProcessing(true);
        router.post(route('mayor.delegated-approvals.approve', lr.id), {}, {
            onSuccess: () => setProcessing(false),
            onError: () => { setProcessing(false); alert('Approval failed.'); },
        });
    };

    const handleReject = () => {
        if (!isDelegate) return;
        setShowRejectModal(true);
    };

    const confirmReject = () => {
        if (!rejectReason.trim()) return;
        setProcessing(true);
        router.post(route('mayor.delegated-approvals.reject', lr.id), {
            reason: rejectReason,
        }, {
            onSuccess: () => {
                setShowRejectModal(false);
                setRejectReason('');
                setProcessing(false);
            },
            onError: () => { setProcessing(false); alert('Rejection failed.'); },
        });
    };

    const handleRecall = () => {
        if (!isDelegate) return;
        if (confirm('Are you sure you want to recall this approved Vacation Leave request? This will refund the deducted credits and cancel the request.')) {
            router.post(route('mayor.delegated-approvals.recall', lr.id), {}, {
                onSuccess: () => router.reload(),
                onError: (errors) => alert(errors.error || 'Recall failed.'),
            });
        }
    };

    const isActionable = lr.status === 'department_approved' && isDelegate;
    const isRecalled = lr.status === 'cancelled';
    const isApproved = lr.status === 'approved';
    const isVL = lr.leave_type?.name?.toLowerCase().includes('vacation');
    const isPending = lr.status === 'department_approved';

    return (
        <MayorLayout>
            <Head title={`Delegated Approval #${lr.id}`} />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

                <Link
                    href={route('mayor.delegated-approvals.index')}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-4"
                >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to List
                </Link>

                {/* Status Banner */}
                <div className={`rounded-xl border ${statusInfo.bg} ${statusInfo.border} p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
                    <div className="flex items-center gap-3">
                        <div className={`size-10 rounded-full ${statusInfo.color} flex items-center justify-center text-white flex-shrink-0`}>
                            {statusInfo.icon}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                            <p className={`text-base sm:text-lg font-bold ${statusInfo.text}`}>{statusInfo.label}</p>
                            {isRecalled && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Previously fully approved; recalled on {formatDateTime(lr.cancelled_at)}
                                </p>
                            )}
                            {!isDelegate && isPending && (
                                <p className="text-xs text-blue-600 mt-1">
                                    <span className="font-medium">View-Only:</span> You are not delegated to approve this request.
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="text-xs text-gray-600">
                        <span className="font-medium">Request ID:</span> #{lr.id}
                        <span className="mx-2">·</span>
                        <span className="font-medium">Filed:</span> {formatDate(lr.date_filed)}
                    </div>
                </div>

                {/* View-Only Info Card (when not delegated and pending) */}
                {!isDelegate && isPending && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <svg className="size-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="text-sm font-semibold text-blue-800">View-Only Access</h4>
                            <p className="text-sm text-blue-700">
                                You are currently <strong>not delegated</strong> as an approver.
                                You can view the details but cannot approve or reject this request.
                                If you need to take action, please contact the Admin to delegate approval authority to you.
                            </p>
                        </div>
                    </div>
                )}

                {/* Two-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column – Details */}
                    <div className="lg:col-span-2 space-y-5">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                                <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Leave Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Employee</p>
                                    <p className="text-base font-semibold text-gray-800">{lr.employee?.full_name}</p>
                                    <p className="text-sm text-gray-500">{lr.employee?.position}</p>
                                    <p className="text-sm text-gray-500">{lr.employee?.department?.department_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Leave Type</p>
                                    <p className="text-base font-semibold text-gray-800">{lr.leave_type?.name}</p>
                                    <p className="text-sm text-gray-500">{lr.leave_type?.code}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-xs text-gray-500">Dates</p>
                                    <div className="mt-1">{renderDateDisplay()}</div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Total Days</p>
                                    <p className="text-sm font-bold text-gray-800">{formatDays(lr.number_of_days)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">With Pay</p>
                                    <p className="text-sm text-green-600">{formatDays(lr.days_with_pay)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Without Pay</p>
                                    <p className="text-sm text-red-600">{formatDays(lr.days_without_pay)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Commutation</p>
                                    <p className="text-sm text-gray-700">{lr.commutation === 'requested' ? 'Requested' : 'Not Requested'}</p>
                                </div>
                            </div>
                            {lr.reason && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">Reason</p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{lr.reason}</p>
                                </div>
                            )}
                        </div>

                        {/* Additional Details */}
                        {additionalDetails.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                                    <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Additional Information
                                </h3>
                                <ul className="space-y-1 text-sm text-gray-700">
                                    {additionalDetails.map((item, idx) => (
                                        <li key={idx}>
                                            <span className="font-medium">{item.label}:</span> {item.value}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Attachment */}
                        {lr.attachment && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Attachment</p>
                                <a
                                    href={lr.attachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#FF2D20] hover:underline flex items-center gap-1.5 text-sm"
                                >
                                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    View Attachment
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Right Column – Balance & Timeline */}
                    <div className="lg:col-span-1 space-y-5">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                                <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Current Balance
                            </h3>
                            <div className="text-center py-2">
                                <p className="text-3xl font-bold text-[#FF2D20]">{parseFloat(balance || 0).toFixed(2)}</p>
                                <p className="text-xs text-gray-400">{lr.leave_type?.name} days</p>
                            </div>
                        </div>

                        {events.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-6">
                                <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">Approval Timeline</h3>
                                <div className="space-y-4">
                                    {events.map((event, index) => (
                                        <div key={index} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className={`size-6 rounded-full ${getTimelineColor(event.label)} flex items-center justify-center text-white flex-shrink-0`}>
                                                    {timelineIcons[event.icon] || timelineIcons.submitted}
                                                </div>
                                                {index < events.length - 1 && <div className="w-0.5 h-6 bg-gray-200"></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-700">{event.label}</p>
                                                <p className="text-xs text-gray-500">{formatDateTime(event.date)}</p>
                                                {event.reason && <p className="text-xs text-gray-600 mt-0.5 break-words">Reason: {event.reason}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions – only if pending AND delegate */}
                {isActionable && (
                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            onClick={handleApprove}
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium"
                        >
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Approve
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 font-medium"
                        >
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Reject
                        </button>
                    </div>
                )}

                {/* Recall button – only for approved VL and delegate */}
                {isApproved && isVL && isDelegate && (
                    <div className="mt-4">
                        <button
                            onClick={handleRecall}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                        >
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Recall
                        </button>
                        <p className="text-xs text-gray-500 mt-1">This will cancel the request and refund the VL credits.</p>
                    </div>
                )}

                {/* View-only messages for non-delegated approved/recalled requests */}
                {isApproved && !isDelegate && (
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        This request is already <span className="font-semibold">Fully Approved</span>.
                        {isVL && ' You are not delegated to recall this request.'}
                    </div>
                )}

                {isRecalled && (
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        This request has been <span className="font-semibold">Recalled</span>.
                        {!isDelegate && ' You are not delegated to take further action.'}
                    </div>
                )}

                {!isActionable && isPending && !isDelegate && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                        You are viewing this request in <strong>view-only</strong> mode because you are not currently delegated as an approver.
                    </div>
                )}

                {/* Reject Modal */}
                {showRejectModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Reject Leave Request</h3>
                            <p className="text-sm text-gray-600 mb-4">Provide a reason for rejection.</p>
                            <div className="mb-4">
                                <label className="block text-sm text-gray-700 mb-1">Reason *</label>
                                <textarea
                                    rows="3"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF2D20] focus:ring-[#FF2D20] transition"
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
                                    Confirm Reject
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MayorLayout>
    );
}