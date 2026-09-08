import { useState } from 'react';

export default function DatePickerCalendar({
    selectedDates,
    onDateSelect,
    minDate = null,
    maxSelectable = null,      // new: max dates allowed to select
    highlightedDates = []     // new: dates to highlight (e.g., original approved dates)
}) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

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

    const isDisabled = (dateStr) => {
        if (!minDate) return false;
        return new Date(dateStr) < new Date(minDate);
    };

    const toggleDate = (dateStr) => {
        if (isDisabled(dateStr)) return;
        if (isSelected(dateStr)) {
            onDateSelect(selectedDates.filter(d => d !== dateStr));
        } else {
            // Only add if maxSelectable is not reached
            if (maxSelectable !== null && selectedDates.length >= maxSelectable) {
                // Optionally, you could show a toast or alert.
                // We'll just ignore the click.
                return;
            }
            onDateSelect([...selectedDates, dateStr]);
        }
    };

    const changeMonth = (offset) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
    };

    const formatDateStr = (year, month, day) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

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
                    className="p-2 hover:bg-gray-100 rounded-full"
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
                    className="p-2 hover:bg-gray-100 rounded-full"
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
                    const dateStr = formatDateStr(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
                    const isToday = dateStr === todayStr;
                    const selected = isSelected(dateStr);
                    const highlighted = isHighlighted(dateStr);
                    const disabled = isDisabled(dateStr);
                    // Disable if maxSelectable reached and this date is not already selected
                    const isMaxed = maxSelectable !== null && selectedDates.length >= maxSelectable && !selected;

                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => toggleDate(dateStr)}
                            disabled={disabled || isMaxed}
                            className={`
                                p-2 text-center rounded-full text-sm transition
                                ${disabled || isMaxed ? 'text-gray-300 cursor-not-allowed' : ''}
                                ${selected ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
                                ${!selected && !disabled && !isMaxed && isToday ? 'border border-indigo-600' : ''}
                                ${!selected && !disabled && !isMaxed && !isToday ? 'hover:bg-gray-100' : ''}
                                ${selected && isToday ? 'ring-2 ring-indigo-300' : ''}
                                ${highlighted && !selected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                            `}
                        >
                            {i + 1}
                            {highlighted && !selected && (
                                <span className="block h-1 w-1 mx-auto bg-blue-500 rounded-full mt-0.5"></span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected Dates Preview */}
            {selectedDates.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                            Selected ({selectedDates.length} day{selectedDates.length > 1 ? 's' : ''})
                        </span>
                        <button
                            type="button"
                            onClick={() => onDateSelect([])}
                            className="text-xs text-red-600 hover:text-red-800"
                        >
                            Clear All
                        </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                        {selectedDates.map((date) => (
                            <span key={date} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                                {new Date(date).toLocaleDateString()}
                                <button
                                    type="button"
                                    onClick={() => onDateSelect(selectedDates.filter(d => d !== date))}
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
