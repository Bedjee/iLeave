<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\LeaveType;
use App\Models\LeaveCreditTransaction;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LeaveHistoryController extends Controller
{
    public function show($leaveTypeId)
    {
        $user = Auth::user();
        $employee = $user->employee;

        $leaveType = LeaveType::findOrFail($leaveTypeId);

        $transactions = LeaveCreditTransaction::where('employee_id', $employee->id)
            ->where('leave_type_id', $leaveTypeId)
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')  // secondary sort: newest first
            ->get();

        $currentBalance = LeaveCreditTransaction::where('employee_id', $employee->id)
            ->where('leave_type_id', $leaveTypeId)
            ->latest('transaction_date')
            ->value('balance_after') ?? 0;

        return Inertia::render('Employee/LeaveHistory', [
            'leaveType' => [
                'id' => $leaveType->id,
                'name' => $leaveType->name,
                'code' => $leaveType->code,
                'default_days' => $leaveType->default_days,
                'earnable' => $leaveType->earnable,
            ],
            'transactions' => $transactions->map(function ($tx) {
                return [
                    'id' => $tx->id,
                    'transaction_date' => $tx->transaction_date->format('Y-m-d'),
                    'transaction_type' => $tx->transaction_type,
                    'amount' => $tx->amount,
                    'balance_after' => $tx->balance_after,
                    'description' => $tx->description,
                ];
            }),
            'currentBalance' => $currentBalance,
            'employee' => [
                'name' => $employee->full_name,
                'position' => $employee->position,
                'department' => $employee->department?->department_name,
            ],
        ]);
    }
}