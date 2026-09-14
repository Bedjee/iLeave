import DepartmentHeadLayout from '@/Layouts/DepartmentHeadLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ pendingReschedules = [], approvedReschedules = [], department }) {
    const [activeTab, setActiveTab] = useState('pending');
    const [expandedOldDates, setExpandedOldDates] = useState({});
    const [expandedNewDates, setExpandedNewDates] = useState({});

    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatDays = (days) => {
        const num = Number(days);
        if (isNaN(num)) return '0';
        if (Number.isInteger(num)) return num.toString();
        return num.toFixed(1);
    };

    // Group dates by month with "show more" toggle
    const renderDates = (dateArray, requestId, type) => {
        if (!dateArray || dateArray.length === 0) {
            return <span className="text-sm text-gray-500">—</span>;
        }

        const dates = dateArray.map((d) => new Date(d));
        const groups = {};
        dates.forEach((date) => {
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            if (!groups[key]) groups[key] = { monthName, days: [] };
            groups[key].days.push(date.getDate());
        });

        const sortedGroups = Object.keys(groups)
            .sort((a, b) => a.localeCompare(b))
            .map((key) => groups[key]);

        const flatEntries = [];
        sortedGroups.forEach((group) => {
            const sortedDays = group.days.sort((a, b) => a - b);
            flatEntries.push({ type: 'month', label: group.monthName });
            sortedDays.forEach((day) => flatEntries.push({ type: 'day', day }));
        });

        const totalDays = flatEntries.filter((e) => e.type === 'day').length;
        const isExpanded = type === 'old' ? expandedOldDates[requestId] : expandedNewDates[requestId];
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
                setExpandedOldDates((prev) => ({ ...prev, [requestId]: !prev[requestId] }));
            } else {
                setExpandedNewDates((prev) => ({ ...prev, [requestId]: !prev[requestId] }));
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
                        className="flex items-center justify-center min-w-[28px] h-6 px-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700"
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
                        className="text-xs font-medium hover:underline mt-0.5 self-start"
                        style={{ color: GOLD }}
                    >
                        {isExpanded ? 'Show less' : `+${totalDays - maxVisible} more`}
                    </button>
                )}
            </div>
        );
    };

    const getStatusBadge = (status) => {
        const map = {
            certified: 'bg-blue-100 text-blue-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
        };
        return map[status] || 'bg-gray-100 text-gray-700';
    };

    const currentData = activeTab === 'pending' ? pendingReschedules : approvedReschedules;
    const currentCount = currentData.length;
    const totalPending = pendingReschedules.length;
    const totalApproved = approvedReschedules.length;

    return (
        <DepartmentHeadLayout>
            <Head title="Reschedule Requests" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2" style={{ color: NAVY }}>
                            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Reschedule Requests
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">{department || 'Department'}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            <span className="text-gray-600"><strong>{totalPending}</strong> Pending</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-gray-600"><strong>{totalApproved}</strong> Approved</span>
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b mb-6" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    <nav className="-mb-px flex space-x-8">
                        <button
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
                                activeTab === 'pending'
                                    ? 'border-current'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            style={activeTab === 'pending' ? { color: GOLD, borderColor: GOLD } : {}}
                            onClick={() => setActiveTab('pending')}
                        >
                            Pending
                            <span
                                className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                                    activeTab === 'pending'
                                        ? 'text-white'
                                        : 'bg-gray-100 text-gray-500'
                                }`}
                                style={activeTab === 'pending' ? { backgroundColor: GOLD } : {}}
                            >
                                {totalPending}
                            </span>
                        </button>
                        <button
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
                                activeTab === 'approved'
                                    ? 'border-current'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            style={activeTab === 'approved' ? { color: GOLD, borderColor: GOLD } : {}}
                            onClick={() => setActiveTab('approved')}
                        >
                            Approved
                            <span
                                className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                                    activeTab === 'approved'
                                        ? 'text-white'
                                        : 'bg-gray-100 text-gray-500'
                                }`}
                                style={activeTab === 'approved' ? { backgroundColor: GOLD } : {}}
                            >
                                {totalApproved}
                            </span>
                        </button>
                    </nav>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {currentCount === 0 ? (
                        <div className="text-center py-12">
                            <svg className="size-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-500 text-sm">
                                {activeTab === 'pending'
                                    ? 'No pending reschedule requests from your department.'
                                    : 'No approved reschedule requests yet.'}
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                                {activeTab === 'pending'
                                    ? 'Certified requests will appear here for your review.'
                                    : 'Approved requests will be listed here.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-700">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Employee</th>
                                            <th className="px-4 py-3 font-medium">Leave Type</th>
                                            <th className="px-4 py-3 font-medium">Original Dates</th>
                                            <th className="px-4 py-3 font-medium">New Dates</th>
                                            <th className="px-4 py-3 font-medium text-center">Days</th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                            <th className="px-4 py-3 font-medium text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {currentData.map((res) => {
                                            const leaveRequest = res.leave_request || res.leaveRequest || {};
                                            const employee = leaveRequest.employee || {};
                                            const leaveType = leaveRequest.leave_type || leaveRequest.leaveType || {};
                                            const employeeName = employee.full_name || employee.name || '—';
                                            const leaveTypeName = leaveType.name || '—';
                                            const employeeEmail = employee.email || '';

                                            return (
                                                <tr key={res.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-gray-800 text-sm">{employeeName}</p>
                                                        {employeeEmail && <p className="text-xs text-gray-500">{employeeEmail}</p>}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">{leaveTypeName}</td>
                                                    <td className="px-4 py-3 max-w-[140px]">
                                                        {res.old_dates && res.old_dates.length > 0
                                                            ? renderDates(res.old_dates, res.id, 'old')
                                                            : res.old_start_date && res.old_end_date
                                                                ? <span className="text-sm text-gray-600">{formatDate(res.old_start_date)} – {formatDate(res.old_end_date)}</span>
                                                                : <span className="text-sm text-gray-400">—</span>}
                                                    </td>
                                                    <td className="px-4 py-3 max-w-[140px]">
                                                        {res.new_dates && res.new_dates.length > 0
                                                            ? renderDates(res.new_dates, res.id, 'new')
                                                            : res.new_start_date && res.new_end_date
                                                                ? <span className="text-sm text-gray-600">{formatDate(res.new_start_date)} – {formatDate(res.new_end_date)}</span>
                                                                : <span className="text-sm text-gray-400">—</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
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
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(res.status)}`}>
                                                            {activeTab === 'pending' ? 'Pending Review' : res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Link
                                                            href={route('department-head.reschedules.show', res.id)}
                                                            className="font-medium text-sm hover:underline"
                                                            style={{ color: GOLD }}
                                                        >
                                                            {activeTab === 'pending' ? 'Review' : 'View'}
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-gray-100">
                                {currentData.map((res) => {
                                    const leaveRequest = res.leave_request || res.leaveRequest || {};
                                    const employee = leaveRequest.employee || {};
                                    const leaveType = leaveRequest.leave_type || leaveRequest.leaveType || {};
                                    const employeeName = employee.full_name || employee.name || '—';
                                    const leaveTypeName = leaveType.name || '—';

                                    return (
                                        <div key={res.id} className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-semibold text-sm" style={{ color: NAVY }}>{employeeName}</p>
                                                    <p className="text-xs text-gray-500">{leaveTypeName}</p>
                                                </div>
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(res.status)}`}>
                                                    {activeTab === 'pending' ? 'Pending' : res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                <div>
                                                    <p className="text-gray-500 mb-0.5">Original</p>
                                                    {res.old_start_date && res.old_end_date
                                                        ? <p className="text-gray-700">{formatDate(res.old_start_date)} – {formatDate(res.old_end_date)}</p>
                                                        : <p className="text-gray-400">—</p>}
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 mb-0.5">New</p>
                                                    {res.new_start_date && res.new_end_date
                                                        ? <p className="text-gray-700">{formatDate(res.new_start_date)} – {formatDate(res.new_end_date)}</p>
                                                        : <p className="text-gray-400">—</p>}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="text-xs">
                                                    <span className="text-gray-500">Days: </span>
                                                    <span className="font-medium text-green-600">{formatDays(res.new_number_of_days)}</span>
                                                    <span className="text-gray-400"> (was {formatDays(res.old_number_of_days)})</span>
                                                </div>
                                                <Link
                                                    href={route('department-head.reschedules.show', res.id)}
                                                    className="text-xs font-medium hover:underline"
                                                    style={{ color: GOLD }}
                                                >
                                                    {activeTab === 'pending' ? 'Review →' : 'View →'}
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {currentCount > 0 && (
                    <div className="mt-4 text-xs text-gray-400 text-right">
                        Showing {currentCount} {activeTab} request{currentCount > 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </DepartmentHeadLayout>
    );
}