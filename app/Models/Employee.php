<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'department_id',
        'lastname',
        'firstname',
        'middle_initial',
        'salutation',
        'position',
        'email',
        'civil_status',
        'gender',
    ];

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = ['full_name'];  // <-- ADD THIS

    // ========== RELATIONSHIPS ==========
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function headOfDepartment()
    {
        return $this->hasOne(Department::class, 'department_head_id');
    }

    // ========== ACCESSORS ==========
   public function getFullNameAttribute(): string
{
    $parts = [];

    if (!empty($this->salutation)) {
        $parts[] = $this->salutation;
    }

    $parts[] = $this->firstname;

    if (!empty($this->middle_initial)) {
        $middle = $this->middle_initial;
        if (!str_ends_with($middle, '.')) {
            $middle .= '.';
        }
        $parts[] = $middle;
    }

    $parts[] = $this->lastname;

    return implode(' ', $parts);
}


public function leaveBalances()
{
    return $this->hasMany(LeaveBalance::class, 'employee_id');
}
}
