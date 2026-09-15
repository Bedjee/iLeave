import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Building2, Users, Clock, CalendarDays, UserCheck,
    Filter, TrendingUp, AlertTriangle, ArrowUpDown,
} from 'lucide-react';
import MayorLayout from '@/Layouts/MayorLayout';

const MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
];

// ---------- Small pieces ----------
function StatCard({ icon: Icon, label, value, accent = '#B91C1C' }) {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${accent}15`, color: accent }}
            >
                <Icon className="w-4.5 h-4.5" />
            </div>
            <div className="mt-2.5">
                <div className="text-2xl font-bold text-gray-900 leading-tight">{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
        </div>
    );
}

function ActivityPill({ total, max }) {
    if (max === 0 || total === 0) {
        return (
            <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                No activity
            </span>
        );
    }

    const ratio = total / max;
    let label, cls;
    if (ratio >= 0.66) {
        label = 'High';
        cls   = 'bg-red-50 text-red-700 ring-1 ring-red-100';
    } else if (ratio >= 0.33) {
        label = 'Moderate';
        cls   = 'bg-amber-50 text-amber-700 ring-1 ring-amber-100';
    } else {
        label = 'Low';
        cls   = 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
    }

    return (
        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${cls}`}>
            {label}
        </span>
    );
}

function MiniChip({ children, tone = 'gray' }) {
    const tones = {
        gray:  'bg-gray-100 text-gray-600',
        amber: 'bg-amber-50 text-amber-700',
        green: 'bg-green-50 text-green-700',
        blue:  'bg-blue-50 text-blue-700',
        cyan:  'bg-cyan-50 text-cyan-700',
        red:   'bg-red-50 text-red-700',
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${tones[tone]}`}>
            {children}
        </span>
    );
}

function DepartmentCard({ dept, maxTotal }) {
    const rate = dept.approval_rate ?? 0;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 pb-4 border-b border-gray-50">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 truncate" title={dept.name}>
                            {dept.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate mt-0.5" title={dept.head_name || ''}>
                            {dept.head_name
                                ? <>Head: {dept.head_name}</>
                                : <span className="italic text-gray-300">No head assigned</span>}
                        </p>
                    </div>
                    <ActivityPill total={dept.total_requests} max={maxTotal} />
                </div>
            </div>

            {/* Two main stats */}
            <div className="px-5 pt-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-red-50 to-white ring-1 ring-red-100 p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-red-700/70">
                            Total Requests
                        </div>
                        <div className="text-3xl font-extrabold text-[#B91C1C] mt-1 leading-none">
                            {dept.total_requests}
                        </div>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-green-50 to-white ring-1 ring-green-100 p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-green-700/70">
                            Approved
                        </div>
                        <div className="text-3xl font-extrabold text-green-700 mt-1 leading-none">
                            {dept.approved}
                        </div>
                    </div>
                </div>
            </div>

            {/* Approval rate bar */}
            <div className="px-5 pt-4">
                <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-gray-500 font-medium">Approval rate</span>
                    <span className="font-semibold text-gray-700">
                        {dept.approval_rate === null ? '—' : `${dept.approval_rate}%`}
                    </span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${rate}%`, backgroundColor: '#10B981' }}
                    />
                </div>
            </div>

            {/* Chips */}
            <div className="px-5 py-4 mt-auto flex flex-wrap gap-1.5">
                <MiniChip tone="blue">
                    <Users className="w-3 h-3" /> {dept.employees_count} employees
                </MiniChip>
                {dept.pending > 0 && (
                    <MiniChip tone="amber">
                        <Clock className="w-3 h-3" /> {dept.pending} pending
                    </MiniChip>
                )}
                {dept.on_leave_today > 0 && (
                    <MiniChip tone="cyan">
                        <UserCheck className="w-3 h-3" /> {dept.on_leave_today} on leave today
                    </MiniChip>
                )}
                {dept.rejected > 0 && (
                    <MiniChip tone="red">
                        {dept.rejected} rejected
                    </MiniChip>
                )}
                <MiniChip tone="gray">
                    {dept.this_month} filed this month
                </MiniChip>
            </div>
        </div>
    );
}

