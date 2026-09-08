import EmployeeLayout from '@/Layouts/EmployeeLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ leaveRequest }) {
    const {
        id,
        leave_type,
        detail,
        dates,
        number_of_days,
        days_with_pay,
        days_without_pay,
        status,
        reason,
        remarks,
        commutation,
        date_filed,
        start_date,
        end_date,
        attachment,
        employee,
        employee_name_snapshot,
        position_snapshot,
        office_department_snapshot,
        submitted_at,
        certified_at,
        approved_at,
        rejected_at,
        rejection_reason,
        cancelled_at,
        cancellation_reason,
        created_at,
        approved_reschedule,   // ← now available from controller
        active_reschedule,     // ← also available
    } = leaveRequest;

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
            const dateStr = item.leave_date;
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

    // --- Status mapping with override for approved reschedule ---
    const getStatusInfo = (status, hasApprovedReschedule) => {
        if (hasApprovedReschedule) {
            return {
                label: 'Reschedule Approved',
                color: 'bg-green-500',
                text: 'text-green-700',
                bg: 'bg-green-50',
                border: 'border-green-200',
            };
        }
        const map = {
            pending: { label: 'Pending', color: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
            certified: { label: 'Certified', color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
            department_approved: { label: 'Department Approved', color: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
            approved: { label: 'Fully Approved', color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
            rejected: { label: 'Rejected', color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
            cancelled: { label: 'Cancelled', color: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
        };
        return map[status] || map.pending;
    };

    const hasApprovedReschedule = !!approved_reschedule;
    const hasActiveReschedule = !!active_reschedule;
    const statusInfo = getStatusInfo(status, hasApprovedReschedule);

    // --- Additional details ---
    const additionalDetails = [];
    if (detail) {
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
            const value = detail[key];
            if (value) {
                let display = value;
                if (key === 'expected_delivery_date') display = formatDate(value);
                additionalDetails.push({ label, value: display });
            }
        });
    }

    // --- Timeline events ---
    const events = [];
    if (submitted_at || created_at) {
        events.push({ label: 'Submitted', date: submitted_at || created_at, icon: 'submitted' });
    }
    if (certified_at) {
        events.push({ label: 'Certified by HRMO', date: certified_at, icon: 'certified' });
    }
    if (approved_at) {
        events.push({ label: 'Approved by Department Head', date: approved_at, icon: 'department_approved' });
    }
    if (leaveRequest.final_approved_at) {
        events.push({ label: 'Fully Approved by Admin', date: leaveRequest.final_approved_at, icon: 'admin_approved' });
    }
    if (rejected_at) {
        events.push({ label: 'Rejected', date: rejected_at, reason: rejection_reason, icon: 'rejected' });
    }
    if (cancelled_at) {
        events.push({ label: 'Cancelled', date: cancelled_at, reason: cancellation_reason, icon: 'cancelled' });
    }

    const employeeName = employee?.full_name || employee_name_snapshot || '—';
    const employeePosition = employee?.position || position_snapshot || '';
    const employeeDepartment = employee?.department?.department_name || office_department_snapshot || '';

    // --- Icons ---
    const getStatusIcon = (status, hasApprovedReschedule) => {
        // Reuse the same icon for approved reschedule as approved
        const iconMap = {
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
        if (hasApprovedReschedule) return iconMap.approved;
        return iconMap[status] || iconMap.pending;
    };

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
        admin_approved: (
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
            Rejected: 'bg-red-500',
            Cancelled: 'bg-gray-500',
        };
        return map[label] || 'bg-gray-300';
    };

    // Determine if reschedule action is allowed
    const canRequestReschedule = status === 'approved' && !hasApprovedReschedule && !hasActiveReschedule;

    return (
        <EmployeeLayout>
            <Head title={`Leave Request #${id}`} />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

                {/* Back button */}
                <Link
                    href={route('employee.leave-requests.index')}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-4"
                >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Requests
                </Link>

                {/* Status Banner */}
                <div className={`rounded-xl border ${statusInfo.border} ${statusInfo.bg} p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6`}>
                    <div className="flex items-center gap-3">
                        <div className={`size-10 rounded-full ${statusInfo.color} flex items-center justify-center text-white flex-shrink-0`}>
                            {getStatusIcon(status, hasApprovedReschedule)}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                            <p className={`text-base sm:text-lg font-bold ${statusInfo.text}`}>{statusInfo.label}</p>
                        </div>
                    </div>
                    <div className="text-xs text-gray-600">
                        <span className="font-medium">Request ID:</span> #{id}
                        <span className="mx-2">·</span>
                        <span className="font-medium">Filed:</span> {formatDateShort(date_filed)}
                    </div>
                </div>

                {/* ===== Reschedule Notice (if approved) ===== */}
                {hasApprovedReschedule && (
                    <div className="mb-6 bg-green-50 border border-green-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <svg className="size-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold text-green-800">Reschedule Approved</p>
                                <p className="text-sm text-green-700">
                                    Please visit the Reschedule page to view the updated leave dates and details.
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('employee.reschedules.show', approved_reschedule.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm hover:shadow-md text-sm font-medium whitespace-nowrap"
                        >
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Reschedule
                        </Link>
                    </div>
                )}

                {/* ===== Reschedule Action Button (only if allowed) ===== */}
                {canRequestReschedule && (
                    <div className="mb-6 flex justify-end">
                        <Link
                            href={route('employee.reschedule.create', id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition shadow-sm hover:shadow-md text-sm font-medium"
                        >
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Request Reschedule
                        </Link>
                    </div>
                )}

                {/* If there's an active reschedule but not approved yet, show a message */}
                {hasActiveReschedule && !hasApprovedReschedule && (
                    <div className="mb-6 bg-blue-50 border border-blue-300 rounded-xl p-4">
                        <p className="text-sm text-blue-700">
                            <span className="font-semibold">Reschedule Request Pending:</span> Your reschedule request is currently being reviewed.
                            <Link
                                href={route('employee.reschedules.show', active_reschedule.id)}
                                className="ml-2 text-blue-600 hover:underline font-medium"
                            >
                                View reschedule details
                            </Link>
                        </p>
                    </div>
                )}

                {/* Two-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Leave Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
                            <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                                <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Leave Information
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500">Leave Type</p>
                                    <p className="text-base sm:text-lg font-semibold text-gray-900">{leave_type?.name || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500">Dates</p>
                                    <div className="mt-1 space-y-3">
                                        {dates && dates.length > 0 ? (
                                            groupDatesByMonth(dates).map((group) => (
                                                <div key={group.monthName}>
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
                                            ))
                                        ) : start_date && end_date ? (
                                            <span className="text-sm text-gray-600">
                                                {formatDateShort(start_date)} – {formatDateShort(end_date)}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-600">—</span>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Total Days</p>
                                        <p className="text-base sm:text-lg font-bold text-gray-900">{formatDays(number_of_days)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">With Pay</p>
                                        <p className="text-base sm:text-lg font-bold text-green-600">{formatDays(days_with_pay)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Without Pay</p>
                                        <p className="text-base sm:text-lg font-bold text-red-600">{formatDays(days_without_pay)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Cash Conversion</p>
                                        <p className="text-sm sm:text-base font-semibold text-gray-700">{commutation === 'requested' ? 'Requested' : 'Not requested'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Employee Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
                            <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                                <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Employee
                            </h3>
                            <p className="text-base sm:text-lg font-semibold text-gray-900">{employeeName}</p>
                            {employeePosition && <p className="text-sm text-gray-600">{employeePosition}</p>}
                            {employeeDepartment && <p className="text-sm text-gray-600">{employeeDepartment}</p>}
                        </div>

                        {/* Additional Details */}
                        {additionalDetails.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
                                <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                                    <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Additional Details
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

                        {/* Reason & Remarks */}
                        {(reason || remarks) && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
                                {reason && (
                                    <div className="mb-3">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Reason</p>
                                        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{reason}</p>
                                    </div>
                                )}
                                {remarks && (
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Remarks</p>
                                        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{remarks}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Attachment */}
                        {attachment && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Attachment</p>
                                <a
                                    href={attachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-[#FF2D20] hover:underline font-medium"
                                >
                                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    View Attachment
                                </a>
                            </div>
                        )}

                        {/* Date filed */}
                        <div className="text-xs text-gray-400 text-right">
                            Filed on {formatDate(date_filed)}
                        </div>
                    </div>

                    {/* Right Column – History */}
                    {events.length > 0 && (
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 sticky top-6">
                                <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    History
                                </h3>
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
                        </div>
                    )}
                </div>

            </div>
        </EmployeeLayout>
    );
}