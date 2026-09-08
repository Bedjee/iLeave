export default function LeaveTypeForm({ data, setData, errors, processing, submit, submitLabel }) {
    const NAVY = '#0F2A52';
    const NAVY_DARK = '#081A33';
    const GOLD = '#ffbf00';

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium" style={{ color: NAVY }}>
                    Name <span style={{ color: GOLD }}>*</span>
                </label>
                <input
                    id="name"
                    type="text"
                    value={data.name || ''}
                    onChange={(e) => setData('name', e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                    placeholder="Vacation Leave"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Code */}
            <div>
                <label htmlFor="code" className="block text-sm font-medium" style={{ color: NAVY }}>
                    Code <span style={{ color: GOLD }}>*</span>
                </label>
                <input
                    id="code"
                    type="text"
                    value={data.code || ''}
                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                    placeholder="VL"
                />
                {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium" style={{ color: NAVY }}>Description</label>
                <textarea
                    id="description"
                    rows="3"
                    value={data.description || ''}
                    onChange={(e) => setData('description', e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                    placeholder="Optional description"
                />
            </div>

            {/* Default Days & Deduction Factor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="default_days" className="block text-sm font-medium" style={{ color: NAVY }}>Default Days</label>
                    <input
                        id="default_days"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.default_days ?? ''}
                        onChange={(e) => setData('default_days', e.target.value)}
                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                        style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                        onFocus={(e) => (e.target.style.borderColor = GOLD)}
                        onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                        placeholder="15"
                    />
                    {errors.default_days && <p className="mt-1 text-sm text-red-600">{errors.default_days}</p>}
                </div>
                <div>
                    <label htmlFor="deduction_factor" className="block text-sm font-medium" style={{ color: NAVY }}>
                        Deduction Factor <span style={{ color: GOLD }}>*</span>
                    </label>
                    <input
                        id="deduction_factor"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={data.deduction_factor ?? 1}
                        onChange={(e) => setData('deduction_factor', e.target.value)}
                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                        style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                        onFocus={(e) => (e.target.style.borderColor = GOLD)}
                        onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                        placeholder="1.0"
                    />
                    {errors.deduction_factor && <p className="mt-1 text-sm text-red-600">{errors.deduction_factor}</p>}
                </div>
            </div>

            {/* Gender Eligibility */}
            <div>
                <label htmlFor="gender_eligibility" className="block text-sm font-medium" style={{ color: NAVY }}>
                    Gender Eligibility <span style={{ color: GOLD }}>*</span>
                </label>
                <select
                    id="gender_eligibility"
                    value={data.gender_eligibility || 'all'}
                    onChange={(e) => setData('gender_eligibility', e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                >
                    <option value="all">All</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
                {errors.gender_eligibility && <p className="mt-1 text-sm text-red-600">{errors.gender_eligibility}</p>}
            </div>

            {/* Date Selection Type */}
            <div>
                <label htmlFor="date_selection_type" className="block text-sm font-medium" style={{ color: NAVY }}>
                    Date Selection Type <span style={{ color: GOLD }}>*</span>
                </label>
                <select
                    id="date_selection_type"
                    value={data.date_selection_type || 'range'}
                    onChange={(e) => setData('date_selection_type', e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
                    style={{ borderColor: 'rgba(15,42,82,0.15)', backgroundColor: '#f9fafb' }}
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(15,42,82,0.15)')}
                >
                    <option value="range">Range (Start – End)</option>
                    <option value="specific_dates">Specific Non‑consecutive Dates</option>
                </select>
                {errors.date_selection_type && <p className="mt-1 text-sm text-red-600">{errors.date_selection_type}</p>}
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <label className="flex items-center space-x-2 text-sm" style={{ color: NAVY }}>
                    <input
                        type="checkbox"
                        checked={data.earnable || false}
                        onChange={(e) => setData('earnable', e.target.checked)}
                        className="rounded focus:ring-2 transition"
                        style={{ borderColor: 'rgba(15,42,82,0.15)', color: GOLD }}
                    />
                    <span>Earnable</span>
                </label>
                <label className="flex items-center space-x-2 text-sm" style={{ color: NAVY }}>
                    <input
                        type="checkbox"
                        checked={data.deductible || false}
                        onChange={(e) => setData('deductible', e.target.checked)}
                        className="rounded focus:ring-2 transition"
                        style={{ borderColor: 'rgba(15,42,82,0.15)', color: GOLD }}
                    />
                    <span>Deductible</span>
                </label>
                <label className="flex items-center space-x-2 text-sm" style={{ color: NAVY }}>
                    <input
                        type="checkbox"
                        checked={data.deduct_from_vl || false}
                        onChange={(e) => setData('deduct_from_vl', e.target.checked)}
                        className="rounded focus:ring-2 transition"
                        style={{ borderColor: 'rgba(15,42,82,0.15)', color: GOLD }}
                    />
                    <span>Deduct from VL</span>
                </label>
                <label className="flex items-center space-x-2 text-sm" style={{ color: NAVY }}>
                    <input
                        type="checkbox"
                        checked={data.document_required || false}
                        onChange={(e) => setData('document_required', e.target.checked)}
                        className="rounded focus:ring-2 transition"
                        style={{ borderColor: 'rgba(15,42,82,0.15)', color: GOLD }}
                    />
                    <span>Document Required</span>
                </label>
                <label className="flex items-center space-x-2 text-sm" style={{ color: NAVY }}>
                    <input
                        type="checkbox"
                        checked={data.requires_balance || false}
                        onChange={(e) => setData('requires_balance', e.target.checked)}
                        className="rounded focus:ring-2 transition"
                        style={{ borderColor: 'rgba(15,42,82,0.15)', color: GOLD }}
                    />
                    <span>Requires Balance</span>
                </label>
                <label className="flex items-center space-x-2 text-sm" style={{ color: NAVY }}>
                    <input
                        type="checkbox"
                        checked={data.status ?? true}
                        onChange={(e) => setData('status', e.target.checked)}
                        className="rounded focus:ring-2 transition"
                        style={{ borderColor: 'rgba(15,42,82,0.15)', color: GOLD }}
                    />
                    <span>Active</span>
                </label>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4 border-t" style={{ borderColor: 'rgba(15,42,82,0.06)' }}>
                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex items-center justify-center px-6 py-2 text-white rounded-lg transition text-sm font-semibold shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: NAVY }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = NAVY_DARK}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = NAVY}
                >
                    {processing ? 'Saving...' : submitLabel}
                </button>
            </div>
        </form>
    );
}
