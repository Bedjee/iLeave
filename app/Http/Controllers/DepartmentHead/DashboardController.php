<?php

namespace App\Http\Controllers\DepartmentHead;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $employee = $user->employee;

        // Ensure the user is a Department Head and has an employee record
        if (!$employee || !$employee->department_id) {
            return Inertia::render('DepartmentHead/Dashboard', [
                'stats' => $this->emptyStats(),
                'pendingApprovals' => [],
                'employee' => null,
                'department' => null,
            ]);
        }

        $departmentId = $employee->department_id;

        // Get all employees in this department (excluding the head)
        $teamMembers = Employee::where('department_id', $departmentId)
            ->where('id', '!=', $employee->id)
            ->with('user')
            ->get();

        // Get certified leave requests from employees in this department
        // that are still pending Department Head action (status = 'certified')
        $pendingApprovals = LeaveRequest::with(['employee.user', 'leaveType'])
            ->where('status', 'certified')
            ->whereHas('employee', function ($q) use ($departmentId) {
                $q->where('department_id', $departmentId);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        // Stats
        $stats = [
            'teamMembers' => $teamMembers->count(),
            'pendingRequests' => $pendingApprovals->count(),
            'approvedThisMonth' => LeaveRequest::where('status', 'approved')
                ->whereHas('employee', function ($q) use ($departmentId) {
                    $q->where('department_id', $departmentId);
                })
                ->whereMonth('approved_at', Carbon::now()->month)
                ->whereYear('approved_at', Carbon::now()->year)
                ->count(),
            'totalRequests' => LeaveRequest::whereHas('employee', function ($q) use ($departmentId) {
                $q->where('department_id', $departmentId);
            })->count(),
        ];

        // Transform data for React
        $pendingApprovalsData = $pendingApprovals->map(function ($request) {
            return [
                'id' => $request->id,
                'employee' => $request->employee->full_name,
                'type' => $request->leaveType->name,
                'start' => $request->start_date ? Carbon::parse($request->start_date)->format('Y-m-d') : null,
                'end' => $request->end_date ? Carbon::parse($request->end_date)->format('Y-m-d') : null,
                'days' => $request->number_of_days,
            ];
        });

        return Inertia::render('DepartmentHead/Dashboard', [
            'stats' => $stats,
            'pendingApprovals' => $pendingApprovalsData,
            'employee' => [
                'name' => $employee->full_name,
                'position' => $employee->position,
                'department' => $employee->department?->department_name,
            ],
            'department' => $employee->department?->department_name,
        ]);
    }

    private function emptyStats(): array
    {
        return [
            'teamMembers' => 0,
            'pendingRequests' => 0,
            'approvedThisMonth' => 0,
            'totalRequests' => 0,
        ];
    }
}
