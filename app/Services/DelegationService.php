<?php

namespace App\Services;

use App\Models\AdminDelegation;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DelegationService
{
    /**
     * Check if the given admin has an active delegation.
     */
    public function hasActiveDelegation(User $admin): bool
    {
        $hasActive = AdminDelegation::where('admin_id', $admin->id)
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->exists();

        Log::info('DelegationService::hasActiveDelegation', [
            'admin_id' => $admin->id,
            'admin_email' => $admin->email,
            'has_active' => $hasActive,
        ]);

        return $hasActive;
    }

    /**
     * Get the active delegate for the given admin (if any).
     */
    public function getActiveDelegate(User $admin): ?User
    {
        $delegation = AdminDelegation::where('admin_id', $admin->id)
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->first();

        if ($delegation) {
            Log::info('DelegationService::getActiveDelegate', [
                'admin_id' => $admin->id,
                'delegate_id' => $delegation->delegate_id,
                'delegate_name' => $delegation->delegate?->name,
                'start_date' => $delegation->start_date,
                'end_date' => $delegation->end_date,
            ]);
        } else {
            Log::info('DelegationService::getActiveDelegate - no active delegation', [
                'admin_id' => $admin->id,
            ]);
        }

        return $delegation ? $delegation->delegate : null;
    }

    /**
     * Check if the current user is a delegate for any admin.
     */
    public function isDelegate(): bool
    {
        $user = Auth::user();
        $isDelegate = AdminDelegation::where('delegate_id', $user->id)
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->exists();

        Log::info('DelegationService::isDelegate', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'is_delegate' => $isDelegate,
        ]);

        return $isDelegate;
    }

    /**
     * Get all pending leave requests that are delegated to the current mayor.
     */
    public function getDelegatedPendingRequests()
    {
        if (!$this->isDelegate()) {
            return collect();
        }

        $requests = \App\Models\LeaveRequest::with(['employee.user', 'leaveType', 'dates'])
            ->where('status', 'department_approved')
            ->orderBy('created_at', 'asc')
            ->get();

        Log::info('DelegationService::getDelegatedPendingRequests', [
            'user_id' => Auth::id(),
            'count' => $requests->count(),
        ]);

        return $requests;
    }

    /**
     * Revoke all active delegations for a given admin.
     */
    public function revokeAllForAdmin(User $admin): void
    {
        $updated = AdminDelegation::where('admin_id', $admin->id)
            ->where('status', 'active')
            ->update(['status' => 'revoked', 'revoked_at' => now()]);

        Log::info('DelegationService::revokeAllForAdmin', [
            'admin_id' => $admin->id,
            'updated_count' => $updated,
        ]);
    }
}
