<?php

use App\Models\LeaveCreditTransaction;
use App\Models\LeaveBalance;
use App\Models\LeaveType;
use App\Models\Employee;


use App\Http\Controllers\DepartmentHead\DashboardController as DepartmentHeadDashboard;
use App\Http\Controllers\DepartmentHead\LeaveRequestController as DepartmentHeadLeaveRequestController;
use App\Http\Controllers\DepartmentHead\TeamController;
use App\Http\Controllers\DepartmentHead\RescheduleController as DepartmentHeadRescheduleController;
use App\Http\Controllers\DepartmentHead\MyLeaveRequestController as DepartmentRequestController;






use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\LeaveRequestController as AdminLeaverequest;
use App\Http\Controllers\Admin\ProfileController as AdminProfile;
use App\Http\Controllers\Admin\DelegationController;
use App\Http\Controllers\Admin\MyLeaveRequestController;


use App\Http\Controllers\HRMO\DashboardController as HRMODashboard;

use App\Http\Controllers\Mayor\DashboardController as MayorDashboard;
use App\Http\Controllers\Mayor\DelegatedLeaveRequestController;
use App\Http\Controllers\Mayor\AdminLeaveRequestController;
use App\Http\Controllers\Mayor\MyLeaveRequestController as MayorRequestController;



use App\Http\Controllers\Employee\DashboardController as EmployeeDashboard;
use App\Http\Controllers\Employee\ProfileController;
use App\Http\Controllers\Employee\LeaveBalanceController as EmployeeBalanceController;
use App\Http\Controllers\Employee\LeaveHistoryController;
use App\Http\Controllers\Employee\LeaveRequestController as EmployeeLeaveRequestController;
use App\Http\Controllers\Employee\RescheduleController as EmployeeRescheduleController;



use App\Http\Controllers\Auth\FirstLoginPasswordController;
use App\Http\Controllers\HRMO\EmployeeController;
use App\Http\Controllers\HRMO\DepartmentController;
use App\Http\Controllers\HRMO\LeaveTypeController;
use App\Http\Controllers\HRMO\LeaveBalanceController;
use App\Http\Controllers\HRMO\RescheduleController;
use App\Http\Controllers\HRMO\LeaveRequestController as HRMOLeaveRequestController;
use App\Http\Controllers\HRMO\LeaveRecordingController;
use App\Http\Controllers\HRMO\ApprovedLeaveController;
use App\Http\Controllers\HRMO\AccrualController;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

// Routes for first-login password change (accessible only when logged in, but exempt from password.changed)
Route::middleware('auth')->group(function () {
    Route::get('/first-login-password', [FirstLoginPasswordController::class, 'create'])
        ->name('first-login-password.create');


    Route::post('/first-login-password', [FirstLoginPasswordController::class, 'store'])
        ->name('first-login-password.store');

});



