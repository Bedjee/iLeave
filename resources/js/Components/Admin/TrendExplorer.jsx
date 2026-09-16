import { useMemo, useState } from 'react';
import {
    Filter,
    Calendar,
    TrendingUp,
    Award,
    BarChart3,
    ChevronDown,
    LineChart as LineChartIcon,
} from 'lucide-react';

const NAVY = '#0F2A52';
const GOLD = '#ffbf00';

const STATUS_COLORS = {
    approved: '#10B981',
    pending:  '#F59E0B',
    rejected: '#EF4444',
    total:    NAVY,
};

// ---------- Summary stat card ----------
function StatCard({ icon: Icon, label, value, sub, accent = NAVY }) {
    return (
        <div
            className="rounded-lg border bg-white p-3"
            style={{ borderColor: 'rgba(15,42,82,0.08)' }}
        >
            <div className="flex items-center gap-2 mb-1.5">
                <div
                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${accent}15`, color: accent }}
                >
                    <Icon className="w-3 h-3" />
                </div>
                <span className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold truncate">
                    {label}
                </span>
            </div>
            <div className="text-lg font-bold tabular-nums leading-tight" style={{ color: accent }}>
                {value}
            </div>
            {sub && <div className="text-[10px] text-gray-400 mt-0.5 truncate">{sub}</div>}
        </div>
    );
}

// ---------- SVG line chart ----------
function LineChart({ months, series, maxVal }) {
    const W = 720, H = 220;
    const pad = { top: 16, bottom: 28, left: 32, right: 12 };
    const iW = W - pad.left - pad.right;
    const iH = H - pad.top - pad.bottom;

    const xFor = (i) => pad.left + (i / (months.length - 1)) * iW;
    const yFor = (v) => pad.top + iH - (v / maxVal) * iH;

    // Nice Y-axis tick values
    const ticks = useMemo(() => {
        const step = Math.max(1, Math.ceil(maxVal / 4));
        const out = [];
        for (let v = 0; v <= maxVal; v += step) out.push(v);
        if (out[out.length - 1] !== maxVal) out.push(maxVal);
        return out;
    }, [maxVal]);

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-w-[600px]">
                {/* Y-axis grid + labels */}
                {ticks.map((t) => (
                    <g key={t}>
                        <line
                            x1={pad.left}
                            y1={yFor(t)}
                            x2={W - pad.right}
                            y2={yFor(t)}
                            stroke="#E5E7EB"
                            strokeWidth="0.5"
                        />
                        <text
                            x={pad.left - 6}
                            y={yFor(t) + 3}
                            textAnchor="end"
                            fontSize="9"
                            fill="#94A3B8"
                        >
                            {t}
                        </text>
                    </g>
                ))}

                {/* X-axis labels */}
                {months.map((m, i) => (
                    <text
                        key={m.month}
                        x={xFor(i)}
                        y={H - 8}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#64748B"
                    >
                        {m.label}
                    </text>
                ))}

                {/* Optional area under the first series for visual weight */}
                {series.length === 1 && (
                    <polygon
                        points={[
                            `${xFor(0)},${yFor(0)}`,
                            ...series[0].values.map((v, i) => `${xFor(i)},${yFor(v)}`),
                            `${xFor(months.length - 1)},${yFor(0)}`,
                        ].join(' ')}
                        fill={series[0].color}
                        opacity="0.08"
                    />
                )}

                {/* Lines */}
                {series.map((s) => (
                    <g key={s.key}>
                        <polyline
                            points={s.values.map((v, i) => `${xFor(i)},${yFor(v)}`).join(' ')}
                            fill="none"
                            stroke={s.color}
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                        {/* Point markers */}
                        {s.values.map((v, i) => (
                            <circle
                                key={i}
                                cx={xFor(i)}
                                cy={yFor(v)}
                                r="3"
                                fill="white"
                                stroke={s.color}
                                strokeWidth="2"
                            />
                        ))}
                    </g>
                ))}

                {/* Vertical highlight on the peak month */}
                {(() => {
                    const totals = months.map((m, i) => ({
                        i,
                        total: series.reduce((sum, s) => sum + (s.values[i] || 0), 0),
                    }));
                    const peak = totals.reduce((a, b) => (b.total > a.total ? b : a), totals[0]);
                    if (!peak || peak.total === 0) return null;
                    return (
                        <line
                            x1={xFor(peak.i)}
                            y1={pad.top}
                            x2={xFor(peak.i)}
                            y2={H - pad.bottom}
                            stroke={GOLD}
                            strokeWidth="1"
                            strokeDasharray="3 3"
                            opacity="0.6"
                        />
                    );
                })()}
            </svg>
        </div>
    );
}

// ---------- Main component ----------
export default function TrendExplorer({ trend }) {
    const [year, setYear]           = useState(trend.years[0]);
    const [leaveType, setLeaveType] = useState('all');
    const [status, setStatus]       = useState('all');

    const currentYearData = trend.data_by_year?.[year] ?? {};

    // Convert numeric-keyed object to sorted array of 12 months
    const months = useMemo(() => {
        return Object.values(currentYearData).sort((a, b) => a.month - b.month);
    }, [currentYearData]);

    // Build series based on filters
    const series = useMemo(() => {
        const pick = (m, bucket) => {
            if (leaveType === 'all') return m[bucket] ?? 0;
            const id = String(leaveType);
            return m.by_type_status?.[id]?.[bucket] ?? 0;
        };
        const totalFor = (m) => {
            if (leaveType === 'all') return m.total ?? 0;
            const id = String(leaveType);
            return m.by_type?.[id] ?? 0;
        };

        const approvedLine = {
            key: 'approved',
            label: 'Approved',
            color: STATUS_COLORS.approved,
            values: months.map((m) => pick(m, 'approved')),
        };
        const pendingLine = {
            key: 'pending',
            label: 'Pending',
            color: STATUS_COLORS.pending,
            values: months.map((m) => pick(m, 'pending')),
        };
        const rejectedLine = {
            key: 'rejected',
            label: 'Rejected',
            color: STATUS_COLORS.rejected,
            values: months.map((m) => pick(m, 'rejected')),
        };
        const totalLine = {
            key: 'total',
            label: 'Total',
            color: STATUS_COLORS.total,
            values: months.map((m) => totalFor(m)),
        };

        if (status === 'all' && leaveType === 'all') {
            // Show 3 status lines for the aggregated view
            return [approvedLine, pendingLine, rejectedLine];
        }
        if (status === 'all') {
            // Specific leave type, all statuses → show 3 lines scoped to that type
            return [approvedLine, pendingLine, rejectedLine];
        }
        if (status === 'total') return [totalLine];
        if (status === 'approved') return [approvedLine];
        if (status === 'pending') return [pendingLine];
        if (status === 'rejected') return [rejectedLine];
        return [totalLine];
    }, [months, leaveType, status]);

    const maxVal = Math.max(1, ...series.flatMap((s) => s.values));

    // Summary stats
    const summary = useMemo(() => {
        const getTotal = (m) => {
            if (leaveType === 'all') return m.total ?? 0;
            const id = String(leaveType);
            return m.by_type?.[id] ?? 0;
        };

        const totals = months.map((m) => ({ month: m, total: getTotal(m) }));
        const peak = totals.reduce((a, b) => (b.total > a.total ? b : a), totals[0] || { month: null, total: 0 });
        const yearTotal = totals.reduce((sum, t) => sum + t.total, 0);
        const avg = months.length > 0 ? yearTotal / months.length : 0;

        // Top leave type for the selected year
        let topType = null;
        if (leaveType === 'all') {
            const typeTotals = new Map();
            months.forEach((m) => {
                Object.entries(m.by_type || {}).forEach(([id, count]) => {
                    typeTotals.set(id, (typeTotals.get(id) || 0) + count);
                });
            });
            let max = 0;
            for (const [id, count] of typeTotals.entries()) {
                if (count > max) {
                    max = count;
                    topType = trend.leave_types.find((lt) => String(lt.id) === id) || null;
                }
            }
            if (topType) topType = { ...topType, count: max };
        }

        return {
            peak,
            yearTotal,
            avg: Math.round(avg * 10) / 10,
            topType,
        };
    }, [months, leaveType, trend.leave_types]);

    const activeLeaveTypeName =
        leaveType === 'all'
            ? 'All leave types'
            : trend.leave_types.find((lt) => String(lt.id) === String(leaveType))?.name ?? 'Unknown';

    const yearLabel = `${year} — ${activeLeaveTypeName}`;

    return (
        <div
            className="bg-white rounded-lg shadow-sm border p-4"
            style={{ borderColor: 'rgba(15,42,82,0.08)' }}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: NAVY }}>
                        <LineChartIcon className="w-4 h-4" style={{ color: GOLD }} />
                        Leave Trend Explorer
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                        {yearLabel}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <Filter className="w-3.5 h-3.5" />
                    <span className="font-medium">Filters</span>
                </div>

                {/* Year */}
                <div className="relative">
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="appearance-none pl-3 pr-8 py-1.5 text-xs rounded-lg border focus:outline-none transition font-medium"
                        style={{
                            borderColor: 'rgba(15,42,82,0.12)',
                            color: NAVY,
                            backgroundColor: 'white',
                        }}
                    >
                        {trend.years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <ChevronDown
                        className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                    />
                </div>

                {/* Leave type */}
                <div className="relative">
                    <select
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-1.5 text-xs rounded-lg border focus:outline-none transition font-medium max-w-[220px]"
                        style={{
                            borderColor: 'rgba(15,42,82,0.12)',
                            color: NAVY,
                            backgroundColor: 'white',
                        }}
                    >
                        <option value="all">All leave types</option>
                        {trend.leave_types.map((lt) => (
                            <option key={lt.id} value={lt.id}>{lt.name}</option>
                        ))}
                    </select>
                    <ChevronDown
                        className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                    />
                </div>

                {/* Status */}
                <div className="relative">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-1.5 text-xs rounded-lg border focus:outline-none transition font-medium"
                        style={{
                            borderColor: 'rgba(15,42,82,0.12)',
                            color: NAVY,
                            backgroundColor: 'white',
                        }}
                    >
                        <option value="all">All statuses</option>
                        <option value="total">Total only</option>
                        <option value="approved">Approved only</option>
                        <option value="pending">Pending only</option>
                        <option value="rejected">Rejected only</option>
                    </select>
                    <ChevronDown
                        className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                    />
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 mb-3 text-[11px]">
                {series.map((s) => (
                    <span key={s.key} className="flex items-center gap-1.5">
                        <span
                            className="w-3 h-0.5 rounded"
                            style={{ backgroundColor: s.color }}
                        />
                        <span className="text-gray-600 font-medium">{s.label}</span>
                    </span>
                ))}
                {summary.peak?.total > 0 && (
                    <span className="ml-auto text-[10px] text-gray-400 italic">
                        Peak month highlighted
                    </span>
                )}
            </div>

            {/* Chart */}
            <LineChart months={months} series={series} maxVal={maxVal} />

            {/* Summary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-4">
                <StatCard
                    icon={Award}
                    label="Peak Month"
                    value={summary.peak?.total > 0 ? summary.peak.month.label : '—'}
                    sub={summary.peak?.total > 0 ? `${summary.peak.total} requests` : 'No data'}
                    accent="#DC2626"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Top Leave Type"
                    value={summary.topType?.code || (leaveType === 'all' ? '—' : activeLeaveTypeName)}
                    sub={
                        summary.topType
                            ? `${summary.topType.name} · ${summary.topType.count} requests`
                            : leaveType !== 'all'
                            ? 'Filtered to selected type'
                            : 'No data'
                    }
                    accent="#7C3AED"
                />
                <StatCard
                    icon={BarChart3}
                    label="Total Requests"
                    value={summary.yearTotal.toLocaleString()}
                    sub={`in ${year}`}
                    accent={NAVY}
                />
                <StatCard
                    icon={Calendar}
                    label="Avg / Month"
                    value={summary.avg}
                    sub="requests per month"
                    accent="#0891B2"
                />
            </div>

            {/* Monthly breakdown table */}
            <details className="mt-4 group">
                <summary className="cursor-pointer text-[11px] font-medium text-gray-500 hover:text-gray-800 transition inline-flex items-center gap-1 select-none">
                    <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                    View month-by-month breakdown
                </summary>
                <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                                <th className="text-left py-1.5 pr-2 text-[10px] uppercase tracking-wide text-gray-500 font-semibold">Month</th>
                                <th className="text-right px-2 py-1.5 text-[10px] uppercase tracking-wide text-gray-500 font-semibold">Total</th>
                                <th className="text-right px-2 py-1.5 text-[10px] uppercase tracking-wide text-emerald-700 font-semibold">Approved</th>
                                <th className="text-right px-2 py-1.5 text-[10px] uppercase tracking-wide text-amber-700 font-semibold">Pending</th>
                                <th className="text-right px-2 py-1.5 text-[10px] uppercase tracking-wide text-red-700 font-semibold">Rejected</th>
                                <th className="text-left px-2 py-1.5 text-[10px] uppercase tracking-wide text-gray-500 font-semibold">Top Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {months.map((m) => {
                                const totals = leaveType === 'all'
                                    ? m.total
                                    : m.by_type?.[String(leaveType)] ?? 0;
                                const approved = leaveType === 'all'
                                    ? m.approved
                                    : m.by_type_status?.[String(leaveType)]?.approved ?? 0;
                                const pending = leaveType === 'all'
                                    ? m.pending
                                    : m.by_type_status?.[String(leaveType)]?.pending ?? 0;
                                const rejected = leaveType === 'all'
                                    ? m.rejected
                                    : m.by_type_status?.[String(leaveType)]?.rejected ?? 0;

                                // Top type per month (only meaningful when leaveType === 'all')
                                let topCode = '—';
                                if (leaveType === 'all') {
                                    let max = 0;
                                    let topId = null;
                                    Object.entries(m.by_type || {}).forEach(([id, count]) => {
                                        if (count > max) { max = count; topId = id; }
                                    });
                                    if (topId) {
                                        topCode = trend.leave_types.find((lt) => String(lt.id) === topId)?.code ?? '—';
                                    }
                                } else {
                                    topCode = trend.leave_types.find((lt) => String(lt.id) === String(leaveType))?.code ?? '—';
                                }

                                return (
                                    <tr key={m.month} className="border-b last:border-0" style={{ borderColor: 'rgba(15,42,82,0.04)' }}>
                                        <td className="py-1.5 pr-2 font-medium text-gray-700">{m.label}</td>
                                        <td className="px-2 py-1.5 text-right tabular-nums text-gray-900 font-semibold">{totals}</td>
                                        <td className="px-2 py-1.5 text-right tabular-nums text-emerald-700">{approved}</td>
                                        <td className="px-2 py-1.5 text-right tabular-nums text-amber-700">{pending}</td>
                                        <td className="px-2 py-1.5 text-right tabular-nums text-red-700">{rejected}</td>
                                        <td className="px-2 py-1.5 text-gray-500 font-mono text-[10px]">{topCode}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </details>
        </div>
    );
}