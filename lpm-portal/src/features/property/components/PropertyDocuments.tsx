import { useState, useRef } from 'react';
import { FileText, Download, Trash2, Loader2, UploadCloud, FileImage } from 'lucide-react';
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
    if (!confirm(`Delete "${doc.name}"?`)) return;
    try {
      if (doc.storagePath) await deleteFileFromStorage(doc.storagePath);
      onUpdate(property.id, { documents: documents.filter(d => d.id !== doc.id) });
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete file.");
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl min-h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs font-bold text-brand dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
          <FileText className="w-4 h-4" /> Data Repository
        </h2>
        <span className="text-[10px] font-mono text-text-secondary dark:text-slate-500 uppercase">
          {documents.length} Files Stored
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 content-start">
        {documents.map((doc, i) => {
          const isPdf = doc.type.includes('pdf');
          return (
            <div 
              key={i} 
              className="group relative p-4 rounded-lg border border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-white/10 transition-all cursor-pointer flex items-center gap-4"
              onClick={() => window.open(doc.url, '_blank')}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${isPdf ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                {isPdf ? <FileText className="w-5 h-5" /> : <FileImage className="w-5 h-5" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-text-primary dark:text-white truncate mb-1">{doc.name}</p>
                <p className="text-[10px] font-mono text-text-secondary dark:text-slate-500 truncate">
                  By {doc.uploadedBy}
                </p>
              </div>

              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-black/80 backdrop-blur-md rounded-md p-1 shadow-sm">
                <button 
                  className="p-1.5 hover:text-brand dark:hover:text-blue-400 text-text-secondary dark:text-slate-400"
                  onClick={(e) => { e.stopPropagation(); window.open(doc.url, '_blank'); }}
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button 
                  className="p-1.5 hover:text-red-600 text-text-secondary dark:text-slate-400"
                  onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc); }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Upload Card */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-lg flex flex-col items-center justify-center p-6 text-text-secondary dark:text-slate-500 hover:border-brand dark:hover:border-blue-400 hover:text-brand dark:hover:text-blue-400 hover:bg-brand/5 dark:hover:bg-blue-400/5 transition-all cursor-pointer min-h-[100px]"
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
          ) : (
            <UploadCloud className="w-6 h-6 mb-2" />
          )}
          <span className="text-xs font-bold uppercase tracking-wide">
            {isUploading ? "Uploading..." : "Upload File"}
          </span>
        </div>
      </div>

      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="application/pdf,image/*"
      />
    </div>
  );
}