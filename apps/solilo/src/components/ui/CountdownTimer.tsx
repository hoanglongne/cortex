interface CountdownTimerProps {
    remaining: number;
    /** Total seconds (for ring progress) */
    total: number;
    /** Optional label like "PREP" or "REC" */
    label?: string;
}

export function CountdownTimer({ remaining, total, label }: CountdownTimerProps) {
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const isUrgent = remaining <= 10;

    // Circular ring math
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const progress = total > 0 ? remaining / total : 0;
    const dashOffset = circumference * (1 - progress);

    return (
        <div className="relative flex flex-col items-center justify-center">
            {/* SVG ring */}
            <svg width="180" height="180" viewBox="0 0 180 180" className="countdown-ring">
                <circle
                    cx="90" cy="90" r={radius}
                    className="countdown-ring-track"
                />
                <circle
                    cx="90" cy="90" r={radius}
                    className={`countdown-ring-progress ${isUrgent ? 'urgent' : ''}`}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                />
            </svg>

            {/* Text overlay (centered) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                {label && (
                    <span className={`text-xs font-mono tracking-[0.3em] uppercase ${isUrgent ? 'text-accent' : 'text-muted'}`}>
                        {label}
                    </span>
                )}
                <span
                    className={`font-mono text-4xl tabular-nums tracking-tight transition-colors duration-300 ${isUrgent ? 'text-accent' : 'text-gray-800 dark:text-gray-100'
                        }`}
                >
                    {display}
                </span>
            </div>

            {/* Urgent glow ring */}
            {isUrgent && (
                <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                    boxShadow: '0 0 40px rgba(var(--color-accent-rgb), 0.4), 0 0 80px rgba(var(--color-accent-rgb), 0.2)',
                    animation: 'subtle-pulse 2s ease-in-out infinite'
                }} />
            )}
        </div>
    );
}
