import { UploadCloud, FileText, X } from 'lucide-react';
import type { StepProps } from '../wizardConfig';

export default function Step9_Upload({ formData, setFormData }: StepProps) {
  
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).slice(0, 3 - formData.files.length);
      setFormData(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-text-primary dark:text-white">Evidence Upload</h3>
        <p className="text-sm text-text-secondary dark:text-slate-400">Attach the fully executed agreement.</p>
      </div>

      <div 
        onDragOver={e => e.preventDefault()}
        onDrop={handleFileDrop}
        className="group border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl h-64 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 hover:border-brand dark:hover:border-blue-400 hover:bg-brand/5 dark:hover:bg-blue-400/5 transition-all cursor-pointer relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand/0 to-brand/5 dark:to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="p-4 bg-white dark:bg-black/20 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
            <UploadCloud className="w-8 h-8 text-brand dark:text-blue-400" />
          </div>
          <p className="text-sm font-bold text-text-primary dark:text-white uppercase tracking-wider">Drag Contract PDF</p>
          <p className="text-xs text-text-secondary dark:text-slate-500 mt-1">or click to browse</p>
        </div>
      </div>

      {formData.files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500 mb-2">
            Staged Files ({formData.files.length}/3)
          </h4>
          {formData.files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-lg">
              <div className="p-2 bg-brand/10 dark:bg-blue-400/10 rounded text-brand dark:text-blue-400">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-text-primary dark:text-white truncate flex-1">{f.name}</span>
              <button onClick={() => setFormData(prev => ({ ...prev, files: prev.files.filter((_, idx) => idx !== i) }))} className="text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}