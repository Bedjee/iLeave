<?php

namespace App\Services;


use App\Models\LeaveRequest;
use App\Models\LeaveRequestDetail;
use App\Models\LeaveRequestDate;
use App\Models\LeaveType;
use App\Models\LeaveBalance;
use App\Models\Employee;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;

class LeaveRequestService
{
    /**
     * Calculate working days (excluding weekends) for a date range.
     * Later we can add holiday exclusion.
     */
    public static function calculateWorkingDays($startDate, $endDate): float
    {
        $period = CarbonPeriod::create($startDate, $endDate);
        $workingDays = 0;

        foreach ($period as $date) {
            // Exclude weekends (Saturday=6, Sunday=0)
            if (!in_array($date->dayOfWeek, [Carbon::SATURDAY, Carbon::SUNDAY])) {
                $workingDays++;
            }
        }

        return (float) $workingDays;
    }

    /**
     * Calculate total days from selected specific dates.
     */
    public static function calculateTotalDaysFromDates(array $leaveDates): float
    {
        // In real implementation, you might filter only working days.
        // For now, we simply count the dates (assuming they are already working days)
        return (float) count($leaveDates);
    }

    /**
     * Create a leave request with its details and dates in a transaction.
     */


    // Add a method to validate leave credits (if required)
public static function checkLeaveCredits($employeeId, $leaveTypeId, $daysRequested): bool
{
    $leaveType = LeaveType::findOrFail($leaveTypeId);
    if (!$leaveType->requires_balance) {
        return true; // no balance check needed
    }

    $balance = LeaveBalance::where('employee_id', $employeeId)
        ->where('leave_type_id', $leaveTypeId)
        ->value('balance') ?? 0;

    return $balance >= $daysRequested;
}

// Refactor createLeaveRequest to include snapshot capture
public static function createLeaveRequest(array $data, array $dates = [], $employee): LeaveRequest
{
    return DB::transaction(function () use ($data, $dates, $employee) {
        // Capture snapshot of employee at filing time
        $snapshot = [
            'office_department_snapshot' => $employee->department?->department_name,
            'employee_name_snapshot' => $employee->full_name,
            'position_snapshot' => $employee->position,
            'salary_snapshot' => null, // we can later add salary if needed
            'skip_dept_head_approval' => $employee->department?->skip_department_head_approval ?? false, // <-- new
        ];

         $leaveRequestData = array_merge($data, $snapshot, [
            'employee_id' => $employee->id,
            'status' => 'pending',
            'date_filed' => now()->toDateString(),
            'original_number_of_days' => $data['number_of_days'] ?? 0, // 👈 add this
        ]);

        $leaveRequest = LeaveRequest::create($leaveRequestData);

        // Save details
        if (isset($data['detail']) && is_array($data['detail'])) {
            $detailData = array_merge($data['detail'], ['leave_request_id' => $leaveRequest->id]);
            LeaveRequestDetail::create($detailData);
        }

        // Save specific dates
        foreach ($dates as $date) {
            LeaveRequestDate::create([
                'leave_request_id' => $leaveRequest->id,
                'leave_date' => $date,
            ]);
        }

        return $leaveRequest;
    });
}



/**
 * Calculate total calendar days between two dates (inclusive).
 */
public static function calculateCalendarDays($startDate, $endDate): int
{
    $start = Carbon::parse($startDate);
    $end = Carbon::parse($endDate);
    return $end->diffInDays($start) + 1;
}



/**
 * Count working days (Monday–Friday) from an array of date strings.
 */
public static function countWorkingDaysFromDates(array $dates): int
{
    $count = 0;
    foreach ($dates as $dateStr) {
        $date = Carbon::parse($dateStr);
        if (!in_array($date->dayOfWeek, [Carbon::SATURDAY, Carbon::SUNDAY])) {
            $count++;
        }
    }
    return $count;
}


}
