<?php

namespace App\Http\Controllers\Admin;
use App\Events\LeaveRequestCreated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\StoreLeaveRequestRequest;
use App\Models\LeaveBalance;
use App\Models\LeaveType;
use App\Models\LeaveRequest;
use App\Services\LeaveRequestService;
use App\Services\LeaveTypeRuleService;
use Carbon\Carbon;
use App\Http\Controllers\Concerns\HasUnavailableDates;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MyLeaveRequestController extends Controller
{

use HasUnavailableDates;


    public function index()
    {
        $admin = Auth::user();
        $employee = $admin->employee;

        $leaveRequests = LeaveRequest::with(['leaveType', 'detail', 'dates', 'activeReschedule', 'approvedReschedule'])
            ->where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/MyLeaveRequests/Index', [
            'leaveRequests' => $leaveRequests,
        ]);
    }

    public function create()
    {
        $admin = Auth::user();
        $employee = $admin->employee;

        $leaveTypes = LeaveType::where('status', true)->get();
        $balances = LeaveBalance::where('employee_id', $employee->id)
            ->get()
            ->keyBy('leave_type_id')
            ->map(fn($item) => (float) $item->balance)
            ->toArray();

        $hasTakenMaternityLeave = LeaveRequest::where('employee_id', $employee->id)
            ->whereHas('leaveType', fn($q) => $q->where('name', 'LIKE', '%maternity%'))
            ->whereIn('status', ['approved', 'pending', 'certified'])
            ->exists();

        $hasTakenAdoptionLeave = LeaveRequest::where('employee_id', $employee->id)
            ->whereHas('leaveType', fn($q) => $q->where('name', 'LIKE', '%adoption%'))
            ->whereIn('status', ['approved', 'pending', 'certified'])
            ->exists();

        $vlBalance = $this->getBalanceByLeaveTypeName($employee->id, 'Vacation Leave');
        $slBalance = $this->getBalanceByLeaveTypeName($employee->id, 'Sick Leave');

        return Inertia::render('Admin/MyLeaveRequests/Create', [
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
    'unavailableDates' => $this->getUnavailableDates($employee->id), // 👈
]);


    }

    public function store(StoreLeaveRequestRequest $request)
    {
        $admin = Auth::user();
        $employee = $admin->employee;
        $data = $request->validated();

        $requestType = $data['request_type'] ?? 'leave';

        if ($requestType === 'monetization') {
            return $this->storeMonetization($request, $employee);
        } elseif ($requestType === 'terminal_leave') {
            return $this->storeTerminalLeave($request, $employee);
        }

        return $this->storeLeaveRequest($request, $employee);
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

        return Inertia::render('Admin/MyLeaveRequests/Show', [
            'leaveRequest' => $leaveRequest,
        ]);
    }

    // ---------- Helpers (copied from Employee controller) ----------
    private function getBalanceByLeaveTypeName($employeeId, $name)
    {
        $leaveType = LeaveType::where('name', 'LIKE', "%{$name}%")->first();
        if (!$leaveType) return 0;
        return LeaveBalance::where('employee_id', $employeeId)
            ->where('leave_type_id', $leaveType->id)
            ->value('balance') ?? 0;
    }

    private function storeMonetization($request, $employee)
    {
        $validated = $request->validate([
            'monetized_days' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

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

        LeaveRequest::create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveTypeId,
            'request_type' => 'monetization',
            'monetized_days' => $monetizedDays,
            'number_of_days' => $monetizedDays,
            'reason' => $validated['reason'] ?? 'Monetization request',
            'status' => 'pending',
            'date_filed' => now()->toDateString(),
            'employee_name_snapshot' => $employee->full_name,
            'position_snapshot' => $employee->position,
            'office_department_snapshot' => $employee->department?->department_name,
        ]);

      event(new LeaveRequestCreated($leaveRequest));

return redirect()->route('admin.my-leave-requests.index')
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

        LeaveRequest::create([
            'employee_id' => $employee->id,
            'leave_type_id' => null,
            'request_type' => 'terminal_leave',
            'number_of_days' => $totalBalance,
            'reason' => 'Terminal Leave request',
            'status' => 'pending',
            'date_filed' => now()->toDateString(),
            'employee_name_snapshot' => $employee->full_name,
            'position_snapshot' => $employee->position,
            'office_department_snapshot' => $employee->department?->department_name,
        ]);

       event(new LeaveRequestCreated($leaveRequest));

return redirect()->route('admin.my-leave-requests.index')
    ->with('success', 'Monetization request submitted successfully.');
    }

    private function storeLeaveRequest($request, $employee)
    {
        $data = $request->validated();
        $leaveType = LeaveType::find($data['leave_type_id']);

        if ($leaveType->date_selection_type === 'specific_dates') {
            $dates = $data['dates'];
            $numberOfDays = LeaveRequestService::calculateTotalDaysFromDates($dates);
            $startDate = null;
            $endDate = null;
        } else {
            $startDate = $data['start_date'];
            $endDate = $data['end_date'];
            if (strtolower($leaveType->name) === 'study leave') {
                $numberOfDays = LeaveRequestService::calculateCalendarDays($startDate, $endDate);
            } else {
                $numberOfDays = LeaveRequestService::calculateWorkingDays($startDate, $endDate);
            }
            $dates = [];
        }

        $currentBalance = LeaveBalance::where('employee_id', $employee->id)
            ->where('leave_type_id', $leaveType->id)
            ->value('balance') ?? 0;

        $service = new LeaveTypeRuleService();

        if (!$service->hasSufficientBalance($leaveType, $numberOfDays, $currentBalance)) {
            return redirect()->back()->withErrors([
                'insufficient_credits' => "You have only {$currentBalance} days available for {$leaveType->name}."
            ]);
        }

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

        if (strtolower($leaveType->name) === 'wellness leave') {
            $selectedDates = $this->getSelectedDatesFromRequest($data, $leaveType);
            $wellnessErrors = $service->validateWellnessLeave($leaveType, $selectedDates);
            if (!empty($wellnessErrors)) {
                return redirect()->back()->withErrors($wellnessErrors);
            }
        }

        $payBreakdown = $service->calculatePayBreakdown($leaveType, $numberOfDays, $currentBalance);
        $daysWithPay = $payBreakdown['with_pay'];
        $daysWithoutPay = $payBreakdown['without_pay'];

        if ($service->isAttachmentRequired($leaveType, ['number_of_days' => $numberOfDays])) {
            if (!$request->hasFile('attachment')) {
                return redirect()->back()->withErrors([
                    'attachment' => 'A medical certificate is required for Sick Leave requests of 6 days or more.'
                ]);
            }
        }

        $leaveRequestData = [
            'leave_type_id' => $data['leave_type_id'],
            'request_type' => 'leave',
            'date_filed' => now()->toDateString(),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'number_of_days' => $numberOfDays,
            'reason' => $data['reason'] ?? null,
            'commutation' => $data['commutation'] ?? 'not_requested',
            'days_with_pay' => $daysWithPay,
            'days_without_pay' => $daysWithoutPay,
            'detail' => $data['detail'] ?? [],
        ];

       $leaveRequest = LeaveRequestService::createLeaveRequest($leaveRequestData, $dates, $employee);

event(new LeaveRequestCreated($leaveRequest));


        return redirect()->route('admin.my-leave-requests.index')
            ->with('success', 'Leave request submitted successfully.');
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