import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

const CLASS_META = {
  glioma: { label: "Glioma", color: "#ff3b3b" },
  meningioma: { label: "Meningioma", color: "#ff9f1c" },
  notumor: { label: "No Tumor", color: "#00e5a0" },
  pituitary: { label: "Pituitary", color: "#4a9eff" },
};

export default function SamplePicker({ onSampleSelect }) {
  const [samples, setSamples] = useState(null);
  const [loadingFile, setLoadingFile] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/samples`)
      .then((res) => {
        const hasAny = Object.values(res.data).some((arr) => arr.length > 0);
        setSamples(hasAny ? res.data : null);
      })
      .catch(() => setSamples(null));
  }, []);

  if (!samples) return null;

  const handlePick = async (className, filename) => {
    setLoadingFile(`${className}/${filename}`);
    try {
      const res = await axios.get(
        `${API_URL}/samples/${className}/${filename}`,
        { responseType: "blob" }
      );
      const file = new File([res.data], filename, { type: res.data.type });
      onSampleSelect(file);
    } catch {
      /* silently fail */
    } finally {
      setLoadingFile(null);
    }
  };

  return (
    <div className="sample-picker animate-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-px bg-xray-border" />
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-xray-text-dim">
          Or try a sample
        </span>
        <div className="flex-1 h-px bg-xray-border" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(CLASS_META).map(([cls, meta]) => {
          const files = samples[cls] || [];
          if (files.length === 0) return null;

          return (
            <div key={cls} className="space-y-2">
              <span
                className="block text-[10px] font-mono uppercase tracking-wider text-center"
                style={{ color: meta.color }}
              >
                {meta.label}
              </span>
              <div className="flex gap-1.5 justify-center">
                {files.map((fname) => {
                  const key = `${cls}/${fname}`;
                  const isLoading = loadingFile === key;
                  return (
                    <button
                      key={fname}
                      onClick={() => handlePick(cls, fname)}
                      disabled={!!loadingFile}
                      className="sample-thumb group relative overflow-hidden border border-xray-border hover:border-opacity-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-wait"
                      style={{
                        "--thumb-color": meta.color,
                      }}
                    >
                      {isLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-xray-bg/70">
                          <span className="spinner !w-3.5 !h-3.5" />
                        </div>
                      )}
                      <img
                        src={`${API_URL}/samples/${cls}/${fname}`}
                        alt={`${meta.label} sample`}
                        className="w-full h-full object-cover grayscale brightness-125 contrast-110 group-hover:grayscale-0 transition-all duration-300"
                        loading="lazy"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
