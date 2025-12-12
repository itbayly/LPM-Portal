import { useState, useMemo, useRef, useEffect } from 'react';
import { AlertTriangle, Calendar, Ban, ChevronDown, Edit2, X } from 'lucide-react';
import type { Property, UserProfile } from '../../../dataModel';

interface Props {
  property: Property;
  profile: UserProfile | null;
  onUpdate: (id: string, data: Partial<Property>) => void;
}

const parseDateSafe = (dateStr: string | undefined): Date | null => {
  if (!dateStr) return null;
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const mm = parseInt(parts[0], 10) - 1;
    const dd = parseInt(parts[1], 10);
    const yyyy = parseInt(parts[2], 10);
    d = new Date(yyyy, mm, dd);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};

// Helper for display
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return "-";
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[1]}/${parts[2]}/${parts[0]}`;
};

export default function PropertyCancellation({ property, profile, onUpdate }: Props) {
  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // -- EDIT STATE --
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    cancellationWindow: '',
    penaltyValue: '',
    penaltyType: '%'
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsCalendarMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditClick = () => {
    const penalty = property.earlyTerminationPenalty || '';
    const isDollar = penalty.includes('$') || (!penalty.includes('%') && penalty.length > 0);
    
    setFormData({
      cancellationWindow: property.cancellationWindow || '',
      penaltyValue: penalty.replace(/[^0-9.]/g, ''),
      penaltyType: isDollar ? '$' : '%'
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    const finalPenalty = formData.penaltyValue
      ? (formData.penaltyType === '%' ? `${formData.penaltyValue}%` : `$${formData.penaltyValue}`)
      : undefined;

    onUpdate(property.id, {
      cancellationWindow: formData.cancellationWindow,
      earlyTerminationPenalty: finalPenalty
    });
    setIsEditing(false);
  };

  // 1. Calculate Window Dates
  const { displayDate, startWindowDate } = useMemo(() => {
    const result = { displayDate: null as string | null, startWindowDate: null as Date | null };
    if (!property.contractEndDate || !property.cancellationWindow) return result;
    try {
      const nums = property.cancellationWindow.match(/\d+/g)?.map(Number);
      if (!nums || nums.length === 0) return result;
      const endDate = parseDateSafe(property.contractEndDate);
      if (!endDate) return result;
      const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      if (nums.length >= 2) {
        const maxDays = Math.max(...nums); 
        const minDays = Math.min(...nums); 
        const startWindow = new Date(endDate);
        startWindow.setDate(endDate.getDate() - maxDays);
        const endWindow = new Date(endDate);
        endWindow.setDate(endDate.getDate() - minDays);
        
        result.displayDate = `${fmt(startWindow)} - ${fmt(endWindow)}`;
        result.startWindowDate = startWindow;
        
      } else if (nums.length === 1) {
        const minDays = nums[0];
        const deadline = new Date(endDate);
        deadline.setDate(endDate.getDate() - minDays);
        
        result.displayDate = `Before ${fmt(deadline)}`;
        result.startWindowDate = deadline;
      }
    } catch (e) { console.error(e); }
    return result;
  }, [property.contractEndDate, property.cancellationWindow]);

  // 2. Calculate Termination Penalty
  const terminationDisplay = useMemo(() => {
    const penalty = property.earlyTerminationPenalty;
    if (!penalty) return "None";
    const price = property.vendor?.currentPrice || 0;

    const pctMatch = penalty.match(/(\d+)%/);
    if (pctMatch && property.contractEndDate && price) {
      const percentage = parseInt(pctMatch[1]) / 100;
      const end = parseDateSafe(property.contractEndDate);
      if (end) {
        const today = new Date();
        const monthsRemaining = (end.getFullYear() - today.getFullYear()) * 12 + (end.getMonth() - today.getMonth());
        
        if (monthsRemaining > 0) {
          const estimatedCost = price * monthsRemaining * percentage;
          return `${penalty} Owed (Est. $${estimatedCost.toLocaleString(undefined, {maximumFractionDigits: 0})})`;
        }
      }
    }

    const cleanVal = penalty.replace(/[^0-9.]/g, '');
    if (cleanVal && !isNaN(Number(cleanVal)) && !penalty.includes('%')) {
       return `$${Number(cleanVal).toLocaleString()}`;
    }

    return penalty;
  }, [property.earlyTerminationPenalty, property.contractEndDate, property.vendor?.currentPrice]);

  // 3. Calendar Handlers
  const getEventDetails = () => {
    const accountManagerName = property.accountManager?.name || "[Account Manager Name]";
    const accountManagerEmail = property.accountManager?.email || "[Account Manager Email]";
    const accountNum = property.vendor?.accountNumber || "N/A";
    const subject = `CANCEL CONTRACT: ${property.name}`;
    
    const body = `
ACTION REQUIRED: Send Cancellation Notice

Send To: ${accountManagerName} (${accountManagerEmail})
Subject: Non-Renewal of Service Agreement - ${property.name}

DRAFT LETTER:
--------------------------------------------------
Dear ${accountManagerName},

Please accept this letter as formal notice of our intent NOT to renew the elevator service agreement for:

Property: ${property.name}
Address: ${property.address}, ${property.city}, ${property.state}
Account #: ${accountNum}

