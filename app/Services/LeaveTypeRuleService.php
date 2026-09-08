<?php

namespace App\Services;

use App\Models\LeaveType;
use Carbon\Carbon;

class LeaveTypeRuleService
{
    /**
     * Get validation rules for a given leave type.
     */
    public function getValidationRules(LeaveType $leaveType): array
    {
        $rules = [];
        $name = strtolower($leaveType->name);

        switch ($name) {
            case 'vacation leave':
                $rules = [
                    'detail.location_type' => ['required', 'in:within_philippines,abroad'],
                    'detail.location' => ['required', 'string', 'max:255'],
                ];
                break;

            case 'sick leave':
                $rules = [
                    'detail.sick_leave_type' => ['required', 'in:in_hospital,out_patient'],
                    'detail.illness' => ['required', 'string', 'max:255'],
                ];
                break;

            case 'study leave':
                $rules = [
                    'detail.study_purpose' => ['required', 'in:masters_completion,bar_board_review,continuing_education'],
                ];
                break;

            case 'other leave':
                $rules = [
                    'detail.other_purpose' => ['required', 'in:monetization,terminal_leave'],
                ];
                break;

                // In getValidationRules()
case 'study leave':
    $rules = [
        'detail.study_purpose' => ['required', 'in:masters_completion,bar_board_review'],
    ];
    break;




            case 'rehabilitation privilege leave':
            case 'rehabilitation leave':
                $rules = [
                    'attachment' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
                    'detail.rehab_duration_months' => ['required', 'integer', 'min:1', 'max:6'],
                ];
                break;


            case 'maternity leave':
    $rules = [
        'detail.expected_delivery_date' => ['required', 'date'],
        'detail.prenatal_checkups' => ['nullable', 'string', 'max:500'],
        'attachment' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
    ];
    break;


    case 'adoption leave':
    $rules = [
        'attachment' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
    ];
    break;


    case 'special leave benefits':
case 'slbw':
case 'special leave benefits for women':
    $rules = [
        'detail.slbw_days' => ['required', 'integer', 'min:1', 'max:60'],
        'attachment' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
    ];
    break;


            default:


        }

        return $rules;
    }
 /**
     * Get the maximum duration for Rehabilitation Privilege Leave in days.
     */
    public function getRehabMaxDuration(): int
    {
        return 180; // 6 months × 30 days
    }


    /**
     * Check if an attachment is required based on leave type and conditions.
     */
    public function isAttachmentRequired(LeaveType $leaveType, array $data): bool
    {
        $name = strtolower($leaveType->name);

        if ($name === 'sick leave') {
            $days = $data['number_of_days'] ?? 0;
            return $days >= 6;
        }

        return $leaveType->document_required ?? false;
    }

    /**
     * Get the message to display for attachment requirement.
     */
    public function getAttachmentRequirementMessage(LeaveType $leaveType): ?string
    {
        if (strtolower($leaveType->name) === 'sick leave') {
            return 'A medical certificate is required for Sick Leave requests of 6 days or more.';
        }
        return null;
    }

    /**
     * Get additional UI hints/conditions for the frontend.
     */
    public function getUiHints(LeaveType $leaveType): array
    {
        $hints = [];
        if (strtolower($leaveType->name) === 'sick leave') {
            $hints['attachment_warning'] = $this->getAttachmentRequirementMessage($leaveType);
        }
        return $hints;
    }

    /**
     * Validate Vacation Leave: must be filed at least 5 days in advance.
     */
    public function validateVacationLeave(LeaveType $leaveType, array $data): array
    {
        $errors = [];

        if (strtolower($leaveType->name) !== 'vacation leave') {
            return $errors;
        }

        $startDate = null;
        if ($leaveType->date_selection_type === 'specific_dates' && isset($data['dates'])) {
            $validDates = array_filter($data['dates'], function ($d) { return !empty($d); });
            if (!empty($validDates)) {
                $startDate = Carbon::parse(min($validDates));
            }
        } elseif (isset($data['start_date'])) {
            $startDate = Carbon::parse($data['start_date']);
        }

        if (!$startDate) {
            return $errors;
        }

        $today = Carbon::today();
        $daysDifference = $today->diffInDays($startDate, false);

        if ($daysDifference < 5) {
            $errors['start_date'] = "Vacation Leave must be filed at least 5 calendar days before the start date. Please select a start date on or after " . $today->addDays(5)->toDateString();
        }

        return $errors;
    }

