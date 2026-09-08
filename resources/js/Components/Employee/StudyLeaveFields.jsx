export default function StudyLeaveFields({ data, setData, errors }) {
    const purpose = data.detail.study_purpose || '';
    const durationMap = {
        masters_completion: 120,
        bar_board_review: 180,
    };
    const duration = durationMap[purpose] || 0;

    const handlePurposeChange = (e) => {
        const newPurpose = e.target.value;
        setData('detail', { ...data.detail, study_purpose: newPurpose });
        // Reset end_date when purpose changes so it recalculates
        setData('end_date', '');
    };

    return (
        <div>
            <div>
                <label htmlFor="study_purpose" className="block text-sm font-medium text-gray-700">Purpose *</label>
                <select
                    id="study_purpose"
                    value={purpose}
                    onChange={handlePurposeChange}
                    className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                    required
                >
                    <option value="">Select Purpose</option>
                    <option value="masters_completion">Master's Completion (4 months)</option>
                    <option value="bar_board_review">BAR / Board Review (6 months)</option>
                </select>
                {errors['detail.study_purpose'] && <p className="text-red-500 text-sm">{errors['detail.study_purpose']}</p>}
            </div>
            {duration > 0 && (
    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
            Duration: <strong>{duration} calendar days</strong> (approx. {duration/30} months)
        </p>
    </div>
)}
        </div>
    );
}
