import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Edit({ employee, departments, leaveTypes, roles, balances }) {
    const { data, setData, put, processing, errors } = useForm({
        lastname: employee.lastname,
        firstname: employee.firstname,
        middle_initial: employee.middle_initial || '',
        salutation: employee.salutation || '',
        department_id: employee.department_id || '',
        position: employee.position || '',
        email: employee.email,
        civil_status: employee.civil_status || '',
        gender: employee.gender || '',
        role: employee.user?.role || 'employee',
        balances: balances || {},
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('hrmo.employees.update', employee.id));
    };

    const NAVY = '#0F2A52';
    const NAVY_DARK = '#081A33';
    const GOLD = '#ffbf00';

    const isEligibleForBalance = data.role !== 'hrmo';

    return (
        <HRMOLayout>
            <Head title="Edit Employee" />
            <div className="space-y-6">
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
                    <h2 className="text-xl md:text-2xl font-bold" style={{ color: NAVY }}>Edit Employee</h2>
                </div>

                <div className="rounded-lg bg-white border p-4 md:p-6 shadow-sm" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {/* Same fields as Create, but with pre-filled values */}
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
                                />
                            </div>

                            {/* Email */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium" style={{ color: NAVY }}>
                                    Email <span style={{ color: GOLD }}>*</span>
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
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

                            {/* ===== ROLE ===== */}
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

                            {/* ===== LEAVE BALANCES ===== */}
                            {isEligibleForBalance && leaveTypes.length > 0 && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium" style={{ color: NAVY }}>
                                        Leave Balances
                                    </label>
                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {leaveTypes.map((type) => (
                                            <div key={type.id} className="flex items-center gap-2">
                                                <label className="text-sm text-gray-600 min-w-[100px]">{type.name}</label>
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
                                                    className="w-24 rounded-lg border px-2 py-1 text-sm focus:outline-none focus:ring-2 transition"
                                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                                    placeholder="0"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Update balances for each leave type. Leave blank to keep current value.
                                    </p>
                                </div>
                            )}
                        </div>

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
                                {processing ? 'Saving...' : 'Update Employee'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </HRMOLayout>
    );
}
