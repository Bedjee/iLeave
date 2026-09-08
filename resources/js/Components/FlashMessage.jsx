import { useEffect, useState } from 'react';

export default function FlashMessage({ message, type = 'success', duration = 4000 }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, duration);
        return () => clearTimeout(timer);
    }, [duration]);

    if (!visible || !message) return null;

    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';

    return (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white ${bgColor} transition-all duration-500 max-w-sm`}>
            {message}
        </div>
    );
}
