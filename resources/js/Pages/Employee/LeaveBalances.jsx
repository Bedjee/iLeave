import EmployeeLayout from '@/Layouts/EmployeeLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';

export default function LeaveBalances({ leaveBalances, employee }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredBalances = useMemo(() => {
        if (!searchQuery.trim()) return leaveBalances;
        const query = searchQuery.toLowerCase().trim();
        return leaveBalances.filter(
            (item) =>
                item.name.toLowerCase().includes(query) ||
                item.code.toLowerCase().includes(query)
        );
    }, [leaveBalances, searchQuery]);

    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';
    const NAVY_LIGHT = '#f0f4f8';

    return (
        <EmployeeLayout>
            <Head title="My Leave Balances" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 sm:size-12 items-center justify-center rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(255,191,0,0.15)', color: GOLD }}>
                            <svg className="size-5 sm:size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: NAVY }}>My Leave Balances</h2>
                            <p className="text-sm text-gray-500 truncate max-w-[200px] sm:max-w-none">
                                {employee?.name} · {employee?.position} · {employee?.department}
                            </p>
                        </div>
                    </div>

                    {/* Search – responsive width */}
                    <div className="w-full lg:w-72">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search leave types..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:border-[#ffbf00] focus:ring-2 focus:ring-[#ffbf00]/20 transition shadow-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {searchQuery && (
                            <p className="text-xs text-gray-400 mt-1.5">
                                Found {filteredBalances.length} result{filteredBalances.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </div>

                {/* Cards Grid – fully responsive */}
                {filteredBalances.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
                        <svg className="size-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500">
                            {searchQuery ? 'No leave types match your search.' : 'No leave balances found.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                        {filteredBalances.map((item) => (
                            <Link
                                key={item.id}
                                href={route('employee.leave-balances.history', item.id)}
                                className="group relative bg-white rounded-2xl border border-gray-200 p-5 transition-all duration-200 hover:shadow-lg hover:border-[#ffbf00]/30 hover:-translate-y-1 flex flex-col"
                            >
                                {/* Top row: icon + name + balance */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex size-11 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0 group-hover:bg-[#ffbf00]/10 group-hover:border-[#ffbf00]/20 transition">
                                            <img
                                                src="/images/calendar.png"
                                                alt="Leave"
                                                className="h-6 w-6 object-contain"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h4>
                                            <p className="text-xs text-gray-500">{item.code}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-2xl font-bold" style={{ color: NAVY }}>{item.balance}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">days</p>
                                    </div>
                                </div>

                                {/* Bottom row: default days + earnable + history link */}
                                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span>
                                            Default: <span className="font-medium text-gray-700">{item.default_days ?? '—'}</span>
                                        </span>
                                        <span className="w-px h-3 bg-gray-200"></span>
                                        <span>
                                            Earnable: <span className={`font-medium ${item.earnable ? 'text-green-600' : 'text-gray-400'}`}>
                                                {item.earnable ? 'Yes' : 'No'}
                                            </span>
                                        </span>
                                    </div>
                                    <span className="text-xs flex items-center gap-1 font-medium transition group-hover:translate-x-0.5" style={{ color: GOLD }}>
                                        View history
                                        <svg className="size-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                </div>

                                {/* Optional: subtle gold accent line on hover */}
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffbf00] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-2xl"></div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </EmployeeLayout>
    );
}