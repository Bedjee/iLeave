export default function MaternityLeaveFields({ data, setData, errors }) {
    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="expected_delivery_date" className="block text-sm font-medium text-gray-700">
                    Expected Delivery Date *
                </label>
                <input
                    id="expected_delivery_date"
                    type="date"
                    value={data.detail?.expected_delivery_date || ''}
                    onChange={(e) => setData('detail', { ...data.detail, expected_delivery_date: e.target.value })}
                    className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                    required
                />
                {errors['detail.expected_delivery_date'] && (
                    <p className="text-red-500 text-sm">{errors['detail.expected_delivery_date']}</p>
                )}
            </div>
            <div>
                <label htmlFor="prenatal_checkups" className="block text-sm font-medium text-gray-700">
                    Prenatal Checkups / Additional Info
                </label>
                <textarea
                    id="prenatal_checkups"
                    rows="2"
                    value={data.detail?.prenatal_checkups || ''}
                    onChange={(e) => setData('detail', { ...data.detail, prenatal_checkups: e.target.value })}
                    className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                />
            </div>
        </div>
    );
}
