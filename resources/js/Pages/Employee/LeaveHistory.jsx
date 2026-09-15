import EmployeeLayout from '@/Layouts/EmployeeLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import {
    ArrowLeft,
    Wallet,
    TrendingUp,
    TrendingDown,
    Plus,
    Minus,
    Settings2,
    RotateCcw,
    Flag,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Calendar,
} from 'lucide-react';

const NAVY = '#0F2A52';
const GOLD = '#ffbf00';

// ---------- Transaction type metadata ----------
const TYPE_META = {
    INITIAL_BALANCE: {
        icon: Flag,
        label: 'Initial Balance',
        cls: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    HR_ADJUSTMENT: {
        icon: Settings2,
        label: 'HR Adjustment',
        cls: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    MONTHLY_ACCRUAL: {
        icon: TrendingUp,
        label: 'Monthly Accrual',
        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    LEAVE_DEDUCTION: {
        icon: TrendingDown,
        label: 'Leave Deduction',
        cls: 'bg-red-50 text-red-700 border-red-200',
    },
    LEAVE_RETURN: {
        icon: RotateCcw,
        label: 'Leave Return',
        cls: 'bg-violet-50 text-violet-700 border-violet-200',
    },
    FINAL_ACCRUAL: {
        icon: Flag,
        label: 'Final Accrual',
        cls: 'bg-orange-50 text-orange-700 border-orange-200',
    },
};

function getMeta(type) {
    return (
        TYPE_META[type] || {
            icon: Plus,
            label: type.replace(/_/g, ' '),
            cls: 'bg-gray-50 text-gray-700 border-gray-200',
        }
    );
}

// ---------- Sub-components ----------
function SummaryCard({ icon: Icon, label, value, suffix, accent = NAVY, sub }) {
    return (
        <div
            className="rounded-xl bg-white border shadow-sm p-4"
            style={{ borderColor: 'rgba(15,42,82,0.08)' }}
        >
            <div className="flex items-center gap-2 mb-2">
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${accent}15`, color: accent }}
                >
                    <Icon className="w-3.5 h-3.5" />
                </div>
                <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: NAVY, opacity: 0.7 }}
                >
                    {label}
                </span>
            </div>
            <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tabular-nums" style={{ color: accent }}>
                    {value}
                </span>
                {suffix && (
                    <span className="text-xs text-gray-500 font-medium">{suffix}</span>
                )}
            </div>
            {sub && (
                <p className="text-[11px] text-gray-400 mt-1">{sub}</p>
            )}
        </div>
    );
}

function TransactionRow({ tx, isLast }) {
    const meta = getMeta(tx.transaction_type);
    const Icon = meta.icon;
    const amount = Number(tx.amount);
    const isCredit = amount >= 0;

    return (
        <li className="relative pl-12 pb-4 last:pb-0">
            {/* Vertical line */}
            {!isLast && (
                <span
                    className="absolute left-[19px] top-10 bottom-0 w-px"
                    style={{ backgroundColor: 'rgba(15,42,82,0.08)' }}
                />
            )}

            {/* Icon badge */}
            <span
                className={`absolute left-0 top-0 w-10 h-10 rounded-full border-2 flex items-center justify-center ${meta.cls}`}
                style={{ backgroundColor: 'white' }}
            >
                <Icon className="w-4 h-4" />
            </span>

            {/* Card body */}
            <div
                className="rounded-xl border bg-white p-3 hover:shadow-sm transition"
                style={{ borderColor: 'rgba(15,42,82,0.08)' }}
            >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    {/* Left: label + date + description */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900">
                                {meta.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(tx.transaction_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </div>
                        {tx.description && (
                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                                {tx.description}
                            </p>
                        )}
                    </div>

                    {/* Right: amount + resulting balance */}
                    <div className="flex items-center sm:flex-col sm:items-end gap-3 sm:gap-0.5 flex-shrink-0">
                        <div
                            className={`inline-flex items-center gap-1 text-base font-bold tabular-nums ${
                                isCredit ? 'text-emerald-600' : 'text-red-600'
                            }`}
                        >
                            {isCredit ? (
                                <Plus className="w-3.5 h-3.5" />
                            ) : (
                                <Minus className="w-3.5 h-3.5" />
                            )}
                            {Math.abs(amount).toFixed(2)}
                        </div>
                        <span className="text-[11px] text-gray-400 tabular-nums">
                            Balance: <span className="font-medium text-gray-600">{Number(tx.balance_after).toFixed(2)}</span>
                        </span>
                    </div>
                </div>
            </div>
        </li>
    );
}

// ---------- Page ----------
export default function LeaveHistory({ leaveType, transactions, currentBalance, employee }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalItems = transactions.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentTransactions = transactions.slice(startIndex, endIndex);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Summary metrics from transactions
    const summary = useMemo(() => {
        const credited = transactions
            .filter((t) => Number(t.amount) >= 0)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const used = transactions
            .filter((t) => Number(t.amount) < 0)
            .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
        return {
            credited: +credited.toFixed(2),
            used: +used.toFixed(2),
            net: +(credited - used).toFixed(2),
        };
    }, [transactions]);

    const balance = Number(currentBalance) || 0;
    const defaultDays = Number(leaveType.default_days) || 0;
    const ratio = defaultDays > 0 ? Math.min(100, (balance / defaultDays) * 100) : 0;

    return (
        <EmployeeLayout>
            <Head title={`${leaveType.name} History`} />

            <div className="space-y-5">

                {/* ================= Back link ================= */}
                <Link
                    href={route('employee.leave-balances')}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Leave Balances
                </Link>

                {/* ================= Header ================= */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2
                            className="text-xl font-bold flex items-center gap-2 flex-wrap"
                            style={{ color: NAVY }}
                        >
                            <Wallet className="w-5 h-5" style={{ color: GOLD }} />
                            {leaveType.name} History
                            {leaveType.code && (
                                <span
                                    className="inline-block px-2 py-0.5 rounded-md text-[11px] font-mono font-medium"
                                    style={{
                                        backgroundColor: 'rgba(15,42,82,0.06)',
                                        color: NAVY,
                                    }}
                                >
                                    {leaveType.code}
                                </span>
                            )}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                            {employee?.name}
                            {employee?.department && <> · {employee.department}</>}
                        </p>
                    </div>
                </div>

                {/* ================= Summary strip ================= */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <SummaryCard
                        icon={Wallet}
                        label="Current Balance"
                        value={balance % 1 === 0 ? balance : balance.toFixed(2)}
                        suffix={balance === 1 ? 'day' : 'days'}
                        sub={
                            defaultDays > 0
                                ? `of ${defaultDays} default allocation`
                                : undefined
                        }
                    />
                    <SummaryCard
                        icon={TrendingUp}
                        label="Total Credited"
                        value={summary.credited % 1 === 0 ? summary.credited : summary.credited.toFixed(2)}
                        suffix={summary.credited === 1 ? 'day' : 'days'}
                        accent="#059669"
                        sub="across all history"
                    />
                    <SummaryCard
                        icon={TrendingDown}
                        label="Total Used"
                        value={summary.used % 1 === 0 ? summary.used : summary.used.toFixed(2)}
                        suffix={summary.used === 1 ? 'day' : 'days'}
                        accent="#DC2626"
                        sub="across all history"
                    />
                </div>

                {/* ================= Balance progress (only if default exists) ================= */}
                {defaultDays > 0 && (
                    <div
                        className="rounded-xl bg-white border shadow-sm p-4"
                        style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                    >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-gray-500 font-medium">
                                Available vs. default allocation
                            </span>
                            <span className="font-semibold text-gray-700 tabular-nums">
                                {ratio.toFixed(0)}%
                            </span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${ratio}%`,
                                    backgroundColor: GOLD,
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* ================= Transactions timeline ================= */}
                <div
                    className="rounded-xl bg-white border shadow-sm p-4 sm:p-5"
                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3
                            className="text-sm font-semibold flex items-center gap-2"
                            style={{ color: NAVY }}
                        >
                            <Calendar className="w-4 h-4" style={{ color: GOLD }} />
                            Transaction History
                        </h3>
                        <span className="text-xs text-gray-500">
                            {totalItems} {totalItems === 1 ? 'entry' : 'entries'}
                        </span>
                    </div>

                    {currentTransactions.length === 0 ? (
                        <div className="text-center py-14 px-6">
                            <div
                                className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: 'rgba(15,42,82,0.05)' }}
                            >
                                <AlertCircle
                                    className="w-6 h-6"
                                    style={{ color: NAVY }}
                                />
                            </div>
                            <p
                                className="text-sm font-medium"
                                style={{ color: NAVY }}
                            >
                                No transactions yet
                            </p>
                            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                                Credits and deductions for this leave type will appear here as they happen.
                            </p>
                        </div>
                    ) : (
                        <ol className="relative">
                            {currentTransactions.map((tx, idx) => (
                                <TransactionRow
                                    key={tx.id}
                                    tx={tx}
                                    isLast={idx === currentTransactions.length - 1}
                                />
                            ))}
                        </ol>
                    )}

                    {/* ================= Pagination ================= */}
                    {totalPages > 1 && (
                        <div
                            className="mt-5 pt-4 border-t flex flex-wrap items-center justify-between gap-2"
                            style={{ borderColor: 'rgba(15,42,82,0.06)' }}
                        >
                            <p className="text-xs text-gray-500">
                                Showing{' '}
                                <span className="font-medium text-gray-700">{startIndex + 1}</span>–
                                <span className="font-medium text-gray-700">{endIndex}</span> of{' '}
                                <span className="font-medium text-gray-700">{totalItems}</span>
                            </p>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                                    style={{ color: NAVY }}
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                    Prev
                                </button>

                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    let page = i + 1;
                                    if (totalPages > 7 && currentPage > 4) {
                                        page = currentPage - 3 + i;
                                    }
                                    if (page > totalPages) return null;
                                    const active = page === currentPage;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-medium transition ${
                                                active
                                                    ? 'text-white shadow-sm'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                            style={active ? { backgroundColor: NAVY } : {}}
                                        >
                                            {page}
                                        </button>
                                    );
                                }).filter(Boolean)}

                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                                    style={{ color: NAVY }}
                                >
                                    Next
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </EmployeeLayout>
    );
}