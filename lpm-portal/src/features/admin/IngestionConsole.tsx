import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Check, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface IngestionConsoleProps {
  onClose: () => void;
}

export default function IngestionConsole({ onClose }: IngestionConsoleProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'complete'>('idle');

  // Drag Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSimulatedUpload = () => {
    setStatus('processing');
    setTimeout(() => {
      setStatus('complete');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-2xl rounded-lg shadow-lvl3 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-lg border-b border-border flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Bulk Data Ingestion</h2>
            <p className="text-sm text-text-secondary">Upload CSV to migrate legacy elevator records.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-text-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-2xl flex-1 overflow-y-auto">
          
          {status === 'complete' ? (
            <div className="text-center py-xl space-y-md animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-text-primary">Ingestion Complete</h3>
              <p className="text-text-secondary max-w-sm mx-auto">
                Successfully mapped <strong>1,240 rows</strong>. 45 rows were flagged for manual review.
              </p>
              <button 
                onClick={onClose}
                className="mt-lg px-6 py-2 bg-brand text-white font-medium rounded-sm shadow-sm hover:bg-brand-dark"
              >
                Return to Grid
              </button>
            </div>
          ) : (
            <div className="space-y-xl">
              {/* Drag Zone */}
              <div 
                className={cn(
                  "border-2 border-dashed rounded-lg h-64 flex flex-col items-center justify-center transition-colors cursor-pointer",
                  dragActive ? "border-brand bg-blue-50" : "border-slate-300 hover:bg-slate-50",
                  file ? "bg-slate-50 border-solid border-slate-300" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="text-center">
                    <FileSpreadsheet className="w-12 h-12 text-green-600 mx-auto mb-md" />
                    <p className="text-lg font-medium text-text-primary">{file.name}</p>
                    <p className="text-sm text-text-secondary">{(file.size / 1024).toFixed(0)} KB</p>
                    <button 
                      onClick={() => setFile(null)}
                      className="mt-md text-sm text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-center pointer-events-none">
                    <div className="p-4 bg-slate-100 rounded-full inline-block mb-md">
                      <UploadCloud className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-lg font-medium text-text-primary">Drag & drop CSV file</p>
                    <p className="text-sm text-text-secondary mt-1">or click to browse computer</p>
                  </div>
                )}
              </div>

              {/* Warnings */}
              <div className="flex gap-md p-md bg-yellow-50 border border-yellow-100 rounded-sm">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-bold mb-xs">Requirement Checklist:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Headers must match the standard LPM Schema v1.0</li>
                    <li>Dates must be formatted as ISO 8601 (YYYY-MM-DD)</li>
                    <li>Maximum file size: 25MB</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {status !== 'complete' && (
          <div className="p-lg border-t border-border bg-slate-50 flex justify-end gap-sm">
            <button onClick={onClose} className="px-4 py-2 text-text-secondary font-medium hover:text-text-primary">
              Cancel
            </button>
            <button 
              disabled={!file || status === 'processing'}
              onClick={handleSimulatedUpload}
              className={cn(
                "px-6 py-2 rounded-sm font-bold shadow-sm transition-colors",
                !file || status === 'processing'
                  ? "bg-slate-300 text-white cursor-not-allowed" 
                  : "bg-brand text-white hover:bg-brand-dark"
              )}
            >
              {status === 'processing' ? 'Mapping Data...' : 'Start Ingestion'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}