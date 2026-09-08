import DepartmentHeadLayout from '@/Layouts/DepartmentHeadLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import SpecialRequestInfo from '@/Components/DepartmentHead/SpecialRequestInfo';

export default function Show({ leaveRequest, balance, balanceLabel, specialBalanceData }) {
    const [processing, setProcessing] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    const lr = leaveRequest;

    // Color palette
    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';
    const GOLD_LIGHT = 'rgba(255,191,0,0.12)';

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
            year: 'numeric',
            month: 'long',
            day: 'numeric',
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

    // --- Group dates by month ---
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

    // --- Date display ---
    let dateDisplay = null;
    if (lr.dates && lr.dates.length > 0) {
        const grouped = groupDatesByMonth(lr.dates);
        if (grouped.length > 0) {
            dateDisplay = grouped.map((group) => (
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
        }
    } else if (lr.start_date && lr.end_date) {
        dateDisplay = (
            <span className="text-sm text-gray-700">
                {formatDate(lr.start_date)} – {formatDate(lr.end_date)}
            </span>
        );
    } else {
        dateDisplay = <span className="text-sm text-gray-500">—</span>;
    }

    // --- Filter detail fields ---
    const getFilteredDetails = () => {
        if (!lr.detail || typeof lr.detail !== 'object') return {};
        const exclude = ['id', 'leave_request_id', 'created_at', 'updated_at'];
        const filtered = {};
        Object.entries(lr.detail).forEach(([key, value]) => {
            if (!exclude.includes(key) && value) {
                filtered[key] = value;
            }
        });
        return filtered;
    };
    const filteredDetails = getFilteredDetails();

    // --- Timeline steps ---
    const timelineSteps = [];
    if (lr.submitted_at || lr.created_at) {
        timelineSteps.push({ label: 'Submitted', date: lr.submitted_at || lr.created_at, icon: 'submitted' });
    }
    if (lr.certified_at) {
        timelineSteps.push({ label: 'Certified by HRMO', date: lr.certified_at, icon: 'certified' });
    }
    if (lr.approved_at) {
        timelineSteps.push({ label: 'Department Approved', date: lr.approved_at, icon: 'approved' });
    }
    if (lr.rejected_at) {
        timelineSteps.push({ label: 'Rejected', date: lr.rejected_at, icon: 'rejected', reason: lr.rejection_reason });
    }
    if (lr.cancelled_at) {
        timelineSteps.push({ label: 'Cancelled', date: lr.cancelled_at, icon: 'cancelled', reason: lr.cancellation_reason });
    }

    // Timeline icons
    const getTimelineIcon = (iconKey) => {
        const icons = {
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
            cancelled: (
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
            ),
        };
        return icons[iconKey] || icons.submitted;
    };

    const getTimelineColor = (label) => {
        const map = {
            Submitted: 'bg-gray-400',
            'Certified by HRMO': 'bg-blue-500',
            'Department Approved': 'bg-yellow-500',
            Rejected: 'bg-red-500',
            Cancelled: 'bg-gray-500',
        };
        return map[label] || 'bg-gray-300';
    };

    // --- Status Banner ---
    const getStatusBanner = () => {
        switch (lr.status) {
            case 'certified':
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    iconBg: 'bg-blue-500',
                    text: 'text-blue-700',
                    label: 'Certified by HRMO',
                    description: 'HRMO has certified this request. Awaiting your review.',
                };
            case 'department_approved':
                return {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    iconBg: 'bg-yellow-500',
                    text: 'text-yellow-700',
                    label: 'Department Approved',
                    description: 'You have recommended this request for approval. Awaiting Admin final approval.',
                };
            case 'approved':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    iconBg: 'bg-green-500',
                    text: 'text-green-700',
                    label: 'Fully Approved',
                    description: 'Admin has given final approval. The leave is fully approved.',
                };
            case 'rejected':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    iconBg: 'bg-red-500',
                    text: 'text-red-700',
                    label: 'Rejected',
                    description: 'This request has been rejected.',
                };
            case 'cancelled':
                return {
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    iconBg: 'bg-gray-500',
                    text: 'text-gray-700',
                    label: 'Cancelled',
                    description: 'This request has been cancelled.',
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    iconBg: 'bg-gray-400',
                    text: 'text-gray-700',
                    label: lr.status.charAt(0).toUpperCase() + lr.status.slice(1),
                    description: '',
                };
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Pending',
            certified: 'Certified',
            department_approved: 'Department Approved',
            approved: 'Fully Approved',
            rejected: 'Rejected',
            cancelled: 'Cancelled',
        };
        return labels[status] || status;
    };

    const banner = getStatusBanner();
    const canAct = lr.status === 'certified';

    // --- Actions ---
    const handleApprove = () => {
        if (!confirm('Are you sure you want to approve this leave request?')) return;
        setProcessing(true);
        router.post(route('department-head.leave-requests.approve', lr.id), {}, {
            onSuccess: () => setProcessing(false),
            onError: () => { setProcessing(false); alert('Approval failed.'); },
        });
    };

    const handleReject = () => {
        setShowRejectModal(true);
    };

    const confirmReject = () => {
        if (!rejectReason.trim()) return;
        setProcessing(true);
        router.post(route('department-head.leave-requests.reject', lr.id), {
            reason: rejectReason,
        }, {
            onSuccess: () => {
                setShowRejectModal(false);
                setRejectReason('');
                setProcessing(false);
            },
            onError: () => {
                setProcessing(false);
                alert('Rejection failed.');
            },
        });
    };

    return (
        <DepartmentHeadLayout>
            <Head title={`Leave Request #${lr.id}`} />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

                {/* --- Back & Header --- */}
                <div className="flex items-center gap-3 mb-6">
                    <Link
                        href={route('department-head.leave-requests.index')}
                        className="hover:underline flex items-center gap-1 text-sm"
                        style={{ color: GOLD }}
                    >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Requests
                    </Link>
                    <span className="text-gray-300">|</span>
                    <h2 className="text-xl font-bold" style={{ color: NAVY }}>Leave Request Details</h2>
                </div>

                {/* --- Status Banner --- */}
                <div className={`rounded-xl border ${banner.bg} ${banner.border} p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
                    <div className="flex items-center gap-3">
                        <div className={`size-10 rounded-full ${banner.iconBg} flex items-center justify-center text-white`}>
                            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                            <p className={`text-lg font-bold ${banner.text}`}>{banner.label}</p>
                            <p className="text-sm text-gray-600">{banner.description}</p>
                        </div>
                    </div>
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">Request ID:</span> #{lr.id}
                        <span className="mx-2">·</span>
                        <span className="font-medium">Filed:</span> {formatDateTime(lr.date_filed)}
                    </div>
                </div>

                {/* 🔥 Special Request Info */}
                {(lr.request_type === 'monetization' || lr.request_type === 'terminal_leave') && (
                    <SpecialRequestInfo
                        leaveRequest={lr}
                        specialBalanceData={specialBalanceData}
                    />
                )}

                {/* --- Two‑Column Layout --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column – Details (2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Main Details Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                                <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Request Details
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Employee</p>
                                        <p className="text-base font-semibold" style={{ color: NAVY }}>{lr.employee?.full_name}</p>
                                        <p className="text-sm text-gray-500">{lr.employee?.position}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Leave Type</p>
                                        <p className="text-base font-semibold" style={{ color: NAVY }}>{lr.leave_type?.name}</p>
                                        <p className="text-sm text-gray-500">{lr.leave_type?.code}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="text-xs text-gray-500">Leave Dates</p>
                                        <div className="mt-1">{dateDisplay}</div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Total Days</p>
                                        <p className="text-sm font-bold" style={{ color: NAVY }}>{formatDays(lr.number_of_days)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">With Pay</p>
                                        <p className="text-sm text-green-600">{formatDays(lr.days_with_pay)} days</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Without Pay</p>
                                        <p className="text-sm text-red-600">{formatDays(lr.days_without_pay)} days</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Commutation</p>
                                        <p className="text-sm text-gray-700">{lr.commutation === 'requested' ? 'Requested' : 'Not Requested'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Date Filed</p>
                                        <p className="text-sm text-gray-700">{formatDateTime(lr.date_filed)}</p>
                                    </div>
                                </div>
                                {lr.reason && (
                                    <div>
                                        <p className="text-xs text-gray-500">Reason</p>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{lr.reason}</p>
                                    </div>
                                )}
                                {lr.remarks && (
                                    <div>
                                        <p className="text-xs text-gray-500">Remarks</p>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{lr.remarks}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Details */}
                        {Object.keys(filteredDetails).length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Additional Information
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(filteredDetails).map(([key, value]) => {
                                        let displayValue = value;
                                        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
                                            displayValue = formatDateTime(value);
                                        }
                                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                        return (
                                            <div key={key}>
                                                <p className="text-xs text-gray-400">{label}</p>
                                                <p className="text-sm text-gray-700">{displayValue}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Attachment */}
                        {lr.attachment && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    Attachment
                                </h3>
                                <a
                                    href={lr.attachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline flex items-center gap-1 text-sm"
                                    style={{ color: GOLD }}
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
                    <div className="lg:col-span-1 space-y-6">
                        {/* Balance Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                                <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Current Balance
                            </h3>
                            <div className="text-center py-2">
                                <p className="text-3xl font-bold" style={{ color: GOLD }}>
                                    {parseFloat(balance || 0).toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-400">{balanceLabel || lr.leave_type?.name || 'days'}</p>
                            </div>
                        </div>

                        {/* Timeline Card */}
                        {timelineSteps.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-6">
                                <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Workflow Timeline
                                </h3>
                                <div className="space-y-4">
                                    {timelineSteps.map((step, index) => (
                                        <div key={index} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className={`size-6 rounded-full ${getTimelineColor(step.label)} flex items-center justify-center text-white`}>
                                                    {getTimelineIcon(step.icon)}
                                                </div>
                                                {index < timelineSteps.length - 1 && (
                                                    <div className="w-0.5 h-6 bg-gray-200"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-700">{step.label}</p>
                                                <p className="text-xs text-gray-500">{formatDateTime(step.date)}</p>
                                                {step.reason && (
                                                    <p className="text-xs text-gray-500 mt-1 break-words">Reason: {step.reason}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Actions --- */}
                {canAct ? (
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
                ) : (
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {lr.status === 'department_approved' ? (
                            <span>You have already approved this request. Awaiting Admin final approval.</span>
                        ) : (
                            <span>This request is already <strong className="font-semibold">{getStatusLabel(lr.status)}</strong>. No further actions are available.</span>
                        )}
                    </div>
                )}

                {/* --- Reject Modal --- */}
                {showRejectModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold" style={{ color: NAVY }}>Reject Leave Request</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Please provide a reason for rejecting this leave request.
                            </p>
                            <div className="mb-4">
                                <label className="block text-sm text-gray-700 mb-1">Reason *</label>
                                <textarea
                                    rows="3"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#ffbf00] focus:ring-[#ffbf00] transition"
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
        </DepartmentHeadLayout>
    );
}
