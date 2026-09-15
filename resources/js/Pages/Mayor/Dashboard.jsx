import MayorLayout from '@/Layouts/MayorLayout';
import { Head, Link } from '@inertiajs/react';
import {
    FileText, Clock, CheckCircle, Users, Building2,
    Calendar, AlertCircle, ChevronRight, TrendingUp, TrendingDown,
    UserCheck, Wallet, GaugeCircle,
} from 'lucide-react';

const RED = '#B91C1C';

function KpiCard({ icon: Icon, label, value, color = RED, delta, deltaLabel }) {
    const positive = delta !== null && delta !== undefined && delta >= 0;
    return (
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
                <div className="p-1.5 rounded-md" style={{ backgroundColor: `${color}15`, color }}>
                    <Icon className="w-4 h-4" />
                </div>
                {delta !== null && delta !== undefined && (
                    <span className={`text-[10px] sm:text-xs font-medium flex items-center gap-0.5 ${positive ? 'text-green-600' : 'text-red-500'}`}>
                        {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {positive ? '+' : ''}{delta}%
                    </span>
                )}
            </div>
            <div className="mt-2">
                <div className="text-[11px] sm:text-xs text-gray-500 leading-tight">{label}</div>
                <div className="text-lg sm:text-xl font-bold text-gray-900 tabular-nums">{value}</div>
                {deltaLabel && <div className="text-[10px] text-gray-400 mt-0.5 truncate">{deltaLabel}</div>}
            </div>
        </div>
    );
}

function Section({ title, subtitle, icon: Icon, children, action }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                        {Icon && <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                        <span className="truncate">{title}</span>
                    </h3>
                    {subtitle && <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-snug">{subtitle}</p>}
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

export default function Dashboard({
    stats, aging, onLeaveToday, upcomingCount,
    departmentComparison, trend, yoy, topLeaveTypes,
    pipeline, liability, reschedules,
}) {
    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const dayStr  = now.toLocaleDateString('en-US', { weekday: 'long' });

    const totalPending = aging.under_3 + aging.three_to_seven + aging.over_seven;
    const maxPerCapita  = Math.max(1, ...departmentComparison.map(d => d.per_capita));
    const maxLeaveType  = Math.max(1, ...topLeaveTypes.map(t => t.count));

    // Trend chart
    const chartW = 700, chartH = 130;
    const pad = { top: 8, bottom: 22, left: 8, right: 8 };
    const iW = chartW - pad.left - pad.right;
    const iH = chartH - pad.top - pad.bottom;
    const maxTrend = Math.max(1, ...trend.map(t => t.total));
    const points = trend.map((t, i) => {
        const x = pad.left + (i / (trend.length - 1)) * iW;
        const y = pad.top + iH - (t.total / maxTrend) * iH;
        return `${x},${y}`;
    }).join(' ');

    return (
        <MayorLayout>
            <Head title="Mayor Dashboard" />

            {/* ---------- Header ---------- */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 sm:mb-5">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{greeting}, Mayor!</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        LGU-wide activity at a glance. Updated live from leave, staffing and accrual data.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-[#E5E7EB] self-start flex-shrink-0">
                    <Calendar className="w-4 h-4 text-[#DC2626] flex-shrink-0" />
                    <span className="font-medium whitespace-nowrap">{dateStr}</span>
                    <span className="text-gray-300 hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{dayStr}</span>
                </div>
            </div>

            {/* ---------- 1. Headline KPIs ---------- */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
                <KpiCard icon={FileText}   label="Requests YTD"        value={stats.total_requests_ytd}
                         delta={yoy.delta_pct} deltaLabel={`vs ${yoy.last_year} last year`} />
                <KpiCard icon={Clock}      label="Pending My Action"   value={stats.pending_my_action} color="#F59E0B" />
                <KpiCard icon={CheckCircle} label="Approved YTD"       value={stats.approved_ytd} color="#10B981" />
                <KpiCard icon={UserCheck}  label="On Leave Today"      value={stats.on_leave_today} color="#0891B2" />
                <KpiCard icon={Users}      label="Active Employees"    value={stats.active_employees} color="#3B82F6" />
                <KpiCard icon={Building2}  label="Departments"         value={stats.departments} color="#8B5CF6" />
            </div>

            {/* ---------- 2. Attention Required ---------- */}
            {totalPending > 0 && (
                <div className="mb-4 sm:mb-5 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg p-3.5 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#DC2626] flex items-center justify-center text-white flex-shrink-0">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-[#991B1B]">
                                    {totalPending} leave request{totalPending > 1 ? 's' : ''} awaiting final approval
                                </h3>
                                <p className="text-xs text-[#991B1B]/80 mt-0.5">
                                    <span className="font-medium">{aging.under_3}</span> under 3d ·{' '}
                                    <span className="font-medium">{aging.three_to_seven}</span> 3–7d ·{' '}
                                    <span className={`font-bold ${aging.over_seven > 0 ? 'text-[#7F1D1D]' : ''}`}>
                                        {aging.over_seven} over 7d
                                    </span>
                                    {aging.over_seven > 0 && ' — needs attention'}
                                </p>
                                {(reschedules.pending + reschedules.certified) > 0 && (
                                    <p className="text-[11px] text-[#991B1B]/70 mt-0.5">
                                        Also: {reschedules.pending + reschedules.certified} reschedule request{reschedules.pending + reschedules.certified > 1 ? 's' : ''} in pipeline
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <Link href={route('mayor.delegated-approvals.index')}
                                  className="bg-white border border-[#FCA5A5] hover:bg-[#FEF2F2] text-[#991B1B] px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1">
                                Delegated <ChevronRight className="w-3 h-3" />
                            </Link>
                            <Link href={route('mayor.admin-leave-requests.index')}
                                  className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1">
                                Review Queue <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------- 3. Workforce Availability + Pipeline ---------- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="lg:col-span-2">
                    <Section
                        title="Workforce Availability"
                        subtitle={`${stats.on_leave_today} employees out today · ${upcomingCount} starting within the next 7 days`}
                        icon={UserCheck}
                    >
                        {onLeaveToday.length === 0 ? (
                            <div className="text-xs text-gray-400 py-5 text-center">
                                Full workforce available today.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {onLeaveToday.map((row) => (
                                    <div key={row.id} className="flex items-center justify-between gap-3 py-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                                {row.employee}
                                            </div>
                                            <div className="text-[11px] text-gray-500 truncate">
                                                {row.department || '—'} · {row.leave_type || '—'}
                                            </div>
                                        </div>
                                        <div className="text-[11px] text-gray-500 whitespace-nowrap flex-shrink-0">
                                            until {row.until}
                                        </div>
                                    </div>
                                ))}
                                {stats.on_leave_today > onLeaveToday.length && (
                                    <div className="pt-2.5 text-[11px] text-gray-400 text-center">
                                        + {stats.on_leave_today - onLeaveToday.length} more
                                    </div>
                                )}
                            </div>
                        )}
                    </Section>
                </div>

                <div className="lg:col-span-1">
                    <Section
                        title="Approval Pipeline"
                        subtitle="How fast requests move through the chain"
                        icon={GaugeCircle}
                    >
                        {pipeline.avg_days_to_final === null ? (
                            <div className="text-xs text-gray-400 py-5 text-center">
                                Not enough completed requests yet.
                            </div>
                        ) : (
                            <>
                                <div className="text-center py-1">
                                    <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">
                                        {pipeline.avg_days_to_final}
                                    </div>
                                    <div className="text-[11px] text-gray-500 mt-0.5">
                                        avg days · submission → final approval
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500 text-center">
                                    Based on {pipeline.sample_size} completed request{pipeline.sample_size > 1 ? 's' : ''} this year.
                                </div>
                            </>
                        )}
                    </Section>
                </div>
            </div>

            {/* ---------- 4. Department Comparison ---------- */}
            <div className="mb-4 sm:mb-5">
                <Section
                    title="Department Comparison"
                    subtitle="Requests per employee (YTD) — normalizes for department size"
                    icon={Building2}
                >
                    {departmentComparison.length === 0 ? (
                        <div className="text-center py-6 text-xs text-gray-400">No department data yet.</div>
                    ) : (
                        <div className="space-y-3">
                            {departmentComparison.map((d) => {
                                const pct = (d.per_capita / maxPerCapita) * 100;
                                return (
                                    <div key={d.name} className="space-y-1">
                                        {/* Top: name + per_capita + pending chip */}
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs sm:text-sm font-medium text-gray-700 truncate min-w-0" title={d.name}>
                                                {d.name}
                                            </span>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                {d.pending > 0 && (
                                                    <span className="text-[9px] font-semibold uppercase tracking-wide bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full">
                                                        {d.pending} pending
                                                    </span>
                                                )}
                                                <span className="text-xs sm:text-sm font-semibold text-gray-900 tabular-nums">
                                                    {d.per_capita.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Bar */}
                                        <div className="h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{ width: `${pct}%`, backgroundColor: RED }}
                                            />
                                        </div>

                                        {/* Meta line */}
                                        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-gray-500">
                                            <span>{d.headcount} employee{d.headcount === 1 ? '' : 's'}</span>
                                            <span className="tabular-nums">{d.requests} total request{d.requests === 1 ? '' : 's'}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Section>
            </div>

            {/* ---------- 5. Trend + Leave Type Mix ---------- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="lg:col-span-2">
                    <Section
                        title="Leave Trend"
                        subtitle={`${yoy.this_year} requests YTD ${yoy.delta_pct !== null ? `(${yoy.delta_pct >= 0 ? '▲' : '▼'} ${Math.abs(yoy.delta_pct)}% vs same period last year)` : ''}`}
                        icon={TrendingUp}
                    >
                        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto">
                            {[0, 0.25, 0.5, 0.75, 1].map((r) => (
                                <line
                                    key={r}
                                    x1={pad.left}
                                    y1={pad.top + iH * (1 - r)}
                                    x2={chartW - pad.right}
                                    y2={pad.top + iH * (1 - r)}
                                    stroke="#E5E7EB"
                                    strokeWidth="0.5"
                                />
                            ))}
                            <polygon
                                points={`${pad.left},${chartH - pad.bottom} ${points} ${chartW - pad.right},${chartH - pad.bottom}`}
                                fill="#FEF2F2"
                                opacity="0.7"
                            />
                            <polyline
                                points={points}
                                fill="none"
                                stroke="#DC2626"
                                strokeWidth="2"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                            {trend.map((t, i) => {
                                const x = pad.left + (i / (trend.length - 1)) * iW;
                                return (
                                    <text key={t.label} x={x} y={chartH - 6} textAnchor="middle" fontSize="10" fill="#94A3B8">
                                        {t.label}
                                    </text>
                                );
                            })}
                        </svg>
                    </Section>
                </div>

                <div className="lg:col-span-1">
                    <Section title="Leave Type Mix" subtitle="YTD usage" icon={FileText}>
                        {topLeaveTypes.length === 0 || topLeaveTypes.every(t => t.count === 0) ? (
                            <div className="text-xs text-gray-400 py-5 text-center">No leave usage recorded.</div>
                        ) : (
                            <div className="space-y-2.5">
                                {topLeaveTypes.map((t) => (
                                    <div key={t.name}>
                                        <div className="flex items-center justify-between text-xs mb-0.5 gap-2">
                                            <span className="text-gray-700 truncate min-w-0" title={t.name}>{t.name}</span>
                                            <span className="font-semibold text-gray-900 tabular-nums flex-shrink-0">{t.count}</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${(t.count / maxLeaveType) * 100}%`, backgroundColor: RED }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Section>
                </div>
            </div>

            {/* ---------- 6. Liability Snapshot ---------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-4">
                    <div className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-wide font-medium">
                        <Wallet className="w-3.5 h-3.5" /> Accrued Leave Balance
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-xl sm:text-2xl font-bold text-gray-900 tabular-nums">
                            {Number(liability.total_balance_days).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-xs text-gray-500">days total</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">
                        Total unused credits — a proxy for future payout liability.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-4">
                    <div className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-wide font-medium">
                        <FileText className="w-3.5 h-3.5" /> Monetization Requests
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-xl sm:text-2xl font-bold text-gray-900 tabular-nums">
                            {liability.monetization_requests_ytd}
                        </span>
                        <span className="text-xs text-gray-500">this year</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">
                        Leave credits converted to cash — direct budget impact.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-4 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-wide font-medium">
                        <UserCheck className="w-3.5 h-3.5" /> Separations
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-xl sm:text-2xl font-bold text-gray-900 tabular-nums">
                            {liability.separations_ytd}
                        </span>
                        <span className="text-xs text-gray-500">this year</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">
                        Final accruals paid out on separations.
                    </p>
                </div>
            </div>
        </MayorLayout>
    );
}