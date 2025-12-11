import { User, Mail, Phone } from 'lucide-react';
import type { Property } from '../../../dataModel';

interface Props {
  property: Property;
}

export default function PropertyLPMResponsibility({ property }: Props) {
  const manager = property.manager || {};
  const regionalPm = property.regionalPm || {};

  return (
    <div className="bg-surface rounded-md shadow-lvl1 p-lg border border-border">
      <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-md">LPM Responsibility</h3>
      
      {/* Property Manager Info */}
      <div className="flex items-start gap-md mb-4">
        <div className="p-2 bg-slate-100 rounded-full">
          <User className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">{manager.name || "Unassigned"}</p>
          <p className="text-xs text-text-secondary">Property Manager</p>
          <div className="mt-sm space-y-xs">
            <div className="flex items-center gap-xs text-xs text-brand">
              <Mail className="w-3 h-3" /> {manager.email || "-"}
            </div>
            <div className="flex items-center gap-xs text-xs text-text-secondary">
              <Phone className="w-3 h-3" /> {manager.phone || "-"}
            </div>
          </div>
        </div>
      </div>

      {/* Regional PM Info */}
      <div className="flex items-start gap-md pt-4 border-t border-border">
        <div className="p-2 bg-slate-100 rounded-full">
          <User className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">{regionalPm.name || "Unassigned"}</p>
          <p className="text-xs text-text-secondary">Regional Property Manager</p>
          <div className="mt-sm space-y-xs">
            <div className="flex items-center gap-xs text-xs text-brand">
              <Mail className="w-3 h-3" /> {regionalPm.email || "-"}
            </div>
            <div className="flex items-center gap-xs text-xs text-text-secondary">
              <Phone className="w-3 h-3" /> {regionalPm.phone || "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}