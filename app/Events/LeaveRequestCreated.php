<?php

namespace App\Events;

use App\Models\LeaveRequest;
use Illuminate\Foundation\Events\Dispatchable;

class LeaveRequestCreated
{
    use Dispatchable;

    public function __construct(public LeaveRequest $leaveRequest)
    {}
}