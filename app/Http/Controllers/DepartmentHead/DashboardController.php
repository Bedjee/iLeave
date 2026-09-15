<?php

namespace App\Http\Controllers\DepartmentHead;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user     = Auth::user();
        $employee = $user->employee;

        // ---------- Guard: no department ----------
        if (!$employee || !$employee->department_id) {
            return Inertia::render('DepartmentHead/Dashboard', [
                'stats'              => $this->emptyStats(),
                'pendingApprovals'   => [],
                'teamOnLeaveToday'   => [],
                'upcomingLeaves'     => [],
                'monthlyTrend'       => $this->emptyTrend(),
                'leaveTypeBreakdown' => [],
                'statusBreakdown'    => ['pending' => 0, 'approved' => 0, 'rejected' => 0],
                'topLeaveUsers'      => [],
                'approvalRate'       => null,
                'avgDaysToApprove'   => null,
                'employee'           => null,
                'department'         => null,
            ]);
        }

        $departmentId = $employee->department_id;
        $now          = now();
        $today        = $now->toDateString();
        $year         = $now->year;
        $ytdStart     = Carbon::create($year, 1, 1)->toDateString();

        // ============================================================
        // Base query — every request whose employee is in this dept
        // ============================================================
        $deptQuery = fn () => LeaveRequest::query()
            ->whereHas('employee', fn ($q) => $q->where('department_id', $departmentId));

        // ============================================================
        // Team members (excludes the head themselves)
        // ============================================================
        $teamMembers = Employee::where('department_id', $departmentId)
            ->where('id', '!=', $employee->id)
            ->with('user')
            ->get();

        // ============================================================
        // Pending approvals (certified, awaiting dept head decision)
        // ============================================================
        $pendingApprovals = LeaveRequest::with(['employee.user', 'leaveType', 'dates'])
            ->where('status', 'certified')
            ->whereHas('employee', fn ($q) => $q->where('department_id', $departmentId))
            ->orderBy('created_at', 'asc')
            ->get();

        $pendingApprovalsData = $pendingApprovals->map(fn ($request) => [
            'id'       => $request->id,
            'employee' => $request->employee->full_name,
            'type'     => $request->leaveType?->name ?? '—',
            'start'    => $request->start_date ? Carbon::parse($request->start_date)->format('M d, Y') : null,
            'end'      => $request->end_date ? Carbon::parse($request->end_date)->format('M d, Y') : null,
            'days'     => (float) $request->number_of_days,
            'filed'    => $request->date_filed ? Carbon::parse($request->date_filed)->diffForHumans() : null,
        ]);

        // ============================================================
        // Headline stats
        // ============================================================
        $approvedYtd = $deptQuery()
            ->where('status', 'approved')
            ->whereBetween('date_filed', [$ytdStart, $today])
            ->count();

        $rejectedYtd = $deptQuery()
            ->where('status', 'rejected')
            ->whereBetween('date_filed', [$ytdStart, $today])
            ->count();

        $decided = $approvedYtd + $rejectedYtd;
        $approvalRate = $decided > 0 ? (int) round(($approvedYtd / $decided) * 100) : null;

        $stats = [
            'teamMembers'        => $teamMembers->count(),
            'pendingRequests'    => $pendingApprovals->count(),
            'approvedThisMonth'  => $deptQuery()
                ->where('status', 'approved')
                ->whereMonth('approved_at', $now->month)
                ->whereYear('approved_at', $now->year)
                ->count(),
            'totalRequestsYtd'   => $deptQuery()
                ->whereBetween('date_filed', [$ytdStart, $today])
                ->count(),
            'onLeaveToday'       => $deptQuery()
                ->where('status', 'approved')
                ->whereDate('start_date', '<=', $today)
                ->whereDate('end_date', '>=', $today)
                ->count(),
            'approvalRate'       => $approvalRate,
        ];

        // ============================================================
        // 6-month trend (stacked)
        // ============================================================
        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $m     = $now->copy()->subMonths($i);
            $start = $m->copy()->startOfMonth()->toDateString();
            $end   = $m->copy()->endOfMonth()->toDateString();

            $monthlyTrend[] = [
                'label'    => $m->format('M'),
                'year'     => $m->format('Y'),
                'approved' => $deptQuery()
                    ->where('status', 'approved')
                    ->whereBetween('date_filed', [$start, $end])->count(),
                'pending'  => $deptQuery()
                    ->whereIn('status', ['pending', 'certified', 'department_approved'])
                    ->whereBetween('date_filed', [$start, $end])->count(),
                'rejected' => $deptQuery()
                    ->where('status', 'rejected')
                    ->whereBetween('date_filed', [$start, $end])->count(),
            ];
        }

        // ============================================================
        // Leave type mix (YTD)
        // ============================================================
        $leaveTypeBreakdown = LeaveType::orderBy('name')
            ->get(['id', 'name', 'code'])
            ->map(function ($lt) use ($deptQuery, $ytdStart, $today) {
                $count = $deptQuery()
                    ->where('leave_type_id', $lt->id)
                    ->whereBetween('date_filed', [$ytdStart, $today])
                    ->count();
                return [
                    'id'    => $lt->id,
                    'name'  => $lt->name,
                    'code'  => $lt->code,
                    'count' => $count,
                ];
            })
            ->filter(fn ($lt) => $lt['count'] > 0)
            ->sortByDesc('count')
            ->values();

        // ============================================================
        // Status snapshot (YTD)
        // ============================================================
        $statusBreakdown = [
            'pending' => $deptQuery()
                ->whereIn('status', ['pending', 'certified', 'department_approved'])
                ->whereBetween('date_filed', [$ytdStart, $today])
                ->count(),
            'approved' => $approvedYtd,
            'rejected' => $rejectedYtd,
        ];

        // ============================================================
        // Team on leave today
        // ============================================================
        $teamOnLeaveToday = $deptQuery()
            ->with([
                'employee:id,firstname,lastname,middle_initial,salutation',
                'leaveType:id,name',
            ])
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->orderBy('end_date')
            ->limit(10)
            ->get()
            ->map(fn ($r) => [
                'id'         => $r->id,
                'name'       => $r->employee?->full_name ?? 'Unknown',
                'leave_type' => $r->leaveType?->name ?? '—',
                'until'      => $r->end_date ? Carbon::parse($r->end_date)->format('M d') : '—',
                'days'       => (float) $r->number_of_days,
            ]);

        // ============================================================
        // Upcoming leaves (next 14 days)
        // ============================================================
        $upcomingEnd = $now->copy()->addDays(14)->toDateString();
        $upcomingLeaves = $deptQuery()
            ->with([
                'employee:id,firstname,lastname,middle_initial,salutation',
                'leaveType:id,name',
            ])
            ->where('status', 'approved')
            ->whereDate('start_date', '>', $today)
            ->whereDate('start_date', '<=', $upcomingEnd)
            ->orderBy('start_date')
            ->limit(10)
            ->get()
            ->map(fn ($r) => [
                'id'         => $r->id,
                'name'       => $r->employee?->full_name ?? 'Unknown',
                'leave_type' => $r->leaveType?->name ?? '—',
                'from'       => $r->start_date ? Carbon::parse($r->start_date)->format('M d') : '—',
                'days'       => (float) $r->number_of_days,
            ]);

        // ============================================================
        // Top leave users (approved days, YTD)
        // ============================================================
        $topLeaveUsers = $teamMembers
            ->map(function ($emp) use ($ytdStart, $today) {
                $total = LeaveRequest::where('employee_id', $emp->id)
                    ->where('status', 'approved')
                    ->whereBetween('date_filed', [$ytdStart, $today])
                    ->sum('number_of_days');
                return [
                    'id'    => $emp->id,
                    'name'  => $emp->full_name,
                    'days'  => (float) $total,
                ];
            })
            ->filter(fn ($e) => $e['days'] > 0)
            ->sortByDesc('days')
            ->take(5)
            ->values();

        // ============================================================
        // Pipeline — average days from certification to dept head action
        // ============================================================
        $completed = $deptQuery()
            ->whereNotNull('certified_at')
            ->whereNotNull('approved_at')
            ->whereBetween('date_filed', [$ytdStart, $today])
            ->get(['certified_at', 'approved_at']);

        $daysToApprove = [];
        foreach ($completed as $r) {
            if ($r->certified_at && $r->approved_at) {
                $daysToApprove[] = Carbon::parse($r->certified_at)->diffInDays($r->approved_at);
            }
        }
        $avgDaysToApprove = count($daysToApprove) > 0
            ? round(array_sum($daysToApprove) / count($daysToApprove), 1)
            : null;

        return Inertia::render('DepartmentHead/Dashboard', [
            'stats'              => $stats,
            'pendingApprovals'   => $pendingApprovalsData,
            'teamOnLeaveToday'   => $teamOnLeaveToday,
            'upcomingLeaves'     => $upcomingLeaves,
            'monthlyTrend'       => $monthlyTrend,
            'leaveTypeBreakdown' => $leaveTypeBreakdown,
            'statusBreakdown'    => $statusBreakdown,
            'topLeaveUsers'      => $topLeaveUsers,
            'approvalRate'       => $approvalRate,
            'avgDaysToApprove'   => $avgDaysToApprove,
            'employee'           => [
                'name'       => $employee->full_name,
                'position'   => $employee->position,
                'department' => $employee->department?->department_name,
            ],
            'department' => $employee->department?->department_name,
        ]);
    }

    private function emptyStats(): array
    {
        return [
            'teamMembers'       => 0,
            'pendingRequests'   => 0,
            'approvedThisMonth' => 0,
            'totalRequestsYtd'  => 0,
            'onLeaveToday'      => 0,
            'approvalRate'      => null,
        ];
    }

    private function emptyTrend(): array
    {
        $out = [];
        for ($i = 5; $i >= 0; $i--) {
            $out[] = [
                'label'    => now()->subMonths($i)->format('M'),
                'year'     => now()->subMonths($i)->format('Y'),
                'approved' => 0,
                'pending'  => 0,
                'rejected' => 0,
            ];
        }
        return $out;
    }
}