import { moduleFor } from '../../modules';

/** The app's colour dot and name, where a class uses several apps. */
export default function AppDot({ app, show = true }: { app: string; show?: boolean }) {
    const m = moduleFor(app);
    if (!show) return null;
    return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
            <span className={`h-2 w-2 rounded-full ${m?.dot ?? 'bg-subtle'}`} />
            {m?.core.name ?? app}
        </span>
    );
}
