<?php

namespace App\Http\Requests\HRMO;

use App\Models\LeaveType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLeaveBalancesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {

     \Log::info('UpdateLeaveBalancesRequest validation called', [
        'input' => $this->all(),
    ]);


        $rules = [
            'employee_id' => ['required', 'exists:employees,id'],
            'balances' => ['required', 'array'],
            'balances.*.leave_type_id' => ['required', 'exists:leave_types,id'],
            'balances.*.balance' => ['required', 'numeric', 'min:0'],
        ];

        // Add dynamic per‑entry max validation
        $rules['balances.*.balance'][] = function ($attribute, $value, $fail) {
            // Extract index from attribute like "balances.0.balance"
            preg_match('/balances\.(\d+)\.balance/', $attribute, $matches);
            if (isset($matches[1])) {
                $index = $matches[1];
                $leaveTypeId = $this->input("balances.{$index}.leave_type_id");
                if ($leaveTypeId) {
                    $leaveType = LeaveType::find($leaveTypeId);
                    if ($leaveType && !is_null($leaveType->default_days) && $value > $leaveType->default_days) {
                        $fail("The balance cannot exceed the default entitlement of {$leaveType->default_days} days.");
                    }
                }
            }
        };

        return $rules;
    }

    public function messages(): array
    {
        return [
            'balances.*.balance.required' => 'Please enter a balance for each leave type.',
            'balances.*.balance.numeric' => 'Balance must be a number.',
            'balances.*.balance.min' => 'Balance cannot be negative.',
        ];
    }
}
