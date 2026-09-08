import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ pendingReschedules = [], certifiedReschedules = [] }) {
    const [activeTab, setActiveTab] = useState('pending');
    const [expandedOldDates, setExpandedOldDates] = useState({});
    const [expandedNewDates, setExpandedNewDates] = useState({});

    const NAVY = '#0F2A52';
    const NAVY_LIGHT = '#f0f4f8';
    const GOLD = '#ffbf00';

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // --- Group dates by month with "see more" toggle ---
    const renderDates = (dateArray, requestId, type) => {
        if (!dateArray || dateArray.length === 0) return <span className="text-sm text-gray-400">—</span>;

        const dates = dateArray.map(d => new Date(d));
        const groups = {};
        dates.forEach(date => {
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

        const flatEntries = [];
        sortedGroups.forEach(group => {
            const sortedDays = group.days.sort((a, b) => a - b);
            flatEntries.push({ type: 'month', label: group.monthName });
            sortedDays.forEach(day => {
                flatEntries.push({ type: 'day', day });
            });
        });

        const totalDays = flatEntries.filter(e => e.type === 'day').length;
        const isExpanded = type === 'old'
            ? expandedOldDates[requestId]
            : expandedNewDates[requestId];
        const maxVisible = 3;

        let visibleEntries = flatEntries;
        let hasMore = false;
        if (!isExpanded && totalDays > maxVisible) {
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
            if (type === 'old') {
                setExpandedOldDates(prev => ({
                    ...prev,
                    [requestId]: !prev[requestId]
                }));
            } else {
                setExpandedNewDates(prev => ({
                    ...prev,
                    [requestId]: !prev[requestId]
                }));
            }
        };

        let jsx = [];
        let dayBoxes = [];
        let currentMonth = null;

        visibleEntries.forEach((entry, idx) => {
            if (entry.type === 'month') {
                if (dayBoxes.length > 0) {
                    jsx.push(
                        <div key={`${requestId}-${type}-month-${currentMonth}`} className="flex flex-wrap gap-1 mt-0.5">
                            {dayBoxes}
                        </div>
                    );
                    dayBoxes = [];
                }
                currentMonth = entry.label;
                jsx.push(
                    <div key={`${requestId}-${type}-label-${idx}`} className="text-xs font-medium text-gray-500 mt-0.5 first:mt-0">
                        {entry.label}
                    </div>
                );
            } else {
                dayBoxes.push(
                    <div
                        key={`${requestId}-${type}-day-${entry.day}`}
                        className="flex items-center justify-center min-w-[28px] h-6 px-1.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-700"
                    >
                        {entry.day}
                    </div>
                );
            }
        });
        if (dayBoxes.length > 0) {
            jsx.push(
                <div key={`${requestId}-${type}-month-${currentMonth}-last`} className="flex flex-wrap gap-1 mt-0.5">
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
                        {isExpanded ? 'Show less' : `+${totalDays - maxVisible} more`}
                    </button>
                )}
            </div>
        );
    };

    const getStatusBadge = (status) => {
        const map = {
            pending: 'bg-yellow-100 text-yellow-800',
            certified: 'bg-blue-100 text-blue-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };
        return map[status] || 'bg-gray-100 text-gray-800';
    };

    const currentData = activeTab === 'pending' ? pendingReschedules : certifiedReschedules;

    const formatDays = (days) => {
        const num = Number(days);
        if (isNaN(num)) return '0';
        if (Number.isInteger(num)) return num.toString();
        return num.toFixed(1);
    };

    return (
        <HRMOLayout>
            <Head title="Reschedule Requests" />
            <div className="space-y-4 max-w-full px-4 sm:px-6 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold" style={{ color: NAVY }}>Reschedule Requests</h2>
                        <p className="text-sm text-gray-500">Manage employee leave reschedule requests</p>
                    </div>
                </div>

                <div className="flex border-b border-gray-200">
                    <button
                        className={`px-4 py-2 text-sm font-medium transition ${
                            activeTab === 'pending'
                                ? 'border-b-2 text-[#ffbf00]'
                                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                        }`}
                        style={activeTab === 'pending' ? { borderColor: GOLD } : {}}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending ({pendingReschedules.length})
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium transition ${
                            activeTab === 'certified'
                                ? 'border-b-2 text-[#ffbf00]'
                                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                        }`}
                        style={activeTab === 'certified' ? { borderColor: GOLD } : {}}
                        onClick={() => setActiveTab('certified')}
                    >
                        Certified ({certifiedReschedules.length})
                    </button>
                </div>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    {currentData.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="size-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm">No {activeTab} reschedule requests.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-700">
                                <thead style={{ backgroundColor: NAVY_LIGHT }}>
                                    <tr>
                                        <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Employee</th>
                                        <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Leave Type</th>
                                        <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Original Dates</th>
                                        <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>New Dates</th>
                                        <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-center" style={{ color: NAVY }}>Days</th>
                                        <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: NAVY }}>Status</th>
                                        <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-right" style={{ color: NAVY }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                                    {currentData.map((res) => {
                                        const leaveRequest = res.leave_request || {};
                                        const employee = leaveRequest.employee || {};
                                        const leaveType = leaveRequest.leave_type || {};

                                        const employeeName = employee.full_name || employee.name || '—';
                                        const leaveTypeName = leaveType.name || '—';

                                        return (
                                            <tr key={res.id} className="hover:bg-gray-50 transition">
                                                <td className="px-3 py-2">
                                                    <p className="font-medium text-gray-900 text-sm">{employeeName}</p>
                                                    <p className="text-xs text-gray-500">{employee.email || ''}</p>
                                                </td>
                                                <td className="px-3 py-2 text-gray-700">{leaveTypeName}</td>
                                                <td className="px-3 py-2 max-w-[140px]">
                                                    {res.old_dates && res.old_dates.length > 0
                                                        ? renderDates(res.old_dates, res.id, 'old')
                                                        : res.old_start_date && res.old_end_date
                                                            ? <span className="text-sm text-gray-600">{formatDate(res.old_start_date)} – {formatDate(res.old_end_date)}</span>
                                                            : <span className="text-sm text-gray-400">—</span>
                                                    }
                                                </td>
                                                <td className="px-3 py-2 max-w-[140px]">
                                                    {res.new_dates && res.new_dates.length > 0
                                                        ? renderDates(res.new_dates, res.id, 'new')
                                                        : res.new_start_date && res.new_end_date
                                                            ? <span className="text-sm text-gray-600">{formatDate(res.new_start_date)} – {formatDate(res.new_end_date)}</span>
                                                            : <span className="text-sm text-gray-400">—</span>
                                                    }
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <div className="flex flex-col items-center text-sm">
                                                        <span className="text-green-600 font-medium">{formatDays(res.new_number_of_days)}</span>
                                                        <span className="text-xs text-gray-400">(was {formatDays(res.old_number_of_days)})</span>
                                                        {res.day_difference !== 0 && (
                                                            <span className={`text-xs ${res.day_difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {res.day_difference > 0 ? '↻ refund' : '↻ extra'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(res.status)}`}>
                                                        {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    <Link
                                                        href={route('hrmo.reschedules.show', res.id)}
                                                        className="text-[#ffbf00] hover:underline font-medium text-sm"
                                                    >
                                                        Review
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </HRMOLayout>
    );
}
