<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit()
    {
        $user = Auth::user();
        return Inertia::render('Admin/Profile/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'has_pin' => !empty($user->admin_pin),
                'pin_set_at' => $user->admin_pin_set_at,
            ],
        ]);
    }

    public function updatePin(Request $request)
    {
        $user = Auth::user();

        $rules = [
            'new_pin' => ['required', 'string', 'size:4', 'regex:/^\d{4}$/'],
            'confirm_pin' => ['required', 'same:new_pin'],
        ];

        // If the user already has a PIN, require the current PIN to change it.
        if (!empty($user->admin_pin)) {
            $rules['current_pin'] = ['required', 'string', 'size:4'];
        }

        $request->validate($rules);

        // Verify current PIN if exists
        if (!empty($user->admin_pin)) {
            if (!Hash::check($request->current_pin, $user->admin_pin)) {
                return back()->withErrors(['current_pin' => 'Current PIN is incorrect.']);
            }
        }

        // Hash new PIN and store
        $user->admin_pin = Hash::make($request->new_pin);
        $user->admin_pin_set_at = now();
        $user->save();

        return back()->with('success', 'Admin PIN updated successfully.');
    }
}
