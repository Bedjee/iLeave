<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Show the employee profile edit form.
     */
    public function edit()
    {
        $employee = Auth::user()->employee;

        return Inertia::render('Employee/Profile', [
            'employee' => $employee->load('department'),
        ]);
    }

    /**
     * Update the employee profile.
     */
    public function update(Request $request)
    {
        $employee = Auth::user()->employee;
        $user = Auth::user();

        $validated = $request->validate([
            'lastname'       => 'required|string|max:255',
            'firstname'      => 'required|string|max:255',
            'middle_initial' => 'nullable|string|max:1',
            'salutation'     => 'nullable|string|max:50',
            'civil_status'   => 'nullable|in:single,married,divorced,widowed',
            'gender'         => 'nullable|in:male,female',
            'email'          => [
                'required',
                'email',
                'max:255',
                Rule::unique('employees', 'email')->ignore($employee->id),
                Rule::unique('users', 'email')->ignore($user->id),
            ],
        ]);

        // Update employee record
        $employee->update([
            'lastname'       => $validated['lastname'],
            'firstname'      => $validated['firstname'],
            'middle_initial' => $validated['middle_initial'] ?? null,
            'salutation'     => $validated['salutation'] ?? null,
            'civil_status'   => $validated['civil_status'] ?? null,
            'gender'         => $validated['gender'] ?? null,
            'email'          => $validated['email'],
        ]);

        // Update the corresponding user's email and name (if changed)
        $user->update([
            'name'  => $validated['firstname'] . ' ' . $validated['lastname'],
            'email' => $validated['email'],
        ]);

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }


      public function updatePassword(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors([
                'current_password' => 'The provided password does not match your current password.',
            ]);
        }

        // Update password
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->back()->with('success', 'Password changed successfully.');
    }

}
