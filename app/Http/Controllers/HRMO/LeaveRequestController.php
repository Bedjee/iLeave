<?php

namespace App\Http\Controllers\HRMO;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\Employee;
use App\Services\LeaveWorkflowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LeaveRequestController extends Controller
{
    /**
     * Display a listing of leave requests with filters.
     */
    public function index(Request $request)
    {
        $query = LeaveRequest::with(['employee.user', 'leaveType', 'dates', 'activeReschedule'])
        ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by employee (search name)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('employee', function ($q) use ($search) {
                $q->where('firstname', 'LIKE', "%{$search}%")
                  ->orWhere('lastname', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        // Filter by leave type
        if ($request->filled('leave_type')) {
            $query->where('leave_type_id', $request->leave_type);
        }

        // Filter by date range (date_filed)
        if ($request->filled('date_from') && $request->filled('date_to')) {
            $query->whereBetween('date_filed', [$request->date_from, $request->date_to]);
        }

        $leaveRequests = $query->paginate(15)->withQueryString();

        $leaveTypes = LeaveType::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('HRMO/LeaveRequests/Index', [
            'leaveRequests' => $leaveRequests,
            'filters' => $request->only(['status', 'search', 'leave_type', 'date_from', 'date_to']),
            'leaveTypes' => $leaveTypes,
        ]);
    }

    /**
     * Display the specified leave request.
     */
  public function show(LeaveRequest $leaveRequest)
{
    $leaveRequest->load(['employee.user', 'leaveType', 'detail', 'dates']);

    $balance = 0;
    $balanceLabel = null;

    // Special handling for Terminal Leave
    if ($leaveRequest->request_type === 'terminal_leave') {
        // Get VL balance
        $vlBalance = \App\Models\LeaveBalance::where('employee_id', $leaveRequest->employee_id)
            ->whereHas('leaveType', function ($q) {
                $q->where('name', 'LIKE', '%Vacation%');
            })->value('balance') ?? 0;

        // Get SL balance
        $slBalance = \App\Models\LeaveBalance::where('employee_id', $leaveRequest->employee_id)
            ->whereHas('leaveType', function ($q) {
                $q->where('name', 'LIKE', '%Sick%');
            })->value('balance') ?? 0;

        $balance = $vlBalance + $slBalance;
        $balanceLabel = 'VL + SL days';
    } else {
        // For regular leave and monetization (leave_type_id is set)
        $balance = \App\Models\LeaveBalance::where('employee_id', $leaveRequest->employee_id)
            ->where('leave_type_id', $leaveRequest->leave_type_id)
            ->value('balance') ?? 0;
        $balanceLabel = $leaveRequest->leaveType?->name ?? 'days';
    }

    return Inertia::render('HRMO/LeaveRequests/Show', [
        'leaveRequest' => $leaveRequest,
        'balance' => $balance,
        'balanceLabel' => $balanceLabel,
    ]);
}


    /**
     * Update the status of a leave request (approve/reject/certify).
     */
  public function update(Request $request, LeaveRequest $leaveRequest)
{
    // Parse JSON if needed
    $data = $request->all();
    if (empty($data)) {
        $data = $request->json()->all();
        if (!empty($data)) {
            $request->merge($data);
        }
    }

    \Log::info('🔵 HRMO Update Request', [
        'request_id' => $leaveRequest->id,
        'all_data' => $request->all(),
        'raw_content' => $request->getContent(),
        'user_id' => auth()->id(),
        'current_status' => $leaveRequest->status,
    ]);

    try {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,certified,approved,rejected,cancelled'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ]);

        \Log::info('🟢 Validation passed', $validated);

        // Update status-specific fields
        if ($validated['status'] === 'certified') {
            $leaveRequest->certified_at = now();
            $leaveRequest->certified_by = auth()->id();
            \Log::info('📝 Set certified fields', [
                'certified_at' => $leaveRequest->certified_at,
                'certified_by' => $leaveRequest->certified_by,
            ]);
        } elseif ($validated['status'] === 'rejected') {
            $leaveRequest->rejected_at = now();
            $leaveRequest->rejected_by = auth()->id();
            $leaveRequest->rejection_reason = $validated['remarks'] ?? null;
        } elseif ($validated['status'] === 'approved') {
            $leaveRequest->approved_at = now();
            $leaveRequest->approved_by = auth()->id();
        } elseif ($validated['status'] === 'cancelled') {
            $leaveRequest->cancelled_at = now();
            $leaveRequest->cancelled_by = auth()->id();
            $leaveRequest->cancellation_reason = $validated['remarks'] ?? null;
        }

        // Set status and remarks
        $leaveRequest->status = $validated['status'];
        $leaveRequest->remarks = $validated['remarks'] ?? $leaveRequest->remarks;

        \Log::info('💾 Attempting to save', [
            'status' => $leaveRequest->status,
            'certified_at' => $leaveRequest->certified_at,
            'certified_by' => $leaveRequest->certified_by,
        ]);

        $saved = $leaveRequest->save();



        \Log::info('💾 Save result', ['saved' => $saved]);

        // Refresh to get latest data
        $leaveRequest->refresh();

        \Log::info('✅ After refresh', [
            'id' => $leaveRequest->id,
            'status' => $leaveRequest->status,
            'certified_at' => $leaveRequest->certified_at,
            'certified_by' => $leaveRequest->certified_by,
        ]);

        // 🔥 NEW: Auto‑promote if special department
    if ($validated['status'] === 'certified') {
        app(LeaveWorkflowService::class)->handleHrmoCertification($leaveRequest);
    }



        return redirect()->back()->with('success', 'Leave request updated successfully.');
    } catch (\Exception $e) {
        \Log::error('❌ Update FAILED', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);



        return redirect()->back()->withErrors(['error' => 'An error occurred: ' . $e->getMessage()]);
    }
}


}
