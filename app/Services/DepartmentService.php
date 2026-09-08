<?php

namespace App\Services;

use App\Models\Department;
use App\Models\Employee;
use Illuminate\Support\Facades\DB;

class DepartmentService
{
    /**
     * Assign an employee as head of a department.
     * Handles demotion of previous head, removal from other head roles,
     * updates user role, and moves employee to the department.
     *
     * @param Department $department
     * @param Employee|null $newHead
     * @throws \Exception
     */
    public function assignHead(Department $department, ?Employee $newHead): void
    {
        // Guard: if new head is provided, ensure they have an active user account
        if ($newHead && !$newHead->user->isActive()) {
            throw new \Exception('Cannot assign an inactive employee as department head.');
        }

        DB::transaction(function () use ($department, $newHead) {
            $currentHead = $department->head;

            // 1. Demote the current head if they are different from the new head
            if ($currentHead && ($currentHead->id !== ($newHead?->id ?? null))) {
                $this->demoteHead($currentHead);
                $department->department_head_id = null;
                $department->save();
            }

            // 2. If there is a new head
            if ($newHead) {
                // Ensure they are not already heading another department (except this one)
                $otherDepartment = $newHead->headOfDepartment;
                if ($otherDepartment && $otherDepartment->id !== $department->id) {
                    // Demote from that other department
                    $this->demoteHead($newHead);
                    $otherDepartment->department_head_id = null;
                    $otherDepartment->save();
                }

                // Move employee to this department
                $newHead->department_id = $department->id;
                $newHead->save();

                // Promote user role to department_head
                $newHead->user->role = 'department_head';
                $newHead->user->save();

                // Set this department's head
                $department->department_head_id = $newHead->id;
                $department->save();
            } else {
                // No new head: ensure department has no head
                $department->department_head_id = null;
                $department->save();
            }
        });
    }

    /**
     * Demote a department head to regular employee.
     * Role changes, but the employee stays in their current department.
     *
     * @param Employee $employee
     */
    private function demoteHead(Employee $employee): void
    {
        $employee->user->role = 'employee';
        $employee->user->save();
        // department_id unchanged
    }
}
