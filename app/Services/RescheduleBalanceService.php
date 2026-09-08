<?php

namespace App\Services;

use App\Models\LeaveReschedule;
use App\Models\LeaveBalance;
use App\Models\LeaveCreditTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RescheduleBalanceService
{
    public function adjustBalance(LeaveReschedule $reschedule): void
    {
        DB::transaction(function () use ($reschedule) {
            $leaveRequest = $reschedule->leaveRequest;
            $employeeId = $leaveRequest->employee_id;
            $leaveTypeId = $leaveRequest->leave_type_id;

            $diff = $reschedule->day_difference; // positive = refund, negative = extra deduction

            if ($diff == 0) {
                return; // no change needed
            }

            // Get current balance
            $balance = LeaveBalance::where('employee_id', $employeeId)
                ->where('leave_type_id', $leaveTypeId)
                ->first();

            if (!$balance) {
                Log::error('Balance record not found for reschedule', ['reschedule_id' => $reschedule->id]);
                return;
            }

            $oldBalance = $balance->balance;
            $newBalance = $oldBalance + $diff; // diff is positive for refund, negative for deduction

            if ($newBalance < 0) {
                throw new \Exception('Insufficient balance to deduct extra days.');
            }

            $balance->balance = $newBalance;
            $balance->save();

            // Create transaction record
            $transactionType = $diff > 0 ? 'LEAVE_RETURN' : 'LEAVE_DEDUCTION';
            LeaveCreditTransaction::create([
                'employee_id' => $employeeId,
                'leave_type_id' => $leaveTypeId,
                'transaction_type' => $transactionType,
                'amount' => $diff,
                'balance_after' => $newBalance,
                'transaction_date' => now()->toDateString(),
                'period_month' => now()->month,
                'period_year' => now()->year,
                'description' => "Reschedule adjustment for request #{$leaveRequest->id}",
                'reference_type' => LeaveRequest::class,
                'reference_id' => $leaveRequest->id,
                'created_by' => auth()->id(),
            ]);

            Log::info('Reschedule balance adjustment completed', [
                'reschedule_id' => $reschedule->id,
                'employee_id' => $employeeId,
                'leave_type_id' => $leaveTypeId,
                'diff' => $diff,
                'old_balance' => $oldBalance,
                'new_balance' => $newBalance,
            ]);
        });
    }
}
