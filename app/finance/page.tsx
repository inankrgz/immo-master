import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Landmark, TrendingUp, Clock, ScanLine, ArrowRightLeft, UploadCloud, Plug, FileText, Check, AlertCircle } from 'lucide-react';

export default async function FinancePage() {
    const session = await auth();

    if (!session?.user) {
        return <div className="p-8">Bitte anmelden.</div>
    }

    const orgId = (session.user as any).organizationId;

    // In a real application, you would calculate these from the GoBD Ledger (FinanceTransaction / FinanceCharge)
    // For now, we'll aggregate some basic stats from Properties to show the skeleton

    const properties = await prisma.property.findMany({
        where: { organizationId: orgId, deletedAt: null },
        include: { units: true }
    });

    // Mock calculations for the KPI Grid to establish the UI structure
    const totalDebt = 1250000; // Expected to come from a Loan/Debt model or aggregate
    const totalEquity = 250000;
    const monthlyCashflow = 4250;
    const yieldPercentage = 5.2;

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Finanz-Cockpit</h1>
                    <p className="text-slate-500 mt-2">Cashflow-Analyse, Kreditverwaltung und GoBD-Ledger.</p>
                </div>
                <div className="flex gap-3">
                    {/* Placeholder for future Client Component Modal */}
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                        <ScanLine className="h-5 w-5" />
                        <span>Kreditvertrag scannen</span>
                    </button>
                </div>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-32">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase">Cashflow (Monat)</p>
                            <span className="h-4 w-4 text-emerald-500">€</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">+ {monthlyCashflow.toLocaleString()} €</p>
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">{yieldPercentage}% Rendite</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Restschuld</p>
                        <Landmark className="h-4 w-4 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{(totalDebt / 1000000).toFixed(2)} Mio €</p>
                    <p className="text-xs text-slate-400 mt-1">EK Invest: {(totalEquity / 1000).toFixed(0)}k €</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Ø Zinsbindung</p>
                        <Clock className="h-4 w-4 text-indigo-400" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">8,5 Jahre</p>
                    <p className="text-xs text-slate-400 mt-1">Ø 2.15% Zins</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Mietprognose 2027</p>
                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                    </div>
                    <p className="text-2xl font-bold text-indigo-600">~ {(monthlyCashflow + 450).toLocaleString()} €</p>
                    <p className="text-xs text-slate-400 mt-1">+ 450 € durch Erhöhungen</p>
                </div>
            </div>

            {/* GoBD Ledger Section (Placeholder based on Architecture Plan) */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-10">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                            <ArrowRightLeft className="h-5 w-5 text-indigo-600" />
                            GoBD Ledger (Buchungsprotokoll)
                        </h3>
                        <p className="text-sm text-slate-500">Unveränderliche Transaktionshistorie nach GoBD Vorgaben.</p>
                    </div>
                    <div className="flex bg-slate-200/50 p-1 rounded-lg">
                        <button className="px-4 py-1.5 rounded-md text-sm font-medium transition-all bg-white text-slate-900 shadow-sm">Umsätze</button>
                        <button className="px-4 py-1.5 rounded-md text-sm font-medium transition-all text-slate-500 hover:text-slate-900">Soll-Stellungen</button>
                    </div>
                </div>

                <div className="p-12 text-center">
                    <div className="inline-flex bg-amber-50 rounded-full p-4 mb-4">
                        <AlertCircle className="h-8 w-8 text-amber-500" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">Append-Only Ledger wird initialisiert</h4>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                        Die Finanzdaten werden unter Einhaltung der Revisionssicherheit (keine UPDATE/DELETE Operationen auf Buchungen) aus der Datenbank geladen.
                    </p>
                    <button className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 mx-auto">
                        <Plug className="h-4 w-4" /> Bank API Verbinden
                    </button>
                </div>
            </div>

            {/* Reconciliation Action Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer group">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h4 className="text-slate-900 font-bold mb-1">Kontoauszug hier ablegen (.csv)</h4>
                    <p className="text-slate-500 text-sm">Für den manuellen Abgleich ohne API</p>
                </div>

                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-8">
                    <h4 className="flex items-center gap-2 font-bold text-indigo-900 mb-4">
                        <Check className="h-5 w-5 text-indigo-600" /> Offene Posten (OP-Liste)
                    </h4>
                    <ul className="space-y-3">
                        <li className="flex justify-between items-center text-sm p-3 bg-white rounded-lg shadow-sm">
                            <span className="font-medium text-slate-700">Mieteingang Müller (Objekt A)</span>
                            <span className="font-bold text-red-600">Fehlt - 850 €</span>
                        </li>
                        <li className="flex justify-between items-center text-sm p-3 bg-white rounded-lg shadow-sm">
                            <span className="font-medium text-slate-700">Handwerker Schmidt (Dach)</span>
                            <span className="font-bold text-amber-600">Zur Freigabe - 1.200 €</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
