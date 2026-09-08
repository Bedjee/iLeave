<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\StoreLeaveRequestRequest;
use App\Models\LeaveBalance;
use App\Events\LeaveRequestCreated;
use App\Models\LeaveType;
use App\Models\LeaveRequest;
use App\Services\LeaveRequestService;
use App\Services\LeaveTypeRuleService;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LeaveRequestController extends Controller
{
    public function create()
    {
        $employee = Auth::user()->employee;
        $leaveTypes = LeaveType::where('status', true)->get();
        $balances = LeaveBalance::where('employee_id', $employee->id)
            ->get()
            ->keyBy('leave_type_id')
            ->map(function ($item) {
                return (float) $item->balance;
            })
            ->toArray();

        // Check if employee has already taken Maternity Leave
        $hasTakenMaternityLeave = LeaveRequest::where('employee_id', $employee->id)
            ->whereHas('leaveType', function ($query) {
                $query->where('name', 'LIKE', '%maternity%');
            })
            ->whereIn('status', ['approved', 'pending', 'certified'])
            ->exists();

        $hasTakenAdoptionLeave = LeaveRequest::where('employee_id', $employee->id)
            ->whereHas('leaveType', function ($query) {
                $query->where('name', 'LIKE', '%adoption%');
            })
            ->whereIn('status', ['approved', 'pending', 'certified'])
            ->exists();

        // Get VL and SL balances for special requests
        $vlBalance = $this->getBalanceByLeaveTypeName($employee->id, 'Vacation Leave');
        $slBalance = $this->getBalanceByLeaveTypeName($employee->id, 'Sick Leave');

        return Inertia::render('Employee/LeaveRequests/Create', [
            'leaveTypes' => $leaveTypes,
            'balances' => $balances,
            'employee' => [
                'name' => $employee->full_name,
                'position' => $employee->position,
                'department' => $employee->department?->department_name,
            ],
            'hasTakenMaternityLeave' => $hasTakenMaternityLeave,
            'hasTakenAdoptionLeave' => $hasTakenAdoptionLeave,
            'vlBalance' => $vlBalance,
            'slBalance' => $slBalance,
        ]);
    }

    public function store(StoreLeaveRequestRequest $request)
    {
        $employee = Auth::user()->employee;
        $data = $request->validated();

        $requestType = $data['request_type'] ?? 'leave';

        // Handle special request types
        if ($requestType === 'monetization') {
            return $this->storeMonetization($request, $employee);
        } elseif ($requestType === 'terminal_leave') {
            return $this->storeTerminalLeave($request, $employee);
        }

        // Normal leave request flow (existing code)
        return $this->storeLeaveRequest($request, $employee);
    }

   public function index()
{
    $employee = Auth::user()->employee;
    $leaveRequests = LeaveRequest::with(['leaveType', 'detail', 'dates', 'activeReschedule','approvedReschedule' ])
        ->where('employee_id', $employee->id)
        ->orderBy('created_at', 'desc')
        ->get();

    return Inertia::render('Employee/LeaveRequests/Index', [
        'leaveRequests' => $leaveRequests,
    ]);
}

   public function show(LeaveRequest $leaveRequest)
{
    if ($leaveRequest->employee_id !== Auth::user()->employee->id) {
        abort(403, 'Unauthorized access.');
    }

    $leaveRequest->load([
        'leaveType',
        'detail',
        'dates',
        'employee.department',
        'activeReschedule',
        'approvedReschedule'
    ]);




    return Inertia::render('Employee/LeaveRequests/Show', [
        'leaveRequest' => $leaveRequest,
    ]);
}

    // -----------------------------------------------------------
    // Special Request Handlers
    // -----------------------------------------------------------

   private function storeMonetization($request, $employee)
{
    $validated = $request->validate([
        'monetized_days' => ['required', 'numeric', 'min:0.01'],
        'reason' => ['nullable', 'string', 'max:500'],
    ]);

    // Get Vacation Leave type
    $vlType = LeaveType::where('name', 'LIKE', '%Vacation%')->first();
    if (!$vlType) {
        return redirect()->back()->withErrors([
            'monetization' => 'Vacation Leave type not found. Please contact HRMO.'
        ]);
    }
    $leaveTypeId = $vlType->id;

    $vlBalance = $this->getBalanceByLeaveTypeName($employee->id, 'Vacation Leave');
    if ($vlBalance < 15) {
        return redirect()->back()->withErrors([
            'monetization' => 'Monetization requires at least 15 Vacation Leave credits. Your current VL balance is ' . $vlBalance . '.'
        ]);
    }

    $monetizedDays = $validated['monetized_days'];
    if ($monetizedDays > $vlBalance) {
        return redirect()->back()->withErrors([
            'monetized_days' => 'You cannot monetize more days than your available VL balance (' . $vlBalance . ' days).'
        ]);
    }

    $leaveRequest = LeaveRequest::create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveTypeId,
        'request_type' => 'monetization',
        'monetized_days' => $monetizedDays,
        'number_of_days' => $monetizedDays, // ✅ Store monetized days here
        'reason' => $validated['reason'] ?? 'Monetization request',
        'status' => 'pending',
        'date_filed' => now()->toDateString(),
        'employee_name_snapshot' => $employee->full_name,
        'position_snapshot' => $employee->position,
        'office_department_snapshot' => $employee->department?->department_name,
    ]);


    event(new LeaveRequestCreated($leaveRequest));

    return redirect()->route('employee.leave-requests.index')
        ->with('success', 'Monetization request submitted successfully.');
}

