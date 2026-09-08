<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create a default department
        $adminOffice = Department::create([
            'department_name' => 'Administrative Office',
            'department_code' => 'ADMIN',
            'status' => 'active',
        ]);

        // Create users with roles
        $roles = ['admin', 'hrmo', 'department_head', 'employee', 'mayor'];
        foreach ($roles as $role) {
            $user = User::create([
                'name' => ucfirst($role),
                'email' => $role . '@example.com',
                'password' => bcrypt('password'),
                'role' => $role,
                'status' => 'active',
            ]);

            // Create employee profile for each (except maybe admin can also have one)
            $employee = Employee::create([
                'user_id' => $user->id,
                'department_id' => $adminOffice->id,
                'lastname' => ucfirst($role),
                'firstname' => 'Test',
                'email' => $role . '@example.com',
                'civil_status' => 'single',
                'gender' => 'male',
            ]);

            // If department_head, assign as head of the admin office
            if ($role === 'department_head') {
                $adminOffice->department_head_id = $employee->id;
                $adminOffice->save();
            }
        }
    }
}
