export default function Modal({ isOpen, onClose, title, children, confirmText, onConfirm, cancelText = '취소' }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-navy/40" />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-[modalIn_0.2s_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        {title && <h3 className="text-lg font-bold text-navy mb-4">{title}</h3>}
        <div className="text-navy/80">{children}</div>
        {(onConfirm || onClose) && (
          <div className="flex gap-3 mt-6">
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-navy/60 font-medium touch-target"
              >
                {cancelText}
              </button>
            )}
            {onConfirm && (
              <button
                onClick={onConfirm}
                className="flex-1 py-3 rounded-xl bg-orange text-white font-bold touch-target"
              >
                {confirmText || '확인'}
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
