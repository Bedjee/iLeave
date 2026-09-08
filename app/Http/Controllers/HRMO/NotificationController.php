<?php

namespace App\Http\Controllers\HRMO;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $notifications = $user->notifications()->latest()->take(20)->get();
        $unreadCount = $user->unreadNotifications()->count();

        return response()->json([
            'data' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markRead($id)
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->markAsRead();
        return response()->json(['message' => 'Marked as read']);
    }

    public function markAllRead()
    {
        auth()->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'All marked as read']);
    }
}