import DepartmentHeadLayout from '@/Layouts/DepartmentHeadLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ employees, department, headName }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter employees
    const filteredEmployees = employees.filter((emp) =>
        emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.position && emp.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Get avatar color (kept varied for visual interest)
    const getAvatarColor = (name) => {
        const colors = [
            'bg-indigo-500',
            'bg-blue-500',
            'bg-cyan-500',
            'bg-teal-500',
            'bg-emerald-500',
            'bg-amber-500',
            'bg-orange-500',
            'bg-rose-500',
            'bg-purple-500',
            'bg-pink-500',
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const activeCount = employees.filter(e => e.user?.status === 'active').length;
    const inactiveCount = employees.filter(e => e.user?.status !== 'active').length;

    // Color palette
    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';

    return (
        <DepartmentHeadLayout>
            <Head title="Team" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: NAVY }}>
                            <svg className="size-6" style={{ color: GOLD }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Team Members
                        </h2>
                        <p className="text-sm text-gray-500">
                            {department || 'Department'} · Head: {headName || '—'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-gray-600"><strong>{activeCount}</strong> Active</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            <span className="text-gray-600"><strong>{inactiveCount}</strong> Inactive</span>
                        </span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500">{employees.length} members</span>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name, position, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-[#ffbf00] focus:ring-2 focus:ring-[#ffbf00]/20 transition text-sm"
                            style={{ '--tw-ring-color': 'rgba(255,191,0,0.2)' }}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {filteredEmployees.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="size-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {searchTerm ? (
                                <>
                                    <p className="text-gray-500 text-sm">No employees match your search.</p>
                                    <p className="text-gray-400 text-xs mt-1">Try adjusting your search terms.</p>
                                </>
                            ) : (
                                <p className="text-gray-500">No employees in your department.</p>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {filteredEmployees.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-gray-50 transition duration-150">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(emp.full_name)}`}>
                                                        {getInitials(emp.full_name)}
                                                    </div>
                                                    <span className="text-sm font-medium" style={{ color: NAVY }}>{emp.full_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{emp.position || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{emp.email}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    emp.user?.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                        emp.user?.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                                    }`}></span>
                                                    {emp.user?.status === 'active' ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-4 text-xs text-gray-400 text-right">
                    Showing {filteredEmployees.length} of {employees.length} employees
                </div>
            </div>
        </DepartmentHeadLayout>
    );
}
