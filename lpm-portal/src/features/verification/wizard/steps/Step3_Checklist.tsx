import { Mail, Check, Copy } from 'lucide-react';
import { CHECKLIST_ITEMS } from '../wizardConfig';
import type { StepProps } from '../wizardConfig';

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

  if (showEmailScreen) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-md p-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-2">
          <Mail className="w-5 h-5" /> Missing Information
        </h4>
        <p className="text-sm text-blue-800 mb-4">
          Since you don't have all the required documents, please email your account manager. We will save your progress.
        </p>
        
        <button 
          onClick={handleCopyEmail}
          className="w-full py-2 bg-white border border-blue-200 rounded text-sm font-bold text-blue-700 hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors mb-4"
        >
          {emailCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {emailCopied ? "Copied to Clipboard!" : "Copy Draft Email"}
        </button>

        <button
          onClick={handleSavePartial}
          className="w-full py-3 bg-brand text-white font-bold rounded-md shadow-sm hover:bg-brand-dark"
        >
          Save & Exit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h3 className="text-lg font-bold text-text-primary">Do you have all of the information below?</h3>
      
      <div className="flex justify-end">
        <button onClick={handleSelectAll} className="text-xs text-brand font-bold hover:underline">
          Yes, I have all the information
        </button>
      </div>

      <div className="space-y-2">
        {CHECKLIST_ITEMS.map(item => (
          <label key={item} className="flex items-center gap-3 p-3 border border-border rounded-md hover:bg-slate-50 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded border-slate-300 text-brand focus:ring-brand"
              checked={checkedItems.includes(item)}
              onChange={(e) => {
                if (e.target.checked) setCheckedItems([...checkedItems, item]);
                else setCheckedItems(checkedItems.filter(i => i !== item));
              }}
            />
            <span className="text-sm font-medium text-text-primary">{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}