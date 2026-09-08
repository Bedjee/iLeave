<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveRequestDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'leave_request_id',
        'location_type',
        'location',
        'sick_leave_type',
        'illness',
        'study_purpose',
        'other_purpose',
        'additional_info',
    ];

    protected $casts = [
        'location_type' => 'string',
        'sick_leave_type' => 'string',
        'study_purpose' => 'string',
        'other_purpose' => 'string',
    ];

    public function leaveRequest()
    {
        return $this->belongsTo(LeaveRequest::class);
    }
}
