<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\LeaveRequest;
use App\Models\LeaveReschedule;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $shared = parent::share($request);

        // Default values
        $pendingLeaveRequestsCount = 0;
        $pendingReschedulesCount = 0;
        $adminPendingCount = 0;

        // If user is a Department Head, compute pending counts for their department
        if ($user && $user->role === 'department_head') {
            $employee = $user->employee;

            if ($employee && $employee->department_id) {
                $departmentId = $employee->department_id;

                // Pending Leave Requests (certified, not self, department does NOT skip head approval)
                $pendingLeaveRequestsCount = LeaveRequest::where('status', 'certified')
                    ->whereHas('employee', function ($q) use ($departmentId, $employee) {
                        $q->where('department_id', $departmentId)
                          ->where('id', '!=', $employee->id)
                          ->whereHas('department', function ($q2) {
                              $q2->where('skip_department_head_approval', false);
                          });
                    })
                    ->count();

                // Pending Reschedules (certified)
                $pendingReschedulesCount = LeaveReschedule::where('status', 'certified')
                    ->whereHas('leaveRequest.employee', function ($q) use ($departmentId) {
                        $q->where('department_id', $departmentId);
                    })
                    ->count();
            }
        }

        // If user is an Admin, compute pending Admin approval count
        if ($user && $user->role === 'admin') {
            // Count requests pending final Admin approval (status = department_approved)
            $adminPendingCount = LeaveRequest::where('status', 'department_approved')
                ->count();
        }

        return [
            ...$shared,
            'auth' => [
                'user' => $user,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            // Department Head counts
            'pendingLeaveRequestsCount' => $pendingLeaveRequestsCount,
            'pendingReschedulesCount' => $pendingReschedulesCount,
            // Admin counts
            'adminPendingCount' => $adminPendingCount,
        ];
    }
}