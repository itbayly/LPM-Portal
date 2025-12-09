import { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, User, Phone, Mail, FileText, AlertTriangle, 
  DollarSign, CheckCircle2, Trash2, Plus, Download, Building, AlertCircle, Calendar
} from 'lucide-react';
import { StatusPill } from '../../components/ui/StatusPill';
import { StarRating } from '../../components/ui/StarRating';
import VerificationWizard from '../verification/VerificationWizard';
import { useAuth } from '../auth/AuthContext';
import { cn } from '../../lib/utils'; // <-- ADDED THIS IMPORT
import type { Property, Contact } from '../../dataModel';

interface PropertyDetailProps {
  property: Property;
  onBack: () => void;
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

export default function PropertyDetail({ property, onBack, onUpdate }: PropertyDetailProps) {
  const { profile } = useAuth();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // -- HANDLERS --
  const updateVendor = (field: string, value: any) => {
    onUpdate(property.id, { vendor: { ...property.vendor, [field]: value } });
  };

  const updateField = (field: keyof Property, value: any) => {
    onUpdate(property.id, { [field]: value });
  };

  const handleDeleteContact = (contactId: string) => {
    if(!confirm("Are you sure you want to remove this contact?")) return;
    const updatedContacts = (property.contacts || []).filter(c => c.id !== contactId);
    onUpdate(property.id, { contacts: updatedContacts });
  };

  const handleAddContact = () => {
    const newContact: Contact = {
      id: `new-${Date.now()}`,
      name: "New Contact",
      role: "Role...",
      email: "",
      phone: ""
    };
    onUpdate(property.id, { contacts: [...(property.contacts || []), newContact] });
  };

  const updateContact = (contactId: string, field: keyof Contact, value: string) => {
    const updatedContacts = (property.contacts || []).map(c => 
      c.id === contactId ? { ...c, [field]: value } : c
    );
    onUpdate(property.id, { contacts: updatedContacts });
  };

  const handleVerificationComplete = (data: any) => {
    if (data.status === 'no_elevators' && data.clearData) {
      onUpdate(property.id, {
        status: 'no_elevators',
        unitCount: 0,
        vendor: { ...property.vendor, name: '', currentPrice: 0, rating: 0, accountNumber: '', serviceInstructions: '' },
        contractStartDate: '',
        contractEndDate: '',
        cancellationWindow: '',
        initialTerm: '',
        renewalTerm: '',
        billTo: '',
        buildingId: ''
      });
      setIsWizardOpen(false);
      return;
    }

    if (data.status === 'pending_rpm_review') {
      onUpdate(property.id, { status: 'pending_rpm_review' });
      setIsWizardOpen(false);
      return;
    }

    const noticeString = `${data.noticeDaysMax} - ${data.noticeDaysMin} Days`;
    onUpdate(property.id, {
      status: 'active',
      unitCount: data.unitCount,
      contractStartDate: data.contractStart,
      contractEndDate: data.calculatedEnd,
      cancellationWindow: noticeString,
      initialTerm: `${data.initialTermNum} ${data.initialTermUnit}`,
      renewalTerm: `${data.renewalTermNum} ${data.renewalTermUnit}`,
      onNationalContract: data.onNationalContract,
      vendor: {
        ...property.vendor,
        name: data.vendorName,
        rating: data.ratingRaw,
        currentPrice: data.currentPrice,
        billingFrequency: data.billingFreq
      }
    });
    setIsWizardOpen(false);
  };

  const confirmNoContract = () => {
    if(confirm("Confirm that this property has NO service contract? This will remove it from compliance lists.")) {
      onUpdate(property.id, { status: 'no_service_contract' });
    }
  };

  const vendor = property.vendor || {};
  const manager = property.manager || {};
  const contacts = property.contacts || [];
  const price = typeof vendor.currentPrice === 'number' ? vendor.currentPrice : 0;

  useEffect(() => {
    const targetText = "Call 1-800-225-3123 and provide them with your Building ID # listed above";
    if (vendor.name === 'Schindler') {
      if (!vendor.serviceInstructions || vendor.serviceInstructions === "Contact Service Provider") {
        updateVendor('serviceInstructions', targetText);
      }
    }
  }, [vendor.name, vendor.serviceInstructions]);

  const { displayDate, showBanner, startWindowDate } = useMemo(() => {
    const result = { displayDate: null as string | null, showBanner: false, startWindowDate: null as Date | null };
    if (!property.contractEndDate || !property.cancellationWindow) return result;
    try {
      const nums = property.cancellationWindow.match(/\d+/g)?.map(Number);
      if (!nums || nums.length === 0) return result;
      const endDate = parseDateSafe(property.contractEndDate);
      if (!endDate) return result;
      const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const today = new Date();

      if (nums.length >= 2) {
        const maxDays = Math.max(...nums); 
        const minDays = Math.min(...nums); 
        const startWindow = new Date(endDate);
        startWindow.setDate(endDate.getDate() - maxDays);
        const endWindow = new Date(endDate);
        endWindow.setDate(endDate.getDate() - minDays);
        const alertStart = new Date(startWindow);
        alertStart.setDate(startWindow.getDate() - 30);
        
        result.displayDate = `${fmt(startWindow)} - ${fmt(endWindow)}`;
        result.showBanner = today >= alertStart && today <= endWindow;
        result.startWindowDate = startWindow;
        
      } else if (nums.length === 1) {
        const minDays = nums[0];
        const deadline = new Date(endDate);
        deadline.setDate(endDate.getDate() - minDays);
        const alertStart = new Date(deadline);
        alertStart.setDate(deadline.getDate() - 90);
        
        result.displayDate = `Before ${fmt(deadline)}`;
        result.showBanner = today >= alertStart && today <= deadline;
        result.startWindowDate = deadline;
      }
    } catch (e) { console.error(e); }
    return result;
  }, [property.contractEndDate, property.cancellationWindow]);

  const getEventDetails = () => {
    const accountManagerName = property.accountManager?.name || "[Account Manager Name]";
    const accountManagerEmail = property.accountManager?.email || "[Account Manager Email]";
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
Account #: ${vendor.accountNumber || "N/A"}

Per our contract terms, we are providing this notice within the required cancellation window. We expect the service agreement to terminate on ${property.contractEndDate}.

Please confirm receipt of this cancellation notice in writing.

Sincerely,
${profile?.name || "Property Manager"}
LPM Property Management
--------------------------------------------------

[Note: Attach the contract PDF if available]
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
  };

  const handleDownloadICS = () => {
    if (!startWindowDate) return;
    const { subject, body } = getEventDetails();
    const startDate = startWindowDate.toISOString().replace(/-|:|\.\d+/g, "").substring(0, 8);
    const endDate = new Date(startWindowDate.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, "").substring(0, 8);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${startDate}`,
      `DTEND;VALUE=DATE:${endDate}`,
      `SUMMARY:${subject}`,
      `DESCRIPTION:${body.replace(/\n/g, '\\n')}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `cancellation_reminder_${property.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (property.status === 'no_elevators') {
    return (
      <div className="flex flex-col h-full bg-canvas p-6">
        <div className="mb-6 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full text-text-secondary"><ArrowLeft className="w-6 h-6" /></button>
          <h1 className="text-2xl font-bold text-text-primary">{property.name}</h1>
          <StatusPill status="no_elevators" />
        </div>
        <div className="bg-surface border border-border rounded-md p-10 text-center shadow-sm">
          <Building className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text-primary mb-2">No Elevators on Site</h3>
          <p className="text-text-secondary max-w-md mx-auto">
            This property has been verified as having no vertical transportation assets. No further tracking is required.
          </p>
          <button onClick={() => setIsWizardOpen(true)} className="mt-6 text-sm text-brand font-bold hover:underline">
            Mistake? Re-verify Data
          </button>
        </div>
        {isWizardOpen && (
          <VerificationWizard 
            property={property}
            isOpen={isWizardOpen}
            onClose={() => setIsWizardOpen(false)}
            onComplete={handleVerificationComplete}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-canvas">
      
      <div className="flex items-center gap-md mb-lg shrink-0 pt-1">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-text-secondary">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-bold text-text-primary leading-tight">{property.name || "Unnamed Property"}</h1>
            <span className="px-2 py-0.5 bg-slate-100 text-text-secondary text-xs font-bold rounded-full border border-border flex items-center gap-1">
              <Building className="w-3 h-3" />
              {property.unitCount || 0} Elevators
            </span>
          </div>
          <p className="text-sm text-text-secondary">
            {property.address}, {property.city}, {property.state} {property.zip}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-md">
          <StatusPill status={property.status} />
          <button onClick={() => setIsWizardOpen(true)} className="px-4 py-2 bg-brand text-white rounded-sm text-sm font-medium shadow-sm hover:bg-brand-dark flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Verify Data
          </button>
        </div>
      </div>

      {showBanner && (
        <div className="mx-6 mb-6 p-4 bg-red-50 border-l-4 border-status-critical rounded-r-sm shadow-sm flex items-start gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-status-critical shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-900 uppercase tracking-wide mb-1">Action Required: Cancellation Window Open</h3>
            <p className="text-sm text-red-800">
              This contract is currently in (or approaching) its cancellation window. 
              You must provide notice by <strong>{displayDate?.split(' - ')[1]?.replace('Before ', '') || "the deadline"}</strong> to avoid auto-renewal.
            </p>
          </div>
        </div>
      )}

      {property.status === 'pending_rpm_review' && (
        <div className="mx-6 mb-6 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-sm shadow-sm flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="text-sm font-bold text-orange-900 uppercase tracking-wide">Pending Review: No Service Provider</h3>
              <p className="text-sm text-orange-800">Property Manager indicates no service provider exists. Regional PM must confirm.</p>
            </div>
          </div>
          {(profile?.role === 'regional_pm' || profile?.role === 'admin' || profile?.role === 'area_vp') && (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsWizardOpen(true)}
                className="px-3 py-1.5 bg-white border border-orange-200 text-orange-800 text-xs font-bold rounded shadow-sm hover:bg-orange-100"
              >
                Reject (Add Vendor)
              </button>
              <button 
                onClick={confirmNoContract}
                className="px-3 py-1.5 bg-orange-600 text-white text-xs font-bold rounded shadow-sm hover:bg-orange-700"
              >
                Confirm No Contract
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex gap-lg min-h-0 overflow-hidden">
        
        <div className="w-[360px] flex-shrink-0 overflow-y-auto space-y-lg pr-2 pb-10">
          <div className="bg-surface rounded-md shadow-lvl1 p-lg border border-border">
            <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-md">LPM Responsibility</h3>
            <div className="flex items-start gap-md">
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
          </div>

          <div className="bg-surface rounded-md shadow-lvl1 p-lg border border-border">
            <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-md">Current Vendor</h3>
            
            <div className="mb-lg">
              <div className="flex items-start justify-between">
                <span className="text-lg font-bold text-brand block">{vendor.name || "No Vendor Selected"}</span>
                {/* National Contract Pill */}
                {vendor.name === 'Schindler' && (
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide",
                    property.onNationalContract ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"
                  )}>
                    {property.onNationalContract ? "National Agreement" : "Not on Agreement"}
                  </span>
                )}
              </div>
              <StarRating value={vendor.rating || 0} onChange={(val) => updateVendor('rating', val)} />
            </div>

            <div className="space-y-md">
              <div>
                <label className="text-[11px] font-semibold text-text-secondary uppercase block mb-xs">Account Number</label>
                <input type="text" className="w-full text-sm font-mono bg-slate-50 p-2 rounded-sm border border-border focus:border-brand focus:ring-1 focus:ring-brand outline-none" value={vendor.accountNumber || ""} onChange={(e) => updateVendor('accountNumber', e.target.value)} />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-text-secondary uppercase block mb-xs">Bill To #</label>
                <input type="text" className="w-full text-sm font-mono bg-slate-50 p-2 rounded-sm border border-border focus:border-brand focus:ring-1 focus:ring-brand outline-none" value={property.billTo || ""} onChange={(e) => updateField('billTo', e.target.value)} />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-text-secondary uppercase block mb-xs">Building ID #</label>
                <input type="text" className="w-full text-sm font-mono bg-slate-50 p-2 rounded-sm border border-border focus:border-brand focus:ring-1 focus:ring-brand outline-none" value={property.buildingId || ""} onChange={(e) => updateField('buildingId', e.target.value)} />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-text-secondary uppercase block mb-xs">How To Place a Service Call</label>
                <textarea className="w-full text-sm bg-slate-50 p-2 rounded-sm border border-border min-h-[80px] focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-y" value={vendor.serviceInstructions || ""} onChange={(e) => updateVendor('serviceInstructions', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-2xl">
          <div className="bg-surface rounded-md shadow-lvl1 border border-border">
            
            {/* Financials Section */}
            <div className="p-xl border-b border-border">
              <h2 className="text-lg font-bold text-text-primary mb-lg flex items-center gap-sm">
                <DollarSign className="w-5 h-5 text-brand" /> Financial Overview
              </h2>
              
              <div className="grid grid-cols-2 gap-x-xl gap-y-lg">
                <div>
                  <label className="text-[11px] font-bold text-text-secondary uppercase block">Monthly Base Price</label>
                  <span className="text-2xl font-mono text-text-primary block mt-1">
                    ${price.toLocaleString()}
                  </span>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-secondary uppercase block">Annual Spend</label>
                  <span className="text-xl font-mono text-text-secondary block mt-1">
                    ${(price * 12).toLocaleString()}
                  </span>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-secondary uppercase block">Contract Start</label>
                  <span className="text-sm text-text-primary block mt-1">{property.contractStartDate || "-"}</span>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-secondary uppercase block">Current Term End</label>
                  <span className="text-sm font-bold text-text-primary block mt-1">{property.contractEndDate || "-"}</span>
                </div>
              </div>
            </div>

            <div className="p-xl border-b border-border bg-slate-50/50">
              <div className="flex items-center justify-between mb-lg">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-sm">
                  <AlertTriangle className="w-5 h-5 text-status-warning" /> Cancellation Intelligence
                </h2>
                {startWindowDate && (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGoogleCalendar}
                      className="text-xs font-bold text-brand bg-white border border-brand/20 px-3 py-1.5 rounded-sm hover:bg-brand/5 flex items-center gap-2 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Google
                    </button>
                    <button 
                      onClick={handleDownloadICS}
                      className="text-xs font-bold text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded-sm hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Outlook (.ics)
                    </button>
                  </div>
                )}
              </div>

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
              <div className="grid grid-cols-2 gap-lg pt-lg border-t border-blue-100">
                 <div>
                    <label className="text-[11px] font-bold text-text-secondary uppercase block">Initial Term</label>
                    <span className="text-sm text-text-primary">{property.initialTerm || "-"}</span>
                 </div>
                 <div>
                    <label className="text-[11px] font-bold text-text-secondary uppercase block">Renewal Term</label>
                    <span className="text-sm text-text-primary">{property.renewalTerm || "-"}</span>
                 </div>
              </div>
            </div>

            <div className="p-xl border-b border-border">
              <div className="flex items-center justify-between mb-lg">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-sm">
                  <User className="w-5 h-5 text-text-secondary" /> Points of Contact
                </h2>
                <button onClick={handleAddContact} className="text-xs font-bold text-brand hover:text-brand-dark flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-sm hover:bg-blue-100 transition-colors">
                  <Plus className="w-3 h-3" /> Add Contact
                </button>
              </div>
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-border">
                  <tr>
                    <th className="py-2 px-3 text-[11px] font-bold text-text-secondary uppercase">Name</th>
                    <th className="py-2 px-3 text-[11px] font-bold text-text-secondary uppercase">Role</th>
                    <th className="py-2 px-3 text-[11px] font-bold text-text-secondary uppercase">Email</th>
                    <th className="py-2 px-3 text-[11px] font-bold text-text-secondary uppercase">Phone</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contacts.map((c) => (
                    <tr key={c.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="p-2"><input className="w-full bg-transparent border-b border-transparent focus:border-brand outline-none text-sm font-medium text-text-primary" value={c.name} onChange={(e) => updateContact(c.id, 'name', e.target.value)} /></td>
                      <td className="p-2"><input className="w-full bg-transparent border-b border-transparent focus:border-brand outline-none text-sm text-text-secondary" value={c.role} onChange={(e) => updateContact(c.id, 'role', e.target.value)} /></td>
                      <td className="p-2"><input className="w-full bg-transparentYZ border-b border-transparent focus:border-brand outline-none text-sm text-brand" value={c.email} onChange={(e) => updateContact(c.id, 'email', e.target.value)} /></td>
                      <td className="p-2"><input className="w-full bg-transparent border-b border-transparent focus:border-brand outline-none text-sm font-mono text-text-secondary" value={c.phone} onChange={(e) => updateContact(c.id, 'phone', e.target.value)} /></td>
                      <td className="p-2 text-center"><button onClick={() => handleDeleteContact(c.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {contacts.length === 0 && <div className="text-center py-6 text-sm text-slate-400 italic">No contacts listed. Click "Add Contact" to create one.</div>}
            </div>

            <div className="p-xl">
              <h2 className="text-lg font-bold text-text-primary mb-lg flex items-center gap-sm">
                <FileText className="w-5 h-5 text-text-secondary" /> Document Repository
              </h2>
              <div className="space-y-sm">
                {['Master Service Agreement (MSA).pdf', 'Insurance Certificate 2024.pdf', 'Q3 Performance Report.pdf'].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-border rounded-sm hover:border-brand hover:shadow-sm transition-all group cursor-pointer bg-white">
                    <div className="flex items-center gap-md">
                      <div className="p-2 bg-red-50 rounded-sm">
                        <FileText className="w-5 h-5 text-red-500" />
                      </div>
                      <span className="text-sm font-medium text-text-primary group-hover:text-brand transition-colors">{doc}</span>
                    </div>
                    <button className="text-text-secondary hover:text-brand p-2"><Download className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              <div className="mt-md pt-md border-t border-dashed border-border text-center">
                 <button className="text-xs font-bold text-brand uppercase tracking-wide hover:underline">+ Upload New Document</button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {isWizardOpen && (
        <VerificationWizard 
          property={property}
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onComplete={handleVerificationComplete}
        />
      )}

    </div>
  );
}
