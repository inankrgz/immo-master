'use client';

import { useState } from 'react';
import { FilePlus, X, Trash2, Ban } from 'lucide-react';
import { createTenant, deleteTenant } from './actions';

export function TenantModals({ units }: { units: any[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await createTenant(formData);
        setIsCreateOpen(false);
    }

    return (
        <>
            <button onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow flex items-center gap-2 transition-transform hover:scale-105">
                <FilePlus className="h-5 w-5" />
                <span>Neuer Mietvertrag</span>
            </button>

            {isCreateOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Neuen Mieter anlegen</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Objektzuordnung</label>
                                <select name="unitId" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all">
                                    <option value="">Bitte wählen...</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id}>{u.property.name} - {u.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Vorname</label>
                                    <input required name="firstName" type="text" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Nachname</label>
                                    <input required name="lastName" type="text" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">E-Mail</label>
                                    <input name="email" type="email" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Telefon</label>
                                    <input name="phone" type="text" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Kaltmiete (€)</label>
                                    <input name="rent" type="number" step="0.01" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Kaution (€)</label>
                                    <input name="deposit" type="number" step="0.01" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Mietbeginn</label>
                                    <input required name="startDate" type="date" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-slate-500 text-sm font-medium hover:bg-slate-50 rounded-lg">Abbrechen</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">Anlegen</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export function TenantActionButtons({ tenantId }: { tenantId: string }) {
    return (
        <div className="flex flex-col gap-2 items-end">
            <button onClick={() => deleteTenant(tenantId)} className="text-xs w-32 bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100 flex items-center justify-center gap-1 transition-colors">
                <Ban className="h-3 w-3" /> Kündigen / Archiv
            </button>
        </div>
    );
}
