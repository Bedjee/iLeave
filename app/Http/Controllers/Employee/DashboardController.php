<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\LeaveBalance;
use App\Models\LeaveType;
use App\Models\LeaveRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $employee = $user->employee;

        // Fetch leave balances with leave type names
        $balances = LeaveBalance::where('employee_id', $employee->id)
            ->with('leaveType')
            ->get();

        // Build credit array
        $vacationBalance = 0;
        $sickBalance = 0;
        $otherBalance = 0;
        $totalBalance = 0;

        foreach ($balances as $balance) {
            $totalBalance += $balance->balance;
            $name = strtolower($balance->leaveType->name);
            if (str_contains($name, 'vacation')) {
                $vacationBalance = $balance->balance;
            } elseif (str_contains($name, 'sick')) {
                $sickBalance = $balance->balance;
            } else {
                $otherBalance += $balance->balance;
            }
        }

        $leaveCredits = [
            'vacation_leave'    => $vacationBalance,
            'sick_leave'        => $sickBalance,
            'other_leave'       => $otherBalance,
            'remaining_balance' => $totalBalance,
        ];

        // Fetch pending requests (simplified)
        $pendingRequests = LeaveRequest::where('employee_id', $employee->id)
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($request) {
                return [
                    'id'    => $request->id,
                    'type'  => $request->leaveType->name ?? 'Leave',
                    'start' => $request->start_date,
                    'end'   => $request->end_date,
                ];
            });

        // Recent activity (last 5 approved/rejected)
        $recentActivity = LeaveRequest::where('employee_id', $employee->id)
            ->whereIn('status', ['approved', 'rejected', 'cancelled'])
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($request) {
                return [
                    'id'          => $request->id,
                    'description' => $request->leaveType->name . ' request',
                    'date'        => $request->updated_at->format('M d, Y'),
                    'status'      => $request->status,
                ];
            });

        return Inertia::render('Employee/Dashboard', [
            'employee' => [
                'name'       => $employee->full_name,
                'first_name' => $employee->firstname,
                'position'   => $employee->position,
                'department' => $employee->department?->department_name,
            ],
            'leaveCredits'    => $leaveCredits,
            'pendingRequests' => $pendingRequests,
            'recentActivity'  => $recentActivity,
        ]);
    }
}