    /**
     * Calculate the With Pay / Without Pay breakdown for a leave request.
     * Vacation and Sick Leave reserve 1 day, so available_with_pay = balance - 1.
     * Other leave types: all days are With Pay (and balance validation is enforced elsewhere).
     */
    public function calculatePayBreakdown(LeaveType $leaveType, int $requestedDays, float $currentBalance): array
    {
        $name = strtolower($leaveType->name);
        $isVacationOrSick = in_array($name, ['vacation leave', 'sick leave']);

        if ($isVacationOrSick && $leaveType->requires_balance) {
            $reserved = 1;
            $availableWithPay = max(0, $currentBalance - $reserved);

            if ($requestedDays <= $availableWithPay) {
                return ['with_pay' => $requestedDays, 'without_pay' => 0];
            } else {
                return [
                    'with_pay' => (int) floor($availableWithPay),
                    'without_pay' => $requestedDays - (int) floor($availableWithPay),
                ];
            }
        }

        // For other leave types that require balance, all days are With Pay.
        // Balance enforcement is done separately (strict check).
        return ['with_pay' => $requestedDays, 'without_pay' => 0];
    }

    /**
     * Check if the employee has sufficient balance for leave types other than Vacation/Sick.
     * For Vacation/Sick, this is not enforced as a hard limit because the breakdown handles it.
     */
    public function hasSufficientBalance(LeaveType $leaveType, int $requestedDays, float $currentBalance): bool
    {
        $name = strtolower($leaveType->name);
        $isVacationOrSick = in_array($name, ['vacation leave', 'sick leave']);

        if ($isVacationOrSick) {
            // Always allow because we split into With Pay / Without Pay
            return true;
        }

        // Strict check for all other types
        return $requestedDays <= $currentBalance;
    }





    /**
 * Get the duration in days for a study leave purpose.
 */
public function getStudyLeaveDuration(string $purpose): int
{
    return match ($purpose) {
        'masters_completion' => 120, // 4 months × 30 days
        'bar_board_review'   => 180, // 6 months × 30 days
        default              => 0,
    };
}




/**
 * Validate Wellness Leave dates.
 * Rules:
 * - Max 5 days total.
 * - No block of more than 3 consecutive days.
 * - If total days = 5, must be exactly two blocks: one of 3 days and one of 2 days,
 *   with at least one day gap between blocks.
 *
 * @param LeaveType $leaveType
 * @param array $selectedDates Array of date strings (Y-m-d)
 * @return array Errors (field => message)
 */
public function validateWellnessLeave(LeaveType $leaveType, array $selectedDates): array
{
    $errors = [];

    if (strtolower($leaveType->name) !== 'wellness leave') {
        return $errors;
    }

    if (empty($selectedDates)) {
        $errors['dates'] = 'Please select at least one date for Wellness Leave.';
        return $errors;
    }

    // Convert to Carbon, sort, and unique
    $dates = array_unique($selectedDates);
    sort($dates);
    $carbonDates = array_map(fn($d) => Carbon::parse($d), $dates);

    // 1. Max 5 days
    if (count($carbonDates) > 5) {
        $errors['wellness_total'] = 'Wellness Leave cannot exceed 5 days. You selected ' . count($carbonDates) . ' days.';
        return $errors;
    }

    // 2. Find consecutive blocks
    $blocks = [];
    $currentBlock = [$carbonDates[0]];
    for ($i = 1; $i < count($carbonDates); $i++) {
        $prev = $carbonDates[$i - 1];
        $current = $carbonDates[$i];
        $diff = $prev->diffInDays($current);
        if ($diff == 1) {
            $currentBlock[] = $current;
        } else {
            $blocks[] = $currentBlock;
            $currentBlock = [$current];
        }
    }
    $blocks[] = $currentBlock;

    // 3. Check each block length <= 3
    foreach ($blocks as $index => $block) {
        if (count($block) > 3) {
            $errors['wellness_consecutive'] = 'Wellness Leave cannot be taken in blocks longer than 3 consecutive days.';
            return $errors;
        }
    }

    // 4. If total == 5, ensure exactly two blocks of sizes 3 and 2 with at least one day gap
    if (count($carbonDates) == 5) {
        if (count($blocks) !== 2) {
            $errors['wellness_split'] = 'Wellness Leave of 5 days must be split into two separate blocks (3 days and 2 days) with at least one day between them.';
            return $errors;
        }

        $sizes = array_map(fn($b) => count($b), $blocks);
        sort($sizes);
        if ($sizes !== [2, 3]) {
            $errors['wellness_split'] = 'Wellness Leave of 5 days must be split into blocks of 3 days and 2 days.';
            return $errors;
        }

        // Check there is at least one day gap between the two blocks
        $gap = $blocks[1][0]->diffInDays($blocks[0][count($blocks[0])-1]);
        if ($gap <= 1) {
            $errors['wellness_gap'] = 'The two blocks of Wellness Leave must be separated by at least one day.';
            return $errors;
        }
    }

    return $errors;
}


}
