import { useState, useRef } from 'react';
import { FileText, Download, Trash2, Loader2 } from 'lucide-react';
import { uploadFileToStorage, deleteFileFromStorage } from '../../../lib/storage';
import type { Property, PropertyDocument, UserProfile } from '../../../dataModel';

interface Props {
  property: Property;
  onUpdate: (id: string, data: Partial<Property>) => void;
  profile: UserProfile | null;
}

export default function PropertyDocuments({ property, onUpdate, profile }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documents = property.documents || [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        const path = `properties/${property.id}/${Date.now()}_${file.name}`;
        const url = await uploadFileToStorage(file, path);
        
        const newDoc: PropertyDocument = {
          id: `doc-${Date.now()}`,
          name: file.name,
          url: url,
          type: file.type,
          storagePath: path,
          uploadedBy: profile?.name || 'User',
          uploadedAt: new Date().toISOString()
        };

        const updatedDocs = [...documents, newDoc];
        onUpdate(property.id, { documents: updatedDocs });
      } catch (err) {
        console.error(err);
        alert("Upload failed.");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteDocument = async (doc: PropertyDocument) => {
    if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) return;
    
    try {
      if (doc.storagePath) {
        await deleteFileFromStorage(doc.storagePath);
      }
      
      const updatedDocs = documents.filter(d => d.id !== doc.id);
      onUpdate(property.id, { documents: updatedDocs });
      
    } catch (err: any) {
      console.error(err);
      if (err.code === 'storage/object-not-found') {
        const updatedDocs = documents.filter(d => d.id !== doc.id);
        onUpdate(property.id, { documents: updatedDocs });
        return;
      }
      alert("Failed to delete file.");
    }
  };

  return (
    <div className="bg-surface rounded-md shadow-lvl1 border border-border p-xl">
      <h2 className="text-lg font-bold text-text-primary mb-lg flex items-center gap-sm">
        <FileText className="w-5 h-5 text-text-secondary" /> Document Repository
      </h2>
      <div className="space-y-sm">
        {documents.map((doc, i) => (
          <div 
            key={i} 
            className="flex items-center justify-between p-3 border border-border rounded-sm hover:border-brand hover:shadow-sm transition-all group cursor-pointer bg-white"
            onClick={() => window.open(doc.url, '_blank')}
          >
            <div className="flex items-center gap-md">
              <div className="p-2 bg-red-50 rounded-sm">
                <FileText className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-sm font-medium text-text-primary group-hover:text-brand transition-colors">{doc.name}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                className="text-text-secondary hover:text-brand p-2"
                title="Download"
                onClick={(e) => { e.stopPropagation(); window.open(doc.url, '_blank'); }}
              >
                <Download className="w-4 h-4" />
              </button>
              <button 
                className="text-text-secondary hover:text-red-600 p-2"
                title="Delete"
                onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc); }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <div className="text-center py-4 text-sm text-slate-400 italic border border-dashed rounded-sm bg-slate-50">
            No documents uploaded yet.
          </div>
        )}
      </div>
      <div className="mt-md pt-md border-t border-dashed border-border text-center relative">
         <input 
           type="file" 
           className="hidden" 
           ref={fileInputRef} 
           onChange={handleFileUpload} 
           accept="application/pdf,image/*"
         />
         <button 
           onClick={() => fileInputRef.current?.click()}
           disabled={isUploading}
           className="text-xs font-bold text-brand uppercase tracking-wide hover:underline flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
         >
           {isUploading ? (
             <><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</>
           ) : (
             "+ Upload New Document"
           )}
         </button>
      </div>
    </div>
  );
}