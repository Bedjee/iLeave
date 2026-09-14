<?php

namespace App\Http\Controllers\HRMO;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use App\Models\LeaveType;
use App\Models\LeaveBalance;
use App\Services\EmployeeSeparationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::with(['department', 'user'])
            ->orderBy('lastname');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('firstname', 'LIKE', "%{$search}%")
                  ->orWhere('lastname', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('department')) {
            $query->where('department_id', $request->department);
        }

        if ($request->filled('status')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('status', $request->status);
            });
        }

        $employees = $query->paginate(20)->withQueryString();
        $departments = Department::select('id', 'department_name')->orderBy('department_name')->get();

        return Inertia::render('HRMO/Employees/Index', [
            'employees' => $employees,
            'filters' => $request->only(['search', 'department', 'status']),
            'departments' => $departments,
        ]);
    }

    public function create()
    {
        $departments = Department::select('id', 'department_name')->get();
        $leaveTypes = LeaveType::where('status', true)->get();
        $roles = ['admin', 'hrmo', 'department_head', 'mayor', 'employee'];

        return Inertia::render('HRMO/Employees/Create', [
            'departments' => $departments,
            'leaveTypes' => $leaveTypes,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'lastname'       => 'required|string|max:255',
            'firstname'      => 'required|string|max:255',
            'middle_initial' => 'nullable|string|max:1',
            'salutation'     => 'nullable|string|max:50',
            'department_id'  => 'nullable|exists:departments,id',
            'position'       => 'nullable|string|max:255',
            'email'          => 'required|email|max:255|unique:employees,email|unique:users,email',
            'civil_status'   => 'nullable|in:single,married,divorced,widowed',
            'gender'         => 'nullable|in:male,female',
            'role'           => ['required', Rule::in(['admin', 'hrmo', 'department_head', 'mayor', 'employee'])],
            'balances'       => ['nullable', 'array'],
            'balances.*'     => ['nullable', 'numeric', 'min:0'],
        ]);

        $user = User::create([
            'name'     => $validated['firstname'] . ' ' . $validated['lastname'],
            'email'    => $validated['email'],
            'password' => Hash::make('password'),
            'role'     => $validated['role'],
            'status'   => 'active',
            'must_change_password' => true,
        ]);

        $employee = Employee::create([
            'user_id'        => $user->id,
            'lastname'       => $validated['lastname'],
            'firstname'      => $validated['firstname'],
            'middle_initial' => $validated['middle_initial'] ?? null,
            'salutation'     => $validated['salutation'] ?? null,
            'department_id'  => $validated['department_id'] ?? null,
            'position'       => $validated['position'] ?? null,
            'email'          => $validated['email'],
            'civil_status'   => $validated['civil_status'] ?? null,
            'gender'         => $validated['gender'] ?? null,
        ]);

        // Initialize balances if role is eligible (not hrmo)
        if ($validated['role'] !== 'hrmo') {
            $this->initializeBalances($employee->id, $validated['balances'] ?? []);
        }

        return redirect()->route('hrmo.employees.index')
            ->with('success', 'Employee created. Login: ' . $validated['email'] . ' / password: password');
    }

    public function show(Employee $employee)
    {
        $employee->load([
            'department',
            'user',
            'separations.processedBy',
            'separations.reversedBy',
        ]);

        // Get current balances for each leave type
        $balances = LeaveBalance::where('employee_id', $employee->id)
            ->with('leaveType')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->leaveType->name => $item->balance];
            })
            ->toArray();

        // Also get all leave types (for display even if balance is 0)
        $leaveTypes = LeaveType::where('status', true)
            ->pluck('name')
            ->toArray();

        return Inertia::render('HRMO/Employees/Show', [
            'employee' => $employee,
            'balances' => $balances,
            'leaveTypes' => $leaveTypes,
        ]);
    }

    public function edit(Employee $employee)
    {
        $departments = Department::select('id', 'department_name')->get();
        $leaveTypes = LeaveType::where('status', true)->get();
        $roles = ['admin', 'hrmo', 'department_head', 'mayor', 'employee'];

        $balances = LeaveBalance::where('employee_id', $employee->id)
            ->with('leaveType')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->leave_type_id => $item->balance];
            })
            ->toArray();

        return Inertia::render('HRMO/Employees/Edit', [
            'employee' => $employee,
            'departments' => $departments,
            'leaveTypes' => $leaveTypes,
            'roles' => $roles,
            'balances' => $balances,
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'lastname'       => 'required|string|max:255',
            'firstname'      => 'required|string|max:255',
            'middle_initial' => 'nullable|string|max:1',
            'salutation'     => 'nullable|string|max:50',
            'department_id'  => 'nullable|exists:departments,id',
            'position'       => 'nullable|string|max:255',
            'email'          => 'required|email|max:255|unique:employees,email,' . $employee->id . '|unique:users,email,' . $employee->user_id,
            'civil_status'   => 'nullable|in:single,married,divorced,widowed',
            'gender'         => 'nullable|in:male,female',
            'role'           => ['required', Rule::in(['admin', 'hrmo', 'department_head', 'mayor', 'employee'])],
            'balances'       => ['nullable', 'array'],
            'balances.*'     => ['nullable', 'numeric', 'min:0'],
        ]);

        $employee->update($validated);

        $user = $employee->user;
        $oldRole = $user->role;
        $user->update([
            'name'  => $validated['firstname'] . ' ' . $validated['lastname'],
            'email' => $validated['email'],
            'role'  => $validated['role'],
        ]);

        // Update balances if role is eligible (not hrmo)
        if ($validated['role'] !== 'hrmo' && isset($validated['balances'])) {
            $this->updateBalances($employee->id, $validated['balances']);
        }

        // If role changed to hrmo, remove balances
        if ($validated['role'] === 'hrmo' && $oldRole !== 'hrmo') {
            LeaveBalance::where('employee_id', $employee->id)->delete();
        }

        return redirect()->route('hrmo.employees.index')
            ->with('success', 'Employee updated successfully.');
    }

    public function resetPassword(Employee $employee)
    {
        $employee->user->update([
            'password' => Hash::make('password'),
            'must_change_password' => true,
        ]);

        return redirect()->back()->with('success', 'Password reset to default.');
    }

    /**
     * Update the employee's status (active / suspended / inactive).
     * Handles separation and rehire flows via EmployeeSeparationService.
     */
    public function updateStatus(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'status'  => 'required|in:active,suspended,inactive',
            'reason'  => 'required_if:status,inactive|nullable|in:resigned,retired,separated,deceased,other',
            'remarks' => 'nullable|string|max:500',
        ]);

        $oldStatus = $employee->user->status;
        $newStatus = $validated['status'];

        // No change
        if ($oldStatus === $newStatus) {
            return redirect()->back()->with('success', "Employee is already {$newStatus}.");
        }

        $service = app(EmployeeSeparationService::class);

        try {
            // ---- active → inactive (SEPARATION) ----
            if ($oldStatus === 'active' && $newStatus === 'inactive') {
                $service->separate(
                    $employee,
                    $validated['reason'],
                    Auth::user(),
                    $validated['remarks'] ?? null
                );

                return redirect()->back()->with(
                    'success',
                    'Employee separated. Final accrual applied and history recorded.'
                );
            }

            // ---- inactive → active (REHIRE) ----
            if ($oldStatus === 'inactive' && $newStatus === 'active') {
                $service->rehire($employee, Auth::user());

                return redirect()->back()->with(
                    'success',
                    'Employee rehired. Final accrual reversed (if applicable).'
                );
            }

            // ---- all other transitions (suspension, reactivation) ----
            $employee->user->update(['status' => $newStatus]);

            $message = match ($newStatus) {
                'suspended' => 'Employee suspended. Monthly accrual is paused.',
                'active'    => 'Employee reactivated. Monthly accrual will resume.',
                default     => "Employee status updated to {$newStatus}.",
            };

            return redirect()->back()->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Employee status update failed', [
                'employee_id' => $employee->id,
                'old_status'  => $oldStatus,
                'new_status'  => $newStatus,
                'error'       => $e->getMessage(),
                'trace'       => $e->getTraceAsString(),
            ]);

            return redirect()->back()->withErrors([
                'error' => 'Failed to update status: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Return the full separation history for an employee (JSON).
     */
    public function separationHistory(Employee $employee)
    {
        $separations = $employee->separations()
            ->with(['processedBy', 'reversedBy'])
            ->get()
            ->map(function ($sep) {
                return [
                    'id' => $sep->id,
                    'separation_date' => $sep->separation_date->toDateString(),
                    'reason' => $sep->reason,
                    'final_accrual_vl' => (float) $sep->final_accrual_vl,
                    'final_accrual_sl' => (float) $sep->final_accrual_sl,
                    'status' => $sep->status,
                    'credits_claimed' => $sep->credits_claimed,
                    'reversed_at' => $sep->reversed_at?->toIso8601String(),
                    'processed_by_name' => $sep->processedBy?->name,
                    'reversed_by_name' => $sep->reversedBy?->name,
                    'remarks' => $sep->remarks,
                ];
            });

        return response()->json(['separations' => $separations]);
    }

    /**
     * Helper: initialize balances
     */
    private function initializeBalances($employeeId, array $balances)
    {
        $leaveTypes = LeaveType::where('status', true)->get();
        foreach ($leaveTypes as $type) {
            $amount = $balances[$type->id] ?? 0;
            if ($amount > 0) {
                LeaveBalance::create([
                    'employee_id' => $employeeId,
                    'leave_type_id' => $type->id,
                    'balance' => $amount,
                ]);
            }
        }
    }

    /**
     * Helper: update balances
     */
    private function updateBalances($employeeId, array $balances)
    {
        $leaveTypes = LeaveType::where('status', true)->get();
        foreach ($leaveTypes as $type) {
            $amount = $balances[$type->id] ?? 0;
            LeaveBalance::updateOrCreate(
                ['employee_id' => $employeeId, 'leave_type_id' => $type->id],
                ['balance' => $amount]
            );
        }
    }
}