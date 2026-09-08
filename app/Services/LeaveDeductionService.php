<?php

namespace App\Services;

use App\Models\LeaveRequest;
use App\Models\LeaveBalance;
use App\Models\LeaveCreditTransaction;
use App\Models\LeaveType;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LeaveDeductionService
{
    /**
     * Deduct leave credits for an approved leave request.
     *
     * @param LeaveRequest $leaveRequest
     * @throws \Exception
     */
    public function deduct(LeaveRequest $leaveRequest): void
    {
        DB::transaction(function () use ($leaveRequest) {
            $employeeId = $leaveRequest->employee_id;
            $requestType = $leaveRequest->request_type ?? 'leave';

            if ($requestType === 'leave') {
                // Normal leave: deduct from the specific leave type
                $this->deductNormalLeave($leaveRequest);
            } elseif ($requestType === 'monetization') {
                // Monetization: deduct from VL balance
                $this->deductMonetization($leaveRequest);
            } elseif ($requestType === 'terminal_leave') {
                // Terminal Leave: deduct from VL and SL balances
                $this->deductTerminalLeave($leaveRequest);
            } else {
                Log::warning('Unknown request type for deduction', ['request_id' => $leaveRequest->id, 'type' => $requestType]);
            }
        });
    }

    /**
     * Deduct normal leave credits.
     */
    private function deductNormalLeave(LeaveRequest $leaveRequest): void
    {
        $employeeId = $leaveRequest->employee_id;
        $leaveTypeId = $leaveRequest->leave_type_id;
        $days = $leaveRequest->number_of_days;

        if (!$leaveTypeId) {
            Log::error('Normal leave request missing leave_type_id', ['request_id' => $leaveRequest->id]);
            return;
        }

        // Get the current balance
        $balance = LeaveBalance::where('employee_id', $employeeId)
            ->where('leave_type_id', $leaveTypeId)
            ->first();

        if (!$balance) {
            Log::warning('No balance record found for deduction', [
                'employee_id' => $employeeId,
                'leave_type_id' => $leaveTypeId,
                'request_id' => $leaveRequest->id,
            ]);
            return;
        }

        $oldBalance = $balance->balance;
        $newBalance = max(0, $oldBalance - $days); // Ensure not negative

        // Update balance
        $balance->balance = $newBalance;
        $balance->save();

        // Create transaction record
        LeaveCreditTransaction::create([
            'employee_id' => $employeeId,
            'leave_type_id' => $leaveTypeId,
            'transaction_type' => 'LEAVE_DEDUCTION',
            'amount' => -$days,
            'balance_after' => $newBalance,
            'transaction_date' => now()->toDateString(),
            'period_month' => now()->month,
            'period_year' => now()->year,
            'description' => "Deduction for approved leave request #{$leaveRequest->id}",
            'reference_type' => LeaveRequest::class,
            'reference_id' => $leaveRequest->id,
            'created_by' => auth()->id(),
        ]);

        Log::info('Leave deduction completed', [
            'request_id' => $leaveRequest->id,
            'employee_id' => $employeeId,
            'leave_type_id' => $leaveTypeId,
            'days' => $days,
            'old_balance' => $oldBalance,
            'new_balance' => $newBalance,
        ]);
    }

    /**
     * Deduct monetization: only from Vacation Leave.
     */
    private function deductMonetization(LeaveRequest $leaveRequest): void
    {
        $employeeId = $leaveRequest->employee_id;
        $days = $leaveRequest->monetized_days ?? 0;

        if ($days <= 0) {
            Log::warning('Monetization request has zero days', ['request_id' => $leaveRequest->id]);
            return;
        }

        // Find Vacation Leave type
        $vlType = LeaveType::where('name', 'LIKE', '%Vacation%')->first();
        if (!$vlType) {
            Log::error('Vacation Leave type not found for monetization deduction', ['request_id' => $leaveRequest->id]);
            return;
        }

        $balance = LeaveBalance::where('employee_id', $employeeId)
            ->where('leave_type_id', $vlType->id)
            ->first();

        if (!$balance) {
            Log::warning('No VL balance found for monetization', [
                'employee_id' => $employeeId,
                'request_id' => $leaveRequest->id,
            ]);
            return;
        }

        $oldBalance = $balance->balance;
        $newBalance = max(0, $oldBalance - $days);

        $balance->balance = $newBalance;
        $balance->save();

        LeaveCreditTransaction::create([
            'employee_id' => $employeeId,
            'leave_type_id' => $vlType->id,
            'transaction_type' => 'LEAVE_DEDUCTION',
            'amount' => -$days,
            'balance_after' => $newBalance,
            'transaction_date' => now()->toDateString(),
            'period_month' => now()->month,
            'period_year' => now()->year,
            'description' => "Monetization deduction for request #{$leaveRequest->id}",
            'reference_type' => LeaveRequest::class,
            'reference_id' => $leaveRequest->id,
            'created_by' => auth()->id(),
        ]);

        Log::info('Monetization deduction completed', [
            'request_id' => $leaveRequest->id,
            'employee_id' => $employeeId,
            'days' => $days,
            'old_balance' => $oldBalance,
            'new_balance' => $newBalance,
        ]);
    }

    /**
     * Deduct terminal leave: from VL and SL balances.
     */
    private function deductTerminalLeave(LeaveRequest $leaveRequest): void
    {
        $employeeId = $leaveRequest->employee_id;
        // Terminal leave uses number_of_days as total of VL+SL
        $totalDays = $leaveRequest->number_of_days ?? 0;

        if ($totalDays <= 0) {
            Log::warning('Terminal Leave request has zero days', ['request_id' => $leaveRequest->id]);
            return;
        }

        // Find VL and SL leave types
        $vlType = LeaveType::where('name', 'LIKE', '%Vacation%')->first();
        $slType = LeaveType::where('name', 'LIKE', '%Sick%')->first();

        if (!$vlType && !$slType) {
            Log::error('VL or SL type not found for terminal leave deduction', ['request_id' => $leaveRequest->id]);
            return;
        }

        // Deduct VL first, then SL
        $remaining = $totalDays;

        if ($vlType) {
            $vlBalance = LeaveBalance::where('employee_id', $employeeId)
                ->where('leave_type_id', $vlType->id)
                ->first();
            if ($vlBalance) {
                $oldVlBalance = $vlBalance->balance;
                $vlDeduct = min($remaining, $oldVlBalance);
                $newVlBalance = $oldVlBalance - $vlDeduct;
                $vlBalance->balance = $newVlBalance;
                $vlBalance->save();

                if ($vlDeduct > 0) {
                    LeaveCreditTransaction::create([
                        'employee_id' => $employeeId,
                        'leave_type_id' => $vlType->id,
                        'transaction_type' => 'LEAVE_DEDUCTION',
                        'amount' => -$vlDeduct,
                        'balance_after' => $newVlBalance,
                        'transaction_date' => now()->toDateString(),
                        'period_month' => now()->month,
                        'period_year' => now()->year,
                        'description' => "Terminal Leave VL deduction for request #{$leaveRequest->id}",
                        'reference_type' => LeaveRequest::class,
                        'reference_id' => $leaveRequest->id,
                        'created_by' => auth()->id(),
                    ]);
                }
                $remaining -= $vlDeduct;
            }
        }

        if ($slType && $remaining > 0) {
            $slBalance = LeaveBalance::where('employee_id', $employeeId)
                ->where('leave_type_id', $slType->id)
                ->first();
            if ($slBalance) {
                $oldSlBalance = $slBalance->balance;
                $slDeduct = min($remaining, $oldSlBalance);
                $newSlBalance = $oldSlBalance - $slDeduct;
                $slBalance->balance = $newSlBalance;
                $slBalance->save();

                if ($slDeduct > 0) {
                    LeaveCreditTransaction::create([
                        'employee_id' => $employeeId,
                        'leave_type_id' => $slType->id,
                        'transaction_type' => 'LEAVE_DEDUCTION',
                        'amount' => -$slDeduct,
                        'balance_after' => $newSlBalance,
                        'transaction_date' => now()->toDateString(),
                        'period_month' => now()->month,
                        'period_year' => now()->year,
                        'description' => "Terminal Leave SL deduction for request #{$leaveRequest->id}",
                        'reference_type' => LeaveRequest::class,
                        'reference_id' => $leaveRequest->id,
                        'created_by' => auth()->id(),
                    ]);
                }
                $remaining -= $slDeduct;
            }
        }

        Log::info('Terminal Leave deduction completed', [
            'request_id' => $leaveRequest->id,
            'employee_id' => $employeeId,
            'total_days' => $totalDays,
            'remaining_after_deduction' => $remaining,
        ]);
    }
}
