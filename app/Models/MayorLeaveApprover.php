<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MayorLeaveApprover extends Model
{
    protected $fillable = [
        'leave_request_id',
        'slot',
        'name',
        'position',
        'role_label',
        'created_by',
        'updated_by',
    ];

    public function leaveRequest()
    {
        return $this->belongsTo(LeaveRequest::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}