import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Lock, Info } from 'lucide-react';

const NAVY = '#0F2A52';
const GOLD = '#ffbf00';

export default function LinkProfile({ ssoUser, departments, leaveTypes, roles }) {
    const { data, setData, post, processing, errors } = useForm({
        user_id:        ssoUser.id,
        lastname:       ssoUser.suggested_lastname || '',
        firstname:      ssoUser.suggested_firstname || '',
        middle_initial: '',
        salutation:     '',
        department_id:  '',
        position:       '',
        civil_status:   '',
        gender:         '',
        role:           ssoUser.default_role || 'employee',
        balances:       {},
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('hrmo.employees.link.store'), { preserveScroll: true });
    };

    const setBalance = (typeId, value) => {
        setData('balances', { ...data.balances, [typeId]: value });
    };

    return (
        <HRMOLayout>
            <Head title="Link Employee Profile" />

            <div className="space-y-5">
                <div>
                    <Link
                        href={route('hrmo.employees.pending')}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Pending
                    </Link>
                </div>

                {/* Identity card */}
                <div
                    className="bg-white rounded-xl border shadow-sm p-5 sm:p-6"
                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: 'rgba(15,42,82,0.08)', color: NAVY }}
                        >
                            <Lock className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg font-bold" style={{ color: NAVY }}>
                                Link Employee Profile
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                The portal owns this user's identity. Fill in their
                                HR details below — nothing here changes their
                                portal account.
                            </p>
                            <div className="mt-3 rounded-lg bg-gray-50 border border-gray-100 p-3">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Info className="w-3.5 h-3.5" />
                                    <span className="font-medium text-gray-700">
                                        {ssoUser.name}
                                    </span>
                                    <span className="text-gray-400">
                                        · {ssoUser.email}
                                    </span>
                                </div>
                                <p className="mt-1 text-[11px] font-mono text-gray-400">
                                    portal_user_id: {ssoUser.portal_user_id}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form
                    onSubmit={submit}
                    className="bg-white rounded-xl border shadow-sm p-5 sm:p-6 space-y-5"
                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    <section>
                        <h2 className="text-sm font-semibold mb-3" style={{ color: NAVY }}>
                            Name
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                ['firstname', 'First name', 'text', true],
                                ['lastname', 'Last name', 'text', true],
                                ['middle_initial', 'Middle initial', 'text', false],
                                ['salutation', 'Salutation', 'text', false],
                            ].map(([key, label, type, required]) => (
                                <div key={key}>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">
                                        {label}
                                        {required && <span className="text-red-500"> *</span>}
                                    </label>
                                    <input
                                        type={type}
                                        value={data[key]}
                                        onChange={(e) => setData(key, e.target.value)}
                                        className={`block w-full rounded-lg border text-sm shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                                            errors[key] ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors[key] && (
                                        <p className="mt-1 text-xs text-red-500">{errors[key]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="pt-5 border-t border-gray-100">
                        <h2 className="text-sm font-semibold mb-3" style={{ color: NAVY }}>
                            Employment
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">
                                    Department
                                </label>
                                <select
                                    value={data.department_id}
                                    onChange={(e) => setData('department_id', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 text-sm shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                    <option value="">— none —</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.department_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">
                                    Position
                                </label>
                                <input
                                    type="text"
                                    value={data.position}
                                    onChange={(e) => setData('position', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 text-sm shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">
                                    Role
                                </label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 text-sm shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                    {roles.map((r) => (
                                        <option key={r} value={r}>
                                            {r.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-[11px] text-gray-400">
                                    Default is <strong>employee</strong>. Change only if this
                                    user is a department head, HRMO staff, admin, or the mayor.
                                </p>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">
                                    Civil status
                                </label>
                                <select
                                    value={data.civil_status}
                                    onChange={(e) => setData('civil_status', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 text-sm shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                    <option value="">— none —</option>
                                    <option value="single">Single</option>
                                    <option value="married">Married</option>
                                    <option value="divorced">Divorced</option>
                                    <option value="widowed">Widowed</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">
                                    Gender
                                </label>
                                <select
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 text-sm shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                    <option value="">— none —</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {leaveTypes.length > 0 && data.role !== 'hrmo' && (
                        <section className="pt-5 border-t border-gray-100">
                            <h2 className="text-sm font-semibold mb-3" style={{ color: NAVY }}>
                                Initial Leave Balances
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {leaveTypes.map((type) => (
                                    <div key={type.id}>
                                        <label className="mb-1 block text-xs font-medium text-gray-700">
                                            {type.name}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={data.balances[type.id] ?? ''}
                                            onChange={(e) => setBalance(type.id, e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 text-sm shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <div className="pt-5 border-t border-gray-100 flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md transition disabled:opacity-60"
                            style={{ backgroundColor: NAVY }}
                        >
                            {processing ? 'Linking…' : 'Link Profile'}
                        </button>
                        <Link
                            href={route('hrmo.employees.pending')}
                            className="text-sm font-medium text-gray-500 hover:text-gray-800 transition"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </HRMOLayout>
    );
}