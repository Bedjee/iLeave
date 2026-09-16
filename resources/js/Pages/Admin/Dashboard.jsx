import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Users, Clock, Building2, Calendar, CheckCircle,
    TrendingUp, UserCheck, AlertCircle, ChevronRight, Activity,
    BarChart3, CalendarClock, GaugeCircle, Award,
} from 'lucide-react';
import TrendExplorer from '@/Components/Admin/TrendExplorer';

const NAVY = '#0F2A52';
const GOLD = '#ffbf00';

// ---------- KPI card ----------
function KpiCard({ icon: Icon, label, value, color = NAVY, sub, accent }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <div className="flex items-start justify-between gap-2">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${color}15`, color }}
                >
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            <div className="mt-2">
                <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                    {label}
                </div>
                <div className="text-xl font-bold tabular-nums" style={{ color: accent || NAVY }}>
                    {value}
                </div>
                {sub && <div className="text-[10px] text-gray-400 mt-0.5 truncate">{sub}</div>}
            </div>
        </div>
    );
}

// ---------- Section wrapper ----------
function Section({ title, subtitle, icon: Icon, children, action }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: NAVY }}>
                        {Icon && <Icon className="w-4 h-4 flex-shrink-0" style={{ color: GOLD }} />}
                        <span className="truncate">{title}</span>
                    </h3>
                    {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

// ---------- Trend chart ----------
function TrendChart({ data }) {
    const max = Math.max(1, ...data.map(d => d.approved + d.pending + d.rejected));
    const colors = { approved: '#10B981', pending: '#F59E0B', rejected: '#EF4444' };

    return (
        <div>
            <div className="flex items-end justify-between gap-2 h-40">
                {data.map((d, i) => {
                    const total = d.approved + d.pending + d.rejected;
                    const h = (total / max) * 100;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                            <div className="text-[10px] font-semibold text-gray-600 tabular-nums">
                                {total || ''}
                            </div>
                            <div className="w-full flex flex-col justify-end h-28 rounded-md overflow-hidden bg-gray-50">
                                <div className="w-full flex flex-col justify-end" style={{ height: `${h}%` }}>
                                    {d.rejected > 0 && (
                                        <div style={{ backgroundColor: colors.rejected, height: `${(d.rejected / total) * 100}%` }} />
                                    )}
                                    {d.pending > 0 && (
                                        <div style={{ backgroundColor: colors.pending, height: `${(d.pending / total) * 100}%` }} />
                                    )}
                                    {d.approved > 0 && (
                                        <div style={{ backgroundColor: colors.approved, height: `${(d.approved / total) * 100}%` }} />
                                    )}
                                </div>
                            </div>
                            <div className="text-[10px] text-gray-500">{d.label}</div>
                        </div>
                    );
                })}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px]">
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: colors.approved }} /> Approved
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: colors.pending }} /> Pending
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: colors.rejected }} /> Rejected
                </span>
            </div>
        </div>
    );
}

// ---------- Bar list ----------
function BarList({ items, color = NAVY, emptyText = 'No data yet.' }) {
    if (!items || items.length === 0) {
        return <div className="text-xs text-gray-400 py-4 text-center">{emptyText}</div>;
    }
    const max = Math.max(1, ...items.map(i => i.value));

    return (
        <div className="space-y-2.5">
            {items.map((item, idx) => (
                <div key={idx}>
                    <div className="flex items-center justify-between text-xs mb-1 gap-2">
                        <span className="text-gray-700 truncate min-w-0" title={item.label}>
                            {item.label}
                        </span>
                        <span className="font-semibold text-gray-900 tabular-nums flex-shrink-0">
                            {item.display ?? item.value}
                        </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${(item.value / max) * 100}%`, backgroundColor: color }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ---------- Status snapshot ----------
