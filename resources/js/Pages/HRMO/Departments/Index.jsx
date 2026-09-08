import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Index({ departments, filters }) {
    const { get, data, setData } = useForm({
        search: filters.search || '',
        status: filters.status || '',
    });

    const filter = () => {
        get(route('hrmo.departments.index'), data, { preserveState: true });
    };

    const toggleStatus = (department) => {
        if (confirm(`Are you sure you want to ${department.status === 'active' ? 'deactivate' : 'activate'} this department?`)) {
            patch(route('hrmo.departments.toggle-status', department.id));
        }
    };

    const NAVY = '#0F2A52';
    const NAVY_DARK = '#081A33';
    const GOLD = '#ffbf00';

    return (
        <HRMOLayout>
            <Head title="Departments" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-xl md:text-2xl font-bold" style={{ color: NAVY }}>Departments</h2>
                    <Link
                        href={route('hrmo.departments.create')}
                        className="inline-flex items-center justify-center px-4 py-2 text-white rounded-lg transition text-sm font-medium shadow-md hover:shadow-lg"
                        style={{ backgroundColor: NAVY }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = NAVY_DARK}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = NAVY}
                    >
                        <svg className="size-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Department
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 p-3 rounded-lg" style={{ backgroundColor: '#f9fafb', borderColor: 'rgba(15,42,82,0.08)' }}>
                    <input
                        type="text"
                        placeholder="Search by name or code"
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && filter()}
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
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <button
                        onClick={filter}
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
                    {departments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <svg className="size-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <p className="text-sm">No departments found.</p>
                            <p className="text-xs text-gray-400 mt-1">Start by adding your first department.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-4 md:mx-0">
                            <table className="min-w-full divide-y" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                                <thead style={{ backgroundColor: '#f3f4f6' }}>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Code</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Head</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Employees</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                                    {departments.map((dept) => (
                                        <tr key={dept.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-medium">{dept.department_code}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{dept.department_name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{dept.head?.full_name || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{dept.employees.length}</td>
                                            <td className="px-4 py-3 text-sm whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    dept.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {dept.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm whitespace-nowrap">
                                                <div className="flex flex-wrap gap-2">
                                                    <Link
                                                        href={route('hrmo.departments.show', dept.id)}
                                                        className="font-medium hover:underline transition"
                                                        style={{ color: NAVY }}
                                                    >
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={route('hrmo.departments.edit', dept.id)}
                                                        className="font-medium hover:underline transition"
                                                        style={{ color: GOLD }}
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => toggleStatus(dept)}
                                                        className={`text-sm font-medium hover:underline transition ${
                                                            dept.status === 'active' ? 'text-red-600' : 'text-green-600'
                                                        }`}
                                                    >
                                                        {dept.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </HRMOLayout>
    );
}
