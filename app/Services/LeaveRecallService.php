<?php

namespace App\Services;

use App\Models\LeaveRequest;
use App\Models\LeaveBalance;
use App\Models\LeaveCreditTransaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LeaveRecallService
{
    public function recall(LeaveRequest $leaveRequest, User $user, ?string $reason = null): void
    {
        if ($leaveRequest->status !== 'approved') {
            throw new \Exception('Only fully approved requests can be recalled.');
        }

        $leaveType = $leaveRequest->leaveType;
        if (!$leaveType || stripos($leaveType->name, 'vacation') === false) {
            throw new \Exception('Only Vacation Leave requests can be recalled.');
        }

        DB::transaction(function () use ($leaveRequest, $user, $reason) {
            $employeeId = $leaveRequest->employee_id;
            $leaveTypeId = $leaveRequest->leave_type_id;
            $daysToRefund = $leaveRequest->number_of_days;

            $balance = LeaveBalance::where('employee_id', $employeeId)
                ->where('leave_type_id', $leaveTypeId)
                ->first();

            if (!$balance) {
                throw new \Exception('Employee balance record not found.');
            }

            $oldBalance = $balance->balance;
            $newBalance = $oldBalance + $daysToRefund;
            $balance->balance = $newBalance;
            $balance->save();

            LeaveCreditTransaction::create([
                'employee_id' => $employeeId,
                'leave_type_id' => $leaveTypeId,
                'transaction_type' => 'LEAVE_RETURN',
                'amount' => $daysToRefund,
                'balance_after' => $newBalance,
                'transaction_date' => now()->toDateString(),
                'period_month' => now()->month,
                'period_year' => now()->year,
                'description' => "Credits refunded due to recall of leave request #{$leaveRequest->id}",
                'reference_type' => LeaveRequest::class,
                'reference_id' => $leaveRequest->id,
                'created_by' => $user->id,
            ]);

            $leaveRequest->status = 'cancelled';
            $leaveRequest->cancelled_at = now();
            $leaveRequest->cancelled_by = $user->id;
            $leaveRequest->cancellation_reason = $reason ?? 'Recalled by ' . $user->name;
            $leaveRequest->save();

            Log::info('Leave request recalled (credits refunded)', [
                'request_id' => $leaveRequest->id,
                'employee_id' => $employeeId,
                'refunded_days' => $daysToRefund,
                'by_user_id' => $user->id,
            ]);
        });
    }
}
