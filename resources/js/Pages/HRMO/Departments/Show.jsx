import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ department }) {
    const NAVY = '#0F2A52';
    const NAVY_DARK = '#081A33';
    const GOLD = '#ffbf00';

    return (
        <HRMOLayout>
            <Head title={department.department_name} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold" style={{ color: NAVY }}>
                            {department.department_name} <span className="text-sm font-normal text-gray-400">({department.department_code})</span>
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Department details and employee list.</p>
                    </div>
                    <Link
                        href={route('hrmo.departments.edit', department.id)}
                        className="inline-flex items-center justify-center px-4 py-2 text-white rounded-lg transition text-sm font-medium shadow-md hover:shadow-lg"
                        style={{ backgroundColor: NAVY }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = NAVY_DARK}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = NAVY}
                    >
                        <svg className="size-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </Link>
                </div>

                {/* Details Grid */}
                <div className="rounded-lg bg-white border p-4 md:p-6 shadow-sm" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Code</p>
                            <p className="text-sm sm:text-base font-medium text-gray-900">{department.department_code}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Head</p>
                            <p className="text-sm sm:text-base font-medium text-gray-900">{department.head?.full_name || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Status</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                department.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {department.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Total Employees</p>
                            <p className="text-sm sm:text-base font-medium text-gray-900">{department.employees.length}</p>
                        </div>
                    </div>

                    {/* Employee List */}
                    <div className="mt-6 border-t pt-6" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                        <h3 className="text-base sm:text-lg font-semibold mb-4" style={{ color: NAVY }}>Employees in this Department</h3>
                        {department.employees.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                                <svg className="size-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p className="text-sm">No employees assigned to this department.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto -mx-4 md:mx-0">
                                <table className="min-w-full divide-y" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                                    <thead style={{ backgroundColor: '#f3f4f6' }}>
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Name</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Position</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Email</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                                        {department.employees.map((emp) => (
                                            <tr key={emp.id} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-medium">{emp.full_name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{emp.position || '—'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{emp.email}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </HRMOLayout>
    );
}
