<?php

namespace App\Http\Controllers\DepartmentHead;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee || !$employee->department_id) {
            return Inertia::render('DepartmentHead/Team/Index', [
                'employees' => [],
                'department' => null,
            ]);
        }

        $departmentId = $employee->department_id;

        // Fetch all employees in the same department, excluding the department head
        $employees = Employee::with('user')
            ->where('department_id', $departmentId)
            ->where('id', '!=', $employee->id)
            ->orderBy('lastname')
            ->get();

        return Inertia::render('DepartmentHead/Team/Index', [
            'employees' => $employees,
            'department' => $employee->department?->department_name,
            'headName' => $employee->full_name,
        ]);
    }
}
