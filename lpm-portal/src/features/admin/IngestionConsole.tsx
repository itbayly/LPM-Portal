import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Check, AlertTriangle, X, Download, Loader2, Users, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { downloadTemplate, parsePropertyFile, parseUserFile } from '../../lib/excelParser';
import { useProperties } from '../../hooks/useProperties';
import type { Property, UserProfile } from '../../dataModel';

interface IngestionConsoleProps {
  onClose: () => void;
}

type ImportMode = 'property' | 'user';

export default function IngestionConsole({ onClose }: IngestionConsoleProps) {
  const { ingestProperties, ingestUsers } = useProperties();
  const [mode, setMode] = useState<ImportMode>('property');
  
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  // Staging Data
  const [parsedProps, setParsedProps] = useState<Property[]>([]);
  const [parsedUsers, setParsedUsers] = useState<UserProfile[]>([]);
  
  const [status, setStatus] = useState<'idle' | 'parsing' | 'ready' | 'uploading' | 'complete'>('idle');
  const [error, setError] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const processFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setStatus('parsing');
    setError('');
    
    try {
      if (mode === 'property') {
        const { properties, derivedUsers } = await parsePropertyFile(uploadedFile);
        // Cast to Property for compatibility
        setParsedProps(properties as unknown as Property[]);
        setParsedUsers(derivedUsers);
      } else {
        const users = await parseUserFile(uploadedFile);
        setParsedUsers(users);
      }
      setStatus('ready');
    } catch (err) {
      console.error(err);
      setError('Failed to parse file. Please ensure it matches the template.');
      setStatus('idle');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    setStatus('uploading');
    if (mode === 'property') {
      // Cast back to Property if needed by the hook, or update hook types. 
      // For now we assume ingestProperties handles the data object.
      await ingestProperties(parsedProps, parsedUsers);
    } else {
      await ingestUsers(parsedUsers);
    }
    setStatus('complete');
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setParsedProps([]);
    setParsedUsers([]);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 dark:bg-[#0A0A0C]/90 backdrop-blur-xl w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-white/[0.02]">
          <div>
            <h2 className="text-sm font-bold font-mono text-text-primary dark:text-white uppercase tracking-widest flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-brand dark:text-blue-400" />
              Data Ingestion Protocol
            </h2>
            <p className="text-xs text-text-secondary dark:text-slate-400 mt-1">
              Select payload type and upload source file.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-text-secondary dark:text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        {status !== 'complete' && (
          <div className="flex border-b border-black/5 dark:border-white/5">
            <button 
              onClick={() => { setMode('property'); reset(); }}
              className={cn(
                "flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all", 
                mode === 'property' 
                  ? "bg-black/5 dark:bg-white/5 text-brand dark:text-blue-400 shadow-inner" 
                  : "text-text-secondary dark:text-slate-500 hover:text-text-primary dark:hover:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <Building2 className="w-4 h-4" /> Property Assets
            </button>
            <div className="w-[1px] bg-black/5 dark:bg-white/5" />
            <button 
              onClick={() => { setMode('user'); reset(); }}
              className={cn(
                "flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all", 
                mode === 'user' 
                  ? "bg-black/5 dark:bg-white/5 text-brand dark:text-blue-400 shadow-inner" 
                  : "text-text-secondary dark:text-slate-500 hover:text-text-primary dark:hover:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <Users className="w-4 h-4" /> User Roster
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-8 flex-1 overflow-y-auto">
          {status === 'complete' ? (
            <div className="text-center py-10 space-y-6 animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary dark:text-white mb-2">Ingestion Successful</h3>
                <p className="text-sm text-text-secondary dark:text-slate-400 max-w-sm mx-auto">
                  {mode === 'property' 
                    ? `Mapped ${parsedProps.length} properties and updated ${parsedUsers.length} user accounts.`
                    : `Updated the access roster with ${parsedUsers.length} users.`}
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="px-8 py-3 bg-brand hover:bg-brand-dark text-white font-bold uppercase tracking-widest text-xs rounded-lg shadow-lg shadow-brand/25 transition-all hover:scale-105"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Template Download */}
              <div className="flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-brand dark:text-blue-400">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-200">System Template Required</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">Data must match the schema.</p>
                  </div>
                </div>
                <button 
                  onClick={() => downloadTemplate(mode)}
                  className="px-4 py-2 bg-white dark:bg-white/10 border border-blue-200 dark:border-white/10 text-blue-700 dark:text-blue-200 text-xs font-bold uppercase tracking-wide rounded-lg hover:bg-blue-50 dark:hover:bg-white/20 flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download CSV
                </button>
              </div>

              {/* Drag Zone */}
              <div 
                className={cn(
                  "border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer relative overflow-hidden group",
                  dragActive 
                    ? "border-brand bg-brand/5 dark:border-blue-400 dark:bg-blue-400/10" 
                    : "border-black/10 dark:border-white/10 hover:border-brand/50 dark:hover:border-blue-400/50 hover:bg-black/5 dark:hover:bg-white/5",
                  file ? "bg-black/5 dark:bg-white/5 border-solid" : ""
                )}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              >
                <input 
                  type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  onChange={handleFileSelect} accept=".csv, .xlsx, .xls"
                  disabled={status === 'parsing' || status === 'uploading'}
                />

                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand/0 to-brand/5 dark:to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                  {status === 'parsing' ? (
                    <>
                      <Loader2 className="w-10 h-10 text-brand dark:text-blue-400 animate-spin mb-4" />
                      <p className="text-sm font-bold text-text-primary dark:text-white uppercase tracking-wider">Analyzing Schema...</p>
                    </>
                  ) : file ? (
                    <>
                      <FileSpreadsheet className="w-12 h-12 text-green-500 mb-4 drop-shadow-lg" />
                      <p className="text-lg font-bold text-text-primary dark:text-white mb-1">{file.name}</p>
                      <p className="text-xs text-text-secondary dark:text-slate-400 font-mono uppercase tracking-wider">
                        {status === 'ready' 
                          ? (mode === 'property' ? `Ready: ${parsedProps.length} Assets found` : `Ready: ${parsedUsers.length} Users found`)
                          : 'Processing...'}
                      </p>
                      <button onClick={(e) => { e.preventDefault(); reset(); }} className="mt-6 text-xs text-red-500 hover:text-red-400 font-bold uppercase tracking-widest hover:underline relative z-30">
                        Remove File
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-white dark:bg-white/5 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                        <UploadCloud className="w-8 h-8 text-brand dark:text-blue-400" />
                      </div>
                      <p className="text-sm font-bold text-text-primary dark:text-white uppercase tracking-wider">Drop File Here</p>
                      <p className="text-xs text-text-secondary dark:text-slate-500 mt-2 font-mono">.CSV or .XLSX</p>
                    </>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex gap-3 p-4 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg text-red-600 dark:text-red-400 text-sm items-center">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {status !== 'complete' && (
          <div className="p-6 border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] flex justify-end gap-3">
            <button 
              onClick={onClose} 
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              disabled={status !== 'ready'}
              onClick={handleUpload}
              className={cn(
                "px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95",
                status === 'ready' 
                  ? "bg-brand hover:bg-brand-dark text-white shadow-brand/25" 
                  : "bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
              )}
            >
              {status === 'uploading' ? <><Loader2 className="w-4 h-4 animate-spin" /> Ingesting...</> : 'Initiate Sequence'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}