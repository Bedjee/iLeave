<?php

namespace App\Http\Controllers\DepartmentHead;

use App\Events\LeaveRequestCreated;
use App\Http\Controllers\Concerns\HasUnavailableDates;
use App\Http\Controllers\Controller;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Services\LeaveTypeRuleService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MyLeaveRequestController extends Controller
{
    use HasUnavailableDates;

    /**
     * Display a list of the Department Head's own leave requests.
     */
    public function index()
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            abort(403, 'No employee record found for your account.');
        }

        $leaveRequests = LeaveRequest::with(['leaveType', 'dates'])
            ->where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('DepartmentHead/MyLeaveRequests/Index', [
            'leaveRequests' => $leaveRequests,
        ]);
    }

    /**
     * Show the form to create a new leave request.
     */
    public function create()
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            abort(403, 'No employee record found.');
        }

        // Fetch active leave types
        $leaveTypes = LeaveType::where('status', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'requires_balance', 'date_selection_type']);

        // Balances as [leave_type_id => balance]
        $balances = LeaveBalance::where('employee_id', $employee->id)
            ->get()
            ->pluck('balance', 'leave_type_id')
            ->toArray();

        // VL and SL totals (for special requests)
        $vlBalance = LeaveBalance::where('employee_id', $employee->id)
            ->whereHas('leaveType', function ($q) {
                $q->where('name', 'LIKE', '%Vacation%');
            })->sum('balance');

        $slBalance = LeaveBalance::where('employee_id', $employee->id)
            ->whereHas('leaveType', function ($q) {
                $q->where('name', 'LIKE', '%Sick%');
            })->sum('balance');

        // Placeholder — implement real checks if needed
        $hasTakenMaternityLeave = false;
        $hasTakenAdoptionLeave  = false;

        return Inertia::render('DepartmentHead/MyLeaveRequests/Create', [
            'leaveTypes'             => $leaveTypes,
            'balances'               => $balances,
            'employee'               => $employee,
            'hasTakenMaternityLeave' => $hasTakenMaternityLeave,
            'hasTakenAdoptionLeave'  => $hasTakenAdoptionLeave,
            'vlBalance'              => $vlBalance,
            'slBalance'              => $slBalance,
            'unavailableDates'       => $this->getUnavailableDates($employee->id),
        ]);
    }

    /**
     * Store a newly created leave request.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            abort(403, 'No employee record found.');
        }

        $validated = $request->validate([
            'leave_type_id'     => 'required|exists:leave_types,id',
            'start_date'        => 'required|date|after_or_equal:today',
            'end_date'          => 'required|date|after_or_equal:start_date',
            'number_of_days'    => 'required|numeric|min:0.5',
            'reason'            => 'nullable|string|max:500',
            'commutation'       => 'required|in:not_requested,requested',
            'attachment'        => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'request_type'      => 'nullable|in:leave,monetization,terminal_leave',
            'dates'             => 'nullable|array',
            'dates.*'           => 'nullable|date',

            // Nested detail fields
            'detail.location_type'          => 'nullable|in:within_philippines,abroad',
            'detail.location'               => 'nullable|string|max:255',
            'detail.sick_leave_type'        => 'nullable|in:in_hospital,out_patient',
            'detail.illness'                => 'nullable|string|max:255',
            'detail.study_purpose'          => 'nullable|in:masters_completion,bar_board_review,continuing_education',
            'detail.other_purpose'          => 'nullable|string|max:255',
            'detail.rehab_duration_months'  => 'nullable|integer|min:1|max:6',
            'detail.slbw_days'              => 'nullable|integer|min:1|max:60',
            'detail.expected_delivery_date' => 'nullable|date',
            'detail.prenatal_checkups'      => 'nullable|string|max:255',
            'detail.adoption_info'          => 'nullable|string|max:255',
            'detail.additional_info'        => 'nullable|string|max:500',
        ]);

        // ---------- File upload ----------
        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('leave_attachments', 'public');
        }

        // --------------------------------------------------------------
        // Compute pay breakdown (Days With Pay / Days Without Pay)
        // This ensures Section 7.C on the printed form shows the
        // correct values for Department Head requests, matching the
        // behavior for Employee / Admin / Mayor requests.
        // --------------------------------------------------------------
        $leaveType    = LeaveType::find($validated['leave_type_id']);
        $requestType  = $validated['request_type'] ?? 'leave';
        $numberOfDays = (float) $validated['number_of_days'];

        $currentBalance = LeaveBalance::where('employee_id', $employee->id)
            ->where('leave_type_id', $leaveType->id)
            ->value('balance') ?? 0;

        if ($requestType === 'monetization' || $requestType === 'terminal_leave') {
            // Monetization and Terminal Leave are always "with pay"
            $daysWithPay    = $numberOfDays;
            $daysWithoutPay = 0;
        } else {
            // Regular leave — delegate to the leave-type rule service
            $ruleService    = new LeaveTypeRuleService();
            $payBreakdown   = $ruleService->calculatePayBreakdown($leaveType, (int) $numberOfDays, (float) $currentBalance);

            $daysWithPay    = $payBreakdown['with_pay'];
            $daysWithoutPay = $payBreakdown['without_pay'];
        }

        // ---------- Create the leave request ----------
        $leaveRequest = LeaveRequest::create([
            'employee_id'                => $employee->id,
            'leave_type_id'              => $validated['leave_type_id'],
            'date_filed'                 => now()->toDateString(),
            'start_date'                 => $validated['start_date'],
            'end_date'                   => $validated['end_date'],
            'number_of_days'             => $validated['number_of_days'],
            'days_with_pay'              => $daysWithPay,     // 👈 FIX
            'days_without_pay'           => $daysWithoutPay,  // 👈 FIX
            'reason'                     => $validated['reason'] ?? null,
            'commutation'                => $validated['commutation'],
            'attachment'                 => $attachmentPath,
            'status'                     => 'pending',
            'request_type'               => $validated['request_type'] ?? null,
            'office_department_snapshot' => $employee->department->department_name ?? null,
            'employee_name_snapshot'     => $employee->full_name,
            'position_snapshot'          => $employee->position,
            'salary_snapshot'            => null,
            'submitted_at'               => now(),
        ]);

        // ---------- Create the detail record ----------
        $detailData = $validated['detail'] ?? [];
        $leaveRequest->detail()->create($detailData);

        // ---------- Save dates ----------
        if (!empty($validated['dates']) && is_array($validated['dates'])) {
            // Specific dates — save only the selected dates
            foreach ($validated['dates'] as $date) {
                if (!empty($date)) {
                    $leaveRequest->dates()->create([
                        'leave_date' => Carbon::parse($date)->toDateString(),
                    ]);
                }
            }
        } else {
            // Range-based — generate every date from start to end
            $start   = Carbon::parse($validated['start_date']);
            $end     = Carbon::parse($validated['end_date']);
            $current = $start->copy();
            while ($current <= $end) {
                $leaveRequest->dates()->create([
                    'leave_date' => $current->toDateString(),
                ]);
                $current->addDay();
            }
        }

        // ---------- Dispatch event ----------
        event(new LeaveRequestCreated($leaveRequest));

        return redirect()->route('department-head.my-leave-requests.index')
            ->with('success', 'Leave request submitted successfully. Awaiting HRMO certification.');
    }

    /**
     * Display the specified leave request.
     */
    public function show(LeaveRequest $leaveRequest)
    {
        $user = Auth::user();
        $employee = $user->employee;

        // Ensure the request belongs to this Department Head
        if ($leaveRequest->employee_id !== $employee->id) {
            abort(403, 'You are not authorized to view this request.');
        }

        $leaveRequest->load(['leaveType', 'detail', 'dates', 'activeReschedule']);

        // Balance for the requested leave type (or combined for terminal)
        $balance = 0;
        $balanceLabel = null;

        if ($leaveRequest->request_type === 'terminal_leave') {
            $vlBalance = LeaveBalance::where('employee_id', $employee->id)
                ->whereHas('leaveType', function ($q) {
                    $q->where('name', 'LIKE', '%Vacation%');
                })->sum('balance');

            $slBalance = LeaveBalance::where('employee_id', $employee->id)
                ->whereHas('leaveType', function ($q) {
                    $q->where('name', 'LIKE', '%Sick%');
                })->sum('balance');

            $balance = $vlBalance + $slBalance;
            $balanceLabel = 'VL + SL days';
        } else {
            $balance = LeaveBalance::where('employee_id', $employee->id)
                ->where('leave_type_id', $leaveRequest->leave_type_id)
                ->value('balance') ?? 0;
            $balanceLabel = $leaveRequest->leaveType?->name ?? 'days';
        }

        return Inertia::render('DepartmentHead/MyLeaveRequests/Show', [
            'leaveRequest' => $leaveRequest,
            'balance'      => $balance,
            'balanceLabel' => $balanceLabel,
        ]);
    }
}