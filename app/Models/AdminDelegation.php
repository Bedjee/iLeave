<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminDelegation extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'delegate_id',
        'start_date',
        'end_date',
        'status',
        'revoked_at',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function delegate()
    {
        return $this->belongsTo(User::class, 'delegate_id');
    }

    /**
     * Check if this delegation is currently active.
     */
    public function isActive(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }
        $now = now();
        return $now->between($this->start_date, $this->end_date);
    }

    /**
     * Revoke the delegation.
     */
    public function revoke(): void
    {
        $this->status = 'revoked';
        $this->revoked_at = now();
        $this->save();
    }
}
