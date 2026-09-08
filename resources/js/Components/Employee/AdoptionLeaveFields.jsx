export default function AdoptionLeaveFields({ data, setData, errors }) {
    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="adoption_info" className="block text-sm font-medium text-gray-700">
                    Additional Information
                </label>
                <textarea
                    id="adoption_info"
                    rows="3"
                    value={data.detail?.adoption_info || ''}
                    onChange={(e) => setData('detail', { ...data.detail, adoption_info: e.target.value })}
                    className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                />
            </div>
        </div>
    );
}
