import { useRef, useState, useCallback } from "react";

export default function UploadZone({ onFileSelect, file, loading, onClassify }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileSelect(e.dataTransfer.files[0]);
      }
    },
    [onFileSelect]
  );

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4 stagger">
      <div
        onClick={() => inputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`upload-zone relative overflow-hidden border border-dashed p-10 text-center cursor-pointer transition-all duration-300 ${
          dragActive
            ? "border-xray-cyan bg-xray-cyan/5"
            : "border-xray-border-hi hover:border-xray-cyan/40 bg-xray-surface-2"
        }`}
      >
        <div className="scanline absolute left-0 w-full h-px bg-linear-to-r from-transparent via-xray-cyan to-transparent opacity-0 pointer-events-none" />

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        <div className="text-xray-text-dim mb-3 transition-colors duration-300 group-hover:text-xray-cyan">
          <svg
            className="mx-auto h-10 w-10"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>
        <p className="text-sm text-xray-text">
          Drop MRI scan here or{" "}
          <span className="text-xray-cyan underline underline-offset-2 decoration-xray-cyan/40 hover:decoration-xray-cyan transition-colors">
            browse files
          </span>
        </p>
        <p className="text-xray-text-dim text-xs mt-1.5 font-mono">
          PNG / JPG / JPEG
        </p>
      </div>

      {file && (
        <div className="flex items-center gap-4 p-3 border border-xray-border bg-xray-surface-2 animate-fade-up">
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="h-14 w-14 object-cover border border-xray-border grayscale brightness-125 contrast-110"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-xray-text truncate">
              {file.name}
            </p>
            <p className="text-xs text-xray-text-dim font-mono">
              {formatSize(file.size)}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={onClassify}
        disabled={!file || loading}
        className="btn-glow w-full py-3 px-4 font-semibold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-30 disabled:cursor-not-allowed bg-xray-cyan text-xray-bg hover:bg-xray-cyan/90 active:scale-[0.98]"
      >
        {loading ? (
          <>
            <span className="spinner" />
            <span className="text-xray-cyan">Analyzing…</span>
          </>
        ) : (
          "Classify"
        )}
      </button>
    </div>
  );
}
