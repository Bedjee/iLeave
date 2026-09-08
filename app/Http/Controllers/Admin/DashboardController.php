<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // Total active employees (users with role 'employee' and status 'active')
        $totalEmployees = User::where('role', 'employee')
            ->where('status', 'active')
            ->count();

        // Pending requests: certified by HRMO AND department_approved (waiting for Admin)
        $pendingAdminApprovals = LeaveRequest::where('status', 'department_approved')->count();

        // Also include certified requests that haven't been reviewed by department head yet?
        // For Admin, we care about department_approved (final step before Admin)
        // But we might also want to show total pending actions.
        $pendingRequests = LeaveRequest::whereIn('status', ['certified', 'department_approved'])->count();

        // Active departments
        $departments = Department::where('status', 'active')->count();

        // Total leave days used this year (approved requests)
        $totalLeaves = LeaveRequest::where('status', 'approved')
            ->whereYear('approved_at', now()->year)
            ->sum('number_of_days') ?? 0;

        // Recent activity: last 5 updated leave requests
        $recentActivity = LeaveRequest::with(['employee', 'leaveType'])
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($req) {
                $action = $req->employee->full_name ?? 'Employee';
                if ($req->request_type === 'monetization') {
                    $action .= ' requested monetization';
                } elseif ($req->request_type === 'terminal_leave') {
                    $action .= ' submitted terminal leave';
                } else {
                    $action .= ' ' . ($req->leaveType->name ?? 'leave') . ' request';
                }
                return [
                    'id' => $req->id,
                    'action' => $action,
                    'time' => $req->updated_at->diffForHumans(),
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalEmployees' => $totalEmployees,
                'pendingRequests' => $pendingRequests,
                'pendingAdminApprovals' => $pendingAdminApprovals,
                'departments' => $departments,
                'totalLeaves' => $totalLeaves,
            ],
            'recentActivity' => $recentActivity,
        ]);
    }
}
