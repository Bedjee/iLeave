<?php

namespace App\Http\Controllers\HRMO;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\LeaveType;
use App\Models\LeaveCreditTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class LeaveRecordingController extends Controller
{
    public function index(Request $request)
{
    $employeeId = $request->input('employee_id');
    $year = $request->input('year', date('Y'));

    // Get all active employees
    $employees = Employee::with('user')
        ->whereHas('user', fn($q) => $q->where('status', 'active'))
        ->orderBy('lastname')
        ->get(['id', 'firstname', 'lastname', 'position', 'department_id']);

    // If no employee selected, pick the first one
    if (!$employeeId && $employees->isNotEmpty()) {
        $employeeId = $employees->first()->id;
    }

    // ✅ Fetch VL and SL leave types
    $vlType = LeaveType::where('name', 'LIKE', '%Vacation%')->first();
    $slType = LeaveType::where('name', 'LIKE', '%Sick%')->first();

    // ✅ If VL or SL don't exist, return an empty state gracefully
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

        // Get all transactions for this employee and year, for VL and SL only
        $transactions = LeaveCreditTransaction::with(['leaveType', 'creator'])
            ->where('employee_id', $employeeId)
            ->whereIn('leave_type_id', $leaveTypeIds)
            ->whereYear('transaction_date', $year)
            ->orderBy('transaction_date')
            ->orderBy('id')
            ->get();

        // Get starting balances for VL and SL (before the year)
        $startBalances = [];
        foreach ($leaveTypeIds as $ltId) {
            $startBalances[$ltId] = LeaveCreditTransaction::where('employee_id', $employeeId)
                ->where('leave_type_id', $ltId)
                ->where('transaction_date', '<', $year . '-01-01')
                ->latest('transaction_date')
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

        // Populate transactions into months
        foreach ($transactions as $tx) {
            $month = (int) $tx->transaction_date->format('n');
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
        // We'll implement Excel export later
        // For now, just a placeholder
        return back()->with('info', 'Export functionality coming soon.');
    }
}