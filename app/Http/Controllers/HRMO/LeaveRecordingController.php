<?php

namespace App\Http\Controllers\HRMO;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\LeaveType;
use App\Models\LeaveCreditTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveRecordingController extends Controller
{
    public function index(Request $request)
    {
        $employeeId = $request->input('employee_id');
        $year = (int) $request->input('year', date('Y'));

        // Get all active employees
        $employees = Employee::with('user')
            ->whereHas('user', fn($q) => $q->where('status', 'active'))
            ->orderBy('lastname')
            ->get(['id', 'firstname', 'lastname', 'position', 'department_id']);

        if (!$employeeId && $employees->isNotEmpty()) {
            $employeeId = $employees->first()->id;
        }

        $vlType = LeaveType::where('name', 'LIKE', '%Vacation%')->first();
        $slType = LeaveType::where('name', 'LIKE', '%Sick%')->first();

        if (!$vlType || !$slType) {
            return Inertia::render('HRMO/LeaveRecordings/Index', [
                'employees' => $employees,
                'selectedEmployee' => null,
                'selectedYear' => $year,
                'monthlyData' => [],
                'error' => 'Vacation Leave or Sick Leave type not found. Please configure them in Leave Types.',
            ]);
        }

        $selectedEmployee = null;
        $monthlyData = [];

        $leaveTypeIds = [$vlType->id, $slType->id];

        if ($employeeId) {
            $selectedEmployee = Employee::with(['user', 'department'])->find($employeeId);

            // ── FIX 2: year filter ──────────────────────────────────────────
            // Accrual rows carry period_year; other rows fall back to transaction_date.
            // This prevents a Dec-2026 accrual (written on 2027-01-01) from
            // vanishing out of the 2026 view.
            $transactions = LeaveCreditTransaction::with(['leaveType', 'creator'])
                ->where('employee_id', $employeeId)
                ->whereIn('leave_type_id', $leaveTypeIds)
                ->where(function ($q) use ($year) {
                    $q->where('period_year', $year)
                      ->orWhere(function ($q2) use ($year) {
                          $q2->whereNull('period_year')
                             ->whereYear('transaction_date', $year);
                      });
                })
                ->orderBy('transaction_date')
                ->orderBy('id')
                ->get();

            // ── FIX 3: opening balances ────────────────────────────────────
            // Same idea: "belongs to a year before $year" means either
            // period_year < $year, or (no period) transaction_date < Jan 1.
            $startBalances = [];
            foreach ($leaveTypeIds as $ltId) {
                $startBalances[$ltId] = LeaveCreditTransaction::where('employee_id', $employeeId)
                    ->where('leave_type_id', $ltId)
                    ->where(function ($q) use ($year) {
                        $q->where('period_year', '<', $year)
                          ->orWhere(function ($q2) use ($year) {
                              $q2->whereNull('period_year')
                                 ->where('transaction_date', '<', $year . '-01-01');
                          });
                    })
                    ->orderByDesc('transaction_date')
                    ->orderByDesc('id')
                    ->value('balance_after') ?? 0;
            }

            // Initialize months
            $months = [];
            for ($m = 1; $m <= 12; $m++) {
                $months[$m] = [
                    'month_num' => $m,
                    'month_name' => date('F', mktime(0, 0, 0, $m, 1, $year)),
                    'transactions' => [],
                    'opening_balances' => $startBalances,
                    'net_vl' => 0,
                    'net_sl' => 0,
                    'ending_balances' => [],
                    'movement_count' => 0,
                ];
            }

            // ── FIX 1: bucket by period_month when present ─────────────────
            // Accrual rows (MONTHLY_CREDIT) carry the month they belong to in
            // period_month. Everything else (INITIAL_BALANCE, LEAVE_DEDUCTION,
            // adjustments) has period_month = NULL and buckets by transaction_date.
            foreach ($transactions as $tx) {
                $month = $tx->period_month !== null
                    ? (int) $tx->period_month
                    : (int) $tx->transaction_date->format('n');

                if (isset($months[$month])) {
                    $months[$month]['transactions'][] = $tx;
                    $months[$month]['movement_count']++;
                }
            }

            // Compute opening balances for each month sequentially
            $currentVlBalance = $startBalances[$vlType->id] ?? 0;
            $currentSlBalance = $startBalances[$slType->id] ?? 0;

            foreach ($months as $m => &$monthData) {
                $monthData['opening_balances'] = [
                    $vlType->id => $currentVlBalance,
                    $slType->id => $currentSlBalance,
                ];

                $netVl = 0;
                $netSl = 0;
                foreach ($monthData['transactions'] as $tx) {
                    if ($tx->leave_type_id == $vlType->id) {
                        $netVl += $tx->amount;
                        $currentVlBalance += $tx->amount;
                    } elseif ($tx->leave_type_id == $slType->id) {
                        $netSl += $tx->amount;
                        $currentSlBalance += $tx->amount;
                    }
                }
                $monthData['net_vl'] = $netVl;
                $monthData['net_sl'] = $netSl;
                $monthData['ending_balances'] = [
                    $vlType->id => $currentVlBalance,
                    $slType->id => $currentSlBalance,
                ];
            }
            unset($monthData);

            $monthlyData = [
                'vl_type_id' => $vlType->id,
                'sl_type_id' => $slType->id,
                'vl_name' => $vlType->name,
                'sl_name' => $slType->name,
                'months' => $months,
            ];
        }

        return Inertia::render('HRMO/LeaveRecordings/Index', [
            'employees' => $employees,
            'selectedEmployee' => $selectedEmployee,
            'selectedYear' => $year,
            'monthlyData' => $monthlyData,
        ]);
    }

    public function export(Request $request)
    {
        return back()->with('info', 'Export functionality coming soon.');
    }
}