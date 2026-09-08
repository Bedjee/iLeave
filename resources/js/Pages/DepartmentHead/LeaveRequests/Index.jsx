import DepartmentHeadLayout from '@/Layouts/DepartmentHeadLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

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
    const GOLD_LIGHT = 'rgba(255,191,0,0.12)';

    // --- Helpers ---
    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // --- Clean day formatting (no trailing zeros) ---
    const formatDays = (days) => {
        const num = Number(days);
        if (isNaN(num)) return '0';
        if (Number.isInteger(num)) return num.toString();
        return parseFloat(num.toFixed(2)).toString();
    };

    // --- Special request badge ---
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

    // --- Days display helper (correct for special types) ---
    const getDaysDisplay = (req) => {
        let days = req.number_of_days;
        if (req.request_type === 'monetization') {
            days = req.monetized_days || 0;
            return formatDays(days);
        }
        if (req.request_type === 'terminal_leave') {
            return formatDays(days);
        }
        return formatDays(days);
    };

    const getDateDisplay = (req) => {
        if (req.start_date && req.end_date) {
            return `${formatDate(req.start_date)} – ${formatDate(req.end_date)}`;
        } else if (req.dates && req.dates.length > 0) {
            return req.dates.map(d => formatDate(d.leave_date)).join(', ');
        } else {
            return '—';
        }
    };

    // --- Status helpers ---
    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-gray-100 text-gray-800',
            certified: 'bg-blue-100 text-blue-800',
            department_approved: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-300 text-gray-700',
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

    // --- Filter requests by search term ---
    const filterRequests = (requests) => {
        if (!searchTerm) return requests;
        return requests.filter((req) =>
            req.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.leave_type?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (req.employee?.position && req.employee.position.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    };

    const filteredPending = filterRequests(pendingApprovals);
    const filteredApproved = filterRequests(approvedRequests);

    // --- Action handlers ---
    const handleAction = (id, action) => {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;
        setProcessing(id);
        const routeName = action === 'approve' ? 'department-head.leave-requests.approve' : 'department-head.leave-requests.reject';
        router.post(route(routeName, id), {}, {
            onSuccess: () => { setProcessing(null); setOpenDropdownId(null); },
            onError: () => { setProcessing(null); alert('Action failed.'); },
        });
    };

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

    // Close dropdown on outside click
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

    // Table component
    const RequestTable = ({ requests, type, isEmpty }) => {
        if (isEmpty) {
            return (
                <div className="text-center py-12">
                    <svg className="size-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 text-sm">
                        {type === 'pending' ? 'No pending approvals from your department.' : 'No approved requests yet.'}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                        {type === 'pending' ? 'Certified requests will appear here.' : 'Approved requests will be listed here.'}
                    </p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {requests.map((req) => {
                            const specialBadge = getSpecialRequestBadge(req);
                            return (
                                <tr key={req.id} className="hover:bg-gray-50 transition duration-150">
                                    <td className="px-4 py-3 text-sm font-medium" style={{ color: NAVY }}>{req.employee?.full_name}</td>
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
                                            {getStatusLabel(req.status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm relative">
                                        <button
                                            ref={(el) => (buttonRefs.current[req.id] = el)}
                                            onClick={(e) => toggleDropdown(req.id, e)}
                                            disabled={processing === req.id}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 focus:outline-none focus:ring-2"
                                            style={{ '--tw-ring-color': GOLD }}
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
        );
    };

    // --- Counts ---
    const pendingCount = pendingApprovals.length;
    const approvedCount = approvedRequests.length;
    const filteredPendingCount = filteredPending.length;
    const filteredApprovedCount = filteredApproved.length;

    return (
        <DepartmentHeadLayout>
            <Head title="Leave Requests" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: NAVY }}>
                            <svg className="size-6" style={{ color: GOLD }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Leave Requests
                        </h2>
                        <p className="text-sm text-gray-500">{department || 'Department'}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="text-gray-600"><strong>{pendingCount}</strong> Pending</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-gray-600"><strong>{approvedCount}</strong> Approved</span>
                        </span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500">{pendingCount + approvedCount} total</span>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by employee, leave type, or position..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-[#ffbf00] focus:ring-2 focus:ring-[#ffbf00]/20 transition text-sm"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
                                activeTab === 'pending'
                                    ? 'border-[#ffbf00] text-[#ffbf00]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setActiveTab('pending')}
                        >
                            Pending Approvals
                            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                                activeTab === 'pending' ? 'bg-[#ffbf00]/10 text-[#ffbf00]' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {pendingCount}
                            </span>
                        </button>
                        <button
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
                                activeTab === 'approved'
                                    ? 'border-[#ffbf00] text-[#ffbf00]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setActiveTab('approved')}
                        >
                            Department Approved
                            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                                activeTab === 'approved' ? 'bg-[#ffbf00]/10 text-[#ffbf00]' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {approvedCount}
                            </span>
                        </button>
                    </nav>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 sm:p-6">
                        {activeTab === 'pending' ? (
                            <RequestTable
                                requests={filteredPending}
                                type="pending"
                                isEmpty={pendingApprovals.length === 0}
                            />
                        ) : (
                            <RequestTable
                                requests={filteredApproved}
                                type="approved"
                                isEmpty={approvedRequests.length === 0}
                            />
                        )}
                    </div>
                </div>

                {/* Footer */}
                {(activeTab === 'pending' ? filteredPending.length : filteredApproved.length) > 0 && (
                    <div className="mt-4 text-xs text-gray-400 text-right">
                        Showing {activeTab === 'pending' ? filteredPending.length : filteredApproved.length} of{' '}
                        {activeTab === 'pending' ? pendingApprovals.length : approvedRequests.length} requests
                        {searchTerm && ' (filtered)'}
                    </div>
                )}
            </div>

            {/* Floating Dropdown */}
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
                        href={route('department-head.leave-requests.show', openDropdownId)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                        <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition disabled:opacity-50"
                            >
                                <svg className="size-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Approve
                            </button>
                            <button
                                onClick={() => handleAction(openDropdownId, 'reject')}
                                disabled={processing === openDropdownId}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition disabled:opacity-50"
                            >
                                <svg className="size-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
