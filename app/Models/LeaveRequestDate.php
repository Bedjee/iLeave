<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveRequestDate extends Model
{
    use HasFactory;

    protected $fillable = [
        'leave_request_id',
        'leave_date',
    ];

    protected $casts = [
        'leave_date' => 'date',
    ];

    public function leaveRequest()
    {
        return $this->belongsTo(LeaveRequest::class);
    }
}
