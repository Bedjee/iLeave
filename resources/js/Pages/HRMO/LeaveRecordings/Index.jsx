import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ employees, selectedEmployee, selectedYear, monthlyData }) {
    const [employeeId, setEmployeeId] = useState(selectedEmployee?.id || '');
    const [year, setYear] = useState(selectedYear || new Date().getFullYear());
    const [expandedMonth, setExpandedMonth] = useState(null);

    const years = [];
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 5; y <= currentYear + 1; y++) {
        years.push(y);
    }

    useEffect(() => {
        if (monthlyData?.months && selectedEmployee) {
            const firstWithTx = Object.values(monthlyData.months).find(m => m.movement_count > 0);
            if (firstWithTx) {
                setExpandedMonth(firstWithTx.month_num);
            }
        }
    }, [monthlyData, selectedEmployee]);

    const applyFilters = () => {
        router.get(route('hrmo.leave-recordings.index'), {
            employee_id: employeeId,
            year: year,
        });
    };

    const toggleMonth = (monthNum) => {
        setExpandedMonth(prev => prev === monthNum ? null : monthNum);
    };

    const formatBalance = (value) => {
        return parseFloat(value || 0).toFixed(2);
    };

    const formatChange = (value) => {
        const num = parseFloat(value || 0);
        if (num === 0) return '—';
        return (num > 0 ? '+' : '') + num.toFixed(2);
    };

    const vlTypeId = monthlyData?.vl_type_id;
    const slTypeId = monthlyData?.sl_type_id;
    const months = monthlyData?.months || {};

    let currentVlBalance = 0;
    let currentSlBalance = 0;
    if (selectedEmployee && months[12]) {
        currentVlBalance = months[12].ending_balances[vlTypeId] || 0;
        currentSlBalance = months[12].ending_balances[slTypeId] || 0;
    }

    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';
    const NAVY_LIGHT = '#f0f4f8';

    return (
        <HRMOLayout>
            <Head title="Leave Recordings" />
            <div className="space-y-6">
                {/* Header with filters */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold" style={{ color: NAVY }}>Leave Credit Recordings</h2>
                        <p className="text-sm text-gray-500">Detailed monthly leave credit movements for each employee.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Employee</label>
                            <select
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                className="rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
                                style={{ borderColor: 'rgba(15,42,82,0.15)' }}
                                onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                            >
                                <option value="">Select Employee</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.full_name} ({emp.position || 'No position'})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Year</label>
                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
                                style={{ borderColor: 'rgba(15,42,82,0.15)' }}
                                onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                            >
                                {years.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={applyFilters}
                            className="self-end px-4 py-1.5 text-white rounded-lg transition text-sm font-medium"
                            style={{ backgroundColor: GOLD }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e6ac00'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = GOLD}
                        >
                            View
                        </button>
                        <button
                            onClick={() => router.get(route('hrmo.leave-recordings.export'), { employee_id: employeeId, year: year })}
                            className="self-end px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                        >
                            Export Excel
                        </button>
                    </div>
                </div>

                {selectedEmployee && (
                    <>
                        {/* Employee Summary */}
                        <div className="bg-white rounded-xl border shadow-sm p-4 flex flex-wrap items-center justify-between gap-3" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                            <div className="flex flex-wrap items-center gap-6">
                                <div>
                                    <p className="text-xs text-gray-500">Employee</p>
                                    <p className="text-lg font-semibold" style={{ color: NAVY }}>
                                        {selectedEmployee.full_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Employee ID</p>
                                    <p className="text-sm font-medium text-gray-700">{selectedEmployee.id || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Department</p>
                                    <p className="text-sm text-gray-700">{selectedEmployee.department?.department_name || '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500">Current VL</p>
                                    <p className="font-bold" style={{ color: NAVY }}>{formatBalance(currentVlBalance)} days</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Current SL</p>
                                    <p className="font-bold" style={{ color: NAVY }}>{formatBalance(currentSlBalance)} days</p>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Accordions */}
                        <div className="space-y-3">
                            {Object.values(months).map((month) => {
                                const isExpanded = expandedMonth === month.month_num;
                                const hasTransactions = month.movement_count > 0;

                                return (
                                    <div
                                        key={month.month_num}
                                        className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all duration-300 ${
                                            isExpanded ? 'ring-2 ring-[#ffbf00]' : ''
                                        }`}
                                        style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                                    >
                                        {/* Header */}
                                        <div
                                            className={`flex flex-wrap items-center justify-between p-4 cursor-pointer transition ${
                                                isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'
                                            }`}
                                            onClick={() => toggleMonth(month.month_num)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-base font-semibold" style={{ color: NAVY }}>
                                                    {month.month_name} {year}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {month.movement_count} movement{month.movement_count !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm flex-wrap">
                                                <span className="text-gray-600">
                                                    VL: <span className={month.net_vl >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                        {formatChange(month.net_vl)}
                                                    </span>
                                                </span>
                                                <span className="text-gray-600">
                                                    SL: <span className={month.net_sl >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                        {formatChange(month.net_sl)}
                                                    </span>
                                                </span>
                                                <span className="text-gray-500 text-xs whitespace-nowrap">
                                                    Ending: {formatBalance(month.ending_balances[vlTypeId] || 0)} VL / {formatBalance(month.ending_balances[slTypeId] || 0)} SL
                                                </span>
                                                <span className="text-gray-400 text-xl font-light ml-2">
                                                    {isExpanded ? '−' : '+'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Expanded content */}
                                        {isExpanded && (
                                            <div className="border-t px-4 py-4 space-y-4" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                                                {/* Opening Balance */}
                                                <div>
                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Opening Balance</h4>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-500">Vacation Leave</span>
                                                            <span className="ml-2 font-medium" style={{ color: NAVY }}>
                                                                {formatBalance(month.opening_balances[vlTypeId] || 0)} days
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Sick Leave</span>
                                                            <span className="ml-2 font-medium" style={{ color: NAVY }}>
                                                                {formatBalance(month.opening_balances[slTypeId] || 0)} days
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Movements Table with Running Balances */}
                                                {hasTransactions ? (
                                                    <div>
                                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Leave Credit Movements</h4>
                                                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                                                            <table className="min-w-full text-sm">
                                                                <thead className="bg-gray-50" style={{ backgroundColor: NAVY_LIGHT }}>
                                                                    <tr>
                                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">VL Change</th>
                                                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">SL Change</th>
                                                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">VL Balance</th>
                                                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">SL Balance</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                                                                    {(() => {
                                                                        // Running balances for this month
                                                                        let runningVL = month.opening_balances[vlTypeId] || 0;
                                                                        let runningSL = month.opening_balances[slTypeId] || 0;

                                                                        return month.transactions.map((tx) => {
                                                                            const isVL = tx.leave_type_id == vlTypeId;
                                                                            const amount = parseFloat(tx.amount || 0);
                                                                            const description = tx.description || tx.transaction_type;

                                                                            // Update running balances
                                                                            if (isVL) {
                                                                                runningVL = parseFloat(tx.balance_after || 0);
                                                                            } else {
                                                                                runningSL = parseFloat(tx.balance_after || 0);
                                                                            }

                                                                            // For the other type, we use the last known balance
                                                                            const vlBalAfter = isVL ? runningVL : runningVL;
                                                                            const slBalAfter = isVL ? runningSL : runningSL;

                                                                            return (
                                                                                <tr key={tx.id} className="hover:bg-gray-50">
                                                                                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                                                                                        {tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                                                                                    </td>
                                                                                    <td className="px-3 py-2 text-gray-700">
                                                                                        {description}
                                                                                        {tx.creator && <span className="text-xs text-gray-400 ml-1">(by {tx.creator.name})</span>}
                                                                                    </td>
                                                                                    <td className="px-3 py-2 text-right font-mono">
                                                                                        {isVL ? (
                                                                                            <span className={amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                                                                {formatChange(amount)}
                                                                                            </span>
                                                                                        ) : '—'}
                                                                                    </td>
                                                                                    <td className="px-3 py-2 text-right font-mono">
                                                                                        {!isVL ? (
                                                                                            <span className={amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                                                                {formatChange(amount)}
                                                                                            </span>
                                                                                        ) : '—'}
                                                                                    </td>
                                                                                    <td className="px-3 py-2 text-right font-mono font-medium" style={{ color: NAVY }}>
                                                                                        {formatBalance(runningVL)}
                                                                                    </td>
                                                                                    <td className="px-3 py-2 text-right font-mono font-medium" style={{ color: NAVY }}>
                                                                                        {formatBalance(runningSL)}
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        });
                                                                    })()}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-400 italic">No movements this month.</div>
                                                )}

                                                {/* Ending Balance */}
                                                <div>
                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ending Balance</h4>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-500">Vacation Leave</span>
                                                            <span className="ml-2 font-medium" style={{ color: NAVY }}>
                                                                {formatBalance(month.ending_balances[vlTypeId] || 0)} days
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Sick Leave</span>
                                                            <span className="ml-2 font-medium" style={{ color: NAVY }}>
                                                                {formatBalance(month.ending_balances[slTypeId] || 0)} days
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {!selectedEmployee && employees.length > 0 && (
                    <div className="bg-white rounded-xl border p-8 text-center text-gray-500" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                        <svg className="size-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>Select an employee and year, then click <strong>View</strong> to see leave recordings.</p>
                    </div>
                )}
            </div>
        </HRMOLayout>
    );
}