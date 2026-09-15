import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Search,
    Plus,
    X,
    Filter,
    ListChecks,
    Eye,
    Pencil,
    Power,
    PowerOff,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

const NAVY = '#0F2A52';
const NAVY_DARK = '#081A33';
const GOLD = '#ffbf00';

// ---------- Small components ----------
function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                status ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
            }`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${
                    status ? 'bg-emerald-500' : 'bg-gray-400'
                }`}
            />
            {status ? 'Active' : 'Inactive'}
        </span>
    );
}

function BooleanCell({ value }) {
    return value ? (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-600">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
        </span>
    ) : (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </span>
    );
}

function IconButton({ icon: Icon, label, color, onClick, href, method }) {
    const classes = `inline-flex items-center justify-center w-8 h-8 rounded-lg border transition hover:shadow-sm`;
    const style = { borderColor: 'rgba(15,42,82,0.1)', color: color };

    if (href) {
        return (
            <Link
                href={href}
                method={method}
                as="button"
                type="button"
                title={label}
                aria-label={label}
                className={classes}
                style={style}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(15,42,82,0.04)')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
                <Icon className="w-3.5 h-3.5" />
            </Link>
        );
    }
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            aria-label={label}
            className={classes}
            style={style}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(15,42,82,0.04)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
            <Icon className="w-3.5 h-3.5" />
        </button>
    );
}

