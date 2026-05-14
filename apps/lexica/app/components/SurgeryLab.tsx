'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Activity, Check, X, Info, Plus } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface SurgeryPart {
  id: string;
  text: string;
  type: string;
  meaning: string;
  relatedWords?: { word: string; meaning: string }[];
}

interface SurgeryModule {
  prefix?: { text: string; meaning: string; relatedWords?: { word: string; meaning: string }[] };
  prefix2?: { text: string; meaning: string; relatedWords?: { word: string; meaning: string }[] };
  root: { text: string; meaning: string; relatedWords?: { word: string; meaning: string }[] };
  root2?: { text: string; meaning: string; relatedWords?: { word: string; meaning: string }[] };
  suffix?: { text: string; meaning: string; relatedWords?: { word: string; meaning: string }[] };
}

interface SurgeryLabProps {
  word: string;
  module: SurgeryModule;
  onSuccess: () => void;
  onFail: () => void;
  onClose?: () => void;
}

export default function SurgeryLab({ word, module, onSuccess, onFail, onClose }: SurgeryLabProps) {
  const { click, buttonPress, quizCorrect, quizWrong } = useSoundEffects();
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const [activeInfo, setActiveInfo] = useState<SurgeryPart | null>(null);

  // Use state initializer to shuffle once on mount
  const [parts] = useState<SurgeryPart[]>(() => {
    const allParts: SurgeryPart[] = [
      ...(module.prefix ? [{ id: 'p', text: module.prefix.text, type: 'Prefix', meaning: module.prefix.meaning, relatedWords: module.prefix.relatedWords }] : []),
      ...(module.prefix2 ? [{ id: 'p2', text: module.prefix2.text, type: 'Prefix 2', meaning: module.prefix2.meaning, relatedWords: module.prefix2.relatedWords }] : []),
      { id: 'r', text: module.root.text, type: 'Root', meaning: module.root.meaning, relatedWords: module.root.relatedWords },
      ...(module.root2 ? [{ id: 'r2', text: module.root2.text, type: 'Root 2', meaning: module.root2.meaning, relatedWords: module.root2.relatedWords }] : []),
      ...(module.suffix ? [{ id: 's', text: module.suffix.text, type: 'Suffix', meaning: module.suffix.meaning, relatedWords: module.suffix.relatedWords }] : []),
    ];
    return [...allParts].sort(() => 0.5 - Math.random());
  });

  const togglePart = (id: string) => {
    if (status !== 'idle') return;
    click();
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );

    // Show info for the last selected part
    const part = parts.find(p => p.id === id);
    if (part) setActiveInfo(part);
  };

  const checkSequence = () => {
    buttonPress();
    const correctOrder = [
      ...(module.prefix ? ['p'] : []),
      ...(module.prefix2 ? ['p2'] : []),
      'r',
      ...(module.root2 ? ['r2'] : []),
      ...(module.suffix ? ['s'] : []),
    ];

    if (JSON.stringify(selected) === JSON.stringify(correctOrder)) {
      quizCorrect();
      setStatus('success');
      setTimeout(onSuccess, 2000);
    } else {
      quizWrong();
      setStatus('fail');
      setTimeout(() => {
        setStatus('idle');
        setSelected([]);
        onFail();
      }, 1000);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center gap-4 p-5 md:p-8 bg-slate-900 rounded-3xl border border-slate-700 w-full max-w-3xl mx-auto shadow-2xl max-h-[95vh] overflow-y-auto sm:overflow-visible">
      {onClose && (
        <button
          onClick={() => {
            click();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700 transition-all z-50 sm:-top-2 sm:-right-2 sm:bg-slate-800"
        >
          <X className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      )}

      <div className="relative z-20 flex flex-col items-center w-full">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 text-cyan-400 font-bold text-[10px] md:text-xs uppercase mb-4 md:mb-8 tracking-wider"
        >
          <Scissors className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span>Phân tích từ: {word}</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 md:gap-8 w-full items-start">
          {/* Main Workspace */}
          <div className="lg:col-span-3 flex flex-col items-center gap-5 md:gap-8 order-1">
            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
              {parts.map((part, idx) => (
                <motion.button
                  key={part.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => togglePart(part.id)}
                  className={`relative px-3 py-3 md:px-6 md:py-5 rounded-xl md:rounded-2xl border-2 transition-all flex flex-col items-center min-w-[80px] md:min-w-[120px] ${selected.includes(part.id)
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-lg'
                    : 'border-slate-700 bg-slate-800 hover:bg-slate-750'
                    }`}
                >
                  <span className={`text-[8px] md:text-[9px] font-bold uppercase mb-1 tracking-widest ${selected.includes(part.id) ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {part.type}
                  </span>
                  <span className={`text-lg md:text-2xl font-bold ${selected.includes(part.id) ? 'text-white' : 'text-slate-400'}`}>
                    {part.text}
                  </span>

                  {selected.includes(part.id) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 md:w-5 md:h-5 bg-cyan-500 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-black text-slate-900 shadow-xl border-2 border-slate-900"
                    >
                      {selected.indexOf(part.id) + 1}
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            <div className="w-full h-16 md:h-28 flex flex-col items-center justify-center rounded-xl md:rounded-2xl border-2 border-dashed border-slate-800 bg-slate-800/20 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {selected.length > 0 ? (
                  <motion.div
                    key={selected.join('-')}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-2xl md:text-4xl font-black text-white tracking-[0.1em] flex items-center gap-1"
                  >
                    {selected.map(id => (
                      <span key={id}>{parts.find(p => p.id === id)?.text}</span>
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-slate-600 font-medium text-[10px] md:text-sm uppercase tracking-widest text-center px-4">
                    Ghép các mảnh theo đúng thứ tự
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Info Sidebar (Academic Content) */}
          <div className="lg:col-span-2 min-h-[150px] md:min-h-[300px] order-2">
            <AnimatePresence mode="wait">
              {activeInfo ? (
                <motion.div
                  key={activeInfo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-slate-800/50 rounded-xl md:rounded-2xl border border-slate-700 p-4 md:p-6 h-full"
                >
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-[9px] md:text-[10px] uppercase mb-2 md:mb-3">
                    <Info className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    <span>Ý nghĩa của {activeInfo.type}</span>
                  </div>

                  <h3 className="text-xl md:text-3xl font-black text-white mb-1 md:mb-2">{activeInfo.text}</h3>
                  <p className="text-slate-300 text-[11px] md:text-sm leading-relaxed mb-3 md:mb-6">
                    {activeInfo.meaning}
                  </p>

                  {activeInfo.relatedWords && activeInfo.relatedWords.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-[8px] md:text-[9px] uppercase mb-2 md:mb-3 tracking-tighter border-t border-slate-700/50 pt-3 md:pt-4">
                        <Plus className="w-2.5 md:w-3 h-2.5 md:h-3" />
                        <span>Các từ cùng gốc</span>
                      </div>
                      <div className="flex flex-col gap-1.5 md:gap-2">
                        {activeInfo.relatedWords.map((rel, idx) => {
                          if (!rel || typeof rel !== 'object') return null;
                          const wordText = rel.word || '';
                          return (
                            <div key={`${wordText}-${idx}`} className="px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-200 text-[10px] md:text-xs font-medium flex items-center justify-between group">
                              <span className="font-bold">{wordText.toUpperCase()}</span>
                              <span className="text-[9px] md:text-[10px] text-cyan-500/70 italic ml-2 text-right">{rel.meaning || ''}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-slate-800 rounded-xl md:rounded-2xl p-4 md:p-6 text-center">
                  <Activity className="w-5 md:w-6 h-5 md:h-6 text-slate-700 mb-2 md:mb-3 animate-pulse" />
                  <p className="text-slate-600 text-[9px] md:text-[10px] uppercase font-bold leading-relaxed">
                    Nhấn vào một mảnh để xem giải nghĩa
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.button
          onClick={checkSequence}
          disabled={selected.length === 0 || status !== 'idle'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full mt-6 md:mt-10 py-3.5 md:py-5 rounded-xl md:rounded-2xl font-black text-xs md:text-sm tracking-widest flex items-center justify-center gap-2 md:gap-3 transition-all ${status === 'success' ? 'bg-green-500 text-slate-900' :
            status === 'fail' ? 'bg-red-500 text-white' :
              'bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-30'
            }`}
        >
          {status === 'success' ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : status === 'fail' ? <X className="w-4 h-4 md:w-5 md:h-5" /> : <Activity className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          <span>
            {status === 'success' ? 'CHÍNH XÁC RỒI!' :
              status === 'fail' ? 'THỬ LẠI NHÉ' :
                'KIỂM TRA ĐÁP ÁN'}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
