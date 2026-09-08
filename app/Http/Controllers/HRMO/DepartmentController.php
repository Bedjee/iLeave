<?php

namespace App\Http\Controllers\HRMO;

use App\Http\Controllers\Controller;
use App\Http\Requests\HRMO\StoreDepartmentRequest;
use App\Http\Requests\HRMO\UpdateDepartmentRequest;
use App\Models\Department;
use App\Models\Employee;
use App\Services\DepartmentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function __construct(protected DepartmentService $departmentService)
    {
        //
    }

    public function index(Request $request)
    {
        $query = Department::with(['head', 'employees']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('department_name', 'like', "%{$search}%")
                  ->orWhere('department_code', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $departments = $query->orderBy('department_name')->get();

        return Inertia::render('HRMO/Departments/Index', [
            'departments' => $departments,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        $employees = Employee::with('user')
            ->whereHas('user', fn ($q) => $q->where('status', 'active'))
            ->orderBy('lastname')
            ->get();

        return Inertia::render('HRMO/Departments/Create', [
            'employees' => $employees,
        ]);
    }

    public function store(StoreDepartmentRequest $request)
    {
        $validated = $request->validated();

        $department = Department::create([
            'department_name' => $validated['department_name'],
            'department_code' => $validated['department_code'],
            'status' => $validated['status'] ?? 'active',
            'skip_department_head_approval' => $validated['skip_department_head_approval'] ?? false, // <-- new
        ]);

        if (!empty($validated['department_head_id'])) {
            $head = Employee::find($validated['department_head_id']);
            $this->departmentService->assignHead($department, $head);
        }

        return redirect()->route('hrmo.departments.index')
                         ->with('success', 'Department created successfully.');
    }

    public function show(Department $department)
    {
        $department->load(['head', 'employees.user']);
        return Inertia::render('HRMO/Departments/Show', [
            'department' => $department,
        ]);
    }

    public function edit(Department $department)
    {
        $employees = Employee::with('user')
            ->whereHas('user', fn ($q) => $q->where('status', 'active'))
            ->orderBy('lastname')
            ->get();

        return Inertia::render('HRMO/Departments/Edit', [
            'department' => $department,
            'employees' => $employees,
        ]);
    }

    public function update(UpdateDepartmentRequest $request, Department $department)
    {
        $validated = $request->validated();

        // Update basic info
        $department->update([
            'department_name' => $validated['department_name'],
            'department_code' => $validated['department_code'],
            'status' => $validated['status'],
             'skip_department_head_approval' => $validated['skip_department_head_approval'] ?? false, // <-- new
        ]);

        // Handle head assignment if changed
        $newHeadId = $validated['department_head_id'] ?? null;
        if ($newHeadId != $department->department_head_id) {
            $newHead = $newHeadId ? Employee::find($newHeadId) : null;
            $this->departmentService->assignHead($department, $newHead);
        }

        return redirect()->route('hrmo.departments.index')
                         ->with('success', 'Department updated successfully.');
    }

    public function toggleStatus(Department $department)
    {
        $newStatus = $department->status === 'active' ? 'inactive' : 'active';
        $department->update(['status' => $newStatus]);

        return redirect()->back()
                         ->with('success', "Department {$newStatus}.");
    }
}
