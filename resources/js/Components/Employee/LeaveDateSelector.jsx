import { useState, useEffect } from 'react';
import DatePickerCalendar from './DatePickerCalendar';

export default function LeaveDateSelector({
    leaveType,
    data,
    setData,
    errors,
    studyMode = false,
    studyPurpose = '',
    rehabMode = false,
    maternityMode = false,
    adoptionMode = false,
    slbwMode = false,
}) {
    if (!leaveType) return null;

    // Helper: get date string in YYYY-MM-DD format
    const toDateStr = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Helper: subtract working days (skip weekends)
    const subtractWorkingDays = (fromDate, days) => {
        const result = new Date(fromDate);
        let added = 0;
        while (added < days) {
            result.setDate(result.getDate() - 1);
            const dayOfWeek = result.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                added++;
            }
        }
        return result;
    };

    // Helper: add calendar days (simple)
    const addCalendarDays = (fromDate, days) => {
        const result = new Date(fromDate);
        result.setDate(result.getDate() + days);
        return result;
    };

    // Helper: add working days (skip weekends)
    const addWorkingDays = (fromDate, days) => {
        const result = new Date(fromDate);
        let added = 0;
        while (added < days) {
            result.setDate(result.getDate() + 1);
            const dayOfWeek = result.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                added++;
            }
        }
        return result;
    };

    const getMinDate = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const name = leaveType.name.toLowerCase();

        // Study, Rehab, Maternity, Adoption, SLBW: from today
        if (
            name.includes('study') ||
            name.includes('rehabilitation') ||
            name.includes('maternity') ||
            name.includes('adoption') ||
            name.includes('special leave benefits') ||
            name.includes('slbw')
        ) {
            return toDateStr(today);
        }

        // Vacation Leave: 5 calendar days in advance
        if (name.includes('vacation')) {
            const min = new Date(today);
            min.setDate(min.getDate() + 5);
            return toDateStr(min);
        }

        // Sick Leave: past window of 5 working days
        if (name.includes('sick')) {
            const min = subtractWorkingDays(today, 5);
            return toDateStr(min);
        }

        // Other leave types: from today
        return toDateStr(today);
    };

    const minDate = getMinDate();
    const isVacation = leaveType.name.toLowerCase().includes('vacation');
    const isSick = leaveType.name.toLowerCase().includes('sick');
    const isStudy = leaveType.name.toLowerCase().includes('study');
    const isRehab = leaveType.name.toLowerCase().includes('rehabilitation');
    const isMaternity = leaveType.name.toLowerCase().includes('maternity');
    const isAdoption = leaveType.name.toLowerCase().includes('adoption');
    const isSLBW =
        leaveType.name.toLowerCase().includes('special leave benefits') ||
        leaveType.name.toLowerCase().includes('slbw');

    // Compute study end date
    useEffect(() => {
        if (isStudy && studyPurpose && data.start_date) {
            const durationMap = {
                masters_completion: 120,
                bar_board_review: 180,
            };
            const days = durationMap[studyPurpose] || 0;
            if (days > 0) {
                const start = new Date(data.start_date);
                const end = addCalendarDays(start, days - 1);
                const endDateStr = toDateStr(end);
                setData('end_date', endDateStr);
            }
        }
    }, [isStudy, studyPurpose, data.start_date]);

    // Compute rehab end date based on duration in months
    useEffect(() => {
        if (isRehab && data.detail?.rehab_duration_months && data.start_date) {
            const months = parseInt(data.detail.rehab_duration_months);
            if (!isNaN(months) && months > 0) {
                const days = months * 30; // 30 days per month
                const start = new Date(data.start_date);
                const end = addCalendarDays(start, days - 1);
                const endDateStr = toDateStr(end);
                setData('end_date', endDateStr);
            }
        }
    }, [isRehab, data.detail?.rehab_duration_months, data.start_date]);

    // Compute maternity end date (105 calendar days)
    useEffect(() => {
        if (isMaternity && data.start_date) {
            const days = 105;
            const start = new Date(data.start_date);
            const end = addCalendarDays(start, days - 1);
            const endDateStr = toDateStr(end);
            setData('end_date', endDateStr);
        }
    }, [isMaternity, data.start_date]);

    // Compute adoption end date (60 working days)
    useEffect(() => {
        if (isAdoption && data.start_date) {
            const days = 60;
            const start = new Date(data.start_date);
            const end = addWorkingDays(start, days - 1);
            const endDateStr = toDateStr(end);
            setData('end_date', endDateStr);
        }
    }, [isAdoption, data.start_date]);

    // Compute SLBW end date based on working days
    useEffect(() => {
        if (isSLBW && data.detail?.slbw_days && data.start_date) {
            const days = parseInt(data.detail.slbw_days);
            if (!isNaN(days) && days > 0) {
                const start = new Date(data.start_date);
                const end = addWorkingDays(start, days - 1);
                const endDateStr = toDateStr(end);
                setData('end_date', endDateStr);
            }
        }
    }, [isSLBW, data.detail?.slbw_days, data.start_date]);

    const renderHelper = () => {
        if (isVacation) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const earliestDate = new Date(today);
            earliestDate.setDate(earliestDate.getDate() + 5);
            const formattedEarliest = earliestDate.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            return (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-start gap-2">
                        <svg className="size-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-sm text-blue-800 font-medium">
                                Vacation Leave must be filed at least 5 calendar days in advance.
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                                Dates within the required 5-day filing period are unavailable for selection.
                                <br />
                                <span className="text-xs text-blue-600">
                                    Earliest available date: <strong>{formattedEarliest}</strong>
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        if (isSick) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const earliestPastDate = subtractWorkingDays(today, 5);
            const formattedEarliest = earliestPastDate.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            return (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-start gap-2">
                        <svg className="size-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-sm text-green-800 font-medium">
                                Sick Leave Filing Window: Sick Leave may be filed for dates within the allowed 5-working-day past-date window.
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                                Dates older than 5 working days from today are unavailable for selection.
                                <br />
                                <span className="text-xs text-green-600">
                                    Earliest selectable past date: <strong>{formattedEarliest}</strong>
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    // Specific dates (non-consecutive) – not used for study, rehab, maternity, adoption, or SLBW
    if (
        leaveType.date_selection_type === 'specific_dates' &&
        !isStudy &&
        !isRehab &&
        !isMaternity &&
        !isAdoption &&
        !isSLBW
    ) {
        const handleDateSelect = (selectedDates) => {
            setData('dates', selectedDates);
        };

        return (
            <div>
                {renderHelper()}
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Dates *</label>
                <DatePickerCalendar
                    selectedDates={data.dates || []}
                    onDateSelect={handleDateSelect}
                    minDate={minDate}
                />
                {errors.dates && <p className="text-red-500 text-sm mt-1">{errors.dates}</p>}
            </div>
        );
    }

    // Range selection (normal, study, rehab, maternity, adoption, SLBW)
    return (
        <div>
            {renderHelper()}

            {isStudy && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
                    <div className="flex items-start gap-2">
                        <svg className="size-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <div>
                            <p className="text-sm text-purple-800 font-medium">
                                Study Leave Duration: {studyPurpose ? (studyPurpose === 'masters_completion' ? '4 months (120 days)' : '6 months (180 days)') : 'Select purpose to see duration'}
                            </p>
                            {studyPurpose && data.start_date && data.end_date && (
                                <p className="text-sm text-purple-700 mt-1">
                                    Leave period: <strong>{data.start_date}</strong> to <strong>{data.end_date}</strong>
                                    <br />
                                    <span className="text-xs text-purple-600">
                                        Total duration: <strong>{studyPurpose === 'masters_completion' ? 120 : 180} calendar days</strong> · End date is automatically calculated.
                                    </span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isRehab && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <div className="flex items-start gap-2">
                        <svg className="size-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                            <p className="text-sm text-orange-800 font-medium">
                                Rehabilitation Privilege Leave
                            </p>
                            <p className="text-sm text-orange-700 mt-1">
                                Duration is based on the medical certificate/supporting document.
                                <br />
                                <span className="text-xs text-orange-600">
                                    Maximum allowed duration: 6 months (180 days).
                                </span>
                            </p>
                            {data.detail?.rehab_duration_months && data.start_date && data.end_date && (
                                <p className="text-sm text-orange-700 mt-1">
                                    Leave period: <strong>{data.start_date}</strong> to <strong>{data.end_date}</strong>
                                    <br />
                                    <span className="text-xs text-orange-600">
                                        Total duration: <strong>{parseInt(data.detail.rehab_duration_months) * 30} calendar days</strong> · End date is auto-calculated.
                                    </span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isAdoption && (
                <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-md">
                    <div className="flex items-start gap-2">
                        <svg className="size-5 text-teal-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <div>
                            <p className="text-sm text-teal-800 font-medium">
                                Adoption Leave – 60 working days
                            </p>
                            <p className="text-sm text-teal-700 mt-1">
                                End date is automatically calculated based on 60 working days (Saturdays and Sundays excluded).
                                <br />
                                <span className="text-xs text-teal-600">
                                    {data.start_date && data.end_date && (
                                        <>Leave period: <strong>{data.start_date}</strong> to <strong>{data.end_date}</strong></>
                                    )}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {isSLBW && (
                <div className="mb-4 p-3 bg-cyan-50 border border-cyan-200 rounded-md">
                    <div className="flex items-start gap-2">
                        <svg className="size-5 text-cyan-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <div>
                            <p className="text-sm text-cyan-800 font-medium">
                                Special Leave Benefits for Women – Maximum 60 working days
                            </p>
                            <p className="text-sm text-cyan-700 mt-1">
                                End date is automatically calculated based on the requested working days (Saturdays and Sundays excluded).
                                <br />
                                <span className="text-xs text-cyan-600">
                                    {data.start_date && data.end_date && data.detail?.slbw_days && (
                                        <>Leave period: <strong>{data.start_date}</strong> to <strong>{data.end_date}</strong> ({data.detail.slbw_days} working days)</>
                                    )}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {isMaternity && (
                <div className="mb-4 p-3 bg-pink-50 border border-pink-200 rounded-md">
                    <div className="flex items-start gap-2">
                        <svg className="size-5 text-pink-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <div>
                            <p className="text-sm text-pink-800 font-medium">
                                Maternity Leave – 105 calendar days
                            </p>
                            <p className="text-sm text-pink-700 mt-1">
                                End date is automatically calculated based on the 105‑day duration.
                                <br />
                                <span className="text-xs text-pink-600">
                                    {data.start_date && data.end_date && (
                                        <>Leave period: <strong>{data.start_date}</strong> to <strong>{data.end_date}</strong></>
                                    )}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                        Start Date *
                    </label>
                    <input
                        id="start_date"
                        type="date"
                        min={minDate || ''}
                        value={data.start_date}
                        onChange={(e) => setData('start_date', e.target.value)}
                        className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                        required
                    />
                    {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                </div>
                <div>
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                        {isStudy || isRehab || isMaternity || isAdoption || isSLBW
                            ? 'End Date (Auto-calculated)'
                            : 'End Date *'}
                    </label>
                    <input
                        id="end_date"
                        type="date"
                        value={data.end_date}
                        readOnly={isStudy || isRehab || isMaternity || isAdoption || isSLBW}
                        onChange={() => {}}
                        className={`mt-1 w-full border-gray-300 rounded-md shadow-sm ${
                            isStudy || isRehab || isMaternity || isAdoption || isSLBW
                                ? 'bg-gray-100 text-gray-600'
                                : ''
                        }`}
                    />
                    {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                </div>
            </div>
        </div>
    );
}
