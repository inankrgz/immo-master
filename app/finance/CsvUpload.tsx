'use client';

import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, Loader2 } from 'lucide-react';
import { processCSVUpload } from './actions';

export function CsvUpload() {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file: File) => {
        setIsUploading(true);
        setSuccessMsg('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const result = await processCSVUpload(formData);

            if (result.success) {
                setSuccessMsg(`${result.count} Buchungen importiert.`);
            }
        } catch (error: any) {
            alert('Fehler beim Importieren: ' + error.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer group h-full
                ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-300'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFile(e.dataTransfer.files[0]);
                }
            }}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                accept=".csv"
                className="hidden"
            />

            {isUploading ? (
                <div className="flex flex-col items-center text-indigo-600">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p className="font-bold">Verarbeite CSV...</p>
                </div>
            ) : successMsg ? (
                <div className="flex flex-col items-center text-emerald-600">
                    <CheckCircle className="h-8 w-8 mb-4" />
                    <p className="font-bold">{successMsg}</p>
                </div>
            ) : (
                <>
                    <div className={`bg-white p-4 rounded-full shadow-sm mb-4 transition-transform ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
                        <UploadCloud className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h4 className="text-slate-900 font-bold mb-1">Kontoauszug hier ablegen (.csv)</h4>
                    <p className="text-slate-500 text-sm font-medium border-b border-indigo-200 border-dashed pb-0.5 mt-2 text-center max-w-[250px]">
                        Spalten: Datum, Name, IBAN, Zweck, Betrag
                    </p>
                </>
            )}
        </div>
    );
}
