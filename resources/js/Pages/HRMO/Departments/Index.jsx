import HRMOLayout from '@/Layouts/HRMOLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Search,
    Plus,
    X,
    Filter,
    Building2,
    Eye,
    Pencil,
    Power,
    PowerOff,
    AlertCircle,
    Users,
} from 'lucide-react';

const NAVY = '#0F2A52';
const NAVY_DARK = '#081A33';
const GOLD = '#ffbf00';

// ---------- Small components ----------
function StatusBadge({ status }) {
    const active = status === 'active';
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
            }`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            {status}
        </span>
    );
}

function IconButton({ icon: Icon, label, color, onClick, href }) {
    const classes = `inline-flex items-center justify-center w-8 h-8 rounded-lg border transition hover:shadow-sm`;
    const style = { borderColor: 'rgba(15,42,82,0.1)', color };

    if (href) {
        return (
            <Link
                href={href}
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
export default function Index({ departments, filters }) {
    const { get, data, setData, patch, processing } = useForm({
        search: filters.search || '',
        status: filters.status || '',
    });

    const filter = (e) => {
        if (e) e.preventDefault();
        get(route('hrmo.departments.index'), data, { preserveState: true });
    };

    const clearFilters = () => {
        const reset = { search: '', status: '' };
        setData(reset);
        get(route('hrmo.departments.index'), reset, { preserveState: true });
    };

    const toggleStatus = (department) => {
        const action = department.status === 'active' ? 'deactivate' : 'activate';
        if (confirm(`Are you sure you want to ${action} this department?`)) {
            patch(route('hrmo.departments.toggle-status', department.id));
        }
    };

    const hasFilters = data.search !== '' || data.status !== '';

    return (
        <HRMOLayout>
            <Head title="Departments" />
            <div className="space-y-5">

                {/* ================= Header ================= */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: NAVY }}>
                            <Building2 className="w-5 h-5" style={{ color: GOLD }} />
                            Departments
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Manage LGU departments and their assigned heads.
                        </p>
                    </div>
                    <Link
                        href={route('hrmo.departments.create')}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-white rounded-lg transition text-sm font-medium shadow-sm hover:shadow-md"
                        style={{ backgroundColor: NAVY }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = NAVY_DARK)}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
                    >
                        <Plus className="w-4 h-4" />
                        Add Department
                    </Link>
                </div>

                {/* ================= Filters ================= */}
                <form
                    onSubmit={filter}
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
                                    get(route('hrmo.departments.index'), { ...data, search: '' }, { preserveState: true });
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
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
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
                    {departments.length === 0 ? (
                        <div className="text-center py-14 px-6">
                            <div
                                className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: 'rgba(15,42,82,0.05)' }}
                            >
                                <AlertCircle className="w-6 h-6" style={{ color: NAVY }} />
                            </div>
                            <p className="text-sm font-medium" style={{ color: NAVY }}>
                                No departments found
                            </p>
                            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                                {hasFilters
                                    ? 'No results match your current filters. Try adjusting or clearing them.'
                                    : 'Start by adding your first department.'}
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
                                    href={route('hrmo.departments.create')}
                                    className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white transition"
                                    style={{ backgroundColor: NAVY }}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Department
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead style={{ backgroundColor: '#f8fafc' }}>
                                    <tr className="border-b" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                                        {['Code', 'Department', 'Head', 'Employees', 'Status', ''].map((h, i) => (
                                            <th
                                                key={i}
                                                className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide ${
                                                    i === 3 ? 'text-center' : 'text-left'
                                                } ${i === 5 ? 'text-right' : ''}`}
                                                style={{ color: NAVY, opacity: 0.75 }}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: 'rgba(15,42,82,0.05)' }}>
                                    {departments.map((dept) => (
                                        <tr key={dept.id} className="transition hover:bg-[#f8fafc]">
                                            {/* Code */}
                                            <td className="px-4 py-2.5 whitespace-nowrap">
                                                <span
                                                    className="inline-block px-2 py-0.5 rounded-md text-[11px] font-mono font-medium"
                                                    style={{ backgroundColor: 'rgba(15,42,82,0.06)', color: NAVY }}
                                                >
                                                    {dept.department_code}
                                                </span>
                                            </td>

                                            {/* Name */}
                                            <td className="px-4 py-2.5">
                                                <div className="font-medium text-gray-900 text-sm whitespace-nowrap">
                                                    {dept.department_name}
                                                </div>
                                            </td>

                                            {/* Head */}
                                            <td className="px-4 py-2.5 text-gray-600 text-sm whitespace-nowrap">
                                                {dept.head?.full_name || (
                                                    <span className="text-gray-300 italic">Unassigned</span>
                                                )}
                                            </td>

                                            {/* Employees count */}
                                            <td className="px-4 py-2.5 text-center">
                                                <span
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium"
                                                    style={{ backgroundColor: 'rgba(15,42,82,0.06)', color: NAVY }}
                                                >
                                                    <Users className="w-3 h-3" />
                                                    {dept.employees.length}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-2.5 whitespace-nowrap">
                                                <StatusBadge status={dept.status} />
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center justify-end gap-1">
                                                    <IconButton
                                                        icon={Eye}
                                                        label="View details"
                                                        color={NAVY}
                                                        href={route('hrmo.departments.show', dept.id)}
                                                    />
                                                    <IconButton
                                                        icon={Pencil}
                                                        label="Edit"
                                                        color="#B45309"
                                                        href={route('hrmo.departments.edit', dept.id)}
                                                    />
                                                    <IconButton
                                                        icon={dept.status === 'active' ? PowerOff : Power}
                                                        label={dept.status === 'active' ? 'Deactivate' : 'Activate'}
                                                        color={dept.status === 'active' ? '#DC2626' : '#059669'}
                                                        onClick={() => toggleStatus(dept)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </HRMOLayout>
    );
}