import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import SpecialRequestInfo from '@/Components/Admin/SpecialRequestInfo';
import { useState } from 'react';

export default function Show({ leaveRequest, balance, balanceLabel, hasActiveDelegation }) {
    const [processing, setProcessing] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [showApprovalDaysModal, setShowApprovalDaysModal] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [approvedDays, setApprovedDays] = useState(null);
    const [approveAll, setApproveAll] = useState(true);
    const [daysInputError, setDaysInputError] = useState('');

    const lr = leaveRequest;
    const originalDays = lr.original_number_of_days || lr.number_of_days;
    const isPartiallyApproved =
    lr.status === 'approved' &&
    Number(originalDays) !== Number(lr.number_of_days);

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
    // If it's an integer, return as integer
    if (Number.isInteger(num)) return num.toString();
    // For half days (e.g., 1.5), show one decimal
    if (num % 0.5 === 0) return num.toFixed(1);
    // Otherwise, show up to 2 decimals but trim trailing zeros
    const formatted = num.toFixed(2);
    // Remove trailing zeros after decimal
    return parseFloat(formatted).toString();
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

    // --- Status info ---
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            },
            approved: {
                label: 'Fully Approved',
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
                bg: 'bg-gray-100',
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

    // --- Timeline events ---
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
        events.push({ label: 'Fully Approved by Admin', date: lr.final_approved_at, icon: 'approved' });
    }
    if (lr.rejected_at) {
        events.push({ label: 'Rejected', date: lr.rejected_at, reason: lr.rejection_reason, icon: 'rejected' });
    }
    if (lr.cancelled_at) {
        events.push({ label: 'Recalled', date: lr.cancelled_at, reason: lr.cancellation_reason, icon: 'cancelled' });
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
            'Fully Approved by Admin': 'bg-green-500',
            Approved: 'bg-green-500',
            Rejected: 'bg-red-500',
            Recalled: 'bg-gray-500',
            Cancelled: 'bg-gray-500',
        };
        return map[label] || 'bg-gray-300';
    };

    // --- Render date display ---
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
        setShowApprovalDaysModal(true);
        setApprovedDays(null);
        setApproveAll(true);
        setDaysInputError('');
    };

    const handleApprovalDaysContinue = () => {
        if (!approveAll) {
            const days = parseFloat(approvedDays);
            if (!days || days <= 0 || days > originalDays) {
                setDaysInputError(`Please enter a number between 0.5 and ${originalDays}.`);
                return;
            }
            if (!Number.isInteger(days) && days % 0.5 !== 0) {
                setDaysInputError('Please enter a valid number (whole or half days).');
                return;
            }
        }
        setShowApprovalDaysModal(false);
        setShowPinModal(true);
        setPin('');
        setPinError('');
    };

    const submitApproval = () => {
        if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            setPinError('Please enter a valid 4-digit PIN.');
            return;
        }
        setProcessing(true);

        const payload = { pin };
        if (!approveAll) {
            payload.approved_days = parseFloat(approvedDays);
        }

        router.post(route('admin.leave-requests.approve', lr.id), payload, {
            onSuccess: () => {
                setShowPinModal(false);
                setPin('');
                setProcessing(false);
                setShowApprovalDaysModal(false);
            },
            onError: (errors) => {
                if (errors.pin) {
                    setPinError(errors.pin);
                } else {
                    setPinError('Invalid PIN. Please try again.');
                }
                setProcessing(false);
            },
        });
    };

    const handleReject = () => setShowRejectModal(true);

    const confirmReject = () => {
        if (!rejectReason.trim()) return;
        setProcessing(true);
        router.post(route('admin.leave-requests.reject', lr.id), { reason: rejectReason }, {
            onSuccess: () => {
                setShowRejectModal(false);
                setRejectReason('');
                setProcessing(false);
            },
            onError: () => { setProcessing(false); alert('Rejection failed.'); },
        });
    };

    const isActionable = lr.status === 'department_approved' && !hasActiveDelegation;
    const isSpecialRequest = ['monetization', 'terminal_leave'].includes(lr.request_type);
    const isCancelled = lr.status === 'cancelled';

    return (
        <AdminLayout>
            <Head title={`Leave Request #${lr.id}`} />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

                <Link
                    href={route('admin.leave-requests.index')}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-4"
                >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Requests
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
                            {isSpecialRequest && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {lr.request_type === 'monetization' ? 'Monetization' : 'Terminal Leave'} request
                                </p>
                            )}
                            {isPartiallyApproved && (
                                <p className="text-xs text-yellow-600 mt-1">
                                    <span className="font-medium">Partial Approval:</span> {lr.number_of_days} of {originalDays} days approved
                                </p>
                            )}
                            {isCancelled && lr.cancellation_reason && (
                                <p className="text-xs text-gray-500 mt-1">Reason: {lr.cancellation_reason}</p>
                            )}
                        </div>
                    </div>
                    <div className="text-xs text-gray-600">
                        <span className="font-medium">Request ID:</span> #{lr.id}
                        <span className="mx-2">·</span>
                        <span className="font-medium">Filed:</span> {formatDate(lr.date_filed)}
                    </div>
                </div>

                {/* Special Request Info */}
                {(lr.request_type === 'monetization' || lr.request_type === 'terminal_leave') && (
                    <SpecialRequestInfo leaveRequest={lr} balance={balance} balanceLabel={balanceLabel} />
                )}

                {/* Partial Approval Note */}
                {isPartiallyApproved && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            <span className="font-semibold">Partial Approval:</span> This request was partially approved.
                            Only <strong>{lr.number_of_days} days</strong> were approved out of the original <strong>{originalDays} days</strong>.
                        </p>
                        {lr.remarks && lr.remarks.includes('Partial approval') && (
                            <p className="text-xs text-yellow-600 mt-1">Note: {lr.remarks}</p>
                        )}
                    </div>
                )}

                {/* Two-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column – Details (2/3) */}
                    <div className="lg:col-span-2 space-y-5">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">Leave Information</h3>
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
                                    {isPartiallyApproved && (
                                        <p className="text-xs text-gray-500 line-through">
                                            Original: {formatDays(originalDays)}
                                        </p>
                                    )}
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
                                {lr.monetized_days && (
                                    <div>
                                        <p className="text-xs text-gray-500">Monetized Days</p>
                                        <p className="text-sm font-bold text-gray-800">{formatDays(lr.monetized_days)}</p>
                                    </div>
                                )}
                            </div>
                            {lr.reason && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">Reason</p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{lr.reason}</p>
                                </div>
                            )}
                        </div>

                        {additionalDetails.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">Additional Information</h3>
                                <ul className="space-y-1 text-sm text-gray-700">
                                    {additionalDetails.map((item, idx) => (
                                        <li key={idx}><span className="font-medium">{item.label}:</span> {item.value}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {lr.attachment && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Attachment</p>
                                <a href={lr.attachment} target="_blank" rel="noopener noreferrer" className="text-[#FF2D20] hover:underline flex items-center gap-1.5 text-sm">
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
                            <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">Current Balance</h3>
                            <div className="text-center py-2">
                                <p className="text-3xl font-bold text-[#FF2D20]">{parseFloat(balance || 0).toFixed(2)}</p>
                                <p className="text-xs text-gray-400">{balanceLabel || lr.leave_type?.name || 'days'}</p>
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

                {/* Actions */}
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

                {hasActiveDelegation && lr.status === 'department_approved' && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                        <strong>Delegation Active:</strong> You have delegated your approval authority. You cannot approve or reject requests during this period.
                    </div>
                )}

                {isCancelled && (
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        <strong>Recalled:</strong> This request was fully approved and later recalled (cancelled). The Vacation Leave credits have been refunded.
                        {lr.cancellation_reason && <span className="block mt-1 text-gray-500">Reason: {lr.cancellation_reason}</span>}
                    </div>
                )}

                {!isActionable && lr.status !== 'department_approved' && !isCancelled && (
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        This request is already <span className="font-semibold">{getStatusInfo(lr.status).label}</span>. No further actions are available.
                    </div>
                )}

                {/* ===== APPROVAL DAYS MODAL ===== */}
                {showApprovalDaysModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6 border border-gray-200 shadow-xl">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Approve Leave Request</h3>
                            <div className="mb-4">
                                <p className="text-sm text-gray-600"><span className="font-medium">Employee:</span> {lr.employee?.full_name}</p>
                                <p className="text-sm text-gray-600"><span className="font-medium">Leave Type:</span> {lr.leave_type?.name}</p>
                                <p className="text-sm text-gray-600"><span className="font-medium">Requested Days:</span> {formatDays(originalDays)} days</p>
                                <p className="text-sm text-gray-600"><span className="font-medium">Dates:</span> {renderDateDisplay()}</p>
                            </div>

                            <p className="text-sm text-gray-700 mb-3">Do you want to approve all the days requested by the employee?</p>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="approveAll"
                                        checked={approveAll}
                                        onChange={() => setApproveAll(true)}
                                        className="form-radio text-[#FF2D20] focus:ring-[#FF2D20]"
                                    />
                                    <span className="text-sm text-gray-700">Yes, approve all {formatDays(originalDays)} days</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="approveAll"
                                        checked={!approveAll}
                                        onChange={() => setApproveAll(false)}
                                        className="form-radio text-[#FF2D20] focus:ring-[#FF2D20]"
                                    />
                                    <span className="text-sm text-gray-700">No, approve only a specific number of days</span>
                                </label>

                                {!approveAll && (
                                    <div className="mt-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of days to approve</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0.5"
                                            max={originalDays}
                                            value={approvedDays ?? ''}
                                            onChange={(e) => {
                                                setApprovedDays(e.target.value);
                                                setDaysInputError('');
                                            }}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF2D20] focus:ring-[#FF2D20] transition"
                                            placeholder={`1 – ${originalDays}`}
                                        />
                                        {daysInputError && <p className="mt-1 text-sm text-red-500">{daysInputError}</p>}
                                        <p className="text-xs text-gray-500 mt-1">Only approved days will be deducted from the balance.</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowApprovalDaysModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApprovalDaysContinue}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== PIN VERIFICATION MODAL ===== */}
                {showPinModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6 border border-gray-200 shadow-xl">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Verify Admin PIN</h3>
                            <p className="text-sm text-gray-600 mb-4">Enter your 4‑digit admin PIN to approve this leave request.</p>
                            <div className="mb-4">
                                <label className="block text-sm text-gray-700 mb-1">PIN</label>
                                <input
                                    type="password"
                                    maxLength="4"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={pin}
                                    onChange={(e) => {
                                        setPin(e.target.value);
                                        setPinError('');
                                    }}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF2D20] focus:ring-[#FF2D20] transition text-center text-2xl tracking-widest"
                                    placeholder="• • • •"
                                    autoFocus
                                />
                                {pinError && <p className="mt-1 text-sm text-red-500">{pinError}</p>}
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => { setShowPinModal(false); setPin(''); setPinError(''); }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitApproval}
                                    disabled={processing || !pin || pin.length !== 4}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    {processing ? 'Verifying...' : 'Confirm Approval'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== REJECT MODAL ===== */}
                {showRejectModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6 border border-gray-200 shadow-xl">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Reject Leave Request</h3>
                            <p className="text-sm text-gray-600 mb-4">Provide a reason for rejecting this request.</p>
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
        </AdminLayout>
    );
}
