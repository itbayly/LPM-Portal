import { cn } from '../../../../lib/utils';
import type { StepProps } from '../wizardConfig';

export default function Step1_Elevators({ formData, setFormData }: StepProps) {
  
  // Custom handler for No button to ensure explicit state
  const handleNoClick = () => {
    setFormData(prev => ({ ...prev, hasElevators: false }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <label className="text-lg font-bold text-text-primary block">
        Does this property have elevators on site? <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-4">
        <button 
          onClick={() => setFormData(prev => ({ ...prev, hasElevators: true }))}
          className={cn(
            "flex-1 py-4 border-2 rounded-md font-bold transition-all", 
            formData.hasElevators === true ? "border-brand bg-blue-50 text-brand" : "border-border hover:border-slate-300"
          )}
        >
          Yes
        </button>
        <button 
          onClick={handleNoClick}
          className={cn(
            "flex-1 py-4 border-2 rounded-md font-bold transition-all", 
            formData.hasElevators === false ? "border-brand bg-blue-50 text-brand" : "border-border hover:border-slate-300"
          )}
        >
          No
        </button>
      </div>

      {formData.hasElevators && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <label className="text-sm font-bold uppercase text-text-secondary mb-2 block">
            Number of Elevators <span className="text-red-500">*</span>
          </label>
          <input 
            type="number"
            className="w-full p-3 border border-border rounded-md focus:border-brand outline-none"
            value={formData.unitCount}
            onChange={e => setFormData(prev => ({ ...prev, unitCount: Number(e.target.value) }))}
          />
        </div>
      )}
    </div>
  );
}