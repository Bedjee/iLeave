<?php

namespace App\Notifications;

use App\Models\LeaveRequest;
use Illuminate\Notifications\Notification;

class LeaveRequestSubmitted extends Notification
{
    public function __construct(public LeaveRequest $leaveRequest)
    {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'leave_request_id' => $this->leaveRequest->id,
            'employee_name'    => $this->leaveRequest->employee->full_name,
            'leave_type'       => $this->leaveRequest->leaveType?->name ?? 'N/A',
            'status'           => $this->leaveRequest->status,
            'message'          => "New leave request from {$this->leaveRequest->employee->full_name}",
            'url'              => route('hrmo.leave-requests.show', $this->leaveRequest->id),
        ];
    }
}