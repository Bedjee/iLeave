export default function SpecialLeaveFields({ data, setData, errors }) {
    const days = data.detail?.slbw_days || '';

    const handleDaysChange = (e) => {
        const val = e.target.value;
        setData('detail', { ...data.detail, slbw_days: val });
        // Reset end_date so it recalculates
        setData('end_date', '');
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="slbw_days" className="block text-sm font-medium text-gray-700">
                    Number of Working Days (max 60) *
                </label>
                <input
                    id="slbw_days"
                    type="number"
                    min="1"
                    max="60"
                    value={days}
                    onChange={handleDaysChange}
                    className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                    required
                />
                {errors['detail.slbw_days'] && (
                    <p className="text-red-500 text-sm">{errors['detail.slbw_days']}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Maximum allowed duration is 60 working days (approx. 2 months).</p>
            </div>
            <div>
                <label htmlFor="slbw_attachment" className="block text-sm font-medium text-gray-700">
                    Medical Certificate / Supporting Document *
                </label>
                <input
                    id="slbw_attachment"
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
