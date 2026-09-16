import { Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import {
    Wallet,
    Search,
    X,
    CheckCircle2,
    ArrowRight,
    AlertCircle,
    TrendingUp,
} from 'lucide-react';

const NAVY = '#0F2A52';
const GOLD = '#ffbf00';

// ---------- Stat card ----------
function StatCard({ icon: Icon, label, value, suffix, accent = NAVY }) {
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
                <span className="text-2xl font-bold tabular-nums" style={{ color: NAVY }}>
                    {value}
                </span>
                {suffix && (
                    <span className="text-xs text-gray-500 font-medium">{suffix}</span>
                )}
            </div>
        </div>
    );
}

// ---------- Balance card ----------
function BalanceCard({ item, historyRoute }) {
    const balance      = Number(item.balance) || 0;
    const defaultDays  = Number(item.default_days) || 0;
    const hasBalance   = balance > 0;
    const isUsedUp     = balance === 0 && defaultDays > 0;

    const ratio = defaultDays > 0
        ? Math.min(100, (balance / defaultDays) * 100)
        : (hasBalance ? 100 : 0);

    const isFractional = balance % 1 !== 0;

    const Wrapper = historyRoute ? Link : 'div';
    const wrapperProps = historyRoute
        ? { href: historyRoute }
        : {};

    return (
        <Wrapper
            {...wrapperProps}
            className={`group relative rounded-xl border p-4 transition-all duration-200 flex flex-col ${
                hasBalance
                    ? 'bg-white hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                    : 'bg-gray-50/70'
            }`}
            style={{
                borderColor: hasBalance
                    ? 'rgba(15,42,82,0.08)'
                    : 'rgba(15,42,82,0.05)',
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                    <h4
                        className={`text-sm font-semibold truncate ${
                            hasBalance ? 'text-gray-900' : 'text-gray-500'
                        }`}
                        title={item.name}
                    >
                        {item.name}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                        {item.code}
                    </p>
                </div>

                {item.earnable && hasBalance && (
                    <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium flex-shrink-0"
                        style={{
                            backgroundColor: 'rgba(255,191,0,0.15)',
                            color: '#B45309',
                        }}
                    >
                        <TrendingUp className="w-2.5 h-2.5" />
                        Accruing
                    </span>
                )}

                {isUsedUp && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-500 flex-shrink-0">
                        Used up
                    </span>
                )}
            </div>

            {/* Balance */}
            <div className="mb-3">
                <div className="flex items-baseline gap-1.5">
                    <span
                        className={`text-3xl font-extrabold leading-none tabular-nums ${
                            hasBalance ? '' : 'text-gray-400'
                        }`}
                        style={hasBalance ? { color: NAVY } : {}}
                    >
                        {isFractional ? balance.toFixed(2) : balance}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                        {balance === 1 ? 'day' : 'days'}
                    </span>
                    {defaultDays > 0 && (
                        <span className="text-[11px] text-gray-400 ml-auto">
                            of {defaultDays} default
                        </span>
                    )}
                </div>

                {defaultDays > 0 && (
                    <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${ratio}%`,
                                backgroundColor: hasBalance ? GOLD : '#CBD5E1',
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Footer */}
            {historyRoute && (
                <div
                    className="mt-auto pt-3 border-t flex items-center justify-between gap-2"
                    style={{ borderColor: 'rgba(15,42,82,0.06)' }}
                >
                    <span className="text-[11px] text-gray-500 group-hover:text-gray-700 transition">
                        View history
                    </span>
                    <ArrowRight
                        className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                        style={{ color: hasBalance ? GOLD : '#94A3B8' }}
                    />
                </div>
            )}
        </Wrapper>
    );
}

// ---------- Main shared view ----------
export default function MyBalanceView({
    leaveBalances = [],
    employee = {},
    historyRouteName = null, // pass e.g. 'admin.leave-balances.history' if you add one later
}) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredBalances = useMemo(() => {
        if (!searchQuery.trim()) return leaveBalances;
        const q = searchQuery.toLowerCase().trim();
        return leaveBalances.filter(
            (item) =>
                item.name.toLowerCase().includes(q) ||
                item.code.toLowerCase().includes(q)
        );
    }, [leaveBalances, searchQuery]);

    const sortedBalances = useMemo(() => {
        return [...filteredBalances].sort((a, b) => {
            const aHas = Number(a.balance) > 0 ? 1 : 0;
            const bHas = Number(b.balance) > 0 ? 1 : 0;
            if (aHas !== bHas) return bHas - aHas;
            return Number(b.balance) - Number(a.balance);
        });
    }, [filteredBalances]);

    const totalBalance = useMemo(
        () => leaveBalances.reduce((sum, item) => sum + Number(item.balance || 0), 0),
        [leaveBalances]
    );
    const typesWithBalance = leaveBalances.filter((i) => Number(i.balance) > 0).length;
    const typesUsedUp      = leaveBalances.filter(
        (i) => Number(i.balance) === 0 && Number(i.default_days) > 0
    ).length;
    const totalTypes = leaveBalances.length;

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h2
                        className="text-xl font-bold flex items-center gap-2"
                        style={{ color: NAVY }}
                    >
                        <Wallet className="w-5 h-5" style={{ color: GOLD }} />
                        My Leave Balances
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        {employee?.name}
                        {employee?.position && <> · {employee.position}</>}
                        {employee?.department && <> · {employee.department}</>}
                    </p>
                </div>

                {/* Search */}
                <div className="w-full lg:w-72">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search leave types…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-9 py-2 rounded-lg border text-sm focus:outline-none transition bg-white"
                            style={{ borderColor: 'rgba(15,42,82,0.12)' }}
                            onFocus={(e) => (e.target.style.borderColor = GOLD)}
                            onBlur={(e) =>
                                (e.target.style.borderColor = 'rgba(15,42,82,0.12)')
                            }
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                aria-label="Clear search"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatCard
                    icon={Wallet}
                    label="Total Available"
                    value={totalBalance % 1 === 0 ? totalBalance : totalBalance.toFixed(2)}
                    suffix={totalBalance === 1 ? 'day' : 'days'}
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Types with Balance"
                    value={`${typesWithBalance} / ${totalTypes}`}
                    accent="#059669"
                />
                <StatCard
                    icon={AlertCircle}
                    label="Used Up"
                    value={typesUsedUp}
                    suffix={typesUsedUp === 1 ? 'type' : 'types'}
                    accent={typesUsedUp > 0 ? '#DC2626' : '#94A3B8'}
                />
            </div>

            {/* Cards */}
            {sortedBalances.length === 0 ? (
                <div
                    className="rounded-xl bg-white border shadow-sm py-14 px-6 text-center"
                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    <div
                        className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(15,42,82,0.05)' }}
                    >
                        <AlertCircle className="w-6 h-6" style={{ color: NAVY }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: NAVY }}>
                        {searchQuery ? 'No matching leave types' : 'No leave balances found'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                        {searchQuery
                            ? 'Try a different search term or clear the field.'
                            : 'Contact HRMO if you believe this is incorrect.'}
                    </p>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white transition"
                            style={{ backgroundColor: NAVY }}
                        >
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                    {sortedBalances.map((item) => (
                        <BalanceCard
                            key={item.id}
                            item={item}
                            historyRoute={
                                historyRouteName ? route(historyRouteName, item.id) : null
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}