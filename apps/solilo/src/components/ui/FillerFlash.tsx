interface FillerFlashProps {
    active: boolean;
}

export function FillerFlash({ active }: FillerFlashProps) {
    if (!active) return null;

    return (
        <div
            className="filler-flash pointer-events-none fixed inset-0 z-50 bg-accent/20"
            aria-hidden="true"
        />
    );
}
