<?php

namespace App\Http\Controllers\DepartmentHead;

use App\Http\Controllers\Controller;
use App\Models\LeaveReschedule;
use App\Models\LeaveBalance;
use App\Services\RescheduleBalanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RescheduleController extends Controller
{
    /**
     * Display reschedule requests pending Department Head approval.
     */
    public function index()
{
    $user = Auth::user();
    $employee = $user->employee;

    if (!$employee || !$employee->department_id) {
        return Inertia::render('DepartmentHead/Reschedules/Index', [
            'pendingReschedules' => [],
            'approvedReschedules' => [],
            'department' => null,
        ]);
    }

    $departmentId = $employee->department_id;

    // Pending: certified (awaiting Department Head approval)
    $pendingReschedules = LeaveReschedule::with([
        'leaveRequest.employee',
        'leaveRequest.leaveType',
        'leaveRequest.dates'
    ])
    ->where('status', 'certified')
    ->whereHas('leaveRequest.employee', function ($q) use ($departmentId) {
        $q->where('department_id', $departmentId);
    })
    ->orderBy('created_at', 'asc')
    ->get();

    // Approved: already approved by this Department Head
    $approvedReschedules = LeaveReschedule::with([
        'leaveRequest.employee',
        'leaveRequest.leaveType',
        'leaveRequest.dates'
    ])
    ->where('status', 'approved')
    ->where('approved_by', Auth::id())
    ->whereHas('leaveRequest.employee', function ($q) use ($departmentId) {
        $q->where('department_id', $departmentId);
    })
    ->orderBy('approved_at', 'desc')
    ->get();

    return Inertia::render('DepartmentHead/Reschedules/Index', [
        'pendingReschedules' => $pendingReschedules,
        'approvedReschedules' => $approvedReschedules,
        'department' => $employee->department?->department_name,
    ]);
}

    /**
     * Display the specified reschedule request.
     */
    public function show(LeaveReschedule $reschedule)
    {
        // Authorization: ensure it belongs to the head's department
        // Allow viewing if status is 'certified' or 'approved'
        $this->authorizeViewReschedule($reschedule);

        $reschedule->load([
            'leaveRequest.employee',
            'leaveRequest.leaveType',
            'leaveRequest.dates'
        ]);

        return Inertia::render('DepartmentHead/Reschedules/Show', [
            'reschedule' => $reschedule,
        ]);
    }

    /**
     * Approve a reschedule request.
     */
   public function approve(LeaveReschedule $reschedule)
    {
        $this->authorizeActionReschedule($reschedule);

        if ($reschedule->status !== 'certified') {
            return redirect()->back()->withErrors(['error' => 'This reschedule is not certified.']);
        }

        // Approve the reschedule
        $reschedule->status = 'approved';
        $reschedule->approved_at = now();
        $reschedule->approved_by = Auth::id();
        $reschedule->save();

        // Adjust the employee's leave balance
        $service = new RescheduleBalanceService();
        $service->adjustBalance($reschedule);

        // Update the original leave request dates
        $leaveRequest = $reschedule->leaveRequest;
        $leaveRequest->start_date = $reschedule->new_start_date;
        $leaveRequest->end_date = $reschedule->new_end_date;
        $leaveRequest->dates()->delete();
        if ($reschedule->new_dates && count($reschedule->new_dates) > 0) {
            foreach ($reschedule->new_dates as $date) {
                $leaveRequest->dates()->create(['leave_date' => $date]);
            }
        }
        $leaveRequest->number_of_days = $reschedule->new_number_of_days;
        $leaveRequest->save();

        return redirect()->back()->with('success', 'Reschedule request approved.');
    }

    /**
     * Reject a reschedule request.
     */
    public function reject(Request $request, LeaveReschedule $reschedule)
    {
        $this->authorizeActionReschedule($reschedule);

        if ($reschedule->status !== 'certified') {
            return redirect()->back()->withErrors(['error' => 'This reschedule is not certified.']);
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $reschedule->status = 'rejected';
        $reschedule->rejection_reason = $validated['reason'];
        $reschedule->save();

        return redirect()->back()->with('success', 'Reschedule request rejected.');
    }

    /**
     * Authorization: ensure the reschedule belongs to the head's department.
     */
     private function authorizeViewReschedule(LeaveReschedule $reschedule)
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee || !$employee->department_id) {
            abort(403, 'You are not authorized.');
        }

        if ($reschedule->leaveRequest->employee->department_id !== $employee->department_id) {
            abort(403, 'This reschedule does not belong to your department.');
        }

        // Allow viewing if status is 'certified' or 'approved'
        if (!in_array($reschedule->status, ['certified', 'approved'])) {
            abort(403, 'This reschedule is not available for viewing.');
        }
    }

    /**
     * Authorization for actions (approve/reject): requires 'certified' status.
     */
    private function authorizeActionReschedule(LeaveReschedule $reschedule)
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee || !$employee->department_id) {
            abort(403, 'You are not authorized.');
        }

        if ($reschedule->leaveRequest->employee->department_id !== $employee->department_id) {
            abort(403, 'This reschedule does not belong to your department.');
        }

        if ($reschedule->status !== 'certified') {
            abort(403, 'This reschedule is not pending your approval.');
        }
    }



}