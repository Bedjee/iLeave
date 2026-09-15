<?php

namespace App\Http\Controllers\HRMO;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Total active employees
        $totalEmployees = User::where('role', 'employee')
            ->where('status', 'active')
            ->count();

        // Pending leave requests (awaiting HRMO certification)
        $pendingRequests = LeaveRequest::where('status', 'pending')->count();

        // Active leave types
        $leaveTypes = LeaveType::where('status', true)->count();

        // Total leave days used this month (fully approved)
        $totalLeaveDaysThisMonth = LeaveRequest::where('status', 'approved')
            ->whereMonth('approved_at', Carbon::now()->month)
            ->whereYear('approved_at', Carbon::now()->year)
            ->sum('number_of_days') ?? 0;

        // Recent pending leave requests (up to 5)
        $recentPending = LeaveRequest::with(['employee', 'leaveType'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($req) {
                // Fallback name for requests without a leave type (Terminal Leave, etc.)
                $leaveTypeName = $req->leaveType?->name
                    ?? ($req->request_type === 'terminal_leave' ? 'Terminal Leave'
                        : ($req->request_type === 'monetization' ? 'Monetization' : '—'));

                return [
                    'id' => $req->id,
                    'employee' => $req->employee?->full_name ?? '—',
                    'leave_type' => $leaveTypeName,
                    'days' => $req->number_of_days,
                    'start' => $req->start_date ? Carbon::parse($req->start_date)->format('M d') : null,
                    'end' => $req->end_date ? Carbon::parse($req->end_date)->format('M d') : null,
                ];
            });

        // ============================================================
        // 1. Status Distribution (Pie chart)
        // ============================================================
        $statusCounts = LeaveRequest::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $allStatuses = ['pending', 'certified', 'department_approved', 'approved', 'rejected', 'cancelled'];
        $statusLabels = [
            'pending' => 'Pending',
            'certified' => 'Certified',
            'department_approved' => 'Dept. Approved',
            'approved' => 'Fully Approved',
            'rejected' => 'Rejected',
            'cancelled' => 'Cancelled/Recalled',
        ];
        $statusData = [];
        foreach ($allStatuses as $status) {
            $statusData[$status] = $statusCounts[$status] ?? 0;
        }

        // ============================================================
        // 2. Yearly Trends (January–December) for current year
        // ============================================================
        $yearlyTrends = [];
        $currentYear = Carbon::now()->year;
        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for ($month = 1; $month <= 12; $month++) {
            $monthName = $monthNames[$month - 1];
            $yearlyTrends[$monthName] = LeaveRequest::whereMonth('created_at', $month)
                ->whereYear('created_at', $currentYear)
                ->count();
        }

        // ============================================================
        // 3. Leave Type Usage (Bar chart) – top 5
        // ============================================================
        $leaveTypeUsage = LeaveRequest::with('leaveType')
            ->where('status', 'approved')
            ->whereNotNull('leave_type_id') // 🛡️ skip requests without a leave type
            ->select('leave_type_id', DB::raw('count(*) as total'))
            ->groupBy('leave_type_id')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get()
            ->mapWithKeys(function ($item) {
                // Guard against a deleted/missing leave type
                $name = $item->leaveType?->name ?? 'Unknown';
                return [$name => $item->total];
            })
            ->toArray();

        // ============================================================
        // 4. Department-wise Leave Usage (Bar chart) – top 5
        // ============================================================
        $departmentUsage = LeaveRequest::where('leave_requests.status', 'approved')
            ->join('employees', 'leave_requests.employee_id', '=', 'employees.id')
            ->join('departments', 'employees.department_id', '=', 'departments.id')
            ->whereNotNull('employees.department_id')
            ->select('departments.department_name', DB::raw('count(*) as total'))
            ->groupBy('departments.department_name')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->pluck('total', 'department_name')
            ->toArray();

        // ============================================================
        // 5. Monthly Leave Type Breakdown (Stacked bar)
        // ============================================================
        // Get top 5 leave types overall (by approved request count)
        $topLeaveTypeIds = LeaveRequest::where('status', 'approved')
            ->whereNotNull('leave_type_id') // 🛡️ skip requests without a leave type
            ->select('leave_type_id', DB::raw('count(*) as total'))
            ->groupBy('leave_type_id')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->pluck('leave_type_id')
            ->toArray();

        $topLeaveTypes = LeaveType::whereIn('id', $topLeaveTypeIds)
            ->pluck('name', 'id')
            ->toArray();

        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Prepare datasets for each leave type
        $datasets = [];
        $colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];

        $colorIndex = 0;
        foreach ($topLeaveTypes as $ltId => $ltName) {
            $data = [];
            for ($month = 1; $month <= 12; $month++) {
                $count = LeaveRequest::where('status', 'approved')
                    ->where('leave_type_id', $ltId)
                    ->whereMonth('created_at', $month)
                    ->whereYear('created_at', $currentYear)
                    ->count();
                $data[] = $count;
            }
            $datasets[] = [
                'label' => $ltName,
                'data' => $data,
                'backgroundColor' => $colors[$colorIndex % count($colors)],
                'borderColor' => $colors[$colorIndex % count($colors)],
                'borderWidth' => 1,
            ];
            $colorIndex++;
        }

        // Add "Others" dataset – includes requests with null leave_type_id
        $othersData = [];
        for ($month = 1; $month <= 12; $month++) {
            $totalMonth = LeaveRequest::where('status', 'approved')
                ->whereMonth('created_at', $month)
                ->whereYear('created_at', $currentYear)
                ->count();
            $sumTop = 0;
            foreach ($topLeaveTypeIds as $ltId) {
                $count = LeaveRequest::where('status', 'approved')
                    ->where('leave_type_id', $ltId)
                    ->whereMonth('created_at', $month)
                    ->whereYear('created_at', $currentYear)
                    ->count();
                $sumTop += $count;
            }
            $othersData[] = max(0, $totalMonth - $sumTop);
        }
        $datasets[] = [
            'label' => 'Others',
            'data' => $othersData,
            'backgroundColor' => '#6B7280',
            'borderColor' => '#6B7280',
            'borderWidth' => 1,
        ];

        return Inertia::render('HRMO/Dashboard', [
            'stats' => [
                'totalEmployees' => $totalEmployees,
                'pendingRequests' => $pendingRequests,
                'leaveTypes' => $leaveTypes,
                'totalLeaveDaysThisMonth' => $totalLeaveDaysThisMonth,
            ],
            'recentPending' => $recentPending,
            'statusDistribution' => [
                'labels' => array_values($statusLabels),
                'data' => array_values($statusData),
                'colors' => [
                    'pending' => '#F59E0B',
                    'certified' => '#3B82F6',
                    'department_approved' => '#8B5CF6',
                    'approved' => '#10B981',
                    'rejected' => '#EF4444',
                    'cancelled' => '#6B7280',
                ],
            ],
            'yearlyTrends' => [
                'labels' => array_keys($yearlyTrends),
                'data' => array_values($yearlyTrends),
            ],
            'leaveTypeUsage' => [
                'labels' => array_keys($leaveTypeUsage),
                'data' => array_values($leaveTypeUsage),
            ],
            'departmentUsage' => [
                'labels' => array_keys($departmentUsage),
                'data' => array_values($departmentUsage),
            ],
            'monthlyLeaveTypeBreakdown' => [
                'labels' => $monthNames,
                'datasets' => $datasets,
            ],
        ]);
    }
}