// All other authenticated routes require that the user has changed their initial password
Route::middleware(['auth', 'password.changed'])->group(function () {

//===========================================================================================================================================

    // Admin
    Route::prefix('admin')->name('admin.')->middleware('role:admin')->group(function () {
    Route::get('/dashboard', [AdminDashboard::class, 'index'])->name('dashboard');
    Route::get('/leave-requests', [AdminLeaverequest::class, 'index'])->name('leave-requests.index');
    Route::get('/leave-requests/{leaveRequest}', [AdminLeaverequest::class, 'show'])->name('leave-requests.show');
    Route::post('/leave-requests/{leaveRequest}/approve', [AdminLeaverequest::class, 'approve'])->name('leave-requests.approve');
    Route::post('/leave-requests/{leaveRequest}/reject', [AdminLeaverequest::class, 'reject'])->name('leave-requests.reject');
    Route::get('/profile', [AdminProfile::class, 'edit'])->name('profile.edit');
    Route::post('/profile/pin', [AdminProfile::class, 'updatePin'])->name('profile.update-pin');
    Route::get('/delegations', [DelegationController::class, 'index'])->name('delegations.index');
    Route::post('/delegations', [DelegationController::class, 'store'])->name('delegations.store');
    Route::post('/delegations/{delegation}/revoke', [DelegationController::class, 'revoke'])->name('delegations.revoke');
    Route::post('/leave-requests/{leaveRequest}/recall', [AdminLeaverequest::class, 'recall'])->name('leave-requests.recall');


      // Admin's own leave requests
    Route::get('/my-leave-requests', [MyLeaveRequestController::class, 'index'])->name('my-leave-requests.index');
    Route::get('/my-leave-requests/create', [MyLeaveRequestController::class, 'create'])->name('my-leave-requests.create');
    Route::post('/my-leave-requests', [MyLeaveRequestController::class, 'store'])->name('my-leave-requests.store');
    Route::get('/my-leave-requests/{leaveRequest}', [MyLeaveRequestController::class, 'show'])->name('my-leave-requests.show');
});


 //===========================================================================================================================================

    // HRMO
Route::prefix('hrmo')->name('hrmo.')->middleware('role:hrmo')->group(function () {
    Route::get('/dashboard', [HRMODashboard::class, 'index'])->name('dashboard');


    // Employee management
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::get('/employees/create', [EmployeeController::class, 'create'])->name('employees.create');
    Route::post('/employees', [EmployeeController::class, 'store'])->name('employees.store');
    Route::get('/employees/{employee}', [EmployeeController::class, 'show'])->name('employees.show');
    Route::get('/employees/{employee}/edit', [EmployeeController::class, 'edit'])->name('employees.edit');
    Route::put('/employees/{employee}', [EmployeeController::class, 'update'])->name('employees.update');
    Route::post('/employees/{employee}/reset-password', [EmployeeController::class, 'resetPassword'])->name('employees.reset-password');
    Route::patch('/employees/{employee}/toggle-status', [EmployeeController::class, 'toggleStatus'])->name('employees.toggle-status');

    Route::resource('departments', DepartmentController::class)->except(['destroy']);
    Route::patch('/departments/{department}/toggle-status', [DepartmentController::class, 'toggleStatus'])->name('departments.toggle-status');

    Route::resource('leave-types', LeaveTypeController::class)->except(['destroy']);
    Route::patch('/leave-types/{leaveType}/toggle-status', [LeaveTypeController::class, 'toggleStatus'])->name('leave-types.toggle-status');

    Route::get('/leave-balances', [LeaveBalanceController::class, 'index'])->name('leave-balances.index');
    Route::post('/leave-balances', [LeaveBalanceController::class, 'update'])->name('leave-balances.update');

    Route::get('/leave-requests', [HRMOLeaveRequestController::class, 'index'])->name('leave-requests.index');
    Route::get('/leave-requests/{leaveRequest}', [HRMOLeaveRequestController::class, 'show'])->name('leave-requests.show');
    Route::post('/leave-requests/{leaveRequest}', [HRMOLeaveRequestController::class, 'update'])->name('leave-requests.update');


     Route::get('/reschedules', [RescheduleController::class, 'index'])->name('reschedules.index');
    Route::get('/reschedules/{reschedule}', [RescheduleController::class, 'show'])->name('reschedules.show');
    Route::post('/reschedules/{reschedule}/certify', [RescheduleController::class, 'certify'])->name('reschedules.certify');
    Route::post('/reschedules/{reschedule}/reject', [RescheduleController::class, 'reject'])->name('reschedules.reject');


    Route::get('/leave-recordings', [LeaveRecordingController::class, 'index'])->name('leave-recordings.index');


    Route::get('/approved-leaves', [ApprovedLeaveController::class, 'index'])->name('approved-leaves.index');
Route::get('/approved-leaves/{leaveRequest}/download', [ApprovedLeaveController::class, 'download'])->name('approved-leaves.download');
Route::get('/approved-leaves/{leaveRequest}/history', [ApprovedLeaveController::class, 'history'])->name('approved-leaves.history');


Route::get('/notifications', [App\Http\Controllers\HRMO\NotificationController::class, 'index'])->name('notifications.index');
    Route::put('/notifications/{notification}/mark-read', [App\Http\Controllers\HRMO\NotificationController::class, 'markRead'])->name('notifications.mark-read');
    Route::put('/notifications/mark-all-read', [App\Http\Controllers\HRMO\NotificationController::class, 'markAllRead'])->name('notifications.mark-all-read');



    Route::get('/accruals', [AccrualController::class, 'index'])->name('accruals.index');
Route::get('/accruals/month', [AccrualController::class, 'getMonthTransactions'])->name('accruals.month');
});










//===========================================================================================================================================

//DEPARTMENT HEAD ROUTES
// Department Head routes
Route::prefix('department-head')->name('department-head.')->middleware('role:department_head')->group(function () {
    Route::get('/dashboard', [DepartmentHeadDashboard::class, 'index'])->name('dashboard');
    Route::get('/team', [TeamController::class, 'index'])->name('team');
    Route::get('/leave-requests', [DepartmentHeadLeaveRequestController::class, 'index'])->name('leave-requests.index');
    Route::post('/leave-requests/{leaveRequest}/approve', [DepartmentHeadLeaveRequestController::class, 'approve'])->name('leave-requests.approve');
    Route::post('/leave-requests/{leaveRequest}/reject', [DepartmentHeadLeaveRequestController::class, 'reject'])->name('leave-requests.reject');
    Route::get('/leave-requests/{leaveRequest}', [DepartmentHeadLeaveRequestController::class, 'show'])->name('leave-requests.show');

      Route::get('/reschedules', [DepartmentHeadRescheduleController::class, 'index'])->name('reschedules.index');
    Route::get('/reschedules/{reschedule}', [DepartmentHeadRescheduleController::class, 'show'])->name('reschedules.show');
    Route::post('/reschedules/{reschedule}/approve', [DepartmentHeadRescheduleController::class, 'approve'])->name('reschedules.approve');
    Route::post('/reschedules/{reschedule}/reject', [DepartmentHeadRescheduleController::class, 'reject'])->name('reschedules.reject');

    // Department Head's own leave requests
    Route::get('/my-leave-requests', [DepartmentRequestController::class, 'index'])->name('my-leave-requests.index');
    Route::get('/my-leave-requests/create', [DepartmentRequestController::class, 'create'])->name('my-leave-requests.create');
    Route::post('/my-leave-requests', [DepartmentRequestController::class, 'store'])->name('my-leave-requests.store');
    Route::get('/my-leave-requests/{leaveRequest}', [DepartmentRequestController::class, 'show'])->name('my-leave-requests.show');
});



//===========================================================================================================================================

    // Mayor
    Route::prefix('mayor')->name('mayor.')->middleware('role:mayor')->group(function () {
        Route::get('/dashboard', [MayorDashboard::class, 'index'])->name('dashboard');

        Route::get('/delegated-approvals', [DelegatedLeaveRequestController::class, 'index'])->name('delegated-approvals.index');
     Route::get('/delegated-approvals/{leaveRequest}', [DelegatedLeaveRequestController::class, 'show'])->name('delegated-approvals.show');
     Route::post('/delegated-approvals/{leaveRequest}/approve', [DelegatedLeaveRequestController::class, 'approve'])->name('delegated-approvals.approve');
        Route::post('/delegated-approvals/{leaveRequest}/reject', [DelegatedLeaveRequestController::class, 'reject'])->name('delegated-approvals.reject');
    Route::post('/delegated-approvals/{leaveRequest}/recall', [DelegatedLeaveRequestController::class, 'recall'])->name('delegated-approvals.recall');

    Route::get('/admin-leave-requests', [AdminLeaveRequestController::class, 'index'])->name('admin-leave-requests.index');
Route::get('/admin-leave-requests/{leaveRequest}', [AdminLeaveRequestController::class, 'show'])->name('admin-leave-requests.show');
Route::post('/admin-leave-requests/{leaveRequest}/approve', [AdminLeaveRequestController::class, 'approve'])->name('admin-leave-requests.approve');
Route::post('/admin-leave-requests/{leaveRequest}/reject', [AdminLeaveRequestController::class, 'reject'])->name('admin-leave-requests.reject');


  // Mayor's own leave requests
    Route::get('/my-leave-requests', [MayorRequestController::class, 'index'])->name('my-leave-requests.index');
    Route::get('/my-leave-requests/create', [MayorRequestController::class, 'create'])->name('my-leave-requests.create');
    Route::post('/my-leave-requests', [MayorRequestController::class, 'store'])->name('my-leave-requests.store');
    Route::get('/my-leave-requests/{leaveRequest}', [MayorRequestController::class, 'show'])->name('my-leave-requests.show');

        });


//===========================================================================================================================================
    // Employee
    Route::prefix('employee')->name('employee.')->middleware('role:employee')->group(function () {
        Route::get('/dashboard', [EmployeeDashboard::class, 'index'])->name('dashboard');

         // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');

     // Password update route (POST or PATCH – we'll use PUT for semantics)
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.update-password');



  Route::get('/leave-balances', [EmployeeBalanceController::class, 'index'])->name('leave-balances');

    Route::get('/leave-balances/{leaveType}/history', [LeaveHistoryController::class, 'show'])->name('leave-balances.history');


     Route::get('/leave-requests', [EmployeeLeaveRequestController::class, 'index'])->name('leave-requests.index');
    Route::get('/leave-requests/create', [EmployeeLeaveRequestController::class, 'create'])->name('leave-requests.create');
    Route::post('/leave-requests', [EmployeeLeaveRequestController::class, 'store'])->name('leave-requests.store');
    Route::get('/leave-requests/{leaveRequest}', [EmployeeLeaveRequestController::class, 'show'])->name('leave-requests.show');


    Route::get('/leave-requests/{leaveRequest}/reschedule', [EmployeeRescheduleController::class, 'create'])->name('reschedule.create');
    Route::post('/leave-requests/{leaveRequest}/reschedule', [EmployeeRescheduleController::class, 'store'])->name('reschedule.store');
    Route::get('/reschedules/{reschedule}', [EmployeeRescheduleController::class, 'show'])->name('reschedules.show');
    });

    // // Profile routes (moved here so they are also protected)
    // Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    // Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    // Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
