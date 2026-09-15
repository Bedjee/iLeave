import DepartmentHeadLayout from '@/Layouts/DepartmentHeadLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';

export default function Index({ pendingApprovals = [], approvedRequests = [], department }) {
    const [processing, setProcessing] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const buttonRefs = useRef({});
    const [activeTab, setActiveTab] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');

    // Color palette
    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';

    // --- Helpers ---
    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatDays = (days) => {
        const num = Number(days);
        if (isNaN(num)) return '0';
        if (Number.isInteger(num)) return num.toString();
        return parseFloat(num.toFixed(2)).toString();
    };

    const getSpecialRequestBadge = (req) => {
        if (req.request_type === 'monetization') {
            return {
                label: 'Monetization',
                color: 'bg-amber-100 text-amber-800 border-amber-300',
                icon: (
                    <svg className="size-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <svg className="size-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                ),
            };
        }
        return null;
    };

    const getDaysDisplay = (req) => {
        let days = req.number_of_days;
        if (req.request_type === 'monetization') {
            days = req.monetized_days || 0;
        }
        return formatDays(days);
    };

    // Compact range formatter — groups consecutive days like "Sep 15–17"
    const formatDateRange = (datesArray) => {
        if (!datesArray || datesArray.length === 0) return '—';
        const sorted = datesArray
            .map(d => new Date(d.leave_date || d))
            .sort((a, b) => a - b);

        const groups = [];
        let currentGroup = [sorted[0]];
        for (let i = 1; i < sorted.length; i++) {
            const diff = (sorted[i] - sorted[i - 1]) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
                currentGroup.push(sorted[i]);
            } else {
                groups.push(currentGroup);
                currentGroup = [sorted[i]];
            }
        }
        groups.push(currentGroup);

        const formatted = groups.map((group) => {
            if (group.length === 1) {
                return group[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            const start = group[0];
            const end = group[group.length - 1];
            if (start.getMonth() === end.getMonth()) {
                return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${end.getDate()}`;
            }
            return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        });

        const maxDisplay = 2;
        if (formatted.length > maxDisplay) {
            const totalDays = sorted.length;
            const displayedDays = groups.slice(0, maxDisplay).reduce((acc, g) => acc + g.length, 0);
            const extraDays = totalDays - displayedDays;
            return formatted.slice(0, maxDisplay).join(', ') + ` + ${extraDays} more day${extraDays > 1 ? 's' : ''}`;
        }
        return formatted.join(', ');
    };

    const getDateDisplay = (req) => {
        if (req.dates && req.dates.length > 0) {
            return formatDateRange(req.dates);
        }
        if (req.start_date && req.end_date) {
            return formatDateRange([
                { leave_date: req.start_date },
                { leave_date: req.end_date },
            ]);
        }
        return '—';
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-gray-100 text-gray-700',
            certified: 'bg-blue-100 text-blue-800',
            department_approved: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-200 text-gray-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Pending',
            certified: 'Certified',
            department_approved: 'Dept. Approved',
            approved: 'Fully Approved',
            rejected: 'Rejected',
            cancelled: 'Cancelled',
        };
        return labels[status] || status;
    };

    // --- Filtering ---
    const filterRequests = useCallback((requests) => {
        if (!searchTerm) return requests;
        const q = searchTerm.toLowerCase();
        return requests.filter((req) =>
            req.employee?.full_name?.toLowerCase().includes(q) ||
            req.leave_type?.name?.toLowerCase().includes(q) ||
            (req.employee?.position && req.employee.position.toLowerCase().includes(q))
        );
    }, [searchTerm]);

    const filteredPending  = filterRequests(pendingApprovals);
    const filteredApproved = filterRequests(approvedRequests);

    // --- Actions (deduplicated) ---
    const handleAction = useCallback((id, action) => {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;
        setOpenDropdownId(null);
        setProcessing(id);
        const routeName = action === 'approve'
            ? 'department-head.leave-requests.approve'
            : 'department-head.leave-requests.reject';
        router.post(route(routeName, id), {}, {
            onSuccess: () => setProcessing(null),
            onError: () => { setProcessing(null); alert('Action failed.'); },
        });
    }, []);

    // --- Dropdown logic (fixed-position correct + viewport clamp) ---
    const DROPDOWN_WIDTH = 176; // w-44

    const toggleDropdown = (id, event) => {
        if (openDropdownId === id) {
            setOpenDropdownId(null);
            return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        const top = rect.bottom + 4;
        let left = rect.right - DROPDOWN_WIDTH;
        const margin = 8;
        left = Math.max(margin, Math.min(left, window.innerWidth - DROPDOWN_WIDTH - margin));

        setDropdownPosition({ top, left });
        setOpenDropdownId(id);
    };

    useEffect(() => {
        if (openDropdownId === null) return;

        const handleClickOutside = (event) => {
            const button = buttonRefs.current[openDropdownId];
            const dropdown = document.getElementById(`dropdown-${openDropdownId}`);
            if (button && dropdown) {
                if (!button.contains(event.target) && !dropdown.contains(event.target)) {
                    setOpenDropdownId(null);
                }
            }
        };
        const handleEsc = (e) => {
            if (e.key === 'Escape') setOpenDropdownId(null);
        };
        const handleScrollOrResize = () => setOpenDropdownId(null);

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [openDropdownId]);

    // --- Counts ---
    const pendingCount  = pendingApprovals.length;
    const approvedCount = approvedRequests.length;
    const totalCount = activeTab === 'pending' ? pendingCount : approvedCount;
    const visibleCount = activeTab === 'pending' ? filteredPending.length : filteredApproved.length;

    // --- Tabs config ---
    const tabs = [
        { key: 'pending',  label: 'Pending Approvals',     count: pendingCount },
        { key: 'approved', label: 'Department Approved',   count: approvedCount },
    ];

    // --- Row rendering (shared between desktop table + mobile card) ---
    const renderActionsButton = (req) => (
        <button
            ref={(el) => (buttonRefs.current[req.id] = el)}
            onClick={(e) => toggleDropdown(req.id, e)}
            disabled={processing === req.id}
            className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#ffbf00]/40"
            aria-label="Actions"
            title="Actions"
        >
            <svg className="size-3.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
        </button>
    );

    const renderEmptyState = (type) => (
        <div className="text-center py-10 px-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center">
                <svg className="size-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            {searchTerm ? (
                <>
                    <p className="text-sm font-medium text-gray-700">No requests match your search</p>
                    <p className="text-xs text-gray-400 mt-0.5">Try adjusting your search terms.</p>
                </>
            ) : (
                <>
                    <p className="text-sm font-medium text-gray-700">
                        {type === 'pending' ? 'No pending approvals from your department' : 'No approved requests yet'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {type === 'pending' ? 'Certified requests will appear here.' : 'Approved requests will be listed here.'}
                    </p>
                </>
            )}
        </div>
    );

    const renderTable = (requests, type) => {
        if (requests.length === 0) {
            return renderEmptyState(type);
        }

        return (
            <>
                {/* ---------- Desktop table ---------- */}
                <div className="hidden sm:block">
                    <table className="w-full table-fixed text-xs">
                        <colgroup>
                            <col className="w-[22%]" />
                            <col className="w-[22%]" />
                            <col className="w-[22%]" />
                            <col className="w-[8%]" />
                            <col className="w-[18%]" />
                            <col className="w-[8%]" />
                        </colgroup>
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Days</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.map((req) => {
                                const specialBadge = getSpecialRequestBadge(req);
                                return (
                                    <tr key={req.id} className="hover:bg-gray-50/70 transition">
                                        <td className="px-3 py-2.5">
                                            <div className="font-medium text-xs truncate" style={{ color: NAVY }} title={req.employee?.full_name}>
                                                {req.employee?.full_name}
                                            </div>
                                            {req.employee?.position && (
                                                <div className="text-[10px] text-gray-500 truncate" title={req.employee.position}>
                                                    {req.employee.position}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-gray-700 text-xs truncate" title={req.leave_type?.name}>
                                                    {req.leave_type?.name || '—'}
                                                </span>
                                                {specialBadge && (
                                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${specialBadge.color}`}>
                                                        {specialBadge.icon}
                                                        {specialBadge.label}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-gray-500 text-xs truncate" title={getDateDisplay(req)}>
                                            {getDateDisplay(req)}
                                        </td>
                                        <td className="px-3 py-2.5 text-gray-700 text-xs tabular-nums">
                                            {getDaysDisplay(req)}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadge(req.status)}`}>
                                                {getStatusLabel(req.status)}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-right">
                                            {renderActionsButton(req)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* ---------- Mobile cards ---------- */}
                <div className="sm:hidden divide-y divide-gray-100">
                    {requests.map((req) => {
                        const specialBadge = getSpecialRequestBadge(req);
                        return (
                            <div key={req.id} className="p-3">
                                {/* Top: employee + status */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold truncate" style={{ color: NAVY }}>
                                            {req.employee?.full_name}
                                        </p>
                                        {req.employee?.position && (
                                            <p className="text-[11px] text-gray-500 truncate">
                                                {req.employee.position}
                                            </p>
                                        )}
                                    </div>
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${getStatusBadge(req.status)}`}>
                                        {getStatusLabel(req.status)}
                                    </span>
                                </div>

                                {/* Details grid */}
                                <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                                    <div className="min-w-0">
                                        <span className="block text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Leave Type</span>
                                        <div className="flex items-center gap-1 flex-wrap">
                                            <span className="font-medium text-gray-800 truncate">{req.leave_type?.name || '—'}</span>
                                            {specialBadge && (
                                                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${specialBadge.color}`}>
                                                    {specialBadge.icon}
                                                    {specialBadge.label}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="block text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Days</span>
                                        <p className="font-medium text-gray-800 tabular-nums">{getDaysDisplay(req)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="block text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Dates</span>
                                        <p className="text-gray-700 truncate">{getDateDisplay(req)}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-2.5 flex justify-end">
                                    <button
                                        ref={(el) => (buttonRefs.current[req.id] = el)}
                                        onClick={(e) => toggleDropdown(req.id, e)}
                                        disabled={processing === req.id}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#ffbf00]/40"
                                    >
                                        <svg className="size-3.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                        </svg>
                                        Actions
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>
        );
    };

    return (
        <DepartmentHeadLayout>
            <Head title="Leave Requests" />
            <div className="max-w-7xl mx-auto px-3 sm:px-5 py-3 sm:py-5">

                {/* ---------- Header ---------- */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2" style={{ color: NAVY }}>
                            <svg className="size-5 flex-shrink-0" style={{ color: GOLD }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Leave Requests
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{department || 'Department'}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span className="text-gray-600">
                                <strong className="tabular-nums">{pendingCount}</strong> Pending
                            </span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-gray-600">
                                <strong className="tabular-nums">{approvedCount}</strong> Approved
                            </span>
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-gray-500 tabular-nums">{pendingCount + approvedCount} total</span>
                    </div>
                </div>

                {/* ---------- Search ---------- */}
                <div className="mb-3">
                    <div className="relative max-w-full sm:max-w-sm">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by employee, leave type, or position…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-9 py-2 bg-white border border-gray-200 rounded-lg focus:border-[#ffbf00] focus:ring-2 focus:ring-[#ffbf00]/20 transition text-xs sm:text-sm"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                aria-label="Clear search"
                            >
                                <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* ---------- Tabs ---------- */}
                <div className="border-b border-gray-200 mb-3 overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                    <nav className="-mb-px flex space-x-4 sm:space-x-6 whitespace-nowrap">
                        {tabs.map((tab) => {
                            const active = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`py-2 px-0.5 border-b-2 font-medium text-xs sm:text-sm transition ${
                                        active
                                            ? 'border-[#ffbf00] text-[#B45309]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab.label}
                                    <span className={`ml-1.5 py-0.5 px-1.5 rounded-full text-[10px] tabular-nums ${
                                        active ? 'bg-[#ffbf00]/15 text-[#B45309]' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* ---------- Table card ---------- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {activeTab === 'pending'
                        ? renderTable(filteredPending, 'pending')
                        : renderTable(filteredApproved, 'approved')}
                </div>

                {/* ---------- Footer count ---------- */}
                {visibleCount > 0 && (
                    <div className="mt-2.5 text-[11px] text-gray-400 text-right">
                        Showing {visibleCount} of {totalCount} requests
                        {searchTerm && ' (filtered)'}
                    </div>
                )}
            </div>

            {/* ---------- Dropdown ---------- */}
            {openDropdownId !== null && (
                <div
                    id={`dropdown-${openDropdownId}`}
                    className="fixed z-50 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 text-left overflow-hidden"
                    style={{
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                    }}
                >
                    <Link
                        href={route('department-head.leave-requests.show', openDropdownId)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition"
                    >
                        <svg className="size-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                    </Link>

                    {activeTab === 'pending' && (
                        <>
                            <button
                                onClick={() => handleAction(openDropdownId, 'approve')}
                                disabled={processing === openDropdownId}
                                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-green-700 hover:bg-green-50 transition disabled:opacity-50"
                            >
                                <svg className="size-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Approve
                            </button>
                            <button
                                onClick={() => handleAction(openDropdownId, 'reject')}
                                disabled={processing === openDropdownId}
                                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-red-700 hover:bg-red-50 transition disabled:opacity-50"
                            >
                                <svg className="size-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Decline
                            </button>
                        </>
                    )}
                </div>
            )}
        </DepartmentHeadLayout>
    );
}