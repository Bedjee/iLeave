<?php

namespace App\Listeners;

use App\Events\LeaveRequestCreated;
use App\Notifications\LeaveRequestSubmitted;
use App\Models\User;
use Illuminate\Support\Facades\Notification;

class SendLeaveRequestNotification
{
// app/Listeners/SendLeaveRequestNotification.php

public function handle(LeaveRequestCreated $event): void
{
    \Log::info('Listener triggered for request ID: ' . $event->leaveRequest->id);

    $hrmoUsers = User::where('role', 'hrmo')->get();
    \Log::info('HRMO users found: ' . $hrmoUsers->count());

    Notification::send($hrmoUsers, new LeaveRequestSubmitted($event->leaveRequest));
}
}