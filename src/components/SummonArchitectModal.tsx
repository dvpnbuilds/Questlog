import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SummonArchitectModal({ isOpen, onClose }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const script = document.createElement('script');
    script.src = 'https://link.dvpnbuilds.com/js/form_embed.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm" />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-2xl max-h-[92dvh] bg-slate-900/90 backdrop-blur-xl border border-violet-500/30 rounded-2xl shadow-[0_0_60px_rgba(139,92,246,0.15)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-4 pt-5 pb-4 sm:px-8 sm:pt-7 sm:pb-5 border-b border-slate-800 shrink-0">
              <div>
                <p className="text-[10px] text-violet-400 uppercase tracking-widest font-black mb-1">Guild Commission</p>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Initiate a Project</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-8 sm:py-6">
              <iframe
                src="https://link.dvpnbuilds.com/widget/form/4XhFBLFd32CUxijG0Pgn"
                style={{ width: '100%', height: 'min(500px, calc(92dvh - 120px))', border: 'none', borderRadius: '8px' }}
                id="inline-4XhFBLFd32CUxijG0Pgn"
                data-layout="{'id':'INLINE'}"
                data-trigger-type="alwaysShow"
                data-trigger-value=""
                data-activation-type="alwaysActivated"
                data-activation-value=""
                data-deactivation-type="neverDeactivate"
                data-deactivation-value=""
                data-form-name="Hire Me / Contact"
                data-height="434"
                data-layout-iframe-id="inline-4XhFBLFd32CUxijG0Pgn"
                data-form-id="4XhFBLFd32CUxijG0Pgn"
                title="Hire Me / Contact"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
