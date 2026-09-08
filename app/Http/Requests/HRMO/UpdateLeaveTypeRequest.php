<?php

namespace App\Http\Requests\HRMO;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLeaveTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $leaveType = $this->route('leave_type');

        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', Rule::unique('leave_types', 'code')->ignore($leaveType->id)],
            'description' => ['nullable', 'string'],
            'earnable' => ['boolean'],
            'deductible' => ['boolean'],
            'deduct_from_vl' => ['boolean'],
            'document_required' => ['boolean'],
            'requires_balance' => ['boolean'],
            'default_days' => ['nullable', 'numeric', 'min:0'],
            'deduction_factor' => ['required', 'numeric', 'min:0.01'],
            'status' => ['boolean'],
            'gender_eligibility' => ['required', Rule::in(['all', 'male', 'female'])],
            'employment_conditions' => ['nullable', 'array'],
            // New field:
            'date_selection_type' => ['required', Rule::in(['range', 'specific_dates'])],
        ];
    }
}
