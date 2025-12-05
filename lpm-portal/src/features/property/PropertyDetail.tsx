import React, { useState } from 'react';
import { 
  ArrowLeft, User, Phone, Mail, FileText, AlertTriangle, 
  DollarSign, CheckCircle2, Trash2, Plus, Download, Save
} from 'lucide-react';
import { StatusPill } from '../../components/ui/StatusPill';
import { StarRating } from '../../components/ui/StarRating';
import VerificationWizard from '../verification/VerificationWizard';
import type { Property, Contact } from '../../dataModel';

interface PropertyDetailProps {
  property: Property;
  onBack: () => void;
  onUpdate: (id: string, data: Partial<Property>) => void;
}

export default function PropertyDetail({ property, onBack, onUpdate }: PropertyDetailProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // -- HANDLERS --

  // 1. Update Vendor Fields (Auto-save on blur/change)
  const updateVendor = (field: string, value: any) => {
    onUpdate(property.id, {
      vendor: { ...property.vendor, [field]: value }
    });
  };

  // 2. Contact Management
  const handleDeleteContact = (contactId: string) => {
    if(!confirm("Are you sure you want to remove this contact?")) return;
    const updatedContacts = property.contacts.filter(c => c.id !== contactId);
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
    onUpdate(property.id, { contacts: [...property.contacts, newContact] });
  };

  const updateContact = (contactId: string, field: keyof Contact, value: string) => {
    const updatedContacts = property.contacts.map(c => 
      c.id === contactId ? { ...c, [field]: value } : c
    );
    onUpdate(property.id, { contacts: updatedContacts });
  };

  // 3. Wizard Completion (Mapping Logic)
  const handleVerificationComplete = (data: any) => {
    // 1. Construct the "Notice Window" string from the two inputs
    // Example: "120 - 90 Days"
    const noticeString = `${data.noticeDaysMax} - ${data.noticeDaysMin} Days`;

    // 2. Send the full payload to the update hook
    onUpdate(property.id, {
      status: 'active', // Mark as Green/Verified
      unitCount: data.unitCount,
      
      // Map Dates
      contractStartDate: data.contractStart,
      contractEndDate: data.calculatedEnd,
      cancellationWindow: noticeString,

      // Map Nested Vendor Object
      vendor: {
        ...property.vendor, // Keep existing vendor fields (like account number)
        name: data.vendorName,
        rating: data.ratingRaw,
        currentPrice: data.currentPrice
      }
    });

    setIsWizardOpen(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-canvas">
      
      {/* HEADER [PRD View B.1] */}
      <div className="flex items-center gap-md mb-lg shrink-0 pt-1">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors text-text-secondary"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-[28px] font-bold text-text-primary leading-tight">{property.name}</h1>
          <p className="text-sm text-text-secondary">{property.address}, {property.city}, {property.state} {property.zip}</p>
        </div>
        <div className="ml-auto flex items-center gap-md">
          <StatusPill status={property.status} />
          
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="px-4 py-2 bg-brand text-white rounded-sm text-sm font-medium shadow-sm hover:bg-brand-dark flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Verify Data
          </button>
        </div>
      </div>

      {/* SPLIT LAYOUT [PRD View B.2] */}
      <div className="flex-1 flex gap-lg min-h-0 overflow-hidden">
        
        {/* --- LEFT COLUMN (Identity & Vendor) --- */}
        <div className="w-[360px] flex-shrink-0 overflow-y-auto space-y-lg pr-2 pb-10">
          
          {/* Internal Manager Card */}
          <div className="bg-surface rounded-md shadow-lvl1 p-lg border border-border">
            <h3 className="text-[11px] font-bold text-text-secondaryKZ uppercase tracking-wider mb-md">LPM Responsibility</h3>
            <div className="flex items-start gap-md">
              <div className="p-2 bg-slate-100 rounded-full">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">{property.manager.name}</p>
                <p className="text-xs text-text-secondary">Property Manager</p>
                <div className="mt-sm space-y-xs">
                  <div className="flex items-center gap-xs text-xs text-brand">
                    <Mail className="w-3 h-3" /> {property.manager.email}
                  </div>
                  <div className="flex items-center gap-xs text-xs text-text-secondary">
                    <Phone className="w-3 h-3" /> {property.manager.phone}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Card [PRD View B Column 1] */}
          <div className="bg-surface rounded-md shadow-lvl1 p-lg border border-border">
            <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-md">Current Vendor</h3>
            
            <div className="mb-lg">
              <span className="text-lg font-bold text-brand block mb-2">{property.vendor.name}</span>
              <StarRating 
                value={property.vendor.rating} 
                onChange={(val) => updateVendor('rating', val)}
              />
            </div>

            <div className="space-y-md">
              <div>
                <label className="text-[11px] font-semibold text-text-secondary uppercase block mb-xs">Account Number</label>
                <input 
                  type="text"
                  className="w-full text-sm font-mono bg-slate-50 p-2 rounded-sm border border-border focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                  value={property.vendor.accountNumber}
                  onChange={(e) => updateVendor('accountNumber', e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-secondary uppercase block mb-xs">Service Instructions</label>
                <textarea 
                  className="w-full text-sm bg-slate-50 p-2 rounded-sm border border-border min-h-[80px] focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-y"
                  value={property.vendor.serviceInstructions}
                  onChange={(e) => updateVendor('serviceInstructions', e.target.value)}
                />
              </div>
            </div>
          </div>

        </div>

        {/* --- RIGHT COLUMN (Contract Vault) --- */}
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
                    ${property.vendor.currentPrice.toLocaleString()}
                  </span>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-secondary uppercase block">Annual Spend</label>
                  <span className="text-xl font-mono text-text-secondary block mt-1">
                    ${(property.vendor.currentPrice * 12).toLocaleString()}
                  </span>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-secondary uppercase block">Contract Start</label>
                  <span className="text-sm text-text-primary block mt-1">{property.contractStartDate}</span>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-secondary uppercase block">Current Term End</label>
                  <span className="text-sm font-bold text-text-primary block mt-1">{property.contractEndDate}</span>
                </div>
              </div>
            </div>

            {/* Cancellation Intelligence [PRD View B.2 - Alert Box] */}
            <div className="p-xl border-b border-border bg-slate-50/50">
              <h2 className="text-lg font-bold text-text-primary mb-lg flex items-center gap-sm">
                <AlertTriangle className="w-5 h-5 text-status-warning" /> Cancellation Intelligence
              </h2>

              <div className="bg-[#EFF6FF] border-l-4 border-status-warning p-md rounded-r-sm mb-lg shadow-sm">
                 <p className="text-sm text-blue-900 font-medium">
                   CRITICAL DATE: You must cancel by <strong>July 12, 2025</strong> to avoid auto-renewal.
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-lg">
                 <div>
                    <label className="text-[11px] font-bold text-text-secondary uppercase block">Notice Window</label>
                    <span className="text-sm text-text-primary">{property.cancellationWindow}</span>
                 </div>
                 <div>
                    <label className="text-[11px] font-bold text-text-secondary uppercase block">Auto-Renew</label>
                    <span className="text-sm text-text-primary">{property.autoRenews ? "Yes (5 Years)" : "No"}</span>
                 </div>
              </div>
            </div>

            {/* Contacts Table [PRD View B.2 - Editable] */}
            <div className="p-xl border-b border-border">
              <div className="flex items-center justify-between mb-lg">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-sm">
                  <User className="w-5 h-5 text-text-secondary" /> Points of Contact
                </h2>
                <button 
                  onClick={handleAddContact}
                  className="text-xs font-bold text-brand hover:text-brand-dark flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-sm hover:bg-blue-100 transition-colors"
                >
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
                  {property.contacts.map((c) => (
                    <tr key={c.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="p-2">
                        <input 
                          className="w-full bg-transparent border-b border-transparent focus:border-brand outline-none text-sm font-medium text-text-primary"
                          value={c.name}
                          onChange={(e) => updateContact(c.id, 'name', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          className="w-full bg-transparent border-b border-transparent focus:border-brand outline-none text-sm text-text-secondary"
                          value={c.role}
                          onChange={(e) => updateContact(c.id, 'role', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          className="w-full bg-transparentYZ border-b border-transparent focus:border-brand outline-none text-sm text-brand"
                          value={c.email}
                          onChange={(e) => updateContact(c.id, 'email', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          className="w-full bg-transparent border-b border-transparent focus:border-brand outline-none text-sm font-mono text-text-secondary"
                          value={c.phone}
                          onChange={(e) => updateContact(c.id, 'phone', e.target.value)}
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button 
                          onClick={() => handleDeleteContact(c.id)}
                          className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {property.contacts.length === 0 && (
                <div className="text-center py-6 text-sm text-slate-400 italic">
                  No contacts listed. Click "Add Contact" to creates one.
                </div>
              )}
            </div>

            {/* Document Repository [PRD View B.2 - Documents] */}
            <div className="p-xl">
              <h2 className="text-lg font-bold text-text-primary mb-lg flex items-center gap-sm">
                <FileText className="w-5 h-5 text-text-secondary" /> Document Repository
              </h2>
              
              <div className="space-y-sm">
                {/* Mock Documents for UI display */}
                {['Master Service Agreement (MSA).pdf', 'Insurance Certificate 2024.pdf', 'Q3 Performance Report.pdf'].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-border rounded-sm hover:border-brand hover:shadow-sm transition-all group cursor-pointer bg-white">
                    <div className="flex items-center gap-md">
                      <div className="p-2 bg-red-50 rounded-sm">
                        <FileText className="w-5 h-5 text-red-500" />
                      </div>
                      <span className="text-sm font-medium text-text-primary group-hover:text-brand transition-colors">{doc}</span>
                    </div>
                    <button className="text-text-secondary hover:text-brand p-2">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-md pt-md border-t border-dashed border-border text-center">
                 <button className="text-xs font-bold text-brand uppercase tracking-wide hover:underline">
                    + Upload New Document
                 </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      <VerificationWizard 
        property={property}
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleVerificationComplete}
      />

    </div>
  );
}