<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmployeeProfileExists
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Only enforce this for users in the employee role. Other roles
        // (admin, hrmo, etc.) have their own workflows and aren't affected.
        if (
            $user
            && $user->role === 'employee'
            && ! $user->employee
            && ! $request->routeIs('employee.setup-pending')
            && ! $request->routeIs('logout')
        ) {
            return redirect()->route('employee.setup-pending');
        }

        return $next($request);
    }
}