// ---------- Page ----------
export default function Index({ leaveTypes, filters }) {
    const { get, data, setData, patch, processing } = useForm({
        search: filters.search || '',
        status: filters.status ?? '',
    });

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        get(route('hrmo.leave-types.index'), data, { preserveState: true });
    };

    const clearFilters = () => {
        const reset = { search: '', status: '' };
        setData(reset);
        get(route('hrmo.leave-types.index'), reset, { preserveState: true });
    };

    const toggleStatus = (leaveType) => {
        if (confirm(`Are you sure you want to ${leaveType.status ? 'deactivate' : 'activate'} this leave type?`)) {
            patch(route('hrmo.leave-types.toggle-status', leaveType.id));
        }
    };

    const hasFilters = data.search !== '' || data.status !== '';

    return (
        <HRMOLayout>
            <Head title="Leave Types" />
            <div className="space-y-5">

                {/* ================= Header ================= */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: NAVY }}>
                            <ListChecks className="w-5 h-5" style={{ color: GOLD }} />
                            Leave Types
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Configure the leave categories offered to employees.
                        </p>
                    </div>
                    <Link
                        href={route('hrmo.leave-types.create')}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-white rounded-lg transition text-sm font-medium shadow-sm hover:shadow-md"
                        style={{ backgroundColor: NAVY }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = NAVY_DARK)}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
                    >
                        <Plus className="w-4 h-4" />
                        Add Leave Type
                    </Link>
                </div>

                {/* ================= Filters ================= */}
                <form
                    onSubmit={handleFilter}
                    className="rounded-xl p-3 border shadow-sm flex flex-col sm:flex-row gap-2 items-stretch sm:items-center"
                    style={{ backgroundColor: 'white', borderColor: 'rgba(15,42,82,0.08)' }}
                >
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or code…"
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                            className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm focus:outline-none transition"
                            style={{ borderColor: 'rgba(15,42,82,0.12)' }}
                            onFocus={(e) => (e.target.style.borderColor = GOLD)}
                            onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.12)')}
                        />
                        {data.search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setData('search', '');
                                    get(route('hrmo.leave-types.index'), { ...data, search: '' }, { preserveState: true });
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label="Clear search"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Status */}
                    <select
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                        className="rounded-lg border px-3 py-2 text-sm focus:outline-none transition min-w-[130px]"
                        style={{ borderColor: 'rgba(15,42,82,0.12)', color: NAVY }}
                        onFocus={(e) => (e.target.style.borderColor = GOLD)}
                        onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.12)')}
                    >
                        <option value="">All Status</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>

                    {/* Buttons */}
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
                                onClick={clearFilters}
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
                    {leaveTypes.data.length === 0 ? (
                        <div className="text-center py-14 px-6">
                            <div
                                className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: 'rgba(15,42,82,0.05)' }}
                            >
                                <AlertCircle className="w-6 h-6" style={{ color: NAVY }} />
                            </div>
                            <p className="text-sm font-medium" style={{ color: NAVY }}>
                                No leave types found
                            </p>
                            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                                {hasFilters
                                    ? 'No results match your current filters. Try adjusting or clearing them.'
                                    : 'Start by adding your first leave type.'}
                            </p>
                            {hasFilters ? (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white transition"
                                    style={{ backgroundColor: NAVY }}
                                >
                                    Clear filters
                                </button>
                            ) : (
                                <Link
                                    href={route('hrmo.leave-types.create')}
                                    className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white transition"
                                    style={{ backgroundColor: NAVY }}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Leave Type
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead style={{ backgroundColor: '#f8fafc' }}>
                                        <tr className="border-b" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                                            {['Name', 'Code', 'Status', 'Earnable', 'Deductible', 'Default Days', 'Factor', ''].map((h, i) => (
                                                <th
                                                    key={i}
                                                    className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide ${
                                                        i === 3 || i === 4 || i === 5 || i === 6 ? 'text-center' : 'text-left'
                                                    } ${i === 7 ? 'text-right' : ''}`}
                                                    style={{ color: NAVY, opacity: 0.75 }}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ borderColor: 'rgba(15,42,82,0.05)' }}>
                                        {leaveTypes.data.map((type) => (
                                            <tr
                                                key={type.id}
                                                className="transition hover:bg-[#f8fafc]"
                                            >
                                                <td className="px-4 py-2.5">
                                                    <div className="font-medium text-gray-900 text-sm whitespace-nowrap">
                                                        {type.name}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <span
                                                        className="inline-block px-2 py-0.5 rounded-md text-[11px] font-mono font-medium"
                                                        style={{ backgroundColor: 'rgba(15,42,82,0.06)', color: NAVY }}
                                                    >
                                                        {type.code}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 whitespace-nowrap">
                                                    <StatusBadge status={type.status} />
                                                </td>
                                                <td className="px-4 py-2.5 text-center">
                                                    <BooleanCell value={type.earnable} />
                                                </td>
                                                <td className="px-4 py-2.5 text-center">
                                                    <BooleanCell value={type.deductible} />
                                                </td>
                                                <td className="px-4 py-2.5 text-center text-gray-700 tabular-nums">
                                                    {type.default_days ?? <span className="text-gray-300">—</span>}
                                                </td>
                                                <td className="px-4 py-2.5 text-center text-gray-700 tabular-nums">
                                                    {type.deduction_factor}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <IconButton
                                                            icon={Eye}
                                                            label="View details"
                                                            color={NAVY}
                                                            href={route('hrmo.leave-types.show', type.id)}
                                                        />
                                                        <IconButton
                                                            icon={Pencil}
                                                            label="Edit"
                                                            color="#B45309"
                                                            href={route('hrmo.leave-types.edit', type.id)}
                                                        />
                                                        <IconButton
                                                            icon={type.status ? PowerOff : Power}
                                                            label={type.status ? 'Deactivate' : 'Activate'}
                                                            color={type.status ? '#DC2626' : '#059669'}
                                                            onClick={() => toggleStatus(type)}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* ================= Pagination ================= */}
                            {leaveTypes.links && leaveTypes.links.length > 3 && (
                                <div
                                    className="px-4 py-3 border-t flex flex-wrap items-center justify-between gap-2"
                                    style={{ borderColor: 'rgba(15,42,82,0.06)' }}
                                >
                                    <p className="text-xs text-gray-500">
                                        Showing{' '}
                                        <span className="font-medium text-gray-700">{leaveTypes.from}</span>–
                                        <span className="font-medium text-gray-700">{leaveTypes.to}</span> of{' '}
                                        <span className="font-medium text-gray-700">{leaveTypes.total}</span>
                                    </p>

                                    <div className="flex items-center gap-1">
                                        {leaveTypes.links.map((link, index) => {
                                            const isPrev = link.label.includes('Previous');
                                            const isNext = link.label.includes('Next');

                                            if (isPrev || isNext) {
                                                return (
                                                    <button
                                                        key={index}
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
                                                    key={index}
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