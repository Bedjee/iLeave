import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Edit({ user }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        current_pin: '',
        new_pin: '',
        confirm_pin: '',
    });

    const [showSuccess, setShowSuccess] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.profile.update-pin'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowSuccess(true);
                reset('current_pin', 'new_pin', 'confirm_pin');
                setTimeout(() => setShowSuccess(false), 5000);
            },
        });
    };

    // Color palette
    const NAVY = '#0F2A52';
    const NAVY_DARK = '#1a3a6a';
    const GOLD = '#ffbf00';

    return (
        <AdminLayout>
            <Head title="Admin Profile" />
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold" style={{ color: NAVY }}>Admin Profile</h2>
                    <p className="text-sm text-gray-500">Manage your account and security settings</p>
                </div>

                <div className="bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    <div className="mb-6 space-y-1.5">
                        <p className="text-sm text-gray-700">
                            <span className="font-medium" style={{ color: NAVY }}>Name:</span> {user.name}
                        </p>
                        <p className="text-sm text-gray-700">
                            <span className="font-medium" style={{ color: NAVY }}>Email:</span> {user.email}
                        </p>
                        <p className="text-sm text-gray-700">
                            <span className="font-medium" style={{ color: NAVY }}>PIN Status:</span>{' '}
                            {user.has_pin ? (
                                <span className="text-green-600 font-medium">Set (last changed: {new Date(user.pin_set_at).toLocaleString()})</span>
                            ) : (
                                <span className="font-medium" style={{ color: GOLD }}>Not set</span>
                            )}
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        {user.has_pin && (
                            <div>
                                <label className="block text-sm font-medium" style={{ color: NAVY }}>Current PIN</label>
                                <input
                                    type="password"
                                    maxLength="4"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={data.current_pin}
                                    onChange={(e) => setData('current_pin', e.target.value)}
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                    placeholder="Enter current 4-digit PIN"
                                />
                                {errors.current_pin && <p className="mt-1 text-sm text-red-600">{errors.current_pin}</p>}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium" style={{ color: NAVY }}>New PIN</label>
                            <input
                                type="password"
                                maxLength="4"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={data.new_pin}
                                onChange={(e) => setData('new_pin', e.target.value)}
                                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                placeholder="Enter new 4-digit PIN"
                            />
                            {errors.new_pin && <p className="mt-1 text-sm text-red-600">{errors.new_pin}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium" style={{ color: NAVY }}>Confirm New PIN</label>
                            <input
                                type="password"
                                maxLength="4"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={data.confirm_pin}
                                onChange={(e) => setData('confirm_pin', e.target.value)}
                                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                placeholder="Re-enter new PIN"
                            />
                            {errors.confirm_pin && <p className="mt-1 text-sm text-red-600">{errors.confirm_pin}</p>}
                        </div>

                        {showSuccess && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                PIN updated successfully.
                            </div>
                        )}

                        <div className="flex justify-end pt-2 border-t" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 text-white rounded-lg transition font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                                style={{ backgroundColor: NAVY }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = NAVY_DARK}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = NAVY}
                            >
                                {processing ? 'Updating...' : 'Update PIN'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
