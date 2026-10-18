'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Zap, BookOpen, Trophy, Sprout, Sparkles, User, Briefcase, Laptop, GraduationCap } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useLexicaStore } from '../store/lexicaStore';
import type { UserArchetype } from '../types/vocab';
import { BRANCH_HINT, BRANCH_LABEL, type Branch } from '../lib/journey/path';
import { readBranchPick, writeBranchPick } from '../lib/journey/branchPick';

interface OnboardingModalProps {
    onComplete: () => void;
    /** The first run: ask for the branch too. As help ("?"), the branch step is left out. */
    firstTime?: boolean;
}

const STEPS = [
    {
        icon: Zap,
        iconColor: 'text-accent',
        iconBg: 'bg-accent/15 border-accent/30',
        title: 'Từ câu chêm đến câu của mình',
        body: 'Người Việt vẫn chêm tiếng Anh khi nói. Lexica bắt đầu từ đúng đó: mỗi từ mới đến trong một câu tiếng Việt quen thuộc, rồi được đẩy dần sang đọc và nói tiếng Anh, cho tới khi nó thành từ của bạn.',
        detail: '10 phút mỗi ngày. Sau 30 ngày bạn thấy rõ mình đã dùng được bao nhiêu từ.',
    },
    {
        icon: Sparkles,
        iconColor: 'text-accent',
        iconBg: 'bg-accent/15 border-accent/30',
        title: 'Bạn học tiếng Anh để làm gì?',
        body: 'Hai nhánh dùng cùng một cách học, chỉ khác nội dung. Đổi được bất cứ lúc nào.',
        detail: null,
        isBranchSelection: true,
    },
    {
        icon: User,
        iconColor: 'text-accent',
        iconBg: 'bg-accent/15 border-accent/30',
        title: 'Câu ví dụ theo đời bạn',
        body: 'Từ mới luôn đến trong một tình huống quen. Chọn kiểu đời sống gần bạn nhất để câu ví dụ giống chuyện của bạn.',
        detail: null,
        isPersonaSelection: true,
    },
    {
        icon: Sprout,
        iconColor: 'text-accent',
        iconBg: 'bg-accent/15 border-accent/30',
        title: '4 bước của một từ',
        body: 'Lexica chỉ đếm từ bạn dùng được. Mỗi từ đi qua 4 bước, theo thứ tự:',
        detail: 'Trả lời sai khi ôn thì từ lùi về Nhớ, nhưng giữ những lần Gặp và Dùng đã có.',
        cards: [
            { icon: '1', label: 'Hiểu', desc: 'Hiểu nghĩa trong câu tiếng Việt, trả lời đúng câu hỏi nhanh', color: 'border-line bg-surface/50 text-ink' },
            { icon: '2', label: 'Nhớ', desc: 'Nhớ lại đúng ở hai ngày khác nhau, cách nhau vài ngày', color: 'border-line bg-surface/50 text-ink' },
            { icon: '3', label: 'Gặp', desc: 'Nhận ra từ trong đoạn văn tiếng Anh', color: 'border-line bg-surface/50 text-ink' },
            { icon: '4', label: 'Dùng', desc: 'Nói ra thành tiếng, máy nghe rõ', color: 'border-accent/40 bg-accent/10 text-accent' },
        ],
    },
    {
        icon: BookOpen,
        iconColor: 'text-accent',
        iconBg: 'bg-accent/15 border-accent/30',
        title: 'Mỗi ngày một nút',
        body: 'Bấm "Bắt đầu hôm nay": Ôn → Học → Đọc → Nói, khoảng 10 phút. Không cần chọn làm gì.',
        detail: 'Học thẻ: đọc câu, đoán nghĩa. Bấm "Đã nhớ" thì trả lời đúng một câu hỏi nhanh mới được tính.',
    },
    {
        icon: Trophy,
        iconColor: 'text-warning',
        iconBg: 'bg-warning/15 border-warning/30',
        title: 'Lộ trình 30 ngày',
        body: 'Mốc ngày 7, 14, 21 cho bạn thấy mình đi được bao xa. Ngày 30 có bài kiểm tra 30 từ và thẻ kết quả để chia sẻ.',
        detail: 'Bỏ một ngày thì lộ trình dời theo, không mất gì. Album, hũ điểm và Buddy là phần thưởng sau khi học.',
    },
];

const PERSONA_OPTIONS: Array<{
    type: UserArchetype;
    icon: typeof User;
    label: string;
    description: string;
    color: string;
    bgColor: string;
}> = [
        {
            type: 'casual',
            icon: User,
            label: 'Người học thường',
            description: 'Tình huống hàng ngày, giao tiếp đời sống',
            color: 'text-accent',
            bgColor: 'border-accent/40 bg-accent/10 hover:bg-accent-strong/20',
        },
        {
            type: 'tech',
            icon: Laptop,
            label: 'Lập trình viên / Tech',
            description: 'Ngữ cảnh công nghệ, startup, lập trình',
            color: 'text-accent',
            bgColor: 'border-accent/40 bg-accent/10 hover:bg-accent-strong/20',
        },
        {
            type: 'business',
            icon: Briefcase,
            label: 'Doanh nghiệp / Chuyên nghiệp',
            description: 'Môi trường công sở, kinh doanh, thương mại',
            color: 'text-warning',
            bgColor: 'border-warning/40 bg-warning/10 hover:bg-warning/20',
        },
        {
            type: 'student',
            icon: GraduationCap,
            label: 'Học sinh / Sinh viên',
            description: 'Trường học, kỳ thi, học thuật',
            color: 'text-accent',
            bgColor: 'border-accent/40 bg-accent/10 hover:bg-accent-strong/20',
        },
    ];