private function storeTerminalLeave($request, $employee)
{
    $vlBalance = $this->getBalanceByLeaveTypeName($employee->id, 'Vacation Leave');
    $slBalance = $this->getBalanceByLeaveTypeName($employee->id, 'Sick Leave');
    $totalBalance = $vlBalance + $slBalance;

    if ($totalBalance <= 0) {
        return redirect()->back()->withErrors([
            'terminal_leave' => 'You have no leave credits to monetize for Terminal Leave.'
        ]);
    }

    $leaveRequest = LeaveRequest::create([
        'employee_id' => $employee->id,
        'leave_type_id' => null,
        'request_type' => 'terminal_leave',
        'number_of_days' => $totalBalance, // ✅ Already correct
        'reason' => 'Terminal Leave request',
        'status' => 'pending',
        'date_filed' => now()->toDateString(),
        'employee_name_snapshot' => $employee->full_name,
        'position_snapshot' => $employee->position,
        'office_department_snapshot' => $employee->department?->department_name,
    ]);


    event(new LeaveRequestCreated($leaveRequest));

    return redirect()->route('employee.leave-requests.index')
        ->with('success', 'Terminal Leave request submitted successfully.');
}


    // -----------------------------------------------------------
    // Original Leave Request Store (extracted)
    // -----------------------------------------------------------

    private function storeLeaveRequest($request, $employee)
{
    $data = $request->validated();
    $leaveType = LeaveType::find($data['leave_type_id']);

    if ($leaveType->date_selection_type === 'specific_dates') {
        $dates = $data['dates'];
        // Count all selected dates (including weekends) for inclusive display
        $inclusiveDays = LeaveRequestService::calculateTotalDaysFromDates($dates);
        // For Sick Leave, use working days for deduction
        $numberOfDays = (strtolower($leaveType->name) === 'sick leave')
            ? LeaveRequestService::countWorkingDaysFromDates($dates)
            : $inclusiveDays;
        $startDate = null;
        $endDate = null;
    } else {
        // Range selection
        $startDate = $data['start_date'];
        $endDate = $data['end_date'];
        if (strtolower($leaveType->name) === 'study leave') {
            $numberOfDays = LeaveRequestService::calculateCalendarDays($startDate, $endDate);
        } else {
            $numberOfDays = LeaveRequestService::calculateWorkingDays($startDate, $endDate);
        }
        $dates = [];
        $inclusiveDays = $numberOfDays; // for range, inclusive and working days may differ; but we store start/end
    }

        // 2. Get current balance
        $currentBalance = LeaveBalance::where('employee_id', $employee->id)
            ->where('leave_type_id', $leaveType->id)
            ->value('balance') ?? 0;

        $service = new LeaveTypeRuleService();

        // 3a. Check balance
        if (!$service->hasSufficientBalance($leaveType, $numberOfDays, $currentBalance)) {
            return redirect()->back()->withErrors([
                'insufficient_credits' => "You have only {$currentBalance} days available for {$leaveType->name}."
            ]);
        }

        // 3b. Study Leave duration
        if (strtolower($leaveType->name) === 'study leave') {
            $purpose = $data['detail']['study_purpose'] ?? null;
            if ($purpose) {
                $expectedDays = $service->getStudyLeaveDuration($purpose);
                if ($numberOfDays != $expectedDays) {
                    return redirect()->back()->withErrors([
                        'number_of_days' => "Study Leave duration for {$purpose} must be exactly {$expectedDays} days."
                    ]);
                }
            }
        }

        // 3c. Wellness Leave
        if (strtolower($leaveType->name) === 'wellness leave') {
            $selectedDates = $this->getSelectedDatesFromRequest($data, $leaveType);
            $wellnessErrors = $service->validateWellnessLeave($leaveType, $selectedDates);
            if (!empty($wellnessErrors)) {
                return redirect()->back()->withErrors($wellnessErrors);
            }
        }

        // 4. Pay breakdown
        $payBreakdown = $service->calculatePayBreakdown($leaveType, $numberOfDays, $currentBalance);
        $daysWithPay = $payBreakdown['with_pay'];
        $daysWithoutPay = $payBreakdown['without_pay'];

        // 5. Attachment required
        if ($service->isAttachmentRequired($leaveType, ['number_of_days' => $numberOfDays])) {
            if (!$request->hasFile('attachment')) {
                return redirect()->back()->withErrors([
                    'attachment' => 'A medical certificate is required for Sick Leave requests of 6 days or more.'
                ]);
            }
        }

        // 6. Prepare data
        $leaveRequestData = [
        'leave_type_id' => $data['leave_type_id'],
        'request_type' => 'leave',
        'date_filed' => now()->toDateString(),
        'start_date' => $startDate,
        'end_date' => $endDate,
        'number_of_days' => $numberOfDays, // working days for Sick Leave
        'reason' => $data['reason'] ?? null,
        'commutation' => $data['commutation'] ?? 'not_requested',
        'days_with_pay' => $daysWithPay,
        'days_without_pay' => $daysWithoutPay,
        'detail' => $data['detail'] ?? [],
    ];

        // Create the leave request; dates are stored separately
    $leaveRequest = LeaveRequestService::createLeaveRequest($leaveRequestData, $dates, $employee);

    // 🔔 Dispatch event AFTER creation
event(new LeaveRequestCreated($leaveRequest));


        return redirect()->route('employee.leave-requests.index')
            ->with('success', 'Leave request submitted successfully.');
    }

    // -----------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------

    private function getBalanceByLeaveTypeName($employeeId, $name)
    {
        $leaveType = LeaveType::where('name', 'LIKE', "%{$name}%")->first();
        if (!$leaveType) return 0;
        return LeaveBalance::where('employee_id', $employeeId)
            ->where('leave_type_id', $leaveType->id)
            ->value('balance') ?? 0;
    }

    private function getSelectedDatesFromRequest(array $data, LeaveType $leaveType): array
    {
        $dates = [];
        if ($leaveType->date_selection_type === 'specific_dates' && isset($data['dates'])) {
            $dates = array_filter($data['dates'], fn($d) => !empty($d));
        } elseif (isset($data['start_date']) && isset($data['end_date'])) {
            $start = Carbon::parse($data['start_date']);
            $end = Carbon::parse($data['end_date']);
            $period = CarbonPeriod::create($start, $end);
            foreach ($period as $date) {
                $dates[] = $date->format('Y-m-d');
            }
        }
        return $dates;
    }
}
