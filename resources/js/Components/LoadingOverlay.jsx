import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function LoadingOverlay() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const start = () => setLoading(true);
        const finish = () => setLoading(false);

        const removeStart = router.on('start', start);
        const removeFinish = router.on('finish', finish);

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    // Lock body scroll while the overlay is visible
    useEffect(() => {
        if (!loading) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [loading]);

    if (!loading) return null;

    return (
        <div
            // z-[9999] guarantees we sit above the sidebar (z-50),
            // mobile overlay (z-40), and the logout modal (z-[60]).
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            role="status"
            aria-live="polite"
            aria-label="Loading"
        >
            <div className="flex flex-col items-center">
                {/* Dual-arc spinner */}
                <div className="relative w-16 h-16 md:w-20 md:h-20">
                    <svg
                        className="w-full h-full animate-spin"
                        viewBox="0 0 64 64"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Navy arc (large) */}
                        <circle
                            cx="32"
                            cy="32"
                            r="26"
                            stroke="#0F2A52"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray="80 90"
                            strokeDashoffset="10"
                        />
                        {/* Gold arc (small) */}
                        <circle
                            cx="32"
                            cy="32"
                            r="26"
                            stroke="#ffbf00"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray="30 100"
                            strokeDashoffset="0"
                        />
                    </svg>
                </div>
                <span className="mt-4 text-sm text-white/70 font-medium tracking-wide">
                    Loading…
                </span>
            </div>
        </div>
    );
}