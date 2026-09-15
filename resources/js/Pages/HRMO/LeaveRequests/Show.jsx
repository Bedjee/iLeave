import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, Link, router } from '@inertiajs/react';
import SpecialRequestInfo from '@/Components/HRMO/SpecialRequestInfo';
import { useState, useEffect } from 'react';

export default function Show({
    leaveRequest,
    balance,
    balanceLabel,
    hasPrinted = false,
    isMayorRequest = false,
}) {
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedAction, setSelectedAction] = useState('');
    const [remarks, setRemarks] = useState('');
    const [processing, setProcessing] = useState(false);

    // Mayor approvers state
    const [showApproversModal, setShowApproversModal] = useState(false);
    const [approvers, setApprovers] = useState([
        { name: '', position: '', role_label: 'Approved by' },
        { name: '', position: '', role_label: 'Noted by' },
    ]);

    // Certify-modal approvers state (separate — only used at certification time)
    const [certApprovers, setCertApprovers] = useState([
        { name: '', position: '', role_label: 'Approved by' },
        { name: '', position: '', role_label: 'Noted by' },
    ]);

    // Finalize modal state
    const [showFinalizeModal, setShowFinalizeModal] = useState(false);
    const [finalizeProcessing, setFinalizeProcessing] = useState(false);

    const lr = leaveRequest;

    // Fallback in case the prop isn't passed
    const isActuallyMayorRequest = isMayorRequest || lr.employee?.user?.role === 'mayor';

    // ------------------------------------------------------------------------
    // Pre-fill approver slots from existing data
    // ------------------------------------------------------------------------
    useEffect(() => {
        const existing = lr.mayor_approvers || [];
        const slots = [0, 1].map((i) => ({
            name: existing[i]?.name || '',
            position: existing[i]?.position || '',
            role_label: existing[i]?.role_label || (i === 0 ? 'Approved by' : 'Noted by'),
        }));
        setApprovers(slots);
        setCertApprovers(slots);
    }, [lr.id]);

    // ------------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------------
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

    // Group dates by month (for specific-dates)
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

    // Prepare date display
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
                                className="flex items-center justify-center min-w-[44px] h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 transition"
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
        dateDisplay = <span className="text-sm text-gray-400">—</span>;
    }

    // Filter detail fields (exclude internal IDs and timestamps)
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

    // ------------------------------------------------------------------------
    // Status helpers
    // ------------------------------------------------------------------------
    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            certified: 'bg-blue-100 text-blue-800',
            department_approved: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Pending',
            certified: 'Certified',
            department_approved: 'Department Head Approved',
            approved: 'Fully Approved',
            rejected: 'Rejected',
            cancelled: 'Cancelled',
        };
        return labels[status] || status;
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: (
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            certified: (
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            department_approved: (
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            approved: (
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            rejected: (
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            cancelled: (
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
            ),
        };
        return icons[status] || icons.pending;
    };

    const getStatusDescription = (status) => {
        const descriptions = {
            pending: 'This leave request is awaiting review by the HRMO. No action has been taken yet.',
            certified: isActuallyMayorRequest
                ? 'This Mayor leave request has been certified. Print the form, get it signed by the designated approvers, then finalize to deduct the credits.'
                : 'The leave request has been certified by the HRMO and is now ready for final approval or rejection.',
            department_approved: 'The Department Head has recommended approval. Awaiting Admin final approval.',
            approved: 'The leave request has been fully approved. The employee can now take the leave.',
            rejected: 'The leave request has been declined. The employee will be notified with the provided reason.',
            cancelled: 'The leave request has been cancelled. This may have been done by the employee or HRMO.',
        };
        return descriptions[status] || '';
    };

    // ------------------------------------------------------------------------
    // Timeline
    // ------------------------------------------------------------------------
    const timelineSteps = [];
    if (lr.submitted_at || lr.created_at) {
        timelineSteps.push({ label: 'Submitted', date: lr.submitted_at || lr.created_at, icon: 'submitted' });
    }
    if (lr.certified_at) {
        timelineSteps.push({ label: 'Certified', date: lr.certified_at, icon: 'certified' });
    }
    if (lr.approved_at) {
        let label = 'Approved by Department Head';
        if (lr.status === 'department_approved') {
            label = 'Department Head Approved';
        }
        timelineSteps.push({ label, date: lr.approved_at, icon: 'department_approved' });
    }
   if (lr.final_approved_at) {
    timelineSteps.push({
        label: isActuallyMayorRequest ? 'Approved' : 'Admin Final Approval',
        date: lr.final_approved_at,
        icon: 'final_approved',
    });
}


    if (lr.rejected_at) {
        timelineSteps.push({ label: 'Rejected', date: lr.rejected_at, reason: lr.rejection_reason, icon: 'rejected' });
    }
    if (lr.cancelled_at) {
        timelineSteps.push({ label: 'Cancelled', date: lr.cancelled_at, reason: lr.cancellation_reason, icon: 'cancelled' });
    }

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
            department_approved: (
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            final_approved: (
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
            Certified: 'bg-blue-500',
            'Approved by Department Head': 'bg-yellow-500',
            'Department Head Approved': 'bg-yellow-500',
            'Admin Final Approval': 'bg-green-500',
            Rejected: 'bg-red-500',
            Cancelled: 'bg-gray-500',
        };
        return map[label] || 'bg-gray-300';
    };

    // ------------------------------------------------------------------------
    // Actions
    // ------------------------------------------------------------------------
    const isActionDisabled = () => {
        return ['approved', 'rejected', 'cancelled'].includes(lr.status);
    };

    const handleAction = (action) => {
        setSelectedAction(action);
        setShowActionModal(true);
    };

    const confirmAction = () => {
        setProcessing(true);

        const payload = {
            status: selectedAction,
            remarks: remarks,
        };

        // Only attach approvers when certifying a Mayor's request
        if (selectedAction === 'certified' && isActuallyMayorRequest) {
            payload.approvers = certApprovers;
        }

        router.visit(route('hrmo.leave-requests.update', lr.id), {
            method: 'post',
            data: payload,
            preserveScroll: true,
            onSuccess: () => {
                setShowActionModal(false);
                setRemarks('');
                setSelectedAction('');
                setProcessing(false);
            },
            onError: (errors) => {
                console.error('❌ Error:', errors);
                alert('An error occurred: ' + (errors.error || 'Unknown error'));
                setProcessing(false);
            },
        });
    };

    const submitApprovers = () => {
        router.post(
            route('hrmo.leave-requests.update-approvers', lr.id),
            { approvers },
            {
                preserveScroll: true,
                onSuccess: () => setShowApproversModal(false),
                onError: (e) => alert(e.error || 'Failed to save approvers.'),
            }
        );
    };

    const submitFinalize = () => {
        setFinalizeProcessing(true);
        router.post(
            route('hrmo.leave-requests.mark-approved', lr.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowFinalizeModal(false);
                    setFinalizeProcessing(false);
                },
                onError: (e) => {
                    setFinalizeProcessing(false);
                    alert(e.error || 'Failed to finalize request.');
                },
            }
        );
    };

    // ------------------------------------------------------------------------
    // Color palette
    // ------------------------------------------------------------------------
    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';
    const NAVY_LIGHT = '#f0f4f8';

    // ------------------------------------------------------------------------
    // Render
    // ------------------------------------------------------------------------
    return (
        <HRMOLayout>
            <Head title={`Leave Request #${lr.id}`} />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

                {/* Back & Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link
                        href={route('hrmo.leave-requests.index')}
                        className="text-sm font-medium transition hover:underline flex items-center gap-1"
                        style={{ color: NAVY }}
                    >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Requests
                    </Link>
                    <span className="text-gray-300">|</span>
                    <h2 className="text-xl font-bold" style={{ color: NAVY }}>Leave Request Details</h2>
                </div>

                {/* Status Banner */}
                <div className={`rounded-xl border p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    lr.status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
                    lr.status === 'certified' ? 'border-blue-200 bg-blue-50' :
                    lr.status === 'department_approved' ? 'border-yellow-200 bg-yellow-50' :
                    lr.status === 'approved' ? 'border-green-200 bg-green-50' :
                    lr.status === 'rejected' ? 'border-red-200 bg-red-50' :
                    'border-gray-200 bg-gray-50'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`size-10 rounded-full flex items-center justify-center text-white ${
                            lr.status === 'pending' ? 'bg-yellow-500' :
                            lr.status === 'certified' ? 'bg-blue-500' :
                            lr.status === 'department_approved' ? 'bg-yellow-500' :
                            lr.status === 'approved' ? 'bg-green-500' :
                            lr.status === 'rejected' ? 'bg-red-500' :
                            'bg-gray-500'
                        }`}>
                            {getStatusIcon(lr.status)}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Current Status</p>
                            <p className="text-lg font-bold text-gray-800">
                                {getStatusLabel(lr.status)}
                            </p>
                        </div>
                    </div>
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">Request ID:</span> #{lr.id}
                        <span className="mx-2">·</span>
                        <span className="font-medium">Filed:</span> {formatDateTime(lr.date_filed)}
                    </div>
                </div>

                {/* Status Description */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6 text-sm text-gray-600">
                    <span className="font-medium" style={{ color: NAVY }}>Status info:</span> {getStatusDescription(lr.status)}
                </div>

                {/* Special Request Info */}
                {(lr.request_type === 'monetization' || lr.request_type === 'terminal_leave') && (
                    <SpecialRequestInfo leaveRequest={lr} />
                )}

                {/* Main Two-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column – Leave Details (2/3) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Request Details Card */}
                        <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                            <h3 className="text-xs font-medium uppercase tracking-wider flex items-center gap-2 mb-4" style={{ color: NAVY }}>
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Request Details
                            </h3>

                            {/* Balance Prominent Display */}
                            <div className="rounded-xl border p-4 mb-4 flex items-center justify-between" style={{ backgroundColor: NAVY_LIGHT, borderColor: 'rgba(15,42,82,0.1)' }}>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Current Balance</p>
                                    <p className="text-sm text-gray-700">{balanceLabel || lr.leave_type?.name || 'Leave Type'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold" style={{ color: GOLD }}>{parseFloat(balance || 0).toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">days</p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Leave Type</p>
                                        <p className="text-base font-semibold text-gray-900">{lr.leave_type?.name || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Employee</p>
                                        <p className="text-base font-semibold text-gray-900">{lr.employee?.full_name || '—'}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="text-xs text-gray-500">Leave Dates</p>
                                        <div className="mt-1">{dateDisplay}</div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Total Days</p>
                                        <p className="text-sm font-bold text-gray-900">{formatDays(lr.number_of_days)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">With Pay</p>
                                        <p className="text-sm font-medium text-green-600">{formatDays(lr.days_with_pay)} days</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Without Pay</p>
                                        <p className="text-sm font-medium text-red-600">{formatDays(lr.days_without_pay)} days</p>
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
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">{lr.reason}</p>
                                    </div>
                                )}
                                {lr.remarks && (
                                    <div>
                                        <p className="text-xs text-gray-500">Remarks</p>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">{lr.remarks}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mayor Approvers Card */}
                        {isActuallyMayorRequest && (
                            <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-medium uppercase tracking-wider flex items-center gap-2" style={{ color: NAVY }}>
                                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Approvers &amp; Signatories
                                    </h3>

                                    {lr.status === 'certified' && !hasPrinted && (
                                        <button
                                            onClick={() => setShowApproversModal(true)}
                                            className="text-xs font-medium hover:underline"
                                            style={{ color: GOLD }}
                                        >
                                            Edit
                                        </button>
                                    )}

                                    {hasPrinted && (
                                        <span className="text-xs text-gray-400 italic">Locked — already printed</span>
                                    )}

                                    {lr.status === 'approved' && (
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                            Credits Deducted
                                        </span>
                                    )}
                                </div>

                                {(lr.mayor_approvers || []).filter((a) => a.name).length > 0 ? (
                                    <div className="space-y-3">
                                        {lr.mayor_approvers.filter((a) => a.name).map((ap) => (
                                            <div key={ap.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                                                <p className="text-sm font-semibold text-gray-800">{ap.name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {ap.role_label}
                                                    {ap.position ? ` — ${ap.position}` : ''}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No approvers configured yet.</p>
                                )}

                                <p className="text-xs text-gray-400 mt-3">
                                    These names will appear on the printed Leave Request Form.
                                </p>
                            </div>
                        )}

                        {/* Additional Details */}
                        {Object.keys(filteredDetails).length > 0 && (
                            <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                                <h3 className="text-xs font-medium uppercase tracking-wider flex items-center gap-2 mb-4" style={{ color: NAVY }}>
                                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
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
                                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                                        return (
                                            <div key={key}>
                                                <p className="text-xs text-gray-500">{label}</p>
                                                <p className="text-sm text-gray-700">{displayValue}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Attachment */}
                        {lr.attachment && (
                            <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                                <h3 className="text-xs font-medium uppercase tracking-wider flex items-center gap-2 mb-4" style={{ color: NAVY }}>
                                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    Attachment
                                </h3>
                                <a
                                    href={lr.attachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#ffbf00] hover:underline flex items-center gap-1 text-sm font-medium"
                                >
                                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    View Attachment
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Right Column – Timeline & Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Timeline Card */}
                        {timelineSteps.length > 0 && (
                            <div className="bg-white rounded-xl border p-5 shadow-sm sticky top-6" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                                <h3 className="text-xs font-medium uppercase tracking-wider flex items-center gap-2 mb-4" style={{ color: NAVY }}>
                                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
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
                                                    <p className="text-xs text-gray-600 mt-1 break-words">Reason: {step.reason}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions Card */}
                        {!isActionDisabled() && (
                            <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                                <h3 className="text-xs font-medium uppercase tracking-wider flex items-center gap-2 mb-4" style={{ color: NAVY }}>
                                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Actions
                                </h3>
                                <div className="space-y-2">
                                    {lr.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleAction('certified')}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition text-sm font-medium"
                                                style={{ backgroundColor: NAVY }}
                                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1a3a6a')}
                                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
                                            >
                                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Certify
                                            </button>
                                            <button
                                                onClick={() => handleAction('rejected')}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium"
                                            >
                                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Decline
                                            </button>
                                        </>
                                    )}

                                    {/* 👇 Mayor: Mark as Approved (only for certified Mayor requests) */}
                                    {isActuallyMayorRequest && lr.status === 'certified' && (
                                        <button
                                            onClick={() => setShowFinalizeModal(true)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition text-sm font-medium bg-green-600 hover:bg-green-700"
                                        >
                                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Mark as Approved
                                        </button>
                                    )}

                                    {!['rejected', 'cancelled'].includes(lr.status) && lr.status !== 'pending' && (
                                        <button
                                            onClick={() => handleAction('cancelled')}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition text-sm font-medium"
                                        >
                                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                            Cancel Request
                                        </button>
                                    )}
                                </div>

                                {/* Helper text */}
                                <p className="text-xs text-gray-500 mt-3">
                                    {lr.status === 'pending'
                                        ? 'Certify to recommend approval, or decline to reject.'
                                        : isActuallyMayorRequest && lr.status === 'certified'
                                            ? 'Once signed by the approvers, click "Mark as Approved" to deduct the credits.'
                                            : 'You can cancel this request if it is no longer needed.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ===== Action Confirmation Modal ===== */}
            {showActionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6 border border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {selectedAction === 'certified' ? 'Certify' :
                             selectedAction === 'rejected' ? 'Decline' :
                             selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)} Leave Request
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Are you sure you want to{' '}
                            <span className="font-medium text-gray-800">
                                {selectedAction === 'certified' ? 'certify' :
                                 selectedAction === 'rejected' ? 'decline' :
                                 selectedAction}
                            </span>{' '}
                            this leave request?
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm text-gray-700 mb-1">Remarks (optional)</label>
                            <textarea
                                rows="2"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#ffbf00] focus:ring-[#ffbf00] transition"
                                placeholder="Add a note..."
                            />
                        </div>

                        {/* Certify: Approvers section (only for Mayor requests) */}
                        {selectedAction === 'certified' && isActuallyMayorRequest && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                    Approvers &amp; Signatories
                                </p>
                                <p className="text-[11px] text-gray-400 mb-3">
                                    These names will appear on the printed form. Fill only what you need.
                                </p>

                                {[0, 1].map((idx) => (
                                    <div key={idx} className="border border-gray-200 rounded-lg p-3 mb-2">
                                        <p className="text-[10px] font-semibold text-gray-400 mb-1.5">SLOT {idx + 1}</p>

                                        <input
                                            type="text"
                                            placeholder="Full name"
                                            value={certApprovers[idx]?.name || ''}
                                            onChange={(e) => {
                                                const next = [...certApprovers];
                                                next[idx] = { ...next[idx], name: e.target.value };
                                                setCertApprovers(next);
                                            }}
                                            className="w-full rounded border-gray-300 px-2 py-1.5 text-sm mb-1.5"
                                        />

                                        <input
                                            type="text"
                                            placeholder="Position (e.g., Vice Mayor, Governor)"
                                            value={certApprovers[idx]?.position || ''}
                                            onChange={(e) => {
                                                const next = [...certApprovers];
                                                next[idx] = { ...next[idx], position: e.target.value };
                                                setCertApprovers(next);
                                            }}
                                            className="w-full rounded border-gray-300 px-2 py-1.5 text-sm mb-1.5"
                                        />

                                        <input
                                            type="text"
                                            placeholder="Role label (e.g., Approved by, Noted by)"
                                            value={certApprovers[idx]?.role_label || ''}
                                            onChange={(e) => {
                                                const next = [...certApprovers];
                                                next[idx] = { ...next[idx], role_label: e.target.value };
                                                setCertApprovers(next);
                                            }}
                                            className="w-full rounded border-gray-300 px-2 py-1.5 text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowActionModal(false);
                                    setRemarks('');
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                disabled={processing}
                                className={`px-4 py-2 rounded-lg transition text-white ${
                                    selectedAction === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                                    selectedAction === 'cancelled' ? 'bg-gray-600 hover:bg-gray-700' :
                                    'bg-[#0F2A52] hover:bg-[#1a3a6a]'
                                }`}
                            >
                                {processing ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Edit Approvers Modal ===== */}
            {showApproversModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-2" style={{ color: NAVY }}>
                            Configure Approvers
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            These names will appear on the printed Leave Request Form as the approvers.
                        </p>

                        {[0, 1].map((idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-3 mb-3">
                                <p className="text-[10px] font-semibold text-gray-400 mb-2">SLOT {idx + 1}</p>

                                <input
                                    type="text"
                                    placeholder="Full name"
                                    value={approvers[idx]?.name || ''}
                                    onChange={(e) => {
                                        const next = [...approvers];
                                        next[idx] = { ...next[idx], name: e.target.value };
                                        setApprovers(next);
                                    }}
                                    className="w-full rounded border-gray-300 px-2 py-1.5 text-sm mb-2"
                                />

                                <input
                                    type="text"
                                    placeholder="Position"
                                    value={approvers[idx]?.position || ''}
                                    onChange={(e) => {
                                        const next = [...approvers];
                                        next[idx] = { ...next[idx], position: e.target.value };
                                        setApprovers(next);
                                    }}
                                    className="w-full rounded border-gray-300 px-2 py-1.5 text-sm mb-2"
                                />

                                <input
                                    type="text"
                                    placeholder="Role label"
                                    value={approvers[idx]?.role_label || ''}
                                    onChange={(e) => {
                                        const next = [...approvers];
                                        next[idx] = { ...next[idx], role_label: e.target.value };
                                        setApprovers(next);
                                    }}
                                    className="w-full rounded border-gray-300 px-2 py-1.5 text-sm"
                                />
                            </div>
                        ))}

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setShowApproversModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitApprovers}
                                className="px-4 py-2 text-white rounded-lg text-sm font-medium"
                                style={{ backgroundColor: NAVY }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1a3a6a')}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
                            >
                                Save Approvers
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Finalize (Mark as Approved) Modal ===== */}
            {showFinalizeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 border border-gray-200 shadow-xl">
                        <h3 className="text-lg font-semibold mb-2" style={{ color: NAVY }}>
                            Finalize Mayor Leave Request
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            This action confirms that the physical leave form has been signed by the configured
                            approvers and has been returned to HRMO.
                        </p>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <p className="text-xs text-yellow-800">
                                <strong>Important:</strong> The leave credits will be deducted from the Mayor's
                                balance. This action cannot be undone.
                            </p>
                        </div>

                        {/* Balance preview */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                Balance Preview
                            </p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">{lr.leave_type?.name || 'Leave Type'}</p>
                                    <p className="text-sm font-medium text-gray-700">
                                        Current: {parseFloat(balance || 0).toFixed(2)} days
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">After Deduction</p>
                                    <p className="text-lg font-bold" style={{ color: NAVY }}>
                                        {Math.max(0, parseFloat(balance || 0) - parseFloat(lr.number_of_days || 0)).toFixed(2)} days
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowFinalizeModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitFinalize}
                                disabled={finalizeProcessing}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium disabled:opacity-50"
                            >
                                {finalizeProcessing ? 'Processing...' : 'Confirm & Deduct Credits'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </HRMOLayout>
    );
}