function StatusSnapshot({ status }) {
    const total = status.pending + status.approved + status.rejected;
    if (total === 0) {
        return <div className="text-xs text-gray-400 py-6 text-center">No activity yet this year.</div>;
    }

    const pct = (n) => (n / total) * 100;
    const segments = [
        { key: 'approved', value: status.approved, color: '#10B981', label: 'Approved' },
        { key: 'pending',  value: status.pending,  color: '#F59E0B', label: 'Pending' },
        { key: 'rejected', value: status.rejected, color: '#EF4444', label: 'Rejected' },
    ];

    return (
        <div>
            <div className="flex w-full h-3 rounded-full overflow-hidden bg-gray-100 mb-4">
                {segments.map((s) =>
                    s.value > 0 ? (
                        <div
                            key={s.key}
                            style={{ width: `${pct(s.value)}%`, backgroundColor: s.color }}
                            title={`${s.label}: ${s.value}`}
                        />
                    ) : null
                )}
            </div>

            <div className="space-y-2">
                {segments.map((s) => (
                    <div key={s.key} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-gray-600">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                            {s.label}
                        </span>
                        <span className="font-semibold text-gray-900 tabular-nums">
                            {s.value}{' '}
                            <span className="text-gray-400 font-normal">
                                ({Math.round(pct(s.value))}%)
                            </span>
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500 text-center">
                {total} total request{total === 1 ? '' : 's'} this year
            </div>
        </div>
    );
}

// ---------- Status pill ----------
function StatusPill({ status, label }) {
    const map = {
        department_approved: 'bg-yellow-50 text-yellow-700',
        certified:           'bg-blue-50 text-blue-700',
        pending:             'bg-gray-100 text-gray-600',
        approved:            'bg-emerald-50 text-emerald-700',
        rejected:            'bg-red-50 text-red-700',
        cancelled:           'bg-gray-200 text-gray-600',
    };
    return (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>
            {label}
        </span>
    );
}

export default function Dashboard({
    stats,
    aging,
    monthlyTrend = [],
    departmentComparison = [],
    leaveTypeMix = [],
    statusBreakdown = { pending: 0, approved: 0, rejected: 0 },
    upcomingLeaves = [],
    avgDaysToFinal,
    recentActivity = [],
    trend,
}) {
    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const totalPendingInQueue = aging.under_3 + aging.three_to_seven + aging.over_seven;
    const maxPerCapita = Math.max(1, ...departmentComparison.map((d) => d.per_capita));

    const leaveTypeItems = leaveTypeMix.map((lt) => ({ label: lt.name, value: lt.count }));

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="space-y-4">

                {/* ============ Greeting banner ============ */}
                <div
                    className="relative overflow-hidden rounded-xl shadow-sm p-4 sm:p-5"
                    style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a3a6a 100%)` }}
                >
                    <div className="absolute top-0 right-0 opacity-10">
                        <svg className="size-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                                {greeting}, Admin
                            </h2>
                            <p className="text-blue-100 mt-0.5 text-xs sm:text-sm max-w-2xl">
                                <span className="font-semibold text-[#ffbf00]">{stats.pendingAdminApprovals}</span> request
                                {stats.pendingAdminApprovals === 1 ? '' : 's'} awaiting your final approval
                                {stats.onLeaveToday > 0 && (
                                    <> · <span className="font-semibold">{stats.onLeaveToday}</span> out today</>
                                )}
                            </p>
                        </div>
                        <Link
                            href={route('admin.leave-requests.index')}
                            className="inline-flex items-center px-3 py-1.5 bg-[#ffbf00] text-[#0F2A52] text-xs font-medium rounded-lg hover:bg-[#e6ac00] transition shadow-sm whitespace-nowrap self-start sm:self-center"
                        >
                            Review Queue
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                    </div>
                </div>

                {/* ============ KPI Cards ============ */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
                    <KpiCard
                        icon={Clock}
                        label="Pending My Action"
                        value={stats.pendingAdminApprovals}
                        color="#F59E0B"
                        sub={totalPendingInQueue > 0 ? `${totalPendingInQueue} total in pipeline` : 'All clear'}
                    />
                    <KpiCard
                        icon={CheckCircle}
                        label="Approved YTD"
                        value={stats.approvedYtd}
                        color="#10B981"
                    />
                    <KpiCard
                        icon={TrendingUp}
                        label="Approval Rate"
                        value={stats.approvalRate === null ? '—' : `${stats.approvalRate}%`}
                        color={
                            stats.approvalRate === null ? '#94A3B8'
                            : stats.approvalRate >= 80 ? '#10B981'
                            : stats.approvalRate >= 60 ? '#F59E0B'
                            : '#EF4444'
                        }
                        sub={avgDaysToFinal !== null ? `Avg ${avgDaysToFinal}d to final` : 'Not enough data'}
                    />
                    <KpiCard
                        icon={UserCheck}
                        label="On Leave Today"
                        value={stats.onLeaveToday}
                        color="#0891B2"
                    />
                    <KpiCard
                        icon={Users}
                        label="Employees"
                        value={stats.totalEmployees}
                        color="#3B82F6"
                    />
                    <KpiCard
                        icon={BarChart3}
                        label="Leave Days YTD"
                        value={Number(stats.daysUsedYtd).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        color="#7C3AED"
                        sub={`across ${stats.departments} departments`}
                    />
                </div>

                {/* ============ Attention banner ============ */}
                {totalPendingInQueue > 0 && (
                    <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg p-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-start gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-[#DC2626] flex items-center justify-center text-white flex-shrink-0">
                                    <AlertCircle className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold text-[#991B1B]">
                                        {totalPendingInQueue} request{totalPendingInQueue === 1 ? '' : 's'} pending across the pipeline
                                    </h3>
                                    <p className="text-xs text-[#991B1B]/80 mt-0.5">
                                        <span className="font-medium">{aging.under_3}</span> under 3d ·{' '}
                                        <span className="font-medium">{aging.three_to_seven}</span> 3–7d ·{' '}
                                        <span className={`font-bold ${aging.over_seven > 0 ? 'text-[#7F1D1D]' : ''}`}>
                                            {aging.over_seven} over 7d
                                        </span>
                                        {aging.over_seven > 0 && ' — needs attention'}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={route('admin.leave-requests.index')}
                                className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-3 py-1.5 rounded-md text-xs font-medium transition inline-flex items-center gap-1 flex-shrink-0 self-start sm:self-auto"
                            >
                                Review Now <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* ============ 6-Month Trend + Status ============ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                        <Section
                            title="Leave Activity Trend"
                            subtitle="Last 6 months across the organization"
                            icon={Activity}
                        >
                            <TrendChart data={monthlyTrend} />
                        </Section>
                    </div>
                    <div className="lg:col-span-1">
                        <Section
                            title="Year-to-Date Status"
                            subtitle="Composition of all requests this year"
                            icon={GaugeCircle}
                        >
                            <StatusSnapshot status={statusBreakdown} />
                        </Section>
                    </div>
                </div>

                {/* ============ Interactive Trend Explorer ============ */}
                {trend && <TrendExplorer trend={trend} />}

                {/* ============ Department comparison ============ */}
                <Section
                    title="Department Comparison"
                    subtitle="Requests per employee YTD — normalizes for department size"
                    icon={Building2}
                >
                    {departmentComparison.length === 0 ? (
                        <div className="text-center py-6 text-xs text-gray-400">
                            No department data yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {departmentComparison.map((d) => {
                                const pct = (d.per_capita / maxPerCapita) * 100;
                                return (
                                    <div key={d.name} className="space-y-1">
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
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{ width: `${pct}%`, backgroundColor: NAVY }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-gray-500">
                                            <span>{d.headcount} employee{d.headcount === 1 ? '' : 's'}</span>
                                            <span className="tabular-nums">
                                                {d.requests} total{d.approval_rate !== null && <> · {d.approval_rate}% approved</>}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Section>

                {/* ============ Leave mix + Upcoming ============ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Section title="Leave Type Mix" subtitle="Most filed types this year" icon={BarChart3}>
                        <BarList items={leaveTypeItems} color={NAVY} emptyText="No leave activity recorded yet." />
                    </Section>

                    <Section title="Upcoming Leaves" subtitle="Starting within the next 14 days" icon={CalendarClock}>
                        {upcomingLeaves.length === 0 ? (
                            <div className="text-center py-6">
                                <Calendar className="w-7 h-7 mx-auto text-gray-300 mb-2" />
                                <p className="text-xs text-gray-500">No upcoming leaves scheduled.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {upcomingLeaves.map((r) => (
                                    <div
                                        key={r.id}
                                        className="rounded-lg border p-2.5 flex items-start gap-2"
                                        style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                                    >
                                        <div
                                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: 'rgba(255,191,0,0.15)', color: GOLD }}
                                        >
                                            <Calendar className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-gray-900 truncate">{r.name}</p>
                                            <p className="text-[10px] text-gray-500 truncate">
                                                {r.department} · {r.leave_type}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                                From {r.from} · {r.days} day{r.days === 1 ? '' : 's'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Section>
                </div>

                {/* ============ Recent activity + Quick actions ============ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                        <Section title="Recent Activity" subtitle="Latest updates across all departments" icon={Activity}>
                            {recentActivity.length === 0 ? (
                                <div className="text-center py-8">
                                    <Clock className="w-7 h-7 mx-auto text-gray-300 mb-2" />
                                    <p className="text-xs text-gray-500">No recent activity.</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-100 -mx-1">
                                    {recentActivity.map((item) => (
                                        <li key={item.id} className="py-2.5 px-1 flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-700 truncate" title={item.action}>
                                                    {item.action}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <StatusPill status={item.status_key} label={item.status} />
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                    {item.time}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Section>
                    </div>

                    <div className="lg:col-span-1">
                        <Section title="Quick Actions" icon={Award}>
                            <div className="space-y-1.5">
                                {[
                                    {
                                        label: 'Review Pending Requests',
                                        sub: `${stats.pendingAdminApprovals} awaiting action`,
                                        href: route('admin.leave-requests.index'),
                                    },
                                    {
                                        label: 'Manage Delegations',
                                        sub: 'Assign or revoke approval authority',
                                        href: route('admin.delegations.index'),
                                    },
                                    {
                                        label: 'My Leave Requests',
                                        sub: 'File or track your own leave',
                                        href: route('admin.my-leave-requests.index'),
                                    },
                                    {
                                        label: 'Profile Settings',
                                        sub: 'Manage your account and PIN',
                                        href: route('admin.profile.edit'),
                                    },
                                ].map((action, idx) => (
                                    <Link
                                        key={idx}
                                        href={action.href}
                                        className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-[#ffbf00]/10 transition group"
                                    >
                                        <div className="min-w-0">
                                            <div className="text-xs font-medium text-gray-800 truncate">
                                                {action.label}
                                            </div>
                                            <div className="text-[10px] text-gray-500 truncate">{action.sub}</div>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#ffbf00] transition flex-shrink-0" />
                                    </Link>
                                ))}
                            </div>
                        </Section>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}