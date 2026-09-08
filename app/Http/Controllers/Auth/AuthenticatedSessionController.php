<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
 public function store(LoginRequest $request)
{
    $request->authenticate();
    $request->session()->regenerate();

    $user = Auth::user();

    if ($user->needsPasswordChange()) {
        return redirect()->route('first-login-password.create');
    }

    $role = $user->role;
    $route = match($role) {
        'admin'          => route('admin.dashboard'),
        'hrmo'           => route('hrmo.dashboard'),
        'department_head'=> route('department-head.dashboard'),
        'mayor'          => route('mayor.dashboard'),
        default          => route('employee.dashboard'),
    };

    return redirect()->to($route);
}



    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
