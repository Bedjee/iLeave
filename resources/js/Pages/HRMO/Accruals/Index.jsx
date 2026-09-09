import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Index({
    logs,
    availableYears,
    selectedYear,
    leaveTypes,
    hasLogs,
}) {
    const [expandedMonth, setExpandedMonth] = useState(null);
    const [monthData, setMonthData] = useState({});
    const [loading, setLoading] = useState({});
    const [searchTerms, setSearchTerms] = useState({});
    const [selectedLeaveTypes, setSelectedLeaveTypes] = useState({});
    const [year, setYear] = useState(selectedYear || '');

    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';

    const fetchMonthData = async (year, month, search, leaveType, page = 1) => {
        const key = `${year}-${month}`;
        setLoading(prev => ({ ...prev, [key]: true }));

        try {
            const res = await axios.get(route('hrmo.accruals.month'), {
                params: { year, month, search, leave_type: leaveType, page },
            });

            setMonthData(prev => ({
                ...prev,
                [key]: {
                    transactions: res.data.transactions,
                    summary: res.data.summary,
                }
            }));
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleYearChange = (e) => {
        const newYear = e.target.value;
        setYear(newYear);
        router.get(route('hrmo.accruals.index'), { year: newYear }, { preserveState: true });
    };

    const toggleMonth = (year, month) => {
        const key = `${year}-${month}`;
        const isExpanded = expandedMonth === key;

        if (isExpanded) {
            setExpandedMonth(null);
            return;
        }

        setExpandedMonth(key);

        // If data not loaded yet, fetch it
        if (!monthData[key]) {
            const search = searchTerms[key] || '';
            const leaveType = selectedLeaveTypes[key] || '';
            fetchMonthData(year, month, search, leaveType);
        }
    };

    const handleSearch = (year, month) => {
        const key = `${year}-${month}`;
        const search = searchTerms[key] || '';
        const leaveType = selectedLeaveTypes[key] || '';
        fetchMonthData(year, month, search, leaveType);
    };

    const handleKeyDown = (e, year, month) => {
        if (e.key === 'Enter') {
            handleSearch(year, month);
        }
    };

    const handlePageChange = (year, month, url) => {
        if (!url) return;
        const urlObj = new URL(url);
        const page = urlObj.searchParams.get('page') || 1;
        const key = `${year}-${month}`;
        const search = searchTerms[key] || '';
        const leaveType = selectedLeaveTypes[key] || '';
        fetchMonthData(year, month, search, leaveType, page);
    };

    const formatMonth = (year, month) => {
        const date = new Date(year, month - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    const isMonthExpanded = (year, month) => expandedMonth === `${year}-${month}`;

    return (
        <HRMOLayout>
            <Head title="Leave Accrual Monitoring" />

            <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <h2 className="text-xl font-bold" style={{ color: NAVY }}>Leave Accrual Monitoring</h2>

                    {/* Year Filter */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-600">Year:</label>
                        <select
                            value={year}
                            onChange={handleYearChange}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="">Select Year</option>
                            {availableYears.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Empty State */}
                {!selectedYear ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                        <img
                            src="/images/Curious-cuate.png"
                            alt="Select a year"
                            className="w-56 h-56 mx-auto object-contain mb-4"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Year</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Please select a year from the dropdown above to preview the accrual logs.
                        </p>
                    </div>
                ) : !hasLogs ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                        <img
                            src="/images/Curious-cuate.png"
                            alt="No logs"
                            className="w-48 h-48 mx-auto object-contain mb-4"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Accrual Logs Found</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            No accrual logs have been processed for {selectedYear} yet.
                            The monthly accrual will run automatically on the 1st of each month.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {logs.map((log) => {
                            const key = `${log.year}-${log.month}`;
                            const isExpanded = isMonthExpanded(log.year, log.month);
                            const data = monthData[key];
                            const isLoading = loading[key];
                            const search = searchTerms[key] || '';
                            const leaveType = selectedLeaveTypes[key] || '';

                            return (
                                <div
                                    key={key}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition"
                                >
                                    {/* Month Header – Clickable */}
                                    <div
                                        onClick={() => toggleMonth(log.year, log.month)}
                                        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
                                    >
                                        <div className="flex items-center gap-4">
                                            <svg
                                                className={`size-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                            <span className="text-base font-semibold" style={{ color: NAVY }}>
                                                {formatMonth(log.year, log.month)}
                                            </span>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(255,191,0,0.15)', color: GOLD }}>
                                                {log.processed_count} employees
                                            </span>
                                        </div>
                                        {data?.summary && !isExpanded && (
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>VL: <span className="font-medium text-green-600">+{data.summary.total_vl}</span></span>
                                                <span>SL: <span className="font-medium text-blue-600">+{data.summary.total_sl}</span></span>
                                            </div>
                                        )}
                                        <svg
                                            className={`size-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 px-5 py-4">
                                            {/* Summary Stats */}
                                            {data?.summary && (
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                                    <div className="bg-gray-50 rounded-lg px-4 py-2">
                                                        <span className="text-xs text-gray-500">Employees</span>
                                                        <p className="text-lg font-bold" style={{ color: NAVY }}>{data.summary.employee_count}</p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg px-4 py-2">
                                                        <span className="text-xs text-gray-500">Total VL</span>
                                                        <p className="text-lg font-bold text-green-600">+{data.summary.total_vl}</p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg px-4 py-2">
                                                        <span className="text-xs text-gray-500">Total SL</span>
                                                        <p className="text-lg font-bold text-blue-600">+{data.summary.total_sl}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Filters */}
                                            <div className="flex flex-wrap items-end gap-3 mb-4">
                                                <div className="flex-1 min-w-[200px]">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Search Employee</label>
                                                    <input
                                                        type="text"
                                                        value={search}
                                                        onChange={(e) => setSearchTerms(prev => ({ ...prev, [key]: e.target.value }))}
                                                        onKeyDown={(e) => handleKeyDown(e, log.year, log.month)}
                                                        placeholder="Name or email..."
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div className="w-40">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Leave Type</label>
                                                    <select
                                                        value={leaveType}
                                                        onChange={(e) => setSelectedLeaveTypes(prev => ({ ...prev, [key]: e.target.value }))}
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                    >
                                                        <option value="">All</option>
                                                        {leaveTypes.map((type) => (
                                                            <option key={type.id} value={type.id}>{type.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={() => handleSearch(log.year, log.month)}
                                                    className="px-4 py-2 text-white rounded-lg text-sm font-medium transition"
                                                    style={{ backgroundColor: NAVY }}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1a3a6a'}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = NAVY}
                                                >
                                                    Apply
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSearchTerms(prev => ({ ...prev, [key]: '' }));
                                                        setSelectedLeaveTypes(prev => ({ ...prev, [key]: '' }));
                                                        fetchMonthData(log.year, log.month, '', '');
                                                    }}
                                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                                >
                                                    Reset
                                                </button>
                                            </div>

                                            {/* Transactions Table */}
                                            {isLoading ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#ffbf00] border-t-transparent"></div>
                                                </div>
                                            ) : data?.transactions?.data?.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <p>No transactions found for this month.</p>
                                                </div>
                                            ) : data?.transactions ? (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                                            <tr>
                                                                <th className="px-4 py-2 font-medium">Employee</th>
                                                                <th className="px-4 py-2 font-medium">Leave Type</th>
                                                                <th className="px-4 py-2 font-medium text-right">Amount</th>
                                                                <th className="px-4 py-2 font-medium text-right">Balance After</th>
                                                                <th className="px-4 py-2 font-medium">Transaction Date</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {data.transactions.data.map((tx) => (
                                                                <tr key={tx.id} className="hover:bg-gray-50 transition">
                                                                    <td className="px-4 py-2 font-medium text-gray-900">
                                                                        {tx.employee?.full_name || '—'}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-gray-700">{tx.leave_type?.name || '—'}</td>
                                                                    <td className="px-4 py-2 text-right font-medium text-green-600">+{tx.amount}</td>
                                                                    <td className="px-4 py-2 text-right font-medium" style={{ color: NAVY }}>{tx.balance_after}</td>
                                                                    <td className="px-4 py-2 text-gray-500 text-sm">
                                                                        {tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString() : '—'}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : null}

                                            {/* Pagination */}
                                            {data?.transactions?.links && data.transactions.data?.length > 0 && (
                                                <div className="mt-4 pt-3 border-t flex flex-wrap justify-between items-center gap-2">
                                                    <p className="text-sm text-gray-500">
                                                        Showing {data.transactions.from} to {data.transactions.to} of {data.transactions.total}
                                                    </p>
                                                    <div className="flex gap-1">
                                                        {data.transactions.links.map((link, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => handlePageChange(log.year, log.month, link.url)}
                                                                className={`px-3 py-1 rounded text-sm transition ${
                                                                    link.active
                                                                        ? 'text-white font-medium'
                                                                        : 'text-gray-700 hover:bg-gray-100'
                                                                } ${!link.url ? 'opacity-50 pointer-events-none' : ''}`}
                                                                style={link.active ? { backgroundColor: GOLD } : {}}
                                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </HRMOLayout>
    );
}