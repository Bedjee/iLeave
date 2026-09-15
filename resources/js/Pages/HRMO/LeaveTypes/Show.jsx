import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, Link } from '@inertiajs/react';
import LeaveTypeStatusBadge from '@/Components/HRMO/LeaveTypes/LeaveTypeStatusBadge';

export default function Show({ leaveType }) {
    const NAVY = '#0F2A52';
    const NAVY_DARK = '#081A33';
    const GOLD = '#ffbf00';

    const fields = [
        { label: 'Name', value: leaveType.name },
        { label: 'Code', value: leaveType.code },
        { label: 'Description', value: leaveType.description || '—' },
        { label: 'Status', value: <LeaveTypeStatusBadge status={leaveType.status} /> },
        { label: 'Earnable', value: leaveType.earnable ? 'Yes' : 'No' },
        { label: 'Deductible', value: leaveType.deductible ? 'Yes' : 'No' },
        { label: 'Deduct from VL', value: leaveType.deduct_from_vl ? 'Yes' : 'No' },
        { label: 'Document Required', value: leaveType.document_required ? 'Yes' : 'No' },
        { label: 'Requires Balance', value: leaveType.requires_balance ? 'Yes' : 'No' },
        { label: 'Default Days', value: leaveType.default_days ?? '—' },
        { label: 'Deduction Factor', value: leaveType.deduction_factor },
        { label: 'Gender Eligibility', value: leaveType.gender_eligibility_label },
        { label: 'Employment Conditions', value: leaveType.employment_conditions ? JSON.stringify(leaveType.employment_conditions) : '—' },
    ];

    return (
        <HRMOLayout>
            <Head title={leaveType.name} />
            <div className="space-y-6 max-w-3xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <Link
                            href={route('hrmo.leave-types.index')}
                            className="inline-flex items-center gap-1.5 text-sm font-medium transition hover:underline mb-2"
                            style={{ color: NAVY }}
                        >
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Leave Types
                        </Link>
                        <h2 className="text-xl md:text-2xl font-bold" style={{ color: NAVY }}>
                            Leave Type Details
                        </h2>
                    </div>

                    <Link
                        href={route('hrmo.leave-types.edit', leaveType.id)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-white rounded-lg transition text-sm font-medium shadow-sm hover:shadow-md whitespace-nowrap"
                        style={{ backgroundColor: NAVY }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = NAVY_DARK)}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
                    >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </Link>
                </div>

                {/* Details Card */}
                <div
                    className="rounded-2xl bg-white border p-6 shadow-sm"
                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    <div className="flex items-center gap-2 mb-5 pb-4 border-b" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: NAVY }}>
                            Configuration
                        </h3>
                    </div>

                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        {fields.map((field) => (
                            <div
                                key={field.label}
                                className="pb-3 border-b"
                                style={{ borderColor: 'rgba(15,42,82,0.06)' }}
                            >
                                <dt
                                    className="text-[11px] font-semibold uppercase tracking-wider"
                                    style={{ color: 'rgba(15,42,82,0.55)' }}
                                >
                                    {field.label}
                                </dt>
                                <dd className="text-sm sm:text-base font-medium text-gray-900 mt-1">
                                    {field.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>

            </div>
        </HRMOLayout>
    );
}