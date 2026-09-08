import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ employees, filters, departments }) {
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        department: filters.department || '',
        status: filters.status || '',
    });

    const [menuOpen, setMenuOpen] = useState(null);

    const filter = () => {
        get(route('hrmo.employees.index'), data, { preserveState: true });
    };

    const resetFilters = () => {
        setData({ search: '', department: '', status: '' });
        get(route('hrmo.employees.index'), { search: '', department: '', status: '' }, { preserveState: true });
    };

    const handleAction = (action, employeeId) => {
        setMenuOpen(null);
        switch (action) {
            case 'show':
                router.visit(route('hrmo.employees.show', employeeId));
                break;
            case 'edit':
                router.visit(route('hrmo.employees.edit', employeeId));
                break;
            case 'reset':
                if (confirm('Are you sure you want to reset the password to default?')) {
                    router.post(route('hrmo.employees.reset-password', employeeId), {}, {
                        onSuccess: () => {},
                        onError: () => alert('Failed to reset password.'),
                    });
                }
                break;
            default:
                break;
        }
    };

    // Color palette
    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';
    const NAVY_DARK = '#081A33';

    return (
        <HRMOLayout>
            <Head title="Employees" />
            <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-xl md:text-2xl font-bold" style={{ color: NAVY }}>Employee List</h2>
                    <Link
                        href={route('hrmo.employees.create')}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-white rounded-lg transition text-sm font-medium"
                        style={{ backgroundColor: NAVY }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = NAVY_DARK}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = NAVY}
                    >
                        <svg className="size-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Employee
                    </Link>
                </div>

                {/* Filters – Compact Row */}
                <div className="rounded-lg border p-3 flex flex-wrap items-end gap-2" style={{ borderColor: 'rgba(15,42,82,0.08)', backgroundColor: '#f9fafb' }}>
                    <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium mb-0.5" style={{ color: NAVY }}>Search</label>
                        <input
                            type="text"
                            placeholder="Name or email..."
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                            className="w-full rounded border px-2 py-1 text-sm"
                            style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: 'white' }}
                        />
                    </div>
                    <div className="w-36">
                        <label className="block text-xs font-medium mb-0.5" style={{ color: NAVY }}>Department</label>
                        <select
                            value={data.department}
                            onChange={(e) => setData('department', e.target.value)}
                            className="w-full rounded border px-2 py-1 text-sm"
                            style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: 'white' }}
                        >
                            <option value="">All</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>{dept.department_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-28">
                        <label className="block text-xs font-medium mb-0.5" style={{ color: NAVY }}>Status</label>
                        <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="w-full rounded border px-2 py-1 text-sm"
                            style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: 'white' }}
                        >
                            <option value="">All</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={filter}
                            disabled={processing}
                            className="px-3 py-1 text-white rounded text-sm font-medium transition disabled:opacity-50"
                            style={{ backgroundColor: GOLD }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e6ac00'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = GOLD}
                        >
                            Filter
                        </button>
                        <button
                            onClick={resetFilters}
                            className="px-3 py-1 rounded text-sm font-medium transition"
                            style={{ backgroundColor: '#e5e7eb', color: NAVY }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Table – Clean White Card */}
                <div className="rounded-lg bg-white border overflow-hidden" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700">
                            <thead className="text-xs uppercase" style={{ backgroundColor: '#f3f4f6', color: NAVY }}>
                                <tr>
                                    <th className="px-3 py-2 font-medium">Name</th>
                                    <th className="px-3 py-2 font-medium">Email</th>
                                    <th className="px-3 py-2 font-medium">Department</th>
                                    <th className="px-3 py-2 font-medium">Position</th>
                                    <th className="px-3 py-2 font-medium">Status</th>
                                    <th className="px-3 py-2 font-medium text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                                {employees.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-3 py-6 text-center text-gray-500 text-sm">
                                            No employees found.
                                        </td>
                                    </tr>
                                ) : (
                                    employees.data.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-gray-50 transition">
                                            <td className="px-3 py-2 text-gray-900 whitespace-nowrap font-medium">{emp.full_name}</td>
                                            <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{emp.email}</td>
                                            <td className="px-3 py-2 text-gray-600">{emp.department?.department_name || '—'}</td>
                                            <td className="px-3 py-2 text-gray-600">{emp.position || '—'}</td>
                                            <td className="px-3 py-2 whitespace-nowrap">
                                                {emp.user?.status === 'active' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-center relative">
                                                <button
                                                    onClick={() => setMenuOpen(menuOpen === emp.id ? null : emp.id)}
                                                    className="text-gray-400 hover:text-gray-600 transition p-1"
                                                >
                                                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                    </svg>
                                                </button>
                                                {menuOpen === emp.id && (
                                                    <div className="absolute right-0 mt-1 w-40 bg-white border rounded-lg shadow-xl z-10 py-1" style={{ borderColor: 'rgba(15,42,82,0.1)' }}>
                                                        <button
                                                            onClick={() => handleAction('show', emp.id)}
                                                            className="block w-full text-left px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                                                        >
                                                            Show
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction('edit', emp.id)}
                                                            className="block w-full text-left px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction('reset', emp.id)}
                                                            className="block w-full text-left px-4 py-1.5 text-sm transition"
                                                            style={{ color: GOLD }}
                                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef3c7'}
                                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                        >
                                                            Reset Password
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {employees.links && (
                        <div className="px-3 py-2 border-t flex flex-wrap justify-between items-center gap-2" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                            <p className="text-xs text-gray-500">
                                Showing {employees.from} to {employees.to} of {employees.total}
                            </p>
                            <div className="flex gap-1">
                                {employees.links.map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={link.url || '#'}
                                        onClick={(e) => {
                                            if (!link.url) return;
                                            e.preventDefault();
                                            get(link.url, data, { preserveState: true });
                                        }}
                                        className={`px-2.5 py-0.5 rounded text-xs transition ${
                                            link.active
                                                ? 'text-white font-medium'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        } ${!link.url ? 'opacity-50 pointer-events-none' : ''}`}
                                        style={link.active ? { backgroundColor: GOLD } : { backgroundColor: 'transparent' }}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </HRMOLayout>
    );
}
