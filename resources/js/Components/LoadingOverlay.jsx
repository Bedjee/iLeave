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

    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            <div className="flex flex-col items-center">
                {/* Dual‑arc spinner */}
                <div className="relative w-16 h-16 md:w-20 md:h-20">
                    <svg
                        className="w-full h-full animate-spin"
                        viewBox="0 0 64 64"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Blue arc (large) */}
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
                        {/* Yellow arc (small) */}
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
                <span className="mt-4 text-sm text-white/70 font-medium tracking-wide">Loading...</span>
            </div>
        </div>
    );
}
