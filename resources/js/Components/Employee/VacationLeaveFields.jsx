export default function VacationLeaveFields({ data, setData, errors, startDate }) {
    let daysDiff = null;
    let warningMessage = null;

    if (startDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const diffTime = start - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysDiff = diffDays;

        if (daysDiff < 5) {
            warningMessage = `Vacation Leave must be filed at least 5 calendar days before the start date. Current start date is only ${daysDiff} days away.`;
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="location_type" className="block text-sm font-medium text-gray-700">Location Type *</label>
                    <select
                        id="location_type"
                        value={data.detail.location_type}
                        onChange={(e) => setData('detail', { ...data.detail, location_type: e.target.value })}
                        className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF2D20] focus:ring-[#FF2D20] transition"
                        required
                    >
                        <option value="">Select</option>
                        <option value="within_philippines">Within Philippines</option>
                        <option value="abroad">Abroad</option>
                    </select>
                    {errors['detail.location_type'] && <p className="mt-1 text-sm text-red-500">{errors['detail.location_type']}</p>}
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location *</label>
                    <input
                        id="location"
                        type="text"
                        value={data.detail.location}
                        onChange={(e) => setData('detail', { ...data.detail, location: e.target.value })}
                        className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF2D20] focus:ring-[#FF2D20] transition"
                        required
                    />
                    {errors['detail.location'] && <p className="mt-1 text-sm text-red-500">{errors['detail.location']}</p>}
                </div>
            </div>

            {warningMessage && (
                <div className="rounded-md bg-[#FF8C00]/10 border border-[#FF8C00]/30 p-3">
                    <p className="text-sm text-[#FF8C00] flex items-center gap-2">
                        <svg className="size-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{warningMessage}</span>
                    </p>
                </div>
            )}
            {errors.start_date && <p className="mt-1 text-sm text-red-500">{errors.start_date}</p>}
        </div>
    );
}
