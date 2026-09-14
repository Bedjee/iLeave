<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\TerminalLeaveService;
use App\Models\LeaveRequest;
use App\Models\LeaveBalance;
use Illuminate\Support\Facades\Log;
use App\Services\DelegationService;
use Illuminate\Http\Request;
use App\Services\LeaveRecallService;
use App\Services\LeaveCertificationService;
use App\Services\LeaveDeductionService;
use App\Services\LeaveTypeRuleService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LeaveRequestController extends Controller
{
    /**
     * Display all leave requests awaiting Admin final approval.
     */
    public function index()
    {
        $admin = Auth::user();
        $delegationService = new DelegationService();

        $hasActiveDelegation = $delegationService->hasActiveDelegation($admin);

        // Pending (department_approved)
        $pendingRequests = collect();
        if (!$hasActiveDelegation) {
            $pendingRequests = LeaveRequest::with(['employee.user', 'leaveType', 'dates'])
                ->where('status', 'department_approved')
                ->orderBy('created_at', 'asc')
                ->get();
        }

        // Fully approved by this Admin
        $approvedRequests = LeaveRequest::with(['employee.user', 'leaveType', 'dates'])
            ->where('status', 'approved')
            ->where('final_approved_by', Auth::id())
            ->orderBy('final_approved_at', 'desc')
            ->get();

        // Cancelled/Recalled (previously approved by this Admin, now cancelled)
        $cancelledRequests = LeaveRequest::with(['employee.user', 'leaveType', 'dates'])
            ->where('status', 'cancelled')
            ->where('final_approved_by', Auth::id())
            ->orderBy('cancelled_at', 'desc')
            ->get();

        $activeDelegate = $delegationService->getActiveDelegate($admin);

        return Inertia::render('Admin/LeaveRequests/Index', [
            'pendingRequests' => $pendingRequests,
            'approvedRequests' => $approvedRequests,
            'cancelledRequests' => $cancelledRequests,
            'hasActiveDelegation' => $hasActiveDelegation,
            'activeDelegate' => $activeDelegate,
        ]);
    }

    /**
     * Display the specified leave request.
     */
    public function show(LeaveRequest $leaveRequest)
    {
        $admin = Auth::user();
        $delegationService = new DelegationService();

        // If delegation is active and request is pending, block access
        if ($delegationService->hasActiveDelegation($admin) && $leaveRequest->status === 'department_approved') {
            abort(403, 'You have delegated your approval authority. You cannot view pending requests.');
        }

        $leaveRequest->load([
            'employee.user',
            'employee.department',
            'leaveType',
            'detail',
            'dates',
            'approvedBy',
            'certifiedBy',
        ]);

        $balance = 0;
        $balanceLabel = null;

        // Special handling for Terminal Leave
        if ($leaveRequest->request_type === 'terminal_leave') {
            $vlBalance = \App\Models\LeaveBalance::where('employee_id', $leaveRequest->employee_id)
                ->whereHas('leaveType', function ($q) {
                    $q->where('name', 'LIKE', '%Vacation%');
                })->value('balance') ?? 0;

            $slBalance = \App\Models\LeaveBalance::where('employee_id', $leaveRequest->employee_id)
                ->whereHas('leaveType', function ($q) {
                    $q->where('name', 'LIKE', '%Sick%');
                })->value('balance') ?? 0;

            $balance = $vlBalance + $slBalance;
            $balanceLabel = 'VL + SL days';
        } else {
            // For regular leave and monetization
            $balance = \App\Models\LeaveBalance::where('employee_id', $leaveRequest->employee_id)
                ->where('leave_type_id', $leaveRequest->leave_type_id)
                ->value('balance') ?? 0;
            $balanceLabel = $leaveRequest->leaveType?->name ?? 'days';
        }

        $hasActiveDelegation = $delegationService->hasActiveDelegation($admin);

        return Inertia::render('Admin/LeaveRequests/Show', [
            'leaveRequest' => $leaveRequest,
            'balance' => $balance,
            'balanceLabel' => $balanceLabel,
            'hasActiveDelegation' => $hasActiveDelegation,
        ]);
    }

   /**
 * Approve a leave request (final approval).
 * Supports partial approval via 'approved_days' parameter.
 */
public function approve(Request $request, LeaveRequest $leaveRequest)
{
    $admin = Auth::user();
    $delegationService = new DelegationService();

    Log::info('Admin::LeaveRequestController@approve - START', [
        'admin_id' => $admin->id,
        'leave_request_id' => $leaveRequest->id,
    ]);

    if ($delegationService->hasActiveDelegation($admin)) {
        Log::warning('Admin::LeaveRequestController@approve - blocked due to active delegation', [
            'admin_id' => $admin->id,
            'leave_request_id' => $leaveRequest->id,
        ]);
        return redirect()->back()->withErrors([
            'error' => 'You have delegated your approval authority. You cannot approve requests during this period.'
        ]);
    }

    if ($leaveRequest->status !== 'department_approved') {
        Log::warning('Admin::LeaveRequestController@approve - invalid status', [
            'admin_id' => $admin->id,
            'leave_request_id' => $leaveRequest->id,
            'status' => $leaveRequest->status,
        ]);
        return redirect()->back()->withErrors(['error' => 'This request is not pending final approval.']);
    }

    // Validate PIN and optional approved_days
    $request->validate([
        'pin' => ['required', 'string', 'size:4', 'regex:/^\d{4}$/'],
        'approved_days' => ['nullable', 'numeric', 'min:0.01'],
    ]);

    $user = Auth::user();
    if (!$user->verifyPin($request->pin)) {
        Log::warning('Admin::LeaveRequestController@approve - invalid PIN', [
            'admin_id' => $admin->id,
            'leave_request_id' => $leaveRequest->id,
        ]);
        return redirect()->back()->withErrors(['pin' => 'Invalid PIN. Please try again.']);
    }

    try {
        $originalDays = $leaveRequest->original_number_of_days ?? $leaveRequest->number_of_days;
        $approvedDays = $request->input('approved_days');
        $isPartial = $approvedDays && $approvedDays < $originalDays;

        if ($isPartial) {
            // Save original if not already set (for backward compatibility)
            if (!$leaveRequest->original_number_of_days) {
                $leaveRequest->original_number_of_days = $leaveRequest->number_of_days;
            }

            // Update number_of_days to approved days
            $leaveRequest->number_of_days = $approvedDays;

            // Recalculate pay breakdown
            $service = new LeaveTypeRuleService();
            $currentBalance = \App\Models\LeaveBalance::where('employee_id', $leaveRequest->employee_id)
                ->where('leave_type_id', $leaveRequest->leave_type_id)
                ->value('balance') ?? 0;
            $payBreakdown = $service->calculatePayBreakdown($leaveRequest->leaveType, $approvedDays, $currentBalance);
            $leaveRequest->days_with_pay = $payBreakdown['with_pay'];
            $leaveRequest->days_without_pay = $payBreakdown['without_pay'];

            // Audit remark
            $remarks = "Partial approval: {$approvedDays} of {$originalDays} days approved.";
            if ($leaveRequest->remarks) {
                $leaveRequest->remarks .= "\n" . $remarks;
            } else {
                $leaveRequest->remarks = $remarks;
            }

            Log::info('Admin::LeaveRequestController@approve - partial approval', [
                'request_id' => $leaveRequest->id,
                'original_days' => $originalDays,
                'approved_days' => $approvedDays,
            ]);
        } else {
            // Full approval – store original if not already set
            if (!$leaveRequest->original_number_of_days) {
                $leaveRequest->original_number_of_days = $leaveRequest->number_of_days;
            }
        }

        $leaveRequest->status = 'approved';
        $leaveRequest->final_approved_at = now();
        $leaveRequest->final_approved_by = Auth::id();
        $leaveRequest->save();

        // Deduct the approved days (stored in number_of_days)
        $deductionService = new LeaveDeductionService();
        $deductionService->deduct($leaveRequest);

        // Generate certification
        $certificationService = new LeaveCertificationService();
        $certificationService->generateCertification($leaveRequest);

        // 🔥 NEW: If this is a Terminal Leave, mark the active separation's credits as claimed.
        // This enables the "skip reversal on rehire" rule (Decision B / Option 3).
        if ($leaveRequest->request_type === 'terminal_leave' && $leaveRequest->status === 'approved') {
            $employee = $leaveRequest->employee;
            if ($employee) {
                app(\App\Services\EmployeeSeparationService::class)->markCreditsClaimed($employee);

                Log::info('Terminal Leave approved — marked credits as claimed', [
                    'leave_request_id' => $leaveRequest->id,
                    'employee_id' => $employee->id,
                ]);
            }
        }

        $message = $isPartial
            ? "Leave request partially approved ({$approvedDays} days)."
            : 'Leave request fully approved and credits deducted.';

        Log::info('Admin::LeaveRequestController@approve - SUCCESS', [
            'request_id' => $leaveRequest->id,
            'is_partial' => $isPartial,
            'approved_days' => $approvedDays ?? $originalDays,
        ]);

        return redirect()->back()->with('success', $message);
    } catch (\Exception $e) {
        Log::error('Admin approval failed', [
            'request_id' => $leaveRequest->id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
        return redirect()->back()->withErrors(['error' => 'Approval failed: ' . $e->getMessage()]);
    }
}




    /**
     * Reject a leave request (final rejection).
     */
    public function reject(Request $request, LeaveRequest $leaveRequest)
    {
        $admin = Auth::user();
        $delegationService = new DelegationService();

        Log::info('Admin::LeaveRequestController@reject - START', [
            'admin_id' => $admin->id,
            'leave_request_id' => $leaveRequest->id,
        ]);

        if ($delegationService->hasActiveDelegation($admin)) {
            Log::warning('Admin::LeaveRequestController@reject - blocked due to active delegation', [
                'admin_id' => $admin->id,
                'leave_request_id' => $leaveRequest->id,
            ]);
            return redirect()->back()->withErrors([
                'error' => 'You have delegated your approval authority. You cannot reject requests during this period.'
            ]);
        }

        if ($leaveRequest->status !== 'department_approved') {
            Log::warning('Admin::LeaveRequestController@reject - invalid status', [
                'admin_id' => $admin->id,
                'leave_request_id' => $leaveRequest->id,
                'status' => $leaveRequest->status,
            ]);
            return redirect()->back()->withErrors(['error' => 'This request is not pending final approval.']);
        }

        $reason = $request->input('reason') ?? 'Rejected by Admin.';

        $leaveRequest->status = 'rejected';
        $leaveRequest->rejected_at = now();
        $leaveRequest->rejected_by = Auth::id();
        $leaveRequest->rejection_reason = $reason;
        $leaveRequest->save();

        Log::info('Admin::LeaveRequestController@reject - SUCCESS', [
            'admin_id' => $admin->id,
            'leave_request_id' => $leaveRequest->id,
        ]);

        return redirect()->back()->with('success', 'Leave request rejected.');
    }

    /**
     * Recall a fully approved Vacation Leave request.
     */
    public function recall(Request $request, LeaveRequest $leaveRequest)
    {
        try {
            $service = new LeaveRecallService();
            $service->recall($leaveRequest, Auth::user(), $request->input('reason'));

            return redirect()->back()->with('success', 'Leave request recalled and credits refunded successfully.');
        } catch (\Exception $e) {
            Log::error('Recall failed', ['error' => $e->getMessage()]);
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
