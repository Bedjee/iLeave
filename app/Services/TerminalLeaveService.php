<?php

namespace App\Services;

use App\Models\LeaveRequest;
use App\Models\LeaveCreditTransaction;
use App\Models\LeaveType;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TerminalLeaveService
{
    /**
     * Process the separation for an approved Terminal Leave request.
     * Idempotent – will not run twice.
     */
    public function processSeparation(LeaveRequest $leaveRequest): void
    {
        // Only terminal leave and approved
        if ($leaveRequest->request_type !== 'terminal_leave' || $leaveRequest->status !== 'approved') {
            return;
        }

        // Already processed?
        if ($leaveRequest->separation_processed) {
            Log::info("Terminal leave separation already processed for request {$leaveRequest->id}");
            return;
        }

        // Double-check via transactions (extra safety)
        $existing = LeaveCreditTransaction::where('reference_type', get_class($leaveRequest))
            ->where('reference_id', $leaveRequest->id)
            ->where('transaction_type', 'FINAL_ACCRUAL')
            ->exists();

        if ($existing) {
            $leaveRequest->separation_processed = true;
            $leaveRequest->save();
            Log::warning("FINAL_ACCRUAL already exists for terminal leave {$leaveRequest->id}. Marked as processed.");
            return;
        }

        DB::transaction(function () use ($leaveRequest) {
            // 1. Determine separation date (use end_date, fallback to now)
            $separationDate = $leaveRequest->end_date ? Carbon::parse($leaveRequest->end_date) : now();
            $month = $separationDate->month;
            $year = $separationDate->year;

            // 2. Days served in the separation month (from the 1st to separation date inclusive)
            $startOfMonth = Carbon::createFromDate($year, $month, 1);
            $daysServed = $startOfMonth->diffInDays($separationDate) + 1;

            // 3. Daily accrual rate: 1.25 / 30 = 0.0416667 (rounded to 4 decimals)
            $dailyRate = 1.25 / 30;
            $accrualAmount = round($daysServed * $dailyRate, 4);

            // 4. Get VL and SL leave types
            $vlType = LeaveType::where('code', 'VL')->first();
            $slType = LeaveType::where('code', 'SL')->first();

            if (!$vlType || !$slType) {
                throw new \Exception("Leave types VL or SL not found.");
            }

            // 5. Current balances (to calculate balance_after)
            $vlBalance = LeaveCreditTransaction::getCurrentBalance($leaveRequest->employee_id, $vlType->id);
            $slBalance = LeaveCreditTransaction::getCurrentBalance($leaveRequest->employee_id, $slType->id);

            // 6. Create FINAL_ACCRUAL transactions
            LeaveCreditTransaction::create([
                'employee_id' => $leaveRequest->employee_id,
                'leave_type_id' => $vlType->id,
                'transaction_type' => 'FINAL_ACCRUAL',
                'amount' => $accrualAmount,
                'balance_after' => $vlBalance + $accrualAmount,
                'transaction_date' => now(),
                'period_month' => $month,
                'period_year' => $year,
                'description' => "Final accrual due to Terminal Leave separation on {$separationDate->toDateString()}",
                'reference_type' => get_class($leaveRequest),
                'reference_id' => $leaveRequest->id,
                'created_by' => null,
            ]);

            LeaveCreditTransaction::create([
                'employee_id' => $leaveRequest->employee_id,
                'leave_type_id' => $slType->id,
                'transaction_type' => 'FINAL_ACCRUAL',
                'amount' => $accrualAmount,
                'balance_after' => $slBalance + $accrualAmount,
                'transaction_date' => now(),
                'period_month' => $month,
                'period_year' => $year,
                'description' => "Final accrual due to Terminal Leave separation on {$separationDate->toDateString()}",
                'reference_type' => get_class($leaveRequest),
                'reference_id' => $leaveRequest->id,
                'created_by' => null,
            ]);

            // 7. Mark as processed
            $leaveRequest->separation_processed = true;
            $leaveRequest->save();

            // 8. Set user status to inactive
            $user = $leaveRequest->employee->user;
            if ($user) {
                $user->status = 'inactive';
                $user->save();
                Log::info("User {$user->id} set to inactive due to terminal leave request {$leaveRequest->id}");
            }

            Log::info("Terminal leave separation completed for request {$leaveRequest->id}", [
                'employee_id' => $leaveRequest->employee_id,
                'separation_date' => $separationDate->toDateString(),
                'days_served' => $daysServed,
                'accrual_amount' => $accrualAmount,
            ]);
        });
    }
}