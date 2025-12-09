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
        setParsedProps(properties);
        setParsedUsers(derivedUsers); // These are PMs automatically found in the sheet
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-2xl rounded-lg shadow-lvl3 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-lg border-b border-border flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Data Ingestion Console</h2>
            <p className="text-sm text-text-secondary">Upload data to update the National Grid.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-text-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        {status !== 'complete' && (
          <div className="flex border-b border-border">
            <button 
              onClick={() => { setMode('property'); reset(); }}
              className={cn("flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors", 
                mode === 'property' ? "border-brand text-brand bg-blue-50/50" : "border-transparent text-text-secondary hover:bg-slate-50")}
            >
              <Building2 className="w-4 h-4" /> Properties
            </button>
            <button 
              onClick={() => { setMode('user'); reset(); }}
              className={cn("flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors", 
                mode === 'user' ? "border-brand text-brand bg-blue-50/50" : "border-transparent text-text-secondary hover:bg-slate-50")}
            >
              <Users className="w-4 h-4" /> Users / Roster
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-2xl flex-1 overflow-y-auto">
          {status === 'complete' ? (
            <div className="text-center py-xl space-y-md animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-text-primary">Ingestion Complete</h3>
              <p className="text-text-secondary max-w-sm mx-auto">
                {mode === 'property' 
                  ? `Successfully mapped ${parsedProps.length} properties and updated ${parsedUsers.length} user accounts.`
                  : `Successfully updated the access roster with ${parsedUsers.length} users.`}
              </p>
              <button onClick={onClose} className="mt-lg px-6 py-2 bg-brand text-white font-medium rounded-sm shadow-sm hover:bg-brand-dark">
                Return to Grid
              </button>
            </div>
          ) : (
            <div className="space-y-xl">
              
              {/* Template Download */}
              <div className="flex justify-between items-center bg-blue-50 p-4 rounded-md border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full text-brand shadow-sm">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900">Need the {mode === 'property' ? 'Property' : 'User'} template?</p>
                    <p className="text-xs text-blue-700">Ensure your CSV/Excel matches the system schema.</p>
                  </div>
                </div>
                <button 
                  onClick={() => downloadTemplate(mode)}
                  className="px-3 py-1.5 bg-white text-blue-700 text-xs font-bold border border-blue-200 rounded-sm hover:bg-blue-50 flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Download Template
                </button>
              </div>

              {/* Drag Zone */}
              <div 
                className={cn(
                  "border-2 border-dashed rounded-lg h-64 flex flex-col items-center justify-center transition-colors cursor-pointer relative",
                  dragActive ? "border-brand bg-blue-50" : "border-slate-300 hover:bg-slate-50",
                  file ? "bg-slate-50 border-solid border-slate-300" : ""
                )}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              >
                <input 
                  type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileSelect} accept=".csv, .xlsx, .xls"
                  disabled={status === 'parsing' || status === 'uploading'}
                />

                {status === 'parsing' ? (
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 text-brand animate-spin mx-auto mb-4" />
                    <p className="text-sm font-medium text-text-primary">Analyzing File...</p>
                  </div>
                ) : file ? (
                  <div className="text-center">
                    <FileSpreadsheet className="w-12 h-12 text-green-600 mx-auto mb-md" />
                    <p className="text-lg font-medium text-text-primary">{file.name}</p>
                    <p className="text-sm text-text-secondary">
                      {status === 'ready' 
                        ? (mode === 'property' ? `Ready to import ${parsedProps.length} properties (+${parsedUsers.length} users)` : `Ready to update ${parsedUsers.length} users`)
                        : 'Processing...'}
                    </p>
                    <button onClick={(e) => { e.preventDefault(); reset(); }} className="mt-md text-sm text-red-500 hover:underline z-20 relative">Remove</button>
                  </div>
                ) : (
                  <div className="text-center pointer-events-none">
                    <div className="p-4 bg-slate-100 rounded-full inline-block mb-md">
                      <UploadCloud className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-lg font-medium text-text-primary">Drag & drop {mode} list</p>
                    <p className="text-xs text-text-secondary mt-1">Supports .XLSX and .CSV</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex gap-2 p-3 bg-red-50 border border-red-100 rounded-sm text-red-700 text-sm items-center">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {status !== 'complete' && (
          <div className="p-lg border-t border-border bg-slate-50 flex justify-end gap-sm">
            <button onClick={onClose} className="px-4 py-2 text-text-secondary font-medium hover:text-text-primary">Cancel</button>
            <button 
              disabled={status !== 'ready'}
              onClick={handleUpload}
              className={cn("px-6 py-2 rounded-sm font-bold shadow-sm transition-colors flex items-center gap-2",
                status === 'ready' ? "bg-brand text-white hover:bg-brand-dark" : "bg-slate-300 text-white cursor-not-allowed"
              )}
            >
              {status === 'uploading' ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : 'Start Ingestion'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}