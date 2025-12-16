import { User, Mail, Phone, Shield } from 'lucide-react';
import type { LegacyProperty } from '../../../dataModel';

interface Props {
  property: LegacyProperty;
}

export default function PropertyLPMResponsibility({ property }: Props) {
  const manager = property.manager || {};
  const regionalPm = property.regionalPm || {};

  const PersonnelRow = ({ role, data }: { role: string, data: any }) => (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
      {/* Avatar / Icon */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-inner">
        <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <p className="text-sm font-bold text-text-primary dark:text-white truncate">{data.name || "Unassigned"}</p>
          <span className="text-[10px] font-mono text-text-secondary dark:text-slate-500 uppercase tracking-wider">{role}</span>
        </div>
        
        <div className="flex items-center gap-4 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary dark:text-slate-300">
            <Mail className="w-3 h-3" />
            <span className="truncate max-w-[120px]">{data.email || "-"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary dark:text-slate-300">
            <Phone className="w-3 h-3" />
            <span>{data.phone || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="glass-panel p-5 rounded-xl">
      <h3 className="text-xs font-bold text-brand dark:text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Shield className="w-4 h-4" /> Internal Team
      </h3>
      
      <div className="space-y-1">
        <PersonnelRow role="Manager" data={manager} />
        <div className="h-[1px] bg-gradient-to-r from-transparent via-black/5 dark:via-white/10 to-transparent my-1" />
        <PersonnelRow role="Regional PM" data={regionalPm} />
      </div>
    </div>
  );
}