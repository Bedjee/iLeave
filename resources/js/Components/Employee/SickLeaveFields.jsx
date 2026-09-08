export default function SickLeaveFields({ data, setData, errors, days = 0 }) {
    const showAttachmentWarning = days >= 6;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="sick_leave_type" className="block text-sm font-medium text-gray-700">Type *</label>
                <select
                    id="sick_leave_type"
                    value={data.detail.sick_leave_type}
                    onChange={(e) => setData('detail', { ...data.detail, sick_leave_type: e.target.value })}
                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF2D20] focus:ring-[#FF2D20] transition"
                    required
                >
                    <option value="">Select</option>
                    <option value="in_hospital">In Hospital</option>
                    <option value="out_patient">Out Patient</option>
                </select>
                {errors['detail.sick_leave_type'] && <p className="mt-1 text-sm text-red-500">{errors['detail.sick_leave_type']}</p>}
            </div>
            <div>
                <label htmlFor="illness" className="block text-sm font-medium text-gray-700">Illness *</label>
                <input
                    id="illness"
                    type="text"
                    value={data.detail.illness}
                    onChange={(e) => setData('detail', { ...data.detail, illness: e.target.value })}
                    className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF2D20] focus:ring-[#FF2D20] transition"
                    required
                />
                {errors['detail.illness'] && <p className="mt-1 text-sm text-red-500">{errors['detail.illness']}</p>}
            </div>

            {showAttachmentWarning && (
                <div className="col-span-1 sm:col-span-2 rounded-md bg-[#FF8C00]/10 border border-[#FF8C00]/30 p-3">
                    <p className="text-sm text-[#FF8C00] flex items-center gap-2">
                        <svg className="size-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        A medical certificate is required for Sick Leave requests of 6 days or more.
                    </p>
                </div>
            )}
        </div>
    );
}
