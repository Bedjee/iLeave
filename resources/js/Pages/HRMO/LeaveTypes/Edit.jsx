import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import LeaveTypeForm from '@/Components/HRMO/LeaveTypes/LeaveTypeForm';

export default function Edit({ leaveType }) {
    const { data, setData, put, processing, errors } = useForm({
        name: leaveType.name,
        code: leaveType.code,
        description: leaveType.description || '',
        earnable: leaveType.earnable,
        deductible: leaveType.deductible,
        deduct_from_vl: leaveType.deduct_from_vl,
        document_required: leaveType.document_required,
        requires_balance: leaveType.requires_balance,
        default_days: leaveType.default_days ?? '',
        deduction_factor: leaveType.deduction_factor,
        status: leaveType.status,
        gender_eligibility: leaveType.gender_eligibility,
        employment_conditions: leaveType.employment_conditions || null,
        date_selection_type: leaveType.date_selection_type || 'range', // New field
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('hrmo.leave-types.update', leaveType.id));
    };

    return (
        <HRMOLayout>
            <Head title="Edit Leave Type" />
            <div className="space-y-6 max-w-3xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link
                        href={route('hrmo.leave-types.index')}
                        className="text-[#FF2D20] hover:underline flex items-center gap-1 text-sm"
                    >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to List
                    </Link>
                    <h2 className="text-xl md:text-2xl font-bold text-white">Edit Leave Type</h2>
                </div>
                <div className="rounded-lg bg-zinc-900 p-4 md:p-6 shadow-xl border border-white/5">
                    <LeaveTypeForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        submit={submit}
                        submitLabel="Update Leave Type"
                    />
                </div>
            </div>
        </HRMOLayout>
    );
}
