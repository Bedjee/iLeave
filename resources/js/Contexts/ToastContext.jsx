import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef,
} from 'react';
import { router } from '@inertiajs/react';
import {
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    X,
} from 'lucide-react';

const ToastContext = createContext(null);

const DEFAULT_DURATION = 4500;

const TYPE_CONFIG = {
    success: { icon: CheckCircle2, bg: '#10B981', accent: '#059669' },
    error:   { icon: AlertCircle,  bg: '#DC2626', accent: '#B91C1C' },
    warning: { icon: AlertTriangle, bg: '#F59E0B', accent: '#B45309' },
    info:    { icon: Info,         bg: '#0F2A52', accent: '#0F2A52' },
};

// ------------------------------------------------------------
// Global dispatch singleton — lets non-React code trigger toasts
// ------------------------------------------------------------
let globalDispatch = null;

function emit(type, message, options = {}) {
    if (typeof globalDispatch !== 'function') {
        // eslint-disable-next-line no-console
        console.warn('[toast] Provider not mounted — dropped:', { type, message });
        return;
    }
    globalDispatch({ type, message, ...options });
}

export const toast = Object.assign(
    (type, message, options) => emit(type, message, options),
    {
        success: (message, options) => emit('success', message, options),
        error:   (message, options) => emit('error',   message, options),
        warning: (message, options) => emit('warning', message, options),
        info:    (message, options) => emit('info',    message, options),
        dismissAll: () => { if (globalDispatch?.__dismissAll) globalDispatch.__dismissAll(); },
    }
);

// ------------------------------------------------------------
// Hook
// ------------------------------------------------------------
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        return {
            toast,
            success: toast.success,
            error:   toast.error,
            warning: toast.warning,
            info:    toast.info,
        };
    }
    return ctx;
}

