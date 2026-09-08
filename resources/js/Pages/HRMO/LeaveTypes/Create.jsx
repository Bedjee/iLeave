import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import LeaveTypeForm from '@/Components/HRMO/LeaveTypes/LeaveTypeForm';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        description: '',
        earnable: false,
        deductible: false,
        deduct_from_vl: false,
        document_required: false,
        requires_balance: false,
        default_days: '',
        deduction_factor: 1,
        status: true,
        gender_eligibility: 'all',
        employment_conditions: null,
        date_selection_type: 'range',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('hrmo.leave-types.store'));
    };

    const NAVY = '#0F2A52';
    const NAVY_DARK = '#081A33';
    const GOLD = '#ffbf00';

    return (
        <HRMOLayout>
            <Head title="Create Leave Type" />
            <div className="space-y-6 max-w-3xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link
                        href={route('hrmo.leave-types.index')}
                        className="text-sm font-medium transition hover:underline flex items-center gap-1"
                        style={{ color: NAVY }}
                    >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to List
                    </Link>
                    <span className="text-gray-300">|</span>
                    <h2 className="text-xl md:text-2xl font-bold" style={{ color: NAVY }}>Create Leave Type</h2>
                </div>
                <div className="rounded-lg bg-white border p-4 md:p-6 shadow-sm" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    <LeaveTypeForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        submit={submit}
                        submitLabel="Create Leave Type"
                    />
                </div>
            </div>
        </HRMOLayout>
    );
}
