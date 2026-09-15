import MayorLayout from '@/Layouts/MayorLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ leaveRequest }) {
    const lr = leaveRequest;
    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatDateTime = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
            if (!groups[key]) { groups[key] = { monthName, days: [] }; }
            groups[key].days.push(d.getDate());
        });
        return Object.keys(groups).sort((a, b) => a.localeCompare(b)).map((key) => groups[key]);
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            certified: 'bg-blue-100 text-blue-800',
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
            approved: 'Approved',
            rejected: 'Rejected',
            cancelled: 'Cancelled',
        };
        return labels[status] || status;
    };

    const getStatusDescription = (status) => {
        const descriptions = {
            pending: 'Your leave request has been submitted and is awaiting review by the HRMO.',
            certified: 'Your leave request has been certified by the HRMO. It is now awaiting the signature of the designated approvers on the physical form, after which HRMO will finalize it.',
            approved: 'Your leave request has been officially approved. The leave credits have been deducted from your balance.',
            rejected: 'Your leave request has been declined. Please see the reason below.',
            cancelled: 'Your leave request has been cancelled.',
        };
        return descriptions[status] || '';
    };

    let dateDisplay = null;
    if (lr.dates && lr.dates.length > 0) {
        const grouped = groupDatesByMonth(lr.dates);
        if (grouped.length > 0) {
            dateDisplay = grouped.map((group) => (
                <div key={group.monthName} className="mb-3 last:mb-0">
                    <span className="text-sm font-medium text-gray-700">{group.monthName}</span>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                        {group.days.sort((a, b) => a - b).map((day) => (
                            <div key={day} className="flex items-center justify-center min-w-[44px] h-10 px-3 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-200 transition">{day}</div>
                        ))}
                    </div>
                </div>
            ));
        }
    } else if (lr.start_date && lr.end_date) {
        dateDisplay = <span className="text-sm text-gray-700">{formatDate(lr.start_date)} – {formatDate(lr.end_date)}</span>;
    } else {
        dateDisplay = <span className="text-sm text-gray-500">—</span>;
    }

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

    // Mayor workflow timeline — 3 steps
    const steps = [
        {
            key: 'submitted',
            label: 'Filed by Mayor',
            status: (lr.submitted_at || lr.created_at) ? 'completed' : 'pending',
            date: lr.submitted_at || lr.created_at,
        },
        {
            key: 'certified',
            label: 'HRMO Certified',
            status: lr.certified_at
                ? 'completed'
                : (lr.status === 'pending' ? 'current' : 'pending'),
            date: lr.certified_at,
        },
        {
            key: 'approved',
            label: 'Approved',
            status: lr.final_approved_at
                ? 'completed'
                : (lr.status === 'certified' ? 'current' : 'pending'),
            date: lr.final_approved_at,
        },
    ];

    const isRejected = lr.status === 'rejected';
    const isCancelled = lr.status === 'cancelled';
    const isCertified = lr.status === 'certified';
    const isApproved = lr.status === 'approved';

    const getStepIcon = (stepStatus) => {
        if (stepStatus === 'completed') {
            return (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white">
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            );
        } else if (stepStatus === 'current') {
            return (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF2D20] text-white ring-2 ring-[#FF2D20] ring-offset-2">
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            );
        } else {
            return (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-400">
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            );
        }
    };

    return (
        <MayorLayout>
            <Head title={`Leave Request #${lr.id}`} />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                <Link href={route('mayor.my-leave-requests.index')} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-6">
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Requests
                </Link>

                {/* Status Hero Banner */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 sm:p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: GOLD }}></div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${getStatusBadge(lr.status)} text-2xl font-bold flex-shrink-0`}>
                                {isApproved && (
                                    <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                {isCertified && (
                                    <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                {isRejected && (
                                    <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                {isCancelled && (
                                    <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                )}
                                {!['certified', 'rejected', 'cancelled', 'approved'].includes(lr.status) && (
                                    <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    {getStatusLabel(lr.status)}
                                </h2>
                                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                    <span>Request #{lr.id}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <span>Filed {formatDateTime(lr.date_filed)}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600">{getStatusDescription(lr.status)}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-600">
                        {lr.certified_at && (
                            <div><span className="font-medium">Certified:</span> {formatDateTime(lr.certified_at)}</div>
                        )}
                        {lr.final_approved_at && (
                            <div><span className="font-medium">Approved:</span> {formatDateTime(lr.final_approved_at)}</div>
                        )}
                        {lr.rejected_at && (
                            <div><span className="font-medium">Rejected:</span> {formatDateTime(lr.rejected_at)}</div>
                        )}
                        {lr.cancelled_at && (
                            <div><span className="font-medium">Cancelled:</span> {formatDateTime(lr.cancelled_at)}</div>
                        )}
                    </div>
                </div>

                {/* Two-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-5">
                        {/* Leave Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">Leave Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><p className="text-xs text-gray-500">Employee</p><p className="text-base font-semibold text-gray-800">{lr.employee?.full_name}</p></div>
                                <div><p className="text-xs text-gray-500">Leave Type</p><p className="text-base font-semibold text-gray-800">{lr.leave_type?.name}</p></div>
                                <div className="sm:col-span-2"><p className="text-xs text-gray-500">Dates</p><div className="mt-1">{dateDisplay}</div></div>
                                <div><p className="text-xs text-gray-500">Total Days</p><p className="text-sm font-bold text-gray-800">{formatDays(lr.number_of_days)}</p></div>
                                <div><p className="text-xs text-gray-500">With Pay</p><p className="text-sm text-green-600">{formatDays(lr.days_with_pay)}</p></div>
                                <div><p className="text-xs text-gray-500">Without Pay</p><p className="text-sm text-red-600">{formatDays(lr.days_without_pay)}</p></div>
                                <div><p className="text-xs text-gray-500">Commutation</p><p className="text-sm text-gray-700">{lr.commutation === 'requested' ? 'Requested' : 'Not Requested'}</p></div>
                            </div>
                            {lr.reason && <div className="mt-3 pt-3 border-t border-gray-100"><p className="text-xs text-gray-500">Reason</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{lr.reason}</p></div>}
                        </div>

                        {additionalDetails.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">Additional Information</h3>
                                <ul className="space-y-1 text-sm text-gray-700">
                                    {additionalDetails.map((item, idx) => <li key={idx}><span className="font-medium">{item.label}:</span> {item.value}</li>)}
                                </ul>
                            </div>
                        )}

                        {lr.attachment && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Attachment</p>
                                <a href={lr.attachment} target="_blank" rel="noopener noreferrer" className="text-[#FF2D20] hover:underline flex items-center gap-1.5 text-sm">
                                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                    View Attachment
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-1 space-y-5">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-6">
                            <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2 mb-4" style={{ color: NAVY }}>
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Workflow Timeline
                            </h3>

                            {isRejected || isCancelled ? (
                                <div className="flex flex-col items-center justify-center py-4 text-center">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-3">
                                        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">
                                        {isRejected ? 'Request Rejected' : 'Request Cancelled'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {isRejected ? lr.rejection_reason || 'No reason provided' : lr.cancellation_reason || 'No reason provided'}
                                    </p>
                                </div>
                            ) : (
                                <div className="relative">
                                    {steps.map((step, index) => {
                                        const isCompleted = step.status === 'completed';
                                        const isCurrent = step.status === 'current';
                                        const isLast = index === steps.length - 1;

                                        return (
                                            <div key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
                                                {!isLast && (
                                                    <div className={`absolute left-4 top-8 bottom-0 w-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                                )}
                                                <div className="z-10 flex-shrink-0">
                                                    {getStepIcon(step.status)}
                                                </div>
                                                <div className="flex-1 pt-1">
                                                    <p className={`text-sm font-medium ${isCompleted ? 'text-gray-900' : isCurrent ? 'text-[#FF2D20]' : 'text-gray-400'}`}>
                                                        {step.label}
                                                    </p>
                                                    {isCurrent && (
                                                        <p className="text-xs text-[#FF2D20] font-medium mt-0.5">In Progress</p>
                                                    )}
                                                    {isCompleted && step.date && (
                                                        <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(step.date)}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MayorLayout>
    );
}