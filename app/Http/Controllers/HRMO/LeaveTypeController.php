<?php

namespace App\Http\Controllers\HRMO;

use App\Http\Controllers\Controller;
use App\Http\Requests\HRMO\StoreLeaveTypeRequest;
use App\Http\Requests\HRMO\UpdateLeaveTypeRequest;
use App\Models\LeaveType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = LeaveType::query()
            ->select(['id', 'name', 'code', 'status', 'earnable', 'deductible', 'default_days', 'deduction_factor']);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // Filter by status (active/inactive)
        if ($request->has('status') && $request->input('status') !== '') {
            $query->where('status', filter_var($request->input('status'), FILTER_VALIDATE_BOOLEAN));
        }

        $leaveTypes = $query->orderBy('name')->paginate(15);

        return Inertia::render('HRMO/LeaveTypes/Index', [
            'leaveTypes' => $leaveTypes,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('HRMO/LeaveTypes/Create');
    }

    public function store(StoreLeaveTypeRequest $request)
    {
        $validated = $request->validated();
        $validated['status'] = $validated['status'] ?? true;
        LeaveType::create($validated);

        return redirect()->route('hrmo.leave-types.index')
                         ->with('success', 'Leave type created successfully.');
    }

    public function show(LeaveType $leaveType)
    {
        return Inertia::render('HRMO/LeaveTypes/Show', [
            'leaveType' => $leaveType,
        ]);
    }

    public function edit(LeaveType $leaveType)
    {
        return Inertia::render('HRMO/LeaveTypes/Edit', [
            'leaveType' => $leaveType,
        ]);
    }

   public function update(UpdateLeaveTypeRequest $request, LeaveType $leaveType)
{
    \Log::info('=== Leave Type Update START ===', [
        'id' => $leaveType->id,
        'request_data' => $request->validated(),
        'current_date_selection_type' => $leaveType->date_selection_type,
    ]);

    $validated = $request->validated();
    $leaveType->update($validated);

    // Reload to confirm the change
    $leaveType->refresh();

    \Log::info('=== Leave Type Update END ===', [
        'id' => $leaveType->id,
        'new_date_selection_type' => $leaveType->date_selection_type,
    ]);

    return redirect()->route('hrmo.leave-types.index')
                     ->with('success', 'Leave type updated successfully.');
}

    /**
     * Toggle the active status of a leave type.
     */
    public function toggleStatus(LeaveType $leaveType)
    {
        $leaveType->status = !$leaveType->status;
        $leaveType->save();

        $statusText = $leaveType->status ? 'activated' : 'deactivated';
        return redirect()->back()->with('success', "Leave type {$statusText} successfully.");
    }
}
