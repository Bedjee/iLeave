<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminDelegation;
use App\Models\User;
use App\Services\DelegationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DelegationController extends Controller
{
    public function index()
    {
        $admin = Auth::user();
        $delegations = AdminDelegation::with('delegate')
            ->where('admin_id', $admin->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Get all users with role 'mayor'
        $mayors = User::where('role', 'mayor')->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Delegations/Index', [
            'delegations' => $delegations,
            'mayors' => $mayors,
        ]);
    }

   public function store(Request $request)
{
    $admin = Auth::user();

    Log::info('DelegationController@store - START', [
        'admin_id' => $admin->id,
        'data' => $request->all(),
    ]);

    $request->validate([
        'delegate_id' => ['required', 'exists:users,id', function ($attribute, $value, $fail) {
            $user = User::find($value);
            if (!$user || $user->role !== 'mayor') {
                $fail('The selected user must have the Mayor role.');
            }
        }],
        'start_date' => ['required', 'date', 'after:now'],
        'end_date' => ['required', 'date', 'after:start_date'],
    ]);

    $delegationService = new DelegationService();
    if ($delegationService->hasActiveDelegation($admin)) {
        Log::warning('DelegationController@store - active delegation exists', ['admin_id' => $admin->id]);
        return back()->withErrors(['error' => 'You already have an active delegation. Please revoke it first.']);
    }

    // Ensure dates are stored with proper time boundaries
    $start = \Carbon\Carbon::parse($request->start_date)->startOfDay();
    $end = \Carbon\Carbon::parse($request->end_date)->endOfDay();

    $delegation = AdminDelegation::create([
        'admin_id' => $admin->id,
        'delegate_id' => $request->delegate_id,
        'start_date' => $start,
        'end_date' => $end,
        'status' => 'active',
    ]);

    Log::info('DelegationController@store - SUCCESS', [
        'delegation_id' => $delegation->id,
        'start' => $start,
        'end' => $end,
    ]);

    return redirect()->route('admin.delegations.index')
        ->with('success', 'Delegation created successfully.');
}

    public function revoke(AdminDelegation $delegation)
    {
        $admin = Auth::user();

        // Ensure the delegation belongs to this admin
        if ($delegation->admin_id !== $admin->id) {
            abort(403);
        }

        if ($delegation->status !== 'active') {
            return back()->withErrors(['error' => 'This delegation is not active.']);
        }

        $delegation->revoke();

        return redirect()->back()->with('success', 'Delegation revoked successfully.');
    }
}
