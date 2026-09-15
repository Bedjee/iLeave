<?php

namespace App\Http\Controllers\HRMO;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveCreditTransaction;
use App\Models\LeaveType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Exports\EmployeeLeaveBalanceExport;
use App\Exports\AllEmployeesLeaveBalanceExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class LeaveBalanceController extends Controller
{
    public function index(Request $request)
    {
        $employees = Employee::with('user')
    ->whereHas('user', fn ($q) => $q->where('status', 'active'))
    ->orderBy('lastname')
    ->get(['id', 'firstname', 'lastname', 'email', 'position']); // 👈 added 'position'

        $selectedEmployeeId = $request->input('employee_id');

        $leaveTypes = LeaveType::where('status', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'default_days']);

        $balances = [];
        if ($selectedEmployeeId) {
            $balances = LeaveBalance::where('employee_id', $selectedEmployeeId)
                ->get()
                ->keyBy('leave_type_id');
        }

        return Inertia::render('HRMO/LeaveBalances/Index', [
            'employees' => $employees,
            'leaveTypes' => $leaveTypes,
            'selectedEmployeeId' => $selectedEmployeeId,
            'balances' => $balances,
        ]);
    }

public function update(Request $request)
{

Log::info('All request data:', $request->all());
    Log::info('Input stream:', ['stream' => file_get_contents('php://input')]);


    // Manually parse JSON payload
    $rawContent = $request->getContent();
    $data = json_decode($rawContent, true);

    if (is_array($data) && count($data) > 0) {
        $request->merge($data);
    }

    Log::info('=== Leave balance update START ===', [
        'employee_id' => $request->input('employee_id'),
        'balances' => $request->input('balances'),
        'all_data' => $request->all(),
        'user_id' => Auth::id(),
    ]);

    try {
        $validated = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'balances' => ['required', 'array'],
            'balances.*.leave_type_id' => ['required', 'exists:leave_types,id'],
            'balances.*.balance' => ['required', 'numeric', 'min:0'],
        ]);

        // Custom max validation per leave type
        foreach ($validated['balances'] as $index => $item) {
            $leaveType = LeaveType::find($item['leave_type_id']);
            if ($leaveType && !is_null($leaveType->default_days) && $item['balance'] > $leaveType->default_days) {
                return redirect()->back()
                    ->withErrors([
                        "balances.{$index}.balance" => "The balance cannot exceed the default entitlement of {$leaveType->default_days} days."
                    ])
                    ->withInput();
            }
        }

        $employeeId = $validated['employee_id'];
        $balancesData = $validated['balances'];
        $userId = Auth::id();

        DB::transaction(function () use ($employeeId, $balancesData, $userId) {
            foreach ($balancesData as $item) {
                $leaveTypeId = $item['leave_type_id'];
                $newBalance = $item['balance'];

                $existing = LeaveBalance::where('employee_id', $employeeId)
                    ->where('leave_type_id', $leaveTypeId)
                    ->first();

                if ($existing) {
                    $oldBalance = $existing->balance;
                    $change = $newBalance - $oldBalance;

                    if ($change != 0) {
                        $existing->balance = $newBalance;
                        $existing->save();

                        LeaveCreditTransaction::create([
                            'employee_id' => $employeeId,
                            'leave_type_id' => $leaveTypeId,
                            'transaction_type' => 'HR_ADJUSTMENT',
                            'amount' => $change,
                            'balance_after' => $newBalance,
                            'transaction_date' => now()->toDateString(),
                            'period_month' => null,
                            'period_year' => null,
                            'description' => 'Manual adjustment by HRMO',
                            'reference_type' => null,
                            'reference_id' => null,
                            'created_by' => $userId,
                        ]);
                    }
                } else {
                    LeaveBalance::create([
                        'employee_id' => $employeeId,
                        'leave_type_id' => $leaveTypeId,
                        'balance' => $newBalance,
                    ]);

                    LeaveCreditTransaction::create([
                        'employee_id' => $employeeId,
                        'leave_type_id' => $leaveTypeId,
                        'transaction_type' => 'INITIAL_BALANCE',
                        'amount' => $newBalance,
                        'balance_after' => $newBalance,
                        'transaction_date' => now()->toDateString(),
                        'period_month' => null,
                        'period_year' => null,
                        'description' => 'Initial balance set by HRMO',
                        'reference_type' => null,
                        'reference_id' => null,
                        'created_by' => $userId,
                    ]);
                }
            }
        });

        Log::info('=== Leave balance update SUCCESS ===');
        return redirect()->back()->with('success', 'Leave balances updated successfully.');

    } catch (\Exception $e) {
        Log::error('=== Leave balance update FAILED ===', [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString(),
        ]);

        return redirect()->back()->with('error', 'An error occurred: ' . $e->getMessage());
    }

}



/**
 * Export all leave balance data for an employee to Excel.
 */
public function export(Employee $employee)
{
    // Authorize: only HRMO can export (middleware already handles this
    // because it's inside the hrmo route group, but you can add more checks)

    $filename = 'Leave_Balances_' .
        str_replace(' ', '_', $employee->full_name) .
        '_' . now()->format('Ymd_His') . '.xlsx';

    return Excel::download(new EmployeeLeaveBalanceExport($employee), $filename);
}



/**
 * Export the current leave balances of ALL employees to a single Excel sheet.
 * Each employee gets one row; each leave type gets its own column.
 */
public function exportAll()
{
    $filename = 'All_Employees_Leave_Balances_' . now()->format('Ymd_His') . '.xlsx';

    return Excel::download(new AllEmployeesLeaveBalanceExport(), $filename);
}




}
