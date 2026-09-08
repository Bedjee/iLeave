<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'earnable',
        'deductible',
        'deduct_from_vl',
        'document_required',
        'requires_balance',
        'default_days',
        'deduction_factor',
        'status',
        'gender_eligibility',
        'employment_conditions',
         'date_selection_type',
    ];

    protected $casts = [
        'earnable' => 'boolean',
        'deductible' => 'boolean',
        'deduct_from_vl' => 'boolean',
        'document_required' => 'boolean',
        'requires_balance' => 'boolean',
        'status' => 'boolean',
        'default_days' => 'decimal:2',
        'deduction_factor' => 'decimal:2',
        'employment_conditions' => 'array',
        'date_selection_type' => 'string', // <-- ADD THIS
    ];

    /**
     * Scope a query to only include active leave types.
     */
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    /**
     * Scope a query to only include inactive leave types.
     */
    public function scopeInactive($query)
    {
        return $query->where('status', false);
    }

    /**
     * Get the label for gender eligibility.
     */
    public function getGenderLabelAttribute(): string
    {
        return match ($this->gender_eligibility) {
            'male'   => 'Male',
            'female' => 'Female',
            default  => 'All',
        };
    }

    /**
     * Determine if the leave type is active.
     */
    public function isActive(): bool
    {
        return $this->status === true;
    }

    public function usesSpecificDates(): bool
{
    return $this->date_selection_type === 'specific_dates';
}


public function getFormFields(): array
{
    switch ($this->name) {
        case 'Vacation Leave':
            return [
                ['key' => 'detail.location_type', 'label' => 'Location Type', 'type' => 'select', 'options' => ['within_philippines' => 'Within Philippines', 'abroad' => 'Abroad'], 'required' => true],
                ['key' => 'detail.location', 'label' => 'Location', 'type' => 'text', 'required' => false],
            ];
        case 'Sick Leave':
            return [
                ['key' => 'detail.sick_leave_type', 'label' => 'Type', 'type' => 'select', 'options' => ['in_hospital' => 'In Hospital', 'out_patient' => 'Out Patient'], 'required' => true],
                ['key' => 'detail.illness', 'label' => 'Illness', 'type' => 'text', 'required' => true],
            ];
        case 'Study Leave':
            return [
                ['key' => 'detail.study_purpose', 'label' => 'Purpose', 'type' => 'select', 'options' => ['masters_completion' => "Master's Completion", 'bar_board_review' => 'Bar/Board Review', 'continuing_education' => 'Continuing Education'], 'required' => true],
            ];
        case 'Other Leave':
            return [
                ['key' => 'detail.other_purpose', 'label' => 'Purpose', 'type' => 'select', 'options' => ['monetization' => 'Monetization', 'terminal_leave' => 'Terminal Leave'], 'required' => true],
            ];
        default:
            return [];
    }
}



}
