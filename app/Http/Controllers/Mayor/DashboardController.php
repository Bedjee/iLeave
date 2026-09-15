<?php

namespace App\Http\Controllers\Mayor;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeSeparation;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveReschedule;
use App\Models\LeaveType;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $now   = now();
        $year  = $now->year;
        $today = $now->toDateString();

        $ytdStart = Carbon::create($year, 1, 1)->toDateString();
        $ytdEnd   = $now->toDateString();

        // ============================================================
        // 1. MAYOR'S PENDING QUEUE — union of 3 buckets
        // ============================================================
        $mayorPending = $this->mayorPendingQuery()->get([
            'id', 'date_filed', 'submitted_at', 'status', 'employee_id',
        ]);

        $pendingCount = $mayorPending->count();

        // Aging — how long each pending item has been waiting
        $aging = ['under_3' => 0, 'three_to_seven' => 0, 'over_seven' => 0];
        foreach ($mayorPending as $p) {
            $start = $p->submitted_at ?? $p->date_filed;
            if (!$start) continue;
            $days = Carbon::parse($start)->diffInDays($now);
            if ($days < 3)       $aging['under_3']++;
            elseif ($days <= 7)  $aging['three_to_seven']++;
            else                 $aging['over_seven']++;
        }

        // ============================================================
        // 2. HEADLINE KPIs
        // ============================================================
        $stats = [
            'total_requests_ytd' => LeaveRequest::whereBetween('date_filed', [$ytdStart, $ytdEnd])->count(),
            'pending_my_action'  => $pendingCount,
            'approved_ytd'       => LeaveRequest::where('status', 'approved')
                                        ->whereBetween('date_filed', [$ytdStart, $ytdEnd])->count(),
            'on_leave_today'     => LeaveRequest::where('status', 'approved')
                                        ->whereDate('start_date', '<=', $today)
                                        ->whereDate('end_date', '>=', $today)->count(),
            'active_employees'   => Employee::whereHas('user', fn ($q) => $q->where('status', 'active'))->count(),
            'departments'        => Department::where('status', 'active')->count(),
        ];

        // ============================================================
        // 3. ON LEAVE TODAY
        // ============================================================
        $onLeaveToday = LeaveRequest::with([
                'employee:id,firstname,lastname,middle_initial,salutation,department_id',
                'employee.department:id,department_name',
                'leaveType:id,name',
            ])
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->orderBy('end_date')
            ->limit(15)
            ->get()
            ->map(fn ($r) => [
                'id'         => $r->id,
                'employee'   => $r->employee?->full_name,
                'department' => $r->employee?->department?->department_name,
                'leave_type' => $r->leaveType?->name,
                'until'      => $r->end_date?->toDateString(),
            ]);

        // ============================================================
        // 4. UPCOMING 7 DAYS
        // ============================================================
        $weekAhead = $now->copy()->addDays(7)->toDateString();
        $upcomingCount = LeaveRequest::where('status', 'approved')
            ->whereDate('start_date', '>', $today)
            ->whereDate('start_date', '<=', $weekAhead)
            ->count();

        // ============================================================
        // 5. DEPARTMENT COMPARISON
        // ============================================================
        $departmentComparison = Department::where('status', 'active')
            ->orderBy('department_name')
            ->get()
            ->map(function (Department $d) use ($ytdStart, $ytdEnd) {
                $employeeIds = Employee::where('department_id', $d->id)
                    ->whereHas('user', fn ($q) => $q->where('status', 'active'))
                    ->pluck('id');

                $headcount = $employeeIds->count();

                $requests = LeaveRequest::whereIn('employee_id', $employeeIds)
                    ->whereBetween('date_filed', [$ytdStart, $ytdEnd])->count();

                $approved = LeaveRequest::whereIn('employee_id', $employeeIds)
                    ->where('status', 'approved')
                    ->whereBetween('date_filed', [$ytdStart, $ytdEnd])->count();

                $rejected = LeaveRequest::whereIn('employee_id', $employeeIds)
                    ->where('status', 'rejected')
                    ->whereBetween('date_filed', [$ytdStart, $ytdEnd])->count();

                $decided = $approved + $rejected;

                return [
                    'name'          => $d->department_name,
                    'headcount'     => $headcount,
                    'requests'      => $requests,
                    'per_capita'    => $headcount > 0 ? round($requests / $headcount, 2) : 0,
                    'approval_rate' => $decided > 0 ? (int) round(($approved / $decided) * 100) : null,
                ];
            })
            ->sortByDesc('per_capita')
            ->values();

        // ============================================================
        // 6. TREND — 12 months
        // ============================================================
        $trend = [];
        for ($m = 1; $m <= 12; $m++) {
            $start = Carbon::create($year, $m, 1)->startOfMonth()->toDateString();
            $end   = Carbon::create($year, $m, 1)->endOfMonth()->toDateString();

            $trend[] = [
                'label'    => Carbon::create($year, $m, 1)->format('M'),
                'total'    => LeaveRequest::whereBetween('date_filed', [$start, $end])->count(),
                'approved' => LeaveRequest::where('status', 'approved')->whereBetween('date_filed', [$start, $end])->count(),
                'rejected' => LeaveRequest::where('status', 'rejected')->whereBetween('date_filed', [$start, $end])->count(),
                'pending'  => LeaveRequest::where('status', 'pending')->whereBetween('date_filed', [$start, $end])->count(),
            ];
        }

        // ============================================================
        // 7. YEAR-OVER-YEAR
        // ============================================================
        $lastYearStart = Carbon::create($year - 1, 1, 1)->toDateString();
        $lastYearEnd   = Carbon::create($year - 1, $now->month, $now->day)->toDateString();
        $lastYearCount = LeaveRequest::whereBetween('date_filed', [$lastYearStart, $lastYearEnd])->count();

        $yoy = [
            'this_year' => $stats['total_requests_ytd'],
            'last_year' => $lastYearCount,
            'delta_pct' => $lastYearCount > 0
                ? (int) round((($stats['total_requests_ytd'] - $lastYearCount) / $lastYearCount) * 100)
                : null,
        ];

        // ============================================================
        // 8. LEAVE TYPE MIX
        // ============================================================
        $topLeaveTypes = LeaveType::orderBy('name')->get()->map(function (LeaveType $lt) use ($ytdStart, $ytdEnd) {
            $count = LeaveRequest::where('leave_type_id', $lt->id)
                ->whereBetween('date_filed', [$ytdStart, $ytdEnd])->count();

            return ['name' => $lt->name ?? 'Unnamed', 'count' => $count];
        })
        ->sortByDesc('count')
        ->take(6)
        ->values();

        // ============================================================
        // 9. PIPELINE TIMING
        // ============================================================
        $completed = LeaveRequest::whereNotNull('final_approved_at')
            ->whereBetween('date_filed', [$ytdStart, $ytdEnd])
            ->get(['submitted_at', 'final_approved_at', 'date_filed']);

        $submitToFinal = [];
        foreach ($completed as $r) {
            $start = $r->submitted_at ?? $r->date_filed;
            if ($start && $r->final_approved_at) {
                $submitToFinal[] = Carbon::parse($start)->diffInDays($r->final_approved_at);
            }
        }

        $pipeline = [
            'avg_days_to_final' => count($submitToFinal) > 0
                ? round(array_sum($submitToFinal) / count($submitToFinal), 1)
                : null,
            'sample_size'       => count($submitToFinal),
        ];

        // ============================================================
        // 10. LIABILITY SNAPSHOT
        // ============================================================
        $liability = [
            'total_balance_days'        => (float) LeaveBalance::sum('balance'),
            'monetization_requests_ytd' => LeaveRequest::where('request_type', 'monetization')
                                                ->whereBetween('date_filed', [$ytdStart, $ytdEnd])->count(),
            'separations_ytd'           => EmployeeSeparation::whereBetween('separation_date', [$ytdStart, $ytdEnd])->count(),
        ];

        // ============================================================
        // 11. RESCHEDULES PIPELINE
        // ============================================================
        $reschedules = [
            'pending'   => LeaveReschedule::where('status', 'pending')->count(),
            'certified' => LeaveReschedule::where('status', 'certified')->count(),
        ];

        return Inertia::render('Mayor/Dashboard', [
            'stats'                => $stats,
            'aging'                => $aging,
            'onLeaveToday'         => $onLeaveToday,
            'upcomingCount'        => $upcomingCount,
            'departmentComparison' => $departmentComparison,
            'trend'                => $trend,
            'yoy'                  => $yoy,
            'topLeaveTypes'        => $topLeaveTypes,
            'pipeline'             => $pipeline,
            'liability'            => $liability,
            'reschedules'          => $reschedules,
        ]);
    }

    /**
     * =================================================================
     * MAYOR'S PENDING QUEUE
     * =================================================================
     * Returns an Eloquent query for leave requests that are waiting
     * on THIS logged-in mayor's decision. Combines three independent
     * sources, deduplicated by the query builder itself (no row will
     * appear twice even if multiple buckets match).
     *
     * BUCKET A — Admin's own leave requests awaiting mayor approval
     * BUCKET B — Requests from admins who delegated approval to this mayor
     * BUCKET C — Requests where this mayor has an open approver slot
     */
    private function mayorPendingQuery(): Builder
    {
        $mayorId = Auth::id();

        return LeaveRequest::query()
            ->where('status', 'pending')
            ->where(function (Builder $q) use ($mayorId) {

                // -------- Bucket A: admin's own leave --------
                $q->whereHas('employee.user', function ($sub) {
                    $sub->where('role', 'admin');
                });

                // -------- Bucket B: delegated by admin --------
                if (Schema::hasTable('admin_delegations')) {
                    $q->orWhereHas('employee.user.adminDelegations', function ($sub) use ($mayorId) {
                        $sub->where('delegate_id', $mayorId);

                        // Prefer status='active' if the column exists,
                        // otherwise fall back to "not revoked".
                        if (Schema::hasColumn('admin_delegations', 'status')) {
                            $sub->where('status', 'active');
                        } elseif (Schema::hasColumn('admin_delegations', 'revoked_at')) {
                            $sub->whereNull('revoked_at');
                        }
                    });
                }

                // -------- Bucket C: mayor approver slots --------
                if (Schema::hasTable('mayor_leave_approvers')) {
                    $q->orWhereHas('mayorApprovers', function ($sub) use ($mayorId) {

                        // Column naming varies — detect it.
                        if (Schema::hasColumn('mayor_leave_approvers', 'user_id')) {
                            $sub->where('user_id', $mayorId);
                        } elseif (Schema::hasColumn('mayor_leave_approvers', 'approver_id')) {
                            $sub->where('approver_id', $mayorId);
                        } elseif (Schema::hasColumn('mayor_leave_approvers', 'mayor_id')) {
                            $sub->where('mayor_id', $mayorId);
                        }

                        // Only count slots that haven't been acted on yet.
                        if (Schema::hasColumn('mayor_leave_approvers', 'status')) {
                            $sub->where('status', 'pending');
                        } elseif (Schema::hasColumn('mayor_leave_approvers', 'acted_at')) {
                            $sub->whereNull('acted_at');
                        }
                    });
                }
            });
    }
}