<?php

namespace App\Http\Controllers\Mayor;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentOverviewController extends Controller
{
    public function index(Request $request)
    {
        $year  = (int) $request->input('year', now()->year);
        $month = (int) $request->input('month', now()->month);

        $startOfMonth = Carbon::create($year, $month, 1)->startOfMonth();
        $endOfMonth   = $startOfMonth->copy()->endOfMonth();
        $today        = now()->toDateString();

        // ---------- Global stats ----------
        $totalDepartments = Department::where('status', 'active')->count();

        $totalEmployees = Employee::whereHas('user', function ($q) {
            $q->where('status', 'active');
        })->count();

        $pendingRequests = LeaveRequest::where('status', 'pending')->count();

        $requestsThisMonth = LeaveRequest::whereBetween('date_filed', [
            $startOfMonth->toDateString(),
            $endOfMonth->toDateString(),
        ])->count();

        $onLeaveToday = LeaveRequest::where('status', 'approved')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->count();

        // ---------- Per-department card data ----------
        $departments = Department::where('status', 'active')
            ->with(['head:id,firstname,lastname,middle_initial,salutation'])
            ->get()
            ->map(function (Department $dept) use ($startOfMonth, $endOfMonth, $today) {

                // Active employees in this department
                $employeeIds = Employee::where('department_id', $dept->id)
                    ->whereHas('user', fn ($q) => $q->where('status', 'active'))
                    ->pluck('id');

                $base = LeaveRequest::whereIn('employee_id', $employeeIds);

                // Total = everything ever filed (all statuses)
                $totalRequests = (clone $base)->count();

                // Final approved (mayor signed off)
                $approved = (clone $base)->where('status', 'approved')->count();

                // Rejected
                $rejected = (clone $base)->where('status', 'rejected')->count();

                // Pending (all in-flight — includes "certified" and "dept head approved")
                $pending = (clone $base)->where('status', 'pending')->count();

                // Filed this month
                $thisMonth = (clone $base)
                    ->whereBetween('date_filed', [
                        $startOfMonth->toDateString(),
                        $endOfMonth->toDateString(),
                    ])
                    ->count();

                // Employees currently on approved leave today
                $onLeaveNow = (clone $base)
                    ->where('status', 'approved')
                    ->whereDate('start_date', '<=', $today)
                    ->whereDate('end_date', '>=', $today)
                    ->count();

                // Approval rate = approved / (approved + rejected)
                $decided = $approved + $rejected;
                $approvalRate = $decided > 0
                    ? (int) round(($approved / $decided) * 100)
                    : null;

                return [
                    'id'                => $dept->id,
                    'name'              => $dept->department_name,
                    'code'              => $dept->department_code,
                    'head_name'         => $dept->head?->full_name,
                    'employees_count'   => $employeeIds->count(),
                    'total_requests'    => $totalRequests,
                    'approved'          => $approved,
                    'rejected'          => $rejected,
                    'pending'           => $pending,
                    'this_month'        => $thisMonth,
                    'on_leave_today'    => $onLeaveNow,
                    'approval_rate'     => $approvalRate,
                ];
            })
            // Highest activity first
            ->sortByDesc('total_requests')
            ->values();

        // ---------- 6-month trend ----------
        $trend = [];
        for ($i = 5; $i >= 0; $i--) {
            $m      = now()->copy()->subMonths($i);
            $mStart = $m->copy()->startOfMonth()->toDateString();
            $mEnd   = $m->copy()->endOfMonth()->toDateString();

            $trend[] = [
                'label'    => $m->format('M'),
                'year'     => $m->format('Y'),
                'approved' => LeaveRequest::where('status', 'approved')
                    ->whereBetween('date_filed', [$mStart, $mEnd])->count(),
                'rejected' => LeaveRequest::where('status', 'rejected')
                    ->whereBetween('date_filed', [$mStart, $mEnd])->count(),
                'pending'  => LeaveRequest::where('status', 'pending')
                    ->whereBetween('date_filed', [$mStart, $mEnd])->count(),
            ];
        }

        return Inertia::render('Mayor/DepartmentOverview/Index', [
            'stats' => [
                'total_departments'   => $totalDepartments,
                'total_employees'     => $totalEmployees,
                'pending_requests'    => $pendingRequests,
                'requests_this_month' => $requestsThisMonth,
                'on_leave_today'      => $onLeaveToday,
            ],
            'departments' => $departments,
            'trend'       => $trend,
            'filters'     => ['year' => $year, 'month' => $month],
        ]);
    }
}