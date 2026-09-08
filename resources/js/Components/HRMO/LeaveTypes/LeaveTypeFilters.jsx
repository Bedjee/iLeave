export default function LeaveTypeFilters({ filters, setFilters, onFilter }) {
    const NAVY = '#0F2A52';
    const GOLD = '#ffbf00';

    return (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 p-3 rounded-lg" style={{ backgroundColor: '#f9fafb', borderColor: 'rgba(15,42,82,0.08)' }}>
            <input
                type="text"
                placeholder="Search by name or code"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && onFilter()}
                className="flex-1 min-w-[200px] rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: 'white' }}
                onFocus={(e) => (e.target.style.borderColor = GOLD)}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
            />
            <select
                value={filters.status ?? ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: 'white' }}
                onFocus={(e) => (e.target.style.borderColor = GOLD)}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
            >
                <option value="">All Status</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
            </select>
            <button
                onClick={onFilter}
                className="px-4 py-2 text-white rounded-lg transition text-sm font-medium shadow-sm hover:shadow-md"
                style={{ backgroundColor: GOLD }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e6ac00'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = GOLD}
            >
                Filter
            </button>
        </div>
    );
}
