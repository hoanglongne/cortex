import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Check, X } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface UpgradeOption {
  text: string;
  nuance: string;
  formalityScore: number;
}

interface UpgradeModule {
  simpleSentence: string;
  targetSlot: string;
  academicOptions: UpgradeOption[];
}

interface UpgradeLabProps {
  word: string;
  module: UpgradeModule;
  onSuccess: () => void;
  onFail: () => void;
  onClose?: () => void;
}

export default function UpgradeLab({ word, module, onSuccess, onFail, onClose }: UpgradeLabProps) {
  const { click, buttonPress, quizCorrect, quizWrong } = useSoundEffects();
  const [status, setStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const [selectedOption, setSelectedOption] = useState<UpgradeOption | null>(null);

  // Simple and safe way to handle shuffling
  const [options] = useState<UpgradeOption[]>(() => {
    if (!module?.academicOptions) return [];
    return [...module.academicOptions].sort(() => 0.5 - Math.random());
  });

  const handleSelect = (option: UpgradeOption) => {
    if (status === 'success') return; // Don't allow re-selection after success
    click();
    setSelectedOption(option);

    if (option.text.toLowerCase().includes(word.toLowerCase())) {
      quizCorrect();
      setStatus('success');
      // Remove auto-exit: user will click a "Continue" button
    } else {
      quizWrong();
      setStatus('fail');
      // Don't clear immediately, let user read nuance
      onFail();
    }
  };

  const sentenceParts = module.simpleSentence.split(module.targetSlot);

  return (
    <div className="relative flex flex-col items-center justify-center gap-4 md:gap-6 p-5 md:p-8 bg-bg rounded-3xl border border-line w-full max-w-4xl mx-auto shadow-2xl max-h-[95vh] overflow-y-auto sm:overflow-visible">
      {onClose && (
        <button
          onClick={() => {
            click();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-surface/50 text-muted hover:text-ink border border-line transition-all z-50 sm:-top-2 sm:-right-2 sm:bg-surface"
        >
          <X className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      )}

      <div className="relative z-20 w-full">
        <div className="flex items-center gap-3 text-warning font-bold text-[10px] md:text-xs uppercase font-mono mb-6 md:mb-8 justify-center">
          <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span>Nâng cấp từ vựng: {word}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-stretch">
          {/* Comparison View */}
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex-1 p-4 md:p-6 pb-6 md:pb-8 bg-surface/50 rounded-xl md:rounded-2xl border border-line relative flex flex-col">
              <div className="text-[9px] md:text-[10px] font-bold text-muted uppercase font-mono mb-4 md:mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-surface-3"></div>
                Câu gốc (Đơn giản)
              </div>
              <p className="text-muted italic text-base md:text-lg leading-relaxed flex-1">
                &quot;{module.simpleSentence}&quot;
              </p>
              <div className="mt-6 md:mt-8 pt-4 border-t border-line/50 flex items-center justify-between text-[9px] md:text-[10px] font-mono text-subtle uppercase tracking-widest">
                <span>Độ trang trọng: Thấp</span>
                <span>Điểm: 02/10</span>
              </div>
            </div>

            <div className="flex-1 p-4 md:p-6 pb-6 md:pb-8 bg-warning/5 rounded-xl md:rounded-2xl border border-warning/20 relative flex flex-col group">
              <div className="text-[9px] md:text-[10px] font-bold text-warning uppercase font-mono mb-4 md:mb-6 flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-warning"
                ></motion.div>
                Phiên bản Academic
              </div>
              <p className="text-ink font-medium text-lg md:text-xl leading-relaxed flex-1">
                &quot;{sentenceParts[0]}
                <span className="px-1.5 md:px-2 py-0.5 border-b-2 border-warning text-warning not-italic font-bold mx-1">
                  {selectedOption ? selectedOption.text : '__________'}
                </span>
                {sentenceParts[1]}&quot;
              </p>

              <AnimatePresence mode="wait">
                {selectedOption && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-warning/20 overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-[9px] md:text-[10px] font-mono text-warning/70 mb-2 md:mb-3 uppercase tracking-widest">
                      <span>Độ trang trọng: {selectedOption.formalityScore}/10</span>
                      <span>Phân tích sắc thái</span>
                    </div>
                    <p className="text-[11px] md:text-xs text-warning/80 leading-relaxed italic">
                      {selectedOption.nuance}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Selection View */}
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="text-[9px] md:text-[10px] font-bold text-muted uppercase font-mono mb-1 md:mb-2 px-2">
              Lựa chọn thay thế
            </div>
            <div className="flex flex-col gap-2 md:gap-3">
              {options.map((option, idx) => (
                <motion.button
                  key={option.text}
                  whileHover={status !== 'success' ? { x: 4, backgroundColor: 'rgba(245,184,61,0.06)', borderColor: 'rgba(245,184,61,0.4)' } : {}}
                  whileTap={status !== 'success' ? { scale: 0.98 } : {}}
                  onClick={() => handleSelect(option)}
                  disabled={status === 'success'}
                  className={`relative p-4 md:p-5 rounded-xl border transition-all text-left group ${selectedOption?.text === option.text
 ? status === 'success'
 ? 'border-accent bg-accent/10'
 : 'border-danger bg-danger/10'
 : 'border-line bg-surface hover:border-line-strong disabled:opacity-50'
 }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg border flex items-center justify-center font-bold text-[10px] md:text-xs ${selectedOption?.text === option.text ? 'border-current' : 'border-line text-muted'
 }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={`font-bold tracking-tight uppercase font-mono text-xs md:text-sm ${selectedOption?.text === option.text ? 'text-ink' : 'text-muted'}`}>
                        {option.text}
                      </span>
                    </div>
                    {selectedOption?.text === option.text && (
                      status === 'success' ? <Check className="w-4 h-4 md:w-5 md:h-5 text-accent" /> : <X className="w-4 h-4 md:w-5 md:h-5 text-danger" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="mt-auto pt-6 md:pt-8">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                      buttonPress();
                      onSuccess();
                    }}
                    className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-accent text-on-accent font-bold text-xs md:text-sm tracking-[0.1em] md:tracking-[0.2em] uppercase font-mono hover:bg-accent-strong transition-colors shadow-lg "
                  >
                    Hoàn thành
                  </motion.button>
                ) : (
                  <div className="flex flex-col items-center gap-2 md:gap-3">
                    <div className="flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-bold text-muted uppercase font-mono">
                      <Zap className="w-3 h-3" />
                      <span>Nâng cấp câu văn lên trình độ Academic</span>
                    </div>
                    {status === 'fail' && (
                      <p className="text-[9px] md:text-[10px] text-danger font-bold uppercase font-mono animate-pulse">
                        Lựa chọn chưa tối ưu - Hãy thử lại nhé
                      </p>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
