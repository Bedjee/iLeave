<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'must_change_password', // <-- add
    'password_changed_at',  // <-- add
    ];

    protected $hidden = [
        'password',
        'remember_token',
         'admin_pin', // hide from arrays
    ];

    protected $casts = [
    'email_verified_at' => 'datetime',
    'must_change_password' => 'boolean',   // <-- add this
    'password_changed_at' => 'datetime',   // <-- if not already present
    'password' => 'hashed',
    'admin_pin_set_at' => 'datetime',
];



    // ========== RELATIONSHIPS ==========
    public function employee()
    {
        return $this->hasOne(Employee::class);
    }

    // ========== ROLE HELPERS ==========
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isHrmo(): bool
    {
        return $this->role === 'hrmo';
    }

    public function isDepartmentHead(): bool
    {
        return $this->role === 'department_head';
    }

    public function isMayor(): bool
    {
        return $this->role === 'mayor';
    }

    public function isEmployee(): bool
    {
        return $this->role === 'employee';
    }

    // ========== ACCOUNT STATUS ==========
    public function isActive(): bool
    {
        return $this->status === 'active';
    }


   public function needsPasswordChange(): bool
{
    return $this->must_change_password === true;  // now works because cast to boolean
}


public function verifyPin(string $pin): bool
{
    if (!$this->admin_pin) {
        return false;
    }
    return \Hash::check($pin, $this->admin_pin);
}

public function adminDelegations()
{
    return $this->hasMany(AdminDelegation::class, 'admin_id');
}

public function delegatedToMe()
{
    return $this->hasMany(AdminDelegation::class, 'delegate_id');
}

}
