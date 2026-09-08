import { useState, useEffect } from 'react';
import axios from 'axios';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/hrmo/notifications');
            // ✅ res.data.data is now the array of notifications
            setNotifications(res.data.data || []);
            setUnreadCount(res.data.unread_count || 0);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds as a fallback
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.put(`/hrmo/notifications/${id}/mark-read`);
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put('/hrmo/notifications/mark-all-read');
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition"
                aria-label="Notifications"
            >
                <svg className="size-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-[#ffbf00] rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="flex items-center justify-between px-4 py-2 border-b">
                        <span className="text-sm font-semibold text-gray-800">Notifications</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-[#ffbf00] hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="divide-y">
                        {notifications.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-gray-500 text-center">No notifications</p>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`px-4 py-3 hover:bg-gray-50 transition ${!notif.read_at ? 'bg-blue-50' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-800">{notif.data.message}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {new Date(notif.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notif.read_at && (
                                            <button
                                                onClick={() => markAsRead(notif.id)}
                                                className="text-xs text-[#ffbf00] hover:underline whitespace-nowrap"
                                            >
                                                Mark read
                                            </button>
                                        )}
                                    </div>
                                    {notif.data.url && (
                                        <a
                                            href={notif.data.url}
                                            className="text-xs font-medium hover:underline block mt-1"
                                            style={{ color: '#0F2A52' }}
                                            onClick={() => {
                                                if (!notif.read_at) markAsRead(notif.id);
                                                setOpen(false);
                                            }}
                                        >
                                            View request →
                                        </a>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}