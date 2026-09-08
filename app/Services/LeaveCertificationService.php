<?php

namespace App\Services;

use App\Models\LeaveRequest;
use App\Models\LeaveCreditCertification;
use App\Models\LeaveCreditCertificationDetail;
use App\Models\LeaveCreditTransaction;
use App\Models\LeaveType;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class LeaveCertificationService
{
    /**
     * Generate certification for a fully approved leave request.
     */
    public function generateCertification(LeaveRequest $leaveRequest): void
    {
        // Check if certification already exists
        if (LeaveCreditCertification::where('leave_request_id', $leaveRequest->id)->exists()) {
            Log::info('Certification already exists for leave request', ['leave_request_id' => $leaveRequest->id]);
            return;
        }

        $employee = $leaveRequest->employee;
        $approvedAt = $leaveRequest->final_approved_at ?? $leaveRequest->updated_at;

        // Find VL and SL leave types
        $vlType = LeaveType::where('name', 'LIKE', '%Vacation%')->first();
        $slType = LeaveType::where('name', 'LIKE', '%Sick%')->first();

        if (!$vlType && !$slType) {
            Log::warning('VL or SL leave types not found for certification', ['leave_request_id' => $leaveRequest->id]);
            return;
        }

        // Prepare data for VL and SL
        $certificationData = [];

        if ($vlType) {
            $certificationData[] = $this->computeLeaveTypeData($employee->id, $vlType, $leaveRequest);
        }
        if ($slType) {
            $certificationData[] = $this->computeLeaveTypeData($employee->id, $slType, $leaveRequest);
        }

       $certification = LeaveCreditCertification::create([
        'employee_id' => $employee->id,
        'leave_request_id' => $leaveRequest->id,
        'certification_date' => $approvedAt,
        'certification_number' => $this->generateCertificationNumber($leaveRequest),
        'remarks' => null,
        'prepared_by' => auth()->id() ?? null, // allow null for backfill
        'certified_by' => auth()->id() ?? null,
    ]);

        // Create details
        foreach ($certificationData as $data) {
            if ($data) {
                LeaveCreditCertificationDetail::create([
                    'leave_credit_certification_id' => $certification->id,
                    'leave_type_id' => $data['leave_type_id'],
                    'total_earned' => $data['total_earned'],
                    'less_this_application' => $data['less_this_application'],
                    'balance' => $data['balance'],
                ]);
            }
        }

        Log::info('Certification generated', [
            'leave_request_id' => $leaveRequest->id,
            'certification_id' => $certification->id,
        ]);
    }

    /**
     * Compute certification data for a specific leave type.
     */
    private function computeLeaveTypeData($employeeId, $leaveType, $leaveRequest)
    {
        // Get all transactions up to the approval date (or certification date)
        // We need total_earned (positive amounts only) and the deduction amount for this request.
        $transactions = LeaveCreditTransaction::where('employee_id', $employeeId)
            ->where('leave_type_id', $leaveType->id)
            ->where('transaction_date', '<=', now())
            ->get();

        // Total earned = sum of all positive transactions (credits)
        $totalEarned = $transactions->where('amount', '>', 0)->sum('amount');

        // Less this application = the deduction for this specific leave request
        // We can find the deduction transaction for this leave request
        $deduction = LeaveCreditTransaction::where('employee_id', $employeeId)
            ->where('leave_type_id', $leaveType->id)
            ->where('reference_type', LeaveRequest::class)
            ->where('reference_id', $leaveRequest->id)
            ->where('amount', '<', 0)
            ->first();

        $lessThisApplication = $deduction ? abs($deduction->amount) : 0;

        // Balance = total_earned - less_this_application
        $balance = $totalEarned - $lessThisApplication;

        return [
            'leave_type_id' => $leaveType->id,
            'total_earned' => $totalEarned,
            'less_this_application' => $lessThisApplication,
            'balance' => $balance,
        ];
    }

    /**
     * Generate a certification number.
     */
    private function generateCertificationNumber(LeaveRequest $leaveRequest): string
    {
        // Format: LCC-YYYY-XXXX (where XXXX is the leave request ID)
        return 'LCC-' . now()->format('Y') . '-' . str_pad($leaveRequest->id, 4, '0', STR_PAD_LEFT);
    }
}
