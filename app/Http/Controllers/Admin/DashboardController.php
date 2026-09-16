<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use App\Models\LeaveType;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $now      = now();
        $today    = $now->toDateString();
        $year     = $now->year;
        $ytdStart = Carbon::create($year, 1, 1)->toDateString();

        // ============================================================
        // Headline stats
        // ============================================================
        $totalEmployees = User::where('role', 'employee')
            ->where('status', 'active')
            ->count();

        // Requests at the FINAL step awaiting Admin decision
        $pendingAdminApprovals = LeaveRequest::where('status', 'department_approved')->count();

        // Everything still in-flight (not yet fully approved/rejected)
        $pendingRequests = LeaveRequest::whereIn('status', [
            'pending', 'certified', 'department_approved',
        ])->count();

        $departments = Department::where('status', 'active')->count();

        $approvedYtd = LeaveRequest::where('status', 'approved')
            ->whereBetween('date_filed', [$ytdStart, $today])
            ->count();

        $rejectedYtd = LeaveRequest::where('status', 'rejected')
            ->whereBetween('date_filed', [$ytdStart, $today])
            ->count();

        $decided     = $approvedYtd + $rejectedYtd;
        $approvalRate = $decided > 0 ? (int) round(($approvedYtd / $decided) * 100) : null;

        $daysUsedYtd = (float) LeaveRequest::where('status', 'approved')
            ->whereBetween('date_filed', [$ytdStart, $today])
            ->sum('number_of_days');

        $onLeaveToday = LeaveRequest::where('status', 'approved')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->count();

        $stats = [
            'totalEmployees'        => $totalEmployees,
            'pendingAdminApprovals' => $pendingAdminApprovals,
            'pendingRequests'       => $pendingRequests,
            'departments'           => $departments,
            'approvedYtd'           => $approvedYtd,
            'rejectedYtd'           => $rejectedYtd,
            'approvalRate'          => $approvalRate,
            'daysUsedYtd'           => $daysUsedYtd,
            'onLeaveToday'          => $onLeaveToday,
        ];

        // ============================================================
        // Pending queue — how long has each been waiting for Admin
        // ============================================================
        $pendingQueue = LeaveRequest::where('status', 'department_approved')
            ->get(['id', 'updated_at', 'approved_at', 'date_filed']);

        $aging = ['under_3' => 0, 'three_to_seven' => 0, 'over_seven' => 0];
        foreach ($pendingQueue as $p) {
            $anchor = $p->approved_at ?? $p->updated_at ?? $p->date_filed;
            if (!$anchor) continue;
            $days = Carbon::parse($anchor)->diffInDays($now);
            if ($days < 3)      $aging['under_3']++;
            elseif ($days <= 7) $aging['three_to_seven']++;
            else                $aging['over_seven']++;
        }

        // ============================================================
        // 6-month trend
        // ============================================================
        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $m     = $now->copy()->subMonths($i);
            $start = $m->copy()->startOfMonth()->toDateString();
            $end   = $m->copy()->endOfMonth()->toDateString();

            $monthlyTrend[] = [
                'label'    => $m->format('M'),
                'year'     => $m->format('Y'),
                'approved' => LeaveRequest::where('status', 'approved')
                    ->whereBetween('date_filed', [$start, $end])->count(),
                'pending'  => LeaveRequest::whereIn('status', [
                        'pending', 'certified', 'department_approved',
                    ])->whereBetween('date_filed', [$start, $end])->count(),
                'rejected' => LeaveRequest::where('status', 'rejected')
                    ->whereBetween('date_filed', [$start, $end])->count(),
            ];
        }

        // ============================================================
        // Department comparison — requests per employee YTD
        // ============================================================
        $departmentComparison = Department::where('status', 'active')
            ->orderBy('department_name')
            ->get()
            ->map(function (Department $d) use ($ytdStart, $today) {
                $employeeIds = Employee::where('department_id', $d->id)
                    ->whereHas('user', fn ($q) => $q->where('status', 'active'))
                    ->pluck('id');

                $headcount = $employeeIds->count();

                $requests = LeaveRequest::whereIn('employee_id', $employeeIds)
                    ->whereBetween('date_filed', [$ytdStart, $today])
                    ->count();

                $pending = LeaveRequest::whereIn('employee_id', $employeeIds)
                    ->whereIn('status', ['pending', 'certified', 'department_approved'])
                    ->count();

                $approved = LeaveRequest::whereIn('employee_id', $employeeIds)
                    ->where('status', 'approved')
                    ->whereBetween('date_filed', [$ytdStart, $today])
                    ->count();

                $rejected = LeaveRequest::whereIn('employee_id', $employeeIds)
                    ->where('status', 'rejected')
                    ->whereBetween('date_filed', [$ytdStart, $today])
                    ->count();

                $decided = $approved + $rejected;

                return [
                    'name'          => $d->department_name,
                    'headcount'     => $headcount,
                    'requests'      => $requests,
                    'per_capita'    => $headcount > 0 ? round($requests / $headcount, 2) : 0,
                    'pending'       => $pending,
                    'approval_rate' => $decided > 0 ? (int) round(($approved / $decided) * 100) : null,
                ];
            })
            ->sortByDesc('per_capita')
            ->values();

        // ============================================================
        // Leave type mix YTD
        // ============================================================
        $leaveTypeMix = LeaveType::orderBy('name')
            ->get(['id', 'name', 'code'])
            ->map(function ($lt) use ($ytdStart, $today) {
                $count = LeaveRequest::where('leave_type_id', $lt->id)
                    ->whereBetween('date_filed', [$ytdStart, $today])
                    ->count();
                return ['id' => $lt->id, 'name' => $lt->name, 'code' => $lt->code, 'count' => $count];
            })
            ->filter(fn ($lt) => $lt['count'] > 0)
            ->sortByDesc('count')
            ->take(6)
            ->values();

        // ============================================================
        // Status snapshot YTD
        // ============================================================
        $statusBreakdown = [
            'pending' => LeaveRequest::whereIn('status', [
                    'pending', 'certified', 'department_approved',
                ])->whereBetween('date_filed', [$ytdStart, $today])->count(),
            'approved' => $approvedYtd,
            'rejected' => $rejectedYtd,
        ];

        // ============================================================
        // Upcoming leaves — next 14 days
        // ============================================================
        $upcomingEnd = $now->copy()->addDays(14)->toDateString();
        $upcomingLeaves = LeaveRequest::with([
                'employee:id,firstname,lastname,middle_initial,salutation,department_id',
                'employee.department:id,department_name',
                'leaveType:id,name',
            ])
            ->where('status', 'approved')
            ->whereDate('start_date', '>', $today)
            ->whereDate('start_date', '<=', $upcomingEnd)
            ->orderBy('start_date')
            ->limit(8)
            ->get()
            ->map(fn ($r) => [
                'id'         => $r->id,
                'name'       => $r->employee?->full_name ?? 'Unknown',
                'department' => $r->employee?->department?->department_name,
                'leave_type' => $r->leaveType?->name ?? '—',
                'from'       => $r->start_date ? Carbon::parse($r->start_date)->format('M d') : '—',
                'days'       => (float) $r->number_of_days,
            ]);

        // ============================================================
        // Approval pipeline — average days from submitted to final
        // ============================================================
        $completed = LeaveRequest::whereNotNull('final_approved_at')
            ->whereBetween('date_filed', [$ytdStart, $today])
            ->get(['submitted_at', 'final_approved_at', 'date_filed']);

        $daysToFinal = [];
        foreach ($completed as $r) {
            $start = $r->submitted_at ?? $r->date_filed;
            if ($start && $r->final_approved_at) {
                $daysToFinal[] = Carbon::parse($start)->diffInDays($r->final_approved_at);
            }
        }
        $avgDaysToFinal = count($daysToFinal) > 0
            ? round(array_sum($daysToFinal) / count($daysToFinal), 1)
            : null;

        // ============================================================
        // Recent activity
        // ============================================================
        $recentActivity = LeaveRequest::with(['employee:id,firstname,lastname,middle_initial,salutation', 'leaveType:id,name'])
            ->orderBy('updated_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($req) {
                $name = $req->employee?->full_name ?? 'Employee';
                $type = $req->leaveType?->name ?? 'leave';

                $verb = match ($req->request_type) {
                    'monetization'   => 'requested monetization',
                    'terminal_leave' => 'submitted terminal leave',
                    default          => "filed a {$type} request",
                };

                $statusLabel = match ($req->status) {
                    'pending'              => 'Pending',
                    'certified'            => 'Certified',
                    'department_approved'  => 'Awaiting your approval',
                    'approved'             => 'Approved',
                    'rejected'             => 'Rejected',
                    'cancelled'            => 'Cancelled',
                    default                => ucfirst($req->status),
                };

                return [
                    'id'     => $req->id,
                    'name'   => $name,
                    'action' => "{$name} {$verb}",
                    'status' => $statusLabel,
                    'status_key' => $req->status,
                    'time'   => $req->updated_at->diffForHumans(),
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'stats'                => $stats,
            'aging'                => $aging,
            'monthlyTrend'         => $monthlyTrend,
            'departmentComparison' => $departmentComparison,
            'leaveTypeMix'         => $leaveTypeMix,
            'statusBreakdown'      => $statusBreakdown,
            'upcomingLeaves'       => $upcomingLeaves,
            'avgDaysToFinal'       => $avgDaysToFinal,
            'recentActivity'       => $recentActivity,
             'trend'                => $this->buildTrendExplorer(), // 👈 add
        ]);
    }


    /**
 * Builds a 3-year trend dataset grouped by:
 *   year → month → { total, approved, pending, rejected, by_type, by_type_status }
 *
 * Pending bucket includes: pending + certified + department_approved
 * (anything still in-flight). Cancelled requests are excluded.
 */
