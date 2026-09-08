<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\LeaveBalance;
use App\Models\LeaveType;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LeaveBalanceController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $employee = $user->employee;

        // Get all active leave types with all relevant fields
        $leaveTypes = LeaveType::where('status', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'default_days', 'earnable', 'deductible', 'deduct_from_vl', 'document_required', 'requires_balance', 'description']);

        // Get balances for this employee
        $balances = LeaveBalance::where('employee_id', $employee->id)
            ->get()
            ->keyBy('leave_type_id');

        // Combine leave types with balances
        $leaveBalances = $leaveTypes->map(function ($type) use ($balances) {
            return [
                'id' => $type->id,
                'name' => $type->name,
                'code' => $type->code,
                'default_days' => $type->default_days,
                'earnable' => $type->earnable,
                'deductible' => $type->deductible,
                'deduct_from_vl' => $type->deduct_from_vl,
                'document_required' => $type->document_required,
                'requires_balance' => $type->requires_balance,
                'description' => $type->description,
                'balance' => $balances->has($type->id) ? $balances[$type->id]->balance : 0,
            ];
        });

        return Inertia::render('Employee/LeaveBalances', [
            'leaveBalances' => $leaveBalances,
            'employee' => [
                'name' => $employee->full_name,
                'position' => $employee->position,
                'department' => $employee->department?->department_name,
            ],
        ]);
    }
}