Per our contract terms, we are providing this notice within the required cancellation window. We expect the service agreement to terminate on ${property.contractEndDate}.

Please confirm receipt of this cancellation notice in writing.

Sincerely,
${profile?.name || "Property Manager"}
LPM Property Management
--------------------------------------------------
    `.trim();

    return { subject, body };
  };

  const handleGoogleCalendar = () => {
    if (!startWindowDate) return;
    const { subject, body } = getEventDetails();
    const start = startWindowDate.toISOString().replace(/-|:|\.\d+/g, "");
    const end = new Date(startWindowDate.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, "");
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(subject)}&dates=${start}/${end}&details=${encodeURIComponent(body)}`;
    window.open(googleUrl, '_blank');
    setIsCalendarMenuOpen(false);
  };

  const handleDownloadICS = () => {
    if (!startWindowDate) return;
    const { subject, body } = getEventDetails();
    const startDate = startWindowDate.toISOString().replace(/-|:|\.\d+/g, "").substring(0, 8);
    const endDate = new Date(startWindowDate.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, "").substring(0, 8);
    const icsContent = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${startDate}`, `DTEND;VALUE=DATE:${endDate}`,
      `SUMMARY:${subject}`, `DESCRIPTION:${body.replace(/\n/g, '\\n')}`,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `cancellation_reminder_${property.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsCalendarMenuOpen(false);
  };

  return (
    <div className="bg-surface rounded-md shadow-lvl1 border border-border p-xl bg-slate-50/50 relative">
      <div className="flex items-center justify-between mb-lg">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-sm">
          <AlertTriangle className="w-5 h-5 text-status-warning" /> Cancellation Intelligence
        </h2>
        
        {/* Actions */}
        <div className="flex gap-2 items-center">
          {/* Calendar */}
          {startWindowDate && property.autoRenews !== false && (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsCalendarMenuOpen(!isCalendarMenuOpen)}
                className="text-xs font-bold text-brand bg-white border border-brand/20 px-3 py-1.5 rounded-sm hover:bg-brand/5 flex items-center gap-2 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" /> 
                Add Cancellation Date to Calendar
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>

              {isCalendarMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border rounded-md shadow-lg z-10 animate-in fade-in zoom-in-95 duration-100">
                  <button onClick={handleGoogleCalendar} className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-text-primary">
                    Google Calendar
                  </button>
                  <button onClick={handleDownloadICS} className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-text-primary border-t border-border">
                    Outlook / Apple (.ics)
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Edit Button */}
          <button 
            onClick={handleEditClick}
            className="text-text-secondary hover:text-brand transition-colors p-1"
            title="Edit Cancellation Info"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {property.autoRenews === false ? (
        // NO AUTO-RENEW LAYOUT
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-sm mb-lg">
          <p className="text-sm text-blue-900 font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Your contract will automatically end on <strong>{formatDate(property.contractEndDate)}</strong>.
          </p>
          <p className="text-xs text-blue-700 mt-1 ml-6">
            No cancellation notice is required as this contract does not auto-renew.
          </p>
        </div>
      ) : (
        // STANDARD AUTO-RENEW LAYOUT
        <div className="grid grid-cols-2 gap-lg mb-lg">
           <div>
              <label className="text-[11px] font-bold text-text-secondary uppercase block">Notice Window</label>
              <span className="text-sm text-text-primary">{property.cancellationWindow || "Not Set"}</span>
           </div>
           <div>
              <label className="text-[11px] font-bold text-text-secondary uppercase block text-brand">Cancellation Window Dates</label>
              <span className="text-sm font-bold text-brand">{displayDate || "Missing Data"}</span>
           </div>
        </div>
      )}

      {/* Termination Penalty Section */}
      {terminationDisplay !== "None" && (
        <div className="mt-4 pt-4 border-t border-blue-100">
          <label className="text-[11px] font-bold text-text-secondary uppercase block mb-1">Early Termination Penalty</label>
          <span className="text-sm font-medium text-text-primary flex items-center gap-2">
            {property.earlyTerminationPenalty && property.earlyTerminationPenalty.includes('%') && <Ban className="w-4 h-4 text-rose-500" />}
            {terminationDisplay}
          </span>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-text-primary">Edit Cancellation Info</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Notice Window</label>
                <input 
                  className="w-full p-2 border border-border rounded text-sm focus:border-brand outline-none"
                  value={formData.cancellationWindow}
                  onChange={e => setFormData({...formData, cancellationWindow: e.target.value})}
                  placeholder="e.g. 120 - 90 Days"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Termination Penalty</label>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 p-2 border border-border rounded text-sm focus:border-brand outline-none"
                    placeholder="e.g. 50 or 5000"
                    value={formData.penaltyValue}
                    onChange={e => setFormData({...formData, penaltyValue: e.target.value})}
                  />
                  <select 
                    className="w-20 p-2 border border-border rounded-md bg-white text-sm"
                    value={formData.penaltyType}
                    onChange={e => setFormData({...formData, penaltyType: e.target.value})}
                  >
                    <option value="%">%</option>
                    <option value="$">$</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-border flex justify-end gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-brand text-white text-sm font-bold rounded shadow-sm hover:bg-brand-dark"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
