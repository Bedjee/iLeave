<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordChanged
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check() && Auth::user()->needsPasswordChange()) {
            // Allow access only to the first-login password change routes
            if (! $request->routeIs('first-login-password.create') &&
                ! $request->routeIs('first-login-password.store')) {
                return redirect()->route('first-login-password.create');
            }
        }

        return $next($request);
    }
}
