<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_name',
        'department_code',
        'department_head_id',
        'status',
        'skip_department_head_approval', // <-- new
    ];

    // ========== RELATIONSHIPS ==========
    public function head()
    {
        return $this->belongsTo(Employee::class, 'department_head_id');
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    // ========== SCOPES ==========
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
