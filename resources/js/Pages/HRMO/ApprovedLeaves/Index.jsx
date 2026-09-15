import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ leaveRequests, filters, leaveTypes, departments, history: historyProp }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [leaveType, setLeaveType] = useState(filters.leave_type || '');
    const [department, setDepartment] = useState(filters.department || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [historyModal, setHistoryModal] = useState(null);
    const [historyData, setHistoryData] = useState(null);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [expandedDates, setExpandedDates] = useState({});

    useEffect(() => {
        if (historyProp) {
            setHistoryData(historyProp);
            setLoadingHistory(false);
        }
    }, [historyProp]);

    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';
    const NAVY_LIGHT = '#f0f4f8';

    const applyFilters = () => {
        router.get(route('hrmo.approved-leaves.index'), {
            search: searchTerm,
            leave_type: leaveType,
            department: department,
            date_from: dateFrom,
            date_to: dateTo,
        }, { preserveState: true });
    };

    const resetFilters = () => {
        setSearchTerm('');
        setLeaveType('');
        setDepartment('');
        setDateFrom('');
        setDateTo('');
        router.get(route('hrmo.approved-leaves.index'), {}, { preserveState: true });
    };

    const handleDownload = (id) => {
        window.open(route('hrmo.approved-leaves.download', id), '_blank');
    };

    const viewHistory = (id) => {
        setHistoryModal(id);
        setLoadingHistory(true);
        setHistoryData(null);

        router.get(
            route('hrmo.approved-leaves.history', id),
            {
                search: searchTerm,
                leave_type: leaveType,
                department: department,
                date_from: dateFrom,
                date_to: dateTo,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['history'],
                onSuccess: (page) => {
                    setHistoryData(page.props.history || { logs: [], total: 0 });
                    setLoadingHistory(false);
                },
                onError: () => {
                    setLoadingHistory(false);
                    alert('Failed to load history.');
                },
            }
        );
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatDateTime = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getDateStrings = (req) => {
        let dates = [];
        if (req.dates && req.dates.length > 0) {
            dates = req.dates.map(d => d.leave_date);
        } else if (req.start_date && req.end_date) {
            const start = new Date(req.start_date);
            const end = new Date(req.end_date);
            const current = new Date(start);
            while (current <= end) {
                dates.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }
        }
        return dates.sort((a, b) => new Date(a) - new Date(b));
    };

    const formatDateStr = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const renderDates = (req) => {
        const dateStrings = getDateStrings(req);
        if (dateStrings.length === 0) return <span className="text-gray-400">—</span>;

        const isExpanded = expandedDates[req.id] || false;
        const maxVisible = 2;
        const visibleDates = isExpanded ? dateStrings : dateStrings.slice(0, maxVisible);
        const hasMore = dateStrings.length > maxVisible;

        return (
            <div className="flex flex-wrap items-center gap-1">
                {visibleDates.map((d, idx) => (
                    <span
                        key={idx}
                        className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-[11px] text-gray-700 whitespace-nowrap"
                    >
                        {formatDateStr(d)}
                    </span>
                ))}
                {hasMore && !isExpanded && (
                    <button
                        onClick={() => setExpandedDates(prev => ({ ...prev, [req.id]: true }))}
                        className="text-[11px] font-medium hover:underline"
                        style={{ color: GOLD }}
                    >
                        +{dateStrings.length - maxVisible}
                    </button>
                )}
                {isExpanded && (
                    <button
                        onClick={() => setExpandedDates(prev => ({ ...prev, [req.id]: false }))}
                        className="text-[11px] text-gray-500 hover:underline font-medium"
                    >
                        less
                    </button>
                )}
            </div>
        );
    };

    const getDisplayStatus = (req) => {
        if (req.status === 'certified') {
            return { label: 'Certified', class: 'bg-blue-100 text-blue-700' };
        }
        return { label: 'Approved', class: 'bg-green-100 text-green-700' };
    };

    const getApprovedOnDate = (req) => {
        if (req.final_approved_at) {
            return { date: req.final_approved_at, suffix: '' };
        }
        if (req.certified_at) {
            return { date: req.certified_at, suffix: ' (cert.)' };
        }
        return null;
    };

    return (
        <HRMOLayout>
            <Head title="Approved Leave Requests" />

            <div className="space-y-4">

                {/* ===== REMINDER BANNER ===== */}
                <div className="rounded-lg border px-3 py-2.5 flex items-start gap-2.5" style={{ backgroundColor: '#fefce8', borderColor: GOLD }}>
                    <svg className="size-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-xs font-semibold mb-0.5" style={{ color: NAVY }}>
                            Keep your records up to date
                        </p>
                        <p className="text-xs text-gray-600 leading-snug">
                            Once a leave request is fully approved or certified (for Mayor requests), we recommend downloading the official <strong>Leave Request Form</strong> as a backup for your records.
                            Use the <span className="font-semibold" style={{ color: GOLD }}>Download</span> button next to each entry.
                        </p>
                    </div>
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h2 className="text-lg font-bold" style={{ color: NAVY }}>Approved Leave Requests</h2>
                    <span className="text-xs text-gray-500">{leaveRequests.total} records</span>
                </div>

                {/* Filters */}
                <div className="rounded-lg border px-3 py-3" style={{ backgroundColor: '#f9fafb', borderColor: 'rgba(15,42,82,0.08)' }}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                        <div>
                            <label className="block text-[10px] font-semibold mb-1 uppercase tracking-wider" style={{ color: NAVY }}>Search</label>
                            <input
                                type="text"
                                placeholder="Employee name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded border px-2 py-1.5 text-xs"
                                style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: 'white' }}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold mb-1 uppercase tracking-wider" style={{ color: NAVY }}>Leave Type</label>
                            <select
                                value={leaveType}
                                onChange={(e) => setLeaveType(e.target.value)}
                                className="w-full rounded border px-2 py-1.5 text-xs"
                                style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: 'white' }}
                            >
                                <option value="">All Types</option>
                                {leaveTypes.map((type) => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold mb-1 uppercase tracking-wider" style={{ color: NAVY }}>Department</label>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full rounded border px-2 py-1.5 text-xs"
                                style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: 'white' }}
                            >
                                <option value="">All Departments</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>{dept.department_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold mb-1 uppercase tracking-wider" style={{ color: NAVY }}>Date From</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full rounded border px-2 py-1.5 text-xs"
                                style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: 'white' }}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold mb-1 uppercase tracking-wider" style={{ color: NAVY }}>Date To</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full rounded border px-2 py-1.5 text-xs"
                                style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: 'white' }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5">
                        <button
                            onClick={applyFilters}
                            className="px-3 py-1.5 text-black rounded transition text-xs font-semibold shadow-sm hover:shadow"
                            style={{ backgroundColor: GOLD }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e6ac00'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = GOLD}
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={resetFilters}
                            className="px-3 py-1.5 rounded transition text-xs font-semibold"
                            style={{ backgroundColor: '#e5e7eb', color: NAVY }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden" style={{ borderColor: 'rgba(15,42,82,0.08)' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-gray-700">
                            <thead className="text-[10px] uppercase tracking-wider" style={{ backgroundColor: NAVY_LIGHT, color: NAVY }}>
                                <tr>
                                    <th className="px-3 py-2 font-semibold">Employee</th>
                                    <th className="px-3 py-2 font-semibold">Leave Type</th>
                                    <th className="px-3 py-2 font-semibold">Dates</th>
                                    <th className="px-3 py-2 font-semibold text-center">Days</th>
                                    <th className="px-3 py-2 font-semibold text-center">Status</th>
                                    <th className="px-3 py-2 font-semibold">Approved On</th>
                                    <th className="px-3 py-2 font-semibold text-center">Dl</th>
                                    <th className="px-3 py-2 font-semibold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                                {leaveRequests.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-3 py-8 text-center text-gray-500 text-xs">
                                            No approved leave requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    leaveRequests.data.map((req) => {
                                        const downloadCount = req.print_logs_count || 0;
                                        const displayStatus = getDisplayStatus(req);
                                        const approvedOn = getApprovedOnDate(req);
                                        const isCertified = req.status === 'certified';

                                        return (
                                            <tr
                                                key={req.id}
                                                className={`hover:bg-gray-50 transition ${
                                                    isCertified ? 'border-l-2 border-blue-400' : ''
                                                }`}
                                            >
                                                <td className="px-3 py-2">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-xs leading-tight">{req.employee?.full_name}</p>
                                                        <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{req.employee?.position}</p>
                                                        {req.employee?.department && (
                                                            <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                                                {req.employee.department.department_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                                                        {req.leave_type?.name || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    {renderDates(req)}
                                                </td>
                                                <td className="px-3 py-2 text-center font-semibold text-xs">
                                                    {Number(req.number_of_days).toFixed(2)}
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${displayStatus.class}`}>
                                                        {displayStatus.label}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-[11px] text-gray-500 whitespace-nowrap">
                                                    {approvedOn ? (
                                                        <span>
                                                            {formatDateTime(approvedOn.date)}
                                                            {approvedOn.suffix && (
                                                                <span className="text-blue-600 font-medium">{approvedOn.suffix}</span>
                                                            )}
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <button
                                                        onClick={() => viewHistory(req.id)}
                                                        className="text-[11px] font-medium hover:underline inline-flex items-center justify-center gap-1 mx-auto px-1.5 py-0.5 rounded hover:bg-gray-100 transition"
                                                        style={{ color: NAVY }}
                                                    >
                                                        <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        {downloadCount}
                                                    </button>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <button
                                                        onClick={() => handleDownload(req.id)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-black rounded transition shadow-sm hover:shadow"
                                                        style={{ backgroundColor: GOLD }}
                                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e6ac00'}
                                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = GOLD}
                                                        title="Download approved Leave Request Form for your records"
                                                    >
                                                        <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        Download
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {leaveRequests.links && (
                        <div className="px-3 py-2.5 border-t flex flex-wrap justify-between items-center gap-2" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                            <p className="text-[11px] text-gray-500">
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
                                            router.get(link.url, {}, { preserveState: true });
                                        }}
                                        className={`px-2.5 py-1 rounded text-[11px] transition ${
                                            link.active
                                                ? 'text-white font-semibold'
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

            {/* --- History Modal --- */}
            {historyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg max-w-sm w-full max-h-[75vh] flex flex-col shadow-xl border border-gray-100 animate-fadeIn">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                            <h3 className="text-xs font-semibold flex items-center gap-2" style={{ color: NAVY }}>
                                <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: GOLD }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download History
                            </h3>
                            <button
                                onClick={() => { setHistoryModal(null); setHistoryData(null); }}
                                className="text-gray-400 hover:text-gray-600 transition p-1 rounded hover:bg-gray-50"
                                aria-label="Close"
                            >
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-4 py-3">
                            {loadingHistory ? (
                                <div className="flex items-center justify-center py-6">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#ffbf00] border-t-transparent"></div>
                                </div>
                            ) : historyData && historyData.total > 0 ? (
                                <>
                                    <p className="text-[11px] text-gray-500 mb-3">
                                        Total downloads: <span className="font-semibold text-gray-700">{historyData.total}</span>
                                    </p>
                                    <div className="space-y-1.5">
                                        {historyData.logs.map((log, idx) => (
                                            <div key={idx} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-gray-800 truncate">{log.user_name}</p>
                                                    <p className="text-[10px] text-gray-400 truncate">{log.user_email}</p>
                                                </div>
                                                <span className="text-[10px] text-gray-500 whitespace-nowrap ml-3 flex-shrink-0">
                                                    {log.printed_at}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-center text-gray-400 text-xs py-6">No download records found.</p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 px-4 py-2 flex justify-end flex-shrink-0">
                            <button
                                onClick={() => { setHistoryModal(null); setHistoryData(null); }}
                                className="px-3 py-1.5 text-[11px] font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </HRMOLayout>
    );
}