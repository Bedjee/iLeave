<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveCreditCertificationDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'leave_credit_certification_id',
        'leave_type_id',
        'total_earned',
        'less_this_application',
        'balance',
    ];

    protected $casts = [
        'total_earned' => 'decimal:4',
        'less_this_application' => 'decimal:4',
        'balance' => 'decimal:4',
    ];

    public function certification()
    {
        return $this->belongsTo(LeaveCreditCertification::class, 'leave_credit_certification_id');
    }

    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }
}
