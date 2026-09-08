import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Create({ employees }) {
    const { data, setData, post, processing, errors } = useForm({
        department_name: '',
        department_code: '',
        department_head_id: '',
        status: 'active',
        skip_department_head_approval: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('hrmo.departments.store'));
    };

    const NAVY = '#0F2A52';
    const NAVY_DARK = '#081A33';
    const GOLD = '#ffbf00';

    return (
        <HRMOLayout>
            <Head title="Create Department" />
            <div className="space-y-6 max-w-3xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link
                        href={route('hrmo.departments.index')}
                        className="text-sm font-medium transition hover:underline flex items-center gap-1"
                        style={{ color: NAVY }}
                    >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to List
                    </Link>
                    <span className="text-gray-300">|</span>
                    <h2 className="text-xl md:text-2xl font-bold" style={{ color: NAVY }}>Create Department</h2>
                </div>

                <div className="rounded-lg bg-white border p-4 md:p-6 shadow-sm" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label htmlFor="department_name" className="block text-sm font-medium" style={{ color: NAVY }}>
                                Name <span style={{ color: GOLD }}>*</span>
                            </label>
                            <input
                                id="department_name"
                                type="text"
                                value={data.department_name}
                                onChange={(e) => setData('department_name', e.target.value)}
                                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                placeholder="Human Resources"
                            />
                            {errors.department_name && <p className="mt-1 text-sm text-red-600">{errors.department_name}</p>}
                        </div>

                        <div>
                            <label htmlFor="department_code" className="block text-sm font-medium" style={{ color: NAVY }}>
                                Code <span style={{ color: GOLD }}>*</span>
                            </label>
                            <input
                                id="department_code"
                                type="text"
                                value={data.department_code}
                                onChange={(e) => setData('department_code', e.target.value)}
                                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                placeholder="HR"
                            />
                            {errors.department_code && <p className="mt-1 text-sm text-red-600">{errors.department_code}</p>}
                        </div>

                        <div>
                            <label htmlFor="department_head_id" className="block text-sm font-medium" style={{ color: NAVY }}>Department Head</label>
                            <select
                                id="department_head_id"
                                value={data.department_head_id}
                                onChange={(e) => setData('department_head_id', e.target.value)}
                                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                            >
                                <option value="">Select Head</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.full_name} ({emp.position || 'No position'})
                                    </option>
                                ))}
                            </select>
                            {errors.department_head_id && <p className="mt-1 text-sm text-red-600">{errors.department_head_id}</p>}
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium" style={{ color: NAVY }}>Status</label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Skip Department Head Approval Checkbox */}
                        <div>
                            <label htmlFor="skip_department_head_approval" className="flex items-center text-sm font-medium" style={{ color: NAVY }}>
                                <input
                                    type="checkbox"
                                    id="skip_department_head_approval"
                                    checked={data.skip_department_head_approval}
                                    onChange={(e) => setData('skip_department_head_approval', e.target.checked)}
                                    className="mr-2 rounded focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', color: GOLD }}
                                />
                                Skip Department Head Approval (Admin acts as Department Head)
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                                Enable this if the Department Head is the same as the Admin user.
                            </p>
                            {errors.skip_department_head_approval && (
                                <p className="mt-1 text-sm text-red-600">{errors.skip_department_head_approval}</p>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                            <Link
                                href={route('hrmo.departments.index')}
                                className="px-4 py-2 text-sm font-medium transition hover:underline"
                                style={{ color: NAVY }}
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center px-6 py-2 text-white rounded-lg transition text-sm font-semibold shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: NAVY }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = NAVY_DARK}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = NAVY}
                            >
                                {processing ? 'Creating...' : 'Create Department'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </HRMOLayout>
    );
}
