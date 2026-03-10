import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Database, FilePlus, Users, Loader2, Mail, Phone, Home, AlertCircle, Check, Bell, Ban, Trash2, Edit3 } from 'lucide-react';
import { TenantModals, TenantActionButtons } from './TenantModals';

export default async function TenantsPage() {
    const session = await auth();

    if (!session?.user) {
        return <div className="p-8">Bitte anmelden.</div>
    }

    const orgId = (session.user as any).organizationId;

    // Fetch tenants with their associated leases and properties
    const tenants = await prisma.tenant.findMany({
        where: {
            organizationId: orgId,
            deletedAt: null
        },
        include: {
            leases: {
                include: {
                    unit: {
                        include: {
                            property: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Fetch units for the create modal dropdown
    const units = await prisma.unit.findMany({
        where: { organizationId: orgId, deletedAt: null },
        include: { property: true }
    });

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Mieterverwaltung</h1>
                    <p className="text-slate-500 mt-2 text-lg">Verwalten Sie Verträge, Mieterhöhungen und Stammdaten.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 px-4 py-3 rounded-xl font-medium shadow-sm flex items-center gap-2 transition-all">
                        <Database className="h-5 w-5" />
                        <span>Daten sichern</span>
                    </button>
                    <TenantModals units={units} />
                </div>
            </header>

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left font-semibold text-slate-700 text-sm">Mieter / Kontakt</th>
                            <th className="px-6 py-4 text-left font-semibold text-slate-700 text-sm">Objekt / Vertrag</th>
                            <th className="px-6 py-4 text-left font-semibold text-slate-700 text-sm">Seit</th>
                            <th className="px-6 py-4 text-right font-semibold text-slate-700 text-sm">Kaution</th>
                            <th className="px-6 py-4 text-center font-semibold text-slate-700 text-sm">Status</th>
                            <th className="px-6 py-4 text-right font-semibold text-slate-700 text-sm">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {tenants.map(tenant => {
                            const activeLease = tenant.leases[0]; // Assuming latest lease for display
                            const initials = `${tenant.firstName[0]}${tenant.lastName[0]}`;
                            const isArchived = tenant.deletedAt !== null;

                            return (
                                <tr key={tenant.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0 ring-2 ring-white shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                {initials}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                    {tenant.firstName} {tenant.lastName}
                                                </div>
                                                <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <Mail className="h-3 w-3" /> {tenant.email}
                                                </div>
                                                {tenant.phone && (
                                                    <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <Phone className="h-3 w-3" /> {tenant.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        {activeLease ? (
                                            <>
                                                <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                                                    <Home className="h-4 w-4 text-slate-400" />
                                                    {activeLease.unit.name}
                                                    <span className="bg-indigo-50 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ml-1">
                                                        {activeLease.unit.type}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    <Link href={`/properties/${activeLease.unit.property.id}`} className="hover:text-indigo-600 hover:underline">
                                                        {activeLease.unit.property.name}
                                                    </Link>
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded w-fit text-xs font-medium border border-amber-200">
                                                <AlertCircle className="h-3 w-3" /> Nicht zugeordnet
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {activeLease ? new Date(activeLease.startDate).toLocaleDateString('de-DE') : '-'}
                                    </td>

                                    <td className="px-6 py-4 text-right font-mono font-medium text-slate-700">
                                        {activeLease && activeLease.depositAmount ? `${activeLease.depositAmount.toString()} €` : '-'}
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isArchived ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {isArchived ? 'Archiviert' : 'Aktiv'}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <TenantActionButtons tenantId={tenant.id} />
                                    </td>
                                </tr>
                            );
                        })}

                        {tenants.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-slate-500">
                                    <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                    <p className="text-lg font-medium text-slate-900 mb-1">Keine Mieter gefunden</p>
                                    <p>Legen Sie Ihren ersten Mieter oder Mietvertrag an.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
