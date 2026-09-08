<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveReschedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'leave_request_id',
        'old_start_date',
        'old_end_date',
        'old_dates',
        'new_start_date',
        'new_end_date',
        'new_dates',
        'old_number_of_days',
        'new_number_of_days',
        'day_difference',
        'reason',
        'attachment',
        'status',
        'certified_at',
        'certified_by',
        'approved_at',
        'approved_by',
        'rejection_reason',
    ];

    protected $casts = [
        'old_dates' => 'array',
        'new_dates' => 'array',
        'old_start_date' => 'date',
        'old_end_date' => 'date',
        'new_start_date' => 'date',
        'new_end_date' => 'date',
        'old_number_of_days' => 'decimal:4',
        'new_number_of_days' => 'decimal:4',
        'day_difference' => 'decimal:4',
        'certified_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function leaveRequest()
    {
        return $this->belongsTo(LeaveRequest::class);
    }

    public function certifiedBy()
    {
        return $this->belongsTo(User::class, 'certified_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCertified($query)
    {
        return $query->where('status', 'certified');
    }


    public function leave_request()
{
    return $this->belongsTo(LeaveRequest::class, 'leave_request_id');
}




}
