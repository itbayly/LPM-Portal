import { useState } from 'react';
import { 
  X, UploadCloud, Keyboard, FileText, Calendar, DollarSign, 
  CheckCircle2, Loader2, Sparkles, AlertTriangle
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface UIContract {
  id: string;
  category: string;
  vendor: string;
  status: string;
  cost: number;
  startDate: string;
  endDate: string;
}

interface AddContractModalProps {
  category: string;
  onClose: () => void;
  onSave: (contract: UIContract) => void;
}

// --- MOCK AI RESPONSE ---
const MOCK_AI_DATA = {
  vendor: 'Apex Technical Services',
  cost: '2450.00',
  startDate: '2024-01-15',
  endDate: '2027-01-15'
};

export default function AddContractModal({ category, onClose, onSave }: AddContractModalProps) {
  // Modes: selection -> manual OR upload -> scanning -> review
  const [mode, setMode] = useState<'selection' | 'manual' | 'upload' | 'scanning' | 'review'>('selection');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    vendor: '',
    cost: '',
    startDate: '',
    endDate: ''
  });

  // Confidence State (for the Review Mode)
  // true = High Confidence (Green), false = Low Confidence (Yellow)
  const [confidence] = useState({
    vendor: true,
    cost: true,
    startDate: false, // Simulate a "unsure" date
    endDate: true
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    finalizeContract();
  };

  const finalizeContract = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newContract: UIContract = {
        id: `cnt_${Date.now()}`,
        category: category,
        vendor: formData.vendor,
        status: 'active_contract',
        cost: Number(formData.cost),
        startDate: formData.startDate,
        endDate: formData.endDate
      };
      onSave(newContract);
      setIsSubmitting(false);
    }, 800);
  };

  // --- FILE HANDLING ---
  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setMode('scanning');

    // Simulate AI Processing Time
    setTimeout(() => {
      // Pre-fill form with Mock Data
      setFormData(MOCK_AI_DATA);
      setMode('review');
    }, 2500);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 dark:bg-[#0A0A0C]/95 backdrop-blur-xl w-full max-w-lg rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 ring-1 ring-black/5 dark:ring-white/5">
        
        {/* Header */}
        <div className="p-6 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] flex justify-between items-center relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
          <div>
            <h2 className="text-sm font-bold font-mono text-text-primary dark:text-white uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand dark:text-blue-400" />
              Add Contract: {category}
            </h2>
            <p className="text-xs text-text-secondary dark:text-slate-400 mt-1">Ingest new service agreement.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- VIEW 1: SELECTION SCREEN --- */}
        {mode === 'selection' && (
          <div className="p-8 grid grid-cols-2 gap-4">
            <button 
              onClick={() => setMode('upload')}
              className="group relative p-6 rounded-xl border border-black/10 dark:border-white/10 hover:border-brand dark:hover:border-blue-400 bg-black/5 dark:bg-white/5 hover:bg-brand/5 dark:hover:bg-blue-400/5 transition-all flex flex-col items-center justify-center text-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6 text-brand dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary dark:text-white mb-1">AI Extraction</h3>
                <p className="text-xs text-text-secondary dark:text-slate-400">Upload PDF. Let Gemini auto-fill the data.</p>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand dark:text-blue-400 bg-brand/10 dark:bg-blue-400/10 px-2 py-0.5 rounded">Recommended</span>
            </button>

            <button 
              onClick={() => setMode('manual')}
              className="group relative p-6 rounded-xl border border-black/10 dark:border-white/10 hover:border-slate-400 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all flex flex-col items-center justify-center text-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Keyboard className="w-6 h-6 text-text-secondary dark:text-slate-400" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary dark:text-white mb-1">Manual Entry</h3>
                <p className="text-xs text-text-secondary dark:text-slate-400">Type in the details yourself.</p>
              </div>
            </button>
          </div>
        )}

        {/* --- VIEW 2: MANUAL FORM --- */}
        {mode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="p-6 space-y-5 animate-in slide-in-from-right-8">
            <InputSlot 
              label="Vendor Name" 
              value={formData.vendor} 
              onChange={(e: any) => setFormData({...formData, vendor: e.target.value})} 
              placeholder="e.g. Trane HVAC"
              autoFocus
            />
            <InputSlot 
              label="Monthly Cost" 
              icon={DollarSign}
              type="number"
              value={formData.cost} 
              onChange={(e: any) => setFormData({...formData, cost: e.target.value})} 
              placeholder="0.00"
            />
            <div className="grid grid-cols-2 gap-4">
              <InputSlot 
                label="Start Date" 
                icon={Calendar}
                type="date"
                value={formData.startDate} 
                onChange={(e: any) => setFormData({...formData, startDate: e.target.value})} 
              />
              <InputSlot 
                label="End Date" 
                icon={Calendar}
                type="date"
                value={formData.endDate} 
                onChange={(e: any) => setFormData({...formData, endDate: e.target.value})} 
              />
            </div>
            <div className="pt-4 flex justify-between">
              <button 
                type="button"
                onClick={() => setMode('selection')}
                className="text-xs font-bold text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-white uppercase tracking-wider"
              >
                Back
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-brand hover:bg-brand-dark text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-brand/20 flex items-center gap-2 transition-transform active:scale-95"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Save Contract <CheckCircle2 className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        )}

        {/* --- VIEW 3: UPLOAD ZONE --- */}
        {mode === 'upload' && (
          <div 
            className="p-10 text-center animate-in slide-in-from-right-8"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            <div className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl h-64 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 hover:border-brand dark:hover:border-blue-400 hover:bg-brand/5 dark:hover:bg-blue-400/5 transition-all cursor-pointer relative group overflow-hidden">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
              
              <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform z-10">
                <UploadCloud className="w-8 h-8 text-brand dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-text-primary dark:text-white mb-1 z-10">Drop Contract Here</h3>
              <p className="text-sm text-text-secondary dark:text-slate-400 z-10">PDF or Image</p>
            </div>
            <button 
              onClick={() => setMode('selection')}
              className="mt-6 text-xs font-bold text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-white uppercase tracking-wider"
            >
              Cancel
            </button>
          </div>
        )}

        {/* --- VIEW 4: SCANNING ANIMATION --- */}
        {mode === 'scanning' && (
          <div className="p-12 text-center flex flex-col items-center animate-in fade-in duration-500">
            <div className="relative w-24 h-24 mb-6">
              {/* Spinning Ring */}
              <div className="absolute inset-0 border-4 border-brand/20 dark:border-blue-400/20 rounded-full" />
              <div className="absolute inset-0 border-t-4 border-brand dark:border-blue-400 rounded-full animate-spin" />
              {/* Icon in Center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-brand dark:text-blue-400 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-text-primary dark:text-white mb-2 tracking-tight">
              Analyzing Document
            </h3>
            <p className="text-sm text-text-secondary dark:text-slate-400 font-mono animate-pulse">
              EXTRACTING DATA POINTS...
            </p>
          </div>
        )}

        {/* --- VIEW 5: CONFIDENCE UI (REVIEW) --- */}
        {mode === 'review' && (
          <form onSubmit={handleManualSubmit} className="p-6 space-y-5 animate-in slide-in-from-right-8">
            
            {/* FILE BADGE */}
            <div className="flex items-center gap-3 p-3 bg-brand/5 dark:bg-blue-500/10 border border-brand/20 dark:border-blue-500/20 rounded-lg mb-6">
              <div className="p-2 bg-white dark:bg-white/10 rounded text-brand dark:text-blue-400">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-text-primary dark:text-white truncate">
                  {uploadedFile?.name || "contract_scan.pdf"}
                </p>
                <p className="text-[10px] text-text-secondary dark:text-slate-400">Processed by Gemini Pro</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded">
                <CheckCircle2 className="w-3 h-3" />
                COMPLETE
              </div>
            </div>

            <InputSlot 
              label="Vendor Name" 
              value={formData.vendor} 
              onChange={(e: any) => setFormData({...formData, vendor: e.target.value})} 
              isAiFilled={true}
              isLowConfidence={!confidence.vendor}
            />

            <InputSlot 
              label="Monthly Cost" 
              icon={DollarSign}
              type="number"
              value={formData.cost} 
              onChange={(e: any) => setFormData({...formData, cost: e.target.value})} 
              isAiFilled={true}
              isLowConfidence={!confidence.cost}
            />

            <div className="grid grid-cols-2 gap-4">
              <InputSlot 
                label="Start Date" 
                icon={Calendar}
                type="date"
                value={formData.startDate} 
                onChange={(e: any) => setFormData({...formData, startDate: e.target.value})}
                isAiFilled={true}
                isLowConfidence={!confidence.startDate} // This one will be Yellow
              />
              <InputSlot 
                label="End Date" 
                icon={Calendar}
                type="date"
                value={formData.endDate} 
                onChange={(e: any) => setFormData({...formData, endDate: e.target.value})}
                isAiFilled={true}
                isLowConfidence={!confidence.endDate}
              />
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-black/5 dark:border-white/5 mt-6">
              <span className="text-[10px] text-text-secondary dark:text-slate-500 italic">
                * Please verify highlighted fields
              </span>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-brand hover:bg-brand-dark text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-brand/20 flex items-center gap-2 transition-transform active:scale-95"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Confirm & Save <CheckCircle2 className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

// --- HELPER COMPONENT (Moved Outside) ---
const InputSlot = ({ 
  label, value, onChange, placeholder, icon: Icon, type = "text", 
  isAiFilled = false, isLowConfidence = false 
}: any) => (
  <div className="group">
    <div className="flex justify-between items-end mb-1.5">
      <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary dark:text-slate-500 block">
        {label}
      </label>
      {isAiFilled && (
        <span className={cn(
          "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex items-center gap-1",
          isLowConfidence 
            ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" 
            : "bg-brand/10 text-brand dark:text-blue-400"
        )}>
          {isLowConfidence ? <AlertTriangle className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
          {isLowConfidence ? "Verify" : "Auto-Filled"}
        </span>
      )}
    </div>
    <div className={cn(
      "relative flex items-center border-b rounded-t-sm transition-colors focus-within:bg-black/10 dark:focus-within:bg-white/10",
      isLowConfidence ? "bg-yellow-500/5 border-yellow-500/50" : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
    )}>
      {Icon && <div className="pl-3 text-text-secondary dark:text-slate-500"><Icon className="w-3.5 h-3.5" /></div>}
      <input 
        type={type}
        className="w-full bg-transparent border-none outline-none text-sm font-medium text-text-primary dark:text-white px-3 py-2.5 placeholder:text-slate-400/50" 
        value={value} 
        onChange={onChange}
        placeholder={placeholder}
        required
      />
      <div className={cn(
        "absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-300 group-focus-within:w-full",
        isLowConfidence ? "bg-yellow-500" : "bg-brand dark:bg-blue-400"
      )} />
    </div>
  </div>
);