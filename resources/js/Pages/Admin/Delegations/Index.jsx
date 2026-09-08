import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ delegations, mayors }) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        delegate_id: '',
        start_date: '',
        end_date: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.delegations.store'), {
            onSuccess: () => {
                setShowForm(false);
                reset();
            },
        });
    };

    const revoke = (delegation) => {
        if (confirm('Are you sure you want to revoke this delegation?')) {
            router.post(route('admin.delegations.revoke', delegation.id));
        }
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isActive = (delegation) => {
        return delegation.status === 'active' && new Date(delegation.start_date) <= new Date() && new Date(delegation.end_date) >= new Date();
    };

    // Color palette
    const NAVY = '#0F2A52';
    const NAVY_DARK = '#1a3a6a';
    const GOLD = '#ffbf00';

    return (
        <AdminLayout>
            <Head title="Delegations" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold" style={{ color: NAVY }}>Delegation Management</h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 text-white rounded-lg transition font-medium shadow-sm hover:shadow-md"
                        style={{ backgroundColor: NAVY }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = NAVY_DARK}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = NAVY}
                    >
                        {showForm ? 'Cancel' : 'Create Delegation'}
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: NAVY }}>Delegate Approval Authority</h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium" style={{ color: NAVY }}>Delegate (Mayor)</label>
                                <select
                                    value={data.delegate_id}
                                    onChange={(e) => setData('delegate_id', e.target.value)}
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                >
                                    <option value="">Select Mayor</option>
                                    {mayors.map((mayor) => (
                                        <option key={mayor.id} value={mayor.id}>
                                            {mayor.name} ({mayor.email})
                                        </option>
                                    ))}
                                </select>
                                {errors.delegate_id && <p className="mt-1 text-sm text-red-600">{errors.delegate_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium" style={{ color: NAVY }}>Start Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                />
                                {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium" style={{ color: NAVY }}>End Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                />
                                {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                            </div>
                            <div className="flex justify-end pt-2 border-t" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-white rounded-lg transition font-medium shadow-sm hover:shadow-md disabled:opacity-50"
                                    style={{ backgroundColor: NAVY }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = NAVY_DARK}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = NAVY}
                                >
                                    {processing ? 'Creating...' : 'Create Delegation'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    <table className="w-full text-left text-sm">
                        <thead style={{ backgroundColor: '#f0f4f8' }}>
                            <tr>
                                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Delegate</th>
                                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Start</th>
                                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>End</th>
                                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Status</th>
                                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-right" style={{ color: NAVY }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                            {delegations.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-4 text-center text-gray-500">No delegations found.</td>
                                </tr>
                            ) : (
                                delegations.map((delegation) => {
                                    const active = isActive(delegation);
                                    return (
                                        <tr key={delegation.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 text-gray-900">{delegation.delegate?.name || 'N/A'}</td>
                                            <td className="px-4 py-3 text-gray-600">{formatDate(delegation.start_date)}</td>
                                            <td className="px-4 py-3 text-gray-600">{formatDate(delegation.end_date)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    active ? 'bg-green-100 text-green-800' :
                                                    delegation.status === 'revoked' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {active ? 'Active' : delegation.status.charAt(0).toUpperCase() + delegation.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {active && (
                                                    <button
                                                        onClick={() => revoke(delegation)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                    >
                                                        Revoke
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
