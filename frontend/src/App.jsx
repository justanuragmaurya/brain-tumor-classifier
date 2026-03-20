import { useState } from "react";
import axios from "axios";
import { API_URL } from "./config";
import UploadZone from "./components/UploadZone";
import ResultsPanel from "./components/ResultsPanel";

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClassify = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(
        `${API_URL}/predict`,
        formData
      );
      setResult(response.data);
    } catch {
      setError("Prediction failed. Is the Flask server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[560px] animate-fade-up">
        <header className="mb-8">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-2 h-2 bg-xray-cyan" />
            <h1 className="text-lg font-semibold tracking-tight text-white uppercase">
              Brain Tumor MRI Classifier
            </h1>
          </div>
          <p className="text-xray-text-dim text-sm pl-[18px]">
            Upload an MRI image to identify tumor type
          </p>
        </header>

        <div className="border border-xray-border bg-xray-surface p-6">
          {error && (
            <div className="mb-5 p-3 border border-xray-red/30 bg-xray-red/5 text-xray-red text-sm font-mono animate-fade-up">
              {error}
            </div>
          )}

          {result ? (
            <ResultsPanel result={result} onReset={handleReset} />
          ) : (
            <UploadZone
              file={file}
              onFileSelect={setFile}
              loading={loading}
              onClassify={handleClassify}
            />
          )}
        </div>

        <footer className="mt-4 flex items-center justify-between text-[11px] text-xray-text-dim font-mono uppercase tracking-wider px-1">
          <span>PyTorch CNN</span>
          <span>4-class classification</span>
        </footer>
      </div>
    </div>
  );
}
