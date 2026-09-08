<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveCreditTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'leave_type_id',
        'transaction_type',
        'amount',
        'balance_after',
        'transaction_date',
        'period_month',
        'period_year',
        'description',
        'reference_type',
        'reference_id',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'transaction_date' => 'date',
        'period_month' => 'integer',
        'period_year' => 'integer',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reference()
    {
        return $this->morphTo('reference', 'reference_type', 'reference_id');
    }

    public static function getCurrentBalance($employeeId, $leaveTypeId)
    {
        return static::where('employee_id', $employeeId)
            ->where('leave_type_id', $leaveTypeId)
            ->latest('transaction_date')
            ->value('balance_after') ?? 0;
    }
}
