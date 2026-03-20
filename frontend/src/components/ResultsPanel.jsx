import { useEffect, useState } from "react";

const CLASS_COLORS = {
  glioma: { color: "#ff3b3b", glow: "rgba(255,59,59,0.15)" },
  meningioma: { color: "#ff9f1c", glow: "rgba(255,159,28,0.15)" },
  notumor: { color: "#00e5a0", glow: "rgba(0,229,160,0.15)" },
  pituitary: { color: "#4a9eff", glow: "rgba(74,158,255,0.15)" },
};

export default function ResultsPanel({ result, onReset }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const predicted = CLASS_COLORS[result.predicted_class] || {
    color: "#6b7280",
    glow: "rgba(107,114,128,0.15)",
  };

  return (
    <div className="space-y-6 stagger">
      <div className="animate-fade-up text-center py-2">
        <div className="inline-flex items-center gap-3">
          <span
            className="px-4 py-1.5 text-sm font-bold uppercase tracking-wider border"
            style={{
              color: predicted.color,
              borderColor: predicted.color,
              backgroundColor: predicted.glow,
            }}
          >
            {result.predicted_class}
          </span>
          <span
            className="text-3xl font-bold tracking-tight animate-count"
            style={{ color: predicted.color }}
          >
            {(result.confidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="animate-fade-up">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-px bg-xray-border" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-xray-text-dim">
            Top 3 Predictions
          </span>
          <div className="flex-1 h-px bg-xray-border" />
        </div>

        <div className="space-y-3">
          {result.top3.map((item, i) => {
            const c = CLASS_COLORS[item.class] || {
              color: "#6b7280",
              glow: "rgba(107,114,128,0.15)",
            };
            const pct = (item.probability * 100).toFixed(1);
            return (
              <div
                key={item.class}
                className="animate-fade-up flex items-center gap-3"
                style={{ animationDelay: `${i * 100 + 200}ms` }}
              >
                <span className="w-24 text-xs font-mono text-xray-text-dim text-right uppercase tracking-wide">
                  {item.class}
                </span>
                <div className="flex-1 h-3 bg-xray-surface-2 overflow-hidden border border-xray-border">
                  <div
                    className="h-full bar-shimmer"
                    style={{
                      width: animate ? `${pct}%` : "0%",
                      backgroundImage: `linear-gradient(90deg, ${c.color}cc, ${c.color}, ${c.color}cc)`,
                      boxShadow: `0 0 12px ${c.glow}`,
                      transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  />
                </div>
                <span
                  className="w-14 text-sm font-mono font-semibold text-right"
                  style={{ color: c.color }}
                >
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onReset}
        className="animate-fade-up w-full py-3 px-4 text-sm font-semibold uppercase tracking-wider border border-xray-border-hi text-xray-text-dim bg-transparent hover:border-xray-cyan/40 hover:text-xray-cyan transition-all duration-200 active:scale-[0.98]"
      >
        New scan
      </button>
    </div>
  );
}
