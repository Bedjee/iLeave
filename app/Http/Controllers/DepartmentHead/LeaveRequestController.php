<?php

namespace App\Http\Controllers\DepartmentHead;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\LeaveBalance;
use Illuminate\Http\Request;
use App\Services\LeaveWorkflowService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LeaveRequestController extends Controller
{
   public function index()
{
    $user = Auth::user();
    $employee = $user->employee;

    if (!$employee || !$employee->department_id) {
        return Inertia::render('DepartmentHead/LeaveRequests/Index', [
            'pendingApprovals' => [],
            'approvedRequests' => [],
            'department' => null,
        ]);
    }

    $departmentId = $employee->department_id;

    // Pending approvals (certified) – only for departments that do NOT skip head approval
    $pendingApprovals = LeaveRequest::with(['employee.user', 'leaveType'])
        ->where('status', 'certified')
        ->whereHas('employee', function ($q) use ($departmentId,$employee) {
            $q->where('department_id', $departmentId)
                 ->where('id', '!=', $employee->id) 
              ->whereHas('department', function ($q2) {
                  $q2->where('skip_department_head_approval', false);
              });
        })
        ->orderBy('created_at', 'desc')
        ->get();

    // Already approved by this Department Head (status = department_approved)
    $approvedRequests = LeaveRequest::with(['employee.user', 'leaveType'])
        ->where('status', 'department_approved')
        ->where('approved_by', Auth::id())
        ->whereHas('employee', function ($q) use ($departmentId) {
            $q->where('department_id', $departmentId);
        })
        ->orderBy('approved_at', 'desc')
        ->get();

    return Inertia::render('DepartmentHead/LeaveRequests/Index', [
        'pendingApprovals' => $pendingApprovals,
        'approvedRequests' => $approvedRequests,
        'department' => $employee->department?->department_name,
    ]);
}



 public function show(LeaveRequest $leaveRequest)
{
    \Log::info('Showing leave request', ['id' => $leaveRequest->id, 'status' => $leaveRequest->status]);

    $this->authorizeDepartment($leaveRequest);

    $leaveRequest->load(['employee.user', 'leaveType', 'detail', 'dates']);

    $balance = 0;
    $balanceLabel = null;
    $specialBalanceData = null;

    if ($leaveRequest->request_type === 'terminal_leave') {
        // Compute VL and SL balances
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
        $specialBalanceData = [
            'vl' => $vlBalance,
            'sl' => $slBalance,
            'total' => $balance,
        ];
    } elseif ($leaveRequest->request_type === 'monetization') {
        // Monetization: show VL balance
        $balance = \App\Models\LeaveBalance::where('employee_id', $leaveRequest->employee_id)
            ->where('leave_type_id', $leaveRequest->leave_type_id)
            ->value('balance') ?? 0;
        $balanceLabel = $leaveRequest->leaveType?->name ?? 'Vacation Leave';
    } else {
        // Regular leave
        $balance = \App\Models\LeaveBalance::where('employee_id', $leaveRequest->employee_id)
            ->where('leave_type_id', $leaveRequest->leave_type_id)
            ->value('balance') ?? 0;
        $balanceLabel = $leaveRequest->leaveType?->name ?? 'days';
    }

    return Inertia::render('DepartmentHead/LeaveRequests/Show', [
        'leaveRequest' => $leaveRequest,
        'balance' => $balance,
        'balanceLabel' => $balanceLabel,
        'specialBalanceData' => $specialBalanceData,
    ]);
}




    public function approve(LeaveRequest $leaveRequest)
{
    $this->authorizeDepartment($leaveRequest);
    $this->ensureCertified($leaveRequest);

    // 🔥 Prevent approval if special department
    if (app(LeaveWorkflowService::class)->shouldSkipDepartmentHead($leaveRequest)) {
        abort(403, 'This request does not require department head approval.');
    }

    $leaveRequest->status = 'department_approved'; // <-- new status
    $leaveRequest->approved_at = now();
    $leaveRequest->approved_by = Auth::id();
    $leaveRequest->save();

    return redirect()->back()->with('success', 'Leave request recommended for approval. Awaiting Admin final approval.');
}



    public function reject(Request $request, LeaveRequest $leaveRequest)
    {
        $this->authorizeDepartment($leaveRequest);
        $this->ensureCertified($leaveRequest);

         if (app(LeaveWorkflowService::class)->shouldSkipDepartmentHead($leaveRequest)) {
        abort(403, 'This request does not require department head approval.');
    }

        $reason = $request->input('reason') ?? 'Declined by Department Head.';

        $leaveRequest->status = 'rejected';
        $leaveRequest->rejected_at = now();
        $leaveRequest->rejected_by = Auth::id();
        $leaveRequest->rejection_reason = $reason;
        $leaveRequest->save();

        return redirect()->back()->with('success', 'Leave request rejected.');
    }

    // -----------------------------------------------------------
    // Authorization helpers
    // -----------------------------------------------------------

    private function authorizeDepartment(LeaveRequest $leaveRequest): void
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee || !$employee->department_id) {
            abort(403, 'You are not authorized to manage leave requests.');
        }

        if ($leaveRequest->employee->department_id !== $employee->department_id) {
            abort(403, 'This leave request does not belong to your department.');
        }
    }

    private function ensureCertified(LeaveRequest $leaveRequest): void
    {
        if ($leaveRequest->status !== 'certified') {
            abort(403, 'This leave request is not eligible for action. Current status: ' . $leaveRequest->status);
        }
    }
}
