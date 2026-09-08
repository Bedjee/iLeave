<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class FirstLoginPasswordController extends Controller
{
    /**
     * Show the first-time password change form.
     */
    public function create()
    {
        // If user is not logged in, redirect to login
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        // If user does NOT need to change password, redirect to dashboard
        if (!$user->needsPasswordChange()) {
            return redirect()->route($this->getDashboardRoute($user->role));
        }

        // Allow all roles to change password – remove the role check
        return Inertia::render('Auth/FirstLoginPassword');
    }

    /**
     * Handle the password update.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user->password = Hash::make($request->password);
        $user->must_change_password = false;
        $user->password_changed_at = now();
        $user->save();

        return redirect()->route($this->getDashboardRoute($user->role))
                         ->with('success', 'Password changed successfully.');
    }

    private function getDashboardRoute(string $role): string
    {
        return match($role) {
            'admin'          => 'admin.dashboard',
            'hrmo'           => 'hrmo.dashboard',
            'department_head'=> 'department-head.dashboard',
            'mayor'          => 'mayor.dashboard',
            default          => 'employee.dashboard',
        };
    }
}
