<?php

namespace App\Http\Controllers\HRMO;

use App\Http\Controllers\Controller;
use App\Models\LeaveAccrualLog;
use App\Models\LeaveCreditTransaction;
use App\Models\LeaveType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccrualController extends Controller
{
    /**
     * Display the accrual monitoring page with expandable months.
     */
  public function index(Request $request)
{
    $selectedYear = $request->get('year'); // no default – can be null

    // All distinct years with logs (for the dropdown)
    $availableYears = LeaveAccrualLog::select('year')
        ->distinct()
        ->orderBy('year', 'desc')
        ->pluck('year')
        ->toArray();

    $logs = collect();
    $hasLogs = false;

    // Only fetch logs if a year is selected
    if ($selectedYear) {
        $logs = LeaveAccrualLog::where('year', $selectedYear)
            ->orderBy('month', 'desc')
            ->get();
        $hasLogs = $logs->isNotEmpty();
    }

    $leaveTypes = LeaveType::where('code', 'VL')->orWhere('code', 'SL')->get();

    return Inertia::render('HRMO/Accruals/Index', [
        'logs' => $logs,
        'availableYears' => $availableYears,
        'selectedYear' => $selectedYear,
        'hasLogs' => $hasLogs,
        'leaveTypes' => $leaveTypes,
    ]);
}






    /**
     * Fetch transactions for a specific month (AJAX).
     */
    public function getMonthTransactions(Request $request)
    {
        $validated = $request->validate([
            'year' => 'required|integer',
            'month' => 'required|integer|min:1|max:12',
            'search' => 'nullable|string|max:100',
            'leave_type' => 'nullable|exists:leave_types,id',
            'page' => 'nullable|integer|min:1',
        ]);

        $transactions = $this->getTransactionsForMonth(
            $validated['year'],
            $validated['month'],
            [
                'search' => $validated['search'] ?? null,
                'leave_type' => $validated['leave_type'] ?? null,
                'page' => $validated['page'] ?? 1,
            ]
        );

        $summary = $this->getSummaryForMonth($validated['year'], $validated['month']);

        return response()->json([
            'transactions' => $transactions,
            'summary' => $summary,
        ]);
    }

    private function getTransactionsForMonth(int $year, int $month, array $filters)
    {
        $query = LeaveCreditTransaction::with(['employee', 'leaveType'])
            ->where('transaction_type', 'MONTHLY_CREDIT')
            ->where('period_year', $year)
            ->where('period_month', $month)
            ->orderBy('created_at', 'desc');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('employee', function ($q) use ($search) {
                $q->where('firstname', 'LIKE', "%{$search}%")
                  ->orWhere('lastname', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        if (!empty($filters['leave_type'])) {
            $query->where('leave_type_id', $filters['leave_type']);
        }

        return $query->paginate(20);
    }

    private function getSummaryForMonth(int $year, int $month): array
    {
        $vlType = LeaveType::where('code', 'VL')->first();
        $slType = LeaveType::where('code', 'SL')->first();

        $vlId = $vlType ? $vlType->id : null;
        $slId = $slType ? $slType->id : null;

        $employeeCount = LeaveCreditTransaction::where('transaction_type', 'MONTHLY_CREDIT')
            ->where('period_year', $year)
            ->where('period_month', $month)
            ->distinct('employee_id')
            ->count('employee_id');

        $totalVL = 0;
        $totalSL = 0;

        if ($vlId) {
            $totalVL = LeaveCreditTransaction::where('transaction_type', 'MONTHLY_CREDIT')
                ->where('period_year', $year)
                ->where('period_month', $month)
                ->where('leave_type_id', $vlId)
                ->sum('amount');
        }

        if ($slId) {
            $totalSL = LeaveCreditTransaction::where('transaction_type', 'MONTHLY_CREDIT')
                ->where('period_year', $year)
                ->where('period_month', $month)
                ->where('leave_type_id', $slId)
                ->sum('amount');
        }

        return [
            'employee_count' => $employeeCount,
            'total_vl' => $totalVL,
            'total_sl' => $totalSL,
        ];
    }
}