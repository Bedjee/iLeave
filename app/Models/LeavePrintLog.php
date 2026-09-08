<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeavePrintLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'leave_request_id',
        'user_id',
        'printed_at',
    ];

    protected $casts = [
        'printed_at' => 'datetime',
    ];

    public function leaveRequest()
    {
        return $this->belongsTo(LeaveRequest::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
