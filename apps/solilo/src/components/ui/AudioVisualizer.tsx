interface AudioVisualizerProps {
    canvasRef: (el: HTMLCanvasElement | null) => void;
}

export function AudioVisualizer({ canvasRef }: AudioVisualizerProps) {
    return (
        <div className="w-full max-w-4xl rounded-lg border border-accent/20 bg-background/50 p-1 glow-accent overflow-hidden">
            <canvas
                ref={canvasRef}
                width={900}
                height={120}
                className="w-full h-28 rounded"
            />
        </div>
    );
}
