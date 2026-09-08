<?php

namespace App\Services;

use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class LeaveWorkflowService
{
    /**
     * Determine if department head approval should be skipped
     * based on the CURRENT department setting (not the snapshot).
     */
    public function shouldSkipDepartmentHead(LeaveRequest $leaveRequest): bool
{
    // Department special skip
    $department = $leaveRequest->employee->department;
    if ($department && $department->skip_department_head_approval) {
        return true;
    }

    // 👇 Department Head's own requests skip DH approval
    $user = $leaveRequest->employee->user;
    if ($user && $user->role === 'department_head') {
        return true;
    }

    return false;
}

    /**
     * Handle workflow after HRMO certifies the request.
     * Auto-promote if the current department setting says to skip.
     */
    /**
 * Check if the leave request was filed by an Admin user.
 */
public function isAdminRequest(LeaveRequest $leaveRequest): bool
{
    $user = $leaveRequest->employee->user;
    return $user && $user->role === 'admin';
}

/**
 * Handle workflow after HRMO certifies the request.
 */
public function handleHrmoCertification(LeaveRequest $leaveRequest): void
{
    // Mayor's requests: keep certified, no further steps.
    if ($this->isMayorRequest($leaveRequest)) {
        // Status already 'certified' – do nothing
        return;
    }

    // Admin requests → go to Mayor
    if ($this->isAdminRequest($leaveRequest)) {
        $leaveRequest->status = 'mayor_pending';
        $leaveRequest->save();
        Log::info('Admin leave request sent to Mayor for approval', [
            'leave_request_id' => $leaveRequest->id,
            'employee_id' => $leaveRequest->employee_id,
        ]);
        return;
    }

    // Otherwise, check special department skip
    if ($this->shouldSkipDepartmentHead($leaveRequest)) {
        $leaveRequest->status = 'department_approved';
        $leaveRequest->approved_at = null;
        $leaveRequest->approved_by = null;
        $leaveRequest->save();

        Log::info('Department Head approval automatically bypassed (special department)', [
            'leave_request_id' => $leaveRequest->id,
            'employee_id' => $leaveRequest->employee_id,
            'department_id' => $leaveRequest->employee->department_id,
        ]);
    }
    // Otherwise, keep status = 'certified' for Department Head action.
}

    /**
     * Check if a Department Head user can approve/reject this request.
     * Uses current department setting.
     */
    public function canDepartmentHeadApprove(LeaveRequest $leaveRequest, User $user): bool
    {
        $employee = $leaveRequest->employee;
        if (!$employee || !$employee->department) {
            return false;
        }
        $headEmployee = $employee->department->head;
        if (!$headEmployee || $headEmployee->user_id !== $user->id) {
            return false;
        }
        // Must NOT skip approval
        return !$this->shouldSkipDepartmentHead($leaveRequest);
    }


    /**
 * Check if the requester is a Mayor.
 */
public function isMayorRequest(LeaveRequest $leaveRequest): bool
{
    $user = $leaveRequest->employee->user;
    return $user && $user->role === 'mayor';
}



}
