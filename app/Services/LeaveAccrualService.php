<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\LeaveCreditTransaction;
use App\Models\LeaveType;
use App\Models\LeaveAccrualLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LeaveAccrualService
{
    /**
     * Run monthly accrual for all active employees.
     */
  public function runMonthlyAccrual(int $year, int $month, bool $force = false): array
{
    // Check for existing log
    if (!$force && LeaveAccrualLog::where('year', $year)->where('month', $month)->exists()) {
        Log::info("Monthly accrual for {$year}-{$month} already processed.");
        return ['processed' => false, 'reason' => 'Already processed'];
    }

    // Active users
    $activeUserIds = User::where('status', 'active')->pluck('id');
    if ($activeUserIds->isEmpty()) {
        return ['processed' => false, 'reason' => 'No active users'];
    }

    $employees = Employee::whereIn('user_id', $activeUserIds)->get();
    $processedCount = 0;

    DB::transaction(function () use ($employees, $year, $month, &$processedCount) {
        foreach ($employees as $employee) {
            $this->accrueForEmployee($employee, $year, $month);
            $processedCount++;
        }
        LeaveAccrualLog::create([
            'year' => $year,
            'month' => $month,
            'processed_count' => $processedCount,
        ]);
    });

    return [
        'processed' => true,
        'processed_count' => $processedCount,
        'year' => $year,
        'month' => $month,
    ];
}



    /**
     * Accrue VL and SL for a single employee.
     */
    private function accrueForEmployee(Employee $employee, int $year, int $month): void
    {
        $vlType = LeaveType::where('code', 'VL')->first();
        $slType = LeaveType::where('code', 'SL')->first();

        if (!$vlType || !$slType) {
            Log::error("Leave types VL or SL not found.");
            return;
        }

        $this->createAccrualTransaction($employee->id, $vlType->id, 1.25, $year, $month);
        $this->createAccrualTransaction($employee->id, $slType->id, 1.25, $year, $month);

        Log::debug("Accrued 1.25 VL and 1.25 SL for employee {$employee->id}");
    }

    /**
     * Create a single accrual transaction and update balance_after.
     */
    private function createAccrualTransaction(int $employeeId, int $leaveTypeId, float $amount, int $year, int $month): void
    {
        // Get current balance from the last transaction
        $lastTransaction = LeaveCreditTransaction::where('employee_id', $employeeId)
            ->where('leave_type_id', $leaveTypeId)
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->first();

        $previousBalance = $lastTransaction ? $lastTransaction->balance_after : 0;
        $newBalance = $previousBalance + $amount;

        LeaveCreditTransaction::create([
            'employee_id' => $employeeId,
            'leave_type_id' => $leaveTypeId,
            'transaction_type' => 'MONTHLY_CREDIT',
            'amount' => $amount,
            'balance_after' => $newBalance,
            'transaction_date' => now(),
             'period_month' => $month,
        'period_year' => $year,
        'description' => "Monthly accrual for " . \Carbon\Carbon::createFromDate($year, $month, 1)->format('F Y'),
            'created_by' => null, // system, no user

        ]);
    }
}
