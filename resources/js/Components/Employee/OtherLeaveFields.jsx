export default function OtherLeaveFields({ data, setData, errors }) {
    return (
        <div>
            <label htmlFor="other_purpose" className="block text-sm font-medium text-gray-700">Purpose *</label>
            <input
                id="other_purpose"
                type="text"
                value={data.detail.other_purpose || ''}
                onChange={(e) => setData('detail', { ...data.detail, other_purpose: e.target.value })}
                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF2D20] focus:ring-[#FF2D20] transition"
                required
            />
            {errors['detail.other_purpose'] && <p className="mt-1 text-sm text-red-500">{errors['detail.other_purpose']}</p>}
        </div>
    );
}
