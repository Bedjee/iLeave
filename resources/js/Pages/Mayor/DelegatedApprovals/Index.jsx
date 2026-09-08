import MayorLayout from '@/Layouts/MayorLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

export default function Index({ pendingRequests = [], approvedRequests = [], cancelledRequests = [], isDelegate = false }) {
    const [activeTab, setActiveTab] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const buttonRefs = useRef({});

    // Mayor's color palette
    const DEEP_RED = '#B91C1C';
    const PRIMARY_RED = '#DC2626';

    // --- Helpers (unchanged) ---
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

    const getDaysDisplay = (req) => {
        let days = req.number_of_days;
        if (req.request_type === 'monetization') {
            days = req.monetized_days || 0;
        }
        return formatDays(days);
    };

    const formatDateRange = (datesArray) => {
        if (!datesArray || datesArray.length === 0) return '—';
        const sorted = datesArray.map(d => new Date(d.leave_date || d)).sort((a, b) => a - b);
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
            } else {
                const start = group[0];
                const end = group[group.length - 1];
                if (start.getMonth() === end.getMonth()) {
                    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${end.getDate()}`;
                } else {
                    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                }
            }
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
            return `${formatDate(req.start_date)} – ${formatDate(req.end_date)}`;
        }
        return '—';
    };

    const getStatusBadge = (status) => {
        const styles = {
            department_approved: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-300 text-gray-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status) => {
        const labels = {
            department_approved: 'Pending Final Approval',
            approved: 'Fully Approved',
            rejected: 'Rejected',
            cancelled: 'Recalled',
        };
        return labels[status] || status;
    };

    const getStatusIcon = (status) => {
        const icons = {
            department_approved: (
                <svg className="size-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            approved: (
                <svg className="size-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            rejected: (
                <svg className="size-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            cancelled: (
                <svg className="size-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
            ),
        };
        return icons[status] || null;
    };

    // --- Recall handler (only if delegate) ---
    const handleRecall = (id) => {
        if (!isDelegate) return;
        if (confirm('Are you sure you want to recall this approved Vacation Leave request? This will refund the deducted credits and cancel the request.')) {
            router.post(route('mayor.delegated-approvals.recall', id), {}, {
                onSuccess: () => router.reload(),
                onError: (errors) => alert(errors.error || 'Recall failed.'),
            });
        }
    };

    // --- Dropdown logic ---
    const toggleDropdown = (id, event) => {
        if (openDropdownId === id) {
            setOpenDropdownId(null);
            return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        setDropdownPosition({
            top: rect.bottom + window.scrollY + 4,
            left: rect.right + window.scrollX - 160,
        });
        setOpenDropdownId(id);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdownId !== null) {
                const button = buttonRefs.current[openDropdownId];
                const dropdown = document.getElementById(`dropdown-${openDropdownId}`);
                if (button && dropdown) {
                    if (!button.contains(event.target) && !dropdown.contains(event.target)) {
                        setOpenDropdownId(null);
                    }
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setOpenDropdownId(null);
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);

    // --- Filter requests ---
    const getCurrentRequests = () => {
        let requests = [];
        if (activeTab === 'pending') requests = pendingRequests;
        else if (activeTab === 'approved') requests = approvedRequests;
        else if (activeTab === 'cancelled') requests = cancelledRequests || [];

        if (!searchTerm) return requests;
        return requests.filter((req) =>
            req.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.leave_type?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (req.employee?.position && req.employee.position.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    };

    const currentRequests = getCurrentRequests();
    const totalPending = pendingRequests.length;
    const totalApproved = approvedRequests.length;
    const totalCancelled = (cancelledRequests || []).length;
    const displayedCount = currentRequests.length;
    const totalCount = activeTab === 'pending' ? totalPending : activeTab === 'approved' ? totalApproved : totalCancelled;

    return (
        <MayorLayout>
            <Head title="Delegated Approvals" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

                {/* Info Card - when not delegated */}
                {!isDelegate && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm">
                        <div className="flex-shrink-0 mt-0.5">
                            <svg className="size-8 sm:size-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-blue-800">View-Only Access</h4>
                            <p className="text-sm text-blue-700">
                                You are currently <strong>not delegated</strong> as an approver. 
                                You can view all leave requests but cannot approve, reject, or recall them.
                                If you need to take action, please contact the Admin to delegate approval authority to you.
                            </p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2" style={{ color: DEEP_RED }}>
                            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: PRIMARY_RED }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Delegated Approvals
                        </h2>
                        <p className="text-sm text-gray-500 hidden sm:block">Review and manage leave requests delegated to you.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIMARY_RED }}></span>
                            <span className="text-gray-600"><strong>{totalPending}</strong> Pending</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-gray-600"><strong>{totalApproved}</strong> Approved</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            <span className="text-gray-600"><strong>{totalCancelled}</strong> Recalled</span>
                        </span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500">{totalPending + totalApproved + totalCancelled} total</span>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-4">
                    <div className="relative max-w-full sm:max-w-md">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by employee, leave type, or position..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 transition text-sm"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs – horizontally scrollable on small screens */}
                <div className="border-b border-gray-200 mb-4 overflow-x-auto">
                    <nav className="-mb-px flex space-x-6 sm:space-x-8 whitespace-nowrap">
                        <button
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
                                activeTab === 'pending'
                                    ? 'border-[#DC2626] text-[#DC2626]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setActiveTab('pending')}
                        >
                            Pending
                            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                                activeTab === 'pending' ? 'bg-[#DC2626]/10 text-[#DC2626]' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {totalPending}
                            </span>
                        </button>
                        <button
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
                                activeTab === 'approved'
                                    ? 'border-[#DC2626] text-[#DC2626]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setActiveTab('approved')}
                        >
                            Approved
                            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                                activeTab === 'approved' ? 'bg-[#DC2626]/10 text-[#DC2626]' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {totalApproved}
                            </span>
                        </button>
                        <button
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
                                activeTab === 'cancelled'
                                    ? 'border-[#DC2626] text-[#DC2626]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setActiveTab('cancelled')}
                        >
                            Recalled
                            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                                activeTab === 'cancelled' ? 'bg-[#DC2626]/10 text-[#DC2626]' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {totalCancelled}
                            </span>
                        </button>
                    </nav>
                </div>

                {/* Table (desktop) / Card list (mobile) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {currentRequests.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <svg className="size-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {searchTerm ? (
                                <>
                                    <p className="text-gray-500 text-sm">No requests match your search.</p>
                                    <p className="text-gray-400 text-xs mt-1">Try adjusting your search terms.</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-500 text-sm">
                                        {activeTab === 'pending' ? 'No requests pending your approval.' :
                                         activeTab === 'approved' ? 'No approved requests yet.' :
                                         'No recalled requests.'}
                                    </p>
                                    <p className="text-gray-400 text-xs mt-1">
                                        {activeTab === 'pending' ? 'Requests approved by department heads will appear here.' :
                                         activeTab === 'approved' ? 'Approved requests will be listed here.' :
                                         'Recalled requests will appear here.'}
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table – hidden on small screens */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {currentRequests.map((req) => {
                                            const specialBadge = getSpecialRequestBadge(req);
                                            return (
                                                <tr key={req.id} className="hover:bg-gray-50 transition duration-150">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{req.employee?.full_name}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span>{req.leave_type?.name || '—'}</span>
                                                            {specialBadge && (
                                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${specialBadge.color}`}>
                                                                    {specialBadge.icon}
                                                                    {specialBadge.label}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{getDateDisplay(req)}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{getDaysDisplay(req)}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(req.status)}`}>
                                                            {getStatusIcon(req.status)}
                                                            {getStatusLabel(req.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm">
                                                        <button
                                                            ref={(el) => (buttonRefs.current[req.id] = el)}
                                                            onClick={(e) => toggleDropdown(req.id, e)}
                                                            className="p-1.5 rounded-lg hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                                                            aria-label="Actions"
                                                        >
                                                            <svg className="size-5 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                           {/* Mobile Cards – redesigned with clear separators and responsive text */}
<div className="sm:hidden space-y-3 p-3">
    {currentRequests.map((req) => {
        const specialBadge = getSpecialRequestBadge(req);
        return (
            <div
                key={req.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition"
            >
                {/* Top row: Employee + Status */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-gray-900 truncate">
                            {req.employee?.full_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {req.employee?.position || '—'}
                        </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(req.status)} flex-shrink-0`}>
                        {getStatusIcon(req.status)}
                        {getStatusLabel(req.status)}
                    </span>
                </div>

                {/* Details grid */}
                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    <div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400">Leave Type</span>
                        <p className="font-medium text-gray-800 truncate">
                            {req.leave_type?.name || '—'}
                        </p>
                        {specialBadge && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${specialBadge.color} mt-0.5`}>
                                {specialBadge.icon}
                                {specialBadge.label}
                            </span>
                        )}
                    </div>
                    <div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400">Days</span>
                        <p className="font-medium text-gray-800">{getDaysDisplay(req)}</p>
                    </div>
                    <div className="col-span-2">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400">Dates</span>
                        <p className="text-gray-700 truncate">{getDateDisplay(req)}</p>
                    </div>
                </div>

                {/* Action button */}
                <div className="mt-4 flex justify-end border-t border-gray-100 pt-3">
                    <button
                        ref={(el) => (buttonRefs.current[req.id] = el)}
                        onClick={(e) => toggleDropdown(req.id, e)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                    >
                        <svg className="size-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
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
                    )}
                </div>

                {currentRequests.length > 0 && (
                    <div className="mt-4 text-xs text-gray-400 text-right">
                        Showing {displayedCount} of {totalCount} {activeTab === 'pending' ? 'pending' : activeTab === 'approved' ? 'approved' : 'recalled'} requests
                        {searchTerm && ' (filtered)'}
                    </div>
                )}
            </div>

            {/* Dropdown menu – same for both desktop and mobile */}
            {openDropdownId !== null && (
                <div
                    id={`dropdown-${openDropdownId}`}
                    className="fixed z-50 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 text-left overflow-hidden"
                    style={{
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                    }}
                >
                    <Link
                        href={route('mayor.delegated-approvals.show', openDropdownId)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                        <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {activeTab === 'pending' ? 'Review' : 'View'}
                    </Link>

                    {activeTab === 'pending' && isDelegate && (
                        <>
                            <button
                                onClick={() => {
                                    setOpenDropdownId(null);
                                    if (confirm('Are you sure you want to approve this request?')) {
                                        router.post(route('mayor.delegated-approvals.approve', openDropdownId), {}, {
                                            onSuccess: () => router.reload(),
                                            onError: () => alert('Approval failed.'),
                                        });
                                    }
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition"
                            >
                                <svg className="size-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Approve
                            </button>
                            <button
                                onClick={() => {
                                    setOpenDropdownId(null);
                                    const reason = prompt('Please enter a reason for rejection:');
                                    if (reason !== null) {
                                        router.post(route('mayor.delegated-approvals.reject', openDropdownId), { reason }, {
                                            onSuccess: () => router.reload(),
                                            onError: () => alert('Rejection failed.'),
                                        });
                                    }
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition"
                            >
                                <svg className="size-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Reject
                            </button>
                        </>
                    )}

                    {activeTab === 'approved' && isDelegate && (() => {
                        const req = approvedRequests.find(r => r.id === openDropdownId);
                        const isVL = req?.leave_type?.name?.toLowerCase().includes('vacation');
                        if (isVL) {
                            return (
                                <button
                                    onClick={() => {
                                        setOpenDropdownId(null);
                                        if (confirm('Are you sure you want to recall this approved Vacation Leave request? This will refund the deducted credits and cancel the request.')) {
                                            router.post(route('mayor.delegated-approvals.recall', openDropdownId), {}, {
                                                onSuccess: () => router.reload(),
                                                onError: (errors) => alert(errors.error || 'Recall failed.'),
                                            });
                                        }
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition"
                                >
                                    <svg className="size-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Recall
                                </button>
                            );
                        }
                        return null;
                    })()}
                </div>
            )}
        </MayorLayout>
    );
}