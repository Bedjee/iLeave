import { useState, useEffect } from 'react';
import { Ban } from 'lucide-react';

export default function DatePickerCalendar({
    selectedDates,
    onDateSelect,
    minDate = null,
    maxSelectable = null,
    highlightedDates = [],
    unavailableDates = [],   // 👈 NEW — dates already covered by an existing leave
}) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // If the parent ever passes a selected date that is now unavailable,
    // strip it out so we never submit an overlapping request.
    useEffect(() => {
        if (unavailableDates.length === 0) return;
        const cleaned = selectedDates.filter((d) => !unavailableDates.includes(d));
        if (cleaned.length !== selectedDates.length) {
            onDateSelect(cleaned);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unavailableDates]);

    const daysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = daysInMonth(currentMonth);

    const isSelected = (dateStr) => selectedDates.includes(dateStr);
    const isHighlighted = (dateStr) => highlightedDates.includes(dateStr);
    const isUnavailable = (dateStr) => unavailableDates.includes(dateStr);

    const isBeforeMin = (dateStr) => {
        if (!minDate) return false;
        return new Date(dateStr) < new Date(minDate);
    };

    const isDisabled = (dateStr) =>
        isBeforeMin(dateStr) || isUnavailable(dateStr);

    const toggleDate = (dateStr) => {
        if (isDisabled(dateStr)) return;
        if (isSelected(dateStr)) {
            onDateSelect(selectedDates.filter((d) => d !== dateStr));
        } else {
            if (maxSelectable !== null && selectedDates.length >= maxSelectable) {
                return;
            }
            onDateSelect([...selectedDates, dateStr]);
        }
    };

    const changeMonth = (offset) => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1)
        );
    };

    const formatDateStr = (year, month, day) =>
        `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className="text-lg font-semibold">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Weekdays Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekdays.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-2" />
                ))}
                {Array.from({ length: days }).map((_, i) => {
                    const dateStr = formatDateStr(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        i + 1
                    );
                    const isToday = dateStr === todayStr;
                    const selected = isSelected(dateStr);
                    const highlighted = isHighlighted(dateStr);
                    const unavailable = isUnavailable(dateStr);
                    const beforeMin = isBeforeMin(dateStr);
                    const disabled = unavailable || beforeMin;
                    const isMaxed =
                        maxSelectable !== null &&
                        selectedDates.length >= maxSelectable &&
                        !selected;

                    // Unavailable (already covered by an existing leave) —
                    // distinct from plain "past/disabled" so the user
                    // understands *why* they can't pick that day.
                    const unavailableClass = unavailable
                        ? 'bg-red-50 text-red-400 line-through cursor-not-allowed'
                        : '';

                    const pastClass =
                        beforeMin && !unavailable
                            ? 'text-gray-300 cursor-not-allowed'
                            : '';

                    const maxedClass =
                        isMaxed && !unavailable && !beforeMin
                            ? 'text-gray-300 cursor-not-allowed'
                            : '';

                    const selectable =
                        !unavailable && !beforeMin && !isMaxed;

                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => toggleDate(dateStr)}
                            disabled={disabled || isMaxed}
                            title={
                                unavailable
                                    ? 'Already covered by an existing leave request'
                                    : undefined
                            }
                            className={`
                                relative p-2 text-center rounded-full text-sm transition
                                ${unavailableClass}
                                ${pastClass}
                                ${maxedClass}
                                ${selected ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
                                ${selectable && isToday && !selected ? 'border border-indigo-600' : ''}
                                ${selectable && !isToday && !selected ? 'hover:bg-gray-100' : ''}
                                ${selected && isToday ? 'ring-2 ring-indigo-300' : ''}
                                ${highlighted && !selected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                            `}
                        >
                            {i + 1}
                            {highlighted && !selected && (
                                <span className="block h-1 w-1 mx-auto bg-blue-500 rounded-full mt-0.5" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend — only shows when there are unavailable dates */}
            {unavailableDates.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        <span className="inline-flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-red-50 border border-red-200" />
                            <span className="line-through text-red-400">14</span>
                            <span>Already booked</span>
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="inline-flex items-center gap-1">
                            <Ban className="w-3 h-3 text-red-400" />
                            Unavailable for filing
                        </span>
                    </div>
                </div>
            )}

            {/* Selected Dates Preview */}
            {selectedDates.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                            Selected ({selectedDates.length} day
                            {selectedDates.length > 1 ? 's' : ''})
                        </span>
                        <button
                            type="button"
                            onClick={() => onDateSelect([])}
                            className="text-xs text-red-600 hover:text-red-800 transition"
                        >
                            Clear All
                        </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                        {selectedDates.map((date) => (
                            <span
                                key={date}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
                            >
                                {new Date(date).toLocaleDateString()}
                                <button
                                    type="button"
                                    onClick={() =>
                                        onDateSelect(selectedDates.filter((d) => d !== date))
                                    }
                                    className="text-gray-500 hover:text-red-600"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}