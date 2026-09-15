import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import LeaveTypeForm from '@/Components/HRMO/LeaveTypes/LeaveTypeForm';

export default function Edit({ leaveType }) {
    const NAVY = '#0F2A52';
    const NAVY_DARK = '#081A33';
    const GOLD = '#ffbf00';

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
        date_selection_type: leaveType.date_selection_type || 'range',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('hrmo.leave-types.update', leaveType.id));
    };

    return (
        <HRMOLayout>
            <Head title="Edit Leave Type" />
            <div className="space-y-6 max-w-3xl mx-auto">

                {/* Header */}
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
                        Edit Leave Type
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Update the configuration for <span className="font-medium" style={{ color: NAVY }}>{leaveType.name}</span>.
                    </p>
                </div>

                {/* Form Card */}
                <div
                    className="rounded-2xl bg-white border p-6 shadow-sm"
                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    <div className="flex items-center gap-2 mb-5 pb-4 border-b" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: NAVY }}>
                            Leave Type Configuration
                        </h3>
                    </div>

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