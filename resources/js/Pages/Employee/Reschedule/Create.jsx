import EmployeeLayout from '@/Layouts/EmployeeLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import DatePickerCalendar from '@/Components/Employee/DatePickerCalendar';

export default function Create({ leaveRequest }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const { data, setData, post, processing, errors } = useForm({
        start_date: '',
        end_date: '',
        dates: [],
        reason: '',
        attachment: null,
    });


    const originalDates = leaveRequest.dates?.map(d => d.leave_date) || [];

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDays = (days) => {
        const num = Number(days);
        if (isNaN(num)) return '0';
        if (Number.isInteger(num)) return num.toString();
        return num.toFixed(2);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setPreviewUrl(null);
            setData('attachment', null);
            return;
        }
        if (file.type.startsWith('image/')) {
            setPreviewUrl(URL.createObjectURL(file));
            setData('attachment', file);
        } else {
            setPreviewUrl(null);
            setData('attachment', file);
        }
    };

    const removeAttachment = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setData('attachment', null);
        document.getElementById('attachment').value = '';
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('employee.reschedule.store', leaveRequest.id));
    };

    // Original dates display
    let originalDatesDisplay = '—';
    if (leaveRequest.start_date && leaveRequest.end_date) {
        originalDatesDisplay = `${formatDate(leaveRequest.start_date)} – ${formatDate(leaveRequest.end_date)}`;
    } else if (leaveRequest.dates && leaveRequest.dates.length > 0) {
        originalDatesDisplay = leaveRequest.dates.map(d => formatDate(d.leave_date)).join(', ');
    }

    // Maximum days allowed = original number_of_days
    const maxDays = Number(leaveRequest.number_of_days) || 0;
    const selectedCount = (data.dates || []).filter(d => d).length;
    const remaining = Math.max(0, maxDays - selectedCount);

    // Handle date selection from calendar
    const handleDateSelect = (selectedDates) => {
        // Ensure we don't exceed maxDays
        if (selectedDates.length > maxDays) {
            // Keep only the first `maxDays` selected (or we could prevent selection)
            // Better: the calendar component should enforce the limit,
            // but we'll also guard here.
            setData('dates', selectedDates.slice(0, maxDays));
        } else {
            setData('dates', selectedDates);
        }
    };

    return (
        <EmployeeLayout>
            <Head title="Reschedule Leave" />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
                {/* Back button */}
                <Link
                    href={route('employee.leave-requests.show', leaveRequest.id)}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-4"
                >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Request
                </Link>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex size-12 items-center justify-center rounded-full bg-[#FF2D20]/10 text-[#FF2D20] flex-shrink-0">
                            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Reschedule Leave</h2>
                            <p className="text-sm text-gray-500">
                                Request new dates for your approved leave request #{leaveRequest.id}
                            </p>
                        </div>
                    </div>

                    {/* Original Leave Card */}
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Original Leave Details
                        </h4>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                            <div>
                                <span className="font-medium text-gray-500">Leave Type</span>
                                <p className="text-base font-semibold text-gray-900">{leaveRequest.leave_type?.name}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-500">Total Days</span>
                                <p className="text-base font-semibold text-gray-900">{formatDays(leaveRequest.number_of_days)}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <span className="font-medium text-gray-500">Dates</span>
                                <p className="text-base font-semibold text-gray-900">{originalDatesDisplay}</p>
                            </div>
                        </div>
                    </div>

                    {/* New Dates Form */}
                    <form onSubmit={submit} className="space-y-6">
                        {/* Calendar Date Picker */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select New Dates *
                            </label>
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <DatePickerCalendar
    selectedDates={data.dates || []}
    onDateSelect={handleDateSelect}
    maxSelectable={maxDays}
    highlightedDates={originalDates}
/>
                                <div className="mt-3 flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                        Selected: <strong className="text-[#FF2D20]">{selectedCount}</strong> day{selectedCount !== 1 ? 's' : ''}
                                    </span>
                                    <span className="text-gray-500">
                                        Remaining: <strong>{remaining}</strong> day{remaining !== 1 ? 's' : ''}
                                    </span>
                                    {selectedCount === maxDays && maxDays > 0 && (
                                        <span className="text-green-600 font-medium">✓ Maximum reached</span>
                                    )}
                                </div>
                                {errors.dates && <p className="mt-2 text-sm text-red-500">{errors.dates}</p>}
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Reschedule</label>
                            <textarea
                                id="reason"
                                rows="3"
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF2D20] focus:ring-[#FF2D20] transition px-3 py-2"
                                placeholder="Please explain why you need to reschedule..."
                            />
                            {errors.reason && <p className="mt-1 text-sm text-red-500">{errors.reason}</p>}
                        </div>

                        {/* Attachment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Attachment (optional)</label>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-1">
                                    <input
                                        id="attachment"
                                        type="file"
                                        accept="image/*,.pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FF2D20] focus:ring-[#FF2D20] transition px-3 py-2 text-sm"
                                    />
                                    {errors.attachment && <p className="mt-1 text-sm text-red-500">{errors.attachment}</p>}
                                </div>
                                {previewUrl && (
                                    <div className="flex items-center gap-2">
                                        <img src={previewUrl} alt="Preview" className="h-14 w-14 object-cover rounded-lg border" />
                                        <button
                                            type="button"
                                            onClick={removeAttachment}
                                            className="text-red-500 hover:text-red-700 transition p-1"
                                            aria-label="Remove attachment"
                                        >
                                            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Accepted: images, PDF, DOC, DOCX</p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-200">
                            <Link
                                href={route('employee.leave-requests.show', leaveRequest.id)}
                                className="text-sm text-gray-500 hover:text-gray-700 transition self-start"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || selectedCount === 0}
                                className="inline-flex items-center justify-center px-6 py-2.5 bg-[#FF2D20] text-white rounded-lg hover:bg-[#e62e1c] transition text-sm font-semibold shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FF2D20] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Submitting...' : 'Submit Reschedule Request'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </EmployeeLayout>
    );
}
