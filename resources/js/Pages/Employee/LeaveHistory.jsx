import EmployeeLayout from '@/Layouts/EmployeeLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';

export default function LeaveHistory({ leaveType, transactions, currentBalance, employee }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const sortedTransactions = transactions;

    const totalItems = sortedTransactions.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentTransactions = sortedTransactions.slice(startIndex, endIndex);

    const getTypeBadge = (type) => {
        const badges = {
            INITIAL_BALANCE: 'bg-blue-50 text-blue-700 border-blue-200',
            HR_ADJUSTMENT: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            MONTHLY_ACCRUAL: 'bg-green-50 text-green-700 border-green-200',
            LEAVE_DEDUCTION: 'bg-red-50 text-red-700 border-red-200',
            LEAVE_RETURN: 'bg-purple-50 text-purple-700 border-purple-200',
            FINAL_ACCRUAL: 'bg-orange-50 text-orange-700 border-orange-200',
        };
        return badges[type] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const formatType = (type) => type.replace(/_/g, ' ');

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';

    // Helper to format amount with sign
    const formatAmount = (amount) => {
        const num = Number(amount);
        if (isNaN(num)) return '0';
        const sign = num >= 0 ? '+' : '';
        return `${sign}${num.toFixed(2)}`;
    };

    return (
        <EmployeeLayout>
            <Head title={`${leaveType.name} History`} />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 sm:size-11 items-center justify-center rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(255,191,0,0.15)', color: GOLD }}>
                            <svg className="size-4 sm:size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold" style={{ color: NAVY }}>
                                {leaveType.name} History
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500">
                                {employee?.name} · {leaveType.code}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('employee.leave-balances')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition self-start sm:self-center"
                        style={{ backgroundColor: '#f3f4f6', color: NAVY }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </Link>
                </div>

                {/* Summary Cards – modernized */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm hover:shadow-md transition">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Current Balance</p>
                        <p className="text-2xl font-bold mt-1" style={{ color: GOLD }}>{currentBalance}</p>
                        <p className="text-xs text-gray-400">days</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm hover:shadow-md transition">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Default Days</p>
                        <p className="text-xl font-bold mt-1" style={{ color: NAVY }}>{leaveType.default_days ?? '—'}</p>
                        <p className="text-xs text-gray-400">per year</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm hover:shadow-md transition">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Earnable</p>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mt-1 ${leaveType.earnable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {leaveType.earnable ? 'Yes' : 'No'}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">leave credits accrue</p>
                    </div>
                </div>

                {/* Transactions List – modern cards */}
                {currentTransactions.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                        <svg className="size-14 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500">No transactions found for this leave type.</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {currentTransactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 hover:border-[#ffbf00]/20"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        {/* Left: Icon + Type + Date */}
                                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                                            <div className={`flex size-10 items-center justify-center rounded-full border ${getTypeBadge(tx.transaction_type)} flex-shrink-0`}>
                                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {formatType(tx.transaction_type)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(tx.transaction_date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right: Amount + Balance */}
                                        <div className="flex items-center gap-4 self-start sm:self-center flex-wrap">
                                            <span className={`text-base font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatAmount(tx.amount)}
                                            </span>
                                            <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                                                Bal: {tx.balance_after}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description – if present */}
                                    {tx.description && (
                                        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                                            {tx.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination – polished */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-200">
                                <div className="text-xs text-gray-500 text-center sm:text-left">
                                    Showing {startIndex + 1}–{endIndex} of {totalItems} transactions
                                </div>
                                <div className="flex justify-center sm:justify-end gap-1 flex-wrap">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                        Previous
                                    </button>
                                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                        // Show pages around current page
                                        let page = i + 1;
                                        if (totalPages > 7) {
                                            if (currentPage > 4) {
                                                page = currentPage - 3 + i;
                                            }
                                            if (page > totalPages) return null;
                                        }
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => goToPage(page)}
                                                className={`px-3.5 py-1.5 text-xs rounded-lg font-medium transition ${
                                                    page === currentPage
                                                        ? 'text-white shadow-sm'
                                                        : 'border border-gray-200 hover:bg-gray-50'
                                                }`}
                                                style={page === currentPage ? { backgroundColor: GOLD } : {}}
                                            >
                                                {page}
                                            </button>
                                        );
                                    }).filter(Boolean)}
                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </EmployeeLayout>
    );
}