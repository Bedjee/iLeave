<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveAccrualLog extends Model
{
    public $timestamps = false; // we use processed_at manually

    protected $fillable = [
        'year',
        'month',
        'processed_at',
        'processed_count',
    ];

    protected $casts = [
        'processed_at' => 'datetime',
    ];
}
