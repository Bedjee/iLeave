import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Index({ leaveTypes, filters }) {
    const { get, data, setData } = useForm({
        search: filters.search || '',
        status: filters.status ?? '',
    });

    const handleFilter = () => {
        get(route('hrmo.leave-types.index'), data, { preserveState: true });
    };

    const toggleStatus = (leaveType) => {
        if (confirm(`Are you sure you want to ${leaveType.status ? 'deactivate' : 'activate'} this leave type?`)) {
            patch(route('hrmo.leave-types.toggle-status', leaveType.id));
        }
    };

    const NAVY = '#0F2A52';
    const NAVY_DARK = '#081A33';
    const GOLD = '#ffbf00';

    // Inline status badge component
    const StatusBadge = ({ status }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
            {status ? 'Active' : 'Inactive'}
        </span>
    );

    return (
        <HRMOLayout>
            <Head title="Leave Types" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-xl md:text-2xl font-bold" style={{ color: NAVY }}>Leave Types</h2>
                    <Link
                        href={route('hrmo.leave-types.create')}
                        className="inline-flex items-center justify-center px-4 py-2 text-white rounded-lg transition text-sm font-medium shadow-md hover:shadow-lg"
                        style={{ backgroundColor: NAVY }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = NAVY_DARK}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = NAVY}
                    >
                        <svg className="size-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Leave Type
                    </Link>
                </div>

                {/* Filters – inline with theme */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 p-3 rounded-lg" style={{ backgroundColor: '#f9fafb', borderColor: 'rgba(15,42,82,0.08)' }}>
                    <input
                        type="text"
                        placeholder="Search by name or code"
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                        className="flex-1 min-w-[200px] rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                        style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: 'white' }}
                        onFocus={(e) => (e.target.style.borderColor = GOLD)}
                        onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                    />
                    <select
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                        className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                        style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: 'white' }}
                        onFocus={(e) => (e.target.style.borderColor = GOLD)}
                        onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                    >
                        <option value="">All Status</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                    <button
                        onClick={handleFilter}
                        className="px-4 py-2 text-white rounded-lg transition text-sm font-medium shadow-sm hover:shadow-md"
                        style={{ backgroundColor: GOLD }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e6ac00'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = GOLD}
                    >
                        Filter
                    </button>
                </div>

                {/* Table */}
                <div className="rounded-lg bg-white border p-4 md:p-6 shadow-sm overflow-hidden" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    {leaveTypes.data.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <svg className="size-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-sm">No leave types found.</p>
                            <p className="text-xs text-gray-400 mt-1">Start by adding your first leave type.</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto -mx-4 md:mx-0">
                                <table className="min-w-full divide-y" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                                    <thead style={{ backgroundColor: '#f3f4f6' }}>
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Name</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Code</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Earnable</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Deductible</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Default Days</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Deduction Factor</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                                        {leaveTypes.data.map((type) => (
                                            <tr key={type.id} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-medium">{type.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{type.code}</td>
                                                <td className="px-4 py-3 text-sm whitespace-nowrap">
                                                    <StatusBadge status={type.status} />
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{type.earnable ? 'Yes' : 'No'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{type.deductible ? 'Yes' : 'No'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{type.default_days ?? '—'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{type.deduction_factor}</td>
                                                <td className="px-4 py-3 text-sm whitespace-nowrap">
                                                    <div className="flex flex-wrap gap-2">
                                                        <Link
                                                            href={route('hrmo.leave-types.show', type.id)}
                                                            className="font-medium hover:underline transition"
                                                            style={{ color: NAVY }}
                                                        >
                                                            View
                                                        </Link>
                                                        <Link
                                                            href={route('hrmo.leave-types.edit', type.id)}
                                                            className="font-medium hover:underline transition"
                                                            style={{ color: GOLD }}
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => toggleStatus(type)}
                                                            className={`text-sm font-medium hover:underline transition ${
                                                                type.status ? 'text-red-600' : 'text-green-600'
                                                            }`}
                                                        >
                                                            {type.status ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {leaveTypes.links && (
                                <div className="mt-4 flex justify-center">
                                    <ul className="flex space-x-1">
                                        {leaveTypes.links.map((link, index) => (
                                            <li key={index}>
                                                <button
                                                    onClick={() => {
                                                        if (link.url) {
                                                            get(link.url, data, { preserveState: true });
                                                        }
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className={`px-3 py-1 rounded text-sm transition ${
                                                        link.active
                                                            ? 'text-white font-medium'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    style={link.active ? { backgroundColor: GOLD } : { backgroundColor: 'transparent' }}
                                                    disabled={!link.url}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </HRMOLayout>
    );
}
