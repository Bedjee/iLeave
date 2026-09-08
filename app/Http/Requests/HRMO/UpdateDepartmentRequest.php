<?php

namespace App\Http\Requests\HRMO;

use App\Models\Employee;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $department = $this->route('department');

        return [
            'department_name' => ['required', 'string', 'max:255'],
            'department_code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('departments', 'department_code')->ignore($department->id),
            ],
            'department_head_id' => [
                'nullable',
                'exists:employees,id',
                function ($attribute, $value, $fail) {
                    if ($value) {
                        $employee = Employee::find($value);
                        if ($employee && !$employee->user->isActive()) {
                            $fail('The selected employee is not active.');
                        }
                    }
                }
            ],
            'status' => ['required', 'in:active,inactive'],
            'skip_department_head_approval' => ['sometimes', 'boolean'], // <-- new
        ];
    }
}
