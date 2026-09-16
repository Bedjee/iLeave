<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use App\Models\LeaveBalance;
use App\Models\LeaveType;
use App\Models\LeaveCreditTransaction;
use App\Models\LeaveRequest;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MyBalanceController extends Controller
{
    public function index()
    {
        $user     = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            abort(403, 'No employee record found for your account.');
        }

        // All balances for this employee, keyed by leave_type_id
        $balanceMap = LeaveBalance::where('employee_id', $employee->id)
            ->pluck('balance', 'leave_type_id')
            ->toArray();

        // Active leave types, sorted by name
        $leaveTypes = LeaveType::where('status', true)
            ->orderBy('name')
            ->get([
                'id', 'name', 'code', 'default_days',
                'earnable', 'deductible', 'requires_balance', 'date_selection_type',
            ]);

        // Shape matches what the Employee page already uses
        $data = $leaveTypes->map(function (LeaveType $lt) use ($balanceMap) {
            return [
                'id'                => $lt->id,
                'name'              => $lt->name,
                'code'              => $lt->code,
                'balance'           => (float) ($balanceMap[$lt->id] ?? 0),
                'default_days'      => $lt->default_days,
                'earnable'          => (bool) $lt->earnable,
                'requires_balance'  => (bool) $lt->requires_balance,
            ];
        })->values();

        return Inertia::render($this->pageComponentFor($user->role), [
            'leaveBalances' => $data,
            'employee'      => [
                'name'       => $employee->full_name,
                'position'   => $employee->position,
                'department' => $employee->department?->department_name,
            ],
        ]);
    }

    /**
     * Pick the wrapper page for the role. Each wrapper uses its own layout
     * but renders the same shared view component.
     */
    private function pageComponentFor(?string $role): string
    {
        return match ($role) {
            'admin'           => 'Admin/MyLeaveBalances/Index',
            'department_head' => 'DepartmentHead/MyLeaveBalances/Index',
            'mayor'           => 'Mayor/MyLeaveBalances/Index',
            default           => 'Employee/LeaveBalances/Index',
        };
    }


    public function history(int $leaveTypeId)
{
    $user     = Auth::user();
    $employee = $user->employee;

    if (!$employee) {
        abort(403, 'No employee record found for your account.');
    }

    // Verify the leave type is active and exists
    $leaveType = LeaveType::where('status', true)->findOrFail($leaveTypeId);

    // All transactions for this employee + leave type, oldest first
   $transactions = LeaveCreditTransaction::with(['reference'])
    ->where('employee_id', $employee->id)
    ->where('leave_type_id', $leaveType->id)
    ->orderBy('transaction_date', 'asc')
     ->orderBy('id', 'desc')
    ->get()
    ->map(function (LeaveCreditTransaction $tx) {
        // The polymorphic `reference` may be a LeaveRequest, a LeaveReschedule,
        // an EmployeeSeparation, or null. We only expose leave-request details
        // when the reference is actually a LeaveRequest.
        $leaveRequestData = null;
        $reference = $tx->reference;

        if ($reference instanceof \App\Models\LeaveRequest) {
            $leaveRequestData = [
                'id'          => $reference->id,
                'start_date'  => $reference->start_date
                    ? Carbon::parse($reference->start_date)->toDateString()
                    : null,
                'end_date'    => $reference->end_date
                    ? Carbon::parse($reference->end_date)->toDateString()
                    : null,
                'date_filed'  => $reference->date_filed
                    ? Carbon::parse($reference->date_filed)->toDateString()
                    : null,
                'status'      => $reference->status,
                'days'        => (float) $reference->number_of_days,
                'request_type'=> $reference->request_type,
            ];
        }

        return [
            'id'                => $tx->id,
            'transaction_type'  => $tx->transaction_type,
            'transaction_date'  => $tx->transaction_date
                ? Carbon::parse($tx->transaction_date)->toDateString()
                : null,
            'amount'            => (float) $tx->amount,
            'balance_after'     => (float) $tx->balance_after,
            'description'       => $tx->description,
            'reference_type'    => class_basename($tx->reference_type), // e.g. "LeaveRequest"
            'leave_request'     => $leaveRequestData,
        ];
    });



    // Current balance (source of truth)
    $currentBalance = (float) LeaveBalance::where('employee_id', $employee->id)
        ->where('leave_type_id', $leaveType->id)
        ->value('balance');

    return Inertia::render($this->historyPageComponentFor($user->role), [
        'leaveType'      => [
            'id'           => $leaveType->id,
            'name'         => $leaveType->name,
            'code'         => $leaveType->code,
            'default_days' => $leaveType->default_days,
            'earnable'     => (bool) $leaveType->earnable,
        ],
        'transactions'   => $transactions,
        'currentBalance' => $currentBalance,
        'employee'       => [
            'name'       => $employee->full_name,
            'position'   => $employee->position,
            'department' => $employee->department?->department_name,
        ],
    ]);
}

private function historyPageComponentFor(?string $role): string
{
    return match ($role) {
        'admin'           => 'Admin/MyLeaveBalances/History',
        'department_head' => 'DepartmentHead/MyLeaveBalances/History',
        'mayor'           => 'Mayor/MyLeaveBalances/History',
        default           => 'Employee/LeaveBalances/History',
    };
}
}