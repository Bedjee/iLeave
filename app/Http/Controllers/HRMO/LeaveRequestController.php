<?php

namespace App\Http\Controllers\HRMO;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\LeaveBalance;
use App\Models\LeaveCreditTransaction;
use App\Models\Employee;
use App\Models\MayorLeaveApprover;
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

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('employee', function ($q) use ($search) {
                $q->where('firstname', 'LIKE', "%{$search}%")
                  ->orWhere('lastname', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('leave_type')) {
            $query->where('leave_type_id', $request->leave_type);
        }

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
        $leaveRequest->load([
            'employee.user',
            'leaveType',
            'detail',
            'dates',
            'mayorApprovers',
        ]);

        $balance = 0;
        $balanceLabel = null;

        // Special handling for Terminal Leave
        if ($leaveRequest->request_type === 'terminal_leave') {
            $vlBalance = LeaveBalance::where('employee_id', $leaveRequest->employee_id)
                ->whereHas('leaveType', function ($q) {
                    $q->where('name', 'LIKE', '%Vacation%');
                })->value('balance') ?? 0;

            $slBalance = LeaveBalance::where('employee_id', $leaveRequest->employee_id)
                ->whereHas('leaveType', function ($q) {
                    $q->where('name', 'LIKE', '%Sick%');
                })->value('balance') ?? 0;

            $balance = $vlBalance + $slBalance;
            $balanceLabel = 'VL + SL days';
        } else {
            $balance = LeaveBalance::where('employee_id', $leaveRequest->employee_id)
                ->where('leave_type_id', $leaveRequest->leave_type_id)
                ->value('balance') ?? 0;
            $balanceLabel = $leaveRequest->leaveType?->name ?? 'days';
        }

        $hasPrinted = $leaveRequest->printLogs()->exists();
        $isMayorRequest = $leaveRequest->employee?->user?->role === 'mayor';

        return Inertia::render('HRMO/LeaveRequests/Show', [
            'leaveRequest' => $leaveRequest,
            'balance' => $balance,
            'balanceLabel' => $balanceLabel,
            'hasPrinted' => $hasPrinted,
            'isMayorRequest' => $isMayorRequest,
        ]);
    }

    /**
     * Update the status of a leave request (approve/reject/certify).
     * Also saves Mayor approvers when certifying a Mayor request.
     */
    public function update(Request $request, LeaveRequest $leaveRequest)
    {
        $data = $request->all();
        if (empty($data)) {
            $data = $request->json()->all();
            if (!empty($data)) {
                $request->merge($data);
            }
        }

        try {
            $validated = $request->validate([
                'status' => ['required', 'in:pending,certified,approved,rejected,cancelled'],
                'remarks' => ['nullable', 'string', 'max:500'],
                'approvers' => ['nullable', 'array', 'max:2'],
                'approvers.*.name' => ['nullable', 'string', 'max:255'],
                'approvers.*.position' => ['nullable', 'string', 'max:255'],
                'approvers.*.role_label' => ['nullable', 'string', 'max:100'],
            ]);

            if ($validated['status'] === 'certified') {
                $leaveRequest->certified_at = now();
                $leaveRequest->certified_by = auth()->id();
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

            $leaveRequest->status = $validated['status'];
            $leaveRequest->remarks = $validated['remarks'] ?? $leaveRequest->remarks;
            $leaveRequest->save();

            // Save Mayor approvers when certifying
            if (
                $leaveRequest->employee?->user?->role === 'mayor'
                && $validated['status'] === 'certified'
                && isset($validated['approvers'])
            ) {
                $this->saveMayorApprovers($leaveRequest, $validated['approvers']);
            }

            $leaveRequest->refresh();

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

    /**
     * Update Mayor approvers independently (after certification, before first print).
     */
    public function updateApprovers(Request $request, LeaveRequest $leaveRequest)
    {
        if ($leaveRequest->employee?->user?->role !== 'mayor') {
            abort(403, 'Approvers can only be configured for Mayor leave requests.');
        }

        if ($leaveRequest->status !== 'certified') {
            return redirect()->back()->withErrors([
                'error' => 'Approvers can only be edited while the request is certified.'
            ]);
        }

        if ($leaveRequest->printLogs()->exists()) {
            return redirect()->back()->withErrors([
                'error' => 'Cannot edit approvers — the form has already been printed.'
            ]);
        }

        $validated = $request->validate([
            'approvers' => ['nullable', 'array', 'max:2'],
            'approvers.*.name' => ['nullable', 'string', 'max:255'],
            'approvers.*.position' => ['nullable', 'string', 'max:255'],
            'approvers.*.role_label' => ['nullable', 'string', 'max:100'],
        ]);

        $this->saveMayorApprovers($leaveRequest, $validated['approvers'] ?? []);

        return redirect()->back()->with('success', 'Approvers updated successfully.');
    }

    /**
     * Persist Mayor approvers.
     */
    private function saveMayorApprovers(LeaveRequest $leaveRequest, array $approvers): void
    {
        MayorLeaveApprover::where('leave_request_id', $leaveRequest->id)->delete();

        $slot = 1;
        foreach ($approvers as $approver) {
            $name = trim($approver['name'] ?? '');
            if ($name === '') {
                $slot++;
                continue;
            }

            MayorLeaveApprover::create([
                'leave_request_id' => $leaveRequest->id,
                'slot' => $slot,
                'name' => $name,
                'position' => $approver['position'] ?? null,
                'role_label' => $approver['role_label'] ?? 'Approved by',
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);

            $slot++;
            if ($slot > 2) break;
        }
    }

    /**
     * Manually finalize a certified Mayor leave request.
     * Performs the deduction directly (does NOT use LeaveDeductionService,
     * which is bound to the regular employee workflow).
     */
    public function markAsApproved(Request $request, LeaveRequest $leaveRequest)
    {
        // Guard: only Mayor requests
        if ($leaveRequest->employee?->user?->role !== 'mayor') {
            return redirect()->back()->withErrors([
                'error' => 'This action is only available for Mayor leave requests.'
            ]);
        }

        // Guard: must be currently certified
        if ($leaveRequest->status !== 'certified') {
            return redirect()->back()->withErrors([
                'error' => 'This request is not in certified status.'
            ]);
        }

        DB::beginTransaction();

        try {
            // Re-fetch with lock
            $fresh = LeaveRequest::with(['leaveType'])->lockForUpdate()->findOrFail($leaveRequest->id);

            if ($fresh->status !== 'certified') {
                throw new \Exception('This request has already been finalized.');
            }

            // Determine which leave type to deduct from
            $leaveCode = strtoupper($fresh->leaveType?->code ?? '');
            $days = (float) $fresh->number_of_days;

            // Map code to actual LeaveType record
            $leaveTypeRecord = null;
            if ($leaveCode === 'VL') {
                $leaveTypeRecord = LeaveType::where('code', 'VL')->first();
            } elseif ($leaveCode === 'SL') {
                $leaveTypeRecord = LeaveType::where('code', 'SL')->first();
            } else {
                // Fallback: use the request's leave_type_id
                if ($fresh->leave_type_id) {
                    $leaveTypeRecord = LeaveType::find($fresh->leave_type_id);
                }
            }

            if (!$leaveTypeRecord) {
                throw new \Exception("Cannot determine leave type to deduct (code: {$leaveCode}).");
            }

            // Ensure a balance row exists
            $balance = LeaveBalance::firstOrCreate(
                [
                    'employee_id' => $fresh->employee_id,
                    'leave_type_id' => $leaveTypeRecord->id,
                ],
                ['balance' => 0]
            );

            $previous = (float) $balance->balance;
            $new = $previous - $days;

            if ($new < 0) {
                // Prevent negative balances — cap at 0
                $new = 0;
            }

            $balance->balance = $new;
            $balance->save();

            // Log a credit transaction
            LeaveCreditTransaction::create([
                'employee_id' => $fresh->employee_id,
                'leave_type_id' => $leaveTypeRecord->id,
                'transaction_type' => 'LEAVE_DEDUCTION',
                'amount' => -$days,
                'balance_after' => $new,
                'transaction_date' => now(),
                'period_month' => now()->month,
                'period_year' => now()->year,
                'description' => 'Leave deduction for approved Mayor request #' . $fresh->id,
                'reference_type' => get_class($fresh),
                'reference_id' => $fresh->id,
                'created_by' => auth()->id(),
            ]);

            // Update the request as fully approved
            $fresh->status = 'approved';
            $fresh->final_approved_at = now();
            $fresh->final_approved_by = auth()->id();

            $remark = 'Manually finalized by HRMO after receiving the signed physical form.';
            $fresh->remarks = $fresh->remarks
                ? $fresh->remarks . "\n" . $remark
                : $remark;

            $fresh->save();

            DB::commit();

            \Log::info('Mayor leave request finalized successfully', [
                'leave_request_id' => $fresh->id,
                'hrmo_id' => auth()->id(),
                'deducted_days' => $days,
                'leave_type_id' => $leaveTypeRecord->id,
                'previous_balance' => $previous,
                'new_balance' => $new,
            ]);

            return redirect()->back()->with(
                'success',
                'Leave request finalized. Credits deducted from ' .
                    number_format($previous, 2) . ' to ' . number_format($new, 2) . ' days.'
            );
        } catch (\Throwable $e) {
            DB::rollBack();

            \Log::error('Mayor finalization FAILED', [
                'leave_request_id' => $leaveRequest->id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return redirect()->back()->withErrors([
                'error' => 'Failed to finalize: ' . $e->getMessage(),
            ]);
        }
    }
}