export default function OnboardingModal({ onComplete, firstTime = false }: OnboardingModalProps) {
    const steps = STEPS.filter(st => firstTime || !('isBranchSelection' in st));
    const [step, setStep] = useState(0);
    const [branch, setBranch] = useState<Branch | null>(() => readBranchPick());
    const [direction, setDirection] = useState(1);
    const [selectedPersona, setSelectedPersona] = useState<UserArchetype | null>(null);
    const { click } = useSoundEffects();
    const setUserArchetype = useLexicaStore(state => state.setUserArchetype);

    const currentStep = steps[step];
    const Icon = currentStep.icon;
    const isLast = step === steps.length - 1;
    const isPersonaStep = 'isPersonaSelection' in currentStep && currentStep.isPersonaSelection;
    const isBranchStep = 'isBranchSelection' in currentStep && currentStep.isBranchSelection;

    const goNext = () => {
        // If on persona selection step, save the selection before proceeding
        if (isPersonaStep && selectedPersona) {
            setUserArchetype(selectedPersona);
        }
        if (isBranchStep && branch) writeBranchPick(branch);

        if (isLast) { onComplete(); return; }
        setDirection(1);
        setStep(s => s + 1);
    };

    const goPrev = () => {
        setDirection(-1);
        setStep(s => s - 1);
    };

    return (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="relative w-full max-w-md bg-surface border border-line rounded-t-3xl sm:rounded-2xl p-6 pb-8 mx-0 sm:mx-4 overflow-hidden"
            >
                {/* Skip button */}
                <button
                    onClick={() => {
                        click();
                        onComplete();
                    }}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-surface-2 transition-colors text-muted hover:text-ink"
                    aria-label="Bỏ qua"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Step indicator */}
                <div className="flex items-center gap-1.5 mb-6">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'bg-accent w-6' : i < step ? 'bg-accent w-3' : 'bg-surface-3 w-3'}`}
                        />
                    ))}
                </div>

                {/* Content — slides in */}
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        initial={{ x: direction * 60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction * -60, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 min-h-48"
                    >
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${currentStep.iconBg}`}>
                            <Icon className={`w-7 h-7 ${currentStep.iconColor}`} />
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-ink">{currentStep.title}</h2>

                        {/* Body */}
                        <p className="text-ink-2 text-sm leading-relaxed">{currentStep.body}</p>

                        {/* Branch: Chứng chỉ or Giao tiếp (docs/LEXICA_DIRECTION.md) */}
                        {isBranchStep && (
                            <div className="space-y-2.5 mt-4">
                                {(['cert', 'talk'] as const).map(b => (
                                    <button
                                        key={b}
                                        data-testid={`branch-${b}`}
                                        onClick={() => {
                                            click();
                                            setBranch(b);
                                        }}
                                        aria-pressed={branch === b}
                                        className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${branch === b ? 'border-accent bg-accent/10' : 'border-line-strong bg-surface-2/30 hover:bg-surface-2/50'}`}
                                    >
                                        <p className="font-semibold text-sm text-ink flex items-center gap-2">
                                            {b === 'cert' ? <GraduationCap className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                                            {BRANCH_LABEL[b]}
                                        </p>
                                        <p className="text-xs mt-0.5 text-muted">{BRANCH_HINT[b]}</p>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Persona Selection (step 2) */}
                        {isPersonaStep && (
                            <div className="space-y-2.5 mt-4">
                                {PERSONA_OPTIONS.map((persona) => {
                                    const PersonaIcon = persona.icon;
                                    const isSelected = selectedPersona === persona.type;
                                    return (
                                        <button
                                            key={persona.type}
                                            onClick={() => {
                                                click();
                                                setSelectedPersona(persona.type);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${isSelected ? persona.bgColor + ' ring-2 ring-offset-2 ring-offset-slate-800' : 'border-line-strong bg-surface-2/30 hover:bg-surface-2/50'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg ${isSelected ? persona.bgColor : 'bg-surface-3/50'} flex items-center justify-center shrink-0`}>
                                                <PersonaIcon className={`w-5 h-5 ${isSelected ? persona.color : 'text-muted'}`} />
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className={`font-semibold text-sm ${isSelected ? 'text-ink' : 'text-ink'}`}>{persona.label}</p>
                                                <p className={`text-xs mt-0.5 ${isSelected ? persona.color : 'text-muted'}`}>{persona.description}</p>
                                            </div>
                                            {isSelected && (
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${persona.color}`}>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Swipe cards (step 3 only) */}
                        {'cards' in currentStep && currentStep.cards && (
                            <div className="space-y-2 mt-2">
                                {currentStep.cards.map(c => (
                                    <div key={c.label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${c.color}`}>
                                        <span className="text-xl font-bold w-5 flex items-center justify-center shrink-0">{c.icon}</span>
                                        <div>
                                            <p className="font-semibold text-sm">{c.label}</p>
                                            <p className="text-xs opacity-75 mt-0.5">{c.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Detail */}
                        {currentStep.detail && (
                            <p className="text-xs text-muted bg-surface-2/50 rounded-lg px-3 py-2.5 leading-relaxed border border-line">
                                {currentStep.detail}
                            </p>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6 gap-3">
                    <button
                        onClick={() => {
                            click();
                            goPrev();
                        }}
                        disabled={step === 0}
                        className="p-2.5 rounded-xl border border-line-strong text-muted hover:border-line-strong hover:text-ink transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => {
                            click();
                            goNext();
                        }}
                        disabled={(isPersonaStep && !selectedPersona) || (isBranchStep && !branch)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent hover:bg-accent-strong text-on-accent font-bold text-sm transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-accent-strong"
                    >
                        {isLast ? (firstTime ? 'Làm bài test level' : 'Đã hiểu') : 'Tiếp theo'}
                        {!isLast && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
