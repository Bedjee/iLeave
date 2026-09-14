<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\EmployeeSeparation;
use App\Models\LeaveCreditTransaction;
use App\Models\LeaveType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EmployeeSeparationService
{
    /**
     * Separate an employee: mark inactive, compute final accrual, record history.
     */
    public function separate(Employee $employee, string $reason, User $processedBy, ?string $remarks = null): EmployeeSeparation
    {
        return DB::transaction(function () use ($employee, $reason, $processedBy, $remarks) {
            $user = $employee->user;
            $today = now();

            // Update user status
            $user->status = 'inactive';
            $user->separated_at = $today;
            $user->separation_reason = $reason;
            $user->save();

            // Create separation record
            $separation = EmployeeSeparation::create([
                'employee_id' => $employee->id,
                'separation_date' => $today->toDateString(),
                'reason' => $reason,
                'status' => 'active',
                'credits_claimed' => false,
                'processed_by' => $processedBy->id,
                'remarks' => $remarks,
            ]);

            // Compute final accrual
            $accrual = $this->computeFinalAccrual($today);
            $separation->final_accrual_vl = $accrual;
            $separation->final_accrual_sl = $accrual;
            $separation->save();

            // Create transactions if accrual > 0
            if ($accrual > 0) {
                $this->creditFinalAccrual($employee, $separation, $accrual, $today);
            }

            Log::info('Employee separated', [
                'employee_id' => $employee->id,
                'reason' => $reason,
                'separation_id' => $separation->id,
                'accrual' => $accrual,
            ]);

            return $separation;
        });
    }

    /**
     * Rehire an employee: reverse credits if not claimed, mark separation reversed.
     */
    public function rehire(Employee $employee, User $rehiredBy): void
    {
        DB::transaction(function () use ($employee, $rehiredBy) {
            $user = $employee->user;

            // Find active separation
            $separation = EmployeeSeparation::where('employee_id', $employee->id)
                ->where('status', 'active')
                ->latest('separation_date')
                ->first();

            if ($separation) {
                if (!$separation->credits_claimed) {
                    // Reverse the final accrual
                    $this->reverseFinalAccrual($employee, $separation);
                    $separation->remarks = trim(($separation->remarks ?? '') . "\nReversal applied on rehire.");
                } else {
                    // Skip reversal - credits already claimed
                    $separation->remarks = trim(($separation->remarks ?? '') . "\nNo reversal - credits claimed via Terminal Leave.");
                }

                $separation->status = 'reversed';
                $separation->reversed_at = now();
                $separation->reversed_by = $rehiredBy->id;
                $separation->save();
            }

            // Restore user status
            $user->status = 'active';
            $user->separated_at = null;
            $user->separation_reason = null;
            $user->save();

            Log::info('Employee rehired', [
                'employee_id' => $employee->id,
                'separation_id' => $separation?->id,
                'reversal_applied' => $separation && !$separation->credits_claimed,
            ]);
        });
    }

    /**
     * Mark an active separation's final accrual as claimed (called on Terminal Leave payout).
     */
    public function markCreditsClaimed(Employee $employee): void
    {
        $separation = EmployeeSeparation::where('employee_id', $employee->id)
            ->where('status', 'active')
            ->latest('separation_date')
            ->first();

        if ($separation) {
            $separation->credits_claimed = true;
            $separation->save();
        }
    }

    /**
     * Prorated accrual for the current month up to and including the separation date.
     * Formula: days_served × (1.25 / 30)
     */
    private function computeFinalAccrual(Carbon $separationDate): float
    {
        $daysServed = $separationDate->day; // day 1 to day N of the month
        $dailyRate = 1.25 / 30;
        return round($daysServed * $dailyRate, 4);
    }

    /**
     * Create FINAL_ACCRUAL transactions for VL and SL.
     */
    private function creditFinalAccrual(Employee $employee, EmployeeSeparation $separation, float $amount, Carbon $date): void
    {
        $vlType = LeaveType::where('code', 'VL')->first();
        $slType = LeaveType::where('code', 'SL')->first();

        if (!$vlType || !$slType) {
            Log::error('VL or SL leave type not found for final accrual.');
            return;
        }

        $this->createTransaction($employee->id, $vlType->id, $amount, $separation, $date);
        $this->createTransaction($employee->id, $slType->id, $amount, $separation, $date);
    }

    /**
     * Create reversal transactions (negative amounts) for VL and SL.
     */
    private function reverseFinalAccrual(Employee $employee, EmployeeSeparation $separation): void
    {
        $vlType = LeaveType::where('code', 'VL')->first();
        $slType = LeaveType::where('code', 'SL')->first();

        if (!$vlType || !$slType) {
            Log::error('VL or SL leave type not found for reversal.');
            return;
        }

        $this->createTransaction($employee->id, $vlType->id, -$separation->final_accrual_vl, $separation, now(), 'FINAL_ACCRUAL_REVERSAL');
        $this->createTransaction($employee->id, $slType->id, -$separation->final_accrual_sl, $separation, now(), 'FINAL_ACCRUAL_REVERSAL');
    }

    /**
     * Helper: insert a LeaveCreditTransaction with running balance.
     */
    private function createTransaction(int $employeeId, int $leaveTypeId, float $amount, EmployeeSeparation $separation, Carbon $date, string $type = 'FINAL_ACCRUAL'): void
    {
        $last = LeaveCreditTransaction::where('employee_id', $employeeId)
            ->where('leave_type_id', $leaveTypeId)
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->first();

        $previous = $last ? (float) $last->balance_after : 0;
        $newBalance = $previous + $amount;

        LeaveCreditTransaction::create([
            'employee_id' => $employeeId,
            'leave_type_id' => $leaveTypeId,
            'transaction_type' => $type,
            'amount' => $amount,
            'balance_after' => $newBalance,
            'transaction_date' => $date,
            'period_month' => $date->month,
            'period_year' => $date->year,
            'description' => $type === 'FINAL_ACCRUAL'
                ? "Final accrual for separation on {$date->toDateString()}"
                : "Reversal of final accrual (rehired on {$date->toDateString()})",
            'reference_type' => EmployeeSeparation::class,
            'reference_id' => $separation->id,
            'created_by' => null,
        ]);
    }
}