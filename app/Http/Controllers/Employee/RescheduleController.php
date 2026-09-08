<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\LeaveReschedule;
use App\Services\LeaveRequestService;
use App\Services\LeaveTypeRuleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RescheduleController extends Controller
{
    public function create(LeaveRequest $leaveRequest)
    {
        // Only allow reschedule for fully approved requests
        if ($leaveRequest->status !== 'approved') {
            abort(403, 'Only fully approved leave requests can be rescheduled.');
        }

        $leaveRequest->load(['leaveType', 'dates']);

        return Inertia::render('Employee/Reschedule/Create', [
            'leaveRequest' => $leaveRequest,
        ]);
    }

    public function store(Request $request, LeaveRequest $leaveRequest)
    {
        if ($leaveRequest->status !== 'approved') {
            return redirect()->back()->withErrors(['error' => 'Only fully approved leave requests can be rescheduled.']);
        }

        $validated = $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'dates' => ['nullable', 'array'],
            'dates.*' => ['date'],
            'reason' => ['nullable', 'string', 'max:500'],
            'attachment' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
        ]);

        $leaveType = $leaveRequest->leaveType;
        $oldStartDate = $leaveRequest->start_date;
        $oldEndDate = $leaveRequest->end_date;
        $oldDates = $leaveRequest->dates->pluck('leave_date')->toArray();
        $oldDays = $leaveRequest->number_of_days;

        // Calculate new number of days
        if ($leaveType->date_selection_type === 'specific_dates') {
            $newDates = $validated['dates'] ?? [];
            $newDays = LeaveRequestService::calculateTotalDaysFromDates($newDates);
            $newStartDate = null;
            $newEndDate = null;
        } else {
            $newStartDate = $validated['start_date'];
            $newEndDate = $validated['end_date'];
            // Use calendar days for study leave, working days otherwise
            if (strtolower($leaveType->name) === 'study leave') {
                $newDays = LeaveRequestService::calculateCalendarDays($newStartDate, $newEndDate);
            } else {
                $newDays = LeaveRequestService::calculateWorkingDays($newStartDate, $newEndDate);
            }
            $newDates = [];
        }

        $dayDifference = $oldDays - $newDays; // positive = refund, negative = extra deduction

        // If extra deduction needed, check balance
        if ($dayDifference < 0) {
            $service = new LeaveTypeRuleService();
            $currentBalance = \App\Models\LeaveBalance::where('employee_id', $leaveRequest->employee_id)
                ->where('leave_type_id', $leaveType->id)
                ->value('balance') ?? 0;
            if (!$service->hasSufficientBalance($leaveType, $newDays, $currentBalance)) {
                return redirect()->back()->withErrors([
                    'days' => 'You do not have enough leave credits to cover the additional days.'
                ]);
            }
        }

        // Create reschedule record
        $reschedule = LeaveReschedule::create([
            'leave_request_id' => $leaveRequest->id,
            'old_start_date' => $oldStartDate,
            'old_end_date' => $oldEndDate,
            'old_dates' => $oldDates,
            'new_start_date' => $newStartDate,
            'new_end_date' => $newEndDate,
            'new_dates' => $newDates,
            'old_number_of_days' => $oldDays,
            'new_number_of_days' => $newDays,
            'day_difference' => $dayDifference,
            'reason' => $validated['reason'] ?? null,
            'attachment' => $request->file('attachment')?->store('reschedules', 'public'),
            'status' => 'pending',
        ]);

        // Optionally: notify HRMO (we'll add notification later)

        return redirect()->route('employee.leave-requests.show', $leaveRequest->id)
            ->with('success', 'Reschedule request submitted successfully. Awaiting review.');
    }


    public function show(LeaveReschedule $reschedule)
{
    // Ensure the reschedule belongs to the employee's leave request
    if ($reschedule->leaveRequest->employee_id !== Auth::user()->employee->id) {
        abort(403, 'Unauthorized access.');
    }

    $reschedule->load(['leaveRequest.leaveType']);

    return Inertia::render('Employee/Reschedule/Show', [
        'reschedule' => $reschedule,
    ]);
}
}
