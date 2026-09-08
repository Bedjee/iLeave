export default function RehabLeaveFields({ data, setData, errors }) {
    const months = data.detail?.rehab_duration_months || '';

    const handleMonthsChange = (e) => {
        const val = e.target.value;
        setData('detail', { ...data.detail, rehab_duration_months: val });
        // Reset end_date so it recalculates
        setData('end_date', '');
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="rehab_duration_months" className="block text-sm font-medium text-gray-700">
                    Recommended Duration (in months) *
                </label>
                <input
                    id="rehab_duration_months"
                    type="number"
                    min="1"
                    max="6"
                    value={months}
                    onChange={handleMonthsChange}
                    className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                    required
                />
                {errors['detail.rehab_duration_months'] && (
                    <p className="text-red-500 text-sm">{errors['detail.rehab_duration_months']}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Maximum allowed duration is 6 months.</p>
            </div>
            <div>
                <label htmlFor="rehab_attachment" className="block text-sm font-medium text-gray-700">
                    Medical Certificate / Supporting Document *
                </label>
                <input
                    id="rehab_attachment"
                    type="file"
                    onChange={(e) => setData('attachment', e.target.files[0])}
                    className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                    required
                />
                {errors.attachment && <p className="text-red-500 text-sm">{errors.attachment}</p>}
            </div>
        </div>
    );
}
