export default function ConfirmationModal({ isOpen, onConfirm, onCancel, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{message}</p>
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-600 transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-[#FF2D20] text-white rounded-lg hover:bg-[#e62e1c] transition"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
