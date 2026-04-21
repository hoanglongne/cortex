"use client";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    message?: string;
}

export default function LoadingSpinner({ size = "md", message }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: { spinner: "w-8 h-8 border-2", text: "text-sm" },
        md: { spinner: "w-12 h-12 border-3", text: "text-base" },
        lg: { spinner: "w-16 h-16 border-4", text: "text-lg" },
    };

    const current = sizeClasses[size];

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Simple rotating ring */}
            <div className="relative">
                {/* Outer ring with gradient */}
                <div
                    className={`${current.spinner} rounded-full border-zinc-800 border-t-[#80c0f4] border-r-[#add5f5] animate-spin`}
                    style={{ animationDuration: "0.8s" }}
                />
                {/* Inner subtle pulse */}
                <div
                    className="absolute inset-0 rounded-full bg-[#80c0f4]/5 animate-pulse"
                    style={{ animationDuration: "2s" }}
                />
            </div>

            {/* Message */}
            {message && (
                <p className={`${current.text} text-zinc-400 font-medium`}>
                    {message}
                </p>
            )}
        </div>
    );
}
