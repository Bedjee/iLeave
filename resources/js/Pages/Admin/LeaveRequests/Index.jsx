import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

export default function Index({ pendingRequests = [], approvedRequests = [], cancelledRequests = [], hasActiveDelegation = false, activeDelegate = null }) {
    const [activeTab, setActiveTab] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const buttonRefs = useRef({});

    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';

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

    // --- Recall handler ---
    const handleRecall = (id) => {
        if (confirm('Are you sure you want to recall this approved Vacation Leave request? This will refund the deducted credits and cancel the request.')) {
            router.post(route('admin.leave-requests.recall', id), {}, {
                onSuccess: () => {
                    router.reload();
                },
                onError: (errors) => {
                    alert(errors.error || 'Recall failed.');
                }
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
        else if (activeTab === 'cancelled') requests = cancelledRequests;

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
    const totalCancelled = cancelledRequests.length;
    const displayedCount = currentRequests.length;
    const totalCount = activeTab === 'pending' ? totalPending : activeTab === 'approved' ? totalApproved : totalCancelled;

    // --- Delegation active message (unchanged) ---
    if (hasActiveDelegation) {
        return (
            <AdminLayout>
                <Head title="Leave Requests - Delegation Active" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex items-center min-h-[70vh]">
                    <div className="w-full bg-white rounded-2xl shadow-lg border p-10 md:p-14 flex flex-col md:flex-row items-center gap-10 md:gap-14" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                        <div className="flex-shrink-0">
                            <img
                                src="/images/warning.png"
                                alt="Delegation Active"
                                className="w-56 h-56 md:w-72 md:h-72 object-contain"
                            />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-3xl md:text-4xl font-bold" style={{ color: '#0F2A52' }}>Delegation Active</h3>
                            <p className="text-lg md:text-xl text-gray-600 mt-4 max-w-xl mx-auto md:mx-0 leading-relaxed">
                                You have delegated your approval authority to <strong className="text-[#ffbf00]">{activeDelegate?.name || 'a Mayor'}</strong>.
                                You cannot view or manage pending leave requests while the delegation is active.
                            </p>
                            <p className="text-base text-gray-500 mt-2">
                                Please contact the delegated approver if you need assistance.
                            </p>
                            <Link
                                href={route('admin.delegations.index')}
                                className="inline-flex items-center gap-3 mt-6 px-8 py-3.5 text-white rounded-xl transition font-semibold shadow-md hover:shadow-lg text-base"
                                style={{ backgroundColor: '#0F2A52' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1a3a6a'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0F2A52'}
                            >
                                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Manage Delegation
                            </Link>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    // --- Normal render ---
    return (
        <AdminLayout>
            <Head title="Leave Requests" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: NAVY }}>
                            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Leave Requests
                        </h2>
                        <p className="text-sm text-gray-500">Manage and review leave requests across the organization.</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GOLD }}></span>
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

                {/* Search Bar (unchanged) */}
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

                {/* Tabs – now three */}
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
                            Pending
                            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                                activeTab === 'pending' ? 'bg-[#ffbf00]/10 text-[#ffbf00]' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {totalPending}
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
                            Approved
                            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                                activeTab === 'approved' ? 'bg-[#ffbf00]/10 text-[#ffbf00]' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {totalApproved}
                            </span>
                        </button>
                        <button
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
                                activeTab === 'cancelled'
                                    ? 'border-[#ffbf00] text-[#ffbf00]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setActiveTab('cancelled')}
                        >
                            Recalled
                            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                                activeTab === 'cancelled' ? 'bg-[#ffbf00]/10 text-[#ffbf00]' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {totalCancelled}
                            </span>
                        </button>
                    </nav>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {currentRequests.length === 0 ? (
                        <div className="text-center py-12">
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
                                        {activeTab === 'pending' ? 'No requests pending your final approval.' :
                                         activeTab === 'approved' ? 'No fully approved requests yet.' :
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
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department Head</th>
                                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {req.approved_at ? (
                                                        <span className="flex items-center gap-1 text-gray-600">
                                                            <svg className="size-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Dept. Head Approved
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm">
                                                    <button
                                                        ref={(el) => (buttonRefs.current[req.id] = el)}
                                                        onClick={(e) => toggleDropdown(req.id, e)}
                                                        className="p-1.5 rounded-lg hover:bg-gray-100 transition focus:outline-none focus:ring-2"
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
                    )}
                </div>

                {/* Footer */}
                {currentRequests.length > 0 && (
                    <div className="mt-4 text-xs text-gray-400 text-right">
                        Showing {displayedCount} of {totalCount} {activeTab === 'pending' ? 'pending' : activeTab === 'approved' ? 'approved' : 'recalled'} requests
                        {searchTerm && ' (filtered)'}
                    </div>
                )}
            </div>

            {/* Dropdown menu */}
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
                        href={route('admin.leave-requests.show', openDropdownId)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                        <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {activeTab === 'pending' ? 'Review' : 'View'}
                    </Link>

                    {/* Recall – only for approved tab and Vacation Leave */}
                    {activeTab === 'approved' && (() => {
                        const req = approvedRequests.find(r => r.id === openDropdownId);
                        const isVL = req?.leave_type?.name?.toLowerCase().includes('vacation');
                        if (isVL) {
                            return (
                                <button
                                    onClick={() => {
                                        setOpenDropdownId(null);
                                        handleRecall(openDropdownId);
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
        </AdminLayout>
    );
}
