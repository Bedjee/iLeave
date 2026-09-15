<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'leave_type_id',
        'date_filed',
        'start_date',
        'end_date',
        'number_of_days',
        'reason',
        'attachment',
        'commutation',
        'days_with_pay',
        'days_without_pay',
        'status',
        'remarks',
        'office_department_snapshot',
        'employee_name_snapshot',
        'position_snapshot',
        'salary_snapshot',
        'submitted_at',
        'certified_at',
        'certified_by',
        'approved_at',
        'approved_by',
        'rejected_at',
        'rejected_by',
        'rejection_reason',
        'cancelled_at',
        'cancelled_by',
        'cancellation_reason',
        'request_type',
    'monetized_days',
     'final_approved_at',
    'final_approved_by',
    'skip_dept_head_approval', // new
    'separation_processed',
    ];

    protected $casts = [
        'date_filed' => 'date',
        'start_date' => 'date',
        'end_date' => 'date',
        'number_of_days' => 'decimal:4',
        'days_with_pay' => 'decimal:4',
        'days_without_pay' => 'decimal:4',
        'submitted_at' => 'datetime',
        'certified_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'request_type' => 'string',
    'monetized_days' => 'decimal:2',
    'final_approved_at' => 'datetime',
    'skip_dept_head_approval' => 'boolean',
    'separation_processed' => 'boolean',
    ];

    // Relationships
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function detail()
    {
        return $this->hasOne(LeaveRequestDetail::class);
    }

    public function dates()
    {
        return $this->hasMany(LeaveRequestDate::class);
    }

    public function certification()
    {
        return $this->hasOne(LeaveCreditCertification::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function approvedBy()
{
    return $this->belongsTo(User::class, 'approved_by');
}

public function certifiedBy()
{
    return $this->belongsTo(User::class, 'certified_by');
}


public function activeReschedule()
{
    return $this->hasOne(LeaveReschedule::class)
        ->whereIn('status', ['pending', 'certified']);
}


public function printLogs()
{
    return $this->hasMany(LeavePrintLog::class)->orderBy('printed_at', 'desc');
}


public function approvedReschedule()
{
    return $this->hasOne(LeaveReschedule::class)
        ->where('status', 'approved');
}

public function hasApprovedReschedule()
{
    return $this->approvedReschedule()->exists();
}


public function finalApprovedBy() // 👈 ADD THIS
{
    return $this->belongsTo(User::class, 'final_approved_by');
}


public function mayorApprovers()
{
    return $this->hasMany(MayorLeaveApprover::class)->orderBy('slot');
}


}
