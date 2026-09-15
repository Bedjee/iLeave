<?php

namespace App\Http\Controllers\HRMO;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\LeavePrintLog;
use App\Models\LeaveType;
use App\Models\Department;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ApprovedLeaveController extends Controller
{
    /**
     * Base query for the Approved Leaves page.
     * Includes:
     *   - All fully approved requests
     *   - Certified requests filed by a Mayor (they skip DH/Admin approval)
     */
    private function baseQuery()
    {
        return LeaveRequest::query()->where(function ($q) {
            $q->where('status', 'approved')
              ->orWhere(function ($q2) {
                  $q2->where('status', 'certified')
                     ->whereHas('employee.user', function ($q3) {
                         $q3->where('role', 'mayor');
                     });
              });
        });
    }

    /**
     * Can this request be downloaded/printed from the Approved Leaves page?
     */
    private function isPrintable(LeaveRequest $leaveRequest): bool
    {
        if ($leaveRequest->status === 'approved') {
            return true;
        }

        if (
            $leaveRequest->status === 'certified'
            && $leaveRequest->employee?->user?->role === 'mayor'
        ) {
            return true;
        }

        return false;
    }

    public function index(Request $request)
    {
        $query = $this->baseQuery()
            ->with(['employee.user', 'employee.department', 'leaveType', 'detail', 'dates'])
            ->orderByRaw('COALESCE(final_approved_at, certified_at) DESC');

        // Filters
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
            $query->where(function ($q) use ($request) {
                $q->whereBetween('final_approved_at', [$request->date_from, $request->date_to])
                  ->orWhereBetween('certified_at', [$request->date_from, $request->date_to]);
            });
        }

        if ($request->filled('department')) {
            $query->whereHas('employee', function ($q) use ($request) {
                $q->where('department_id', $request->department);
            });
        }

        $leaveRequests = $query->withCount('printLogs')->paginate(15)->withQueryString();

        $leaveTypes = LeaveType::where('status', true)->orderBy('name')->get(['id', 'name']);
        $departments = Department::orderBy('department_name')->get(['id', 'department_name']);

        return Inertia::render('HRMO/ApprovedLeaves/Index', [
            'leaveRequests' => $leaveRequests,
            'filters' => $request->only(['search', 'leave_type', 'date_from', 'date_to', 'department']),
            'leaveTypes' => $leaveTypes,
            'departments' => $departments,
        ]);
    }

    public function download(LeaveRequest $leaveRequest)
    {
        if (!$this->isPrintable($leaveRequest)) {
            abort(404);
        }

        $leaveRequest->load([
            'employee.department',
            'leaveType',
            'employee.leaveBalances',
            'detail',
            'dates',
            'certification.details.leaveType',
            'certifiedBy.employee',
            'approvedBy.employee',
            'finalApprovedBy.employee',
        ]);

        // Log the download
        LeavePrintLog::create([
            'leave_request_id' => $leaveRequest->id,
            'user_id' => Auth::id(),
            'printed_at' => now(),
        ]);

        $pdf = Pdf::loadView('pdf.leave_approval', [
            'leaveRequest' => $leaveRequest,
        ]);

        $filename = 'Leave_Approval_' . $leaveRequest->id . '_' . now()->format('Ymd_His') . '.pdf';

        return $pdf->download($filename);
    }

    public function history(LeaveRequest $leaveRequest, Request $request)
    {
        if (!$this->isPrintable($leaveRequest)) {
            abort(404);
        }

        $logs = $leaveRequest->printLogs()->with('user')->get();

        $history = [
            'logs' => $logs->map(function ($log) {
                return [
                    'printed_at' => $log->printed_at->format('Y-m-d H:i:s'),
                    'user_name' => $log->user->name,
                    'user_email' => $log->user->email,
                ];
            }),
            'total' => $logs->count(),
        ];

        $query = $this->baseQuery()
            ->with(['employee.user', 'employee.department', 'leaveType', 'dates'])
            ->orderByRaw('COALESCE(final_approved_at, certified_at) DESC');

        // Re-apply filters
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
        if ($request->filled('department')) {
            $query->whereHas('employee', function ($q) use ($request) {
                $q->where('department_id', $request->department);
            });
        }
        if ($request->filled('date_from') && $request->filled('date_to')) {
            $query->where(function ($q) use ($request) {
                $q->whereBetween('final_approved_at', [$request->date_from, $request->date_to])
                  ->orWhereBetween('certified_at', [$request->date_from, $request->date_to]);
            });
        }

        $leaveRequests = $query->withCount('printLogs')->paginate(15)->withQueryString();
        $leaveTypes = LeaveType::where('status', true)->orderBy('name')->get(['id', 'name']);
        $departments = Department::orderBy('department_name')->get(['id', 'department_name']);

        return Inertia::render('HRMO/ApprovedLeaves/Index', [
            'leaveRequests' => $leaveRequests,
            'filters' => $request->only(['search', 'leave_type', 'date_from', 'date_to', 'department']),
            'leaveTypes' => $leaveTypes,
            'departments' => $departments,
            'history' => $history,
        ]);
    }
}