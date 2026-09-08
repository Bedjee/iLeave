import { useState, useEffect } from 'react';

export function getPayBreakdown(selectedType, requestedDays, balances) {
    if (!selectedType) return null;
    const name = selectedType.name.toLowerCase();
    const isVacationOrSick = name.includes('vacation') || name.includes('sick');
    if (!isVacationOrSick || !selectedType.requires_balance) return null;
    if (requestedDays === 0) return null;

    const currentBalance = parseFloat(balances?.[selectedType.id]) || 0;
    const reserved = 1;
    const availableWithPay = Math.max(0, currentBalance - reserved);

    let withPay = 0, withoutPay = 0;
    if (requestedDays <= availableWithPay) {
        withPay = requestedDays;
        withoutPay = 0;
    } else {
        withPay = Math.floor(availableWithPay);
        withoutPay = requestedDays - Math.floor(availableWithPay);
    }

    return { withPay, withoutPay, availableWithPay, currentBalance, reserved };
}

export function useLeaveValidation(selectedType, data, calculatedDays, balances, hasTakenMaternityLeave = false, hasTakenAdoptionLeave = false) {
    const [frontendErrors, setFrontendErrors] = useState({});

    useEffect(() => {
        const errors = {};

        if (!selectedType) {
            errors.leave_type = 'Please select a leave type.';
            setFrontendErrors(errors);
            return;
        }

        // 1. Date validation (range or specific dates)
        if (selectedType.date_selection_type === 'range') {
            if (!data.start_date) {
                errors.start_date = 'Start date is required.';
            } else if (!data.end_date) {
                errors.end_date = 'End date is required.';
            } else if (new Date(data.end_date) < new Date(data.start_date)) {
                errors.end_date = 'End date must be on or after the start date.';
            }
        } else {
            const validDates = data.dates.filter(d => d && d.trim() !== '');
            if (validDates.length === 0) {
                errors.dates = 'Please select at least one date.';
            }
        }

        // 2. Vacation Leave: 5-day advance filing rule
        if (selectedType.name.toLowerCase().includes('vacation')) {
            let startDate = null;
            if (selectedType.date_selection_type === 'range' && data.start_date) {
                startDate = new Date(data.start_date);
            } else if (selectedType.date_selection_type === 'specific_dates') {
                const validDates = data.dates.filter(d => d && d.trim() !== '');
                if (validDates.length > 0) {
                    startDate = new Date(validDates[0]);
                }
            }
            if (startDate) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const daysDiff = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
                if (daysDiff < 5) {
                    errors.vacation_rule = 'Vacation Leave must be filed at least 5 days before the start date.';
                }
            }
        }

        // 3. Sick Leave: attachment required for 6+ days
        if (selectedType.name.toLowerCase().includes('sick') && calculatedDays >= 6) {
            if (!data.attachment) {
                errors.attachment = 'Medical certificate is required for Sick Leave requests of 6 days or more.';
            }
        }

        // 4. Balance validation – skip for Vacation/Sick
        if (selectedType.requires_balance) {
            const name = selectedType.name.toLowerCase();
            const isVacationOrSick = name.includes('vacation') || name.includes('sick');
            if (!isVacationOrSick) {
                const availableBalance = parseFloat(balances?.[selectedType.id]) || 0;
                if (calculatedDays > availableBalance) {
                    errors.balance = `You have only ${availableBalance} days available for ${selectedType.name}. You requested ${calculatedDays} days.`;
                }
            }

            // 5. Study Leave: duration must match purpose
            if (selectedType.name.toLowerCase().includes('study')) {
                const purpose = data.detail.study_purpose;
                if (purpose && data.start_date && data.end_date) {
                    const start = new Date(data.start_date);
                    const end = new Date(data.end_date);
                    const diffTime = Math.abs(end - start);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    const durationMap = { masters_completion: 120, bar_board_review: 180 };
                    const expectedDays = durationMap[purpose] || 0;
                    if (diffDays !== expectedDays) {
                        errors.study_duration = `Study Leave for ${purpose} must be exactly ${expectedDays} days.`;
                    }
                }
            }

            // 6. Rehabilitation Leave: attachment required and max 6 months
            if (selectedType.name.toLowerCase().includes('rehabilitation')) {
                if (!data.attachment) {
                    errors.attachment = 'Medical certificate is required for Rehabilitation Privilege Leave.';
                }
                const months = parseInt(data.detail?.rehab_duration_months);
                if (months && months > 6) {
                    errors.rehab_duration = 'Rehabilitation Privilege Leave cannot exceed 6 months.';
                }
                if (months && months < 1) {
                    errors.rehab_duration = 'Please enter a valid duration (1-6 months).';
                }
            }
        }

        // 7. Wellness Leave validation
        if (selectedType.name.toLowerCase().includes('wellness')) {
            let wellnessDates = [];
            if (selectedType.date_selection_type === 'specific_dates') {
                wellnessDates = data.dates.filter(d => d && d.trim() !== '');
            } else if (data.start_date && data.end_date) {
                const start = new Date(data.start_date);
                const end = new Date(data.end_date);
                const current = new Date(start);
                while (current <= end) {
                    wellnessDates.push(current.toISOString().split('T')[0]);
                    current.setDate(current.getDate() + 1);
                }
            }

            if (wellnessDates.length > 5) {
                errors.wellness_total = 'Wellness Leave cannot exceed 5 days. You selected ' + wellnessDates.length + ' days.';
            } else if (wellnessDates.length > 0) {
                const sorted = [...wellnessDates].sort();
                const blocks = [];
                let currentBlock = [sorted[0]];
                for (let i = 1; i < sorted.length; i++) {
                    const prev = new Date(sorted[i-1]);
                    const curr = new Date(sorted[i]);
                    const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
                    if (diff === 1) {
                        currentBlock.push(sorted[i]);
                    } else {
                        blocks.push(currentBlock);
                        currentBlock = [sorted[i]];
                    }
                }
                blocks.push(currentBlock);

                let hasLongBlock = false;
                for (const block of blocks) {
                    if (block.length > 3) {
                        errors.wellness_consecutive = 'Wellness Leave cannot be taken in blocks longer than 3 consecutive days.';
                        hasLongBlock = true;
                        break;
                    }
                }

                if (wellnessDates.length === 5 && !hasLongBlock) {
                    if (blocks.length !== 2) {
                        errors.wellness_split = 'Wellness Leave of 5 days must be split into two separate blocks (3 days and 2 days).';
                    } else {
                        const sizes = blocks.map(b => b.length).sort((a,b) => a-b);
                        if (sizes[0] !== 2 || sizes[1] !== 3) {
                            errors.wellness_split = 'Wellness Leave of 5 days must be split into blocks of 3 days and 2 days.';
                        } else {
                            const lastOfFirst = new Date(blocks[0][blocks[0].length-1]);
                            const firstOfSecond = new Date(blocks[1][0]);
                            const gap = Math.round((firstOfSecond - lastOfFirst) / (1000 * 60 * 60 * 24));
                            if (gap <= 1) {
                                errors.wellness_gap = 'The two blocks of Wellness Leave must be separated by at least one day.';
                            }
                        }
                    }
                }
            }
        }


        // 8. Maternity Leave: enforce exactly 105 days
if (selectedType.name.toLowerCase().includes('maternity')) {
    if (data.start_date && data.end_date) {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        if (diffDays !== 105) {
            errors.maternity_duration = 'Maternity Leave must be exactly 105 calendar days.';
        }
    }
    if (!data.attachment) {
        errors.attachment = 'Supporting document is required for Maternity Leave.';
    }
}


// 9. Adoption Leave: enforce exactly 60 working days and check if already used
if (selectedType.name.toLowerCase().includes('adoption')) {
    if (hasTakenAdoptionLeave) {
        errors.adoption_used = 'You have already availed of Adoption Leave. It can only be taken once.';
    }
    if (data.start_date && data.end_date) {
        // Calculate working days between start and end (inclusive)
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        let count = 0;
        const current = new Date(start);
        while (current <= end) {
            const day = current.getDay();
            if (day !== 0 && day !== 6) count++;
            current.setDate(current.getDate() + 1);
        }
        if (count !== 60) {
            errors.adoption_duration = 'Adoption Leave must be exactly 60 working days (weekends excluded).';
        }
    }
    if (!data.attachment) {
        errors.attachment = 'Supporting document is required for Adoption Leave.';
    }
}







        setFrontendErrors(errors);
    }, [selectedType, data, calculatedDays, balances]);

    return { frontendErrors, isValid: Object.keys(frontendErrors).length === 0 };
}
