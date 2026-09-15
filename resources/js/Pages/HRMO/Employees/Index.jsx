import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import {
    Search,
    Plus,
    X,
    Filter,
    Users,
    MoreVertical,
    Eye,
    Pencil,
    KeyRound,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

const NAVY = '#0F2A52';
const NAVY_DARK = '#081A33';
const GOLD = '#ffbf00';

// ---------- Small components ----------
function StatusBadge({ status }) {
    const map = {
        active:    { label: 'Active',    dot: 'bg-emerald-500', cls: 'bg-emerald-50 text-emerald-700' },
        suspended: { label: 'Suspended', dot: 'bg-amber-500',   cls: 'bg-amber-50 text-amber-700' },
        inactive:  { label: 'Inactive',  dot: 'bg-gray-400',    cls: 'bg-gray-100 text-gray-500' },
    };
    const info = map[status] || map.inactive;
    return (
        <span className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${info.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />
            {info.label}
        </span>
    );
}

function Avatar({ name }) {
    const initials = (name || '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    return (
        <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
            style={{ backgroundColor: 'rgba(15,42,82,0.08)', color: NAVY }}
        >
            {initials || '?'}
        </div>
    );
}

// ---------- Action dropdown ----------
function ActionMenu({ employee, onAction }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open]);

    return (
        <div className="relative inline-block" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center justify-center w-7 h-7 rounded-md border transition hover:shadow-sm"
                style={{ borderColor: 'rgba(15,42,82,0.1)', color: NAVY }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(15,42,82,0.04)')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                aria-label="Actions"
                title="Actions"
            >
                <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {open && (
                <div
                    className="absolute right-0 mt-1 w-44 bg-white border rounded-lg shadow-lg z-20 py-1 overflow-hidden"
                    style={{ borderColor: 'rgba(15,42,82,0.1)' }}
                >
                    <button
                        onClick={() => { setOpen(false); onAction('show', employee.id); }}
                        className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition"
                    >
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        View details
                    </button>
                    <button
                        onClick={() => { setOpen(false); onAction('edit', employee.id); }}
                        className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition"
                    >
                        <Pencil className="w-3.5 h-3.5 text-amber-600" />
                        Edit
                    </button>
                    <div className="my-1 border-t" style={{ borderColor: 'rgba(15,42,82,0.06)' }} />
                    <button
                        onClick={() => { setOpen(false); onAction('reset', employee.id); }}
                        className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition"
                    >
                        <KeyRound className="w-3.5 h-3.5" />
                        Reset password
                    </button>
                </div>
            )}
        </div>
    );
}

// ---------- Page ----------
export default function Index({ employees, filters, departments }) {
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        department: filters.department || '',
        status: filters.status || '',
    });

    const filter = (e) => {
        if (e) e.preventDefault();
        get(route('hrmo.employees.index'), data, { preserveState: true });
    };

    const resetFilters = () => {
        const reset = { search: '', department: '', status: '' };
        setData(reset);
        get(route('hrmo.employees.index'), reset, { preserveState: true });
    };

    const handleAction = (action, employeeId) => {
        switch (action) {
            case 'show':
                router.visit(route('hrmo.employees.show', employeeId));
                break;
            case 'edit':
                router.visit(route('hrmo.employees.edit', employeeId));
                break;
            case 'reset':
                if (confirm('Are you sure you want to reset the password to default?')) {
                    router.post(route('hrmo.employees.reset-password', employeeId), {}, {
                        onError: () => alert('Failed to reset password.'),
                    });
                }
                break;
        }
    };

    const hasFilters = data.search !== '' || data.department !== '' || data.status !== '';

    return (
        <HRMOLayout>
            <Head title="Employees" />
            <div className="space-y-5">

                {/* ================= Header ================= */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: NAVY }}>
                            <Users className="w-5 h-5" style={{ color: GOLD }} />
                            Employees
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Manage LGU personnel, assignments and account access.
                        </p>
                    </div>
                    <Link
                        href={route('hrmo.employees.create')}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-white rounded-lg transition text-sm font-medium shadow-sm hover:shadow-md"
                        style={{ backgroundColor: NAVY }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = NAVY_DARK)}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
                    >
                        <Plus className="w-4 h-4" />
                        Add Employee
                    </Link>
                </div>

                {/* ================= Filters ================= */}
                <form
                    onSubmit={filter}
                    className="rounded-xl p-3 border shadow-sm flex flex-col lg:flex-row gap-2 items-stretch lg:items-center"
                    style={{ backgroundColor: 'white', borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email…"
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                            className="w-full rounded-lg border pl-9 pr-9 py-2 text-sm focus:outline-none transition"
                            style={{ borderColor: 'rgba(15,42,82,0.12)' }}
                            onFocus={(e) => (e.target.style.borderColor = GOLD)}
                            onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.12)')}
                        />
                        {data.search && (
                            <button
                                type="button"
                                onClick={() => setData('search', '')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label="Clear search"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <select
                        value={data.department}
                        onChange={(e) => setData('department', e.target.value)}
                        className="rounded-lg border px-3 py-2 text-sm focus:outline-none transition min-w-[150px]"
                        style={{ borderColor: 'rgba(15,42,82,0.12)', color: NAVY }}
                        onFocus={(e) => (e.target.style.borderColor = GOLD)}
                        onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.12)')}
                    >
                        <option value="">All Departments</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.department_name}</option>
                        ))}
                    </select>

                    <select
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                        className="rounded-lg border px-3 py-2 text-sm focus:outline-none transition min-w-[120px]"
                        style={{ borderColor: 'rgba(15,42,82,0.12)', color: NAVY }}
                        onFocus={(e) => (e.target.style.borderColor = GOLD)}
                        onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.12)')}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                    </select>

                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white transition shadow-sm hover:shadow-md disabled:opacity-50"
                            style={{ backgroundColor: GOLD }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e6ac00')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = GOLD)}
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Filter
                        </button>
                        {hasFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition"
                                style={{ backgroundColor: '#f3f4f6', color: NAVY }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </form>

                {/* ================= Table card ================= */}
                <div
                    className="rounded-xl bg-white border shadow-sm overflow-hidden"
                    style={{ borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    {employees.data.length === 0 ? (
                        <div className="text-center py-14 px-6">
                            <div
                                className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: 'rgba(15,42,82,0.05)' }}
                            >
                                <AlertCircle className="w-6 h-6" style={{ color: NAVY }} />
                            </div>
                            <p className="text-sm font-medium" style={{ color: NAVY }}>
                                No employees found
                            </p>
                            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                                {hasFilters
                                    ? 'No results match your current filters. Try adjusting or clearing them.'
                                    : 'Start by adding your first employee.'}
                            </p>
                            {hasFilters ? (
                                <button
                                    onClick={resetFilters}
                                    className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white transition"
                                    style={{ backgroundColor: NAVY }}
                                >
                                    Clear filters
                                </button>
                            ) : (
                                <Link
                                    href={route('hrmo.employees.create')}
                                    className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white transition"
                                    style={{ backgroundColor: NAVY }}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Employee
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Fixed layout — no horizontal scroll */}
                            <table className="w-full table-fixed text-left text-xs">
                                <colgroup>
                                    <col className="w-[24%]" />
                                    <col className="w-[26%]" />
                                    <col className="w-[18%]" />
                                    <col className="w-[16%]" />
                                    <col className="w-[10%]" />
                                    <col className="w-[6%]" />
                                </colgroup>

                                <thead style={{ backgroundColor: '#f8fafc' }}>
                                    <tr className="border-b" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                                        <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-left" style={{ color: NAVY, opacity: 0.75 }}>Employee</th>
                                        <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-left" style={{ color: NAVY, opacity: 0.75 }}>Email</th>
                                        <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-left" style={{ color: NAVY, opacity: 0.75 }}>Department</th>
                                        <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-left" style={{ color: NAVY, opacity: 0.75 }}>Position</th>
                                        <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-left" style={{ color: NAVY, opacity: 0.75 }}>Status</th>
                                        <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-right" style={{ color: NAVY, opacity: 0.75 }}></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: 'rgba(15,42,82,0.05)' }}>
                                    {employees.data.map((emp) => {
                                        const status = emp.user?.status || 'inactive';
                                        return (
                                            <tr key={emp.id} className="transition hover:bg-[#f8fafc]">
                                                {/* Employee */}
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <Avatar name={emp.full_name} />
                                                        <span
                                                            className="font-medium text-gray-900 text-xs truncate"
                                                            title={emp.full_name}
                                                        >
                                                            {emp.full_name}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Email — truncated with tooltip */}
                                                <td className="px-3 py-2">
                                                    {emp.email ? (
                                                        <a
                                                            href={`mailto:${emp.email}`}
                                                            className="text-xs text-gray-600 hover:text-gray-900 transition truncate block"
                                                            title={emp.email}
                                                        >
                                                            {emp.email}
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-300 italic text-xs">—</span>
                                                    )}
                                                </td>

                                                {/* Department */}
                                                <td className="px-3 py-2">
                                                    {emp.department?.department_name ? (
                                                        <span
                                                            className="text-xs text-gray-700 truncate block"
                                                            title={emp.department.department_name}
                                                        >
                                                            {emp.department.department_name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300 italic text-xs">Unassigned</span>
                                                    )}
                                                </td>

                                                {/* Position */}
                                                <td className="px-3 py-2">
                                                    {emp.position ? (
                                                        <span
                                                            className="text-xs text-gray-700 truncate block"
                                                            title={emp.position}
                                                        >
                                                            {emp.position}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300 italic text-xs">—</span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-3 py-2">
                                                    <StatusBadge status={status} />
                                                </td>

                                                {/* Actions */}
                                                <td className="px-3 py-2 text-right">
                                                    <ActionMenu employee={emp} onAction={handleAction} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* ================= Pagination ================= */}
                            {employees.links && employees.links.length > 3 && (
                                <div
                                    className="px-4 py-3 border-t flex flex-wrap items-center justify-between gap-2"
                                    style={{ borderColor: 'rgba(15,42,82,0.06)' }}
                                >
                                    <p className="text-xs text-gray-500">
                                        Showing{' '}
                                        <span className="font-medium text-gray-700">{employees.from}</span>–
                                        <span className="font-medium text-gray-700">{employees.to}</span> of{' '}
                                        <span className="font-medium text-gray-700">{employees.total}</span>
                                    </p>

                                    <div className="flex items-center gap-1">
                                        {employees.links.map((link, idx) => {
                                            const isPrev = link.label.includes('Previous');
                                            const isNext = link.label.includes('Next');

                                            if (isPrev || isNext) {
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => link.url && get(link.url, data, { preserveState: true })}
                                                        disabled={!link.url}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                                                        style={{ color: NAVY }}
                                                    >
                                                        {isPrev && <ChevronLeft className="w-3.5 h-3.5" />}
                                                        {isPrev ? 'Prev' : 'Next'}
                                                        {isNext && <ChevronRight className="w-3.5 h-3.5" />}
                                                    </button>
                                                );
                                            }

                                            const label = link.label.replace(/&laquo;|&raquo;/g, '').trim();
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => link.url && get(link.url, data, { preserveState: true })}
                                                    disabled={!link.url}
                                                    className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${
                                                        link.active ? 'text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                                    style={link.active ? { backgroundColor: NAVY } : {}}
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </HRMOLayout>
    );
}