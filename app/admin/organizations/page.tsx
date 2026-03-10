import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Building2, Users, Database } from 'lucide-react';
import Link from 'next/link';
import { getCachedOrFetch } from '@/lib/cache';

export default async function OrganizationsPage() {
    const session = await auth();

    // Protect Route: Only OWNER or ADMIN roles are allowed.
    if (!session?.user) {
        redirect('/api/auth/signin');
    }

    const role = (session.user as any).role;
    if (role !== 'OWNER' && role !== 'ADMIN') {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl mt-12">
                <h1 className="text-2xl font-bold mb-2">Zugriff verweigert</h1>
                <p>Sie benötigen Administrator-Rechte, um das Mandanten-Dashboard zu sehen.</p>
            </div>
        );
    }

    // Fetch Organizations with their aggregated counts
    // For Super Admins, we might want to see ALL orgs, but for this SaaS platform 
    // a regular "ADMIN" usually only manages their own org. 
    // We treat 'OWNER' as Super-Admin for the SaaS operator here.
    const isSuperAdmin = role === 'OWNER';

    const whereClause = isSuperAdmin ? {} : { id: (session.user as any).organizationId };

    const organizations = await prisma.organization.findMany({
        where: whereClause,
        include: {
            _count: {
                select: {
                    properties: { where: { deletedAt: null } },
                    tenants: { where: { deletedAt: null } },
                    users: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mandanten-Verwaltung</h1>
                    <p className="text-slate-500 mt-1">Überwachen und verwalten Sie die registrierten Organisationen der SaaS-Plattform.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizations.map((org) => (
                    <div key={org.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                        <div className="p-6 border-b border-slate-100 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 rounded-xl">
                                    <Building2 className="w-6 h-6 text-indigo-600" />
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${org._count.users > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {org._count.users > 0 ? 'Aktiv' : 'Inaktiv'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-1">{org.name}</h3>
                            <p className="text-xs text-slate-500 mb-6 font-mono truncate">{org.id}</p>

                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="bg-slate-50 rounded-lg p-2">
                                    <div className="text-xs text-slate-500 mb-1">Objekte</div>
                                    <div className="font-semibold text-slate-900">{org._count.properties}</div>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-2">
                                    <div className="text-xs text-slate-500 mb-1">Mieter</div>
                                    <div className="font-semibold text-slate-900">{org._count.tenants}</div>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-2">
                                    <div className="text-xs text-slate-500 mb-1">User (Gewerb.)</div>
                                    <div className="font-semibold text-slate-900">{org._count.users}</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 border-t border-slate-100 mt-auto">
                            {isSuperAdmin && org.id !== (session.user as any).organizationId && (
                                <form action={`/api/admin/impersonate`} method="POST">
                                    <input type="hidden" name="orgId" value={org.id} />
                                    <button type="submit" className="w-full bg-slate-200 hover:bg-indigo-600 hover:text-white text-slate-700 text-sm font-medium py-2 rounded-xl transition-colors flex items-center justify-center">
                                        <Users className="w-4 h-4 mr-2" />
                                        Als Mandant einloggen
                                    </button>
                                </form>
                            )}
                            {(!isSuperAdmin || org.id === (session.user as any).organizationId) && (
                                <div className="w-full text-center text-slate-500 text-sm font-medium py-2">
                                    Eigene Organisation
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
