<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveCreditCertification extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'leave_request_id',
        'certification_date',
        'certification_number',
        'remarks',
        'prepared_by',
        'certified_by',
    ];

    protected $casts = [
        'certification_date' => 'date',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveRequest()
    {
        return $this->belongsTo(LeaveRequest::class);
    }

    public function details()
    {
        return $this->hasMany(LeaveCreditCertificationDetail::class);
    }

    public function preparedBy()
    {
        return $this->belongsTo(User::class, 'prepared_by');
    }

    public function certifiedBy()
    {
        return $this->belongsTo(User::class, 'certified_by');
    }
}
