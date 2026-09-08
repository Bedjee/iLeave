import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, Link } from '@inertiajs/react';

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

    const isEligibleForBalance = employee.user?.role !== 'hrmo';

    // Get full name with salutation and middle initial if available
    const fullName = employee.full_name || `${employee.firstname} ${employee.lastname}`;

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
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                employee.user?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {employee.user?.status === 'active' ? 'Active' : 'Inactive'}
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
            </div>
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