// ------------------------------------------------------------
// Single toast item
// ------------------------------------------------------------
function ToastItem({ item, onRemove }) {
    const [leaving, setLeaving] = useState(false);
    const [paused, setPaused] = useState(false);
    const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.info;
    const Icon = config.icon;

    const dismiss = useCallback(() => {
        // Ignore repeat dismiss calls while already exiting
        setLeaving((prev) => (prev ? prev : true));
    }, []);

    const handleAnimationEnd = (e) => {
        // Only react to the exit animation of THIS element
        if (leaving && e.animationName === 'toast-out') {
            onRemove(item.id);
        }
    };

    const duration = item.duration ?? DEFAULT_DURATION;
    const hasTimer = duration > 0 && Number.isFinite(duration);

    // Pause-aware timer
    const timerRef = useRef(null);
    const remainingRef = useRef(duration);
    const startedAtRef = useRef(null);

    useEffect(() => {
        if (!hasTimer || leaving) return;

        if (paused) {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (startedAtRef.current) {
                remainingRef.current -= Date.now() - startedAtRef.current;
            }
            return;
        }

        startedAtRef.current = Date.now();
        timerRef.current = setTimeout(dismiss, remainingRef.current);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [paused, hasTimer, dismiss, leaving]);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') dismiss();
    };

    return (
        <div
            role="status"
            aria-live={item.type === 'error' ? 'assertive' : 'polite'}
            aria-atomic="true"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onAnimationEnd={handleAnimationEnd}
            style={{
                animation: leaving
                    ? 'toast-out 220ms cubic-bezier(0.4, 0, 1, 1) forwards'
                    : 'toast-in 320ms cubic-bezier(0.16, 1, 0.3, 1)',
                willChange: 'transform, opacity',
                borderColor: 'rgba(15,42,82,0.10)',
            }}
            className="pointer-events-auto relative w-full rounded-xl bg-white border shadow-2xl overflow-hidden outline-none
                       focus:ring-2 focus:ring-offset-1 focus:ring-[#0F2A52]/30"
        >
            {/* Left accent bar — type-colored */}
            <span
                aria-hidden="true"
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: config.bg }}
            />

            <div className="flex items-start gap-3 p-3.5 pl-4">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${config.bg}1A`, color: config.accent }}
                >
                    <Icon className="w-4 h-4" strokeWidth={2.25} />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                    {item.title ? (
                        <p className="text-xs font-semibold text-gray-900 leading-tight">
                            {item.title}
                        </p>
                    ) : null}
                    <p className={`text-xs text-gray-700 leading-snug ${item.title ? 'mt-0.5' : ''}`}>
                        {item.message}
                    </p>
                    {item.action && (
                        <button
                            type="button"
                            onClick={() => {
                                item.action.onClick?.();
                                dismiss();
                            }}
                            className="mt-2 text-[11px] font-semibold hover:underline transition"
                            style={{ color: config.accent }}
                        >
                            {item.action.label}
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    onClick={dismiss}
                    aria-label="Dismiss notification"
                    className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition flex-shrink-0 -mt-0.5"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Progress bar */}
            {hasTimer && (
                <div className="h-0.5 bg-gray-100 w-full">
                    <div
                        className="h-full"
                        style={{
                            backgroundColor: config.bg,
                            animation: `toast-progress ${duration}ms linear forwards`,
                            animationPlayState: paused || leaving ? 'paused' : 'running',
                            transformOrigin: 'left',
                        }}
                    />
                </div>
            )}
        </div>
    );
}

// ------------------------------------------------------------
// Container — top-right on desktop, top full-width on mobile
// ------------------------------------------------------------
function ToastContainer({ toasts, onRemove }) {
    if (toasts.length === 0) return null;

    return (
        <>
            <style>{`
                @keyframes toast-in {
                    0% {
                        opacity: 0;
                        transform: translate3d(0, -18px, 0) scale(0.96);
                    }
                    100% {
                        opacity: 1;
                        transform: translate3d(0, 0, 0) scale(1);
                    }
                }
                @media (min-width: 640px) {
                    @keyframes toast-in {
                        0% {
                            opacity: 0;
                            transform: translate3d(24px, -8px, 0) scale(0.96);
                        }
                        100% {
                            opacity: 1;
                            transform: translate3d(0, 0, 0) scale(1);
                        }
                    }
                }

                @keyframes toast-out {
                    0% {
                        opacity: 1;
                        transform: translate3d(0, 0, 0) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translate3d(0, -12px, 0) scale(0.98);
                    }
                }
                @media (min-width: 640px) {
                    @keyframes toast-out {
                        0% {
                            opacity: 1;
                            transform: translate3d(0, 0, 0) scale(1);
                        }
                        100% {
                            opacity: 0;
                            transform: translate3d(28px, 0, 0) scale(0.98);
                        }
                    }
                }

                @keyframes toast-progress {
                    from { transform: scaleX(1); }
                    to   { transform: scaleX(0); }
                }
            `}</style>

            <div
                aria-live="polite"
                aria-atomic="false"
                // TOP-RIGHT on desktop; full-width top on mobile.
                // z-[10000] keeps us above sidebars (z-50),
                // modals (z-[60]), and the loading overlay (z-[9999]).
                className="fixed z-[10000] pointer-events-none
                           top-3 left-3 right-3
                           sm:top-4 sm:left-auto sm:right-4 sm:w-[380px] sm:max-w-[calc(100vw-2rem)]
                           flex flex-col gap-2.5"
            >
                {toasts.map((item) => (
                    <ToastItem key={item.id} item={item} onRemove={onRemove} />
                ))}
            </div>
        </>
    );
}

// ------------------------------------------------------------
// Provider
// ------------------------------------------------------------
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const addToast = useCallback((payload) => {
        const id = ++idRef.current;
        // Cap at 5 simultaneous toasts so the stack never crowds the screen.
        setToasts((prev) => {
            const next = [...prev, { id, ...payload }];
            return next.length > 5 ? next.slice(next.length - 5) : next;
        });
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const dismissAll = useCallback(() => setToasts([]), []);

    useEffect(() => {
        globalDispatch = addToast;
        globalDispatch.__dismissAll = dismissAll;
        return () => {
            globalDispatch = null;
        };
    }, [addToast, dismissAll]);

    const api = {
        toast,
        success: toast.success,
        error:   toast.error,
        warning: toast.warning,
        info:    toast.info,
        dismissAll,
    };

    return (
        <ToastContext.Provider value={api}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

// ------------------------------------------------------------
// Inertia flash → toast bridge (uses router events, no context)
// ------------------------------------------------------------
export function FlashToastBridge() {
    const lastKey = useRef(null);

    useEffect(() => {
        const handleSuccess = (event) => {
            const page = event?.detail?.page ?? event?.detail ?? event;
            const flash = page?.props?.flash;
            if (!flash) return;

            const key = JSON.stringify(flash);
            if (key === lastKey.current) return;
            lastKey.current = key;

            if (flash.success) toast.success(flash.success);
            if (flash.error)   toast.error(flash.error);
            if (flash.warning) toast.warning(flash.warning);
            if (flash.info)    toast.info(flash.info);
        };

        const removeListener = router.on('success', handleSuccess);

        return () => {
            if (typeof removeListener === 'function') {
                removeListener();
            } else if (typeof router.off === 'function') {
                router.off('success', handleSuccess);
            }
        };
    }, []);

    return null;
}