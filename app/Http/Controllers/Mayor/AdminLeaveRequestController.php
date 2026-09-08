<?php

namespace App\Http\Controllers\Mayor;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\LeaveBalance;
use App\Services\LeaveDeductionService;
use App\Services\LeaveCertificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminLeaveRequestController extends Controller
{
    public function index()
    {
        // Pending – only Admin users, status 'mayor_pending'
        $pendingRequests = LeaveRequest::with(['employee.user', 'leaveType', 'dates'])
            ->where('status', 'mayor_pending')
            ->whereHas('employee.user', function ($query) {
                $query->where('role', 'admin');
            })
            ->orderBy('created_at', 'asc')
            ->get();

        // Approved – only Admin users, approved by this Mayor
        $approvedRequests = LeaveRequest::with(['employee.user', 'leaveType', 'dates'])
            ->where('status', 'approved')
            ->where('final_approved_by', Auth::id())
            ->whereHas('employee.user', function ($query) {
                $query->where('role', 'admin');
            })
            ->orderBy('final_approved_at', 'desc')
            ->get();

        return Inertia::render('Mayor/AdminLeaveRequests/Index', [
            'pendingRequests' => $pendingRequests,
            'approvedRequests' => $approvedRequests,
        ]);
    }

    public function show(LeaveRequest $leaveRequest)
    {
        // Ensure the request belongs to an Admin user and has the right status
        if ($leaveRequest->employee->user->role !== 'admin') {
            abort(403, 'This request is not an Admin leave request.');
        }

        if (!in_array($leaveRequest->status, ['mayor_pending', 'approved'])) {
            abort(404);
        }

        $leaveRequest->load([
            'employee.user',
            'employee.department',
            'leaveType',
            'detail',
            'dates',
            'certifiedBy',
        ]);

        $balance = LeaveBalance::where('employee_id', $leaveRequest->employee_id)
            ->where('leave_type_id', $leaveRequest->leave_type_id)
            ->value('balance') ?? 0;

        return Inertia::render('Mayor/AdminLeaveRequests/Show', [
            'leaveRequest' => $leaveRequest,
            'balance' => $balance,
        ]);
    }

    public function approve(Request $request, LeaveRequest $leaveRequest)
    {
        // Validate that it's an Admin request and pending
        if ($leaveRequest->employee->user->role !== 'admin') {
            abort(403, 'This request is not an Admin leave request.');
        }

        if ($leaveRequest->status !== 'mayor_pending') {
            return redirect()->back()->withErrors(['error' => 'This request is not pending mayor approval.']);
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
            Log::error('Mayor approval failed for admin request', [
                'request_id' => $leaveRequest->id,
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->withErrors(['error' => 'Approval failed: ' . $e->getMessage()]);
        }
    }

    public function reject(Request $request, LeaveRequest $leaveRequest)
    {
        if ($leaveRequest->employee->user->role !== 'admin') {
            abort(403, 'This request is not an Admin leave request.');
        }

        if ($leaveRequest->status !== 'mayor_pending') {
            return redirect()->back()->withErrors(['error' => 'This request is not pending mayor approval.']);
        }

        $reason = $request->input('reason') ?? 'Rejected by Mayor.';

        $leaveRequest->status = 'rejected';
        $leaveRequest->rejected_at = now();
        $leaveRequest->rejected_by = Auth::id();
        $leaveRequest->rejection_reason = $reason;
        $leaveRequest->save();

        return redirect()->back()->with('success', 'Admin leave request rejected.');
    }
}
