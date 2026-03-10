'use client';

import { useState } from 'react';
import { Search, Plus, Briefcase, Receipt, Star, Users, FileText, AlertCircle, CheckCircle, Mail, ChevronRight, X, Loader2, Check, Sparkles } from 'lucide-react';
import { createProvider, payProviderJob } from './actions';

export function ProviderDashboard({ initialProviders, initialJobs }: { initialProviders: any[], initialJobs: any[] }) {
    const [activeTab, setActiveTab] = useState<'list' | 'invoices'>('list');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false); // For Google Mock

    // AI Email Modal State
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailDraftProvider, setEmailDraftProvider] = useState<any>(null);
    const [emailStep, setEmailStep] = useState<'initial' | 'draft'>('initial');
    const [emailTopic, setEmailTopic] = useState('');
    const [emailContext, setEmailContext] = useState('');
    const [emailGeneratedContent, setEmailGeneratedContent] = useState('');
    const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

    // Calculate KPIs
    const activeJobsCount = initialJobs.filter(j => j.status !== 'PAID').length;
    const openInvoicesAmount = initialJobs.filter(j => j.status !== 'PAID').reduce((sum, j) => sum + Number(j.amount || 0), 0);
    const topProvider = initialProviders.length > 0 ? initialProviders[0]?.name : 'Keine';

    async function handleAddProvider(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await createProvider(formData);
        setIsAddModalOpen(false);
    }

    async function handleGenerateDraft() {
        if (!emailTopic) {
            alert("Bitte wählen Sie ein Thema.");
            return;
        }
        setEmailStep('draft');
        setIsGeneratingEmail(true);
        setEmailGeneratedContent("Generiere intelligenten Entwurf...");

        // Simulate AI Delay
        await new Promise(r => setTimeout(r, 1200));

        let body = `ich wende mich heute an Sie wegen einer ${emailTopic}-Anfrage.`;
        if (emailContext) body += `\n\nZusätzlicher Kontext:\n${emailContext}`;

        const draftedText = `Sehr geehrte Damen und Herren,\n\n${body}\n\nBitte teilen Sie uns Ihre Verfügbarkeit mit.\n\nMit freundlichen Grüßen,\nIhre Hausverwaltung`;
        setEmailGeneratedContent(draftedText);
        setIsGeneratingEmail(false);
    }

    return (
        <div>
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Partner & Dienstleister</h1>
                    <p className="text-slate-500 mt-1">Verwalten Sie Handwerker, Aufträge und Rechnungen.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => { setIsSearching(true); setTimeout(() => setIsSearching(false), 2000) }}
                        className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 px-4 py-2 rounded-xl font-medium shadow-sm flex items-center gap-2 transition-all">
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin outline-none" /> : <Search className="h-4 w-4 outline-none" />}
                        <span>Neue suchen (Google)</span>
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)}
                        className="bg-indigo-600 outline-none hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all">
                        <Plus className="h-4 w-4 outline-none" />
                        <span>Manueller Eintrag</span>
                    </button>
                </div>
            </header>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
                <div className="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><Briefcase className="h-6 w-6" /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Aktive Aufträge</p>
                        <p className="text-2xl font-bold text-slate-900">{activeJobsCount}</p>
                    </div>
                </div>
                <div className="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                    <div className="bg-amber-50 p-3 rounded-lg text-amber-600"><Receipt className="h-6 w-6" /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Offene Rechnungen</p>
                        <p className="text-2xl font-bold text-slate-900">{openInvoicesAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</p>
                    </div>
                </div>
                <div className="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                    <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600"><Star className="h-6 w-6" /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Top Partner</p>
                        <p className="text-lg font-bold text-slate-900 truncate">{topProvider}</p>
                    </div>
                </div>
            </div>

            {/* TABS */}
            <div className="border-b border-slate-200 mb-6 flex space-x-8">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 outline-none
                        ${activeTab === 'list' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    <Users className="h-4 w-4 outline-none" /> Alle Dienstleister
                </button>
                <button
                    onClick={() => setActiveTab('invoices')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 outline-none
                        ${activeTab === 'invoices' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    <FileText className="h-4 w-4 outline-none" /> Rechnungen & Finanzen
                </button>
            </div>

            {/* CONTENT */}
            {activeTab === 'list' && (
                <div className="space-y-4">
                    {initialProviders.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
                            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">Noch keine Dienstleister angelegt.</p>
                        </div>
                    ) : (
                        initialProviders.map(p => {
                            const activeTickets = p._count.tickets;
                            return (
                                <div key={p.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-indigo-300 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-lg font-bold text-slate-600 uppercase">
                                            {p.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900">{p.name}</h3>
                                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                                <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">{p.category}</span> •
                                                <span className="text-amber-500 flex items-center">★ {p.rating}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        {activeTickets > 0 ? (
                                            <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1 cursor-pointer hover:bg-amber-100">
                                                <AlertCircle className="h-3 w-3" /> {activeTickets} Offene Tickets
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" /> Alles erledigt
                                            </span>
                                        )}

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setEmailDraftProvider(p); setEmailStep('initial'); setIsEmailModalOpen(true); }}
                                                className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg outline-none transition-colors" title="Email schreiben">
                                                <Mail className="h-5 w-5 outline-none" />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg outline-none transition-colors" title="Details">
                                                <ChevronRight className="h-5 w-5 outline-none" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            )}

            {activeTab === 'invoices' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Erstellt am</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dienstleister</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Auftrag</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Betrag</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aktion</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {initialJobs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Keine Rechnungen vorhanden.</td>
                                </tr>
                            ) : initialJobs.map(job => (
                                <tr key={job.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(job.createdAt).toLocaleDateString('de-DE')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{job.provider.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{job.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-900">{Number(job.amount || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-[10px] uppercase font-bold tracking-wider rounded-md ${job.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                            {job.status === 'PAID' ? 'Bezahlt' : 'Offen'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {job.status !== 'PAID' ? (
                                            <button onClick={() => payProviderJob(job.id)} className="text-indigo-600 hover:text-indigo-900 font-bold outline-none">
                                                Als bezahlt markieren
                                            </button>
                                        ) : (
                                            <span className="text-slate-400"><Check className="h-4 w-4 inline outline-none" /></span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ADD MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Neuen Partner anlegen</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleAddProvider} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Firmenname</label>
                                <input required name="name" type="text" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 outline-none focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Kategorie</label>
                                <select name="category" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 outline-none focus:ring-indigo-500">
                                    <option>Sanitär</option>
                                    <option>Elektro</option>
                                    <option>Dach</option>
                                    <option>Reinigung</option>
                                    <option>Energie</option>
                                    <option>Sonstiges</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">E-Mail</label>
                                <input name="email" type="email" className="w-full px-3 py-2 bg-white border border-slate-200 outline-none rounded-lg focus:ring-2 focus:ring-indigo-500" />
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-500 text-sm font-medium hover:bg-slate-50 rounded-lg outline-none">Abbrechen</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg outline-none hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">Speichern</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* AI EMAIL MODAL */}
            {isEmailModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Sparkles className="text-purple-600 h-5 w-5" /> Email Entwurf
                            </h3>
                            <button onClick={() => setIsEmailModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
                        </div>

                        {emailStep === 'initial' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Empfänger</label>
                                    <input type="text" value={emailDraftProvider?.email || emailDraftProvider?.name || ''} readOnly className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Thema</label>
                                    <select value={emailTopic} onChange={e => setEmailTopic(e.target.value)} className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                                        <option value="">- Thema wählen -</option>
                                        <option value="Reparatur">Reparaturanfrage</option>
                                        <option value="Angebot">Angebot anfordern</option>
                                        <option value="Rechnung">Rechnungsrückfrage</option>
                                        <option value="Allgemein">Allgemeine Anfrage</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">KI Kontext (Optional)</label>
                                    <textarea
                                        value={emailContext}
                                        onChange={e => setEmailContext(e.target.value)}
                                        className="w-full h-24 p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="Zusätzliche Infos für die KI (z.B. 'Tür im 2. OG klemmt')"
                                    ></textarea>
                                </div>
                                <div className="pt-4 flex justify-end gap-2 mt-4">
                                    <button onClick={() => setIsEmailModalOpen(false)} className="px-4 py-2 text-slate-500 font-medium text-sm">Abbrechen</button>
                                    <button onClick={handleGenerateDraft} className="px-5 py-2 bg-purple-600 text-white font-bold rounded shadow-lg shadow-purple-500/20 hover:bg-purple-700">Entwurf generieren</button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Betreff</label>
                                    <input type="text" defaultValue={`Anfrage: ${emailTopic}`} className="w-full p-2 bg-slate-50 border border-slate-200 shadow-inner rounded text-sm font-semibold" />
                                </div>
                                <div>
                                    <textarea
                                        value={emailGeneratedContent}
                                        onChange={e => setEmailGeneratedContent(e.target.value)}
                                        readOnly={isGeneratingEmail}
                                        className={`w-full h-48 p-3 border border-slate-200 rounded text-sm ${isGeneratingEmail ? 'bg-slate-50 text-slate-500' : 'focus:ring-2 focus:ring-purple-500 outline-none'}`}
                                    ></textarea>
                                </div>
                                <div className="pt-2 flex justify-end gap-2">
                                    <button onClick={() => setEmailStep('initial')} className="px-4 py-2 text-slate-500 font-medium text-sm">Zurück</button>
                                    <button
                                        disabled={isGeneratingEmail}
                                        onClick={() => { alert('Email gesendet!'); setIsEmailModalOpen(false); }}
                                        className="px-5 py-2 bg-purple-600 text-white font-bold rounded shadow-lg shadow-purple-500/20 hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        Absenden
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
