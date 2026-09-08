import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ leaveRequests, filters, leaveTypes }) {
    const { data, setData, get, processing } = useForm({
        status: filters.status || '',
        search: filters.search || '',
        leave_type: filters.leave_type || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
    });

    const [showFilters, setShowFilters] = useState(false);
    const [expandedDates, setExpandedDates] = useState({});

    const NAVY = '#0F2A52';
    const NAVY_LIGHT = '#f0f4f8';
    const GOLD = '#ffbf00';

    const filter = () => {
        get(route('hrmo.leave-requests.index'), data, { preserveState: true });
    };

    const resetFilters = () => {
        setData({ status: '', search: '', leave_type: '', date_from: '', date_to: '' });
        get(route('hrmo.leave-requests.index'), { status: '', search: '', leave_type: '', date_from: '', date_to: '' }, { preserveState: true });
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // --- Group dates by month with "see more" toggle ---
    const renderDates = (req) => {
        let dateArray = [];
        if (req.dates && req.dates.length > 0) {
            dateArray = req.dates.map(d => new Date(d.leave_date));
        } else if (req.start_date && req.end_date) {
            return <span className="text-sm text-gray-600">{formatDate(req.start_date)} – {formatDate(req.end_date)}</span>;
        } else {
            return <span className="text-sm text-gray-400">—</span>;
        }

        const groups = {};
        dateArray.forEach(date => {
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            if (!groups[key]) {
                groups[key] = { monthName, days: [] };
            }
            groups[key].days.push(date.getDate());
        });

        const sortedGroups = Object.keys(groups)
            .sort((a, b) => a.localeCompare(b))
            .map(key => groups[key]);

        const totalDates = dateArray.length;
        const isExpanded = expandedDates[req.id] || false;
        const maxVisible = 3;

        const flatEntries = [];
        sortedGroups.forEach(group => {
            const sortedDays = group.days.sort((a, b) => a - b);
            flatEntries.push({ type: 'month', label: group.monthName });
            sortedDays.forEach(day => {
                flatEntries.push({ type: 'day', day });
            });
        });

        let visibleEntries = flatEntries;
        let hasMore = false;
        if (!isExpanded && flatEntries.length > maxVisible * 2) {
            let count = 0;
            visibleEntries = [];
            for (const entry of flatEntries) {
                if (entry.type === 'month') {
                    visibleEntries.push(entry);
                    continue;
                }
                if (count < maxVisible) {
                    visibleEntries.push(entry);
                    count++;
                } else {
                    hasMore = true;
                    break;
                }
            }
        }

        const toggleExpand = () => {
            setExpandedDates(prev => ({
                ...prev,
                [req.id]: !prev[req.id]
            }));
        };

        let jsx = [];
        let currentMonth = null;
        let dayBoxes = [];
        visibleEntries.forEach((entry, idx) => {
            if (entry.type === 'month') {
                if (dayBoxes.length > 0) {
                    jsx.push(
                        <div key={`${req.id}-month-${currentMonth}`} className="flex flex-wrap gap-1 mt-0.5">
                            {dayBoxes}
                        </div>
                    );
                    dayBoxes = [];
                }
                currentMonth = entry.label;
                jsx.push(
                    <div key={`${req.id}-label-${idx}`} className="text-xs font-medium text-gray-500 mt-0.5 first:mt-0">
                        {entry.label}
                    </div>
                );
            } else {
                dayBoxes.push(
                    <div
                        key={`${req.id}-day-${entry.day}`}
                        className="flex items-center justify-center min-w-[28px] h-7 px-1.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-700"
                    >
                        {entry.day}
                    </div>
                );
            }
        });
        if (dayBoxes.length > 0) {
            jsx.push(
                <div key={`${req.id}-month-${currentMonth}-last`} className="flex flex-wrap gap-1 mt-0.5">
                    {dayBoxes}
                </div>
            );
        }

        return (
            <div className="flex flex-col">
                {jsx}
                {hasMore && (
                    <button
                        onClick={toggleExpand}
                        className="text-xs text-[#ffbf00] hover:underline mt-0.5 self-start font-medium"
                    >
                        {isExpanded ? 'Show less' : `+${flatEntries.filter(e => e.type === 'day').length - maxVisible} more`}
                    </button>
                )}
            </div>
        );
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            certified: 'bg-blue-100 text-blue-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
            department_approved: 'bg-purple-100 text-purple-800',
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const getRescheduleBadge = (reschedule) => {
        if (!reschedule) return null;
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            certified: 'bg-blue-100 text-blue-800',
        };
        const labels = {
            pending: 'Reschedule Pending',
            certified: 'Reschedule Certified',
        };
        return (
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${styles[reschedule.status]}`}>
                {labels[reschedule.status] || reschedule.status}
            </span>
        );
    };

    // --- Helper: Special request badge (Monetization / Terminal Leave) ---
    const getSpecialRequestBadge = (req) => {
        if (req.request_type === 'monetization') {
            return {
                label: 'Monetization',
                color: 'bg-amber-100 text-amber-800 border-amber-300',
                icon: (
                    <svg className="size-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            };
        }
        if (req.request_type === 'terminal_leave') {
            return {
                label: 'Terminal Leave',
                color: 'bg-purple-100 text-purple-800 border-purple-300',
                icon: (
                    <svg className="size-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                ),
            };
        }
        return null;
    };

    // --- Helper: Format days without trailing zeros ---
    const formatDays = (days) => {
        const num = Number(days);
        if (isNaN(num)) return '0';
        if (Number.isInteger(num)) return num.toString();
        return parseFloat(num.toFixed(2)).toString();
    };

    // --- Helper: Days display for special requests (optional, but keeps consistency) ---
    const getDaysDisplay = (req) => {
        let days = req.number_of_days;
        if (req.request_type === 'monetization') {
            days = req.monetized_days || 0;
            return `${formatDays(days)}`;
        }
        return formatDays(days);
    };

    return (
        <HRMOLayout>
            <Head title="Leave Requests" />
            <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold" style={{ color: NAVY }}>Leave Requests</h2>
                        <p className="text-sm text-gray-500">Manage all employee leave requests</p>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium"
                        style={{ backgroundColor: NAVY_LIGHT, color: NAVY }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = NAVY_LIGHT}
                    >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="rounded-xl p-4 border" style={{ backgroundColor: '#f9fafb', borderColor: 'rgba(15,42,82,0.08)' }}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: NAVY }}>Status</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: 'white' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="certified">Certified</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: NAVY }}>Search Employee</label>
                                <input
                                    type="text"
                                    placeholder="Name or Email..."
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: 'white' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: NAVY }}>Leave Type</label>
                                <select
                                    value={data.leave_type}
                                    onChange={(e) => setData('leave_type', e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: 'white' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                >
                                    <option value="">All Types</option>
                                    {leaveTypes.map((type) => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: NAVY }}>Date From</label>
                                <input
                                    type="date"
                                    value={data.date_from}
                                    onChange={(e) => setData('date_from', e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: 'white' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: NAVY }}>Date To</label>
                                <input
                                    type="date"
                                    value={data.date_to}
                                    onChange={(e) => setData('date_to', e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: 'white' }}
                                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                            <button
                                onClick={filter}
                                disabled={processing}
                                className="px-4 py-2 text-white rounded-lg transition text-sm font-medium disabled:opacity-50"
                                style={{ backgroundColor: GOLD }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e6ac00'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = GOLD}
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 rounded-lg transition text-sm font-medium"
                                style={{ backgroundColor: '#e5e7eb', color: NAVY }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700">
                            <thead style={{ backgroundColor: NAVY_LIGHT }}>
                                <tr>
                                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Employee</th>
                                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Leave Type</th>
                                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Dates</th>
                                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-center" style={{ color: NAVY }}>Days</th>
                                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Status</th>
                                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Reschedule</th>
                                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Filed</th>
                                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-center" style={{ color: NAVY }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                                {leaveRequests.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-8 text-center text-gray-500 text-sm">
                                            No leave requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    leaveRequests.data.map((req) => {
                                        const specialBadge = getSpecialRequestBadge(req);
                                        return (
                                            <tr key={req.id} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{req.employee?.full_name}</p>
                                                        <p className="text-xs text-gray-500">{req.employee?.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-gray-700">{req.leave_type?.name || '—'}</span>
                                                        {specialBadge && (
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${specialBadge.color}`}>
                                                                {specialBadge.icon}
                                                                {specialBadge.label}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 max-w-[180px]">
                                                    {renderDates(req)}
                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-700">
                                                    {getDaysDisplay(req)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(req.status)}`}>
                                                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getRescheduleBadge(req.active_reschedule) || (
                                                        <span className="text-gray-400 text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(req.date_filed)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <Link
                                                        href={route('hrmo.leave-requests.show', req.id)}
                                                        className="text-[#ffbf00] hover:underline font-medium text-sm"
                                                    >
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {leaveRequests.links && (
                        <div className="px-4 py-3 border-t flex flex-wrap justify-between items-center gap-2" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                            <p className="text-sm text-gray-500">
                                Showing {leaveRequests.from} to {leaveRequests.to} of {leaveRequests.total}
                            </p>
                            <div className="flex gap-1">
                                {leaveRequests.links.map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={link.url || '#'}
                                        onClick={(e) => {
                                            if (!link.url) return;
                                            e.preventDefault();
                                            get(link.url, data, { preserveState: true });
                                        }}
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
            </div>
        </HRMOLayout>
    );
}
