import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, Link } from '@inertiajs/react';
import LeaveTypeStatusBadge from '@/Components/HRMO/LeaveTypes/LeaveTypeStatusBadge';

export default function Show({ leaveType }) {
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-xl md:text-2xl font-bold text-white">Leave Type Details</h2>
                    <Link
                        href={route('hrmo.leave-types.edit', leaveType.id)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-[#FF2D20] text-white rounded-lg hover:bg-[#e62e1c] transition text-sm font-medium shadow-md hover:shadow-lg"
                    >
                        <svg className="size-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </Link>
                </div>

                <div className="rounded-lg bg-zinc-900 p-4 md:p-6 shadow-xl border border-white/5">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {fields.map((field) => (
                            <div key={field.label} className="border-b border-white/10 pb-2">
                                <dt className="text-xs sm:text-sm text-gray-400">{field.label}</dt>
                                <dd className="text-sm sm:text-base font-medium text-white mt-1">{field.value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </HRMOLayout>
    );
}
