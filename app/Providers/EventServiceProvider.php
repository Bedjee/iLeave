<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use App\Events\LeaveRequestCreated;
use App\Listeners\SendLeaveRequestNotification;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        LeaveRequestCreated::class => [
            SendLeaveRequestNotification::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}