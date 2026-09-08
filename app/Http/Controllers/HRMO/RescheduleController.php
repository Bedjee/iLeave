<?php

namespace App\Http\Controllers\HRMO;

use App\Http\Controllers\Controller;
use App\Models\LeaveReschedule;
use App\Models\LeaveRequest;
use App\Services\RescheduleBalanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RescheduleController extends Controller
{



public function index()
{
    $pendingReschedules = LeaveReschedule::with([
        'leaveRequest',
        'leaveRequest.employee',
        'leaveRequest.leaveType',
        'leaveRequest.dates'
    ])
    ->where('status', 'pending')
    ->orderBy('created_at', 'asc')
    ->get();

    $certifiedReschedules = LeaveReschedule::with([
        'leaveRequest',
        'leaveRequest.employee',
        'leaveRequest.leaveType',
        'leaveRequest.dates'
    ])
    ->where('status', 'certified')
    ->orderBy('updated_at', 'desc')
    ->get();

    return Inertia::render('HRMO/Reschedules/Index', [
        'pendingReschedules' => $pendingReschedules,
        'certifiedReschedules' => $certifiedReschedules,
    ]);
}



    public function show(LeaveReschedule $reschedule)
    {
        $reschedule->load(['leaveRequest.employee', 'leaveRequest.leaveType', 'leaveRequest.dates']);

        return Inertia::render('HRMO/Reschedules/Show', [
            'reschedule' => $reschedule,
        ]);
    }

    public function certify(LeaveReschedule $reschedule)
    {
        if ($reschedule->status !== 'pending') {
            return redirect()->back()->withErrors(['error' => 'This reschedule is not pending.']);
        }

        $reschedule->status = 'certified';
        $reschedule->certified_at = now();
        $reschedule->certified_by = Auth::id();
        $reschedule->save();

        return redirect()->back()->with('success', 'Reschedule request certified.');
    }

    public function reject(Request $request, LeaveReschedule $reschedule)
    {
        if ($reschedule->status !== 'pending') {
            return redirect()->back()->withErrors(['error' => 'This reschedule is not pending.']);
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $reschedule->status = 'rejected';
        $reschedule->rejection_reason = $validated['reason'];
        $reschedule->save();

        return redirect()->back()->with('success', 'Reschedule request rejected.');
    }
}
