<?php

namespace App\Http\Requests\Employee;

use App\Models\LeaveType;
use App\Services\LeaveTypeRuleService;
use Illuminate\Foundation\Http\FormRequest;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use App\Models\LeaveRequest;
use Illuminate\Validation\Rule;

class StoreLeaveRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'request_type' => ['nullable', 'in:leave,monetization,terminal_leave'],
            'leave_type_id' => ['nullable', 'exists:leave_types,id'],
            'reason' => ['nullable', 'string', 'max:500'],
            'commutation' => ['sometimes', 'in:not_requested,requested'],
            'attachment' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
            'detail.additional_info' => ['nullable', 'string', 'max:500'],
        ];

        $requestType = $this->input('request_type', 'leave');

        // ============================================================
        // Normal Leave (requires leave_type_id and date fields)
        // ============================================================
        if ($requestType === 'leave') {
            $rules['leave_type_id'] = ['required', 'exists:leave_types,id'];

            $leaveType = LeaveType::find($this->input('leave_type_id'));
            if ($leaveType) {
                // Date rules
                if ($leaveType->date_selection_type === 'specific_dates') {
                    // For Sick Leave, allow past dates (up to 5 working days)
                    $rules['dates'] = ['required', 'array', 'min:1'];
                    // We'll add a custom after validation in withValidator
                    // So we just require array and min:1
                    $rules['dates.*'] = ['required', 'date']; // removed 'after_or_equal:today'
                } else {
                    $rules['start_date'] = ['required', 'date', 'after_or_equal:today'];
                    $rules['end_date'] = ['required', 'date', 'after_or_equal:start_date'];
                }

                // Leave-type-specific validation
                $service = new LeaveTypeRuleService();
                $typeRules = $service->getValidationRules($leaveType);
                $rules = array_merge($rules, $typeRules);

                // Attachment required
                if ($service->isAttachmentRequired($leaveType, [])) {
                    $rules['attachment'] = ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'];
                }
            }
        }

        // ============================================================
        // Monetization (requires monetized_days)
        // ============================================================
        if ($requestType === 'monetization') {
            $rules['monetized_days'] = ['required', 'numeric', 'min:0.01'];
        }

        // ============================================================
        // Terminal Leave (no extra fields)
        // ============================================================
        if ($requestType === 'terminal_leave') {
            // No extra fields needed
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'leave_type_id.required' => 'Please select a leave type.',
            'dates.required' => 'Please select at least one leave date.',
            'start_date.required' => 'Start date is required.',
            'end_date.required' => 'End date is required.',
            'attachment.required' => 'A medical certificate is required for this leave request.',
            'monetized_days.required' => 'Please enter the number of days to monetize.',
            'monetized_days.min' => 'You must monetize at least 0.01 day.',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $requestType = $this->input('request_type', 'leave');

            // For special requests, skip leave-type-specific validations
            if (in_array($requestType, ['monetization', 'terminal_leave'])) {
                return;
            }

            $leaveTypeId = $this->input('leave_type_id');
            if (!$leaveTypeId) return;

            $leaveType = LeaveType::find($leaveTypeId);
            if (!$leaveType) return;

            $service = new LeaveTypeRuleService();

            // 1. Vacation Leave 5-day rule
            $errors = $service->validateVacationLeave($leaveType, $this->all());
            foreach ($errors as $field => $message) {
                $validator->errors()->add($field, $message);
            }

            // 2. Wellness Leave validation
            if (strtolower($leaveType->name) === 'wellness leave') {
                $selectedDates = $this->getSelectedDates();
                $errors = $service->validateWellnessLeave($leaveType, $selectedDates);
                foreach ($errors as $field => $message) {
                    $validator->errors()->add($field, $message);
                }
            }

            // 3. Maternity Leave: check if already used
            if (strtolower($leaveType->name) === 'maternity leave') {
                $employeeId = $this->user()->employee->id;
                $alreadyUsed = LeaveRequest::where('employee_id', $employeeId)
                    ->whereHas('leaveType', fn($q) => $q->where('name', 'LIKE', '%Maternity%'))
                    ->where('status', 'approved')
                    ->exists();
                if ($alreadyUsed) {
                    $validator->errors()->add('maternity_used', 'You have already availed of Maternity Leave. It can only be taken once.');
                }
            }

            // 4. Adoption Leave
            if (strtolower($leaveType->name) === 'adoption leave') {
                $employeeId = $this->user()->employee->id;
                $existingAdoption = LeaveRequest::where('employee_id', $employeeId)
                    ->where('leave_type_id', $leaveTypeId)
                    ->whereIn('status', ['pending', 'certified', 'approved'])
                    ->exists();

                if ($existingAdoption) {
                    $validator->errors()->add('leave_type_id', 'You have already availed of Adoption Leave. It can only be taken once.');
                }

                if ($this->has('start_date') && $this->has('end_date')) {
                    $start = Carbon::parse($this->input('start_date'));
                    $end = Carbon::parse($this->input('end_date'));
                    $workingDays = $this->countWorkingDays($start, $end);
                    if ($workingDays != 60) {
                        $validator->errors()->add('end_date', 'Adoption Leave must be exactly 60 working days (weekends excluded).');
                    }
                }
            }

            // 5. SLBW
            if (strtolower($leaveType->name) === 'special leave benefits' || strpos(strtolower($leaveType->name), 'slbw') !== false) {
                $days = $this->input('detail.slbw_days');
                if ($days && ($days < 1 || $days > 60)) {
                    $validator->errors()->add('detail.slbw_days', 'SLBW duration must be between 1 and 60 working days.');
                }
                if ($this->has('start_date') && $this->has('end_date')) {
                    $start = Carbon::parse($this->input('start_date'));
                    $end = Carbon::parse($this->input('end_date'));
                    $workingDays = $this->countWorkingDays($start, $end);
                    if ($workingDays != $days) {
                        $validator->errors()->add('end_date', 'The calculated end date does not match the requested number of working days.');
                    }
                }
            }

            // 6. Sick Leave specific-dates validation: ensure dates are within 5 working days past
            if (strtolower($leaveType->name) === 'sick leave' && $leaveType->date_selection_type === 'specific_dates') {
                $dates = $this->input('dates', []);
                $today = Carbon::today();
                $maxPastDate = Carbon::today()->subWeekdays(5); // 5 working days ago (including today? we need to check)

                // Ensure no date is older than 5 working days ago
                foreach ($dates as $index => $dateStr) {
                    if (empty($dateStr)) continue;
                    $date = Carbon::parse($dateStr);
                    // Check if date is before the maxPastDate (i.e., more than 5 working days ago)
                    if ($date->lt($maxPastDate)) {
                        $validator->errors()->add(
                            "dates.{$index}",
                            "Sick Leave dates cannot be more than 5 working days in the past."
                        );
                    }
                }
            }

            // 7. General date validation for specific-dates: ensure all dates are valid
            // Already handled by the 'date' rule in rules() method.
        });
    }

    /**
     * Helper: get array of selected date strings from request.
     */
    private function getSelectedDates(): array
    {
        $dates = [];
        if ($this->has('dates')) {
            $dates = array_filter($this->input('dates'), fn($d) => !empty($d));
        } elseif ($this->has('start_date') && $this->has('end_date')) {
            $start = Carbon::parse($this->input('start_date'));
            $end = Carbon::parse($this->input('end_date'));
            $period = CarbonPeriod::create($start, $end);
            foreach ($period as $date) {
                $dates[] = $date->format('Y-m-d');
            }
        }
        return $dates;
    }

    private function countWorkingDays($start, $end): int
    {
        $count = 0;
        $current = clone $start;
        while ($current <= $end) {
            $dayOfWeek = $current->dayOfWeek;
            if ($dayOfWeek !== Carbon::SATURDAY && $dayOfWeek !== Carbon::SUNDAY) {
                $count++;
            }
            $current->addDay();
        }
        return $count;
    }
}
