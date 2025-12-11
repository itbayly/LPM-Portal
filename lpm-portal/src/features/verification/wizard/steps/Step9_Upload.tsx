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
    <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4 duration-300">
      <div 
        onDragOver={e => e.preventDefault()}
        onDrop={handleFileDrop}
        className="border-2 border-dashed border-slate-300 rounded-lg h-64 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
        <p className="text-lg font-medium text-text-primary">Drag & Drop Contract PDF</p>
        <p className="text-sm text-text-secondary">or click to browse (Max 3 files)</p>
      </div>

      {formData.files.length > 0 && (
        <div className="space-y-2 text-left">
          <h4 className="text-xs font-bold uppercase text-text-secondary">Attached Files:</h4>
          {formData.files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-white border border-border rounded-md">
              <FileText className="w-4 h-4 text-brand" />
              <span className="text-sm truncate flex-1">{f.name}</span>
              <button onClick={() => setFormData(prev => ({ ...prev, files: prev.files.filter((_, idx) => idx !== i) }))}>
                <X className="w-4 h-4 text-slate-400 hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}