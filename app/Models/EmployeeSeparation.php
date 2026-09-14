<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeSeparation extends Model
{
    protected $fillable = [
        'employee_id',
        'separation_date',
        'reason',
        'final_accrual_vl',
        'final_accrual_sl',
        'status',
        'credits_claimed',
        'reversed_at',
        'reversed_by',
        'processed_by',
        'remarks',
    ];

    protected $casts = [
        'separation_date' => 'date',
        'final_accrual_vl' => 'decimal:4',
        'final_accrual_sl' => 'decimal:4',
        'credits_claimed' => 'boolean',
        'reversed_at' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function reversedBy()
    {
        return $this->belongsTo(User::class, 'reversed_by');
    }
}