private function buildTrendExplorer(): array
{
    $currentYear = now()->year;
    $years       = [$currentYear, $currentYear - 1, $currentYear - 2];
    $earliest    = min($years);

    $leaveTypes = LeaveType::where('status', true)
        ->orderBy('name')
        ->get(['id', 'name', 'code']);

    // Pull every request in the 3-year range once (single query).
    $requests = LeaveRequest::whereYear('date_filed', '>=', $earliest)
        ->whereYear('date_filed', '<=', $currentYear)
        ->get(['id', 'leave_type_id', 'status', 'date_filed']);

    // Pre-build empty 12-month skeletons per year.
    $dataByYear = [];
    foreach ($years as $y) {
        $dataByYear[$y] = [];
        for ($m = 1; $m <= 12; $m++) {
            $dataByYear[$y][$m] = [
                'label'          => Carbon::create($y, $m, 1)->format('M'),
                'month'          => $m,
                'total'          => 0,
                'approved'       => 0,
                'pending'        => 0,
                'rejected'       => 0,
                'by_type'        => [],
                'by_type_status' => [],
            ];
            foreach ($leaveTypes as $lt) {
                $dataByYear[$y][$m]['by_type'][$lt->id] = 0;
                $dataByYear[$y][$m]['by_type_status'][$lt->id] = [
                    'approved' => 0,
                    'pending'  => 0,
                    'rejected' => 0,
                ];
            }
        }
    }

    // Populate.
    foreach ($requests as $r) {
        $d    = Carbon::parse($r->date_filed);
        $year = (int) $d->year;
        if (!isset($dataByYear[$year])) continue;

        $month = (int) $d->month;

        // Normalize status into one of three buckets
        $bucket = match ($r->status) {
            'pending', 'certified', 'department_approved' => 'pending',
            'approved'                                     => 'approved',
            'rejected'                                     => 'rejected',
            default                                        => null, // skip cancelled
        };
        if ($bucket === null) continue;

        $dataByYear[$year][$month]['total']++;
        $dataByYear[$year][$month][$bucket]++;

        $typeId = $r->leave_type_id;
        if ($typeId && isset($dataByYear[$year][$month]['by_type'][$typeId])) {
            $dataByYear[$year][$month]['by_type'][$typeId]++;
            $dataByYear[$year][$month]['by_type_status'][$typeId][$bucket]++;
        }
    }

    return [
        'years'        => $years,
        'leave_types'  => $leaveTypes,
        'data_by_year' => $dataByYear,
    ];
}
}