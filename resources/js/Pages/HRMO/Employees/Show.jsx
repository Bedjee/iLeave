import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ employee, balances, leaveTypes }) {
    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';
    const NAVY_DARK = '#081A33';

    const roleLabels = {
        admin: 'Admin',
        hrmo: 'HRMO',
        department_head: 'Department Head',
        mayor: 'Mayor',
        employee: 'Employee',
    };

    const reasonLabels = {
        resigned: 'Resigned',
        retired: 'Retired',
        separated: 'Separated',
        deceased: 'Deceased',
        other: 'Other',
    };

    const isEligibleForBalance = employee.user?.role !== 'hrmo';
    const fullName = employee.full_name || `${employee.firstname} ${employee.lastname}`;
    const currentStatus = employee.user?.status || 'active';
    const separations = employee.separations || [];

    // --- Status modal state ---
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [targetStatus, setTargetStatus] = useState(null);
    const [reason, setReason] = useState('');
    const [remarks, setRemarks] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    // --- Helpers ---
    const getStatusBadge = (status) => {
        const map = {
            active: { label: 'Active', class: 'bg-green-100 text-green-700' },
            suspended: { label: 'Suspended', class: 'bg-yellow-100 text-yellow-700' },
            inactive: { label: 'Inactive', class: 'bg-red-100 text-red-700' },
        };
        return map[status] || map.inactive;
    };

    const statusBadge = getStatusBadge(currentStatus);

    const openStatusModal = (status) => {
        setTargetStatus(status);
        setReason('');
        setRemarks('');
        setError('');
        setShowStatusModal(true);
    };

    const closeStatusModal = () => {
        setShowStatusModal(false);
        setTargetStatus(null);
        setReason('');
        setRemarks('');
        setError('');
    };

    const submitStatusChange = () => {
        if (targetStatus === 'inactive' && !reason) {
            setError('Please select a reason.');
            return;
        }

        setProcessing(true);
        router.patch(
            route('hrmo.employees.update-status', employee.id),
            {
                status: targetStatus,
                reason: targetStatus === 'inactive' ? reason : null,
                remarks: remarks || null,
            },
            {
                onSuccess: () => {
                    setProcessing(false);
                    closeStatusModal();
                },
                onError: (errors) => {
                    setProcessing(false);
                    setError(errors.error || 'Failed to update status.');
                },
            }
        );
    };

    const getModalTitle = () => {
        if (targetStatus === 'inactive') return 'Separate Employee';
        if (targetStatus === 'suspended') return 'Suspend Employee';
        if (targetStatus === 'active') {
            return currentStatus === 'inactive' ? 'Rehire Employee' : 'Reactivate Employee';
        }
        return 'Change Status';
    };

    const getModalDescription = () => {
        if (targetStatus === 'inactive') {
            return 'A final partial accrual will be computed for the current month and the employee will be marked as inactive.';
        }
        if (targetStatus === 'suspended') {
            return 'Monthly accrual will be paused. No final accrual will be computed. The employee can be reactivated later.';
        }
        if (targetStatus === 'active' && currentStatus === 'inactive') {
            return 'Rehiring will reverse the final accrual from the previous separation (unless the credits have already been claimed via Terminal Leave).';
        }
        if (targetStatus === 'active' && currentStatus === 'suspended') {
            return 'Monthly accrual will resume on the next scheduled run.';
        }
        return '';
    };

    return (
        <HRMOLayout>
            <Head title={`${fullName} - Employee Details`} />
            <div className="max-w-5xl mx-auto px-4 sm:px-6">

                {/* Back Link */}
                <div className="mb-6">
                    <Link
                        href={route('hrmo.employees.index')}
                        className="inline-flex items-center gap-1.5 text-sm font-medium transition hover:underline"
                        style={{ color: NAVY }}
                    >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Employees
                    </Link>
                </div>

                {/* ===== Employee Header ===== */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-14 h-14 rounded-full text-2xl font-bold text-white" style={{ backgroundColor: GOLD }}>
                                {fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold" style={{ color: NAVY }}>{fullName}</h2>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="text-sm text-gray-600">{employee.position || 'No position'}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-sm text-gray-600">{employee.department?.department_name || 'No department'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Status Badge */}
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}>
                                {statusBadge.label}
                            </span>

                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(255,191,0,0.15)', color: NAVY }}>
                                {roleLabels[employee.user?.role] || employee.user?.role || 'No role'}
                            </span>

                            <Link
                                href={route('hrmo.employees.edit', employee.id)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg transition shadow-sm hover:shadow-md"
                                style={{ backgroundColor: NAVY }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = NAVY_DARK}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = NAVY}
                            >
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </Link>
                        </div>
                    </div>

                    {/* ===== Status Actions Row ===== */}
                    <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap gap-2">
                        {currentStatus === 'active' && (
                            <>
                                <button
                                    onClick={() => openStatusModal('suspended')}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition"
                                >
                                    <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Suspend
                                </button>
                                <button
                                    onClick={() => openStatusModal('inactive')}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
                                >
                                    <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Separate
                                </button>
                            </>
                        )}

                        {currentStatus === 'suspended' && (
                            <button
                                onClick={() => openStatusModal('active')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition"
                            >
                                <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Reactivate
                            </button>
                        )}

                        {currentStatus === 'inactive' && (
                            <button
                                onClick={() => openStatusModal('active')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition"
                            >
                                <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Rehire Employee
                            </button>
                        )}
                    </div>
                </div>

                {/* ===== Two‑Column Layout ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ===== Personal Information ===== */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: NAVY }}>
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                            <InfoItem label="Full Name" value={fullName} />
                            <InfoItem label="Email" value={employee.email} />
                            <InfoItem label="Position" value={employee.position || '—'} />
                            <InfoItem label="Department" value={employee.department?.department_name || '—'} />
                            <InfoItem label="Civil Status" value={employee.civil_status || '—'} />
                            <InfoItem label="Gender" value={employee.gender || '—'} />
                            <InfoItem label="Salutation" value={employee.salutation || '—'} />
                            <InfoItem label="Middle Initial" value={employee.middle_initial || '—'} />
                        </div>

                        {/* Separation info (only when inactive) */}
                        {currentStatus === 'inactive' && employee.user?.separation_reason && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Separation Details</p>
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Reason:</span> {reasonLabels[employee.user.separation_reason] || employee.user.separation_reason}
                                </p>
                                {employee.user?.separated_at && (
                                    <p className="text-sm text-gray-700">
                                        <span className="font-medium">Date:</span>{' '}
                                        {new Date(employee.user.separated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <Link
                                href={route('hrmo.leave-requests.index', { search: employee.full_name })}
                                className="inline-flex items-center gap-1.5 text-sm font-medium transition hover:underline"
                                style={{ color: GOLD }}
                            >
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                View Leave Requests
                            </Link>
                        </div>
                    </div>

                    {/* ===== Leave Balances ===== */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
                            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: NAVY }}>
                                Leave Balances
                            </h3>
                            {!isEligibleForBalance ? (
                                <div className="text-center py-6 text-gray-500">
                                    <svg className="size-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm">HRMO employees do not have leave balances.</p>
                                </div>
                            ) : leaveTypes.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-6">No leave types configured.</p>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        {leaveTypes.map((typeName) => {
                                            const balance = balances[typeName] ?? 0;
                                            const isZero = balance <= 0;
                                            return (
                                                <div
                                                    key={typeName}
                                                    className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                                                        isZero ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                                                    }`}
                                                >
                                                    <span className="text-sm text-gray-700 truncate flex-1 mr-2" title={typeName}>
                                                        {typeName}
                                                    </span>
                                                    <span className={`text-sm font-semibold ${isZero ? 'text-gray-400' : ''}`} style={!isZero ? { color: NAVY } : {}}>
                                                        {Number(balance).toFixed(2)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-4 text-center">
                                        Balances are updated after each approved leave.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===== Separation History ===== */}
                {separations.length > 0 && (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: NAVY }}>
            Separation History
        </h3>
        <div className="space-y-3">
            {separations.map((sep) => (
                <div
                    key={sep.id}
                    className={`border rounded-lg p-4 ${
                        sep.status === 'active'
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-200 bg-gray-50'
                    }`}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            {/* Date + Reason */}
                            <div className="flex items-center flex-wrap gap-2">
                                <p className="text-sm font-semibold text-gray-800">
                                    {new Date(sep.separation_date).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </p>
                                <span className="text-xs text-gray-500">
                                    · {reasonLabels[sep.reason] || sep.reason}
                                </span>
                            </div>

                            {/* Descriptive line – no raw numbers */}
                            <p className="text-xs text-gray-600 mt-1 inline-flex items-center gap-1.5">
                                <svg className="size-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Final prorated leave credits applied at separation</span>
                            </p>

                            {/* Processed by */}
                            {sep.processedBy && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Processed by: <span className="font-medium">{sep.processedBy.name}</span>
                                </p>
                            )}

                            {/* Credits claimed via Terminal Leave */}
                            {sep.credits_claimed && (
                                <p className="text-xs text-amber-700 font-medium mt-1 inline-flex items-center gap-1">
                                    <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Credits claimed via Terminal Leave
                                </p>
                            )}

                            {/* Reversed */}
                            {sep.status === 'reversed' && sep.reversed_at && (
                                <p className="text-xs text-green-700 font-medium mt-1 inline-flex items-center gap-1">
                                    <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Reversed on {new Date(sep.reversed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    {sep.reversedBy && ` by ${sep.reversedBy.name}`}
                                </p>
                            )}

                            {/* Remarks */}
                            {sep.remarks && (
                                <p className="text-xs text-gray-500 mt-2 whitespace-pre-line border-t border-gray-200 pt-2">
                                    {sep.remarks}
                                </p>
                            )}
                        </div>

                        {/* Status pill */}
                        <span
                            className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                                sep.status === 'active'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                            }`}
                        >
                            {sep.status === 'active' ? 'Active' : 'Reversed'}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    </div>
)}
            </div>

            {/* ===== Status Change Modal ===== */}
            {showStatusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl max-w-md w-full border border-gray-200 shadow-xl">
                        {/* Modal header */}
                        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold" style={{ color: NAVY }}>
                                {getModalTitle()}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {getModalDescription()}
                            </p>
                        </div>

                        {/* Modal body */}
                        <div className="px-6 py-4 space-y-4">
                            {/* Employee summary */}
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Employee:</span> {fullName}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {employee.position || 'No position'} · {employee.department?.department_name || 'No department'}
                                </p>
                            </div>

                            {/* Reason (only for separation) */}
                            {targetStatus === 'inactive' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Reason <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={reason}
                                        onChange={(e) => {
                                            setReason(e.target.value);
                                            setError('');
                                        }}
                                        className="w-full rounded-lg border-gray-300 focus:border-[#0F2A52] focus:ring-[#0F2A52] text-sm"
                                    >
                                        <option value="">Select a reason</option>
                                        <option value="resigned">Resigned</option>
                                        <option value="retired">Retired</option>
                                        <option value="separated">Separated</option>
                                        <option value="deceased">Deceased</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            )}

                            {/* Remarks */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Remarks <span className="text-gray-400 text-xs">(optional)</span>
                                </label>
                                <textarea
                                    rows="2"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Add any notes..."
                                    className="w-full rounded-lg border-gray-300 focus:border-[#0F2A52] focus:ring-[#0F2A52] text-sm"
                                />
                            </div>

                            {error && (
                                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal footer */}
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                            <button
                                onClick={closeStatusModal}
                                disabled={processing}
                                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitStatusChange}
                                disabled={processing || (targetStatus === 'inactive' && !reason)}
                                className={`px-4 py-2 text-sm text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                                    targetStatus === 'inactive'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {processing
                                    ? 'Processing...'
                                    : targetStatus === 'inactive'
                                        ? 'Confirm Separation'
                                        : targetStatus === 'suspended'
                                            ? 'Confirm Suspension'
                                            : currentStatus === 'inactive'
                                                ? 'Confirm Rehire'
                                                : 'Confirm Reactivation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </HRMOLayout>
    );
}

// ===== Reusable Info Item =====
function InfoItem({ label, value }) {
    return (
        <div className="py-1">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
            <p className="text-base text-gray-900 font-medium">{value || '—'}</p>
        </div>
    );
}