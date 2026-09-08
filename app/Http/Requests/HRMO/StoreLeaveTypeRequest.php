<?php

namespace App\Http\Requests\HRMO;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLeaveTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:leave_types,code'],
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


    public function withValidator($validator)
{
    $validator->after(function ($validator) {
        $leaveTypeId = $this->input('leave_type_id');
        if (!$leaveTypeId) return;

        $leaveType = LeaveType::find($leaveTypeId);
        if (!$leaveType) return;

        $service = new \App\Services\LeaveTypeRuleService();
        $errors = $service->validateVacationLeave($leaveType, $this->all());

        foreach ($errors as $field => $message) {
            $validator->errors()->add($field, $message);
        }
    });
}


}
