import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Create({ departments, leaveTypes, roles }) {
    const { data, setData, post, processing, errors } = useForm({
        lastname: '',
        firstname: '',
        middle_initial: '',
        salutation: '',
        department_id: '',
        position: '',
        email: '',
        civil_status: '',
        gender: '',
        role: 'employee',
        balances: {},
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('hrmo.employees.store'));
    };

    const NAVY = '#0F2A52';
    const NAVY_DARK = '#081A33';
    const GOLD = '#ffbf00';
    const NAVY_LIGHT = '#f0f4f8';

    const isEligibleForBalance = data.role !== 'hrmo';

    return (
        <HRMOLayout>
            <Head title="Create Employee" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href={route('hrmo.employees.index')}
                        className="text-sm font-medium transition hover:underline flex items-center gap-1"
                        style={{ color: NAVY }}
                    >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to List
                    </Link>
                    <span className="text-gray-300">|</span>
                    <h2 className="text-xl md:text-2xl font-bold" style={{ color: NAVY }}>Add New Employee</h2>
                </div>

                {/* Form Card */}
                <div className="rounded-lg bg-white border p-4 md:p-6 shadow-sm" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    <form onSubmit={submit} className="space-y-6">
                        {/* Two‑column grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {/* Lastname */}
                            <div>
                                <label className="block text-sm font-medium" style={{ color: NAVY }}>
                                    Last Name <span style={{ color: GOLD }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.lastname}
                                    onChange={(e) => setData('lastname', e.target.value)}
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                    placeholder="Dela Cruz"
                                />
                                {errors.lastname && <p className="mt-1 text-sm text-red-600">{errors.lastname}</p>}
                            </div>

                            {/* Firstname */}
                            <div>
                                <label className="block text-sm font-medium" style={{ color: NAVY }}>
                                    First Name <span style={{ color: GOLD }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.firstname}
                                    onChange={(e) => setData('firstname', e.target.value)}
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                    placeholder="Juan"
                                />
                                {errors.firstname && <p className="mt-1 text-sm text-red-600">{errors.firstname}</p>}
                            </div>

                            {/* Middle Initial */}
                            <div>
                                <label className="block text-sm font-medium" style={{ color: NAVY }}>Middle Initial</label>
                                <input
                                    type="text"
                                    maxLength="1"
                                    value={data.middle_initial}
                                    onChange={(e) => setData('middle_initial', e.target.value)}
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                    placeholder="M"
                                />
                            </div>

                            {/* Salutation */}
                            <div>
                                <label className="block text-sm font-medium" style={{ color: NAVY }}>Salutation</label>
                                <input
                                    type="text"
                                    value={data.salutation}
                                    onChange={(e) => setData('salutation', e.target.value)}
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                    placeholder="Mr./Ms./Dr."
                                />
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium" style={{ color: NAVY }}>
                                    Department <span style={{ color: GOLD }}>*</span>
                                </label>
                                <select
                                    value={data.department_id}
                                    onChange={(e) => setData('department_id', e.target.value)}
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>{dept.department_name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Position */}
                            <div>
                                <label className="block text-sm font-medium" style={{ color: NAVY }}>Position</label>
                                <input
                                    type="text"
                                    value={data.position}
                                    onChange={(e) => setData('position', e.target.value)}
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                    placeholder="Software Engineer"
                                />
                            </div>

                            {/* Email */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium" style={{ color: NAVY }}>
                                    Email (Login) <span style={{ color: GOLD }}>*</span>
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                    placeholder="juan.delacruz@example.com"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            {/* Civil Status */}
                            <div>
                                <label className="block text-sm font-medium" style={{ color: NAVY }}>Civil Status</label>
                                <select
                                    value={data.civil_status}
                                    onChange={(e) => setData('civil_status', e.target.value)}
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                >
                                    <option value="">Select</option>
                                    <option value="single">Single</option>
                                    <option value="married">Married</option>
                                    <option value="divorced">Divorced</option>
                                    <option value="widowed">Widowed</option>
                                </select>
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-medium" style={{ color: NAVY }}>Gender</label>
                                <select
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value)}
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                >
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                        </div>

                        {/* ===== ROLE ===== */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium" style={{ color: NAVY }}>
                                    System Role <span style={{ color: GOLD }}>*</span>
                                </label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                >
                                    <option value="employee">Employee</option>
                                    <option value="department_head">Department Head</option>
                                    <option value="hrmo">HRMO</option>
                                    <option value="admin">Admin</option>
                                    <option value="mayor">Mayor</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    {isEligibleForBalance
                                        ? 'This role is eligible for leave balances.'
                                        : 'HRMO role does not receive leave balances.'}
                                </p>
                                {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
                            </div>
                        </div>

                        {/* ===== LEAVE BALANCES – polished section =====
                        {isEligibleForBalance && leaveTypes.length > 0 && (
                            <div className="rounded-xl border p-5" style={{ borderColor: 'rgba(15,42,82,0.08)', backgroundColor: NAVY_LIGHT }}>
                                <div className="flex items-center gap-2 mb-4">
                                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <h3 className="text-base font-semibold" style={{ color: NAVY }}>Initial Leave Balances</h3>
                                    <span className="ml-auto text-xs text-gray-400">days</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {leaveTypes.map((type) => (
                                        <div key={type.id} className="flex items-center justify-between gap-2 bg-white rounded-lg border px-3 py-2" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                                            <label className="text-sm text-gray-700 truncate flex-1" title={type.name}>
                                                {type.name}
                                            </label>
                                            <input
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                value={data.balances[type.id] ?? ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setData('balances', {
                                                        ...data.balances,
                                                        [type.id]: val === '' ? '' : parseFloat(val),
                                                    });
                                                }}
                                                className="w-16 rounded-md border px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 transition"
                                                style={{ borderColor: 'rgba(15,42,82,0.12)', backgroundColor: 'white' }}
                                                onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                                onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.12)')}
                                                placeholder="0"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <p className="text-xs text-gray-500 mt-3">
                                    Enter initial balances for each leave type. Leave blank or <strong>0</strong> for no initial balance.
                                </p>
                            </div>
                        )} */}

                        {/* Form Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                            <Link
                                href={route('hrmo.employees.index')}
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
                                {processing ? 'Saving...' : 'Create Employee'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </HRMOLayout>
    );
}
