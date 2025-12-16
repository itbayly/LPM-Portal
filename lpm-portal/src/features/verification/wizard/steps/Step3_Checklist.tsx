import { Mail, Check, Copy } from 'lucide-react'; // REMOVED CheckSquare, Square
import { CHECKLIST_ITEMS } from '../wizardConfig';
import type { StepProps } from '../wizardConfig';
import { cn } from '../../../../lib/utils';

interface Step3Props extends StepProps {
  showEmailScreen: boolean;
  checkedItems: string[];
  setCheckedItems: (items: string[]) => void;
  handleCopyEmail: () => void;
  handleSavePartial: () => void;
  emailCopied: boolean;
}

export default function Step3_Checklist({ 
  showEmailScreen, 
  checkedItems, 
  setCheckedItems, 
  handleCopyEmail, 
  handleSavePartial,
  emailCopied 
}: Step3Props) {

  const handleSelectAll = () => {
    setCheckedItems(CHECKLIST_ITEMS);
  };

  const toggleItem = (item: string) => {
    if (checkedItems.includes(item)) {
      setCheckedItems(checkedItems.filter(i => i !== item));
    } else {
      setCheckedItems([...checkedItems, item]);
    }
  };

  if (showEmailScreen) {
    return (
      <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <h4 className="font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-2">
          <Mail className="w-5 h-5" /> Protocol: Request Information
        </h4>
        <p className="text-sm text-blue-800 dark:text-blue-300 mb-6 leading-relaxed">
          Since you are missing required documents, please send the standard request to your Account Manager.
        </p>
        
        <button 
          onClick={handleCopyEmail}
          className="w-full py-3 bg-white dark:bg-white/10 border border-blue-200 dark:border-white/10 rounded-lg text-sm font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-white/20 flex items-center justify-center gap-2 transition-all mb-4"
        >
          {emailCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {emailCopied ? "COPIED TO CLIPBOARD" : "COPY EMAIL TEMPLATE"}
        </button>

        <button
          onClick={handleSavePartial}
          className="w-full py-3 bg-brand hover:bg-brand-dark text-white font-bold rounded-lg shadow-lg shadow-brand/20 transition-all text-xs uppercase tracking-widest"
        >
          Save Progress & Exit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-end">
        <h3 className="text-lg font-bold text-text-primary dark:text-white">Required Intelligence</h3>
        <button onClick={handleSelectAll} className="text-[10px] font-bold uppercase tracking-wider text-brand dark:text-blue-400 hover:underline">
          Select All
        </button>
      </div>

      <div className="space-y-2">
        {CHECKLIST_ITEMS.map(item => {
          const isChecked = checkedItems.includes(item);
          return (
            <button 
              key={item} 
              onClick={() => toggleItem(item)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all duration-200 group",
                isChecked 
                  ? "bg-brand/5 border-brand/50 dark:bg-blue-500/10 dark:border-blue-500/30" 
                  : "bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10 dark:hover:bg-white/10"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded flex items-center justify-center border transition-colors",
                isChecked ? "bg-brand border-brand dark:bg-blue-500 dark:border-blue-500 text-white" : "border-slate-400 dark:border-slate-500 text-transparent"
              )}>
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className={cn(
                "text-sm font-medium transition-colors",
                isChecked ? "text-brand dark:text-blue-200" : "text-text-primary dark:text-slate-300"
              )}>
                {item}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}