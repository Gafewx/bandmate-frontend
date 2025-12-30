'use client';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  type = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-[#121212] border border-white/10 p-8 rounded-[2rem] w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6 ${
            type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.34c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
            {description}
          </p>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 bg-zinc-800 py-3 rounded-2xl font-bold text-zinc-400 hover:text-white transition-all text-sm"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-3 rounded-2xl font-black text-black transition-all text-sm hover:brightness-110 ${
                type === 'danger' ? 'bg-red-500 shadow-lg shadow-red-500/20' : 'bg-yellow-500 shadow-lg shadow-yellow-500/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}