// ---------- Page ----------
export default function DepartmentOverview({ stats, departments, trend, filters }) {
    const [year, setYear] = useState(filters.year);
    const [month, setMonth] = useState(filters.month);
    const [sortBy, setSortBy] = useState('total'); // 'total' | 'approved' | 'pending'

    const applyFilters = () => {
        router.get(
            route('mayor.department-overview.index'),
            { year, month },
            { preserveState: true, preserveScroll: true }
        );
    };

    const maxTotal = Math.max(1, ...departments.map(d => d.total_requests));

    const sorted = [...departments].sort((a, b) => {
        if (sortBy === 'approved') return b.approved - a.approved;
        if (sortBy === 'pending')  return b.pending - a.pending;
        return b.total_requests - a.total_requests;
    });

    const highActivity = departments.filter(d => d.total_requests / maxTotal >= 0.66 && d.total_requests > 0);

    return (
        <>
            <Head title="Department Overview" />

            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-[#B91C1C]" />
                        Department Overview
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Leave activity across all {stats.total_departments} departments in the Municipality of Opol.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-2 shadow-sm">
                    <Filter className="w-4 h-4 text-gray-400 ml-1" />
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="text-sm bg-transparent border-0 focus:ring-0 py-1 pr-6 cursor-pointer"
                    >
                        {MONTHS.map((m, i) => (
                            <option key={i + 1} value={i + 1}>{m}</option>
                        ))}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="text-sm bg-transparent border-0 focus:ring-0 py-1 pr-6 cursor-pointer"
                    >
                        {[year - 1, year, year + 1].map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <button
                        onClick={applyFilters}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-white transition hover:opacity-90"
                        style={{ backgroundColor: '#B91C1C' }}
                    >
                        Apply
                    </button>
                </div>
            </div>

            {/* Global stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
                <StatCard icon={Building2}    label="Departments"      value={stats.total_departments} />
                <StatCard icon={Users}        label="Active Employees" value={stats.total_employees} accent="#2563EB" />
                <StatCard icon={Clock}        label="Pending Requests" value={stats.pending_requests} accent="#F59E0B" />
                <StatCard icon={CalendarDays} label="Filed This Month" value={stats.requests_this_month} accent="#7C3AED" />
                <StatCard icon={UserCheck}    label="On Leave Today"   value={stats.on_leave_today} accent="#0891B2" />
            </div>

            {/* Attention banner */}
            {highActivity.length > 0 && (
                <div
                    className="mb-6 rounded-2xl border p-4 flex items-start gap-3"
                    style={{ backgroundColor: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.3)' }}
                >
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <div className="font-semibold text-amber-900">
                            High leave activity in {highActivity.length} department{highActivity.length > 1 ? 's' : ''}
                        </div>
                        <div className="text-amber-800 mt-0.5">
                            {highActivity.map(d => d.name).join(', ')} — consider reviewing workload distribution.
                        </div>
                    </div>
                </div>
            )}

            {/* Sort bar + legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Activity level:</span>
                    <span className="inline-flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> High
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Low
                    </span>
                </div>

                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-1.5 shadow-sm">
                    <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">Sort by</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-xs bg-transparent border-0 focus:ring-0 py-0.5 pr-6 cursor-pointer font-medium text-gray-700"
                    >
                        <option value="total">Total requests</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            {/* Department cards */}
            {sorted.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                    No departments found.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                    {sorted.map((d) => (
                        <DepartmentCard key={d.id} dept={d} maxTotal={maxTotal} />
                    ))}
                </div>
            )}

            {/* Trend footer */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            LGU-wide Leave Trend
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">Last 6 months across all departments</p>
                    </div>
                </div>
                <TrendBars data={trend} />
            </div>
        </>
    );
}

function TrendBars({ data }) {
    const max = Math.max(1, ...data.map(d => d.approved + d.rejected + d.pending));
    const colors = { approved: '#16A34A', rejected: '#DC2626', pending: '#F59E0B' };

    return (
        <div>
            <div className="flex items-end justify-between gap-3 h-40">
                {data.map((d, i) => {
                    const total = d.approved + d.rejected + d.pending;
                    const h = (total / max) * 100;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div className="text-xs font-semibold text-gray-700">{total || ''}</div>
                            <div className="w-full flex flex-col justify-end h-24 rounded-lg overflow-hidden bg-gray-100">
                                <div className="w-full flex flex-col justify-end" style={{ height: `${h}%` }}>
                                    {d.pending > 0 && (
                                        <div style={{ backgroundColor: colors.pending, height: `${(d.pending / total) * 100}%` }} />
                                    )}
                                    {d.rejected > 0 && (
                                        <div style={{ backgroundColor: colors.rejected, height: `${(d.rejected / total) * 100}%` }} />
                                    )}
                                    {d.approved > 0 && (
                                        <div style={{ backgroundColor: colors.approved, height: `${(d.approved / total) * 100}%` }} />
                                    )}
                                </div>
                            </div>
                            <div className="text-xs text-gray-500">{d.label}</div>
                        </div>
                    );
                })}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs">
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: colors.approved }} /> Approved
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: colors.rejected }} /> Rejected
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: colors.pending }} /> Pending
                </span>
            </div>
        </div>
    );
}

DepartmentOverview.layout = (page) => <MayorLayout>{page}</MayorLayout>;