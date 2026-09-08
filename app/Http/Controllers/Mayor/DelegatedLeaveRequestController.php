<?php

namespace App\Http\Controllers\Mayor;

use App\Services\LeaveRecallService;
use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\LeaveBalance;
use App\Services\DelegationService;
use App\Services\LeaveDeductionService;
use App\Services\LeaveCertificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DelegatedLeaveRequestController extends Controller
{
    protected $delegationService;

    public function __construct(DelegationService $delegationService)
    {
        $this->delegationService = $delegationService;
    }

    public function index()
{
    $isDelegate = $this->delegationService->isDelegate();

    $pendingRequests = LeaveRequest::with(['employee.user', 'leaveType', 'dates'])
        ->where('status', 'department_approved')
        ->orderBy('created_at', 'asc')
        ->get();

    $approvedRequests = LeaveRequest::with(['employee.user', 'leaveType', 'dates'])
        ->where('status', 'approved')
        ->where('final_approved_by', Auth::id())
        ->orderBy('final_approved_at', 'desc')
        ->get();

    $cancelledRequests = LeaveRequest::with(['employee.user', 'leaveType', 'dates'])
        ->where('status', 'cancelled')
        ->where('final_approved_by', Auth::id())
        ->orderBy('cancelled_at', 'desc')
        ->get();

    return Inertia::render('Mayor/DelegatedApprovals/Index', [
        'pendingRequests' => $pendingRequests,
        'approvedRequests' => $approvedRequests,
        'cancelledRequests' => $cancelledRequests,
        'isDelegate' => $isDelegate,
    ]);
}



    public function show(LeaveRequest $leaveRequest)
    {
        $isDelegate = $this->delegationService->isDelegate();

        $leaveRequest->load([
            'employee.user',
            'employee.department',
            'leaveType',
            'detail',
            'dates',
            'approvedBy',
            'certifiedBy',
        ]);

        $balance = LeaveBalance::where('employee_id', $leaveRequest->employee_id)
            ->where('leave_type_id', $leaveRequest->leave_type_id)
            ->value('balance') ?? 0;

        return Inertia::render('Mayor/DelegatedApprovals/Show', [
            'leaveRequest' => $leaveRequest,
            'balance' => $balance,
            'isDelegate' => $isDelegate,
        ]);
    }

    public function approve(Request $request, LeaveRequest $leaveRequest)
    {
        if (!$this->delegationService->isDelegate()) {
            abort(403, 'You are not currently delegated as an approver.');
        }

        if ($leaveRequest->status !== 'department_approved') {
            return redirect()->back()->withErrors(['error' => 'This request is not pending final approval.']);
        }

        try {
        $leaveRequest->status = 'approved';
        $leaveRequest->final_approved_at = now();
        $leaveRequest->final_approved_by = Auth::id();
        $leaveRequest->save();

        $deductionService = new LeaveDeductionService();
        $deductionService->deduct($leaveRequest);

        // 🔥 Generate certification
        $certificationService = new LeaveCertificationService();
        $certificationService->generateCertification($leaveRequest);

        return redirect()->back()->with('success', 'Leave request fully approved and credits deducted.');
    } catch (\Exception $e) {
            Log::error('Mayor delegated approval failed', [
                'request_id' => $leaveRequest->id,
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->withErrors(['error' => 'Approval failed: ' . $e->getMessage()]);
        }
    }

    public function reject(Request $request, LeaveRequest $leaveRequest)
    {
        if (!$this->delegationService->isDelegate()) {
            abort(403, 'You are not currently delegated as an approver.');
        }

        if ($leaveRequest->status !== 'department_approved') {
            return redirect()->back()->withErrors(['error' => 'This request is not pending final approval.']);
        }

        $reason = $request->input('reason') ?? 'Rejected by delegated approver (Mayor).';

        $leaveRequest->status = 'rejected';
        $leaveRequest->rejected_at = now();
        $leaveRequest->rejected_by = Auth::id();
        $leaveRequest->rejection_reason = $reason;
        $leaveRequest->save();

        return redirect()->back()->with('success', 'Leave request rejected.');
    }

    public function recall(Request $request, LeaveRequest $leaveRequest)
    {
        if (!$this->delegationService->isDelegate()) {
            abort(403, 'You are not currently delegated as an approver.');
        }

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
