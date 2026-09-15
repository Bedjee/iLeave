import DepartmentHeadLayout from '@/Layouts/DepartmentHeadLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Users, Clock, CheckCircle, XCircle, Calendar, TrendingUp,
    UserCheck, AlertCircle, ChevronRight, BarChart3, Award,
    CalendarClock, Activity,
} from 'lucide-react';

const NAVY = '#0F2A52';
const GOLD = '#ffbf00';

// ---------- KPI card ----------
function KpiCard({ icon: Icon, label, value, color = NAVY, sub }) {
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
                <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{label}</div>
                <div className="text-xl font-bold tabular-nums" style={{ color: NAVY }}>{value}</div>
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

// ---------- Stacked monthly bar chart (pure CSS) ----------
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
                            <div className="text-[10px] font-semibold text-gray-600 tabular-nums">{total || ''}</div>
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

// ---------- Horizontal bar list ----------
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
                        <span className="text-gray-700 truncate min-w-0" title={item.label}>{item.label}</span>
                        <span className="font-semibold text-gray-900 tabular-nums flex-shrink-0">{item.display ?? item.value}</span>
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
        return <div className="text-xs text-gray-400 py-6 text-center">No leave activity yet this year.</div>;
    }

    const pct = (n) => (n / total) * 100;
    const segments = [
        { key: 'approved', value: status.approved, color: '#10B981', label: 'Approved' },
        { key: 'pending',  value: status.pending,  color: '#F59E0B', label: 'Pending' },
        { key: 'rejected', value: status.rejected, color: '#EF4444', label: 'Rejected' },
    ];

    return (
        <div>
            {/* Stacked bar */}
            <div className="flex w-full h-3 rounded-full overflow-hidden bg-gray-100 mb-4">
                {segments.map((s) => (
                    s.value > 0 && (
                        <div
                            key={s.key}
                            style={{ width: `${pct(s.value)}%`, backgroundColor: s.color }}
                            title={`${s.label}: ${s.value}`}
                        />
                    )
                ))}
            </div>

            {/* Legend */}
            <div className="space-y-2">
                {segments.map((s) => (
                    <div key={s.key} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-gray-600">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                            {s.label}
                        </span>
                        <span className="font-semibold text-gray-900 tabular-nums">
                            {s.value} <span className="text-gray-400 font-normal">({Math.round(pct(s.value))}%)</span>
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

export default function Dashboard({
    stats, pendingApprovals, teamOnLeaveToday, upcomingLeaves,
    monthlyTrend, leaveTypeBreakdown, statusBreakdown, topLeaveUsers,
    approvalRate, avgDaysToApprove, employee, department,
}) {
    const [processing, setProcessing] = useState(null);

    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';

    const handleAction = (id, action) => {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;
        setProcessing(id);
        const routeName = action === 'approve'
            ? 'department-head.leave-requests.approve'
            : 'department-head.leave-requests.reject';
        router.post(route(routeName, id), {}, {
            onSuccess: () => setProcessing(null),
            onError: () => { setProcessing(null); alert('Action failed.'); },
        });
    };

    // Prepare chart data
    const trendData = monthlyTrend || [];
    const leaveTypeItems = (leaveTypeBreakdown || []).slice(0, 6).map(lt => ({
        label: lt.name,
        value: lt.count,
    }));
    const topUserItems = (topLeaveUsers || []).map(u => ({
        label: u.name,
        value: u.days,
        display: `${u.days} day${u.days === 1 ? '' : 's'}`,
    }));

    return (
        <DepartmentHeadLayout>
            <Head title="Department Head Dashboard" />

            <div className="space-y-4">

                {/* ============ Greeting Banner ============ */}
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
                                {greeting}, {employee?.name?.split(' ')[0] || 'Department Head'}
                            </h2>
                            <p className="text-blue-100 mt-0.5 text-xs sm:text-sm max-w-2xl">
                                <span className="font-semibold text-[#ffbf00]">{stats.pendingRequests}</span> pending to review
                                {stats.onLeaveToday > 0 && (
                                    <> · <span className="font-semibold">{stats.onLeaveToday}</span> team member{stats.onLeaveToday === 1 ? '' : 's'} out today</>
                                )}
                                {department && <> · {department}</>}
                            </p>
                        </div>
                        <Link
                            href={route('department-head.leave-requests.index')}
                            className="inline-flex items-center px-3 py-1.5 bg-[#ffbf00] text-[#0F2A52] text-xs font-medium rounded-lg hover:bg-[#e6ac00] transition shadow-sm whitespace-nowrap self-start sm:self-center"
                        >
                            Review Requests
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                    </div>
                </div>

                {/* ============ KPI Cards ============ */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
                    <KpiCard icon={Users}       label="Team Members"     value={stats.teamMembers} />
                    <KpiCard icon={Clock}       label="Pending"          value={stats.pendingRequests} color="#F59E0B" />
                    <KpiCard icon={UserCheck}   label="On Leave Today"   value={stats.onLeaveToday} color="#0891B2" />
                    <KpiCard icon={CheckCircle} label="Approved (Month)" value={stats.approvedThisMonth} color="#10B981" />
                    <KpiCard icon={BarChart3}   label="Requests YTD"     value={stats.totalRequestsYtd} color="#7C3AED" />
                    <KpiCard
                        icon={TrendingUp}
                        label="Approval Rate"
                        value={approvalRate === null ? '—' : `${approvalRate}%`}
                        color={approvalRate === null ? '#94A3B8' : approvalRate >= 80 ? '#10B981' : approvalRate >= 60 ? '#F59E0B' : '#EF4444'}
                        sub={avgDaysToApprove !== null ? `Avg ${avgDaysToApprove}d to approve` : 'Not enough data'}
                    />
                </div>

                {/* ============ Pending Approvals + Team Availability ============ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Pending approvals */}
                    <div className="lg:col-span-2">
                        <Section
                            title="Pending Approvals"
                            subtitle={`${pendingApprovals.length} request${pendingApprovals.length === 1 ? '' : 's'} awaiting your decision`}
                            icon={AlertCircle}
                        >
                            {pendingApprovals.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                                    <p className="text-xs text-gray-500">All clear — nothing to review.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 -mx-1">
                                    {pendingApprovals.map((req) => (
                                        <div key={req.id} className="py-2.5 px-1 flex items-center justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium text-gray-900 truncate" style={{ color: NAVY }}>
                                                    {req.employee}
                                                </p>
                                                <p className="text-[11px] text-gray-500 truncate">
                                                    {req.type} · {req.start} – {req.end} · {req.days} day{req.days === 1 ? '' : 's'}
                                                </p>
                                                {req.filed && (
                                                    <p className="text-[10px] text-gray-400 mt-0.5">Filed {req.filed}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <button
                                                    onClick={() => handleAction(req.id, 'approve')}
                                                    disabled={processing === req.id}
                                                    className="px-2.5 py-1 text-[11px] font-medium text-white bg-emerald-500 rounded-md hover:bg-emerald-600 transition disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.id, 'reject')}
                                                    disabled={processing === req.id}
                                                    className="px-2.5 py-1 text-[11px] font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Section>
                    </div>

                    {/* Team availability */}
                    <div className="lg:col-span-1">
                        <Section
                            title="Team Availability"
                            subtitle={`${teamOnLeaveToday.length} out today`}
                            icon={UserCheck}
                        >
                            {teamOnLeaveToday.length === 0 ? (
                                <div className="text-center py-6">
                                    <CheckCircle className="w-7 h-7 mx-auto text-emerald-400 mb-2" />
                                    <p className="text-xs text-gray-500">Full team available.</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {teamOnLeaveToday.map((r) => (
                                        <div key={r.id} className="flex items-start gap-2">
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5"
                                                style={{ backgroundColor: 'rgba(15,42,82,0.08)', color: NAVY }}
                                            >
                                                {r.name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium text-gray-900 truncate">{r.name}</p>
                                                <p className="text-[10px] text-gray-500 truncate">
                                                    {r.leave_type} · until {r.until}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Section>
                    </div>
                </div>

                {/* ============ Trend + Status ============ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                        <Section
                            title="Leave Trend"
                            subtitle="Last 6 months of department activity"
                            icon={TrendingUp}
                        >
                            <TrendChart data={trendData} />
                        </Section>
                    </div>

                    <div className="lg:col-span-1">
                        <Section
                            title="Status Snapshot"
                            subtitle="Year-to-date breakdown"
                            icon={Activity}
                        >
                            <StatusSnapshot status={statusBreakdown || { pending: 0, approved: 0, rejected: 0 }} />
                        </Section>
                    </div>
                </div>

                {/* ============ Leave Type Mix + Top Users ============ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Section
                        title="Leave Type Mix"
                        subtitle="Most used leave types this year"
                        icon={BarChart3}
                    >
                        <BarList
                            items={leaveTypeItems}
                            color={NAVY}
                            emptyText="No leave usage recorded yet."
                        />
                    </Section>

                    <Section
                        title="Top Leave Users"
                        subtitle="Approved leave days this year"
                        icon={Award}
                    >
                        <BarList
                            items={topUserItems}
                            color={GOLD}
                            emptyText="No approved leaves recorded yet."
                        />
                    </Section>
                </div>

                {/* ============ Upcoming Leaves ============ */}
                <Section
                    title="Upcoming Leaves"
                    subtitle="Starting within the next 14 days"
                    icon={CalendarClock}
                >
                    {upcomingLeaves.length === 0 ? (
                        <div className="text-center py-6">
                            <Calendar className="w-7 h-7 mx-auto text-gray-300 mb-2" />
                            <p className="text-xs text-gray-500">No upcoming leaves scheduled.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {upcomingLeaves.map((r) => (
                                <div
                                    key={r.id}
                                    className="rounded-lg border p-2.5 flex items-start gap-2"
                                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                                >
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: 'rgba(255,191,0,0.15)', color: GOLD }}
                                    >
                                        <Calendar className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-gray-900 truncate">{r.name}</p>
                                        <p className="text-[10px] text-gray-500 truncate">{r.leave_type}</p>
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
        </DepartmentHeadLayout>
    );
}