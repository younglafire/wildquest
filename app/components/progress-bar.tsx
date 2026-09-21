type ProgressBarProps = {
  value: number;
  label: string;
};

export function ProgressBar({ value, label }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold" style={{ color: "#f0e8d4" }}>
          {label}
        </span>
        <span
          className="tabular-nums"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#8a7a62",
            fontSize: "0.7rem",
          }}
        >
          {percentage}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        className="h-2 overflow-hidden rounded-full"
        style={{ background: "rgba(58,46,30,0.8)" }}
      >
        <div
          className="h-full rounded-full transition-[width] motion-reduce:transition-none"
          style={{
            width: `${percentage}%`,
            background: "linear-gradient(90deg, #a07d48, #c8a96e, #e0c58a)",
            boxShadow: "0 0 8px rgba(200,169,110,0.45)",
          }}
        />
      </div>
    </div>
  );
}
